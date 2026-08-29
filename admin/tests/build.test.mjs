/* The gates for the unwatched half.

   The audit's finding 6 was that the test surface stopped at the v2 core: twenty Python
   generators, the book builders and validate.js itself all ran ungated, which is how a
   dangling anatomy edge and two writers fighting over book.json both survived. These are
   the cheap gates — shape, agreement and one deliberate breakage — not a rerun of the
   whole chain, which the release already does.

   Plain node:assert, no framework. Run alone, or with `node admin/tests/run.mjs`. */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync, statSync, mkdtempSync, cpSync, writeFileSync, rmSync }
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

test('books: a book is called the same thing everywhere it is named', () => {
  /* Asked for by QA before the making-of book is retitled (brief 40). The title is not
     derived from one place: gen_bookmeta.REGISTER is the authority, but each book's
     build.py carries its own TITLE constant and the front matter carries it as an H1.
     Nothing checked they agree, which makes a rename the change most likely to leave one
     of them behind. */
  for (const slug of BOOKS) {
    const dir = path.join(ROOT, 'v2/books', slug);
    const registered = JSON.parse(rf(path.join(dir, 'book.json'))).title;

    const buildPy = path.join(dir, 'build.py');
    if (existsSync(buildPy)) {
      const m = rf(buildPy).match(/^TITLE = "([^"]+)"/m);
      assert.ok(m, `${slug}/build.py declares no TITLE`);
      assert.equal(m[1], registered,
        `${slug}: build.py says "${m[1]}", the register says "${registered}"`);
    }

    /* A volume may head its front matter with the series name and put its own name
       below; where that is so, the register declares it. */
    const expected = JSON.parse(rf(path.join(dir, 'book.json'))).front_matter_title
                     || registered;
    const front = readdirSync(path.join(dir, 'content')).sort()[0];
    const h1 = rf(path.join(dir, 'content', front)).match(/^#\s+(.+)$/m);
    assert.ok(h1, `${slug}/content/${front} has no H1`);
    assert.equal(h1[1].trim(), expected,
      `${slug}: the front matter is headed "${h1[1].trim()}", the register expects `
      + `"${expected}" — a reader opening the book sees a different name from the shelf`);
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

test('books: every book version is paired with the site release that carried it', () => {
  /* A change to a book moves TWO versions, and the pair is what identifies the change:
     "v0.1.15 of the book, which shipped in v0.6.7 of the repo". Either number alone leaves
     a reader unable to place it. The changelog holds the pairing; this checks it is whole
     and ordered, which the generator cannot judge on its own. */
  const releases = new Set();
  for (const f of readdirSync(path.join(ROOT, 'admin'))) {
    if (/^versions.*\.html$/.test(f)) {
      for (const m of rf(path.join(ROOT, 'admin', f)).matchAll(/class="vnum">(v[\d.]+)</g)) {
        releases.add(m[1]);
      }
    }
  }
  const key = (v) => v.slice(1).split('.').map(Number);
  for (const slug of BOOKS) {
    const meta = JSON.parse(rf(path.join(ROOT, 'v2/books', slug, 'book.json')));
    const log = meta.changelog;
    assert.ok(Array.isArray(log) && log.length, `${slug}: no changelog`);
    assert.equal(log[log.length - 1].version, meta.version,
      `${slug}: at ${meta.version} but the changelog ends at ${log[log.length - 1].version}`);
    let prev = null;
    for (const e of log) {
      assert.ok(releases.has(e.site),
        `${slug}: ${e.version} claims site release ${e.site}, which was never narrated`);
      assert.ok(e.note && e.note.length > 30,
        `${slug}: ${e.version} has no note saying what moved it`);
      if (prev) {
        assert.ok(key(e.version) > key(prev.version),
          `${slug}: changelog is not in ascending order at ${e.version}`);
        assert.ok(key(e.site) >= key(prev.site),
          `${slug}: ${e.version} claims an earlier site release than ${prev.version} did`);
      }
      prev = e;
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

/* ---- the release commit subject -------------------------------------------- */
test('releases: every release commit subject is in the form CI can parse', () => {
  /* CI reads the version out of the commit subject and refuses a release whose
     version.txt disagrees with it. The parser wants "site vX.Y.Z:" with the colon
     immediately after the version.

     At v0.6.9 a subject was written "site v0.6.9 / making-a-book v0.2.0: ..." to show
     both clocks moving. The release was sound; the format was not. CI could not find the
     version, reported that version.txt disagreed with the history, and failed — and
     because the backfill used the same strict pattern, that release became permanently
     untaggable, which blocks the version diff for every release after it.

     The backfill is tolerant now, so history can heal. This keeps the convention honest
     going forward: the book's version belongs in the BODY, never in the subject. */
  /* History cannot be rewritten, so the one subject that broke the rule is named here
     with its reason rather than silently tolerated by a loosened pattern. */
  const KNOWN = [
    'site v0.6.9 / making-a-book v0.2.0: the book is renamed under its own change control',
  ];
  const out = spawnSync('git', ['log', '-40', '--format=%s'], { cwd: ROOT, encoding: 'utf8' });
  assert.equal(out.status, 0, 'could not read the commit log');
  const bad = out.stdout.split('\n')
    .filter((s) => s.startsWith('site v'))
    .filter((s) => !KNOWN.includes(s))
    .filter((s) => !/^site v\d+\.\d+\.\d+: \S/.test(s));
  assert.deepEqual(bad, [],
    'release subject(s) CI cannot parse — the form is "site vX.Y.Z: what changed", and a '
    + "book's version goes in the body");
});

/* ---- the book graph ------------------------------------------------------- */
test('bookgraph: the book decomposes, and every chapter rebuilds byte-identical', () => {
  /* Brief 43, activity A2. The claim that makes brief 42's restructure possible is that a
     chapter can be taken apart and put back together exactly. gen_bookgraph asserts it per
     chapter at build time; this checks the artefact it left behind, so a stale or partial
     graph cannot pass as a fresh one. */
  const idx = path.join(ROOT, 'v2/books/making-a-book/graph/index.json');
  assert.ok(existsSync(idx), 'the book graph has not been built');
  const g = JSON.parse(rf(idx));
  const meta = JSON.parse(rf(path.join(ROOT, 'v2/books/making-a-book/book.json')));

  assert.equal(g.book_version, meta.version,
    `the graph was built at ${g.book_version} but the book is at ${meta.version}`);
  assert.deepEqual(g.ladder, ['book', 'chapter', 'section', 'block', 'sentence', 'word'],
    'the ladder is not book to word');
  assert.equal(g.chapters.length, Object.keys(meta.content_hashes).length,
    'the graph and book.json disagree about how many chapters the book has');

  for (const ch of g.chapters) {
    const dir = path.join(ROOT, 'v2/books/making-a-book/graph', ch.stem);
    assert.ok(existsSync(path.join(dir, 'index.json')), `${ch.stem}: no chapter index`);
    /* fmt.json is the half that makes the rebuild possible; without it the chapter is
       decomposed but not reassemblable, which is the useless half of the pair. */
    assert.ok(existsSync(path.join(dir, 'fmt.json')), `${ch.stem}: no formatting graph`);
    assert.ok(existsSync(path.join(dir, 'ids.json')), `${ch.stem}: no identity ledger`);
    assert.ok(ch.blocks > 0, `${ch.stem}: decomposed to zero blocks`);
    assert.ok(ch.uids >= ch.blocks, `${ch.stem}: fewer uids than blocks — identity is short`);
  }

  const summed = g.chapters.reduce((n, c) => n + c.blocks, 0);
  assert.equal(summed, g.totals.blocks, 'the book total does not equal its chapters');
});

/* ---- the version streams stay separate ------------------------------------ */
test('versions: every stamped artefact says which stream its number belongs to', () => {
  /* Three streams run here: the site's, which moves on every push, and one per book,
     which moves only when that book's content moves. Before this gate, book-scoped work
     was stamped with the SITE version, so a pack about a book at v0.1.0 was called
     v0.6.3 — a version that book has never had. A number with no stream is a guess.

     Site work:  vX.Y.Z__<slug>
     Book work:  <book-slug>__vX.Y.Z__<slug>, where the version is a real one of that book */
  const SITE = /^v\d+\.\d+\.\d+__/;
  const BOOK = /^([a-z0-9-]+)__v(\d+\.\d+\.\d+)__/;
  const booksDir = path.join(ROOT, 'v2/books');
  const known = new Set(readdirSync(booksDir, { withFileTypes: true })
    .filter((e) => e.isDirectory()).map((e) => e.name));

  const checkStamp = (name, where) => {
    const b = name.match(BOOK);
    if (b) {
      assert.ok(known.has(b[1]),
        `${where}/${name} is stamped for book "${b[1]}", which is not a book here`);
      return;
    }
    assert.match(name, SITE,
      `${where}/${name} carries no version stream — use vX.Y.Z__ for site work `
      + 'or <book-slug>__vX.Y.Z__ for work on a book');
  };

  for (const d of readdirSync(path.join(ROOT, 'v2/dev-packs'), { withFileTypes: true })) {
    if (!d.isDirectory() || !/^v\d|__v\d/.test(d.name)) continue;   /* unstamped packs opt out */
    checkStamp(d.name, 'v2/dev-packs');
  }
  for (const role of readdirSync(path.join(ROOT, 'v2/team'), { withFileTypes: true })) {
    if (!role.isDirectory()) continue;
    for (const kind of ['briefs', 'debriefs']) {
      for (const f of readdirSync(path.join(ROOT, 'v2/team', role.name, kind))) {
        if (f === 'README.md' || !f.endsWith('.md')) continue;
        checkStamp(f, `v2/team/${role.name}/${kind}`);
      }
    }
  }
});

test('versions: a book-stamped artefact names a version that book actually has', () => {
  /* The stamp records the version REVIEWED, so it must be a version that existed. An
     artefact stamped with a version the book has never reached is the confusion this
     convention exists to end. */
  const BOOK = /^([a-z0-9-]+)__v(\d+\.\d+\.\d+)__/;
  const seen = [];
  const walk = (dir, label) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const m = e.name.match(BOOK);
      if (m) seen.push({ book: m[1], ver: 'v' + m[2], where: `${label}/${e.name}` });
    }
  };
  walk(path.join(ROOT, 'v2/dev-packs'), 'v2/dev-packs');
  for (const role of readdirSync(path.join(ROOT, 'v2/team'), { withFileTypes: true })) {
    if (!role.isDirectory()) continue;
    for (const kind of ['briefs', 'debriefs']) {
      walk(path.join(ROOT, 'v2/team', role.name, kind), `v2/team/${role.name}/${kind}`);
    }
  }
  assert.ok(seen.length, 'no book-stamped artefacts found — has the convention been dropped?');
  for (const s of seen) {
    const meta = JSON.parse(rf(path.join(ROOT, 'v2/books', s.book, 'book.json')));
    const history = [meta.version, ...(meta.former_versions || [])];
    assert.ok(history.includes(s.ver),
      `${s.where} is stamped ${s.ver}, but ${s.book} is at ${meta.version} and has no `
      + `record of ${s.ver} — either the stamp is wrong, or the book moved and the `
      + 'artefact was not carried forward');
  }
});

/* ---- the team: a role is defined or it is not there ----------------------- */
test('team: every role folder is complete, and every role states its limits', () => {
  /* A half-defined role is worse than no role: an agent handed it reads it as
     authoritative and it is not. gen_team.py fails on a missing part; this checks the
     parts have CONTENT, which a generator cannot judge.

     The required shape is inherited from the-cyber-boardroom/SGraph-AI__App__Send, whose
     team folder brief 40 names as the reference. Two of its fields do most of the work and
     are required here: a Central Claim the role can be held to, and a Not Responsible For
     that stops it drifting into another role's territory. */
  const TEAM = path.join(ROOT, 'v2/team');
  const roles = readdirSync(TEAM, { withFileTypes: true })
    .filter((e) => e.isDirectory()).map((e) => e.name).sort();
  assert.ok(roles.length >= 7, `only ${roles.length} roles defined`);
  for (const r of roles) {
    const role = rf(path.join(TEAM, r, 'role.md'));
    for (const field of ['**Core Mission**', '**Central Claim**', '**Not Responsible For**']) {
      assert.ok(role.includes(field), `${r}/role.md has no ${field} in its Identity table`);
    }
    for (const heading of ['## Identity', '## Foundation', '## Primary Responsibilities',
                           '## Core Workflows']) {
      assert.ok(role.includes(heading), `${r}/role.md has no "${heading}" section`);
    }
    /* A Not Responsible For that says nothing is the same as not having one. */
    const nrf = role.match(/\*\*Not Responsible For\*\* \| ([^|]+)\|/);
    assert.ok(nrf && nrf[1].trim().length > 40,
      `${r}/role.md's Not Responsible For is too vague to keep it out of another role's work`);
    const acts = readdirSync(path.join(TEAM, r, 'actions')).filter((f) => f.endsWith('.md'));
    assert.ok(acts.length >= 1, `${r} has no actions, so it cannot be asked for anything`);
    for (const a of acts) {
      assert.match(rf(path.join(TEAM, r, 'actions', a)), /\*\*Done test\*\*/,
        `${r}/actions/${a} has no done test, so nobody can tell when it is finished`);
    }
    for (const w of ['briefs', 'debriefs']) {
      assert.ok(existsSync(path.join(TEAM, r, w, 'README.md')),
        `${r}/${w}/ does not say what belongs in it`);
    }
  }
});

test('team: no role reads like it would in any other repository', () => {
  /* Brief 40's central requirement: "It\u2019s not just a writer. It\u2019s a writer for this
     type of book." A role that never names something only this estate has is generic, and
     generic was the thing the brief refused. */
  const TEAM = path.join(ROOT, 'v2/team');
  /* things that exist nowhere else */
  const OURS = ['v2/books', 'gen_', 'validate.js', 'admin/tests', 'book.json', 'v1/',
                'mdreader', 'WCLM', 'bookkit', 'graphs.sgit.ai', 'admin/versions',
                'anchor', 'brief 40', 'Leanpub', 'CLAUDE.md', 'chapter'];
  for (const r of readdirSync(TEAM, { withFileTypes: true }).filter((e) => e.isDirectory())) {
    const role = rf(path.join(TEAM, r.name, 'role.md'));
    const hits = OURS.filter((k) => role.includes(k));
    assert.ok(hits.length >= 3,
      `${r.name}/role.md names only ${hits.length} thing(s) specific to this estate `
      + `(${hits.join(', ') || 'none'}) — it would read the same in any repository`);
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

test('bookfiles: every book has an explorer, and its manifest matches the disk', () => {
  /* The manifest is generated so a new artefact appears without anyone listing
     it. This checks that promise: what the page claims is what is on disk. */
  for (const slug of readdirSync(path.join(ROOT, 'v2/books'))) {
    const book = path.join(ROOT, 'v2/books', slug);
    if (!existsSync(path.join(book, 'book.json'))) continue;
    const page = path.join(book, 'files.html');
    assert.ok(existsSync(page), `${slug} has no files.html — run gen_bookfiles.py`);
    const html = readFileSync(page, 'utf8');
    const m = html.match(/window\.FILEX = (\{.*\});/);
    assert.ok(m, `${slug}: no manifest on the explorer page`);
    const fx = JSON.parse(m[1]);
    assert.equal(fx.slug, slug);
    for (const folder of fx.folders) {
      const dir = folder.base ? path.join(book, folder.base) : book;
      assert.ok(existsSync(dir), `${slug}: manifest names a missing folder ${folder.base}`);
      for (const f of folder.files) {
        const onDisk = path.join(dir, f.n);
        assert.ok(existsSync(onDisk), `${slug}: manifest lists ${folder.base}/${f.n}, not on disk`);
        /* Sizes are pinned for sources and data. NOT for .html: chrome.py stamps
           nav and footer into every page AFTER the manifest is written, so a
           rendered page's size is expected to differ by the size of the chrome. */
        if (!f.n.endsWith('.html')) {
          assert.equal(statSync(onDisk).size, f.b,
            `${slug}: ${folder.base}/${f.n} changed size — rerun gen_bookfiles.py`);
        }
      }
    }
    /* and nothing on disk is missing from it: the content folder is the test
       that matters, because a chapter absent from the tree is invisible */
    const listed = new Set((fx.folders.find((f) => f.base === 'content') || { files: [] })
      .files.map((f) => f.n));
    for (const f of readdirSync(path.join(book, 'content'))) {
      assert.ok(listed.has(f), `${slug}: ${f} is in content/ and not in the explorer`);
    }
  }
});

test('chrome: nothing hard-codes the sticky nav height', () => {
  /* The nav row WRAPS: 104px on a wide desktop, 92px on a phone, 55px on an
     iPad. A hard-coded offset was wrong at two of those three widths and hid up
     to 87px of content under the banner. nav.js measures it and publishes
     --navh; every scroll offset must read that, never a number. */
  const css = readFileSync(path.join(ROOT, 'assets/site.css'), 'utf8');
  assert.match(css, /html\{scroll-padding-top:var\(--navh/,
    'the scroll container must inset by the measured nav height');
  const offsets = css.match(/scroll-(?:margin|padding)-top:[^;}]+/g) || [];
  assert.ok(offsets.length >= 3, 'the offsets are still declared');
  for (const o of offsets) {
    assert.ok(o.includes('var(--navh'),
      `hard-coded nav offset "${o}" — use var(--navh, …), which nav.js measures`);
  }
  const nav = readFileSync(path.join(ROOT, 'assets/nav.js'), 'utf8');
  assert.ok(nav.includes("setProperty('--navh'"), 'nav.js must publish --navh');
  assert.ok(nav.includes('ResizeObserver'), 'and refresh it when the row wraps');
});

test('repo: every generator the chain runs is actually in the repository', () => {
  /* A generated site can be green, deployed and completely unrebuildable at the
     same time, and nothing in a normal build will tell you: a bare `build/` in a
     Python .gitignore matches at every depth. It hit admin/build/ here once and
     took a sibling site's entire generator with it. The rule is anchored to the
     root now; this checks the outcome rather than the rule. */
  const chain = readFileSync(path.join(ROOT, 'README.md'), 'utf8')
    .split('\n')
    .map((l) => (l.match(/^python3 (\S+\.py)/) || l.match(/^node (\S+\.(?:js|mjs))/) || [])[1])
    .filter(Boolean);
  assert.ok(chain.length >= 15, `the README chain lists ${chain.length} steps, expected 15+`);
  /* The hazard is a file git REFUSES to track, not one that is merely new and
     not yet staged. check-ignore answers exactly that question; ls-files would
     also fail an uncommitted new generator, which is normal mid-release and is
     not the defect this guards. */
  const ignored = (rel) => spawnSync('git', ['-C', ROOT, 'check-ignore', '-q', rel]).status === 0;
  const guard = [...chain];
  for (const slug of readdirSync(path.join(ROOT, 'v2/books'))) {
    for (const g of ['build.py', 'gen_pages.py']) {
      const rel = `v2/books/${slug}/${g}`;
      if (existsSync(path.join(ROOT, rel))) guard.push(rel);
    }
  }
  for (const f of guard) {
    assert.ok(existsSync(path.join(ROOT, f)), `the chain runs ${f}, which is not on disk`);
    assert.ok(!ignored(f),
      `${f} is IGNORED BY GIT — the site would deploy and be unrebuildable`);
  }
});

await report('build');
