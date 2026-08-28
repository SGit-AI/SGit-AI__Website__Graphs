# Colophon

*How this book was made, what was cut, and what is still open.*

---

## How it was made

This book was written by a Claude Code session working on the repository it describes,
against a written commission published in that same repository at
`v2/dev-packs/v0.5.10__the-book-writing-pack/`. The commission fixed the title, the
audience and three governing rules, and left structure, voice, chapter count and figure
selection to the writing session. Every editorial decision below was the session's.

The reading order was the one the commission specified: the pack's README, its corpus
file, its shared conventions, then the entry charter for this book. From there the
sources were the repository itself.

**What was read.** The three release tables (88 rows across `/admin/versions.html`,
`/admin/versions-v0.4.html` and `/admin/versions-earlier.html`); the nineteen briefs at
`v2/briefs/`; the v0.4 retrospective; the four-note exchange between the two agents; the
pre-release validator and the unit suite; the deploy workflow; the methods register; the
pilot document's extraction, core graph and identity ledger; and the twelve operator
folders.

**What was computed.** Every number in this book came from a script run against the
repository's git history or its data files. The scripts are in Appendix C. Nothing was
recalled.

**What was photographed.** Twenty figures, each taken by checking out the tag its caption
names into a temporary git worktree, serving that worktree on its own port, and
photographing the page with headless Chromium. The harness, and the rule about ports that
made it reliable, are in Appendix C.

**Length.** Twelve chapters, three appendices and this colophon.

## The structure, and why

The commission proposed an eight-part spine and marked it "proposals, not orders". The
book that resulted has twelve chapters, and three departures from the proposal are worth
recording.

**The failures got their own chapter and it is the longest.** The proposal listed the
failures as one strand among eight. They are the strand a reader learns most from, because
success stories in this genre are indistinguishable from marketing, and because the
repository's release notes made nine of them checkable. Chapter 7 is the chapter this book
would keep if it could keep only one.

**A chapter was added on the founder's craft.** The proposal mentioned it. Reading
nineteen memos as a set, the human half of the loop turned out to be more learnable and
more specific than expected, and it is the half a reader of this book has to perform
themselves.

**A chapter was added on costs.** The commission's honesty gates require the corpus's
caveats to travel with its ideas. Applied to a book about a method, that means the method's
costs travel with the method. Chapter 12 is the result and it names four situations where
this approach is the wrong one.

**The chronology became an appendix rather than a chapter.** Eighty-eight release
headlines in order are reference material, not reading. As a chapter it would have stopped
the book; as Appendix B it is the index that makes every other chapter checkable.

## What was cut

**The first edition's argument.** This book is about how the second edition is being
built, not about what either edition says. *Fractal Semantic Graphs: Meaning Through
Connectivity* is the subject of two other books in the same commission. Where its ideas
appear here, they appear as things that happened to the project.

**The chat panel, mostly.** Three releases (v0.4.17, v0.4.18, v0.4.20) built a chat panel
with a vault, voice notes and generated infographics. It is interesting and it is a
different book. It appears here only through the two-agent exchange of Chapter 6.

**The technical detail of the core graph and the identity ledger.** The transformation of
a document to 39 sections, 186 blocks, 342 sentences and 4,221 words, and the
match-then-mint ledger of 225 identities that survives renames, edits and moves, are two
of the best pieces of engineering in the six days. They are named in Chapter 5 and Chapter
9 and not explained, because explaining them properly needs the vocabulary this book's
audience was promised it would not need.

**Every worked example from the first edition.** The vault analyses, the EU AI Act
regulation graph, the Wardley maps. All at `/v1/` and none of it in scope here.

**The external network.** The commission's corpus file names two live indexes outside this
repository: the vault demos at `sgit.ai/demos/vaults/` and the network of sites at
`sgit.ai/network/`. This session had no verified fetch of either, so rather than describe
pages it had not read, it left them out. That is a gap, and it is this book's largest.

## What remains open

**The fan-out has not happened.** One document of twenty-one is extracted. Every mechanism
in Chapters 5 and 9 was designed to fan out without redesign, and at v0.5.11 that is a
design intention, not a demonstrated result. The retrospective says so in its own words and
this book repeats it in Chapter 12.

**The debt is still there.** `uni-graph.js` was at 434 lines against a 250-line budget at
v0.4.40 and was still at 434 at v0.5.11. The remedy was named at v0.4.13.

**The second book was not written when this one was.** No chapter of *Fractal Semantic
Graphs: Meaning Through Connectivity* existed at the version this book covers. That was the
deliberate consequence of the decision described in Chapter 2. It has since been written —
eighteen chapters, at v0.2.0 of that book — which answers the question this paragraph
originally left open, and does not change what was true here.

**Two of this book's judgements are contestable and are marked as judgements.** That the
build-the-universe-first bet is sound for a book of this kind and unsound for most books
(Chapter 12), and that the failures chapter is the most valuable part of the record (this
colophon). Both are the writing session's readings and both could be wrong.

**This book stops at v0.5.11.** The commission told it to, and to say so. The repository
has continued past it.

## Honesty positions carried from the corpus

Three positions from the estate travel with everything here, in the estate's own words:

- **This is not a graph database pitch.** There is no graph database in the system
  described, and no RDF, SPARQL or Cypher in its code.
- **Nine of the fifteen inverse edge names in the book's grammar are proposals**, marked
  as such wherever they appear, including in Chapter 5 of this book.
- **The people who built this have an interest in the argument being right.** They build
  and sell tools founded on it. Worth holding in mind in every chapter, and particularly
  in the ones where the story is elegant.

## Disclosure

Written by an AI agent, from a written commission, on the repository it describes,
without a human co-author. The founder quoted throughout is Dinis Cruz, and every
quotation attributed to him was already published verbatim in the repository before this
book was started. The readings around those quotations, in the source and here, are an
agent's.

## Licence and provenance

Released under the Creative Commons Attribution 4.0 International licence (CC BY 4.0),
which is the licence the corpus it draws on carries.

**Source of truth.** The markdown chapters at `v2/books/making-a-book/content/`. The web
pages render that markdown client-side with the site's shared reader, so a page cannot
drift from its source. The PDF is generated from the same files by `build.py`, and the web
pages by `gen_pages.py`, both in the book's folder.

**One convention worth stating.** Figure paths in the chapter markdown are relative to the
book folder rather than to `content/`, because the client-side reader resolves an image
against the page that renders it and the rendered pages live at the book folder. A reader
opening a chapter's raw markdown on GitHub will see the figure paths but not the figures;
they are all in `figures/`, and all twenty are shown together on the book's hub page.

**Version.** Written against graphs.sgit.ai at v0.5.11, 26 August 2026.
