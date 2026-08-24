/* @module universe/core/commands
   Single responsibility: the universe reader's command table, as pure data.
   One table, two consumers: universe-api.js binds implementations to it and
   registers them on the page's tool API; toolSchemas() projects it into
   OpenAI function-calling schemas for an LLM. Keeping the table pure keeps
   both consumers in agreement and keeps this file inside gate 27's suite.

   Levels, per the universe-chat plan (v2/dev-packs/v0.4.13__universe-chat/):
     read    the universe as data; always safe, always on
     view    drive the reader's instrument panel; on by default
     author  scratch elements and drafts; visibly unsaved, off by default */
'use strict';

export const LEVELS = ['read', 'view', 'author'];

/* Every entry: name (snake_case, the tool name an LLM calls), level,
   description written for the model, and a JSON-schema properties/required
   pair for the parameters. Implementations live in universe-api.js. */
export const COMMANDS = [
  /* ---- read ------------------------------------------------------------- */
  { name: 'get_doc', level: 'read',
    description: 'The document this page holds: slug, title, frozen source path, SHA-256, and the extraction counts per family.',
    properties: {}, required: [] },
  { name: 'get_nodes', level: 'read',
    description: 'The extraction nodes: concepts, claims, hypotheses, objectives, examples. Each carries its id, label, one-line statement, and for claims the support state (demonstrated, argued, declared); for concepts whether the document defines the term. Filter by family to keep the result small.',
    properties: { family: { type: 'string', enum: ['concept', 'claim', 'hypothesis', 'objective', 'example'],
      description: 'Return only this family. Omit for all nodes.' } }, required: [] },
  { name: 'get_node', level: 'read',
    description: 'One extraction node in full, by id, including its anchor (section, verbatim quote, byte range).',
    properties: { id: { type: 'string', description: 'The node id, e.g. "meaning-through-connectivity".' } },
    required: ['id'] },
  { name: 'get_edges', level: 'read',
    description: 'The relations the document itself asserts between concepts, each with its verb, declared inverse and anchor.',
    properties: {}, required: [] },
  { name: 'get_pairings', level: 'read',
    description: 'The thesaurus (X is also called Y) and the distinctions drawn on purpose (X is NOT Y), each anchored.',
    properties: {}, required: [] },
  { name: 'get_anchor', level: 'read',
    description: 'The anchor for any item id (node, edge-N, nbn-N, alias-N): the section, the verbatim quote, and the byte offsets into the frozen source.',
    properties: { id: { type: 'string', description: 'A node id or an anchor id like "edge-0".' } },
    required: ['id'] },
  { name: 'get_source_text', level: 'read',
    description: 'Read the frozen source document itself. Pass start/end byte offsets (from get_anchor) to read around an anchor; omit them for the opening of the document. At most 6000 characters per call.',
    properties: { start: { type: 'integer', description: 'Byte offset to start from (default 0).' },
      end: { type: 'integer', description: 'Byte offset to end at (default start + 6000).' } }, required: [] },
  { name: 'get_coverage', level: 'read',
    description: 'The document’s own section structure (the taxonomy) and which sections yielded anchored items.',
    properties: {}, required: [] },
  { name: 'get_crossrefs', level: 'read',
    description: 'Where this document is used across the estate, each use rated against the usage maturity model (aligned, stretched, misaligned, unrated), signed and dated.',
    properties: {}, required: [] },
  { name: 'get_state', level: 'read',
    description: 'The reader’s current state: the selected node, highlight kinds, panel and graph visibility, plus scratch and draft counts.',
    properties: {}, required: [] },
  { name: 'compose_node_doc', level: 'read',
    description: 'The full composed document of ONE node: its statement and anchor, every claim about it, its asserted relations both ways, demonstrations, distinctions, aliases, derived links and rated uses — the same composition the reader’s per-node pages are built from. Prefer this over many get_nodes calls when the conversation centres on one node.',
    properties: { id: { type: 'string', description: 'The node id.' } }, required: ['id'] },
  { name: 'rank_nodes', level: 'read',
    description: 'Every node ranked by richness (incident links: claims about it, relations, demonstrations). The top of the list is where the meaning is; the bottom is where the graph is starving.',
    properties: {}, required: [] },
  { name: 'search', level: 'read',
    description: 'Case-insensitive text search across node ids, labels, statements and anchored quotes. Use it when the user names something loosely before reaching for get_nodes.',
    properties: { text: { type: 'string', description: 'The text to look for (min 2 chars).' } },
    required: ['text'] },

  /* ---- view ------------------------------------------------------------- */
  { name: 'select_node', level: 'view',
    description: 'Select one item everywhere at once: highlight its row, jump the source panel to its cited bytes, and ring it in the graph. Use the node id (or edge-N, nbn-N, alias-N).',
    properties: { id: { type: 'string', description: 'The item to select.' } }, required: ['id'] },
  { name: 'clear_selection', level: 'view',
    description: 'Clear the selection everywhere: rows, source panel and graph focus.',
    properties: {}, required: [] },
  { name: 'fit_graph', level: 'view',
    description: 'Fit every visible graph element into view.',
    properties: {}, required: [] },
  { name: 'set_layout', level: 'view',
    description: 'Change the graph layout. cose is force-directed physics, concentric is rings, grid is a grid, tree is a breadth-first tree from the selection.',
    properties: { layout: { type: 'string', enum: ['cose', 'concentric', 'grid', 'tree'] } },
    required: ['layout'] },
  { name: 'set_physics', level: 'view',
    description: 'Tune the cose layout physics: spring_length is the ideal edge length (40–280), pull is the edge elasticity (10–300). Re-runs the layout.',
    properties: { spring_length: { type: 'integer' }, pull: { type: 'integer' } }, required: [] },
  { name: 'set_view_preset', level: 'view',
    description: 'Apply one of the reader’s preset graph views in a single step: overview (everything, force-directed), reading-map (the document tree, as a tree), pyramids (family peaks over their members), concept-web (derived concept links), around-selection (explore two hops around the selected node with paths to the peaks).',
    properties: { view: { type: 'string',
      enum: ['overview', 'reading-map', 'pyramids', 'concept-web', 'around-selection'] } },
    required: ['view'] },
  { name: 'explore_selection', level: 'view',
    description: 'Focus the graph on the selected node’s neighbourhood: only nodes within the given number of hops stay visible. Pass id to select first; degrees sets the hop count (0–6); to_peaks true extends the walk all the way instead.',
    properties: { on: { type: 'boolean', description: 'true focuses on the selection, false shows the full view again.' },
      id: { type: 'string', description: 'Select this node first (optional).' },
      degrees: { type: 'integer', description: 'How many hops to keep, 0–6.' },
      to_peaks: { type: 'boolean', description: 'Walk the whole reachable neighbourhood.' } },
    required: ['on'] },
  { name: 'show_sources', level: 'view',
    description: 'Toggle what feeds the graph canvas: the document’s own nodes, the document section tree, the family peaks (one summit per family), and the derived concept links. Pass only what should change; all sources off means an empty canvas.',
    properties: { document: { type: 'boolean' }, doc_tree: { type: 'boolean' },
      family_peaks: { type: 'boolean' }, derived_links: { type: 'boolean' } }, required: [] },
  { name: 'pin_peaks', level: 'view',
    description: 'Pin the summit nodes (document root, family peaks, derived groups) into fixed stacks so the rest of the layout arranges under them.',
    properties: { on: { type: 'boolean' } }, required: ['on'] },
  { name: 'paths_to_peaks', level: 'view',
    description: 'Highlight the paths from the selected node up to the visible summits.',
    properties: { on: { type: 'boolean' } }, required: ['on'] },
  { name: 'set_highlight_kinds', level: 'view',
    description: 'Choose which families are highlighted in the source panel. An empty list clears all highlighting.',
    properties: { kinds: { type: 'array', items: { type: 'string',
      enum: ['concept', 'claim', 'hypothesis', 'objective', 'example', 'edge', 'nbn', 'alias'] } } },
    required: ['kinds'] },
  { name: 'set_graph_look', level: 'view',
    description: 'Adjust the graph’s look: labels on or off, label size s, m or l, boxed labels on or off. Pass only what should change.',
    properties: { labels: { type: 'boolean' }, size: { type: 'string', enum: ['s', 'm', 'l'] },
      boxed: { type: 'boolean' } }, required: [] },
  { name: 'show_panel', level: 'view',
    description: 'Show or hide the side panel (the source and the graph).',
    properties: { on: { type: 'boolean' } }, required: ['on'] },
  { name: 'show_graph', level: 'view',
    description: 'Show or hide the graph inside the panel.',
    properties: { on: { type: 'boolean' } }, required: ['on'] },

  /* ---- author ----------------------------------------------------------- */
  { name: 'add_scratch_node', level: 'author',
    description: 'Add a SCRATCH node to the graph canvas: an exploration element, visibly styled as unsaved and unanchored. It never touches extraction.json — anything anchored ships through the gates.',
    properties: { id: { type: 'string', description: 'A new id, kebab-case.' },
      label: { type: 'string' }, note: { type: 'string', description: 'Why this node (optional).' } },
    required: ['id', 'label'] },
  { name: 'add_scratch_edge', level: 'author',
    description: 'Add a SCRATCH edge between two existing nodes (extraction or scratch), visibly styled as unsaved.',
    properties: { from: { type: 'string' }, to: { type: 'string' },
      label: { type: 'string', description: 'The verb (optional).' } }, required: ['from', 'to'] },
  { name: 'clear_scratch', level: 'author',
    description: 'Remove every scratch node and edge from the canvas.',
    properties: {}, required: [] },
  { name: 'annotate', level: 'author',
    description: 'Attach a session-local note to a node. Notes live only in this session and are returned by get_drafts for the human to carry onward.',
    properties: { id: { type: 'string' }, note: { type: 'string' } }, required: ['id', 'note'] },
  { name: 'draft_crossref', level: 'author',
    description: 'Draft a crossrefs.json entry for a use of this document, rated against the usage model. The draft is returned by get_drafts as JSON for the human to review and commit — the chat proposes, the gates and the human dispose.',
    properties: { where: { type: 'string', description: 'Path or URL of the use.' },
      what: { type: 'array', items: { type: 'string' }, description: 'Concept ids the use draws on.' },
      how: { type: 'string', description: 'quote, paraphrase or derivation.' },
      rating: { type: 'string', enum: ['aligned', 'stretched', 'misaligned', 'unrated'] },
      note: { type: 'string' } }, required: ['where', 'what', 'how', 'rating', 'note'] },
  { name: 'get_drafts', level: 'author',
    description: 'Every annotation, scratch element and drafted crossref from this session, as JSON the human can carry into the repo.',
    properties: {}, required: [] },
];

/**
 * Project the command table into OpenAI function-calling tool schemas,
 * filtered to the enabled levels. Unknown level names throw: a silently
 * ignored level would look like a working switchboard that is not one.
 * @param {string[]} levels
 * @param {Array} [commands]
 * @returns {Array<{type: 'function', function: object}>}
 */
export function toolSchemas(levels, commands = COMMANDS) {
  for (const l of levels) {
    if (LEVELS.indexOf(l) === -1) throw new Error('unknown tool level: ' + l);
  }
  return commands.filter((c) => levels.indexOf(c.level) !== -1).map((c) => ({
    type: 'function',
    function: {
      name: c.name,
      description: c.description,
      parameters: { type: 'object', properties: c.properties, required: c.required,
        additionalProperties: false },
    },
  }));
}

/**
 * Clamp a byte range against a text length: start defaults to 0, end to
 * start + cap, and the span never exceeds cap characters.
 * @returns {{start: number, end: number}}
 */
export function clampRange(start, end, length, cap = 6000) {
  const s = Math.max(0, Math.min(Number.isFinite(start) ? start : 0, length));
  let e = Number.isFinite(end) ? end : s + cap;
  e = Math.max(s, Math.min(e, length, s + cap));
  return { start: s, end: e };
}
