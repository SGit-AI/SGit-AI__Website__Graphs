/* @module universe/core/align
   Single responsibility: the invisible alignment lines of brief 26, as pure
   element builders. One rail per heading level: a locked, invisible node that
   every section of that level is tied to with a short invisible edge, so the
   physics pulls each level onto its own line and the document reads as a tree
   growing from the left band. The lines can be revealed by a toggle; hidden
   or shown, they are always doing the pulling. Pure: no DOM, no cytoscape. */

/**
 * Rails and their ties for the taxonomy's heading levels (the H1 is the doc
 * root and needs no rail).
 * @param {Array<{title: string, level: number}>} taxonomy - headings in order
 * @returns {Array<object>} rail nodes (family "rail") and align edges
 */
export function alignmentElements(taxonomy) {
  const levels = [];
  (taxonomy || []).forEach((t, i) => {
    if (i === 0) return;
    if (levels.indexOf(t.level) === -1) levels.push(t.level);
  });
  levels.sort((a, b) => a - b);
  const els = levels.map((lv) => ({
    data: { id: 'rail:' + lv, label: 'level ' + lv, family: 'rail', level: lv } }));
  let i = 0;
  (taxonomy || []).forEach((t, idx) => {
    if (idx === 0) return;
    els.push({ data: { id: 'ar:' + (i++), source: 'rail:' + t.level,
      target: 'sec:' + t.title, kind: 'align' } });
  });
  return els;
}

/**
 * Where each rail sits: one column per level, deeper levels further right,
 * so the pull arranges the sections into a left-rooted tree.
 * @param {number[]} levels - the heading levels present, ascending
 * @returns {Object<string, {x: number, y: number}>} position per rail id
 */
export function railPositions(levels) {
  const pos = {};
  levels.forEach((lv, i) => { pos['rail:' + lv] = { x: 170 * (i + 1), y: 320 }; });
  return pos;
}
