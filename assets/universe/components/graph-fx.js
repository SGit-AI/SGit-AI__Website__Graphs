/* @module universe/components/graph-fx
   Single responsibility: the graph's transient effects — the focus ring with
   its dimmed surround, and the gold paths from the selection to the peaks.
   A part of <uni-graph>: pure functions over the cytoscape instance, no state. */
'use strict';

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
