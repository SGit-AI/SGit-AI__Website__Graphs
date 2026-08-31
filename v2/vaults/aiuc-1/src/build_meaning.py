"""Give the paragraphs and the words meaning, by connecting them — and say how much.

@module Following `thinking-in-graphs` on graphs.sgit.ai: meaning is not declared,
it is discovered by tracing edges, and confidence is proportional to connectivity.
So this module adds no properties to any control. It adds edges, in three grades
that are never mixed:

  structural   a section of the official markdown states a control; a paragraph is
               the wording of a numbered requirement. Read from the sources, exact.
  published    AIUC publishes a crosswalk from a control to an external clause. Its
               evidence is computed here — which distinctive words the two texts
               share, and which of the clause's words the control never reaches.
  proposed     a control and a clause AIUC has NOT crosswalked share distinctive
               vocabulary. This build's proposal, never AIUC's, never approved, and
               carried as a candidate for review rather than as a mapping.

The external clause is the anchor node: well-connected, maintained by someone else,
and carrying no authority here. Nothing below says a control IS an article.
"""
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common as c
import terms as T

CONTROL_HEADING = re.compile(r'^([A-Z]\d{3})\s*:\s*(.+)$')
ARTICLE = re.compile(r'^Article\s+(\d+)\b')
OFFICIAL_DOCS = ('aiuc1-controls', 'aiuc1-requirements')
CANDIDATE_FLOOR = 0.34          # a candidate must reach this much of a clause's vocabulary
CANDIDATE_TERMS = 3             # and share at least this many distinctive terms
CANDIDATES_PER_CONTROL = 6

# The EU AI Act is already an evidence layer in this estate: the Regulation Graph vault
# parses Regulation (EU) 2024/1689 from official Formex XML and hash-verifies it. An
# article anchor here points at that, and at nothing this build invented.
REGULATION_GRAPH = {
    'vault': 'sgit.ai Regulation Graph',
    'read_key': 'sgit_rk1_c004daae386e8d17fa648884acc527018bd4ea1116ad673fb2f1b068011695c9:73heuprz',
    'note': 'the same article, parsed from official Formex XML and hash-verified, is a '
            'node in the Regulation Graph vault; this anchor names it and asserts '
            'nothing about it',
    'published_at': 'https://graphs.sgit.ai/v1/vaults/regulation-graph/index.html',
}


def load_docs():
    """Blocks and sections of the official markdown, and which control each is under."""
    index = c.read_json('graph/docs/index.json')
    docs = {}
    for record in index['documents']:
        if record['slug'] not in OFFICIAL_DOCS:
            continue
        slug = record['slug']
        doc = c.read_json('%s/index.json' % record['graph_path'])
        sections = {s['id']: s for s in doc['sections']}
        control_of, titles = {}, {}
        for section in doc['sections']:
            match = CONTROL_HEADING.match(section['title'])
            node = section
            while node and not match:
                node = sections.get(node.get('parent'))
                match = CONTROL_HEADING.match(node['title']) if node else None
            if match:
                control_of[section['id']] = match.group(1)
                titles[match.group(1)] = match.group(2)
        blocks = []
        for section in doc['sections']:
            shard = section.get('shard')
            if not shard:
                continue
            payload = c.read_json('%s/%s' % (record['graph_path'], shard), {})
            for block in payload.get('blocks') or []:
                blocks.append({
                    'doc': slug, 'section': section['id'], 'section_uid': section.get('uid'),
                    'id': block['id'], 'uid': block.get('uid'), 'kind': block['kind'],
                    'text': block.get('text') or '',
                    'control_id': control_of.get(section['id']),
                })
        docs[slug] = {'record': record, 'sections': sections,
                      'control_of': control_of, 'blocks': blocks}
    return docs


def clause_key(crosswalk):
    return '%s::%s' % (crosswalk['framework'], crosswalk['reference'])


def clause_text(crosswalk):
    return '%s. %s' % (crosswalk['reference'] or '', crosswalk['normalized_text'] or '')


def control_text(control):
    parts = [control['title'], control['summary'].get('normalized_value') or '']
    parts += [r['normalized_text'] or '' for r in control['requirements']]
    parts += [(control.get('official_changelog_text') or {}).get('statement') or '']
    return ' '.join(p for p in parts if p)


def anchor_for(crosswalk):
    """An external clause as an anchor node: what it is called, where it lives."""
    anchor = {
        'id': 'anchor:%s:%s' % (c.slugify(crosswalk['framework']),
                                c.slugify(crosswalk['reference'])),
        'framework': crosswalk['framework'],
        'reference': crosswalk['reference'],
        'text': crosswalk['normalized_text'],
        'authority': 'external; maintained by the framework, not by AIUC and not here',
        'named_by': 'the crosswalk AIUC publishes on the control page',
    }
    article = ARTICLE.match(crosswalk['reference'] or '')
    if crosswalk['framework'] == 'EU AI Act' and article:
        anchor['article_number'] = int(article.group(1))
        anchor['also_in'] = REGULATION_GRAPH
    return anchor


def structural_edges(docs, controls):
    """Section states control; paragraph is the wording of a requirement. Exact."""
    edges, wording = [], 0
    bullet_index = {}
    for control in controls.values():
        for requirement in control['requirements']:
            for bullet in requirement['source_bullets']:
                bullet_index.setdefault(T.terms_of(bullet) and c.normalize_text(bullet),
                                        []).append((control['id'], requirement['id']))
    for slug, doc in docs.items():
        for section_id, control_id in doc['control_of'].items():
            if section_id == 'doc:%s' % slug or control_id not in controls:
                continue
            edges.append({'from': 'docsec:%s:%s' % (slug, section_id), 'type': 'states',
                          'to': 'control:%s' % control_id, 'grade': 'structural',
                          'basis': 'the section heading names the control'})
        for block in doc['blocks']:
            if not block['control_id']:
                continue
            edges.append({'from': 'docblk:%s:%s' % (slug, block['id']), 'type': 'in_section',
                          'to': 'docsec:%s:%s' % (slug, block['section']),
                          'grade': 'structural', 'basis': 'the block sits under the heading'})
            hits = bullet_index.get(c.normalize_text(block['text']), [])
            for control_id, requirement_id in hits:
                wording += 1
                edges.append({'from': 'docblk:%s:%s' % (slug, block['id']),
                              'type': 'wording_of', 'to': 'requirement:%s' % requirement_id,
                              'grade': 'structural',
                              'basis': 'the paragraph is character-for-character the '
                                       'requirement text the website publishes'})
    return edges, wording


def build():
    docs = load_docs()
    current = c.read_json('catalog/current.json')
    controls = {x['id']: x for x in current['controls']}

    clauses, published = {}, {}
    for control in controls.values():
        for crosswalk in control['crosswalks']:
            key = clause_key(crosswalk)
            clauses[key] = crosswalk
            published.setdefault(control['id'], set()).add(key)

    corpus = T.Corpus([clause_text(x) for x in clauses.values()]
                      + [control_text(x) for x in controls.values()])

    anchors = {clause_key(x): anchor_for(x) for x in clauses.values()}
    edges, wording_count = structural_edges(docs, controls)
    term_nodes, per_control, candidates_total = {}, {}, 0

    for control_id, control in sorted(controls.items()):
        text = control_text(control)
        mine = published.get(control_id, set())
        evidence, candidates = [], []
        for key, crosswalk in clauses.items():
            result = T.compare(text, clause_text(crosswalk), corpus)
            record = {
                'clause': key,
                'anchor': anchors[key]['id'],
                'framework': crosswalk['framework'],
                'reference': crosswalk['reference'],
                'shared_terms': result['shared'],
                'clause_terms_not_reached': result['only_right'],
                'score': result['score'],
                'shared_count': result['shared_count'],
            }
            if key in mine:
                record.update({
                    'grade': 'published',
                    'relationship': 'AIUC publishes this crosswalk; the vocabulary below '
                                    'is this build\'s evidence for it, not the mapping itself',
                    'review_status': 'approved_as_a_reading_of_published_text',
                })
                evidence.append(record)
            elif (result['score'] >= CANDIDATE_FLOOR
                  and result['shared_count'] >= CANDIDATE_TERMS):
                record.update({
                    'grade': 'proposed',
                    'relationship': 'AIUC does NOT publish this crosswalk. This build '
                                    'observed shared distinctive vocabulary and proposes '
                                    'it as a candidate for review. It is not a mapping.',
                    'review_status': 'needs_review',
                })
                candidates.append(record)
        candidates.sort(key=lambda r: -r['score'])
        candidates = candidates[:CANDIDATES_PER_CONTROL]
        candidates_total += len(candidates)

        for record in evidence + candidates:
            for term in record['shared_terms']:
                node = term_nodes.setdefault('term:%s' % term['stem'], {
                    'id': 'term:%s' % term['stem'], 'stem': term['stem'],
                    'rarity': term['rarity'], 'as_written': set(), 'bridges': 0})
                node['as_written'].update(term['as_written'])
                node['bridges'] += 1
                edges.append({'from': 'control:%s' % control_id, 'type': 'uses_term',
                              'to': node['id'], 'grade': 'structural',
                              'basis': 'the term occurs in the control text'})
                edges.append({'from': anchors[record['clause']]['id'], 'type': 'uses_term',
                              'to': node['id'], 'grade': 'structural',
                              'basis': 'the term occurs in the clause text'})
            edges.append({
                'from': 'control:%s' % control_id,
                'type': 'evidenced_crosswalk' if record['grade'] == 'published'
                        else 'candidate_crosswalk',
                'to': anchors[record['clause']]['id'], 'grade': record['grade'],
                'score': record['score'], 'shared_count': record['shared_count'],
                'basis': record['relationship']})

        reached = {r['clause'] for r in evidence if r['shared_count'] > 0}
        per_control[control_id] = {
            'control_id': control_id,
            'title': control['title'],
            'published_crosswalks': len(mine),
            'published_with_shared_vocabulary': len(reached),
            'published_without_shared_vocabulary': sorted(mine - reached),
            'candidates': len(candidates),
            'evidence': sorted(evidence, key=lambda r: -r['score']),
            'candidate_crosswalks': candidates,
        }
        c.write_json('graph/meaning/controls/%s.json' % control_id, per_control[control_id])

    # a paragraph's own vocabulary: the route from a block to a framework clause
    block_terms = 0
    for slug, doc in docs.items():
        for block in doc['blocks']:
            for stem, written in T.terms_of(block['text']).items():
                node = term_nodes.get('term:%s' % stem)
                if not node:
                    continue
                block_terms += 1
                edges.append({'from': 'docblk:%s:%s' % (slug, block['id']),
                              'type': 'uses_term', 'to': node['id'], 'grade': 'structural',
                              'basis': 'the term occurs in this paragraph'})

    for node in term_nodes.values():
        node['as_written'] = sorted(node['as_written'])

    payload = {
        'meaning_version': '1.0.0',
        'generated_at': c.now_iso(),
        'generator_version': c.GENERATOR_VERSION,
        'method': 'thinking-in-graphs, as published at graphs.sgit.ai: meaning is '
                  'discovered by tracing edges, never declared on a node',
        'grades': {
            'structural': 'read from the sources, exact, no judgement',
            'published': 'AIUC publishes the crosswalk; the shared vocabulary is this '
                         'build\'s evidence for it and the unreached terms are the gap',
            'proposed': 'this build\'s candidate, needing review, never AIUC\'s mapping',
        },
        'corpus': {'clauses': len(clauses), 'controls': len(controls),
                   'distinct_terms_in_corpus': len(corpus.document_frequency)},
        'counts': {
            'anchors': len(anchors),
            'terms_that_bridge': len(term_nodes),
            'structural_edges': sum(1 for e in edges if e['grade'] == 'structural'),
            'published_crosswalk_edges': sum(1 for e in edges if e['grade'] == 'published'),
            'proposed_candidate_edges': candidates_total,
            'paragraph_term_edges': block_terms,
            'paragraphs_that_are_requirement_wording': wording_count,
            'total_edges': len(edges),
        },
        'anchors': [anchors[k] for k in sorted(anchors)],
        'terms': sorted(term_nodes.values(), key=lambda t: (-t['bridges'], t['stem'])),
        'controls': {k: {m: v[m] for m in ('published_crosswalks',
                                           'published_with_shared_vocabulary',
                                           'published_without_shared_vocabulary',
                                           'candidates')}
                     for k, v in per_control.items()},
    }
    c.write_json('graph/meaning/index.json', payload)
    c.write_json('graph/meaning/edges.json',
                 {'edge_count': len(edges), 'edges': edges})
    return payload


if __name__ == '__main__':
    result = build()
    print('meaning: %d anchors, %d bridging terms, %d edges' % (
        result['counts']['anchors'], result['counts']['terms_that_bridge'],
        result['counts']['total_edges']))
    for key, value in result['counts'].items():
        print('  %-46s %6d' % (key, value))
