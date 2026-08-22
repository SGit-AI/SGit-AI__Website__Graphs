#!/usr/bin/env node
// graphs.sgit.ai pre-release gate. Run from anywhere: node admin/build/validate.js
// Checks, in order:
//   1. version agreement — admin/build/version.txt vs every page's version badge,
//      the versions table, llms.txt, llms-full.txt and index.md
//   2. internal links — every relative href/src in every .html file resolves to a
//      file in the tree (fragments stripped; external and mailto links skipped)
//   3. canonical host — every <link rel="canonical"> and og:url points at the host
//      in CNAME, and every page declares one
//   4. the agent surface — every section hub is named in llms.txt, and the sitemap
//      and the tree agree in both directions. This site exists because agents
//      under-weight this material; llms.txt is the whole surface for them (see
//      briefs/06__house-style-and-conventions.md §3), so a page that is not in it
//      is, for that reader, a page that does not exist. CI keeps that honest.
//   5. edge-grammar tripwire — no page may use `relates-to` as a live edge name.
//      The site's own rule bans it. It is allowed only where the page is quoting
//      the ban, marked with the data-banned-verb attribute.
//   6. key-leak tripwire — nothing in the tree may look like an sgit vault key
//      (a >=20-char passphrase joined by a colon to a uuid-shaped id).
//   7. div balance — every page opens and closes the same number of <div>s. Added
//      after four pages shipped a <div class="note"> closed with </p>, which browsers
//      accept silently and which ran the note's left border down the whole page.
//   8. the pages are projections of markdown — content/*.md is the source of
//      truth for every chapter page. content/manifest.json records the hash of
//      each markdown file and of the page main it rendered; a markdown file
//      edited without gen_pages.py rerunning, or a page main hand-edited
//      behind the markdown's back, fails here. Together with check 9 this
//      closes the chain: markdown -> pages -> book, no drift at either link.
//   9. the book is a projection — book/manifest.json must carry this release's
//      version, every chapter's source page must hash to what the manifest recorded
//      when the book was generated, and the PDF must exist. The book is generated
//      from the site's pages (gen_book.py); a source page edited without the book
//      regenerating is exactly the drift the site argues against, so it fails here.
// Any failure exits 1: no tag, no publish.
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const errors = [];

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (name === '.git' || name === '.github' || name === 'node_modules' || name === '.sg_vault') continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const files = walk(ROOT);
const htmlFiles = files.filter(f => f.endsWith('.html'));
const rel = f => path.relative(ROOT, f).split(path.sep).join('/');

// --- 1. version agreement -------------------------------------------------
const VERSION = fs.readFileSync(path.join(ROOT, 'admin/build/version.txt'), 'utf8').trim();
if (!/^v\d+\.\d+\.\d+$/.test(VERSION)) {
  errors.push(`version.txt does not carry a vX.Y.Z version: "${VERSION}"`);
}
for (const f of htmlFiles) {
  const t = fs.readFileSync(f, 'utf8');
  const badges = [...t.matchAll(/class="ver"[^>]*>(v\d+\.\d+\.\d+)</g)].map(m => m[1]);
  for (const b of badges) if (b !== VERSION) {
    errors.push(`${rel(f)}: version badge ${b} != ${VERSION}`);
  }
}
for (const extra of ['llms.txt', 'llms-full.txt', 'index.md']) {
  const t = fs.readFileSync(path.join(ROOT, extra), 'utf8');
  if (!t.includes(VERSION)) errors.push(`${extra} does not mention ${VERSION}`);
}
const versTable = fs.readFileSync(path.join(ROOT, 'admin/versions.html'), 'utf8');
if (!versTable.includes(`class="vnum">${VERSION}<`)) {
  errors.push(`admin/versions.html has no row for ${VERSION}`);
}
// each release appears exactly once — a blanket version-bump sed that touches
// the history table produces duplicates, which shipped once on the NHI site
const rows = [...versTable.matchAll(/class="vnum">(v\d+\.\d+\.\d+)</g)].map(m => m[1]);
for (const v of rows) if (rows.filter(x => x === v).length > 1) {
  errors.push(`admin/versions.html lists ${v} more than once`);
  break;
}

// --- 2. internal links ----------------------------------------------------
for (const f of htmlFiles) {
  const t = fs.readFileSync(f, 'utf8');
  const dir = path.dirname(f);
  for (const m of t.matchAll(/(?:href|src|data-src)="([^"#]+)(?:#[^"]*)?"/g)) {
    const target = m[1];
    if (/^(https?:|mailto:|data:|\/\/)/.test(target) || target === '') continue;
    const resolved = path.resolve(dir, target);
    if (!fs.existsSync(resolved)) {
      errors.push(`${rel(f)}: broken link -> ${target}`);
    }
  }
}

// --- 3. canonical host ----------------------------------------------------
const HOST = fs.readFileSync(path.join(ROOT, 'CNAME'), 'utf8').trim();
if (!/^[a-z0-9.-]+$/.test(HOST)) errors.push(`CNAME does not carry a hostname: "${HOST}"`);
for (const f of htmlFiles) {
  const t = fs.readFileSync(f, 'utf8');
  const claimed = [
    ...[...t.matchAll(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/g)].map(m => m[1]),
    ...[...t.matchAll(/<meta[^>]+property="og:url"[^>]+content="([^"]+)"/g)].map(m => m[1]),
  ];
  for (const url of claimed) if (!url.startsWith(`https://${HOST}/`)) {
    errors.push(`${rel(f)}: canonical/og:url is not on ${HOST} -> ${url}`);
  }
  if (!/rel="canonical"/.test(t)) errors.push(`${rel(f)}: no canonical link`);
}

// --- 4. the agent surface -------------------------------------------------
const llms = fs.readFileSync(path.join(ROOT, 'llms.txt'), 'utf8');
const hubs = htmlFiles.map(rel).filter(p => p.endsWith('/index.html') && p.split('/').length === 2);
for (const h of hubs) if (!llms.includes(h)) {
  errors.push(`llms.txt does not name the section hub /${h} — for an agent that page does not exist`);
}
const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
const listed = [...sitemap.matchAll(new RegExp(`<loc>https://${HOST}/([^<]+)</loc>`, 'g'))].map(m => m[1]);
for (const p of listed) if (!fs.existsSync(path.join(ROOT, p))) {
  errors.push(`sitemap.xml lists a page that does not exist: /${p}`);
}
for (const f of htmlFiles) if (!listed.includes(rel(f))) {
  errors.push(`sitemap.xml is missing ${rel(f)}`);
}

// --- 5. edge-grammar tripwire ---------------------------------------------
// The site bans `relates-to`. Pages may quote the ban; they may not use the verb.
for (const f of htmlFiles) {
  const t = fs.readFileSync(f, 'utf8');
  for (const m of t.matchAll(/<code([^>]*)>([^<]*relates[-_]to[^<]*)<\/code>/g)) {
    if (!/data-banned-verb/.test(m[1])) {
      errors.push(`${rel(f)}: uses relates-to as a live edge name (${m[2].trim()}) — ` +
                  `mark it data-banned-verb if you are quoting the ban`);
    }
  }
}

// --- 7. div balance -------------------------------------------------------
// A note box closed with </p> instead of </div> renders as a note box wrapped around
// the rest of the page. No parser complains; it just looks wrong. Counting is enough
// to catch it, and it is cheaper than a DOM parse.
for (const f of htmlFiles) {
  const t = fs.readFileSync(f, 'utf8');
  const open = (t.match(/<div\b/g) || []).length;
  const close = (t.match(/<\/div>/g) || []).length;
  if (open !== close) {
    errors.push(`${rel(f)}: ${open} <div> vs ${close} </div> — a block is not closed`);
  }
}

// --- 6. key-leak tripwire -------------------------------------------------
const KEY_SHAPE = /[A-Za-z0-9_-]{20,}:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
for (const f of files) {
  if (/\.(png|jpg|jpeg|gif|webp|ico|woff2?|zip|svg)$/.test(f)) continue;
  const t = fs.readFileSync(f, 'utf8');
  if (KEY_SHAPE.test(t)) errors.push(`${rel(f)}: contains a vault-key-shaped string`);
}

// --- 8. the pages are projections of markdown ------------------------------
const crypto = require('crypto');
const sha = s => crypto.createHash('sha256').update(s).digest('hex');
const pagesManifestPath = path.join(ROOT, 'content/manifest.json');
if (!fs.existsSync(pagesManifestPath)) {
  errors.push('content/manifest.json is missing — run admin/build/gen_pages.py');
} else {
  for (const pg of JSON.parse(fs.readFileSync(pagesManifestPath, 'utf8')).pages) {
    const mdf = path.join(ROOT, pg.md);
    if (!fs.existsSync(mdf)) { errors.push(`chapter source is gone: ${pg.md}`); continue; }
    if (sha(fs.readFileSync(mdf)) !== pg.md_sha256) {
      errors.push(`page is stale: ${pg.md} changed since ${pg.path} was rendered — run gen_pages.py (then gen_book.py)`);
      continue;
    }
    const pf = path.join(ROOT, pg.path);
    if (!fs.existsSync(pf)) { errors.push(`rendered page missing: ${pg.path}`); continue; }
    const m = fs.readFileSync(pf, 'utf8').match(/<main class="doc">([\s\S]*?)<\/main>/);
    if (!m || sha(m[1]) !== pg.main_sha256) {
      errors.push(`${pg.path} was edited behind its markdown's back — the text lives in ${pg.md}; edit there and run gen_pages.py`);
    }
  }
}

// --- 9. the book is a projection ------------------------------------------
const bookManifestPath = path.join(ROOT, 'book/manifest.json');
if (!fs.existsSync(bookManifestPath)) {
  errors.push('book/manifest.json is missing — run admin/build/gen_book.py');
} else {
  const book = JSON.parse(fs.readFileSync(bookManifestPath, 'utf8'));
  if (book.version !== VERSION) {
    errors.push(`book was generated at ${book.version}, site is ${VERSION} — run gen_book.py (and regenerate the PDF)`);
  }
  for (const ch of book.chapters) {
    const src = path.join(ROOT, ch.source);
    if (!fs.existsSync(src)) { errors.push(`book chapter ${ch.n} source is gone: ${ch.source}`); continue; }
    const m = fs.readFileSync(src, 'utf8').match(/<main class="doc">([\s\S]*?)<\/main>/);
    if (!m) { errors.push(`${ch.source}: no <main class="doc"> block for the book to project`); continue; }
    const h = sha(m[1]);
    if (h !== ch.source_sha256) {
      errors.push(`book is stale: ${ch.source} changed since the book was generated — run gen_book.py (and regenerate the PDF)`);
    }
    if (!fs.existsSync(path.join(ROOT, 'book', ch.file))) {
      errors.push(`book chapter file missing: book/${ch.file}`);
    }
  }
  // the introduction is projected from the front page's hero..footer region,
  // the same no-drift rule as the chapters — the front page IS a book source
  if (!book.intro) {
    errors.push('book/manifest.json has no intro entry — run gen_book.py');
  } else {
    const src = path.join(ROOT, book.intro.source);
    if (!fs.existsSync(src)) {
      errors.push(`book introduction source is gone: ${book.intro.source}`);
    } else {
      const m = fs.readFileSync(src, 'utf8').match(/<header class="hero">[\s\S]*?(?=<footer class="site">)/);
      if (!m) {
        errors.push(`${book.intro.source}: no hero region for the introduction to project`);
      } else if (sha(m[0]) !== book.intro.source_sha256) {
        errors.push(`book is stale: ${book.intro.source} changed since the book was generated — run gen_book.py (and regenerate the PDF)`);
      }
    }
    if (!fs.existsSync(path.join(ROOT, 'book', book.intro.file))) {
      errors.push(`book introduction file missing: book/${book.intro.file}`);
    }
  }
  // both editions ship on every release: the print interior and the screen PDF
  // the cover is generated from the interior: same version, spine from its pages
  if (!book.cover) {
    errors.push('book/manifest.json has no cover entry — run gen_cover.py after gen_book.py');
  } else {
    if (book.cover.version !== VERSION) {
      errors.push(`cover was generated at ${book.cover.version}, site is ${VERSION} — run gen_cover.py`);
    }
    const interior = (book.pdfs || []).find(e => e.file === 'meaning-through-connectivity.pdf');
    if (interior && book.cover.pages_basis !== interior.pages) {
      errors.push(`cover spine was computed from ${book.cover.pages_basis} pages but the interior is ${interior.pages} — run gen_cover.py`);
    }
    for (const f of book.cover.files || []) {
      if (!fs.existsSync(path.join(ROOT, 'book', f))) errors.push(`cover file missing: book/${f}`);
    }
  }
  // the version-diff data must include this release: every version of the
  // book is comparable with every other, including the one shipping now
  const chIdxPath = path.join(ROOT, 'book/changes/data/index.json');
  if (!fs.existsSync(chIdxPath)) {
    errors.push('book/changes/data/index.json is missing — run gen_changes.py');
  } else {
    const chIdx = JSON.parse(fs.readFileSync(chIdxPath, 'utf8'));
    if (!(chIdx.versions || []).some(e => e.v === VERSION)) {
      errors.push(`book/changes data has no snapshot for ${VERSION} — run gen_changes.py`);
    }
    for (const e of chIdx.versions || []) {
      if (!fs.existsSync(path.join(ROOT, 'book/changes/data', `${e.v}.json`))) {
        errors.push(`book/changes data lists ${e.v} but ${e.v}.json is missing — run gen_changes.py`);
      }
    }
  }
  const REQUIRED_PDFS = ['meaning-through-connectivity.pdf',
                         'meaning-through-connectivity-screen.pdf'];
  const listed = (book.pdfs || []).map(e => e.file);
  for (const name of REQUIRED_PDFS) {
    if (!listed.includes(name)) {
      errors.push(`book/manifest.json has no entry for ${name} — gen_book.py generates both editions`);
      continue;
    }
    const entry = book.pdfs.find(e => e.file === name);
    if (entry.version !== VERSION) {
      errors.push(`book/${name} was generated at ${entry.version}, site is ${VERSION} — run gen_book.py`);
    }
    const f = path.join(ROOT, 'book', name);
    if (!fs.existsSync(f) || fs.statSync(f).size < 50000) {
      errors.push(`book/${name} is missing or truncated — gen_book.py regenerates it (WeasyPrint / Chromium)`);
    }
  }
}

// --- report ---------------------------------------------------------------
if (errors.length) {
  console.error(`validate: ${errors.length} error(s)`);
  for (const e of errors) console.error('  ✗ ' + e);
  process.exit(1);
}
console.log(`validate: OK — ${VERSION} on ${HOST}, ${htmlFiles.length} pages, ` +
            `${hubs.length} hubs in llms.txt, sitemap agrees, links resolve, ` +
            `blocks balanced, pages match their markdown, book fresh, no relates-to, no key-shaped strings`);
