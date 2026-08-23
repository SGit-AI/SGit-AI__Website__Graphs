# Verification, And What Only The Founder Can Decide

**version** v0.3.27 · **date** 23 August 2026

---

## Acceptance criteria

The second book is not accepted because it reads well. It is accepted because these hold, and
each of them is checked by a build rather than by an opinion.

### At every phase

| # | Criterion | Checked by |
|---|---|---|
| A1 | The frozen first edition still hashes to its manifest | gate 14 |
| A2 | Every node below level 1 has exactly one parent, and every declared child exists | gate 15 |
| A3 | Every claim node carries an evidence state; every fact has a resolving evidence edge | gate 16 |
| A4 | Every unit carries a resolving provenance block with a verdict | gate 20 |
| A5 | No sentence in prose quotes a computed number as a literal | gate 21 |
| A6 | Every internal link resolves; blocks balance; no banned edge; no key-shaped strings | existing gates |

### At the spine (end of phase 2)

| # | Criterion | Checked by |
|---|---|---|
| B1 | Every spine statement has at least three independent evidence paths | gate 17 |
| B2 | No more than one of those paths runs through another spine node | gate 17 |
| B3 | Any statement failing B1 is recorded in the graph as an opinion, not asserted as a theme | gate 17 |
| B4 | The founder has signed off the spine | a decision, recorded in the register |

### At each altitude

| # | Criterion | Checked by |
|---|---|---|
| C1 | The reading version survives anchor-stripping with no sentence losing its subject or object | gate 19 |
| C2 | The edge set chapter matches the registry byte for byte | gate 18 |
| C3 | The honesty table is generated from claim states, not written | gate 16 plus review |
| C4 | Both PDFs build, the spine width matches the page count | existing gates |

### The one criterion that is not a gate

**At the end of phase 4, level 3 should be measurably shorter than the first book's equivalent
altitude, at equal or better coverage.** The first book's chapters 1 to 12 are roughly 15,600
words. Level 3 targets roughly 8,000. If level 3 arrives at 15,000 words, the audit's LIFT
verdicts were a euphemism for CARRY and the rewrite did not happen. This cannot be a build gate
because word count is not quality, but it should be reported on every build and looked at.

---

## What the rewrite does to the ten open decisions

| Decision | What the rewrite does |
|---|---|
| **r001-D2** sign off the sequencing | **Superseded.** The sequencing question was evidence-first versus identity-first. The rewrite is both: the identity is the title of the second book and the evidence is its input. Needs restating, not answering. |
| **r002-D2** pick the graph pilot chapter | **Dissolved.** Every unit is graph-first. There is no pilot. |
| **r002-D3** the combined sequencing | **Superseded**, with r001-D2. |
| **r003-D1** adopt the decoupling | **Answered by construction.** ADR-8: editions are joined by provenance edges, not equality. The gate flips as the third review asked. |
| **r003-D2** which issues logic runs a review folder | **Untouched, still open.** Review tooling, not book structure. |
| **r004-D1** does the ladder continue | **Answered yes, and promoted.** The ladder is not a section of the book; it is the book. `gen_altitudes.py` splits into three, which is what the decision was holding. |
| **r004-D2** where the findings live | **Made urgent.** The second book's graph has a findings family from day one, so this needs answering in phase 1 rather than later. |
| **r004-D3** which audience variant first | **Deferred cleanly.** The five altitudes are the source material for variants, per memo 1.14. The question reopens after phase 6. |
| **r004-D4** confirm the taxonomy classes | **Absorbed into phase 1.** The registry is authored there; confirming it is part of that work. |
| **r004-D5** the vendored dependency | **Untouched, still open**, and its premise is already corrected. |

Four decisions are dissolved or answered by the rewrite. Two are made more urgent. Four are
untouched. That is a real reduction, and it is a reason to start rather than to keep deciding.

---

## Open questions

These are the founder's. Each one blocks something specific, named.

### 1. The freeze: copy or freeze in place? · **ANSWERED 23 August**

**It is a move, to a `v1/` prefix.** Not a copy, and not a freeze in place. The second book takes
its own copies into `v2/` as it needs them, so each edition owns everything it uses. ADR-1 in
file 03 records the boundary, the URL cost and the gate. Shipped as v0.4.0.

### 2. Where does the second book live, and what happens to the front page?

The first edition owns `/book/` and the root `index.html` is its introduction source. The second
book needs a path and, eventually, the front door.

*Blocks:* phase 1. *Options:* the second book at `/v2/` until it is complete then it takes
`/book/` with the first edition moving to `/first-edition/`; or the second book takes a
permanent new path and `/book/` means the first edition forever. *Recommendation:* the second
option, because moving published URLs is what the freeze exists to avoid, and a book that has to
be renamed to be finished has a deadline built into its address.

### 3. What are the five altitudes called, to a reader?

L1 to L5 are engineering names. A reader needs words. Something like *the claim*, *the case*,
*the method*, *the argument*, *the reference*, but these are a proposal and naming is the
author's job.

*Blocks:* phase 3, and everything the navigation says.

### 4. Wardley maps: level 4, or dropped?

Chapter 11 of the first book. Nothing on the spine requires it and nothing in the concept map
depends on it.

*Blocks:* phase 5 only. *Recommendation:* decide at phase 5, not now.

### 5. Are the external evidence weights right?

ADR-4 proposes `carried_sources × 2` and `vault_demonstrations × 3` added to the peak formula.
Those numbers are a proposal and nothing has argued with them. A published, recomputable formula
that nobody has disputed is a proposal wearing the clothes of a measurement, which is the
sharpest tension in the retrospective and it applies here first.

*Blocks:* phase 2's result, though not its mechanism.

### 6. Does level 5 have a bound?

Levels 1 to 4 have word targets. Level 5 is the reference layer and could be unbounded.

*Blocks:* phase 6's gate, and it can wait.

### 7. Who reviews the second book, and when?

The review workflow is the site's strongest process and it produced four rounds on the first
book. The second book should be reviewed from level 2, not at the end.

*Blocks:* nothing yet. Worth deciding before phase 3 ships.

### 8. Is the graph RAG position sized correctly?

Memo 1.17 says it "should not be a big thing", and file 04 proposes one glossary entry and one
passage. If it should be a section at level 4, say so now, because it changes what level 4
argues.

*Blocks:* phase 5.

---

## What would tell us this plan was wrong

Named in advance, because a plan that cannot be falsified is a wish.

1. **Phase 2 passes trivially.** If all five spine statements sail through the converging
   evidence check first time, the check is too weak, not the spine too strong. Expect at least
   one failure. If there is none, tighten the check before writing.
2. **Phase 3 takes longer than phase 4.** Level 1 is 150 words. If those 150 words take longer
   than the 8,000 of level 3, the top-down premise is not working as claimed and the difficulty
   is in the compression rather than in the writing, which would be worth knowing early.
3. **The provenance blocks are all CARRY.** If the second book is mostly carried text with new
   front matter, the rewrite was a reorganisation and the honest thing is to say so and go back
   to the refactor that was cancelled.
4. **Nobody disagrees with anything.** The method's whole claim is that it makes disagreement
   visible and specific. A rewrite that produces no arguments has not produced the thing it was
   for.

---

This document is released under the Creative Commons Attribution 4.0 International licence (CC BY 4.0).
