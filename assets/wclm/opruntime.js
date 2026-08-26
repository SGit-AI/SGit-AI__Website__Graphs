/* @module wclm/opruntime
   Single responsibility: run ONE operator the way its workbench and its
   example vectors both need (brief 36) — the canonical prerequisite chain
   first, then the operator, with the input and output state slices cut by
   the operator's schema. The generator records what this module produces;
   the workbench's test tab re-runs it and compares; because both use THIS
   code, the vectors can never drift from the runner. Pure. */
'use strict';
import { runPipeline, BLOCKS } from './engine.js';

/** The canonical order operators run in when each needs a stage before it. */
export const CANON = ['tokenise', 'normalise', 'resolve', 'senses', 'operators',
  'attend', 'bind', 'expand', 'converge', 'translate', 'fractal'];

/** The prerequisite chain for one operator: everything canonical before it. */
export function prereqOf(key) {
  if (key === 'passthrough') return ['tokenise', 'normalise', 'resolve', 'senses', 'operators'];
  const i = CANON.indexOf(key);
  return i < 0 ? [] : CANON.slice(0, i);
}

/** Which state keys each data TYPE lives in — the schema, located. */
export const TYPE_STATE = {
  text: ['text'], tokens: ['tokens', 'phrase'], stream: ['resolved'],
  profiles: ['attention'], bindings: ['bindings', 'assembled'],
  meanings: ['ranked', 'meaning', 'notes'],
};

const clone = (x) => (x === undefined ? null : JSON.parse(JSON.stringify(x)));

/**
 * Run the prerequisite chain, then the operator; return both runs plus the
 * input slice (the state the operator READ, cut by its declared reads) and
 * the output slice (what it wrote, cut by its ui watch keys).
 */
export function runOperator(key, text, world, opts, watch) {
  const pre = prereqOf(key).map((k) => [k]);
  const before = runPipeline(text, world, pre, opts);
  const full = runPipeline(text, world, pre.concat([[key]]), opts);
  const block = BLOCKS.find((b) => b.key === key) || { io: { reads: [], writes: [] } };
  const input = {};
  block.io.reads.forEach((t) => (TYPE_STATE[t] || []).forEach((k) => { input[k] = clone(before.state[k]); }));
  const output = {};
  (watch || []).forEach((k) => { output[k] = clone(full.state[k]); });
  return { before, full, input, output };
}
