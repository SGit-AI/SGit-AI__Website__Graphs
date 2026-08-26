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

  mount.innerHTML =
    '<div class="op-head">' + ioFlow(block) +
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
    out.innerHTML = '<div class="op-cols">' +
      pane('the input', 'what ' + key + ' read — its declared types, sliced from the state',
        Object.keys(r.input).map((k) => sub(k, r.input[k])).join('')) +
      '<div class="op-mid"><div class="op-box' + (step && step.skipped ? ' op-skip' : '') + '"><b>' + esc(block.name) + '</b>' +
      (step && step.skipped ? '<p class="small">SKIPPED: ' + esc(step.skipped) + '</p>'
        : '<p class="small">' + esc(block.role) + '</p>') +
      '<p class="small dim">opts: <code>' + esc(JSON.stringify(opts)) + '</code></p>' +
      '<p class="small"><a href="' + key + '.md">how it works (md)</a> · <a href="data.json">its data</a> · <a href="schema.json">its schema</a></p></div></div>' +
      pane('the output', 'what ' + key + ' wrote — its watch keys after the run',
        Object.keys(r.output).map((k) => sub(k, r.output[k])).join('')) +
      '</div><details class="op-dbg"><summary>debug: the full state after the run</summary>' +
      rawJsonHtml(JSON.stringify(stripOpts(r.full.state))) + '</details>';
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

/* the typed IO flow: reads → operator → writes, from the schema itself */
function ioFlow(block) {
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
