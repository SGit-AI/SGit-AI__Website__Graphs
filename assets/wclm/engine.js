/* @module wclm/engine
   Single responsibility: the WCLM's deterministic transformer (brief 31).
   Six named layers, each a pure function with declared inputs and outputs:
   nothing is learned, every weight is a stated formula over graph inputs, and
   the same prompt over the same world always produces the same answer AND the
   same picture. Tokens are content hashes (FNV-1a 64), so the same word
   tokenises identically in every document with no registry. Pure: no DOM, no
   fetch; the world file comes in, the layer traces and the meaning come out. */
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

const WORD_RE = /[A-Za-z0-9_]+(?:['’-][A-Za-z0-9_]+)*/g;
const r3 = (x) => Math.round(x * 1000) / 1000;

/** The layer roster the page draws; run() lives in ENGINE below, same order. */
export const LAYERS = [
  { key: 'tokenise', name: 'L1 tokenise', role: 'words become hash tokens; the phrase gets the hash of its hashes' },
  { key: 'resolve', name: 'L2 resolve', role: 'each hash looks itself up in the world: form, class, count, weight' },
  { key: 'attend', name: 'L3 attend', role: 'tokens look at each other and at their companions, weighted by co-occurrence' },
  { key: 'bind', name: 'L4 bind', role: 'forms light the concepts and pack terms whose labels they cover' },
  { key: 'expand', name: 'L5 expand', role: 'bound meanings pull their neighbourhood: the world model assembles' },
  { key: 'converge', name: 'L6 converge', role: 'evidence is summed; the meaning, its provenance and its blast radius come out' },
];

function tokenise(text) {
  const toks = (String(text).match(WORD_RE) || [])
    .map((w, i) => ({ i, w, form: w.toLowerCase(), hash: fnv64(w.toLowerCase()) }));
  return { tokens: toks, phrase: { text: String(text), hash: fnv64(toks.map((t) => t.hash).join('+')) } };
}

function resolve(prev, world) {
  return prev.tokens.map((t) => {
    const rec = world.tokens[t.hash];
    return rec
      ? { ...t, known: true, n: rec.n, class: rec.class, count: rec.count, w: rec.w, top: rec.top || [] }
      : { ...t, known: false, class: 'unknown', count: 0, w: 0, top: [] };
  });
}

function attend(resolved, world) {
  const meaty = resolved.filter((t) => t.known && t.class !== 'padding');
  const co = {};
  (world.cooc || []).forEach(([a, b, w]) => { co[a + '|' + b] = w; co[b + '|' + a] = w; });
  const pairs = [];
  for (let i = 0; i < meaty.length; i++) {
    for (let j = i + 1; j < meaty.length; j++) {
      const w = co[meaty[i].form + '|' + meaty[j].form] || 0;
      if (w) pairs.push({ a: meaty[i].i, b: meaty[j].i, af: meaty[i].form, bf: meaty[j].form, w });
    }
  }
  const pulls = meaty.flatMap((t) => (t.top || []).slice(0, 4)
    .map(([f, w]) => ({ from: t.i, form: f, w })));
  pairs.sort((x, y) => y.w - x.w || x.a - y.a);
  pulls.sort((x, y) => y.w - x.w || (x.form < y.form ? -1 : 1));
  return { pairs, pulls };
}

function bind(resolved, attention, world) {
  const present = new Set(resolved.filter((t) => t.known && t.class !== 'padding').map((t) => t.form));
  const pulled = new Set(attention.pulls.map((p) => p.form));
  const out = [];
  /* bind = half label coverage + half prompt coverage (+0.1 per pulled form),
     so "meaning through connectivity" prefers the exact concept over any
     one-word member: specificity is part of the stated formula */
  const score = (forms) => {
    if (!forms.length || !present.size) return null;
    const direct = forms.filter((f) => present.has(f)).length;
    const nearby = forms.filter((f) => !present.has(f) && pulled.has(f)).length;
    if (!direct) return null;
    return r3(0.5 * (direct / forms.length) + 0.5 * (direct / present.size) + 0.1 * nearby);
  };
  (world.concepts || []).forEach((c) => {
    const s = score(c.forms || []);
    if (s) out.push({ id: c.id, kind: 'doc', label: c.label, family: c.family, score: s, via: (c.forms || []).filter((f) => present.has(f)) });
  });
  ((world.pack || {}).terms || []).forEach((p) => {
    const s = score(p.forms || []);
    if (s) out.push({ id: p.id, kind: 'pack', label: p.label, score: s, via: (p.forms || []).filter((f) => present.has(f)) });
  });
  out.sort((x, y) => y.score - x.score || (x.id < y.id ? -1 : 1));
  return out;
}

function expand(bindings, world) {
  const bound = new Set(bindings.map((b) => b.id));
  const links = [];
  (world.edges || []).forEach((e) => {
    if (bound.has(e.from) || bound.has(e.to)) links.push({ from: e.from, verb: e.verb, to: e.to, src: 'doc' });
  });
  ((world.pack || {}).terms || []).forEach((p) => {
    if (!bound.has(p.id)) return;
    (p.edges || []).forEach(([rel, to]) => links.push({ from: p.id, verb: rel, to, src: 'pack' }));
  });
  const ids = new Set();
  links.forEach((l) => { ids.add(l.from); ids.add(l.to); });
  return { links, reached: Array.from(ids).sort() };
}

function converge(bindings, expansion, world) {
  const byId = {};
  (world.concepts || []).forEach((c) => { byId[c.id] = c; });
  ((world.pack || {}).terms || []).forEach((p) => { byId[p.id] = p; });
  const degree = {};
  expansion.links.forEach((l) => {
    degree[l.from] = (degree[l.from] || 0) + 1;
    degree[l.to] = (degree[l.to] || 0) + 1;
  });
  const ranked = bindings.map((b) => {
    const rec = byId[b.id] || {};
    const blast = degree[b.id] || 0;
    return { ...b, blast, total: r3(2 * b.score + 0.1 * blast),
      def: rec.statement || rec.def || null, section: rec.section || null, quote: rec.quote || null,
      out: expansion.links.filter((l) => l.from === b.id).map((l) => l.verb + ' → ' + (byId[l.to] ? byId[l.to].label : l.to)),
      inn: expansion.links.filter((l) => l.to === b.id).map((l) => (byId[l.from] ? byId[l.from].label : l.from) + ' → ' + l.verb) };
  });
  ranked.sort((x, y) => y.total - x.total || (x.id < y.id ? -1 : 1));
  return ranked;
}

/**
 * Run the whole stack. Deterministic: same text + same world = same output.
 * @returns {{phrase, layers, meaning}} layer traces keyed as in LAYERS
 */
export function runEngine(text, world) {
  const t = tokenise(text);
  const res = resolve(t, world);
  const att = attend(res, world);
  const bnd = bind(res, att, world);
  const exp = expand(bnd, world);
  const con = converge(bnd, exp, world);
  return { phrase: t.phrase,
    layers: { tokenise: t.tokens, resolve: res, attend: att, bind: bnd, expand: exp, converge: con },
    meaning: con.length ? con[0] : null };
}
