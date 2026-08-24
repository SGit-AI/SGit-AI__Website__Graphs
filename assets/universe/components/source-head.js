/* @module universe/components/source-head
   Single responsibility: the source pane's head — its markup, the kind bar's
   buttons and the location trail's rendering. A part of <uni-source>: the
   element owns the behaviour and the state, this owns what the head shows. */
'use strict';
import { KINDS } from '../core/kinds.js';

/** The pane head: mode switch, title, stepper, raw link, trail, kind bar. */
export const SRC_HEAD_HTML =
  '<div class="uni-srchead">' +
  '  <span class="uni-mode"><button id="uni-msrc" class="on">source</button><button id="uni-mdata">data</button></span>' +
  '  <b id="uni-panetitle">The frozen source</b>' +
  '  <span class="uni-step">' +
  '    <button id="uni-prev" title="Previous highlighted anchor">&#8249;</button>' +
  '    <span class="cnt" id="uni-cnt">&ndash;</span>' +
  '    <button id="uni-next" title="Next highlighted anchor">&#8250;</button>' +
  '  </span>' +
  '  <a class="dim" id="uni-rawlink">raw</a>' +
  '  <div class="uni-trail" id="uni-trail"><span class="dim">every highlight sits on gate-verified bytes</span></div>' +
  '  <div class="uni-kbar" id="uni-kbar"></div>' +
  '</div>';

/**
 * The kind bar's buttons, one per kind present in the document.
 * @param {Object<string, number>} counts - anchors per kind
 * @returns {string} the buttons' HTML
 */
export function kindBarHTML(counts) {
  return KINDS.filter((k) => counts[k[0]]).map((k) =>
    '<button class="uni-kb-' + k[0] + '" data-kbar="' + k[0] + '" ' +
    'title="Show or hide the ' + k[1] + ' links, here and in the graph">' +
    k[1] + ' <span>' + counts[k[0]] + '</span></button>').join('');
}

/**
 * Render the clickable heading chain into the trail element.
 * @param {Element} el - the trail container
 * @param {Array<{el: Element}>} heads - the pane's headings
 * @param {number[]} chain - indices into heads, outermost first
 * @param {function(Element): void} onGo - called with the heading to scroll to
 */
export function renderTrail(el, heads, chain, onGo) {
  el.textContent = '';
  if (!chain.length) {
    const s = document.createElement('span');
    s.className = 'dim'; s.textContent = 'top of the document';
    el.appendChild(s);
    return;
  }
  chain.forEach((idx, k) => {
    if (k) {
      const sep = document.createElement('span');
      sep.className = 'crumbsep'; sep.textContent = '›';
      el.appendChild(sep);
    }
    const a = document.createElement('a');
    a.textContent = heads[idx].el.textContent;
    a.addEventListener('click', () => onGo(heads[idx].el));
    el.appendChild(a);
  });
}
