/* @module universe/components/uni-graph
   Single responsibility: the local graph as a custom element: the cytoscape
   instance, its options strip (layout, labels, physics, view), the document-tree
   overlay, subtree filtering and the focus ring. Renders from properties and
   emits; it never reaches into services or the reader's state.
   Light DOM; the host is display:contents so layout CSS is untouched.
   @fires uni:node-tap  detail {id}  a node was tapped
   @fires uni:gpref     detail {key, value}  a persistable graph pref changed
   @fires uni:clear-request  the user asked to clear the selection
*/
'use strict';
import { graphStyle, layoutOptions } from '../core/cystyle.js';
import { docTreeElements, DOC_ROOT_ID } from '../core/doctree.js';

export class UniGraph extends HTMLElement {
  connectedCallback() {
    this.innerHTML =
      '<div class="uni-graphbox">' +
      '  <button class="uni-gcog" title="Graph options">&#9881;</button>' +
      '  <div class="uni-gopts" hidden>' +
      '    <div class="grow"><span class="glab">layout</span>' +
      '      <button data-glay="cose">cose</button><button data-glay="concentric">rings</button>' +
      '      <button data-glay="grid">grid</button><button data-glay="tree">tree</button></div>' +
      '    <div class="grow"><span class="glab">labels</span>' +
      '      <button data-glabels="1">show</button>' +
      '      <button data-gsize="s">S</button><button data-gsize="m">M</button><button data-gsize="l">L</button>' +
      '      <button data-gboxed="1">boxed</button></div>' +
      '    <div class="grow"><span class="glab">physics</span>' +
      '      <span class="gval">string</span><input type="range" id="uni-glen" min="40" max="280" step="10">' +
      '      <span class="gval">pull</span><input type="range" id="uni-gpull" min="10" max="300" step="10">' +
      '      <span class="small dim">(cose)</span></div>' +
      '    <div class="grow"><span class="glab">view</span>' +
      '      <button data-gtree="1">doc tree</button>' +
      '      <button data-gsub="1">subtree only</button>' +
      '      <button data-gfit="1">fit</button>' +
      '      <button data-gclear="1">clear focus</button></div>' +
      '  </div>' +
      '  <div class="uni-cy" id="uni-cy"></div>' +
      '</div>';
    this._gopts = this.querySelector('.uni-gopts');
    this.addEventListener('click', this);
    this.addEventListener('input', this);
  }

  /**
   * Create the cytoscape instance and apply the persisted look.
   * @param {{title: string, taxonomy: Array, anchors: Array, elements: Array}} data
   * @param {{glay, gsize, gboxed, gtree, glen, gpull}} prefs
   */
  init(data, prefs) {
    this._data = data;
    this._p = Object.assign({ labels: true, gsub: false }, prefs);
    this._treeEles = null;
    this._selected = null;
    this.cy = window.cytoscape({
      container: this.querySelector('#uni-cy'),
      elements: data.elements,
      layout: layoutOptions('cose', { len: this._p.glen, pull: this._p.gpull }),
      style: graphStyle(),
    });
    this.cy.on('tap', 'node', (evt) => {
      this.dispatchEvent(new CustomEvent('uni:node-tap', { bubbles: true, detail: { id: evt.target.id() } }));
    });
    this.querySelector('#uni-glen').value = this._p.glen;
    this.querySelector('#uni-gpull').value = this._p.gpull;
    this._applyLook();
    this._applyTree();
    if (this._p.glay !== 'cose' || this._p.gtree) this.runLayout();
  }

  /** One delegated handler for the options strip. */
  handleEvent(e) {
    const p = this._p;
    if (e.type === 'input') {
      p.glen = parseInt(this.querySelector('#uni-glen').value, 10);
      p.gpull = parseInt(this.querySelector('#uni-gpull').value, 10);
      this._emitPref('glen', p.glen); this._emitPref('gpull', p.gpull);
      clearTimeout(this._slideT);
      this._slideT = setTimeout(() => { if (p.glay === 'cose') this.runLayout(); }, 250);
      return;
    }
    const b = e.target.closest('button');
    if (!b) return;
    if (b.classList.contains('uni-gcog')) { this._gopts.hidden = !this._gopts.hidden; return; }
    if (b.hasAttribute('data-glay')) { p.glay = b.getAttribute('data-glay'); this._emitPref('glay', p.glay); this._applyLook(); this.runLayout(); }
    if (b.hasAttribute('data-gsize')) { p.gsize = b.getAttribute('data-gsize'); this._emitPref('gsize', p.gsize); this._applyLook(); }
    if (b.hasAttribute('data-glabels')) { p.labels = !p.labels; this._applyLook(); }
    if (b.hasAttribute('data-gboxed')) { p.gboxed = !p.gboxed; this._emitPref('gboxed', p.gboxed ? 1 : 0); this._applyLook(); }
    if (b.hasAttribute('data-gtree')) {
      p.gtree = !p.gtree; this._emitPref('gtree', p.gtree ? 1 : 0);
      this._applyLook(); this._applyTree(); this.applySubtree(this._selected);
      if (!p.gsub) this.runLayout();
    }
    if (b.hasAttribute('data-gsub')) {
      p.gsub = !p.gsub; this._applyLook(); this.applySubtree(this._selected);
      if (!p.gsub) this.runLayout();
    }
    if (b.hasAttribute('data-gfit')) this.cy.fit(this.cy.elements().not('.uni-hide'), 24);
    if (b.hasAttribute('data-gclear')) this.dispatchEvent(new CustomEvent('uni:clear-request', { bubbles: true }));
  }

  _emitPref(key, value) {
    this.dispatchEvent(new CustomEvent('uni:gpref', { bubbles: true, detail: { key, value } }));
  }

  _applyLook() {
    const p = this._p;
    this.cy.nodes().toggleClass('uni-nolabel', !p.labels);
    this.cy.elements().toggleClass('uni-szm', p.gsize === 'm').toggleClass('uni-szl', p.gsize === 'l');
    this.cy.nodes().toggleClass('uni-boxed', p.gboxed);
    this._gopts.querySelectorAll('[data-glay]').forEach((x) => x.classList.toggle('on', x.getAttribute('data-glay') === p.glay));
    this._gopts.querySelectorAll('[data-gsize]').forEach((x) => x.classList.toggle('on', x.getAttribute('data-gsize') === p.gsize));
    this._gopts.querySelector('[data-glabels]').classList.toggle('on', p.labels);
    this._gopts.querySelector('[data-gboxed]').classList.toggle('on', p.gboxed);
    this._gopts.querySelector('[data-gtree]').classList.toggle('on', p.gtree);
    this._gopts.querySelector('[data-gsub]').classList.toggle('on', p.gsub);
  }

  _applyTree() {
    if (this._p.gtree) {
      if (!this._treeEles) {
        this._treeEles = this.cy.add(docTreeElements(
          this._data.title, this._data.taxonomy, this._data.anchors,
          (aid) => this.cy.$id(aid).nonempty()));
      }
      this._treeEles.removeClass('uni-hide');
    } else if (this._treeEles) {
      this._treeEles.addClass('uni-hide');
    }
  }

  /**
   * Subtree-only filtering from the selection. Containment is traversed DOWNWARD
   * only: climbing up would reach the document root and re-include everything.
   * Note: incomers() with an edge selector returns edges WITHOUT their source
   * nodes, so the sources are collected explicitly or the walk stalls.
   * @param {string|null} selectedAid
   */
  applySubtree(selectedAid) {
    this._selected = selectedAid;
    const cy = this.cy;
    cy.elements().removeClass('uni-hide');
    this._applyTree();
    if (!this._p.gsub || !selectedAid || cy.$id(selectedAid).empty()) return;
    let keep = cy.collection().union(cy.$id(selectedAid));
    let frontier = keep;
    while (frontier.length) {
      const inEdges = frontier.incomers('edge[kind = "about"], edge[kind = "demonstrates"]');
      const next = frontier.outgoers().union(inEdges).union(inEdges.sources()).difference(keep);
      keep = keep.union(next);
      frontier = next.nodes();
    }
    cy.elements().difference(keep).addClass('uni-hide');
    this.runLayout();
  }

  /** The reader keeps the element informed of the one selection, so a later
      subtree toggle or tree layout has its root without re-asking. */
  set selected(aid) { this._selected = aid; }
  get selected() { return this._selected; }

  /** Whether subtree-only mode is active. */
  get subtreeOn() { return this._p.gsub; }
  /** Exit subtree mode without a layout run (the caller decides). */
  exitSubtree() { this._p.gsub = false; this._applyLook(); this.applySubtree(null); this.runLayout(); }

  /** Focus one node: ring it, dim the rest, centre it. */
  focus(id, tempo) {
    const cy = this.cy;
    const node = cy.$id(id);
    cy.elements().removeClass('uni-focus uni-dim');
    if (node.empty()) return;
    cy.elements().addClass('uni-dim');
    node.closedNeighborhood().removeClass('uni-dim');
    node.addClass('uni-focus');
    cy.animate({ center: { eles: node } },
      { duration: tempo === 'smooth' ? 350 : tempo === 'fast' ? 140 : 0 });
  }

  /** Drop the focus ring and dimming. */
  clearFocus() { if (this.cy) this.cy.elements().removeClass('uni-focus uni-dim'); }

  /** Re-run the current layout over the visible elements. */
  runLayout() {
    const p = this._p;
    const vis = this.cy.elements().not('.uni-hide');
    const roots = p.gtree ? 'node[family = "docroot"]'
      : (this._selected && this.cy.$id(this._selected).nonempty() ? this.cy.$id(this._selected) : undefined);
    vis.layout(layoutOptions(p.glay, { len: p.glen, pull: p.gpull }, roots)).run();
    this.cy.fit(vis, 24);
  }

  /** Move the canvas between the panel and the inline fallback container. */
  mountTo(target) {
    if (target && this.cy && this.cy.container() !== target) this.cy.mount(target);
  }

  resize() { if (this.cy) this.cy.resize(); }
}

customElements.define('uni-graph', UniGraph);
export { DOC_ROOT_ID };
