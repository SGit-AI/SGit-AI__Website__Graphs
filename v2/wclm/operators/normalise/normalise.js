/* @module wclm/operators/normalise
   The normalise operator (T2, optional): the dictionary and the thesaurus —
   this is what we think you said, with the fix named (brief 33). An unknown
   token is repaired by edit distance 1 against the universe's own forms, or
   by stem family; what cannot be repaired says so and stays. Pure. */
'use strict';
import { fnv64, ed1, stemKey } from '../../../../assets/wclm/engine.js';

export const block = {
  key: 'normalise', name: 'T2 normalise', core: false,
  io: { reads: ['tokens'], writes: ['tokens'] },
  role: 'the dictionary and the thesaurus: what we think you said, with the fix named',
  run(s, world) {
    const forms = Object.values(world.tokens).map((r) => r.form);
    const known = new Set(forms);
    const vocab = new Set(forms.concat(Object.keys(world.stems || {})));
    s.tokens = s.tokens.map((t) => {
      if (world.tokens[t.hash]) return t;
      const hit = forms.filter((f) => Math.abs(f.length - t.form.length) <= 1
        && t.form.length >= 4 && ed1(t.form, f)).sort()[0];
      if (hit) return { ...t, form: hit, hash: fnv64(hit), fix: { from: t.form, how: 'edit distance 1 (evidence: the universe has "' + hit + '")' } };
      const fam = (world.stems || {})[stemKey(t.form, vocab)];
      if (fam) {
        const best = fam.filter((f) => known.has(f))
          .sort((a, b) => world.tokens[fnv64(b)].count - world.tokens[fnv64(a)].count)[0];
        if (best) return { ...t, form: best, hash: fnv64(best), fix: { from: t.form, how: 'same stem family (thesaurus)' } };
      }
      return { ...t, fix: null };
    });
  },
};

export const ui = {
  prompts: ['graphz and nodez conected', 'meaninged and connectivvity', 'zebra quantum'],
  watch: ['tokens'],
};
