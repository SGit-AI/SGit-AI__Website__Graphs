/* @module wclm/ioflow
   Single responsibility: the typed IO flow diagram — reads → operator →
   writes, drawn straight from a schema. Pure (string in, string out); used
   by the workbench header and by the explorer's schema view, so the two can
   never disagree about the contract they draw. */
'use strict';

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g,
  (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** Draw one operator's typed flow. block: { key, io: { reads: [type], writes: [type] } } */
export function ioFlowSvg(block) {
  const box = (x, y, w, txt, cls) =>
    '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="26" rx="6" class="op-f-' + cls + '"/>' +
    '<text x="' + (x + w / 2) + '" y="' + (y + 17) + '" text-anchor="middle">' + esc(txt) + '</text>';
  const arrow = (x1, x2, y) => '<path d="M' + x1 + ' ' + y + ' H' + x2 + '" marker-end="url(#opArr)"/>';
  const reads = block.io.reads, writes = block.io.writes;
  let svg = '<defs><marker id="opArr" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L8 4 L0 8 z"/></marker></defs>';
  reads.forEach((t, i) => { const y = 8 + i * 34; svg += box(2, y, 92, t, 'type') + arrow(96, 128, y + 13); });
  svg += box(130, 8 + (Math.max(reads.length, writes.length) - 1) * 17, 96, block.key, 'op');
  writes.forEach((t, i) => { const y = 8 + i * 34; svg += arrow(228, 258, y + 13) + box(260, y, 92, t, 'type'); });
  const h = 16 + Math.max(reads.length, writes.length) * 34;
  return '<svg class="op-flow" viewBox="0 0 356 ' + h + '" width="330" height="' + Math.min(h, 90) + '"' +
    ' role="img" aria-label="' + esc(block.key) + ' reads ' + reads.join(', ') + ' and writes ' + writes.join(', ') + '">' + svg + '</svg>';
}
