/* @module wclm/operators/bind
   The bind operator (T7, core): the prompt's surviving forms light the
   concepts, pack terms and chosen senses whose labels they cover. Negated
   and sense-switched forms withdraw (unless passthrough carried them); a
   switched word binds its chosen sense instead. bind = ½ label coverage
   (evidence) + ½ prompt coverage (evidence); the halves and the 0.1 pull
   bonus are opinion — stated here where they can be edited. Pure. */
'use strict';
import { r3 } from '../../../../assets/wclm/engine.js';

export const block = {
  key: 'bind', name: 'T7 bind', core: true,
  io: { reads: ['stream'], writes: ['bindings'] },
  role: 'forms light the concepts and pack terms whose labels they cover; negated and sense-switched forms withdraw',
  run(s, world) {
    const content = s.resolved.filter((t) => t.known && t.class !== 'padding' && t.class !== 'operator');
    const src = s.attention ? s.attention.profiles
      : content.filter((t) => s.carryAll || !t.foreign);
    const keep = (t) => s.carryAll || !t.negated;
    const present = new Set(src.filter(keep).map((t) => t.form));
    s.negated = src.filter((t) => t.negated).map((t) => t.form);
    s.foreign = [];
    if (!s.carryAll) {
      const seenW = new Set();   /* one withdrawal per WORD, however often it is said */
      content.forEach((t) => {
        if (!t.foreign || seenW.has(t.sense.word)) return;
        seenW.add(t.sense.word);
        s.foreign.push({ form: t.form, word: t.sense.word, label: t.sense.label,
          domain: t.sense.domain, def: t.sense.def });
      });
    }
    const pulled = new Set(s.attention ? s.attention.profiles.flatMap((p) => p.pulls.map((x) => x.form)) : []);
    /* bind = ½ label coverage (evidence) + ½ prompt coverage (evidence),
       halves and the 0.1 pull bonus are opinion */
    const score = (forms) => {
      if (!forms.length || !present.size) return null;
      const direct = forms.filter((f) => present.has(f)).length;
      if (!direct) return null;
      const nearby = forms.filter((f) => !present.has(f) && pulled.has(f)).length;
      return r3(0.5 * (direct / forms.length) + 0.5 * (direct / present.size) + 0.1 * nearby);
    };
    s.bindings = [];
    (world.concepts || []).forEach((c) => {
      const sc = score(c.forms || []);
      if (sc) s.bindings.push({ id: c.id, kind: 'doc', label: c.label, family: c.family,
        score: sc, via: (c.forms || []).filter((f) => present.has(f)) });
    });
    ((world.pack || {}).terms || []).forEach((p) => {
      const sc = score(p.forms || []);
      if (sc) s.bindings.push({ id: p.id, kind: 'pack', label: p.label, score: sc,
        via: (p.forms || []).filter((f) => present.has(f)) });
    });
    /* a sense-switched word binds its own sense instead: the word fully
       covers the sense's label (evidence), over the prompt's content forms */
    const contentForms = new Set(content.filter((t) => !t.negated).map((t) => t.form));
    (s.foreign || []).forEach((f) => {
      s.bindings.push({ id: 'sense:' + f.word + '.' + (s.senseTable.find((x) => x.word === f.word) || {}).active,
        kind: 'sense', label: f.word + ' as ' + f.label, domain: f.domain, def: f.def,
        score: r3(0.5 + 0.5 * (1 / Math.max(1, contentForms.size))), via: [f.form] });
    });
    s.bindings.sort((x, y) => y.score - x.score || (x.id < y.id ? -1 : 1));
  },
};

export const ui = {
  prompts: ['meaning through connectivity', 'meaning without connectivity', 'qa'],
  watch: ['bindings', 'negated', 'foreign'],
};
