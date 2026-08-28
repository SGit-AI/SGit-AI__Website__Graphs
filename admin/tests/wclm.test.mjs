/* The WCLM: the pinned hash, the strict pipeline, senses and switching, the
   operator folders and their recorded vectors, and the code anatomy.

   Plain node:assert, no framework. Known-answer vectors included so a refactor that
   changes behaviour fails loudly rather than shipping silently different output.
   Run this file alone, or the whole set with `node admin/tests/run.mjs`. */
import assert from 'node:assert/strict';
import { fnv64, runPipeline, runDelta, BLOCKS, DEFAULT_PIPELINE, TYPES } from '../../assets/wclm/engine.js';
import { numberOf, senseOf } from '../../assets/wclm/senses.js';

import { test, report } from './harness.mjs';

/* ---- wclm: the deterministic transformer (brief 31) ----------------------- */
test('wclm: the hash is pinned, so python and js can never drift', () => {
  assert.equal(fnv64('graph'), '32ec982977fe');   /* gen_wclm.py prints the same */
  assert.equal(fnv64('Graph'), fnv64('Graph'));
  assert.notEqual(fnv64('graph'), fnv64('graphs'));
});
const WC_WORLD = {
  tokens: {
    [fnv64('meaning')]: { n: 0, form: 'meaning', count: 20, class: 'content', w: 0.2, top: [['connectivity', 5]] },
    [fnv64('connectivity')]: { n: 1, form: 'connectivity', count: 15, class: 'content', w: 0.25, top: [['meaning', 5]] },
    [fnv64('the')]: { n: 2, form: 'the', count: 99, class: 'padding', w: 0.01 },
    [fnv64('without')]: { n: 3, form: 'without', count: 5, class: 'padding', w: 0.02 },
    [fnv64('edges')]: { n: 4, form: 'edges', count: 12, class: 'content', w: 0.24 },
  },
  stems: { meaning: ['meaning', 'meanings'] },
  cooc: [['meaning', 'connectivity', 5]],
  concepts: [
    { id: 'mtc', label: 'meaning through connectivity', family: 'concept',
      statement: 'What a thing is emerges from its edges.', forms: ['meaning', 'connectivity'] },
    { id: 'con', label: 'connectivity', family: 'concept', forms: ['connectivity'],
      statement: 'Connectivity is the substrate.', section: 'Part 1', quote: 'meaning lives in the connections' },
    { id: 'edg', label: 'edges', family: 'concept', forms: ['edges'] }],
  edges: [{ from: 'c1', verb: 'about', to: 'mtc' }],
  pack: { terms: [{ id: 'pk:meaning', label: 'meaning', def: 'What a thing is.',
    forms: ['meaning'], edges: [['about', 'pk:connectivity']] }] },
};
test('wclm: the pipeline runs strictly and the exact concept out-binds its members', () => {
  const R = runPipeline('the meaning through connectivity', WC_WORLD);
  assert.equal(R.steps.filter((x) => !x.skipped).length, DEFAULT_PIPELINE.flat().length);
  assert.ok(BLOCKS.length > DEFAULT_PIPELINE.flat().length);    /* passthrough waits in the registry */
  assert.equal(R.state.tokens.length, 4);
  assert.equal(R.state.resolved.filter((t) => t.known).length, 3);
  assert.equal(R.state.attention.profiles.length, 2);           /* padding dropped */
  assert.equal(R.state.attention.profiles[0].pairs[0].w, 5);
  assert.equal(R.meaning.id, 'mtc');
  assert.equal(R.meaning.def, 'What a thing is emerges from its edges.');
  assert.ok(R.meaning.blast >= 1);
});
test('wclm: negation changes the answer and surfaces the contradiction', () => {
  const thru = runPipeline('meaning through connectivity', WC_WORLD);
  const sans = runPipeline('meaning without connectivity', WC_WORLD);
  assert.notEqual(thru.meaning.id, sans.meaning.id);            /* the founder's finding, fixed */
  assert.ok(sans.notes[0].includes('negates "connectivity"'));
  assert.ok(sans.notes[0].includes('contradicts the world'));
  assert.ok(thru.notes.length === 0);
});
test('wclm: normalise repairs by dictionary and thesaurus, and says how', () => {
  const R = runPipeline('meaninged and connectivvity', WC_WORLD);
  const fixed = R.state.tokens.filter((t) => t.fix);
  assert.equal(fixed.length, 2);
  assert.equal(fixed[0].form, 'meaning');                       /* stem family (thesaurus) */
  assert.ok(fixed[0].fix.how.includes('stem family'));
  assert.equal(fixed[1].form, 'connectivity');                  /* edit distance (dictionary) */
  assert.ok(fixed[1].fix.how.includes('edit distance'));
});
test('wclm: blocks mix and match, illegal orders skip with a reason', () => {
  const min = runPipeline('meaning connectivity', WC_WORLD, ['tokenise', 'resolve', 'bind', 'converge']);
  assert.equal(min.meaning.id, 'mtc');
  const bad = runPipeline('meaning', WC_WORLD, ['expand', 'tokenise', 'resolve', 'bind', 'converge']);
  assert.ok(bad.steps.find((x) => x.key === 'expand').skipped.includes('needs bindings'));
  assert.ok(bad.meaning);                                       /* the rest still runs */
});
/* ---- wclm: senses, number, layers of engines (brief 34) ------------------- */
const WC_SENSE = { ...WC_WORLD, senses: { meaning: [
  { key: 'doc', label: 'meaning through edges', domain: 'this document',
    def: 'What a thing is emerges from its connections.' },
  { key: 'legal', label: 'the meaning of a term', domain: 'law',
    def: 'What a contract term is held to say.' }] } };
test('wclm: number is evidence and the document sense is the default', () => {
  assert.equal(numberOf('meanings', WC_WORLD.stems).num, 'plural');
  assert.equal(numberOf('meanings', WC_WORLD.stems).base, 'meaning');
  assert.equal(numberOf('meaning', WC_WORLD.stems).num, 'singular');
  assert.equal(senseOf('meanings', WC_SENSE, {}).word, 'meaning');   /* plural inherits */
  const R = runPipeline('meaning through connectivity', WC_SENSE);
  assert.deepEqual(R.state.senseTable.map((x) => x.word + ':' + x.active), ['meaning:doc']);
  assert.equal(R.meaning.id, 'mtc');                            /* the default changes nothing */
  assert.equal(R.notes.length, 0);
});
test('wclm: switching a sense withdraws the word and says what stops applying', () => {
  const R = runPipeline('meaning connectivity', WC_SENSE, null, { senses: { meaning: 'legal' } });
  assert.equal(R.meaning.id, 'con');                            /* mtc loses its via-word */
  const sb = R.state.bindings.find((b) => b.kind === 'sense');
  assert.equal(sb.id, 'sense:meaning.legal');
  assert.ok(R.notes[0].includes('you read "meaning" as the meaning of a term'));
  assert.ok(R.notes[0].includes('do not apply'));
  /* a word said twice still withdraws ONCE: one binding, one note */
  const twice = runPipeline('meaning of meaning', WC_SENSE, null, { senses: { meaning: 'legal' } });
  assert.equal(twice.state.bindings.filter((b) => b.kind === 'sense').length, 1);
  assert.equal(twice.notes.length, 1);
});
test('wclm: engines share a layer, and a sibling need is honestly skipped', () => {
  const R = runPipeline('meaning without connectivity', WC_SENSE,
    [['tokenise'], ['resolve'], ['senses', 'operators'], ['bind'], ['converge']]);
  const li = (k) => R.steps.find((x) => x.key === k).layer;
  assert.equal(li('senses'), li('operators'));                  /* side by side */
  assert.notEqual(R.meaning.id, 'mtc');                         /* negation still bites */
  const bad = runPipeline('meaning', WC_WORLD, [['tokenise'], ['resolve', 'attend'], ['bind'], ['converge']]);
  assert.ok(bad.steps.find((x) => x.key === 'attend').skipped.includes('needs stream'));
  assert.ok(bad.meaning);
});
test('wclm: passthrough carries what its layer-mates would withdraw', () => {
  const kept = runPipeline('meaning without connectivity', WC_WORLD,
    [['tokenise'], ['resolve'], ['operators', 'passthrough'], ['bind'], ['converge']]);
  assert.equal(kept.meaning.id, 'mtc');                         /* the withdrawal is advisory */
  assert.ok(kept.notes[0].includes('contradicts the world'));   /* the clue stays written */
  const strict = runPipeline('meaning without connectivity', WC_WORLD,
    [['tokenise'], ['resolve'], ['operators'], ['bind'], ['converge']]);
  assert.notEqual(strict.meaning.id, 'mtc');
});
test('wclm: every engine declares its schema, and fractal runs a WCLM inside', () => {
  BLOCKS.forEach((b) => {
    assert.ok(b.io && b.io.reads.length && b.io.writes.length, b.key + ' declares io');
    b.io.reads.concat(b.io.writes).forEach((t) => assert.ok(TYPES[t], b.key + ' uses unknown type ' + t));
  });
  const R = runPipeline('meaning through connectivity', WC_WORLD,
    [['tokenise'], ['resolve'], ['bind'], ['converge'], ['fractal']]);
  assert.equal(R.state.fractal.text, 'What a thing is emerges from its edges.');
  assert.equal(R.state.fractal.meaning.id, 'edg');              /* the meaning of the meaning */
  const early = runPipeline('meaning', WC_WORLD,
    [['tokenise'], ['fractal'], ['resolve'], ['bind'], ['converge']]);
  assert.ok(early.steps.find((x) => x.key === 'fractal').skipped.includes('needs meanings'));
  assert.ok(early.meaning);                                     /* the rest still runs */
});
test('wclm: translate speaks the audience’s concept, and honesty survives a gap', () => {
  const WC_ANA = { ...WC_WORLD, analogies: { finance: { label: 'somebody from finance',
    maps: [{ for: 'mtc', say: 'the consolidation trail', why: 'a number IS its roll-up' }] } } };
  const pipe = [['tokenise'], ['resolve'], ['bind'], ['converge'], ['translate']];
  const R = runPipeline('meaning through connectivity', WC_ANA, pipe, { audience: 'finance' });
  assert.equal(R.state.translated.items[0].id, 'mtc');
  assert.equal(R.state.translated.items[0].say, 'the consolidation trail');
  const gap = runPipeline('connectivity', WC_ANA, pipe, { audience: 'finance' });
  assert.equal(gap.state.translated.items[0].say, null);        /* no analogy authored: said, not hidden */
  assert.equal(runPipeline('meaning', WC_ANA, pipe).state.translated, null);   /* no audience chosen */
  const early = runPipeline('meaning', WC_ANA, [['tokenise'], ['translate'], ['resolve'], ['bind'], ['converge']], { audience: 'finance' });
  assert.ok(early.steps.find((x) => x.key === 'translate').skipped.includes('needs meanings'));
});
test('wclm: every answer declares its anchoring', () => {
  const R = runPipeline('connectivity', WC_WORLD);
  assert.ok(R.meaning.anchor.includes('fact-anchored'));        /* con carries a quote */
  assert.ok(R.meaning.anchor.includes('Part 1'));
  const claim = runPipeline('meaning through connectivity', WC_WORLD);
  assert.ok(claim.meaning.anchor.includes('a stated claim'));   /* statement, no quote */
  const authored = runPipeline('meaning', WC_SENSE, null, { senses: { meaning: 'legal' } });
  assert.ok(authored.meaning.anchor.includes('a chosen sense'));
});
test('wclm: a sense switch is measured by the delta and replays deterministically', () => {
  const a = runPipeline('meaning connectivity', WC_SENSE);
  const b = runPipeline('meaning connectivity', WC_SENSE, null, { senses: { meaning: 'legal' } });
  const d = runDelta(a, b);
  assert.ok(d.layers.senses.added.includes('meaning:legal'));
  assert.ok(d.winner.changed);
  assert.deepEqual(runPipeline('meaning connectivity', WC_SENSE, null, { senses: { meaning: 'legal' } }), b);
});
test('wclm: the run delta measures impact, deterministic replay holds', () => {
  const a = runPipeline('meaning', WC_WORLD);
  const b = runPipeline('meaning connectivity', WC_WORLD);
  const d = runDelta(a, b);
  assert.deepEqual(d.layers.tokenise.added, ['connectivity']);
  assert.ok(d.layers.bind.added.includes('con'));
  assert.ok(d.winner.changed);
  assert.equal(runDelta(null, b), null);
  assert.deepEqual(runPipeline('meaning connectivity', WC_WORLD), b);
  assert.equal(runPipeline('zebra quantum', WC_WORLD).meaning, null);
});

/* ---- the operator folders (brief 36): complete, undrifted, replayable ----- */
const { readFileSync: rf, readdirSync: rd, statSync: st } = await import('node:fs');
const { runOperator, prereqOf, CANON } = await import('../../assets/wclm/opruntime.js');
const OPS_DIR = new URL('../../v2/wclm/operators/', import.meta.url).pathname;
const REAL_WORLD = JSON.parse(rf(new URL('../../v2/wclm/data/world.json', import.meta.url).pathname, 'utf8'));
test('operators: every engine has a complete folder and an undrifted schema', () => {
  const dirs = rd(OPS_DIR).filter((f) => st(OPS_DIR + f).isDirectory()).sort();
  assert.equal(dirs.length, BLOCKS.length);
  for (const key of dirs) {
    const block = BLOCKS.find((b) => b.key === key);
    assert.ok(block, key + ' is registered');
    for (const f of [key + '.js', key + '.md', 'data.json', 'schema.json', 'examples.json', 'index.html']) {
      assert.ok(st(OPS_DIR + key + '/' + f).size > 0, key + '/' + f + ' exists');
    }
    const schema = JSON.parse(rf(OPS_DIR + key + '/schema.json', 'utf8'));
    assert.deepEqual(schema.io.reads.map((x) => x.type), block.io.reads, key + ' reads drift');
    assert.deepEqual(schema.io.writes.map((x) => x.type), block.io.writes, key + ' writes drift');
    assert.deepEqual(schema.prerequisites, prereqOf(key), key + ' prerequisites drift');
    const data = JSON.parse(rf(OPS_DIR + key + '/data.json', 'utf8'));
    data.entries.forEach((e) => assert.ok(['standard', 'authored', 'derived'].includes(e.kind), key + ' provenance'));
  }
});
test('operators: every recorded example vector replays byte-identical', () => {
  let n = 0;
  for (const key of CANON.concat(['passthrough'])) {
    const ex = JSON.parse(rf(OPS_DIR + key + '/examples.json', 'utf8'));
    for (const v of ex.vectors) {
      const r = runOperator(key, v.prompt, REAL_WORLD, v.opts || {}, Object.keys(v.output));
      assert.deepEqual(r.output, v.output, key + ' vector "' + v.prompt + '"' + (v.label ? ' (' + v.label + ')' : ''));
      assert.deepEqual(r.input, v.input, key + ' input slice "' + v.prompt + '"');
      n += 1;
    }
  }
  assert.ok(n >= 30, 'a real corpus of vectors ran: ' + n);
});
test('fileview: the operator json views build from the real folder files', async () => {
  const { buildView } = await import('../../assets/universe/core/fileview.js');
  const sch = buildView('opschema', JSON.parse(rf(OPS_DIR + 'bind/schema.json', 'utf8')));
  assert.ok(sch.includes('T7 bind') && sch.includes('<code>stream</code>') && sch.includes('runs after'));
  const dat = buildView('opdata', JSON.parse(rf(OPS_DIR + 'operators/data.json', 'utf8')));
  assert.ok(dat.includes('ndoc-f-standard') && dat.includes('negates'));
  const exv = buildView('opexamples', JSON.parse(rf(OPS_DIR + 'converge/examples.json', 'utf8')));
  assert.ok(exv.includes('thinking-in-graphs') && exv.includes('fv-vec') && exv.includes('item(s)'));
  const mani = buildView('opmanifest', JSON.parse(rf(OPS_DIR + 'manifest.json', 'utf8')));
  assert.ok(mani.includes('tokenise') && mani.includes('&rarr;'));
});
test('anatomy: every operator has one, tiling its code, anchored and linked', async () => {
  const { anatomyFlowSvg, anatomyBodyHtml, anatomyPaneHtml } = await import('../../assets/wclm/code-anatomy.js');
  for (const key of CANON.concat(['passthrough'])) {
    const anat = JSON.parse(rf(OPS_DIR + key + '/anatomy.json', 'utf8'));
    const src = rf(OPS_DIR + key + '/' + key + '.js', 'utf8').split('\n');
    assert.equal(anat.segments[0].lines[0], 1, key + ' starts at line 1');
    anat.segments.forEach((s, i) => {
      assert.equal(src[s.lines[0] - 1].trim(), s.head.trim(), key + '/' + s.id + ' head anchors');
      if (i > 0) assert.equal(s.lines[0], anat.segments[i - 1].lines[1] + 1, key + '/' + s.id + ' tiles');
      assert.ok(s.does.length > 30, key + '/' + s.id + ' explains itself');
      (s.feeds || []).forEach((f) => assert.ok(anat.segments.some((x) => x.id === f), key + '/' + s.id + ' feeds ' + f));
    });
    assert.equal(anat.segments[anat.segments.length - 1].lines[1], src.length, key + ' covers the file');
  }
  const anat = JSON.parse(rf(OPS_DIR + 'bind/anatomy.json', 'utf8'));
  const code = rf(OPS_DIR + 'bind/bind.js', 'utf8');
  assert.ok(anatomyFlowSvg(anat).includes('an-fbox') && anatomyFlowSvg(anat).includes('data-seg="run-score"'));
  assert.ok(anatomyBodyHtml(code, anat).includes('the stated formula'));
  const pane = anatomyPaneHtml(anat, 'run-score');
  assert.ok(pane.includes('pulled') && pane.includes('fed by'));
});
test('fileview: rawJsHtml tints comments, strings and keywords', async () => {
  const { rawJsHtml } = await import('../../assets/universe/core/fileview.js');
  const out = rawJsHtml("/* why */ const x = 'graph'; // tail");
  assert.ok(out.includes('fv-com">/* why */'));
  assert.ok(out.includes('fv-str') && out.includes('&#039;graph&#039;') || out.includes("'graph'"));
  assert.ok(out.includes('fv-kw">const'));
  assert.ok(out.includes('fv-com">// tail'));
});

await report('wclm');
