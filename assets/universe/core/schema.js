/* @module universe/core/schema
   Single responsibility: the schema of a local graph, per brief 26 — every
   node type and every edge type that connects them, aggregated with counts.
   The schema view is how the founder judges "how good we are and what
   refactors we need": a family with no typed relations, or a relation with
   no declared direction, is visible here before it is a problem anywhere.
   Pure: no DOM, no cytoscape. */

/**
 * Aggregate elements into their schema: one node per family (with the member
 * count) and one edge per (source family, kind or verb, target family), with
 * the occurrence count. Edge direction is preserved — the schema is where a
 * relation that runs both ways shows up as two arrows. When the verbs
 * register is given, each edge label carries the declared inverse too
 * (verb ⇄ inverse), so both directions are reviewable at once (brief 26:
 * one direction stored, the reverse always derivable).
 * @param {Array<object>} elements - cytoscape element definitions
 * @param {Object<string, string>} [inverses] - verb or kind -> declared inverse
 * @returns {Array<object>} schema nodes (family "schema") and edges
 */
export function schemaElements(elements, inverses) {
  const familyOf = {};
  const nodeCounts = {};
  elements.forEach((el) => {
    const d = el.data;
    /* the rails and their ties are layout infrastructure, not semantics */
    if (d.id && !d.source && d.family && d.family !== 'rail' && d.family !== 'schema') {
      familyOf[d.id] = d.family;
      nodeCounts[d.family] = (nodeCounts[d.family] || 0) + 1;
    }
  });
  const rels = new Map();
  elements.forEach((el) => {
    const d = el.data;
    if (!d.source || d.kind === 'align' || d.kind === 'schema') return;
    const from = familyOf[d.source], to = familyOf[d.target];
    if (!from || !to) return;
    const verb = d.kind === 'asserted' && d.verb ? d.verb : (d.kind || 'edge');
    const key = from + ' ' + verb + ' ' + to;
    rels.set(key, (rels.get(key) || 0) + 1);
  });
  const els = Object.keys(nodeCounts).sort().map((fam) => ({
    data: { id: 'st:' + fam, label: fam + ' (' + nodeCounts[fam] + ')',
      family: 'schema', typeOf: fam, count: nodeCounts[fam] } }));
  Array.from(rels.keys()).sort().forEach((key, i) => {
    const [from, verb, to] = key.split(' ');
    const inv = inverses && inverses[verb] && inverses[verb] !== verb
      ? ' ⇄ ' + inverses[verb] : '';
    els.push({ data: { id: 'se:' + i, source: 'st:' + from, target: 'st:' + to,
      kind: 'schema', verb, inverse: (inverses && inverses[verb]) || null,
      label: verb + inv + ' ×' + rels.get(key), count: rels.get(key) } });
  });
  return els;
}
