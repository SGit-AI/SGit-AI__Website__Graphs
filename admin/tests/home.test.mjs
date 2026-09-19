/* The gates for the front door.

   The front page is the one page nobody re-reads. It is also the only page most people
   will ever see: a reader who has just heard "fractal semantic graphs" and followed a
   link lands here and nowhere else. Until v0.6.20 that reader met a domain name, a shelf
   of books and a file index, and the phrase they came for appeared four times, every one
   of them inside a title or a filename — nothing defined it. That is the failure these
   gates exist to make impossible to reintroduce quietly.

   Two halves: the demo's pure core, which decides what the graph may say, and the page
   itself, which must keep defining the phrase, demonstrating it, and naming its archive.

   Plain node:assert, no framework. Run alone, or `node admin/tests/run.mjs home`. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { test, report } from './harness.mjs';
import { available, toggle, all, visibleNodes, claims, confidence, tally }
  from '../../assets/home/core/portgraph.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const rf = (p) => readFileSync(path.join(ROOT, p), 'utf8');
const HOME = JSON.parse(rf('home/data/home.json'));
const DEMO = HOME.demo;
const INDEX = rf('index.html');

/* ---- the demo's core: what the graph may say ------------------------------ */

test('demo: a node with no edges supports only the three things the document allows', () => {
  const said = claims(DEMO, []);
  assert.equal(said.length, DEMO.bare.length);
  assert.deepEqual(said.map((s) => s.says), DEMO.bare.map((b) => b.says));
  assert.equal(confidence(DEMO, []).key, 'none');
});

test('demo: an edge is only offered once the edges it needs exist', () => {
  const first = available(DEMO.edges, []);
  assert.equal(first.length, 1, 'exactly one edge can be added to a bare node');
  assert.equal(first[0].needs.length, 0);
  /* Everything else hangs off that first edge, directly or through another. */
  for (const e of DEMO.edges.slice(1)) assert.ok(e.needs.length > 0, e.id);
});

test('demo: adding an edge brings its prerequisites with it', () => {
  const deep = DEMO.edges.find((e) => e.needs.length && e.needs.some(
    (n) => DEMO.edges.find((x) => x.id === n).needs.length));
  assert.ok(deep, 'the demo has an edge two levels down');
  const active = toggle(DEMO.edges, [], deep.id);
  for (const n of deep.needs) assert.ok(active.includes(n), `${deep.id} needs ${n}`);
});

test('demo: removing an edge removes what hung off it', () => {
  const full = all(DEMO.edges);
  const root = DEMO.edges[0].id;
  assert.deepEqual(toggle(DEMO.edges, full, root), [],
    'removing the type edge cannot leave constraints dangling in mid-air');
});

test('demo: half a range is not a range', () => {
  const pair = DEMO.edges.find((e) => e.pairs);
  assert.ok(pair, 'the demo models the two bounds as a pair');
  const half = toggle(DEMO.edges, [], pair.id);
  assert.ok(!claims(DEMO, half).some((c) => c.edge === pair.id),
    'one bound alone must not let the graph claim a range');
  const both = toggle(DEMO.edges, half, pair.pairs);
  const ranged = claims(DEMO, both).filter((c) => c.says === pair.says);
  assert.equal(ranged.length, 1, 'both bounds together say it once, not twice');
});

test('demo: a node nothing connects to is not drawn', () => {
  assert.deepEqual(visibleNodes(DEMO.nodes, DEMO.edges, []), [DEMO.nodes[0].id]);
  assert.equal(visibleNodes(DEMO.nodes, DEMO.edges, all(DEMO.edges)).length,
    DEMO.nodes.length, 'every node is reachable once every edge exists');
});

test('demo: the value never changes, only the edges do', () => {
  /* This is the claim the section makes, so the demo is not allowed to cheat it by
     editing the node as the reader clicks. */
  const start = tally(DEMO, []);
  let active = [];
  for (const e of DEMO.edges) {
    active = toggle(DEMO.edges, active, e.id);
    assert.equal(tally(DEMO, active).value, start.value, `value moved at ${e.id}`);
  }
  assert.equal(active.length, DEMO.edges.length);
  assert.equal(confidence(DEMO, active).key, 'full');
  assert.ok(tally(DEMO, active).claims > start.claims,
    'the same value, better connected, supports more');
});

/* ---- the page: it must keep doing the job it was rebuilt to do ------------- */

/** The front door's contract, as a function so it can be run against a broken page too.
 *  Returns the list of ways the page has stopped being a door. */
function doorFaults(html, home) {
  const faults = [];
  /* Scripts are stripped first, and that is not tidiness. The page embeds its own data
     as `window.HOME`, which carries the definition too — so a page that had stopped
     SHOWING the definition to a human would still have contained the string, and this
     gate would have passed it. It did, the first time it was run red. */
  const body = html.slice(html.indexOf('<body'))
    .replace(/<script[\s\S]*?<\/script>/g, '');
  if (!/fractal semantic graphs/i.test(body)) {
    faults.push('the page never says the phrase the site is found by');
  }
  if (!body.includes(home.definition.quote)) {
    faults.push('the page does not carry the definition of that phrase');
  }
  if (!/<port-graph/.test(body)) faults.push('the page demonstrates nothing');
  if (!/href="site\/index\.html"/.test(body)) faults.push('the page does not name its archive');
  return faults;
}

test('front door: it defines the phrase the site is found by, in the corpus\'s own words', () => {
  assert.deepEqual(doorFaults(INDEX, HOME), []);
  /* And the definition is a quotation, not a paraphrase: it is in the carried source
     byte for byte. gen_home checks this at build time; this checks the shipped page. */
  const src = rf(HOME.definition.where.replace('v2/universe/thinking-in-graphs.html',
    'v2/universe/docs/thinking-in-graphs/source.md'));
  assert.ok(src.includes(HOME.definition.quote),
    'the front page quotes a sentence that is not in the document it credits');
});

test('front door: the gate goes red when the definition is taken out', () => {
  /* Run against a deliberately broken page before it was trusted — the same discipline
     the freeze gate and validate.js were given. A gate nobody has seen fail is a
     comment. */
  const broken = INDEX.replace(HOME.definition.quote, 'something about graphs');
  assert.notEqual(broken, INDEX, 'the fixture must actually differ');
  const faults = doorFaults(broken, HOME);
  assert.ok(faults.some((f) => /definition/.test(f)), faults.join('; '));
  assert.deepEqual(doorFaults(INDEX.replace('<port-graph></port-graph>', ''), HOME),
    ['the page demonstrates nothing']);
});

test('front door: every sentence the demo puts in a reader\'s mouth is a quotation', () => {
  const src = rf(DEMO.source);
  for (const e of DEMO.edges) {
    assert.ok(src.includes(e.quote), `edge ${e.id} quotes something not in the source`);
  }
  for (const b of DEMO.bare) {
    assert.ok(src.includes(b.quote), `the bare claim "${b.says}" is not in the source`);
  }
});

test('front door: it renders computed numbers rather than remembered ones', () => {
  /* Every number in the counts strip has to be one gen_home counted. A hand-typed
     number on the busiest page of the site is exactly the failure this estate keeps
     finding in itself. */
  const strip = INDEX.slice(INDEX.indexOf('<div class="counts">'),
    INDEX.indexOf('</div>', INDEX.indexOf('<div class="counts">')));
  const nums = [...strip.matchAll(/<b>([\d,]+)<\/b>/g)].map((m) => Number(m[1].replace(/,/g, '')));
  assert.ok(nums.length >= 5, `the strip shows ${nums.length} numbers`);
  const known = new Set(Object.values(HOME.inventory).filter((v) => typeof v === 'number'));
  for (const n of nums) assert.ok(known.has(n), `${n} is on the page but nothing computed it`);
});

test('front door: the archive kept every link the old front page carried', () => {
  /* The archive MOVED. If it had been trimmed on the way, this is where it would show:
     the estate page has to name every section the old page named, and the first-edition
     index has to still be generated from the tree rather than typed. */
  const estate = rf('site/index.html');
  for (const must of ['v1/vaults/index.html', 'v1/docs/index.html', 'v1/altitudes/index.html',
    'v1/reviews/index.html', 'v1/documents/index.html', 'decisions/index.html',
    'v2/index.html', 'admin/index.html', 'v2/books/index.html']) {
    assert.ok(estate.includes('../' + must), `the estate page lost ${must}`);
  }
  assert.ok(/<div class="frontidxs">/.test(estate), 'the first-edition index is gone');
  assert.ok(/id="sequence"/.test(estate) && /id="estate"/.test(estate) && /id="index"/.test(estate),
    'the estate page must keep the anchors the old front page published');
  assert.ok(estate.includes('<h1>Everything on this site</h1>'));
});

test('front door: both pages are in the build chain', () => {
  /* gen_front.py was not, which is how the front page came to be nine releases behind
     its own release count while every gate reported green. */
  const chain = rf('README.md');
  for (const g of ['admin/build/gen_home.py', 'admin/build/gen_front.py']) {
    assert.ok(chain.includes('python3 ' + g), `${g} is not in the README chain`);
  }
  assert.ok(chain.indexOf('gen_home.py') < chain.indexOf('gen_front.py'),
    'gen_front reads what gen_home writes, so it runs second');
});

await report('home');
