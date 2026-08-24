/* @module universe/components/uni-graph
   Single responsibility: the local graph as a custom element: the cytoscape
   instance, its options strip, the node-pack sources (doc tree, family peaks,
   derived links), the explore-from-selection view with its degree stepper and
   stats bar, paths-to-peaks, preset views, maximise, and the focus ring.
   Visibility flows through one pipeline so the shared kind toggles, the packs
   and the explore filter always compose. Renders from properties and emits;
   it never reaches into services or the reader's state.
   Light DOM; the host is display:contents so layout CSS is untouched.
   @fires uni:node-tap  detail {id, label}  a node was tapped
   @fires uni:gpref     detail {key, value}  a persistable graph pref changed
   @fires uni:clear-request  the user asked to clear the selection
*/
'use strict';
import { graphStyle, layoutOptions } from '../core/cystyle.js';
import { docTreeElements, DOC_ROOT_ID } from '../core/doctree.js';
import { familyPeakElements, derivedConceptEdges } from '../core/packs.js';
import { NODE_KINDS } from '../core/kinds.js';
import { neighbourhoodIds, nextDegree } from '../core/explore.js';
import { PRESET_VIEWS } from '../core/views.js';
import { STRIP_HTML, reflectStrip, renderStats } from './graph-strip.js';
import { focusNode, applyPaths } from './graph-fx.js';

/** The toggles that change what is visible and so need a refresh. */
const VIS_TOGGLES = ['gtree', 'gpeaks', 'gderived', 'gexp'];

export class UniGraph extends HTMLElement {
  connectedCallback() {
    this.innerHTML =
      '<div class="uni-graphbox">' +
      '  <button class="uni-gcog" title="Graph options">&#9881;</button>' +
      '  <button class="uni-gbig" data-gmax="1" title="Maximise the graph">&#x26F6;</button>' +
      '  <div class="uni-gopts" hidden>' + STRIP_HTML + '</div>' +
      '  <div class="uni-cy" id="uni-cy"></div>' +
      '  <div class="uni-gstats" id="uni-gstats"></div>' +
      '</div>';
    this._gopts = this.querySelector('.uni-gopts');
    this.addEventListener('click', this);
    this.addEventListener('input', this);
  }

  /**
   * Create the cytoscape instance and apply the persisted look.
   * @param {{title, taxonomy, anchors, elements}} data - the page's blob
   * @param {{glay, gsize, gboxed, gtree, gpeaks, gderived, gexp, gdeg, gpaths, glen, gpull, kinds}} prefs
   */
  init(data, prefs) {
    this._data = data;
    this._p = Object.assign({ labels: true }, prefs);
    this._kinds = prefs.kinds || null;
    this._kindsKey = (this._kinds || []).slice().sort().join(' ');
    this._treeEles = null; this._peakEles = null; this._derivedEles = null;
    this._selected = null;
    this._fitted = false;
    this.cy = window.cytoscape({
      container: this.querySelector('#uni-cy'),
      elements: data.elements,
      layout: layoutOptions('cose', { len: this._p.glen, pull: this._p.gpull }),
      style: graphStyle(),
    });
    this.cy.on('tap', 'node', (evt) => {
      this.dispatchEvent(new CustomEvent('uni:node-tap',
        { bubbles: true, detail: { id: evt.target.id(), label: evt.target.data('label') } }));
    });
    this.querySelector('#uni-glen').value = this._p.glen;
    this.querySelector('#uni-gpull').value = this._p.gpull;
    this._refreshVisibility();
    this._applyLook();
    if (this._p.glay !== 'cose' || VIS_TOGGLES.some((k) => this._p[k])) this.runLayout();
  }

  /** One delegated handler for the options strip. */
  handleEvent(e) {
    const p = this._p;
    if (e.type === 'input') {
      p.glen = parseInt(this.querySelector('#uni-glen').value, 10);
      p.gpull = parseInt(this.querySelector('#uni-gpull').value, 10);
      this._emitPref('glen', p.glen); this._emitPref('gpull', p.gpull);
      /* live: re-run the layout as the slider moves, one run per frame */
      if (p.glay === 'cose' && !this._liveT) {
        this._liveT = requestAnimationFrame(() => { this._liveT = 0; this.runLayout(); });
      }
      return;
    }
    const b = e.target.closest('button');
    if (!b) return;
    if (b.classList.contains('uni-gcog')) { this._gopts.hidden = !this._gopts.hidden; return; }
    if (b.hasAttribute('data-gmax')) {
      const box = this.querySelector('.uni-graphbox').classList.toggle('uni-gmax');
      this.cy.resize(); this.cy.fit(this.cy.elements().not('.uni-hide'), 24);
      b.title = box ? 'Back to the panel' : 'Maximise the graph';
      return;
    }
    if (b.hasAttribute('data-gview')) { this._applyView(b.getAttribute('data-gview')); return; }
    if (b.hasAttribute('data-gdegdn') || b.hasAttribute('data-gdegup') || b.hasAttribute('data-gdegmax')) {
      p.gdeg = nextDegree(p.gdeg,
        b.hasAttribute('data-gdegmax') ? 'max' : b.hasAttribute('data-gdegup') ? 'up' : 'down');
      this._emitPref('gdeg', p.gdeg); this.refresh();
      return;
    }
    if (b.hasAttribute('data-glay')) { p.glay = b.getAttribute('data-glay'); this._emitPref('glay', p.glay); this._applyLook(); this.runLayout(); }
    if (b.hasAttribute('data-gsize')) { p.gsize = b.getAttribute('data-gsize'); this._emitPref('gsize', p.gsize); this._applyLook(); }
    if (b.hasAttribute('data-glabels')) { p.labels = !p.labels; this._applyLook(); }
    if (b.hasAttribute('data-gboxed')) { p.gboxed = !p.gboxed; this._emitPref('gboxed', p.gboxed ? 1 : 0); this._applyLook(); }
    VIS_TOGGLES.forEach((k) => {
      if (!b.hasAttribute('data-' + k)) return;
      p[k] = !p[k]; this._emitPref(k, p[k] ? 1 : 0); this.refresh();
    });
    if (b.hasAttribute('data-gpaths')) { p.gpaths = !p.gpaths; this._emitPref('gpaths', p.gpaths ? 1 : 0); this._applyLook(); this._applyPaths(); }
    if (b.hasAttribute('data-gfit')) this.cy.fit(this.cy.elements().not('.uni-hide'), 24);
    if (b.hasAttribute('data-gclear')) this.dispatchEvent(new CustomEvent('uni:clear-request', { bubbles: true }));
  }

  /** Apply a preset view: a named preference bundle, then one refresh. */
  _applyView(key) {
    const v = PRESET_VIEWS.find((x) => x.key === key);
    if (!v) return;
    Object.assign(this._p, v.prefs);
    Object.keys(v.prefs).forEach((k) => {
      const val = v.prefs[k];
      this._emitPref(k, typeof val === 'boolean' ? (val ? 1 : 0) : val);
    });
    this.refresh();
  }

  _emitPref(key, value) {
    this.dispatchEvent(new CustomEvent('uni:gpref', { bubbles: true, detail: { key, value } }));
  }

  _applyLook() {
    const p = this._p;
    this.cy.nodes().toggleClass('uni-nolabel', !p.labels);
    this.cy.elements().toggleClass('uni-szm', p.gsize === 'm').toggleClass('uni-szl', p.gsize === 'l');
    this.cy.nodes().not('[family = "peak"]').toggleClass('uni-boxed', p.gboxed);
    reflectStrip(this._gopts, p);
  }

  /** The shared kind toggles: node families off here mirror marks off in the
      source pane. Only re-filters when the set actually changed. */
  applyKinds(kinds) {
    const key = (kinds || []).slice().sort().join(' ');
    if (key === this._kindsKey) return;
    this._kindsKey = key;
    this._kinds = kinds;
    if (this.cy) this.refresh();
  }

  /** Recompute visibility, look and layout in one pass. */
  refresh() { this._refreshVisibility(); this._applyLook(); this.runLayout(); }

  /* The one visibility pipeline: materialise the enabled node packs, hide the
     disabled ones and the toggled-off families, then the explore filter, the
     paths and the stats over what remains. */
  _refreshVisibility() {
    const cy = this.cy, p = this._p;
    if (p.gtree && !this._treeEles) {
      this._treeEles = cy.add(docTreeElements(this._data.title, this._data.taxonomy,
        this._data.anchors, (aid) => cy.$id(aid).nonempty()));
    }
    if (p.gpeaks && !this._peakEles) this._peakEles = cy.add(familyPeakElements(this._data.elements));
    if (p.gderived && !this._derivedEles) this._derivedEles = cy.add(derivedConceptEdges(this._data.elements));
    cy.elements().removeClass('uni-hide');
    if (this._treeEles && !p.gtree) this._treeEles.addClass('uni-hide');
    if (this._peakEles && !p.gpeaks) this._peakEles.addClass('uni-hide');
    if (this._derivedEles && !p.gderived) this._derivedEles.addClass('uni-hide');
    if (this._kinds) {
      NODE_KINDS.filter((k) => this._kinds.indexOf(k) === -1)
        .forEach((k) => cy.nodes('[family = "' + k + '"]').addClass('uni-hide'));
    }
    /* everything still visible is the explore walk's universe; remember it so
       the stats can price the next hop before the reader pays for it */
    const base = cy.elements().not('.uni-hide');
    this._visData = base.map((x) => x.data());
    if (p.gexp && this._selected && cy.$id(this._selected).nonempty()
        && !cy.$id(this._selected).hasClass('uni-hide')) {
      const deg = p.gdeg === 'max' ? Infinity : p.gdeg;
      const keep = neighbourhoodIds(this._visData, this._selected, deg);
      base.filter((x) => !keep.has(x.id())).addClass('uni-hide');
    }
    this._applyPaths();
    this._renderStats();
  }

  /* The stats bar: what the current view holds, and what one more degree of
     separation would add — the choose-a-path-before-walking-it affordance. */
  _renderStats() {
    renderStats(this.querySelector('#uni-gstats'),
      this.cy.elements().not('.uni-hide').map((x) => x.data()),
      this._visData, this._p, this._selected);
  }

  _applyPaths() { applyPaths(this.cy, this._p.gpaths, this._selected); }

  /** The reader keeps the element informed of the one selection; the explore
      view, the paths and a tree layout follow it without re-asking. */
  set selected(aid) {
    if (this._selected === aid) return;
    this._selected = aid;
    if (!this.cy) return;
    if (this._p.gexp) this.refresh(); else { this._applyPaths(); this._renderStats(); }
  }
  get selected() { return this._selected; }

  /** Focus one node: ring it, dim the rest, centre it. */
  focus(id, tempo) { focusNode(this.cy, id, tempo); }

  /** Drop the focus ring and dimming. */
  clearFocus() { if (this.cy) this.cy.elements().removeClass('uni-focus uni-dim'); }

  /** Re-run the current layout over the visible elements. */
  runLayout() {
    const p = this._p;
    const vis = this.cy.elements().not('.uni-hide');
    let roots;
    if (p.gtree || p.gpeaks) {
      const tops = vis.nodes('[family = "docroot"], [family = "peak"]');
      if (tops.length) roots = tops;
    } else if (this._selected && this.cy.$id(this._selected).nonempty()) {
      roots = this.cy.$id(this._selected);
    }
    vis.layout(layoutOptions(p.glay, { len: p.glen, pull: p.gpull }, roots)).run();
    this.cy.fit(vis, 24);
  }

  /** Move the canvas between the panel and the inline fallback container. */
  mountTo(target) {
    if (target && this.cy && this.cy.container() !== target) this.cy.mount(target);
  }

  /** Resize, and fit once the canvas first has real size (the founder's
      fit-on-open: the panel is sized after init, so init cannot fit). */
  resize() {
    if (!this.cy) return;
    this.cy.resize();
    if (!this._fitted && this.cy.width() > 0 && this.cy.height() > 0) {
      this._fitted = true;
      this.cy.fit(this.cy.elements().not('.uni-hide'), 24);
    }
  }
}

customElements.define('uni-graph', UniGraph);
export { DOC_ROOT_ID };
