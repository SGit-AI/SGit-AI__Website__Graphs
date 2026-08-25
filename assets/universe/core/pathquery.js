/* @module universe/core/pathquery
   Single responsibility: the path query, per brief 28 — the founder's answer
   made mechanical: the trail a reader walks IS a query, so this module runs
   one. A query is a sequence of steps; each step names the verb that was
   followed (as displayed, so an inverse reading resolves back to the stored
   direction through the verbs register) and constrains the node it lands on,
   either exactly (this node) or by family (any claim). Running it walks every
   matching path; projecting it asks which verbs could extend it.
   Pure: no DOM, no cytoscape. */

/** Cap on concurrently explored paths: a runaway wildcard stays a result,
    never a hang. */
export const MAX_PATHS = 500;

/**
 * Resolve displayed verbs to stored direction: a stored verb walks out, its
 * declared inverse walks in.
 * @param {Object<string, string>} verbs - stored verb -> declared inverse
 * @returns {Object<string, {stored: string, dir: 'out'|'in'}>}
 */
export function displayedVerbIndex(verbs) {
  const idx = {};
  Object.keys(verbs || {}).forEach((v) => {
    idx[v] = { stored: v, dir: 'out' };
    const inv = verbs[v];
    if (inv && inv !== v && !idx[inv]) idx[inv] = { stored: v, dir: 'in' };
  });
  return idx;
}

/** A trail (as the inspector records it) becomes a query: the first entry is
    the start constraint, every later entry a hop. Steps start exact; the
    board generalises them to family wildcards. */
export function trailToQuery(trail) {
  return (trail || []).map((h, i) => ({
    verb: i === 0 ? null : h.verb,
    id: h.exact === false ? null : (h.id || null),
    family: h.family || null,
    label: h.label || h.id || '',
  }));
}

/* verb -> source id -> target ids, over the semantic edges */
function outIndex(elements) {
  const out = {};
  elements.forEach((el) => {
    const d = el.data;
    if (!d.source || d.kind === 'align' || d.kind === 'schema') return;
    const v = d.kind === 'asserted' && d.verb ? d.verb : d.kind;
    const m = (out[v] = out[v] || {});
    (m[d.source] = m[d.source] || []).push(d.target);
  });
  return out;
}

/**
 * Run a query over element definitions.
 * @param {Array<object>} elements - cytoscape element definitions
 * @param {Object<string, string>} verbs - the verbs register (stored -> inverse)
 * @param {Array<{verb, id, family}>} steps - trailToQuery output
 * @param {string[]} [startIds] - restrict the start; default: every node
 * @returns {{paths: string[][], truncated: boolean}} node-id paths, one per match
 */
export function runPathQuery(elements, verbs, steps, startIds) {
  if (!steps || !steps.length) return { paths: [], truncated: false };
  const nodes = {};
  elements.forEach((el) => {
    const d = el.data;
    if (d.id && !d.source && d.family !== 'rail' && d.family !== 'schema') nodes[d.id] = d;
  });
  const out = outIndex(elements);
  const idx = displayedVerbIndex(verbs);
  const fits = (id, st) => !!nodes[id]
    && (st.id ? id === st.id : (st.family ? nodes[id].family === st.family : true));
  let truncated = false;
  let paths = Object.keys(nodes).filter((id) => fits(id, steps[0])
    && (!startIds || startIds.indexOf(id) !== -1)).map((id) => [id]);
  for (let i = 1; i < steps.length && paths.length; i++) {
    const st = steps[i];
    const r = idx[st.verb] || { stored: st.verb, dir: 'out' };
    const next = [];
    paths.forEach((p) => {
      const cur = p[p.length - 1];
      let hops = [];
      if (r.dir === 'out') hops = (out[r.stored] && out[r.stored][cur]) || [];
      else {
        const m = out[r.stored] || {};
        Object.keys(m).forEach((src) => { if (m[src].indexOf(cur) !== -1) hops.push(src); });
      }
      hops.forEach((nid) => {
        if (!fits(nid, st) || p.indexOf(nid) !== -1) return;
        if (next.length >= MAX_PATHS) { truncated = true; return; }
        next.push(p.concat(nid));
      });
    });
    paths = next;
  }
  return { paths, truncated };
}

/**
 * The verbs that could extend a path ending on this family — the projection
 * of possible paths forward the founder asked for.
 * @param {Array<object>} elements @param {Object<string,string>} verbs
 * @param {string} family - the family the path currently ends on
 * @returns {string[]} displayed verbs, sorted, out first then inverses
 */
export function nextVerbs(elements, verbs, family) {
  const fam = {};
  elements.forEach((el) => {
    const d = el.data;
    if (d.id && !d.source && d.family) fam[d.id] = d.family;
  });
  const outs = new Set(), ins = new Set();
  elements.forEach((el) => {
    const d = el.data;
    if (!d.source || d.kind === 'align' || d.kind === 'schema') return;
    const v = d.kind === 'asserted' && d.verb ? d.verb : d.kind;
    if (fam[d.source] === family) outs.add(v);
    if (fam[d.target] === family && verbs[v] && verbs[v] !== v) ins.add(verbs[v]);
  });
  return Array.from(outs).sort().concat(Array.from(ins).sort());
}
