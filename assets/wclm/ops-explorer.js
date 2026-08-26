/* @module wclm/ops-explorer
   Single responsibility: the operators explorer (brief 36) — every operator
   folder as a tree on the left, every file readable on the right, raw (the
   exact bytes) or rendered (tinted json/js, marked-up markdown), each file
   deep-linkable (#tokenise/schema.json). The v0.5.1 document explorer's
   pattern, applied to the engine's own building blocks. */
'use strict';
import { rawJsonHtml, rawMdHtml, rawJsHtml } from '../universe/core/fileview.js';

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g,
  (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const mount = document.getElementById('opsx');
if (mount) {
  fetch('manifest.json').then((r) => r.json()).then(boot)
    .catch(() => { mount.innerHTML = '<p class="dim">the manifest did not load</p>'; });
}

function boot(man) {
  const open = new Set();
  let cur = null;   /* { key, name, text, tab } */

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
  };

  const body = () => {
    if (!cur) return '<p class="dim">Pick a file. Every operator folder holds its code (js), its book page (md), its schema, its official data, its example vectors and its workbench (html) — raw or rendered.</p>';
    const path = cur.key + '/' + cur.name;
    const tabs = ['rendered', 'raw'].map((t) =>
      '<button class="fx-tab' + (cur.tab === t ? ' on' : '') + '" data-t="' + t + '">' + t + '</button>').join('');
    return '<div class="fx-head"><code>' + esc(path) + '</code> ' + tabs +
      ' <a class="small" href="' + esc(path) + '">open as a plain URL</a>' +
      (cur.name === 'index.html' ? ' <a class="small" href="' + cur.key + '/">open the workbench</a>' : '') +
      '</div>' + render();
  };

  const render = () => {
    const n = cur.name;
    if (cur.tab === 'raw') return '<pre class="fv-raw">' + esc(cur.text) + '</pre>';
    if (n.endsWith('.json')) return rawJsonHtml(cur.text);
    if (n.endsWith('.js')) return rawJsHtml(cur.text);
    if (n.endsWith('.md')) {
      return window.marked ? '<div class="mdread">' + window.marked.parse(cur.text) + '</div>' : rawMdHtml(cur.text);
    }
    return rawJsHtml(cur.text);   /* html source, tinted */
  };

  const load = (key, name) => fetch(key + '/' + name).then((r) => r.text()).then((text) => {
    cur = { key, name, text, tab: 'rendered' };
    location.hash = key + '/' + name;
    draw();
  });

  mount.addEventListener('click', (e) => {
    const d = e.target.closest('[data-d]');
    if (d) {
      const k = d.getAttribute('data-d');
      if (open.has(k)) open.delete(k); else open.add(k);
      draw();
      return;
    }
    const f = e.target.closest('[data-f]');
    if (f) { load(f.getAttribute('data-k'), f.getAttribute('data-f')); return; }
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
