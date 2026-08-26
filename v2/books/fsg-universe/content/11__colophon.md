# Colophon

What this volume is made of, what was cut, what it got wrong, and what a reader who wants
to argue with it should argue with first.

## The method, in six steps

1. **Read the corpus.** The <!-- gen:stat:carried_sources -->21<!-- /gen:stat:carried_sources -->
   carried source documents in full or in the sections the atlas leans on, both editions of
   the book, <!-- gen:stat:memos -->19<!-- /gen:stat:memos --> founder memos, the methods
   register, the scoped lexicon, the pilot extraction and its usage ledger, the world file
   of the deterministic transformer and four of its engine documents, the release history,
   the vault analyses, and two live fetches of the parent project's vault and network
   indexes.
2. **Choose the concepts.** A peak is a concept the corpus keeps returning to or that other
   concepts need in order to be stated. The selection is a judgement and it is mine.
3. **Anchor each one.** Find the sentence in the corpus where the idea is at its sharpest,
   and quote it with its source and section. Where an entry absorbed a neighbour, both
   quotes are kept.
4. **Draw the edges.** Where a document states a relation, the quote goes on the edge. Where
   it does not, the edge is marked authored and carries the reasoning instead.
5. **Gate it.** `build/validate.py` re-reads every quote out of the source it names, checks
   both ends of every edge, refuses any edge stored under an inverse verb, and fails on an
   orphan. `build/gen_chapters.py --check` fails if any chapter lags the data.
   Two kinds of source are gated differently, and the difference is worth stating. A source
   under `v1/` is byte-frozen by the edition freeze, so its recorded SHA-256 is a promise and
   a change fails the build. Everything else is a live page or a register that regenerates on
   release, so its hash records the bytes this atlas read and a move is reported rather than
   fatal. In both cases what actually protects the anchor is the quote check, which runs on
   every source, every build. This was learned the way most of this estate's gates were
   learned: the release that shipped this volume regenerated three of its own sources, and
   the first version of the gate failed on its own release.
6. **Project it.** The prose is authored; every entry, table, count and drawn map in this
   book is generated from `data/universe.json`. A chapter cannot disagree with the graph
   behind it, because the parts that could disagree are not written by hand.
7. **Generate the numbers in the sentences too.** The estate's most repeated lesson is that
   a count written into prose which no gate covers drifts silently. So the counts inside this
   volume's sentences are written from the repository at build time: the carried sources, the
   memos, the engines, the published vaults, the pilot's nodes, and its sections, blocks,
   sentences and words. One of them came out wrong the first time it was generated, which is
   the whole argument for generating it. The numbers this book does **not** generate are the
   ones it quotes from a source, and those sit next to the quote that carries them.

## What was cut, and why

**Nine entries were merged into neighbours.** The charter proposed forty to eighty concepts
and this atlas carries <!-- gen:stat:nodes -->90<!-- /gen:stat:nodes -->. Nine near-duplicates
were folded rather than dropped: each one's anchor is carried onto the surviving entry as a
second quote, so the evidence stayed and only the heading went.

<!-- gen:folded -->

| Merged entry | Into | Its anchor survives as |
|---|---|---|
| everything is a node | [a node alone means nothing](#node-alone-means-nothing) | a second quote on that entry |
| common ground is discovered, not imposed | [the five Reviews](#five-reviews) | a second quote on that entry |
| an anchor has no special authority | [the anchor node](#anchor-node) | a second quote on that entry |
| no registration with the parent | [the scope, and its right to override](#scope-and-override) | a second quote on that entry |
| nodes are nearly free | [the anchor node](#anchor-node) | a second quote on that entry |
| understanding over a standardised schema | [merging erases the disagreement](#dont-merge-vocabularies) | a second quote on that entry |
| the visualisation limit | [the blob](#the-blob) | a second quote on that entry |
| the absence of evidence is evidence | [a named absence beats a hidden one](#named-absence) | a second quote on that entry |
| whether it reaches reality is a measurable fact | [the twin](#twin) | a second quote on that entry |

<!-- /gen:folded -->

**And the deviation is recorded rather than argued away.** Ninety is ten above the charter's
ceiling, and the ten are not identifiable, because the cut was made by merging rather than by
counting down to a number. A different session could reasonably have cut harder and produced a
thinner, sharper book. This one judged that every remaining entry is anchored in a different
sentence of the corpus and reached by at least one other entry, so removing ten would be
choosing which ideas a reader cannot look up. The charter said the selection was mine, so
this is what the selection is.

**Whole subjects were left out.** Each of these could have been a region and is not.

- **Wardley maps** get one entry, not the chapter the founder's memo argues they deserve.
  The corpus carries twelve source blocks and eight rendered images, and the sharpest map in
  the material, the air-gap map, is still unrendered. A chapter here would have had to
  describe pictures that do not exist.
- **The commercial and economic thread.** The founder names it directly: a system that keeps
  a graph current even when the people in it do not want to. It is a hypothesis, it is
  testable, and the corpus barely carries it. It is in the gaps rather than the entries.
- **The nineteen sibling sites** are one entry between them. Each holds an argument that
  would connect into this atlas if it were extracted, and none of them has been.
- **The three worked security graphs** (browser isolation, the two-factor instance graph,
  the AWS permission closure) are referenced where they demonstrate something and do not
  have entries of their own. They are worked examples of the concepts here rather than
  concepts.

## What this book gets wrong, as far as it can tell

**Most of the graph is a reading.** <!-- gen:stat:authored_edges -->151<!-- /gen:stat:authored_edges -->
of the <!-- gen:stat:edges -->168<!-- /gen:stat:edges --> edges are authored rather than
anchored. Every one carries its reasoning, and every one is a place where a different reader
would have drawn something else. If you disagree with this book, this is where the
disagreement lives.

**The peak ranking measures the compression, not the corpus.** A concept ranks high because
this atlas connected it a lot. The table is printed anyway, with the caveat attached, because
a ranking with a stated bias is more useful than no ranking.

**The regions are a cut, and a cut is a claim.** Eight was chosen because it matched the
charter's own suggested neighbourhoods and because the concepts fell into them without
forcing. A cut by altitude, or by which artefact demonstrates each idea, would have produced
a different and equally defensible book.

**Two sources were fetched rather than carried.** The parent project's vault index and
network index are live pages, and pages change. Snapshots of both are committed beside the
data in `data/fetched/`, and the validator checks the quotes against those snapshots, so the
anchors are stable even though the pages are not. The fetch date is on both entries.

**And one of those snapshots is redacted.** The vault index publishes
<!-- gen:stat:published_vaults -->19<!-- /gen:stat:published_vaults --> read keys on purpose,
and they carry no write capability, but a credential travels with every copy of it and this
repository is not where they are published from. Each key in the snapshot is replaced with
`sgit_rk1_<read-key-redacted>:<vault-id>`, the redaction is stated in a banner at the top of
the file, and nothing this volume quotes touches a key. Everything else in it is the page's
exact bytes.

**One correction inherited rather than repeated.** The estate's own published skill file says
object identifiers are the hash of the plaintext. They are the hash of the ciphertext. This
book states it correctly and does not republish the error, which is the same course the
first edition took.

## What remains open

The <!-- gen:stat:gaps -->9<!-- /gen:stat:gaps --> named absences are in *What the atlas
found*, quoted from the corpus. Four of them are open questions for this atlas specifically
rather than for the estate.

1. **Layer 2 does not exist here either.** This volume connects concepts across documents, so
   it is a first pass at the bridge layer the second edition has not started. But its edges
   are authored, not negotiated between parties, which is what a bridge is supposed to be.
   A real bridge layer would have two authors disagreeing on it.
2. **No concept in this atlas carries its byte offsets.** The pilot extraction anchors to
   recorded offsets in frozen bytes; this atlas anchors to a quote and a source, verified by
   search. That is weaker, and it is weaker on purpose, because sixty-three sources across
   two editions and a live estate cannot all be frozen without freezing the estate. The
   quotes are verified against the bytes on every build, which catches a moved quote; it does
   not catch a quote that appears twice.
3. **The atlas does not extract the sibling sites.** Nineteen arguments sit one hop away and
   none of them is in the graph.
4. **The verb register is small and five of its verbs are used once.** `names`, `determines`,
   `departs-from`, `provides` and `replaces` each carry one or two edges. By the estate's own
   rule for extending an edge set, a verb used once has not yet earned its place, and either
   the edges should be renamed or the verb should go.

## How to check any of this yourself

Everything is in one folder of a public repository, and nothing in it needs privileged
access.

- `data/universe.json` is the machine twin: every concept, edge, alias, distinction,
  contradiction and gap, with the source of each anchor and the SHA-256 of every carried
  source at the time this book was built.
- `build/validate.py` is the gate. Run it and it re-reads all
  <!-- gen:stat:quotes -->165<!-- /gen:stat:quotes --> quotes out of the sources they name.
- `build/gen_chapters.py --check` fails if any chapter has drifted from the data.
- `content/*.md` is the source of truth for the text. The web pages render it in the browser
  and this PDF is printed from it, so neither can disagree with it.

## Credits and licence

Written by Claude, an AI system made by Anthropic, as one session of a three-book commission
recorded in the estate's memo of 26 August 2026. The founder's words throughout are source
material, reproduced without edit. Built against estate version
<!-- gen:stat:estate_version -->v0.5.11<!-- /gen:stat:estate_version --> on
<!-- gen:stat:built -->2026-08-26<!-- /gen:stat:built -->.

Released under the Creative Commons Attribution 4.0 International licence (CC BY 4.0).
