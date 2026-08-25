# The immediate-connection register

**status** STANDING DESIGN DOCUMENT, not release-bound. Written at v0.4.35, founder-commissioned,
agent-authored; update it when a pattern lands or a gap closes, and record the release that did.
**audience** every agent and session working on this repo's viewers and tools. Read this before
adding an interactive feature; it names the experience the founder is building towards and the
checklist a change should pass.
**anchor** Bret Victor, "Inventing on Principle", CUSEC, January 2012 — vimeo.com/36579366,
carried with transcript at worrydream.com. The founder's words: "That is the kind of experience
and feedback loops I'm trying to create here."

---

## The principle

Victor's principle: **creators need an immediate connection to what they create.** When you make
a change or a decision, you must see its effect immediately, because most of creation is
discovery, and you cannot discover anything if you cannot see what you are doing.

For this project the principle composes with the founder's own (brief 26): **every node move
costs the viewer their mental picture.** Together they define the target experience: every
action answers instantly, and nothing the viewer did not ask for changes underneath them. An
immediate response that also scrambles the map is not connection; it is noise arriving quickly.

## The five patterns, and where this repo stands

| # | Pattern (Victor's demo) | What it demands | Where the viewer implements it | Gaps |
|---|---|---|---|---|
| 1 | **Scrub a value, watch the world change** (the live-coded tree scene: dragging numbers in code, the picture responding, flowers discovered rather than typed) | Every continuous parameter adjustable with live response; no apply buttons | The physics sliders re-run the layout per animation frame (v0.4.14); the explore degree stepper regrows the neighbourhood per click (v0.4.14); the peak board re-anchors per drop (v0.4.28) | Node sizes and label sizes are stepped, not scrubbed; colour and opacity are fixed |
| 2 | **Show the future before committing** (the platformer: the character's projected trajectory as a live ghost trail while physics is tuned; time paused, rewound, replayed) | Consequences visible before actions are taken; state navigable in time | The stats bar prices the next hop before it is paid for (v0.4.14); **project forward** in the trail board appends a speculative hop and shows what it would match (v0.4.34) | **View time travel**: no rewind of exploration states (specified below). No replay of a session |
| 3 | **Show the data, always** (binary search with each line's concrete values beside the code; the bug visible in a second) | The invisible state rendered next to the thing it describes, continuously | The state pane broadcasts version, selection, sources, counts and the last action into the pixels (v0.4.32); the inspector shows the tapped node's record and links (v0.4.26 to v0.4.33); the stats bar counts the view live | The extraction pipeline itself (gates, anchors) has no live view; it reports only at build time |
| 4 | **Behaviour rendered on the thing, variants side by side** (the circuit editor: voltages plotted on components while editing, alternatives compared) | No edit-then-inspect cycle; comparison as a first-class view | The schema view derives live from the sources that are on (v0.4.30); the legend recounts on every change (v0.4.28) | **Relayout ghosts** (specified below); no side-by-side of two view states or two documents' schemas |
| 5 | **Perform, don't configure** (the leaf animated by moving a finger, performances layered like multitrack audio) | Direct manipulation where the gesture IS the specification | Dragging a pinned summit re-anchors the graph and the layout respects the dragged spot (v0.4.24); the peak board's drag between slots (v0.4.28); the trail: walking the graph IS writing the query (v0.4.34) | No gesture layering: each manipulation replaces the last rather than composing with it |

## The two specified gaps, ready for any agent to build

**View time travel** (pattern 2). The state pane already notes every action; the missing half
is a ring buffer of view snapshots (the graph's `snapshot` getter is the payload, tiny) with a
scrubber that restores them. Restore means: set prefs, selection and visibility, laid out under
stable-add rules so the rewind itself does not scramble the map. Build as an add-on part per
brief 26's module rule. The narrated-review loop doubles its value: a narration's clock plus
the ring makes any moment of a recording reproducible.

**Relayout ghosts** (pattern 4). When the viewer explicitly asks for a full re-arrangement
(a layout button, a preset), each node's previous position briefly persists as a fading ghost
with a thin wisp to its new position, so even a sanctioned redraw preserves the mental map in
transition. Implementation sketch: before the run, copy positions; after, add temporary ghost
nodes (family "ghost", non-interactive, opacity decaying over ~1.5s) plus wisp edges; remove on
a timer. Pure ghost-element builder in core, tested; behaviour in a part.

## The checklist, for any change to an interactive surface

1. **Immediate**: does the effect appear without an apply step, ideally per frame?
2. **Stable**: does anything move that the viewer did not ask to move? (Stable-add and the
   viewport rule are not optional; fit only on explicit request.)
3. **Visible**: is the state this change touches shown somewhere already, and does it update?
4. **Projectable**: can the viewer see what the action WOULD do before doing it, or undo it
   trivially afterwards?
5. **Direct**: could the configuration be a gesture on the thing itself instead of a control
   about the thing?
6. **Modular**: is it an add-on that leaves existing behaviour untouched (brief 26), with pure
   logic in core under gate 27?

## The wider library, when a round needs deeper grounding

"Magic Ink" (2006) for information software as graphic design; "Up and Down the Ladder of
Abstraction" (2011) for the scrub-then-generalise move the trail board makes; "Explorable
Explanations" (2011) for what the reader pages are becoming; "Learnable Programming" (2012)
for show-the-data discipline; "Stop Drawing Dead Fish" and "Drawing Dynamic Visualizations"
(2012, 2013) for performance as specification; "Media for Thinking the Unthinkable" (2013)
for the whole programme. All at worrydream.com.

## Why this register exists

The founder named the talk as the experience target after the path-query round shipped. On
inspection, half the viewer's strongest features were already unknowing implementations of its
demos, which is evidence the instinct and the principle agree; this register makes the
agreement deliberate, so the next agent extends it on purpose rather than by luck.
