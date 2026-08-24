/* @module universe/core/nodedoc
   Single responsibility: compose the document of one node, pure over the
   extraction and the cross-references. Nothing here writes prose: every item
   in the model is a verbatim quote or a projection of the anchored data, so
   the page built from it can only say what the source verifiably says.
   Pure: no DOM, no IO. */
import { derivedConceptEdges } from './packs.js';
import { neighbourhoodIds, graphStats } from './explore.js';

/** The extraction as graph elements, the same construction the build makes. */
export function extractionElements(ex) {
  const els = [];
  ex.nodes.forEach((n) => {
    els.push({ data: { id: n.id, label: n.label, family: n.family } });
    (n.about || []).forEach((a, i) => {
      els.push({ data: { id: 'ab:' + n.id + ':' + i, source: n.id, target: a, kind: 'about' } });
    });
    (n.demonstrates || []).forEach((a, i) => {
      els.push({ data: { id: 'dm:' + n.id + ':' + i, source: n.id, target: a, kind: 'demonstrates' } });
    });
  });
  ex.edges.forEach((e, i) => {
    els.push({ data: { id: 'as:' + i, source: e.from, target: e.to, kind: 'asserted', verb: e.verb } });
  });
  return els;
}

/** Every node ranked by its incident links: the richness order the memo asks
    to explore ("how rich some concepts are"). */
export function nodeRichness(ex) {
  const counts = {};
  extractionElements(ex).forEach((e) => {
    const d = e.data;
    if (!d.source) return;
    counts[d.source] = (counts[d.source] || 0) + 1;
    counts[d.target] = (counts[d.target] || 0) + 1;
  });
  return ex.nodes.map((n) => ({ id: n.id, label: n.label, family: n.family, links: counts[n.id] || 0 }))
    .sort((a, b) => b.links - a.links || (a.label < b.label ? -1 : 1));
}

/**
 * The document of one node: everything the data verifiably holds about it.
 * @param {object} ex - the extraction
 * @param {object} refs - the crossrefs file ({refs: [...]})
 * @param {string} id - the chosen node
 * @returns {object|null} the composed model, or null for an unknown id
 */
export function composeNodeDoc(ex, refs, id) {
  const node = ex.nodes.find((n) => n.id === id);
  if (!node) return null;
  const byId = {};
  ex.nodes.forEach((n) => { byId[n.id] = n; });
  const label = (nid) => (byId[nid] ? byId[nid].label : nid);
  const els = extractionElements(ex);
  const data = els.map((e) => e.data);
  const m = {
    node, doc: ex.doc,
    claimsAbout: ex.nodes.filter((n) => (n.about || []).indexOf(id) !== -1),
    isAbout: (node.about || []).map((t) => byId[t]).filter(Boolean),
    demonstratedBy: ex.nodes.filter((n) => (n.demonstrates || []).indexOf(id) !== -1),
    demonstrates: (node.demonstrates || []).map((t) => byId[t]).filter(Boolean),
    asserts: ex.edges.filter((e) => e.from === id).map((e) => ({ verb: e.verb, other: label(e.to), anchor: e.anchor })),
    assertedBy: ex.edges.filter((e) => e.to === id).map((e) => ({ verb: e.verb, other: label(e.from), anchor: e.anchor })),
    aliases: ex.aliases.filter((a) => a.a === id || a.b === id),
    nearButNot: ex.near_but_not.filter((n) => n.this === id),
    derived: derivedConceptEdges(els)
      .filter((e) => e.data.source === id || e.data.target === id)
      .map((e) => ({ other: label(e.data.source === id ? e.data.target : e.data.source), count: e.data.count }))
      .sort((a, b) => b.count - a.count),
    crossrefs: ((refs && refs.refs) || []).filter((r) => (r.what || []).indexOf(id) !== -1),
    degrees: [],
  };
  let prev = new Set([id]);
  for (let d = 1; d <= 3; d++) {
    const keep = neighbourhoodIds(data, id, d);
    const added = data.filter((x) => keep.has(x.id) && !prev.has(x.id));
    if (!added.length) break;
    m.degrees.push({ degree: d, added: graphStats(added) });
    prev = keep;
  }
  return m;
}
