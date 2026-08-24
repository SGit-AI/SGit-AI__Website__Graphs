/* @module universe/components/source-data
   Single responsibility: the data view's markup — the extraction rendered item
   by item with the file links on top. A part of <uni-source>: the element owns
   the fetch and the events, this owns what the view looks like. */
'use strict';
import { escAttr } from '../core/markup.js';

/**
 * Build the data view's HTML from the extraction.
 * @param {{extraction: string, folder: string}} U - the page's UNIVERSE blob
 * @param {object} ex - the parsed extraction.json
 * @returns {string} the view's HTML
 */
export function buildDataHTML(U, ex) {
  const item = (aid, obj) =>
    '<div class="uni-jitem"' + (aid ? ' data-aid="' + escAttr(aid) + '" id="j-' + escAttr(aid) + '"' : '') +
    '><pre>' + escAttr(JSON.stringify(obj, null, 1)) + '</pre></div>';
  const h = ['<div class="uni-jlinks">The data this page is a projection of: ' +
    '<a href="' + escAttr(U.extraction) + '">extraction.json</a> · ' +
    '<a href="' + escAttr(U.folder) + 'crossrefs.json">crossrefs.json</a> · ' +
    '<a href="../usage-model.json">usage-model.json</a> · ' +
    '<a href="' + escAttr(U.folder) + 'index.html">the document folder</a></div>'];
  h.push('<div class="uni-jhead">doc</div>', item(null, ex.doc));
  h.push('<div class="uni-jhead">nodes (' + ex.nodes.length + ')</div>');
  ex.nodes.forEach((n) => h.push(item(n.id, n)));
  h.push('<div class="uni-jhead">edges (' + ex.edges.length + ')</div>');
  ex.edges.forEach((x, i) => h.push(item('edge-' + i, x)));
  h.push('<div class="uni-jhead">near_but_not (' + ex.near_but_not.length + ')</div>');
  ex.near_but_not.forEach((x, i) => h.push(item('nbn-' + i, x)));
  h.push('<div class="uni-jhead">aliases (' + ex.aliases.length + ')</div>');
  ex.aliases.forEach((x, i) => h.push(item('alias-' + i, x)));
  h.push('<div class="uni-jhead">empty_sections (' + (ex.empty_sections || []).length + ')</div>');
  (ex.empty_sections || []).forEach((x) => h.push(item(null, x)));
  return h.join('');
}
