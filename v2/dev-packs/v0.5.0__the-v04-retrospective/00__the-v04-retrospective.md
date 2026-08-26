# The v0.4 retrospective: forty-one releases, one working surface

**version** written at v0.5.0, closing the v0.4 era (v0.4.0, 23 August 2026 &rarr; v0.4.40, 26 August 2026)
**status** RETROSPECTIVE. Facts drawn from the release history, the briefs, the methods register
and the test suites; judgements are the agent's, marked as such.
**the full record** every release, with a paragraph on each: [the v0.4 era](../../../admin/versions-v0.4.html)

---

## What v0.4 was for

v0.4.0 froze the first edition into `v1/` and left the second edition deliberately empty. The
question the era answered was not "what should the second book say" but "what should the second
book BE": what does it mean, mechanically, for a book to be written as a graph? Forty-one
releases in four days answered by building the working surface: the universe reader, the
extraction discipline, the core graph, and the instrument panel a person needs to think with
all of it.

## The achievements, in the order they compounded

1. **The extraction discipline** (v0.4.5–v0.4.10). One pilot document, *Thinking in Graphs*,
   became a layer 1 local graph: 57 nodes, every one anchored to a verbatim quote, every anchor
   byte-verified against the frozen source on every build. The document folder made it
   portable: source copy, extraction, cross-references, usage model. The rule that held all
   era: a node is a statement about a document, never about the world.

2. **The reader as an instrument** (v0.4.8–v0.4.16). The two-pane reader, then the graph as
   something you play rather than look at: layout and physics controls that answer per frame,
   node-pack sources that compose, the explore walk with its next-hop pricing, pinned summits.
   The founder's feedback rounds drove every step, voice memo in, release out, usually the
   same day.

3. **The stability principle** (v0.4.28–v0.4.31, brief 26). "Every node move costs the viewer
   their mental picture" became executable: stable-add holds the canvas still while newcomers
   settle, the viewport never moves uninvited, pinning anchors the summits, the alignment
   rails pull structure into lines without joining the content. This is the era's deepest
   design law, and it composes with Victor's immediate-connection principle into the register
   any future agent now reads first.

4. **Navigation as query** (v0.4.33–v0.4.34, brief 28). Clicking a node shows its universe in
   English, both directions, through declared inverse verbs. Walking hop by hop RECORDS a path
   query that can be edited, generalised, run and projected forward. The graph stopped being a
   picture of the extraction and became a way to interrogate it.

5. **The core graph** (v0.4.37–v0.4.40, briefs 29–30). The era's second foundation, laid in
   its last two days: the document itself transformed to the word (39 sections, 186 blocks,
   342 sentences, 4,221 words), markup as structure, every word form a counted token, the
   formatting graph rebuilding the source byte-identically, and the identity ledger giving
   every structural node a short uid that survives rename, edit and move. Six of the seven
   build gates that guard it did not exist a week ago.

6. **The component proof** (v0.4.39). `<uni-graph>` claimed to be reusable since the v0.4.13
   refactor; the standalone graph page proved it by embedding the same element with no reader
   around it, phone-friendly, in under 130 new lines. Claims about architecture are cheap;
   second call sites are evidence.

7. **The working-pack culture** (throughout). Ten founder memos captured verbatim as briefs
   21–30, each with the agent's instruction table and questions back. Debriefs, a
   brief-and-reply thread with the second agent, a standing design register, and this
   retrospective, all rendered pages, all committed. The methods register grew from the
   projection chain to 34 techniques, every one used in earnest before being written down.

## Conclusions

- **The loop works.** Voice memo &rarr; verbatim brief &rarr; instruction table &rarr; build
  &rarr; live verification, usually inside a day. The founder steered eleven rounds this way
  without writing a line of code, and the verbatim capture meant no instruction was ever
  paraphrased into something easier to build.
- **Gates buy speed, not caution.** Forty-one releases in four days was possible BECAUSE every
  release ran the same validator: 61 unit tests, anchor verification, page/markdown parity,
  link resolution, and by the end the round-trip and ledger gates. Nothing shipped on hope.
- **Two agents can share a repo politely.** The chat agent and this one collided on version
  numbers twice and on a component behaviour once; the discipline that emerged (fetch dev and
  tags before numbering, briefs instead of assumptions, fixes offered and adopted across the
  boundary) is now just how the repo works.
- **Honest debt beats hidden debt.** `uni-graph.js` sits at ~450 lines against a 250 budget,
  recorded in release notes each time it grew, with the v0.4.13 split as the named remedy. The
  debt is real; so is the record of it.

## Learnings, the transferable kind

- **Persistence, not randomness, is what makes identity.** The IDs question resolved into the
  ledger: mint once, carry forward by match-then-mint, retire rather than delete. Offsets
  break, paths move, but a persisted identity with a carry rule survives refactoring, and its
  diff IS change detection.
- **Fit is a decision, not a default.** Half the era's viewport bugs traced to one cause:
  libraries that recentre uninvited. Every layout now runs fit:false and the caller decides.
- **The measurement is the discovery.** The token pass was built to answer "how much is
  padding" (45%) and volunteered the era's best moment: the two words with the highest
  different-meanings score in the pilot are "node" and "graph", the exact examples the founder
  had named in his memo, derived independently by arithmetic.
- **Test the harness too.** An hour went to a zombie headless Chromium holding a debug port
  and serving stale modules, making a working feature look broken deterministically on one
  port. The fix was kill, not code. Verification infrastructure earns the same suspicion as
  the code it verifies.
- **Screenshots need state in the pixels.** The narrated-review round exposed that a recording
  cannot see page state; the state pane put version, selection, sources and the last action
  into every screenshot. Any surface an agent must diagnose from images should broadcast its
  own state.

## Observations, held loosely

- The extraction (57 nodes) and the core graph (4,750 nodes counting words) of the same
  document differ by two orders of magnitude. Layer 1 is a reading; the core graph is the
  text. Everything interesting in v0.5 lives in the joins between them.
- The viewer's strongest features were unknowing implementations of Victor's demos before the
  register made the pattern deliberate. Instinct converging with principle is evidence for
  both.
- One document is extracted; twenty wait. Every mechanism built this era (folders, gates,
  shards, ledgers, graph pages) was designed to fan out without redesign. v0.5 finds out.

## What v0.5 opens

The fan-out (twenty documents through the same pipeline), the extraction anchors migrating to
ledger uids, the book-scope ID registry (the founder's "glue"), sense-splitting the polysemy
candidates as extraction content, graph-level change detection when a document gets its second
version, view time travel and relayout ghosts from the register, and the uni-graph split debt.
The surface is built; v0.5 is what gets made with it.
