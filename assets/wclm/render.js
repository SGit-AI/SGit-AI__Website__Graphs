/* @module wclm/render
   Single responsibility: the per-block column renderers (brief 33). Each block
   renders every piece of evidence it KEPT (dropped evidence is a visibly
   absent wire), registers chip info for the explanation pane, and wires only
   to the previous executed block — strict adjacency, no layer jumping. A part
   of the wclm page; the engine stays pure and elsewhere. */
'use strict';

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g,
  (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const r2 = (x) => Math.round(x * 100) / 100;

/**
 * Render one executed block's column. ctx: { chip, wire, last } where last is
 * the previous block's anchor maps ({byI, byForm, byBind}); returns the html
 * and mutates ctx.last to this block's anchors.
 */
export function renderBlock(key, s, world, ctx) {
  const { chip, wire } = ctx;
  const last = ctx.last || {};
  const byI = new Map(), byForm = new Map(), byBind = new Map();
  let html = '';

  if (key === 'tokenise') {
    html = s.tokens.map((t) => {
      byI.set(t.i, 't' + t.i);
      return chip('t' + t.i, key, 'wc-tok', '<b>' + esc(t.w) + '</b><code>' + t.hash + '</code>',
        t.w, [['hash', t.hash], ['position', String(t.i + 1)]], t.form);
    }).join('') + '<div class="wc-chip wc-phrase"><span class="dim small">phrase</span><code>' +
      s.phrase.hash + '</code></div>';
  }

  if (key === 'normalise') {
    html = s.tokens.map((t) => {
      byI.set(t.i, 'n' + t.i);
      wire(last.byI.get(t.i), 'n' + t.i, 0.4, t.fix ? '' : 'wc-dimline',
        t.fix ? 'repaired: ' + t.fix.how : t.fix === null ? 'no repair found' : 'already known: passed through');
      if (t.fix) {
        return chip('n' + t.i, key, 'wc-fix', '<b>' + esc(t.fix.from) + ' &rarr; ' + esc(t.form) + '</b>' +
          '<span class="small">' + esc(t.fix.how) + '</span>', t.fix.from + ' → ' + t.form,
          [['we think you said', t.form], ['because', t.fix.how]], t.form);
      }
      if (t.fix === null) {
        return chip('n' + t.i, key, 'wc-pass dim', esc(t.form) + ' <span class="small">no fix</span>',
          t.form, [['status', 'unknown, and neither the dictionary nor the thesaurus could repair it']], t.form);
      }
      return chip('n' + t.i, key, 'wc-pass', esc(t.form), t.form, [['status', 'already in the universe: passed through unchanged']], t.form);
    }).join('');
  }

  if (key === 'resolve') {
    html = s.resolved.map((t) => {
      byI.set(t.i, 'r' + t.i);
      if (t.known && t.class !== 'padding') byForm.set(t.form, 'r' + t.i);
      wire(last.byI.get(t.i), 'r' + t.i, 0.4, t.known ? '' : 'wc-dimline',
        t.known ? 'the hash exists in this world' : 'no such hash in this world');
      return chip('r' + t.i, key, 'wc-res ctc-' + t.class, '<b>' + esc(t.form) + '</b>' +
        (t.known ? '<span class="small">' + t.class + ' · ×' + t.count + ' · w ' + t.w + '</span>'
          : '<span class="small dim">not in this universe</span>'),
        t.form, t.known
          ? [['class', t.class + ' (evidence: the token analysis)'],
             ['count', '×' + t.count + ' in the document (evidence)'],
             ['weight', t.w + ' = classW (opinion) / log2(2+count) (evidence)']]
          : [['status', 'unknown: the universe has never seen this word']],
        t.known ? t.form : null);
    }).join('');
  }

  if (key === 'operators') {
    html = s.resolved.map((t) => {
      byI.set(t.i, 'o' + t.i);
      if (t.known && t.class !== 'padding' && t.class !== 'operator') byForm.set(t.form, 'o' + t.i);
      const op = s.ops.find((o) => o.i === t.i);
      wire(last.byI.get(t.i), 'o' + t.i, 0.4, op || t.negated ? '' : 'wc-dimline',
        op ? 'recognised as an operator' : t.negated ? 'negated by "' + s.ops.find((o) => o.target === t.form).form + '"' : 'passed through');
      if (op) {
        return chip('o' + t.i, key, 'wc-op', '<b>' + esc(t.form) + '</b> &#8856;<span class="small">' +
          op.op + (op.target ? ' &rarr; ' + esc(op.target) : '') + '</span>', t.form,
          [['operator', op.op], ['applies to', op.target || '(nothing that follows)']], t.form);
      }
      return chip('o' + t.i, key, 'wc-pass' + (t.negated ? ' wc-neg' : ''),
        esc(t.form) + (t.negated ? ' <span class="small">&#8856; negated</span>' : ''),
        t.form, t.negated
          ? [['status', 'negated: withdrawn from positive evidence, kept for the contradiction check']]
          : [['status', 'no operator touches it: passed through']], t.form);
    }).join('');
  }

  if (key === 'attend') {
    const src = last.byForm.size ? last.byForm : null;
    html = s.attention.profiles.map((p) => {
      byForm.set(p.form, 'a' + p.i);
      wire((src && src.get(p.form)) || last.byI.get(p.i), 'a' + p.i, 0.4, '', 'survives into attention');
      p.pairs.forEach((q) => { if (q.j > p.i) wire('a' + p.i, 'a' + q.j, q.w, 'wc-pairline', 'share ' + q.w + ' sentence(s)'); });
      return chip('a' + p.i, key, 'wc-att' + (p.negated ? ' wc-neg' : ''),
        '<b>' + esc(p.form) + '</b>' + (p.negated ? ' <span class="small">&#8856;</span>' : '') +
        p.pairs.slice(0, 3).map((q) => '<span class="small">&harr; ' + esc(q.other) + ' ×' + q.w + '</span>').join('') +
        p.pulls.map((q) => '<span class="small dim">&rarr; ' + esc(q.form) + ' ×' + q.w + '</span>').join(''),
        p.form, [['pairs', p.pairs.map((q) => q.other + ' ×' + q.w).join(', ') || 'none'],
          ['pulls', p.pulls.map((q) => q.form + ' ×' + q.w).join(', ') || 'none'],
          ['weights', 'shared-sentence counts (evidence)']], p.form);
    }).join('') || '<div class="dim small">nothing survives into attention</div>';
  }

  if (key === 'bind') {
    html = s.bindings.slice(0, 9).map((b, k) => {
      byBind.set(b.id, 'b' + k);
      b.via.forEach((f) => {
        const from = last.byForm.get(f);
        if (from) wire(from, 'b' + k, b.score, '', '"' + f + '" is in this label');
      });
      return chip('b' + k, key, 'wc-bind wc-' + b.kind, '<b>' + esc(b.label) + '</b><span class="small">' +
        (b.kind === 'pack' ? 'meaning pack' : esc(b.family)) + ' · bind ' + b.score + '</span>', b.label,
        [['source', b.kind === 'pack' ? 'a meaning pack' : 'the document extraction'],
         ['bind', b.score + ' = ½ label + ½ prompt coverage (evidence; the halves are opinion)'],
         ['via', b.via.join(', ')]], b.id);
    }).join('') || '<div class="dim small">nothing bound</div>';
  }

  if (key === 'expand') {
    html = s.assembled.slice(0, 9).map((a, k) => {
      byBind.set(a.id, 'e' + k);
      wire(last.byBind.get(a.id), 'e' + k, 0.5, '', 'gathers its neighbourhood: ' + a.degree + ' link(s)');
      return chip('e' + k, key, 'wc-asm wc-' + a.kind, '<b>' + esc(a.label) + '</b>' +
        a.neighbours.slice(0, 4).map((n) => '<span class="small">' +
          (n.dir === 'out' ? esc(n.verb) + ' &rarr; ' + esc(n.label) : esc(n.label) + ' &rarr; ' + esc(n.verb)) + '</span>').join('') +
        (a.degree > 4 ? '<span class="small dim">… ' + (a.degree - 4) + ' more</span>' : ''),
        a.label, [['degree', a.degree + ' neighbour(s) (evidence)'],
          ['neighbours', a.neighbours.map((n) => n.label).join(', ') || 'none']], a.id);
    }).join('') || '<div class="dim small">no neighbourhood</div>';
  }

  if (key === 'converge') {
    html = s.ranked.slice(0, 6).map((m, k) => {
      wire(last.byBind.get(m.id), 'c' + k, m.total / 2, '',
        'bind ' + m.score + ' doubled (opinion), plus 0.1 (opinion) per neighbour (' + m.blast + ', evidence)');
      return chip('c' + k, key, 'wc-conv' + (k === 0 ? ' on' : ''),
        '<b>' + esc(m.label) + '</b><span class="small">2·' + m.score + ' + 0.1·' + m.blast + ' = <b>' + r2(m.total) + '</b></span>',
        m.label, [['total', '2·' + m.score + ' (opinion·evidence) + 0.1·' + m.blast + ' (opinion·evidence) = ' + r2(m.total)],
          ['blast radius', String(m.blast)], ['meaning', m.def || '(no statement carried)']], m.id);
    }).join('') || '<div class="dim small">no meaning found in this universe</div>';
  }

  ctx.last = { byI, byForm: byForm.size ? byForm : (last.byForm || new Map()), byBind: byBind.size ? byBind : (last.byBind || new Map()) };
  return html;
}
