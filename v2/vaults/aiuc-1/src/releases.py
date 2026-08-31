"""Assemble catalog releases from the parsed website and the parsed repository.

@module One release artefact per published AIUC-1 release. The current release is
built from the website and confirmed against the official changelog repository at
the matching commit; earlier releases are built from that repository alone, and
say so. Which releases exist, and which commit carries each, is decided in
release_sources.py.

Size: 260 lines against the estate's 250-line guideline for a section. The
deviation is deliberate and recorded here: build_all is one pass over the release
list and splitting it further would hide the order the artefacts are written in.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common as c
from release_sources import match_commit, published_releases, to_date


def _release_status(controls, source_commit, from_website, findings):
    if not controls or source_commit is None:
        return 'needs_review'
    if not from_website:
        return 'partial'
    blocking = [f for f in findings if f.get('blocking')]
    return 'needs_review' if blocking else 'validated'


def _from_repo_only(release, commit, refs):
    """A historical release: the official markdown, and nothing invented around it."""
    controls = []
    for cid, record in sorted((commit.get('controls') or {}).items()):
        controls.append({
            'id': cid,
            'domain': {'id': cid[0], 'name': None, 'source_url': None},
            'title': record.get('title'),
            'slug': None,
            'official_url': None,
            'canonical_status': 'active',
            'source_terminology': {'called_on_site': 'requirement',
                                   'sub_items_called_on_site': 'control'},
            'applicability': {'value': None, 'raw_text': None},
            'frequency': {'value': None, 'raw_text': None},
            'control_type': {'value': None, 'raw_text': None},
            'capabilities': [],
            'summary': {'value': record.get('statement'),
                        'normalized_value': c.normalize_text(record.get('statement')),
                        'source_refs': list(refs)},
            'requirements': [],
            'implementation_guidance': [],
            'keywords': [],
            'crosswalks': [],
            'official_changelog_text': {
                'statement': record.get('statement'),
                'control_shoulds': record.get('control_shoulds') or [],
                'control_mays': record.get('control_mays') or [],
                'source_refs': list(refs),
            },
            'relationships': {'parent_control_id': None, 'related_control_ids': [],
                              'supersedes': [], 'superseded_by': [], 'note': None},
            'lifecycle': {'first_observed_release': None,
                          'last_confirmed_release': release['release_id'],
                          'deprecated_in_release': None, 'retired_in_release': None},
            'provenance': {
                'source_refs': list(refs),
                'extraction': {'method': 'official_changelog_markdown_parse',
                               'parser_version': c.PARSER_VERSION,
                               'extracted_at': c.now_iso(),
                               'confirmed_by_own_page': False,
                               'review_status': 'approved'}},
            'integrity': {'normalized_content_hash': c.sha256_json([
                cid, c.normalize_text(record.get('title')),
                c.normalize_text(record.get('statement')),
                [c.normalize_text(x) for x in (record.get('control_shoulds') or [])
                 + (record.get('control_mays') or [])]])},
        })
    return controls


def _source_refs_for(release, commit, page_refs):
    refs = []
    if release.get('changelog_source_ref'):
        refs.append(release['changelog_source_ref'])
    if commit:
        refs.append('git:%s' % commit['sha'])
    refs.extend(page_refs)
    return list(dict.fromkeys(refs))


def _release_document(release, controls, commit, refs, status, findings, from_website, domains):
    document = {
        '$schema': '../../schemas/aiuc1-catalog.schema.json',
        'catalog_id': 'aiuc-1-derived-catalog',
        'catalog_schema_version': c.CATALOG_SCHEMA_VERSION,
        'standard': {
            'id': 'AIUC-1',
            'name': 'AIUC-1',
            'official_website': c.SITE + '/',
            'official_changelog_url': c.CHANGELOG_URL,
            'official_changelog_repository': c.REPO_URL,
            'disclaimer': c.DISCLAIMER,
        },
        'terminology': {
            'note': 'AIUC-1 calls a top-level item a "requirement" (A001) and its numbered '
                    'children "controls" (A001.1). This catalog follows the field names its '
                    'build brief specifies, so a top-level item is a "control" here and its '
                    'children are "requirements". Every record carries source_terminology so '
                    'the inversion is visible rather than silent.',
        },
        'release': {
            'release_id': release['release_id'],
            'published_at': release['published_at'],
            'published_label': release['published_label'],
            'retrieved_at': c.now_iso(),
            'status': status,
            'built_from': 'official website and official changelog repository' if from_website
                          else 'official changelog repository only',
            'official_changelog_url': release.get('changelog_url'),
            'source_commit': commit,
        },
        'domains': domains,
        'controls': controls,
        'change_events': [],
        'provenance': {
            'generator_version': c.GENERATOR_VERSION,
            'parser_version': c.PARSER_VERSION,
            'generated_at': c.now_iso(),
            'source_manifest': '../../evidence/source-manifest.json',
            'source_refs': refs,
        },
        'validation': {
            'schema_valid': None,
            'source_traceability_valid': None,
            'reconciliation_findings': len(findings),
            'blocking_findings': sum(1 for f in findings if f.get('blocking')),
            'unresolved_items': [f for f in findings if f.get('blocking')],
        },
    }
    document['provenance']['content_hash'] = c.sha256_json(
        {k: v for k, v in document.items() if k != 'provenance'})
    return document


def build_all(build_control):
    import reconcile
    pages = c.read_json('build/changelog-pages.json')['pages']
    history = c.read_json('build/repo-history.json')
    parsed = c.read_json('build/parsed-pages.json')
    discovery = c.read_json('evidence/discovery-manifest.json')
    commits = history['commits']

    releases, announced = published_releases(pages)
    ordered = sorted(releases, key=lambda r: r['release_id'])
    taken = set()
    for release in ordered:
        commit = match_commit(release, commits, taken)
        release['source_commit'] = commit
        if commit:
            taken.add(commit['sha'])

    current = next((r for r in releases if r.get('is_current')), releases[0])
    site_domains = [dict(v, control_ids=sorted(
        k for k, e in parsed['controls'].items() if e['domain_id'] == v['id']))
        for v in parsed['domains'].values()]

    first_seen = {}
    for release in ordered:
        commit = release['source_commit']
        if not commit:
            continue
        record = next(x for x in commits if x['sha'] == commit['sha'])
        for cid in record.get('controls') or {}:
            first_seen.setdefault(cid, release['release_id'])

    lines, index_entries = [], []
    for release in ordered:
        commit = release['source_commit']
        is_current = release['release_id'] == current['release_id']
        if not commit and not is_current:
            index_entries.append({
                'release_id': release['release_id'],
                'published_at': release['published_at'],
                'status': 'unbuilt',
                'reason': 'the official changelog repository carries no commit for this '
                          'release, so no control set can be traced to a source revision',
                'stated_by': release.get('stated_by'),
                'official_changelog_url': release.get('changelog_url'),
                'control_count': 0,
            })
            lines.append('%s  %-12s   - controls  no matched commit' % (
                release['release_id'], 'unbuilt'))
            continue
        commit_record = next((x for x in commits if commit and x['sha'] == commit['sha']), None)
        repo_controls = (commit_record or {}).get('controls') or {}
        refs = _source_refs_for(release, commit, [discovery['source_ref']] if is_current else [])
        if is_current:
            findings = []
            controls = [build_control(cid, entry, parsed['domains'][entry['domain_id']],
                                      repo_controls.get(cid), refs, release['release_id'],
                                      first_seen, findings)
                        for cid, entry in sorted(parsed['controls'].items())]
            findings.extend(reconcile.compare_release({x['id']: x for x in controls},
                                                      repo_controls, refs))
            domains = site_domains
        else:
            controls = _from_repo_only(release, commit_record or {}, refs)
            for control in controls:
                control['lifecycle']['first_observed_release'] = first_seen.get(control['id'])
            findings = []
            domains = []
        status = _release_status(controls, commit, is_current, findings)
        document = _release_document(release, controls, commit, refs, status, findings,
                                     is_current, domains)
        document['change_events'] = []
        c.write_json('catalog/releases/%s.json' % release['release_id'], document)
        index_entries.append({
            'release_id': release['release_id'],
            'published_at': release['published_at'],
            'status': status,
            'control_count': len(controls),
            'built_from': document['release']['built_from'],
            'source_commit_sha': (commit or {}).get('sha'),
            'source_commit_confidence': (commit or {}).get('confidence'),
            'official_changelog_url': release.get('changelog_url'),
            'official_change_rows': len(release.get('official_changes') or []),
            'path': 'releases/%s.json' % release['release_id'],
            'content_hash': document['provenance']['content_hash'],
        })
        lines.append('%s  %-12s %3d controls  %s  %d official change rows' % (
            release['release_id'], status, len(controls),
            (commit or {}).get('short_sha', 'no commit'),
            len(release.get('official_changes') or [])))
        if is_current:
            c.write_json('catalog/current.json', document)
            c.write_json('reports/reconciliation-latest.json',
                         reconcile.report(findings, release['release_id'],
                                          {'website_controls': len(controls),
                                           'repository_controls': len(repo_controls)}))

    index_entries.sort(key=lambda x: x['release_id'], reverse=True)
    # A release that stops being built must not leave its artefact behind claiming
    # provenance nothing points at any more.
    wanted = {'%s.json' % e['release_id'] for e in index_entries if e['status'] != 'unbuilt'}
    release_dir = c.path('catalog/releases')
    for name in sorted(os.listdir(release_dir)) if os.path.isdir(release_dir) else []:
        if name.endswith('.json') and name not in wanted:
            os.remove(os.path.join(release_dir, name))
            lines.append('removed stale artefact catalog/releases/%s' % name)
    c.write_json('catalog/index.json', {
        'catalog_id': 'aiuc-1-derived-catalog',
        'catalog_schema_version': c.CATALOG_SCHEMA_VERSION,
        'generator_version': c.GENERATOR_VERSION,
        'generated_at': c.now_iso(),
        'disclaimer': c.DISCLAIMER,
        'current_release': current['release_id'],
        'current_release_stated_by': current.get('stated_by'),
        'announced_release': announced and {
            'release_id': announced['release_id'],
            'published_label': announced['published_label'],
            'publication_state': 'announced',
            'stated_by': announced['stated_by'],
            'note': 'announced by the official changelog page and not yet published; no '
                    'catalog artefact exists for it'},
        'release_count': len(index_entries),
        'releases': index_entries,
    })
    lines.append('current release: %s (%s)' % (current['release_id'],
                                               current.get('stated_by', 'unstated')))
    if announced:
        lines.append('announced, not built: %s' % announced['release_id'])
    return lines
