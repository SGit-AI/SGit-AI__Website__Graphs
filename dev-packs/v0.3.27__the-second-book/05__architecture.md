# Architecture: The Decisions, As ADRs

**version** v0.3.27 · **date** 23 August 2026
**status** PROPOSED. ADR-1 is in file 03. Each ADR states its alternative and what it costs.

---

## ADR-2 · Five source trees, not one tree with five views

**Status** PROPOSED · **Drives** memo 1.12, 2.10

### Decision

Each altitude is its own directory of authored units. They are related by typed edges, not by
being generated from one another.

```
books/02__second-edition/
  graph/                  the book's own graph: nodes, edges, evidence   (authored, JSON)
  l1/  l2/  l3/  l4/  l5/ the units at each altitude                     (authored, markdown)
  PROVENANCE.json         where each unit came from in the first edition
```

### Why not generate the levels from one another

Because compression is not a transformation a machine can be trusted with, and the corpus says
so in its own words. *Refactoring Meaning* (carried at `docs/refactoring-meaning.html`) makes
the argument: going up the ladder is **decompilation rather than compilation**, lifting is
one-to-many, and only the author can resolve the ambiguity. A generated level 2 would be a
machine's guess at what the author meant, presented as the author's compression.

So each level is written, and the machine's job is to **check** the relationship rather than
produce it: every L2 node declares which L3 nodes it compresses, and a gate fails when a
declared child does not exist or an L3 node has no parent.

### What it costs

Five times the authoring. That is the honest cost and it is the reason level 5 is deferred: at
five altitudes over the same material, level 5 is most of the total work and it is the level
that benefits most from the graph being settled first.

---

## ADR-3 · Six node families, one graph

**Status** PROPOSED · **Drives** memo 1.15

### Decision

The book's graph holds six families of node, and any of them can be a peak.

| Family | What it is | Example |
|---|---|---|
| **Unit** | a piece of the book at an altitude | *L2 section 3* |
| **Concept** | a named idea with a definition, also-called and near-but-not | *meaning through connectivity* |
| **Fact** | a claim with resolving evidence | *the Regulation Graph vault holds 1,523 nodes* |
| **Assertion** | a claim argued but not evidenced | *merging vocabularies erases the finding* |
| **Opinion** | a claim stated as preference, labelled | *graph RAG's vector step is the wrong trade* |
| **Hypothesis** | a claim the book expects to test later | *audience variants preserve the graph* |
| **Objective** | what a passage is trying to achieve for a reader | *make the sentence test usable tomorrow* |

That is seven rows for six families because Fact, Assertion and Opinion are one family
(**Claim**) distinguished by evidence state, exactly as the first book's inventory already
derives them. Keeping them one family with a computed state is what stopped the first book
hand-typing its own inventory, and it stays.

### Why Objective is in the graph

Memo 1.15 lists it, and it earns its place: it is the only family that lets the book check
whether a unit does what it was written to do. An objective with no unit is unaddressed. A unit
with no objective is prose with no job.

### Every edge is bidirectional

Memo 1.16. The existing edge registry already requires a distinct inverse per verb, and the
banned generic association edge stays banned. The book's own source is now subject to the
grammar the book teaches, which is the first time that has been true.

---

## ADR-4 · Themes are computed, not declared

**Status** PROPOSED · **Drives** memo 1.8, 1.9. This is the one that makes the book different.

### Decision

The book does not contain a sentence of the form "the themes of this book are X, Y and Z"
unless a build has computed that evidence converges on X, Y and Z.

The mechanism, stated so it can be argued with:

```
peak(n) = internal(n) + external(n)

internal(n) = inward_edges(n) × 2  +  outward_edges(n)  +  units_carrying(n)
external(n) = carried_sources_measuring(n) × 2  +  vault_demonstrations(n) × 3
```

The change from the first book is `external`. Today strength counts a demonstration but not the
twenty-one carried sources, which means the concept map measures how much the book talks about
an idea and not how much the corpus outside it does. Memo 1.9 asks for external evidence to
produce the peaks, and this is that, in one line.

### The check that gives it teeth

For every statement on the spine, and every claim the book calls a theme:

```
CHECK  theme-has-converging-evidence
       at least 3 independent evidence paths terminate at this node,
       and no more than 1 of them passes through another spine node
```

The second clause is the one that matters. Three paths that all run through the same intermediate
node are one path with three names, which is precisely the failure the decisions register found
when four pieces of blocked work turned out to be two.

### What it costs

It will fail. Some statement the founder believes is central will not have converging evidence,
and the honest responses are to find the evidence, demote the statement, or record it as an
opinion. All three are better than asserting it, and the third is a legitimate outcome: an
opinion clearly labelled is not a defect.

---

## ADR-5 · The grammar is generated from the registry, not written

**Status** PROPOSED · **Drives** file 02's verdict on chapter 4

### Decision

The edge set chapter is generated from the edge registry that validates the book's own graph.
One definition, two consumers: the validator and the chapter.

Today the edge set is hand-written prose that happens to agree with a registry in
`gen_altitudes.py`. Nothing checks the agreement. When the second book's source is itself a
graph, a disagreement between the chapter and the validator would mean the book documents a
grammar it does not use, which is the most embarrassing failure available to it.

The same applies to the honesty table (chapter 12), which is already wrong in two places, and to
the network chapter (14), which went stale once.

---

## ADR-6 · The reading version and the hyperlinked version are one source

**Status** PROPOSED · **Drives** memo 1.13

Each altitude produces two outputs from the same units: a **hyperlinked** version where every
node reference is a link and every descent edge is navigable, and a **reading** version that
works linearly, on paper, with no link that carries meaning.

The rule that makes this safe: **no sentence may depend on a link to be complete.** A link may
enrich; it may never be the object of a verb. This is testable, and it becomes a gate: strip
every anchor from the reading version and no sentence loses its subject or object.

---

## ADR-7 · One graph component, five call sites

**Status** PROPOSED · **Drives** file 02's front-end verdict

`altitudes-graph.js`, `concepts.js`, `decisions.js` and `docs.js` each rebuilt node styling,
fit-on-layout, mode toggles, and the dashed-versus-solid convention for measured versus authored
edges. The convention was only named on the fifth copy.

The second book gets one graph module with a declared vocabulary (node families to colours,
edge kinds to line styles, measured versus authored) and the pages configure it. This is a
prerequisite for the visualisations in file 07, not a tidy-up: the convention has to be
enforceable before it can be trusted, and five copies cannot enforce anything.

---

## ADR-8 · Provenance edges, not equality, between editions

**Status** PROPOSED · **Drives** memo 2.7, and answers decision r003-D1

Every unit in the second book carries where it came from and what happened to it (CARRY, LIFT,
REWRITE, or NEW). The gate does not require the text to match: it requires the origin to
resolve and the verdict to be present.

This is the decoupling the third review asked for, arriving as a consequence of the rewrite
rather than as a separate project. The gate flips from *the book must equal the site* to *the
book must say where it came from*, which is what decision r003-D1 has been holding.

---

## What is deliberately not decided here

The second book's published path, the names of the five altitudes as a reader sees them, and
whether the front page moves. All three are in file 09.

---

This document is released under the Creative Commons Attribution 4.0 International licence (CC BY 4.0).
