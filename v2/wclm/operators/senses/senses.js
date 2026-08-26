/* @module wclm/operators/senses
   The senses operator (T4, optional): each word declares its number (read
   from the stem families — plural means more than one involved) and its
   active sense, the document's own unless the caller switches it (brief 34).
   A switched word is marked foreign: downstream, it withdraws from this
   universe's concepts and binds its chosen sense instead. Pure. */
'use strict';
import { numberOf, senseOf } from '../../../../assets/wclm/senses.js';

export const block = {
  key: 'senses', name: 'T4 senses', core: false,
  io: { reads: ['stream'], writes: ['stream'] },
  role: 'each word declares its number and its active sense — the document’s own unless you switch it',
  run(s, world) {
    const chosen = (s.opts && s.opts.senses) || {};
    s.senseTable = [];
    s.resolved.forEach((t) => {
      if (!t.known || t.class === 'padding') return;
      const nm = numberOf(t.form, world.stems || {});
      if (nm) t.num = nm;
      const sn = senseOf(t.form, world, chosen);
      if (!sn) return;
      t.sense = sn;
      if (sn.active !== 'doc') t.foreign = true;
      if (!s.senseTable.some((x) => x.word === sn.word)) {
        s.senseTable.push({ i: t.i, form: t.form, word: sn.word, active: sn.active, options: sn.options });
      }
    });
  },
};

export const ui = {
  prompts: ['graphs of graphs', 'graph and node and fractal', 'task'],
  presets: [{ label: 'graph as a chart', opts: { senses: { graph: 'chart' } } },
    { label: 'node as a lymph node', opts: { senses: { node: 'lymph' } } }],
  watch: ['resolved', 'senseTable'],
};
