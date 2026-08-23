<!-- Preserved as received on 22 August 2026 from the librarian role of the
SGraph-AI__App__Send repository, which read reviews r001 and r002 and resolved their
open needs. Companion files in this pack are stored here as
13__sources__graph-articles.json and 13__send-repo-sources.csv. The findings are
threaded into the affected review items at /reviews/. -->

# graphs.sgit.ai — Book Review: Missing References and Where They Are

**Prepared:** 22 August 2026
**Site reviewed:** [graphs.sgit.ai](https://graphs.sgit.ai/) **v0.3.9** · book *Meaning Through Connectivity*, intro + 16 chapters in 6 parts
**Reviews read:** [r001](https://graphs.sgit.ai/reviews/r001.html) (first reading, v0.3.7, 9 items) · [r002](https://graphs.sgit.ai/reviews/r002.html) (humans and agents, v0.3.8, 9 items) — both `commented`, awaiting responses
**Sources searched:** `SGraph-AI__App__Send` @ v0.33.62 · `docs.diniscruz.ai` @ v0.3.123 · `files.diniscruz.ai` · sgit.ai and its published vaults

---

## Headline

The book agent has named **twelve** distinct pieces of missing material across the two reviews and ask **N3**. **Eleven are found.** One — the founder's reading screenshots — only the founder has.

The largest single unblock: **ask N3, waiting since 10 June, is `docs.diniscruz.ai`.** The LinkedIn series the agent has been asking for is published there as **16 articles, 122,741 words, 10 with their LinkedIn post URLs recorded in front-matter**. It also supplies the answer to r001 item 4 (lineage), r001 item 5 (the database claim), and part of item 3 (diluted concepts).

The second: **r002 item 4 — the "242 papers" citation study and the unsourced 10,000 hours — is one document, already fully sourced with live URLs.**

---

## A · What the agent says it is missing

Extracted verbatim from `r001.json`, `r002.json`, the two source briefs, and `/admin/comms.html`.

| # | Review item | What the agent says it needs | Found? |
|---|---|---|---|
| **1** | r001-3 · Chapter audit | "Source documents behind diluted concepts from reviewer's corpus" | ✅ |
| **2** | r001-4 · Lineage chapter | "Reviewer's earlier document on Semantic Web inspiration" | ✅ |
| **3** | r001-4 · Lineage chapter | "Ask N3 LinkedIn series verification" — *waiting since 10 June* | ✅ |
| **4** | r001-5 · Database claim | "Vault verification to attribute SPARQL/RDF and SQLite capabilities precisely" | ✅ |
| **5** | r001-6 · Screenshots | "Reviewer's reading screenshots as attachments" | ❌ **founder only** |
| **6** | r001-7 · Vaults chapter | "sgit.ai vault-section text for alignment verification" | ✅ |
| **7** | r001-8 · Case study | "SGit architecture briefs beyond the published pack" | ✅ |
| **8** | r001-8 · Case study | "IssuesFS ontologies & repo" | ✅ |
| **9** | r001-8 · Case study | "EmailFS design docs and live access if available" | ✅ |
| **10** | r001-8 · Case study | "Librarian's original research task and outputs" (team-as-graph) | ✅ |
| **11** | r002-4 · Evidence layer | "Corpus brief identifying the citation-network study behind the '242 papers' figure" | ✅ |
| **12** | r002-4 · Evidence layer | Sourcing the "10,000 hours" claim | ✅ |

Plus decisions only the founder can make, listed in §C: title casing/order (r001-2), the pilot chapter for the graph lift (r002-3), sequencing sign-off (r002-9), N6 legal read.

---

## B · Where each one is

Machine-readable, with canonical URLs, first-published dates, authors, PDF and LinkedIn links: **`sources__graph-articles.json`** (16 articles) and **`send-repo-sources.csv`** (24 repo paths, all verified at v0.33.62).

`briefs/` = `team/humans/dinis_cruz/briefs/` in `SGraph-AI__App__Send`.

---

### ① Ask N3 — the LinkedIn "graphs of graphs / meaning through connectivity" series

**Status on the site:** *"Waiting since 10 Jun. Requested as prerequisite reading; its absence creates a documentation gap."*

**It is `docs.diniscruz.ai`.** Sixteen articles, February 2025 – October 2025, in the founder's public voice, a year before the `__Send` corpus. Ten carry their LinkedIn post URL in front-matter — so this is not merely *about* the series, it *is* the series with its circulation record attached.

⚠️ **One calibration the agent should know before treating this as the canonical source.** The exact phrase *"meaning through connectivity"* returns **zero hits** across `docs.diniscruz.ai`. The published name for the idea there is **G³ — Graphs of Graphs of Graphs**, defined in a May 2025 white paper. `"graphs of graphs"` appears in 16 files. So N3 is answered — but the answer changes the title question in r001 item 2 (see §C).

| Article | Published | Words | Links |
|---|---|---|---|
| [Graphs of Graphs of Graphs (G3) in Threat Modeling](https://docs.diniscruz.ai/2025/05/30/graphs-of-graphs-of-graphs-g3-in-threat-modeling.html) | 2025-05-30 | 3,855 | **G³ named and defined** |
| [Empowering the Graph Thinkers in the Age of Generative AI](https://docs.diniscruz.ai/2025/06/18/empowering-the-graph-thinkers-in-the-age-of-generative-ai.html) | 2025-06-18 | 8,294 | the "why graphs at all" essay |
| [Using LLMs as Ephemeral Graph Databases](https://docs.diniscruz.ai/2025/06/19/using-llms-as-ephemeral-graph-databases--empowering-the-graph-thinkers-in-the-age-of-generative-ai.html) | 2025-06-19 | 7,334 | also resolves r001-5 |
| [From Top-Down to Organic Evolving Graphs, Ontologies, and Taxonomies](https://docs.diniscruz.ai/2025/03/29/from-top-down-to-organic-evolving-graphs-ontologies-and-taxonomies.html) | 2025-03-29 | 4,452 | the undiluted original |

---

### ② r001-4 — the Semantic Web inspiration document

**Primary, in the `__Send` repo:**
`briefs/02/24/v0.6.17__architecture__solid-protocol-integration-complementary-architectures.md` — **3,278 words, 24 Feb 2026.** Engages Solid, RDF and Berners-Lee directly and contains **four Turtle/RDF code blocks**. This is the document the review is reaching for.

**The disagreement half** — needed for a fair "on the shoulders" chapter:
`library/concepts/v0_4_0__thinking-in-graphs.md` Part 4 — *"The Semantic Web community identified the right problem… but ended up attaching meaning to nodes rather than deriving meaning from edges… This is schema-first thinking dressed in graph syntax."* ⚠️ Carries **no CC BY footer** and is attributed to Issues-FS — the licence question closed as N5 covers it, but the attribution must name Issues-FS.

**The wider lineage, already public:**
- [Bridging Niklas Luhmann's Ideas with Semantic Knowledge Graphs and G³](https://docs.diniscruz.ai/2025/06/18/bridging-niklas-luhmanns-ideas-with-semantic-knowledge-graphs-and-g3.html) — 2025-06-18, 4,727 w. **Zettelkasten lineage — the single best homage source.**
- [FIST Meets the Semantic Knowledge Graph](https://docs.diniscruz.ai/2025/06/22/fist-meets-the-semantic-knowledge-graph-aligning-fast-inexpensive-simple-tiny-with-dinis-cruzs-g3-approach.html) — 2025-06-22, 6,278 w. G³ positioned against an existing tradition.
- Also relevant: `briefs/02/23/part-3/v0.6.14__research__pki-historical-analysis-and-market-viability.md` — the "is this the right primitive?" self-challenge, Feb 2026.

---

### ③ r001-5 — the database claim ("we don't use databases" overstates it)

**The exact correction the agent needs is already written, in the founder's own words:**

`briefs/07/12/architecture/v0.33.48__arch-brief__sg-send-browser-local-databases-query-engine-vault-source-of-truth-incremental-sync-no-backend.md` — **2,229 words, 12 July 2026**, titled *"The Browser Is The Database."*

> **"although we are not using databases in the natural sense, an always-on database that needs to be maintained, when I say we do not use databases, we use a file system as a database, it does not mean the system has no databases, it just means the source of data is the file system that gets loaded."**

That single quote resolves item 5. The brief goes on: IndexedDB natively, **SQLite compiled to WebAssembly** for real SQL, incremental sync keyed to the vault commit id, dump-to-vault snapshots.

**The verification the agent asked for is available live** — the published regulation-graph vault has **1,523 nodes / 1,944 edges** across **11 views** including a **SQLite interface**, an **RDF layer with Turtle export**, and an **Art 9 Lab with a Graph REPL**: https://sgit.ai/demos/vaults/regulation-graph/

**Supporting:**
- `briefs/07/28/regulation-graph-and-acceptability/v0.33.53__arch-brief__sg-send-customised-standard-eu-ai-act-graph-nothing-relevant-until-facts-attach-browser-query-layer.md` — *"we could even run SPARQL or Cypher queries on the browser"*; cites **Oxigraph** (WASM SPARQL) and **Kuzu-WASM**
- `briefs/03/17/vault-redesign/v0.16.3__arch-note__storage-backend-mapping.md` — **4 Cypher blocks**, Neo4j/Neptune mapping (already carries its own "future vision" banner at line 12)
- `briefs/06/10/network-intelligence/v0.33.16__arch-brief__sg-send-semantic-graph-visualisation-subgraph-flip-verb-edges.md` — *"There is even a graph database, MGraph-DB, we could use, but for now let's keep it simple."*
- Public and citable: [Ephemeral Neo4j Instances for On-Demand Graph Analytics](https://docs.diniscruz.ai/2025/06/25/ephemeral-neo4j-instances-for-on-demand-graph-analytics.html) (8,272 w) · [a worked cybersecurity risk-graph scenario](https://docs.diniscruz.ai/2025/06/25/using-ephemeral-neo4j-instances-for-a-cybersecurity-risk-graph-scenario.html) (5,946 w) · [Data Tests for Neo4j](https://docs.diniscruz.ai/2025/06/25/data-tests-for-neo4j-bringing-automated-testing-to-graph-databases.html) (9,623 w) · [FAQ — MGraph-DB](https://docs.diniscruz.ai/2025/07/04/faq-evolving-semantic-graphs-and-ontologies-with-llms-and-mgraph-db.html) (5,533 w)

⚠️ **A precision the agent must not lose:** `mgraph-db` is **not a dependency** of `__Send` — `pyproject.toml` and `poetry.lock` carry `mgraph-ai-service-cache` only, which is a *caching* service, not a graph database. The only `mgraph_db` import in the repo is a vendored benchmark CI never runs.

---

### ④ r001-7 — sgit.ai vault-section text

Live and fetchable: `https://sgit.ai/vault/index.md` · `/vault/vault-apps.md` · `/vault/sub-vaults.md` · `/vault/content-authoring.md` · `/vault/sg-bridge.md` · `/vault/git-and-vaults.md` · `/vault/static-hosting.md` · `/demos/vaults/index.md`

The three vaults the review calls "real-life examples" are published with read keys: [regulation-graph](https://sgit.ai/demos/vaults/regulation-graph/) · [risk-graph-explorer](https://sgit.ai/demos/vaults/risk-graph-explorer/) (18 facts / 37 risks / 14 provisions, 7 views, `permissions: {}`) · [agentic-browser-isolation](https://sgit.ai/demos/vaults/agentic-browser-isolation/) (17 entry points, ~70 JSON files, 104 files / 2.4 MB / 4 commits, `fs.write: []`).

---

### ⑤ r001-8 — the four case studies

#### Case study 1 · SGit — **14 briefs, ~22,600 words**

| Path | Words |
|---|---|
| `briefs/03/17/vault-redesign/v0.16.3__arch-note__four-layer-model.md` | 1,791 |
| `briefs/03/17/vault-redesign/v0.16.3__arch-addendum__deterministic-addressing-and-sub-tree-model.md` | 1,683 |
| `briefs/03/17/vault-redesign/v0.16.3__arch-simulation__deterministic-ids-and-indexes.md` | 4,697 |
| `briefs/03/17/vault-redesign/v0.16.3__arch-note__storage-backend-mapping.md` | 3,019 |
| `briefs/03/17/vault-redesign/v0.16.3__impl-guide__cli-detailed.md` | 3,235 |
| `briefs/03/17/vault-redesign/v0.16.3__master-index__vault-architecture-session.md` | 1,512 |
| + 4 `impl-plan__*` and `v0.16.3__debrief__cross-repo-analysis-and-live-vault-inspection.md` | ~2,900 |
| `briefs/03/13/v0.13.30__arch-spec__branch-model-unified-storage.md` | 4,793 |
| `claude-code-web/05/08/v0.2.2__design__real-time-vault-viewer.md` | 3,230 |
| `briefs/03/30/v0.19.7__dev-brief__sgit-visualisation.md` | 886 |

**The best one for the book is `four-layer-model.md`:** *"what we've built is not fundamentally an encryption system. It is a **content-addressed, portable, storage-agnostic version control protocol.**"* Layer 1 is named as "Content-Addressed Object Graph."

**And the code is the evidence** — the vault DAG ships: `sgraph_ai_app_send__ui__vault/v0/v0.2/v0.2.3/_common/js/lib/sg-vault/` (object store, commit, ref-manager, sync with a real wave-BFS merge-base, history) and `.../components/vault-sgit-view/` (the two-track DAG visualiser with inline-SVG fork/merge arcs). `library/guides/vault-html/AUTHORING.md` §701 documents the public `sg.history.*` API.

#### Case study 2 · IssuesFS — **the ontology is live in the repo**

This is also open task **T2** on the comms board, and it is the cheapest credibility on the site:

- `.issues/config/node-types.json` — **12 node types** with statuses, properties, icons
- `.issues/config/link-types.json` — **10 verb/inverse edge types** with source/target domain-range constraints
- `.issues/issues/**/issue.json` — **71 nodes / 141 edges**, edges materialised bidirectionally; **107 `issue.json` files repo-wide**
- `library/dependencies/issues-fs/v0.4.0__issues-fs__architecture-overview.md` (13,311 b) · `user-guide.md` · `v0.6.1__guide__agent-workflow-issues-format.md` · `v0.2.32__llm-brief__gitgraph-manual-issues-workflow.md`
- `library/concepts/v0_4_0__lexicon-architecture.md` — the Issues-FS Lexicon; lines 91–189 are a **97-row ASCII anchor-node ontology tree** with edges out to schema.org, SKOS and W3C PROV-O. **Redraw as SVG — it is the book's signature diagram.**

⚠️ Honest tension worth narrating rather than hiding: `link-types.json` ships a `relates-to`/`relates-to` pair, which the project's own ontology brief forbids. One edge instance uses it.

#### Case study 3 · EmailFS — **4 specification briefs, ~26,100 words**

| Path | Words |
|---|---|
| `briefs/05/06/email-fs-lite-v0.6.md` | 8,229 |
| `briefs/04/29/v0.22.23__architect__email-fs-simulation-v0.6.md` | 6,420 |
| `briefs/04/29/v0.22.23__architect__email-fs-specification-v0.6.md` | 6,122 |
| `briefs/04/29/v0.22.23__architect__email-fs-skill-v0.6.md` | 5,393 |
| `briefs/05/06/email-fs-comparison.md` | 2,927 |
| `briefs/05/16/v0.27.45__dev-brief__sg-mail-email-client-on-vaults.md` | 4,027 |

Plus the origin: `claude-code-web/02/28/v0.7.4__explorer-response__architecture-briefs-n8n-emailfs-cyberboardroom.md`. The term reaches **101 files** in total.

#### Case study 4 · The team as a graph — **the "making-of"**

The review asks for "the librarian's original research task and outputs." The team-as-graph is not just documented, it is **instantiated**:

- **17 role directories** under `team/roles/`
- **59 reality-tree files** (`team/roles/librarian/reality/`) — the EXISTS/PROPOSED ledger, **956 documents catalogued**
- **213 librarian review files** (`team/roles/librarian/reviews/`)
- **36 `issue.json` nodes across role directories** — the roles have their own typed sub-graphs
- `.claude/CLAUDE.md` — the master rules and the role roster
- `library/guides/agentic-setup/v0_4_0__role-ecosystem-guide.md` (4,567 w) · `v0.1.0__guide__agentic-role-based-workflow.md` (5,814 w) · `v0.1.0__role-based-coordination.md` (3,980 w) · `v0.1.0__role-architecture-framework.md` (3,743 w)
- `team/roles/cartographer/REFERENCE__from-issues-fs.md` (4,537 w) — *a graph says these things are connected; a map adds where they sit*
- Public and already written: [Explorers, Villagers, and Town Planners](https://docs.diniscruz.ai/2025/06/10/explorers-villagers-and-town-planners-understanding-the-generative-ai-divide.html) (2025-06-10, 6,595 w) — **the team structure explained publicly, a year early**

---

### ⑥ r002-4 — the evidence layer: "242 papers" and "10,000 hours"

**Both are in one document, already fully sourced with live URLs:**

`briefs/07/31/projects-budgets-and-evidence/v0.33.54__strategy-brief__sg-send-paying-the-fact-creator-contextual-validation-not-truth-micropayments-for-correct-use.md` — **3,382 words, 31 July 2026.**

**The citation-network study** (line 178) — *"The 2009 citation network analysis identifying citation bias, amplification, and invention including the conversion of hypothesis into fact through citation alone, across a network of two hundred and forty-two papers and over two hundred and twenty thousand supporting citation paths"* — cited to:
- `https://pubmed.ncbi.nlm.nih.gov/19622839/` (Greenberg, *BMJ* 2009, "How citation distortions create unfounded authority")
- `https://www.semanticscholar.org/paper/How-citation-distortions-create-unfounded-analysis-Greenberg/d860c6d3e941e1cb28fd9f899035fb926fba7747`

**The 10,000-hours claim** (lines 50–52, 176) — 1993 study of violin students at a Berlin music academy; 2008 popularisation. **The memo records that the transcription garbled the name**, and corrects it: populariser **Malcolm Gladwell**, researcher **Anders Ericsson**. Sourced to salon.com, 6seconds.org and leapaheadapp.com. Findings: the figure was an average not a threshold, roughly half the top group had not reached it, the number was arbitrary, the students were not yet experts, and the mechanism was deliberate practice rather than accumulated time.

**This document is the perfect first entry in the facts register**, because it is itself a worked example of the practice: a claim reached for, checked, corrected, and sourced.

Companion: `briefs/08/09/graphing-text/v0.33.57__arch-brief__sg-send-fact-does-not-exist-in-a-vacuum-agenda-is-context-corrections-must-propagate.md` — where the same case becomes the argument for correction propagation.

⚠️ **Note for the agent:** the book currently says *"242 papers"* and the source says **242 papers, 675 citations, and over 220,000 supporting citation paths**. Check which figure the chapter uses — r002 item 4 flags this claim precisely because it is unsourced, and getting the number right on the fix is the point.

---

### ⑦ r001-3 — source documents behind diluted concepts

The review asks for the originals of concepts the book has flattened. Highest-value, all public:

| Concept in the book | The undiluted original |
|---|---|
| Organic vs top-down ontologies | [From Top-Down to Organic Evolving Graphs, Ontologies, and Taxonomies](https://docs.diniscruz.ai/2025/03/29/from-top-down-to-organic-evolving-graphs-ontologies-and-taxonomies.html) (2025-03-29, 4,452 w) |
| Customised standards | [Semantic OWASP](https://docs.diniscruz.ai/2025/04/02/semantic-owasp__leveraging-genai-and-graphs-to-customise-and-scale-security-knowledge.html) (2025-04-02) · [Scaling Europe's Regulatory Superpower](https://docs.diniscruz.ai/2025/03/31/scaling-europe-regulatory-superpower.html) (2025-03-31) |
| LETS — used in the corpus, never defined | [LETS (Load, Extract, Transform, Save)](https://docs.diniscruz.ai/2025/05/27/lets__load-extract-transform-save__a-deterministic-and-debuggable-data-pipeline_architecture.html) (2025-05-27, 9,362 w) |
| Time as a dimension (**also queued task T8**) | [Time as a Calibrator of Credibility and Trust](https://docs.diniscruz.ai/2025/10/02/time-as-a-calibrator-of-credibility-and-trust-in-information-systems.html) (2025-10-02, 13,486 w) |
| Fractal / G³ | [Graphs of Graphs of Graphs (G3)](https://docs.diniscruz.ai/2025/05/30/graphs-of-graphs-of-graphs-g3-in-threat-modeling.html) (2025-05-30) |

---

## C · Not found, and decisions only the founder can make

| Item | Status |
|---|---|
| **r001-6 · reading screenshots** | ❌ Not in any repo or site. Only the founder has these. The starter shot list still awaits confirmation |
| **r001-2 · title casing/order, PDF filename strategy, hero eyebrow** | Founder decision — but see the G³ finding below |
| **r002-3 · which chapter to pilot as a graph** | Founder decision (proposal is ch5) |
| **r002-9 · sequencing sign-off** | Founder decision |
| **N6 · legal read on the named third-party product** | External. This is the Odysseus case study — same item flagged in the newsroom pack |
| **Origin material in the external CBR repo** | Three documents (~15,000 w) catalogued in `team/town-planner/roles/librarian/reviews/02/21/v0.5.8__review__cbr-investment-catalogue.md`, not present in `__Send`. Mostly news-relevant, but retrieve while you are there |

### The title question, reframed by what N3 turned up

r001 item 2 proposes retitling to *Fractal Semantic Graphs*. Worth putting in front of the founder before that lands: **the concept already has a published name with a two-year track record.** *Graphs of Graphs of Graphs (G³)* was defined in a May 2025 white paper and carried through three follow-ups (Luhmann, FIST, ESG). The `__Send` corpus says "graphs of graphs of graphs" in prose 16 times but **never once uses G³** — because the naming happened on a site the corpus does not reference.

So the real choice is three-way, not two: keep *Meaning Through Connectivity* · adopt *Fractal Semantic Graphs* · or adopt the name that is already public and citable. Whichever wins, the lineage chapter should record that the concept was named G³ in May 2025.

---

## D · Suggested order

1. **Hand over `docs.diniscruz.ai`** — closes N3 (open 73 days) and feeds items 3, 4 and 5 at once. Nothing else unblocks four items with one action.
2. **Add the facts-register seed** — `paying-the-fact-creator` resolves r002-4 outright and unblocks r002-5 and r002-6 behind it.
3. **Ship the IssuesFS ontology JSON** — closes open task T2 and gives case study 2 a downloadable artefact.
4. **Correct the database claim** using the founder's own July quote, and cite the live regulation-graph vault as the verification.
5. **Put the G³ finding in front of the founder** before the v0.4.0 retitle.
6. **Ask for the screenshots** — the only genuinely blocked item.

---

## E · Files in this pack

| File | Contents |
|---|---|
| `book-review-source-resolution.md` | This document |
| `sources__graph-articles.json` | 16 `docs.diniscruz.ai` articles — canonical URL, first-published date, authors, PDF, LinkedIn, which review item each resolves. **122,741 words** |
| `send-repo-sources.csv` | 24 `__Send` repo paths, verified at v0.33.62, mapped to review items |

Every URL resolved live on 22 August 2026. Every repo path verified. Provenance fields follow the contract in the newsroom pack (`02__source-provenance-and-attribution.md`) so anything republished keeps its original date and link.

---

This document is released under the Creative Commons Attribution 4.0 International licence (CC BY 4.0).
