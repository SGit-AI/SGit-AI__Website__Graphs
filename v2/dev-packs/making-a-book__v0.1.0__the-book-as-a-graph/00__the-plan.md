# The book as a graph — the activities

**Status** PROPOSED. The feasibility probe is done; no code has been written.
**Asked by** brief 43: *"map out a series of activities for how can we leverage the ideas
and the concepts and the tools."*
**Subject** *Creating a Book Using Fractal Semantic Graphs* v0.1.0 — 17 chapters, 26,118
words in prose blocks

---

## The output this serves, named before anything is built

Brief 43 ends with the constraint the WCLM taught: *"we don't develop technology because
it's a cool idea… when we develop a tool, there has to be a clear output for it."* So the
output is stated first and everything below is judged against it.

**The clear output is brief 42's part one.** That memo asks for the book's structure to
change: a new opening part, the history moved behind it, the art of the possible first. Done
by hand that is exactly the expensive, consistency-losing edit brief 42 itself complains
about — *"I had tonnes of notes made, but I didn't have the ability to keep it
consistent."* Done as a **transformation on a graph** it is a build step with a gate.

**The JSON book is what makes brief 42's restructure safe.** That is its purpose. If it does
not end in a restructure that a gate can check, it was a cool idea.

**Second output**: the five reading levels — the Leanpub sample idea in brief 43, and the
agent-facing surfaces brief 42 asked for.

## What the probe found

The pilot's own decomposition was run over all 17 chapters before writing this plan.
**It runs clean.** No failures.

| | Pilot | Book | Factor |
|---|---|---|---|
| sections | 39 | 165 | 4.2x |
| blocks | 186 | 819 | 4.4x |
| sentences | 352 | 1,818 | 5.2x |
| words | 4,136 | 26,118 | 6.3x |
| distinct forms | 927 | 2,850 | 3.1x |

So the memo's claim holds: *"we already have the technology for this."* What it does not yet
have is a **book** level, and three strains are already visible.

## The activities

Seven, ordered so each one is shippable and the risky ones come after the cheap ones.

### A1 — Parameterise the decomposition
`gen_coregraph.py` is hardcoded to one slug and one path. Make the document a parameter,
with the pilot as its first caller so nothing changes for it.
**Produces** a generator that can be pointed anywhere. **Checked by** the pilot's seven
existing gates still passing byte-for-byte.

### A2 — Add the book level
The pilot is document → section → block → sentence → word. A book needs **book → chapter**
above that: chapter order, chapter identity, and a book index that shards per chapter
rather than per section.
**Produces** `book → chapter → section → block → sentence → word`.
**Checked by** every chapter rebuilding byte-identical from the formatting graph, and the
book's chapter list matching `book.json`.

### A3 — Run the book, and let the gates find the strains
The three known ones, each of which is a finding whether it passes or fails:
- **size** — 620KB for the pilot's 4,136 words scales to roughly **4MB** for the book;
- **block kinds at volume** — 13 code blocks, 11 tables, 88 quotes, 63 rules, which the
  pilot exercised only lightly and which gate 5 will test hardest;
- **the identity ledger** across 17 files rather than one.
**Produces** the book's graph, and a written record of what strained.
**Checked by** all seven gates, run at book scale.

### A4 — The five levels
The memo asks for five, including the universe. Proposed, and to be argued with:

| Level | What it holds | Who works here |
|---|---|---|
| 1 · positioning | title, promise, audience, the refusals | editor, publisher |
| 2 · structure | parts, chapters, order, what each promises | editor |
| 3 · argument | claims and the evidence anchoring each | researcher, editor |
| 4 · prose | the sentences | writer |
| 5 · artefacts | figures, tables, code, links, paths | writer, developer |

**Produces** a projection per level from the one graph, not five documents.
**Checked by** each level reconstructing from the graph alone, and every claim at level 3
resolving to prose at level 4.

### A5 — The observability, which brief 43 ranks above the output
*"The parser, and the visualisation of that parser, and the tests of that parser, and the
observability — all of that is more important than the actual output."* So this is not
last, it is the point.
**Produces** a book explorer: the graph navigable at any level, every node showing what it
is made of and what it belongs to, the byte-identical rebuild demonstrable in the browser.
**Checked by** a person being able to find a sentence from the book's positioning and back
again without reading the JSON.

### A6 — The restructure, as a transformation
Brief 42's part one, performed **on the graph**: chapters reordered, a new part inserted,
identities carried forward, the markdown regenerated.
**Produces** the book's v0.2.0 structure.
**Checked by** every surviving chapter byte-identical before and after the move, so the
restructure provably changed only what it meant to.

### A7 — The five samples
Each level rendered as its own artefact for a reader to choose — the memo's Leanpub idea,
and the agent-facing pages brief 42 asked for.
**Produces** five reading surfaces per book.
**Checked by** each one being a projection, never an authored copy.

## What this plan does not claim

- **That it will be smooth.** The memo expects otherwise: *"we're going to learn some
  limitations."* A3 exists to find them.
- **That five is the right number of levels.** A4's table is a proposal.
- **That the graph should replace markdown.** Markdown stays the authored surface; the graph
  is what makes it transformable. Brief 43's own test of maturity is *"how easy it is to
  link, how easy it is to change, how easy it is to transform"* — not what it is stored as.

## The one that would change everything else

**A2, the book level.** Every other activity depends on it, and it is the only one where the
existing model is genuinely missing a concept rather than needing to be pointed somewhere
new. If A2 is harder than it looks, the plan changes shape and it is better to know early.
