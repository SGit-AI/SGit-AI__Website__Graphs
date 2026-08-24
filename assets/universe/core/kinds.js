/* @module universe/core/kinds
   Single responsibility: the one list of anchor kinds, shared by every surface
   that filters on them. The source pane's highlight toggles, the options
   popover and the graph's family visibility all read this list, so one toggle
   set can drive both panes. Pure data. */

/** Every anchor kind with its reader-facing label, in display order. */
export const KINDS = [
  ['concept', 'dictionary'], ['claim', 'claims'], ['hypothesis', 'hypotheses'],
  ['objective', 'objectives'], ['example', 'examples'], ['edge', 'relations'],
  ['nbn', 'near-but-nots'], ['alias', 'also-called'],
];

/** The kinds that are also node families in the graph; the rest are
    source-only marks (relations, near-but-nots, also-called). */
export const NODE_KINDS = ['concept', 'claim', 'hypothesis', 'objective', 'example'];

/** @returns {string[]} every kind enabled, the reader's default state */
export function allKinds() { return KINDS.map((k) => k[0]); }
