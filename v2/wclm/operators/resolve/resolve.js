/* @module wclm/operators/resolve
   The resolve operator (T3, core): each hash looks itself up in the world and
   comes back with its form, class, count and weight — or the honest news that
   this universe has never seen it. The weight is a stated formula (class
   weight over log2(2+count)), computed upstream in the world file. Pure. */
'use strict';

export const block = {
  key: 'resolve', name: 'T3 resolve', core: true,
  io: { reads: ['tokens'], writes: ['stream'] },
  role: 'each hash looks itself up in the world: form, class, count, weight',
  run(s, world) {
    s.resolved = s.tokens.map((t) => {
      const rec = world.tokens[t.hash];
      return rec
        ? { ...t, known: true, class: rec.class, count: rec.count, w: rec.w, top: rec.top || [] }
        : { ...t, known: false, class: 'unknown', count: 0, w: 0, top: [] };
    });
  },
};

export const ui = {
  prompts: ['meaning through connectivity', 'the graph of the node', 'zebra quantum'],
  watch: ['resolved'],
};
