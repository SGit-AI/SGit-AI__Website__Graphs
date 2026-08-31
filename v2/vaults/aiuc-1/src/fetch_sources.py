"""Polite capture of official AIUC-1 pages into content-addressed snapshots.

@module Every byte the catalog is derived from enters here and nowhere else. One
request per second per host, an explicit user agent, robots.txt honoured,
conditional requests when a prior snapshot carries an ETag, bounded backoff on
transient failure, and a source observation recorded for each response so a
later claim can name the bytes it came from.
"""
import gzip
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from urllib.robotparser import RobotFileParser

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common as c

MIN_INTERVAL = 1.0
MAX_ATTEMPTS = 4
TRANSIENT = {408, 425, 429, 500, 502, 503, 504}


class Fetcher:
    """Rate-limited, robots-aware capture with a persistent source manifest."""

    def __init__(self, snapshot_day, manifest_path='evidence/source-manifest.json'):
        self.day = snapshot_day
        self.manifest_path = manifest_path
        manifest = c.read_json(manifest_path) or {}
        self.observations = {o['id']: o for o in manifest.get('observations', [])}
        self.robots = {}
        self.last_request = 0.0
        self.robots_notes = manifest.get('robots', {})

    # -- politeness -------------------------------------------------------
    def _wait(self):
        gap = time.time() - self.last_request
        if gap < MIN_INTERVAL:
            time.sleep(MIN_INTERVAL - gap)
        self.last_request = time.time()

    def _robots(self, url):
        host = urllib.parse.urlsplit(url)
        origin = '%s://%s' % (host.scheme, host.netloc)
        if origin in self.robots:
            return self.robots[origin]
        parser = RobotFileParser()
        robots_url = origin + '/robots.txt'
        try:
            self._wait()
            req = urllib.request.Request(robots_url, headers={'User-Agent': c.USER_AGENT})
            with urllib.request.urlopen(req, timeout=30) as response:
                body = response.read().decode('utf-8', 'replace')
                ctype = response.headers.get('Content-Type', '')
                if 'text/plain' in ctype:
                    parser.parse(body.splitlines())
                    note = 'robots.txt served as text/plain and was parsed'
                else:
                    parser.parse([])
                    note = ('no robots.txt: %s answered %s with content-type %r, '
                            'which is not a robots file; treated as no directives'
                            % (robots_url, response.status, ctype))
        except urllib.error.HTTPError as err:
            parser.parse([])
            note = 'no robots.txt: %s answered HTTP %s; treated as no directives' % (robots_url, err.code)
        except Exception as err:  # network failure: fail closed
            parser = None
            note = 'robots.txt could not be retrieved (%s); refusing to fetch from %s' % (err, origin)
        self.robots[origin] = parser
        self.robots_notes[origin] = {'url': robots_url, 'observed': note, 'checked_at': c.now_iso()}
        return parser

    def allowed(self, url):
        parser = self._robots(url)
        if parser is None:
            return False
        return parser.can_fetch(c.USER_AGENT, url)

    # -- capture ----------------------------------------------------------
    def snapshot_rel(self, ref_id):
        return 'evidence/snapshots/%s/%s.html.gz' % (self.day, ref_id)

    def fetch(self, url, ref_id, source_type='official_website', force=False):
        """Return (observation, body_text). Reuses a same-day snapshot unless forced."""
        prior = self.observations.get(ref_id)
        rel = self.snapshot_rel(ref_id)
        if prior and not force and os.path.exists(c.path(rel)) and prior.get('content', {}).get('raw_snapshot_path') == rel:
            with gzip.open(c.path(rel), 'rt', encoding='utf-8') as handle:
                return prior, handle.read()

        if not self.allowed(url):
            raise PermissionError('robots.txt disallows %s for %s' % (url, c.USER_AGENT))

        headers = {'User-Agent': c.USER_AGENT, 'Accept': 'text/html,application/xhtml+xml'}
        if prior:
            etag = (prior.get('http') or {}).get('etag')
            if etag:
                headers['If-None-Match'] = etag

        body, response, status = None, None, None
        for attempt in range(MAX_ATTEMPTS):
            self._wait()
            try:
                req = urllib.request.Request(url, headers=headers)
                with urllib.request.urlopen(req, timeout=60) as resp:
                    status = resp.status
                    response = dict(resp.headers)
                    final_url = resp.geturl()
                    body = resp.read().decode('utf-8', 'replace')
                break
            except urllib.error.HTTPError as err:
                status = err.code
                if status == 304 and prior:
                    with gzip.open(c.path(rel), 'rt', encoding='utf-8') as handle:
                        return prior, handle.read()
                if status not in TRANSIENT or attempt == MAX_ATTEMPTS - 1:
                    raise
            except urllib.error.URLError:
                if attempt == MAX_ATTEMPTS - 1:
                    raise
            time.sleep(2 ** (attempt + 1))

        c.ensure_dir(os.path.dirname(c.path(rel)))
        with open(c.path(rel), 'wb') as raw:
            with gzip.GzipFile(fileobj=raw, mode='wb', compresslevel=9, mtime=0) as handle:
                handle.write(body.encode('utf-8'))

        observation = {
            'id': ref_id,
            'source_type': source_type,
            'url': url,
            'final_url': final_url,
            'retrieved_at': c.now_iso(),
            'http': {
                'status': status,
                'content_type': response.get('Content-Type'),
                'etag': response.get('ETag'),
                'last_modified': response.get('Last-Modified'),
            },
            'content': {
                'raw_snapshot_path': rel,
                'raw_sha256': c.sha256_bytes(body),
                'bytes': len(body.encode('utf-8')),
            },
            'license_or_terms_note': (
                'Public page captured as evidence. Snapshot retained inside the vault '
                'only; extracted fragments are quoted for verification. Confirm reuse '
                'rights with AIUC before republishing full control text.'),
        }
        self.observations[ref_id] = observation
        return observation, body

    def save_manifest(self):
        payload = {
            'manifest_version': '1.0.0',
            'generator_version': c.GENERATOR_VERSION,
            'generated_at': c.now_iso(),
            'user_agent': c.USER_AGENT,
            'rate_limit': 'at most one request per second per host',
            'robots': self.robots_notes,
            'observation_count': len(self.observations),
            'observations': [self.observations[k] for k in sorted(self.observations)],
        }
        c.write_json(self.manifest_path, payload)
        return payload


def main():
    day = sys.argv[1] if len(sys.argv) > 1 else c.now_iso()[:10]
    manifest = c.read_json('evidence/discovery-manifest.json')
    if not manifest:
        raise SystemExit('run discover_sources.py first')
    fetcher = Fetcher(day)
    targets = []
    for domain in manifest['domains']:
        targets.append((c.SITE + domain['url'], c.source_ref_id(day, 'domain', domain['id'])))
        for control in domain['controls']:
            targets.append((c.SITE + control['url'], c.source_ref_id(day, 'control', control['id'])))
    for extra in manifest.get('reference_pages', []):
        targets.append((c.SITE + extra['url'], c.source_ref_id(day, 'page', extra['key'])))
    for index, (url, ref) in enumerate(targets, 1):
        observation, _ = fetcher.fetch(url, ref)
        print('[%3d/%d] %s %s' % (index, len(targets), observation['http']['status'], url))
    fetcher.save_manifest()
    print('captured %d observations' % len(fetcher.observations))


if __name__ == '__main__':
    main()
