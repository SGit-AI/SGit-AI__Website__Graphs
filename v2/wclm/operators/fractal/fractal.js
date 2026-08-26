/* @module wclm/operators/fractal
   The fractal operator (optional): a full WCLM inside an engine (brief 34's
   second addendum; brief 35's engines-become-nodes). The winning meaning's
   own statement re-enters a complete inner pipeline — tokenise, resolve,
   bind, converge — one zoom down: the meaning of the meaning. The inner
   pipeline holds no fractal engine, so the recursion is depth one by
   construction. Pure. */
'use strict';
import { runPipeline } from '../../../../assets/wclm/engine.js';

export const block = {
  key: 'fractal', name: 'fractal', core: false,
  io: { reads: ['meanings'], writes: ['meanings'] },
  role: 'a full WCLM inside an engine: the winner’s statement re-enters the pipeline, one zoom down',
  run(s, world) {
    if (!s.meaning || !s.meaning.def) { s.fractal = null; return; }
    const inner = runPipeline(s.meaning.def, world,
      [['tokenise'], ['resolve'], ['bind'], ['converge']]);   /* no fractal inside: depth one */
    s.fractal = { text: s.meaning.def, meaning: inner.meaning
      ? { id: inner.meaning.id, label: inner.meaning.label, total: inner.meaning.total, kind: inner.meaning.kind }
      : null };
  },
};

export const ui = {
  prompts: ['meaning through connectivity', 'graphs of graphs', 'anchor nodes'],
  watch: ['fractal'],
};
