/* The project board: the pure renderers, the derivation rule, and the promise
   that the generated JSON matches the repository it is derived from.

   The escaping tests are the ones that matter. The schemas come from a
   dashboard whose own guide publishes an unescaped-interpolation defect, so
   these pin that ours does not repeat it. */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { test, report } from './harness.mjs';
import {
  COLUMNS, statusOf, progressOf, safeColour, renderBoard, workstreamDetail,
} from '../../assets/board/core/board.js';
import {
  issueViewOf, statusFromPath, ownerFromPath, splitFront, issueHtml, statusSummary,
} from '../../assets/explorer/issueview.js';
import {
  byTag, byChapter, galleryHtml, figureHtml, filtersHtml, kb,
} from '../../assets/figures/core/figureview.js';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const BOOK = path.join(ROOT, 'v2/books/making-a-book');
const load = (n) => JSON.parse(readFileSync(path.join(BOOK, 'boards', `${n}.json`), 'utf8'));

test('board: a column is derived from the tasks, and an explicit status wins', () => {
  assert.equal(statusOf({ tasks: [{ status: 'done' }, { status: 'done' }] }), 'done');
  assert.equal(statusOf({ tasks: [{ status: 'done' }, { status: 'queued' }] }), 'queued');
  assert.equal(statusOf({ tasks: [{ status: 'in-progress' }] }), 'in-progress');
  assert.equal(statusOf({ tasks: [{ status: 'next' }, { status: 'queued' }] }), 'next');
  assert.equal(statusOf({ tasks: [] }), 'queued');
  assert.equal(statusOf({ status: 'done', tasks: [{ status: 'queued' }] }), 'done');
  /* the deliberate extension: started and stalled is in progress, not queued */
  assert.equal(statusOf({ tasks: [{ status: 'done' }, { status: 'blocked' }] }), 'in-progress');
  assert.equal(statusOf({ tasks: [{ status: 'blocked' }] }), 'queued', 'blocked with no work done has not started');
});

test('board: progress counts what is done, never what is claimed', () => {
  assert.deepEqual(progressOf({ tasks: [{ status: 'done' }, { status: 'queued' }] }),
    { done: 1, total: 2, pct: 50 });
  assert.deepEqual(progressOf({ tasks: [] }), { done: 0, total: 0, pct: 0 });
});

test('board: every value is escaped, including the colour', () => {
  const nasty = '<img src=x onerror=alert(1)>';
  const html = renderBoard({
    schema: 'project-workstreams-v2',
    workstreams: [{ id: nasty, title: nasty, description: nasty, color: 'red;background:url(x)',
      tasks: [{ id: 't', title: nasty, status: 'done' }] }],
  });
  assert.ok(!html.includes('<img'), 'no raw tag survives into the card');
  assert.ok(html.includes('&lt;img'), 'it is shown as text instead');
  assert.ok(!html.includes('url(x)'), 'a colour that is not a hex value is refused');
  assert.equal(safeColour('red;background:url(x)'), '#8b93a7');
  assert.equal(safeColour('#6366f1'), '#6366f1');
  for (const schema of ['project-issues-v1', 'project-agents-v2', 'project-releases-v1']) {
    const key = { 'project-issues-v1': 'issues', 'project-agents-v2': 'agents',
      'project-releases-v1': 'releases' }[schema];
    const h = renderBoard({ schema, [key]: [{ id: nasty, title: nasty, description: nasty,
      alias: nasty, role: nasty, location: nasty, version: nasty, note: nasty }] });
    assert.ok(!h.includes('<img'), `${schema} escapes too`);
  }
  const d = workstreamDetail({ workstreams: [{ id: 'x', title: nasty, tasks: [] }] }, 'x');
  assert.ok(!d.includes('<img'), 'the drill-down escapes too');
});

test('board: an unknown schema renders nothing rather than guessing', () => {
  assert.equal(renderBoard({ schema: 'nope' }), null);
  assert.equal(renderBoard({}), null);
  assert.equal(workstreamDetail({ workstreams: [] }, 'missing'), null);
});

test('board: the generated boards match the repository they are derived from', () => {
  const ws = load('workstreams');
  assert.equal(ws.schema, 'project-workstreams-v2');
  const cols = new Set(COLUMNS.map((c) => c.id));
  const seen = new Set();
  for (const w of ws.workstreams) {
    assert.ok(cols.has(statusOf(w)), `${w.id} lands in a column that exists`);
    assert.ok(!seen.has(w.id), `duplicate workstream id ${w.id}`);
    seen.add(w.id);
    for (const t of w.tasks) assert.ok(t.title && t.status, `${t.id} is complete`);
    /* a workstream that names a record must name one that exists */
    if (w.href) {
      const page = path.join(ROOT, 'v2/dev-pack', path.basename(w.href));
      assert.ok(existsSync(page), `${w.id} links ${w.href}, which is not built`);
    }
  }
  /* every change-control pack stamped for this book is on the board, by name */
  const packs = readdirSync(path.join(ROOT, 'v2/dev-packs'))
    .filter((d) => d.startsWith('making-a-book__')).sort();
  assert.ok(packs.length >= 3, 'the book has packs to show');
  const onBoard = ws.workstreams.map((w) => w.pack).filter(Boolean).sort();
  assert.deepEqual(onBoard, packs,
    'a pack for this book is missing from the board — add it to gen_board.py and rerun');
});

test('board: the roster is computed from the team folder, not asserted', () => {
  const agents = load('agents');
  const roles = readdirSync(path.join(ROOT, 'v2/team'), { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(path.join(ROOT, 'v2/team', d.name, 'role.md')))
    .map((d) => d.name);
  assert.equal(agents.agents.length, roles.length, 'one row per role that has a role.md');
  for (const a of agents.agents) {
    assert.ok(roles.includes(a.alias.slice(1)), `${a.alias} is a real role folder`);
    assert.ok(a.role.length > 10, `${a.alias} carries its core mission`);
    assert.ok(['active', 'idle'].includes(a.session_status));
  }
});

test('board: the release log is the book own two-clock changelog', () => {
  const rel = load('releases');
  const meta = JSON.parse(readFileSync(path.join(BOOK, 'book.json'), 'utf8'));
  assert.equal(rel.releases.length, meta.changelog.length);
  const versions = new Set(meta.changelog.map((c) => c.version));
  for (const r of rel.releases) {
    assert.ok(versions.has(r.version), `${r.version} is in the changelog`);
    assert.ok(r.site.startsWith('v'), 'and names the site release that carried it');
  }
  assert.equal(rel.releases[0].version, meta.version, 'newest first, and it is the current one');
});

test('board: every issue says where it is argued, or says nothing at all', () => {
  for (const i of load('issues').issues) {
    assert.ok(['open', 'in-progress', 'resolved', 'blocked'].includes(i.status), i.id);
    assert.ok(['high', 'medium', 'low'].includes(i.priority), i.id);
    if (i.href) {
      const page = path.join(ROOT, 'v2', i.href.replace(/^\.\.\/\.\.\//, ''));
      assert.ok(existsSync(page), `${i.id} links ${i.href}, which is not built`);
    }
  }
});

/* ---- the issue folders: Issues-FS-lite (v0.6.14) ------------------------- */
const TEAM = path.join(ROOT, 'v2/team');
const roleDirs = () => readdirSync(TEAM, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(path.join(TEAM, d.name, 'role.md')))
  .map((d) => d.name);
const allIssues = () => roleDirs().flatMap((r) => ['open', 'blocked', 'done'].flatMap((s) => {
  const dir = path.join(TEAM, r, 'issues', s);
  return existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.md'))
    .map((f) => ({ role: r, state: s, name: f, path: path.join(dir, f) })) : [];
}));

test('issues: the folder is the status, and only the folder', () => {
  assert.equal(statusFromPath('qa/issues/open/001-x.md'), 'open');
  assert.equal(statusFromPath('v2/team/qa/issues/blocked/001-x.md'), 'blocked');
  assert.equal(statusFromPath('qa/issues/done/001-x.md'), 'resolved');
  assert.equal(statusFromPath('qa/briefs/001-x.md'), 'unknown');
  /* the owner is read from the path too, wherever the path is rooted */
  assert.equal(ownerFromPath('qa/issues/open/001-x.md'), 'qa');
  assert.equal(ownerFromPath('v2/team/librarian/issues/blocked/001-x.md'), 'librarian');
  assert.equal(ownerFromPath('v2/team/qa/debriefs/x.md'), null);
});

test('issues: only a numbered issue file claims the issue view', () => {
  assert.equal(issueViewOf('001-a-thing.md', 'qa/issues/open'), 'issue');
  assert.equal(issueViewOf('ISSUES.md', ''), null);
  assert.equal(issueViewOf('001-a-thing.md', 'qa/briefs'), null, 'a brief is not an issue');
  assert.equal(issueViewOf('notes.md', 'qa/issues/open'), null, 'unnumbered is not an issue');
});

test('issues: the front matter splits, and the rendered issue escapes', () => {
  const { fields, body } = splitFront('---\ncreated: 2026-01-01T00:00:00Z\npriority: high\n---\n# T\n\nbody');
  assert.deepEqual(fields, [['created', '2026-01-01T00:00:00Z'], ['priority', 'high']]);
  assert.equal(body, '# T\n\nbody');
  assert.deepEqual(splitFront('no front matter').fields, []);
  const h = issueHtml('---\npriority: <img src=x onerror=alert(1)>\n---\n# T', 'qa/issues/open/001-x.md', null);
  assert.ok(!h.includes('<img'), 'a field value cannot inject markup');
  assert.ok(h.includes('bd-open') && h.includes('@qa'));
});

test('issues: the summary is the find command, counted', () => {
  const h = statusSummary([
    { path: 'qa/issues/open/001-a.md' }, { path: 'qa/issues/open/002-b.md' },
    { path: 'writer/issues/blocked/001-c.md' }, { path: 'qa/issues/done/003-d.md' },
    { path: 'qa/briefs/not-an-issue.md' },
  ]);
  assert.ok(h.includes('@qa') && h.includes('@writer'));
  assert.ok(!h.includes('@?'), 'a non-issue path is skipped, not bucketed as unknown');
});

test('issues: every file on disk holds to the pattern', () => {
  const files = allIssues();
  assert.ok(files.length >= 10, 'the roles have work plans');
  for (const f of files) {
    assert.match(f.name, /^\d{3}-[a-z0-9-]+\.md$/, `${f.role}/${f.name} is NNN-kebab-slug.md`);
    const { fields, body } = splitFront(readFileSync(f.path, 'utf8'));
    const fm = Object.fromEntries(fields);
    for (const k of ['created', 'priority']) {
      assert.ok(fm[k], `${f.role}/${f.name} has no ${k}`);
    }
    assert.ok(['high', 'medium', 'low'].includes(fm.priority), `${f.role}/${f.name} priority`);
    assert.match(body, /^#\s+\S/m, `${f.role}/${f.name} has a title heading`);
    if (f.state === 'blocked') assert.ok(fm.blocked_on, `${f.role}/${f.name} must say blocked_on what`);
    else assert.ok(!fm.blocked_on, `${f.role}/${f.name} says blocked_on but is not in blocked/`);
    if (f.state === 'done') assert.ok(fm.closed, `${f.role}/${f.name} is done with no closed date`);
  }
  /* numbers are per role, so two roles sharing 001 is fine; one role must not */
  for (const r of roleDirs()) {
    const ns = files.filter((f) => f.role === r).map((f) => f.name.slice(0, 3));
    assert.equal(new Set(ns).size, ns.length, `${r} reuses an issue number`);
  }
});

test('issues: the board reads the folders rather than holding a copy', () => {
  const onBoard = load('issues').issues;
  const onDisk = allIssues();
  assert.equal(onBoard.length, onDisk.length,
    'the issues board is derived from the files — rerun gen_board.py');
  const want = { open: 'open', blocked: 'blocked', done: 'resolved' };
  for (const f of onDisk) {
    const row = onBoard.find((i) => i.id === `@${f.role}-${f.name.slice(0, 3)}`);
    assert.ok(row, `${f.role}/${f.name} is missing from the board`);
    assert.equal(row.status, want[f.state], `${f.role}/${f.name} status follows its folder`);
    assert.equal(row.owner, `@${f.role}`);
  }
});

/* ---- the figure graph and its viewer (v0.6.15) --------------------------- */
const figs = () => JSON.parse(readFileSync(path.join(BOOK, 'figures/index.json'), 'utf8'));

test('figures: every figure is on disk, used once, and names a real tag', () => {
  const d = figs();
  assert.equal(d.schema, 'book-figures-v1');
  const onDisk = readdirSync(path.join(BOOK, 'figures')).filter((f) => f.endsWith('.png'));
  assert.equal(d.figures.length, onDisk.length, 'one entry per image — rerun gen_figures.py');
  const ns = new Set();
  for (const f of d.figures) {
    assert.ok(onDisk.includes(f.file), `${f.file} is not on disk`);
    assert.match(f.file, /^\d{2}__v\d+\.\d+\.\d+__[a-z0-9-]+\.png$/, f.file);
    assert.ok(f.width > 0 && f.height > 0 && f.bytes > 0, `${f.file} has no dimensions`);
    assert.match(f.sha256, /^[0-9a-f]{64}$/, `${f.file} sha`);
    assert.ok(f.used_by.length >= 1, `${f.file} is used by no chapter`);
    assert.ok(!ns.has(f.n), `two figures numbered ${f.n}`);
    ns.add(f.n);
    /* the tag is in the filename AND in the field: they must agree */
    assert.equal(f.tag, f.file.split('__')[1], `${f.file} tag disagrees with its name`);
    /* the chapter it claims must exist, and must actually reference it */
    for (const u of f.used_by) {
      const md = path.join(BOOK, 'content', u.chapter);
      assert.ok(existsSync(md), `${f.file} names ${u.chapter}, which does not exist`);
      assert.ok(readFileSync(md, 'utf8').includes(`figures/${f.file}`),
        `${u.chapter} does not reference ${f.file} — rerun gen_figures.py`);
    }
  }
});

test('figures: every figure the chapters reference has an entry', () => {
  const d = figs();
  const known = new Set(d.figures.map((f) => f.file));
  for (const md of readdirSync(path.join(BOOK, 'content'))) {
    const text = readFileSync(path.join(BOOK, 'content', md), 'utf8');
    for (const m of text.matchAll(/\]\(figures\/([^)]+)\)/g)) {
      assert.ok(known.has(m[1]), `${md} references ${m[1]}, which has no figure entry`);
    }
  }
});

test('figures: the gallery, the filters and the detail render and escape', () => {
  const d = figs();
  const gallery = galleryHtml(d, '');
  assert.equal((gallery.match(/fg-card/g) || []).length, d.figures.length);
  const one = d.figures[0];
  assert.equal((galleryHtml(d, one.tag).match(/class="fg-card"/g) || []).length,
    d.figures.filter((f) => f.tag === one.tag).length, 'filtering by tag narrows the gallery');
  const detail = figureHtml(d, one.id);
  assert.ok(detail.includes(one.tag) && detail.includes(String(one.width)));
  assert.equal(figureHtml(d, 'fig-99'), null, 'an unknown figure renders nothing');
  assert.ok(filtersHtml(d, '').includes('fg-chip'));
  /* the counts are the data, not a claim about it */
  assert.equal(byTag(d).reduce((a, t) => a + t.n, 0), d.figures.length);
  assert.equal(byChapter(d).length, d.totals.chapters);
  const nasty = { schema: 'x', figures: [{ id: 'f', n: 1, tag: '<img src=x onerror=alert(1)>',
    file: 'a.png', slug: 's', caption: '<script>bad()</script>', width: 1, height: 1, bytes: 1,
    sha256: 'a', used_by: [] }] };
  assert.ok(!galleryHtml(nasty, '').includes('<img src=x'), 'the gallery escapes');
  assert.ok(!figureHtml(nasty, 'f').includes('<script>bad'), 'the detail escapes');
  assert.equal(kb(500000), '488 KB');
});

/* ---- the reviews and the version diff (v0.6.17) -------------------------- */
test('reviews: a review names a version the book has actually been at', () => {
  const d = JSON.parse(readFileSync(path.join(BOOK, 'reviews/index.json'), 'utf8'));
  const meta = JSON.parse(readFileSync(path.join(BOOK, 'book.json'), 'utf8'));
  const history = new Set([...(meta.former_versions || []), meta.version]);
  assert.ok(d.reviews.length >= 1, 'the book has at least one recorded reading');
  const seen = new Set();
  for (const r of d.reviews) {
    assert.ok(history.has(r.book_version),
      `${r.review} reviews ${r.book_version}, which this book has never been at`);
    assert.ok(['open', 'actioned', 'superseded'].includes(r.state), r.review);
    assert.ok(!seen.has(r.review), `two reviews numbered ${r.review}`);
    seen.add(r.review);
    assert.ok(r.items.length >= 1, `${r.review} has no items`);
    for (const i of r.items) {
      assert.ok(['open', 'actioned', 'declined', 'superseded'].includes(i.state),
        `${r.review} item ${i.n}: ${i.state}`);
      assert.ok(i.title.length > 5, `${r.review} item ${i.n} has no finding`);
    }
    /* the reading it cites must be a brief that exists */
    if (r.source) {
      assert.ok(existsSync(path.join(ROOT, r.source)),
        `${r.review} cites ${r.source}, which does not exist`);
    }
  }
  /* every review file on disk is in the index */
  const files = readdirSync(path.join(BOOK, 'reviews')).filter((f) => /^r\d{3}__/.test(f));
  assert.equal(d.reviews.length, files.length, 'a review on disk is missing from the index');
});

test('diff: one snapshot per book version, keyed the way the differ reads', () => {
  const dir = path.join(BOOK, 'changes/data');
  const idx = JSON.parse(readFileSync(path.join(dir, 'index.json'), 'utf8'));
  const meta = JSON.parse(readFileSync(path.join(BOOK, 'book.json'), 'utf8'));
  assert.equal(idx.versions.length, meta.changelog.length,
    'one snapshot per book version — rerun gen_bookdiff.py');
  for (const v of idx.versions) {
    /* assets/changes.js reads `v` and `date`; both must be there */
    assert.ok(v.v && v.date, `${v.version} is missing the keys the differ reads`);
    const snap = JSON.parse(readFileSync(path.join(dir, `${v.v}.json`), 'utf8'));
    assert.equal(snap.version, v.v);
    assert.ok(snap.date, 'a snapshot must carry its date, or the summary line breaks');
    const keys = Object.keys(snap.units);
    assert.ok(keys.includes('intro'), 'the front matter is the differ\'s intro unit');
    for (const k of keys) {
      assert.match(k, /^(intro|ch\d{2})$/, `unit key ${k} will not sort in the differ`);
      assert.ok(snap.units[k].blocks.length > 0, `${v.v}/${k} has no blocks`);
      assert.ok(snap.units[k].title, `${v.v}/${k} has no title`);
    }
    assert.equal(keys.length, v.units);
  }
  /* the pair the founder asked for is really different, and only where expected */
  const a = JSON.parse(readFileSync(path.join(dir, 'v0.1.0.json'), 'utf8'));
  const b = JSON.parse(readFileSync(path.join(dir, 'v0.2.0.json'), 'utf8'));
  const changed = Object.keys(b.units).filter((k) =>
    JSON.stringify(a.units[k].blocks) !== JSON.stringify(b.units[k].blocks));
  assert.equal(changed.length, 4, `v0.1.0 to v0.2.0 changed 4 chapters, found ${changed.length}`);
  assert.ok(changed.includes('intro'), 'the retitle changed the front matter');
});

await report('board');
