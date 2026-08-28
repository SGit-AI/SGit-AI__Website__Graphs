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

await report('board');
