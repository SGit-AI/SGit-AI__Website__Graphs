/* @module board/core/board
   Single responsibility: turn one project board's JSON into HTML, by schema.
   Pure — parsed JSON in, HTML strings out; no DOM, no fetch, no dates of its own.

   The schemas are sgraph.ai's (project-workstreams-v2, project-issues-v1,
   project-agents-v2, project-releases-v1), adopted verbatim so a board here can
   be read by that dashboard and the reverse. The renderer is this estate's own,
   for one stated reason: that guide publishes a known defect, its card helpers
   interpolate title and description as raw strings. EVERY value below goes
   through esc(). A board is a projection of authored sources, but the rule holds
   whatever the source. */
'use strict';

export const COLUMNS = [
  { id: 'queued', label: 'Queued' },
  { id: 'next', label: 'Up Next' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'done', label: 'Done' },
];

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g,
  (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** A colour is interpolated into a style attribute, so it is not free text. */
export function safeColour(c) {
  return /^#[0-9a-fA-F]{3,8}$/.test(String(c || '')) ? String(c) : '#8b93a7';
}

/** Their rule: an explicit status wins; otherwise it is derived from the tasks,
    so a board cannot report progress a task list does not support.

    ONE DELIBERATE EXTENSION. The reference has four columns and no Blocked one,
    so a workstream with finished work and a blocked task fell through to Queued
    and read as not started. Started-and-stalled is In Progress, with the block
    named on the card. Anything else would understate work already done. */
export function statusOf(ws) {
  if (ws.status) return ws.status;
  const t = ws.tasks || [];
  if (!t.length) return 'queued';
  if (t.every((x) => x.status === 'done')) return 'done';
  if (t.some((x) => x.status === 'in-progress')) return 'in-progress';
  if (t.some((x) => x.status === 'blocked') && t.some((x) => x.status === 'done')) return 'in-progress';
  if (t.some((x) => x.status === 'next')) return 'next';
  return 'queued';
}

export function progressOf(ws) {
  const t = ws.tasks || [];
  const done = t.filter((x) => x.status === 'done').length;
  return { done, total: t.length, pct: t.length ? Math.round((100 * done) / t.length) : 0 };
}

const badge = (kind, text) =>
  '<span class="bd-badge bd-' + esc(kind) + '">' + esc(text) + '</span>';

const owner = (o) => (o ? '<span class="bd-owner">' + esc(o) + '</span>' : '');

/** The Kanban board: a column per status, a card per workstream. */
export function workstreamsHtml(data) {
  const all = data.workstreams || [];
  const cols = COLUMNS.map((col) => {
    const inCol = all.filter((w) => statusOf(w) === col.id);
    const cards = inCol.map((w) => {
      const p = progressOf(w);
      const blocked = (w.tasks || []).some((t) => t.status === 'blocked');
      return '<article class="bd-card" data-ws="' + esc(w.id) + '" tabindex="0"' +
        ' style="border-left-color:' + safeColour(w.color) + '">' +
        '<h4>' + esc(w.title) + '</h4>' +
        (w.description ? '<p class="bd-desc">' + esc(w.description) + '</p>' : '') +
        '<div class="bd-bar"><i style="width:' + p.pct + '%;background:' + safeColour(w.color) + '"></i></div>' +
        '<p class="bd-meta"><code>' + esc(w.id) + '</code> &middot; ' + p.done + ' of ' + p.total +
        (blocked ? ' &middot; ' + badge('blocked', 'blocked') : '') +
        (w.waiting_on ? ' &middot; waiting on ' + esc(w.waiting_on) : '') + '</p>' +
        '</article>';
    }).join('');
    return '<section class="bd-col" data-col="' + esc(col.id) + '">' +
      '<h3>' + esc(col.label) + '<span class="bd-n">' + inCol.length + '</span></h3>' +
      (cards || '<p class="bd-empty">nothing here</p>') + '</section>';
  }).join('');
  return '<div class="bd-kanban">' + cols + '</div>';
}

/** The drill-down: one workstream's tasks, in the order they were authored. */
export function workstreamDetail(data, id) {
  const w = (data.workstreams || []).find((x) => x.id === id);
  if (!w) return null;
  const p = progressOf(w);
  const rows = (w.tasks || []).map((t) =>
    '<tr class="bd-t-' + esc(t.status || 'queued') + '"><td><code>' + esc(t.id) + '</code></td>' +
    '<td>' + esc(t.title) + '</td>' +
    '<td>' + badge(t.status || 'queued', t.status || 'queued') + '</td>' +
    '<td>' + owner(t.owner) + '</td>' +
    '<td class="small dim">' + esc(t.note || '') + '</td></tr>').join('');
  return '<div class="bd-detail"><button class="bd-back">&larr; all workstreams</button>' +
    '<h3 style="border-bottom-color:' + safeColour(w.color) + '">' + esc(w.title) + '</h3>' +
    (w.description ? '<p>' + esc(w.description) + '</p>' : '') +
    '<p class="bd-meta"><code>' + esc(w.id) + '</code> &middot; ' + badge(statusOf(w), statusOf(w)) +
    ' &middot; ' + p.done + ' of ' + p.total + ' done' +
    (w.waiting_on ? ' &middot; waiting on <b>' + esc(w.waiting_on) + '</b>' : '') +
    (w.href ? ' &middot; <a href="' + esc(w.href) + '">the record &rarr;</a>' : '') + '</p>' +
    '<div class="tablewrap"><table class="bd-tasks"><thead><tr><th>#</th><th>Task</th>' +
    '<th>Status</th><th>Owner</th><th>Note</th></tr></thead><tbody>' + rows +
    '</tbody></table></div></div>';
}

export function issuesHtml(data) {
  const rank = { high: 0, medium: 1, low: 2 };
  const list = (data.issues || []).slice().sort((a, b) =>
    (rank[a.priority] ?? 3) - (rank[b.priority] ?? 3));
  return '<div class="bd-issues">' + list.map((i) =>
    '<article class="bd-issue bd-p-' + esc(i.priority || 'low') + '">' +
    '<h4>' + esc(i.title) + '</h4>' +
    (i.description ? '<p class="bd-desc">' + esc(i.description) + '</p>' : '') +
    '<p class="bd-meta"><code>' + esc(i.id) + '</code> &middot; ' +
    badge(i.status || 'open', i.status || 'open') + ' &middot; ' +
    badge('p-' + (i.priority || 'low'), i.priority || 'low') + ' ' + owner(i.owner) +
    (i.href ? ' &middot; <a href="' + esc(i.href) + '">where it is argued &rarr;</a>' : '') +
    '</p></article>').join('') + '</div>';
}

export function agentsHtml(data) {
  return '<div class="tablewrap"><table class="bd-agents"><thead><tr><th>Agent</th>' +
    '<th>Status</th><th>Role</th><th>Where it works</th><th>Output</th></tr></thead><tbody>' +
    (data.agents || []).map((a) =>
      '<tr><td><b>' + esc(a.alias) + '</b><div class="small dim"><code>' + esc(a.id) + '</code></div></td>' +
      '<td>' + badge(a.session_status || 'idle', a.session_status || 'idle') + '</td>' +
      '<td>' + esc(a.role) + '</td>' +
      '<td class="small"><code>' + esc(a.location) + '</code></td>' +
      '<td class="small">' + esc(a.output || '') + '</td></tr>').join('') +
    '</tbody></table></div>';
}

export function releasesHtml(data) {
  return '<div class="bd-releases">' + (data.releases || []).map((r) =>
    '<section class="bd-rel"><h4>' + esc(r.version) + ' ' + badge(r.status || 'released', r.status || 'released') +
    '<span class="bd-when">' + esc(r.date) + (r.site ? ' &middot; site ' + esc(r.site) : '') + '</span></h4>' +
    (r.note ? '<p class="bd-desc">' + esc(r.note) + '</p>' : '') +
    ((r.tasks || []).length ? '<ul class="bd-shipped">' + r.tasks.map((t) =>
      '<li><code>' + esc(t.id) + '</code> ' + esc(t.title) + ' ' + owner(t.owner) + '</li>').join('') + '</ul>' : '') +
    '</section>').join('') + '</div>';
}

const BY_SCHEMA = {
  'project-workstreams-v2': workstreamsHtml,
  'project-issues-v1': issuesHtml,
  'project-agents-v2': agentsHtml,
  'project-releases-v1': releasesHtml,
};

/** The board's own `schema` key decides, exactly as the reference does. */
export function renderBoard(data) {
  const fn = BY_SCHEMA[data && data.schema];
  return fn ? fn(data) : null;
}
