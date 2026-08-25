/* @module universe/components/graph-strip
   Single responsibility: the graph options strip's markup and its reflection
   from the preferences. A part of <uni-graph>: the element owns the behaviour,
   this owns what the strip looks like. */
'use strict';
import { PRESET_VIEWS } from '../core/views.js';
import { neighbourhoodIds, graphStats, statsText } from '../core/explore.js';

/** The strip: presets, layout, labels, physics, node-pack sources, view, explore. */
export const STRIP_HTML =
  '<div class="grow" data-g="views"><span class="glab">views</span>' +
  PRESET_VIEWS.map((v) => '  <button data-gview="' + v.key + '">' + v.label + '</button>').join('') +
  '</div>' +
  '<div class="grow" data-g="layout"><span class="glab">layout</span>' +
  '  <button data-glay="cose">cose</button><button data-glay="concentric">rings</button>' +
  '  <button data-glay="grid">grid</button><button data-glay="tree">tree</button></div>' +
  '<div class="grow" data-g="labels"><span class="glab">labels</span>' +
  '  <button data-glabels="1">show</button>' +
  '  <button data-gsize="s">S</button><button data-gsize="m">M</button><button data-gsize="l">L</button>' +
  '  <button data-gboxed="1">boxed</button></div>' +
  '<div class="grow" data-g="physics"><span class="glab">physics</span>' +
  '  <span class="gval">string</span><input type="range" id="uni-glen" min="40" max="280" step="10">' +
  '  <span class="gval">pull</span><input type="range" id="uni-gpull" min="10" max="300" step="10">' +
  '  <span class="small dim">(cose)</span></div>' +
  '<div class="grow" data-g="sources"><span class="glab">sources</span>' +
  '  <button data-gdoc="1">document</button>' +
  '  <button data-gtree="1">doc tree</button>' +
  '  <button data-gpeaks="1">family peaks</button>' +
  '  <button data-gderived="1">derived links</button>' +
  '  <button data-galign="1" title="Rails that pull each heading level onto its own line">align</button>' +
  '  <button data-gschema="1">schema</button></div>' +
  '<div class="grow" data-g="explore"><span class="glab">explore</span>' +
  '  <button data-gexp="1">focus on selection</button>' +
  '  <span class="gval">grow</span>' +
  '  <button data-gdegdn="1">&minus;</button><span class="gdeg" id="uni-gdeg">1</span>' +
  '  <button data-gdegup="1">+</button>' +
  '  <button data-gdegmax="1">to peaks</button></div>' +
  '<div class="grow" data-g="view"><span class="glab">view</span>' +
  '  <button data-gstable="1" title="What is on canvas holds still while newcomers settle">stable add</button>' +
  '  <button data-gpin="1">pin peaks</button>' +
  '  <button data-gboard="1" title="Drag the peaks between the four border areas">peak board</button>' +
  '  <button data-galshow="1" title="Reveal the invisible alignment lines">align lines</button>' +
  '  <button data-gpaths="1">paths to peaks</button>' +
  '  <button data-gfit="1">fit</button>' +
  '  <button data-gclear="1">clear focus</button></div>';

/**
 * Apply a preset view: merge its preference bundle and emit each change so the
 * reader persists it. The element refreshes after; this only mutates and emits.
 * @param {Element} host - the <uni-graph> element (events bubble from it)
 * @param {object} prefs - the live preference object, mutated in place
 * @param {string} key - the preset's key
 * @returns {boolean} whether the key named a preset
 */
export function applyPresetView(host, prefs, key) {
  const v = PRESET_VIEWS.find((x) => x.key === key);
  if (!v) return false;
  Object.assign(prefs, v.prefs);
  Object.keys(v.prefs).forEach((k) => {
    const val = v.prefs[k];
    host.dispatchEvent(new CustomEvent('uni:gpref', { bubbles: true,
      detail: { key: k, value: typeof val === 'boolean' ? (val ? 1 : 0) : val } }));
  });
  return true;
}

/**
 * Reflect the preferences into the strip's pressed states.
 * @param {Element} root - the strip container
 * @param {object} p - the graph preferences
 */
export function reflectStrip(root, p) {
  root.querySelectorAll('[data-glay]').forEach((x) => x.classList.toggle('on', x.getAttribute('data-glay') === p.glay));
  root.querySelectorAll('[data-gsize]').forEach((x) => x.classList.toggle('on', x.getAttribute('data-gsize') === p.gsize));
  const flags = { glabels: p.labels, gboxed: p.gboxed, gdoc: p.gdoc, gtree: p.gtree,
    gpeaks: p.gpeaks, gderived: p.gderived, galign: p.galign, gschema: p.gschema,
    gexp: p.gexp, gpin: p.gpin, gstable: p.gstable, galshow: p.galshow,
    gpaths: p.gpaths, gdegmax: p.gdeg === 'max' };
  Object.keys(flags).forEach((k) => {
    root.querySelector('[data-' + k + ']').classList.toggle('on', !!flags[k]);
  });
  root.querySelector('#uni-gdeg').textContent = p.gdeg === 'max' ? '∞' : p.gdeg;
}

/**
 * The stats bar: what the current view holds and what the next hop would add.
 * @param {Element} el - the bar
 * @param {Array<object>} visData - data objects of the visible elements
 * @param {Array<object>|null} baseData - the explore walk's universe
 * @param {object} p - the graph preferences
 * @param {string|null} selected - the selected node id
 */
export function renderStats(el, visData, baseData, p, selected) {
  let t = statsText(graphStats(visData));
  if (p.gexp && selected && p.gdeg !== 'max' && baseData) {
    const cur = neighbourhoodIds(baseData, selected, p.gdeg);
    const nxt = neighbourhoodIds(baseData, selected, p.gdeg + 1);
    const added = baseData.filter((d) => nxt.has(d.id) && !cur.has(d.id));
    if (added.length) t += '   ·   next hop adds: ' + statsText(graphStats(added));
  }
  el.textContent = t;
}
