# graphs.sgit.ai — a node is just a node; meaning lives in the edges

> "in our graph we do not use properties, because properties do not have meaning, they are
> just words; **we capture meaning through connectivity.**"
> — Dinis Cruz, 26 June 2026

*Source: <https://graphs.sgit.ai/index.html> · site v0.3.2 · markdown twin of the front page.*

**Not a graph database pitch.** The claim is that one grammar is the interface at every
boundary — not that we store things in a graph. There is no graph database anywhere in the
work behind this site, and [we say so on its own page](shipped/index.html).

---

## The one that needs no background

Two variables in a Python program. Both hold `8080`.

| | Reached by tracing outward |
|---|---|
| `port = 8080` | `int`. That is the whole graph. |
| `port = Safe_UInt__Port(8080)` | a type carrying a range constraint → a library → a pinned version → its tests, repository, licence, maintainer |

**The difference is not in the value.** The meaning is identical in the developer's head and
radically different in the graph — and the graph is what another system, another team, or an
agent has to work from. [The five-minute version](start/index.html).

## Three altitudes

| | Section | What you leave with |
|---|---|---|
| **1 — the city walls** | [/start/](start/index.html) | A node alone means nothing; the same value differently connected means different things; nobody has to agree for the overlap to be computable; confidence is a function of connectivity; a named absence beats a hidden one. |
| **2 — roads and buildings** | [/grammar/](grammar/index.html) | Every edge is a verb with a distinct inverse. The generic association edge is banned. Paths must read as sentences. Rich nodes are good. Never render the whole graph — render the result of a query. |
| **3 — people and cars** | [/depth/](depth/index.html) | Against schema-first; merging vocabularies erases the disagreement; classification as a computed path-pattern; the grounding ladder; supersede never delete; concepts not words. Plus [a graph at every boundary](depth/boundaries.html). |

The IA is the argument: *"this is just a question of altitude, like if you see something from a
very high altitude you just see the city walls, and as you zoom in you start to see roads and
buildings, and eventually people and cars."*

## The story that makes the case

Expertise takes **10,000 hours** — from a 1993 violin study, where it was an *average*, not a
threshold, and half the top group had not reached it. The original author spent his career
correcting the popularisation, and **none of the corrections ever attached to the claim**: by
then it had been carried through **242 papers** and more than **200,000 supporting citation
paths** that lead back to nothing.

A document cannot fix that. A graph can: mark the claim superseded from a date, then ask which
conclusions were resting on it. [Supersede, never delete](depth/index.html#supersede).

## Real numbers

| Graph | Numbers | Status |
|---|---|---|
| [EU AI Act regulation graph](https://sgit.ai/demos/vaults/regulation-graph/) | **1,523 nodes · 1,944 edges**; 11 views; RDF/Turtle export | live vault |
| [Risk Graph Explorer](https://sgit.ai/demos/vaults/risk-graph-explorer/) | 18 facts / 37 risks / 14 provisions; `permissions: {}` | live vault |
| [Agentic browser isolation](https://sgit.ai/demos/vaults/agentic-browser-isolation/) | 17 entry points; 5 stakeholder altitudes | live vault |
| [Browser isolation risk graph](examples/browser-isolation.html) | **59 nodes, 75 edges** — including 3 risks *of the mitigation* | parsed from the brief |
| [The 2FA instance graph](examples/2fa.html) | **51 nodes, 53 edges**, one machine-readable file | parsed from the brief |
| The issue tracker's own graph | **71 nodes, 141 edges**; 12 node types, 10 edge types | measured, live repo data |

[All worked examples](examples/index.html).

## What ships, and what is argued

Ships and is verifiable by reading code: a content-addressed commit DAG with multi-parent
commits, a real wave-BFS merge-base and three-way merge; a graph of graphs via typed
`*.link.json` edges; a read-only DAG query API exposed to untrusted sandboxed apps; a live
typed property graph; three published vaults.

Does not exist anywhere: **any graph database**, MGraph-DB as a dependency, browser SPARQL or
Cypher, RDF/JSON-LD in the code, the path-query language, commit signing (written, and only
ever `null`).

> *"We ship a hand-written content-addressed object graph in the browser. We do not use a graph
> database, and we say so in our own architecture notes."*

[The full separation](shipped/index.html).

## Why this site exists

The three canonical philosophy documents sit in `library/concepts/`, are referenced by four
files, and are **not referenced from the file every agent starts from**. An agent reading it and
working forwards never encounters the philosophy. That is a routing failure, not a comprehension
failure — so the fix is an address. [Origins, and the ten-phase arc](origins/index.html).

## Read it as a book

The site's content is also a book — **Meaning Through Connectivity**, sixteen chapters in
six parts, generated from the site's own pages so the two cannot drift:

- [Chapter pages, with the table of contents beside you](book/index.html)
- [The whole book in one page](book/single.html)
- [The print PDF](book/meaning-through-connectivity.pdf) — a 6″×9″ technical-book interior with gutters, folios and a paginated contents; print-on-demand ready — [cover included](book/cover/front.svg)
- [The screen PDF](book/meaning-through-connectivity-screen.pdf) — the site's own design at US Letter, made for reading on a tablet

Both PDFs regenerate together from the same chapters on every release and carry the site
version on their cover — the build fails if either lags the content.

## For agents

- [llms.txt](llms.txt) — every entry carries the page's single most important fact, not its topic
- [llms-full.txt](llms-full.txt) — the whole document set in one fetch
- [/briefs/](documents/index.html) — the raw markdown, which is the source of truth
- [The edge set](grammar/edge-set.html) — the pasteable vocabulary

## Site

- [Glossary](glossary/index.html) — plain English alongside every technical term
- [Why graphs at all](why-graphs/index.html) — including GraphRAG and RDF positioning
- [The network](network/index.html) · [Origins](origins/index.html) · [The documents](documents/index.html)
- [Comms: tasks & requests](admin/comms.html) · [Release history](admin/versions.html) · [How this site is built](admin/index.html)
- [Participant disclosure, including where our approach loses](about/participant.html)

---

All content on this site is released under the Creative Commons Attribution 4.0 International
licence (CC BY 4.0). You are free to share and adapt this material for any purpose, including
commercially, as long as you give appropriate credit.
