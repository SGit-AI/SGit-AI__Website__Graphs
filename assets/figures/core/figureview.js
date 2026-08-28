/* @module figures/core/figureview
   Single responsibility: render the figure graph — the gallery, and one figure
   with its provenance and its cross-links. Pure: the parsed index.json in, HTML
   strings out; no DOM, no fetch.

   Every value is escaped. The data is derived from the repository rather than
   authored, but a caption is still prose from a chapter and a slug is still a
   filename, and neither has earned the right to be interpolated raw. */
'use strict';

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g,
  (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const kb = (b) => (b > 999999 ? (b / 1e6).toFixed(1) + ' MB' : Math.round(b / 1024) + ' KB');

/** The tags in the order the figures walk them, with how many each carries.
    A release photographed more than once is a release the book returns to. */
export function byTag(data) {
  const seen = new Map();
  for (const f of data.figures || []) {
    seen.set(f.tag, (seen.get(f.tag) || 0) + 1);
  }
  return [...seen.entries()].map(([tag, n]) => ({ tag, n }));
}

/** The chapters that carry figures, in book order, with their figure numbers. */
export function byChapter(data) {
  const seen = new Map();
  for (const f of data.figures || []) {
    for (const u of f.used_by || []) {
      if (!seen.has(u.chapter)) seen.set(u.chapter, { title: u.title, href: u.href, figures: [] });
      seen.get(u.chapter).figures.push(f.n);
    }
  }
  return [...seen.entries()].sort().map(([chapter, v]) => ({ chapter, ...v }));
}

export function galleryHtml(data, filter) {
  const figs = (data.figures || []).filter((f) =>
    !filter || f.tag === filter || (f.used_by || []).some((u) => u.chapter === filter));
  if (!figs.length) return '<p class="dim">nothing matches that filter</p>';
  return '<div class="fg-grid">' + figs.map((f) => {
    const u = (f.used_by || [])[0];
    return '<figure class="fg-card" data-fig="' + esc(f.id) + '" tabindex="0">' +
      '<img src="figures/' + esc(f.file) + '" alt="' + esc(f.caption) + '" loading="lazy">' +
      '<figcaption><b>' + f.n + '</b> &middot; <code>' + esc(f.tag) + '</code>' +
      (u ? ' &middot; <span class="dim">' + esc(u.title) + '</span>' : '') +
      '<span class="fg-cap">' + esc(f.caption) + '</span></figcaption></figure>';
  }).join('') + '</div>';
}

export function figureHtml(data, id) {
  const f = (data.figures || []).find((x) => x.id === id);
  if (!f) return null;
  const rows = [
    ['photographed at', '<code>' + esc(f.tag) + '</code>' +
      (f.release && f.release.href
        ? ' &middot; <a href="' + esc(f.release.href) + '">the release row &rarr;</a>' : '')],
    ['what shipped in it', f.release && f.release.headline
      ? esc(f.release.headline) : '<span class="dim">not narrated</span>'],
    ['tagged', esc((f.taken || '').slice(0, 10)) || '<span class="dim">unknown</span>'],
    ['file', '<code>figures/' + esc(f.file) + '</code> &middot; ' + f.width + '&times;' + f.height +
      ' &middot; ' + kb(f.bytes)],
    ['sha-256', '<code class="dim">' + esc((f.sha256 || '').slice(0, 32)) + '&hellip;</code>'],
    ['used by', (f.used_by || []).map((u) =>
      '<a href="' + esc(u.href) + '">' + esc(u.title) + '</a>' +
      (u.section ? ' &middot; <em>' + esc(u.section) + '</em>' : '') +
      ' <span class="small dim">' + esc(u.chapter) + ':' + u.line + '</span>').join('<br>')
      || '<span class="dim">nothing uses it</span>'],
  ];
  return '<div class="fg-detail"><button class="fg-back">&larr; all figures</button>' +
    '<h3>Figure ' + f.n + ' &middot; ' + esc(f.slug) + '</h3>' +
    '<p class="fg-quote">' + esc(f.caption) + '</p>' +
    '<a class="fg-full" href="figures/' + esc(f.file) + '" target="_blank" rel="noopener">' +
    '<img src="figures/' + esc(f.file) + '" alt="' + esc(f.caption) + '"></a>' +
    '<div class="tablewrap"><table class="fg-meta"><tbody>' +
    rows.map(([k, v]) => '<tr><th>' + esc(k) + '</th><td>' + v + '</td></tr>').join('') +
    '</tbody></table></div>' +
    '<p class="small dim">To re-take this figure: check out <code>' + esc(f.tag) +
    '</code> into a worktree, serve it, and photograph the page. Appendix C carries the scripts.</p>' +
    '</div>';
}

export function filtersHtml(data, active) {
  const chip = (v, label, n) => '<button class="fg-chip' + (v === active ? ' on' : '') +
    '" data-filter="' + esc(v) + '">' + esc(label) + '<span class="bd-n">' + n + '</span></button>';
  return '<div class="fg-filters"><span class="fg-lab">by release</span>' +
    chip('', 'all', (data.figures || []).length) +
    byTag(data).map((t) => chip(t.tag, t.tag, t.n)).join('') +
    '</div><div class="fg-filters"><span class="fg-lab">by chapter</span>' +
    byChapter(data).map((c) => chip(c.chapter, c.title, c.figures.length)).join('') +
    '</div>';
}
