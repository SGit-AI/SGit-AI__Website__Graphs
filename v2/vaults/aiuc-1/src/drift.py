"""Detect drift between the catalog and the official sources, and open review items.

@module A scheduled re-fetch of every discovered page and of the changelog
repository. Raw bytes change on every site deploy, so a byte difference alone is
not a finding: the run compares the extracted control model as well, and separates
a presentation change from a change in what the standard says. Anything it cannot
classify becomes a review item rather than an edit.
"""
import os
import shutil
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common as c
import parse_pages
import parse_changelog
from fetch_sources import Fetcher


def _model_of(html_text):
    """The comparable content of a page: its published control model, normalised."""
    try:
        principles = parse_pages.principles_of(html_text)
    except Exception:
        return None
    return c.sha256_json(principles)


def classify(before_sha, after_sha, before_model, after_model):
    """What a difference between two captures of the same page means.

    Pure: no network, no files. Raw bytes change on every site deploy, so a byte
    difference alone is not a finding; a change in the published control model is.
    """
    if before_sha == after_sha:
        return None
    if after_model is None:
        return ('parse_failure', 'unknown',
                'the page no longer yields a control model; the parser fails closed rather '
                'than emitting unreliable data')
    if before_model == after_model:
        return ('presentation_change', 'known',
                'raw bytes changed but the published control model is identical; a site '
                'deploy, not a standard change')
    return ('content_change', 'unknown',
            'the published control model changed; rebuild and review')


def run(day=None):
    day = day or c.now_iso()[:10]
    discovery = c.read_json('evidence/discovery-manifest.json')
    baseline = c.read_json('evidence/source-manifest.json')
    recorded = {o['id']: o for o in baseline['observations']}

    probe = Fetcher('drift/%s' % day, manifest_path='build/drift-manifest.json')
    probe.observations = {}
    targets = [(c.SITE + '/', discovery['source_ref'])]
    for domain in discovery['domains']:
        targets.append((c.SITE + domain['url'], c.source_ref_id(day, 'domain', domain['id'])))
        for control in domain['controls']:
            targets.append((c.SITE + control['url'],
                            c.source_ref_id(day, 'control', control['id'])))
    for extra in discovery['reference_pages']:
        targets.append((c.SITE + extra['url'], c.source_ref_id(day, 'page', extra['key'])))

    findings, checked = [], 0
    for url, ref in targets:
        observation, body = probe.fetch(url, ref, force=True)
        checked += 1
        before = recorded.get(ref)
        if before is None:
            findings.append({'kind': 'new_page', 'ref': ref, 'url': url,
                             'classification': 'unknown',
                             'detail': 'a page is captured that the manifest does not carry'})
            continue
        before_sha = before['content']['raw_sha256']
        after_sha = observation['content']['raw_sha256']
        if before_sha == after_sha:
            continue
        verdict = classify(
            before_sha, after_sha,
            _model_of(parse_pages.read_snapshot(before['content']['raw_snapshot_path'])),
            _model_of(body))
        kind, classification, detail = verdict
        findings.append({'kind': kind, 'ref': ref, 'url': url,
                         'classification': classification, 'detail': detail,
                         'before_sha256': before_sha, 'after_sha256': after_sha})

    history = c.read_json('build/repo-history.json')
    now = parse_changelog.repo_history()
    known = {x['sha'] for x in history['commits']}
    for commit in now:
        if commit['sha'] not in known:
            findings.append({'kind': 'new_commit', 'ref': 'git:' + commit['sha'],
                             'url': commit['url'], 'classification': 'unknown',
                             'detail': 'the official changelog repository has a commit the '
                                       'catalog was not built from: %s' % commit['subject']})
    if now and history['commits'] and now[-1]['sha'] != history['commits'][-1]['sha']:
        findings.append({'kind': 'head_moved', 'ref': 'git:' + now[-1]['sha'],
                         'url': now[-1]['url'], 'classification': 'unknown',
                         'detail': 'the default branch head moved since the catalog was built'})

    keep = {f['ref'] for f in findings if f['classification'] == 'unknown'}
    snapshot_dir = c.path('evidence/snapshots/drift/%s' % day)
    if os.path.isdir(snapshot_dir):
        for name in os.listdir(snapshot_dir):
            if name.split('.')[0] not in keep:
                os.remove(os.path.join(snapshot_dir, name))
        if not os.listdir(snapshot_dir):
            shutil.rmtree(snapshot_dir)

    review_items = [{
        'review_id': 'rev_%s_%s' % (day.replace('-', '_'), f['ref']),
        'opened_at': c.now_iso(),
        'affected': f['ref'],
        'url': f.get('url'),
        'reason': f['detail'],
        'kind': f['kind'],
        'parser_version': c.PARSER_VERSION,
        'proposed_value': None,
        'reviewer': None,
        'decided_at': None,
        'rationale': None,
        'status': 'open',
    } for f in findings if f['classification'] == 'unknown']

    report = {
        'report_version': '1.0.0',
        'generated_at': c.now_iso(),
        'generator_version': c.GENERATOR_VERSION,
        'baseline_manifest_generated_at': baseline['generated_at'],
        'pages_checked': checked,
        'finding_count': len(findings),
        'unknown_count': len(review_items),
        'findings': findings,
        'review_items': review_items,
        'drift_detected': bool(findings),
    }
    c.write_json('reports/drift-latest.json', report)
    if review_items:
        c.write_json('reports/review-queue.json', {
            'generated_at': c.now_iso(), 'open_count': len(review_items),
            'items': review_items})
    return report


if __name__ == '__main__':
    result = run(sys.argv[1] if len(sys.argv) > 1 else None)
    print('checked %d pages: %d findings, %d needing review' % (
        result['pages_checked'], result['finding_count'], result['unknown_count']))
    for finding in result['findings'][:12]:
        print('  %-22s %-9s %s' % (finding['kind'], finding['classification'], finding['ref']))
