/* @module universe/core/explore
   Single responsibility: the explore-from-a-selection logic, pure over plain
   element data. The focused view keeps the selected node plus its N-degree
   neighbourhood; the stats describe what a view holds and what the next hop
   would add, which is how a reader chooses a path before paying for it.
   Pure: no DOM, no cytoscape. */

/**
 * The ids kept by an N-degree walk from one node, over undirected edges.
 * Edges between kept nodes are kept; nothing outside `elements` is invented.
 * @param {Array<{id, source, target}>} elements - visible element data objects
 * @param {string} startId - the selected node
 * @param {number} degrees - hops to grow; 0 keeps just the node; Infinity = all
 * @returns {Set<string>} the ids (nodes and edges) to keep
 */
export function neighbourhoodIds(elements, startId, degrees) {
  const adj = {};
  elements.forEach((d) => {
    if (!d.source) return;
    (adj[d.source] = adj[d.source] || []).push({ e: d.id, n: d.target });
    (adj[d.target] = adj[d.target] || []).push({ e: d.id, n: d.source });
  });
  const keep = new Set([startId]);
  let frontier = [startId];
  for (let i = 0; i < degrees && frontier.length; i++) {
    const next = [];
    frontier.forEach((nid) => (adj[nid] || []).forEach((step) => {
      keep.add(step.e);
      if (!keep.has(step.n)) { keep.add(step.n); next.push(step.n); }
    }));
    frontier = next;
  }
  /* closing sweep: an edge between two kept nodes is kept even when the walk
     stopped before traversing it, or the view would show a false gap */
  elements.forEach((d) => {
    if (d.source && keep.has(d.source) && keep.has(d.target)) keep.add(d.id);
  });
  return keep;
}

/**
 * The next explore degree from a stepper action.
 * @param {number|'max'} cur - the current degree
 * @param {'up'|'down'|'max'} dir - the action
 * @returns {number|'max'} 'max' toggles; leaving it lands back on 1
 */
export function nextDegree(cur, dir) {
  if (dir === 'max') return cur === 'max' ? 1 : 'max';
  if (cur === 'max') return 1;
  return dir === 'up' ? cur + 1 : Math.max(0, cur - 1);
}

/**
 * Count what a set of elements holds, node families and edge kinds apart.
 * @param {Array<{id, source, family, kind}>} elements - element data objects
 * @returns {{nodes: Object<string, number>, edges: Object<string, number>}}
 */
export function graphStats(elements) {
  const nodes = {}, edges = {};
  elements.forEach((d) => {
    if (d.source) edges[d.kind || 'edge'] = (edges[d.kind || 'edge'] || 0) + 1;
    else nodes[d.family || 'node'] = (nodes[d.family || 'node'] || 0) + 1;
  });
  return { nodes, edges };
}

/**
 * One readable line from the counts.
 * @param {{nodes: object, edges: object}} stats
 * @returns {string} e.g. "12 concept · 3 section — edges: 9 about · 2 asserted"
 */
export function statsText(stats) {
  const part = (m) => Object.keys(m).sort().map((k) => m[k] + ' ' + k).join(' · ');
  const n = part(stats.nodes), e = part(stats.edges);
  if (!n && !e) return 'nothing visible';
  return (n || 'no nodes') + (e ? ' — edges: ' + e : '');
}
