/* The core graph's tree and the file explorer's views: lazy shards, minted ids,
   form records, and the raw/rendered projections of each artefact.

   Plain node:assert, no framework. Known-answer vectors included so a refactor that
   changes behaviour fails loudly rather than shipping silently different output.
   Run this file alone, or the whole set with `node admin/tests/run.mjs`. */
import assert from 'node:assert/strict';
import { coreState, mergeShard, childrenOf, breadcrumb, loadForms, formOf, coreRecord,
  loadTokens, formRecord } from '../../assets/universe/core/coretree.js';
import { viewOf, rawJsonHtml, rawMdHtml, buildView } from '../../assets/universe/core/fileview.js';

import { test, report } from './harness.mjs';

/* ---- coretree: the document-to-word model over a known shard -------------- */
const CT_INDEX = {
  doc: 'doc:d', slug: 'd', title: 'The Doc',
  ladder: { doc: 'document', sec: 'section', blk: 'block', sen: 'sentence', wrd: 'word' },
  totals: { blocks: 1, sentences: 2, words: 5 },
  forms: 'words.json',
  sections: [
    { id: 'doc:d', title: 'The Doc', level: 1, parent: null, counts: { blocks: 0, sentences: 0, words: 0 } },
    { id: 'sec:A', title: 'A', level: 2, parent: 'doc:d', shard: 'sec-01.json',
      uid: 'd:s1', counts: { blocks: 1, sentences: 2, words: 5 } },
    { id: 'sec:A1', title: 'A1', level: 3, parent: 'sec:A', counts: { blocks: 0, sentences: 0, words: 0 } }],
};
const CT_SHARD = { sec: 'sec:A', blocks: [
  { id: 'blk:A/1', kind: 'para', range: [10, 60], text: 'Graphs win. Nodes carry graphs.',
    sentences: [
      { n: 1, text: 'Graphs win.', words: ['Graphs', 'win'] },
      { n: 2, text: 'Nodes carry graphs.', words: ['Nodes', 'carry', 'graphs'] }],
    spans: [{ id: 'mk:A/1.1', kind: 'bold', covers: ['wrd:A/1.2.1'] }] }] };
const CT_WORDS = { doc: 'doc:d', forms: [
  { form: 'graphs', count: 2, instances: ['wrd:A/1.1.1', 'wrd:A/1.2.3'] }] };

test('coretree: skeleton, lazy shard, and minted ids', () => {
  const st = coreState(CT_INDEX);
  assert.deepEqual(childrenOf(st, 'doc:d'), ['sec:A']);
  assert.equal(childrenOf(st, 'sec:A'), null);            /* shard not loaded yet */
  mergeShard(st, 'sec:A', CT_SHARD);
  assert.deepEqual(childrenOf(st, 'sec:A'), ['blk:A/1', 'sec:A1']);
  assert.deepEqual(childrenOf(st, 'blk:A/1'), ['sen:A/1.1', 'sen:A/1.2']);
  assert.deepEqual(childrenOf(st, 'sen:A/1.2'), ['wrd:A/1.2.1', 'wrd:A/1.2.2', 'wrd:A/1.2.3']);
  assert.equal(st.nodes.get('wrd:A/1.2.1').label, 'Nodes');
  assert.deepEqual(st.nodes.get('wrd:A/1.2.1').marks, ['bold']);   /* the span marks it */
  assert.deepEqual(childrenOf(st, 'sec:A1'), []);          /* no shard means no blocks */
});
test('coretree: breadcrumb walks parents root-first', () => {
  const st = coreState(CT_INDEX);
  mergeShard(st, 'sec:A', CT_SHARD);
  assert.deepEqual(breadcrumb(st, 'wrd:A/1.2.3').map((x) => x.id),
    ['doc:d', 'sec:A', 'blk:A/1', 'sen:A/1.2', 'wrd:A/1.2.3']);
});
test('coretree: forms count instances and the record says so', () => {
  const st = coreState(CT_INDEX);
  mergeShard(st, 'sec:A', CT_SHARD);
  loadForms(st, CT_WORDS);
  assert.equal(formOf(st, 'Graphs').count, 2);             /* case-folded lookup */
  const rows = Object.fromEntries(coreRecord(st, 'wrd:A/1.2.3'));
  assert.equal(rows.level, 'word');
  assert.ok(rows.appears.startsWith('2×'));
  const wordRows = Object.fromEntries(coreRecord(st, 'wrd:A/1.2.1'));
  assert.equal(wordRows.marked, 'bold');
  const secRows = Object.fromEntries(coreRecord(st, 'sec:A'));
  assert.ok(secRows.holds.includes('5 words'));
  assert.ok(secRows.uid.startsWith('d:s1'));   /* the ledger identity surfaces */
  assert.ok(Object.fromEntries(coreRecord(st, 'blk:A/1')).bytes.includes('verification only'));
});

test('coretree: the token analysis reads back into form records', () => {
  const st = coreState(CT_INDEX);
  loadTokens(st, {
    stats: { instances: 5, forms: 4, by_class: { content: 2, padding: 1, verb: 1, code: 0, number: 0 },
      padding_share: 0.4, hapax: 2, stem_families: 1 },
    forms: [
      { form: 'graphs', count: 2, class: 'content', stem: 'graph', spread: 0.95,
        top: [['nodes', 2], ['win', 1]] },
      { form: 'nodes', count: 1, class: 'content', stem: 'graph' },
      { form: 'the', count: 1, class: 'padding' },
      { form: 'carry', count: 1, class: 'verb' }],
    stems: [['graph', ['graph', 'graphs']]],
    near: [['graphs', 'graph']],
  });
  const rows = Object.fromEntries(formRecord(st, 'Graphs'));   /* case-folded */
  assert.equal(rows.id, 'w:graphs');
  assert.equal(rows.class, 'content');
  assert.equal(rows.family, 'graph, graphs');
  assert.equal(rows['near-miss'], 'graph');
  assert.equal(rows.gravity, 'nodes ×2, win ×1');
  assert.ok(rows.spread.includes('candidate') === false);      /* count 2 < 10 stays unflagged */
  assert.deepEqual(formRecord(st, 'absent'), []);
});

/* ---- fileview: the explorer's colorizers and data views ------------------- */
test('fileview: file names route to their views', () => {
  assert.equal(viewOf('ids.json'), 'ledger');
  assert.equal(viewOf('sec-07.json'), 'shard');
  assert.equal(viewOf('source.md'), 'rendered');
  assert.equal(viewOf('universe.json'), null);
});
test('fileview: raw JSON colorizes and escapes', () => {
  const h = rawJsonHtml('{"a": "x<y", "n": 3, "ok": true}');
  assert.ok(h.includes('fv-key') && h.includes('fv-str') && h.includes('fv-num') && h.includes('fv-kw'));
  assert.ok(h.includes('x&lt;y'));                        /* escaped inside a token */
  assert.ok(!h.includes('x<y'));
  assert.ok(rawJsonHtml('not json').includes('not json')); /* falls back to plain */
});
test('fileview: raw markdown tints lines without eating them', () => {
  const h = rawMdHtml('# Title\n> quote\n- item one\n```\ncode<tag>\n```');
  assert.ok(h.includes('fv-h') && h.includes('fv-q') && h.includes('fv-li') && h.includes('fv-code'));
  assert.ok(h.includes('code&lt;tag&gt;'));
});
test('fileview: the ledger and token views build from real shapes', () => {
  const ledger = buildView('ledger', { prefix: 'd', minted: { b: 2 }, ids: [
    { uid: 'd:b1', level: 'blk', locator: 'blk:A/1', status: 'live' },
    { uid: 'd:b2', level: 'blk', locator: 'blk:A/2', status: 'retired' }] });
  assert.ok(ledger.includes('d:b1') && ledger.includes('retired') && ledger.includes('1</b> live'));
  const tokens = buildView('tokens', {
    stats: { instances: 10, forms: 3, by_class: { content: 2, padding: 1 },
      padding_share: 0.4, hapax: 1 },
    forms: [{ form: 'graph', count: 6, class: 'content', spread: 0.95 },
      { form: 'the', count: 4, class: 'padding' }] });
  assert.ok(tokens.includes('fv-bar') && tokens.includes('padding 40%'));
  assert.ok(!tokens.includes(' ◊</b>'), 'count 6 < 10 stays unflagged in the bars');
  assert.equal(buildView('nope', {}), null);
});

await report('coretree');
