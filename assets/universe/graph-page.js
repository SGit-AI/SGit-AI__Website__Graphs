/* @module universe/graph-page
   Single responsibility: the standalone graph page's shell — proof that
   <uni-graph> is a reusable component. No reader, no source pane, no split
   layout: the same element, its same parts (strip, inspector, boards, core
   tree, blast-radius mini), booted permanently maximised over the viewport.
   Preferences share the reader's localStorage keys, so the graph a person
   tuned in the reader is the graph this page opens. */
'use strict';
import { allKinds } from './core/kinds.js';
import './components/uni-graph.js';

const U = window.UNIVERSE;
if (U && window.cytoscape) boot();

function boot() {
  const LS = 'uni:' + U.slug + ':';
  const pref = (k, d) => { try { const v = localStorage.getItem(LS + k); return v === null ? d : v; } catch (e) { return d; } };
  const setPref = (k, v) => { try { localStorage.setItem(LS + k, String(v)); } catch (e) { /* prefs just do not persist */ } };
  const prefBool = (k, d) => { const v = pref(k, d ? '1' : '0'); return v === '1' || v === 'true'; };
  let kinds = (() => { try { return JSON.parse(pref('kinds', 'null')) || allKinds(); } catch (e) { return allKinds(); } })();

  document.body.classList.add('uni-standalone');
  const graph = document.createElement('uni-graph');
  document.body.appendChild(graph);
  const mini = document.createElement('uni-graph');
  mini.setAttribute('mini', '');

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
    kinds,
  });
  graph.coreOptions = { base: 'data/core/' + U.slug + '/' };
  graph.inspectorEl.insertBefore(mini, graph.inspectorEl.querySelector('.uni-insp-legend'));
  mini.init(U, { glay: 'cose', gsize: 's', gboxed: false, gtree: false, gpeaks: false,
    gpin: false, gstable: false, gschema: false, galign: false, galshow: false,
    gderived: false, gdoc: true, gexp: true, gdeg: 1, gpaths: false,
    glen: 60, gpull: 80, kinds });

  /* the page IS the maximised view; the way back is the page bar, not a toggle */
  const box = graph.querySelector('.uni-graphbox');
  box.classList.add('uni-gmax');
  const bar = document.createElement('div');
  bar.className = 'uni-pagebar';
  bar.innerHTML = '<a href="' + U.slug + '.html">&#9666; the reader</a>' +
    '<span class="dim">' + U.slug + ' &middot; the graph</span>';
  box.appendChild(bar);

  graph.addEventListener('uni:gpref', (e) => {
    if (e.target.hasAttribute && e.target.hasAttribute('mini')) return;
    setPref(e.detail.key, e.detail.value);
  });
  graph.addEventListener('uni:pref', (e) => {
    if (e.detail.key !== 'kinds') return;
    kinds = e.detail.value;
    setPref('kinds', JSON.stringify(kinds));
    graph.applyKinds(kinds);
    mini.applyKinds(kinds);
  });
  graph.addEventListener('uni:node-tap', (e) => {
    graph.selected = e.detail.id;
    mini.selected = e.detail.id;
    mini.classList.add('has-sel');
    box.classList.add('uni-hassel');       /* the phone's bottom sheet appears */
    requestAnimationFrame(() => mini.resize());
  });
  graph.addEventListener('uni:clear-request', () => {
    graph.selected = null;
    graph.clearFocus();
    mini.selected = null;
    mini.classList.remove('has-sel');
    box.classList.remove('uni-hassel');
  });
  addEventListener('resize', () => graph.resize());
  requestAnimationFrame(() => graph.resize());
}
