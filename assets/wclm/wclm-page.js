/* @module wclm/wclm-page
   Single responsibility: the WCLM page's shell (briefs 31–34) — assemble the
   pipeline as LAYERS of engines (toggle, drag between layers, several engines
   side by side in one slot), run it, render each layer as a strictly-adjacent
   column via render.js, offer a sense picker for every prompt word the senses
   register knows, trace the FULL evidence path on click (transitive, both
   directions), measure run-to-run impact, and answer with meaning, provenance
   and contradictions. Computation lives in engine.js and senses.js, pure. */
'use strict';
import { runPipeline, runDelta, BLOCKS, DEFAULT_PIPELINE } from './engine.js';
import { renderBlock, openLayer } from './render.js';
import { renderExplain, renderLayerCard } from './explain.js';

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g,
  (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const EXAMPLES = ['meaning through connectivity', 'meaning without connectivity',
  'graphs of graphs', 'graph of graphs', 'anchor nodes and reference graphs', 'qa',
  'graphz and nodez conected', 'meaning through nodes and graph sausages', 'zebra quantum'];

const mount = document.getElementById('wclm');
if (mount) {
  fetch('data/world.json').then((r) => r.json()).then((world) => boot(world))
    .catch(() => { mount.innerHTML = '<p class="dim">the world file did not load</p>'; });
}

/* the stored pipeline: layers of engine keys; migrates the flat v0.5.4 shape */
function loadPipe() {
  let pipe = DEFAULT_PIPELINE.map((L) => L.slice());
  try {
    const p = JSON.parse(localStorage.getItem('wclm:pipe') || 'null');
    if (Array.isArray(p) && p.length) {
      pipe = p.map((L) => (Array.isArray(L) ? L : [L]).filter((k) => BLOCKS.some((b) => b.key === k)))
        .filter((L) => L.length);
      const flat = pipe.flat();
      DEFAULT_PIPELINE.flat().forEach((k) => {
        if (flat.includes(k)) return;
        const home = pipe.find((L) => L.includes(k === 'senses' ? 'operators' : 'bind'));
        if (k === 'senses' && home) home.unshift(k); else pipe.splice(pipe.length - 1, 0, [k]);
      });
    }
  } catch (e) { /* the default stands */ }
  return pipe;
}

function loadOff() {
  try {
    const o = JSON.parse(localStorage.getItem('wclm:off') || 'null');
    if (Array.isArray(o)) return new Set(o.filter((k) => BLOCKS.some((b) => b.key === k && !b.core)));
  } catch (e) { /* the default stands */ }
  return new Set(['passthrough', 'fractal']);
}

function boot(world) {
  const q = document.getElementById('wc-q');
  const ask = document.querySelector('.wc-ask');
  let pipe = loadPipe();
  if (!pipe.flat().includes('passthrough')) (pipe.find((L) => L.includes('operators')) || pipe[0]).push('passthrough');
  if (!pipe.flat().includes('fractal')) pipe.push(['fractal']);
  const off = loadOff();
  const chosen = {};
  let prev = null;

  const bar = document.createElement('div');
  bar.className = 'wc-pipe';
  const picker = document.createElement('div');
  picker.className = 'wc-senses';
  const ex = document.createElement('div');
  ex.className = 'wc-ex';
  ex.innerHTML = '<span class="small dim">strong &rarr; weak:</span> ' + EXAMPLES.map((e) =>
    '<button class="wc-exb" data-ex="' + esc(e) + '">' + esc(e) + '</button>').join('');
  ask.after(bar);
  bar.after(ex);
  ex.after(picker);

  const active = () => pipe.map((L) => L.filter((k) => !off.has(k))).filter((L) => L.length);
  const go = () => {
    try {
      localStorage.setItem('wclm:pipe', JSON.stringify(pipe));
      localStorage.setItem('wclm:off', JSON.stringify(Array.from(off)));
    } catch (e) { /* fine */ }
    const R = runPipeline(q.value, world, active(), { senses: chosen });
    drawBar(bar, pipe, off, R);
    drawPicker(picker, R, chosen, go);
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
  const lift = (k) => {                      /* take the engine out of its layer;
                                                returns the index of a layer removed by emptying, else -1 */
    const idx = pipe.findIndex((x) => x.includes(k));
    if (idx < 0) return -1;
    const L = pipe[idx];
    L.splice(L.indexOf(k), 1);
    if (!L.length) { pipe.splice(idx, 1); return idx; }
    return -1;
  };
  bar.addEventListener('dragstart', (e) => {
    const b = e.target.closest('.wc-blk');
    if (b) drag = b.getAttribute('data-blk');
  });
  bar.addEventListener('dragover', (e) => { if (e.target.closest('.wc-blk, .wc-gap')) e.preventDefault(); });
  bar.addEventListener('drop', (e) => {
    if (!drag) return;
    const blk = e.target.closest('.wc-blk');
    const gap = e.target.closest('.wc-gap');
    if (blk && blk.getAttribute('data-blk') !== drag) {
      e.preventDefault();
      const host = pipe.find((L) => L.includes(blk.getAttribute('data-blk')));
      lift(drag);
      host.push(drag);                       /* join the target's layer */
    } else if (gap) {
      e.preventDefault();
      let at = Number(gap.getAttribute('data-gap'));
      const removedAt = lift(drag);
      if (removedAt >= 0 && removedAt < at) at -= 1;
      if (at > pipe.length) at = pipe.length;
      pipe.splice(at, 0, [drag]);            /* a layer of its own */
    }
    drag = null;
    go();
  });
  addEventListener('resize', () => { if (mount._paint) mount._paint(); });
  go();
}

/* the pipeline bar: layers of reusable engines, mix and match (briefs 33–34) */
function drawBar(bar, pipe, off, R) {
  const gap = (i) => '<span class="wc-gap" data-gap="' + i + '" title="drop an engine here for a layer of its own"></span>';
  bar.innerHTML = '<span class="small dim">the pipeline (click to toggle, drag onto an engine to share its layer, into a gap for its own):</span> ' +
    pipe.map((L, li) => gap(li) + '<span class="wc-lay' + (L.length > 1 ? ' wc-lay-multi' : '') + '">' +
      L.map((k) => {
        const b = BLOCKS.find((x) => x.key === k);
        const step = R.steps.find((s) => s.key === k);
        const state = off.has(k) ? 'off' : step && step.skipped ? 'skip' : 'on';
        return '<span class="wc-blk wc-blk-' + state + (b.core ? ' wc-blk-core' : '') +
          '" data-blk="' + k + '" draggable="' + !b.core + '" title="' + esc(b.role) +
          (state === 'skip' ? ' — SKIPPED: ' + esc(step.skipped) : '') + '">' + esc(b.name) +
          (state === 'skip' ? ' &#9888;' : '') + '</span>';
      }).join('') + '</span>').join('') + gap(pipe.length);
}

/* the sense picker (brief 34): every prompt word the register knows */
function drawPicker(el, R, chosen, go) {
  const table = R.state.senseTable || [];
  if (!table.length) { el.innerHTML = ''; return; }
  el.innerHTML = '<span class="small dim">what do you mean by:</span> ' + table.map((w) =>
    '<span class="wc-sw"><b>' + esc(w.word) + '</b> ' + w.options.map((o) =>
      '<button class="wc-so' + (o.key === w.active ? ' on' : '') + '" data-w="' + esc(w.word) +
      '" data-s="' + esc(o.key) + '" title="' + esc(o.domain) + '">' + esc(o.label) + '</button>').join('') +
    '</span>').join(' ');
  el.onclick = (e) => {
    const b = e.target.closest('.wc-so');
    if (!b) return;
    const w = b.getAttribute('data-w'), k = b.getAttribute('data-s');
    if (k === 'doc') delete chosen[w]; else chosen[w] = k;
    go();
  };
}

function draw(world, R, prevRun) {
  const delta = runDelta(prevRun, R);
  const wires = [];
  const info = new Map();
  const ctx = {
    last: null,
    cur: null,
    chip(id, layer, cls, html, title, rows, key) {
      info.set(id, { layer, title, rows });
      return '<div class="wc-chip ' + cls + '" data-c="' + id + '"' +
        (key != null ? ' data-k="' + esc(key) + '"' : '') + '>' + html + '</div>';
    },
    wire(a, b, w, cls, why) { if (a && b) wires.push({ a, b, w, cls, why }); },
  };
  /* group the executed steps back into their layers */
  const layers = [];
  R.steps.filter((s) => !s.skipped).forEach((s) => {
    const cur = layers[layers.length - 1];
    if (cur && cur.li === s.layer) cur.keys.push(s.key);
    else layers.push({ li: s.layer, keys: [s.key] });
  });
  const cols = layers.map(({ keys }) => {
    const commit = openLayer(ctx);
    const parts = keys.map((k) => {
      const b = BLOCKS.find((x) => x.key === k);
      return '<div class="wc-eng" data-eng="' + k + '">' +
        '<div class="wc-lh" data-lh="' + k + '" title="Click: what this engine does"><b>' +
        b.name + '</b><span class="small dim">' + b.role + '</span></div>' +
        renderBlock(k, R.state, world, ctx) + '</div>';
    }).join('');
    commit();
    return '<div class="wc-col' + (keys.length > 1 ? ' wc-col-multi' : '') + '">' + parts + '</div>';
  }).join('');

  mount.innerHTML = deltaLine(delta) + '<div class="wc-wrap"><div class="wc-cols">' + cols +
    '<svg class="wc-wires" aria-hidden="true"></svg></div>' +
    '<aside class="wc-side"><p class="dim small">Click any box for its full evidence trail — everything upstream that produced it, everything downstream it feeds. Click an engine title for what the engine does.</p></aside></div>' +
    meaningCard(R);

  if (delta) {
    mount.querySelectorAll('.wc-eng').forEach((eng) => {
      const d = delta.layers[eng.getAttribute('data-eng')];
      if (!d) return;
      const added = new Set(d.added.map((x) => String(x).split(':')[0]));
      eng.querySelectorAll('.wc-chip[data-k]').forEach((el) => {
        if (added.has(el.getAttribute('data-k'))) el.classList.add('wc-new');
      });
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
  mount.querySelectorAll('.wc-eng').forEach((eng) => {
    counts[eng.getAttribute('data-eng')] = eng.querySelectorAll('.wc-chip').length;
  });
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
      /* chip rects are viewport-space; the canvas lives in the box's CONTENT
         space, so both scroll offsets must come back in (the scrolled-right
         wire bug the founder caught live on v0.5.4) */
      const x1 = (same ? ra.left : ra.right) - br.left + box.scrollLeft, y1 = ra.top + ra.height / 2 - br.top + box.scrollTop;
      const x2 = rb.left - br.left + box.scrollLeft, y2 = rb.top + rb.height / 2 - br.top + box.scrollTop;
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
    ' · ' + (m.kind === 'pack' ? 'from a meaning pack' : m.kind === 'sense' ? 'from the senses register' : 'from the document') + '</span></h3>' +
    (m.def ? '<p>' + esc(m.def) + '</p>' : '') +
    (m.quote ? '<div class="ndoc-anchor">&sect; ' + esc(m.section) + '<blockquote>&ldquo;' + esc(m.quote) + '&rdquo;</blockquote></div>' : '') +
    '<p class="small">bound via <b>' + m.via.map(esc).join(', ') + '</b> · blast radius <b>' + m.blast + '</b></p>' +
    (others.length ? '<p class="small dim">also plausible: ' + others.map((o) => esc(o.label) + ' (' + o.total + ')').join(' · ') + '</p>' : '') +
    '</div>';
}
