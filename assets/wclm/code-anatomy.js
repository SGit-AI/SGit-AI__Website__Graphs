/* @module wclm/code-anatomy
   Single responsibility: the code anatomy view (brief 37) — one operator's
   source, its authored segment graph, and the explanation pane, linked by
   segment id. Three pure builders (string in, string out, node-testable):
   the fluxogram of segments, the code column grouped into its segments, and
   the right pane for one segment. The explorer wires the clicks. */
'use strict';
import { rawJsHtml } from '../universe/core/fileview.js';

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g,
  (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const KIND_LABEL = { docs: 'the claim', imports: 'dependencies', data: 'official data',
  contract: 'the contract', step: 'a run step', export: 'the ui' };

/** The fluxogram: one box per segment top-down, feeds drawn as arrows —
    adjacent feeds straight down, the rest arced on the right. */
export function anatomyFlowSvg(anat) {
  const H = 44, W = 240, X = 30;
  const segs = anat.segments;
  const yOf = (i) => 8 + i * H;
  const idx = {};
  segs.forEach((s, i) => { idx[s.id] = i; });
  let boxes = '', arrows = '';
  segs.forEach((s, i) => {
    boxes += '<g class="an-fbox an-k-' + esc(s.kind) + '" data-seg="' + esc(s.id) + '">' +
      '<rect x="' + X + '" y="' + yOf(i) + '" width="' + W + '" height="30" rx="7"/>' +
      '<text x="' + (X + 10) + '" y="' + (yOf(i) + 19) + '">' + esc(s.label) + '</text>' +
      '<text class="an-fl" x="' + (X + W - 10) + '" y="' + (yOf(i) + 19) + '" text-anchor="end">' +
      s.lines[0] + '&ndash;' + s.lines[1] + '</text></g>';
    (s.feeds || []).forEach((to) => {
      const j = idx[to];
      if (j === undefined) return;
      if (j === i + 1) {
        arrows += '<path class="an-farr" d="M' + (X + W / 2) + ' ' + (yOf(i) + 30) +
          ' V' + yOf(j) + '" marker-end="url(#anArr)"/>';
      } else {
        const x = X + W + 14 + (j - i) * 4;
        arrows += '<path class="an-farr" d="M' + (X + W) + ' ' + (yOf(i) + 15) +
          ' C' + x + ' ' + (yOf(i) + 15) + ' ' + x + ' ' + (yOf(j) + 15) + ' ' +
          (X + W) + ' ' + (yOf(j) + 15) + '" marker-end="url(#anArr)"/>';
      }
    });
  });
  const h = yOf(segs.length) + 4;
  return '<svg class="an-flow" viewBox="0 0 ' + (X + W + 70) + ' ' + h + '" width="' + (X + W + 70) + '" height="' + h +
    '" role="img" aria-label="the flow of ' + esc(anat.operator) + '.js">' +
    '<defs><marker id="anArr" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L8 4 L0 8 z"/></marker></defs>' +
    arrows + boxes + '</svg>';
}

/** The code, grouped into its segments — each block titled and clickable. */
export function anatomyBodyHtml(code, anat) {
  const lines = String(code).split('\n');
  return anat.segments.map((s) => {
    const slice = lines.slice(s.lines[0] - 1, s.lines[1]).join('\n');
    return '<div class="an-seg an-k-' + esc(s.kind) + '" data-seg="' + esc(s.id) + '">' +
      '<div class="an-sh"><b>' + esc(s.label) + '</b><span class="small dim">' +
      esc(KIND_LABEL[s.kind] || s.kind) + ' · lines ' + s.lines[0] + '&ndash;' + s.lines[1] + '</span></div>' +
      rawJsHtml(slice) + '</div>';
  }).join('');
}

/** The right pane for one segment: what it does, its variables, its io, its hops. */
export function anatomyPaneHtml(anat, id) {
  const s = anat.segments.find((x) => x.id === id);
  if (!s) return '';
  const fedBy = anat.segments.filter((x) => (x.feeds || []).includes(id));
  const hop = (x) => '<span class="wc-hop" data-goseg="' + esc(x.id) + '"><span class="wc-hoplab">' + esc(x.label) + '</span></span>';
  return '<div class="wc-sh"><b>' + esc(s.label) + '</b><span class="small dim">' +
    esc(KIND_LABEL[s.kind] || s.kind) + ' · lines ' + s.lines[0] + '&ndash;' + s.lines[1] + '</span></div>' +
    '<p>' + esc(s.does) + '</p>' +
    (s.vars ? '<h6>the variables</h6>' + Object.keys(s.vars).map((v) =>
      '<div class="ev-row"><code>' + esc(v) + '</code> ' + esc(s.vars[v]) + '</div>').join('') : '') +
    (s.reads && s.reads.length ? '<h6>reads</h6>' + s.reads.map((r) =>
      '<div class="ev-row">' + esc(r) + '</div>').join('') : '') +
    (s.writes && s.writes.length ? '<h6>writes</h6>' + s.writes.map((w) =>
      '<div class="ev-row">' + esc(w) + '</div>').join('') : '') +
    (fedBy.length ? '<h6>fed by</h6>' + fedBy.map(hop).join('') : '') +
    (s.feeds && s.feeds.length ? '<h6>feeds</h6>' + s.feeds.map((f) =>
      hop(anat.segments.find((x) => x.id === f) || { id: f, label: f })).join('') : '') +
    '<p class="small dim">Authored, anchored to the exact first line of each block; the build fails if this drifts from the code.</p>';
}
