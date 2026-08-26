# Entry A — the Universe volume

## The entry prompt (paste this into a fresh session on this repository)

> You are writing book A of a three-book commission. Read, in order:
> `v2/dev-packs/v0.5.10__the-book-writing-pack/00__README.md`, `01__the-corpus.md`,
> `02__shared-conventions.md`, and then this file, `03__entry-a-the-universe.md`, in
> full. Then write **the Universe volume for "Fractal Semantic Graphs: Meaning Through
> Connectivity"**: the concept graph of the whole corpus, presented as a readable book.
> Work on branch `claude/book-a-universe`, deliver
> markdown + web pages + one print PDF under `v2/books/fsg-universe/` (slug yours to
> change), and send the PDF the moment a complete draft exists. The title is locked;
> everything else is your editorial call.

## What this book is

The estate proved a method on one document: extract the concepts, anchor every claim to
a quoted span, connect them with named verbs, and the document becomes a universe you can
ask questions of. Book A applies that method to the WHOLE corpus and presents the result
as a book — the atlas that the FSG book (book B) will stand on, and that a reader can
enjoy on its own: what the ideas ARE, each with its statement, its anchored quote, its
connections, and its blast radius.

This is a book-shaped graph, not a glossary. Organise it the way the estate organises
meaning: by connectivity, not by the alphabet.

## Editorial charter (proposals, not orders)

- **Choose 40–80 concepts**, not hundreds: the peaks and the anchor nodes. The existing
  extractions are your seed — the pilot's 57 concepts, the lexicon's scoped terms, the
  first book's glossary, the WCLM's meaning packs, senses and analogies registers — but
  the selection across the whole corpus is yours.
- **One spread per concept** works well in print: the label; the one-sentence statement;
  the anchored quote with its source named; the connections OUT and IN as sentences
  (verb-named, per the grammar); where it shows up live (a vault, a site page, an
  operator); and its nearest neighbours as a small drawn graph (own SVG or ascii).
- **Group by neighbourhood**: chapters as regions of the graph (the meaning core; the
  grammar of edges; anchors and bridges; confidence and provenance; the fractal
  principle; the machinery — universe, WCLM, operators; the network). Open each chapter
  with a drawn map of that region.
- **Machine twin**: alongside the book, emit the atlas as data —
  `v2/books/fsg-universe/data/universe.json` in the same shape as the pilot's extraction
  (nodes with statements and anchors, verb-named edges). The book renders FROM it where
  practical; that is the estate's discipline, and it makes book A the literal universe
  for book B and for future engines.
- **Contradictions and gaps are content**: where the corpus says two things, show both
  with both anchors; where a concept is asserted but thinly connected, say so — the
  confidence ladder applies to this book's own material.

## What done looks like, beyond the shared bar

The graph data validates (every edge's ends exist; every anchor's source is real); the
PDF reads as a book, not a database dump; and three spot-checks pass: pick any concept
page, follow its quote to the source, follow one edge to its target's page — all three
hops land.
