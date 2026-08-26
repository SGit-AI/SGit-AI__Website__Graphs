/* @module wclm/operators/tokenise
   The tokenise operator (T1, core): words become content-hash tokens, and the
   phrase gets the hash of its joined hashes. The hash is FNV-1a 64-bit over
   code points (12 hex), so the same word tokenises identically in every
   document with no registry — brief 30's instinct taken literally. Pure. */
'use strict';
import { fnv64 } from '../../../../assets/wclm/engine.js';

const WORD_RE = /[A-Za-z0-9_]+(?:['’-][A-Za-z0-9_]+)*/g;

export const block = {
  key: 'tokenise', name: 'T1 tokenise', core: true,
  io: { reads: ['text'], writes: ['tokens'] },
  role: 'words become hash tokens; the phrase gets the hash of its hashes',
  run(s) {
    s.tokens = (String(s.text).match(WORD_RE) || [])
      .map((w, i) => ({ i, w, form: w.toLowerCase(), hash: fnv64(w.toLowerCase()) }));
    s.phrase = { text: String(s.text), hash: fnv64(s.tokens.map((t) => t.hash).join('+')) };
  },
};

export const ui = {
  prompts: ['meaning through connectivity', 'Graph GRAPH graph', 'graphs of graphs'],
  watch: ['tokens', 'phrase'],
};
