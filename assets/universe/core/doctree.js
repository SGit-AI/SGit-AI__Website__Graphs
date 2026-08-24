/* @module universe/core/doctree
   Single responsibility: build the document-tree graph elements (title -> parts
   -> sections -> extracted nodes) from the taxonomy and the anchors, and compute
   the heading chain for the location trail. Pure: no DOM, no cytoscape. */

export const DOC_ROOT_ID = 'sec:__doc';

/**
 * The document's structure as graph elements.
 * @param {string} title - the document title (the H1)
 * @param {Array<{title: string, level: number}>} taxonomy - headings in order; [0] is the H1
 * @param {Array<{aid: string, section: string|undefined}>} anchors
 * @param {function(string): boolean} isGraphNode - whether an aid exists as a graph node
 * @returns {Array<object>} cytoscape element definitions (nodes + containment edges)
 */
export function docTreeElements(title, taxonomy, anchors, isGraphNode) {
  const els = [{ data: { id: DOC_ROOT_ID, label: title, family: 'docroot' } }];
  const stack = [];   /* [level, id] of open headings */
  (taxonomy || []).forEach((t, i) => {
    if (i === 0) return;                       /* the H1 is the root itself */
    const id = 'sec:' + t.title;
    while (stack.length && stack[stack.length - 1][0] >= t.level) stack.pop();
    const parent = stack.length ? stack[stack.length - 1][1] : DOC_ROOT_ID;
    els.push({ data: { id, label: t.title, family: 'section' } });
    els.push({ data: { id: 'ce:' + i, source: parent, target: id, kind: 'contains' } });
    stack.push([t.level, id]);
  });
  anchors.forEach((a, i) => {
    if (!a.section || !isGraphNode(a.aid)) return;
    els.push({ data: { id: 'ca:' + i, source: 'sec:' + a.section, target: a.aid, kind: 'contains' } });
  });
  return els;
}

/**
 * The upward heading chain for a position: the current heading and each parent
 * level above it, in reading order.
 * @param {Array<{level: number}>} heads - headings in document order
 * @param {number|null} currentIdx - index of the heading at/above the position, or null
 * @returns {number[]} indices into heads, outermost first; [] when before the first heading
 */
export function headingChain(heads, currentIdx) {
  if (currentIdx === null || currentIdx === undefined || currentIdx < 0) return [];
  const chain = [currentIdx];
  let need = heads[currentIdx].level - 1;
  for (let j = currentIdx - 1; j >= 0 && need >= 1; j--) {
    if (heads[j].level === need) { chain.unshift(j); need--; }
  }
  return chain;
}
