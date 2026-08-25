/* @module universe/components/graph-inspect
   Single responsibility: the maximised view's right-hand inspector, per
   brief 26 — the tapped node's details (its statement and anchored quote,
   fetched once from the extraction), and the live legend of every node type
   and every edge type in the current view. A part of <uni-graph>: shown only
   while the graph is maximised (CSS-gated on .uni-gmax); the panel views are
   untouched, exactly as the memo scoped it. */
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
  el.innerHTML = '<div class="uni-insp-node"><p class="dim">Tap a node to inspect it.</p></div>' +
    '<div class="uni-insp-legend"></div>';
  host.querySelector('.uni-graphbox').appendChild(el);
  return { el, node: el.querySelector('.uni-insp-node'),
    legend: el.querySelector('.uni-insp-legend'), U: null, exP: null };
}

/** Render the tapped node: extraction nodes get their statement and quote. */
export function inspectNode(ins, U, d) {
  const fam = d.family || 'node';
  const head = '<span class="ndoc-fam ndoc-f-' + esc(fam) + '">' + esc(fam) + '</span> ' +
    '<b>' + esc(d.label) + '</b>';
  if (SYNTH[fam]) {
    ins.node.innerHTML = head + '<p class="dim small">' + SYNTH[fam] +
      (d.count ? ' · ' + d.count + ' member' + (d.count === 1 ? '' : 's') : '') + '</p>';
    return;
  }
  ins.node.innerHTML = head + '<p class="dim small">loading the record…</p>';
  ins.exP = ins.exP || fetch(U.extraction).then((r) => r.json());
  ins.exP.then((ex) => {
    const n = ex.nodes.find((x) => x.id === d.id);
    if (!n) { ins.node.innerHTML = head; return; }
    ins.node.innerHTML = head +
      (n.statement ? '<p>' + esc(n.statement) + '</p>' : '') +
      (n.support ? '<p class="small">support: <b>' + esc(n.support) + '</b></p>' : '') +
      (n.anchor ? '<div class="ndoc-anchor">&sect; ' + esc(n.anchor.section) +
        '<blockquote>&ldquo;' + esc(n.anchor.quote) + '&rdquo;</blockquote></div>' : '');
  }).catch(() => { ins.node.innerHTML = head; });
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
