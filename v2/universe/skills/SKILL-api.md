# universe-reader — SKILL-api

The precise API spec for the `universe-reader` tool published on every universe document page
(`/v2/universe/<slug>.html`). The tool implements the family's Tool API Primitive: an
`SgToolApi` instance on `window.__tool` (and `window.__tools['universe-reader:<slug>']`),
activated after the reader boots, announced by a `tool:ready` CustomEvent on `window`.

Every method returns a Promise. Every invocation is recorded in `__tool.meta.getLog()`
(last 500: params, result, duration, error). Unknown ids and bad parameters throw.

## Levels

| Level | Meaning |
|---|---|
| `read` | the universe as data; safe, side-effect-free |
| `view` | drive the reader's instrument panel (selection, layouts, filtering) |
| `author` | scratch canvas elements and session drafts; nothing anchored is ever written |

`__tool.get_tool_schemas({levels: ['read','view']})` returns OpenAI function-calling schemas
for the enabled levels — the canonical projection for LLM consumers. `__tool.get_levels()`
lists the levels.

## Methods — read

| Method | Params | Returns |
|---|---|---|
| `get_doc` | — | slug, title, source path, SHA-256, counts |
| `get_nodes` | `{family?}` | extraction nodes (id, family, label, statement, support/defined) |
| `get_node` | `{id}` | one node in full, with its anchor (section, quote, byte range) |
| `get_edges` | — | asserted relations with verb, inverse, anchor |
| `get_pairings` | — | `{also_called[], near_but_not[]}` |
| `get_anchor` | `{id}` | section, byte offsets and label for any item id (`edge-N`, `nbn-N`, `alias-N` included) |
| `get_source_text` | `{start?, end?}` | up to 6000 chars of the frozen source, byte-addressed |
| `get_coverage` | — | the taxonomy with each section's yield |
| `get_crossrefs` | — | the usage ledger, rated against the usage model |
| `get_state` | — | selection, layout, kinds, panel/graph visibility, draft counts |
| `compose_node_doc` | `{id}` | the full composed record of one node (claims, relations both ways, uses) |
| `rank_nodes` | — | every node by richness — where the meaning is, and where it is starving |
| `search` | `{text}` | loose-text match over ids, labels, statements, quotes |
| `graph_snapshot` | `{full?}` | the canvas as a PNG data URL (the chat attaches it as an image) |
| `get_recent_activity` | `{since?}` | the interaction ledger — what the user last tapped or clicked |
| `price_next_hop` | `{degrees?}` | what one more explore degree would add around the selection |
| `get_lexicon` / `get_usage_model` | — | the scoped lexicon; the usage model with its level tests |

## Methods — view

| Method | Params |
|---|---|
| `select_node` | `{id}` — selects everywhere: row, source bytes, graph ring |
| `clear_selection` | — |
| `fit_graph` | — |
| `set_view_preset` | `{view: overview\|reading-map\|pyramids\|concept-web\|around-selection}` |
| `set_layout` | `{layout: cose\|concentric\|grid\|tree}` |
| `set_physics` | `{spring_length?, pull?}` |
| `explore_selection` | `{on, id?, degrees?, to_peaks?}` — the N-hop neighbourhood filter |
| `show_sources` | `{document?, doc_tree?, family_peaks?, derived_links?}` |
| `pin_peaks` / `paths_to_peaks` | `{on}` |
| `pin_nodes` | `{left?, right?, clear?}` — arbitrary stacks, locked for the layout run |
| `scroll_to_heading` | `{title}` |
| `step_anchor` | `{direction: next\|previous}` — the audit walk |
| `maximize_graph` | `{on}` |
| `reset_view` | — — overview preset, nothing pinned, selection cleared, no reload |
| `set_highlight_kinds` | `{kinds: string[]}` |
| `set_graph_look` | `{labels?, size?, boxed?}` |
| `show_panel` / `show_graph` | `{on}` |

## Methods — author

| Method | Params | Note |
|---|---|---|
| `add_scratch_node` | `{id, label, note?}` | dashed orange, visibly unsaved |
| `add_scratch_edge` | `{from, to, label?}` | endpoints must exist on the canvas |
| `clear_scratch` | — | |
| `annotate` | `{id, note}` | session-local |
| `draft_crossref` | `{where, what, how, rating, note}` | a JSON proposal; a human commits it |
| `get_drafts` | — | everything above, as carryable JSON |

**The author boundary:** nothing in this level writes `extraction.json`, `crossrefs.json` or
any anchored artefact. Scratch elements are styled as unsaved; drafts are returned as JSON for
a human to review and carry through the gates (gate 23 verifies anchors; a chat cannot).

## meta

`__tool.meta`: `getMethods()`, `getVersion()`, `getEvents()`, `health()`, `getLog()`,
`getSkills()` (fetches this file and SKILL-browser.md), `getManifest()` (synthesised).

---

This document is released under the Creative Commons Attribution 4.0 International licence (CC BY 4.0).
