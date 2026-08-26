/* @module wclm/explain
   Single responsibility: the WCLM's explanation pane (brief 32) — why any box
   is there. An item is a node in the explanation graph: BECAUSE OF lists what
   produced it upstream (with the reason carried on each wire), LEADS TO lists
   what it feeds downstream, and every entry is itself clickable, so the why
   can be walked in both directions. A part of the wclm page. */
'use strict';
import { BLOCKS, TYPES } from './engine.js';

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g,
  (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const layerName = (key) => (BLOCKS.find((l) => l.key === key) || { name: key }).name;

function hopRows(list, dir) {
  if (!list.length) return '<p class="small dim">nothing ' + (dir === 'up' ? 'upstream: this is an input' : 'downstream: a dead end this run') + '</p>';
  return list.map((h) =>
    '<div class="wc-hop" data-go="' + esc(h.id) + '">' +
    '<span class="wc-hoplab">' + (dir === 'up' ? '&#8598; ' : '&#8600; ') + esc(h.title) + '</span>' +
    (h.why ? '<span class="small dim">' + esc(h.why) + '</span>' : '') + '</div>').join('');
}

/** Explain one item: its record, its upstream causes, its downstream effects. */
export function renderExplain(pane, id, ctx) {
  const it = ctx.info.get(id);
  if (!it) return;
  const up = ctx.wires.filter((w) => w.b === id && ctx.info.has(w.a))
    .map((w) => ({ id: w.a, title: ctx.info.get(w.a).title, why: w.why }));
  const down = ctx.wires.filter((w) => w.a === id && ctx.info.has(w.b))
    .map((w) => ({ id: w.b, title: ctx.info.get(w.b).title, why: w.why }));
  pane.innerHTML = '<div class="wc-sh"><b>' + esc(it.title) + '</b>' +
    '<span class="small dim">' + esc(layerName(it.layer)) + '</span></div>' +
    (it.rows || []).map(([k, v]) => '<div class="ev-row"><span class="dim">' + esc(k) +
      '</span> ' + esc(v) + '</div>').join('') +
    '<h6>because of</h6>' + hopRows(up, 'up') +
    '<h6>leads to</h6>' + hopRows(down, 'down') +
    '<p class="small dim">every entry is clickable — it&rsquo;s graphs all the way.</p>';
}

/** Explain one engine: its role, its schema (the types it reads and writes),
    this run's count. The schema is the compatibility contract (brief 34). */
export function renderLayerCard(pane, key, count) {
  const l = BLOCKS.find((x) => x.key === key);
  const typed = (list) => list.map((t) =>
    '<b>' + esc(t) + '</b> <span class="dim">(' + esc(TYPES[t] || t) + ')</span>').join(', ');
  pane.innerHTML = '<div class="wc-sh"><b>' + esc(l.name) + '</b>' +
    '<span class="small dim">a reusable deterministic engine' + (l.core ? '' : ' · optional: toggle or drag it in the pipeline bar — engines can share a layer') + '</span></div>' +
    '<p>' + esc(l.role) + '.</p>' +
    '<div class="ev-row"><span class="dim">reads</span> ' + typed(l.io.reads) + ' — from the layers before it, never further back than what they stacked</div>' +
    '<div class="ev-row"><span class="dim">writes</span> ' + typed(l.io.writes) + '</div>' +
    '<div class="ev-row"><span class="dim">this run</span> ' + count + ' item(s)</div>' +
    '<p class="small dim">The schema is the compatibility contract: any engine writing what this one reads can feed it, and a placement whose types are unmet is skipped with the missing type named. Same input, same output, always — a stated transformation, never a fitted formula.</p>';
}
