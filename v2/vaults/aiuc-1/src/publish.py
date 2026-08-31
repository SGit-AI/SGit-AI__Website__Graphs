"""Assemble the vault: the app, its data, and everything the catalog is made of.

@module Builds vault-app/data.json (a compact dataset the app can hold in one
page), injects it into the app's inlined fallback, and lays out the vault tree at
build/vault: the app and app.json at the root, then the catalog, the graph, the
changes, the reports, the schemas, the docs, the build source, the tests, and the
retained snapshots that make every claim checkable.
"""
import json
import os
import shutil
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common as c

VAULT = c.path('build/vault')
COPY_TREES = ('catalog', 'graph', 'changes', 'reports', 'schemas', 'docs', 'src', 'tests',
              'evidence')
COPY_FILES = ('README.md', 'NOTICE.md')


def app_data():
    index = c.read_json('catalog/index.json')
    current = c.read_json('catalog/current.json')
    graph = c.read_json('graph/index.json')
    manifest = c.read_json('evidence/source-manifest.json')
    validation = c.read_json('reports/validation-latest.json')
    reconciliation = c.read_json('reports/reconciliation-latest.json')
    drift = c.read_json('reports/drift-latest.json', {})

    controls = []
    for control in current['controls']:
        controls.append({
            'id': control['id'],
            'domain': control['domain']['id'],
            'title': control['title'],
            'url': control['official_url'],
            'summary': control['summary']['value'],
            'applicability': control['applicability']['value'],
            'applicability_raw': control['applicability']['raw_text'],
            'frequency': control['frequency']['value'],
            'frequency_raw': control['frequency']['raw_text'],
            'type': control['control_type']['value'],
            'type_raw': control['control_type']['raw_text'],
            'capabilities': control['capabilities'],
            'keywords': control['keywords'],
            'status': control['canonical_status'],
            'superseded_by': control['relationships']['superseded_by'],
            'note': control['relationships']['note'],
            'lifecycle': control['lifecycle'],
            'hash': control['integrity']['normalized_content_hash'],
            'sources': control['provenance']['source_refs'],
            'official': control['official_changelog_text'] and {
                'statement': control['official_changelog_text']['statement'],
                'shoulds': control['official_changelog_text']['control_shoulds'],
                'mays': control['official_changelog_text']['control_mays'],
            },
            'requirements': [{
                'id': r['id'],
                'label': r['label'],
                'application': r['application']['value'],
                'text': r['normalized_text'],
                'bullets': r['source_bullets'],
                'category': r['evidence_expectation']['category']['raw_text'],
                'locations': r['evidence_expectation']['typical_locations'],
                'evidence': r['evidence_expectation']['normalized_typical_evidence'],
                'capabilities': r['evidence_expectation']['capabilities'],
            } for r in control['requirements']],
            'crosswalks': [{
                'framework': x['framework'],
                'reference': x['reference'],
                'text': x['normalized_text'],
            } for x in control['crosswalks']],
        })

    releases = []
    for entry in index['releases']:
        record = {k: entry.get(k) for k in (
            'release_id', 'published_at', 'status', 'control_count', 'built_from',
            'official_changelog_url', 'reason', 'stated_by', 'source_commit_sha',
            'source_commit_confidence')}
        if entry['status'] != 'unbuilt':
            document = c.read_json('catalog/releases/%s.json' % entry['release_id'])
            changes = c.read_json('changes/%s.json' % entry['release_id'], {})
            record['commit'] = document['release']['source_commit']
            record['derived_events'] = [{
                'control_id': e['control_id'], 'event_type': e['event_type'],
                'summary': e['summary'], 'confidence': e['classification']['confidence'],
            } for e in changes.get('derived_events') or []]
            record['official_changes'] = [{
                'control_ids': e['control_ids'], 'subject': e['subject'],
                'category': e['category'], 'notes': e['notes'],
            } for e in changes.get('official_change_records') or []]
        releases.append(record)

    return {
        'meta': {
            'title': 'AIUC-1, as a graph you can cite',
            'generated_at': c.now_iso(),
            'generator_version': c.GENERATOR_VERSION,
            'catalog_schema_version': c.CATALOG_SCHEMA_VERSION,
            'current_release': index['current_release'],
            'current_release_stated_by': index.get('current_release_stated_by'),
            'announced_release': index.get('announced_release'),
            'disclaimer': c.DISCLAIMER,
            'official_website': c.SITE + '/',
            'official_changelog_url': c.CHANGELOG_URL,
            'official_changelog_repository': c.REPO_URL,
            'validation': {
                'passed': validation['passed'],
                'error_count': validation['error_count'],
                'counts_by_level': validation['counts_by_level'],
                'observation_count': validation['observation_count'],
            },
            'reconciliation': {
                'finding_count': reconciliation['finding_count'],
                'blocking_count': reconciliation['blocking_count'],
                'counts_by_kind': reconciliation['counts_by_kind'],
                'findings': [{k: f.get(k) for k in ('kind', 'control_id', 'reason')}
                             for f in reconciliation['findings']],
            },
            'drift': {k: drift.get(k) for k in
                      ('generated_at', 'pages_checked', 'finding_count', 'unknown_count')},
        },
        'domains': [{'id': d['id'], 'name': d['name'], 'description': d['description'],
                     'url': d['official_url'], 'control_ids': d['control_ids']}
                    for d in current['domains']],
        'controls': controls,
        'releases': releases,
        'sources': {o['id']: {'url': o['url'], 'retrieved_at': o['retrieved_at'],
                              'sha256': o['content']['raw_sha256'],
                              'status': o['http']['status'],
                              'snapshot': o['content']['raw_snapshot_path']}
                    for o in manifest['observations']},
        'graph': {k: graph[k] for k in ('node_count', 'edge_count', 'nodes_by_type',
                                        'edges_by_type', 'edge_meanings', 'content_hash')},
    }


def inject(data):
    template = c.path('vault-app/index.html')
    with open(template, encoding='utf-8') as handle:
        html = handle.read()
    compact = json.dumps(data, ensure_ascii=False, separators=(',', ':'))
    assert '\n' not in compact, 'a raw newline leaked into the inlined data'
    marker = 'const FALLBACK = /*__DATA__*/{};'
    assert marker in html, 'the data placeholder is missing from vault-app/index.html'
    return html.replace(marker, 'const FALLBACK = /*__DATA__*/%s;' % compact)


def build():
    data = app_data()
    c.write_json('vault-app/data.json', data)
    html = inject(data)

    if os.path.isdir(VAULT):
        for name in os.listdir(VAULT):
            if name == '.sg_vault':
                continue
            target = os.path.join(VAULT, name)
            shutil.rmtree(target) if os.path.isdir(target) else os.remove(target)
    c.ensure_dir(VAULT)

    with open(os.path.join(VAULT, 'index.html'), 'w', encoding='utf-8') as handle:
        handle.write(html)
    with open(os.path.join(VAULT, 'data.json'), 'w', encoding='utf-8') as handle:
        json.dump(data, handle, ensure_ascii=False, indent=1)
        handle.write('\n')
    with open(os.path.join(VAULT, 'app.json'), 'w', encoding='utf-8') as handle:
        json.dump({'entry': 'index.html', 'present': True, 'auto_open': True,
                   'title': 'AIUC-1, as a graph you can cite',
                   'hud': {'mode': 'default'}}, handle, indent=1)
        handle.write('\n')
    for name in COPY_FILES:
        shutil.copy2(c.path(name), os.path.join(VAULT, name))
    for tree in COPY_TREES:
        source = c.path(tree)
        if os.path.isdir(source):
            shutil.copytree(source, os.path.join(VAULT, tree),
                            ignore=shutil.ignore_patterns('__pycache__', '*.pyc'))
    total = sum(os.path.getsize(os.path.join(root, f))
                for root, _, files in os.walk(VAULT) for f in files)
    count = sum(len(files) for _, _, files in os.walk(VAULT))
    return {'path': VAULT, 'files': count, 'bytes': total, 'html_bytes': len(html)}


if __name__ == '__main__':
    result = build()
    print('vault assembled at %s: %d files, %.1f MB (app page %.0f KB)' % (
        result['path'], result['files'], result['bytes'] / 1e6, result['html_bytes'] / 1024))
