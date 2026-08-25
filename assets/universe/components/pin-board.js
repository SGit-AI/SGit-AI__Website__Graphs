/* @module universe/components/pin-board
   Single responsibility: the peak board, per brief 26 — a dedicated interface
   showing only the pinned summits, with the four border areas and their
   aligned slots, where the founder drags a peak from left to right or top to
   bottom and the graph re-anchors around the new arrangement. A part of
   <uni-graph>; it edits assignments and hands them back through
   host.setPinAssignments, which persists and re-runs the one layout pipeline. */
'use strict';
import { AREAS, SLOT_COUNT, freeSlot } from '../core/slots.js';

const COLOURS = { docroot: '#1f2430', peak: '#39415a', dgroup: '#8e77a8' };

/** Open or close the board beside the canvas: the graphbox gets pb-open so
    the canvas insets shrink (brief 28: every pin visible while the board is
    up), and the view refits to the space that remains. */
export function toggleBoard(host) {
  const open = host.querySelector('.uni-pinboard');
  if (open) { open.remove(); }
  else build(host);
  host.querySelector('.uni-graphbox').classList.toggle('pb-open', !open);
  refit(host);
}

function refit(host) {
  if (!host.cy) return;
  host.cy.resize();
  host.cy.fit(host.cy.elements().not('.uni-hide'), 30);
}

function build(host) {
  const el = document.createElement('div');
  el.className = 'uni-pinboard';
  const areaBox = (area) =>
    '<div class="pb-area pb-' + area + '" data-area="' + area + '"><h6>' + area + '</h6>' +
    Array.from({ length: SLOT_COUNT }, (_, i) =>
      '<span class="pb-slot" data-area="' + area + '" data-slot="' + i + '"></span>').join('') +
    '</div>';
  el.innerHTML =
    '<div class="pb-head"><b>The peak board</b> ' +
    '<span class="dim small">drag a peak into a slot; the graph re-anchors around it</span>' +
    '<span class="sp"></span>' +
    '<button class="pb-reset">reset to defaults</button>' +
    '<button class="pb-close">&#10005;</button></div>' +
    '<div class="pb-grid">' + areaBox('top') +
    '<div class="pb-mid">' + areaBox('left') +
    '<div class="pb-tray"><h6>unplaced peaks</h6><div class="pb-traybox"></div></div>' +
    areaBox('right') + '</div>' + areaBox('bottom') + '</div>';
  host.querySelector('.uni-graphbox').appendChild(el);

  /* working copy of the assignments; every change applies immediately */
  let a = Object.assign({}, host.pinAssignments);
  const peaks = host.cy.nodes('[family = "docroot"], [family = "peak"], [family = "dgroup"]')
    .not('.uni-hide');

  const chip = (n) => {
    const c = document.createElement('span');
    c.className = 'pb-chip';
    c.draggable = true;
    c.setAttribute('data-id', n.id());
    c.style.background = COLOURS[n.data('family')] || '#39415a';
    c.textContent = n.data('label');
    c.title = n.id() + ' — drag into a slot, or tap then tap a slot';
    return c;
  };

  function render() {
    el.querySelectorAll('.pb-slot').forEach((s) => { s.textContent = ''; s.classList.remove('full'); });
    const tray = el.querySelector('.pb-traybox');
    tray.textContent = '';
    peaks.forEach((n) => {
      const at = a[n.id()];
      const slot = at && el.querySelector(
        '.pb-slot[data-area="' + at.area + '"][data-slot="' + at.slot + '"]');
      const home = slot || tray;
      home.appendChild(chip(n));
      if (slot) slot.classList.add('full');
    });
  }

  function place(id, area, slot) {
    if (slot === undefined || slot === null || slot === '') slot = freeSlot(a, area);
    if (slot === -1) return;                      /* the area is full: a peak stays a peak */
    slot = Number(slot);
    Object.keys(a).forEach((other) => {           /* occupied slot: the two swap */
      if (other !== id && a[other].area === area && a[other].slot === slot) {
        if (a[id]) a[other] = a[id]; else delete a[other];
      }
    });
    a[id] = { area, slot };
    host.setPinAssignments(Object.assign({}, a));
    render();
  }

  let picked = null;
  el.addEventListener('click', (e) => {
    if (e.target.closest('.pb-close')) {
      el.remove();
      host.querySelector('.uni-graphbox').classList.remove('pb-open');
      refit(host);
      return;
    }
    if (e.target.closest('.pb-reset')) {
      a = {}; host.setPinAssignments(null); a = Object.assign({}, host.pinAssignments);
      render(); return;
    }
    const c = e.target.closest('.pb-chip');
    if (c) {
      picked = picked === c.getAttribute('data-id') ? null : c.getAttribute('data-id');
      el.querySelectorAll('.pb-chip').forEach((x) =>
        x.classList.toggle('picked', x.getAttribute('data-id') === picked));
      return;
    }
    const s = e.target.closest('.pb-slot, .pb-area');
    if (s && picked) {
      place(picked, s.getAttribute('data-area'), s.getAttribute('data-slot'));
      picked = null;
    }
  });
  el.addEventListener('dragstart', (e) => {
    const c = e.target.closest('.pb-chip');
    if (c) e.dataTransfer.setData('text/plain', c.getAttribute('data-id'));
  });
  el.addEventListener('dragover', (e) => {
    if (e.target.closest('.pb-slot, .pb-area, .pb-tray')) e.preventDefault();
  });
  el.addEventListener('drop', (e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (!id) return;
    if (e.target.closest('.pb-tray')) {          /* back to the tray: unpinned */
      delete a[id];
      host.setPinAssignments(Object.assign({}, a));
      render(); return;
    }
    const s = e.target.closest('.pb-slot, .pb-area');
    if (s) place(id, s.getAttribute('data-area'), s.getAttribute('data-slot'));
  });

  render();
}
