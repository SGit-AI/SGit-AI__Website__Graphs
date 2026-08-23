# The Visualisations

**version** v0.3.27 · **date** 23 August 2026
**figures** in `figures/`, captured from the live site at v0.3.26

---

## The finding that shapes this whole file

From the retrospective (`documents/what-the-graphs-found.html`), and it is not the intuitive
answer:

> **Aggregate views produced the findings. Per-item views made the structure consumable.**
> Both are compressions and neither is decoration. What differs is what they compress: an
> aggregate compresses a whole corpus into a shape, a per-item view compresses one node's
> neighbourhood into a glance.

The whole-register decisions graph found four pieces of blocked work that two decisions each
were waiting on under different names. The all-documents graph found the concept joins. The
concept map's peak computation found that the position the book argues against is one of its
strongest nodes. The cross-vault table found the capability scale.

The ego graphs, one decision or one document with its neighbours, produced no discovery in that
run. That measurement stands, and an earlier version of this file drew too narrow a conclusion
from it by calling them *reading aids*. The founder's framing is the correct one and it is the
book's own: **a visualisation is a compression**, in the same family as the path tables and the
concept tables, which are also visualisations. Judging a compression by whether it produced a
novel finding is like judging level 2 of the ladder by the same test. Compression's job is to
make a structure consumable at an altitude, and the per-item graphs did that well enough that
they are what made the interconnectivity legible.

**Aggregates are instruments and per-item views are compressions at a smaller scale.** They
deserve different amounts of engineering and different placement in the second book, but the
same amount of trust in what each one is for.

There is a second finding underneath it. The aggregates only produced findings **after**
something had been normalised: block phrases needed shared keys, concept edges needed a canonical
direction, documents needed a measured concept vector. A graph over un-normalised data gives you
a picture. A graph over normalised data gives you a finding. **The normalisation is the
instrument; the layout is the lens.**

---

## What exists today, and what each one is for

| View | Figure | Kind | Verdict |
|---|---|---|---|
| The altitude ladder, Miller columns | `figures/01__ladder-columns.png` | navigation | **carry**, and it becomes the book's own table of contents |
| The ladder as one graph | `figures/02__ladder-graph.png` | instrument | **carry**, and merge with the concept map |
| The concept map | `figures/03__concept-map.png` | instrument | **carry**, extend with external evidence per ADR-4 |
| The path query | `figures/04__path-query.png` | instrument | **carry**, and promote: it is how a reader checks a claimed theme |
| The decisions register, whole | `figures/05__decisions-all.png` | instrument | **carry** unchanged |
| One decision as a peak | `figures/06__decision-ego.png` | local compression | carry, keep cheap |
| The sources, all twenty-one | `figures/07__docs-all.png` | instrument | **carry**, and it becomes the evidence view of the second book |
| One source, its concepts and places | `figures/08__doc-ego.png` | local compression | carry, keep cheap |

---

## The four views the second book needs

Not eight. Four, each with a job that the book's own argument requires.

### 1. The descent view · navigation

The ladder, from L1 down. A reader picks an altitude and descends. Every node shows which node
above compresses it and which nodes below expand it. This is the second book's table of contents
and its primary interface.

*Reuses* the Miller-column ladder, which already works and which the founder has used. Its one
known defect, the flicker on repaint, was fixed at v0.3.18.

### 2. The evidence view · instrument

Every claim in the book, every piece of evidence, and the paths between them. The question it
answers is the one ADR-4 makes central: **does this theme have converging evidence, or does it
just have an author who believes it?**

This is where a spine statement with three paths that all run through one intermediate node
becomes visibly one path with three names. It is the view that has to exist before level 2 is
written, because it is what tells the writer whether the spine holds.

*Extends* the existing all-documents graph with the book's own claims as nodes.

### 3. The concept view · instrument

The dictionary crossed with the thesaurus, at three dimensions, with computed peaks. Entered
from any concept, not from the top, because there is no single centre of gravity.

*Reuses* the concept map. The change is the strength formula gaining external evidence.

### 4. The divergence view · instrument, and new

The one view the first book needed and never had. Two graphs over the same material, drawn
together, with the places they disagree highlighted rather than reconciled.

The corpus asks for this repeatedly: *Ontologies of Ontologies* says bridges rather than merges,
*Concepts, Not Words* says where the graphs diverge is the finding, and the ladder's own findings
register is a list of exactly this shape (the book saying two things in two places). Today the
divergences are found by a check and reported as text. Drawn, they would be the strongest
demonstration in the book of its own central claim.

Candidate pairs to draw: level N against level N+1 (what compression dropped), the first edition
against the second (what the rewrite changed), the book's concept graph against the concept graph
measured in the carried sources (where the book's vocabulary and the corpus's diverge).

---

## The conventions, declared once

ADR-7 makes these enforceable rather than repeated. They are the vocabulary of every view.

| Signal | Meaning |
|---|---|
| Solid edge | authored: a person decided this |
| Dashed edge, with a number | measured: a build counted it, and the number is the count |
| Dotted edge | inherited or onward: context, not part of this graph's claim |
| Gold border | a computed peak |
| Ghosted node or edge | a named absence: something known to be missing |
| Node colour | node family, per ADR-3, one colour per family, never per section |

**The dashed-versus-solid distinction is the most important one in the set**, and it took five
implementations before it was named. A reader must be able to tell, at a glance, which links a
machine counted and which a person asserted. Blurring them would make every measured claim look
authored and every authored claim look measured, which is exactly the failure the whole method
exists to avoid.

---

## What to build first

Not the pretty one. **The evidence view**, because ADR-4's check needs it and because level 2
cannot be written until the spine is verified. It is the only view on the critical path.

The descent view is second, because the writer needs to navigate what they are writing. The
concept view is a carry-forward and needs only the formula change. The divergence view is fourth
and is the one most likely to produce something nobody expected, which is a reason to build it
early and a reason not to let it block the writing.

---

## What the figures show

The eight figures in `figures/` are the current site, captured at v0.3.26, and they are here so
that the next session can see what already works rather than rebuilding it from a description.
Each one is a full-page screenshot at 1600 pixels wide. They are evidence of the starting point,
not designs for the second book.

---

This document is released under the Creative Commons Attribution 4.0 International licence (CC BY 4.0).
