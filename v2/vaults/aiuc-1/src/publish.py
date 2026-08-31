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
              'evidence', 'sources')
COPY_FILES = ('README.md', 'NOTICE.md')


def app_data():
    index = c.read_json('catalog/index.json')
    current = c.read_json('catalog/current.json')
    graph = c.read_json('graph/index.json')
    manifest = c.read_json('evidence/source-manifest.json')
    validation = c.read_json('reports/validation-latest.json')
    reconciliation = c.read_json('reports/reconciliation-latest.json')
    drift = c.read_json('reports/drift-latest.json', {})
    docs = c.read_json('graph/docs/index.json', {})
    meaning = c.read_json('graph/meaning/index.json', {})

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
        'docs': {k: docs.get(k) for k in ('document_count', 'totals', 'ladder', 'gate',
                                          'decomposer')} | {'documents': [
            {k: doc.get(k) for k in ('slug', 'title', 'path', 'origin', 'graph_path',
                                     'sections', 'blocks', 'sentences', 'words', 'forms',
                                     'uid_prefix', 'source_sha256', 'commit_sha',
                                     'rebuilds_byte_identical')}
            for doc in docs.get('documents') or []]},
        'meaning': {k: meaning.get(k) for k in ('method', 'grades', 'counts', 'corpus')}
                   | {'top_terms': (meaning.get('terms') or [])[:40],
                      'controls': meaning.get('controls') or {}},
    }


VENDOR = ('cytoscape.min.js', 'marked.min.js')


def vendored():
    """The two libraries the page needs, inlined from the estate's assets/vendor/.

    The vault's authoring contract forbids a <script src> against a vault path, so
    they travel inside the page rather than beside it. They are read from the estate
    and not copied into this folder, for the same reason gen_coregraph is imported
    and not copied: one vendored copy, in the place the estate keeps them."""
    estate = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(c.ROOT))),
                          'assets', 'vendor')
    out = []
    for name in VENDOR:
        path = os.path.join(estate, name)
        if not os.path.exists(path):
            raise SystemExit('publish: the vendored library %s is missing at %s'
                             % (name, path))
        with open(path, encoding='utf-8') as handle:
            out.append('/* vendored: assets/vendor/%s */\n%s' % (name, handle.read()))
    return '\n;\n'.join(out)


def parts():
    """The app's own modules, in order, concatenated into one script."""
    folder = c.path('vault-app/parts')
    out = []
    for name in sorted(os.listdir(folder)):
        if not name.endswith('.js'):
            continue
        with open(os.path.join(folder, name), encoding='utf-8') as handle:
            out.append('/* --- vault-app/parts/%s --- */\n%s' % (name, handle.read()))
    return '\n'.join(out)


def compact_graph():
    """The whole graph in an index-addressed form small enough to inline."""
    nodes = c.read_json('graph/nodes.json')['nodes']
    edges = c.read_json('graph/edges.json')['edges']
    types = sorted({n['type'] for n in nodes})
    edge_types = sorted({e['type'] for e in edges})
    index = {n['id']: i for i, n in enumerate(nodes)}
    return {
        'types': types,
        'etypes': edge_types,
        'n': [[n['id'], types.index(n['type']), n['label']] for n in nodes],
        'e': [[index[e['from']], edge_types.index(e['type']), index[e['to']]]
              for e in edges if e['from'] in index and e['to'] in index],
    }


def file_manifest():
    """Every file the vault will hold, foldered, for the file explorer."""
    folders = {}
    for tree in ('', 'catalog', 'catalog/releases', 'graph', 'graph/meaning',
                 'graph/meaning/controls', 'graph/docs', 'changes', 'reports', 'schemas',
                 'docs', 'src', 'tests', 'tests/fixtures', 'evidence', 'sources',
                 'sources/standard'):
        base = c.path(tree) if tree else c.ROOT
        if not os.path.isdir(base):
            continue
        files = []
        for name in sorted(os.listdir(base)):
            full = os.path.join(base, name)
            if not os.path.isfile(full) or name.startswith('.'):
                continue
            if name.endswith(('.pyc',)):
                continue
            files.append({'n': name, 'b': os.path.getsize(full)})
        if files:
            folders[tree] = {'label': tree or 'vault root', 'base': tree, 'files': files,
                             'open': tree in ('', 'catalog', 'docs')}
    for slug in sorted(os.listdir(c.path('graph/docs'))) if os.path.isdir(
            c.path('graph/docs')) else []:
        base = c.path('graph/docs/%s' % slug)
        if not os.path.isdir(base):
            continue
        files = [{'n': n, 'b': os.path.getsize(os.path.join(base, n))}
                 for n in sorted(os.listdir(base)) if os.path.isfile(os.path.join(base, n))]
        folders['graph/docs/%s' % slug] = {
            'label': 'graph/docs/%s' % slug, 'base': 'graph/docs/%s' % slug,
            'files': files, 'open': False}
    day_root = c.path('evidence/snapshots')
    if os.path.isdir(day_root):
        for day in sorted(os.listdir(day_root)):
            base = os.path.join(day_root, day)
            if not os.path.isdir(base):
                continue
            files = [{'n': n, 'b': os.path.getsize(os.path.join(base, n))}
                     for n in sorted(os.listdir(base))
                     if os.path.isfile(os.path.join(base, n))]
            if files:
                folders['evidence/snapshots/%s' % day] = {
                    'label': 'evidence/snapshots/%s' % day,
                    'base': 'evidence/snapshots/%s' % day, 'files': files, 'open': False}
    ordered = [folders[k] for k in sorted(folders, key=lambda k: (k != '', k))]
    return {'folder_count': len(ordered),
            'file_count': sum(len(f['files']) for f in ordered),
            'folders': ordered}


def inject(data, graph):
    template = c.path('vault-app/index.html')
    with open(template, encoding='utf-8') as handle:
        html = handle.read()
    with open(c.path('vault-app/app.css'), encoding='utf-8') as handle:
        css = handle.read()
    for marker, value in (('const FALLBACK = /*__DATA__*/{};', 'data'),
                          ('const GRAPHDATA = /*__GRAPH__*/{};', 'graph')):
        assert marker in html, 'the %s placeholder is missing from vault-app/index.html' % value
    for payload, marker, name in ((data, 'const FALLBACK = /*__DATA__*/{};', 'FALLBACK'),
                                  (graph, 'const GRAPHDATA = /*__GRAPH__*/{};', 'GRAPHDATA')):
        compact = json.dumps(payload, ensure_ascii=False, separators=(',', ':'))
        assert '\n' not in compact, 'a raw newline leaked into the inlined %s' % name
        html = html.replace(marker, 'const %s = %s;' % (name, compact))
    html = html.replace('/*__CSS__*/', css)
    html = html.replace('/*__VENDOR__*/', vendored())
    html = html.replace('/*__PARTS__*/', parts())
    return html


def build():
    data = app_data()
    data['files'] = file_manifest()
    graph = compact_graph()
    c.write_json('vault-app/data.json', data)
    c.write_json('vault-app/graph-compact.json', graph)
    html = inject(data, graph)

    if os.path.isdir(VAULT):
        for name in os.listdir(VAULT):
            if name == '.sg_vault':
                continue
            target = os.path.join(VAULT, name)
            shutil.rmtree(target) if os.path.isdir(target) else os.remove(target)
    c.ensure_dir(VAULT)

    with open(os.path.join(VAULT, 'index.html'), 'w', encoding='utf-8') as handle:
        handle.write(html)
    for name, payload in (('data.json', data), ('graph-compact.json', graph)):
        with open(os.path.join(VAULT, name), 'w', encoding='utf-8') as handle:
            json.dump(payload, handle, ensure_ascii=False, indent=1)
            handle.write('\n')
    with open(os.path.join(VAULT, 'app.json'), 'w', encoding='utf-8') as handle:
        json.dump({'entry': 'index.html', 'present': True, 'auto_open': True,
                   'title': 'AIUC-1, as a graph you can cite',
                   'hud': {'mode': 'minimal'}}, handle, indent=1)
        handle.write('\n')
    for name in COPY_FILES:
        shutil.copy2(c.path(name), os.path.join(VAULT, name))
    for tree in COPY_TREES:
        source = c.path(tree)
        if os.path.isdir(source):
            shutil.copytree(source, os.path.join(VAULT, tree),
                            ignore=shutil.ignore_patterns('__pycache__', '*.pyc'))
    def content():
        for root, dirs, files in os.walk(VAULT):
            dirs[:] = [d for d in dirs if d != '.sg_vault']
            for name in files:
                yield os.path.join(root, name)

    total = sum(os.path.getsize(f) for f in content())
    count = sum(1 for _ in content())
    return {'path': VAULT, 'files': count, 'bytes': total, 'html_bytes': len(html)}


if __name__ == '__main__':
    result = build()
    print('vault assembled at %s: %d files, %.1f MB (app page %.0f KB)' % (
        result['path'], result['files'], result['bytes'] / 1e6, result['html_bytes'] / 1024))
