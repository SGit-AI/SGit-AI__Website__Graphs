"""The gate: schema, source traceability, semantic and inventory validation.

@module Four levels, all of them refusing to guess. Schema validation checks every
artefact against its JSON Schema. Traceability checks that every non-null canonical
field names a source observation that exists and carries a URL, a retrieval time
and a content hash. Semantic validation checks ids, domains, parents and enum
provenance. Inventory validation checks the control set against the release before
it. A release is only allowed to say `validated` when all four pass.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common as c
import jsonschema_lite

SCHEMA_DIR = c.path('schemas')


def _err(level, kind, where, detail):
    return {'level': level, 'kind': kind, 'where': where, 'detail': detail}


def schema_errors(validator):
    errors = []
    manifest = c.read_json('evidence/source-manifest.json')
    observation_schema = validator.load('aiuc1-source-observation.schema.json')
    for observation in manifest['observations']:
        for pointer, detail in validator.validate(observation, observation_schema, '',
                                                  observation_schema):
            errors.append(_err('schema', 'source_observation', observation['id'] + pointer, detail))
    catalog_schema = validator.load('aiuc1-catalog.schema.json')
    index = c.read_json('catalog/index.json')
    for entry in index['releases']:
        if entry['status'] == 'unbuilt':
            continue
        document = c.read_json('catalog/releases/%s.json' % entry['release_id'])
        for pointer, detail in validator.validate(document, catalog_schema, '', catalog_schema):
            errors.append(_err('schema', 'release', entry['release_id'] + pointer, detail))
    graph_schema = validator.load('aiuc1-graph.schema.json')
    graph_index = c.read_json('graph/index.json')
    for pointer, detail in validator.validate(graph_index, graph_schema, '', graph_schema):
        errors.append(_err('schema', 'graph', 'graph/index.json' + pointer, detail))
    return errors


def traceability_errors(observations, commits):
    errors = []
    index = c.read_json('catalog/index.json')
    for entry in index['releases']:
        if entry['status'] == 'unbuilt':
            continue
        document = c.read_json('catalog/releases/%s.json' % entry['release_id'])
        where = entry['release_id']

        def check(refs, field):
            for ref in refs:
                if ref.startswith('git:'):
                    if ref[4:] not in commits:
                        errors.append(_err('traceability', 'unknown_commit_ref',
                                           '%s %s' % (where, field), ref))
                    continue
                observation = observations.get(ref)
                if observation is None:
                    errors.append(_err('traceability', 'dangling_source_ref',
                                       '%s %s' % (where, field), ref))
                    continue
                content = observation.get('content') or {}
                if not (observation.get('url') and observation.get('retrieved_at')
                        and content.get('raw_sha256')):
                    errors.append(_err('traceability', 'incomplete_observation',
                                       '%s %s' % (where, field), ref))

        if not document['provenance'].get('source_refs'):
            errors.append(_err('traceability', 'release_without_sources', where,
                               'the release records no source revisions'))
        check(document['provenance']['source_refs'], 'provenance')
        commit = document['release'].get('source_commit')
        if commit and (not commit.get('sha') or not commit.get('files')):
            errors.append(_err('traceability', 'commit_without_blobs', where,
                               'the matched commit records no file blobs'))
        for control in document['controls']:
            base = '%s %s' % (where, control['id'])
            if not control['provenance']['source_refs']:
                errors.append(_err('traceability', 'control_without_sources', base,
                                   'no source observation is named'))
            check(control['provenance']['source_refs'], control['id'])
            if control['summary']['value'] and not control['summary']['source_refs']:
                errors.append(_err('traceability', 'field_without_sources', base + ' summary',
                                   'a non-null canonical field names no source'))
            for requirement in control['requirements']:
                if not requirement['source_refs']:
                    errors.append(_err('traceability', 'field_without_sources',
                                       base + ' ' + requirement['id'], 'no source named'))
    return errors


def semantic_errors():
    errors = []
    index = c.read_json('catalog/index.json')
    for entry in index['releases']:
        if entry['status'] == 'unbuilt':
            continue
        document = c.read_json('catalog/releases/%s.json' % entry['release_id'])
        where = entry['release_id']
        domain_ids = {d['id'] for d in document['domains']}
        seen = set()
        for control in document['controls']:
            base = '%s %s' % (where, control['id'])
            if control['id'] in seen:
                errors.append(_err('semantic', 'duplicate_control_id', base, 'declared twice'))
            seen.add(control['id'])
            if domain_ids and control['domain']['id'] not in domain_ids:
                errors.append(_err('semantic', 'unknown_domain', base,
                                   'domain %r is not published in this release'
                                   % control['domain']['id']))
            if control['domain']['id'] != control['id'][0]:
                errors.append(_err('semantic', 'domain_prefix_mismatch', base,
                                   'the control id does not begin with its domain letter'))
            for field in ('applicability', 'frequency', 'control_type'):
                labelled = control[field]
                if labelled['value'] is not None and labelled['raw_text'] in (None, ''):
                    errors.append(_err('semantic', 'value_without_source_label',
                                       '%s %s' % (base, field),
                                       'a machine value exists with no source wording behind it'))
            for requirement in control['requirements']:
                if not requirement['id'].startswith(control['id'] + '.'):
                    errors.append(_err('semantic', 'requirement_parent_mismatch',
                                       '%s %s' % (base, requirement['id']),
                                       'the requirement id does not belong to its control'))
                if not (requirement['normalized_text'] or '').strip():
                    errors.append(_err('semantic', 'empty_requirement_text',
                                       '%s %s' % (base, requirement['id']), 'no text'))
            urls = {}
            if control['official_url']:
                if urls.get(control['official_url'], control['id']) != control['id']:
                    errors.append(_err('semantic', 'url_to_id_conflict', base,
                                       'two controls claim the same official URL'))
                urls[control['official_url']] = control['id']
    return errors


def meaning_errors():
    """The doc graphs and the meaning layer, gated on the same terms as the rest."""
    errors = []
    docs = c.read_json('graph/docs/index.json', {})
    for record in docs.get('documents') or []:
        where = record['slug']
        if record.get('rebuilds_byte_identical') is not True:
            errors.append(_err('semantic', 'document_not_reversible', where,
                               'the document does not claim a byte-identical rebuild'))
        for name in ('index.json', 'fmt.json', 'ids.json'):
            if not os.path.exists(c.path('%s/%s' % (record['graph_path'], name))):
                errors.append(_err('semantic', 'missing_decomposition', where,
                                   'no %s beside the document graph' % name))
        if not os.path.exists(c.path(record['path'])):
            errors.append(_err('traceability', 'missing_source_document', where, record['path']))
        if record.get('origin') == 'official_github_repository' and not record.get('commit_sha'):
            errors.append(_err('traceability', 'official_document_without_commit', where,
                               'an official source document names no commit'))

    meaning = c.read_json('graph/meaning/index.json', {})
    if not meaning:
        return errors
    grades = set(meaning.get('grades') or {})
    anchors = {a['id'] for a in meaning.get('anchors') or []}
    terms = {t['id'] for t in meaning.get('terms') or []}
    for edge in c.read_json('graph/meaning/edges.json', {}).get('edges') or []:
        where = '%s %s %s' % (edge['from'], edge['type'], edge['to'])
        if edge.get('grade') not in grades:
            errors.append(_err('semantic', 'ungraded_meaning_edge', where,
                               'every meaning edge must carry a declared grade'))
        if edge['type'] == 'candidate_crosswalk' and edge.get('grade') != 'proposed':
            errors.append(_err('semantic', 'candidate_not_marked_proposed', where,
                               'a candidate this build noticed is graded as something else'))
        if edge['to'].startswith('anchor:') and edge['to'] not in anchors:
            errors.append(_err('traceability', 'dangling_anchor', where, edge['to']))
        if edge['to'].startswith('term:') and edge['to'] not in terms:
            errors.append(_err('traceability', 'dangling_term', where, edge['to']))
    for control_id in meaning.get('controls') or {}:
        record = c.read_json('graph/meaning/controls/%s.json' % control_id, {})
        for entry in record.get('candidate_crosswalks') or []:
            if entry.get('review_status') != 'needs_review':
                errors.append(_err('semantic', 'candidate_not_needing_review',
                                   '%s %s' % (control_id, entry['clause']),
                                   'a proposal was not marked for review'))
    return errors


def inventory_notes():
    index = c.read_json('catalog/index.json')
    built = [e for e in sorted(index['releases'], key=lambda x: x['release_id'])
             if e['status'] != 'unbuilt']
    notes, previous = [], None
    for entry in built:
        document = c.read_json('catalog/releases/%s.json' % entry['release_id'])
        ids = {x['id'] for x in document['controls']}
        if previous is not None:
            notes.append({'release_id': entry['release_id'],
                          'added': sorted(ids - previous),
                          'removed': sorted(previous - ids),
                          'carried': len(ids & previous)})
        previous = ids
    return notes


def run():
    validator = jsonschema_lite.Validator(SCHEMA_DIR)
    manifest = c.read_json('evidence/source-manifest.json')
    observations = {o['id']: o for o in manifest['observations']}
    history = c.read_json('build/repo-history.json')
    commits = {x['sha'] for x in history['commits']}

    errors = (schema_errors(validator) + traceability_errors(observations, commits)
              + semantic_errors() + meaning_errors())
    reconciliation = c.read_json('reports/reconciliation-latest.json', {})
    index = c.read_json('catalog/index.json')
    report = {
        'report_version': '1.0.0',
        'generated_at': c.now_iso(),
        'generator_version': c.GENERATOR_VERSION,
        'catalog_schema_version': c.CATALOG_SCHEMA_VERSION,
        'current_release': index['current_release'],
        'error_count': len(errors),
        'counts_by_level': {level: sum(1 for e in errors if e['level'] == level)
                            for level in ('schema', 'traceability', 'semantic')},
        'documents': (c.read_json('graph/docs/index.json', {}) or {}).get('document_count', 0),
        'meaning_edges': (c.read_json('graph/meaning/index.json', {}) or {})
                         .get('counts', {}).get('total_edges', 0),
        'reconciliation_findings': reconciliation.get('finding_count', 0),
        'reconciliation_blocking': reconciliation.get('blocking_count', 0),
        'inventory': inventory_notes(),
        'observation_count': len(observations),
        'errors': errors,
        'passed': not errors and reconciliation.get('blocking_count', 0) == 0,
    }
    c.write_json('reports/validation-latest.json', report)

    for entry in index['releases']:
        if entry['status'] == 'unbuilt':
            continue
        document = c.read_json('catalog/releases/%s.json' % entry['release_id'])
        release_errors = [e for e in errors if e['where'].startswith(entry['release_id'])]
        document['validation']['schema_valid'] = not [
            e for e in release_errors if e['level'] == 'schema']
        document['validation']['source_traceability_valid'] = not [
            e for e in release_errors if e['level'] == 'traceability']
        if release_errors and document['release']['status'] == 'validated':
            document['release']['status'] = 'needs_review'
            entry['status'] = 'needs_review'
        # The content hash is stamped last, over the finished artefact, so it covers the
        # change events and the validation verdict rather than an earlier draft of them.
        document['provenance']['content_hash'] = None
        document['provenance']['content_hash'] = c.sha256_json(document)
        entry['content_hash'] = document['provenance']['content_hash']
        c.write_json('catalog/releases/%s.json' % entry['release_id'], document)
        if entry['release_id'] == index['current_release']:
            c.write_json('catalog/current.json', document)
    c.write_json('catalog/index.json', index)
    return report


if __name__ == '__main__':
    result = run()
    print('%s: %d errors (%s), %d reconciliation findings (%d blocking), %d observations' % (
        'PASS' if result['passed'] else 'FAIL', result['error_count'],
        ', '.join('%s %d' % kv for kv in result['counts_by_level'].items()),
        result['reconciliation_findings'], result['reconciliation_blocking'],
        result['observation_count']))
    for error in result['errors'][:15]:
        print('  ! [%s] %s — %s' % (error['level'], error['where'], error['detail']))
