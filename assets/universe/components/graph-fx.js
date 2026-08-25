/* @module universe/components/graph-fx
   Single responsibility: the graph's transient effects — the focus ring with
   its dimmed surround, the gold paths from the selection to the peaks, and the
   pinned-summits layout run.
   A part of <uni-graph>: pure functions over the cytoscape instance, no state. */
'use strict';
import { defaultAssignments, slotPositions } from '../core/slots.js';

/**
 * Focus one node: ring it, dim the rest, centre it in the given tempo.
 * @param {object} cy - the cytoscape instance
 * @param {string} id - the node to focus
 * @param {string} tempo - 'smooth' | 'fast' | anything else is instant
 */
export function focusNode(cy, id, tempo) {
  const node = cy.$id(id);
  cy.elements().removeClass('uni-focus uni-dim');
  if (node.empty()) return;
  cy.elements().addClass('uni-dim');
  node.closedNeighborhood().removeClass('uni-dim');
  node.addClass('uni-focus');
  cy.animate({ center: { eles: node } },
    { duration: tempo === 'smooth' ? 350 : tempo === 'fast' ? 140 : 0 });
}

/**
 * Gold-line the shortest route from the selection to each visible peak
 * (and the doc root when the tree is on); clears any previous paths.
 * @param {object} cy - the cytoscape instance
 * @param {boolean} on - whether paths-to-peaks is enabled
 * @param {string|null} selected - the selected node id
 */
export function applyPaths(cy, on, selected) {
  cy.elements().removeClass('uni-path');
  if (!on || !selected) return;
  const from = cy.$id(selected);
  if (from.empty() || from.hasClass('uni-hide')) return;
  const vis = cy.elements().not('.uni-hide');
  vis.nodes('[family = "peak"], [family = "docroot"]').forEach((goal) => {
    const r = vis.aStar({ root: from, goal, directed: false });
    if (r.found) r.path.addClass('uni-path');
  });
}

/**
 * The layout roots for the current view: the visible summits when any summit
 * source is on, else the selection, else let the layout pick.
 * @returns {object|undefined} a cytoscape collection or undefined
 */
export function layoutRoots(cy, vis, p, selected) {
  if (p.gtree || p.gpeaks || p.gderived) {
    const tops = vis.nodes('[family = "docroot"], [family = "peak"], [family = "dgroup"]');
    if (tops.length) return tops;
    return undefined;
  }
  if (selected && cy.$id(selected).nonempty()) return cy.$id(selected);
  return undefined;
}

/** The summit families' default placement when no explicit assignments exist:
    doc root and family peaks down the left band, derived groups down the right. */
export function summitAssignments(vis) {
  return defaultAssignments(
    vis.nodes('[family = "docroot"], [family = "peak"]').map((n) => n.id()),
    vis.nodes('[family = "dgroup"]').map((n) => n.id()));
}

/**
 * Run a layout with pinned slots: the given area/slot assignments are placed
 * into the border bands when asked, locked for the run so the physics settles
 * the free nodes between them, and unlocked after so the reader can drag them
 * by hand between runs. Called from every layout run while pinning is active,
 * so a slider nudge or source toggle cannot scramble the arrangement.
 * @param {object} cy @param {object} vis - the visible elements
 * @param {object} layoutOpts - options for the layout to run
 * @param {boolean} place - whether to (re)place the pins into their slots
 * @param {Object<string, {area, slot}>} assignments
 * @returns {boolean} whether anything was pinned
 */
export function runPinnedLayout(cy, vis, layoutOpts, place, assignments) {
  const live = {};
  Object.keys(assignments).forEach((id) => {
    if (vis.getElementById(id).nonempty()) live[id] = assignments[id];
  });
  const ids = Object.keys(live);
  if (!ids.length) { vis.layout(layoutOpts).run(); return false; }
  const pins = cy.collection(ids.map((id) => cy.$id(id)));
  if (place) {
    const pos = slotPositions(live, vis.nodes().length - ids.length);
    pins.forEach((n) => n.position(pos[n.id()]));
  }
  pins.lock();
  vis.layout(layoutOpts).run();
  pins.unlock();
  return true;
}

/**
 * The stable-add run, per brief 26: a node already on the canvas never moves
 * when the view gains or loses elements, because every move costs the reader
 * their mental picture. Removals move nothing at all; additions freeze every
 * previously shown node, seed each newcomer beside an already-placed
 * neighbour, let the physics settle only the newcomers, then unlock.
 * @param {object} cy @param {object} vis @param {object} layoutOpts
 * @param {Set<string>} shownIds - node ids visible after the previous run
 * @returns {string} 'removed' | 'settled' | 'first' (caller runs a full layout)
 */
export function runStableLayout(cy, vis, layoutOpts, shownIds) {
  const nodes = vis.nodes();
  const fresh = nodes.filter((n) => !shownIds.has(n.id()));
  if (!fresh.length) return 'removed';
  const prev = nodes.difference(fresh);
  if (!prev.length) return 'first';
  fresh.forEach((n) => {
    const near = n.neighborhood('node').intersection(prev);
    if (near.length) {
      const p = near[0].position();
      n.position({ x: p.x + 60, y: p.y + 60 });
    }
  });
  /* permanently locked infrastructure (the alignment rails) must stay locked */
  const already = prev.filter((n) => n.locked());
  prev.lock();
  vis.layout(layoutOpts).run();
  prev.not(already).unlock();
  return 'settled';
}
