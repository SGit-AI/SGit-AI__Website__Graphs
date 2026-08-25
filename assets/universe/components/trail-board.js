/* @module universe/components/trail-board
   Single responsibility: the path query board, per brief 28's answers — the
   trail made editable, runnable and projectable. Steps are chips: drag one
   onto another to reorder, × removes it, clicking a chip toggles it between
   this-exact-node and any-node-of-its-family (the wildcard that turns a walk
   into a query). Run replays the query over the whole graph and lights every
   match; project lists the verbs that could extend the path and appends one
   speculatively; save keeps named queries per document. A part of
   <uni-graph>, editing the inspector's own trail in place. */
'use strict';
import { trailToQuery, runPathQuery, nextVerbs } from '../core/pathquery.js';
import { renderTrail } from './graph-inspect.js';

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g,
  (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** Open or close the board; it edits ins.trail in place. */
export function toggleTrailBoard(host, ins) {
  const open = host.querySelector('.uni-trailboard');
  if (open) { open.remove(); host.showMatches(null); return; }
  build(host, ins);
}

function build(host, ins) {
  const el = document.createElement('div');
  el.className = 'uni-trailboard';
  el.innerHTML =
    '<div class="pb-head"><b>The path query</b> ' +
    '<span class="dim small">click a chip to generalise it; drag to reorder; run lights every match</span>' +
    '<span class="sp"></span><button class="tb-run">run</button>' +
    '<button class="tb-save">save</button><button class="pb-close">&#10005;</button></div>' +
    '<div class="tb-steps"></div>' +
    '<div class="tb-project"><span class="dim small">project forward:</span> <span class="tb-verbs"></span></div>' +
    '<div class="tb-results dim small">not run yet</div>' +
    '<div class="tb-saved"></div>';
  host.querySelector('.uni-graphbox').appendChild(el);
  const U = host._data;

  function chips() {
    const box = el.querySelector('.tb-steps');
    if (!ins.trail.length) { box.innerHTML = '<span class="dim small">Tap a node, then follow its links — the walk becomes the query.</span>'; return; }
    box.innerHTML = ins.trail.map((h, i) =>
      (h.verb ? '<span class="ilv">-' + esc(h.verb) + '&rarr;</span>' : '') +
      '<span class="tb-chip' + (h.exact === false ? ' wild' : '') + '" draggable="true" data-i="' + i + '"' +
      ' title="Click: exact node ↔ any ' + esc(h.family || 'node') + '. Drag onto another chip to reorder.">' +
      (h.exact === false ? 'any ' + esc(h.family || 'node') : esc(h.label)) +
      ' <span class="tb-x" data-x="' + i + '">&#10005;</span></span>').join(' ');
    const end = ins.trail[ins.trail.length - 1];
    el.querySelector('.tb-verbs').innerHTML = nextVerbs(U.elements, U.verbs || {}, end.family)
      .map((v) => '<button class="tb-verb" data-verb="' + esc(v) + '">' + esc(v) + '</button>').join(' ')
      || '<span class="dim">none from ' + esc(end.family || 'here') + '</span>';
    renderTrail(ins);
  }

  function run() {
    const r = runPathQuery(U.elements, U.verbs || {}, trailToQuery(ins.trail));
    host.showMatches(r.paths);
    const box = el.querySelector('.tb-results');
    if (!r.paths.length) { box.textContent = 'no matches'; return; }
    const labels = {};
    U.elements.forEach((e) => { if (e.data.id && !e.data.source) labels[e.data.id] = e.data.label; });
    box.innerHTML = '<b>' + r.paths.length + ' match' + (r.paths.length === 1 ? '' : 'es') +
      (r.truncated ? ' (truncated)' : '') + '</b> — lit on the canvas<br>' +
      r.paths.slice(0, 8).map((p) =>
        '<span class="tb-res" data-go="' + esc(p[0]) + '">' +
        p.map((id) => esc(labels[id] || id)).join(' &rarr; ') + '</span>').join('<br>') +
      (r.paths.length > 8 ? '<br><span class="dim">… and ' + (r.paths.length - 8) + ' more</span>' : '');
  }

  function savedList() {
    let all = {};
    try { all = JSON.parse(localStorage.getItem('uni:' + U.slug + ':gqueries') || '{}'); } catch (e) { all = {}; }
    el.querySelector('.tb-saved').innerHTML = Object.keys(all).length
      ? '<h6>saved queries</h6>' + Object.keys(all).sort().map((n) =>
        '<button class="tb-load" data-name="' + esc(n) + '">' + esc(n) + '</button>').join(' ')
      : '';
    return all;
  }

  let drag = null;
  el.addEventListener('dragstart', (e) => {
    const c = e.target.closest('.tb-chip');
    if (c) drag = Number(c.getAttribute('data-i'));
  });
  el.addEventListener('dragover', (e) => { if (e.target.closest('.tb-chip')) e.preventDefault(); });
  el.addEventListener('drop', (e) => {
    const c = e.target.closest('.tb-chip');
    if (!c || drag === null) return;
    e.preventDefault();
    const to = Number(c.getAttribute('data-i'));
    const [step] = ins.trail.splice(drag, 1);
    ins.trail.splice(to, 0, step);
    drag = null;
    chips();
  });
  el.addEventListener('click', (e) => {
    if (e.target.closest('.pb-close')) { el.remove(); host.showMatches(null); return; }
    if (e.target.closest('.tb-run')) { run(); return; }
    if (e.target.closest('.tb-save')) {
      const all = savedList();
      const name = 'q' + (Object.keys(all).length + 1) + ': ' + ins.trail.map((h) =>
        (h.verb ? h.verb + '>' : '') + (h.exact === false ? h.family : h.label)).join(' ').slice(0, 48);
      all[name] = ins.trail;
      try { localStorage.setItem('uni:' + U.slug + ':gqueries', JSON.stringify(all)); } catch (err) { /* stays session-only */ }
      savedList();
      return;
    }
    const x = e.target.closest('.tb-x');
    if (x) { ins.trail.splice(Number(x.getAttribute('data-x')), 1); chips(); return; }
    const chip = e.target.closest('.tb-chip');
    if (chip) {
      const h = ins.trail[Number(chip.getAttribute('data-i'))];
      h.exact = h.exact === false;               /* exact <-> any-of-family */
      chips(); return;
    }
    const v = e.target.closest('.tb-verb');
    if (v) {
      /* project forward: append a speculative any-node hop and run it */
      ins.trail.push({ verb: v.getAttribute('data-verb'), id: null, family: null,
        label: 'any', exact: false });
      chips(); run(); return;
    }
    const load = e.target.closest('.tb-load');
    if (load) {
      const all = savedList();
      const t = all[load.getAttribute('data-name')];
      if (t) { ins.trail.length = 0; t.forEach((h) => ins.trail.push(h)); chips(); run(); }
      return;
    }
    const res = e.target.closest('.tb-res');
    if (res) {
      host.dispatchEvent(new CustomEvent('uni:node-tap', { bubbles: true,
        detail: { id: res.getAttribute('data-go'), label: res.textContent } }));
    }
  });

  chips();
  savedList();
}
