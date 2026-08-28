/* The graph's derived furniture: family peaks, slots, the schema view, alignment
   rails, path queries and the document of one node.

   Plain node:assert, no framework. Known-answer vectors included so a refactor that
   changes behaviour fails loudly rather than shipping silently different output.
   Run this file alone, or the whole set with `node admin/tests/run.mjs`. */
import assert from 'node:assert/strict';

import { test, report } from './harness.mjs';

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

/* ---- slots: the four border areas and their aligned slots (brief 26) ------- */
import { AREAS, SLOT_COUNT, defaultAssignments, slotPositions, freeSlot }
  from '../../assets/universe/core/slots.js';
test('slots: defaults fill left and right in order, capped at the slot count', () => {
  const a = defaultAssignments(['d', 'p1'], ['g1']);
  assert.deepEqual(a['d'], { area: 'left', slot: 0 });
  assert.deepEqual(a['p1'], { area: 'left', slot: 1 });
  assert.deepEqual(a['g1'], { area: 'right', slot: 0 });
  assert.equal(Object.keys(defaultAssignments(Array.from({ length: 9 }, (_, i) => 'x' + i), [])).length,
    SLOT_COUNT);
});
test('slots: positions align along each border band', () => {
  const pos = slotPositions({
    a: { area: 'top', slot: 0 }, b: { area: 'top', slot: 3 },
    c: { area: 'left', slot: 2 }, d: { area: 'right', slot: 2 },
    e: { area: 'bottom', slot: 1 } }, 10);
  assert.equal(pos.a.y, 0);
  assert.equal(pos.b.y, 0);                          /* the top band is one line */
  assert.ok(pos.a.x < pos.b.x);                      /* slots keep their order */
  assert.equal(pos.c.x, 0);
  assert.equal(pos.d.x, 700);                        /* max(700, 10 * 26) */
  assert.equal(pos.c.y, pos.d.y);                    /* same slot, same height */
  assert.ok(pos.e.y > pos.c.y);                      /* the bottom band is below */
  assert.equal(AREAS.length, 4);
});
test('slots: freeSlot skips used slots and reports a full area', () => {
  const a = { x: { area: 'top', slot: 0 }, y: { area: 'top', slot: 1 } };
  assert.equal(freeSlot(a, 'top'), 2);
  assert.equal(freeSlot(a, 'left'), 0);
  const full = {};
  for (let i = 0; i < SLOT_COUNT; i++) full['n' + i] = { area: 'top', slot: i };
  assert.equal(freeSlot(full, 'top'), -1);
});

/* ---- schema: the types and how they connect (brief 26) --------------------- */
import { schemaElements } from '../../assets/universe/core/schema.js';
test('schema: one node per family with counts, one edge per typed relation', () => {
  const els = schemaElements([
    { data: { id: 'a', family: 'concept' } }, { data: { id: 'b', family: 'concept' } },
    { data: { id: 'k1', family: 'claim' } }, { data: { id: 'e1', family: 'example' } },
    { data: { source: 'k1', target: 'a', kind: 'about' } },
    { data: { source: 'k1', target: 'b', kind: 'about' } },
    { data: { source: 'e1', target: 'a', kind: 'demonstrates' } },
    { data: { source: 'a', target: 'b', kind: 'asserted', verb: 'enables' } }]);
  const nodes = els.filter((x) => !x.data.source);
  assert.deepEqual(nodes.map((n) => n.data.label).sort(),
    ['claim (1)', 'concept (2)', 'example (1)']);
  const edges = els.filter((x) => x.data.source);
  const byLabel = {};
  edges.forEach((e) => { byLabel[e.data.label] = e.data; });
  assert.equal(byLabel['about ×2'].source, 'st:claim');
  assert.equal(byLabel['about ×2'].target, 'st:concept');
  assert.equal(byLabel['demonstrates ×1'].source, 'st:example');
  assert.equal(byLabel['enables ×1'].source, 'st:concept');   /* the verb, not the kind */
  assert.equal(byLabel['enables ×1'].target, 'st:concept');
});

/* ---- align: the invisible rails (brief 26, answered) ----------------------- */
import { alignmentElements, railPositions, familyRailElements, familyRailPositions }
  from '../../assets/universe/core/align.js';
test('align: one rail per heading level, every section tied to its rail', () => {
  const els = alignmentElements([
    { title: 'Doc', level: 1 },
    { title: 'Part 1', level: 2 }, { title: 'Sec A', level: 3 },
    { title: 'Part 2', level: 2 }]);
  const rails = els.filter((x) => x.data.family === 'rail').map((x) => x.data.id);
  assert.deepEqual(rails, ['rail:2', 'rail:3']);
  const ties = els.filter((x) => x.data.kind === 'align')
    .map((x) => x.data.source + '>' + x.data.target);
  assert.deepEqual(ties, ['rail:2>sec:Part 1', 'rail:3>sec:Sec A', 'rail:2>sec:Part 2']);
});
test('align: rails column up, deeper levels further right', () => {
  const pos = railPositions([2, 3]);
  assert.ok(pos['rail:2'].x < pos['rail:3'].x);
  assert.equal(pos['rail:2'].y, pos['rail:3'].y);
});
test('align: family rails row up, one per populated family, members tied', () => {
  const els = familyRailElements([
    { data: { id: 'a', family: 'concept' } }, { data: { id: 'b', family: 'concept' } },
    { data: { id: 'k1', family: 'claim' } }, { data: { id: 's1', family: 'section' } }],
  ['concept', 'claim', 'hypothesis']);
  const rails = els.filter((x) => x.data.family === 'rail').map((x) => x.data.id);
  assert.deepEqual(rails, ['frail:concept', 'frail:claim']);   /* no empty-family rail */
  const ties = els.filter((x) => x.data.kind === 'align');
  assert.equal(ties.length, 3);
  assert.ok(ties.every((t) => t.data.target !== 's1'), 'sections are not family members');
  const pos = familyRailPositions(rails);
  assert.ok(pos['frail:concept'].y < pos['frail:claim'].y);    /* rows stack downward */
  assert.equal(pos['frail:concept'].x, pos['frail:claim'].x);
});
test('schema: rails and their ties never enter the schema', () => {
  const els = schemaElements([
    { data: { id: 'a', family: 'concept' } },
    { data: { id: 'r', family: 'rail' } },
    { data: { id: 't', source: 'r', target: 'a', kind: 'align' } }]);
  assert.equal(els.filter((x) => !x.data.source).length, 1);
  assert.equal(els.filter((x) => x.data.source).length, 0);
});

/* ---- schema with the verbs register: both directions reviewable ------------ */
test('schema: the verbs register puts the declared inverse on the label', () => {
  const els = schemaElements([
    { data: { id: 'a', family: 'concept' } }, { data: { id: 'k1', family: 'claim' } },
    { data: { source: 'k1', target: 'a', kind: 'about' } },
    { data: { source: 'a', target: 'a', kind: 'derived' } }],
  { about: 'subject-of', derived: 'derived' });
  const labels = els.filter((x) => x.data.source).map((x) => x.data.label).sort();
  assert.deepEqual(labels, ['about ⇄ subject-of ×1', 'derived ×1']);   /* symmetric: no arrow pair */
  const about = els.find((x) => x.data.verb === 'about');
  assert.equal(about.data.inverse, 'subject-of');
});

/* ---- pathquery: the trail made runnable (brief 28, answered) --------------- */
import { displayedVerbIndex, trailToQuery, runPathQuery, nextVerbs }
  from '../../assets/universe/core/pathquery.js';
const PQ_ELS = [
  { data: { id: 'a', family: 'concept', label: 'alpha' } },
  { data: { id: 'b', family: 'concept', label: 'beta' } },
  { data: { id: 'c', family: 'concept', label: 'gamma' } },
  { data: { id: 'k1', family: 'claim', label: 'claim one' } },
  { data: { id: 'k2', family: 'claim', label: 'claim two' } },
  { data: { source: 'a', target: 'b', kind: 'asserted', verb: 'enables' } },
  { data: { source: 'b', target: 'c', kind: 'asserted', verb: 'enables' } },
  { data: { source: 'k1', target: 'b', kind: 'about' } },
  { data: { source: 'k2', target: 'b', kind: 'about' } },
];
const PQ_VERBS = { enables: 'enabled-by', about: 'subject-of' };
test('pathquery: displayed inverses resolve to the stored direction', () => {
  const idx = displayedVerbIndex(PQ_VERBS);
  assert.deepEqual(idx['enables'], { stored: 'enables', dir: 'out' });
  assert.deepEqual(idx['enabled-by'], { stored: 'enables', dir: 'in' });
  assert.deepEqual(idx['subject-of'], { stored: 'about', dir: 'in' });
});
test('pathquery: an exact trail replays to exactly its own path', () => {
  const steps = trailToQuery([
    { id: 'a', family: 'concept', label: 'alpha' },
    { verb: 'enables', id: 'b', family: 'concept', label: 'beta' }]);
  const r = runPathQuery(PQ_ELS, PQ_VERBS, steps);
  assert.deepEqual(r.paths, [['a', 'b']]);
});
test('pathquery: a family wildcard fans out, and inverse hops walk backwards', () => {
  /* concept -subject-of-> any claim: from b through the inverse of about */
  const steps = [
    { verb: null, id: null, family: 'concept' },
    { verb: 'subject-of', id: null, family: 'claim' }];
  const r = runPathQuery(PQ_ELS, PQ_VERBS, steps);
  assert.deepEqual(r.paths.map((p) => p.join('>')).sort(), ['b>k1', 'b>k2']);
  assert.equal(r.truncated, false);
});
test('pathquery: two-hop wildcard chains compose', () => {
  const steps = [
    { verb: null, id: null, family: 'concept' },
    { verb: 'enables', id: null, family: null },
    { verb: 'enables', id: null, family: null }];
  const r = runPathQuery(PQ_ELS, PQ_VERBS, steps);
  assert.deepEqual(r.paths, [['a', 'b', 'c']]);
});
test('pathquery: projection lists the verbs that can extend the path', () => {
  const fromConcept = nextVerbs(PQ_ELS, PQ_VERBS, 'concept');
  assert.ok(fromConcept.indexOf('enables') !== -1, 'out verb');
  assert.ok(fromConcept.indexOf('subject-of') !== -1, 'inverse of about');
  assert.ok(fromConcept.indexOf('about') === -1, 'about itself leaves claims, not concepts');
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

await report('graph');
