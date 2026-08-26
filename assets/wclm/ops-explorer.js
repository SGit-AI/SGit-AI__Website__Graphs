/* @module wclm/ops-explorer
   Single responsibility: the operators explorer (brief 36 + its iPad review).
   Landing: the pipeline drawn as a clickable flow plus a card per operator.
   Tree: clicking an operator opens its book page; clicking a file opens it —
   RENDERED means really rendered (marked-up markdown, the html page embedded
   live, json as the docs-files-style data views), RAW means the tinted
   byte-honest source. Every file deep-links (#tokenise/schema.json). */
'use strict';
import { rawJsonHtml, rawMdHtml, rawJsHtml, buildView } from '../universe/core/fileview.js';
import { anatomyFlowSvg, anatomyBodyHtml, anatomyPaneHtml } from './code-anatomy.js';
import { ioFlowSvg } from './ioflow.js';

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g,
  (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const JSON_VIEW = { 'schema.json': 'opschema', 'data.json': 'opdata',
  'examples.json': 'opexamples', 'manifest.json': 'opmanifest' };
const FLOW = ['tokenise', 'normalise', 'resolve', 'senses', 'operators', 'passthrough',
  'attend', 'bind', 'expand', 'converge', 'translate', 'fractal'];

const mount = document.getElementById('opsx');
if (mount) {
  fetch('manifest.json').then((r) => r.json()).then(boot)
    .catch(() => { mount.innerHTML = '<p class="dim">the manifest did not load</p>'; });
}

function boot(man) {
  const open = new Set();
  let cur = null;   /* { key, name, text, tab } */
  const opOf = (k) => man.operators.find((o) => o.key === k);

  const draw = () => {
    mount.innerHTML = '<div class="fx-wrap"><nav class="fx-tree">' +
      man.operators.map((o) =>
        '<div class="fx-dir' + (open.has(o.key) ? ' on' : '') + '" data-d="' + o.key + '">' +
        (open.has(o.key) ? '&#9662;' : '&#9656;') + ' <b>' + esc(o.key) + '</b>' +
        (o.core ? ' <span class="small dim">core</span>' : '') +
        '<span class="small dim"> · ' + o.reads.join('+') + ' &rarr; ' + o.writes.join('+') + '</span></div>' +
        (open.has(o.key) ? o.files.map((f) =>
          '<div class="fx-file' + (cur && cur.key === o.key && cur.name === f.name ? ' on' : '') +
          '" data-k="' + o.key + '" data-f="' + esc(f.name) + '">' + esc(f.name) +
          ' <span class="small dim">' + f.bytes + 'b</span></div>').join('') : '')
      ).join('') + '</nav><section class="fx-body">' + body() + '</section></div>';
    if (cur && cur.anat && cur.seg) {
      mount.querySelectorAll('[data-seg]').forEach((el) =>
        el.classList.toggle('on', el.getAttribute('data-seg') === cur.seg));
    }
  };

  /* the landing overview: the pipeline as a clickable flow, then the cards */
  const overview = () => {
    const flow = FLOW.map((k) => opOf(k)).filter(Boolean).map((o, i, all) => {
      const prev = all[i - 1];
      const arrow = prev ? '<span class="ov-arr">&mdash;<code>' + prev.writes.join('+') + '</code>&rarr;</span>' : '';
      return arrow + '<button class="ov-op' + (o.core ? ' core' : '') + '" data-open="' + o.key + '">' + esc(o.key) + '</button>';
    }).join('');
    return '<div class="ov-flow"><span class="ov-arr"><code>text</code>&rarr;</span>' + flow +
      '<span class="ov-arr">&rarr;<code>the meaning</code></span></div>' +
      '<p class="small dim">The pipeline in canonical order — each arrow carries the data type the previous engine writes. Click any engine for its book page; four are core (solid), the rest toggle, drag and mix on <a href="../index.html">the WCLM page</a>.</p>' +
      '<div class="ov-cards">' + FLOW.map((k) => opOf(k)).filter(Boolean).map((o) =>
        '<div class="ov-card"><h4><button class="ov-name" data-open="' + o.key + '">' + esc(o.key) + '</button>' +
        (o.core ? ' <span class="ndoc-fam ndoc-f-core">core</span>' : '') + '</h4>' +
        '<p class="small">' + esc(o.role) + '.</p>' +
        '<p class="small"><code>' + o.reads.join('+') + ' &rarr; ' + o.writes.join('+') + '</code></p>' +
        '<p class="small"><a href="' + o.key + '/">the workbench</a> · ' +
        '<a href="#' + o.key + '/' + o.key + '.md" data-open="' + o.key + '">the book page</a> · ' +
        o.files.length + ' files</p></div>').join('') + '</div>';
  };

  const body = () => {
    if (!cur) return overview();
    const path = cur.key + '/' + cur.name;
    const isJs = cur.name.endsWith('.js');
    const tabs = (isJs && !cur.anat ? ['raw'] : ['rendered', 'raw']).map((t) =>
      '<button class="fx-tab' + (cur.tab === t ? ' on' : '') + '" data-t="' + t + '">' + t + '</button>').join('');
    return '<div class="fx-head"><code>' + esc(path) + '</code> ' + tabs +
      ' <a class="small" href="' + esc(path) + '">open as a plain URL</a>' +
      (cur.name === 'index.html' ? ' <a class="small" href="' + cur.key + '/">open the workbench full-page</a>' : '') +
      '</div>' + render();
  };

  const render = () => {
    const n = cur.name;
    if (n.endsWith('.js') && cur.tab === 'rendered' && cur.anat) {
      /* the anatomy (brief 37): fluxogram + grouped code + explanation pane */
      return anatomyFlowSvg(cur.anat) +
        '<div class="an-cols"><div class="an-code">' + anatomyBodyHtml(cur.text, cur.anat) +
        '</div><aside class="an-pane wc-side">' + anatomyPaneHtml(cur.anat, cur.seg) + '</aside></div>';
    }
    if (cur.tab === 'raw' || n.endsWith('.js')) {
      if (n.endsWith('.json')) return rawJsonHtml(cur.text);
      if (n.endsWith('.md')) return rawMdHtml(cur.text);
      return rawJsHtml(cur.text);
    }
    if (n.endsWith('.md')) {
      return window.marked ? '<div class="mdread">' + window.marked.parse(cur.text) + '</div>' : rawMdHtml(cur.text);
    }
    if (n.endsWith('.html')) {
      return '<iframe class="fx-frame" src="' + cur.key + '/' + esc(n) + '" title="' + esc(cur.key) + ' workbench"></iframe>';
    }
    if (n.endsWith('.json')) {
      try {
        const d = JSON.parse(cur.text);
        const html = buildView(JSON_VIEW[n], d);
        if (html) {
          const flow = n === 'schema.json'
            ? ioFlowSvg({ key: d.operator, io: { reads: d.io.reads.map((x) => x.type), writes: d.io.writes.map((x) => x.type) } })
            : '';
          return '<div class="fx-view">' + flow + html + '</div>';
        }
      } catch (e) { /* fall through to the tinted source */ }
      return rawJsonHtml(cur.text);
    }
    return rawJsHtml(cur.text);
  };

  const load = (key, name) => fetch(key + '/' + name).then((r) => r.text()).then(async (text) => {
    let anat = null;
    if (name.endsWith('.js')) {
      anat = await fetch(key + '/anatomy.json').then((r) => (r.ok ? r.json() : null)).catch(() => null);
    }
    cur = { key, name, text, anat, seg: anat ? anat.segments[0].id : null, tab: 'rendered' };
    if (name.endsWith('.js') && !anat) cur.tab = 'raw';
    location.hash = key + '/' + name;
    draw();
  });

  mount.addEventListener('click', (e) => {
    const go = e.target.closest('[data-open]');
    if (go) {
      const k = go.getAttribute('data-open');
      open.add(k);
      load(k, k + '.md');
      return;
    }
    const d = e.target.closest('[data-d]');
    if (d) {
      const k = d.getAttribute('data-d');
      if (open.has(k) && cur && cur.key === k) { open.delete(k); draw(); return; }
      open.add(k);
      load(k, k + '.md');            /* opening a folder opens its book page */
      return;
    }
    const f = e.target.closest('[data-f]');
    if (f) { load(f.getAttribute('data-k'), f.getAttribute('data-f')); return; }
    const sg = e.target.closest('[data-goseg], .fx-body [data-seg]');
    if (sg && cur && cur.anat) {
      cur.seg = sg.getAttribute('data-goseg') || sg.getAttribute('data-seg');
      draw();
      return;
    }
    const t = e.target.closest('[data-t]');
    if (t && cur) { cur.tab = t.getAttribute('data-t'); draw(); }
  });

  const want = location.hash.slice(1);
  if (want.includes('/')) {
    const [k, n] = want.split('/');
    if (man.operators.some((o) => o.key === k)) { open.add(k); load(k, n); return; }
  }
  draw();
}
