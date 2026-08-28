/* @module explorer/shell
   Single responsibility: the file explorer's shell — the tree of a subject's
   artefacts on the left, the file on the right, raw or through its data view.
   The manifest is generated at build time (window.FILEX); files are fetched on
   click; the founder's ask verbatim: raw mode with minimal formatting, plus
   specific data-driven views, so the cross-referenced estate stays inspectable.

   Built for one document (v0.5.1), it now serves a book's folder too, which is
   why it moved out of universe/ and up to its own home: the views stay in pure
   modules it asks in turn, so a new subject brings its views and not a copy of
   this file. */
'use strict';
import { viewOf, rawJsonHtml, rawMdHtml, rawJsHtml, buildView } from '../universe/core/fileview.js';
import { bookViewOf, buildBookView, binaryKind, rawPyHtml } from './bookview.js';
import { issueViewOf, issueHtml, statusSummary } from './issueview.js';

/* The view modules are asked in order of how specific their claim is. An issue
   is a .md that the document views would render as plain markdown, and a book's
   graph/index.json is not a document's core index, so both are asked before the
   general ones. */
const resolve = (name, base) => issueViewOf(name, base) || bookViewOf(name, base) || viewOf(name);
const build = (view, d) => buildBookView(view, d) || buildView(view, d);

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
  if (FX.kind === 'issues') {
    const files = FX.folders.flatMap((f) => f.files.map((x) => ({ path: f.base + '/' + x.n })));
    const sum = document.createElement('div');
    sum.className = 'iv-summary';
    sum.innerHTML = '<h3>Who is carrying what</h3>' + statusSummary(files);
    root.parentNode.insertBefore(sum, root);
  }
  const tree = root.querySelector('.fx-tree');
  const head = root.querySelector('.fx-head');
  const body = root.querySelector('.fx-body');
  const kb = (b) => (b > 9999 ? Math.round(b / 1024) + ' KB' : b + ' B');
  const escHtml = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

  /* Folders collapse. One document has two folders and wants them open; a book
     has twenty and does not. `open` is set by the generator, never guessed. */
  tree.innerHTML = FX.folders.map((f, i) =>
    '<div class="fx-folder' + (f.open === false ? '' : ' fx-op') + '" data-fi="' + i + '">' +
    '<span class="fx-caret">\u25b8</span>' + f.label + '/<span class="fx-fc dim">' + f.files.length + '</span></div>' +
    '<div class="fx-files" data-fi="' + i + '"' + (f.open === false ? ' hidden' : '') + '>' + f.files.map((x) =>
      '<div class="fx-file" data-path="' + (f.base ? f.base + '/' : '') + x.n + '" data-name="' + x.n + '">' +
      '<span class="fx-fn">' + x.n + '</span><span class="fx-fb dim">' + kb(x.b) + '</span></div>').join('') +
    '</div>'
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
      const n = cur.name;
      body.innerHTML = n.endsWith('.json') ? rawJsonHtml(cur.text)
        : n.endsWith('.py') ? rawPyHtml(cur.text)
          : n.endsWith('.js') ? rawJsHtml(cur.text)
            : n.endsWith('.html') ? '<pre class="fv-raw">' + escHtml(cur.text) + '</pre>'
              : rawMdHtml(cur.text);
      return;
    }
    if (cur.view === 'issue') {
      body.innerHTML = issueHtml(cur.text, cur.path,
        window.marked ? (md) => window.marked.parse(md) : null);
      return;
    }
    if (cur.view === 'rendered') {
      body.innerHTML = window.marked
        ? '<div class="mdread">' + window.marked.parse(cur.text) + '</div>'
        : rawMdHtml(cur.text);
      return;
    }
    let html = null;
    try { html = build(cur.view, JSON.parse(cur.text)); } catch (e) { html = null; }
    body.innerHTML = html || rawJsonHtml(cur.text);
  }

  /* Images and PDFs are shown, never fetched as text: a 500KB PNG read into a
     <pre> is how an explorer becomes unusable. */
  function showBinary(kind, path, name) {
    head.hidden = false;
    head.querySelector('.fx-name').textContent = path;
    head.querySelector('.fx-size').textContent = '';
    head.querySelector('.fx-open').href = path;
    head.querySelectorAll('.fx-tab').forEach((b) => { b.hidden = true; });
    /* a book figure has a provenance entry; say so rather than showing pixels alone */
    const fig = /^figures\//.test(path) && FX.kind === 'book'
      ? '<p class="small">Figure <code>' + escHtml(name) + '</code> &middot; ' +
        '<a href="figures.html#fig-' + escHtml(name.slice(0, 2)) + '">its release tag, its chapter ' +
        'and what shipped in it &rarr;</a></p>'
      : '';
    body.innerHTML = kind === 'image'
      ? fig + '<div class="fx-img"><img src="' + path + '" alt="' + escHtml(name) + '" loading="lazy"></div>'
      : '<p>' + escHtml(name) + ' is a PDF. <a href="' + path + '" target="_blank" rel="noopener">Open it &nearr;</a></p>';
    cur = null;
  }

  function open(path, name) {
    tree.querySelectorAll('.fx-file').forEach((x) =>
      x.classList.toggle('on', x.getAttribute('data-path') === path));
    try { history.replaceState(null, '', '#' + path); } catch (e) { /* fine */ }
    const bin = binaryKind(name);
    if (bin) { showBinary(bin, path, name); return; }
    body.innerHTML = '<p class="dim">loading ' + name + ' …</p>';
    fetch(path).then((r) => { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then((text) => {
        const i = path.lastIndexOf('/');
        const base = i < 0 ? '' : path.slice(0, i);
        cur = { name, path, text, view: resolve(name, base) };
        head.querySelectorAll('.fx-tab').forEach((b) => { b.hidden = false; });
        render(cur.view ? 'view' : 'raw');
      })
      .catch(() => { body.innerHTML = '<p class="dim">could not load ' + name + '</p>'; });
  }

  root.addEventListener('click', (e) => {
    const d = e.target.closest('.fx-folder');
    if (d) {
      const list = tree.querySelector('.fx-files[data-fi="' + d.getAttribute('data-fi') + '"]');
      list.hidden = !list.hidden;
      d.classList.toggle('fx-op', !list.hidden);
      return;
    }
    const f = e.target.closest('.fx-file');
    if (f) { open(f.getAttribute('data-path'), f.getAttribute('data-name')); return; }
    const t = e.target.closest('.fx-tab');
    if (t && cur) render(t.getAttribute('data-tab'));
  });

  /* deep link: #docs/<slug>/ids.json opens that file; default is the source */
  const want = location.hash.slice(1);
  const first = tree.querySelector('.fx-file[data-path="' + want + '"]')
    || tree.querySelector('[data-name="source.md"]') || tree.querySelector('.fx-file');
  if (first) {
    const group = first.closest('.fx-files');
    if (group && group.hidden) {
      group.hidden = false;
      tree.querySelector('.fx-folder[data-fi="' + group.getAttribute('data-fi') + '"]').classList.add('fx-op');
    }
    open(first.getAttribute('data-path'), first.getAttribute('data-name'));
  }
}
