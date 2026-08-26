# Colophon: what was cut, and what remains open

This book argues that a named absence beats a hidden one. Here are its own.

---

## How this book was made

Written in one session by an AI agent working from a written commission, in the estate's
own working style: the markdown chapters under `v2/books/fsg/content/` are the source of
truth, the web pages render that markdown in the browser so a page cannot drift from the
file it claims to render, and the printed version is generated from the same files by the
same build.

The corpus read for it, in the order the commission specified: the first edition's
seventeen chapter sources in full; the twenty-one frozen source documents, with four read
end to end; the nineteen founder memos of the second edition, verbatim, with the agent
readings that accompany them; the second edition's working surface, meaning the universe
extraction and its pipeline, the core graph, the identity ledger, the twelve operators and
their data; the release history, one narrated row per release; and two live fetches of the
external indexes, the published vault list and the network of sites, both made on 26 August
2026.

Every number in this book was computed from a file in the repository, quoted from a page
that was fetched, or read off a build that was run while writing. The unit suite was run
(84 passed, 0 failed). Where a figure could not be computed, the claim was not made.

The screenshots were taken from the real pages with the repository's own harness: headless
Chromium driven over the debug protocol against a local server, at site version v0.5.11.
Nothing was mocked and nothing was drawn from memory. The structural diagrams are ascii
art, which is diffable, reviewable in a pull request and prints without a rendering step.

## What was cut

**A chapter on time.** The corpus repeatedly says the graph moves and never explains how.
It was cut rather than written thin, because the material to write it does not exist:
"time is an event, things change" is close to the whole treatment. The adjacent pieces are
named in chapter seven so a future writer can find them, and the gap is recorded here
rather than smoothed over.

**A chapter on Wardley maps.** The first edition carries one, and it is good. It was cut
from this edition because its best material (a map is a falsifiable claim, and the
coordinate trap that will bite you on day one) is one chapter's worth of a different book,
and there is now a whole site about it. The single sharpest idea in it, that a gap has no
evolution so what you plot is the labour that fills it, survives in chapter seven.

**A chapter on origins.** The first edition's ten-phase history of how this thinking
arrived is genuinely useful and belongs to a different book, the one being written in
parallel about how these books get made. Repeating it here would have been the second
edition going again rather than further.

**The full worked graph of the identity and access management example.** Six layers, some
thirty-one node types, twenty edge types and seven formulas: too large to render usefully
in print, and rendering it badly would have violated the book's own rule about never
showing the whole graph. It appears in chapters two and five as the source of the
authorization closure, and it is published in full elsewhere.

**A comparison table against named commercial products.** Tempting, and dishonest, because
this estate has not run any of them at scale. Chapter two positions the argument against
approaches rather than against vendors, which is the comparison this book can actually
support.

**Every appendix except one.** A glossary, a source manifest, a gap catalogue and a list of
the estate's methods were all drafted and dropped. The reference card that remains is the
one a reader on a plane can use. The rest are published on the web where they can be kept
current, which is where reference material belongs.

## What remains open

The questions this book could not settle, stated as questions rather than hidden as
omissions.

**How does a graph change over time?** Unanswered, as above. The pieces exist and the
synthesis does not.

**Does the method survive twenty more documents?** One document has been through the
extraction pipeline. The pipeline's discipline (anchors that fail the build, coverage total
by construction, ratings that must be signed) is designed to scale and has not been scaled.
The honest state is one thorough demonstration.

**Is the storage-layer failure of the fractal test worth fixing?** Chapter six reports it:
three levels of the same zoom use three serialisations. There is a decent engineering
reason and nobody has decided whether the cost of removing it is worth paying. This book
took the strict reading of the test and reported the failure; a reader who takes the
composition reading (chapter nine, the stretched-use finding) would score it differently,
and that disagreement is unresolved.

**Where does a language model belong in the pipeline?** The design says: at the edge,
proposing, with both graphs kept as evidence. Nothing implements it. The first thing that
does will find out whether the typed contract really is enough, or whether the interesting
failures happen somewhere the types do not reach.

**Can an engine like the one in chapter eleven say anything useful at corpus scale?** Its
world is 951 tokens from one document. Everything about it is designed to compose across
documents, because tokens are content addresses and need no registry. Nobody has tried.

**Does the usage maturity model work when the author is not the rater?** Every rating in the
ledger so far was made by the agent that built it. The model's own principle says the
source's author should ideally rate the uses. That has not happened, and the first time an
author disagrees with a rating will be more informative than everything written about it
here.

**Is "not a graph database pitch" still true if any of this ships?** It is true today. A
reader in two years should check whether the sentence survived contact with a product, and
this paragraph exists so that the check has something to point at.

## Where this book might be wrong

Three places to attack it first, offered because a book with no stated weak points is
asking to be believed rather than read.

**The positioning in chapter two is written fresh.** The corpus holds a strong implicit
position and never engages the named field. If you know that literature well, that section
is where you will find this book weakest, and the estate's comms board is where to say so.

**Several inverse edge names in chapter three are proposals.** They are marked, and marking
is not the same as being right. Some of them will be bad names, and the way to find out is
for somebody to try to say them out loud in their own business.

**The engine of chapters eleven and twelve is one afternoon's world.** It is genuinely
deterministic, genuinely explainable, and genuinely tiny. Every claim about what its
architecture makes possible is a claim about an architecture, not a result at scale. If you
read those chapters as evidence that this approach works, you have read them harder than
they can bear. Read them as evidence that it is *buildable*, which is what they show.

## The figures

Every figure in this book, with the page it came from and the version it was taken at.

| Figure | Source |
|---|---|
| 1.1 The sense switch | `graphs.sgit.ai/v2/wclm/`, v0.5.11, prompt "graphs of graphs", sense switched to a chart of data |
| 1.2 The confidence ladder | drawn, from `graphs.sgit.ai/v1/start/#confidence` |
| 2.1 The four-step case | drawn, from `graphs.sgit.ai/v1/why-graphs/` |
| 2.2 The four losses | drawn, from `graphs.sgit.ai/v1/about/participant.html` |
| 2.3 Seven of the nineteen sites | `sgit.ai/network/index.html`, fetched 26 August 2026 |
| 2.4 The three uses of graph | `graphs.sgit.ai/v1/why-graphs/`, v0.5.11 |
| 3.1 Build wide, find the few, flip | drawn, from `graphs.sgit.ai/v1/grammar/#blob` |
| 3.2 The edge set | `graphs.sgit.ai/v1/grammar/edge-set.html`, v0.5.11 |
| 4.1 The three layers | drawn, from `graphs.sgit.ai/v1/depth/#ontologies` |
| 4.2 Four analogies | `v2/wclm/analogies.json`, quoted verbatim |
| 5.1 The grounding ladder | drawn, from `graphs.sgit.ai/v1/depth/#ladder` |
| 5.2 A finding that is arithmetic | drawn, from `graphs.sgit.ai/v1/examples/article-26-5.html` |
| 5.3 The claims table | `graphs.sgit.ai/v2/universe/thinking-in-graphs.html`, v0.5.11 |
| 6.1 The core graph ladder | drawn, from `v2/universe/data/core/thinking-in-graphs/index.json` |
| 6.2 The bind operator's page | `graphs.sgit.ai/v2/wclm/operators/`, v0.5.11 |
| 7.1 The stack | redrawn from `v1/docs/sources/fractal-semantic-graphs.md`, 12 July 2026 |
| 7.2 The air gap as a node | drawn, from `graphs.sgit.ai/v1/depth/boundaries.html#air-gap` |
| 7.3 One typed boundary | `graphs.sgit.ai/v2/wclm/operators/bind/`, v0.5.11 |
| 8.1 Three problems, one move | drawn, from `graphs.sgit.ai/v1/depth/boundaries.html#projections` |
| 8.2 The seven gates | quoted from `admin/build/gen_coregraph.py` |
| 8.3 The document's files | `graphs.sgit.ai/v2/universe/thinking-in-graphs.files.html`, v0.5.11 |
| 9.1 The extraction pipeline | drawn, from `v2/universe/README.md` |
| 9.2 The universe reader | `graphs.sgit.ai/v2/universe/thinking-in-graphs.html`, v0.5.11 |
| 9.3 The local graph | `graphs.sgit.ai/v2/universe/thinking-in-graphs.graph.html`, v0.5.11 |
| 10.1 Two addresses | drawn, from brief 31's recorded distinction |
| 10.2 Match, then mint | drawn, from `admin/build/gen_coregraph.py` |
| 10.3 The identity ledger | `graphs.sgit.ai/v2/universe/thinking-in-graphs.files.html`, v0.5.11 |
| 11.1 The WCLM's layers | `graphs.sgit.ai/v2/wclm/`, v0.5.11, prompt "meaning through connectivity" |
| 11.2 The twelve operators | `graphs.sgit.ai/v2/wclm/operators/`, v0.5.11 |
| 11.3 The three formulas | quoted from `v2/wclm/data/world.json` and the operator pages |
| 12.1 The evidence trail | `graphs.sgit.ai/v2/wclm/`, v0.5.11, winning meaning selected |
| 13.1 Six published vaults | `sgit.ai/demos/vaults/index.html`, fetched 26 August 2026 |
| 13.2 The vault chapters | `graphs.sgit.ai/v1/vaults/`, v0.5.11 |
| 13.3 The 2FA chain | drawn, from `graphs.sgit.ai/v1/examples/2fa.html` |
| 13.4 The 2FA graph | `graphs.sgit.ai/v1/examples/2fa.html`, v0.5.11 |
| 14.1 What ships | `graphs.sgit.ai/v1/shipped/`, v0.5.11 |
| 15.1 Ten rules on one page | drawn |
| 15.2 The rules page | `graphs.sgit.ai/v1/grammar/`, v0.5.11 |

Fifteen of the thirty-eight are screenshots of real pages, taken with the repository's own
harness at site version v0.5.11. The rest are drawn, and each names what it was drawn from.

## Thanks, and the standing invitation

This book stands on a corpus of more than 1,300 founder briefs recorded almost daily over
six and a half months, on the first edition that distilled them, and on four days of
building that turned an argument into machinery.

If something here is wrong, the fastest route is the estate's comms board or an issue on
the repository. Corrections that change a claim get a row in the release history, not a
silent edit. That is this book's own rule, and the point of writing it down is that it
applies to the book.

---

*Fractal Semantic Graphs: Meaning Through Connectivity* · graphs.sgit.ai · CC BY 4.0
