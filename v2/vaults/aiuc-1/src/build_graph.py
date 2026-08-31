"""Decompose the catalog into one graph: nodes, edges, and what each edge means.

@module A control's properties are just words; what it *is* shows in the edges
traceable from it — the domain it belongs to, the requirements under it, the
evidence each requirement expects, the external framework clauses it is
crosswalked to, the release it appeared in, the commit that carries it, and the
page it was read from. This module builds that graph from the release artefacts
and writes graph/nodes.json, graph/edges.json and graph/index.json.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common as c

EDGE_KINDS = {
    'has_domain': 'the standard is organised into this domain',
    'has_control': 'the domain contains this control',
    'has_requirement': 'the control is met through this numbered requirement',
    'expects_evidence_in': 'the requirement is evidenced by artefacts of this category',
    'typically_found_in': 'the evidence for this requirement typically lives here',
    'applies_to_capability': 'the item applies to systems with this capability',
    'tagged': 'the control carries this published keyword',
    'maps_to': 'AIUC publishes a crosswalk from this control to that clause',
    'in_framework': 'the crosswalked clause belongs to this external framework',
    'includes': 'this release contains this control',
    'derived_from': 'this release was built from this repository commit',
    'evidenced_by': 'this record was read from this captured source observation',
    'affects': 'this change event is about this control',
    'in_release': 'this change event belongs to this release',
    'names': 'this official changelog row names this control',
    'superseded_by': 'this control was merged into that control',
    'follows': 'this release follows that one',
}


class Graph:
    def __init__(self):
        self.nodes, self.edges, self.seen = {}, [], set()

    def node(self, node_id, kind, node_label, **props):
        label = node_label
        if node_id not in self.nodes:
            self.nodes[node_id] = {'id': node_id, 'type': kind, 'label': label, **props}
        else:
            self.nodes[node_id].update({k: v for k, v in props.items() if v is not None})
        return node_id

    def edge(self, source, kind, target, **props):
        key = (source, kind, target)
        if key in self.seen or source not in self.nodes or target not in self.nodes:
            return
        self.seen.add(key)
        self.edges.append({'from': source, 'type': kind, 'to': target, **props})


def build():
    index = c.read_json('catalog/index.json')
    current = c.read_json('catalog/current.json')
    manifest = c.read_json('evidence/source-manifest.json')
    observations = {o['id']: o for o in manifest['observations']}
    graph = Graph()

    standard = graph.node('standard:AIUC-1', 'standard', 'AIUC-1',
                          official_website=c.SITE + '/', disclaimer=c.DISCLAIMER)

    previous_release = None
    for entry in sorted(index['releases'], key=lambda x: x['release_id']):
        release = graph.node('release:%s' % entry['release_id'], 'release',
                             entry['release_id'], status=entry['status'],
                             published_at=entry['published_at'],
                             control_count=entry['control_count'],
                             official_changelog_url=entry.get('official_changelog_url'))
        if previous_release:
            graph.edge(release, 'follows', previous_release)
        previous_release = release
        if entry.get('source_commit_sha'):
            commit = graph.node('commit:%s' % entry['source_commit_sha'], 'commit',
                                entry['source_commit_sha'][:7],
                                repository=c.REPO_SLUG,
                                url='%s/commit/%s' % (c.REPO_URL, entry['source_commit_sha']),
                                match_confidence=entry.get('source_commit_confidence'))
            graph.edge(release, 'derived_from', commit)
        if entry['status'] == 'unbuilt':
            continue
        document = c.read_json('catalog/releases/%s.json' % entry['release_id'])
        for control in document['controls']:
            graph.node('control:%s' % control['id'], 'control', control['id'],
                       title=control['title'])
            graph.edge(release, 'includes', 'control:%s' % control['id'])
        for event in document.get('change_events') or []:
            node = graph.node('change:%s' % event['id'], 'change_event', event['event_type'],
                              summary=event['summary'],
                              confidence=event['classification']['confidence'])
            graph.edge(node, 'in_release', release)
            graph.edge(node, 'affects', 'control:%s' % event['control_id'])
        official = c.read_json('changes/%s.json' % entry['release_id'], {})
        for record in official.get('official_change_records') or []:
            node = graph.node('official:%s' % record['id'], 'official_change',
                              record['category'] or 'change',
                              subject=record['subject'], notes=record['notes'])
            graph.edge(node, 'in_release', release)
            for control_id in record['control_ids']:
                graph.edge(node, 'names', 'control:%s' % control_id)

    current_release = 'release:%s' % current['release']['release_id']
    for domain in current['domains']:
        node = graph.node('domain:%s' % domain['id'], 'domain', domain['name'],
                          description=domain['description'], url=domain['official_url'],
                          control_count=len(domain['control_ids']))
        graph.edge(standard, 'has_domain', node)
        for ref in domain['source_refs']:
            if ref in observations:
                graph.edge(node, 'evidenced_by', 'source:%s' % ref)

    for observation in manifest['observations']:
        graph.node('source:%s' % observation['id'], 'source_observation',
                   observation['url'].replace(c.SITE, '') or '/',
                   url=observation['url'], retrieved_at=observation['retrieved_at'],
                   raw_sha256=observation['content']['raw_sha256'],
                   snapshot=observation['content']['raw_snapshot_path'])

    for control in current['controls']:
        node = graph.node('control:%s' % control['id'], 'control', control['id'],
                          title=control['title'], summary=control['summary']['value'],
                          url=control['official_url'],
                          applicability=control['applicability']['value'],
                          frequency=control['frequency']['value'],
                          control_type=control['control_type']['value'],
                          canonical_status=control['canonical_status'],
                          requirement_count=len(control['requirements']),
                          crosswalk_count=len(control['crosswalks']))
        graph.edge('domain:%s' % control['domain']['id'], 'has_control', node)
        graph.edge(current_release, 'includes', node)
        for ref in control['provenance']['source_refs']:
            graph.edge(node, 'evidenced_by', 'source:%s' % ref)
        for successor in control['relationships']['superseded_by']:
            graph.edge(node, 'superseded_by', 'control:%s' % successor)
        for keyword in control['keywords']:
            graph.edge(node, 'tagged', graph.node('keyword:%s' % c.slugify(keyword),
                                                  'keyword', keyword))
        for capability in control['capabilities']:
            graph.edge(node, 'applies_to_capability',
                       graph.node('capability:%s' % c.slugify(capability),
                                  'capability', capability))
        for crosswalk in control['crosswalks']:
            framework = graph.node('framework:%s' % crosswalk['framework_slug'], 'framework',
                                   crosswalk['framework'])
            entry = graph.node('crosswalk:%s:%s' % (crosswalk['framework_slug'],
                                                    c.slugify(crosswalk['reference'])),
                               'crosswalk_entry', crosswalk['reference'],
                               framework=crosswalk['framework'], text=crosswalk['text'])
            graph.edge(node, 'maps_to', entry)
            graph.edge(entry, 'in_framework', framework)
        for requirement in control['requirements']:
            req = graph.node('requirement:%s' % requirement['id'], 'requirement',
                             requirement['id'], sub_label=requirement['label'],
                             application=requirement['application']['value'],
                             text=requirement['normalized_text'],
                             typical_evidence=requirement['evidence_expectation'][
                                 'normalized_typical_evidence'])
            graph.edge(node, 'has_requirement', req)
            expectation = requirement['evidence_expectation']
            if expectation['category']['value']:
                graph.edge(req, 'expects_evidence_in',
                           graph.node('evidence_category:%s' % expectation['category']['value'],
                                      'evidence_category', expectation['category']['raw_text']))
            for location in expectation['typical_locations']:
                graph.edge(req, 'typically_found_in',
                           graph.node('evidence_location:%s' % c.slugify(location),
                                      'evidence_location', location))
            for capability in expectation['capabilities']:
                graph.edge(req, 'applies_to_capability',
                           graph.node('capability:%s' % c.slugify(capability),
                                      'capability', capability))

    counts = {}
    for node in graph.nodes.values():
        counts[node['type']] = counts.get(node['type'], 0) + 1
    edge_counts = {}
    for edge in graph.edges:
        edge_counts[edge['type']] = edge_counts.get(edge['type'], 0) + 1

    nodes = [graph.nodes[k] for k in sorted(graph.nodes)]
    edges = sorted(graph.edges, key=lambda e: (e['from'], e['type'], e['to']))
    c.write_json('graph/nodes.json', {'node_count': len(nodes), 'nodes': nodes})
    c.write_json('graph/edges.json', {'edge_count': len(edges), 'edges': edges})
    c.write_json('graph/index.json', {
        'graph_id': 'aiuc-1-derived-graph',
        'generated_at': c.now_iso(),
        'generator_version': c.GENERATOR_VERSION,
        'current_release': current['release']['release_id'],
        'disclaimer': c.DISCLAIMER,
        'node_count': len(nodes),
        'edge_count': len(edges),
        'nodes_by_type': dict(sorted(counts.items())),
        'edges_by_type': dict(sorted(edge_counts.items())),
        'edge_meanings': EDGE_KINDS,
        'content_hash': c.sha256_json([nodes, edges]),
    })
    return len(nodes), len(edges), counts, edge_counts


if __name__ == '__main__':
    node_count, edge_count, by_node, by_edge = build()
    print('%d nodes, %d edges' % (node_count, edge_count))
    for kind, count in sorted(by_node.items()):
        print('  node %-20s %5d' % (kind, count))
    for kind, count in sorted(by_edge.items()):
        print('  edge %-22s %5d' % (kind, count))
