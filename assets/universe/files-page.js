/* @module universe/files-page
   Single responsibility: the file explorer's shell (v0.5.1) — the tree of the
   document's artefacts on the left (the authored folder and the generated core
   data), the file on the right, raw or through its data view. The manifest is
   generated at build time (window.FILEX); files are fetched on click; the
   founder's ask verbatim: raw mode with minimal formatting, plus specific
   data-driven views, so the cross-referenced estate stays inspectable. */
'use strict';
import { viewOf, rawJsonHtml, rawMdHtml, buildView } from './core/fileview.js';

const FX = window.FILEX;
if (FX) boot();

function boot() {
  const root = document.getElementById('filex');
  root.innerHTML = '<aside class="fx-tree"></aside>' +
    '<section class="fx-main"><div class="fx-head" hidden>' +
    '<code class="fx-name"></code><span class="fx-size dim small"></span><span class="sp"></span>' +
    '<button class="fx-tab" data-tab="view">view</button>' +
    '<button class="fx-tab" data-tab="raw">raw</button>' +
    '<a class="fx-open small" target="_blank" rel="noopener">open file &nearr;</a></div>' +
    '<div class="fx-body"><p class="dim">Pick a file on the left. Raw is always there; ' +
    'files the build understands also get their own view.</p></div></section>';
  const tree = root.querySelector('.fx-tree');
  const head = root.querySelector('.fx-head');
  const body = root.querySelector('.fx-body');
  const kb = (b) => (b > 9999 ? Math.round(b / 1024) + ' KB' : b + ' B');

  tree.innerHTML = FX.folders.map((f) =>
    '<div class="fx-folder">' + f.label + '/</div>' + f.files.map((x) =>
      '<div class="fx-file" data-path="' + f.base + '/' + x.n + '" data-name="' + x.n + '">' +
      '<span class="fx-fn">' + x.n + '</span><span class="fx-fb dim">' + kb(x.b) + '</span></div>').join('')
  ).join('');

  let cur = null;   /* {name, path, text, view} */
  function render(tab) {
    head.hidden = false;
    head.querySelector('.fx-name').textContent = cur.path;
    head.querySelector('.fx-size').textContent = kb(cur.text.length);
    head.querySelector('.fx-open').href = cur.path;
    const hasView = !!cur.view;
    head.querySelector('[data-tab="view"]').hidden = !hasView;
    if (!hasView) tab = 'raw';
    head.querySelectorAll('.fx-tab').forEach((b) =>
      b.classList.toggle('on', b.getAttribute('data-tab') === tab));
    if (tab === 'raw') {
      body.innerHTML = cur.name.endsWith('.json') ? rawJsonHtml(cur.text) : rawMdHtml(cur.text);
      return;
    }
    if (cur.view === 'rendered') {
      body.innerHTML = window.marked
        ? '<div class="mdread">' + window.marked.parse(cur.text) + '</div>'
        : rawMdHtml(cur.text);
      return;
    }
    let html = null;
    try { html = buildView(cur.view, JSON.parse(cur.text)); } catch (e) { html = null; }
    body.innerHTML = html || rawJsonHtml(cur.text);
  }

  function open(path, name) {
    tree.querySelectorAll('.fx-file').forEach((x) =>
      x.classList.toggle('on', x.getAttribute('data-path') === path));
    body.innerHTML = '<p class="dim">loading ' + name + ' …</p>';
    fetch(path).then((r) => { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then((text) => {
        cur = { name, path, text, view: viewOf(name) };
        try { history.replaceState(null, '', '#' + path); } catch (e) { /* fine */ }
        render(cur.view ? 'view' : 'raw');
      })
      .catch(() => { body.innerHTML = '<p class="dim">could not load ' + name + '</p>'; });
  }

  root.addEventListener('click', (e) => {
    const f = e.target.closest('.fx-file');
    if (f) { open(f.getAttribute('data-path'), f.getAttribute('data-name')); return; }
    const t = e.target.closest('.fx-tab');
    if (t && cur) render(t.getAttribute('data-tab'));
  });

  /* deep link: #docs/<slug>/ids.json opens that file; default is the source */
  const want = location.hash.slice(1);
  const first = tree.querySelector('[data-path="' + want + '"]')
    || tree.querySelector('[data-name="source.md"]') || tree.querySelector('.fx-file');
  if (first) open(first.getAttribute('data-path'), first.getAttribute('data-name'));
}
