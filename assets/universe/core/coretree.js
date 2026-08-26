/* @module universe/core/coretree
   Single responsibility: the client model of the core graph (brief 29) — the
   document transformed to sections, blocks, sentences and words, loaded shard
   by shard. Pure: no DOM, no fetch; callers hand JSON in and read nodes out. */
'use strict';

/**
 * Build the model from the core index: the section skeleton, nothing loaded.
 * @param {object} indexJson - data/core/<slug>/index.json
 * @returns {object} state
 */
export function coreState(indexJson) {
  const st = { doc: indexJson.doc, slug: indexJson.slug, title: indexJson.title,
    ladder: indexJson.ladder, totals: indexJson.totals,
    nodes: new Map(), loaded: new Set(), forms: null };
  indexJson.sections.forEach((s) => {
    st.nodes.set(s.id, { id: s.id, kind: s.id === st.doc ? 'doc' : 'sec',
      label: s.title, parent: s.parent, level: s.level, counts: s.counts,
      shard: s.shard || null, childSecs: [], blocks: [] });
  });
  indexJson.sections.forEach((s) => {
    if (s.parent && st.nodes.has(s.parent)) st.nodes.get(s.parent).childSecs.push(s.id);
  });
  return st;
}

/**
 * Fold one fetched shard into the model, minting sentence and word nodes from
 * the block ids exactly as the generator does (blk: -> sen: -> wrd:).
 * @param {object} st - the state
 * @param {string} secId - the section the shard belongs to
 * @param {object} shardJson - data/core/<slug>/sec-NN.json
 */
export function mergeShard(st, secId, shardJson) {
  const sec = st.nodes.get(secId);
  if (!sec || st.loaded.has(secId)) return;
  (shardJson.blocks || []).forEach((b) => {
    const stem = b.id.slice('blk:'.length);
    const marks = {};
    (b.spans || []).forEach((sp) => {
      st.nodes.set(sp.id, { id: sp.id, kind: sp.kind, label: sp.kind,
        parent: b.id, href: sp.href || null, covers: sp.covers || [] });
      (sp.covers || []).forEach((w) => { (marks[w] = marks[w] || []).push(sp.kind); });
    });
    const sens = (b.sentences || []).map((sn) => {
      const sid = 'sen:' + stem + '.' + sn.n;
      const words = sn.words.map((w, wi) => {
        const wid = 'wrd:' + stem + '.' + sn.n + '.' + (wi + 1);
        st.nodes.set(wid, { id: wid, kind: 'wrd', label: w, parent: sid,
          marks: marks[wid] || [] });
        return wid;
      });
      st.nodes.set(sid, { id: sid, kind: 'sen', label: sn.text, parent: b.id, words });
      return sid;
    });
    st.nodes.set(b.id, { id: b.id, kind: b.kind, label: b.text || b.kind,
      parent: secId, range: b.range, sentences: sens,
      spans: (b.spans || []).map((sp) => sp.id) });
    sec.blocks.push(b.id);
  });
  st.loaded.add(secId);
}

/**
 * The children of a node, in reading order.
 * @returns {string[]|null} ids, or null when the section's shard is not loaded yet
 */
export function childrenOf(st, id) {
  const n = st.nodes.get(id);
  if (!n) return [];
  if (n.kind === 'doc' || n.kind === 'sec') {
    if (n.shard && !st.loaded.has(id)) return null;
    return n.blocks.concat(n.childSecs);
  }
  if (n.sentences) return n.sentences;
  if (n.words) return n.words;
  return [];
}

/** The upward chain from the document to the node, root first. */
export function breadcrumb(st, id) {
  const out = [];
  for (let n = st.nodes.get(id); n; n = n.parent ? st.nodes.get(n.parent) : null) {
    out.unshift({ id: n.id, kind: n.kind, label: n.label });
  }
  return out;
}

/** Attach the word-form index; instances answer "where else does this appear". */
export function loadForms(st, wordsJson) {
  st.forms = new Map();
  (wordsJson.forms || []).forEach((f) => st.forms.set(f.form, f));
}

/** The form record for a word instance's text, or null before loadForms. */
export function formOf(st, text) {
  return st.forms ? st.forms.get(String(text).toLowerCase()) || null : null;
}

/** Attach the token analysis (brief 30): classes, stems, spread, companions. */
export function loadTokens(st, tokensJson) {
  st.tokens = { stats: tokensJson.stats, map: new Map(), stems: new Map() };
  (tokensJson.forms || []).forEach((f) => st.tokens.map.set(f.form, f));
  (tokensJson.stems || []).forEach(([k, v]) => st.tokens.stems.set(k, v));
  st.tokens.near = tokensJson.near || [];
}

/**
 * Everything the token analysis knows about one word form.
 * @returns {Array<[string, string]>} label/value rows (empty before loadTokens)
 */
export function formRecord(st, form) {
  const t = st.tokens && st.tokens.map.get(String(form).toLowerCase());
  if (!t) return [];
  const rows = [['id', 'w:' + t.form], ['class', t.class],
    ['appears', t.count + '× in this document']];
  if (t.stem && st.tokens.stems.has(t.stem)) {
    rows.push(['family', st.tokens.stems.get(t.stem).join(', ')]);
  }
  const near = st.tokens.near.filter((p) => p[0] === t.form || p[1] === t.form)
    .map((p) => (p[0] === t.form ? p[1] : p[0]));
  if (near.length) rows.push(['near-miss', near.join(', ')]);
  if (t.top) rows.push(['gravity', t.top.map((x) => x[0] + ' ×' + x[1]).join(', ')]);
  if (t.spread != null) {
    rows.push(['spread', t.spread + (t.spread >= 0.9 && t.count >= 10
      ? ' — candidate for different meanings in this document' : '')]);
  }
  return rows;
}

/**
 * Everything the model knows about one node, flattened for the inspector.
 * @returns {Array<[string, string]>} label/value rows
 */
export function coreRecord(st, id) {
  const n = st.nodes.get(id);
  if (!n) return [];
  const name = (st.ladder || {})[n.kind] || n.kind;
  const rows = [['id', n.id], ['level', name]];
  if (n.kind === 'wrd') {
    if (n.marks.length) rows.push(['marked', n.marks.join(', ')]);
    const f = formOf(st, n.label);
    if (f) rows.push(['appears', f.count + '× in this document']);
    formRecord(st, n.label).forEach(([k, v]) => {
      if (k !== 'id' && k !== 'appears') rows.push([k, v]);
    });
  }
  if (n.covers) rows.push(['covers', n.covers.length + ' word(s)']);
  if (n.href) rows.push(['href', n.href]);
  if (n.counts) {
    rows.push(['holds', n.counts.blocks + ' blocks · ' + n.counts.sentences
      + ' sentences · ' + n.counts.words + ' words']);
  }
  if (n.range) rows.push(['bytes', n.range[0] + '–' + n.range[1] + ' (verification only; the id is the reference)']);
  return rows;
}
