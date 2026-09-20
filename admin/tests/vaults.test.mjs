/* The gates for the evidence estate.

   These four vault readings are the first thing this estate has published that it did
   not verify itself. The five in /v1/vaults/ were written by opening the vaults; these
   were written from the pages that publish them, because a vault is encrypted and the
   build cannot decrypt one. That is a real drop in the grade of the evidence, and the
   only thing that makes it publishable is that every fact carries the sentence it came
   from and the sentence is checked.

   So this suite checks the checkable half twice: once in the generator, and once here,
   independently, against the carried files and their recorded hashes.

   Plain node:assert. Run alone, or `node admin/tests/run.mjs vaults`. */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { test, report } from './harness.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const V = path.join(ROOT, 'v2/vaults');
const rf = (p) => readFileSync(path.join(V, p), 'utf8');
const DATA = JSON.parse(rf('data/vaults.json'));
const MAN = JSON.parse(rf('sources/MANIFEST.json'));

test('estate: every carried source is the file that was hashed', () => {
  /* A carried source is evidence. If it can be edited without the build noticing, the
     quote gate is checking prose against prose somebody could have written to match. */
  for (const [name, meta] of Object.entries(MAN.files)) {
    const f = path.join(V, 'sources', name);
    assert.ok(existsSync(f), `sources/${name} is gone`);
    const got = createHash('sha256').update(readFileSync(f)).digest('hex');
    assert.equal(got, meta.sha256, `sources/${name} changed since it was fetched`);
    assert.equal(readFileSync(f).length, meta.bytes, `sources/${name} byte count moved`);
    assert.match(meta.url, /^https:\/\//, `sources/${name} has no origin url`);
    assert.match(meta.fetched, /^\d{4}-\d{2}-\d{2}T/, `sources/${name} has no fetch time`);
  }
});

test('estate: every published fact is in its carried source, byte for byte', () => {
  let checked = 0;
  for (const v of DATA.vaults) {
    const src = rf(`sources/${v.slug}.md`);
    assert.ok(v.facts.length, `${v.slug} states nothing`);
    for (const f of v.facts) {
      assert.ok(src.includes(f.quote),
        `${v.slug}: "${f.quote.slice(0, 60)}" is not in its carried source`);
      checked++;
    }
  }
  for (const f of DATA.cross_vault_finding.facts) {
    assert.ok(rf('sources/aiuc-1-conformance.md').includes(f.quote),
      `the cross-vault finding quotes something not in the source`);
    checked++;
  }
  assert.ok(checked >= 30, `only ${checked} facts carry a quotation`);
});

test('estate: the gate goes red when a quote drifts from its source', () => {
  /* Run against a deliberately altered quotation before it was trusted. The check is
     expressed the same way the generator expresses it, so this is the same gate. */
  const src = rf('sources/threatmodcon-2025.md');
  const real = DATA.vaults.find((v) => v.slug === 'threatmodcon-2025').facts[0].quote;
  assert.ok(src.includes(real));
  const drifted = real.replace(/179/, '178');
  assert.notEqual(drifted, real, 'the fixture must actually differ');
  assert.ok(!src.includes(drifted),
    'a number changed by one must stop matching, or the gate is checking nothing');
});

test('estate: every page says it is a second-hand reading', () => {
  /* The single most important sentence on these pages, and the easiest to lose in a
     later edit that tidies the layout. */
  const pages = readdirSync(V).filter((f) => f.endsWith('.html'));
  assert.equal(pages.length, DATA.vaults.length + 1, 'one page per vault, plus the hub');
  for (const p of pages) {
    const t = rf(p);
    assert.match(t, /cannot open an encrypted vault/,
      `${p} does not say the readings are second-hand`);
    assert.match(t, /sources\/(MANIFEST\.json|[a-z0-9-]+\.md)/,
      `${p} does not point at the carried source`);
    assert.match(t, /first edition/,
      `${p} does not distinguish itself from the analyses that WERE written from vaults`);
  }
});

test('estate: each vault carries the caveats its own publisher states', () => {
  /* The corpus's own caveats travel with its ideas. That rule is in CLAUDE.md for this
     estate's corpus; it applies at least as hard to somebody else's. */
  for (const v of DATA.vaults) {
    assert.ok(v.caveats.length, `${v.slug} reproduces no caveat`);
    const page = rf(`${v.slug}.html`);
    for (const c of v.caveats) {
      const probe = c.split(/[.,]/)[0].slice(0, 40);
      assert.ok(page.includes(probe.replace(/&/g, '&amp;')) || page.includes(probe),
        `${v.slug}.html drops a caveat: "${probe}"`);
    }
  }
  const aiuc = DATA.vaults.find((v) => v.slug === 'aiuc-1-conformance');
  assert.ok(aiuc.caveats.some((c) => /removal/i.test(c)),
    'the AIUC-1 vault asks that a removal request be honoured; that undertaking travels');
});

test('estate: the diagrams are credited and self-contained', () => {
  const credits = rf('figures/CREDITS.md');
  for (const f of ['zoom.svg', 'jump.svg', 'ladder.svg']) {
    assert.ok(existsSync(path.join(V, 'figures', f)), `${f} is missing`);
    assert.ok(credits.includes(f), `${f} is not credited`);
    const svg = rf(`figures/${f}`);
    assert.match(svg, /<style>/, `${f} does not carry its own styles, so it is not standalone`);
    assert.match(svg, /xmlns="http:\/\/www\.w3\.org\/2000\/svg"/, `${f} has no namespace`);
  }
  assert.match(credits, /sgit\.ai\/demos\/fractal-graphs/, 'the credits name no origin');
  /* The ladder is inlined rather than <img>-embedded because its links are live. If it
     stops carrying links, the reason for inlining it has gone and so should the inlining. */
  assert.match(rf('figures/ladder.svg'), /<a\s/, 'the ladder has lost its links');
  assert.ok(rf('index.html').includes('<svg'), 'the ladder is not inlined on the hub');
});

test('estate: the inlined ladder points at real addresses', () => {
  /* Its links were written relative to the page it was published on. Inlined here they
     would resolve against this site and point at nothing; validate.js caught that on the
     first build. They are resolved against their origin at render time. */
  const hub = rf('index.html');
  const svg = hub.slice(hub.indexOf('<div class="vfig"><svg'));
  const hrefs = [...svg.matchAll(/href="([^"]+)"/g)].map((m) => m[1]).slice(0, 12);
  assert.ok(hrefs.length >= 11, `the ladder has ${hrefs.length} links, expected 11+`);
  for (const h of hrefs) {
    assert.match(h, /^https:\/\//, `unresolved ladder link: ${h}`);
    assert.ok(!h.includes('../'), `ladder link still relative: ${h}`);
  }
  /* Most rungs are vault pages on sgit.ai; one is a sibling site of its own, which was
     already absolute in the source and which the rewrite correctly left alone. This
     test asserted they were ALL on sgit.ai and went red on that one. The data was
     right and the assertion was wrong, which is the failure mode of a gate written
     from an assumption rather than from the thing it guards. */
  const onSgit = hrefs.filter((h) => h.startsWith('https://sgit.ai/'));
  assert.ok(onSgit.length >= hrefs.length - 2,
    `${hrefs.length - onSgit.length} rungs point somewhere other than sgit.ai`);
});

await report('vaults');
