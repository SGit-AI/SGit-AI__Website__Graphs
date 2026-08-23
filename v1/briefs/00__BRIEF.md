# graphs.sgit.ai — Brief Pack

**Pack version:** v1.0 · 21 August 2026
**Target site:** `graphs.sgit.ai` (new sibling on the sgit.ai network)
**Source corpus:** `the-cyber-boardroom/SGraph-AI__App__Send` @ **v0.33.62** — read-only access assumed
**Sibling sites surveyed:** sgit.ai · pki.sgit.ai (v0.1.4) · nhi.sgit.ai (v0.1.19) · sg-sentinel.sgit.ai (v0.1.1)

---

## 0. Read this first

You are building a public reference site about **graphs** — specifically, about a use of graphs that is *not the common one*. The founder's framing, verbatim:

> "in our graph we do not use properties, because properties do not have meaning, they are just words; **we capture meaning through connectivity.**"
> — `team/humans/dinis_cruz/briefs/06/26/digital-twins-and-world-models/v0.33.35__arch-brief__sg-send-digital-twins-twin-of-anything-dimensions-discipline-of-reality-simulation-testing.md` · 26 Jun 2026

This is not "graphs make queries fast" and not "graphs model networks". It is a claim about **where semantics live**: a node carries no inherent meaning; what a thing *is* emerges from the edges traceable from it; and confidence in that meaning is proportional to how richly it is connected.

The corpus itself is explicit that this is unusual and easy to miss:

> "**Not a graph database pitch.** The claim is that one grammar is the interface at every boundary, not that we store things in a graph."
> — `team/humans/dinis_cruz/briefs/07/12/architecture/v0.33.48__arch-brief__sg-send-fractal-semantic-graphs-agentic-operating-layer-deterministic-sovereign-open-source.md`

**Your job is not to invent this material. It exists.** ~55 substantive conceptual documents (~135,000 words), ~20 worked graph applications with real node/edge counts, 13 Wardley maps, three already-published live graph vaults. Your job is to *organise, teach and render* it.

---

## 1. Why this site must exist

The founder's diagnosis, in his own words:

> "**a lot of the people that will use this don't know about semantic graphs, don't know about ontologies, don't know about a lot of the other terms**, so we also need to explore different UIs, and different ways to name this."
> — `team/humans/dinis_cruz/briefs/08/09/graphing-text/v0.33.57__strategy-brief__sg-send-refactoring-meaning-decompilation-not-compilation-author-is-the-arbiter.md` · 9 Aug 2026

And the mechanism of the under-weighting he has noticed in agents — the Librarian found it, and it is concrete and fixable:

> The three canonical philosophy documents sit in `library/concepts/`. They were **imported from a different project (Issues-FS) on 11 June 2026**. They are referenced by exactly **4 files in the entire repo**. They are **not referenced from `.claude/CLAUDE.md`** — the Phase-2 action in the import memo (`team/humans/dinis_cruz/briefs/06/10/_to-librarian/memo-to-librarian__thinking-in-graphs.md`) was never executed. An agent reading `CLAUDE.md` and working forwards **will never encounter the philosophy.**

That is why agents building the other sites under-weight connectivity. It is not a comprehension failure; it is a routing failure.

**Corollary for this site:** graphs.sgit.ai becomes the canonical, addressable, linkable home of the thesis. Once it exists, every other site and every future agent session can be pointed at one URL.

---

## 2. What the site is, in one paragraph

A public reference site that teaches, in increasing depth, a specific discipline of graph modelling — meaning through connectivity — and proves it with real worked examples drawn from six months of applied work across security, regulation, strategy and agent operations. It is progressive: initial concepts, then more, then more. It is honest: it separates what ships from what is argued. And it is the reference the founder can point people at instead of re-explaining.

---

## 3. Audiences, in priority order

| # | Audience | What they need | Where they land |
|---|---|---|---|
| 1 | **A smart newcomer with no graph background** | The five-Reviews example and the `port: 8080` example. No jargon before it is earned. | `/start/` |
| 2 | **An agent (LLM) picking up graph work** | The concept vocabulary, the edge grammar, the node-type formulas, and one machine-readable example it can parse | `/llms.txt`, `/grammar/`, `/examples/2fa/` |
| 3 | **A graph-literate practitioner** (RDF, Neo4j, GraphRAG) | The precise, respectful disagreement with schema-first practice; the blob anti-pattern; why the graph doesn't explode | `/against-schema-first/`, `/blob/` |
| 4 | **A security / GRC buyer** | Real worked examples with real numbers; computed reach vs asserted reach | `/examples/` |
| 5 | **The founder** | A place to point people at, and a place to keep adding to | the whole site |

Audience 2 is the one most sites omit and the one this network has already learned to serve — see §6.

---

## 4. The thesis in nine sentences (the site's spine)

Each is sourced. Full quote bank in `01__the-thesis.md`.

1. A node is just a node — a label is not a meaning, and a node connected to nothing is *literally* meaningless.
2. The same value, differently connected, means different things: the difference is not in the value, it is in the **connectivity**.
3. Therefore classification is a **query**, not a judgment: *"the content of the node does not decide its type; its paths do."*
4. Therefore confidence is **computable**, and honest uncertainty is the default posture — and the gaps are worth mapping too.
5. Schema-first breaks at every boundary; the Semantic Web made the subtle error of attaching meaning *to nodes* rather than deriving it *from edges*.
6. So don't merge vocabularies — **merging erases the disagreement**. Keep them intact and bridge them through anchor nodes.
7. Every edge is a **verb with a distinct inverse**; `relates-to` is banned because everything relates to everything; that asymmetry is what stops the graph exploding.
8. Never render the whole graph — render the **result of a query**; build wide, find the few, then **flip**.
9. And it is **fractal**: one grammar, one validator, one provenance rule at every altitude — zoom into any node and it expands into a graph obeying identical rules.

---

## 5. What already exists — do not rebuild it

Three graph artefacts are **already live and public** on sgit.ai. graphs.sgit.ai should *link, explain and teach from* these rather than duplicating them.

| Artefact | Real, verified numbers | URL |
|---|---|---|
| **Regulation graph** — EU AI Act (2024/1689 as amended by 2026/1744) from official Formex XML | **1,523 nodes · 1,944 edges**; 113 articles, 500 paragraphs, 417 points, 180 recitals, 13 annexes, 68 definitions; **11 views** incl. Cytoscape article graph, SQLite interface, **RDF/Turtle export**, and an **Art 9 Lab with a Graph REPL**; every element hash-verified (SHA-256) to source bytes | https://sgit.ai/demos/vaults/regulation-graph/ |
| **Risk Graph Explorer** | "Exposed" preset = **18 facts, 37 risks, 14 provisions**; **7 views** recomputed simultaneously; amber = exposure, green = assurance, **ghosted edges = unanswered**; `permissions: {}` — no network, no storage, fully client-side | https://sgit.ai/demos/vaults/risk-graph-explorer/ |
| **Agentic browser isolation** | **17 entry points**; 5 stakeholder altitudes L1 IT → L5 Board; acceptance-gated escalation with **no deny button**; ~70 JSON files; 104 files / 2.4 MB / 4 commits; `fs.write: []` | https://sgit.ai/demos/vaults/agentic-browser-isolation/ |

**Important:** the *design documents* for all three are in the Send repo; the *built artefacts* and their counts are not. Cite the live vault for numbers and the repo brief for reasoning. Paths in `03__worked-examples-index.md`.

Also already public and directly reusable: sgit.ai's `/demos/strategy-maps.md` (eight Wardley maps as inline SVG) and `/demos/sgit-maps.md`.

---

## 6. Inherit these four hard-won lessons from the sibling sites

**L1 — `llms.txt` is not a convenience, it is the whole surface.**
`team/humans/dinis_cruz/briefs/08/14/sgit-site-and-hub/v0.33.58__cross-team-brief__sgit-ai-agent-access-report-markdown-is-excellent-site-is-not-indexed.md` records an agent trying to consume sgit.ai: the index fetch worked and was *"better than almost anything comparable"* — then **link-following failed**, because agent fetch tools refuse URLs a search has not already returned, and the site is not indexed. Three mitigations, in order of speed: (1) make each `llms.txt` entry carry the page's **single most important fact**, not just what it covers; (2) publish a **single-file concatenation** of the whole doc set so one fetch gets everything; (3) get indexed.
pki.sgit.ai independently hit the same wall — its own site review records *"documentation that is excellent and unreachable."*

**L2 — a client-side-decrypted, browser-assembled site is invisible to crawlers.** The measured hypothesis is that *"a site whose pages are decrypted and assembled in the browser is exactly the shape a crawler struggles with."* Decide the rendering strategy — server-rendered HTML or a pre-rendered mirror — **before** content, not after.

**L3 — every topic section serves three readers, and the third is the one everyone omits.** Documentation (prose) · Live demonstration (embedded read-only vault) · **Agent guidance** (a recipe and a pasteable reference). Source: `.../08/14/sgit-site-and-hub/v0.33.58__strategy-brief__sgit-topic-sections-catalogue-read-keys-yes-write-keys-never-frozen-vaults.md`.

**L4 — publish read keys, never write keys; and escrow the write key before publishing.** A vault whose write key is lost is not damaged, it is **frozen**: permanently readable by anyone holding the published key, never updatable, never revocable, never correctable. Same source.

Plus the Mermaid trap that will bite you on day one: **Wardley coordinates are `[visibility, evolution]` — the reverse of the usual convention.** *"A map with its axes transposed renders happily and says something entirely different."* Wardley type added in Mermaid v11.14.0, production-stable v11.15.0.

---

## 7. Proposed build order

Modelled on the sibling sites' own numbered build orders, so the site can publish its roadmap the way pki.sgit.ai and sg-sentinel do.

| Step | What | Why this order | Sources |
|---|---|---|---|
| **1** | **The thesis page** — "Meaning through connectivity" in the founder's own voice | Everything else forward-references it. It is also the one page that does **not** exist and must be written fresh (see G1 in `08__gaps-and-fresh-writing.md`) | `01__the-thesis.md` |
| **2** | **`/start/` — the three-example on-ramp** | `port: 8080`, the five Reviews, and the confidence ladder. Publishable near-as-is from `library/concepts/v0_4_0__thinking-in-graphs.md` | `02__concepts-index.md` steps 1–4 |
| **3** | **`/grammar/` — the edge discipline** | Verbs, distinct inverses, no `relates-to`, paths that read as language, why the graph doesn't explode. Short, rule-shaped, immediately usable by an agent | `02__concepts-index.md` C10–C12 |
| **4** | **`/examples/` — three worked examples with real numbers** | Proof. Start with browser isolation (59/75), the 2FA JSON (51/53, downloadable), and Article 26(5) | `03__worked-examples-index.md` |
| **5** | **`/blob/` — never render the whole graph** | The most persuasive page for anyone who has seen a graph demo fail, and it justifies the site's own rendering choices | C13 |
| **6** | **`/glossary/`** | The founder explicitly asked for this (G4). Must be written fresh | `08__gaps-and-fresh-writing.md` |
| **7** | **`/maps/` — Wardley maps as graphs** | 8 rendered PNGs exist; 5 more are one render command away | `04__visual-assets-and-infographics.md` |
| **8** | **`/depth/` — the "then more" tier** | Node type formulas, ontologies of ontologies, the grounding ladder, twins, fractality, a graph at every boundary | C7–C9, C14–C17 |
| **9** | **`/reality/` — what ships vs what is argued** | Non-negotiable. Without it the site over-claims. See §8 | `06__house-style-and-conventions.md` |
| **10** | **`/infographics/`** | nhi.sgit.ai's infographics page currently reads "Awaiting resources" across the estate. A graph-specific prompt library is the unlock | `04__visual-assets-and-infographics.md` Part C |

---

## 8. The honesty constraint — read this twice

The sibling sites' credibility rests on separating design from delivery. **This site's subject matter is almost entirely design.** Per `team/roles/librarian/reality/`, the semantic-graph and ontology work is overwhelmingly **PROPOSED**.

What actually **ships** and is verifiable by reading code:

- The **SGit vault commit DAG** — content-addressed (`obj-cas-imm-` + SHA-256 of *ciphertext*), multi-parent commits, tree-per-directory, HMAC-derived deterministic refs, a real wave-BFS merge-base over all parents, three-way merge, and a working two-track DAG **visualiser** with inline-SVG fork/merge arcs. `sgraph_ai_app_send__ui__vault/v0/v0.2/v0.2.3/_common/js/lib/sg-vault/` and `.../components/vault-sgit-view/`
- **A graph of graphs** — `*.link.json` typed edges between vaults, optionally pinned to a commit in the target's history. `.../lib/links/vault-links.js`
- **A read-only query API over the DAG** exposed to *untrusted sandboxed apps* — `sg.history.log/list/read/readText/readBlob`. `library/guides/vault-html/AUTHORING.md` §701
- **A typed property graph as live repo data** — 12 node types, 10 verb/inverse edge types with domain/range constraints, **71 nodes / 141 edges** in `.issues/` alone, 107 `issue.json` files repo-wide. `.issues/config/node-types.json`, `.issues/config/link-types.json`
- The three **published vaults** in §5

What does **not** exist anywhere in the repo: MGraph-DB as a dependency · any graph database · browser SPARQL/Cypher · RDF/JSON-LD serialisation in code · the semantic risk ontology as a schema file · the path-query language · commit signing (`commit_v2.signature` is written and only ever set to `null`).

**The honest sentence for `/shipped/`:** *"We ship a hand-written content-addressed object graph in the browser. We do not use a graph database, and we say so in our own architecture notes."*

Two corrections to inherit rather than repeat:
- `library/skills/use_sgit-and-vaults/SKILL.md` states object IDs are *"SHA-256 of plaintext"*. **The code hashes ciphertext.** Do not republish this claim.
- `.issues/config/link-types.json` ships a `relates-to` / `relates-to` pair — which the project's own ontology brief calls forbidden. One edge instance uses it. Either fix it or narrate it honestly; it is a good teaching moment either way.

---

## 9. What is in this pack

| File | Contents |
|---|---|
| `00__BRIEF.md` | This document — mission, thesis, build order, constraints |
| `01__the-thesis.md` | 35 sourced verbatim quotes; the page that must be written fresh |
| `02__concepts-index.md` | 30 concepts with canonical sources, maturity, and the 18-step teaching order |
| `03__worked-examples-index.md` | 20 real applications with node/edge counts, evidence quality and publishability |
| `04__visual-assets-and-infographics.md` | Every visual asset, the two infographic pipelines, the render backlog |
| `05__site-architecture.md` | Page-by-page IA with the source document behind each page |
| `06__house-style-and-conventions.md` | Sibling-site conventions, `llms.txt` policy, redaction rules, licensing |
| `07__source-manifest.csv` | Machine-readable: 100+ rows, path → tier → proposed page → publishability |
| `08__gaps-and-fresh-writing.md` | The 12 pages that must be written from scratch, and why |

**Every path in this pack was verified to exist at v0.33.62.** Where a filename was wrong in an earlier draft it has been corrected against the repo.

---

*Prepared by the SG/Send agentic team — Librarian, Cartographer, Architect and Designer, in session, 20–21 August 2026.*

---

This document is released under the Creative Commons Attribution 4.0 International licence (CC BY 4.0).
