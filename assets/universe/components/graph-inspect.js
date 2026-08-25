/* @module universe/components/graph-inspect
   Single responsibility: the maximised view's right-hand inspector, per
   briefs 26 and 28 — the tapped node's details (statement and anchored
   quote), its links out and in with their verbs reading in English (in-links
   read through the declared inverse, so arriving at B from A shows B's own
   viewpoint), the path trail those hops build up (the beginnings of the path
   query), and the live legend of every node and edge type in view.
   A part of <uni-graph>: shown only while the graph is maximised. */
'use strict';
import { graphStats } from '../core/explore.js';
import { FAMILY_COLOURS } from '../core/cystyle.js';

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g,
  (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const SYNTH = { section: 'a section of the document', docroot: 'the document itself',
  peak: 'a family summit', dgroup: 'a derived grouping', schema: 'a node type',
  rail: 'an alignment rail — invisible, always pulling' };

/** Build the inspector inside the graphbox; returns its state object. */
export function inspectInit(host) {
  const el = document.createElement('div');
  el.className = 'uni-inspect';
  el.innerHTML = '<div class="uni-insp-trail" hidden></div>' +
    '<div class="uni-insp-node"><p class="dim">Tap a node to inspect it.</p></div>' +
    '<div class="uni-insp-legend"></div>';
  host.querySelector('.uni-graphbox').appendChild(el);
  return { el, host, node: el.querySelector('.uni-insp-node'),
    trailEl: el.querySelector('.uni-insp-trail'),
    legend: el.querySelector('.uni-insp-legend'), exP: null, trail: [] };
}

/* The node's links, each reading in English from the node's own viewpoint:
   out-links use the stored verb; in-links use its declared inverse. */
function linkRows(ins, U, d) {
  const cy = ins.host.cy;
  const verbs = U.verbs || {};
  const out = [], inn = [];
  cy.$id(d.id).connectedEdges().forEach((e) => {
    const ed = e.data();
    if (ed.kind === 'align' || ed.kind === 'schema') return;
    const isOut = ed.source === d.id;
    const other = cy.$id(isOut ? ed.target : ed.source);
    if (other.empty() || other.hasClass('uni-hide')) return;
    const stored = ed.kind === 'asserted' && ed.verb ? ed.verb : ed.kind;
    const verb = isOut ? stored : (verbs[stored] || stored + ' ←');
    (isOut ? out : inn).push('<div class="leg-row" data-golink="' + esc(other.id()) +
      '" data-verb="' + esc(verb) + '" title="Follow this link">' +
      '<i style="background:' + (FAMILY_COLOURS[other.data('family')] || '#8a8f98') + '"></i>' +
      '<span class="ilv">' + esc(verb) + '</span>&nbsp;' + esc(other.data('label')) + '</div>');
  });
  let h = '';
  if (out.length) h += '<h6>links out (' + out.length + ')</h6>' + out.join('');
  if (inn.length) h += '<h6>links in, read from here (' + inn.length + ')</h6>' + inn.join('');
  return h;
}

/** Render the tapped node: details, quote, and its links both ways. */
export function inspectNode(ins, U, d) {
  const fam = d.family || 'node';
  const head = '<span class="ndoc-fam ndoc-f-' + esc(fam) + '">' + esc(fam) + '</span> ' +
    '<b>' + esc(d.label) + '</b>';
  const links = linkRows(ins, U, d);
  if (SYNTH[fam]) {
    ins.node.innerHTML = head + '<p class="dim small">' + SYNTH[fam] +
      (d.count ? ' · ' + d.count + ' member' + (d.count === 1 ? '' : 's') : '') + '</p>' + links;
    return;
  }
  ins.node.innerHTML = head + '<p class="dim small">loading the record…</p>';
  ins.exP = ins.exP || fetch(U.extraction).then((r) => r.json());
  ins.exP.then((ex) => {
    const n = ex.nodes.find((x) => x.id === d.id);
    ins.node.innerHTML = head + (!n ? '' :
      (n.statement ? '<p>' + esc(n.statement) + '</p>' : '') +
      (n.support ? '<p class="small">support: <b>' + esc(n.support) + '</b></p>' : '') +
      (n.anchor ? '<div class="ndoc-anchor">&sect; ' + esc(n.anchor.section) +
        '<blockquote>&ldquo;' + esc(n.anchor.quote) + '&rdquo;</blockquote></div>' : '')) + links;
  }).catch(() => { ins.node.innerHTML = head + links; });
}

/** A hop taken by following a link row: the path query grows by one step.
    Each entry keeps the node's identity so the board can replay or
    generalise it. */
export function inspectHop(ins, verb, d) {
  ins.trail.push({ verb, id: d.id, family: d.family, label: d.label, exact: true });
  if (ins.trail.length > 8) ins.trail.shift();
  renderTrail(ins);
}

/** Start the trail over (a fresh selection not made by following a link). */
export function inspectTrailStart(ins, d) {
  ins.trail = d ? [{ verb: null, id: d.id, family: d.family, label: d.label, exact: true }] : [];
  renderTrail(ins);
}

export function renderTrail(ins) {
  const t = ins.trailEl;
  if (!ins.trail.length) { t.hidden = true; return; }
  t.hidden = false;
  t.innerHTML = '<b>path:</b> ' + ins.trail.map((h) =>
    (h.verb ? '<span class="ilv">-' + esc(h.verb) + '→</span> ' : '')
    + (h.exact === false ? '<i>any ' + esc(h.family || 'node') + '</i>' : esc(h.label)))
    .join(' ')
    + ' <span class="uni-quick" data-trailedit="1">edit / run</span>'
    + ' <span class="uni-quick" data-trailclear="1">clear</span>';
}

/** The live legend: every node type and edge type in the current view, with
    counts. Every row is a control (the narrated review's ask): a node type
    row toggles that family or its source; an edge type row hides and shows
    that relation, and a hidden relation keeps its row so the way back stays. */
export function inspectLegend(ins, visData, edgeOff) {
  const s = graphStats(visData);
  const row = (attr, key, count, colour, off) =>
    '<div class="leg-row' + (off ? ' off' : '') + '" ' + attr + '="' + esc(key) +
    '" title="Click to toggle"><i style="background:' + colour + '"></i>' + esc(key) +
    ' <span class="dim">' + (off ? 'off' : count) + '</span></div>';
  const nodes = Object.keys(s.nodes).sort().map((f) =>
    row('data-leg-node', f, s.nodes[f], FAMILY_COLOURS[f] || '#8a8f98', false)).join('');
  const offRows = [];
  (edgeOff || new Set()).forEach((k) => { if (!s.edges[k]) offRows.push(k); });
  const edges = Object.keys(s.edges).sort().map((k) =>
    row('data-leg-edge', k, s.edges[k], '#c9ccd2', false)).join('') +
    offRows.sort().map((k) => row('data-leg-edge', k, 0, '#c9ccd2', true)).join('');
  ins.legend.innerHTML = '<h6>node types in view</h6>' + (nodes || '<div class="dim">none</div>') +
    '<h6>edge types in view</h6>' + (edges || '<div class="dim">none</div>');
}
