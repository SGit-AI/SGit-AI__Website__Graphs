# How to read this atlas

After this chapter you will be able to open any entry in the book, read it without a key,
and check it against the source in three hops.

## The unit is a concept, and it looks like this

Every entry has the same six parts, in the same order, because an atlas whose entries
have different shapes is a collection of essays.

| Part | What it is | How much to trust it |
|---|---|---|
| **The label and its family** | The name, and one of six kinds: concept, claim, position, method, example, artefact. | The family is this session's classification. |
| **The statement** | One sentence saying what the concept is. | Mine. A compression, and compression loses. |
| **The anchor** | A verbatim quote from a named source at a named section. | The source's, exactly. Machine-checked. |
| **Out and In** | The connections, written as sentences with their verbs. | Two kinds, and the chapter says which below. |
| **Where it shows up** | Where the idea is running, or is only argued. | Mine, drawn from the estate's own release record. |
| **The sketch** | The concept and its nearest neighbours, drawn. | Generated from the graph. It cannot disagree with it. |

Two smaller parts appear where the corpus supplies them. ***Also called*** carries the
other names an idea travels under. ***Near, but not*** carries the thing an idea is most
often mistaken for, which is frequently more useful than the definition:
<!-- gen:stat:nbn -->23<!-- /gen:stat:nbn --> of these are in the book, and most are quoted
from the estate's own lexicon, which records the distinction for every term it holds.

## The six families

A family is not a type in the technical sense used later in this book. It is a reading
aid, and it answers one question: what kind of thing is being asserted here?

- **concept.** An idea with a definition. *The anchor node. The blast radius.*
- **claim.** Something the corpus asserts to be so. *A node alone means nothing.*
- **position.** A stand taken, with an alternative it is taken against. *Enrichment, not
  enforcement.*
- **method.** Something you do. *Build wide, find the few, flip.*
- **example.** A worked case doing the arguing. *The five Reviews.*
- **artefact.** A thing that exists and can be opened. *The WCLM. The published vaults.*

The distinction that does the most work is **position** against **claim**. A claim can be
checked. A position has to be argued with, and the book tries to say which is which
rather than letting a preference wear the clothes of a finding.

## The two kinds of edge, and why the difference is printed

This atlas is a graph, so it obeys the grammar it documents: every connection is a verb,
every verb has a distinct inverse, and there is no generic association edge anywhere in
it. What it adds is a second field on every edge, because the edges were not all made the
same way.

An **anchored** edge is one the corpus states. Somewhere a document says that this idea
departs from that one, and the quote is on the edge.
<!-- gen:stat:anchored_edges -->17<!-- /gen:stat:anchored_edges --> of the
<!-- gen:stat:edges -->168<!-- /gen:stat:edges --> edges here are anchored.

An **authored** edge is one this session drew. The corpus does not say it in a sentence;
the reading is mine, and instead of a quote the edge carries the reasoning that produced
it. <!-- gen:stat:authored_edges -->151<!-- /gen:stat:authored_edges --> edges are authored,
which means most of this graph is a reading rather than a transcript. That ratio is
uncomfortable and it is printed rather than buried, because the estate's own method
register makes exactly this distinction between a carried link and an authored one, and
says a reader should always be able to tell which trust a line carries.

If you want to argue with this book, argue with the authored edges first. They are where
the interpretation lives.

## The verb register

<!-- gen:stat:verbs -->20<!-- /gen:stat:verbs --> verbs, each directed, each with a distinct
inverse, each stored in one direction only. An edge is never written using an inverse
name, which is why you will read *this enables that* and never *that is enabled by this*
in the data: the inverse is how the sentence reads when you walk the other way, not a
second edge.

<!-- gen:verbs -->

| Verb | Its inverse | Reads as | Used |
|---|---|---|---:|
| `bounds` | `bounded-by` | this is what keeps that finite | 8 |
| `carries` | `carried-by` | this travels with that wherever it goes | 6 |
| `computes` | `computed-by` | this is derived rather than asserted | 2 |
| `contradicts` | `contradicted-by` | these two cannot both stand as written | 3 |
| `demonstrates` | `demonstrated-by` | this worked artefact shows that idea running | 18 |
| `departs-from` | `departed-from-by` | this position is a deliberate departure from that one | 1 |
| `determines` | `determined-by` | this fixes the value of that | 1 |
| `enables` | `enabled-by` | this makes that possible | 10 |
| `extends` | `extended-by` | this adds to that without changing it | 16 |
| `generalises` | `specialised-by` | this is the wider statement of that | 5 |
| `grounds` | `grounded-by` | this idea is what that one rests on | 22 |
| `implements` | `implemented-by` | this is the built form of that idea | 29 |
| `licenses` | `licensed-by` | this permits that, without asking the centre | 3 |
| `measures` | `measured-by` | this is how that is counted | 8 |
| `names` | `named-by` | this gives that thing its word | 1 |
| `provides` | `provided-by` | this supplies that | 1 |
| `refuses` | `refused-by` | this rules that out on purpose | 7 |
| `remedies` | `remedied-by` | this is the answer to that problem | 5 |
| `replaces` | `replaced-by` | this supersedes that from a date | 1 |
| `requires` | `required-by` | this cannot be had without that | 21 |

<!-- /gen:verbs -->

The register is small on purpose. Every verb you add makes the graph more expressive and
every verb you add makes it harder to query, and the balance is a judgement rather than a
calculation. The *Used* column is the honest half: a verb used twice is a verb that has
not yet earned its place.

## The regions

<!-- gen:regions -->

02. **The meaning core.** Where the thesis lives: a node is an address, the edges are the meaning, and the same value differently connected is a different thing. *10 concepts.*
03. **The grammar of edges.** The rules that make a graph queryable: verbs with distinct inverses, no generic edge, paths that read as sentences, and the query rendered instead of the graph. *12 concepts.*
04. **Anchors, scopes and bridges.** How meaning crosses a boundary without anybody agreeing: reference points with no authority, scopes that override, and bridges instead of merges. *13 concepts.*
05. **Confidence, evidence and reality.** What a claim will bear, computed: the two ladders, the blast radius, the named absence, and the twin where the graph touches something real. *13 concepts.*
06. **Provenance, correction and time.** Who said it, what rested on it, and what happens when it turns out to be wrong. *8 concepts.*
07. **The fractal principle.** The title's first two words, as a testable claim: composition with local override, projections, altitude, and the map that a graph becomes when it gains position. *14 concepts.*
08. **The machinery.** What the estate actually built to hold all of this: the extraction, the core graph, the identity ledger, the instrument and the deterministic transformer. *13 concepts.*
09. **The estate, the vaults and the network.** Where the ideas are running, where they are only argued, and the honesty positions that separate the two. *7 concepts.*

<!-- /gen:regions -->

A concept belongs to one region and connects to any of them. The regions are cuts, and a
cut is a claim about where the joints are.

<!-- gen:counts -->

| Chapter | Region | Concepts | Edges inside it | Sources it draws on |
|---:|---|---:|---:|---:|
| 02 | The meaning core | 10 | 10 | 3 |
| 03 | The grammar of edges | 12 | 17 | 7 |
| 04 | Anchors, scopes and bridges | 13 | 12 | 5 |
| 05 | Confidence, evidence and reality | 13 | 14 | 6 |
| 06 | Provenance, correction and time | 8 | 9 | 6 |
| 07 | The fractal principle | 14 | 14 | 7 |
| 08 | The machinery | 13 | 8 | 4 |
| 09 | The estate, the vaults and the network | 7 | 5 | 6 |
| | **the whole atlas** | **90** | **168** (17 anchored) | **35** |

<!-- /gen:counts -->

## Checking anything in this book, in three hops

The commission asked for three spot-checks to pass on any entry. They are the same three
a reader can run, and running one takes about a minute.

1. **From a statement to its quote.** Every entry prints its own anchor. Read the quote and
   ask whether the statement above it is a fair compression.
2. **From the quote to the source.** Every source is named with its path in the public
   repository. Open the file, search for the quote. It is there, byte for byte, or the
   build that produced this book failed.
3. **From an edge to the entry at the other end.** Every connection names the concept it
   reaches, and that concept has an entry of its own in this book with its own anchor. The
   hop lands.

Where the estate demonstrates this: the same three hops are what the second edition's
reader does on screen. Click an extraction row and it shows the cited bytes in the frozen
source; click a highlight in the source and it shows the extraction row; click a node in
the graph and it shows both. This book is that instrument, printed.
