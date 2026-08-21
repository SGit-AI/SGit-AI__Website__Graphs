# 05 — Site Architecture

Page-by-page IA for `graphs.sgit.ai`, with the source document behind each page and its publish status.

**Status key:** ✅ publishable near-as-is · ✏️ needs framing or light edit · ✍️ **must be written fresh** · 🔗 links out to an existing live artefact

Founder briefs abbreviated as `briefs/`. Concept references (C1…C30) are defined in `02__concepts-index.md`.

---

## The shape

The site follows the sibling-site pattern (`/thesis/` → `/method/` → `/documents/` → `/admin/`) but adds a **progressive-depth spine**, because the founder's brief is explicitly *"initial concepts, and then more, and then more."*

Argue that spine from the corpus itself, using quote 35:

> *"this is just a question of **altitude**, like if you see something from a very high altitude you just see the city walls, and as you zoom in you start to see roads and buildings, and eventually people and cars."*

That makes the navigation a **demonstration of the thesis** (C13, C22) rather than merely a choice — the same self-consistency that makes sgit.ai's "this site is served from an encrypted vault" line land.

```
graphs.sgit.ai
├── /                       The one-sentence claim + the three altitudes
├── /start/                 ALTITUDE 1 — the city walls (5 pages)
├── /grammar/               ALTITUDE 2 — the rules you can apply tomorrow (5 pages)
├── /depth/                 ALTITUDE 3 — the full argument (8 pages)
├── /examples/              Real worked graphs, with real numbers
├── /maps/                  Wardley maps as graphs
├── /infographics/          The visual library
├── /glossary/              Plain-language vocabulary  ← explicitly requested
├── /shipped/               What is built vs what is argued
├── /origins/               Where we came from — the ten-phase arc
├── /network/               Bridges to sgit / pki / nhi / sg-sentinel
├── /documents/             Raw markdown source of truth
├── /admin/{comms,versions,index}
└── /llms.txt               The agent surface — see 06__house-style
```

---

## `/` — the front page

**Job:** make a graph-literate reader curious and a newcomer unafraid, in under 200 words.

| Element | Content | Source | Status |
|---|---|---|---|
| Epigraph | *"in our graph we do not use properties, because properties do not have meaning, they are just words; we capture meaning through connectivity."* | `briefs/06/26/digital-twins-and-world-models/v0.33.35__...twin-of-anything...md` | ✅ |
| The disclaimer, early | *"**Not a graph database pitch.** The claim is that one grammar is the interface at every boundary, not that we store things in a graph."* | `briefs/07/12/architecture/v0.33.48__...fractal-semantic-graphs...md` | ✅ |
| The hook story | **The 10,000-hours claim** — 242 papers, 200,000+ supporting citation paths, traced back to nothing. No security or legal background needed. | `briefs/08/09/graphing-text/v0.33.57__arch-brief__...fact-does-not-exist-in-a-vacuum...` | ✏️ |
| Three doors | Altitude 1 / 2 / 3 | — | ✍️ |
| Proof strip | 1,523 nodes · 1,944 edges (live) · 59/75 · 51/53 · 71/141 | `03__worked-examples-index.md` §numbers | ✅ |

---

## `/start/` — Altitude 1: the city walls

Five pages. No jargon before it is earned. **Every one of these is publishable near-as-is** from `library/concepts/v0_4_0__thinking-in-graphs.md` — subject to the licence resolution in G8.

| Page | Leaves them with | Source | Status |
|---|---|---|---|
| `/start/a-node-is-just-a-node/` | A label is not a meaning. A node connected to nothing is *literally* meaningless. | `thinking-in-graphs.md` Part 1 — the `port: 8080` example | ✅ |
| `/start/meaning-through-connectivity/` | The same value, differently connected, means different things. **The difference is not in the value.** | Part 2 + founder quotes 2, 3, 4 | ✅ |
| `/start/the-five-reviews/` | Five teams, five processes, one word. **Nobody has to agree on anything** for the graph to tell you where they overlap. | Part 2 (Review A–E: Tokyo / open source / Frankfurt / Lagos / São Paulo) | ✅ **the best on-ramp in the corpus** |
| `/start/confidence/` | The honest answer is *"we know X, we think Y, we cannot confirm Z"* — with a reason. | Part 5 (has an ASCII confidence ladder to redraw) + `briefs/06/16/theses-and-reflections/v0.33.38__...` | ✅ |
| `/start/map-the-gaps/` | Three of ten pieces of evidence **is** information. | `briefs/06/16/theses-and-reflections/v0.33.38__strategy-brief__confidence-through-evidence-blast-radius-graphs-mapping-the-gaps.md` | ✅ |

**Diagram to build:** the `Task-42` typed-graph tree (`thinking-in-graphs.md` lines 468–487) as interactive SVG. It teaches the whole thesis in one picture.

---

## `/grammar/` — Altitude 2: rules you can apply tomorrow

Five pages. Short, rule-shaped, immediately usable — **this is also the section an agent will consume**, so keep it dense and pasteable.

| Page | The rule | Source | Status |
|---|---|---|---|
| `/grammar/verbs/` | Every edge is a verb with a **distinct inverse**. `relates-to` is banned — everything relates to everything. Granularity of the verb is what makes the query precise. | `briefs/06/10/network-intelligence/v0.33.16__arch-brief__...subgraph-flip-verb-edges.md` (four-row table) | ✅ |
| `/grammar/direction/` | The inverse of an edge is **not the same edge walked backwards**. That asymmetry guarantees monotonic progress toward a peak — which is what stops the graph exploding. Includes the **17-query, 5-tier path language** with real notation. | `briefs/06/26/semantic-graph-and-query-paths/v0.33.35__arch-brief__...directed-edges-inward-outward-query-paths-prevent-node-explosion.md` | ✅ |
| `/grammar/paths-read-as-language/` | If your path doesn't read as a sentence **in the reader's own words**, your edges are wrong. *"The query is almost like a story."* | `briefs/06/26/semantic-graph-and-query-paths/v0.33.35__arch-brief__...path-properties-read-as-language...md` | ✅ *the most accessible doc in the corpus* |
| `/grammar/the-blob/` | Rich nodes are good. **Build wide, find the few, flip.** Never render the whole graph — render the result of a query. Legibility ceiling ~300–400 nodes; mermaid ceiling ~50. | `briefs/06/10/...subgraph-flip-verb-edges.md` + `briefs/08/02/vault-as-substrate/v0.33.55__arch-brief__...graph-canvas-repl...md` | ✏️ *the most persuasive page on the site* |
| `/grammar/anchor-nodes/` | Link to schema.org; don't **become** schema.org. Partial mapping is normal. Nodes are almost free — some exist only to anchor a query. | `thinking-in-graphs.md` Part 4 + `briefs/08/09/graphing-text/v0.33.57__arch-brief__...wikidata-is-the-concept-layer.md` | ✅ |

**Ship alongside:** `.issues/config/node-types.json` and `.issues/config/link-types.json` as a downloadable, *actually-running* example schema — 12 node types, 10 verb/inverse pairs with domain/range constraints, 71 live nodes.
⚠️ And narrate the honest tension: **the repo's own `link-types.json` ships a `relates-to` pair**, which its ontology brief forbids. Own it on the page.

---

## `/depth/` — Altitude 3: the full argument

Eight pages. This is the "then more, and then more" tier.

| Page | Concept | Source | Status |
|---|---|---|---|
| `/depth/against-schema-first/` | C1, C4 — *"They ended up attaching meaning to nodes rather than deriving meaning from edges… schema-first thinking dressed in graph syntax."* | `thinking-in-graphs.md` Part 4 | ✅ **highest-signal page for expert readers** |
| `/depth/ontologies-of-ontologies/` | C9 — three layers: shared facts / per-party formulas / declared bridges. **Merging erases the disagreement.** | `briefs/06/28/ontology-and-definitions/v0.33.36__...ontologies-of-ontologies-three-layers...md` (1,275 w, one clean table) | ✅ |
| `/depth/node-type-formulas/` | C8 — classification as a testable path pattern. *"The content of the node does not decide its type; its paths do."* | `briefs/06/28/ontology-and-definitions/v0.33.36__...node-type-formulas...md` | ✅ |
| `/depth/the-grounding-ladder/` | C16 — Fact → Evidence → Measure → Vulnerability → Risk. Downward grounds, upward implies. | `briefs/06/28/ontology-and-definitions/v0.33.36__...grounding-ladder...md` | ✅ |
| `/depth/fractal/` | C7 — *"Fractal is a precise claim, not a decoration."* Self-similarity, scale invariance, composition, recursion. | `briefs/07/12/architecture/v0.33.48__...` for the definition; `thinking-in-graphs.md` Part 3 for the readable version | ✏️ **rewrite the abstract** |
| `/depth/twins-and-air-gaps/` | C14 + C15 — every endpoint is a doorway to a real system; where it can't reach, **name the gap**. | `briefs/06/26/digital-twins-and-world-models/v0.33.35__...twin-of-anything...md` + `...integration-layer-real-world-tracked-air-gaps-agent-twin.md` | ✏️ (C15 has no home doc — G9) |
| `/depth/a-graph-at-every-boundary/` | C17 — meaning is lost and re-guessed at every JSON/prompt seam. Determinism, explainability, provenance, sovereignty are **consequences**, not features. Prompt injection fails at the validator, **structurally**. | `briefs/07/12/architecture/v0.33.48__...fractal-semantic-graphs...md` | ✍️ **highest-value rewrite on the site** — the ideas are accessible, the document is not (one ~500-word opening sentence) |
| `/depth/concepts-not-words/` | C21 — *"a nuance survives translation not because a translator preserved it but because it was never stored in a word."* Plus the corollary: a bad Portuguese rendering **diagnosed a bad English word**. | `briefs/08/06/voice-debrief/v0.33.56__...concepts-not-words-skos-is-the-model-divergence-is-the-finding.md` | ✅ |

**Then a "more" shelf** for C18 (messages as transformations), C19/C20 (projections; every paragraph is a graph), C22 (decompilation), C27–C30. Sources in `02__concepts-index.md`.

---

## `/examples/` — real worked graphs

The proof section. Each page: the problem · the graph (node/edge counts, types) · what the graph shows that a table cannot · the raw data · the source brief.

| Page | Numbers | Source | Status |
|---|---|---|---|
| `/examples/browser-isolation/` | **59 nodes, 75 edges**; 5 altitudes; includes 3 risks *of the mitigation* | `briefs/07/12/worked-business-case/v0.33.48__briefing__...five-levels-graph.md` | ✅ **start here** |
| `/examples/2fa/` | **51 nodes, 53 edges**, downloadable JSON with its principles declared inside the file; the **no-deny** interval mechanic (1h/4h/2d/2w/1m/6m) | `briefs/06/26/semantic-graph-and-query-paths/v0.33.35__data__sg-send-2fa-mappings.json` + 5 briefs | ✅ **the only downloadable graph** |
| `/examples/article-26-5/` | 8 facts (one unevidenced), 9 questions (**5 unanswered — the actual output**), a 2×2 whose empty bottom row is the finding | `briefs/08/02/vault-as-substrate/v0.33.55__arch-brief__...article-26-5...md` | ✅ |
| `/examples/aws-iam/` | 6 layers, ~31 node types, 20 edge types (40 readings), 7 formulas; worked instance 24/18. `AuthorizationClosure` = "the agentic union" | `briefs/07/05/aws-configuration-risk-engine/v0.33.44__arch-brief__...` | ✅ |
| `/examples/browser-extensions/` | Bidirectional: out to what it reaches, back in from "how can my email be attacked?" | `briefs/07/04/risk-cards-and-visualization/v0.33.42__arch-brief__...read-content-closure...md` | ✅ **highest relatability-to-length ratio; strong candidate for the first "aha" page** |
| `/examples/regulation-graph/` | **1,523 nodes · 1,944 edges**, 11 views, RDF/Turtle export, Art 9 Lab with a Graph REPL | 🔗 https://sgit.ai/demos/vaults/regulation-graph/ + 11 design briefs | 🔗 ✅ |
| `/examples/risk-graph-explorer/` | 18 facts / 37 risks / 14 provisions; 7 views; `permissions: {}` | 🔗 https://sgit.ai/demos/vaults/risk-graph-explorer/ | 🔗 |
| `/examples/incidents/` | Real published agentic incidents mapped to the ontology | `briefs/06/22/market-cases-and-graph/v0.33.32__research-brief__...published-incidents...md` | ✏️ |
| `/examples/pbom/` | SBOM for permissions — intent, blast radius, compounding, reachability | `briefs/06/18/agentic-permissions/v0.33.40__arch-brief__permissions-bill-of-materials...md` | ✅ |
| `/examples/10000-hours/` | 242 papers, 200,000+ paths, traced back to nothing | `briefs/08/09/graphing-text/v0.33.57__arch-brief__...fact-does-not-exist-in-a-vacuum...md` | ✏️ |

**The live demo to build:** `/examples/your-own-risk-graph/` — six questions, answers typed as fact/opinion/hypothesis/evidence, localStorage only, **no backend, no account, no LLM required**. Watch your own risk graph build itself. Source: `briefs/06/24/risk-acceptance-and-reviews/v0.33.34__dev-brief__...personal-risk-acceptance-scenario...md`. This is the single most valuable thing the site could ship beyond prose.

⚠️ **Not on the site:** the Odysseus case study (names a real product, needs a legal read) and the LinkedIn network CRM (real personal network data).

---

## `/maps/` — Wardley maps as graphs

Argue the connection first (C25): *a graph says these things are connected; a map adds where they sit — connectivity says what relates, position says what to do.*

| Page | Content | Status |
|---|---|---|
| `/maps/primer/` | 846-word primer, directly reusable as site copy | ✅ `briefs/06/23/wardley-maps/v0.33.33__strategy-brief__wardley-maps-primer-...md` |
| `/maps/how-to-render/` | The Mermaid toolchain **and the coordinate trap** (`[visibility, evolution]` — reverse of convention). Answers the founder's own stated need for "a good place to point to" | ✅ `briefs/05/24/sg-send-thread/v0.27.60__strategy-brief__...wardley-maps-setup-and-mermaid-capability.md` |
| `/maps/strategy/` | The 8 rendered PNGs + their stories. Cross-check sgit.ai `/demos/strategy-maps.md` — inline SVG versions may exist | ✅ |
| `/maps/permissions/` | **The 4 unrendered maps** incl. "Hope Driven Development" — render these | ✏️ |
| `/maps/the-air-gap/` | *"The ends are solved, the middle is people."* Plus the custom-evolution-axis adjudication rule | ✏️ **the best single map for a public site** |

---

## `/infographics/` — the visual library

nhi.sgit.ai's infographics page currently reads *"Awaiting resources."* This site should be where that changes. Full plan in `04__visual-assets-and-infographics.md` Part C. Structure: the `slides/slide-NN-name/{_page.json, brief.md, infographic.png}` shape, prompt beside output, so every image is regenerable and auditable — the same provenance discipline the site argues for.

---

## `/glossary/` — ✍️ written fresh, explicitly requested

The founder's own ask (quote 34): users *"don't know about semantic graphs, don't know about ontologies… we also need to explore different UIs, and different ways to name this."* The corpus contains exactly **one** terminology table — concept / term / taxonomy / ontology / semantic field / concept scheme — buried in `briefs/08/06/voice-debrief/v0.33.56__...concepts-not-words...md`. Start there, expand, and **give each term a plain-English alternative alongside the technical one.** Naming is a design problem here, not a documentation one.

Also missing and referenced-but-absent: the **corpus glossary** cited by Appendix A of the 28 Jul brief as the authority on edge-grammar discipline, listing the established edge set (`connected_to`, `observed_on`, `backed_by`, `measured_by`, `grants`, `reaches`, `enables`, `exposes`, `gives_rise_to`, `protected_by`, `conditional_on`, `defeated_by`, `owned_by`, `accepted_by`, `underwritten_by`). **No such file exists in this repo.** The website should either import it or **become it.**

---

## `/shipped/` — what is built vs what is argued

**Non-negotiable.** The sibling sites' credibility rests on this separation, and this site's subject matter is overwhelmingly design.

**Ships and is verifiable by reading code:** the SGit vault commit DAG (content-addressed, multi-parent, tree-per-directory, HMAC-derived deterministic refs, real wave-BFS merge-base, three-way merge, working two-track visualiser with inline-SVG fork/merge arcs) · a graph of graphs via `*.link.json` typed edges pinnable to a commit · a read-only DAG query API exposed to untrusted sandboxed apps (`sg.history.*`) · a live typed property graph (`.issues/`, 71 nodes / 141 edges) · the three published vaults.

**Does not exist anywhere in the repo:** MGraph-DB as a dependency · any graph database · browser SPARQL/Cypher · RDF/JSON-LD in code · the semantic risk ontology as a schema file · the path-query language · commit signing (`commit_v2.signature` is written and only ever `null`).

**The honest sentence:** *"We ship a hand-written content-addressed object graph in the browser. We do not use a graph database, and we say so in our own architecture notes."*

Best supporting document: `briefs/03/17/vault-redesign/v0.16.3__arch-note__four-layer-model.md` (1,791 w) — *"what we've built is not fundamentally an encryption system. It is a **content-addressed, portable, storage-agnostic version control protocol.**"* ✅ publishable as-is, and it carries its own honest caveat.

⚠️ **Two corrections to inherit rather than repeat:** `library/skills/use_sgit-and-vaults/SKILL.md` says object IDs are *"SHA-256 of plaintext"* — **the code hashes ciphertext.** And `sgraph_ai__website/.../sg-vault-primitives.html` implies attributability that commit signing does not currently provide.

---

## `/origins/` — where we came from

The ten-phase narrative arc is fully written in `01__the-thesis.md` §K, with dates and paths. Each phase links to 2–3 primary-source markdown twins under `/documents/`.

Include a **`/origins/paths-not-taken/`** page: the Issues-FS Lexicon package, cross-artifact compatibility testing (the most developed unimplemented idea in the corpus), MGraph-DB as the store (*"for now let's keep it simple"*), the Ontologist role. This is the provenance discipline the network argues for, applied to itself — the same move pki.sgit.ai makes.

---

## `/network/` — the cross-site bridges

Each sibling gets a page saying what it covers and **why the graph argument bears on it.**

| Bridge | The connection | Source |
|---|---|---|
| **pki.sgit.ai** | *"A public key in isolation does not give you anything; it is the graph it is connected to."* Plus *"revocation is the absence of trust, not the presence of a revocation entry"* — the earliest graph-native sentence in the corpus | quotes 3, 31 |
| **nhi.sgit.ai** | The reciprocal insight: **the semantic web's verification gap means graphs need identities too.** The most intellectually interesting claim in the corpus | `briefs/06/04/nhi-2.0/v0.32.3__arch-brief__...semantic-knowledge-graphs-of-identity.md` |
| **sg-sentinel.sgit.ai** | Control-flow graphs: *"the universe of what is possible is determined by the current state, not by everything the app technically allows"* — the WAF Achilles heel. Plus compliance as a living graph | `briefs/05/24/sg-sentinel-batch2/v0.27.60__arch-brief__sg-sentinel-control-flow-graphs-business-logic.md` |
| **sgit.ai** | The vault **is** a graph: content-addressed, hash-chained, branched. And the three live graph vaults | `briefs/03/17/vault-redesign/v0.16.3__arch-note__four-layer-model.md` |

Reciprocally: ask each sibling site to add a `/graphs/` bridge page pointing back. That is what finally gives the philosophy a linkable home — and it is the fix for the routing failure described in `00__BRIEF.md` §1.

---

## `/documents/` — raw markdown, source of truth

Follow the pki.sgit.ai pattern exactly: raw `.md` files under `/briefs/`, rendered reader pages under `/documents/`, and the page framing that says the raw markdown is the source of truth and the rendered page is presentation — *"the provenance discipline this project argues for, applied to itself."*

Candidate set and tiers: `07__source-manifest.csv`.

---

## Build order

Restated from `00__BRIEF.md` §7, with page targets:

1. ✍️ `/` + the thesis page (G1)
2. ✅ `/start/` — five pages, near-as-is
3. ✅ `/grammar/` — five pages + the downloadable `.issues/` schema
4. ✅ `/examples/` — browser isolation, 2FA, Article 26(5)
5. ✏️ `/grammar/the-blob/`
6. ✍️ `/glossary/` (G4)
7. ✏️ `/maps/` — render the 4 outstanding maps
8. ✏️ `/depth/` — eight pages, two needing rewrites
9. ✅ `/shipped/` — the honesty page
10. ✏️ `/infographics/` — build the graph prompt library first

---

This document is released under the Creative Commons Attribution 4.0 International licence (CC BY 4.0).
