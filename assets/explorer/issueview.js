/* @module explorer/issueview
   Single responsibility: the file explorer's view of one Issues-FS-lite issue —
   the front-matter block as a field table, the body rendered, and the status
   read from the path rather than from any field, because in this pattern the
   folder a file sits in IS its status.

   Pure: a path and the file's text in, HTML strings out; no DOM, no fetch.
   Returns null for anything that is not an issue, so the shell falls through to
   the document and book views. */
'use strict';

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g,
  (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const STATUS = { open: 'open', blocked: 'blocked', done: 'resolved' };

/** An issue is any NNN-slug.md inside issues/open|blocked|done. */
export function issueViewOf(name, base) {
  return /issues\/(open|blocked|done)$/.test(String(base || '')) && /^\d{3}-[a-z0-9-]+\.md$/.test(name)
    ? 'issue' : null;
}

/** The folder is the status. Nothing else is consulted, deliberately. */
export function statusFromPath(path) {
  const m = String(path || '').match(/issues\/(open|blocked|done)\//);
  return m ? STATUS[m[1]] : 'unknown';
}

/** The role that owns an issue is the folder above issues/, wherever the path
    is rooted: the explorer's manifest is role-relative, a repo path is not. */
export function ownerFromPath(path) {
  const m = String(path || '').match(/([a-z][a-z-]*)\/issues\/(?:open|blocked|done)\//);
  return m ? m[1] : null;
}

/** The leading --- block as ordered pairs, plus the body. Flat by design: the
    specification's front matter is flat, and a YAML parser for four keys would
    be a dependency for four keys. */
export function splitFront(text) {
  const t = String(text);
  if (!t.startsWith('---')) return { fields: [], body: t };
  const end = t.indexOf('\n---', 3);
  if (end === -1) return { fields: [], body: t };
  const fields = [];
  for (const raw of t.slice(3, end).split('\n')) {
    const line = raw.trim().startsWith('#') ? '' : raw.split(' #')[0];
    const i = line.indexOf(':');
    if (i > 0) fields.push([line.slice(0, i).trim(), line.slice(i + 1).trim()]);
  }
  return { fields, body: t.slice(end + 4).replace(/^\n+/, '') };
}

/** @param render  the page's markdown renderer, or null for a plain fallback. */
export function issueHtml(text, path, render) {
  const { fields, body } = splitFront(text);
  const status = statusFromPath(path);
  const owner = ownerFromPath(path);
  const head = '<p class="iv-head"><span class="bd-badge bd-' + esc(status) + '">' + esc(status) +
    '</span>' + (owner ? ' <span class="bd-owner">@' + esc(owner) + '</span>' : '') +
    ' <span class="small dim">status is the folder, not a field</span></p>';
  const table = fields.length
    ? '<div class="tablewrap"><table class="iv-fm"><tbody>' + fields.map(([k, v]) =>
      '<tr><th>' + esc(k) + '</th><td>' + esc(v) + '</td></tr>').join('') + '</tbody></table></div>'
    : '<p class="small dim">no front matter</p>';
  const rendered = render ? '<div class="mdread">' + render(body) + '</div>'
    : '<pre class="fv-raw">' + esc(body) + '</pre>';
  return '<div class="iv">' + head + table + rendered + '</div>';
}

/** The whole-team view the layout gives away: what is open, and on whose list.
    @param files  [{path, name}] from the manifest, already ordered. */
export function statusSummary(files) {
  const by = {};
  for (const f of files) {
    const st = statusFromPath(f.path);
    if (st === 'unknown') continue;
    const who = ownerFromPath(f.path) || '?';
    by[who] = by[who] || { open: 0, blocked: 0, resolved: 0 };
    by[who][st] += 1;
  }
  const roles = Object.keys(by).sort();
  const tot = { open: 0, blocked: 0, resolved: 0 };
  roles.forEach((r) => Object.keys(tot).forEach((k) => { tot[k] += by[r][k]; }));
  return '<div class="tablewrap"><table class="iv-sum"><thead><tr><th>Role</th>' +
    '<th>Open</th><th>Blocked</th><th>Done</th></tr></thead><tbody>' +
    roles.map((r) => '<tr><td><b>@' + esc(r) + '</b></td><td>' + by[r].open + '</td><td>' +
      by[r].blocked + '</td><td class="dim">' + by[r].resolved + '</td></tr>').join('') +
    '<tr class="iv-tot"><td><b>all</b></td><td><b>' + tot.open + '</b></td><td><b>' +
    tot.blocked + '</b></td><td class="dim">' + tot.resolved + '</td></tr>' +
    '</tbody></table></div>';
}
