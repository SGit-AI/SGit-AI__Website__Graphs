"""Ingest the official changelog: the GitHub repository and the changelog pages.

@module The website says what the current standard is; the official changelog
repository says what it was. This module reads both. From the repository it takes
every commit that touches `standard/`, the blob SHA and content of each file at
that commit, and a parse of the two markdown files into control records. From the
changelog pages it takes the published release dates, the release narrative, and
the official per-control change table. Neither is allowed to overwrite the other.

Size: 273 lines against the estate's 250-line guideline. The deviation is
deliberate and recorded here: the repository half and the changelog-page half are
two readers of one official changelog and are kept in one file so a change to what
"the official changelog says" is made in one place.
"""
import os
import re
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common as c
import rsc

STANDARD_FILES = ('standard/controls.md', 'standard/requirements.md')
DEFAULT_CLONE = c.path('build/aiuc-1-changelog')
CLONE_CANDIDATES = (
    os.environ.get('AIUC1_CHANGELOG_CLONE'),
    DEFAULT_CLONE,
    '/home/user/aiunderwriting/aiuc-1-changelog',
    os.path.expanduser('~/aiunderwriting/aiuc-1-changelog'),
)
CONTROL_HEADING = re.compile(r'^##\s+([A-Z]\d{3}(?:\.\d+)?)\s*:\s*(.+?)\s*$')
SUB_HEADING = re.compile(r'^###\s+(.+?)\s*$')


def git(repo, *args):
    return subprocess.run(('git', '-C', repo) + args, check=True,
                          capture_output=True, text=True).stdout


def ensure_clone():
    """A local clone of the official changelog repository, fetched if absent."""
    for candidate in CLONE_CANDIDATES:
        if candidate and os.path.isdir(os.path.join(candidate, '.git')):
            return candidate
    c.ensure_dir(os.path.dirname(DEFAULT_CLONE))
    subprocess.run(('git', 'clone', c.REPO_URL + '.git', DEFAULT_CLONE),
                   check=True, capture_output=True, text=True)
    return DEFAULT_CLONE


def parse_controls_md(text):
    """`## A001: title` then `### Control shoulds` / `### Control mays` bullets."""
    records, current, section = {}, None, None
    for line in text.splitlines():
        heading = CONTROL_HEADING.match(line)
        if heading:
            current = {'id': heading.group(1), 'title': heading.group(2),
                       'control_shoulds': [], 'control_mays': [], 'other_sections': {}}
            records[current['id']] = current
            section = None
            continue
        if current is None:
            continue
        sub = SUB_HEADING.match(line)
        if sub:
            label = sub.group(1)
            section = {'Control shoulds': 'control_shoulds',
                       'Control mays': 'control_mays'}.get(label, label)
            continue
        if line.startswith('- ') and section:
            item = line[2:].strip()
            if section in ('control_shoulds', 'control_mays'):
                current[section].append(item)
            else:
                current['other_sections'].setdefault(section, []).append(item)
    return records


def parse_requirements_md(text):
    """`## A001: title` then one normative paragraph."""
    records, current, buffer = {}, None, []
    def flush():
        if current is not None:
            body = '\n'.join(buffer).strip().strip('-').strip()
            records[current['id']]['statement'] = body
    for line in text.splitlines():
        heading = CONTROL_HEADING.match(line)
        if heading:
            flush()
            current = {'id': heading.group(1), 'title': heading.group(2), 'statement': ''}
            records[current['id']] = current
            buffer = []
            continue
        if current is not None and line.strip() not in ('---', ''):
            buffer.append(line.strip())
    flush()
    return records


def repo_history(repo=None):
    repo = repo or ensure_clone()
    log = git(repo, 'log', '--reverse', '--format=%H|%cI|%aI|%s|%P')
    commits = []
    for line in log.strip().splitlines():
        sha, committed, authored, subject, parents = line.split('|', 4)
        touched = git(repo, 'show', '--name-only', '--format=', sha).split()
        entry = {
            'sha': sha,
            'short_sha': sha[:7],
            'committed_at': committed,
            'authored_at': authored,
            'subject': subject,
            'parents': parents.split(),
            'files_changed': sorted(set(touched)),
            'url': c.REPO_URL + '/commit/' + sha,
        }
        if any(f in touched for f in STANDARD_FILES):
            entry['standard'] = {}
            for path in STANDARD_FILES:
                try:
                    blob = git(repo, 'rev-parse', '%s:%s' % (sha, path)).strip()
                    body = git(repo, 'show', '%s:%s' % (sha, path))
                except subprocess.CalledProcessError:
                    continue
                entry['standard'][path] = {
                    'blob_sha': blob,
                    'raw_sha256': c.sha256_bytes(body),
                    'bytes': len(body.encode('utf-8')),
                    'raw_url': 'https://raw.githubusercontent.com/%s/%s/%s' % (
                        c.REPO_SLUG, sha, path),
                }
            controls = parse_controls_md(git(repo, 'show', '%s:standard/controls.md' % sha))
            requirements = parse_requirements_md(
                git(repo, 'show', '%s:standard/requirements.md' % sha))
            merged = {}
            for cid in sorted(set(controls) | set(requirements)):
                record = dict(controls.get(cid) or {'id': cid, 'title': None,
                                                    'control_shoulds': [], 'control_mays': [],
                                                    'other_sections': {}})
                record['statement'] = (requirements.get(cid) or {}).get('statement')
                record['title_in_requirements'] = (requirements.get(cid) or {}).get('title')
                record['in_controls_md'] = cid in controls
                record['in_requirements_md'] = cid in requirements
                merged[cid] = record
            entry['controls'] = merged
            entry['control_count'] = len(merged)
        commits.append(entry)
    return commits


# -- the changelog pages ---------------------------------------------------
KEYED = re.compile(r'^(\d+)-(date|requirements|category|change)$')


def _text(node, out=None):
    if out is None:
        out = []
    if isinstance(node, str):
        if not node.startswith('$') and node not in ('false', 'true'):
            out.append(node)
    elif isinstance(node, list):
        for item in node:
            _text(item, out)
    elif isinstance(node, dict):
        _text(node.get('children'), out)
    return out


def _elements(node, found=None):
    """Yield (key, props) for every React element in a resolved row."""
    if found is None:
        found = []
    if isinstance(node, list):
        if len(node) == 4 and node[0] == '$' and isinstance(node[3], dict):
            found.append((node[2], node[3]))
            _elements(node[3].get('children'), found)
        else:
            for item in node:
                _elements(item, found)
    elif isinstance(node, dict):
        for value in node.values():
            _elements(value, found)
    return found


def _stated_date(flat, sentence):
    """The date the page states after a sentence, e.g. 'released on <date>'."""
    at = flat.find(sentence)
    if at < 0:
        return None
    match = re.search(r'"children":"([A-Z][a-z]+ \d{1,2}, 20\d\d)"', flat[at:at + 600])
    return {'sentence': sentence, 'date_text': match.group(1)} if match else None


def changelog_page(html_text):
    """Release dates, narrative and the official per-control change table."""
    flat = rsc.flatten(html_text)
    table = rsc.rows(flat)
    cells = {}
    for row in table.values():
        for key, props in _elements(rsc.resolve(row, table), []):
            match = KEYED.match(key or '')
            if match:
                text = ' '.join(t.strip() for t in _text(props.get('children')) if t.strip())
                cells.setdefault(match.group(1), {})[match.group(2)] = text
    changes = []
    for index in sorted(cells, key=int):
        cell = cells[index]
        if cell.get('requirements'):
            changes.append({
                'row': int(index),
                'release_label': cell.get('date'),
                'subject': cell.get('requirements'),
                'category': cell.get('category'),
                'notes': cell.get('change'),
            })
    dates = re.findall(r'"children":"([A-Z][a-z]+ \d{1,2}, 20\d\d)"', flat)
    history = {}
    for key, date in re.findall(r'"([a-z]{3,4}\d{1,2})",\{"children":"([A-Z][a-z]+ \d{1,2}, 20\d\d)"', flat):
        history.setdefault(key, {'key': key})['date_text'] = date
    for key, href in re.findall(r'"([a-z]{3,4}\d{1,2})-link",\{[^}]*?"href":"([^"]+)"', flat):
        history.setdefault(key, {'key': key})['url'] = href
    return {
        'release_headings': re.findall(r'"children":"([A-Z][a-z]+ \d{1,2}, 20\d\d) release"', flat),
        'dates_mentioned': sorted(set(dates)),
        'most_recent_release': _stated_date(flat, 'The most recent version of AIUC-1 was released on'),
        'next_release': _stated_date(flat, 'The next version of AIUC-1 will be released on'),
        'history_rows': [history[k] for k in sorted(history)],
        'history_links': sorted(set(re.findall(r'"href":"(/changelog/[^"]+)"', flat))),
        'official_changes': changes,
    }


def build(day=None):
    day = day or c.now_iso()[:10]
    manifest = c.read_json('evidence/source-manifest.json')
    observations = {o['id']: o for o in manifest['observations']}
    import gzip

    pages = {}
    for ref, observation in observations.items():
        if '_page_changelog' not in ref:
            continue
        with gzip.open(c.path(observation['content']['raw_snapshot_path']),
                       'rt', encoding='utf-8') as handle:
            pages[ref] = dict(changelog_page(handle.read()), source_ref=ref,
                              url=observation['url'])

    repo = ensure_clone()
    history = repo_history(repo)
    c.write_json('build/repo-history.json', {
        'repository': c.REPO_SLUG,
        'clone_kind': 'local git clone of the official public repository',
        'default_branch_head': git(repo, 'rev-parse', 'HEAD').strip(),
        'repository_url': c.REPO_URL,
        'read_at': c.now_iso(),
        'commit_count': len(history),
        'standard_commits': [h['sha'] for h in history if 'controls' in h],
        'commits': history,
    })
    c.write_json('build/changelog-pages.json', {
        'read_at': c.now_iso(),
        'page_count': len(pages),
        'pages': pages,
    })
    return history, pages


if __name__ == '__main__':
    commits, pages = build()
    for commit in commits:
        marker = '%3d controls' % commit['control_count'] if 'controls' in commit else '  -'
        print('%s %s  %s  %s' % (commit['short_sha'], commit['committed_at'][:10],
                                 marker, commit['subject']))
    for ref, page in sorted(pages.items()):
        print('%s: %d official change rows, headings %s' % (
            page['url'], len(page['official_changes']), page['release_headings']))
