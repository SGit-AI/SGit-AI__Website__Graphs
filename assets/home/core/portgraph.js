'use strict';
/**
 * @module home/core/portgraph
 * The front door's demo, as a pure state machine: which edges exist, which may be added
 * next, and exactly what the graph can say once they do. No DOM, no fetch, no drawing —
 * the component owns all of that, and this owns the argument the demo is making.
 */

/** Edges whose prerequisites are all present. You cannot constrain a type a node does
 *  not have yet, and the demo would be teaching the wrong thing if you could. */
export function available(edges, active) {
  const on = new Set(active);
  return edges.filter((e) => !on.has(e.id) && e.needs.every((n) => on.has(n)));
}

/** Edges that would be left dangling if `id` were removed, `id` included. */
function dependents(edges, id) {
  const doomed = new Set([id]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const e of edges) {
      if (doomed.has(e.id)) continue;
      if (e.needs.some((n) => doomed.has(n))) { doomed.add(e.id); grew = true; }
    }
  }
  return doomed;
}

/** Add or remove an edge, keeping the graph connected. Removing an edge removes
 *  everything that hung off it: a graph with a dangling constraint is not a state the
 *  document's example can be in. Returns a fresh array in the edges' own order. */
export function toggle(edges, active, id) {
  const on = new Set(active);
  if (on.has(id)) {
    const doomed = dependents(edges, id);
    for (const d of doomed) on.delete(d);
  } else {
    const byId = new Map(edges.map((e) => [e.id, e]));
    const add = (eid) => {
      if (on.has(eid)) return;
      for (const n of (byId.get(eid) || { needs: [] }).needs) add(n);
      on.add(eid);
    };
    add(id);
  }
  return edges.filter((e) => on.has(e.id)).map((e) => e.id);
}

/** Every edge, in order, added. The finished Scenario A from the document. */
export function all(edges) {
  return edges.map((e) => e.id);
}

/** Node ids the reader can see: the field node always, plus both ends of every edge
 *  that exists. A node nothing connects to is not drawn, which is the claim. */
export function visibleNodes(nodes, edges, active) {
  const on = new Set(active);
  const seen = new Set([nodes[0].id]);
  for (const e of edges) {
    if (!on.has(e.id)) continue;
    seen.add(e.from);
    seen.add(e.to);
  }
  return nodes.filter((n) => seen.has(n.id)).map((n) => n.id);
}

/** What the graph can state, given the edges that exist.
 *
 *  With no edges it can only state the three things the document allows an unconnected
 *  node: the field exists, the name hints, the graph cannot confirm. Each edge added
 *  contributes the sentence the document itself draws from it. A paired edge (the two
 *  bounds of a range) contributes once, and only when both halves are present — half a
 *  range is not "between 0 and 65535".
 */
export function claims(demo, active) {
  const on = new Set(active);
  if (!on.size) return demo.bare.map((b) => ({ says: b.says, quote: b.quote, edge: null }));
  const out = [];
  const said = new Set();
  for (const e of demo.edges) {
    if (!on.has(e.id)) continue;
    if (e.pairs && !on.has(e.pairs)) continue;
    if (said.has(e.says)) continue;
    said.add(e.says);
    out.push({ says: e.says, quote: e.quote, edge: e.id });
  }
  return out;
}

/** How far a claim about this node can be traced. The document's own spectrum: a node
 *  with no edges supports a guess, a fully connected one supports a checkable statement. */
export function confidence(demo, active) {
  const n = active.length;
  if (!n) return { key: 'none', label: 'a guess from the name' };
  if (n < demo.edges.length) return { key: 'partial', label: 'partly traceable' };
  return { key: 'full', label: 'every claim traceable' };
}

/** The demo's one number that never moves, and the one that does. The document's point
 *  in two counters: the value is identical in both scenarios; the edges are not. */
export function tally(demo, active) {
  return {
    value: demo.nodes[0].sub.replace(/^value:\s*/, ''),
    edges: active.length,
    edgesMax: demo.edges.length,
    claims: claims(demo, active).length,
  };
}
