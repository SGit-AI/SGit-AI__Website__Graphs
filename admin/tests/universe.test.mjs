/* The universe reader's unit suite: pure core logic, plain node:assert, no
   runner, no dependencies. Known-answer vectors included so a refactor that
   changes behaviour fails loudly. Run: node admin/tests/universe.test.mjs
   Wired into the build as a gate: a red suite fails the release. */
import assert from 'node:assert/strict';
import { elementarySegments } from '../../assets/universe/core/segments.js';
import { spliceMarkers, tokensToMarks, escAttr } from '../../assets/universe/core/markup.js';
import { docTreeElements, headingChain, DOC_ROOT_ID } from '../../assets/universe/core/doctree.js';
import { layoutOptions, graphStyle } from '../../assets/universe/core/cystyle.js';

let pass = 0, fail = 0;
function test(label, fn) {
  try { fn(); pass++; console.log('  ok ' + label); }
  catch (e) { fail++; console.error('  FAIL ' + label + ' — ' + e.message); }
}

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
  assert.equal(out,
    'before <mark class="uni-anchor uni-k-claim" data-aids="a" title="A">plain </mark>' +
    '<b><mark class="uni-anchor uni-k-claim" data-aids="a" title="A">bold</mark></b>' +
    '<mark class="uni-anchor uni-k-claim" data-aids="a" title="A"> tail</mark> after');
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
test('cystyle: cose honours the sliders', () => {
  const o = layoutOptions('cose', { len: 200, pull: 150 });
  assert.equal(o.idealEdgeLength, 200);
  assert.equal(o.nodeRepulsion, 150000);
});
test('cystyle: tree is breadthfirst, directed, with the given roots', () => {
  const o = layoutOptions('tree', { len: 90, pull: 90 }, 'node[family = "docroot"]');
  assert.equal(o.name, 'breadthfirst');
  assert.equal(o.directed, true);
  assert.equal(o.roots, 'node[family = "docroot"]');
});
test('cystyle: the stylesheet still carries the focus ring and hide classes', () => {
  const sel = graphStyle().map((r) => r.selector);
  ['node.uni-focus', '.uni-hide', '.uni-dim', 'edge[kind = "contains"]']
    .forEach((s) => assert.ok(sel.includes(s), s));
});

console.log(`universe tests: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
