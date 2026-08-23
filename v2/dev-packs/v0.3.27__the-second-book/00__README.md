# Dev Pack: The Second Book, Written Top Down

**version** v0.3.27 · **date** 23 August 2026
**for** a fresh session starting the second book (assume no prior context)
**source** two founder voice memos, 23 August 2026, reproduced in `01__the-memos.md`
**status** Phase 0 is DONE at v0.4.0. Everything from phase 1 onward is PROPOSED and not
implemented. **Revised 23 August** by [brief 20](../../briefs/20__founder-memo__the-universe-first.md),
which inverts the construction order and corrects three things this pack had wrong.
Section 09 lists what only the founder can answer.
**versions** This pack ships at v0.3.27. The first edition freezes at **v0.3.26**, the last release in
which it was the only book. **v0.4.0 is phase 0**: the freeze itself.

---

## What This Is

A plan to write the book again, from the top down, as a graph.

The first book exists, it works, and it is about to be frozen. It was written the way books
are usually written: prose first, structure discovered along the way, graphs added afterwards
as illustration. The last fourteen releases established that the opposite order produces
things the first order cannot, and this pack is the plan to work in that opposite order from
the first sentence.

This is the plan to write the plan. It does not write the second book. It decides the shape,
the plumbing, the visualisations and the order of work, so that the writing can start without
relitigating any of it.

---

## Read These In Order

| # | File | What it gives you |
|---|---|---|
| **00** | this file | orientation, the three governing rules, what is already decided |
| **01** | `01__the-memos.md` | the founder's two memos, verbatim, and what each instruction commits us to |
| **02** | `02__what-exists-today.md` | the audit: every section, every conclusion, with a carry / rewrite / drop verdict |
| **03** | `03__freezing-the-first-book.md` | how v1 is frozen, where it lives, the front page that explains the sequence |
| **04** | `04__the-argument.md` | the book's spine, top down, from fractal semantic graphs downward |
| **05** | `05__architecture.md` | ADRs: the source model, the five altitudes, the intersection graph, node and edge types |
| **06** | `06__the-plumbing.md` | generators, data formats, the build chain, the gates |
| **07** | `07__visualisations.md` | which views exist, what each is for, and which ones are instruments |
| **08** | `08__implementation-plan.md` | sequenced phases, each with a verification gate |
| **09** | `09__verification-and-open-questions.md` | acceptance criteria, and the decisions only the founder can make |

---

## The Four Governing Rules

Everything in this pack is downstream of four rules. A step that violates one of them is
wrong even if it looks like progress.

### Rule 1 · The graph comes before the prose, at every altitude

> **No unit of text is written until the node it projects exists, carries its typed edges, and
> its evidence resolves.**

This is the whole point of the exercise and it is the rule most likely to be quietly broken,
because writing prose is easy and declaring edges is not. The first book put the graph second
and the graph was therefore always a description of text that already existed. In the second
book the text is a **projection** of a node that already exists. If a paragraph cannot be
traced to a node, the paragraph does not ship. If a node has no evidence path, the node is
marked unevidenced and says so on the page.

### Rule 2 · The first book is frozen, and the second book copies from it

> **Nothing in the second book's work edits the first book. Material moves by copy, never by
> reference, and every copy records where it came from.**

The first book is the historical record of how this was worked out, including the parts that
were wrong. It is more valuable intact than improved. A build gate enforces this: the frozen
tree is hashed, and the build fails if a byte changes. See `03__freezing-the-first-book.md`.

### Rule 3 · Every claim the book makes about itself is computed on every build

> **If the book asserts a number, a ranking, a theme or a coverage, the build computes it. If
> the build cannot compute it, the book does not assert it.**

This is the lesson of the last fourteen releases, written up in
`briefs/18__agent__what-the-graphs-found.md`: every correction in that run was a number nothing
was checking. The second book starts with the gates rather than acquiring them.

### Rule 4 · The universe precedes the plot, and the plot precedes the levels

> **Nothing about an altitude can be decided before the graph of concepts, claims and evidence
> exists, and no altitude is written before the plot line through it is chosen.**

Added 23 August, and it is the correction that reshaped this pack. The first draft went the
other way: it named five spine statements and planned to attach evidence to them. That is
defining the answer before the question is known, and the founder caught it at section 5. The
material for the universe already exists (twenty-one carried sources, six vault analyses, a
concept map of twenty-four, the whole first edition), so the work is decomposition rather than
research.

Note this does **not** contradict rule 1 or the memo of the morning. **Construction is
bottom-up; reading is top-down.** The reader descends from a claim; the author arrives at the
claim from the evidence. Confusing the two is what produced the first draft's phase order.

---

## What Has Already Been Decided (do not relitigate)

From the founder directly, in the memos and in the answered decisions register. These are
settled inputs.

1. **The title and the subtitle are two fields, not one string.**
   **Title:** *Fractal Semantic Graphs: Meaning Through Connectivity*.
   **Subtitle:** *For humans and agents*. Decision r001-D1, answered 22 August, clarified
   23 August. The subtitle carries a **placement rule** because it names the audience rather
   than the book: it belongs on the cover and in the site's main sections, and it does **not**
   go into the printed title or into a publishing platform's title field. See
   [the metadata sheet](../../admin/metadata.html#identity).
2. **The book is written top down**, starting from fractal semantic graphs and meaning through
   connectivity, and descending. Memo 1.
3. **There are five versions of the book at five altitudes**, each larger than the one above,
   each leading to the next. They are the source material for later audience and language
   variants, not a rendering trick. Memo 1.
4. **Level 5 does not exist in phase one.** It arrives once the graphs are agreed and mapped.
   Memo 2.
5. **The first book is frozen as a named version** and never changed. A front page explains
   everything in it, including the sequence of events. Memo 2.
6. **The second book lives in its own folder**, and material arrives there by copy. Not every
   reference document from the first book will make it. Memo 2.
7. **The graph is bidirectional**, and structure, concepts, opinions, hypotheses, facts and
   objectives are all centres of gravity in it. Memo 1.
8. **Humans and agents are one audience, not two.** Decision r002-D1, answered 22 August.

---

## What The Investigation Established (evidence, not assumption)

Numbers below are from the live build on 23 August 2026 and are recomputed by the generators.

- The first book is **17 units and 21,679 words** of markdown under `content/`, projected to
  **22 pages** under `/book/`, two PDFs and a cover.
- The site is **100 HTML pages** across nineteen sections, built by **12 generators**
  (about 4,700 lines of Python and JavaScript) and gated by **13 build-failing checks**.
- The altitude ladder holds **5 levels, 36 nodes, 24 concepts, 42 measured cross-references**,
  and reduces the book to **14 facts, 26 assertions and 0 opinions**, derived from evidence
  state rather than typed by hand.
- Levels 1 to 3 are complete; **level 4 exists for two chapters only** and level 5 is the
  existing prose. This is the strongest single argument for starting again top down: the ladder
  was built upward from finished text and ran out of altitude.
- The evidence estate holds **5 vault analyses plus one cross-vault synthesis**, and
  **21 carried source documents totalling 63,038 words** with their hashes.
- The decisions register holds **14 decisions, 10 open**, over **12 named pieces of blocked
  work**, 4 of which more than one decision waits on.
- Four reviews have run: **36 items**, of which 12 are applied and 10 are still discussing.

---

## What This Pack Deliberately Does Not Do

It does not write any chapter, name any level's contents, or choose the second book's URL.
It does not touch the first book. It does not answer the ten open decisions, though it says
which of them the rewrite dissolves and which it makes urgent (`09`). And it does not assume
the second book will be better: it assumes it will be **differently checkable**, which is the
only improvement that can be verified before the writing starts.

---

This document is released under the Creative Commons Attribution 4.0 International licence (CC BY 4.0).
