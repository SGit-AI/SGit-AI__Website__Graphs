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
 * Render one executed engine's evidence. ctx: { chip, wire, last, cur } where
 * last holds the PREVIOUS LAYER's anchor maps ({byI, byForm, byBind}) and cur
 * the maps this layer's engines share — the caller opens cur per layer and
 * commits it to last when the layer's engines have all rendered, so engines
 * sharing a layer all wire from the previous layer (brief 34's addendum).
 */
export function renderBlock(key, s, world, ctx) {
  const { chip, wire } = ctx;
  const last = ctx.last || {};
  const { byI, byForm, byBind } = ctx.cur;
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

  if (key === 'senses') {
    html = s.resolved.map((t) => {
      byI.set(t.i, 'sn' + t.i);
      if (t.known && t.class !== 'padding' && t.class !== 'operator') byForm.set(t.form, 'sn' + t.i);
      const has = t.sense || t.num;
      wire(last.byI.get(t.i), 'sn' + t.i, 0.4, has ? '' : 'wc-dimline',
        t.sense ? 'its sense declared' : t.num ? 'its number read from the stem family' : 'no senses recorded: passed through');
      if (!has) {
        return chip('sn' + t.i, key, 'wc-pass', esc(t.form), t.form,
          [['status', 'the senses register holds nothing for it: passed through']], t.form);
      }
      const rows = [];
      if (t.num) {
        rows.push(['number', t.num.num === 'plural'
          ? 'plural of "' + t.num.base + '" — more than one involved (evidence: the stem family ' + t.num.family.join(' / ') + ')'
          : 'singular (evidence: the stem family ' + t.num.family.join(' / ') + ' also holds its plural)']);
      }
      if (t.sense) {
        rows.push(['active sense', t.sense.label + ' (' + t.sense.domain + ')' + (t.foreign ? ' — SWITCHED away from this document' : ': this document’s own')],
          ['it means', t.sense.def], ['senses held', t.sense.options.map((o) => o.label).join(' · ')]);
      }
      return chip('sn' + t.i, key, 'wc-sn' + (t.foreign ? ' wc-foreign' : ''),
        '<b>' + esc(t.form) + '</b>' +
        (t.num ? '<span class="small">' + (t.num.num === 'plural' ? '&#10697; plural of ' + esc(t.num.base) : '&#9675; singular') + '</span>' : '') +
        (t.sense ? '<span class="small' + (t.foreign ? '' : ' dim') + '">' + esc(t.sense.label) + ' &middot; ' + esc(t.sense.domain) + '</span>' : ''),
        t.form, rows, t.form);
    }).join('');
  }

  if (key === 'passthrough') {
    const carried = s.resolved.filter((t) => t.negated || t.foreign);
    html = carried.map((t) => {
      byI.set(t.i, 'pt' + t.i);
      wire(last.byI.get(t.i), 'pt' + t.i, 0.4, '', 'carried past the withdrawal');
      return chip('pt' + t.i, key, 'wc-pass', esc(t.form) + ' <span class="small">carried</span>', t.form,
        [['status', 'would be withdrawn (' + (t.negated ? 'negated' : 'sense-switched')
          + '), but passthrough carries it — the clue stays written, nothing is blocked']], t.form);
    }).join('') || '<div class="dim small">nothing to carry this run</div>';
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
        (b.kind === 'pack' ? 'meaning pack' : b.kind === 'sense' ? esc(b.domain) : esc(b.family)) + ' · bind ' + b.score + '</span>', b.label,
        [['source', b.kind === 'pack' ? 'a meaning pack' : b.kind === 'sense' ? 'the senses register — a switched word binds its chosen sense' : 'the document extraction'],
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
      byBind.set(m.id, 'c' + k);
      wire(last.byBind.get(m.id), 'c' + k, m.total / 2, '',
        'bind ' + m.score + ' doubled (opinion), plus 0.1 (opinion) per neighbour (' + m.blast + ', evidence)');
      return chip('c' + k, key, 'wc-conv' + (k === 0 ? ' on' : ''),
        '<b>' + esc(m.label) + '</b><span class="small">2·' + m.score + ' + 0.1·' + m.blast + ' = <b>' + r2(m.total) + '</b></span>',
        m.label, [['total', '2·' + m.score + ' (opinion·evidence) + 0.1·' + m.blast + ' (opinion·evidence) = ' + r2(m.total)],
          ['blast radius', String(m.blast)], ['meaning', m.def || '(no statement carried)']], m.id);
    }).join('') || '<div class="dim small">no meaning found in this universe</div>';
  }

  if (key === 'translate') {
    const t = s.translated;
    if (t) {
      html = t.items.map((x, k) => {
        byBind.set(x.id, 'tr' + k);
        wire(last.byBind.get(x.id), 'tr' + k, 0.5, x.say ? '' : 'wc-dimline',
          x.say ? 'the equivalence authored for ' + t.label : 'no analogy authored yet');
        return x.say
          ? chip('tr' + k, key, 'wc-tran', '<b>' + esc(x.from) + ' &rarr; ' + esc(x.say) + '</b>' +
            '<span class="small">for ' + esc(t.label) + '</span>', x.from + ' → ' + x.say,
            [['their concept', x.say], ['why it lands', x.why],
             ['source', 'the analogies register — authored, reviewable, correctable']], x.id)
          : chip('tr' + k, key, 'wc-tran dim', esc(x.from) + ' <span class="small">no analogy authored yet</span>', x.from,
            [['status', 'the analogies register holds nothing for this concept and this audience — a correction opportunity']], x.id);
      }).join('');
    } else if (s.meaning) {
      byBind.set(s.meaning.id, 'tr0');
      wire(last.byBind.get(s.meaning.id), 'tr0', 0.4, '', 'passed through: no audience chosen');
      html = chip('tr0', key, 'wc-pass', esc(s.meaning.label) + ' <span class="small">no audience chosen</span>',
        s.meaning.label, [['status', 'no audience chosen — pick one above to restate the answer in their world']], s.meaning.id);
    } else {
      html = '<div class="dim small">nothing to translate</div>';
    }
  }

  if (key === 'fractal') {
    if (s.fractal && s.fractal.meaning) {
      const f = s.fractal;
      wire(last.byBind.get(s.meaning.id), 'f0', 0.6, '', 'the winner&rsquo;s statement re-enters the pipeline');
      html = chip('f0', key, 'wc-frac', '<b>' + esc(f.meaning.label) + '</b>' +
        '<span class="small">the meaning of the meaning &middot; score ' + f.meaning.total + '</span>' +
        '<span class="small dim">a full WCLM ran inside: tokenise &rarr; resolve &rarr; bind &rarr; converge</span>',
        'the inner run', [['inner prompt', f.text],
          ['inner winner', f.meaning.label + ' (' + f.meaning.total + ')'],
          ['depth', 'one zoom down — the inner pipeline holds no fractal engine, so it ends']],
        f.meaning.id);
    } else {
      html = '<div class="dim small">the winner carries no statement to zoom into</div>';
    }
  }

  return html;
}

/** Open a layer's shared anchor maps; the returned commit folds them into
    ctx.last once every engine in the layer has rendered. */
export function openLayer(ctx) {
  const last = ctx.last || {};
  ctx.cur = { byI: new Map(), byForm: new Map(), byBind: new Map() };
  return () => {
    const c = ctx.cur;
    ctx.last = {
      byI: c.byI.size ? c.byI : (last.byI || new Map()),
      byForm: c.byForm.size ? c.byForm : (last.byForm || new Map()),
      byBind: c.byBind.size ? c.byBind : (last.byBind || new Map()),
    };
  };
}
