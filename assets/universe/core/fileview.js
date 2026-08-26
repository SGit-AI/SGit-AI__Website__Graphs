/* @module universe/core/fileview
   Single responsibility: the file explorer's pure logic (v0.5.1) — classify a
   document artefact, colorize its raw text (minimal formatting: colours and
   alignment, nothing clever), and build the data-driven view each known file
   deserves. Pure: strings and parsed JSON in, HTML strings out; no DOM, no
   fetch. The shell decides what to show; this decides what it looks like. */
'use strict';

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g,
  (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** Which data view a file deserves, by its name; null means raw only. */
export function viewOf(name) {
  if (name === 'extraction.json') return 'extraction';
  if (name === 'ids.json') return 'ledger';
  if (name === 'crossrefs.json') return 'crossrefs';
  if (name === 'tokens.json') return 'tokens';
  if (name === 'words.json') return 'words';
  if (name === 'fmt.json') return 'fmt';
  if (name === 'index.json') return 'coreindex';
  if (/^sec-\d+\.json$/.test(name)) return 'shard';
  if (name.endsWith('.md')) return 'rendered';
  return null;
}

/** Raw JSON, pretty-printed and colorized; falls back to plain on bad JSON. */
export function rawJsonHtml(text) {
  let obj;
  try { obj = JSON.parse(text); } catch (e) { return '<pre class="fv-raw">' + esc(text) + '</pre>'; }
  const pretty = JSON.stringify(obj, null, 1);
  const re = /"(?:[^"\\]|\\.)*"(\s*:)?|-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b|\btrue\b|\bfalse\b|\bnull\b/g;
  let out = '', last = 0, m;
  while ((m = re.exec(pretty))) {
    out += esc(pretty.slice(last, m.index));
    const t = m[0];
    if (t[0] === '"') {
      const key = !!m[1];
      const body = key ? t.slice(0, t.length - m[1].length) : t;
      out += '<span class="' + (key ? 'fv-key' : 'fv-str') + '">' + esc(body) + '</span>' + (key ? m[1] : '');
    } else if (t === 'true' || t === 'false' || t === 'null') {
      out += '<span class="fv-kw">' + t + '</span>';
    } else out += '<span class="fv-num">' + t + '</span>';
    last = m.index + t.length;
  }
  return '<pre class="fv-raw">' + out + esc(pretty.slice(last)) + '</pre>';
}

/** Raw markdown, line-tinted: headings, fences, quotes, list markers. */
export function rawMdHtml(text) {
  let fence = false;
  const lines = String(text).split('\n').map((ln) => {
    if (ln.trim().startsWith('```')) { fence = !fence; return '<span class="fv-fence">' + esc(ln) + '</span>'; }
    if (fence) return '<span class="fv-code">' + esc(ln) + '</span>';
    if (/^#{1,6}\s/.test(ln)) return '<span class="fv-h">' + esc(ln) + '</span>';
    if (/^>\s?/.test(ln)) return '<span class="fv-q">' + esc(ln) + '</span>';
    const li = ln.match(/^(\s*(?:[-*+]|\d+\.)\s)(.*)$/);
    if (li) return '<span class="fv-li">' + esc(li[1]) + '</span>' + esc(li[2]);
    return esc(ln);
  });
  return '<pre class="fv-raw">' + lines.join('\n') + '</pre>';
}

const table = (heads, rows) =>
  '<div class="tablewrap"><table class="fv-t"><thead><tr>' +
  heads.map((h) => '<th>' + esc(h) + '</th>').join('') + '</tr></thead><tbody>' +
  rows.map((r) => '<tr>' + r.map((c) => '<td>' + c + '</td>').join('') + '</tr>').join('') +
  '</tbody></table></div>';
const chip = (f) => '<span class="ndoc-fam ndoc-f-' + esc(f) + '">' + esc(f) + '</span>';
const cut = (s, n) => { s = String(s == null ? '' : s); return esc(s.length > n ? s.slice(0, n) + '…' : s); };

/** The data-driven view for one known file. @returns HTML, or null if unknown. */
export function buildView(view, d) {
  if (view === 'extraction') {
    const fams = {};
    d.nodes.forEach((n) => { fams[n.family] = (fams[n.family] || 0) + 1; });
    return '<p class="small">' + Object.keys(fams).sort().map((f) => chip(f) + ' ' + fams[f]).join(' · ') +
      ' · <b>' + d.edges.length + '</b> asserted edges</p>' +
      table(['family', 'id', 'label', 'statement', 'anchor §'], d.nodes.map((n) => [
        chip(n.family), '<code>' + esc(n.id) + '</code>', esc(n.label),
        cut(n.statement, 110), cut(n.anchor && n.anchor.section, 40)])) +
      '<h4>edges</h4>' + table(['from', 'verb', 'to'], d.edges.map((e) => [
        '<code>' + esc(e.from) + '</code>', '<i>' + esc(e.verb) + '</i>', '<code>' + esc(e.to) + '</code>']));
  }
  if (view === 'ledger') {
    const live = d.ids.filter((e) => e.status === 'live');
    return '<p class="small">prefix <code>' + esc(d.prefix) + '</code> · minted ' +
      Object.keys(d.minted).map((k) => k + esc(d.minted[k])).join(' / ') + ' · <b>' + live.length +
      '</b> live, ' + (d.ids.length - live.length) + ' retired · identities survive rename, edit and move</p>' +
      table(['uid', 'level', 'status', 'locator (may move)'], d.ids.map((e) => [
        '<code>' + esc(e.uid) + '</code>', esc(e.level),
        e.status === 'live' ? 'live' : '<span class="dim">retired</span>', cut(e.locator, 70)]));
  }
  if (view === 'crossrefs') {
    return '<p class="small">' + esc(d.note || '') + '</p>' +
      table(['use', 'where', 'rating', 'how', 'concepts used'], d.refs.map((r) => [
        '<b>' + esc(r.id) + '</b>', '<code>' + esc(r.where) + '</code>', esc(r.rating),
        esc(r.how), (r.what || []).map((w) => '<code>' + esc(w) + '</code>').join(' ')]));
  }
  if (view === 'tokens') {
    const s = d.stats;
    const top = d.forms.slice(0, 40);
    const max = top.length ? top[0].count : 1;
    return '<p class="small"><b>' + s.instances + '</b> words · <b>' + s.forms + '</b> forms · ' +
      Object.keys(s.by_class).map((c) => c + ' ' + s.by_class[c]).join(' · ') +
      ' · padding ' + Math.round(s.padding_share * 100) + '% of use · ' + s.hapax + ' used once</p>' +
      top.map((f) => '<div class="fv-bar"><span class="fv-barlab ctc-' + esc(f.class) + '">' + esc(f.form) +
        '</span><i style="width:' + Math.max(2, Math.round(100 * f.count / max)) + '%"></i><b>' + f.count +
        (f.spread >= 0.9 && f.count >= 10 ? ' ◊' : '') + '</b></div>').join('') +
      '<p class="small dim">top 40 of ' + d.forms.length + ' · ◊ marks different-meanings candidates</p>';
  }
  if (view === 'words') {
    return table(['form', 'count', 'first instance'], d.forms.slice(0, 60).map((f) => [
      esc(f.form), String(f.count), '<code>' + cut(f.instances[0], 60) + '</code>'])) +
      '<p class="small dim">top 60 of ' + d.forms.length + '</p>';
  }
  if (view === 'fmt') {
    const c = { h: 0, g: 0, b: 0 };
    d.pieces.forEach((p) => { c[p.h != null ? 'h' : p.g != null ? 'g' : 'b']++; });
    return '<p>The formatting graph: <b>' + c.h + '</b> heading lines, <b>' + c.g +
      '</b> whitespace gaps and <b>' + c.b + '</b> block references, in document order. ' +
      'Concatenating the pieces (blocks resolved through the map below) rebuilds the source markdown ' +
      '<b>byte-for-byte</b> — gate 5 fails the build otherwise, and gate 6 proves the semantic shards ' +
      're-derive from this file alone.</p>' +
      table(['block', 'raw head'], Object.keys(d.blocks).slice(0, 30).map((k) => [
        '<code>' + cut(k, 44) + '</code>', cut(d.blocks[k], 90)])) +
      '<p class="small dim">first 30 of ' + Object.keys(d.blocks).length + ' blocks</p>';
  }
  if (view === 'coreindex') {
    return '<p class="small">' + Object.keys(d.totals).map((k) => k + ' <b>' + d.totals[k] + '</b>').join(' · ') + '</p>' +
      table(['uid', 'section', 'level', 'blocks', 'sentences', 'words', 'shard'], d.sections.map((s) => [
        '<code>' + esc(s.uid || '') + '</code>', cut(s.title, 48), String(s.level),
        String(s.counts.blocks), String(s.counts.sentences), String(s.counts.words),
        s.shard ? '<code>' + esc(s.shard) + '</code>' : '<span class="dim">—</span>']));
  }
  if (view === 'shard') {
    return '<p class="small">the blocks of <code>' + esc(d.sec) + '</code></p>' +
      table(['uid', 'kind', 'sentences', 'words', 'text'], d.blocks.map((b) => [
        '<code>' + esc(b.uid || '') + '</code>', esc(b.kind),
        String((b.sentences || []).length),
        String((b.sentences || []).reduce((a, s) => a + s.words.length, 0)),
        cut(b.text, 100)]));
  }
  return null;
}
