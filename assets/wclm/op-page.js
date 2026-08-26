/* @module wclm/op-page
   Single responsibility: one operator's workbench (brief 36) — execute it
   over the real world with the prerequisite chain handled, test it against
   its recorded example vectors, debug the raw state, and visualise input →
   transformation → output with the typed IO flow drawn. Reusable by every
   operator; the operator's own module supplies the custom part (prompts,
   presets, watch keys) through its `ui` export. */
'use strict';
import { BLOCKS, TYPES } from './engine.js';
import { runOperator, prereqOf } from './opruntime.js';
import { renderBlock, openLayer } from './render.js';
import { ioFlowSvg } from './ioflow.js';
import { rawJsonHtml } from '../universe/core/fileview.js';

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g,
  (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const mount = document.getElementById('opwb');
if (mount) boot(mount.getAttribute('data-op'));

async function boot(key) {
  const block = BLOCKS.find((b) => b.key === key);
  const [mod, world, examples] = await Promise.all([
    import('../../v2/wclm/operators/' + key + '/' + key + '.js'),
    fetch('../../data/world.json').then((r) => r.json()),
    fetch('examples.json').then((r) => r.json()).catch(() => null),
  ]);
  const ui = mod.ui || { prompts: ['meaning through connectivity'], watch: [] };
  let opts = {};
  /* the mini-app hook (brief 37): a <key>.css in the folder skins this workbench */
  fetch(key + '.css').then((r) => (r.ok ? r.text() : null)).then((css) => {
    if (css) { const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st); }
  }).catch(() => {});

  mount.innerHTML =
    '<div class="op-head">' + ioFlowSvg(block) +
    '<div><b>' + esc(block.name) + '</b> · ' + (block.core ? 'core' : 'optional') +
    '<p class="small dim">' + esc(block.role) + '. Runs after: ' +
    (prereqOf(key).join(' → ') || 'nothing — it is first') + '.</p></div></div>' +
    '<div class="op-ctl"><input id="op-q" type="text" value="' + esc(ui.prompts[0]) + '" spellcheck="false">' +
    '<button id="op-run">execute</button><button id="op-test">test the vectors</button></div>' +
    '<div class="op-ex">' + ui.prompts.map((p) =>
      '<button class="wc-exb" data-p="' + esc(p) + '">' + esc(p) + '</button>').join('') +
    (ui.presets || []).map((p, i) =>
      '<button class="wc-exb op-preset" data-i="' + i + '">' + esc(p.label) + '</button>').join('') +
    '<button class="wc-exb op-preset" data-i="-1">plain run</button></div>' +
    '<div id="op-out"></div>';

  const out = document.getElementById('op-out');
  const q = document.getElementById('op-q');

  const run = () => {
    const r = runOperator(key, q.value, world, opts, ui.watch);
    const step = r.full.steps.find((x) => x.key === key);
    /* the WCLM's own visual language (brief 37): render the run as chips and
       wires — the previous layer's evidence, the operator, its output — by
       replaying every executed layer through the shared renderer and keeping
       the last two columns plus the wires that land in the final one. */
    const wires = [];
    const info = new Map();
    const colOf = new Map();
    let col = -1;
    const ctx = {
      last: null, cur: null,
      chip(id, layer, cls, html, title, rows, k2) {
        info.set(id, { title, rows });
        colOf.set(id, col);
        return '<div class="wc-chip ' + cls + '" data-c="' + id + '">' + html + '</div>';
      },
      wire(a, b, w, cls, why) { if (a && b) wires.push({ a, b, w, cls, why }); },
    };
    const layers = [];
    r.full.steps.filter((x) => !x.skipped).forEach((x) => {
      const curL = layers[layers.length - 1];
      if (curL && curL.li === x.layer) curL.keys.push(x.key); else layers.push({ li: x.layer, keys: [x.key] });
    });
    let inputHtml = '', outputHtml = '';
    layers.forEach(({ keys }, idx) => {
      col += 1;
      const commit = openLayer(ctx);
      const html = keys.map((k) => renderBlock(k, r.full.state, world, ctx)).join('');
      commit();
      if (idx === layers.length - 2) inputHtml = html;
      if (idx === layers.length - 1) outputHtml = html;
    });
    const lastCol = col;
    const drawn = wires.filter((w) => colOf.get(w.b) === lastCol);
    out.innerHTML = '<div class="op-cols opx">' +
      pane('the input', 'the previous layer&rsquo;s evidence — what ' + key + ' read',
        inputHtml || ('<div class="wc-chip wc-phrase"><span class="dim small">the prompt</span><b>' + esc(q.value) + '</b></div>')) +
      '<div class="op-mid"><div class="op-box' + (step && step.skipped ? ' op-skip' : '') + '"><b>' + esc(block.name) + '</b>' +
      (step && step.skipped ? '<p class="small">SKIPPED: ' + esc(step.skipped) + '</p>'
        : '<p class="small">' + esc(block.role) + '</p>') +
      '<p class="small dim">opts: <code>' + esc(JSON.stringify(opts)) + '</code></p>' +
      '<p class="small"><a href="' + key + '.md">how it works</a> · <a href="data.json">its data</a> · <a href="schema.json">its schema</a></p></div></div>' +
      pane('the output', 'what ' + key + ' wrote — every chip clickable', outputHtml) +
      '<svg class="wc-wires opx-wires" aria-hidden="true"></svg></div>' +
      '<div class="op-sel wc-side"><p class="dim small">Click any chip for its record.</p></div>' +
      '<details class="op-dbg"><summary>debug: the watched slices and the full state</summary>' +
      Object.keys(r.output).map((k) => sub(k, r.output[k])).join('') +
      rawJsonHtml(JSON.stringify(stripOpts(r.full.state))) + '</details>';
    const box = out.querySelector('.opx');
    const svg = out.querySelector('.opx-wires');
    const paint = () => {
      const br = box.getBoundingClientRect();
      svg.setAttribute('width', box.scrollWidth); svg.setAttribute('height', box.scrollHeight);
      svg.innerHTML = drawn.map((w) => {
        const a = box.querySelector('[data-c="' + w.a + '"]');
        const b = box.querySelector('[data-c="' + w.b + '"]');
        if (!a || !b) return '';
        const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
        const x1 = ra.right - br.left + box.scrollLeft, y1 = ra.top + ra.height / 2 - br.top + box.scrollTop;
        const x2 = rb.left - br.left + box.scrollLeft, y2 = rb.top + rb.height / 2 - br.top + box.scrollTop;
        const mid = (x1 + x2) / 2;
        return '<path class="' + (w.cls || 'wc-line') + '" stroke-width="' + Math.max(1, Math.min(5, w.w * 3)) +
          '" d="M' + x1 + ' ' + y1 + ' C' + mid + ' ' + y1 + ' ' + mid + ' ' + y2 + ' ' + x2 + ' ' + y2 + '"/>';
      }).join('');
    };
    requestAnimationFrame(paint);
    out.onclick = (e) => {
      const c = e.target.closest('.wc-chip[data-c]');
      if (!c || !info.has(c.getAttribute('data-c'))) return;
      const it = info.get(c.getAttribute('data-c'));
      out.querySelectorAll('.wc-chip').forEach((x) => x.classList.toggle('wc-sel', x === c));
      out.querySelector('.op-sel').innerHTML = '<div class="wc-sh"><b>' + esc(it.title) + '</b></div>' +
        (it.rows || []).map(([k2, v]) => '<div class="ev-row"><span class="dim">' + esc(k2) + '</span> ' + esc(v) + '</div>').join('');
    };
  };

  const test = () => {
    if (!examples) { out.innerHTML = '<p class="dim">no examples.json in this folder</p>'; return; }
    const rows = examples.vectors.map((v) => {
      const r = runOperator(key, v.prompt, world, v.opts || {}, Object.keys(v.output));
      const ok = JSON.stringify(r.output) === JSON.stringify(v.output);
      return '<div class="op-vec ' + (ok ? 'ok' : 'bad') + '">' + (ok ? '&#10003;' : '&#10007;') +
        ' <b>' + esc(v.prompt) + '</b>' + (v.label ? ' · ' + esc(v.label) : '') +
        (ok ? ' <span class="dim small">replays byte-identical</span>'
          : ' <span class="small">DIFFERS — the engine moved since this vector was recorded</span>') + '</div>';
    });
    const good = rows.filter((r) => r.includes('op-vec ok')).length;
    out.innerHTML = '<div class="op-tests"><p><b>' + good + '/' + examples.vectors.length +
      '</b> vectors replay identically (world: ' + esc(examples.world) + ')</p>' + rows.join('') + '</div>';
  };

  mount.addEventListener('click', (e) => {
    const p = e.target.closest('[data-p]');
    if (p) { q.value = p.getAttribute('data-p'); run(); return; }
    const pr = e.target.closest('.op-preset');
    if (pr) {
      const i = Number(pr.getAttribute('data-i'));
      opts = i < 0 ? {} : (ui.presets[i].opts || {});
      run();
    }
  });
  document.getElementById('op-run').addEventListener('click', run);
  document.getElementById('op-test').addEventListener('click', test);
  q.addEventListener('keydown', (e) => { if (e.key === 'Enter') run(); });
  run();
}

const stripOpts = (s) => { const { opts, ...rest } = s; return rest; };

const pane = (title, hint, body) =>
  '<div class="op-pane"><h4>' + title + '</h4><p class="small dim">' + esc(hint) + '</p>' +
  (body || '<p class="dim small">nothing — this run wrote no such state</p>') + '</div>';

const sub = (k, v) => '<div class="op-sub"><code class="op-k">' + esc(k) + '</code>' +
  rawJsonHtml(JSON.stringify(v)) + '</div>';

/* (the typed IO flow moved to ioflow.js, shared with the explorer) */
