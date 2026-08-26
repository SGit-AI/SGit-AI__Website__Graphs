/* @module wclm/engine
   Single responsibility: the WCLM's deterministic transformer (briefs 31–36).
   Since brief 36 each operator lives in its OWN folder
   (v2/wclm/operators/<key>/) as a first-class artefact — code, schema, data,
   docs, examples, workbench — and this module shrinks to what is genuinely
   shared: the hash and repair helpers, the type registry (the six data
   shapes the whole pipeline moves), and the runner that assembles the
   operator modules into a pipeline of LAYERS (one or more engines side by
   side per layer, each stacking clues over the previous layer's output).
   Every engine declares its schema and runs only when every type it reads
   was written by an earlier layer. Pure: no DOM, no fetch; world in, traces
   and meaning out. */
'use strict';

const OFFSET = 0xcbf29ce484222325n;
const PRIME = 0x100000001b3n;
const MASK = 0xffffffffffffffffn;

/** The token hash: FNV-1a 64-bit over code points, 12 hex chars. */
export function fnv64(s) {
  let h = OFFSET;
  for (const ch of String(s)) {
    h ^= BigInt(ch.codePointAt(0));
    h = (h * PRIME) & MASK;
  }
  return h.toString(16).padStart(16, '0').slice(0, 12);
}

/** Round to 3 places — every stated formula reports through this. */
export function r3(x) { return Math.round(x * 1000) / 1000; }

/** Levenshtein distance <= 1, mirroring the generator's near-miss rule. */
export function ed1(a, b) {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1) return false;
  if (a.length === b.length) {
    let miss = 0;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i] && ++miss > 1) return false;
    return miss === 1;
  }
  if (a.length > b.length) { const t = a; a = b; b = t; }
  let i = 0, j = 0, miss = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) i++; else if (++miss > 1) return false;
    j++;
  }
  return true;
}

/** The stem key, ported rule-for-rule from gen_coregraph.stem_key. */
export function stemKey(form, vocab) {
  let w = form.toLowerCase();
  if (w.endsWith('ies') && w.length > 4) w = w.slice(0, -3) + 'y';
  else if (w.endsWith('es') && w.length > 4 && ('sxz'.includes(w[w.length - 3]) || w.endsWith('ches') || w.endsWith('shes'))) w = w.slice(0, -2);
  else if (w.endsWith('s') && !w.endsWith('ss') && w.length > 3) w = w.slice(0, -1);
  for (const suf of ['ing', 'ed']) {
    if (w.endsWith(suf) && w.length > suf.length + 2) {
      const base = w.slice(0, -suf.length);
      if (vocab.has(base)) return base;
      if (vocab.has(base + 'e')) return base + 'e';
    }
  }
  return w;
}

/* ---- the operator registry: each engine imported from its own folder ------ */
import { block as tokenise } from '../../v2/wclm/operators/tokenise/tokenise.js';
import { block as normalise } from '../../v2/wclm/operators/normalise/normalise.js';
import { block as resolve } from '../../v2/wclm/operators/resolve/resolve.js';
import { block as senses } from '../../v2/wclm/operators/senses/senses.js';
import { block as passthrough } from '../../v2/wclm/operators/passthrough/passthrough.js';
import { block as operators } from '../../v2/wclm/operators/operators/operators.js';
import { block as attend } from '../../v2/wclm/operators/attend/attend.js';
import { block as bind } from '../../v2/wclm/operators/bind/bind.js';
import { block as expand } from '../../v2/wclm/operators/expand/expand.js';
import { block as converge } from '../../v2/wclm/operators/converge/converge.js';
import { block as translate } from '../../v2/wclm/operators/translate/translate.js';
import { block as fractal } from '../../v2/wclm/operators/fractal/fractal.js';

const BLOCKS_DEF = [tokenise, normalise, resolve, senses, passthrough, operators,
  attend, bind, expand, converge, translate, fractal];

/** The data types the pipeline moves — the whole schema, six names long. */
export const TYPES = {
  text: 'the prompt string',
  tokens: 'hashed word tokens, in order',
  stream: 'tokens resolved against the world, carrying every clue mark (class, number, sense, negation)',
  profiles: 'attention profiles: pairs and pulls per surviving token',
  bindings: 'candidate meanings with scores and the forms that lit them',
  meanings: 'the ranked answer with provenance, blast radius and notes',
};

export const BLOCKS = BLOCKS_DEF.map(({ run, ...meta }) => meta);
export const DEFAULT_PIPELINE = [['tokenise'], ['normalise'], ['resolve'],
  ['senses', 'operators'], ['attend'], ['bind'], ['expand'], ['converge']];

/**
 * Run a pipeline of LAYERS over a world (brief 34's addenda): each entry is
 * an engine key or an array of keys running side by side in one layer, each
 * stacking its clues over the previous layer's output. Deterministic. Every
 * engine declares its schema — the data types it reads and writes — and runs
 * only when every type it reads was written by an EARLIER layer; within a
 * layer the engines are independent by contract. An incompatible placement
 * is skipped with the missing type named (brief 33: mix and match stays
 * honest). opts.senses = {word: senseKey} picks a word's active sense;
 * opts.audience picks the translate engine's listener.
 * @returns {{phrase, steps: [{key, layer, skipped?}], state, meaning, notes}}
 */
export function runPipeline(text, world, pipeline, opts) {
  const s = { text, opts: opts || {} };
  const avail = new Set(['text']);
  const steps = [];
  (pipeline || DEFAULT_PIPELINE)
    .map((L) => (Array.isArray(L) ? L : [L]))
    .forEach((keys, li) => {
      const wrote = [];
      keys.forEach((key) => {
        const def = BLOCKS_DEF.find((b) => b.key === key);
        if (!def) return;
        const missing = def.io.reads.filter((t) => !avail.has(t));
        if (missing.length) {
          steps.push({ key, layer: li, skipped: 'needs ' + missing.join(', ') + ' — nothing upstream writes it' });
          return;
        }
        def.run(s, world);
        wrote.push(...def.io.writes);
        steps.push({ key, layer: li });
      });
      wrote.forEach((t) => avail.add(t));
    });
  return { phrase: s.phrase || null, steps, state: s,
    meaning: s.meaning || null, notes: s.notes || [] };
}

/* ---- the run delta (brief 32), over the pipeline state -------------------- */
const DELTA_KEYS = {
  tokenise: (s) => (s.tokens || []).map((t) => t.form),
  resolve: (s) => (s.resolved || []).filter((t) => t.known).map((t) => t.form),
  senses: (s) => (s.senseTable || []).map((x) => x.word + ':' + x.active),
  attend: (s) => (s.attention ? s.attention.profiles.flatMap((p) => p.pairs.map((x) => p.form + '~' + x.other)) : []),
  bind: (s) => (s.bindings || []).map((b) => b.id),
  expand: (s) => (s.assembled || []).map((a) => a.id + ':' + a.degree),
  converge: (s) => (s.ranked || []).map((m) => m.id),
  translate: (s) => (s.translated ? s.translated.items.filter((x) => x.say).map((x) => x.id + '>' + x.say) : []),
  fractal: (s) => (s.fractal && s.fractal.meaning ? [s.fractal.meaning.id] : []),
};

/** What each layer gained and lost against a previous run; null on first run. */
export function runDelta(prev, next) {
  if (!prev || !next) return null;
  const layers = {};
  Object.keys(DELTA_KEYS).forEach((k) => {
    const a = new Set(DELTA_KEYS[k](prev.state));
    const b = DELTA_KEYS[k](next.state);
    const bs = new Set(b);
    layers[k] = { added: b.filter((x) => !a.has(x)), removed: Array.from(a).filter((x) => !bs.has(x)) };
  });
  const from = prev.meaning ? prev.meaning.label : null;
  const to = next.meaning ? next.meaning.label : null;
  return { layers, winner: { from, to, changed: from !== to } };
}
