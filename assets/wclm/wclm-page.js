/* @module wclm/wclm-page
   Single responsibility: the WCLM page's shell (briefs 31–33) — assemble the
   pipeline from its block registry (toggle and drag in the pipeline bar), run
   it, render the executed blocks as strictly-adjacent columns via render.js,
   trace the FULL evidence path on click (transitive, both directions — the
   detective playbook), measure run-to-run impact, and answer with meaning,
   provenance and any contradictions. Computation lives in engine.js, pure. */
'use strict';
import { runPipeline, runDelta, BLOCKS, DEFAULT_PIPELINE } from './engine.js';
import { renderBlock } from './render.js';
import { renderExplain, renderLayerCard } from './explain.js';

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g,
  (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const EXAMPLES = ['meaning through connectivity', 'meaning without connectivity',
  'anchor nodes and reference graphs', 'graphs of graphs', 'qa',
  'graphz and nodez conected', 'meaning through nodes and graph sausages', 'zebra quantum'];

const mount = document.getElementById('wclm');
if (mount) {
  fetch('data/world.json').then((r) => r.json()).then((world) => boot(world))
    .catch(() => { mount.innerHTML = '<p class="dim">the world file did not load</p>'; });
}

function loadPipe() {
  try {
    const p = JSON.parse(localStorage.getItem('wclm:pipe') || 'null');
    if (Array.isArray(p) && p.length) return p.filter((k) => BLOCKS.some((b) => b.key === k));
  } catch (e) { /* fall through */ }
  return DEFAULT_PIPELINE.slice();
}

function boot(world) {
  const q = document.getElementById('wc-q');
  const ask = document.querySelector('.wc-ask');
  let pipe = loadPipe();
  let off = new Set();
  let prev = null;

  const bar = document.createElement('div');
  bar.className = 'wc-pipe';
  const ex = document.createElement('div');
  ex.className = 'wc-ex';
  ex.innerHTML = '<span class="small dim">strong &rarr; weak:</span> ' + EXAMPLES.map((e) =>
    '<button class="wc-exb" data-ex="' + esc(e) + '">' + esc(e) + '</button>').join('');
  ask.after(bar);
  bar.after(ex);

  const active = () => pipe.filter((k) => !off.has(k));
  const go = () => {
    try { localStorage.setItem('wclm:pipe', JSON.stringify(pipe)); } catch (e) { /* fine */ }
    const R = runPipeline(q.value, world, active());
    drawBar(bar, pipe, off, R);
    draw(world, R, prev);
    prev = R;
  };

  document.getElementById('wc-run').addEventListener('click', go);
  q.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
  ex.addEventListener('click', (e) => {
    const b = e.target.closest('.wc-exb');
    if (b) { q.value = b.getAttribute('data-ex'); go(); }
  });
  bar.addEventListener('click', (e) => {
    const b = e.target.closest('.wc-blk');
    if (!b) return;
    const key = b.getAttribute('data-blk');
    if (BLOCKS.find((x) => x.key === key).core) return;   /* core blocks stay */
    if (off.has(key)) off.delete(key); else off.add(key);
    go();
  });
  let drag = null;
  bar.addEventListener('dragstart', (e) => {
    const b = e.target.closest('.wc-blk');
    if (b) drag = b.getAttribute('data-blk');
  });
  bar.addEventListener('dragover', (e) => { if (e.target.closest('.wc-blk')) e.preventDefault(); });
  bar.addEventListener('drop', (e) => {
    const b = e.target.closest('.wc-blk');
    if (!b || !drag) return;
    e.preventDefault();
    const to = pipe.indexOf(b.getAttribute('data-blk'));
    pipe.splice(pipe.indexOf(drag), 1);
    pipe.splice(to, 0, drag);
    drag = null;
    go();
  });
  addEventListener('resize', () => { if (mount._paint) mount._paint(); });
  go();
}

/* the pipeline bar: the reusable blocks, mix-and-match (brief 33) */
function drawBar(bar, pipe, off, R) {
  bar.innerHTML = '<span class="small dim">the pipeline (click to toggle, drag to reorder):</span> ' +
    pipe.map((k) => {
      const b = BLOCKS.find((x) => x.key === k);
      const step = R.steps.find((s) => s.key === k);
      const state = off.has(k) ? 'off' : step && step.skipped ? 'skip' : 'on';
      return '<span class="wc-blk wc-blk-' + state + (b.core ? ' wc-blk-core' : '') +
        '" data-blk="' + k + '" draggable="' + !b.core + '" title="' + esc(b.role) +
        (state === 'skip' ? ' — SKIPPED: ' + esc(step.skipped) : '') + '">' + esc(b.name) +
        (state === 'skip' ? ' &#9888;' : '') + '</span>';
    }).join('');
}

function draw(world, R, prevRun) {
  const delta = runDelta(prevRun, R);
  const wires = [];
  const info = new Map();
  const ctx = {
    last: null,
    chip(id, layer, cls, html, title, rows, key) {
      info.set(id, { layer, title, rows });
      return '<div class="wc-chip ' + cls + '" data-c="' + id + '"' +
        (key != null ? ' data-k="' + esc(key) + '"' : '') + '>' + html + '</div>';
    },
    wire(a, b, w, cls, why) { if (a && b) wires.push({ a, b, w, cls, why }); },
  };
  const executed = R.steps.filter((s) => !s.skipped).map((s) => s.key);
  const cols = executed.map((k) => {
    const b = BLOCKS.find((x) => x.key === k);
    return '<div class="wc-col"><div class="wc-lh" data-lh="' + k + '" title="Click: what this block does"><b>' +
      b.name + '</b><span class="small dim">' + b.role + '</span></div>' +
      renderBlock(k, R.state, world, ctx) + '</div>';
  }).join('');

  mount.innerHTML = deltaLine(delta) + '<div class="wc-wrap"><div class="wc-cols">' + cols +
    '<svg class="wc-wires" aria-hidden="true"></svg></div>' +
    '<aside class="wc-side"><p class="dim small">Click any box for its full evidence trail — everything upstream that produced it, everything downstream it feeds. Click a block title for what the block does.</p></aside></div>' +
    meaningCard(R);

  if (delta) {
    executed.forEach((k, ci) => {
      const d = delta.layers[k];
      if (!d) return;
      const added = new Set(d.added.map((x) => String(x).split(':')[0]));
      mount.querySelectorAll('.wc-col:nth-child(' + (ci + 1) + ') .wc-chip[data-k]')
        .forEach((el) => { if (added.has(el.getAttribute('data-k'))) el.classList.add('wc-new'); });
    });
  }

  /* the detective playbook: transitive reachability, both directions */
  const up = new Map(), down = new Map();
  wires.forEach((w) => {
    if (!up.has(w.b)) up.set(w.b, []);
    up.get(w.b).push(w.a);
    if (!down.has(w.a)) down.set(w.a, []);
    down.get(w.a).push(w.b);
  });
  const closure = (id) => {
    const seen = new Set([id]);
    const walk = (n, m) => (m.get(n) || []).forEach((x) => { if (!seen.has(x)) { seen.add(x); walk(x, m); } });
    walk(id, up); walk(id, down);
    return seen;
  };

  const pane = mount.querySelector('.wc-side');
  const counts = {};
  executed.forEach((k, ci) => { counts[k] = mount.querySelectorAll('.wc-col:nth-child(' + (ci + 1) + ') .wc-chip').length; });
  const select = (id) => {
    const trail = closure(id);
    mount._trail = trail;
    mount.querySelectorAll('.wc-chip').forEach((x) => {
      x.classList.toggle('wc-sel', x.getAttribute('data-c') === id);
      x.classList.toggle('wc-fade', !trail.has(x.getAttribute('data-c')));
    });
    mount._paint();
    renderExplain(pane, id, { info, wires, select });
  };
  mount.addEventListener('click', (e) => {
    const hop = e.target.closest('[data-go]');
    if (hop) { select(hop.getAttribute('data-go')); return; }
    const lh = e.target.closest('[data-lh]');
    if (lh) { const k = lh.getAttribute('data-lh'); renderLayerCard(pane, k, counts[k]); return; }
    const c = e.target.closest('.wc-chip[data-c]');
    if (c && info.has(c.getAttribute('data-c'))) select(c.getAttribute('data-c'));
  });

  const paint = () => {
    const box = mount.querySelector('.wc-cols');
    const svg = mount.querySelector('.wc-wires');
    const br = box.getBoundingClientRect();
    svg.setAttribute('width', box.scrollWidth); svg.setAttribute('height', box.scrollHeight);
    svg.innerHTML = wires.map((w) => {
      const a = box.querySelector('[data-c="' + w.a + '"]'); const b = box.querySelector('[data-c="' + w.b + '"]');
      if (!a || !b) return '';
      const t = mount._trail;
      const hot = t && t.has(w.a) && t.has(w.b);
      const ra = a.getBoundingClientRect(); const rb = b.getBoundingClientRect();
      const same = w.cls === 'wc-pairline';
      const x1 = (same ? ra.left : ra.right) - br.left, y1 = ra.top + ra.height / 2 - br.top + box.scrollTop;
      const x2 = rb.left - br.left, y2 = rb.top + rb.height / 2 - br.top + box.scrollTop;
      const mid = same ? x1 - 18 : (x1 + x2) / 2;
      return '<path class="' + (w.cls || 'wc-line') + (hot ? ' wc-hot' : t ? ' wc-cold' : '') +
        '" stroke-width="' + Math.max(1, Math.min(5, w.w * 3)) +
        '" d="M' + x1 + ' ' + y1 + ' C' + mid + ' ' + y1 + ' ' + mid + ' ' + y2 + ' ' + x2 + ' ' + y2 + '"/>';
    }).join('');
  };
  mount._trail = null;
  mount._paint = paint;
  requestAnimationFrame(paint);
}

function deltaLine(delta) {
  if (!delta) return '';
  const bits = Object.keys(delta.layers).map((k) => {
    const d = delta.layers[k];
    return (d.added.length || d.removed.length)
      ? k + ' <b>+' + d.added.length + '</b>/&minus;' + d.removed.length : null;
  }).filter(Boolean);
  const w = delta.winner;
  return '<div class="wc-delta small">impact of this change: ' +
    (bits.length ? bits.join(' · ') : 'none — the layers are unchanged') +
    (w.changed ? ' · <b>the meaning moved: ' + esc(w.from || 'nothing') + ' &rarr; ' + esc(w.to || 'nothing') + '</b>'
      : ' · the meaning held') + ' <span class="dim">(new boxes are marked)</span></div>';
}

function meaningCard(R) {
  const m = R.meaning;
  const notes = (R.notes || []).map((n) =>
    '<p class="wc-note">&#9888; ' + esc(n) + '</p>').join('');
  if (!m) return '<div class="wc-card">' + notes + '<p class="dim">This universe has nothing bound to that. Try a word the pilot document actually uses.</p></div>';
  const others = R.state.ranked.slice(1, 4);
  return '<div class="wc-card">' + notes +
    '<h3>the meaning: ' + esc(m.label) + ' <span class="small dim">score ' + m.total +
    ' · ' + (m.kind === 'pack' ? 'from a meaning pack' : 'from the document') + '</span></h3>' +
    (m.def ? '<p>' + esc(m.def) + '</p>' : '') +
    (m.quote ? '<div class="ndoc-anchor">&sect; ' + esc(m.section) + '<blockquote>&ldquo;' + esc(m.quote) + '&rdquo;</blockquote></div>' : '') +
    '<p class="small">bound via <b>' + m.via.map(esc).join(', ') + '</b> · blast radius <b>' + m.blast + '</b></p>' +
    (others.length ? '<p class="small dim">also plausible: ' + others.map((o) => esc(o.label) + ' (' + o.total + ')').join(' · ') + '</p>' : '') +
    '</div>';
}
