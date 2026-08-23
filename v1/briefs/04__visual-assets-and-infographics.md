# 04 — Visual Assets and Infographics

**The headline finding: the gap is rendering, not raw material.**

Measured, not estimated: **81 binary visual assets · 13 Wardley maps (8 rendered) · 2,846 fenced ASCII diagram blocks across 591 markdown files · 20 inline `<svg>` occurrences in 9 files · exactly 1 mermaid fence · 0 `.mmd` · 0 `.dot` · 0 video files.** And `library/alchemist/narratives/` is an empty `.gitkeep`.

So: 2,846 ASCII diagrams and 13 Wardley maps exist; **8 rendered PNGs and 2 hand-built SVGs are all that has actually been drawn.** The highest-leverage single action for this site is rendering what is already specified.

---

## Part A — Existing visual assets

### A1 · Wardley maps — the crown jewels (8 PNGs, 784×523, rendered and visually verified)

All in `team/humans/dinis_cruz/briefs/05/24/sg-send-thread/wardley-maps/`. Clean black-on-white value-chain maps: labelled Visibility/Evolution axes, Genesis→Commodity gridlines, red dashed `evolve` arrows, bold inline notes. Source + a prose "story" paragraph for each lives in `briefs/05/24/sg-send-thread/v0.27.60__strategy-brief__sg-send-wardley-maps-rendered.md`.

| File | Bytes | Depicts |
|---|---|---|
| `01-file-sharing-today.png` | 20,558 | Status quo: User→Share→Transfer Service→**Provider Sees Data**+Storage |
| `02-file-sharing-with-sg-send.png` | 33,952 | With SG/Send: vault + client-side encryption; privacy & security evolving to commodity |
| `03-privacy-tracked-activity-unseen-data.png` | 26,338 | **The honest privacy map** — free mode tracks activity, never data; paid removes tracking |
| `04-investor-vault-confidential.png` | 32,772 | Vault + ephemeral instance vs "email/WeTransfer: provider sees everything" |
| `05-version-control-commodity.png` | 30,906 | Two paths from "Track Changes": folders/manual vs commits/branches/history |
| `06-agentic-communication-memory.png` | 29,853 | Agent memory + agent-to-agent channel → control, evidence, traceability, **explainability** |
| `07-the-strategy-commoditise-the-vault.png` | 32,392 | **The keystone map** — innovate-leverage-commoditise |
| `08-apps-in-the-vault.png` | 25,702 | Vault + a bit of HTML = mini app → new workflows |

### A2 · Hand-built diagrams and infographics

| Path | Bytes | Depicts |
|---|---|---|
| `briefs/07/02/product-roadmap/riskmandate-product-roadmap.svg` | 11,229 | **1600×900 dark-blueprint roadmap infographic.** Bands SHIPPED / E1 / P1 / P2 / P3 / P4 / CORE. Explicitly names *"Register as vault graph"*, *"Graph viewer"*, *"Semantic graph on vaults — one data model for every surface"*. Embedded `<style>`, gradients, blueprint hairlines. **Doubles as the visual template for every new graph infographic.** |
| `briefs/07/02/product-roadmap/riskmandate-product-roadmap.pdf` | 30,196 | Vector PDF of the same (pure vector, 0 raster) |
| `sgraph_ai_app_send__ui__user/v0/v0.2/v0.2.13/test-files/gallery-pack/architecture-diagram.svg` | 5,366 | 800×500 dark architecture diagram: Browser→Lambda→Storage, "Key stays here", "No plaintext ever", dashed out-of-band key path. Self-contained, on-palette. **Currently buried in a test-fixture folder — retitle and it is a site diagram.** |

### A3 · Generated infographic decks (proof the pipeline works at deck scale)

| Path | Bytes | Contents |
|---|---|---|
| `briefs/04/13/for-team__tools/PlaybookLM-Architecture-Brief.pdf` | 11.1 MB | **8 pages, 8 full-bleed generated infographics.** Dark navy + teal house style |
| `briefs/04/13/for-team__tools/PlaybookLM-Implementation-Brief.pdf` | 9.8 MB | 8 pages, 8 generated infographics, same style |

⚠️ Split to PNGs before shipping — 11 MB is too heavy for a page.

### A4 · Product screenshots — `sgraph_ai__website/v0/v0.2/v0.2.0/_common/images/sg-send/use-cases/`

| File | Bytes / dim | Depicts |
|---|---|---|
| `13-agent-session-tree.jpeg` | 314,199 · 2000×1421 | **Highest-value screenshot in the repo.** Vault tree of a Claude session: `slides/slide-01..08/` each with `_page.json` + `brief.md` + `infographic.png`, and an actual rendered infographic ("END-TO-END AUTOMATED INFOGRAPHIC PIPELINE", 6-stage flow, $0.07/infographic). **Shows the pipeline, its output and the folder convention in one frame.** |
| `14-medical-page-json.png` | 467,274 · 2272×1624 | Highest-resolution asset; `_page.json` producing a real tabbed layout |
| `15-medical-vault-split.jpeg` | 332,930 · 2000×1237 | Multi-pane: gallery + video + AI markdown analysis |
| `12-pdf-split-view.jpeg` | 235,714 · 2000×974 | Deck PDF beside a generated infographic |
| `11-vault-browse-brief.png` | 298,420 · 2310×1102 | Tree + rendered markdown — the canonical "browse a vault" hero shot |
| `01`–`08` (8 more) | 44k–106k · 1440×900 | Vault browse, markdown article, gallery, upload, push/pull badge, landing, token receive. *Note `01`≡`08` and `04`≡`07-send-main` are byte-identical duplicates.* |

⚠️ `14-` and `15-` are medical-themed. Verify they contain only synthetic data before republishing.

### A5 · Brand assets
`sgraph_ai__website/_common/img/logo/sg-send-logo-lockup.png` (105,660 · 1356×512) · `sg-send-logo-512.png` (18,449) · `sg-send-favicon.svg` (750 · navy rounded square, teal S-curve + slash) · `sg-send-favicon-32.png` (1,016). Spec with inline SVG source: `briefs/03/01/v0.10.1__sg-send-logo-specification.md`.
Also 6 print-ready business-card SVGs at `sgraph_ai_app_send__ui__user/assets/cards/svg/design-{a,b,c}-{front,back}.svg` — **design-c-front carries a real beta-user pull-quote**, reusable as a testimonial block.

### A6 · Not site-usable
10 QA/browser-POC screenshots (`briefs/02/22/new-qa-project/qa-reference__user_0*.png`, `briefs/03/23/claude-browser-poc/screenshots/*.png`) and 26 test fixtures. **No photographs exist in this repo** — everything is screenshot, diagram, logo or generated art.

---

## Part B — Diagrams already embedded in markdown

### B1 · The Wardley fence trap
There is **exactly one ```` ```mermaid ```` fence** in the whole repo (`briefs/03/26/for-team__qa/v0.2.35__multi-agent-review__state-machines-ontologies.md:778` — a `stateDiagram-v2` of the upload/snapshot state machine, plus a spec for `State_Machine__Utils.to_mermaid()` generation).

The scarcity is a **fence-convention artefact**: Wardley maps use a **bare ``` fence with `wardley-beta` as line 1** (9 blocks) rather than a tagged fence (4 blocks). A naive `grep '```mermaid'` misses all 13 maps. **Grep for `wardley-beta`, not for the fence tag.**

### B2 · ASCII / box-drawing — 2,846 blocks in 591 files
The project's *actual* dominant diagram medium. Cheap to publish, honest, diffable. Ranked by graph relevance:

| Path | Blocks | Largest | Depicts |
|---|---|---|---|
| `library/concepts/v0_4_0__thinking-in-graphs.md` | **16** | lines 468–487 (18 rows) | The **`Task-42` typed-graph diagram** — a node whose meaning traces through typed edges to `Safe_UInt__Port → osbot-utils@3.63.4`. Also the confidence spectrum, the review example, the three-persona worked example. **Every one is a site diagram waiting to be drawn.** |
| `library/concepts/v0_4_0__lexicon-architecture.md` | **16** | lines 91–189 (**97 rows**) | The full **anchor-node ontology tree**: `anchors__core/`, `anchors__coordination/`, `anchors__structural/`, `anchors__external/` (schema.org, SKOS, W3C PROV-O), plus `patterns/`. **A ready-made ontology map — redraw as SVG and it is the site's signature diagram.** |
| `library/concepts/v0_4_0__compatibility-through-connectivity.md` | **13** | lines 484–577 (92 rows) | Connectivity/compatibility computation structures |
| `briefs/02/21/part-1/v0.4.27__architecture__chain-of-trust-and-key-graphs.md` | 63 box-lines | — | **Key graphs / chain of trust** — directly graph-topical |
| `team/roles/architect/reviews/06/07/v0.33.5__architect-diagrams__vault-inbox-flows.md` | 321 box-lines | — | Vault inbox flows |
| `briefs/03/09/v0.15.5__sg_send_architecture_explainer.md` | 396 box-lines | — | Architecture explainer |
| `team/roles/cartographer/v0.1.2/v0.1.2__system-landscape-map-revised.md` | 281 box-lines | — | System landscape map |

### B3 · Graph query languages as publishable code exhibits
- **4 Cypher blocks** — `briefs/03/17/vault-redesign/v0.16.3__arch-note__storage-backend-mapping.md` lines 498, 528, 557, 607 (vault storage modelled as a property graph)
- **4 Turtle/RDF blocks** — `briefs/02/24/v0.6.17__architecture__solid-protocol-integration-complementary-architectures.md` lines 65, 130, 223, 243 (Solid Protocol interop)

**Cypher beside Turtle beside ASCII beside the JSON instance graph** makes an excellent *"many ways to say the same graph"* page — and it directly serves the "not a graph database pitch" framing.

---

## Part C — The infographic pipeline (two of them)

### C1 · The documented pipeline — Playwright + OpenRouter → PNG
`library/skills/create-infographics/SKILL.md` (14,881 bytes). Front-matter name `infographic-gen`.

An **AI image-generation** pipeline, not a charting library. A hosted browser tool at `https://dev.tools.sgraph.ai/en-gb/infographic-gen/` exposes `window.__tool`; Playwright drives it headlessly; each `generate()` returns a **PNG as a base64 data URL** synchronously. Requires a user-supplied OpenRouter key. Default model `google/gemini-3.1-flash-image-preview`.

- **API:** `connect({apiKey})` → `setTemplate(name)` → `generate({prompt, model?, renderUI?})`. 14 methods including `meta.getSkills()` (the tool self-serves `{human, browser, api}` docs, **declared more authoritative than the SKILL file**), `getState()`, `stop()`, `meta.getLog()`. Concurrent generation via independent `callId` UUIDs; `renderUI:false` headless batch mode; multimodal logo attachment for brand consistency.
- **7 templates:** `executive` · `architecture` · `timeline` · `comparison` · `process` · `stats` · `mindmap`
- **Economics:** ~**$0.07 per infographic**, ~13 s each (~19 s with a logo), ~$0.56 for an 8-slide deck. Output PNGs optionally compiled to a full-bleed PDF via reportlab; costs reconciled per-`generationId` against the OpenRouter generation API after a 15 s settle → `generation-tracking.json`.

### C2 · The undocumented pipeline — `<sg-llm-infographic>` → **SVG**, in-browser
Not mentioned in the skill file. Renders **SVG** streamed live from an LLM, already wired into the vault UI:
- `sgraph_ai_app_send__ui__vault/v0/v0.2/v0.2.3/_common/js/components/vault-generate/vault-generate.js` (lines 7, 86, 208, 326)
- Loaded from `https://dev.tools.sgraph.ai/components/llm/sg-llm-infographic/v0/v0.1/v0.1.0/sg-llm-infographic.js` in four `index.html` files across `v0.2.1`–`v0.2.3`
- Per `team/roles/librarian/reality/v0.16.26__what-exists-today.md:222`: OpenRouter key with localStorage persistence, model selector, **live SVG render during streaming**, and **save the generated SVG back into the vault**

**For a graph site this is the better pipeline.** SVG is text — versionable, theme-able, accessible, infinitely scalable, and free to re-render. The PNG path is raster and per-image billed. Status: **PROPOSED, pending AppSec review** (`reality/v0.16.26__what-exists-today.md:1716`). **Resolving that review is the prerequisite for infographics *at scale* rather than infographics *at $0.07 each*.**

### C3 · The prompt library that already exists — copy its structure
`briefs/06/24/healthcare-data-protection/v0.33.34__dev-brief__sg-send-data-protection-infographics-guidance-chatgpt-images-medical-analogies-prompts.md` is **the most reusable artefact in the repo for this purpose**: a reusable **style preamble**, **12 ready-to-paste prompts**, a fixed **icon cast**, and hard-won model-handling tips (*"Text is the weak point"*, *"One idea per image"*, generate 16:9 for slides + 4:5 for LinkedIn).

**Build the graph equivalent by swapping the cast:** medical (patient / clinician / record) → graph (**node / edge / anchor node / subgraph / query path / provenance stamp / twin / air gap**). The 12 healthcare prompts map almost one-for-one onto graph concepts.

Supporting material: `briefs/04/02/v0.19.7__dev-brief__infographic-tool.md` (original spec) · `briefs/05/14/v0.27.41__dev-brief__infographic-tool-v2-workflow-redesign.md` · `briefs/04/09/v0.20.38__debrief__js-api-infographic-pipeline.md` · `briefs/04/19/nano-banana-research-synthesis.md` (prompting research) · `briefs/05/14/v0.27.41__reference__per-tenant-vm-vs-kubernetes-infographics.md` (**a comparative critique of two generated infographics — use it as the quality rubric**) · `briefs/06/10/partner-outreach/v0.33.16__strategy-brief__sg-send-hyperscaler-big-partner-outreach-infographic-storytelling.md`.

### C4 · The proven output shape
From `13-agent-session-tree.jpeg`: `slides/slide-NN-name/{_page.json, brief.md, infographic.png}` — **one folder per slide, prompt-brief beside the output.** Adopt this. It keeps every image regenerable and auditable, which is the same provenance discipline the site argues for.

### C5 · What this site needs to produce infographics at scale
1. **An OpenRouter key and a small budget.** At $0.07/image, 200 graph infographics ≈ $14. **The cost is not the constraint; curation is.**
2. **A graph-specific style preamble**, modelled on the healthcare brief.
3. **A graph-specific prompt library** — source material is `02__concepts-index.md`.
4. **Prefer the SVG path** for anything diagrammatic; keep PNG for hero/atmosphere images. Resolve the AppSec review first.
5. **Mermaid for anything mechanical** — `to_mermaid()`-style generation from data beats prompting an image model for structural diagrams every time.
6. **Adopt the `slides/slide-NN/` folder shape** (C4).
7. **Render the 5 unrendered Wardley maps** — highest value per unit of effort in the entire inventory.

---

## Part D — The Wardley map inventory (20 maps, 4 sets)

### Set A — SG/Send & SG/Sentinel strategy (24 May 2026) — **the only rendered set**
Source: `briefs/05/24/sg-send-thread/v0.27.60__strategy-brief__sg-send-wardley-maps-rendered.md` (2,754 w, 8 `wardley-beta` blocks). Images: the 8 PNGs in §A1. Companion (syntax, workflow, **the coordinate trap**): `briefs/05/24/sg-send-thread/v0.27.60__strategy-brief__sg-send-wardley-maps-setup-and-mermaid-capability.md` (2,711 w) — **a genuinely useful public how-to, publishable as-is**.
Status: *"rendered and visually verified (Mermaid CLI v11.14.0 plus the Playwright-bundled Chromium)."* ✅ Clean.

### Set B — Agent Mandate user needs (23 June 2026) — 8 maps, text-first, unrendered
Source: `briefs/06/23/wardley-maps/v0.33.33__strategy-brief__sg-send-wardley-maps-first-pass-eight-maps-user-needs-before-after.md` (3,090 w). Each map anchored at a user need with a **today vs with-our-service** position table.
1. The Exec: "Use AI Safely" · 2. Understanding & Propagating Risk · 3. Delegation Of Mandates · 4. **The Agent As A User** (the sharpest — *execution is commodity, the safe uninjected decision is genesis*) · 5. The Security Team · 6. The Financial Team · 7. The Vendor Of An Agentic Solution · 8. The Competitive Landscape
Companion: `briefs/06/23/wardley-maps/v0.33.33__strategy-brief__wardley-maps-primer-what-a-wardley-map-is-in-context-of-agent-mandates.md` — **846 words, a clean short public primer, directly reusable as site copy.** ✅ Clean.

### Set C — Permissions & risk landscape (19 June 2026) — 3 mermaid maps, **unrendered**
Source: `briefs/06/19/strategy-phase-and-shipping/v0.33.28__strategy-brief__sg-send-wardley-maps-productizing-commoditizing-permissions-explorer-phase.md` (2,236 w, blocks at lines 31, 61, 94, 126).
1. **The Permissions And Risk Landscape Today** — with a component literally named **"Hope Driven Development"** sitting where understanding should be *(the funniest and sharpest map in the corpus)*
2. What SGraph Commoditises And Re-Productizes
3. Higher-Order Opportunities Once Commoditised
4. Where The SGraph Offering Sits On Evolution
**These are the most graph/risk-relevant maps in the repo and they are one render command from being top-tier assets.** ✅ Clean.

### Set D — The airgapped register (28 July 2026) — 1 drawn (ASCII) + 3 specified
Source: `briefs/07/28/mvp-and-field-demo/v0.33.53__strategy-brief__sg-send-wardley-map-of-the-airgapped-register-custom-evolution-axes-broken-middle-shape.md` (2,956 w).
Contains **the air-gap map** — evolved ends, manual middle, *"the ends are solved, the middle is people"* — and specifies three more (air gap as sales artefact, translation across altitudes, evidence chain agent → board).
Also adjudicates **custom evolution axes**: `air gap → file → API → event-driven` = **valid**; `air gap → spreadsheet → networked → API` = **valid, more legible**; `can pull the plug → time to understand → observability` = **invalid — that is a maturity scale, not an evolution axis.** The rule: *"relabel the axis when the thing genuinely evolves; use a maturity model when the thing merely improves."*
**The single best map for a public site** — it shows a competent organisation whose investments don't connect. ✅ Clean.

### Set E — sgit positioning maps — **PROPOSED, NOT BUILT**
`briefs/08/14/sgit-site-and-hub/v0.33.58__strategy-brief__sgit-topic-sections-catalogue-read-keys-yes-write-keys-never-frozen-vaults.md` (3,338 w) verifies the tooling and argues a map should explain sgit-vs-git — *"a map is a claim, not a picture."* The founder's own words, which are effectively this site's commissioning note:

> *"if I wanted to create a vault and then put on a website that has Wardley maps as an example, **I don't have a good place to point to** another vault that already has figured out how to use the latest Mermaid, how to document it, how to explain it."*

**graphs.sgit.ai should be that place.**

### ⚠️ The coordinate trap — publish this prominently
Mermaid Wardley coordinates are **`[visibility, evolution]` — the reverse of the usual convention.** *"A map with its axes transposed renders happily and says something entirely different."* Type added in **v11.14.0**, production-stable **v11.15.0**. Hand-drawn look is **not** supported (separate renderer). Source: `briefs/08/14/sgit-site-and-hub/v0.33.58__strategy-brief__sgit-topic-sections...md:61`.

Note: sgit.ai already publishes `/demos/strategy-maps.md` (eight maps as **inline SVG**) and `/demos/sgit-maps.md`. Check those before re-rendering — the SVG versions may already exist there.

### Related mapping artefacts (Cartographer role)
| Path | Words | Maps |
|---|---|---|
| `team/roles/cartographer/reviews/02/26/v0.6.36__evolution-map__v0-6-30-brief-batch-capabilities.md` | 5,333 | Capabilities C29–C45+ each assigned a Wardley evolution stage |
| `team/roles/cartographer/reviews/03/11/v0.13.22__system-map__vault-communication-and-deploy.md` | 4,407 | System topology: vault-as-channel, AI participants, deploy service |
| `briefs/02/14/v0.3.2__briefs__wardley-maps-in-sgraph-project.md` | 1,578 | **The founding brief** — why the Explorer/Villager/Town Planner team structure maps to genesis/custom/product/commodity |
| `team/roles/cartographer/REFERENCE__from-issues-fs.md` | 4,537 | The Cartographer role; source of concept **C25** (*maps are the natural evolution of graphs*) |

---

## Part E — The design system to inherit

### E1 · Design tokens — one file, take it verbatim
`sgraph_ai_app_send__ui__open/v0/v0.4/v0.4.0/en-gb/_common/css/design-tokens.css` (5,188 bytes; byte-identical copy under `ui__share`).

**"Aurora" dark theme.** Declared on bare `:root` and loaded via `<link>` outside Shadow DOM so custom properties cross shadow boundaries — a deliberate, documented choice.
- **Colour:** `--color-bg #1A1A2E` · `--color-surface #1E2A4A` · `--bg-secondary #16213E` · `--color-primary #4ECDC4` (teal — the brand accent) · `--color-text #E0E0E0` · `--color-text-secondary #8892A0` · `--color-error #E94560` · `--color-warning #E07C4F` · borders `rgba(78,205,196,0.15)`
- **Type:** DM Sans (display + body), JetBrains Mono (mono). Scale `--text-display 2.5rem` → `--text-micro 0.625rem`
- **Spacing:** 4 px base, `--space-1`…`--space-16` · **Geometry:** `--radius 8px`, two shadow levels, `--transition 150ms ease`

Already consistent across the estate: `architecture-diagram.svg` uses `#1a2332`/`#4DD0E1`/`#4ECDC4`; the favicon `#1A1A2E`/`#4ECDC4`; the roadmap SVG a compatible `#0C1826`/`#6FA3D0`.

**Graph-specific palette guidance:** the Risk Graph Explorer already establishes a semantic edge palette — **amber = exposure, green = assurance, ghosted = unanswered**. Inherit it. Ghosted-for-unanswered is a direct visual expression of concept C3 (map the gaps) and should be used consistently across every graph the site renders.

### E2 · Reusable chrome components
`sgraph_ai__website/v0/v0.2/v0.2.0/_common/js/components/` — each versioned `v1/v1.0/v1.0.0/` with its own `.css`, `.html`, `.js`: `sg-site-header` · `sg-site-footer` · `sg-send-hero` · `sg-use-cases` · `sg-vault-primitives` · `sg-vault-patterns` · `sg-runs-anywhere` · `sg-pricing-teaser` · `sg-oss-section` · `sg-tools-section` · `sg-privacy-statement`.
**`sg-use-cases` is the direct precedent for an infographics gallery** — image + alt-text + caption cards, already proven.

### E3 · Page-layout schema
`library/skills/create-vault-content/SKILL.md` (21,425 b) defines `_page.json`. Block types: `hero` · `title` · `text` · `markdown` · `section` · `columns` · `cards` · `bullet-points` · **`gallery`** · **`image`** · **`slides`** · `pdf`. **`gallery` + `slides` + `image` are exactly what an infographics section needs, and they already exist.**
Companions: `library/skills/create-vault-apps/SKILL.md` (34,191 b) · `library/guides/vault-html/AUTHORING.md` (9,487 w — the canonical `window.sg` API reference, including `sg.history.*` for traversing the commit DAG).

### E4 · Build and deploy tooling
`scripts/deploy_static_site.py` (28,588 b — S3 versioned-release deploy + IFD overlay + CloudFront invalidation; Cache-Control tiers HTML 300 s / CSS-JS-JSON 86400 s / images 604800 s) · `scripts/generate_sitemap.py` (7,981 b — sitemap.xml with **full hreflang**, 306 URLs) · `scripts/build-vault-static.sh` (7,803 b — flattens a vault into production URL shape and **rewrites CDN URLs to local `/_common/`** so nothing loads off-site) · `scripts/inject_build_version.py` · `scripts/cloudfront/vault-spa-routing.js`.

**There are no graph-rendering generators in `scripts/`.** If graphs.sgit.ai wants generated diagrams, that generator does not exist yet — building one is a legitimate line item.

### E5 · Alternative chrome — a working Jekyll site
`team/roles/journalist/site/` is a complete, deployable Jekyll site (GitHub Pages, kramdown, `jekyll-seo-tag`, 3 layouts, 6 posts, 452-line stylesheet). **Relevant because GitHub Pages renders Mermaid natively**, which solves the crawler-visibility problem *and* the Wardley-render problem in one move. ⚠️ Strip the hard-coded GA4 tag in `_layouts/default.html:11` before reuse.

---

## Top 15 visual assets for the site

Ranked by (graph relevance × publish-readiness × effort-to-ship).

| # | Asset | Path | Why |
|---|---|---|---|
| 1 | **The 8 rendered Wardley maps** (as a set) | `briefs/05/24/sg-send-thread/wardley-maps/*.png` (232 KB total) | The only fully-rendered professional diagram set in the repo, each with a written story. Maps are *falsifiable claims* — exactly the register a reference site wants |
| 2 | **The 4 unrendered permissions/risk maps** | `briefs/06/19/strategy-phase-and-shipping/v0.33.28__strategy-brief__...` lines 31/61/94/126 | The most graph/risk-relevant maps in the repo. **One render command from being #1-tier.** Includes "Hope Driven Development" |
| 3 | **`riskmandate-product-roadmap.svg`** | `briefs/07/02/product-roadmap/` (11 KB) | Vector, self-contained, theme-consistent, names the graph work explicitly. **Doubles as the template for every new graph infographic** |
| 4 | **The lexicon anchor-ontology tree** | `library/concepts/v0_4_0__lexicon-architecture.md` lines 91–189 | 97 rows of ASCII: core/coordination/structural/external anchors with edges out to schema.org, SKOS, W3C PROV-O. **Redraw as SVG → the site's signature diagram** |
| 5 | **The `Task-42` typed-graph diagram** | `library/concepts/v0_4_0__thinking-in-graphs.md` lines 468–487 | The single best pedagogical graph in the corpus. **Redraw as interactive SVG and it teaches the whole thesis** |
| 6 | **`13-agent-session-tree.jpeg`** | `.../use-cases/` (314 KB) | Pipeline + output + folder convention in one frame |
| 7 | **The air-gap Wardley map** | `briefs/07/28/mvp-and-field-demo/v0.33.53__strategy-brief__...` (ASCII) | The sharpest single map: a competent organisation whose investments don't connect |
| 8 | **`architecture-diagram.svg`** | `.../v0.2.13/test-files/gallery-pack/` (5 KB) | Clean 800×500 vector, on-palette, zero dependencies. Retitle and ship |
| 9 | **The browser-isolation JSON** | `briefs/07/12/worked-business-case/v0.33.48__briefing__...` | 59/75, drop-in renderable. **The site's first interactive graph** |
| 10 | **The 2FA JSON** | `briefs/06/26/semantic-graph-and-query-paths/v0.33.35__data__sg-send-2fa-mappings.json` | 51/53, downloadable, self-describing principles inside the file |
| 11 | **`PlaybookLM-Architecture-Brief.pdf`** | `briefs/04/13/for-team__tools/` (11 MB) | 8 generated infographics proving deck-scale output. Split to PNGs first |
| 12 | **`14-medical-page-json.png`** | `.../use-cases/` (467 KB) | Highest-res asset; the "you can build a site like this" proof |
| 13 | **The `.issues/` schema JSON** | `.issues/config/{node-types,link-types}.json` | A real, tiny, readable typed-property-graph schema with 71 live nodes to point at. **Cheapest credibility on the site** |
| 14 | **Logo + favicon** | `sgraph_ai__website/_common/img/logo/` | Non-negotiable chrome |
| 15 | **The one mermaid `stateDiagram-v2`** | `briefs/03/26/for-team__qa/v0.2.35__multi-agent-review__state-machines-ontologies.md:778` | Ranked for what it *unlocks*: the same file specifies `to_mermaid()` generation — **the template for machine-generated site diagrams** |

---

## Three things to flag before building

1. **The gap is rendering, not raw material.** Render the 4 unrendered Wardley maps and convert the top ~20 ASCII graph diagrams to themed SVG. That is the highest-leverage work available.
2. **Two infographic pipelines exist and the less-documented one is better for this site.** SVG is versionable, theme-aware, accessible and free to re-render. Resolving the `<sg-llm-infographic>` AppSec review is the prerequisite for infographics at scale.
3. **The crawler-invisibility warning is about this site's architecture.** A client-side-decrypted, browser-assembled vault site is invisible to crawlers — the team already measured this on sgit.ai. Decide the rendering strategy and the `llms.txt` fallback **before** content, not after. See `06__house-style-and-conventions.md`.

---

This document is released under the Creative Commons Attribution 4.0 International licence (CC BY 4.0).
