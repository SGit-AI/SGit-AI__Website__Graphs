/* @module wclm/operators/attend
   The attend operator (T6, optional): each surviving token carries its
   attention — pairs (co-occurrence with the other prompt tokens, weighted by
   shared sentences in the document) and pulls (its top companions from the
   token analysis). The look-back brief 31 most wanted to see, as data. Pure. */
'use strict';

export const block = {
  key: 'attend', name: 'T6 attend', core: false,
  io: { reads: ['stream'], writes: ['profiles'] },
  role: 'each surviving token carries its attention: pairs stacked between profiles, companions pulled in',
  run(s, world) {
    const meaty = s.resolved.filter((t) => t.known && t.class !== 'padding' && t.class !== 'operator'
      && (s.carryAll || !t.foreign));
    const co = {};
    (world.cooc || []).forEach(([a, b, w]) => { co[a + '|' + b] = w; co[b + '|' + a] = w; });
    s.attention = { profiles: meaty.map((t) => ({ i: t.i, form: t.form, negated: !!t.negated,
      pairs: meaty.filter((o) => o.i !== t.i)
        .map((o) => ({ j: o.i, other: o.form, w: co[t.form + '|' + o.form] || 0 }))
        .filter((p) => p.w > 0).sort((a, b) => b.w - a.w),
      pulls: (t.top || []).slice(0, 3).map(([f, w]) => ({ form: f, w })) })) };
  },
};

export const ui = {
  prompts: ['meaning through connectivity', 'anchor nodes and reference graphs', 'graph node edge'],
  watch: ['attention'],
};
