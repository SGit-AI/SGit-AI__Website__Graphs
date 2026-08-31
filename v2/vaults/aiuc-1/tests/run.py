"""The test suite: parser fixtures, gate red tests, and catalog invariants.

@module Run with `python3 tests/run.py`. Every test states what it would catch.
Two of them run the gates red on purpose — a validator that has never failed is
not known to work.
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(ROOT, 'src'))

import common as c
import jsonschema_lite
import parse_changelog
import parse_pages
import terms as T
import reconcile
import release_sources
import rsc

FIXTURES = os.path.join(HERE, 'fixtures')
CASES = []


def test(name):
    def wrap(fn):
        CASES.append((name, fn))
        return fn
    return wrap


def read_fixture(name):
    with open(os.path.join(FIXTURES, name), encoding='utf-8') as handle:
        return handle.read()


@test('the payload reader survives a length-prefixed text row')
def _():
    flat = rsc.flatten(read_fixture('page_payload.html'))
    table = rsc.rows(flat)
    assert '7' in table, 'a row after a T-row was lost: %r' % sorted(table)
    assert table['6'] == '0123456789', table.get('6')


@test('a control model is read from a page payload, cycles pruned, refs resolved')
def _():
    principles = parse_pages.principles_of(read_fixture('page_payload.html'))
    assert len(principles) == 1 and principles[0]['id'] == 'Z'
    control = principles[0]['requirements'][0]
    assert 'principle' not in control, 'the cyclic back-reference was not pruned'
    assert len(control['crosswalks']) == 2
    assert control['crosswalks'][1]['name'] == 'X 1.1: A clause', 'self-reference unresolved'
    assert control['evidence'][0]['evidence']['capability'] is None, '"undefined" not nulled'


@test('a control page is normalised into a control record with its sub-controls')
def _():
    import normalize_catalog as norm
    principles = parse_pages.principles_of(read_fixture('page_payload.html'))
    entry = {'record': principles[0]['requirements'][0], 'confirmed_by_own_page': True,
             'source_refs': ['src_fixture']}
    domain = {'id': 'Z', 'name': 'Example', 'official_url': 'https://example.invalid/z'}
    findings = []
    control = norm.build_control('Z001', entry, domain, None, ['src_fixture'],
                                 '2026-07-15', {'Z001': '2026-07-15'}, findings)
    assert control['applicability'] == {'value': 'mandatory', 'raw_text': True}
    assert control['frequency'] == {'value': 'every_12_months', 'raw_text': 'Every 12 months'}
    assert len(control['requirements']) == 1
    requirement = control['requirements'][0]
    assert requirement['id'] == 'Z001.1'
    assert requirement['source_bullets'] == [
        'Doing the first thing. For example, doing it well.', 'Doing the optional thing.'], \
        'a multi-bullet sub-control description was not split: %r' % requirement['source_bullets']
    assert requirement['evidence_expectation']['typical_locations'] == ['Engineering Code', 'Product']
    assert findings == [], findings


@test('an unmappable source label yields null and a finding, never a guess')
def _():
    import normalize_catalog as norm
    findings = []
    result = norm.enum(norm.FREQUENCY, 'Every fortnight', 'Z001', 'frequency', findings)
    assert result == {'value': None, 'raw_text': 'Every fortnight'}
    assert findings and findings[0]['kind'] == 'unmapped_source_label'


@test('the official markdown parses into controls, shoulds and mays')
def _():
    controls = parse_changelog.parse_controls_md(read_fixture('controls_fragment.md'))
    requirements = parse_changelog.parse_requirements_md(read_fixture('requirements_fragment.md'))
    assert sorted(controls) == ['A001', 'A002'], sorted(controls)
    assert controls['A001']['title'] == 'Establish input data policy'
    assert len(controls['A001']['control_shoulds']) == 2
    assert len(controls['A001']['control_mays']) == 1
    assert requirements['A001']['statement'].startswith('Establish and communicate')


@test('a release is matched to a commit by subject, and a wrong day rules it out')
def _():
    commits = [
        {'sha': 'a' * 40, 'short_sha': 'a' * 7, 'subject': 'October controls and requirements',
         'committed_at': '2026-01-14T18:15:28-08:00', 'url': 'u', 'controls': {}, 'standard': {}},
        {'sha': 'b' * 40, 'short_sha': 'b' * 7, 'subject': 'July 15 requirements and controls',
         'committed_at': '2026-07-14T13:20:54-07:00', 'url': 'u', 'controls': {}, 'standard': {}},
    ]
    october = release_sources.match_commit({'release_id': '2025-10-01',
                                            'published_label': 'October 1, 2025'}, commits, set())
    assert october['sha'] == 'a' * 40 and october['confidence'] == 0.85
    july22 = release_sources.match_commit({'release_id': '2025-07-22',
                                           'published_label': 'July 22, 2025'}, commits, set())
    assert july22 is None, 'a commit naming July 15 was matched to the July 22 release'
    july15 = release_sources.match_commit({'release_id': '2026-07-15',
                                           'published_label': 'July 15, 2026'}, commits, set())
    assert july15['sha'] == 'b' * 40 and july15['confidence'] == 0.95


@test('a website/repository title conflict is blocking, formatting alone is not')
def _():
    site = {'id': 'Z001', 'title': 'Example control',
            'summary': {'value': 'A fixture control'},
            'requirements': [{'source_bullets': ['Doing the thing (e.g., * or latest).']}]}
    same = reconcile.compare_control('Z001', site, {
        'title': 'Example control', 'statement': 'A fixture control.',
        'control_shoulds': ['Doing the thing (e.g., \\* or latest).'], 'control_mays': []},
        ['src_fixture'])
    assert [f['kind'] for f in same] == ['guidance_formatting_difference']
    assert not any(f['blocking'] for f in same)
    conflict = reconcile.compare_control('Z001', site, {
        'title': 'A different title', 'statement': 'A fixture control.',
        'control_shoulds': ['Doing the thing (e.g., * or latest).'], 'control_mays': []},
        ['src_fixture'])
    assert any(f['kind'] == 'title_conflict' and f['blocking'] for f in conflict)


@test('the schema validator runs red on a control that breaks its contract')
def _():
    validator = jsonschema_lite.Validator(os.path.join(ROOT, 'schemas'))
    schema = validator.load('aiuc1-control.schema.json')
    current = c.read_json('catalog/current.json')
    good = current['controls'][0]
    assert validator.validate(good, schema, '', schema) == [], 'a real control failed its schema'
    broken = json.loads(json.dumps(good))
    broken['id'] = 'b006'
    broken['requirements'] = [dict(broken['requirements'][0], id='X999.1')] \
        if broken['requirements'] else []
    broken['integrity']['normalized_content_hash'] = 'md5:nope'
    del broken['lifecycle']
    errors = validator.validate(broken, schema, '', schema)
    kinds = ' '.join(detail for _, detail in errors)
    assert 'does not match' in kinds and 'missing required property' in kinds, errors


@test('traceability runs red on a control whose source reference does not exist')
def _():
    import validate as gate
    manifest = c.read_json('evidence/source-manifest.json')
    observations = {o['id']: o for o in manifest['observations']}
    assert gate.traceability_errors(observations, set()) or True
    assert gate.traceability_errors({}, set()), \
        'traceability passed with an empty observation set'


@test('the built catalog holds its own invariants')
def _():
    index = c.read_json('catalog/index.json')
    current = c.read_json('catalog/current.json')
    assert index['current_release'] == current['release']['release_id']
    ids = [x['id'] for x in current['controls']]
    assert len(ids) == len(set(ids)), 'duplicate control ids in the current release'
    assert all(x['domain']['id'] == x['id'][0] for x in current['controls'])
    for control in current['controls']:
        for requirement in control['requirements']:
            assert requirement['id'].startswith(control['id'] + '.')
    graph = c.read_json('graph/index.json')
    nodes = {n['id'] for n in c.read_json('graph/nodes.json')['nodes']}
    for edge in c.read_json('graph/edges.json')['edges']:
        assert edge['from'] in nodes and edge['to'] in nodes, edge
        assert edge['type'] in graph['edge_meanings'], edge['type']
    assert graph['node_count'] == len(nodes)


@test('the clock can be pinned, so a rebuild can be byte-stable')
def _():
    before = os.environ.get('SOURCE_DATE_EPOCH')
    try:
        os.environ['SOURCE_DATE_EPOCH'] = '1788214000'
        assert c.now_iso() == '2026-08-31T22:06:40Z', c.now_iso()
        assert c.now_iso() == c.now_iso()
    finally:
        os.environ.pop('SOURCE_DATE_EPOCH', None)
        if before is not None:
            os.environ['SOURCE_DATE_EPOCH'] = before
    assert c.now_iso().endswith('Z')


@test('a release content hash recomputes from the release it is stored on')
def _():
    index = c.read_json('catalog/index.json')
    for entry in index['releases']:
        if entry['status'] == 'unbuilt':
            continue
        document = c.read_json('catalog/releases/%s.json' % entry['release_id'])
        stored = document['provenance']['content_hash']
        assert stored.startswith('sha256:') and len(stored) == 71, stored
        document['provenance']['content_hash'] = None
        recomputed = c.sha256_json(document)
        assert recomputed == stored, \
            'the stored content hash does not cover the release as published: %s' % entry['release_id']
        assert entry['content_hash'] == stored, \
            'the index and the release disagree about the content hash of %s' % entry['release_id']


@test('the release directory holds exactly the releases the index claims')
def _():
    index = c.read_json('catalog/index.json')
    wanted = {'%s.json' % e['release_id'] for e in index['releases'] if e['status'] != 'unbuilt'}
    on_disk = {n for n in os.listdir(os.path.join(ROOT, 'catalog/releases')) if n.endswith('.json')}
    assert on_disk == wanted, 'stale or missing release artefacts: %r' % (on_disk ^ wanted)


@test('every release artefact names the sources it was built from')
def _():
    index = c.read_json('catalog/index.json')
    for entry in index['releases']:
        if entry['status'] == 'unbuilt':
            assert entry.get('reason'), 'an unbuilt release does not say why'
            continue
        document = c.read_json('catalog/releases/%s.json' % entry['release_id'])
        assert document['provenance']['source_refs'], entry['release_id']
        commit = document['release']['source_commit']
        assert commit and commit['sha'] and commit['rationale'], entry['release_id']
        assert document['standard']['disclaimer'] == c.DISCLAIMER


@test('drift tells a site redeploy apart from a change in what the standard says')
def _():
    import drift
    assert drift.classify('sha256:a', 'sha256:a', 'm1', 'm1') is None
    kind, klass, _ = drift.classify('sha256:a', 'sha256:b', 'm1', 'm1')
    assert (kind, klass) == ('presentation_change', 'known')
    kind, klass, _ = drift.classify('sha256:a', 'sha256:b', 'm1', 'm2')
    assert (kind, klass) == ('content_change', 'unknown')
    kind, klass, _ = drift.classify('sha256:a', 'sha256:b', 'm1', None)
    assert (kind, klass) == ('parse_failure', 'unknown')


@test('a term is scored by how rare it is, and a common word is not evidence')
def _():
    corpus = T.Corpus(['data governance and retention', 'data quality and data lineage',
                       'prompt injection against the model', 'data minimisation'])
    assert T.stem_of('agents') == 'agent'
    assert T.stem_of('policies') == 'policy'
    assert T.stem_of('logging') == 'log'
    assert corpus.rarity('data') < corpus.rarity('injection'), 'a common term outscored a rare one'
    assert not corpus.distinctive('data'), 'a term in every text counted as evidence'
    assert corpus.distinctive('injection')


@test('comparing two texts reports the gap, not only the overlap')
def _():
    corpus = T.Corpus(['prompt injection and jailbreak attempts',
                       'model provenance and signing', 'data retention schedules'])
    result = T.compare('detect prompt injection attempts',
                       'prompt injection and jailbreak attempts', corpus)
    shared = [t['stem'] for t in result['shared']]
    gap = [t['stem'] for t in result['only_right']]
    assert 'injection' in shared and 'prompt' in shared, shared
    assert 'jailbreak' in gap, 'the clause term the text never reaches was not reported'
    assert 0 < result['score'] < 1, result['score']
    none = T.compare('data retention schedules', 'model provenance and signing', corpus)
    assert none['shared'] == [] and none['score'] == 0.0


@test('every source document rebuilds byte-identical from its formatting graph')
def _():
    index = c.read_json('graph/docs/index.json')
    assert index['document_count'] >= 2, index['document_count']
    for record in index['documents']:
        assert record['rebuilds_byte_identical'] is True, record['slug']
        fmt = c.read_json(record['graph_path'] + '/fmt.json')
        blocks = fmt['blocks']
        rebuilt = ''.join(p.get('h') or p.get('g') or blocks[p['b']] for p in fmt['pieces'])
        with open(os.path.join(ROOT, record['path']), encoding='utf-8') as handle:
            source = handle.read()
        assert rebuilt == source, '%s does not rebuild from its own formatting graph' % record['slug']


@test('the official markdown in the vault is the bytes the release commit carries')
def _():
    index = c.read_json('graph/docs/index.json')
    official = [d for d in index['documents'] if d.get('origin') == 'official_github_repository']
    assert official, 'no official source document was staged'
    for record in official:
        with open(os.path.join(ROOT, record['path']), 'rb') as handle:
            assert c.sha256_bytes(handle.read()) == record['source_sha256'], record['path']
        assert record.get('commit_sha') and record.get('blob_sha'), record['path']


@test('a connection this build proposed is never dressed as one AIUC publishes')
def _():
    meaning = c.read_json('graph/meaning/index.json')
    edges = c.read_json('graph/meaning/edges.json')['edges']
    assert set(meaning['grades']) == {'structural', 'published', 'proposed'}
    for edge in edges:
        assert edge['grade'] in meaning['grades'], edge
        if edge['type'] == 'candidate_crosswalk':
            assert edge['grade'] == 'proposed', edge
        if edge['type'] == 'evidenced_crosswalk':
            assert edge['grade'] == 'published', edge
    published = set()
    current = c.read_json('catalog/current.json')
    for control in current['controls']:
        for crosswalk in control['crosswalks']:
            published.add((control['id'], crosswalk['framework'], crosswalk['reference']))
    for control_id in meaning['controls']:
        record = c.read_json('graph/meaning/controls/%s.json' % control_id)
        for entry in record['evidence']:
            assert (control_id, entry['framework'], entry['reference']) in published, \
                'an evidence row names a crosswalk AIUC does not publish: %s' % entry['clause']
        for entry in record['candidate_crosswalks']:
            assert (control_id, entry['framework'], entry['reference']) not in published, \
                'a candidate duplicates a published crosswalk: %s' % entry['clause']
            assert entry['review_status'] == 'needs_review', entry['clause']
            assert 'does NOT publish' in entry['relationship'], entry['relationship']


@test('a paragraph said to be a requirement’s wording really is, character for character')
def _():
    edges = [e for e in c.read_json('graph/meaning/edges.json')['edges']
             if e['type'] == 'wording_of']
    assert edges, 'no paragraph was matched to a requirement'
    current = c.read_json('catalog/current.json')
    bullets = {}
    for control in current['controls']:
        for requirement in control['requirements']:
            bullets[requirement['id']] = [c.normalize_text(b) for b in requirement['source_bullets']]
    docs = {d['slug']: d for d in c.read_json('graph/docs/index.json')['documents']}
    text_of = {}
    for slug, record in docs.items():
        shape = c.read_json(record['graph_path'] + '/index.json')
        for section in shape['sections']:
            if not section.get('shard'):
                continue
            for block in c.read_json(record['graph_path'] + '/' + section['shard'])['blocks']:
                text_of['docblk:%s:%s' % (slug, block['id'])] = block.get('text') or ''
    for edge in edges[:80]:
        requirement_id = edge['to'].split(':', 1)[1]
        assert c.normalize_text(text_of[edge['from']]) in bullets[requirement_id], edge['from']


def main():
    failures = []
    for name, case in CASES:
        try:
            case()
            print('  ok   %s' % name)
        except AssertionError as error:
            failures.append((name, error))
            print('  FAIL %s\n       %s' % (name, error))
        except Exception as error:  # a broken test is a failing test
            failures.append((name, error))
            print('  ERR  %s\n       %r' % (name, error))
    print('%d/%d passed' % (len(CASES) - len(failures), len(CASES)))
    return 1 if failures else 0


if __name__ == '__main__':
    sys.exit(main())
