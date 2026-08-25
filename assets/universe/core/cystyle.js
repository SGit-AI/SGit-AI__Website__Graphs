/* @module universe/core/cystyle
   Single responsibility: the graph's visual vocabulary and layout options, as
   pure data and builders. One definition, consumed by the <uni-graph> element;
   nothing here touches cytoscape or the DOM. */

/** The one place the family palette lives; the CSS mark colours mirror it. */
export const FAMILY_COLOURS = {
  concept: '#3f6ad8', claim: '#2f9e63', hypothesis: '#c58f00',
  objective: '#9b59b6', example: '#d0654e',
};

/** @returns {Array<object>} the cytoscape stylesheet */
export function graphStyle() {
  return [
    { selector: 'node', style: { label: 'data(label)', 'font-size': 9, width: 14, height: 14,
      'text-wrap': 'wrap', 'text-max-width': 110, 'text-valign': 'bottom', 'text-margin-y': 4,
      'background-color': '#8a8f98', color: '#666' } },
    { selector: 'node[family = "concept"]', style: { 'background-color': FAMILY_COLOURS.concept,
      width: 22, height: 22, 'font-weight': 'bold', color: '#333' } },
    { selector: 'node[family = "claim"]', style: { 'background-color': FAMILY_COLOURS.claim } },
    { selector: 'node[family = "hypothesis"]', style: { 'background-color': FAMILY_COLOURS.hypothesis } },
    { selector: 'node[family = "objective"]', style: { 'background-color': FAMILY_COLOURS.objective } },
    { selector: 'node[family = "example"]', style: { 'background-color': FAMILY_COLOURS.example,
      shape: 'round-rectangle' } },
    { selector: 'node[family = "section"]', style: { 'background-color': '#eef1f6',
      shape: 'round-rectangle', width: 30, height: 16, 'border-width': 1,
      'border-color': '#c2cad8', color: '#4a5568', 'font-size': 9 } },
    { selector: 'node[family = "docroot"]', style: { 'background-color': '#1f2430',
      shape: 'round-rectangle', width: 44, height: 20, color: '#1f2430', 'font-weight': 'bold' } },
    { selector: 'edge', style: { width: 1, 'line-color': '#c9ccd2', 'curve-style': 'bezier',
      'target-arrow-shape': 'triangle', 'arrow-scale': 0.7, 'target-arrow-color': '#c9ccd2' } },
    { selector: 'edge[kind = "asserted"]', style: { width: 2, 'line-color': FAMILY_COLOURS.concept,
      'target-arrow-color': FAMILY_COLOURS.concept, label: 'data(verb)', 'font-size': 8,
      color: FAMILY_COLOURS.concept, 'text-background-color': '#fff',
      'text-background-opacity': 0.85, 'text-background-padding': 2 } },
    { selector: 'edge[kind = "demonstrates"]', style: { 'line-style': 'dashed' } },
    { selector: 'edge[kind = "contains"]', style: { width: 1, 'line-style': 'dotted',
      'line-color': '#b9c2d0', 'target-arrow-shape': 'none' } },
    { selector: '.uni-szm', style: { 'font-size': 12 } },
    { selector: '.uni-szl', style: { 'font-size': 16 } },
    /* focus sizing sits BEFORE boxed so a boxed node keeps its label-box shape
       when focused (cytoscape's cascade is order-based); the ring survives */
    { selector: 'node.uni-focus', style: { 'border-width': 4, 'border-color': '#c9a227',
      width: 28, height: 28, 'font-weight': 'bold', color: '#111' } },
    /* boxed mode: the node IS the box, label inside, read and clicked directly */
    { selector: 'node.uni-boxed', style: { shape: 'round-rectangle', width: 'label',
      height: 'label', padding: '5px', 'text-valign': 'center', 'text-halign': 'center',
      'text-margin-y': 0, color: '#fff', 'text-wrap': 'wrap', 'text-max-width': 150 } },
    { selector: 'node[family = "section"].uni-boxed', style: { color: '#4a5568' } },
    { selector: 'node[family = "peak"]', style: { 'background-color': '#39415a',
      shape: 'round-rectangle', width: 'label', height: 'label', padding: '6px',
      'text-valign': 'center', 'text-halign': 'center', 'text-margin-y': 0,
      color: '#fff', 'font-weight': 'bold' } },
    /* the schema view: one node per type (its family's own colour), edges
       labelled with the verb or kind and how often it occurs */
    { selector: 'node[family = "schema"]', style: {
      'background-color': (ele) => FAMILY_COLOURS[ele.data('typeOf')] || '#2b3446',
      shape: 'round-rectangle', width: 'label', height: 'label', padding: '8px',
      'text-valign': 'center', 'text-halign': 'center', 'text-margin-y': 0,
      color: '#fff', 'font-weight': 'bold', 'font-size': 12 } },
    { selector: 'edge[kind = "schema"]', style: { width: 2, 'line-color': '#8a8f98',
      'target-arrow-color': '#8a8f98', 'target-arrow-shape': 'triangle',
      label: 'data(label)', 'font-size': 9, color: '#555',
      'text-background-color': '#fff', 'text-background-opacity': 0.9,
      'text-background-padding': 2, 'curve-style': 'bezier',
      'control-point-step-size': 60 } },
    { selector: 'node[family = "dgroup"]', style: { 'background-color': '#8e77a8',
      shape: 'round-rectangle', width: 'label', height: 'label', padding: '6px',
      'text-valign': 'center', 'text-halign': 'center', 'text-margin-y': 0,
      color: '#fff', 'font-weight': 'bold' } },
    /* the alignment rails (brief 26): invisible by default, always pulling;
       the uni-alshow class reveals what has been doing the arranging */
    { selector: 'node[family = "rail"]', style: { width: 8, height: 8, opacity: 0,
      'background-color': '#c9a227', label: '' } },
    { selector: 'edge[kind = "align"]', style: { opacity: 0, width: 1,
      'line-color': '#c9a227', 'line-style': 'dashed', 'target-arrow-shape': 'none',
      'curve-style': 'straight' } },
    { selector: 'node[family = "rail"].uni-alshow', style: { opacity: 0.9,
      label: 'data(label)', 'font-size': 9, color: '#8a6d1a' } },
    { selector: 'edge[kind = "align"].uni-alshow', style: { opacity: 0.4 } },
    { selector: 'edge[kind = "derived"]', style: { width: 1, 'line-style': 'dashed',
      'line-color': '#c9b8d8', 'target-arrow-shape': 'none', 'curve-style': 'haystack' } },
    { selector: 'edge.uni-path', style: { width: 3, 'line-color': '#c9a227',
      'target-arrow-color': '#c9a227', opacity: 1 } },
    { selector: 'node.uni-path', style: { 'border-width': 3, 'border-color': '#c9a227' } },
    /* path-query matches: teal, distinct from the gold paths-to-peaks */
    { selector: 'edge.uni-qmatch', style: { width: 3, 'line-color': '#2a9d8f',
      'target-arrow-color': '#2a9d8f', opacity: 1 } },
    { selector: 'node.uni-qmatch', style: { 'border-width': 3, 'border-color': '#2a9d8f' } },
    { selector: 'node.uni-boxed.uni-focus', style: { 'border-width': 4, 'border-color': '#c9a227' } },
    { selector: '.uni-hide', style: { display: 'none' } },
    { selector: '.uni-nolabel', style: { label: '' } },
    { selector: '.uni-dim', style: { opacity: 0.15 } },
  ];
}

/**
 * Layout options for a named layout, honouring the physics settings.
 * Every layout runs with fit: false — the caller decides whether the viewport
 * moves, which is what makes the stable-add principle (brief 26) possible.
 * @param {string} name - cose | concentric | grid | tree
 * @param {{len: number, pull: number}} physics - string length and pull (thousands)
 * @param {object|string|undefined} treeRoots - roots for the tree layout
 * @returns {object} cytoscape layout options
 */
export function layoutOptions(name, physics, treeRoots) {
  if (name === 'cose') {
    /* align ties are kept short whatever the string setting: the rails pull
       their level onto a line even while the rest of the graph breathes */
    return { name: 'cose', animate: false, fit: false, nodeRepulsion: physics.pull * 1000,
      idealEdgeLength: (edge) => (edge.data('kind') === 'align' ? 34 : physics.len),
      padding: 24 };
  }
  if (name === 'concentric') {
    return { name: 'concentric', animate: false, fit: false, padding: 24, minNodeSpacing: 22,
      concentric: (n) => (n.data('family') === 'concept' ? 3 : n.data('family') === 'claim' ? 2 : 1),
      levelWidth: () => 1 };
  }
  if (name === 'tree') {
    return { name: 'breadthfirst', animate: false, fit: false, directed: true, padding: 24,
      spacingFactor: 1.1, roots: treeRoots };
  }
  return { name: 'grid', animate: false, fit: false, padding: 24 };
}
