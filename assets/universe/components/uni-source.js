/* @module universe/components/uni-source
   Single responsibility: the source pane: the rendered frozen document with its
   gate-verified highlights, the raw-extraction data mode, the location trail and
   the anchor stepper. Renders from properties, scrolls only itself, and emits;
   selection state belongs to the reader.
   Light DOM; the host is display:contents so layout CSS is untouched.
   @fires uni:mark-click   detail {aid}  a highlight or data item was clicked
   @fires uni:step-select  detail {aid}  the stepper moved to an anchor
   @fires uni:need-panel   the pane needs the panel opened to show something
*/
'use strict';
import { elementarySegments } from '../core/segments.js';
import { spliceMarkers, tokensToMarks, escAttr } from '../core/markup.js';
import { headingChain } from '../core/doctree.js';

export class UniSource extends HTMLElement {
  connectedCallback() {
    this.innerHTML =
      '<div class="uni-srcbox">' +
      '  <div class="uni-srchead">' +
      '    <span class="uni-mode"><button id="uni-msrc" class="on">source</button><button id="uni-mdata">data</button></span>' +
      '    <b id="uni-panetitle">The frozen source</b>' +
      '    <span class="uni-step">' +
      '      <button id="uni-prev" title="Previous highlighted anchor">&#8249;</button>' +
      '      <span class="cnt" id="uni-cnt">&ndash;</span>' +
      '      <button id="uni-next" title="Next highlighted anchor">&#8250;</button>' +
      '    </span>' +
      '    <a class="dim" id="uni-rawlink">raw</a>' +
      '    <div class="uni-trail" id="uni-trail"><span class="dim">every highlight sits on gate-verified bytes</span></div>' +
      '  </div>' +
      '  <div class="uni-srcbody mdread" id="uni-src"><p class="dim">Loading the frozen source…</p></div>' +
      '  <div class="uni-srcbody" id="uni-data" style="display:none"><p class="dim">Loading the extraction…</p></div>' +
      '</div>';
    this._box = this.querySelector('.uni-srcbox');
    this._src = this.querySelector('#uni-src');
    this._dataBody = this.querySelector('#uni-data');
    this._trail = this.querySelector('#uni-trail');
    this.addEventListener('click', this);
    this._box.addEventListener('scroll', () => {
      if (this._trailPending) return;
      this._trailPending = true;
      requestAnimationFrame(() => { this._trailPending = false; this.updateTrail(); });
    });
  }

  /**
   * Wire the pane to a document and start loading it.
   * @param {object} U - the page's UNIVERSE blob
   * @param {{mode: string, scrollTo: function(Element, Element): void}} opts -
   *   the persisted mode and the reader's tempo-aware pane scroller
   */
  init(U, opts) {
    this._U = U;
    this._scrollTo = opts.scrollTo;
    this._mode = 'source';
    this._dataBuilt = false;
    this._navList = [];
    this._navIdx = -1;
    this._heads = [];
    this._kindOf = {};
    U.anchors.forEach((a) => { this._kindOf[a.aid] = a.kind; });
    this.querySelector('#uni-rawlink').href = U.source;
    this._load();
    if (opts.mode === 'data') this.setMode('data');
  }

  /** One delegated handler for the whole pane. */
  handleEvent(e) {
    const t = e.target;
    if (t.id === 'uni-msrc') { this.setMode('source'); return; }
    if (t.id === 'uni-mdata') { this.setMode('data'); return; }
    if (t.id === 'uni-prev') { this._step(this._navIdx - 1); return; }
    if (t.id === 'uni-next') { this._step(this._navIdx <= -1 ? 0 : this._navIdx + 1); return; }
    const mk = t.closest('mark.uni-anchor');
    if (mk) {
      this.dispatchEvent(new CustomEvent('uni:mark-click',
        { bubbles: true, detail: { aid: mk.getAttribute('data-aids').split(' ')[0] } }));
      return;
    }
    const it = t.closest('.uni-jitem[data-aid]');
    if (it) {
      this.dispatchEvent(new CustomEvent('uni:mark-click',
        { bubbles: true, detail: { aid: it.getAttribute('data-aid') } }));
    }
  }

  /** Switch between the rendered source and the raw extraction data. */
  setMode(m) {
    this._mode = m;
    this._src.style.display = m === 'source' ? '' : 'none';
    this._dataBody.style.display = m === 'data' ? '' : 'none';
    this.querySelector('#uni-msrc').classList.toggle('on', m === 'source');
    this.querySelector('#uni-mdata').classList.toggle('on', m === 'data');
    this.querySelector('#uni-panetitle').textContent = m === 'source' ? 'The frozen source' : 'The extraction data';
    this._trail.style.display = m === 'source' ? '' : 'none';
    if (m === 'data') this._buildData();
    this.dispatchEvent(new CustomEvent('uni:pref', { bubbles: true, detail: { key: 'mode', value: m } }));
  }

  /** Scroll to and flash an anchor in whichever view is showing. */
  showAnchor(aid) {
    this.dispatchEvent(new CustomEvent('uni:need-panel', { bubbles: true }));
    if (this._mode === 'data') {
      this._buildData();
      const it = this._dataBody.querySelector('.uni-jitem[data-aid="' + aid + '"]');
      if (!it) return;
      this._scrollTo(it, this._box);
      it.classList.remove('uni-hit'); void it.offsetWidth; it.classList.add('uni-hit');
      return;
    }
    const marks = this._src.querySelectorAll('mark.uni-anchor[data-aids~="' + aid + '"]');
    if (!marks.length) return;
    this._scrollTo(marks[0], this._box);
    marks.forEach((m) => { m.classList.remove('uni-hit'); void m.offsetWidth; m.classList.add('uni-hit'); });
    this.updateTrail();
  }

  /** Apply the persistent selection classes in both views. */
  setSelected(aid) {
    this.querySelectorAll('.uni-sel').forEach((el) => el.classList.remove('uni-sel'));
    if (aid === null) return;
    this._src.querySelectorAll('mark.uni-anchor[data-aids~="' + aid + '"]')
      .forEach((m) => m.classList.add('uni-sel'));
    this._dataBody.querySelectorAll('.uni-jitem[data-aid="' + aid + '"]')
      .forEach((el) => el.classList.add('uni-sel'));
  }

  /** Recompute mark visibility and the stepper list from the enabled kinds. */
  applyKinds(enabledKinds) {
    this._enabled = enabledKinds;
    if (!this._src.querySelector('mark.uni-anchor')) return;
    const on = {};
    enabledKinds.forEach((k) => { on[k] = true; });
    this._src.querySelectorAll('mark.uni-anchor').forEach((m) => {
      const vis = m.getAttribute('data-aids').split(' ').some((aid) => on[this._kindOf[aid]]);
      m.classList.toggle('uni-vis', vis);
    });
    this._navList = this._U.anchors.filter((a) => on[a.kind])
      .sort((a, b) => a.chars[0] - b.chars[0]);
    this._navIdx = -1;
    this._counter();
  }

  _counter() {
    this.querySelector('#uni-cnt').textContent = this._navList.length
      ? ((this._navIdx >= 0 ? this._navIdx + 1 : '–') + ' / ' + this._navList.length) : '–';
  }

  _step(i) {
    if (!this._navList.length) return;
    this._navIdx = (i + this._navList.length) % this._navList.length;
    this._counter();
    this.dispatchEvent(new CustomEvent('uni:step-select',
      { bubbles: true, detail: { aid: this._navList[this._navIdx].aid } }));
  }

  /** The clickable heading path of the pane's current position. */
  updateTrail() {
    if (!this._heads.length) return;
    const boxTop = this._box.getBoundingClientRect().top + 70;
    let cur = null;
    for (let i = 0; i < this._heads.length; i++) {
      if (this._heads[i].el.getBoundingClientRect().top <= boxTop) cur = i; else break;
    }
    this._trail.textContent = '';
    const chain = headingChain(this._heads, cur);
    if (!chain.length) {
      const s = document.createElement('span');
      s.className = 'dim'; s.textContent = 'top of the document';
      this._trail.appendChild(s);
      return;
    }
    chain.forEach((idx, k) => {
      if (k) {
        const sep = document.createElement('span');
        sep.className = 'crumbsep'; sep.textContent = '›';
        this._trail.appendChild(sep);
      }
      const a = document.createElement('a');
      a.textContent = this._heads[idx].el.textContent;
      a.addEventListener('click', () => this._scrollTo(this._heads[idx].el, this._box));
      this._trail.appendChild(a);
    });
  }

  _load() {
    const U = this._U;
    fetch(U.source).then((r) => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.arrayBuffer();
    }).then((buf) => {
      const raw = new Uint8Array(buf);
      const segs = elementarySegments(U.anchors);
      const labels = {};
      U.anchors.forEach((a) => { labels[a.aid] = a.label; });
      const md = spliceMarkers(raw, segs, new TextDecoder());
      this._src.innerHTML = tokensToMarks(window.marked.parse(md), segs,
        (aid) => this._kindOf[aid], (aid) => labels[aid]);
      this._heads = Array.prototype.slice.call(this._src.querySelectorAll('h1,h2,h3,h4'))
        .map((h) => ({ el: h, level: Number(h.tagName[1]) }));
      this.updateTrail();
      if (this._enabled) this.applyKinds(this._enabled);
      this.dispatchEvent(new CustomEvent('uni:source-ready',
        { bubbles: true, detail: { anchors: U.anchors.length, spans: segs.length } }));
    }).catch(() => {
      this._src.textContent = '';
      const p = document.createElement('p');
      p.className = 'dim';
      p.append('Could not load the frozen source in-page — ');
      const a = document.createElement('a');
      a.href = U.source; a.textContent = 'open the raw markdown';
      p.append(a, ' instead.');
      this._src.appendChild(p);
    });
  }

  _buildData() {
    if (this._dataBuilt) return;
    this._dataBuilt = true;
    const U = this._U;
    fetch(U.extraction).then((r) => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then((ex) => {
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
      this._dataBody.innerHTML = h.join('');
      this.dispatchEvent(new CustomEvent('uni:data-ready', { bubbles: true }));
    }).catch(() => {
      this._dataBody.textContent = '';
      const p = document.createElement('p');
      p.className = 'dim';
      p.append('Could not load the extraction in-page — ');
      const a = document.createElement('a');
      a.href = U.extraction; a.textContent = 'open the raw file';
      p.append(a, ' instead.');
      this._dataBody.appendChild(p);
    });
  }

  get box() { return this._box; }
  get mode() { return this._mode; }
}

customElements.define('uni-source', UniSource);
