# The Memos, And What Each Instruction Commits Us To

**version** v0.3.27 · **date** 23 August 2026 · **status** source material, not edited

The founder's voice is source material and is reproduced verbatim, per the house rule. Two
memos were recorded on 23 August 2026 and transcribed by otter.ai. They are in
`../../briefs/19__founder-memo__the-second-book.md` in full. This file extracts the
instructions and says, for each one, what it commits the work to. Where an instruction is
ambiguous, the ambiguity is named rather than resolved silently.

---

## Memo 1 · The top-down rewrite

| # | The instruction | What it commits us to |
|---|---|---|
| 1.1 | "instead of cleaning up the current and doing the refactoring as we planned ... start again and actually do this properly from the ground up" | The refactor is cancelled as a refactor. The second book is a new source tree, not a reorganisation of the first. |
| 1.2 | "create a plan for how you're going to do this, and put that in a sort of a dev pack" | This pack, in the pattern of the packs under `library/sgraph-send/dev_packs/` in the Send repository. |
| 1.3 | "we can actually write this book the way I wanted to write it, which is from the top down" | Rule 1. The graph precedes the prose at every altitude. |
| 1.4 | "you start from the fractal semantic graphs and then the meaning through connectivity concepts" | The spine of the argument is fixed and is the title. `04__the-argument.md` builds down from it. |
| 1.5 | "the fractal element ... it's all open source, it's all distributed, it's all zooming in and zooming out ... even the book now is fractal because we're applying the same concepts at every level" | The five altitudes are not a presentation device. Fractality is the claim, and the book must demonstrate it by being it. |
| 1.6 | "a lot of graph projects try to define everything in one go ... some of the mistakes the semantic web made, but it doesn't mean it's not right ... everything is a triplet" | The anti-schema-first argument keeps its concession. The Semantic Web was right about triples and wrong about the order of work. Do not let the chapter become a dismissal. |
| 1.7 | "it's only when we do a certain degree of visualisation and analysis that we are able to find a bunch of stuff" | The visualisations are part of the method, not the packaging. They ship with the book and the book cites what they found. |
| 1.8 | "you start to find conclusions that are mathematical evidence ... they compute conclusions, not an opinion" | Rule 3, in its strongest form: a theme is only a theme if evidence paths converge on it. See ADR-4. |
| 1.9 | "if I want to say this is the themes of the book, then the references and the evidence should link that way ... these natural peaks, even external evidence" | Peaks are computed and must include external evidence, not only internal structure. This changes the strength formula. |
| 1.10 | "define the architecture, define the plumbing, define the visualisations, the graphs, and also use examples ... screenshots of the pages" | Files 05, 06, 07 of this pack, with figures. |
| 1.11 | "going back and reviewing every single page, every single conclusion that we have" | File 02, with a verdict per item. |
| 1.12 | "do the book by levels ... five versions of the book, five altitudes ... each version is bigger than the one before, and each version leads to the next" | ADR-2. Five source trees, not one tree with five views. |
| 1.13 | "there's a hyperlinked version, but there's also a reading version" | Every altitude ships in both forms. The reading version is the one that must work on paper. |
| 1.14 | "this is where we started to find all the terms, all the concepts, all the facts" | The altitudes are the source for later audience and language variants. That is their purpose, stated. |
| 1.15 | "the book is this intersection of the structure of the book with the concepts, with the opinions, with the hypotheses, with the facts ... all of those become central gravity that link our graph" | ADR-3. Six node families, one graph, all of them able to be peaks. |
| 1.16 | "it should be a bidirectional graph" | Every edge carries a named inverse. This is already the house grammar; it now applies to the book's own source. |
| 1.17 | "the reason I don't like graph RAG ... is not the graph part ... most graph RAG solutions are not pure graphs, they still use vector stores ... vectors are non-deterministic, not explainable, they don't have provenance ... it should not be a big thing" | A stated position, kept small. One glossary entry, one passage at level 4 or 5, no chapter. See below. |

### The graph RAG position, written once

The objection is not to graphs and not to retrieval. It is that a system marketed as a graph
system, whose retrieval path runs through a vector store, has a non-deterministic and
unexplainable step in the middle of it, with no provenance for why a passage was returned. The
approximation is by design, and the graph is being used to compensate for it. The founder's
position is the purist one: **if the claim is graphs, go graphs all the way down**, to the word,
the concept, the dictionary and the evidence, where every hop is inspectable and repeatable.

The instruction is explicit that this "should not be a big thing". So: one glossary entry, one
short passage where the deterministic-retrieval claim is already being made, and no chapter of
its own. If it needs a name in the text, the memo offers G3 RAG and does not insist on it.

---

## Memo 2 · Freezing the first book

| # | The instruction | What it commits us to |
|---|---|---|
| 2.1 | "take everything which is created and package it up into a version ... the book materials and all the other support information" | A named, complete, self-contained first edition. |
| 2.2 | "I don't want the new stuff to overwrite what we've done there because historically there's a lot of stuff there to learn" | Rule 2, and a hash gate that enforces it. |
| 2.3 | "we should have a front page that just links to everything and explains everything, including explains the sequence of events" | A new page, written once, that narrates the first edition's history. This is the only new writing the first edition receives. |
| 2.4 | "this should be like a version X, or even tied to the particular version of the release" | The first edition is named by its release. It freezes at **v0.3.26**. |
| 2.5 | "we can even name it the first version of the book" | Its name is the first edition. |
| 2.6 | "copy everything to a particular folder that we then froze in time, and none of that gets changed in the future" | See ADR-1, and the concern recorded with it. |
| 2.7 | "everything else in the future gets copied from there ... the new book ends up being a copy of all of the bits that we care about" | The frozen tree is the **source** the second book copies from, which is what the freeze is for. |
| 2.8 | "not all of the book, the references, documents might be copied ... some don't make it" | File 02 gives every item a carry / rewrite / drop verdict, and drop is a legitimate verdict. |
| 2.9 | "we also had to have the whole narrative lined up ... all the evidence, all the material that we connect" | Nothing is dropped that an evidence path depends on. The gate for this is in file 09. |
| 2.10 | "version two becomes a different folder that then is the one we're going to make changes ... every version of the book is now independent" | Editions do not share source. They share provenance edges. |
| 2.11 | "in the first phase of the book, we don't have the level five ... that will come once we agreed and mapped out all the graphs" | The implementation plan is ordered L1, L2, L3, L4, then L5, and level 5 has an explicit gate in front of it. |
| 2.12 | "it's a graph first created book ... the meaning and the description of the book arrives as we zoom in and add more detail and lower the altitude" | Rule 1 again, stated as the method rather than the constraint. |

---

## The one instruction with a cost worth naming

Instruction 2.6 asks for a copy. Taken literally against the published site, it means
duplicating the first edition's twenty-two pages, two PDFs and cover into a second location,
which breaks or duplicates thirty-four published URLs that the reviews, the ladder, the concept
map and the carried sources all link into. The intent behind it (2.7) is about the **source**:
the frozen thing is what the second book copies from.

So the recommendation in ADR-1 is to freeze the **source tree** by copy, exactly as asked, and
to freeze the **published pages in place**, so that no URL this site has ever published stops
working. The founder may prefer the literal reading, and it is his call: it is recorded as an
open question in file 09 rather than settled here.

---

This document is released under the Creative Commons Attribution 4.0 International licence (CC BY 4.0).
