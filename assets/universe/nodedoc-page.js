/* @module universe/nodedoc-page
   Single responsibility: the document-from-a-node page's shell. Fetches the
   chosen document's extraction and cross-references, composes the model in the
   pure core, and renders it. Every sentence shown is a verbatim quote or a
   projection of the anchored data; the connecting prose is deliberately absent
   (that is the later, LLM phase of brief 24). */
'use strict';
import { composeNodeDoc, nodeRichness } from './core/nodedoc.js';
import { escAttr } from './core/markup.js';

const q = new URLSearchParams(location.search);
const DOC = q.get('doc') || 'thinking-in-graphs';
const NODE = q.get('node');
const mount = document.getElementById('ndoc');
if (mount) boot();

function boot() {
  Promise.all([
    fetch('docs/' + encodeURIComponent(DOC) + '/extraction.json').then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }),
    fetch('docs/' + encodeURIComponent(DOC) + '/crossrefs.json').then((r) => (r.ok ? r.json() : { refs: [] })),
  ]).then(([ex, refs]) => {
    mount.innerHTML = NODE ? renderDoc(ex, refs) : renderPicker(ex);
    mount.addEventListener('click', (e) => {
      const p = e.target.closest('.ndoc-print');
      if (p) { e.preventDefault(); window.print(); }
    });
  }).catch(() => {
    mount.innerHTML = '<p class="dim">Could not load the extraction for &ldquo;' + escAttr(DOC) +
      '&rdquo; &mdash; only extracted documents can grow node documents.</p>';
  });
}

const chip = (family) => '<span class="ndoc-fam ndoc-f-' + escAttr(family) + '">' + escAttr(family) + '</span>';
const anchorLine = (a) => !a ? '' :
  '<div class="ndoc-anchor">&sect; ' + escAttr(a.section) + '<blockquote>&ldquo;' + escAttr(a.quote) + '&rdquo;</blockquote></div>';

function section(head, note, items) {
  if (!items.length) return '';
  return '<h2>' + head + ' <span class="dim small">(' + items.length + ')</span></h2>' +
    '<p class="dim small">' + note + '</p>' + items.join('');
}

function renderDoc(ex, refs) {
  const m = composeNodeDoc(ex, refs, NODE);
  if (!m) return '<p class="dim">No node &ldquo;' + escAttr(NODE) + '&rdquo; in this extraction. <a href="node-doc.html">Pick one</a>.</p>';
  const n = m.node;
  const rel = (r) => '<div class="ndoc-item">' + chip('edge') + ' <b>' + escAttr(n.label) + '</b> &mdash; <i>' +
    escAttr(r.verb) + '</i> &rarr; <b>' + escAttr(r.other) + '</b>' + anchorLine(r.anchor) + '</div>';
  const relIn = (r) => '<div class="ndoc-item">' + chip('edge') + ' <b>' + escAttr(r.other) + '</b> &mdash; <i>' +
    escAttr(r.verb) + '</i> &rarr; <b>' + escAttr(n.label) + '</b>' + anchorLine(r.anchor) + '</div>';
  const nodeItem = (x) => '<div class="ndoc-item">' + chip(x.family) + ' <b>' + escAttr(x.label) + '</b>' +
    (x.statement ? '<div>' + escAttr(x.statement) + '</div>' : '') + anchorLine(x.anchor) + '</div>';
  /* the page's own heading becomes the node: one h1, retitled */
  document.querySelector('main.doc h1').innerHTML = chip(n.family) + ' ' + escAttr(n.label);
  document.title = n.label + ' — the document of one node — graphs.sgit.ai';
  const h = [];
  h.push('<div class="crumbline"><a href="node-doc.html">&larr; every node</a> &middot; ' +
    '<a href="' + escAttr(DOC) + '.html#n-' + escAttr(n.id) + '">open in the reader</a> &middot; ' +
    '<a href="docs/' + escAttr(DOC) + '/index.html">the document folder</a> &middot; ' +
    '<a class="ndoc-print" href="#">print</a></div>');
  h.push('<p class="lead">The document of one node, grown programmatically from <em>' + escAttr(m.doc.title) +
    '</em>: everything the anchored extraction verifiably holds about it, and nothing else. ' +
    'No prose here is authored; every quote is at its recorded bytes in the frozen source.</p>');
  if (n.statement) h.push('<p><b>' + escAttr(n.statement) + '</b></p>');
  h.push(anchorLine(n.anchor));
  h.push(section('Claims about it', 'What this document claims where this node is a subject.', m.claimsAbout.map(nodeItem)));
  h.push(section('It is about', 'The concepts this node is recorded as being about.', m.isAbout.map(nodeItem)));
  h.push(section('It asserts', 'Directional relationships this node carries outward, each with its own verb.', m.asserts.map(rel)));
  h.push(section('Asserted of it', 'Directional relationships arriving at this node.', m.assertedBy.map(relIn)));
  h.push(section('Demonstrated by', 'Worked examples the document offers for this node.', m.demonstratedBy.map(nodeItem)));
  h.push(section('It demonstrates', 'What this example is recorded as demonstrating.', m.demonstrates.map(nodeItem)));
  h.push(section('Also called', 'Names the document itself uses for the same thing.', m.aliases.map((a) =>
    '<div class="ndoc-item">' + chip('alias') + ' <b>' + escAttr(a.a) + '</b> &harr; <b>' + escAttr(a.b) + '</b>' + anchorLine(a.anchor) + '</div>')));
  h.push(section('Near, but not', 'What the document explicitly says this node is not.', m.nearButNot.map((x) =>
    '<div class="ndoc-item">' + chip('nbn') + ' not <b>' + escAttr(x.not) + '</b>' + anchorLine(x.anchor) + '</div>')));
  h.push(section('Weakly linked (derived)', 'Concepts co-claimed with it by the same claim: measured, never asserted.', m.derived.map((d) =>
    '<div class="ndoc-item">' + chip('derived') + ' <b>' + escAttr(d.other) + '</b> <span class="dim">&times;' + d.count + '</span></div>')));
  h.push(section('Used across the estate', 'Cross-references naming this node, each rated against the usage maturity model.', m.crossrefs.map((r) =>
    '<div class="ndoc-item">' + chip('ref') + ' <b>' + escAttr(r.where) + '</b> &mdash; ' + escAttr(r.how) +
    ' &middot; rated <b class="rate-' + escAttr(r.rating) + '">' + escAttr(r.rating) + '</b>' +
    (r.note ? '<div class="dim small">' + escAttr(r.note) + '</div>' : '') + '</div>')));
  if (m.degrees.length) {
    const row = (d) => {
      const part = (o) => Object.keys(o).sort().map((k) => o[k] + ' ' + escAttr(k)).join(' · ') || '&mdash;';
      return '<tr><td>' + d.degree + '</td><td>' + part(d.added.nodes) + '</td><td>' + part(d.added.edges) + '</td></tr>';
    };
    h.push('<h2>How far it reaches</h2><p class="dim small">What each degree of separation adds around this node: the memo’s measure of how rich the concept is.</p>' +
      '<div class="tablewrap"><table><thead><tr><th>Degree</th><th>Nodes added</th><th>Edges added</th></tr></thead><tbody>' +
      m.degrees.map(row).join('') + '</tbody></table></div>');
  }
  return h.join('\n');
}

function renderPicker(ex) {
  const ranked = nodeRichness(ex);
  const h = ['<p class="lead">Pick a node and read the document that grows from it. The order below is the richness order: how many verifiable links each node carries in <em>' + escAttr(ex.doc.title) + '</em>. A rich node makes pages; a thin one makes a paragraph, and that difference is a finding.</p>'];
  h.push('<div class="tablewrap"><table><thead><tr><th>Node</th><th>Family</th><th>Links</th></tr></thead><tbody>');
  ranked.forEach((r) => {
    h.push('<tr><td><a href="node-doc.html?node=' + encodeURIComponent(r.id) + '"><b>' + escAttr(r.label) + '</b></a></td>' +
      '<td>' + chip(r.family) + '</td><td>' + r.links + '</td></tr>');
  });
  h.push('</tbody></table></div>');
  return h.join('\n');
}
