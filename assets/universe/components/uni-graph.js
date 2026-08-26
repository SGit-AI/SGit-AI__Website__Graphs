/* @module universe/components/uni-graph
   Single responsibility: the local graph as a custom element: the cytoscape
   instance, its options strip, the node-pack sources (document, doc tree,
   family peaks, derived links, the schema), the explore view with its degree
   stepper and stats bar, paths-to-peaks, presets, maximise with its node
   inspector, slotted pinning with the peak board, the stable-add principle
   (brief 26: a node already on canvas never moves when the view changes),
   and the focus ring. Visibility flows through one pipeline so every filter
   composes. Renders from properties and emits; the add-on surfaces (board,
   inspector) live in parts so the core element stays legible.
   Light DOM; the host is display:contents so layout CSS is untouched.
   @fires uni:node-tap  detail {id, label}  a node was tapped
   @fires uni:gpref     detail {key, value}  a persistable graph pref changed
   @fires uni:gmax      detail {on}  the maximised state changed
   @fires uni:clear-request  the user asked to clear the selection
*/
'use strict';
import { graphStyle, layoutOptions } from '../core/cystyle.js';
import { docTreeElements, DOC_ROOT_ID } from '../core/doctree.js';
import { familyPeakElements, derivedConceptEdges, derivedGroupPeaks } from '../core/packs.js';
import { schemaElements } from '../core/schema.js';
import { alignmentElements, railPositions, familyRailElements, familyRailPositions }
  from '../core/align.js';
import { defaultAssignments } from '../core/slots.js';
import { NODE_KINDS } from '../core/kinds.js';
import { neighbourhoodIds, nextDegree } from '../core/explore.js';
import { STRIP_HTML, reflectStrip, renderStats, applyPresetView } from './graph-strip.js';
import { focusNode, applyPaths, layoutRoots, runPinnedLayout, runStableLayout,
  summitAssignments } from './graph-fx.js';
import { inspectInit, inspectNode, inspectLegend, inspectHop, inspectTrailStart }
  from './graph-inspect.js';
import { toggleBoard } from './pin-board.js';
import { toggleTrailBoard } from './trail-board.js';
import { toggleCoreTree } from './core-tree.js';
import { inspectCoreRecord } from './graph-inspect.js';

/** The visibility toggles; gdoc makes the document a source like any other,
    so all sources off means an empty canvas; gschema shows only the schema. */
const VIS_TOGGLES = ['gdoc', 'gtree', 'gpeaks', 'gderived', 'gschema', 'gexp'];

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
   * @param {{title, taxonomy, anchors, elements, extraction}} data - the page's blob
   * @param {object} prefs - the persisted graph preferences (see the reader)
   */
  init(data, prefs) {
    this._data = data;
    this._p = Object.assign({ labels: true, gstable: true }, prefs);
    this._kinds = prefs.kinds || null;
    this._kindsKey = (this._kinds || []).slice().sort().join(' ');
    this._treeEles = null; this._peakEles = null; this._derivedEles = null;
    this._schemaEles = null; this._alignEles = null; this._famRailEles = null;
    this._pins = prefs.gslots || null;   /* board or chat assignments, else summits */
    this._selected = null;
    this._fitted = false;
    this._shownIds = null;
    this.cy = window.cytoscape({
      container: this.querySelector('#uni-cy'),
      elements: data.elements,
      layout: layoutOptions('cose', { len: this._p.glen, pull: this._p.gpull }),
      style: graphStyle(),
    });
    this._baseEles = this.cy.elements();
    this._inspect = inspectInit(this);
    this.cy.on('tap', 'node', (evt) => {
      inspectTrailStart(this._inspect, evt.target.data());
      inspectNode(this._inspect, this._data, evt.target.data());
      this.dispatchEvent(new CustomEvent('uni:node-tap',
        { bubbles: true, detail: { id: evt.target.id(), label: evt.target.data('label') } }));
    });
    this.querySelector('#uni-glen').value = this._p.glen;
    this.querySelector('#uni-gpull').value = this._p.gpull;
    this._refreshVisibility();
    this._applyLook();
    if (this._p.glay !== 'cose' || this._p.gpin || this._p.galign
        || VIS_TOGGLES.some((k) => (k === 'gdoc' ? !this._p[k] : this._p[k]))) this.runLayout(true);
    /* a default boot skips runLayout, so seed the stable-add baseline here */
    if (!this._shownIds) {
      this._shownIds = new Set(this.cy.elements().not('.uni-hide').nodes().map((n) => n.id()));
    }
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
        this._liveT = requestAnimationFrame(() => { this._liveT = 0; this.runLayout(true); });
      }
      return;
    }
    const gl = e.target.closest('[data-golink]');
    if (gl) {
      /* following a link: the hop joins the path trail, the inspector moves
         to the other node, and the reader selects it everywhere */
      const id = gl.getAttribute('data-golink');
      const n = this.cy.$id(id);
      if (n.empty()) return;
      inspectHop(this._inspect, gl.getAttribute('data-verb'), n.data());
      inspectNode(this._inspect, this._data, n.data());
      this.dispatchEvent(new CustomEvent('uni:node-tap',
        { bubbles: true, detail: { id, label: n.data('label') } }));
      return;
    }
    if (e.target.closest('[data-trailedit]')) { toggleTrailBoard(this, this._inspect); return; }
    if (e.target.closest('[data-trailclear]')) { inspectTrailStart(this._inspect, null); return; }
    const ln = e.target.closest('[data-leg-node]');
    if (ln) { this._legendToggle(ln.getAttribute('data-leg-node')); return; }
    const le = e.target.closest('[data-leg-edge]');
    if (le) {
      const k = le.getAttribute('data-leg-edge');
      this._edgeOff = this._edgeOff || new Set();
      if (this._edgeOff.has(k)) this._edgeOff.delete(k); else this._edgeOff.add(k);
      this.refresh();
      return;
    }
    const b = e.target.closest('button');
    if (!b) return;
    if (b.classList.contains('uni-gcog')) { this._gopts.hidden = !this._gopts.hidden; return; }
    if (b.hasAttribute('data-gtab')) {
      this._p.gtab = b.getAttribute('data-gtab');
      this._emitPref('gtab', this._p.gtab); this._applyLook(); return;
    }
    if (b.hasAttribute('data-gcore')) { toggleCoreTree(this, this._coreOpts); return; }
    if (b.hasAttribute('data-gmax')) {
      const on = this.querySelector('.uni-graphbox').classList.toggle('uni-gmax');
      /* the reader hides the page chrome (nav, splitters) while maximised */
      this.dispatchEvent(new CustomEvent('uni:gmax', { bubbles: true, detail: { on } }));
      this.cy.resize(); this.cy.fit(this.cy.elements().not('.uni-hide'), 24);
      b.title = on ? 'Back to the panel' : 'Maximise the graph';
      return;
    }
    if (b.hasAttribute('data-gview')) {
      if (applyPresetView(this, p, b.getAttribute('data-gview'))) this.refresh(true);
      return;
    }
    if (b.hasAttribute('data-gdegdn') || b.hasAttribute('data-gdegup') || b.hasAttribute('data-gdegmax')) {
      p.gdeg = nextDegree(p.gdeg,
        b.hasAttribute('data-gdegmax') ? 'max' : b.hasAttribute('data-gdegup') ? 'up' : 'down');
      this._emitPref('gdeg', p.gdeg); this.refresh();
      return;
    }
    if (b.hasAttribute('data-glay')) { p.glay = b.getAttribute('data-glay'); this._emitPref('glay', p.glay); this._applyLook(); this.runLayout(true); }
    if (b.hasAttribute('data-gsize')) { p.gsize = b.getAttribute('data-gsize'); this._emitPref('gsize', p.gsize); this._applyLook(); }
    if (b.hasAttribute('data-glabels')) { p.labels = !p.labels; this._applyLook(); }
    if (b.hasAttribute('data-gboxed')) { p.gboxed = !p.gboxed; this._emitPref('gboxed', p.gboxed ? 1 : 0); this._applyLook(); }
    if (b.hasAttribute('data-galign')) {
      p.galign = !p.galign; this._emitPref('galign', p.galign ? 1 : 0);
      /* rails need something to align: the doc tree's levels or the families */
      if (p.galign && !p.gtree && !p.gpeaks) { p.gtree = true; this._emitPref('gtree', 1); }
      this.refresh(true);   /* aligning IS a re-arrangement ask */
      return;
    }
    if (b.hasAttribute('data-galshow')) {
      p.galshow = !p.galshow; this._emitPref('galshow', p.galshow ? 1 : 0);
      this._applyLook(); return;
    }
    VIS_TOGGLES.forEach((k) => {
      if (!b.hasAttribute('data-' + k)) return;
      p[k] = !p[k]; this._emitPref(k, p[k] ? 1 : 0); this.refresh();
    });
    if (b.hasAttribute('data-gstable')) { p.gstable = !p.gstable; this._emitPref('gstable', p.gstable ? 1 : 0); this._applyLook(); }
    if (b.hasAttribute('data-gboard')) { toggleBoard(this); return; }
    if (b.hasAttribute('data-gpin')) {
      p.gpin = !p.gpin; this._pinAuto = false; this._emitPref('gpin', p.gpin ? 1 : 0);
      if (p.gpin) this._pinPlaced = false;   /* pin-on re-places the slots */
      this._applyLook(); this.runLayout(true);
    }
    if (b.hasAttribute('data-gpaths')) { p.gpaths = !p.gpaths; this._emitPref('gpaths', p.gpaths ? 1 : 0); this._applyLook(); this._applyPaths(); }
    if (b.hasAttribute('data-gfit')) this.cy.fit(this.cy.elements().not('.uni-hide'), 24);
    if (b.hasAttribute('data-gclear')) this.dispatchEvent(new CustomEvent('uni:clear-request', { bubbles: true }));
  }

  _emitPref(key, value) {
    this.dispatchEvent(new CustomEvent('uni:gpref', { bubbles: true, detail: { key, value } }));
  }

  /** A legend node-type row: extraction families toggle the shared kinds (the
      reader persists and mirrors the source pane); synthetic families toggle
      their own source. */
  _legendToggle(fam) {
    const strip = { peak: '[data-gpeaks]', dgroup: '[data-gderived]', section: '[data-gtree]',
      docroot: '[data-gtree]', rail: '[data-galign]', schema: '[data-gschema]' };
    if (strip[fam]) {
      const b = this.querySelector(strip[fam]);
      if (b) b.click();
      return;
    }
    const set = new Set(this._kinds || NODE_KINDS);
    if (set.has(fam)) set.delete(fam); else set.add(fam);
    this.dispatchEvent(new CustomEvent('uni:pref',
      { bubbles: true, detail: { key: 'kinds', value: Array.from(set) } }));
  }

  _applyLook() {
    const p = this._p;
    this.cy.nodes().toggleClass('uni-nolabel', !p.labels);
    this.cy.elements().toggleClass('uni-szm', p.gsize === 'm').toggleClass('uni-szl', p.gsize === 'l');
    this.cy.nodes().not('[family = "peak"]').toggleClass('uni-boxed', p.gboxed);
    if (this._alignEles) this._alignEles.toggleClass('uni-alshow', !!p.galshow);
    if (this._famRailEles) this._famRailEles.toggleClass('uni-alshow', !!p.galshow);
    reflectStrip(this._gopts, p);
  }

  /** The shared kind toggles: node families off here mirror marks off in the
      source pane. Only re-filters when the set actually changed. */
  applyKinds(kinds) {
    const key = (kinds || []).slice().sort().join(' ');
    if (key === this._kindsKey) return;
    this._kindsKey = key; this._kinds = kinds;
    if (this.cy) this.refresh();
  }

  /** Recompute visibility, look and layout in one pass. */
  refresh(full) { this._refreshVisibility(); this._applyLook(); this.runLayout(full); }

  /* The one visibility pipeline: materialise the enabled node packs, hide the
     disabled ones and the toggled-off families (the schema view is exclusive:
     just the types and how they connect), then the explore filter, the paths,
     the stats and the inspector legend over what remains. */
  _refreshVisibility() {
    const cy = this.cy, p = this._p;
    if (p.gtree && !this._treeEles) {
      this._treeEles = cy.add(docTreeElements(this._data.title, this._data.taxonomy,
        this._data.anchors, (aid) => cy.$id(aid).nonempty()));
    }
    if (p.gpeaks && !this._peakEles) this._peakEles = cy.add(familyPeakElements(this._data.elements));
    if (p.gderived && !this._derivedEles) this._derivedEles = cy.add(
      derivedConceptEdges(this._data.elements).concat(derivedGroupPeaks(this._data.elements)));
    if (p.galign && this._treeEles && !this._alignEles) {
      this._alignEles = cy.add(alignmentElements(this._data.taxonomy));
      const rp = railPositions(this._alignEles.nodes().map((n) => n.data('level')).sort((a, b) => a - b));
      this._alignEles.nodes().forEach((n) => { n.position(rp[n.id()]); n.lock(); });
    }
    if (p.galign && p.gpeaks && !this._famRailEles) {
      this._famRailEles = cy.add(familyRailElements(this._data.elements, NODE_KINDS));
      const fp = familyRailPositions(this._famRailEles.nodes().map((n) => n.id()));
      this._famRailEles.nodes().forEach((n) => { n.position(fp[n.id()]); n.lock(); });
    }
    /* the schema is rebuilt from the CURRENT sources on every refresh, so the
       source toggles are its subset selector (the founder's ask) */
    if (this._schemaEles) { cy.remove(this._schemaEles); this._schemaEles = null; }
    cy.elements().removeClass('uni-hide');
    if (!p.gdoc) this._baseEles.addClass('uni-hide');
    if (this._treeEles && !p.gtree) this._treeEles.addClass('uni-hide');
    if (this._peakEles && !p.gpeaks) this._peakEles.addClass('uni-hide');
    if (this._derivedEles && !p.gderived) this._derivedEles.addClass('uni-hide');
    if (this._alignEles && !(p.galign && p.gtree)) this._alignEles.addClass('uni-hide');
    if (this._famRailEles && !(p.galign && p.gpeaks)) this._famRailEles.addClass('uni-hide');
    if (this._kinds && !p.gschema) {
      NODE_KINDS.filter((k) => this._kinds.indexOf(k) === -1)
        .forEach((k) => cy.nodes('[family = "' + k + '"]').addClass('uni-hide'));
    }
    if (p.gschema) {
      const defs = cy.elements().not('.uni-hide').map((x) => ({ data: x.data() }));
      cy.elements().addClass('uni-hide');
      this._schemaEles = cy.add(schemaElements(defs, this._data.verbs));
    }
    if (this._edgeOff && this._edgeOff.size) {
      this._edgeOff.forEach((k) => cy.edges('[kind = "' + k + '"]').addClass('uni-hide'));
    }
    /* what remains is the explore walk's universe; the rails and their ties
       are layout physics, so they join neither the walk nor the counts */
    const base = cy.elements().not('.uni-hide');
    this._visData = base.filter((x) => x.data('kind') !== 'align' && x.data('family') !== 'rail')
      .map((x) => x.data());
    if (p.gexp && this._selected && cy.$id(this._selected).nonempty()
        && !cy.$id(this._selected).hasClass('uni-hide')) {
      const deg = p.gdeg === 'max' ? Infinity : p.gdeg;
      const keep = neighbourhoodIds(this._visData, this._selected, deg);
      base.filter((x) => !keep.has(x.id())).addClass('uni-hide');
    }
    this._applyPaths();
    this._renderStats();
  }

  /* The stats bar and the inspector's type legend, over the visible view
     (minus the rails and their ties, which are physics, not content). */
  _renderStats() {
    const shown = this.cy.elements().not('.uni-hide')
      .filter((x) => x.data('kind') !== 'align' && x.data('family') !== 'rail')
      .map((x) => x.data());
    renderStats(this.querySelector('#uni-gstats'), shown, this._visData, this._p, this._selected);
    inspectLegend(this._inspect, shown, this._edgeOff);
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

  /** Light every path a query matched (teal); null clears. */
  showMatches(paths) {
    const cy = this.cy;
    cy.elements().removeClass('uni-qmatch');
    (paths || []).forEach((p) => p.forEach((id, i) => {
      cy.$id(id).addClass('uni-qmatch');
      if (i) cy.$id(p[i - 1]).edgesWith(cy.$id(id)).addClass('uni-qmatch');
    }));
  }

  /** The inspector's container: where the reader mounts the blast-radius
      mini graph, beside the details the inspector already renders. */
  get inspectorEl() { return this._inspect.el; }

  /** Where the core tree finds its data: { base } (the doc's core folder). */
  set coreOptions(opts) { this._coreOpts = opts; }

  /** Select id if the canvas has it; the core tree lights the nearest level. */
  trySelect(id) {
    if (!this.cy || this.cy.$id(id).empty()) return false;
    this.selected = id;
    return true;
  }

  /** Everything the core model knows about one node, into the inspector. */
  inspectCore(payload) { inspectCoreRecord(this._inspect, payload); }

  /** Drop the focus ring and dimming. */
  clearFocus() { if (this.cy) this.cy.elements().removeClass('uni-focus uni-dim'); }

  /** Custom pin stacks (the page API, data down): left ids stack on the left
      band, right ids on the right; held through EVERY layout run; null clears
      back to the summit defaults. Kept for the chat's pin_nodes binding. */
  setCustomPins(left, right) {
    const has = (left && left.length) || (right && right.length);
    this.setPinAssignments(has ? defaultAssignments(left || [], right || []) : null);
  }
  get customPins() { return this._pins; }

  /** Slotted pin assignments (the peak board, data down): id -> {area, slot}
      across the four border bands. Replaces summit defaults while set. */
  setPinAssignments(assignments) {
    this._pins = assignments && Object.keys(assignments).length ? assignments : null;
    this._pinPlaced = false;
    this._emitPref('gslots', this._pins ? JSON.stringify(this._pins) : '');
    /* assignments imply pinning; clearing undoes a pin-on the assignment forced */
    if (this._pins && !this._p.gpin) { this._p.gpin = true; this._pinAuto = true; this._emitPref('gpin', 1); this._applyLook(); }
    else if (!this._pins && this._pinAuto) { this._p.gpin = false; this._pinAuto = false; this._emitPref('gpin', 0); this._applyLook(); }
    this.runLayout(true);
  }
  get pinAssignments() { return this._pins || summitAssignments(this.cy.elements().not('.uni-hide')); }

  /** Re-run the layout. Stable-add (brief 26) governs implicit re-runs: what
      was on canvas holds still while newcomers settle, and the viewport stays
      put. An explicit ask (layout button, slider, pins, presets) passes full
      and lays out everything. Pins are held locked through every run. */
  runLayout(full) {
    const p = this._p, cy = this.cy;
    const vis = cy.elements().not('.uni-hide');
    /* the rails steer only the physics: a hierarchy layout must not traverse
       their ties, and the schema view is rebuilt fresh so it lays out fully */
    const eles = p.glay === 'cose' ? vis
      : vis.not('node[family = "rail"]').not('edge[kind = "align"]');
    if (p.gschema) full = true;
    const opts = layoutOptions(p.glay, { len: p.glen, pull: p.gpull },
      layoutRoots(cy, vis, p, this._selected));
    let mode = 'full';
    if (p.gstable && !full && this._shownIds) mode = runStableLayout(cy, eles, opts, this._shownIds);
    if (mode === 'full' || mode === 'first') {
      if (p.gpin) {
        runPinnedLayout(cy, eles, opts, !this._pinPlaced, this._pins || summitAssignments(vis));
        this._pinPlaced = true;
      } else eles.layout(opts).run();
      cy.fit(eles, 24);
    }
    this._shownIds = new Set(vis.nodes().map((n) => n.id()));
  }

  /** The pane- and tool-facing state: prefs, sources, selection, filters and
      visible counts, one truth for the state pane and window.__uniState. */
  get snapshot() {
    const p = this._p;
    return {
      prefs: { glay: p.glay, gsize: p.gsize, boxed: !!p.gboxed, labels: !!p.labels,
        stable: !!p.gstable, pin: !!p.gpin, paths: !!p.gpaths,
        exp: !!p.gexp, deg: p.gdeg, glen: p.glen, gpull: p.gpull },
      sources: { doc: !!p.gdoc, tree: !!p.gtree, peaks: !!p.gpeaks,
        derived: !!p.gderived, align: !!p.galign, schema: !!p.gschema },
      selected: this._selected,
      edgesOff: this._edgeOff ? Array.from(this._edgeOff) : [],
      visible: this.cy ? { nodes: this.cy.nodes().not('.uni-hide').length,
        edges: this.cy.edges().not('.uni-hide').length } : null,
    };
  }

  /** Move the canvas between the panel and the inline fallback container. */
  mountTo(target) {
    if (target && this.cy && this.cy.container() !== target) this.cy.mount(target);
  }

  /** Resize, and fit once the canvas first has real size (fit-on-open:
      the panel is sized after init, so init cannot fit). */
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
