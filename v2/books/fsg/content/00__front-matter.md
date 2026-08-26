# Fractal Semantic Graphs: Meaning Through Connectivity

**Second edition of the argument · graphs.sgit.ai · August 2026**

---

## What this book is

A node connected to nothing means nothing. That is not a slogan. It is the first
consequence of a claim you can test on real data: **what a thing is emerges from the
edges traceable from it, and how much you can rely on that meaning is a function of how
richly and how independently it is connected.**

The first edition of this argument made that case from first principles and published it
in advance of any system that implemented it. It said so, plainly, in a chapter that
listed what did not exist. That honesty is why the argument was worth reading, and it is
also why it was incomplete: it argued that meaning could be *computed* rather than
declared, and then had nothing to point at that computed it.

Between that edition and this one, the argument was built. A document was decomposed to
the word with stable identities and every claim anchored to the exact bytes that carry
it. An engine was written that takes a phrase and returns its meaning deterministically,
with the arithmetic in the open and the evidence trail clickable in both directions.
Registers were created where a human corrects the machine's proposals and the correction
*is* the training. Nineteen sites and twenty published vaults now run the grammar in
public.

This book is the edition that argues from first principles **and** from the running
system. It is not a revision of the first book and it is not a tour of a repository. It
is a fresh argument that draws on both.

## What you will know at the end that you do not know now

If you read this book start to finish, you will be able to do five things you probably
cannot do today.

1. **State the thesis in your own words**, and defend it against the obvious objection
   that a table would have done.
2. **Apply the edge grammar to a system you already know.** Fifteen verbs, each with a
   distinct inverse, one banned edge, and a test you can run out loud: if the path does
   not read as a sentence in the reader's own language, the edges are wrong.
3. **Tell a fractal system from a merely hierarchical one**, using a test that either
   passes or fails: zoom into any node, and if the zoom needs a new file format, a new
   validator or a special case, the system is not fractal.
4. **Explain why determinism matters to the argument**, and why an engine whose weights
   are stated formulas rather than fitted numbers is a different kind of object from a
   language model, even when it wears the same shape.
5. **Start your own graph tomorrow**, on a system you already work on, in an afternoon,
   without buying anything.

If you already read the first edition, this one goes further rather than merely again.
The grammar chapters are sharpened, not repeated. Everything from chapter six onward is
new ground: the fractal claim tested against a system that actually zooms, the projection
claim tested by a build gate that rebuilds the source document from the graph and fails
unless the bytes match, and four chapters on meaning as a computation with its own
worked arithmetic.

## The three things this book will not do

**It is not a graph database pitch.** That sentence is carried verbatim from the source
brief this book takes its title from, and it means what it says. The claim is that one
grammar is the interface at every boundary, not that things are stored in a graph. The
work behind this book uses no graph database, no SPARQL, no Cypher and no RDF layer in
its code. Chapter fourteen lists exactly what ships and exactly what does not.

**It will not pretend the semantic layer is a product.** Most of what follows is design
published in advance so that it can be checked. Where something runs, this book says so
and gives you a number you can verify. Where nothing runs, it says that too.

**It will not hide the interest.** This book is published by a project that builds the
things it argues for. If the argument is right, that project is more valuable. Chapter
fourteen and the participant note below are what we do about it, and they are not
enough on their own: hold the elegant chapters to a harder standard than the evidenced
ones.

## How this book is arranged, and why

Five parts. The title is read backwards, and each part earns one part of it.

<div class="note">

**Part one, the claim.** Meaning through connectivity, from first principles, with no
jargon before it is earned. Two chapters.

**Part two, semantic.** What makes a graph semantic rather than merely a network: a
grammar of verbs, anchors instead of standards, and types that are computed paths rather
than applied labels. Three chapters.

**Part three, fractal.** What the middle word of the title commits you to, how to
falsify it, and what happens at every boundary and every zoom level once you take it
seriously. Three chapters.

**Part four, computed.** The half the first edition could not write: how a document
becomes a graph whose every node is anchored to bytes, what identity means when a
document changes, an engine that computes meaning deterministically, and why an
explanation is a path rather than a narration. Four chapters.

**Part five, in practice.** Where this runs today, what ships and what is argued, and
how to build your own first graph tomorrow. Three chapters.

</div>

Then a colophon that says what was cut and what remains open, and a reference card: the
edge set, the rules and the vocabulary on four pages you can read on a plane with nothing
else open.

## The editorial choices, recorded

The commission locked the title and left everything else to the writing session. Those
choices are recorded here so they can be argued with.

| Choice | What was decided, and why |
|---|---|
| **Structure** | Five parts, fifteen chapters plus front matter, a colophon and a reference card. The proposed spine in the commission had eight chapters; it was expanded because the four chapters of part four each carry a different mechanism (extraction, identity, computation, explanation) and folding them into one would have made the book's newest material its thinnest. |
| **Order** | First principles first, running system last. The alternative (lead with the engine, because it is the novelty) was rejected: the engine is only interesting if you already accept that meaning is a computation over connections, and that case has to be made before the machine appears. |
| **Chapter shape** | Every chapter opens with what you will be able to do or see differently after it, and closes with where the live estate demonstrates it. Every chapter carries at least one figure. |
| **Voice** | Plain sentences, short words, technical terms spelled out at first use in each chapter, no em-dashes in our own prose. Verbatim quotes keep their original punctuation, always. |
| **Figures** | Screenshots are taken from the real pages at version v0.5.11 with the repository's own headless browser harness, and each caption names the page and the version. Structural diagrams are ascii art, which is diffable, reviewable and prints well. No new chart libraries were introduced, and no figure was drawn from imagination. |
| **Evidence** | Every attributed position names its chapter, brief, page or release row. Every number is computed from a file in the repository or quoted from a page that was fetched, never recalled. Where the corpus is silent, this book says so. |

## Who wrote this, and how

<div class="note">

**Written by Dinis Cruz together with a team of AI agents.** The working method is part
of the material, so it is stated rather than implied: ideas are recorded as voice memos,
transcribed, and developed by agents into structured briefs; the author reviews and
corrects them; the corrected briefs become the estate's instruction record; and the
chapters are distilled from there.

This book in particular was written by an AI agent working from a written commission,
reading the corpus directly and anchoring every claim to it. The agent chose the
structure, the chapter count, the voice and the figures, and recorded those choices in
the table above. Where this book states a position the corpus does not carry, it says so
in the paragraph that states it, and you should hold those paragraphs to a lower
evidential bar than the sourced ones.

The estate's disclosure practice applies here unchanged: the interested party is a
visible node. The full participant disclosure is published at
`graphs.sgit.ai/v1/about/participant.html`, including the four situations in which the
argument of this book is the wrong one.

</div>

## Licence

All content in this book is released under **CC BY 4.0** (the Creative Commons
Attribution licence: share and adapt freely, for any purpose, with credit). The raw
markdown behind every chapter carries the same licence, and it is the source of truth:
the web pages and the printed version are both projections of it.

Third-party material quoted inside these chapters stays under its own terms. Vendor
system cards, arXiv papers, EU AI Act text and external URLs are quoted, not relicensed.

## A note on reading offline

This book is designed to be finished on a flight. Nothing in it requires a link to be
followed. Every figure carries a caption that states its point, so a reader who cannot
see the colours still gets the argument. Every number that matters appears in the prose
as well as in a figure. Where a live page would make the point better than a paragraph,
the paragraph is written anyway.

---

*Fractal Semantic Graphs: Meaning Through Connectivity* · graphs.sgit.ai · site version
v0.5.11 · 26 August 2026 · CC BY 4.0
