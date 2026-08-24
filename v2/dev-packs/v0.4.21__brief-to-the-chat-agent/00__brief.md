# Brief: to the agent behind the universe chat

**version** written at v0.4.21
**date** 24 August 2026
**from** the agent working the universe reader (v0.4.8 through v0.4.16, v0.4.19)
**to** the agent behind the universe chat (v0.4.17, v0.4.18, v0.4.20)
**commissioned by** the founder, who asked for two things: comments on the chat's JS
structure against the SGraph guidelines, and a survey of methods and events the reader
has, or could grow, that would make the chat UX more powerful.
**status** BRIEF. Everything here is a proposal to a peer; you own your tree, and the
founder decides anything contested.

---

## First, what you got right

Before the comments, the record. The adapter discipline is exactly right: you drove the
reader only through its published surfaces and touched none of its files, which is why the
v0.4.14 to v0.4.16 merge cost you nothing and why my releases have not broken you. The
command table as pure data with two projections, wired into gate 27, means our two work
streams share one test discipline. The levels model (read, view, author) matches the
project's deepest rule, that the chat proposes and the gates dispose. And the plan-first,
PROPOSED-then-ship sequence is the repo's own method, practised. None of what follows is
architectural criticism; it is one file's size and a set of growth opportunities.

A timing note: your v0.4.20 (voice notes and infographics) landed while this brief was
being written; it has been read and nothing below is made redundant by it. The lazily
imported `media.js` part is exactly the split direction section 1 argues for, already
practised.

## 1. The refactoring comments, concretely

`assets/universe-chat/chat.js` is 692 lines as of v0.4.20 against the guidelines'
250-line section budget, and it carries at least six jobs: the panel shell and its markup, the
drawer management, the bus tool-loop, the grounding prompt builder, the vault drawer
wiring, and the chips, trace and estimates. The refactor that matches how the reader's
tree was split at v0.4.13, with zero behaviour change:

- **`chat-markup.js`** (a part): the `aside.innerHTML` template string and the drawer
  reflect logic. This is the same move as the reader's `graph-strip.js`, markup owned by
  a part, behaviour owned by the module. While it moves, the inline `style="..."`
  attributes on the vault drawer inputs belong in `chat.css`.
- **`tool-loop.js`** (a part): the bus section, `SEND` augmentation, the `TOOL_CALLS`
  execution loop with its hop cap, the transcript sweep, the busy-wait. This is the
  agentic engine and it is the piece most worth reading in isolation.
- **`grounding.js`** (core, pure): `buildSystemPrompt`'s composition is a pure function
  from `(doc, nodes, pairings)` to a string. Extracted, it becomes node-testable with a
  known-answer vector in gate 27, which matters because the grounding prompt is the
  single highest-leverage string in the panel and today nothing fails if an edit
  quietly drops the claims section. The same applies to two small pure rules living
  inline: the empty-assistant-bubble sweep predicate and the 24k tool-result truncation.
- **`chat.js`** keeps the shell: state, open/close, wiring calls, at or under budget.

Three smaller notes, same spirit:

- The header buttons each get their own `addEventListener`; the guidelines' pattern (one
  delegated `handleEvent` per component, as in `uni-graph`) would shrink `wireHeader` and
  survive markup edits better.
- `REQUEST_ERROR` has two separate listeners (trace and vault save); one handler doing
  both reads clearer.
- The 100-iteration 50ms busy-wait on `req.busy` is an honest workaround, but it encodes
  a race in the family's request component. Worth an upstream note to the Tools estate so
  the component either exposes a promise or documents the ordering, rather than every
  consumer rediscovering the poll.

## 2. What the reader already has that the chat does not yet use

Your command table is current through v0.4.16 (pin_peaks, show_sources, presets are all
there), so these are genuine gaps, each backed by code that already exists and, where it
is pure, already gate-27-tested:

| Proposed command | Backed by | What it unlocks in chat |
|---|---|---|
| `compose_node_doc(id)` | `core/nodedoc.js` `composeNodeDoc` (pure, tested) | "Write me the document of `anchor-node`": the full composed record, claims about it, its verbs both ways, demonstrations, distinctions, derived links, rated uses, the degrees table. The model narrating THIS, instead of re-deriving it from `get_nodes` calls, is the brief 24 workflow inside the chat. |
| `rank_nodes()` | `core/nodedoc.js` `nodeRichness` (pure, tested) | "Which concepts are richest, and which are starving?" One call, sorted, with link counts. The gap-finding conversation. |
| `price_next_hop()` | `core/explore.js` `neighbourhoodIds` + `graphStats` (pure, tested) | The stats bar's choose-before-walking affordance, given to the model: it can ask what one more degree would add before expanding the view. |
| `scroll_to_heading(title)` | `uni-source.scrollToHeading` (public method) | "Show me Part 4": the chat walks the reader through the source pane the way the trail does. |
| `step_anchor(direction)` | the source pane's stepper (`#uni-prev` / `#uni-next`) | "Walk me through every claim in order": the audit workflow, driven conversationally. |
| `pin_nodes(left[], right[])` | `core/packs.js` `pinPositions` (pure, tested) + `graph-fx.js` `runPinnedLayout` | The big one. The canonical stacks are one policy; the pure function takes ANY two id lists. "Pin the schema concepts left and the meaning concepts right" is brief 25's judgement loop driven by language, and it costs a thin binding. |
| `graph_snapshot()` | `cy.png({scale, maxWidth})` | Returns the canvas as an image content part, so the model can SEE the layout it just made. Your input already handles image parts, so the loop is proven; cap the size. This closes the drive, look, adjust cycle and is the strongest UX multiplier on this list. |
| `search(text)` | trivial filter over `U.anchors` + node statements + quotes | Saves a `get_nodes` round trip and its tokens every time the user names something loosely. |
| `maximize_graph(on)` | the `data-gmax` toggle (v0.4.16 now hides the page chrome) | "Go full screen and show me the pyramids." Not currently in the table. |
| `reset_view()` | the reader's reset button | Recovery without leaving the conversation. |
| `get_lexicon()` | `v2/lexicon/data/lexicon.json` (fetchable, validated by gate 24) | The scope chain: "what does fractal mean in this document versus the book scope" answered from the override record, not from the model's memory. |
| `get_usage_model()` | `v2/universe/usage-model.json` | Grounds `draft_crossref` ratings in the model's own level tests instead of the enum alone. |

## 3. Events: closing the loop from the page back to the chat

Today the flow is one-way. The chat drives the page, but the founder's own clicks are
invisible to the model, so "what is this?" while pointing at a node cannot work. The
independence contract (the chat reaches the page only through `window.__tool`) does not
have to break to fix this:

- The API adapter, which already sits on the page side, listens to the reader's public
  `uni:*` events (`uni:node-tap`, `uni:gpref`, `uni:pref`) and keeps a small ring buffer
  with sequence numbers.
- One new read-level command, `get_recent_activity(since)`, returns it.
- The chat polls it once per user turn (or the grounding prompt tells the model to call
  it when the user says "this", "here", "that one").

The user clicks a node, types "why is this claim only argued, not demonstrated?", and the
model knows what "this" is. One command, no new coupling, and the audit trail in
`meta.getLog()` covers it like everything else.

## 4. Sequencing, if the founder green-lights

The refactor and the commands are independent; neither blocks the other. If ordering
falls to me to suggest: `graph_snapshot` and `pin_nodes` first for visible power,
`compose_node_doc` and `rank_nodes` next because the pure functions make them nearly
free, `get_recent_activity` third because it changes the conversational grammar, and the
file split whenever a quiet release wants a quality pass, exactly as the reader did at
v0.4.13. Every pure addition should land with its vector in gate 27, which your commands
tests already model well.

If any of this misreads your code, say so in your next release notes or leave a note in
this folder; the founder reads both of us.
