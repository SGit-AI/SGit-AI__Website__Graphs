/* @module explorer/bookview
   Single responsibility: the file explorer's book-specific logic — which view a
   book artefact deserves, and the HTML for the three JSON files a book owns that
   the document views do not understand (book.json, build.json, and the book
   graph's own index). Pure: names and parsed JSON in, HTML strings out; no DOM,
   no fetch. Returns null for anything it does not claim, so the shell can fall
   through to the document views. */
'use strict';

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g,
  (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const cut = (s, n) => { s = String(s == null ? '' : s); return esc(s.length > n ? s.slice(0, n) + '…' : s); };
const table = (heads, rows) =>
  '<div class="tablewrap"><table class="fv-t"><thead><tr>' +
  heads.map((h) => '<th>' + esc(h) + '</th>').join('') + '</tr></thead><tbody>' +
  rows.map((r) => '<tr>' + r.map((c) => '<td>' + c + '</td>').join('') + '</tr>').join('') +
  '</tbody></table></div>';

/** Files the shell must not fetch as text; it links or embeds them instead. */
export function binaryKind(name) {
  if (/\.(png|jpe?g|gif|webp|svg)$/i.test(name)) return 'image';
  if (/\.pdf$/i.test(name)) return 'pdf';
  return null;
}

/** Which view a book artefact deserves; null means the document views decide. */
export function bookViewOf(name, base) {
  if (name === 'book.json') return 'bookmeta';
  if (name === 'build.json') return 'buildmeta';
  /* a book graph's index is the chapter list, not a document's section list */
  if (name === 'index.json' && /(^|\/)graph$/.test(String(base || ''))) return 'bookindex';
  if (name.endsWith('.py')) return 'python';
  if (name.endsWith('.html')) return 'htmlsrc';
  return binaryKind(name);
}

/** Python, lightly tinted: comments, strings, keywords. */
export function rawPyHtml(text) {
  const re = /#[^\n]*|'''[\s\S]*?'''|"""[\s\S]*?"""|'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|\b(?:def|class|import|from|return|if|elif|else|for|while|with|as|in|not|and|or|is|None|True|False|try|except|raise|lambda|yield|global|pass|assert)\b/g;
  let out = '', last = 0, m;
  const s = String(text);
  while ((m = re.exec(s))) {
    out += esc(s.slice(last, m.index));
    const t = m[0];
    if (t[0] === '#') out += '<span class="fv-com">' + esc(t) + '</span>';
    else if ("'\"".includes(t[0])) out += '<span class="fv-str">' + esc(t) + '</span>';
    else out += '<span class="fv-kw">' + esc(t) + '</span>';
    last = m.index + t.length;
  }
  return '<pre class="fv-raw">' + out + esc(s.slice(last)) + '</pre>';
}

/** The data-driven view for one book artefact. @returns HTML, or null. */
export function buildBookView(view, d) {
  if (view === 'bookmeta') {
    const ch = d.content_hashes || {};
    return '<p><b>' + esc(d.title) + '</b> &middot; <b>' + esc(d.version) + '</b> &middot; ' +
      esc(d.status) + ' &middot; ' + d.chapters + ' chapters &middot; ' + d.words +
      ' words &middot; ' + d.pdf_pages + 'pp' +
      (d.former_versions && d.former_versions.length
        ? ' &middot; was ' + d.former_versions.map(esc).join(', ') : '') + '</p>' +
      '<p class="small dim">' + esc(d.versioning || '') + '</p>' +
      '<h4>the changelog: two clocks, paired</h4>' +
      table(['book', 'shipped in', 'why it moved'], (d.changelog || []).map((c) => [
        '<b>' + esc(c.version) + '</b>',
        '<a href="../../../admin/versions.html"><code>' + esc(c.site) + '</code></a>',
        esc(c.note)])) +
      '<h4>chapter hashes: what the version gate reads</h4>' +
      table(['chapter', 'sha-256'], Object.keys(ch).map((k) => [
        '<code>' + esc(k) + '</code>', '<code class="dim">' + esc(String(ch[k]).slice(0, 24)) + '…</code>'])) +
      '<p class="small dim">Written by <code>admin/build/gen_bookmeta.py</code>, the file\'s only writer. ' +
      'A changed hash without a changed version fails the build.</p>';
  }
  if (view === 'buildmeta') {
    return '<p class="small">What the book\'s own <code>build.py</code> recorded on its last run. ' +
      '<code>gen_bookmeta.py</code> folds this into <code>book.json</code>; nothing else writes it.</p>' +
      table(['key', 'value'], Object.keys(d).map((k) => [
        '<code>' + esc(k) + '</code>', cut(typeof d[k] === 'object' ? JSON.stringify(d[k]) : d[k], 120)]));
  }
  if (view === 'bookindex') {
    const t = d.totals || {};
    return '<p><b>' + esc(d.title) + '</b> at <b>' + esc(d.book_version) + '</b> &middot; ladder ' +
      (d.ladder || []).map((x) => '<code>' + esc(x) + '</code>').join(' &rarr; ') + '</p>' +
      '<p class="small">' + Object.keys(t).map((k) => k + ' <b>' + t[k] + '</b>').join(' &middot; ') + '</p>' +
      table(['#', 'chapter', 'sections', 'blocks', 'words', 'forms', 'uids', 'graph'],
        (d.chapters || []).map((c) => [
          String(c.n), cut(c.title, 46), String(c.sections), String(c.blocks),
          String(c.words), String(c.forms), String(c.uids),
          '<code>' + esc(c.stem) + '/</code>'])) +
      '<p class="small dim">' + esc(d.note || '') + '</p>';
  }
  return null;
}
