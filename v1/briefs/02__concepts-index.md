# 02 — Concepts Index

**30 concepts.** For each: what it is, the canonical source(s) to go and read, when it first appeared, how well developed it is, and — critically — **whether a newcomer could follow the existing document**. That last column is what tells you which pages can be published near-as-is and which need rewriting.

All paths are relative to the repo root of `SGraph-AI__App__Send` @ v0.33.62 and were verified to exist.
Founder briefs live under `team/humans/dinis_cruz/briefs/` — abbreviated below as `briefs/`.

---

## Tier 1 — the core twenty-two

### C1 · Meaning Through Connectivity *(the root)*
A node carries no inherent meaning. What a thing *is* emerges from the edges traceable from it, and confidence in that meaning is proportional to connectivity depth and to the authority of the nodes reached. Properties are "just words"; connections are meaning. The operational corollary: identical content can be different things if their edges differ, and the same node can be classified differently by different parties without either being wrong.
**Read:** `library/concepts/v0_4_0__thinking-in-graphs.md` (Parts 1–2, 5) · `briefs/06/28/ontology-and-definitions/v0.33.36__arch-brief__sg-send-node-type-formulas-classification-as-testable-path-pattern-not-judgment.md` · `briefs/06/26/digital-twins-and-world-models/v0.33.35__arch-brief__sg-send-digital-twins-twin-of-anything-dimensions-discipline-of-reality-simulation-testing.md`
**First:** 2026-02-05 · **Maturity:** well-developed — the most argued concept in the corpus · **Newcomer-followable: YES**

### C2 · Confidence Is a Function of Connectivity
Every assertion sits on a computable confidence spectrum: no edges → few local edges → edges to typed definitions → edges to anchor nodes → edges to external references → rich multi-hop connectivity. Default posture is honest uncertainty — *"We know X. We think Y. We cannot confirm Z."* The remedy for low confidence is **enrichment** (add edges), never **enforcement** (add validation rules).
**Read:** `library/concepts/v0_4_0__thinking-in-graphs.md` (Part 5, has an ASCII confidence ladder) · `briefs/06/16/theses-and-reflections/v0.33.38__strategy-brief__confidence-through-evidence-blast-radius-graphs-mapping-the-gaps.md`
**First:** 2026-02-05, extended 16 Jun · **Maturity:** well-developed · **Newcomer-followable: YES**

### C3 · Map the Gaps (Absence of Evidence Is Evidence)
An honest system lists not only the evidence it has but the evidence it lacks. Knowing you hold three of ten needed pieces is itself vital information — it quantifies confidence and makes the business case for connecting the missing dots. In a regulation graph this becomes a **coverage measure**: a provision whose hooks reach no twin is a provision not actually mapped.
**Read:** `briefs/06/16/theses-and-reflections/v0.33.38__strategy-brief__confidence-through-evidence-blast-radius-graphs-mapping-the-gaps.md`
**First:** 16 Jun 2026 · **Maturity:** well-developed · **Newcomer-followable: YES** (short and plain)

### C4 · Compatibility Is Computed, Not Declared
Two things are compatible to the degree their subgraphs overlap when traced toward common reference points. Compatibility is a spectrum, is **asymmetric**, and is **purpose-relative** — two review processes may be compatible for "did someone look at this" and incompatible for "does this satisfy BaFin". No party has to agree to anything, change its process, or adopt a shared vocabulary.
**Read:** `library/concepts/v0_4_0__thinking-in-graphs.md` (Part 2 — the five-team Review example) · `library/concepts/v0_4_0__compatibility-through-connectivity.md`
**First:** 2026-02-05 · **Maturity:** well-developed · **Newcomer-followable: YES** — the five-team example (Tokyo / open source / Frankfurt / Lagos / São Paulo) is outstanding and needs no technical background. **This is the site's best on-ramp.**

### C5 · Every Artifact Is a Graph → Cross-Graph Compatibility
Prose docs, diagrams, code, config and runtime traces are five *languages* describing one truth. Extract a graph from each and compare. The question stops being "does the code work?" and becomes **"do all representations of this system agree on what it is?"** Divergence is information, not failure.
**Read:** `library/concepts/v0_4_0__compatibility-through-connectivity.md` (whole; Parts 2, 6, 7)
**First:** 2026-02-05 · **Maturity:** well-developed (10 principles + decisions log) but **never implemented** · **Newcomer-followable: YES**

### C6 · Anchor Nodes (Reference Without Authority)
An anchor node is well-connected, well-maintained, well-known — and has **no special authority**. Local nodes *link to* anchors at whatever granularity fits ("our `document_findings` step is similar to what schema.org calls `reviewBody`") rather than declaring "I am a schema:Review". The mapping is granular, honest, traversable, disputable, and can be added by a third party without touching the original node.
**Read:** `library/concepts/v0_4_0__thinking-in-graphs.md` (Part 4) · `library/concepts/v0_4_0__lexicon-architecture.md` (lines 91–189 contain a 97-row ASCII ontology tree — **redraw this as SVG; it is the site's signature diagram**) · `briefs/08/09/graphing-text/v0.33.57__arch-brief__sg-send-enrichment-and-shared-anchors-research-paid-once-wikidata-is-the-concept-layer.md`
**First:** 2026-02-05 · **Maturity:** well-developed conceptually; gestural on governance · **Newcomer-followable: YES**

### C7 · Fractal Graphs / Graphs of Graphs / Ontologies of Ontologies
Self-similarity, scale invariance, composition, recursion — one node-and-edge grammar, one validator, one query engine, one provenance rule at every altitude, from a property to a paragraph to a person to a national estate. *"Fractal is a precise claim, not a decoration."*
**Read:** `briefs/07/12/architecture/v0.33.48__arch-brief__sg-send-fractal-semantic-graphs-agentic-operating-layer-deterministic-sovereign-open-source.md` (the precise definition) · `library/concepts/v0_4_0__thinking-in-graphs.md` (Parts 3, 6 — the *readable* version) · `briefs/06/18/agentic-permissions/v0.33.40__strategy-brief__graphs-of-graphs-ontology-of-ontologies-permissions-mapping-reality-not-complexity.md`
**First:** 23 Feb 2026 as "graphs of graphs of graphs" applied to signed paragraphs; formalised 12 Jul · **Maturity:** well-developed · **Newcomer-followable: PARTLY** — the 12 Jul definition is precise but wrapped in a ~400-word single-sentence abstract

### C8 · Node Type Formulas (Classification as a Testable Path-Pattern)
What a node *is* is not decided by a human's judgment but by an explicit required pattern of typed, directed paths that a node either matches or does not. `Vulnerability := a Fact (grounded below) that also has an upward path to a Risk.` Judgment does not disappear — it moves out of the classifier's head and **into the formula**, where it is visible, versioned, inspectable and arguable.
**Read:** `briefs/06/28/ontology-and-definitions/v0.33.36__arch-brief__sg-send-node-type-formulas-classification-as-testable-path-pattern-not-judgment.md`
**First:** 28 Jun 2026 · **Maturity:** well-developed · **Newcomer-followable: PARTLY** (assumes C1)

### C9 · Three Layers: Shared Facts / Per-Party Formulas / Declared Bridges
Layer 1 is a shared factual graph owned by nobody. Layer 2 is per-party formulas that classify those nodes — a CISO's, a CFO's, a regulator's. Layer 3 is declared bridges connecting formulas at specific points. **Parties can disagree about meaning while still agreeing about facts, which is the only stable basis for working together.** Merging ontologies is rejected explicitly, because merging erases the disagreement.
**Read:** `briefs/06/28/ontology-and-definitions/v0.33.36__arch-brief__sg-send-ontologies-of-ontologies-three-layers-formulas-bridges-multiple-definitions.md` (1,275 words, one clean table)
**First:** 28 Jun 2026 · **Maturity:** well-developed · **Newcomer-followable: YES**

### C10 · Directed Edges with Distinct Inverses (and Why the Graph Doesn't Explode)
Every edge is directed and has a *distinct, meaningfully-named* inverse — `owned_by`/`owns`, `gives_rise_to`/`arises_from`. The inverse is not the same edge walked backwards. This asymmetry makes typed query paths narrow: at each hop fan-out collapses to edges matching type *and* direction, so traversals move monotonically toward natural peaks. Seed a query in a thousand places and the paths converge on a handful of peaks; result size is bounded by **peaks, not fan-out**.
**Read:** `briefs/06/26/semantic-graph-and-query-paths/v0.33.35__arch-brief__sg-send-directed-edges-inward-outward-query-paths-prevent-node-explosion.md` — contains a **17-query, 5-tier path language** with real notation (`-edge->`, `<-edge-`, `*`)
**First:** 22 Jun, developed 26 Jun · **Maturity:** well-developed · **Newcomer-followable: YES**

### C11 · Verb Edges, Never `relates-to`
Every edge is a verb, stated in both directions. `relates-to` is banned because it is meaningless — everything relates to everything. Granularity of the verb is what makes the query precise, and precise verbs are what let a path be read as a sentence.
**Read:** `briefs/06/10/network-intelligence/v0.33.16__arch-brief__sg-send-semantic-graph-visualisation-subgraph-flip-verb-edges.md` (four-row edge/reverse table anyone can read)
**First:** 10 Jun 2026 · **Maturity:** well-developed · **Newcomer-followable: YES**
⚠️ **The repo violates its own rule:** `.issues/config/link-types.json` ships a `relates-to` / `relates-to` pair, and one edge instance uses it. Narrate or fix — either way it is a teaching moment.

### C12 · Paths That Read as Language
A path should read as a natural sentence in the language, culture and business context of the reader: *this risk is created by this vulnerability, which impacts this system, which belongs to this entity, which has this stakeholder, who reports to this role…* Because the path reads as language, **the graph explains itself** rather than requiring a key.
**Read:** `briefs/06/26/semantic-graph-and-query-paths/v0.33.35__arch-brief__sg-send-path-properties-read-as-language-ontology-of-ontologies-multigraph-creation-paths.md`
**First:** 26 Jun 2026 · **Maturity:** well-developed · **Newcomer-followable: YES** — arguably the single most accessible conceptual document in the corpus

### C13 · The Blob Anti-Pattern, and the Wide-Then-Flip Method
The failure mode of semantic graphs is the blob: a hairball that shows nothing — and worse, triggers "a race to the bottom" where people *remove* relationships to keep the picture clean. Inverted here: rich nodes are good, enrich rather than prune, solve the blob at **query time**. Method: (1) a wide first pass captures the universe around a subject; (2) find the few relevant nodes; (3) **flip** and re-root the query at those nodes. Never render the whole graph; render the result of a query.
**Read:** `briefs/06/10/network-intelligence/v0.33.16__...subgraph-flip-verb-edges.md` · `briefs/08/02/vault-as-substrate/v0.33.55__arch-brief__sg-send-graph-canvas-repl-un-blinding-the-agent-mermaid-for-output-never-render-whole-graph.md`
**First:** 10 Jun 2026 · **Maturity:** well-developed · **Newcomer-followable: YES** — and **the most persuasive concept for anyone who has seen a graph demo fail**

### C14 · Digital Twins as the Graph's Endpoint (the Discipline of Reality)
A twin can be made of anything — an organisation, an inbox, a person, a behaviour, the weather, even luck — because a twin is just a system with properties, behaviours, functions, inputs and outputs. Twins are where the graph *stops modelling and continues into a real system*. Two properties: whether an endpoint actually reaches reality is itself a **measurable fact**; and everything modelled must be **real**, so the graph never fills with hypothetical risks.
**Read:** `briefs/06/26/digital-twins-and-world-models/v0.33.35__arch-brief__sg-send-digital-twins-twin-of-anything-dimensions-discipline-of-reality-simulation-testing.md`
**First:** 25 Mar 2026 (as "digital twin of the website"), expanded 26 Jun · **Maturity:** well-developed · **Newcomer-followable: YES**

### C15 · The Air Gap (What the Graph Cannot Reach, Named)
Where the graph cannot connect to a real system, the twin holds an explicit, tracked gap — *"this needs to be manually updated once a week, but the point is we now know where that gap is."* Any risk not connected to the register is an air gap. The operational sibling of C3: a named absence beats a hidden one.
**Read:** `briefs/06/26/digital-twins-and-world-models/v0.33.35__arch-brief__sg-send-digital-twins-integration-layer-real-world-tracked-air-gaps-agent-twin.md` · `briefs/06/26/risk-register-and-five-whys/v0.33.35__arch-brief__sg-send-risk-register-graph-of-graphs-facts-only-no-deny-cascade-cia-blast-radius.md`
**First:** 26 Jun 2026 · **Maturity:** partially argued · **Newcomer-followable: NO** — only ever a paragraph inside longer briefs. **Gap G9: needs its own page.** The Wardley air-gap map (see `04__visual-assets-and-infographics.md` Set D) is its natural illustration.

### C16 · The Grounding Ladder (Fact → Evidence → Measure → Vulnerability → Risk)
The worked instance of C8. Downward is grounding ("is it real?"), upward is implication ("what does it mean and why does it matter?"). A Fact becomes a Vulnerability the moment it acquires an upward path to a Risk. Measure is *not* the floor — the true floor is the last node where going deeper would neither improve observability nor change a decision. Explicitly framed as **one** formula among possible others.
**Read:** `briefs/06/28/ontology-and-definitions/v0.33.36__arch-brief__sg-send-grounding-ladder-fact-evidence-measure-vulnerability-risk-definitions.md`
**First:** 28 Jun 2026 · **Maturity:** well-developed · **Newcomer-followable: YES** for a risk-literate reader, partly otherwise

### C17 · A Graph at Every Boundary (Meaning Is Lost at the Seams)
The AI-native argument. Conventional agentic stacks glue layers with JSON and prompt text; at every seam structure, grounding and provenance are flattened and re-guessed — which is *where* determinism, explainability, provenance, sovereignty and auditability die. Make a semantic graph the interface at every boundary and six properties fall out as **consequences rather than features**. The model lives at the edge and only *proposes* a graph; a deterministic validator executes it. Untrusted input is data and can never become instruction, so **prompt injection fails at the validator, structurally**.
**Read:** `briefs/07/12/architecture/v0.33.48__arch-brief__sg-send-fractal-semantic-graphs-agentic-operating-layer-deterministic-sovereign-open-source.md` (with an honest-tensions table)
**First:** 12 Jul 2026 · **Maturity:** well-developed · **Newcomer-followable: NO** — the abstract is one ~500-word sentence. **The ideas are highly accessible; the document is not. This is the highest-value rewrite target on the site.**

### C18 · Messages Are Graph Transformations (Everything Is a Message)
Registers do not share a database; they talk. A message is not a notification *about* a change — it **is** the change: *"the command, the action that is transforming the graph."* Every mutation becomes an ordered message, making the system an eventually-consistent event stream whose by-product is a transaction log giving *"a hell of a provenance, and also determinism, explainability, but also a lot of resilience."* Because messages are structured, an LLM can produce and parse them — the same stream is the natural agent interface.
**Read:** `briefs/07/17/architecture-and-mvp/v0.33.49__arch-brief__sg-send-fractal-distributed-vault-architecture-registers-of-registers-messages-as-graph-transformations-transaction-log-pki-authorization.md`
**First:** 17 Jul 2026 · **Maturity:** well-developed, but flagged in-doc as needing its own brief (never written) · **Newcomer-followable: PARTLY** (interleaved with RiskMandate specifics)

### C19 · Documents (and Skills, and Standards) Are Projections of Graphs
The graph is the truth; the document is a view of it, generated in the context of use. Today's artefacts — a skill file, a compliance standard, a consolidated legal text — are *"static photographs of what they should be."* The sharpest version: don't **store** the consolidated text at all — hold the base text plus amendment instructions as data and **compute** the consolidated version as a projection. Consolidation and per-organisation customisation then turn out to be **one mechanism, not two**.
**Read:** `briefs/06/04/v0.32.3__arch-brief__sg-send-skill-as-projection-of-graph-forking-ecosystem.md` · `briefs/07/31/canonical-act-build/v0.33.54__arch-brief__sg-send-canonical-ai-act-paragraph-as-file-amendment-as-native-graph-operation-view-from-any-provision.md` · `briefs/05/30/v0.31.9__arch-brief__sg-send-vault-per-standard-document-to-graph-artefacts.md`
**First:** referenced as *already recurring* on 4 Jun — **the origin document is not in this repo** · **Maturity:** well-developed in application, **no home document for the general principle** · **Newcomer-followable: NO** — always stated by analogy to itself. **Gap G2.**

### C20 · Every Paragraph Is a Graph (Document → Graph Pipeline)
A document is not one blob but a hierarchy of paragraphs, points and definitions, each written for a reason and therefore yielding something extractable. Each provision carries its own subgraph, and those subgraphs present **hooks** the real world attaches to. A document's own definitions are the first and most valuable node layer, and three kinds of work follow: how they relate, **where they contradict** (the highest-value output, and the one nobody produces), and what the text uses but never defines (where interpretive risk concentrates).
**Read:** `briefs/07/28/regulation-graph-and-acceptability/v0.33.53__arch-brief__sg-send-every-paragraph-is-a-graph-eu-ai-act-definitions-as-nodes-twins-as-hooks-with-concepts-appendix.md` — **Appendix A is the single best existing concept summary in the whole corpus** · `briefs/07/31/canonical-act-build/v0.33.54__arch-brief__sg-send-document-ontology-positional-and-content-hashes-taxonomy-upward-ontology-outward-document-agnostic.md`
**First:** 23 Feb 2026 in embryo, doctrine 30 May, full 28 Jul · **Maturity:** well-developed · **Newcomer-followable: PARTLY** (body readable, abstract not)

### C21 · Concepts, Not Words (Meaning Must Not Live in a Language)
The unit of meaning is a **concept**, language-independent, carrying one preferred label per language plus alternates, related by broader/narrower/related. A term is how *one* language expresses it. Once meaning lives in a concept, translation stops being word-to-word and a whole class of failures disappears by construction. The unexpected corollary the founder discovered: **a bad Portuguese rendering diagnosed a bad *English* word** — naming a concept forces a decision the source language let you avoid. And where two languages' induced graphs diverge, that divergence is either an error or a genuine lexical gap — **and it is a finding.**
**Read:** `briefs/08/06/voice-debrief/v0.33.56__arch-brief__sg-send-concepts-not-words-skos-is-the-model-divergence-is-the-finding.md` — **opens with a plain terminology table** (concept / term / taxonomy / ontology / semantic field / concept scheme) which is exactly what a newcomer needs
**First:** 31 Jul via EuroVoc, named 6 Aug · **Maturity:** well-developed · **Newcomer-followable: YES**

### C22 · Decompilation, Not Compilation (the Author Is the Oracle)
Lifting text into a graph runs *concrete → abstract*, which in compiler terms is **decompilation** — ambiguous, and impossible to do reliably without help. The point is **not absolute truth but the author's own meaning confirmed by the author**, so lifting needs an oracle, and the author is the only party who holds the answer. Therefore a reader saying *"that is not what I meant"* is **not a failure of extraction — it is the elicitation working.** Every node at every altitude carries a source map back to the span it came from. Rendering is answered by **altitude**, not by subsetting.
**Read:** `briefs/08/09/graphing-text/v0.33.57__strategy-brief__sg-send-refactoring-meaning-decompilation-not-compilation-author-is-the-arbiter.md`
**First:** 9 Aug 2026 — the newest major concept · **Maturity:** well-developed · **Newcomer-followable: PARTLY**

---

## Tier 2 — the "then more" eight

| # | Concept | One line | Read | Maturity |
|---|---|---|---|---|
| **C23** | **Trust Through Connectivity** | Trust propagates like meaning: an identity is trusted to the extent it connects to nodes you already trust | `briefs/06/04/nhi-2.0/v0.32.3__arch-brief__sg-send-nhi-2.0-trust-and-identity-web-of-trust-agent-trust-scores.md` | partially argued |
| **C24** | **Clues, Not Storage** | A registry is not a place that holds all the information; it holds **clues** that let you find the right information | `briefs/06/05/v0.32.4__dev-brief__sg-send-pki-public-key-registry-on-vaults.md` | partially argued |
| **C25** | **Maps Are the Natural Evolution of Graphs** | A graph says these things are connected; a map adds *where they sit* — connectivity says what relates, **position says what to do** | `team/roles/cartographer/REFERENCE__from-issues-fs.md` | partially argued |
| **C26** | **The Two-Dependency Invariant** | Every repo depends on exactly two things: how we build (Type_Safe) and what we can link to (the Lexicon) | `library/concepts/v0_4_0__lexicon-architecture.md` | well-developed, Issues-FS-specific |
| **C27** | **Assertion vs Pointer (an Index Is Not a Source)** | Two structurally distinct node classes: pointers can be wrong without being dishonest, are regenerable, need no attribution apparatus, and are **safe to prune** | `briefs/08/09/graphing-text/v0.33.57__arch-brief__sg-send-index-is-not-a-source-caching-nodes-are-prunable-start-anywhere.md` | well-developed |
| **C28** | **Attach, Never Mutate** | Contributions attach as subgraphs to an author-confirmed spine; a bad pack is discarded rather than repaired — which is what makes **abundance a feature**. Weight by **independence, not count** | `briefs/08/09/graphing-text/v0.33.57__arch-brief__sg-send-evidence-packs-attach-never-mutate-weight-by-independence-not-count.md` | well-developed |
| **C29** | **Supersede, Never Delete (and Corrections Must Propagate)** | A superseded claim is marked from a date, not removed — and the graph can then **find every conclusion resting on it**, which a document cannot. Carries the corpus's best external example: the **10,000-hours claim** (242 papers, 200,000+ supporting citation paths, traced back to nothing) | `briefs/08/09/graphing-text/v0.33.57__arch-brief__sg-send-fact-does-not-exist-in-a-vacuum-agenda-is-context-corrections-must-propagate.md` | well-developed |
| **C30** | **It Does Not Matter Where You Start** | The graph will be deep where the work is and absent elsewhere — not a defect, **the property that makes the project finite** | `briefs/08/09/graphing-text/v0.33.57__...index-is-not-a-source...md` | gestural (one paragraph, high value) |

---

## The teaching order — this IS the site's information architecture

Ordered so each step is motivated by the previous one and **no step requires a forward reference**. Steps 1–5 are "initial concepts"; 6–12 "then more"; 13–18 "then more".

| # | Page | The one thing they leave with | Primary source | Status |
|---|---|---|---|---|
| 1 | **A node is just a node** | A label is not a meaning. A node connected to nothing is *literally* meaningless. | `library/concepts/v0_4_0__thinking-in-graphs.md` Part 1 (`port: 8080`) | publishable |
| 2 | **Meaning through connectivity** | The same value, differently connected, means different things. | Part 2 + founder quote 2 | publishable |
| 3 | **The five Reviews** | Five teams, five processes, one word. Nobody has to agree on anything for the graph to tell you where they overlap. | Part 2 (Review A–E) | **the best on-ramp in the corpus** |
| 4 | **Confidence is computable** | The honest answer is "we know X, we think Y, we cannot confirm Z" — with a reason. | Part 5 + `briefs/06/16/.../confidence-through-evidence...md` | publishable |
| 5 | **Map the gaps** | Three of ten pieces of evidence *is* information. | `briefs/06/16/theses-and-reflections/v0.33.38__...mapping-the-gaps.md` | publishable |
| 6 | **Not schema-first — and why the Semantic Web nearly got there** | RDF attached meaning *to nodes*; that is schema-first thinking in graph syntax. | Part 4 | **highest-signal page for expert readers** |
| 7 | **Anchor nodes: reference without authority** | Link to schema.org, don't *become* schema.org. Partial mapping is normal. | Part 4 + `briefs/06/26/...path-properties...md` | publishable |
| 8 | **Fractal: one grammar at every altitude** | Zoom into any node and you get a graph with identical rules. | `briefs/07/12/...fractal-semantic-graphs...md` | **needs rewriting** |
| 9 | **Ontologies of ontologies** | Don't merge vocabularies — merging erases the disagreement. Shared facts, separate meanings. | `briefs/06/28/...ontologies-of-ontologies-three-layers...md` | publishable |
| 10 | **Verbs, direction, and why the graph doesn't explode** | Ban `relates-to`. Every edge a verb with a distinct inverse. That asymmetry makes traversal converge. | `briefs/06/10/...subgraph-flip-verb-edges.md` + `briefs/06/26/...directed-edges...md` | publishable |
| 11 | **The blob, and how to defeat it** | Rich nodes are good. Build wide, find the few, **flip**. Never render the graph; render a query. | `briefs/06/10/...subgraph-flip-verb-edges.md` | **most persuasive page** |
| 12 | **Paths that read as language** | If your path doesn't read as a sentence in the reader's own words, your edges are wrong. | `briefs/06/26/...path-properties-read-as-language...md` | publishable as-is |
| 13 | **Node Type Formulas** | Stop asking a human "is this a vulnerability?". Define the type as a path-pattern and **compute** it. | `briefs/06/28/...node-type-formulas...md` | publishable |
| 14 | **Twins: where the graph stops modelling** | Every endpoint is a doorway to a real system. Whether it reaches reality is itself a fact. | `briefs/06/26/...twin-of-anything...md` | publishable |
| 15 | **A graph at every boundary** | Determinism, explainability, provenance and sovereignty are *consequences* of fixing the seams. | `briefs/07/12/...fractal-semantic-graphs...md` | **needs a rewrite** |
| 16 | **Everything is a projection** | The graph is the truth; the document, the skill, the standard are views. Compute them; don't store them. | `briefs/06/04/...skill-as-projection...md` + `briefs/07/31/...paragraph-as-file...md` | **needs a synthesis page (G2)** |
| 17 | **Concepts, not words** | A nuance survives translation because it was never stored in a word. | `briefs/08/06/...concepts-not-words...md` | publishable |
| 18 | **Decompilation, and the author as oracle** | Lifting text into a graph is ambiguous by nature. *"That's not what I meant"* is the feature. | `briefs/08/09/...refactoring-meaning-decompilation...md` | publishable |

**Argue the IA from the corpus itself** using quote 35 (city walls → roads → buildings → people). Progressive disclosure *is* altitude, which makes the navigation a demonstration of C13/C22 rather than merely a choice.

---

This document is released under the Creative Commons Attribution 4.0 International licence (CC BY 4.0).
