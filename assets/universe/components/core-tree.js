/* @module universe/components/core-tree
   Single responsibility: the core-graph tree pane, per brief 29 — the document
   expanded bit by bit, all the way to the word. Sections come from the core
   index; a section's blocks, sentences and words arrive only when it is first
   opened, fetched from its own shard (the graphs-of-graphs answer to one big
   file). Clicking a row shows everything the model knows about that node, and
   selects it on the canvas when the canvas has it. A part of <uni-graph>. */
'use strict';
import { coreState, mergeShard, childrenOf, breadcrumb, loadForms, loadTokens,
  coreRecord, formRecord } from '../core/coretree.js';

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g,
  (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** Open or close the tree; opts: { base } (the core data folder for the doc). */
export function toggleCoreTree(host, opts) {
  const open = host.querySelector('.uni-coretree');
  if (open) { open.remove(); return; }
  build(host, opts || {});
}

function build(host, opts) {
  const el = document.createElement('div');
  el.className = 'uni-coretree';
  el.innerHTML = '<div class="pb-head"><b>The core tree</b> ' +
    '<button class="ct-mode on" data-mode="tree">tree</button>' +
    '<button class="ct-mode" data-mode="words">words</button> ' +
    '<span class="dim small">document &rarr; section &rarr; block &rarr; sentence &rarr; word</span>' +
    '<span class="sp"></span><button class="pb-close">&#10005;</button></div>' +
    '<div class="ct-rows dim small">loading the core index &hellip;</div>';
  host.querySelector('.uni-graphbox').appendChild(el);
  const rowsEl = el.querySelector('.ct-rows');
  const expanded = new Set();
  const loading = new Set();
  let st = null;
  let picked = null;
  let mode = 'tree';

  const get = (f) => fetch(opts.base + f).then((r) => {
    if (!r.ok) throw new Error(f + ' ' + r.status);
    return r.json();
  });

  get('index.json').then((idx) => {
    st = coreState(idx);
    render();
    toggleRow(st.doc);   /* open the root, fetching its own shard if it has one */
    return get(idx.forms).then((w) => { loadForms(st, w); if (picked) pick(picked); })
      .then(() => (idx.tokens ? get(idx.tokens).then((t) => loadTokens(st, t)) : null));
  }).catch(() => { rowsEl.textContent = 'no core data for this document yet'; });

  function rows(id, depth, out) {
    const n = st.nodes.get(id);
    const kids = childrenOf(st, id);
    const leaf = kids && !kids.length;
    const label = n.kind === 'wrd' ? n.label
      : n.kind === 'sec' || n.kind === 'doc' ? n.label
      : n.kind === 'sen' ? n.label : '[' + n.kind + '] ' + n.label;
    const badge = n.counts && n.counts.words ? ' <span class="ct-n">' + n.counts.words + 'w</span>' : '';
    const marks = n.marks && n.marks.length ? ' ct-' + n.marks.join(' ct-') : '';
    out.push('<div class="ct-row' + (picked === id ? ' on' : '') + marks + '" data-id="' + esc(id) +
      '" style="padding-left:' + (depth * 0.85) + 'rem">' +
      '<span class="ct-exp" data-exp="' + esc(id) + '">' +
      (leaf ? '&middot;' : expanded.has(id) ? '&#9662;' : '&#9656;') + '</span> ' +
      '<span class="ct-lab">' + esc(label) + '</span>' + badge + '</div>');
    if (expanded.has(id) && kids) kids.forEach((k) => rows(k, depth + 1, out));
  }

  function render() {
    rowsEl.classList.remove('dim');
    if (mode === 'words') { renderWords(); return; }
    const out = [];
    rows(st.doc, 0, out);
    rowsEl.innerHTML = out.join('');
  }

  /* the words mode (brief 30): every form a token, ranked, classed, clickable */
  function renderWords() {
    if (!st.tokens) { rowsEl.innerHTML = '<span class="dim small">no token analysis yet</span>'; return; }
    const s = st.tokens.stats;
    const head = '<div class="small dim">' + s.instances + ' words &middot; ' + s.forms +
      ' forms &middot; ' + s.by_class.content + ' content / ' + s.by_class.padding +
      ' padding (' + Math.round(s.padding_share * 100) + '% of use) / ' + s.by_class.verb +
      ' verb &middot; ' + s.hapax + ' used once &middot; ' + s.stem_families + ' families</div>';
    const cap = 250;
    const list = [];
    st.tokens.map.forEach((t) => {
      if (list.length >= cap) return;
      list.push('<div class="ct-row ct-w ctc-' + t.class + (picked === 'w:' + t.form ? ' on' : '') +
        '" data-form="' + esc(t.form) + '"><span class="ct-lab">' + esc(t.form) + '</span>' +
        ' <span class="ct-n">×' + t.count + (t.spread >= 0.9 && t.count >= 10 ? ' ◊' : '') + '</span></div>');
    });
    rowsEl.innerHTML = head + list.join('') +
      (st.tokens.map.size > cap ? '<div class="dim small">… and ' + (st.tokens.map.size - cap) +
        ' more, all in tokens.json (◊ marks different-meanings candidates)</div>' : '');
  }

  function toggleRow(id) {
    if (expanded.has(id)) { expanded.delete(id); render(); return; }
    const n = st.nodes.get(id);
    if (childrenOf(st, id) === null && !loading.has(id)) {
      loading.add(id);
      get(n.shard).then((sh) => { mergeShard(st, id, sh); expanded.add(id); render(); })
        .catch(() => { loading.delete(id); });
      return;
    }
    expanded.add(id);
    render();
  }

  function pick(id) {
    picked = id;
    const rows = coreRecord(st, id);
    const path = breadcrumb(st, id);
    host.inspectCore({ id, rows, path, label: st.nodes.get(id).label });
    if (!host.trySelect(id) && path.length > 1) {
      /* the canvas has no word-level nodes; light the nearest section it does have */
      for (let i = path.length - 2; i >= 0; i--) if (host.trySelect(path[i].id)) break;
    }
    render();
  }

  el.addEventListener('click', (e) => {
    if (e.target.closest('.pb-close')) { el.remove(); return; }
    const m = e.target.closest('.ct-mode');
    if (m && st) {
      mode = m.getAttribute('data-mode');
      el.querySelectorAll('.ct-mode').forEach((x) => x.classList.toggle('on', x === m));
      render(); return;
    }
    const ex = e.target.closest('.ct-exp');
    if (ex) { toggleRow(ex.getAttribute('data-exp')); return; }
    const w = e.target.closest('[data-form]');
    if (w && st) {
      const form = w.getAttribute('data-form');
      picked = 'w:' + form;
      host.inspectCore({ id: picked, rows: formRecord(st, form), label: form,
        path: [{ id: st.doc, kind: 'doc', label: st.title }, { id: picked, kind: 'w', label: form }] });
      render(); return;
    }
    const row = e.target.closest('.ct-row');
    if (row && st) pick(row.getAttribute('data-id'));
  });
}
