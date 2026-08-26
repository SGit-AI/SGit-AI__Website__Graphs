/* @module wclm/engine
   Single responsibility: the WCLM's deterministic transformer (briefs 31–34).
   The engine is a registry of BLOCKS — reusable, deterministic transformations
   each declaring what it needs — run as a pipeline of LAYERS over a world: a
   layer holds one or more engines running side by side over the previous
   layer's output, each stacking its own clues (brief 34's addendum). Brief
   33's detective playbook governs the shape: every block adds evidence or
   drops evidence, no block's output reaches past its neighbouring layer, and
   every number is labelled opinion (an authored constant) or evidence (a
   counted quantity). Pure: no DOM, no fetch; world in, traces and meaning
   out. */
'use strict';
import { numberOf, senseOf, leansOn } from './senses.js';

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

const WORD_RE = /[A-Za-z0-9_]+(?:['’-][A-Za-z0-9_]+)*/g;
const r3 = (x) => Math.round(x * 1000) / 1000;

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

const OPERATORS = { without: 'negates', not: 'negates', no: 'negates', never: 'negates',
  versus: 'contrasts', vs: 'contrasts' };

/* ---- the engines: each { key, name, role, io: {reads, writes}, core, run };
   io names data TYPES (see TYPES below), never sibling engines ------------- */

const BLOCKS_DEF = [
  { key: 'tokenise', name: 'T1 tokenise', core: true, io: { reads: ['text'], writes: ['tokens'] },
    role: 'words become hash tokens; the phrase gets the hash of its hashes',
    run(s) {
      s.tokens = (String(s.text).match(WORD_RE) || [])
        .map((w, i) => ({ i, w, form: w.toLowerCase(), hash: fnv64(w.toLowerCase()) }));
      s.phrase = { text: String(s.text), hash: fnv64(s.tokens.map((t) => t.hash).join('+')) };
    } },
  { key: 'normalise', name: 'T2 normalise', core: false, io: { reads: ['tokens'], writes: ['tokens'] },
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
    } },
  { key: 'resolve', name: 'T3 resolve', core: true, io: { reads: ['tokens'], writes: ['stream'] },
    role: 'each hash looks itself up in the world: form, class, count, weight',
    run(s, world) {
      s.resolved = s.tokens.map((t) => {
        const rec = world.tokens[t.hash];
        return rec
          ? { ...t, known: true, class: rec.class, count: rec.count, w: rec.w, top: rec.top || [] }
          : { ...t, known: false, class: 'unknown', count: 0, w: 0, top: [] };
      });
    } },
  { key: 'senses', name: 'T4 senses', core: false, io: { reads: ['stream'], writes: ['stream'] },
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
    } },
  { key: 'passthrough', name: 'passthrough', core: false, io: { reads: ['stream'], writes: ['stream'] },
    role: 'carries evidence the marking engines would withdraw — their clues stay written, nothing is blocked',
    run(s) { s.carryAll = true; } },
  { key: 'operators', name: 'T5 operators', core: false, io: { reads: ['stream'], writes: ['stream'] },
    role: 'the little words that flip meaning: negation marked, contradiction kept',
    run(s) {
      s.ops = [];
      s.resolved.forEach((t, idx) => {
        const op = OPERATORS[t.form];
        if (!op) return;
        t.class = 'operator';
        const target = s.resolved.slice(idx + 1).find((x) => x.known && x.class !== 'padding' && x.class !== 'operator');
        if (op === 'negates' && target) target.negated = true;
        s.ops.push({ i: t.i, form: t.form, op, target: target ? target.form : null });
      });
    } },
  { key: 'attend', name: 'T6 attend', core: false, io: { reads: ['stream'], writes: ['profiles'] },
    role: 'each surviving token carries its attention: pairs stacked between profiles, companions pulled in',
    run(s, world) {
      const meaty = s.resolved.filter((t) => t.known && t.class !== 'padding' && t.class !== 'operator'
        && (s.carryAll || !t.foreign));
      const co = {};
      (world.cooc || []).forEach(([a, b, w]) => { co[a + '|' + b] = w; co[b + '|' + a] = w; });
      s.attention = { profiles: meaty.map((t) => ({ i: t.i, form: t.form, negated: !!t.negated,
        pairs: meaty.filter((o) => o.i !== t.i)
          .map((o) => ({ j: o.i, other: o.form, w: co[t.form + '|' + o.form] || 0 }))
          .filter((p) => p.w > 0).sort((a, b) => b.w - a.w),
        pulls: (t.top || []).slice(0, 3).map(([f, w]) => ({ form: f, w })) })) };
    } },
  { key: 'bind', name: 'T7 bind', core: true, io: { reads: ['stream'], writes: ['bindings'] },
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
    } },
  { key: 'expand', name: 'T8 expand', core: false, io: { reads: ['bindings'], writes: ['bindings'] },
    role: 'each bound meaning assembles its neighbourhood: the world model, gathered per meaning',
    run(s, world) {
      const packTerms = (world.pack || {}).terms || [];
      const label = (id) => (world.concepts.find((c) => c.id === id)
        || packTerms.find((p) => p.id === id) || { label: id }).label;
      s.assembled = s.bindings.map((b) => {
        const n = [];
        (world.edges || []).forEach((e) => {
          if (e.from === b.id) n.push({ id: e.to, label: label(e.to), verb: e.verb, dir: 'out', src: 'doc' });
          else if (e.to === b.id) n.push({ id: e.from, label: label(e.from), verb: e.verb, dir: 'in', src: 'doc' });
        });
        packTerms.filter((p) => p.id === b.id).forEach((p) =>
          (p.edges || []).forEach(([rel, to]) => n.push({ id: to, label: label(to), verb: rel, dir: 'out', src: 'pack' })));
        return { ...b, neighbours: n.slice(0, 6), degree: n.length };
      });
    } },
  { key: 'converge', name: 'T9 converge', core: true, io: { reads: ['bindings'], writes: ['meanings'] },
    role: 'evidence is summed; the meaning, its provenance, its blast radius and its contradictions come out',
    run(s, world) {
      const base = s.assembled || s.bindings.map((b) => ({ ...b, neighbours: [], degree: 0 }));
      const byId = {};
      (world.concepts || []).forEach((c) => { byId[c.id] = c; });
      ((world.pack || {}).terms || []).forEach((p) => { byId[p.id] = p; });
      s.ranked = base.map((b) => {
        const rec = byId[b.id] || {};
        return { ...b, blast: b.degree,
          total: r3(2 * b.score + 0.1 * b.degree),   /* 2 and 0.1 are opinion */
          def: rec.statement || rec.def || b.def || null,
          section: rec.section || null, quote: rec.quote || null };
      }).sort((x, y) => y.total - x.total || (x.id < y.id ? -1 : 1));
      s.meaning = s.ranked[0] || null;
      /* a negated word that belongs to the world's own labels is a contradiction,
         surfaced and never silently resolved (brief 33) */
      s.notes = (s.negated || []).flatMap((f) =>
        (world.concepts || []).filter((c) => (c.forms || []).includes(f) && c.statement)
          .slice(0, 1).map((c) => 'the prompt negates "' + f + '", but this universe holds "'
            + c.label + '": ' + c.statement + ' — the query contradicts the world.'));
      /* a sense-switched word takes this universe's claims with it (brief 34):
         say which no longer apply, computed from the concept labels */
      (s.foreign || []).forEach((f) => {
        const hit = leansOn(f.word, world).map((c) => '"' + c.label + '"');
        s.notes.push('you read "' + f.word + '" as ' + f.label + ' (' + f.domain
          + '); this universe speaks its own sense, so its claims that lean on the word'
          + (hit.length ? ' — ' + hit.slice(0, 3).join(', ')
            + (hit.length > 3 ? ' and ' + (hit.length - 3) + ' more' : '') + ' —' : '')
          + ' do not apply under yours.');
      });
    } },
];

/* the fractal engine (brief 34, second addendum): a full WCLM inside an
   engine — the winner's own statement re-enters the pipeline one zoom down.
   Defined after the registry array is built so it can call runPipeline. */
BLOCKS_DEF.push({ key: 'fractal', name: 'fractal', core: false,
  io: { reads: ['meanings'], writes: ['meanings'] },
  role: 'a full WCLM inside an engine: the winner’s statement re-enters the pipeline, one zoom down',
  run(s, world) {
    if (!s.meaning || !s.meaning.def) { s.fractal = null; return; }
    const inner = runPipeline(s.meaning.def, world,
      [['tokenise'], ['resolve'], ['bind'], ['converge']]);   /* no fractal inside: depth one */
    s.fractal = { text: s.meaning.def, meaning: inner.meaning
      ? { id: inner.meaning.id, label: inner.meaning.label, total: inner.meaning.total, kind: inner.meaning.kind }
      : null };
  } });

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
 * honest). opts.senses = {word: senseKey} picks a word's active sense.
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
