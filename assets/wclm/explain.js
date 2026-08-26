/* @module wclm/explain
   Single responsibility: the WCLM's explanation pane (brief 32) — why any box
   is there. An item is a node in the explanation graph: BECAUSE OF lists what
   produced it upstream (with the reason carried on each wire), LEADS TO lists
   what it feeds downstream, and every entry is itself clickable, so the why
   can be walked in both directions. A part of the wclm page. */
'use strict';
import { BLOCKS } from './engine.js';

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

/** Explain one layer: its role, what it reads, what it writes, this run's count. */
export function renderLayerCard(pane, key, count) {
  const l = BLOCKS.find((x) => x.key === key);
  const idx = BLOCKS.indexOf(l);
  const reads = idx === 0 ? 'the prompt text' : 'the previous executed block&rsquo;s output — never anything further back';
  const writes = key === 'converge' ? 'the answer: meaning, provenance, blast radius, contradictions' : 'the next block&rsquo;s input';
  pane.innerHTML = '<div class="wc-sh"><b>' + esc(l.name) + '</b>' +
    '<span class="small dim">a reusable deterministic block' + (l.core ? '' : ' · optional: toggle it in the pipeline bar') + '</span></div>' +
    '<p>' + esc(l.role) + '.</p>' +
    (l.needs.length ? '<div class="ev-row"><span class="dim">needs</span> ' + l.needs.join(', ') + '</div>' : '') +
    '<div class="ev-row"><span class="dim">reads</span> ' + reads + '</div>' +
    '<div class="ev-row"><span class="dim">writes</span> ' + writes + '</div>' +
    '<div class="ev-row"><span class="dim">this run</span> ' + count + ' item(s)</div>' +
    '<p class="small dim">Same input, same output, always — the layer is a stated transformation, never a fitted formula. To change what it does, change the world it reads.</p>';
}
