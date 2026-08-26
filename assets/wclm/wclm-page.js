/* @module wclm/wclm-page
   Single responsibility: the WCLM page's shell — run the deterministic engine
   on the prompt and draw what brief 31 asked to see: the layers as columns,
   the look-back and the attention as weighted arcs between them, and the
   meaning at the end with its provenance and blast radius. All computation is
   in engine.js (pure); this fetches the world, renders traces, draws lines. */
'use strict';
import { runEngine, LAYERS } from './engine.js';

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g,
  (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const r2 = (x) => Math.round(x * 100) / 100;

const mount = document.getElementById('wclm');
if (mount) {
  fetch('data/world.json').then((r) => r.json()).then((world) => boot(world))
    .catch(() => { mount.innerHTML = '<p class="dim">the world file did not load</p>'; });
}

function boot(world) {
  const q = document.getElementById('wc-q');
  const go = () => run(world, q.value);
  document.getElementById('wc-run').addEventListener('click', go);
  q.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
  addEventListener('resize', () => { if (mount._paint) mount._paint(); });
  go();
}

function run(world, text) {
  const R = runEngine(text, world);
  const L = R.layers;
  const wires = [];   /* {a, b, w, cls} by data-c ids, drawn after layout */
  const chip = (id, cls, html, title) =>
    '<div class="wc-chip ' + cls + '" data-c="' + id + '"' +
    (title ? ' title="' + esc(title) + '"' : '') + '>' + html + '</div>';

  const cols = {};
  cols.tokenise = L.tokenise.map((t) =>
    chip('t' + t.i, 'wc-tok', '<b>' + esc(t.w) + '</b><code>' + t.hash + '</code>')).join('')
    + '<div class="wc-chip wc-phrase"><span class="dim small">phrase</span><code>' + R.phrase.hash + '</code></div>';

  cols.resolve = L.resolve.map((t) => {
    wires.push({ a: 't' + t.i, b: 'r' + t.i, w: 0.4, cls: t.known ? '' : 'wc-dimline' });
    return chip('r' + t.i, 'wc-res ctc-' + t.class, '<b>' + esc(t.form) + '</b>' +
      (t.known ? '<span class="small">' + t.class + ' · ×' + t.count + ' · w ' + t.w + '</span>'
        : '<span class="small dim">not in this universe</span>'));
  }).join('');

  const pairs = L.attend.pairs.slice(0, 10);
  const pulls = L.attend.pulls.slice(0, 8);
  cols.attend = pairs.map((p, k) => {
    wires.push({ a: 'r' + p.a, b: 'p' + k, w: p.w, cls: '' });
    wires.push({ a: 'r' + p.b, b: 'p' + k, w: p.w, cls: '' });
    return chip('p' + k, 'wc-pair', esc(p.af) + ' &harr; ' + esc(p.bf) + ' <b>×' + p.w + '</b>');
  }).join('') + pulls.map((p, k) => {
    wires.push({ a: 'r' + p.from, b: 'u' + k, w: p.w / 2, cls: 'wc-dimline' });
    return chip('u' + k, 'wc-pull dim', '&rarr; ' + esc(p.form) + ' <b>×' + p.w + '</b>', 'a companion pulled in by co-occurrence');
  }).join('') || '<div class="dim small">no attention: one known content word or fewer</div>';

  const binds = L.bind.slice(0, 9);
  cols.bind = binds.map((b, k) => {
    L.resolve.forEach((t) => { if (b.via.indexOf(t.form) !== -1) wires.push({ a: 'r' + t.i, b: 'b' + k, w: b.score, cls: '' }); });
    return chip('b' + k, 'wc-bind wc-' + b.kind + (b.family ? ' ndocline-' + b.family : ''),
      '<b>' + esc(b.label) + '</b><span class="small">' + (b.kind === 'pack' ? 'meaning pack' : esc(b.family)) +
      ' · bind ' + b.score + '</span>');
  }).join('') || '<div class="dim small">nothing bound</div>';

  const boundIds = binds.map((b) => b.id);
  const neigh = L.expand.reached.filter((id) => boundIds.indexOf(id) === -1).slice(0, 12);
  cols.expand = neigh.map((id, k) => {
    L.expand.links.forEach((l) => {
      const bi = boundIds.indexOf(l.from === id ? l.to : l.from);
      if (bi !== -1 && (l.from === id || l.to === id)) wires.push({ a: 'b' + bi, b: 'x' + k, w: 0.5, cls: 'wc-' + l.src + 'line' });
    });
    const lab = (world.concepts.find((c) => c.id === id) || (world.pack.terms || []).find((p) => p.id === id) || { label: id }).label;
    return chip('x' + k, 'wc-exp', esc(lab));
  }).join('') || '<div class="dim small">no neighbourhood</div>';

  const ranked = L.converge.slice(0, 6);
  cols.converge = ranked.map((m, k) => {
    const bi = boundIds.indexOf(m.id);
    if (bi !== -1) wires.push({ a: 'b' + bi, b: 'c' + k, w: m.total / 2, cls: '' });
    return chip('c' + k, 'wc-conv' + (k === 0 ? ' on' : ''),
      '<b>' + esc(m.label) + '</b><span class="small">2·' + m.score + ' + 0.1·' + m.blast + ' = <b>' + r2(m.total) + '</b></span>');
  }).join('') || '<div class="dim small">no meaning found in this universe</div>';

  mount.innerHTML = '<div class="wc-cols">' + LAYERS.map((l) =>
    '<div class="wc-col"><div class="wc-lh"><b>' + l.name + '</b><span class="small dim">' + l.role + '</span></div>' +
    cols[l.key] + '</div>').join('') +
    '<svg class="wc-wires" aria-hidden="true"></svg></div>' + meaningCard(R);

  const paint = () => {
    const box = mount.querySelector('.wc-cols');
    const svg = mount.querySelector('.wc-wires');
    const br = box.getBoundingClientRect();
    svg.setAttribute('width', box.scrollWidth); svg.setAttribute('height', box.scrollHeight);
    svg.innerHTML = wires.map((w) => {
      const a = box.querySelector('[data-c="' + w.a + '"]'); const b = box.querySelector('[data-c="' + w.b + '"]');
      if (!a || !b) return '';
      const ra = a.getBoundingClientRect(); const rb = b.getBoundingClientRect();
      const x1 = ra.right - br.left, y1 = ra.top + ra.height / 2 - br.top + box.scrollTop;
      const x2 = rb.left - br.left, y2 = rb.top + rb.height / 2 - br.top + box.scrollTop;
      const mid = (x1 + x2) / 2;
      return '<path class="' + (w.cls || 'wc-line') + '" stroke-width="' + Math.max(1, Math.min(5, w.w * 3)) +
        '" d="M' + x1 + ' ' + y1 + ' C' + mid + ' ' + y1 + ' ' + mid + ' ' + y2 + ' ' + x2 + ' ' + y2 + '"/>';
    }).join('');
  };
  mount._paint = paint;
  requestAnimationFrame(paint);
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
