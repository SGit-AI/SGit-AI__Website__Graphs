# The universe chat: a plan

**version** written at v0.4.13 · **date** 24 August 2026
**status** PROPOSED. Nothing in this pack is built. It plans the chat panel for the universe
pages; the founder decides what survives.
**sources** the founder's voice brief of 24 August; this repo's universe reader
(`assets/universe/`); the published component estate at
[the-cyber-boardroom/SGraph-AI__Tools](https://github.com/the-cyber-boardroom/SGraph-AI__Tools);
`sgit.ai/llms.txt` (checked: it carries agent docs but **no chat/LLM UI entries yet** — the
founder suspected as much and is right).

---

## What is being asked for

A chat session docked to the right of the universe pages (`/v2/universe/<slug>.html`), with
five properties, in the founder's words:

1. **Independent of the page.** The page and the page's JavaScript should not be aware of
   what is going on in the chat.
2. **The OpenRouter workflow we use everywhere.** User-supplied key, model picker, streaming.
3. **Chat with the contents** — the graphs, the universe, the extraction, the frozen source.
4. **Manipulate the page from the chat** — invoke the commands that already exist on the page:
   select, hide, focus, subtree, layouts, the reader's whole instrument panel.
5. **A normal chat UI** — including pasting screenshots, because sometimes a screenshot is the
   best way to say it — with the available tools exposed at multiple levels, switchable.

There are worked examples of what this chat should feel like in the SG/Send vaults around the
**Graph Explorer** and the **risk register / risk mandate**. Those vaults are encrypted; this
plan was written without seeing them. **Open input 1:** a link or token to those vaults, so the
UX baseline is theirs and not reinvented.

---

## What already exists, surveyed

### In this repo: a reader with an instrument panel but no public API

The universe reader (`assets/universe/reader.js` + three custom elements) already has every
command the chat needs — but they are **closed over inside `boot()`** and reachable only
through DOM events:

| Capability | Where it lives today |
|---|---|
| select / clear the one selection | `select(aid)`, `clearSelection()` — private functions in the reader shell |
| focus a graph node, ring + dim + centre | `uni-graph.focus(id, tempo)` — public on the element |
| subtree-only filtering, doc-tree overlay | `uni-graph.applySubtree()`, options strip buttons |
| layouts (cose, rings, grid, tree), physics, labels, fit | `uni-graph` options strip |
| highlight kinds in the source, scroll tempo, panel/graph toggles | reader state + `uni:pref` events |
| the data | `window.UNIVERSE` (anchors, taxonomy, elements, extraction URL, source URL) — already global |

The wiring discipline is clean — data down as properties, events up as `uni:*` CustomEvents —
and gate 27 unit-tests the pure core. What is missing is a **published, named command surface**.

### In the Tools estate: everything else, already built and documented

The founder remembered right: the "JS API support to the page" is documented. It is the
**Tool API Primitive** (`library/api/v0.1.91__tool-api__*.md`), live in infographic-gen:

- `SgToolApi` — a page registers named methods, calls `activate()`, and is published to
  `window.__tool` / `window.__tools`; the UI is *one consumer*, and Playwright, the browser
  console and **LLM agents are equal consumers with identical access**.
- Per-tool **SKILL files** (`SKILL-human.md`, `SKILL-browser.md`, `SKILL-api.md`), fetched at
  runtime via `meta.getSkills()` — which is exactly the self-description a chat agent needs.
- `meta.getMethods()`, `meta.getLog()` (last 500 invocations), `health()` — the audit trail.
- Auto-binding dev components: `sg-tool-api-console`, `sg-tool-api-explorer`,
  `sg-tool-api-manifest`.

And the chat stack itself is a published component family, served from
`https://tools.sgraph.ai` with permissive CORS, importable as ES modules from any HTTPS origin,
version-pinned in the URL:

| Component | Role here |
|---|---|
| `sg-llm-connection` | provider tabs (OpenRouter default), masked key, model list, auto-connect. **Keys live only in `localStorage['sg-llm-config']` and are never sent to any \*.sgraph.ai domain** |
| `sg-llm-model-picker` | model choice with favourites |
| `sg-llm-request` | the headless engine: streaming, `tools` / `tool_choice` / `response_format` pass-through, provider-format normalisation (OpenAI-canonical) |
| `sg-llm-chat-history` | bubbles, streaming, the messages array, system-prompt editor, `exportMarkdown()` |
| `sg-llm-chat-input` | the input bar — **clipboard paste of images is already built** (Ctrl+V → dataUrl → `image_url` content part), plus drag-drop and a file picker |
| `sg-llm-stats` | token/cost accounting |
| `sg-llm-bundle` / `sg-llm-bundle-list` | session save/load, time-travel |
| `sg-tool-runner` | executes tool calls from `llm:tool-calls`, returns `llm:tool-results-complete` |
| `sg-agentic-loop` | the loop: max iterations, cost budget, optional human-in-the-loop, trace timeline |
| `sg-tool-definition` | visual tool-schema editor (the "expose tools or not" UI) |

All of it is event-driven over a `[data-llm-bus]` ancestor element — no component imports
another's internals. The agentic design doc (`v0.20.33__design__agentic-components.md`)
specifies the full event flow, and tools are authored once in OpenAI function-schema format.

---

## The architecture: two strangers on one page

The independence requirement becomes a stated contract, and it is testable:

> **The page publishes an API; the chat consumes it. Neither imports the other's modules.
> Removing the chat's one script tag leaves the page behaving byte-for-byte as today. The
> reader never knows the chat exists; the chat knows the page only through
> `window.__tool` and the `SGA_TOOL` / `uni:*` events.**

```
┌─ /v2/universe/<slug>.html ────────────────────────────────────────────────┐
│                                                                           │
│  ┌─ the page (exists today) ──────────┐  ┌─ the chat (new, optional) ───┐ │
│  │ reader.js + uni-graph/source/opts  │  │ [data-llm-bus] root          │ │
│  │            │                       │  │  sg-llm-connection           │ │
│  │  NEW: universe-api.js adapter      │  │  sg-llm-chat-history         │ │
│  │  SgToolApi('universe-reader')      │  │  sg-llm-chat-input (📸 paste)│ │
│  │  → window.__tool, tool:ready       │  │  sg-tool-runner              │ │
│  └────────────┬───────────────────────┘  │  sg-agentic-loop             │ │
│               │                          │  sg-llm-stats · bundles      │ │
│               └── window.__tool ◄────────┴──── the only bridge ─────────┘ │
└───────────────────────────────────────────────────────────────────────────┘
```

Two things fall out of this shape for free:

- **The page API is worth shipping alone.** Once `window.__tool` exists, the browser console,
  Playwright CI and any agent driving a real browser can operate the reader with no chat UI at
  all. This extends gate 27's testing story: reader behaviours become drivable, headless.
- **The chat is worth shipping dumb.** A chat panel with zero tools is already useful
  (paste a screenshot of the graph, ask about the extraction). Tools arrive as a later phase
  without touching the panel.

---

## The command surface: three levels, exposed on purpose

The founder asked for "multiple levels of tools ... available or not". Registered as tiers in
the tool-api adapter, so the chat (and its human) can enable them per level:

### Level 0 · Read — the universe as data

| Method | Returns |
|---|---|
| `getDoc()` | slug, title, source path, SHA-256, counts |
| `getNodes({family?})`, `getNode(id)` | extraction nodes: statement, support state, anchor |
| `getEdges()`, `getAliases()`, `getNearButNots()` | the relations and distinctions |
| `getAnchor(aid)` | section, quote, byte offsets |
| `getSourceText({from?, to?})` | the frozen bytes (fetched once from `source.md`) |
| `getTaxonomy()`, `getCoverage()` | structure and yield |
| `getState()` | current selection, kinds, panel/graph/layout state |

### Level 1 · View — drive the instrument

| Method | Does |
|---|---|
| `select(aid)` / `clearSelection()` | the one selection, everywhere at once |
| `focus(id)`, `fit()`, `clearFocus()` | camera and ring |
| `setLayout('cose'\|'concentric'\|'grid'\|'tree')`, `setPhysics({len, pull})` | layouts |
| `showSubtree(aid)` / `exitSubtree()`, `toggleDocTree(on)` | filtering |
| `setKinds([...])`, `setLabels(on)`, `setSize('s'\|'m'\|'l')` | highlighting and look |
| `showPanel(on)`, `showGraph(on)`, `scrollToRow(rowId)` | the frame |

### Level 2 · Author — create and change (off by default)

| Method | Does |
|---|---|
| `addNode({...})`, `addEdge({...})`, `hideElements([...])` | scratch elements on the cytoscape canvas, visibly styled as **unsaved, unanchored** — an exploration layer, never written to `extraction.json` |
| `annotate(aid, note)` | session-local notes, exportable |
| `draftCrossref({...})`, `draftExtractionPatch({...})` | produce a JSON draft for the human to carry into the repo — the chat **proposes**, the gates and the human dispose |

Level 2 is where the creation-workflow exploration happens, and the boundary is the estate's
own rule restated: anything anchored ships through `extraction.json` and the gates, or it is
visibly scratch. A chat cannot push an unverifiable quote past gate 23, and should not look
like it can.

Every level 1/2 invocation is in `api.meta.getLog()` — the audit trail is free.

### From registry to tool schemas

The chat does not hand-author tool definitions. A small generator walks
`__tool.meta.getMethods()` + the manifest and emits OpenAI function schemas (the format
`sg-llm-request` already converts per provider), filtered by the enabled levels. New page
commands become chat tools by being registered, nothing else.

---

## The phases, each ending at a gate

### Phase A · The page API, no chat

1. `assets/universe/universe-api.js`: an adapter module, loaded by `reader.js` after boot,
   that registers the level 0/1 surface over the existing closures and elements. No component
   is modified; the reader gains one `init`-style call. (If vendoring is chosen — below — a
   local copy of the three-file `sg-tool-api` core lands under `assets/vendor/`.)
2. `SKILL-browser.md` and `SKILL-api.md` for the universe-reader tool, served beside the page,
   per the tool-api convention.
3. `sg-tool-api-console` available behind a dev flag (`?console=1`) for hand-testing.

**Gate A:** every command drivable from the browser console; `admin/tests/universe.test.mjs`
extended to cover the adapter's pure parts; gate 27 stays green; the pages render unchanged.

### Phase B · The chat panel, chat only

1. `assets/universe-chat/chat.js`: one entry module that builds the docked panel (its own
   `<aside>`, its own CSS file, its own resizer), sets up `[data-llm-bus]`, and mounts
   connection, model picker, history, input, stats and bundles.
2. OpenRouter as the default provider tab; the key is the user's, pasted once, in
   `localStorage` only — consistent with the estate's zero-knowledge posture.
3. Screenshots work day one (`sg-llm-chat-input` clipboard paste → multimodal message).
4. A base system prompt grounded in the page: doc title, the layer-model preamble, the
   dictionary (22 concepts fit trivially), and *how to cite* — anchors by node id.
5. Load is **opt-in**: a "chat" button in the reader toolbar area injects the script
   (or `?chat=1`). The page ships zero LLM bytes for readers who never ask.

**Gate B:** with the chat script absent the pages are behaviourally identical (the existing
reader tests double as the proof); with it present, a conversation with a pasted screenshot
round-trips through OpenRouter; nothing in `assets/universe/` was touched by this phase.

### Phase C · The tools

1. The schema generator (registry → OpenAI function schemas, level-filtered).
2. `sg-tool-runner` bound to `window.__tool` — a thin binding that maps tool calls to
   `__tool.<method>(params)`; `sg-agentic-loop` for multi-step runs, max-iterations and cost
   budget on, human-in-the-loop for level 2.
3. The level switchboard in the panel (via `sg-tool-definition` or a simple three-toggle UI).

**Gate C:** "select the fractal principle, show only its subtree, then lay it out as a tree"
works as one instruction; the invocation log shows exactly what ran; disabling a level makes
its tools disappear from the next request.

### Phase D · The universe workflows

Where this stops being a demo and starts serving the book: chat-assisted **extraction review**
(the PDF review contract, interactive: "is this what the document says, and is the anchor
fair?" — with the source panel jumping to each anchor as it is discussed), crossref drafting
against the usage model, and the exploration workflows the founder described — peaks and
valleys, transversal concepts, what funnels up. This phase should be shaped by the Graph
Explorer / risk-register vault examples (open input 1) and by using phases A–C on real
review sessions first.

---

## Decisions this plan needs (the founder's, not the plan's)

1. **CDN or vendored.** The estate imports pinned versions from `tools.sgraph.ai` (CORS is
   open; module-relative imports resolve against the CDN, so it works from graphs.sgit.ai).
   But this repo's house style vendors its dependencies (`assets/vendor/cytoscape.min.js`) and
   the site promises to work as frozen bytes. Recommendation: **vendor the pinned versions**
   into `assets/vendor/sg/` with a recorded manifest (component, version, source URL, SHA-256)
   — the universe's own provenance discipline applied to its tooling — refreshed deliberately,
   never hot-linked. Cost: a sync script and the bytes in the repo.
2. **Published or flagged.** Does the chat button ship on the live GitHub Pages site
   (REFERENCE DRAFT badge notwithstanding), or stay behind `?chat=1` until phase D? The key
   never leaves the browser either way; this is a question of what a stranger sees.
3. **The vault baseline.** Which vault is the UX reference — Graph Explorer, risk register,
   risk mandate — and can this repo's plan get eyes on it?
4. **Default model.** The estate's current default is `anthropic/claude-haiku-4-5` via
   OpenRouter; the review workflows may want a stronger default with the picker for the rest.
5. **llms.txt.** When phases A–B land, both this site's `llms.txt` and the tool's SKILL files
   should say the pages are agent-drivable — and sgit.ai's llms.txt gap (no chat/LLM entries)
   is worth a brief to that site's own agent, since the components being reused are the
   family-wide story.

---

## What this plan deliberately does not do

- It does not modify `uni-graph`, `uni-source` or `uni-options`. ADR-7's lesson (five graph
  copies, convention enforced by none) applies: the API adapter wraps the one reader, it does
  not fork it.
- It does not let the chat write to `extraction.json`, `crossrefs.json` or any anchored
  artefact. Drafts out, gates in.
- It does not build a bespoke chat UI. Eighteen LLM components with manifests exist, versioned
  and documented; the work here is one adapter, one panel assembly, one schema generator and
  the SKILL files.

---

This document is released under the Creative Commons Attribution 4.0 International licence (CC BY 4.0).
