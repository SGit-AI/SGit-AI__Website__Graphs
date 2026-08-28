/* The gates for the unwatched half.

   The audit's finding 6 was that the test surface stopped at the v2 core: twenty Python
   generators, the book builders and validate.js itself all ran ungated, which is how a
   dangling anatomy edge and two writers fighting over book.json both survived. These are
   the cheap gates — shape, agreement and one deliberate breakage — not a rerun of the
   whole chain, which the release already does.

   Plain node:assert, no framework. Run alone, or with `node admin/tests/run.mjs`. */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync, mkdtempSync, cpSync, writeFileSync, rmSync }
  from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { test, report } from './harness.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const BUILD = path.join(ROOT, 'admin/build');
const rf = (p) => readFileSync(p, 'utf8');
const gens = readdirSync(BUILD).filter((f) => f.startsWith('gen_') && f.endsWith('.py')).sort();

/* ---- the generators: shape, not behaviour --------------------------------- */
test('generators: every one compiles', () => {
  const r = spawnSync('python3', ['-m', 'py_compile',
    ...gens.map((g) => path.join(BUILD, g))], { encoding: 'utf8' });
  assert.equal(r.status, 0, (r.stderr || '').slice(0, 400));
  assert.ok(gens.length >= 15, `found ${gens.length} generators`);
});

test('generators: every one opens with a docstring that says what it builds', () => {
  for (const g of gens) {
    const src = rf(path.join(BUILD, g));
    const body = src.replace(/^#![^\n]*\n/, '');
    assert.ok(/^"""/.test(body), `${g} has no module docstring`);
    const doc = body.slice(3, body.indexOf('"""', 3));
    assert.ok(doc.trim().length > 40, `${g}'s docstring says too little`);
  }
});

test('generators: the ones other generators import are safe to import', () => {
  /* The chain runs each generator as a script, and a few also import each other
     (gen_universe pulls esc and fmt out of gen_packs). A generator that does its work at
     module top level is fine to RUN and a trap to IMPORT: the importer silently rebuilds
     someone else's output. So the main guard is required exactly where it matters. */
  const imported = new Set();
  for (const g of gens) {
    for (const m of rf(path.join(BUILD, g)).matchAll(/^from (gen_\w+) import/gm)) {
      imported.add(m[1] + '.py');
    }
  }
  assert.ok(imported.size, 'no generator imports another — has the chain been restructured?');
  for (const g of imported) {
    assert.ok(rf(path.join(BUILD, g)).includes('if __name__ == "__main__":'),
      `${g} is imported by another generator but runs at module top level, so importing `
      + 'it rebuilds its output as a side effect');
  }
});

/* ---- bookkit: the duplication stays gone ---------------------------------- */
test('bookkit: the PDF page counter exists exactly once', () => {
  /* It existed in four copies — gen_book, gen_packs and both book builders — each with
     the same comment about learning the trick the hard way. This is the gate that stops
     a fifth being written. */
  const r = spawnSync('grep', ['-rl', '--include=*.py', '--include=*.js',
    'zlib.decompress', ROOT], { encoding: 'utf8' });
  const files = (r.stdout || '').split('\n').filter(Boolean)
    .filter((f) => !f.includes('__pycache__') && !f.includes('node_modules'));
  assert.deepEqual(files.map((f) => path.relative(ROOT, f)).sort(),
    ['admin/build/bookkit/pdf.py'],
    'the page-count trick has been copied again — import it from bookkit');
});

test('bookkit: each book build imports the kit rather than rolling its own', () => {
  for (const slug of ['fsg', 'making-a-book']) {
    const src = rf(path.join(ROOT, 'v2/books', slug, 'build.py'));
    assert.ok(src.includes('from bookkit import'), `${slug}/build.py does not use bookkit`);
    assert.ok(!/^def (page_count|pdf_page_count)\b/m.test(src),
      `${slug}/build.py still carries its own page counter`);
  }
});

/* ---- the books: what book.json claims is what is on disk ------------------ */
const BOOKS = ['fsg', 'making-a-book', 'fsg-universe'];

test('books: book.json has one writer, and the builder writes build.json', () => {
  for (const slug of ['fsg', 'making-a-book']) {
    const src = rf(path.join(ROOT, 'v2/books', slug, 'build.py'));
    assert.ok(!/["'](?:.*\/)?book\.json["']\s*\)?\s*\.write_text/.test(src)
      && !src.includes('"book.json").write_text'),
      `${slug}/build.py writes book.json — gen_bookmeta.py owns that file`);
  }
});

test('books: every chapter hash in book.json matches the file on disk', () => {
  for (const slug of BOOKS) {
    const dir = path.join(ROOT, 'v2/books', slug);
    const meta = JSON.parse(rf(path.join(dir, 'book.json')));
    const hashes = meta.content_hashes || {};
    const files = readdirSync(path.join(dir, 'content')).filter((f) => f.endsWith('.md')).sort();
    assert.deepEqual(Object.keys(hashes).sort(), files,
      `${slug}: book.json lists different chapters than content/ holds`);
    for (const f of files) {
      const got = createHash('sha256')
        .update(readFileSync(path.join(dir, 'content', f))).digest('hex');
      assert.equal(hashes[f], got,
        `${slug}/${f} changed without gen_bookmeta.py being rerun`);
    }
  }
});

test('books: a book version is its own, never the site\'s', () => {
  const site = rf(path.join(ROOT, 'admin/build/version.txt')).trim();
  for (const slug of BOOKS) {
    const meta = JSON.parse(rf(path.join(ROOT, 'v2/books', slug, 'book.json')));
    assert.match(meta.version, /^v\d+\.\d+\.\d+$/, `${slug}: version is not vN.N.N`);
    assert.notEqual(meta.version, site,
      `${slug}: carrying the SITE version — the confusion gen_bookmeta.py exists to end`);
    assert.equal(meta.built_at_site_version, site,
      `${slug}: built_at_site_version is stale — rerun gen_bookmeta.py`);
    assert.ok(meta.version < 'v1.0.0', `${slug}: v1.0.0 is reserved for the final release`);
  }
});

test('books: the PDF on disk has the pages build.json claims', () => {
  for (const slug of ['fsg', 'making-a-book']) {
    const dir = path.join(ROOT, 'v2/books', slug);
    const bp = path.join(dir, 'build.json');
    if (!existsSync(bp)) continue;          /* only fsg's builder writes one today */
    const build = JSON.parse(rf(bp));
    const pdf = path.join(dir, build.pdf.file);
    assert.ok(existsSync(pdf), `${slug}: ${build.pdf.file} is missing`);
    const r = spawnSync('python3', ['-c',
      `import sys; sys.path.insert(0, ${JSON.stringify(BUILD)});` +
      `from bookkit import page_count; print(page_count(${JSON.stringify(pdf)}))`],
      { encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
    assert.equal(Number(r.stdout.trim()), build.pdf.pages,
      `${slug}: the PDF is ${r.stdout.trim()} pages, build.json says ${build.pdf.pages}`);
  }
});

/* ---- validate.js: the gate gets a gate ------------------------------------ */
test('validate: a broken tree fails, and the error names what broke', () => {
  /* 530 lines of gate, itself ungated until now. The cheapest honest test is to copy the
     tree, break one thing on purpose, and insist the right error comes back — otherwise
     a gate that silently stopped checking would look exactly like a clean release. */
  const tmp = mkdtempSync(path.join(tmpdir(), 'validate-selftest-'));
  try {
    /* Everything but .git — a hand-written list of what to copy goes stale the moment a
       top-level folder is added, and the first version of this test failed for exactly
       that reason rather than for anything real. */
    cpSync(ROOT, tmp, { recursive: true, filter: (s) => !s.split(path.sep).includes('.git') });
    const clean = spawnSync('node', [path.join(BUILD, 'validate.js'), tmp], { encoding: 'utf8' });
    assert.equal(clean.status, 0,
      'the copied tree does not validate, so the self-test proves nothing:\n'
      + (clean.stdout || '').split('\n').filter((l) => l.includes('✗')).slice(0, 3).join('\n'));

    /* Break the version agreement: the gate's whole job is to notice. */
    writeFileSync(path.join(tmp, 'admin/build/version.txt'), 'v9.9.9\n');
    const broken = spawnSync('node', [path.join(BUILD, 'validate.js'), tmp], { encoding: 'utf8' });
    assert.notEqual(broken.status, 0, 'validate.js passed a tree with a wrong version');
    assert.match((broken.stdout || '') + (broken.stderr || ''), /v9\.9\.9/,
      'validate.js failed, but its message never names the version that broke');
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

/* ---- the size rule, made enforceable --------------------------------------- */
test('modules: every one over the size guideline states why in its header', () => {
  /* CLAUDE.md: "parts <= 200 lines, sections <= 250. Over that, split — or record the
     deviation in the module header and in the release note. Unstated debt is the thing to
     avoid, not debt." That was a convention anyone could forget. This makes it a gate:
     go long if you must, but say so where the next reader will see it. */
  const LIMIT = 250;
  const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === 'vendor' ? [] : walk(full);
    return e.name.endsWith('.js') ? [full] : [];
  });
  const unstated = [];
  for (const f of walk(path.join(ROOT, 'assets'))) {
    const src = rf(f);
    const lines = src.split('\n').length;
    if (lines <= LIMIT) continue;
    const head = src.slice(0, src.indexOf('*/') + 2);
    const states = /NOT SPLIT|size guideline|split is planned|allowed to be a list|recorded as debt/i.test(head);
    if (!states) unstated.push(`${path.relative(ROOT, f)} (${lines} lines)`);
  }
  assert.deepEqual(unstated, [],
    'over the guideline with nothing said about it in the @module header — '
    + 'split it, or record the deviation where the next reader will see it');
});

await report('build');
