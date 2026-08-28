/* @module figures/shell
   Single responsibility: the figure page — the filters, the gallery, and the
   one-figure view. The graph is embedded at build time (window.FIGURES) rather
   than fetched, because it is 20 entries and one round trip is worse than the
   bytes. figureview.js owns the markup. */
'use strict';
import { galleryHtml, figureHtml, filtersHtml } from './core/figureview.js';

const F = window.FIGURES;
if (F) boot();

function boot() {
  const root = document.getElementById('figures');
  let filter = '';
  const gallery = () => {
    root.innerHTML = filtersHtml(F, filter) + galleryHtml(F, filter);
  };
  const open = (id) => {
    const html = figureHtml(F, id);
    if (html) { root.innerHTML = html; root.scrollIntoView({ block: 'start' }); }
    try { history.replaceState(null, '', '#' + id); } catch (e) { /* fine */ }
  };
  root.addEventListener('click', (e) => {
    const chip = e.target.closest('.fg-chip');
    if (chip) { filter = chip.getAttribute('data-filter'); gallery(); return; }
    if (e.target.closest('.fg-back')) {
      gallery();
      try { history.replaceState(null, '', location.pathname); } catch (err) { /* fine */ }
      return;
    }
    if (e.target.closest('.fg-full')) return;      /* the image opens full size */
    const card = e.target.closest('.fg-card');
    if (card) open(card.getAttribute('data-fig'));
  });
  root.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('.fg-card');
    if (card) { e.preventDefault(); open(card.getAttribute('data-fig')); }
  });
  const want = location.hash.slice(1);
  if (want && figureHtml(F, want)) open(want); else gallery();
}
