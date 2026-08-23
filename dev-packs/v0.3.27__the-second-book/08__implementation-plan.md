# The Implementation Plan

**version** v0.3.27 · **date** 23 August 2026
**status** PROPOSED. Every phase ends at a gate. A phase is not done when the work is done; it
is done when its gate passes.
**releases** Phase 0 ships as **v0.4.0**, and each later phase takes the next minor version, so the
release number says which altitude exists.

---

## The shape

Seven phases. Phases 0 and 1 change no book text at all, which is deliberate: the plumbing and
the freeze have to be real before any writing depends on them.

```
  0  FREEZE      the first edition, hashed and gated                    no writing
  1  PLUMBING    the graph format, the generators, the gates            no writing
  2  THE SPINE   the graph of the argument, and the evidence check      no prose
  3  L1 + L2     the claim, and the five statements                     writing starts
  4  L3          the grammar, the method, the examples, the honesty
  5  L4          the objections, the history, the failures
  6  L5          the reference layer                            gated, opens after 5
```

Phases 3 to 6 each produce a **complete, publishable book**. That is the fractal property doing
work: there is no phase after which the project has a half-finished artefact.

---

## Phase 0 · Freeze the first edition · **DONE at v0.4.0**

**No book text changed. Nothing was deleted.** It was executed as a **move** rather than a
copy, per the founder's answer to open question 1: everything that constitutes the first
edition now sits under `v1/`, `v2/` exists and is empty, `v1/MANIFEST.json` records 236
files and 10.9 MB, and gate 14 was verified negatively before the phase was called done.
Ninety-three redirect stubs hold the former addresses. Two PDF URLs could not be preserved.


1. Copy `content/`, the ladder data and the four review files into
   `books/01__first-edition/`, with a `MANIFEST.json` recording every path, its SHA-256, the
   release (v0.3.26) and the commit.
2. Record the hashes of the frozen published pages: `/book/` and the sixteen chapter sources.
3. Write `books/01__first-edition/README.md`: what this is, and the rule that it never changes.
4. Add **gate 14** to `validate.js`.
5. Write the front page described in file 03. Generate its sequence-of-events section from the
   release table; write the four narrative sections.

**Gate 0:** gate 14 passes, and it has been verified negatively by changing one byte in a frozen
file and watching the build fail. A gate that has never been seen to fail is a gate nobody has
tested.

---

## Phase 1 · The plumbing

**Still no book text.**

1. `graph/registry.json`: the edge vocabulary, seeded from the existing edge registry.
2. `graph/nodes.json`, `graph/edges.json`: empty but schema-valid.
3. `gen_graph.py`: validate, resolve, compute. Emits `graph.json`.
4. `gen_levels.py`: project units to pages, both forms.
5. `gen_checks.py`: the five existing checks, ported, plus `theme-has-converging-evidence`.
6. `gen_grammar.py`: the edge set chapter from the registry (ADR-5).
7. Gates 15 to 21 in `validate.js`.
8. One graph module (ADR-7), and the four existing graph pages repointed at it.

**Gate 1:** the whole chain runs green over an empty book. An empty book that builds is worth
more than a full book that does not, because everything after this depends on the chain being
trustworthy.

---

## Phase 2 · The spine, as a graph, with no prose

**This is the phase that decides whether the method works.**

1. Author the five spine statements as nodes (file 04), with their concepts.
2. Author every evidence edge: to the twenty-one carried sources, the six vault analyses, the
   ladder's findings, and external references with hashes and retrieval dates.
3. Run `theme-has-converging-evidence` over all five.
4. **Read the result and act on it.** A statement without converging evidence is demoted,
   re-evidenced, or labelled an opinion. All three are legitimate; asserting it anyway is not.
5. Build the evidence view (file 07) and look at it. This is the first moment the second book
   can show something the first could not.

**Gate 2:** all five spine statements pass the check, or the ones that do not are explicitly
recorded as opinions with that state in the graph. The founder signs off the spine before any
prose is written, because everything below inherits from it.

---

## Phase 3 · Level 1 and level 2

Writing starts. Roughly 150 words, then roughly 1,500.

1. L1: one paragraph, projecting the spine. It must contain the title's own words, which is the
   test the first book failed (ladder finding 4: compressed honestly, its top paragraph had no
   room for "fractal").
2. L2: five sections, one per spine statement, each ending at a node L3 will expand.
3. Both forms: hyperlinked and reading.
4. First release of the second book. It is complete at its altitude.

**Gate 3:** every L2 node declares what it compresses; those targets do not exist yet, so the
gate is deferred to phase 4 and recorded as a **known open edge set**, published as such. A book
that says which of its edges do not yet resolve is more honest than one that waits.

---

## Phase 4 · Level 3

The grammar, the method, the worked examples, the honesty table. Roughly 8,000 words.

1. Carry chapter 3 (the rules) and chapter 9 (2FA), placing them at nodes first.
2. Generate the edge set chapter from the registry.
3. Generate the honesty table from the claim nodes' evidence states.
4. Write the method chapter: this is new, and it is the retrospective's material. The book
   explaining how it was built is not an appendix in a graph-first book; it is the argument.
5. Close the L2 to L3 descent edges. **Gate 15 now applies in full.**

**Gate 4:** gates 15, 16, 18 and 19 all pass. Every L2 node has children. The honesty table is
generated and therefore cannot be wrong in the two ways the first book's was.

---

## Phase 5 · Level 4

The objections, the history, the failures, the tensions. Roughly 25,000 words.

1. Against schema-first, with its concession stated early (memo 1.6).
2. The fractal argument in full.
3. The evidence estate: the vault analyses distilled, which is what the case-study programme
   was for.
4. Lineage, participant disclosure, what this loses.
5. The Wardley maps decision (file 02, chapter 11) is made here or it is dropped.

**Gate 5:** the whole descent resolves L1 to L4. Every claim has an evidence state. The
inventory of facts, assertions and opinions is derived, not typed.

---

## Phase 6 · Level 5

**Gated closed until phase 5 passes.** Memo 2.11: level 5 arrives once the graphs are agreed and
mapped.

The concept register with full definitions, the path atlas, the carried sources, the measurement
tables, the complete findings register.

**Gate 6:** the machine surface is complete. `graph.json` publishes every node, edge, evidence
hash, peak with its formula, and check with its rule. An agent can answer any question about
what the book claims without parsing a sentence.

---

## What runs alongside, continuously

- **The review workflow.** The second book is reviewed the same way: reviews become `r005`
  onward in the same register, and the decisions page spans both editions already.
- **The estate.** `/vaults/`, `/docs/` and `/documents/` keep moving and keep being cited.
- **The release discipline.** Version bump, versions row, gates green, commit subject, tag.

---

## The two ways this plan fails

**It gets to phase 3 and starts writing prose faster than it declares nodes.** This is the
likely failure and it will not announce itself, because the prose will be good. The gate that
catches it is 20 (every unit carries a provenance block) combined with 15 (every node has a
parent), and the discipline that prevents it is Rule 1. If a session finds itself writing a
paragraph before the node exists, it has already failed and should stop.

**Phase 2 produces an uncomfortable answer and it gets softened.** If a spine statement has no
converging evidence, the temptation is to add evidence until it does, which is the graph
equivalent of p-hacking. The defence is that the evidence edges are authored, published and
dated, so an edge added to rescue a statement is visible as one. It should still be named as a
risk, because the person adding it will be the person who wants the statement.

---

This document is released under the Creative Commons Attribution 4.0 International licence (CC BY 4.0).
