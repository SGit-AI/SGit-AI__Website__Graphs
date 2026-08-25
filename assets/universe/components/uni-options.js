/* @module universe/components/uni-options
   Single responsibility: the reader options popover (scroll tempo, family
   highlighting, graph visibility). Renders from properties, persists nothing,
   and emits one event per change; the reader owns state and storage.
   Light DOM; the host is display:contents so layout CSS is untouched.
   @fires uni:pref  detail {key: 'scroll'|'kinds'|'graph', value}
*/
'use strict';
import { KINDS } from '../core/kinds.js';
export { KINDS };

export class UniOptions extends HTMLElement {
  connectedCallback() {
    this.innerHTML =
      '<span class="uni-optwrap"><button id="uni-tglopts" aria-pressed="false">&#9881; reader options</button>' +
      '<div class="uni-opts" id="uni-opts" hidden>' +
      '  <h5>Scrolling</h5>' +
      '  <label><input type="radio" name="uni-scroll" value="instant"> immediate</label>' +
      '  <label><input type="radio" name="uni-scroll" value="fast"> fast</label>' +
      '  <label><input type="radio" name="uni-scroll" value="smooth"> smooth</label>' +
      '  <h5>Highlight in the source <span class="uni-quick" id="uni-kall">all</span><span class="uni-quick" id="uni-knone">none</span></h5>' +
      '  <span id="uni-kboxes">' + KINDS.map(
        (k) => '<label><input type="checkbox" data-kind="' + k[0] + '"> ' + k[1] + '</label>'
      ).join('') + '</span>' +
      '  <h5>Panel</h5>' +
      '  <label><input type="checkbox" id="uni-graphchk"> show the graph</label>' +
      '  <label><input type="checkbox" id="uni-debugchk"> state pane (for narrated reviews and debugging)</label>' +
      '</div></span>';
    this._box = this.querySelector('#uni-opts');
    this.addEventListener('click', this);
    this.addEventListener('change', this);
    this._outside = (e) => {
      if (!this._box.hidden && !e.target.closest('.uni-optwrap')) this._box.hidden = true;
    };
    document.addEventListener('click', this._outside);
  }

  disconnectedCallback() {
    document.removeEventListener('click', this._outside);
  }

  /** One delegated handler for the whole popover. */
  handleEvent(e) {
    const t = e.target;
    if (e.type === 'click') {
      if (t.id === 'uni-tglopts') {
        this._box.hidden = !this._box.hidden;
        t.setAttribute('aria-pressed', String(!this._box.hidden));
      } else if (t.id === 'uni-kall') {
        this._emit('kinds', KINDS.map((k) => k[0]));
      } else if (t.id === 'uni-knone') {
        this._emit('kinds', []);
      }
      return;
    }
    if (t.name === 'uni-scroll') this._emit('scroll', t.value);
    else if (t.id === 'uni-graphchk') this._emit('graph', t.checked);
    else if (t.id === 'uni-debugchk') this._emit('debug', t.checked);
    else if (t.hasAttribute('data-kind')) {
      const set = new Set(this._kinds || []);
      if (t.checked) set.add(t.getAttribute('data-kind'));
      else set.delete(t.getAttribute('data-kind'));
      this._emit('kinds', Array.from(set));
    }
  }

  _emit(key, value) {
    this.dispatchEvent(new CustomEvent('uni:pref', { bubbles: true, detail: { key, value } }));
  }

  /**
   * Reflect the reader's state into the controls.
   * @param {{scroll: string, kinds: string[], graph: boolean}} state
   */
  reflect(state) {
    this._kinds = state.kinds;
    this.querySelectorAll('input[name="uni-scroll"]').forEach((r) => { r.checked = r.value === state.scroll; });
    this.querySelectorAll('input[data-kind]').forEach((c) => {
      c.checked = state.kinds.indexOf(c.getAttribute('data-kind')) !== -1;
    });
    this.querySelector('#uni-graphchk').checked = state.graph;
    this.querySelector('#uni-debugchk').checked = !!state.debug;
  }
}

customElements.define('uni-options', UniOptions);
