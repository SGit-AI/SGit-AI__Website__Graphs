/* The reader's rendering core: segments, markup, the document tree, the graph
   stylesheet, the agent command table, kinds, exploration and the preset views.

   Plain node:assert, no framework. Known-answer vectors included so a refactor that
   changes behaviour fails loudly rather than shipping silently different output.
   Run this file alone, or the whole set with `node admin/tests/run.mjs`. */
import assert from 'node:assert/strict';
import { elementarySegments } from '../../assets/universe/core/segments.js';
import { spliceMarkers, tokensToMarks, escAttr } from '../../assets/universe/core/markup.js';
import { docTreeElements, headingChain, DOC_ROOT_ID } from '../../assets/universe/core/doctree.js';
import { layoutOptions, graphStyle } from '../../assets/universe/core/cystyle.js';

import { test, report } from './harness.mjs';

/* ---- segments: the known-answer vector covers nesting and identity -------- */
test('segments: disjoint anchors pass through', () => {
  const segs = elementarySegments([
    { aid: 'a', chars: [0, 5] }, { aid: 'b', chars: [10, 15] }]);
  assert.deepEqual(segs, [
    { s: 0, e: 5, ids: ['a'] }, { s: 10, e: 15, ids: ['b'] }]);
});
test('segments: a nested anchor splits into three, prefix carries both', () => {
  /* the real case from the pilot: a near-but-not that is a PREFIX of a claim */
  const segs = elementarySegments([
    { aid: 'claim', chars: [100, 180] }, { aid: 'nbn', chars: [100, 140] }]);
  assert.deepEqual(segs, [
    { s: 100, e: 140, ids: ['claim', 'nbn'] }, { s: 140, e: 180, ids: ['claim'] }]);
});
test('segments: identical ranges become one segment with both ids', () => {
  const segs = elementarySegments([
    { aid: 'x', chars: [7, 20] }, { aid: 'y', chars: [7, 20] }]);
  assert.equal(segs.length, 1);
  assert.deepEqual(segs[0].ids.sort(), ['x', 'y']);
});

/* ---- markup: splicing and the token pass ---------------------------------- */
const dec = new TextDecoder();
const enc = new TextEncoder();
test('markup: splice + render round-trip on multibyte text', () => {
  const raw = enc.encode('héllo — wörld, and more');
  const segs = elementarySegments([{ aid: 'a', chars: [0, 6] }]);   /* "héllo": 6 bytes, é is 2 */
  const md = spliceMarkers(raw, segs, dec);
  assert.ok(md.startsWith('⟦S0⟧héllo⟦E0⟧'));
  assert.ok(md.endsWith('and more'));
});
test('markup: a segment crossing inline tags closes and reopens the mark', () => {
  /* the vector: bold inside the cited span; the mark must never wrap a tag */
  const html = 'before ⟦S0⟧plain <b>bold</b> tail⟦E0⟧ after';
  const out = tokensToMarks(html, [{ ids: ['a'] }], () => 'claim', () => 'A');
  const M = '<mark class="uni-anchor uni-k-claim" data-kind="claim" data-aids="a" title="A">';
  assert.equal(out,
    'before ' + M + 'plain </mark><b>' + M + 'bold</mark></b>' + M + ' tail</mark> after');
});
test('markup: overlapping links — the last-added one wins colour, chip and click', () => {
  const out = tokensToMarks('⟦S0⟧x⟦E0⟧', [{ ids: ['a', 'b'] }],
    (id) => (id === 'b' ? 'nbn' : 'claim'), (id) => id.toUpperCase());
  assert.ok(out.includes('uni-k-nbn'), 'colour class from the last id');
  assert.ok(out.includes('data-kind="nbn"'), 'chip kind from the last id');
  assert.ok(out.includes('data-more=" +1"'), 'chip counts the other links');
  assert.ok(out.includes('title="A · B"'), 'the title still names every link');
});
test('markup: tokens inside a code block still become marks', () => {
  const html = '<pre><code>x = ⟦S0⟧8080⟦E0⟧;</code></pre>';
  const out = tokensToMarks(html, [{ ids: ['p'] }], () => 'example', () => 'port');
  assert.ok(out.includes('<mark class="uni-anchor uni-k-example"'));
  assert.ok(!out.includes('⟦'));
});
test('markup: empty marks produced at tag boundaries are dropped', () => {
  const html = '⟦S0⟧<b>x</b>⟦E0⟧';
  const out = tokensToMarks(html, [{ ids: ['a'] }], () => 'concept', () => 'l');
  assert.ok(!out.match(/<mark[^>]*><\/mark>/));
});
test('markup: escAttr neutralises markup in titles', () => {
  assert.equal(escAttr('<b>"x"&</b>'), '&lt;b&gt;&quot;x&quot;&amp;&lt;/b&gt;');
});

/* ---- doc tree: containment chain vector ----------------------------------- */
test('doctree: title -> part -> section -> anchored node', () => {
  const els = docTreeElements('Doc', [
    { title: 'Doc', level: 1 },
    { title: 'Part 1', level: 2 },
    { title: 'Sec A', level: 3 },
    { title: 'Part 2', level: 2 }],
    [{ aid: 'n1', section: 'Sec A' }, { aid: 'skip', section: 'Sec A' }],
    (aid) => aid === 'n1');
  const edges = els.filter((e) => e.data.kind === 'contains')
    .map((e) => e.data.source + '>' + e.data.target);
  assert.deepEqual(edges, [
    DOC_ROOT_ID + '>sec:Part 1', 'sec:Part 1>sec:Sec A',
    DOC_ROOT_ID + '>sec:Part 2', 'sec:Sec A>n1']);
});
test('doctree: headingChain walks up through the levels', () => {
  const heads = [{ level: 1 }, { level: 2 }, { level: 3 }, { level: 3 }, { level: 2 }];
  assert.deepEqual(headingChain(heads, 3), [0, 1, 3]);   /* h1 > first h2 > current h3 */
  assert.deepEqual(headingChain(heads, null), []);
});

/* ---- cystyle: the physics land in the layout ------------------------------ */
test('cystyle: cose honours the sliders, align ties stay short', () => {
  const o = layoutOptions('cose', { len: 200, pull: 150 });
  const edge = (kind) => ({ data: () => kind });
  assert.equal(o.idealEdgeLength(edge('about')), 200);
  assert.equal(o.idealEdgeLength(edge('align')), 34);
  assert.equal(o.nodeRepulsion, 150000);
  assert.equal(o.fit, false);   /* the caller decides whether the viewport moves */
});
test('cystyle: tree is breadthfirst, directed, with the given roots', () => {
  const o = layoutOptions('tree', { len: 90, pull: 90 }, 'node[family = "docroot"]');
  assert.equal(o.name, 'breadthfirst');
  assert.equal(o.directed, true);
  assert.equal(o.roots, 'node[family = "docroot"]');
});
test('cystyle: the stylesheet still carries the focus ring and hide classes', () => {
  const sel = graphStyle().map((r) => r.selector);
  ['node.uni-focus', '.uni-hide', '.uni-dim', 'edge[kind = "contains"]',
    'node[family = "peak"]', 'node[family = "dgroup"]', 'edge[kind = "derived"]', 'edge.uni-path']
    .forEach((s) => assert.ok(sel.includes(s), s));
});

/* ---- commands: the table and its two projections stay honest -------------- */
const { COMMANDS, LEVELS, toolSchemas, clampRange } =
  await import('../../assets/universe/core/commands.js');
test('commands: every entry is complete and snake_case', () => {
  for (const c of COMMANDS) {
    assert.match(c.name, /^[a-z][a-z0-9_]*$/, c.name);
    assert.ok(LEVELS.includes(c.level), c.name + ' level');
    assert.ok(c.description.length > 20, c.name + ' description');
    assert.ok(c.properties && Array.isArray(c.required), c.name + ' schema');
    for (const r of c.required) assert.ok(r in c.properties, c.name + ' requires unknown param ' + r);
  }
});
test('commands: names are unique', () => {
  assert.equal(new Set(COMMANDS.map((c) => c.name)).size, COMMANDS.length);
});
test('commands: toolSchemas filters by level and keeps OpenAI shape', () => {
  const read = toolSchemas(['read']);
  assert.ok(read.length > 0 && read.length < COMMANDS.length);
  for (const t of read) {
    assert.equal(t.type, 'function');
    assert.equal(t.function.parameters.additionalProperties, false);
    assert.equal(COMMANDS.find((c) => c.name === t.function.name).level, 'read');
  }
  assert.equal(toolSchemas(LEVELS).length, COMMANDS.length);
});
test('commands: an unknown level throws rather than silently vanishing', () => {
  assert.throws(() => toolSchemas(['read', 'wizard']), /unknown tool level/);
});
test('commands: clampRange never exceeds the cap or the text', () => {
  assert.deepEqual(clampRange(undefined, undefined, 100), { start: 0, end: 100 });
  assert.deepEqual(clampRange(0, 99999, 20000), { start: 0, end: 6000 });
  assert.deepEqual(clampRange(50, 40, 100), { start: 50, end: 50 });
  assert.deepEqual(clampRange(-5, 10, 100), { start: 0, end: 10 });
  assert.deepEqual(clampRange(90, undefined, 100), { start: 90, end: 100 });
});

/* ---- kinds: the one list both panes filter on ------------------------------ */
import { KINDS, NODE_KINDS, allKinds } from '../../assets/universe/core/kinds.js';
test('kinds: every node family is a kind, and the default is everything on', () => {
  const keys = KINDS.map((k) => k[0]);
  NODE_KINDS.forEach((f) => assert.ok(keys.includes(f), f));
  assert.deepEqual(allKinds(), keys);
  assert.equal(keys.length, 8);
});

/* ---- explore: the N-degree walk and the stats ------------------------------ */
import { neighbourhoodIds, nextDegree, graphStats, statsText } from '../../assets/universe/core/explore.js';
const CHAIN = [
  { id: 'a', family: 'concept' }, { id: 'b', family: 'claim' }, { id: 'c', family: 'concept' },
  { id: 'e1', source: 'a', target: 'b', kind: 'about' },
  { id: 'e2', source: 'b', target: 'c', kind: 'about' }];
test('explore: degree 0 keeps just the node; each hop adds a ring', () => {
  assert.deepEqual([...neighbourhoodIds(CHAIN, 'a', 0)].sort(), ['a']);
  assert.deepEqual([...neighbourhoodIds(CHAIN, 'a', 1)].sort(), ['a', 'b', 'e1']);
  assert.deepEqual([...neighbourhoodIds(CHAIN, 'a', 2)].sort(), ['a', 'b', 'c', 'e1', 'e2']);
  assert.deepEqual(neighbourhoodIds(CHAIN, 'a', Infinity), neighbourhoodIds(CHAIN, 'a', 2));
});
test('explore: the walk is undirected and keeps edges between kept nodes', () => {
  const tri = CHAIN.concat([{ id: 'e3', source: 'c', target: 'a', kind: 'asserted' }]);
  const one = neighbourhoodIds(tri, 'b', 1);
  assert.ok(one.has('a') && one.has('c'), 'both neighbours over incoming edges');
  assert.ok(one.has('e3'), 'the edge closing the triangle is kept');
});
test('explore: the degree stepper clamps at 0 and toggles max', () => {
  assert.equal(nextDegree(1, 'up'), 2);
  assert.equal(nextDegree(0, 'down'), 0);
  assert.equal(nextDegree(2, 'max'), 'max');
  assert.equal(nextDegree('max', 'max'), 1);
  assert.equal(nextDegree('max', 'up'), 1);
});
test('explore: stats count families and edge kinds apart, readably', () => {
  const s = graphStats(CHAIN);
  assert.deepEqual(s, { nodes: { concept: 2, claim: 1 }, edges: { about: 2 } });
  assert.equal(statsText(s), '1 claim · 2 concept — edges: 2 about');
});

/* ---- views: the presets only name real preferences ------------------------- */
import { PRESET_VIEWS } from '../../assets/universe/core/views.js';
test('views: every preset pref is a known key with a sane value', () => {
  const KEYS = ['glay', 'gdoc', 'gtree', 'gpeaks', 'gderived', 'gexp', 'gdeg', 'gpaths', 'gboxed'];
  assert.ok(PRESET_VIEWS.length >= 4);
  PRESET_VIEWS.forEach((v) => {
    assert.ok(v.key && v.label, v.key);
    Object.keys(v.prefs).forEach((k) => assert.ok(KEYS.includes(k), v.key + '.' + k));
    if ('glay' in v.prefs) assert.ok(['cose', 'concentric', 'grid', 'tree'].includes(v.prefs.glay));
  });
});

/* ---- packs: family peaks and the co-claimed derivation --------------------- */

await report('reader');
