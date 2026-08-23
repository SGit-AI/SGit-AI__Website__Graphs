# What Exists Today, And What Happens To Each Of It

**version** v0.3.27 · **date** 23 August 2026
**why this file exists** memo 1: "it's also worthwhile going back and reviewing every single
page, every single conclusion that we have"

Every unit of the first book, every section of the site, every computed conclusion and every
piece of machinery, with a verdict. Nothing is left without one, because an item with no
verdict is an item that will be carried by accident.

> **Revised 23 August. Every verdict below is a HYPOTHESIS, not a decision.**
>
> The founder read this file and named its defect precisely: *we are already defining the answer
> before we know what questions we're answering, and this is very obvious in section two*. He is
> right. A verdict on a unit of the first edition is a claim about what the second edition needs,
> and what the second edition needs is not known until the universe exists and a plot line runs
> through it. See [brief 20](../../briefs/20__founder-memo__the-universe-first.md).
>
> So read the table below as **the current guess with its reason attached**, which is worth
> having (a guess with a reason is arguable; a blank is not) and is worth nothing as a commitment.
> Each one is re-tested in phase 3, against the universe, and the ones that change are a
> measurement of how much the universe knew that the guess did not.

---

## The verdict vocabulary

| Verdict | Meaning |
|---|---|
| **CARRY** | Copied into the second book's source with minor or no change. The idea and the words both survive. |
| **LIFT** | The content survives, the form does not. It becomes nodes and edges first, and the prose is re-projected from them. This is the default for the argument. |
| **REWRITE** | The idea survives, the text does not. Top-down authoring will produce different words. |
| **DROP** | Not in the second book. Stays in the frozen first edition, where it remains readable forever. |
| **STAY** | Belongs to the site or the estate rather than to a book edition. Unaffected by the rewrite. |

**LIFT is the interesting one**, and it is the verdict on most of the argument. It is not a
softer CARRY. It means the unit is decomposed into typed nodes with evidence edges, placed at
an altitude, and then written again from that structure. The first book's sentence is available
as a reference during that, and frequently will not survive it.

---

## The first book, unit by unit

Sixteen chapters plus an introduction, 21,679 words of markdown under `content/`, projected
into `/book/`. Verdicts assume the top-down order, so a chapter's fate depends on where its
material lands in the altitude ladder, not on how good it is.

### Part I · The claim

| # | Unit | Words | Verdict | Why |
|---|---|---|---|---|
| Intro | projected from the front page | ~700 | **REWRITE** | The second book's level 1 *is* the introduction. Nothing to carry: this is the unit the whole method is designed to produce differently. |
| 1 | Why graphs at all | 1,628 | **LIFT** | The argument is right and the order is wrong. It argues up to the thesis; the second book starts from it. |
| 2 | The five ideas | 1,724 | **LIFT**, with a known defect | These five are a good compression, and the ladder already found that the source they distil lists **ten principles**, not five. Finding 3 in the ladder register. The second book decides the number from the graph rather than inheriting it. |

### Part II · The grammar

| # | Unit | Words | Verdict | Why |
|---|---|---|---|---|
| 3 | The rules you can apply tomorrow | 1,670 | **CARRY** | The most reusable chapter in the book, and the one most nearly independent of ordering. Carry it early and let it be the first thing that exists at level 3. |
| 4 | The edge set | 1,317 | **CARRY**, and promote | This is not a chapter. It is the schema of the second book's own source, and it should be generated from the edge registry rather than hand-written. See ADR-5. |

### Part III · The full argument

| # | Unit | Words | Verdict | Why |
|---|---|---|---|---|
| 5 | Against schema-first | 1,759 | **LIFT**, and soften | Memo 1.6 is explicit that the Semantic Web was not simply wrong: everything is a triple, the mistake was defining everything in one go. The current chapter concedes this; the second book must concede it earlier and louder, because the computed concept map already shows `schema-first` is one of the book's five peaks, which means the book defines itself against it more than it admits. |
| 6 | A graph at every boundary | 2,228 | **LIFT**, and promote to the spine | This is the fractal argument, and in the second book it is not chapter 6, it is part of level 1. Its source document, *Fractal Semantic Graphs All The Way Down*, is where the title comes from. |

### Part IV · The proof

| # | Unit | Words | Verdict | Why |
|---|---|---|---|---|
| 7 | Worked graphs, with real numbers | 1,521 | **REWRITE** | An index of examples written before the evidence estate existed. The estate now holds five vault analyses and a cross-vault synthesis, and the index should be generated from them. |
| 8 | Whose session is the agent using? | 873 | **LIFT** | Strong worked example. Its source document is carried, and the browser-isolation vault analysis now goes far deeper than the chapter. |
| 9 | The 2FA instance graph | 933 | **CARRY** | Self-contained, checkable, and the companion the *Digital Twins* source names. |
| 10 | Article 26(5), fact to board and back | 914 | **LIFT** | The regulation vault and *Every Paragraph Is A Graph* both post-date it and both go further. |
| 11 | Wardley maps as graphs | 920 | **REVERSED 23 August: candidate spine material** | The first verdict dropped it because nothing in the concept map depends on it, which measured the concept map rather than the material. The founder gave the missing reason: a map is a graph that has gained **position, movement and time**, a map of a map of a map is the fractal claim at its most legible, and maps are what make a graph actionable. You cannot have maps without graphs, but maps are where graphs gain strategy and gameplay. That is a claim about the book's subject, not a digression from it. |

### Part V · Reality

| # | Unit | Words | Verdict | Why |
|---|---|---|---|---|
| 12 | What ships, what is argued | 1,156 | **REWRITE**, and keep the shape | The honesty table is the most important structural idea in the first book and the second book needs it from day one. Its current contents are wrong in at least two places already (the path-query line and the dependency line), which is the argument for generating it rather than writing it. |
| 13 | Origins: 2026 | 1,228 | **CARRY** | History does not need rewriting, and this is the lineage chapter the identity release was going to expand. |
| 14 | The network | 915 | **CARRY**, and regenerate | Facts about sibling sites. Should be generated from a register so it cannot go stale, which it already did once (Issues-FS was missing, task T31). |

### Part VI · Appendices

| # | Unit | Words | Verdict | Why |
|---|---|---|---|---|
| 15 | Glossary | 1,323 | **LIFT**, and merge | The second book has a concept layer with definitions, also-called and near-but-not. The glossary should be a projection of it, not a second list that can disagree with it. This is a real duplication in the first book. |
| 16 | The author's interest, and where this loses | 1,001 | **CARRY** | Unchanged in spirit. *A Fact Does Not Exist In A Vacuum* is its source and says the graph has an agenda too. |

**Summary of the first book's current guess:** 5 CARRY, 7 LIFT, 3 REWRITE, 1 reversed to a
spine candidate. No unit is dropped outright, and no unit is carried without being placed at
an altitude first. Every one of these is re-tested against the universe in phase 3.

---

## The site, section by section

| Section | Pages | Verdict | Note |
|---|---|---|---|
| `/book/` | 22 | **FREEZE** | Becomes the first edition. See file 03. |
| `/start/` `/why-graphs/` `/grammar/` `/depth/` `/examples/` `/maps/` `/shipped/` `/origins/` `/network/` `/glossary/` `/about/` | 16 | **FREEZE with the book** | These are the book's own pages: the chapters are projections of them. They freeze together or the projection chain breaks. |
| `/vaults/` | 12 | **STAY** | The evidence estate. Belongs to the site, is cited by both editions, keeps moving. |
| `/docs/` | 22 | **STAY** | The carried sources. The second book's inputs live here and must stay live. |
| `/documents/` | 13 | **STAY** | Project documents. Gains this pack. |
| `/reviews/` | 5 | **STAY** | The record of how the first book was reviewed. Reviews of the second book will be new files in the same register. |
| `/decisions/` | 1 | **STAY** | Spans editions by construction. |
| `/altitudes/` | 3 | **SUPERSEDE, do not delete** | This is the pilot that proved the method. In the second book the ladder is not a section, it is the book. The pilot pages stay published, marked as the pilot, and their findings carry. |
| `/admin/` | 5 | **STAY** | Engineering, versions, comms, publishing, metadata. |
| root `index.html` | 1 | **REWRITE at v2 launch** | It is the first book's introduction source. It cannot change while the first edition is frozen, so the second book needs its own front door. Open question 4. |

---

## Every computed conclusion

### The eight ladder findings

| # | Finding | State | Verdict |
|---|---|---|---|
| 1 | The book says both that there is no query engine and that there is one | open | **CARRY as a gate.** The second book must not be able to hold this shape silently. |
| 2 | The Semantic Web's mistake is stated twice, in two parts | accepted | **CARRY as a check.** Repeats are legitimate; undetected repeats are not. |
| 3 | Five ideas, from a source that lists ten principles | open | **RESOLVE during authoring.** The number comes from the graph. |
| 4 | Compressed honestly, the book's top paragraph has no room for "fractal" | accepted | **REVISIT.** This was true of a book whose title did not contain the word. The title now does. Level 1 must make room, and if the honest compression still cannot, that is a finding about the title. |
| 5 | The position the book argues against is one of its strongest nodes | accepted | **CARRY.** Recompute with external evidence included, per memo 1.9. |
| 6 | Compression does not just shorten, it re-classifies | accepted | **CARRY into the method.** This is a property of the ladder and belongs in the chapter about the ladder. |
| 7 | Two sibling sites publish the same graph with different numbers | open | **STAY.** A cross-estate issue, not a book issue. |
| 8 | A contradiction the book already narrates, which the method correctly does not flag | accepted | **CARRY as a control.** Every check needs a known-negative. |

### The five build-time checks

All five **CARRY** unchanged, and each gains a second job in the second book: they run over the
authored graph, not only over the projected text. Their current hit counts (2, 6, 3, 9, 2) are
the baseline the second book should beat, and where it does not, the check should say so.

### The concept layer

**24 concepts CARRY.** They are the most valuable single artefact in the first book because
they were derived rather than invented, and they are already the vocabulary the carried sources
are measured against. Two changes in the second book:

1. The strength formula gains external evidence, per memo 1.9. Today it counts internal edges,
   units and demonstrations. It must also count the carried sources that measure the concept
   and the vault analyses that demonstrate it.
2. The concept layer and the glossary merge (chapter 15's verdict).

### The fourteen decisions

**STAY**, and file 09 records which ones the rewrite dissolves, which it answers and which it
makes urgent.

### The four reviews, thirty-six items

**STAY** as the record. Twelve applied items are already in the first book and freeze with it.
The ten still discussing are inputs to the second book, and the review workflow itself continues
unchanged: the second book will be reviewed the same way.

---

## The machinery

| Component | Lines | Verdict |
|---|---|---|
| `gen_pages.py` | 285 | **REWRITE.** Renders markdown to pages. The second book renders a graph to pages, which is a different job. |
| `gen_book.py` | 749 | **CARRY, heavily.** Reader, single page, print interior, two PDFs, manifest, gate. Editions differ; this does not. |
| `gen_cover.py` | 401 | **CARRY.** Spine computed from page count, gate on disagreement. |
| `gen_altitudes.py` | 920 | **SPLIT.** It is currently the ladder's author, its compiler and its analyst in one file. In the second book the ladder's content moves to source files and this becomes three: a compiler, a measurer and a checker. This is decision r004-D1, and the rewrite answers it. |
| `gen_decisions.py` | 295 | **CARRY.** |
| `gen_docs.py` | 810 | **CARRY.** |
| `gen_documents.py` | 183 | **CARRY.** |
| `gen_changes.py` | 139 | **CARRY.** Now gated against the release table. |
| `gen_llms_full.py` | 86 | **CARRY.** |
| `chrome.py` | 269 | **CARRY.** |
| `validate.js` | 300 | **CARRY and extend.** Thirteen gates today; file 09 lists the ones the second book adds. |
| `html2md.py` | 276 | **DROP.** A one-shot migration, marked never-run-again, and its job is done. |

| Front end | Bytes | Verdict |
|---|---|---|
| `altitudes.js`, `altitudes-graph.js`, `concepts.js` | 63,633 | **CONSOLIDATE.** Three views over one dataset, plus `decisions.js` and `docs.js` which rebuilt the same graph layer twice more. Five copies of one idea. See ADR-7. |
| `decisions.js`, `docs.js` | 40,476 | **CONSOLIDATE**, as above. |
| `review.js`, `changes.js`, `mdreader.js`, `nav.js` | 18,681 | **CARRY.** |
| `site.css` | 61,937 | **AUDIT.** It has grown by roughly a third in two weeks and nothing checks for dead rules. |

---

## What is dropped, and the one thing that worries me about it

Dropped outright: `html2md.py`, and its job is done. **Chapter 11 is no longer on this list**:
the Wardley verdict was reversed on 23 August and the material is now a candidate for the spine.

Everything else survives in some form, which is a suspiciously comfortable answer. The honest
reading is that **the audit was performed by the person who wrote most of it**, and the
verdicts skew toward LIFT because LIFT preserves the material while sounding like change.
The counter-check is in file 09: at the end of level 3, the second book should be measurably
**shorter** than the first book's equivalent altitude. If it is not, LIFT was a euphemism.

---

This document is released under the Creative Commons Attribution 4.0 International licence (CC BY 4.0).
