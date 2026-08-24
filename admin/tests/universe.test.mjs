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
import { familyPeakElements, derivedConceptEdges, derivedGroupPeaks, pinPositions }
  from '../../assets/universe/core/packs.js';
test('packs: a peak per populated family, contains edges to members', () => {
  const els = familyPeakElements([
    { data: { id: 'c1', family: 'concept' } }, { data: { id: 'c2', family: 'concept' } },
    { data: { id: 'k1', family: 'claim' } }]);
  const peaks = els.filter((e) => e.data.family === 'peak').map((e) => e.data.id);
  assert.deepEqual(peaks, ['peak:concept', 'peak:claim']);
  const edges = els.filter((e) => e.data.kind === 'contains');
  assert.equal(edges.length, 3);
  assert.ok(edges.every((e) => e.data.source.startsWith('peak:')));
});
test('packs: co-claimed concepts derive one counted symmetric edge', () => {
  const els = derivedConceptEdges([
    { data: { source: 'k1', target: 'a', kind: 'about' } },
    { data: { source: 'k1', target: 'b', kind: 'about' } },
    { data: { source: 'k2', target: 'b', kind: 'about' } },
    { data: { source: 'k2', target: 'a', kind: 'about' } },
    { data: { source: 'k3', target: 'a', kind: 'about' } }]);
  assert.equal(els.length, 1);
  assert.equal(els[0].data.count, 2);
  assert.deepEqual([els[0].data.source, els[0].data.target].sort(), ['a', 'b']);
});
test('packs: derived groups get a summit each, named after the best-connected member', () => {
  /* two components: {a, b, c} joined through a, and {d, e}; a has the degree */
  const els = derivedGroupPeaks([
    { data: { id: 'a', label: 'alpha', family: 'concept' } },
    { data: { id: 'b', label: 'beta', family: 'concept' } },
    { data: { id: 'c', label: 'gamma', family: 'concept' } },
    { data: { id: 'd', label: 'delta', family: 'concept' } },
    { data: { id: 'e', label: 'epsilon', family: 'concept' } },
    { data: { source: 'k1', target: 'a', kind: 'about' } },
    { data: { source: 'k1', target: 'b', kind: 'about' } },
    { data: { source: 'k2', target: 'a', kind: 'about' } },
    { data: { source: 'k2', target: 'c', kind: 'about' } },
    { data: { source: 'k3', target: 'd', kind: 'about' } },
    { data: { source: 'k3', target: 'e', kind: 'about' } }]);
  const peaks = els.filter((x) => x.data.family === 'dgroup');
  assert.equal(peaks.length, 2);
  assert.equal(peaks[0].data.label, 'around alpha');   /* largest component first */
  assert.equal(peaks[1].data.label, 'around delta');
  assert.equal(els.filter((x) => x.data.kind === 'contains').length, 5);
});
test('packs: pin positions stack left and right, gap scaled by the free count', () => {
  const pos = pinPositions(['doc', 'p1', 'p2'], ['g1'], 10);
  assert.equal(pos['doc'].x, 0);
  assert.equal(pos['p2'].x, 0);
  assert.equal(pos['g1'].x, 700);            /* max(700, 10 * 26) */
  assert.ok(pos['doc'].y < pos['p1'].y && pos['p1'].y < pos['p2'].y);
  assert.equal(pos['g1'].y, 200);            /* a lone pin sits mid-stack */
  assert.equal(pinPositions([], ['g1'], 40)['g1'].x, 1040);
});

/* ---- nodedoc: the document of one node, composed purely -------------------- */
import { extractionElements, nodeRichness, composeNodeDoc } from '../../assets/universe/core/nodedoc.js';
const NDEX = {
  doc: { slug: 'd', title: 'Doc' },
  nodes: [
    { id: 'a', family: 'concept', label: 'alpha', statement: 's-a', anchor: { section: 'S1', quote: 'q-a' } },
    { id: 'b', family: 'concept', label: 'beta', anchor: { section: 'S1', quote: 'q-b' } },
    { id: 'k1', family: 'claim', label: 'claim one', about: ['a', 'b'], anchor: { section: 'S2', quote: 'q-k1' } },
    { id: 'k2', family: 'claim', label: 'claim two', about: ['a'], anchor: { section: 'S2', quote: 'q-k2' } },
    { id: 'e1', family: 'example', label: 'ex one', demonstrates: ['a'], anchor: { section: 'S3', quote: 'q-e1' } }],
  edges: [{ from: 'a', verb: 'enables', to: 'b', anchor: { section: 'S1', quote: 'q-edge' } }],
  near_but_not: [{ this: 'a', not: 'a schema', anchor: { section: 'S1', quote: 'q-nbn' } }],
  aliases: [{ a: 'a', b: 'also alpha', anchor: { section: 'S1', quote: 'q-al' } }],
  empty_sections: [],
};
test('nodedoc: extraction becomes elements with about, demonstrates and asserted edges', () => {
  const els = extractionElements(NDEX);
  const kinds = {};
  els.forEach((e) => { if (e.data.kind) kinds[e.data.kind] = (kinds[e.data.kind] || 0) + 1; });
  assert.deepEqual(kinds, { about: 3, demonstrates: 1, asserted: 1 });
  assert.equal(els.filter((e) => !e.data.source).length, 5);
});
test('nodedoc: richness ranks by incident links, alphabetical on ties', () => {
  const r = nodeRichness(NDEX);
  assert.equal(r[0].id, 'a');
  assert.equal(r[0].links, 4);   /* k1, k2, e1 point at it, and it asserts to b */
  assert.ok(r.every((x, i) => i === 0 || r[i - 1].links >= x.links));
});
test('nodedoc: the composed document holds exactly what the data holds', () => {
  const m = composeNodeDoc(NDEX, { refs: [{ id: 'r1', where: 'x.html', what: ['a'], how: 'quote', rating: 'aligned' }] }, 'a');
  assert.equal(m.claimsAbout.length, 2);
  assert.equal(m.demonstratedBy.length, 1);
  assert.deepEqual(m.asserts, [{ verb: 'enables', other: 'beta', anchor: { section: 'S1', quote: 'q-edge' } }]);
  assert.equal(m.assertedBy.length, 0);
  assert.equal(m.aliases.length, 1);
  assert.equal(m.nearButNot.length, 1);
  assert.deepEqual(m.derived, [{ other: 'beta', count: 1 }]);
  assert.equal(m.crossrefs.length, 1);
  assert.equal(m.degrees[0].degree, 1);
  assert.deepEqual(m.degrees[0].added.nodes, { concept: 1, claim: 2, example: 1 });
  assert.equal(composeNodeDoc(NDEX, null, 'nope'), null);
});

/* ---- vault-core: the chat's persistence logic, pure ------------------------ */
const { parseVaultKey, sessionId, sessionFolder, changedFiles, sessionFiles, documentName } =
  await import('../../assets/universe-chat/vault-core.js');
test('vault-core: the last colon splits key from vault id', () => {
  assert.deepEqual(parseVaultKey('pass:with:colons:vault-abc'),
    { kind: 'passphrase', passphrase: 'pass:with:colons', vaultId: 'vault-abc' });
  assert.deepEqual(parseVaultKey(' river-cloud-3847 '), { kind: 'token', token: 'river-cloud-3847' });
  assert.throws(() => parseVaultKey(''), /empty/);
  assert.throws(() => parseVaultKey('trailing:'), /passphrase:vaultId/);
});
test('vault-core: session ids sort by time and land in a safe folder', () => {
  const id = sessionId(new Date(Date.UTC(2026, 7, 24, 18, 5, 9)), 'ab12');
  assert.equal(id, '20260824-180509-ab12');
  assert.equal(sessionFolder('thinking-in-graphs', id),
    '/universe-chat/thinking-in-graphs/20260824-180509-ab12');
  assert.throws(() => sessionFolder('../evil', id), /bad slug/);
  assert.throws(() => sessionFolder('ok', '../up'), /bad session id/);
});
test('vault-core: only moved files are written, and hashes advance', () => {
  const first = changedFiles({ 'a.json': 'one', 'b.txt': 'two' }, {});
  assert.deepEqual(Object.keys(first.writes).sort(), ['a.json', 'b.txt']);
  const second = changedFiles({ 'a.json': 'one', 'b.txt': 'CHANGED' }, first.hashes);
  assert.deepEqual(Object.keys(second.writes), ['b.txt']);
  assert.deepEqual(Object.keys(changedFiles({ 'a.json': 'one' }, second.hashes).writes), []);
});
test('vault-core: a session serializes only what it has', () => {
  const files = sessionFiles({ messages: { turns: [] }, drafts: { annotations: [], crossrefs: [], scratch: { nodes: [], edges: [] } }, trace: '  ' });
  assert.deepEqual(Object.keys(files), ['messages.json']);   /* empty drafts and blank trace are not written */
  const full = sessionFiles({ meta: { doc: 'd' }, messages: { turns: [1] },
    drafts: { annotations: [{ id: 'x' }], crossrefs: [], scratch: { nodes: [], edges: [] } }, trace: 'line\n' });
  assert.deepEqual(Object.keys(full).sort(), ['drafts.json', 'messages.json', 'session.json', 'trace.txt']);
});
test('vault-core: document names are tamed and default to markdown', () => {
  assert.equal(documentName('Claims Review!.md'), 'Claims-Review.md');
  assert.equal(documentName('summary'), 'summary.md');
  assert.equal(documentName('../../etc/passwd'), 'etc-passwd.md');
  assert.throws(() => documentName('///'), /usable name/);
});

console.log(`universe tests: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
