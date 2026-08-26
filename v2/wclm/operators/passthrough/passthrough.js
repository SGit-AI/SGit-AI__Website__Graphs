/* @module wclm/operators/passthrough
   The passthrough operator (optional, layer-free): carries evidence the
   marking engines would withdraw — negations and sense switches stay written
   as clues, but nothing is blocked from binding (brief 34's addendum: one of
   the engines in a layer can be just pass-through). Include it beside the
   marking engines for an advisory run; leave it out for a strict one. Pure. */
'use strict';

export const block = {
  key: 'passthrough', name: 'passthrough', core: false,
  io: { reads: ['stream'], writes: ['stream'] },
  role: 'carries evidence the marking engines would withdraw — their clues stay written, nothing is blocked',
  run(s) { s.carryAll = true; },
};

export const ui = {
  prompts: ['meaning without connectivity'],
  watch: ['carryAll'],
};
