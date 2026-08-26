/* @module wclm/wclm-page
   Single responsibility: the WCLM page's shell — run the deterministic engine
   on the prompt and draw what briefs 31 and 32 asked to see: the layers as
   columns, attention as weighted arcs, EVERY box clickable into its
   explanation (because-of upstream, leads-to downstream), the layer cards,
   the run-to-run impact of a changed prompt, and the example buttons from
   strong to weak connectivity. Computation is in engine.js (pure); the
   explanation pane is in explain.js; this renders, wires and routes. */
'use strict';
import { runEngine, runDelta, LAYERS } from './engine.js';
import { renderExplain, renderLayerCard } from './explain.js';

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g,
  (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const r2 = (x) => Math.round(x * 100) / 100;

/* strong to weak connectivity, the sausages phrase kept verbatim from brief 32 */
const EXAMPLES = ['meaning through connectivity', 'anchor nodes and reference graphs',
  'the confidence of a node', 'graphs of graphs', 'qa',
  'meaning through nodes and graph sausages', 'zebra quantum'];

const mount = document.getElementById('wclm');
if (mount) {
  fetch('data/world.json').then((r) => r.json()).then((world) => boot(world))
    .catch(() => { mount.innerHTML = '<p class="dim">the world file did not load</p>'; });
}

function boot(world) {
  const q = document.getElementById('wc-q');
  const ask = document.querySelector('.wc-ask');
  const ex = document.createElement('div');
  ex.className = 'wc-ex';
  ex.innerHTML = '<span class="small dim">strong &rarr; weak:</span> ' + EXAMPLES.map((e) =>
    '<button class="wc-exb" data-ex="' + esc(e) + '">' + esc(e) + '</button>').join('');
  ask.after(ex);
  let prev = null;
  const go = () => { prev = run(world, q.value, prev); };
  document.getElementById('wc-run').addEventListener('click', go);
  q.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
  ex.addEventListener('click', (e) => {
    const b = e.target.closest('.wc-exb');
    if (b) { q.value = b.getAttribute('data-ex'); go(); }
  });
  addEventListener('resize', () => { if (mount._paint) mount._paint(); });
  go();
}

function run(world, text, prevRun) {
  const R = runEngine(text, world);
  const delta = runDelta(prevRun, R);
  const wires = [];             /* {a, b, w, cls, why} */
  const info = new Map();       /* chip id -> {layer, title, rows} */
  const chip = (id, layer, cls, html, title, rows, key) => {
    info.set(id, { layer, title, rows });
    return '<div class="wc-chip ' + cls + '" data-c="' + id + '"' +
      (key != null ? ' data-k="' + esc(key) + '"' : '') + '>' + html + '</div>';
  };
  const L = R.layers;
  const cols = {};

  cols.tokenise = L.tokenise.map((t) =>
    chip('t' + t.i, 'tokenise', 'wc-tok', '<b>' + esc(t.w) + '</b><code>' + t.hash + '</code>',
      t.w, [['hash', t.hash], ['position', String(t.i + 1)]], t.form)).join('')
    + '<div class="wc-chip wc-phrase"><span class="dim small">phrase</span><code>' + R.phrase.hash + '</code></div>';

  cols.resolve = L.resolve.map((t) => {
    wires.push({ a: 't' + t.i, b: 'r' + t.i, w: 0.4, cls: t.known ? '' : 'wc-dimline',
      why: t.known ? 'the hash exists in this world' : 'no such hash in this world' });
    return chip('r' + t.i, 'resolve', 'wc-res ctc-' + t.class, '<b>' + esc(t.form) + '</b>' +
      (t.known ? '<span class="small">' + t.class + ' · ×' + t.count + ' · w ' + t.w + '</span>'
        : '<span class="small dim">not in this universe</span>'),
      t.form, t.known
        ? [['class', t.class], ['count', '×' + t.count + ' in the document'], ['weight', t.w + ' = classW/log2(2+count)']]
        : [['status', 'unknown: the universe has never seen this word']], t.known ? t.form : null);
  }).join('');

  const pairs = L.attend.pairs.slice(0, 10);
  const pulls = L.attend.pulls.slice(0, 8);
  cols.attend = pairs.map((p, k) => {
    const why = 'share ' + p.w + ' sentence(s) in the document';
    wires.push({ a: 'r' + p.a, b: 'p' + k, w: p.w, cls: '', why });
    wires.push({ a: 'r' + p.b, b: 'p' + k, w: p.w, cls: '', why });
    return chip('p' + k, 'attend', 'wc-pair', esc(p.af) + ' &harr; ' + esc(p.bf) + ' <b>×' + p.w + '</b>',
      p.af + ' ↔ ' + p.bf, [['weight', '×' + p.w + ' shared sentences'], ['kind', 'both words are in the prompt']],
      p.af + '~' + p.bf);
  }).join('') + pulls.map((p, k) => {
    wires.push({ a: 'r' + p.from, b: 'u' + k, w: p.w / 2, cls: 'wc-dimline',
      why: 'travels with it ×' + p.w + ' in the document' });
    return chip('u' + k, 'attend', 'wc-pull dim', '&rarr; ' + esc(p.form) + ' <b>×' + p.w + '</b>',
      '→ ' + p.form, [['kind', 'companion: not in the prompt, pulled in by co-occurrence'], ['weight', '×' + p.w]]);
  }).join('') || '<div class="dim small">no attention: one known content word or fewer</div>';

  const binds = L.bind.slice(0, 9);
  cols.bind = binds.map((b, k) => {
    L.resolve.forEach((t) => {
      if (b.via.indexOf(t.form) !== -1) wires.push({ a: 'r' + t.i, b: 'b' + k, w: b.score, cls: '',
        why: '"' + t.form + '" is in this label' });
    });
    return chip('b' + k, 'bind', 'wc-bind wc-' + b.kind,
      '<b>' + esc(b.label) + '</b><span class="small">' + (b.kind === 'pack' ? 'meaning pack' : esc(b.family)) +
      ' · bind ' + b.score + '</span>', b.label,
      [['source', b.kind === 'pack' ? 'a meaning pack (the world above the document)' : 'the document extraction'],
       ['bind', b.score + ' = ½ label coverage + ½ prompt coverage'],
       ['via', b.via.join(', ')]], b.id);
  }).join('') || '<div class="dim small">nothing bound</div>';

  const boundIds = binds.map((b) => b.id);
  const label = (id) => (world.concepts.find((c) => c.id === id)
    || (world.pack.terms || []).find((p) => p.id === id) || { label: id }).label;
  const neigh = L.expand.reached.filter((id) => boundIds.indexOf(id) === -1).slice(0, 12);
  cols.expand = neigh.map((id, k) => {
    L.expand.links.forEach((l) => {
      const other = l.from === id ? l.to : l.from === id || l.to === id ? l.from : null;
      const bi = boundIds.indexOf(l.from === id ? l.to : l.from);
      if (bi !== -1 && (l.from === id || l.to === id)) {
        wires.push({ a: 'b' + bi, b: 'x' + k, w: 0.5, cls: 'wc-' + l.src + 'line',
          why: (l.from === id ? label(id) + ' ' + l.verb + ' it' : 'it ' + l.verb + ' ' + label(id)) });
      }
    });
    return chip('x' + k, 'expand', 'wc-exp', esc(label(id)), label(id),
      [['id', id], ['kind', 'a neighbour of a bound meaning, one hop out']], id);
  }).join('') || '<div class="dim small">no neighbourhood</div>';

  const ranked = L.converge.slice(0, 6);
  cols.converge = ranked.map((m, k) => {
    const bi = boundIds.indexOf(m.id);
    if (bi !== -1) wires.push({ a: 'b' + bi, b: 'c' + k, w: m.total / 2, cls: '',
      why: 'bind ' + m.score + ' doubled, plus 0.1 per neighbour (' + m.blast + ')' });
    return chip('c' + k, 'converge', 'wc-conv' + (k === 0 ? ' on' : ''),
      '<b>' + esc(m.label) + '</b><span class="small">2·' + m.score + ' + 0.1·' + m.blast + ' = <b>' + r2(m.total) + '</b></span>',
      m.label, [['total', '2·' + m.score + ' + 0.1·' + m.blast + ' = ' + r2(m.total)],
        ['blast radius', String(m.blast)], (m.def ? ['meaning', m.def] : ['meaning', '(no statement carried)'])], m.id);
  }).join('') || '<div class="dim small">no meaning found in this universe</div>';

  mount.innerHTML = deltaLine(delta) + '<div class="wc-wrap"><div class="wc-cols">' + LAYERS.map((l) =>
    '<div class="wc-col"><div class="wc-lh" data-lh="' + l.key + '" title="Click: what this layer does"><b>' +
    l.name + '</b><span class="small dim">' + l.role + '</span></div>' + cols[l.key] + '</div>').join('') +
    '<svg class="wc-wires" aria-hidden="true"></svg></div>' +
    '<aside class="wc-side"><p class="dim small">Click any box for why it is there; click a layer title for what the layer does.</p></aside></div>' +
    meaningCard(R);

  /* new-since-last-run badges, from the pure delta */
  if (delta) {
    Object.keys(delta.layers).forEach((k) => {
      const added = new Set(delta.layers[k].added);
      mount.querySelectorAll('.wc-col:nth-child(' + (LAYERS.findIndex((l) => l.key === k) + 1) + ') .wc-chip[data-k]')
        .forEach((el) => { if (added.has(el.getAttribute('data-k'))) el.classList.add('wc-new'); });
    });
  }

  const pane = mount.querySelector('.wc-side');
  const counts = { tokenise: L.tokenise.length, resolve: L.resolve.filter((t) => t.known).length,
    attend: L.attend.pairs.length + L.attend.pulls.length, bind: L.bind.length,
    expand: L.expand.reached.length, converge: L.converge.length };
  const select = (id) => {
    mount.querySelectorAll('.wc-chip.wc-sel').forEach((x) => x.classList.remove('wc-sel'));
    const el = mount.querySelector('[data-c="' + id + '"]');
    if (el) el.classList.add('wc-sel');
    mount._hot = id;
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
      const hot = mount._hot && (w.a === mount._hot || w.b === mount._hot);
      const ra = a.getBoundingClientRect(); const rb = b.getBoundingClientRect();
      const x1 = ra.right - br.left, y1 = ra.top + ra.height / 2 - br.top + box.scrollTop;
      const x2 = rb.left - br.left, y2 = rb.top + rb.height / 2 - br.top + box.scrollTop;
      const mid = (x1 + x2) / 2;
      return '<path class="' + (w.cls || 'wc-line') + (hot ? ' wc-hot' : mount._hot ? ' wc-cold' : '') +
        '" stroke-width="' + Math.max(1, Math.min(5, w.w * 3)) +
        '" d="M' + x1 + ' ' + y1 + ' C' + mid + ' ' + y1 + ' ' + mid + ' ' + y2 + ' ' + x2 + ' ' + y2 + '"/>';
    }).join('');
  };
  mount._hot = null;
  mount._paint = paint;
  requestAnimationFrame(paint);
  return R;
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
  if (!m) return '<div class="wc-card"><p class="dim">This universe has nothing bound to that. Try a word the pilot document actually uses.</p></div>';
  const others = R.layers.converge.slice(1, 4);
  return '<div class="wc-card">' +
    '<h3>the meaning: ' + esc(m.label) + ' <span class="small dim">score ' + m.total +
    ' · ' + (m.kind === 'pack' ? 'from a meaning pack' : 'from the document') + '</span></h3>' +
    (m.def ? '<p>' + esc(m.def) + '</p>' : '') +
    (m.quote ? '<div class="ndoc-anchor">&sect; ' + esc(m.section) + '<blockquote>&ldquo;' + esc(m.quote) + '&rdquo;</blockquote></div>' : '') +
    '<p class="small">bound via <b>' + m.via.map(esc).join(', ') + '</b> · blast radius <b>' + m.blast + '</b>' +
    (m.out.length ? ' · ' + m.out.map(esc).join(' · ') : '') +
    (m.inn.length ? '<br>read from here: ' + m.inn.map(esc).join(' · ') : '') + '</p>' +
    (others.length ? '<p class="small dim">also plausible: ' + others.map((o) => esc(o.label) + ' (' + o.total + ')').join(' · ') + '</p>' : '') +
    '</div>';
}
