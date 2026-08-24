/* @module universe/components/graph-fx
   Single responsibility: the graph's transient effects — the focus ring with
   its dimmed surround, the gold paths from the selection to the peaks, and the
   pinned-summits layout run.
   A part of <uni-graph>: pure functions over the cytoscape instance, no state. */
'use strict';
import { pinPositions } from '../core/packs.js';

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

/**
 * Run a layout with pinned stacks: the summits by default, or the custom
 * left/right id lists when given (the page API's arbitrary pinning). Pins are
 * placed into the stacks when asked, locked for the run so the physics
 * settles the free nodes around them, and unlocked after so the reader can
 * drag them by hand between runs. Called from every layout run while pinning
 * is active, so a slider nudge or source toggle cannot scramble the stacks.
 * @param {object} cy - the cytoscape instance
 * @param {object} vis - the visible elements collection
 * @param {object} layoutOpts - options for the layout to run
 * @param {boolean} place - whether to (re)place the pins into the stacks
 * @param {{left: string[], right: string[]}|null} custom - explicit stacks;
 *   null pins the summit families instead
 * @returns {boolean} whether anything was pinned
 */
export function runPinnedLayout(cy, vis, layoutOpts, place, custom) {
  const onCanvas = (id) => vis.getElementById(id).nonempty();
  const left = custom ? custom.left.filter(onCanvas)
    : vis.nodes('[family = "docroot"], [family = "peak"]').map((n) => n.id());
  const right = custom ? custom.right.filter(onCanvas)
    : vis.nodes('[family = "dgroup"]').map((n) => n.id());
  const ids = left.concat(right);
  if (!ids.length) { vis.layout(layoutOpts).run(); return false; }
  const pins = cy.collection(ids.map((id) => cy.$id(id)));
  if (place) {
    const pos = pinPositions(left, right, vis.nodes().length - ids.length);
    pins.forEach((n) => n.position(pos[n.id()]));
  }
  pins.lock();
  vis.layout(layoutOpts).run();
  pins.unlock();
  return true;
}
