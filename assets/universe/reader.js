/* @module universe/reader
   Single responsibility: the reader shell. Builds the two-pane layout, owns the
   preferences and the one selection, wires the components together (data down
   as properties and method calls, events up as uni:* CustomEvents), and does
   the window-side scrolling. All rendering lives in the components; all pure
   logic lives in core/. */
'use strict';
import { allKinds } from './core/kinds.js';
import './components/uni-options.js';
import './components/uni-graph.js';
import './components/uni-source.js';
import { initStatePane } from './components/state-pane.js';

const U = window.UNIVERSE;
if (U && window.cytoscape) boot();

function boot() {
  const WIDE = matchMedia('(min-width: 1100px)');
  const LS = 'uni:' + U.slug + ':';
  const pref = (k, d) => { try { const v = localStorage.getItem(LS + k); return v === null ? d : v; } catch (e) { return d; } };
  const setPref = (k, v) => { try { localStorage.setItem(LS + k, String(v)); } catch (e) { /* storage may be blocked; prefs just do not persist */ } };
  const prefBool = (k, d) => { const v = pref(k, d ? '1' : '0'); return v === '1' || v === 'true'; };

  const state = {
    panelOn: prefBool('panel', true),
    graphOn: prefBool('graph', true),
    scroll: pref('scroll', 'instant'),
    /* every link visible by default; an empty list is a deliberate "none" */
    kinds: (() => { try { return JSON.parse(pref('kinds', 'null')) || allKinds(); } catch (e) { return allKinds(); } })(),
    debugOn: prefBool('debug', false) || location.hash === '#debug',
    selected: null,
  };

  /* ---- layout: left column, resizer, panel with the two components -------- */
  const main = document.querySelector('main.doc');
  const layout = document.createElement('div');
  layout.className = 'uni-layout';
  const left = document.createElement('div');
  left.className = 'uni-left';
  while (main.firstChild) left.appendChild(main.firstChild);
  layout.appendChild(left);
  const vsplit = document.createElement('div');
  vsplit.className = 'uni-vsplit';
  vsplit.title = 'Drag to resize';
  layout.appendChild(vsplit);
  const panel = document.createElement('aside');
  panel.className = 'uni-panel';
  panel.innerHTML = '<uni-graph></uni-graph><div class="uni-hsplit" title="Drag to resize"></div><uni-source></uni-source>';
  layout.appendChild(panel);
  main.appendChild(layout);
  const graph = panel.querySelector('uni-graph');
  const source = panel.querySelector('uni-source');
  const pane = initStatePane({ slug: U.slug, graph });
  /* the blast-radius mini graph: the same component, features disabled (the
     founder's reuse rule), living in the inspector, permanently in explore
     mode so it always shows the selection's neighbourhood */
  const mini = document.createElement('uni-graph');
  mini.setAttribute('mini', '');

  /* the sticky nav overlays the panel top without this runtime offset */
  function sizeUnderNav() {
    const nav = document.querySelector('nav.site');
    const h = nav ? nav.offsetHeight : 0;
    panel.style.top = h + 'px';
    panel.style.height = 'calc(100vh - ' + h + 'px)';
  }
  window.addEventListener('resize', sizeUnderNav);

  /* ---- toolbar ------------------------------------------------------------ */
  const tools = document.createElement('div');
  tools.className = 'uni-tools';
  tools.innerHTML =
    '<button id="uni-tglpanel" class="uni-wide-only" aria-pressed="false">&#9707; side panel</button>' +
    '<uni-options></uni-options>' +
    '<button id="uni-reset" title="Forget every saved view preference for this document and reload">&#8634; reset view</button>' +
    '<button id="uni-clear" title="Clear the selected node everywhere" hidden>&#10005; clear selection</button>' +
    '<span class="dim" id="uni-status"></span>';
  const meta = left.querySelector('.docmeta');
  (meta || left.firstChild).insertAdjacentElement('afterend', tools);
  const options = tools.querySelector('uni-options');
  const clearBtn = tools.querySelector('#uni-clear');

  /* ---- scrolling in the chosen tempo (behavior:'instant' beats the site's
          global scroll-behavior:smooth, which made jumps interruptible) ----- */
  function setScroll(container, y, behavior) {
    if (container === window) window.scrollTo({ top: y, left: 0, behavior });
    else container.scrollTo({ top: y, behavior });
  }
  function animateScroll(container, top, ms) {
    const from = container === window ? window.scrollY : container.scrollTop;
    let t0 = null;
    const step = (t) => {
      if (t0 === null) t0 = t;
      const p = Math.min(1, (t - t0) / ms);
      setScroll(container, from + (top - from) * (1 - Math.pow(1 - p, 3)), 'instant');
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  function scrollToEl(el, container) {
    const isWin = container === window;
    const r = el.getBoundingClientRect();
    let top;
    if (isWin) top = r.top + window.scrollY - window.innerHeight / 2;
    else {
      const cr = container.getBoundingClientRect();
      top = container.scrollTop + (r.top - cr.top) - container.clientHeight / 2;
    }
    top = Math.max(0, top);
    if (state.scroll === 'instant') setScroll(container, top, 'instant');
    else if (state.scroll === 'fast') animateScroll(container, top, 140);
    else setScroll(container, top, 'smooth');
  }

  /* ---- state application -------------------------------------------------- */
  let inlineBox = null;
  function applyState() {
    document.body.classList.toggle('uni-panel-on', state.panelOn && WIDE.matches);
    document.body.classList.toggle('uni-graph-off', !state.graphOn);
    tools.querySelector('#uni-tglpanel').setAttribute('aria-pressed', String(state.panelOn));
    options.reflect({ scroll: state.scroll, kinds: state.kinds, graph: state.graphOn,
      debug: state.debugOn });
    pane.setOn(state.debugOn);
    inlineBox = inlineBox || document.getElementById('unigraph-inline');
    if (inlineBox) inlineBox.style.display = (state.graphOn && !(state.panelOn && WIDE.matches)) ? '' : 'none';
    if (state.graphOn) {
      graph.mountTo((state.panelOn && WIDE.matches) ? panel.querySelector('#uni-cy') : inlineBox);
      requestAnimationFrame(() => graph.resize());
    }
    source.applyKinds(state.kinds);
    if (graph.cy) graph.applyKinds(state.kinds);   /* one toggle set drives both panes */
  }

  /* ---- the one selection: persistent, toggled, cleared from the top ------- */
  function flashRow(rowId, scroll) {
    const el = document.getElementById(rowId);
    if (!el) return;
    if (scroll !== false) scrollToEl(el, window);
    el.classList.remove('uni-hit'); void el.offsetWidth; el.classList.add('uni-hit');
  }
  function clearSelection(reselecting) {
    state.selected = null;
    /* dropping the graph's selection also releases an explore view */
    if (!reselecting) graph.selected = null;
    document.querySelectorAll('tr.uni-sel').forEach((el) => el.classList.remove('uni-sel'));
    source.setSelected(null);
    graph.clearFocus();
    clearBtn.hidden = true;
    /* on small screens the maximised inspector is a bottom sheet shown on selection */
    graph.querySelector('.uni-graphbox').classList.remove('uni-hassel');
  }
  function select(aid, opts) {
    opts = opts || {};
    if (state.selected === aid && !opts.force) { clearSelection(); return; }
    clearSelection(true);
    state.selected = aid;
    graph.selected = aid;
    mini.selected = aid;
    mini.classList.add('has-sel');
    graph.querySelector('.uni-graphbox').classList.add('uni-hassel');
    pane.note('select ' + aid);
    clearBtn.hidden = false;
    const a = U.anchors.find((x) => x.aid === aid);
    if (a) {
      const row = document.getElementById(a.row);
      if (row) { row.classList.add('uni-sel'); flashRow(a.row, opts.scrollLeft !== false); }
      source.showAnchor(aid);
      source.setSelected(aid);
    }
    if (graph.cy.$id(aid).nonempty()) graph.focus(aid, state.scroll);
  }
  clearBtn.addEventListener('click', () => clearSelection());
  tools.querySelector('#uni-reset').addEventListener('click', () => {
    try {
      const stale = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.indexOf(LS) === 0) stale.push(k);
      }
      stale.forEach((k) => localStorage.removeItem(k));
    } catch (e) { /* storage may be blocked; the reload still resets the session */ }
    history.replaceState(null, '', location.pathname);
    location.reload();
  });

  /* ---- wiring: data down, events up --------------------------------------- */
  tools.querySelector('#uni-tglpanel').addEventListener('click', () => {
    state.panelOn = !state.panelOn; setPref('panel', state.panelOn ? 1 : 0); applyState();
  });
  layout.addEventListener('uni:pref', (e) => {
    const { key, value } = e.detail;
    if (key === 'scroll') { state.scroll = value; setPref('scroll', value); }
    else if (key === 'kinds') { state.kinds = value; setPref('kinds', JSON.stringify(value)); applyState(); }
    else if (key === 'graph') { state.graphOn = value; setPref('graph', value ? 1 : 0); applyState(); }
    else if (key === 'debug') { state.debugOn = value; setPref('debug', value ? 1 : 0); applyState(); }
    else if (key === 'mode') setPref('mode', value);
    pane.note(key + '\u2192' + (typeof value === 'object' ? 'set' : value));
  });
  layout.addEventListener('uni:gpref', (e) => {
    if (e.target.hasAttribute && e.target.hasAttribute('mini')) return;   /* mini prefs stay its own */
    setPref(e.detail.key, e.detail.value);
    pane.note(e.detail.key + '\u2192' + e.detail.value);
  });
  /* maximised graph: the page chrome yields so the canvas owns the viewport */
  layout.addEventListener('uni:gmax', (e) => {
    if (e.target.hasAttribute && e.target.hasAttribute('mini')) return;
    document.body.classList.toggle('uni-gmax-on', e.detail.on);
    requestAnimationFrame(() => mini.resize());
  });
  layout.addEventListener('uni:node-tap', (e) => {
    const id = e.detail.id;
    if (id.indexOf('peak:') === 0) return;               /* a peak is a summit, not an anchor */
    if (id.indexOf('sec:') === 0) {                      /* the doc tree navigates the source */
      source.scrollToHeading(id === 'sec:__doc' ? '' : e.detail.label);
      return;
    }
    select(id);
  });
  layout.addEventListener('uni:mark-click', (e) => select(e.detail.aid));
  layout.addEventListener('uni:step-select', (e) => select(e.detail.aid, { force: true, scrollLeft: false }));
  layout.addEventListener('uni:clear-request', (e) => {
    if (e.target.hasAttribute && e.target.hasAttribute('mini')) return;
    clearSelection();
  });
  layout.addEventListener('uni:need-panel', () => {
    if (!state.panelOn) { state.panelOn = true; setPref('panel', 1); applyState(); }
  });
  layout.addEventListener('uni:source-ready', (e) => {
    tools.querySelector('#uni-status').textContent =
      e.detail.anchors + ' anchors · ' + e.detail.spans + ' verified spans in the source';
    source.applyKinds(state.kinds);
  });
  layout.addEventListener('uni:data-ready', () => source.setSelected(state.selected));
  left.addEventListener('click', (e) => {
    const go = e.target.closest('.anchgo');
    if (go) select(go.getAttribute('data-aid'), { scrollLeft: false });
  });

  /* ---- resizers, sizes remembered ----------------------------------------- */
  const pw = pref('panelw', ''); if (pw) panel.style.flexBasis = pw;
  const graphbox = panel.querySelector('.uni-graphbox');
  const gh = pref('graphh', ''); if (gh) graphbox.style.flexBasis = gh;
  function dragger(el, apply, done) {
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault(); el.classList.add('drag'); el.setPointerCapture(e.pointerId);
      const move = (ev) => { apply(ev); graph.resize(); };
      const up = () => {
        el.classList.remove('drag'); done();
        el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up);
      };
      el.addEventListener('pointermove', move); el.addEventListener('pointerup', up);
    });
  }
  dragger(vsplit, (ev) => {
    const r = layout.getBoundingClientRect();
    panel.style.flexBasis = (Math.min(0.64, Math.max(0.22, (r.right - ev.clientX) / r.width)) * 100) + '%';
  }, () => setPref('panelw', panel.style.flexBasis));
  dragger(panel.querySelector('.uni-hsplit'), (ev) => {
    const r = panel.getBoundingClientRect();
    graphbox.style.flexBasis = (Math.min(0.8, Math.max(0.12, (ev.clientY - r.top) / r.height)) * 100) + '%';
  }, () => setPref('graphh', graphbox.style.flexBasis));

  /* ---- boot ---------------------------------------------------------------- */
  graph.init(U, {
    glay: pref('glay', 'cose'), gsize: pref('gsize', 's'), gboxed: prefBool('gboxed', false),
    gdoc: prefBool('gdoc', true), gtree: prefBool('gtree', false),
    gpeaks: prefBool('gpeaks', false), gpin: prefBool('gpin', false),
    gstable: prefBool('gstable', true), gschema: prefBool('gschema', false),
    galign: prefBool('galign', false), galshow: prefBool('galshow', false),
    gslots: (() => { try { return JSON.parse(pref('gslots', '') || 'null'); } catch (e) { return null; } })(),
    gderived: prefBool('gderived', false), gexp: prefBool('gexp', false),
    gdeg: (() => { const v = pref('gdeg', '1'); return v === 'max' ? 'max' : (parseInt(v, 10) || 0); })(),
    gpaths: prefBool('gpaths', false),
    glen: parseInt(pref('glen', '90'), 10), gpull: parseInt(pref('gpull', '90'), 10),
    gtab: pref('gtab', 'content'),
    kinds: state.kinds,
  });
  /* brief 29: where the core tree fetches the document's shards from */
  graph.coreOptions = { base: 'data/core/' + U.slug + '/' };
  graph.inspectorEl.insertBefore(mini, graph.inspectorEl.querySelector('.uni-insp-legend'));
  mini.init(U, { glay: 'cose', gsize: 's', gboxed: false, gtree: false, gpeaks: false,
    gpin: false, gstable: false, gschema: false, galign: false, galshow: false,
    gderived: false, gdoc: true, gexp: true, gdeg: 1, gpaths: false,
    glen: 60, gpull: 80, kinds: state.kinds });
  source.init(U, { mode: pref('mode', 'source'), scrollTo: scrollToEl });
  WIDE.addEventListener('change', applyState);
  sizeUnderNav();
  applyState();
  if (location.hash && location.hash.indexOf('#n-') === 0) {
    const id = location.hash.slice(3);
    if (U.anchors.some((a) => a.aid === id)) select(id, { force: true });
  }
  /* #graph lands straight in the maximised graph (the narrated review's ask:
     the live instrument should be one click away, not a scroll away) */
  function openGraphView() {
    if (!state.panelOn) { state.panelOn = true; setPref('panel', 1); }
    if (!state.graphOn) { state.graphOn = true; setPref('graph', 1); }
    applyState();
    const box = graph.querySelector('.uni-graphbox');
    if (box && !box.classList.contains('uni-gmax')) graph.querySelector('[data-gmax]').click();
  }
  if (location.hash === '#graph') requestAnimationFrame(openGraphView);
  window.addEventListener('hashchange', () => {
    if (location.hash === '#graph') openGraphView();
    if (location.hash === '#debug' && !state.debugOn) {
      state.debugOn = true; setPref('debug', 1); applyState();
    }
  });
}
