/* @module wclm/operators/operators
   The operators operator (T5, optional): the little words that flip meaning
   (brief 33 — "without" is not "through"). Negation marks the NEXT known
   non-padding token; the mark withdraws it from positive binding downstream
   while keeping it visible for the contradiction check. The word table is
   this operator's official data, standard across every document. Pure. */
'use strict';

export const OPERATORS = { without: 'negates', not: 'negates', no: 'negates', never: 'negates',
  versus: 'contrasts', vs: 'contrasts' };

export const block = {
  key: 'operators', name: 'T5 operators', core: false,
  io: { reads: ['stream'], writes: ['stream'] },
  role: 'the little words that flip meaning: negation marked, contradiction kept',
  run(s) {
    s.ops = [];
    s.resolved.forEach((t, idx) => {
      const op = OPERATORS[t.form];
      if (!op) return;
      t.class = 'operator';
      const target = s.resolved.slice(idx + 1).find((x) => x.known && x.class !== 'padding' && x.class !== 'operator');
      if (op === 'negates' && target) target.negated = true;
      s.ops.push({ i: t.i, form: t.form, op, target: target ? target.form : null });
    });
  },
};

export const ui = {
  prompts: ['meaning without connectivity', 'graphs not diagrams', 'meaning through connectivity'],
  watch: ['resolved', 'ops'],
};
