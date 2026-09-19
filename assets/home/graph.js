/* @module home/graph
   Single responsibility: the front door's one live graph. It draws the demo the core
   module decides, lets a reader add and remove edges, and lets them drag a node so the
   picture is obviously a graph rather than an illustration of one. Every sentence it
   shows comes from the data; none is written here. */
'use strict';
import { available, toggle, all, visibleNodes, claims, confidence, tally }
  from './core/portgraph.js';

const SVGNS = 'http://www.w3.org/2000/svg';
const W = 760, H = 420;

function el(name, attrs, text) {
  const n = document.createElementNS(SVGNS, name);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (text != null) n.textContent = text;
  return n;
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

class PortGraph extends HTMLElement {
  connectedCallback() {
    this.demo = window.HOME && window.HOME.demo;
    if (!this.demo || this.svg) return;
    this.active = [];
    this.pos = new Map(this.demo.nodes.map((n) => [n.id, { x: n.x, y: n.y }]));
    this.build();
    this.render();
  }

  build() {
    this.innerHTML =
      '<div class="pg-canvas"><svg viewBox="0 0 ' + W + ' ' + H + '" '
      + 'role="img" aria-label="A field node, and the edges that give it meaning">'
      + '<defs><marker id="pg-ar" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" '
      + 'markerHeight="7" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="#8a8f98"/>'
      + '</marker></defs><g class="pg-edges"></g><g class="pg-nodes"></g></svg></div>'
      + '<div class="pg-side"><div class="pg-tally"></div>'
      + '<div class="pg-chips"></div><div class="pg-says"></div></div>';
    this.svg = this.querySelector('svg');
    this.gEdges = this.querySelector('.pg-edges');
    this.gNodes = this.querySelector('.pg-nodes');
    this.querySelector('.pg-chips').addEventListener('click', (e) => {
      const b = e.target.closest('button[data-edge]');
      if (!b || b.disabled) return;
      const id = b.getAttribute('data-edge');
      this.active = id === '*' ? (this.active.length === this.demo.edges.length ? []
        : all(this.demo.edges)) : toggle(this.demo.edges, this.active, id);
      this.render();
    });
    this.svg.addEventListener('pointerdown', (e) => this.grab(e));
  }

  /* Dragging is the cheapest possible proof that this is a graph and not a picture of
     one: the reader moves a node and every edge on it follows. */
  grab(e) {
    const g = e.target.closest('g[data-node]');
    if (!g) return;
    const id = g.getAttribute('data-node');
    const ctm = this.svg.getScreenCTM();
    if (!ctm) return;
    const inv = ctm.inverse();
    const at = (ev) => {
      const p = this.svg.createSVGPoint();
      p.x = ev.clientX; p.y = ev.clientY;
      return p.matrixTransform(inv);
    };
    const start = at(e), from = this.pos.get(id);
    const off = { x: from.x - start.x, y: from.y - start.y };
    this.svg.setPointerCapture(e.pointerId);
    this.classList.add('dragging');
    const move = (ev) => {
      const p = at(ev);
      this.pos.set(id, {
        x: Math.max(80, Math.min(W - 80, p.x + off.x)),
        y: Math.max(34, Math.min(H - 34, p.y + off.y)),
      });
      this.draw();
      ev.preventDefault();
    };
    const up = () => {
      this.svg.removeEventListener('pointermove', move);
      this.svg.removeEventListener('pointerup', up);
      this.svg.removeEventListener('pointercancel', up);
      this.classList.remove('dragging');
    };
    this.svg.addEventListener('pointermove', move);
    this.svg.addEventListener('pointerup', up);
    this.svg.addEventListener('pointercancel', up);
  }

  render() { this.draw(); this.chips(); this.panel(); }

  draw() {
    const on = new Set(this.active);
    const shown = new Set(visibleNodes(this.demo.nodes, this.demo.edges, this.active));
    this.gEdges.textContent = '';
    this.gNodes.textContent = '';
    for (const e of this.demo.edges) {
      if (!on.has(e.id)) continue;
      const a = this.pos.get(e.from), b = this.pos.get(e.to);
      const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
      const trim = 78;
      const g = el('g', { class: 'pg-edge' });
      g.appendChild(el('line', {
        x1: a.x + (dx / len) * trim, y1: a.y + (dy / len) * 26,
        x2: b.x - (dx / len) * trim, y2: b.y - (dy / len) * 26,
        'marker-end': 'url(#pg-ar)',
      }));
      g.appendChild(el('text', {
        x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 - 6, 'text-anchor': 'middle',
      }, e.verb));
      this.gEdges.appendChild(g);
    }
    for (const n of this.demo.nodes) {
      if (!shown.has(n.id)) continue;
      const p = this.pos.get(n.id);
      const g = el('g', { class: 'pg-node k-' + n.kind, 'data-node': n.id,
        transform: 'translate(' + p.x + ',' + p.y + ')' });
      g.appendChild(el('rect', { x: -76, y: -22, width: 152, height: n.sub ? 44 : 34,
        rx: 9, ry: 9 }));
      g.appendChild(el('text', { class: 'pg-lab', x: 0, y: n.sub ? -3 : 1,
        'text-anchor': 'middle' }, n.label));
      if (n.sub) g.appendChild(el('text', { class: 'pg-sub', x: 0, y: 13,
        'text-anchor': 'middle' }, n.sub));
      this.gNodes.appendChild(g);
    }
  }

  chips() {
    const on = new Set(this.active);
    const ready = new Set(available(this.demo.edges, this.active).map((e) => e.id));
    const full = this.active.length === this.demo.edges.length;
    this.querySelector('.pg-chips').innerHTML =
      '<div class="pg-chips-lab">Add an edge</div>'
      + this.demo.edges.map((e) => {
        const state = on.has(e.id) ? ' on' : ready.has(e.id) ? '' : ' off';
        const blocked = !on.has(e.id) && !ready.has(e.id);
        /* A property edge is named after the node it points at (min_value -> "min_value:
           0"), so spelling both out reads as a stutter. Show the verb once. */
        const target = this.demo.nodes.find((n) => n.id === e.to).label;
        const label = target.startsWith(e.verb)
          ? '<span class="pg-v">' + esc(e.verb) + '</span>' + esc(target.slice(e.verb.length))
          : '<span class="pg-v">' + esc(e.verb) + '</span> &rarr; ' + esc(target);
        return '<button type="button" data-edge="' + e.id + '" class="pg-chip' + state
          + '"' + (blocked ? ' disabled title="needs the type edge first"' : '') + '>'
          + label + '</button>';
      }).join('')
      + '<button type="button" data-edge="*" class="pg-all">'
      + (full ? 'Take them all away' : 'Add all six') + '</button>';
  }

  panel() {
    const t = tally(this.demo, this.active), c = confidence(this.demo, this.active);
    this.querySelector('.pg-tally').innerHTML =
      '<span class="pg-num"><b>' + esc(t.value) + '</b>the value</span>'
      + '<span class="pg-num"><b>' + t.edges + ' / ' + t.edgesMax + '</b>edges</span>'
      + '<span class="pg-num"><b>' + t.claims + '</b>claims it supports</span>';
    this.querySelector('.pg-says').innerHTML =
      '<h4>What the graph can say <span class="pg-conf c-' + c.key + '">' + esc(c.label)
      + '</span></h4><ul>'
      + claims(this.demo, this.active).map((s) =>
        '<li>' + esc(s.says) + '</li>').join('')
      + '</ul>';
  }
}

if (!customElements.get('port-graph')) customElements.define('port-graph', PortGraph);
