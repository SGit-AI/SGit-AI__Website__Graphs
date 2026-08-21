# 03 — Worked Examples Index

**"Real world examples of what we used."** 20 applications where a graph was applied to a concrete problem. Ranked by how compelling they would be on a public site.

Founder briefs abbreviated as `briefs/` (= `team/humans/dinis_cruz/briefs/`). All paths verified at v0.33.62.

---

## Calibration: what is already published vs what is only in the repo

**Three graph artefacts are LIVE on sgit.ai.** Their real numbers come from the published vaults; their *reasoning* is in the repo briefs. Link to the live artefact; teach from the brief. Do not rebuild.

| Live artefact | Verified numbers | Repo design source |
|---|---|---|
| [Regulation graph](https://sgit.ai/demos/vaults/regulation-graph/) | **1,523 nodes · 1,944 edges**. 113 articles, 500 paragraphs, 417 points, 180 recitals, 13 annexes, 68 definitions. 11 views incl. Cytoscape article graph, SQLite, **RDF/Turtle export**, and an **Art 9 Lab with a Graph REPL**. Parsed deterministically from official Formex XML via CELLAR, every element SHA-256 hash-verified to source bytes. Read key published. | Example **#4** below (11 briefs, ~36,000 words) |
| [Risk Graph Explorer](https://sgit.ai/demos/vaults/risk-graph-explorer/) | "Exposed" preset = **18 facts, 37 risks, 14 provisions**. **7 views** recomputed simultaneously. Amber = exposure, green = assurance, **ghosted edges = unanswered**. `permissions: {}` — no network, no storage, all client-side. | Examples **#7, #13** below |
| [Agentic browser isolation](https://sgit.ai/demos/vaults/agentic-browser-isolation/) | **17 entry points**. 5 altitudes L1 IT → L5 Board. Acceptance-gated escalation, **no deny button**. ~70 JSON files; 104 files / 2.4 MB / 4 commits. `fs.write: []`. | Example **#1** below |

⚠️ **A note on numbers.** The repo brief for browser isolation contains a **59-node / 75-edge** JSON graph. The published vault reports **17 entry points** and ~70 JSON files. These describe different things (the risk graph vs the site around it) — do not conflate them. Always cite which artefact a number belongs to.

---

## The catalogue

### 1. Agentic Browser Isolation — "Whose Session Is The Agent Using?"
**Problem.** Should an AI agent that browses and acts run inside the user's own browser (with their live, past-MFA sessions, their desktop, their network position) or in an isolated browser with a scoped identity? Answered as **computed reach**, not adjectives.
**The graph.** **59 nodes, 75 edges**, complete inline JSON. Node types: Reality, Twin, Asset (4), Evidence (6), Measure (4), Fact (5), Grant (2), **AuthorizationClosure (2)**, BlastRadius (2), Vulnerability (6), **Risk (13 — including 3 risks *of the mitigation*)**, PreventiveControl (3), DetectiveControl, Owner (7: IT → CISO → CFO/COO/DPO → CEO → Board), AcceptanceDecision (2). Edges: `backed_by`, `observed_on`, `measured_by`, `grants`, `exposes`, `reaches`, `impairs`, `gives_rise_to`, `owned_by`, `protected_by`, `conditional_on`, `emits`, `accepted_by`, `underwritten_by`, `connected_to`.
**Read.** `briefs/07/12/worked-business-case/v0.33.48__briefing__sg-send-browser-isolation-agentic-automation-business-case-facts-vulnerabilities-risks-five-levels-graph.md` — 4,601 words
**Evidence.** Designed only, but the graph is a real parseable artefact. Every claim externally sourced (7 public URLs: Brave's Comet injection research, arXiv 2505.13076, nhimg.org, vendor system cards).
**Visuals.** Three ASCII diagrams: R1 walked from page to board; the convergence pyramid; a 9-row Option A vs B closure comparison. **The JSON is drop-in renderable.**
**Why it teaches.** The best artefact in the corpus for *why a graph beats a slide*: the "what isolation changes" argument is a **computed closure difference a buyer can check**. And it deliberately includes three risks that the mitigation itself creates — honesty a table cannot express.
**Publishability.** ✅ Clean. Vendor-anonymous, no customer, no personal data. Carries its own "not legal advice" disclaimer. CC BY 4.0.

### 2. Article 26(5) End-to-End — Creditworthiness Agent, Fact to Board and Back
**Problem.** One EU AI Act provision, one concrete deployment, carried from a running system to a board decision and back down.
**The graph.** Explicit inventory in-document: 1 Reality · 1 Twin · **8 Facts (one deliberately unevidenced)** · 7 Evidence (one absent) · 5 Provisions (Annex III 5(b), Art. 26(5), 26(6), 14, 27) · 3 Vulnerabilities (derived: fact + provision) · 5 Risks (four in a chain, one meta) · 4 Stakeholder altitudes · 3 Decisions (+1 deliberately absent) · **9 Questions, 5 unanswered — "the actual output of the exercise"** · 2 Projects (+1 unfunded).
**Read.** `briefs/08/02/vault-as-substrate/v0.33.55__arch-brief__sg-send-end-to-end-worked-example-article-26-5-creditworthiness-agent-fact-to-board.md` — 4,272 words
**Evidence.** Designed, honestly: the organisation is invented and **every invented element is marked as such**. Act provisions verified against five external sources.
**Visuals.** Four ASCII diagrams incl. a 2×2 accepted/acceptable quadrant **whose bottom row is empty — that emptiness is the finding**.
**Why it teaches.** Contains the corpus's best paragraph on the thesis — *"What The Graph Shows That A Register Cannot"*: derivation; absence-as-a-finding; **escalation without an escalator** (R3 reaches the CFO because *nobody accepted it*, not because anybody raised it); and recoverability as a first-class dimension (*"the money can be refunded; the customer cannot be un-declined"*).
**Publishability.** ✅ Clean. Written to be published.

### 3. The 2FA Instance Graph — the only downloadable machine-readable example
**Problem.** Admin accounts on two systems lack 2FA. The graph carries it from that single configuration fact through the wrong acceptor, the governance air gap, the five-whys chain, up to the Board and the ICO, blooming through Confidentiality/Integrity/Availability.
**The graph.** **51 nodes, 53 edges**, plus an `acceptances` block, as a standalone parseable JSON file. Types: Risk 9, Actor 9, Evidence 6, Interval 6, Fact 5, Impact 3, System 2, Vulnerability 2, DataClass 2, Asset 1, ThreatAgent 1, Attack 1 (MITRE T1110.004), Obligation 1, Register 1, Twin 1, Agent 1. **Declared principles inside the file:** *"meaning comes from connectivity, not properties"*, *"facts only in phase one"*, *"every edge is directed and has a named inverse"*, *"every change cascades to the register"*.
**Read.**
- `briefs/06/26/semantic-graph-and-query-paths/v0.33.35__data__sg-send-2fa-mappings.json` — **the data** (1,253 words)
- `briefs/06/26/semantic-graph-and-query-paths/v0.33.35__arch-brief__sg-send-2fa-use-case-semantic-graph-ontology-nodes-edges-instance.md` — the ontology: **22 node classes, 34 edge-type rows** (2,441 words)
- `briefs/06/26/semantic-graph-and-query-paths/v0.33.35__arch-brief__sg-send-2fa-first-mappings-nodes-edges-acceptances-query-resolutions.md` — 1,764 words
- `briefs/06/26/risk-register-and-five-whys/v0.33.35__arch-brief__sg-send-risk-register-graph-of-graphs-facts-only-no-deny-cascade-cia-blast-radius.md` — 3,187 words
- `briefs/06/26/capstones/v0.33.35__dev-brief__sg-send-2fa-end-to-end-mvp-vault-issuefs-twins-visualise-operationalise.md` — 7-layer build, 6 phases, 10 acceptance criteria
**Evidence.** Designed, but **the most build-ready artefact in the corpus** — the Librarian's own debrief calls the JSON *"the immediate starting point for implementation"*.
**Why it teaches.** The only artefact that is **both a complete narrative and a machine-readable file** — hand a visitor the JSON and let them query it. And its **"no-deny" mechanic** (a real risk is accepted for an interval — 1h / 4h / 2d / 2w / 1m / 6m — never denied) is novel and immediately graspable.
**Publishability.** ✅ Clean. Generic org, generic roles. Carries `"license": "CC BY 4.0"` inside the JSON.

### 4. The EU AI Act Regulation Graph — **already live**
**Problem.** Turn a legal instrument into a citable, queryable graph where **nothing is relevant until your facts make it so** — the inversion of every compliance tool that hands you the whole text and asks you to strike out what doesn't apply.
**The graph.** Live: 1,523 nodes / 1,944 edges (see table above). Design: paragraph-as-file; definitions as the first node layer; **amendments as native graph operations**, not migrations; repealed provisions marked `repealed_from`, never deleted; attaches to reality through Twins ("hooks") — which makes **hook-coverage a measurable coverage metric over the instrument**. Ontology locked at **7 node types + 8 edge types + an `AcceptableLevel` node**.
**Read (11 briefs, ~36,000 words).** All under `briefs/07/28/regulation-graph-and-acceptability/` and `briefs/07/31/canonical-act-build/`. Start with:
- `briefs/07/28/regulation-graph-and-acceptability/v0.33.53__arch-brief__sg-send-every-paragraph-is-a-graph-eu-ai-act-definitions-as-nodes-twins-as-hooks-with-concepts-appendix.md` (3,854 w) — **and its Appendix A, the best concept summary in the corpus**
- `briefs/07/28/regulation-graph-and-acceptability/v0.33.53__arch-brief__sg-send-customised-standard-eu-ai-act-graph-nothing-relevant-until-facts-attach-browser-query-layer.md` (3,371 w)
- `briefs/07/31/canonical-act-build/v0.33.54__arch-brief__sg-send-canonical-ai-act-paragraph-as-file-amendment-as-native-graph-operation-view-from-any-provision.md` (3,078 w)
- `briefs/07/31/canonical-act-build/v0.33.54__research-brief__sg-send-no-canonical-ai-act-consolidated-version-absent-article-10-probe-three-states-of-staleness.md` (3,072 w)
**Why it teaches.** The **customisation inversion** is the most immediately gettable idea in the corpus: a compliance standard that starts empty and grows only as your facts attach. And the arithmetic finding (**30 days retained vs Article 26(6)'s 6-month minimum**) demonstrates a graph *computing* a compliance breach rather than asserting it.
**Publishability.** ✅ Clean — legal text is public, every citation carries a URL.

### 5. AWS IAM Configuration Risk Ontology
**Problem.** Compute — rather than assert — whether an AWS configuration is a risk, by making "vulnerability" a **path pattern** instead of a label.
**The graph.** 6 layers, ~31 node types, **20 directed edge types each with a named inverse (40 readings), 7 Node Type Formulas**. Worked instance: **24 nodes / 18 edges** (public regulated S3 bucket + over-broad EC2 role). Standout types: **`AuthorizationClosure`** (transitive union of every Grant reachable over assume-role/pass-role/wildcard edges — *"the agentic union"*), `CostCeiling`, `DamageWindow`, `LethalTrifectaStatus`.
The formulas are the payload:
`Fact := a node with a downward backed_by path to Evidence.`
`Vulnerability := a Fact with an upward gives_rise_to path to a Risk. A PublicExposure becomes a Vulnerability only once contains reaches a DataClassification above public and exposes reaches a real BlastRadius.`
**Read.** `briefs/07/05/aws-configuration-risk-engine/v0.33.44__arch-brief__sg-send-aws-iam-config-risk-ontology-taxonomy-nodes-edges-formulas-bridges.md` (2,968 w) · `briefs/07/05/aws-configuration-risk-engine/v0.33.44__dev-brief__sg-send-aws-iam-config-risk-engine-context-not-configuration-python-twins-json.md` (2,039 w) · precursor `briefs/05/15/v0.27.43__dev-brief__iam-graph-visualisation-and-lockdown.md` (1,788 w)
**Why it teaches.** *"A public bucket is a Fact and becomes a Vulnerability only when an upward path to a real Risk exists"* is the cleanest demonstration in the corpus that a graph replaces a rules engine. **Every security practitioner recognises the false-positive problem it solves.**
**Publishability.** ✅ Clean (the ontology brief uses no real account IDs — but see redaction note in `06__house-style-and-conventions.md`).

### 6. The Wardley Map Series
Covered in full in `04__visual-assets-and-infographics.md`. Summary: **8 rendered PNGs** (the only rendered graph images in the repo), **12 mermaid `wardley-beta` source blocks**, **8 more text-first agent-mandate maps**, and one drawn air-gap map that is the corpus's sharpest sales artefact. ✅ Clean; highest visual readiness of anything here.

### 7. Fractal Risk Registers + Distributed Vault Architecture
**Problem.** One register per accepting role, in that role's own language, with relevance fading as you move away from the reader's altitude — plus the messaging architecture that lets registers talk **without sharing a database**.
**The graph.** Two graphs, both structurally validated: fractal registers **18 nodes / 31 edges**; distributed architecture **18 nodes / 26 edges** — *zero dangling edges, zero orphan nodes* in both.
**Read.** `briefs/07/17/registers-mandate-and-intervals/v0.33.49__arch-brief__sg-send-fractal-risk-registers-one-per-accepting-role-domain-language-relevance-fade.md` (2,674 w) · `briefs/07/17/architecture-and-mvp/v0.33.49__arch-brief__sg-send-fractal-distributed-vault-architecture-registers-of-registers-messages-as-graph-transformations-transaction-log-pki-authorization.md` (3,191 w) · validation record `briefs/07/17/v0.33.49__index__2026-07-17.md:117`
**Why it teaches.** The day index flags an **honest self-declared defect**: *"Neither grounds to a Reality node through a Twin. Both are structural topology graphs rather than evidence-grounded risk graphs… a departure from the standing convention."* That admission is itself a great teaching moment about graph discipline. And this is where **messages as graph transformations** lives: every action is a JSON transformation command, the filesystem stores them, and the transaction log is a **by-product** giving provenance, determinism, explainability and eventual consistency.
**Publishability.** ✅ Clean.

### 8. Fractal Semantic Graphs as the Agentic Operating Layer
**The graph.** **30 nodes, 38 edges**, inline JSON. The connective-tissue document — good for a "how it all fits" page.
**Read.** `briefs/07/12/architecture/v0.33.48__arch-brief__sg-send-fractal-semantic-graphs-agentic-operating-layer-deterministic-sovereign-open-source.md` (3,862 w)
**Publishability.** ✅ Clean — but see C17: **the document needs a rewrite before publication.** Its abstract is one ~500-word sentence.

### 9. The Agent Mandate Ontology — the shared backbone
**The graph.** **16 core entities** — Principal, Agent, Mandate, Capability, Tool, Action, Asset, Party, Harm, Risk, RiskAcceptance, Evidence, Environment, IntegrationMode, Control, Provenance — plus **8 taxonomies**, layered as ontology-of-ontologies (stable core + per-company + per-audience).
**Read.** `briefs/06/20/ontology-and-naming/v0.33.30__arch-brief__sg-send-agent-mandate-ontology-and-taxonomy-entities-relationships-parties-assets-harms-risk.md` (1,421 w) · `briefs/06/22/market-cases-and-graph/v0.33.32__arch-brief__sg-send-agent-mandate-graph-path-driven-lenses-two-pass-crown-jewels-blast-radius.md` (1,687 w)
**Why it teaches.** The "here is the vocabulary" page every graph site needs — **small enough to render on one screen.**
**Publishability.** ✅ Clean.

### 10. Published Agentic Incidents Mapped to the Ontology
**Problem.** Turn real, sourced, published AI-agent incidents into graph instances — the empirical grounding layer.
**The graph.** A per-incident mapping schema: the capability that made the harm possible · the control present or bypassed · who authorised the access and when · the blast radius opened · the worst case the same access allowed · malicious vs non-malicious intent · confidence · and **evidence gaps**. Written deliberately self-contained for a downstream agent with no other context.
**Read.** `briefs/06/22/market-cases-and-graph/v0.33.32__research-brief__sg-send-published-incidents-mapped-to-agent-mandate-ontology-self-contained-for-downstream-agent.md` (2,712 w) · `briefs/07/28/agentic-risk-research/v0.33.53__research-brief__sg-send-has-it-happened-before-catalogue-of-agentic-incidents-classified-by-direction-only-one-outbound.md` (3,561 w)
**Why it teaches.** **Real incidents are the most persuasive content a public graph site can carry** — "here is a thing that actually happened, drawn as a graph."
**Publishability.** ✅ Clean, sources public. Names real products (WhatsApp, Odysseus) from public reporting only.

### 11. Odysseus Agent-Mandate Case Study — a named real product
**The graph.** Mandate map across shell, files, web, email (IMAP/SMTP), persistent memory, MCP connectors, self-evolving skills, autonomy → lethal-trifecta status → blast radius.
**Read.** `briefs/06/20/odysseus-mandate-analysis/v0.33.30__research-brief__sg-send-odysseus-agent-mandate-case-study-privacy-vs-safety-prompt-injection-blast-radius.md` (1,854 w)
**Why it teaches.** *"Privacy is confidentiality, not safety"* landed on a named, real, admired product is the most quotable line in the security half of the corpus.
**Publishability.** ⚠️ **Needs a legal read** — it names a third-party product and analyses its security posture. Sources are public and the tone is fair (explicitly complimentary about the target's privacy engineering), but this is the one entry where an external party could object.

### 12. Browser Extensions — The Read-Content Closure
**Problem.** *"Allow this extension to read the content of the pages you visit"* quietly grants the **authorization closure of every site you are logged into**.
**The graph.** Bidirectional and queryable both ways: walk *out* from the extension to the AWS console / email / Salesforce it reaches; walk *back in* from "how can my email be attacked?" to the extensions that expose it.
**Read.** `briefs/07/04/risk-cards-and-visualization/v0.33.42__arch-brief__sg-send-browser-extension-risk-cards-read-content-closure-agent-escalation-bidirectional-evidence-graph.md` (1,436 w)
**Why it teaches.** **The highest relatability-to-length ratio in the corpus.** Everyone has browser extensions. The bidirectional query is exactly the thing a graph does that a list cannot — and it fits on one screen.
**Publishability.** ✅ Clean. **Strong candidate for the site's first "aha" page.**

### 13. The Personal Risk Acceptance Scenario — the live demo candidate
**Problem.** An individual running an LLM on their desktop is walked through a curated **question graph**; the answers populate a per-user graph; the graph generates the risks they must accept.
**The graph.** Six questions, each answer typed as **fact / opinion / hypothesis / evidence**. Two generated chains: the **lethal trifecta** (reads untrusted content ∧ internet-connected ∧ can act autonomously → exfiltration, corruption, destruction) and the **email-access chain** (email access → every account that resets through it). First-pass storage: browser localStorage, **no vault, no backend, runs without an LLM**.
**Read.** `briefs/06/24/risk-acceptance-and-reviews/v0.33.34__dev-brief__sg-send-personal-risk-acceptance-scenario-local-llm-question-graph-evidence-trifecta-delegation.md` (1,993 w)
**Why it teaches.** **This is the best candidate for a live interactive demo on graphs.sgit.ai**: answer six questions in the browser, watch your own risk graph build itself. No server, no account, no key.
**Publishability.** ✅ Clean.

### 14. Compliance Standards Intersection — The Relevant Subset Graph
**Problem.** Build a subset graph of *only* the controls from NIST, GDPR, ISO 27001, HIPAA, EU AI Act, NIS2 and DORA that the agent-authorisation blast radius actually touches — *"almost a small standard of its own."*
**The graph.** Read from four angles: (1) the binary one — if you cannot answer the blast-radius questions you already cannot demonstrate compliance; (2) the boxes you can check once you know; (3) the **new** breaches that appear once you know the side effects (knowing and not acting is a failing); (4) the controls you recover as you reduce privileges. Core claim: **much of this is breached before the agent does anything, at the moment of authorisation.**
**Read.** `briefs/06/19/standards-compliance-supply-chain/v0.33.28__arch-brief__sg-send-compliance-standards-intersection-subset-graph-binary-breach-before-the-agent-acts.md` (1,782 w) · `briefs/05/22/sg-sentinel/v0.27.58__arch-brief__sg-sentinel-compliance-as-living-graph.md` (3,175 w) · `briefs/05/30/v0.31.9__arch-brief__sg-send-vault-per-standard-document-to-graph-artefacts.md` (2,534 w)
**Why it teaches.** *"Compliance is not a checkbox, it is a computed function of your actual deployment"* — the sharpest anti-checkbox argument here, and the intersection-subset construction is a genuinely graph-shaped operation.
**Publishability.** ✅ Clean. No standard's text is reproduced.

### 15. The Permissions Bill of Materials (PBOM)
**Problem.** SBOM for permissions. Permissions gate exploitability — a vulnerability doesn't matter if the account lacks the permissions to weaponise it.
**The graph.** Carries intent, blast radius, compounding and reachability — the four things the SBOM misses. Designed to **augment** CycloneDX/SPDX/VEX/AIBOM, not replace them.
**Read.** `briefs/06/18/agentic-permissions/v0.33.40__arch-brief__permissions-bill-of-materials-augmenting-sbom-permissions-gate-exploitability.md` (1,712 w) · `briefs/06/19/standards-compliance-supply-chain/v0.33.28__research-brief__permissions-bill-of-materials-adjacent-standards-vex-cyclonedx-spdx-aibom-agent-identity.md` (1,719 w)
**Why it teaches.** SBOM is a concept the security world already accepted. *"Now do it for permissions"* needs no setup. Appears in **38 files** — one of the most cross-referenced concepts in the corpus.
**Publishability.** ✅ Clean.

### 16. NHI 2.0 — Semantic Knowledge Graphs of Identity
**The graph.** Taxonomy of identity types; the authorization/authentication matrix; **per-API-method permission graphs across clouds**; the action-vs-resource mismatch; the explosion of identities when every node needs one; temporal permissions and time travel.
**Read.** `briefs/06/04/nhi-2.0/v0.32.3__arch-brief__sg-send-nhi-2.0-semantic-knowledge-graphs-of-identity.md` (3,319 w) · `briefs/06/04/nhi-2.0/v0.32.3__arch-brief__sg-send-nhi-2.0-cloud-permissions-per-api-graphs-hyperscalers.md` (3,415 w)
**Why it teaches.** The **reciprocal insight** — *the semantic web's verification gap means graphs need identities too* — is the most intellectually interesting claim in the corpus, and it directly justifies pairing graphs.sgit.ai with pki.sgit.ai and nhi.sgit.ai. **Build the cross-site bridge page from this.**
**Publishability.** ✅ Clean.

### 17. Graphing Text — Meaning Extraction as Decompilation
**The graph.** A ladder — letters → original text → summary → concepts/claims/entities → user stories & business functions — where **every node at every altitude carries a source map** pointing at the span it came from. Anchored to **Wikidata** as the global concept layer (language-independent identifiers, tens of millions of entities, free). Evidence packs **attach, never mutate**. Corrections propagate with supersede semantics. Confidence weighted **by independence, not by count**.
**Read (all in `briefs/08/09/graphing-text/`, v0.33.57).** `...__strategy-brief__sg-send-refactoring-meaning-decompilation-not-compilation-author-is-the-arbiter.md` (3,558 w) · `...__arch-brief__sg-send-enrichment-and-shared-anchors-research-paid-once-wikidata-is-the-concept-layer.md` (3,590 w) · `...__arch-brief__sg-send-evidence-packs-attach-never-mutate-weight-by-independence-not-count.md` (2,991 w) · `...__arch-brief__sg-send-fact-does-not-exist-in-a-vacuum-agenda-is-context-corrections-must-propagate.md` (3,352 w) · `...__arch-brief__sg-send-index-is-not-a-source-caching-nodes-are-prunable-start-anywhere.md` (3,325 w)
**Why it teaches.** Carries the corpus's best **external** worked example: the **10,000-hours claim** — a 1993 violin study where the figure was an average, not a threshold; half the top group hadn't reached it; the original author spent his career correcting the popularisation and **none of it ever attached to the claim**. Traced through a citation network of **242 papers carrying 200,000+ supporting paths that lead back to nothing.** The perfect illustration of why corrections must propagate through a graph.
**Publishability.** ✅ Clean. **This is the site's best non-technical, non-security story — use it on the front page.**

### 18. The Graph Canvas as a REPL — "Never Render The Whole Graph"
**Problem.** When an agent manipulates a graph it acts blind; when a person sees the graph they cannot manipulate it at the same speed. The canvas closes the gap.
**The graph.** A closed operation vocabulary in the established node/edge grammar; render the *result of a query*, never the whole graph; **mermaid as the print step** (text, diffable, committable, unreadable beyond ~50 nodes) and an interactive library as the **canvas**; the session transcript is already the specification.
**Read.** `briefs/08/02/vault-as-substrate/v0.33.55__arch-brief__sg-send-graph-canvas-repl-un-blinding-the-agent-mermaid-for-output-never-render-whole-graph.md` (3,471 w)
**Why it teaches.** *"A diagram of everything is rarely useful; one node with its neighbours is always readable"* — **the single most useful design rule you could put on a public graph site**, and it justifies the site's own rendering choices.
**Publishability.** ✅ Clean, needs light editing (dense memo style).

### 19. Thinking in Graphs — the foundational essay
**The graph.** The `Safe_UInt__Port` example: two nodes both holding `8080`, one typed and connected through `extends → Safe_UInt → part_of → osbot-utils@3.63.4`, one typed `int`. *"The difference is not in the value. The difference is in the connectivity."*
**Read.** `library/concepts/v0_4_0__thinking-in-graphs.md` (5,013 w) · sequel `briefs/06/16/theses-and-reflections/v0.33.38__strategy-brief__confidence-through-evidence-blast-radius-graphs-mapping-the-gaps.md` (1,834 w)
**Why it teaches.** It is the "why graphs at all" page, and **its example is a concrete piece of Python, not a metaphor** — osbot-utils is a live dependency of this repo.
**Publishability.** ⚠️ **Licence blocker.** Carries **no CC BY 4.0 line** and is attributed to Issues-FS. Resolve before launch — see gap G8.

### 20. Shorter entries worth a line each

| Name | Path | Words | The graph | Quality |
|---|---|---|---|---|
| **RAMM — Risk Acceptance Maturity Model** | `briefs/07/02/authorization-and-maturity-model/v0.33.40__arch-brief__sg-send-risk-acceptance-maturity-model-ramm-graph-native-levels-agentic-crosswalk.md` | 2,265 | Five maturity levels expressed as **Node Type Formulas** — a level is a *fact about the graph*, not a questionnaire claim. Crosswalks to OWASP Risk Rating, RIMS RMM | Designed; "first pass live". ✅ |
| **Who Can Pull The Plug** | `briefs/07/24/who-can-pull-the-plug/v0.33.51__strategy-brief__sg-send-who-can-pull-the-plug-ability-to-stop-an-ai-system-fractal-maturity-model-detection-authority-blast-radius-reversibility-intersect-in-time.md` | 3,940 | Four-way Venn (detection ∧ decision ∧ blast radius ∧ reversibility) that must intersect **in time**. Hard number: **hyperscaler cost reporting is 12–18h late = the detection floor** | Designed. ✅ |
| **SG/Sentinel control-flow graphs** | `briefs/05/24/sg-sentinel-batch2/v0.27.60__arch-brief__sg-sentinel-control-flow-graphs-business-logic.md` | 2,812 | Nodes = application states, edges = permitted transitions; *"the universe of what is possible is determined by the current state, not by everything the app technically allows"* — the WAF Achilles heel | Designed. ✅ Bridges to sg-sentinel.sgit.ai |
| **Chain of trust & key graphs** | `briefs/02/21/part-1/v0.4.27__architecture__chain-of-trust-and-key-graphs.md` | 3,152 | Key/identity graph, layered identity. **The earliest graph document in SG/Send's own corpus** | Designed. ✅ Bridges to pki.sgit.ai |
| **Fractal document signing — PKI-signed paragraphs** | `briefs/02/23/part-3/v0.6.14__architecture__fractal-document-signing-pki-paragraphs.md` | 1,598 | Paragraph-as-signed-unit — the direct ancestor of the Act-as-paragraph-graph five months later | Designed. ✅ **Great provenance story: Feb idea → July product** |
| **Skills as a graph** | `briefs/06/04/v0.32.3__strategy-brief__sg-send-skills-as-graph-capturing-how-business-works.md` | 3,244 | A skill is a graph of skills, not a static document; built-in error correction because it is used daily | Designed. ✅ |
| **Provenance / decision graph per article** | `briefs/06/13/vault-platform-and-commercialisation/v0.33.26__arch-brief__sg-send-agentic-content-website-provenance-decision-graph-research-publish.md` | 2,346 | Every article carries source docs, analysis, transformations, human+agent verifications as a graph; review as a decision graph with ownership per step | Designed; *"~90% of the stack already built"*. ✅ |
| **SGit commit/branch graph visualiser** | `briefs/03/30/v0.19.7__dev-brief__sgit-visualisation.md` | 886 | `sg-git-graph` renders both real SGit vaults **and LLM conversation structures** — *"each commit is an LLM interaction, the branch is the agent, the merge is the consolidation"* | Designed; screenshot exists. ✅ |
| **Issues-FS link-type graph** | `.issues/config/node-types.json` + `.issues/config/link-types.json` + 107 `issue.json` files | 320 lines of schema | **ACTUALLY RUNNING.** 12 node types, 10 verb/inverse edge types with domain/range constraints, **71 nodes / 141 edges** in `.issues/` alone. Edges stored bidirectionally | **SHIPPED & demonstrable.** ✅ **Ship the actual JSON — cheapest credibility on the whole site** |
| **LinkedIn network → outreach CRM** | `briefs/06/10/network-intelligence/v0.33.16__dev-brief__sg-send-linkedin-semantic-knowledge-graph-crm-outreach-workflow.md` | 2,828 | Real LinkedIn export loaded into a vault, processed as graphs-of-graphs | Built (vault exists). ❌ **INTERNAL ONLY — contains real network data** |

---

## Domain map — what a graph buys you here

**Security & agent risk** *(#1, #5, #12, #13, #15, #16, #11)*
1. **Reach is computed, not asserted.** A table can list permissions; only a transitive closure over `can_assume` / pass-role / wildcard edges tells you what they actually reach. Named `AuthorizationClosure` — *"the agentic union: for an Agent, the closure is the rating floor, not the nominal grant."*
2. **Type becomes a query result, not a label** — the corpus's answer to security-tool false positives, and only expressible as a path.
3. **Bidirectionality.** Walk out from the extension to what it reaches, *or* walk in from "how can my email be attacked?". Two different tables; one graph.

**Regulation & compliance** *(#4, #2, #14)*
1. **Subtraction.** The customised standard starts from *nothing being relevant* and accretes as your facts attach — impossible to express as a document.
2. **Findings become arithmetic.** *"Thirty days against six months is clean"* — fact + provision produces a vulnerability **by computation**, "which makes it the most defensible finding in the graph."
3. **Absence is a first-class node.** *"A register has empty cells. The graph has unanswered question nodes and unevidenced facts, which can be counted, queried and assigned."*
4. **Consolidation and customisation are the same operation** — maintenance burden and flagship feature share one engine.

**Strategy (Wardley)** *(#6)*
1. **A map is a falsifiable claim, not a picture** — which is why maps belong in the same family as risk graphs.
2. **The shape is the argument.** The air-gap map works because *a gap has no evolution*, so you map the labour that fills it.
3. **Maps as text = maps that survive** the meeting.

**Agent ops** *(#7, #18)*
1. **One structure, many views.** Article 26(5) renders four stakeholder registers from one chain: *"nothing is duplicated; each view is a query over one structure."*
2. **Escalation without an escalator** — a property of edges, not of a workflow rule.
3. **The transaction log is free** — provenance, determinism, explainability and resilience as by-products.

**Engineering & knowledge** *(#19, #17)*
1. **Confidence is proportional to connectivity** — `Safe_UInt__Port` vs `int`, same value `8080`, radically different certainty.
2. **Source maps make lifting reversible** — the mechanism that lets a reader say *"that is not what I meant"* and have it be **success**.
3. **Weight by independence, not count** — grounded in a real 242-paper citation network.

---

## The numbers — every citable graph statistic

Public sites live on real numbers. All sourced.

| Statistic | Value | Source |
|---|---|---|
| **Regulation graph (LIVE)** | **1,523 nodes · 1,944 edges**; 113 articles / 500 paragraphs / 417 points / 180 recitals / 13 annexes / 68 definitions; 11 views | sgit.ai published vault |
| **Risk Graph Explorer (LIVE)** | 18 facts / 37 risks / 14 provisions in the "Exposed" preset; 7 views; `permissions: {}` | sgit.ai published vault |
| **Browser isolation site (LIVE)** | 17 entry points; 5 altitudes; ~70 JSON files; 104 files / 2.4 MB / 4 commits | sgit.ai published vault |
| Browser-isolation risk graph | **59 nodes, 75 edges** | `briefs/07/12/worked-business-case/v0.33.48__briefing__...` (parsed) |
| 2FA instance graph | **51 nodes, 53 edges** | `briefs/06/26/semantic-graph-and-query-paths/v0.33.35__data__sg-send-2fa-mappings.json` (parsed) |
| Fractal semantic graphs graph | **30 nodes, 38 edges** | `briefs/07/12/architecture/v0.33.48__arch-brief__...` (parsed) |
| AWS IAM worked instance | **24 nodes, 18 edges** | `briefs/07/05/aws-configuration-risk-engine/v0.33.44__arch-brief__...` |
| Fractal registers graph | **18 nodes, 31 edges, 0 dangling, 0 orphans** | `briefs/07/17/v0.33.49__index__2026-07-17.md:117` |
| Distributed vault architecture graph | **18 nodes, 26 edges, 0 dangling, 0 orphans** | same |
| Issues-FS live graph in repo | **71 nodes, 141 edges**; 12 node types, 10 edge types; 107 `issue.json` files | `.issues/` (measured) |
| Semantic graph engine ontology | **22 node classes, 35 edge types with named inverses** | `debriefs/06/29/v0.33.34__debrief__briefs-processing-24-26-june-2026.md:63` |
| Path query set | **5 tiers, 17 queries** | same |
| AWS IAM ontology | **6 layers, ~31 node types, 20 edge types (40 readings), 7 Node Type Formulas** | `briefs/07/05/...v0.33.44__arch-brief__...` |
| Agent Mandate ontology | **16 core entities, 8 taxonomies** | `team/roles/librarian/reality/ai-agents/proposed/risk-mandate.md:62` |
| EU AI Act graph ontology | **7 node types + 8 edge types + AcceptableLevel** | `debriefs/08/01/v0.33.47__debrief__briefs-processing-28-july-2026.md:50` |
| Acceptance interval ladder | **6 intervals: 1h / 4h / 2d / 2w / 1m / 6m** | `briefs/06/23/risk-mandate-product-and-workflow/v0.33.33__arch-brief__...` |
| Risk altitudes | **5 levels** (L1 endpoint → L5 governance) | `briefs/07/12/worked-business-case/v0.33.48__briefing__...` |
| Hyperscaler cost-reporting delay | **12–18 hours** — the detection floor | `briefs/07/24/who-can-pull-the-plug/v0.33.51__strategy-brief__...:68` |
| Harm taxonomy | **8 categories** | `reality/ai-agents/proposed/risk-mandate.md` (P-392) |
| Citation-network case study | **242 papers, 200,000+ supporting paths, traced back to nothing** | `briefs/08/09/graphing-text/v0.33.57__arch-brief__...fact-does-not-exist-in-a-vacuum...:114` |
| Wikidata concept layer | tens of millions of entities, language-independent IDs, free | `briefs/08/09/graphing-text/v0.33.57__arch-brief__...wikidata-is-the-concept-layer.md` |
| **Mermaid graph readability limit** | **~50 nodes** before mermaid becomes hard to read | `briefs/08/02/vault-as-substrate/v0.33.55__arch-brief__...graph-canvas-repl...md` |
| **Visualisation legibility ceiling** | **~300–400 nodes** | `briefs/06/10/network-intelligence/v0.33.16__arch-brief__...subgraph-flip-verb-edges.md` |
| Tree-render performance gate | **500 nodes in <100 ms** | `briefs/03/29/from-agent__architect/v0.19.11__architect-review__sg-tree-api-contract.md:600` |
| Wardley maps rendered | **8 PNGs**, Mermaid CLI v11.14.0 + Playwright Chromium | `briefs/05/24/sg-send-thread/wardley-maps/` |
| Wardley mermaid source blocks | **12** | `grep 'wardley-beta'` |
| Corpus size | **3,317 md files · 5,415 tracked files · 4,335 commits** | `git ls-files`, `git log` |
| Corpus timespan | **2026-02-08 → 2026-08-20** (~6.5 months) | `git log --reverse` |
| Documents formally catalogued | **956** | `team/roles/librarian/reality/index.md` |
| Graph-term reach across corpus | graph **2,715 files** · semantic **545** · ontolog\* **311** · connectiv\* **102** · MGraph **89** · knowledge graph **111** · Wardley **210** · blast radius **321** · infographic **337** | measured by `grep -ril` |

**Deliberately NOT claimed** (searched, absent from the repo): "seven views" as a repo artefact · "three recorded videos" as repo files · any sgit-positioning Wardley map count.

---

## The shortlist — if you can only ship five

1. **Browser isolation** (#1) — 59/75 JSON, drop-in renderable, vendor-neutral, real public sources
2. **Article 26(5)** (#2) — the full fact-to-board chain, with five unanswered questions as the output
3. **The 2FA graph** (#3) — the only machine-readable file a visitor can download and query
4. **The Wardley air-gap map + the 8 rendered PNGs** — the only rendered visuals in the corpus
5. **The personal risk question graph** (#13) — six questions, localStorage, no backend: a live demo the site can actually run

Plus, for the front page: **the 10,000-hours story** (#17). It needs no security or legal background and it makes the case for corrections propagating through a graph better than any diagram.

---

This document is released under the Creative Commons Attribution 4.0 International licence (CC BY 4.0).
