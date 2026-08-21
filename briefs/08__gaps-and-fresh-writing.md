# 08 — Gaps: What Must Be Written Fresh

Twelve gaps. These are the pages the corpus **cannot** supply, ranked by how much they block the site.

---

## Blockers

### G1 · The founder's own "meaning through connectivity" essay does not exist
**The single most important page on the site, and it must be written from scratch.**

The philosophy's canonical written statement (`library/concepts/v0_4_0__thinking-in-graphs.md`) was written for **Issues-FS**, by a different hand, about issue tracking, on 5 February 2026. Every founder-voice statement of the thesis in the SG/Send corpus is a **fragment inside a brief about something else**.

His own version lives in a **LinkedIn post series** that he asked to be supplied as prerequisite reading on 10 June 2026 (`briefs/06/10/network-intelligence/v0.33.16__arch-brief__...subgraph-flip-verb-edges.md` line 19 records the ask, and the agent's note that it was not provided). **It is still absent from the corpus.**

**What to do:** import the LinkedIn series, then write the page from his voice using the 35 quotes in `01__the-thesis.md` as the skeleton. Do **not** lift the Issues-FS essay and present it as his.
**Blocks:** `/`, `/start/meaning-through-connectivity/`, everything downstream.

### G8 · Licence blocker on the foundational documents
All ~46 founder conceptual briefs end with *"released under the Creative Commons Attribution 4.0 International licence (CC BY 4.0)"* — 1,103 files repo-wide carry it, 223 of them graph-topic.

**The three `library/concepts/` documents carry no licence line at all** and are attributed to Issues-FS. So do `library/concepts/README.md`, `library/guides/agentic-setup/v0_4_0__role-ecosystem-guide.md` and the three `REFERENCE__from-issues-fs.md` role files.

The site's intended centrepiece is the one thing in the corpus with **unresolved publishing rights**, and `/start/` is built almost entirely from it.
**What to do:** resolve licence and attribution before launch. This is the only true hard blocker in the pack.

---

## Missing pages the corpus assumes exist

### G2 · "Documents are projections of graphs" has no home document
Always invoked as **already established** — *"the same way I talk about documents being projections of graphs"* (4 Jun) — and then applied to skills, compliance standards, and legal texts. The general principle is never argued anywhere.

It is load-bearing for the entire product line: vault-per-standard, the regulation graph, skills-as-graph, and the consolidation-equals-customisation insight all rest on it.
**What to do:** write the synthesis page. Raw material: `briefs/06/04/v0.32.3__arch-brief__sg-send-skill-as-projection-of-graph-forking-ecosystem.md` + `briefs/07/31/canonical-act-build/v0.33.54__arch-brief__...paragraph-as-file-amendment-as-native-graph-operation...md` + `briefs/05/30/v0.31.9__arch-brief__sg-send-vault-per-standard-document-to-graph-artefacts.md`.
**Target page:** `/depth/everything-is-a-projection/`

### G3 · "Why graphs at all" — the outsider's page
Every document in the corpus **assumes the reader already accepts** that graphs are the right substrate. There is no page that argues it to a sceptic, and none that distinguishes this use of graphs (semantics) from the two common ones (network analysis, query performance).

The corpus knows it is doing something unusual — *"Not a graph database pitch"* — but never explains what.
**What to do:** write it. This is the page that stops a graph-literate reader dismissing the site in the first thirty seconds.
**Target page:** `/why-graphs/`

### G4 · The vocabulary page the founder explicitly asked for
Quote 34, 9 August 2026: users *"don't know about semantic graphs, don't know about ontologies… we also need to explore different UIs, and different ways to name this."* The document's own gloss: *"naming is a design problem rather than a documentation one."*

The corpus contains **exactly one** terminology table — concept / term / taxonomy / ontology / semantic field / concept scheme — buried inside `briefs/08/06/voice-debrief/v0.33.56__...concepts-not-words...md`.
**What to do:** expand it into a real glossary, giving each term a **plain-English alternative alongside the technical one**. Draw the taxonomy-vs-ontology distinction from `briefs/07/31/canonical-act-build/v0.33.54__arch-brief__...taxonomy-upward-ontology-outward...md`.
**Target page:** `/glossary/` — **a named, outstanding request from the founder.**

### G5 · The corpus glossary is cited but does not exist
Appendix A of the 28 July brief cites *"the concepts glossary"* as the authority on edge-grammar discipline and the established edge set: `connected_to`, `observed_on`, `backed_by`, `measured_by`, `grants`, `reaches`, `enables`, `exposes`, `gives_rise_to`, `protected_by`, `conditional_on`, `defeated_by`, `owned_by`, `accepted_by`, `underwritten_by`.

**No such file exists in this repo.** It lives elsewhere (RiskMandate).
**What to do:** the website should either import it or **become it**. Becoming it is the better answer — an authoritative, versioned, public edge vocabulary is exactly what a graph reference site is for, and it directly serves the agent audience.
**Target page:** `/grammar/the-edge-set/`

### G6 · No newcomer path exists at all
`library/concepts/README.md` (254 words) is an **import manifest, not an introduction**. The three foundational docs are 3,800–5,000 words each with no summary, no diagram beyond ASCII, and no ordering. **There is no 500-word version of anything.**
**What to do:** the whole `/start/` section, plus a 500-word "the short version" on the front page. The teaching order in `02__concepts-index.md` is the sequence.

---

## Style blockers on excellent material

### G7 · The abstract style makes the best material unreadable cold
The 12 Jul, 17 Jul, 28 Jul and 9 Aug briefs — carrying **C17, C18, C20 and C22**, four of the most important concepts — each open with a **single bolded sentence of 400–500 words**.

The *ideas* are outstanding. The *documents* are not readable cold by anyone who is not already inside the project.
**What to do:** every Tier-1 brief from July onwards needs a written-fresh 300-word opener before publication. The highest-value single rewrite is `briefs/07/12/architecture/v0.33.48__...fractal-semantic-graphs...md` → `/depth/a-graph-at-every-boundary/`.

---

## Concepts with no document

### G9 · "The air gap" has no page
A vivid, load-bearing idea — the named, tracked place where the graph cannot reach reality — appears only as paragraphs inside two longer briefs (`briefs/06/26/digital-twins-and-world-models/v0.33.35__...integration-layer-real-world-tracked-air-gaps-agent-twin.md`, `briefs/06/26/risk-register-and-five-whys/v0.33.35__...`).

It has an excellent illustration waiting: **the air-gap Wardley map** (`briefs/07/28/mvp-and-field-demo/v0.33.53__strategy-brief__...airgapped-register...`) — *"the ends are solved, the middle is people."*
**What to do:** write the page, pair it with the map, and connect it to C3 (map the gaps). A named absence beats a hidden one — that is the site's own argument applied to itself.

### G10 · Time as a first-class dimension is asserted, never developed
*"Time is an event, things change"* (18 Jun) and `thinking-in-graphs.md` Part 6's versioned cross-graph edges are the entire treatment. **The corpus repeatedly says the graph moves and never explains how.**

Adjacent material that circles it without landing: the acceptance-interval ladder (1h/4h/2d/2w/1m/6m), `repealed_from` in the regulation graph, supersede-never-delete (C29), NHI 2.0's temporal permissions and "time travel", and the vault's own commit DAG — which is, after all, a working answer to "how does a graph change over time".
**What to do:** write it, and use the vault DAG as the shipped proof.

### G11 · No treatment of GraphRAG, hypergraphs, or property-graph vs RDF trade-offs
**Zero corpus hits** for "GraphRAG" or "hypergraph". The corpus has a *strong implicit position* against retrieval-by-similarity — *"Knowledge is traversed, not guessed… not a similarity search that returns plausible chunks"* — but **never engages the named field**.

A technical audience will ask on day one. There is no answer to cite.
**What to do:** write a short, fair positioning page. It should distinguish this approach from GraphRAG honestly rather than dismissively, and it should state the property-graph vs RDF position — noting that the live regulation graph **does** export RDF/Turtle, so the position is "both, at different layers", not "against RDF".

### G12 · Nothing links the philosophy to what actually ships
Per `team/roles/librarian/reality/`, the semantic-graph and ontology work is **almost entirely PROPOSED**. The shipped reality is the vault, the encryption, `sgit`, and the file-based substrate.

**Without an explicit page, the site will over-claim** — which would break the exact convention that makes the sibling sites credible.
**What to do:** `/shipped/`. Content and the honest sentence are in `05__site-architecture.md`. The good news: what *does* ship is genuinely interesting — a content-addressed multi-parent commit DAG with a real merge-base algorithm, a graph of graphs via `.link.json`, a DAG query API for untrusted apps, and 71 live nodes / 141 edges in `.issues/`.

---

## Summary — the twelve fresh pages

| Gap | Page | Priority |
|---|---|---|
| G1 | `/` + `/start/meaning-through-connectivity/` — the thesis in his voice | **1 — blocker** |
| G8 | (licence resolution, not a page) | **1 — blocker** |
| G6 | `/start/` × 5 + a 500-word short version | 2 |
| G4 | `/glossary/` | 2 — **explicitly requested** |
| G3 | `/why-graphs/` | 2 |
| G12 | `/shipped/` | 2 — **credibility** |
| G7 | 300-word openers for four July–August briefs | 3 |
| G5 | `/grammar/the-edge-set/` | 3 |
| G2 | `/depth/everything-is-a-projection/` | 3 |
| G9 | `/depth/twins-and-air-gaps/` (the air-gap half) | 4 |
| G11 | `/why-graphs/positioning/` — GraphRAG, RDF, hypergraphs | 4 |
| G10 | `/depth/time/` | 5 |

**Everything else on the site already exists in the corpus.** The 19 Tier-0 documents in `07__source-manifest.csv` are publishable near-as-is, subject only to G8.
