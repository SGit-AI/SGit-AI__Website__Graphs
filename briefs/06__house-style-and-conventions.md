# 06 — House Style, Conventions and Constraints

What graphs.sgit.ai inherits from the four sibling sites, and the rules it must not break.

---

## 1. The sibling-site pattern

All four sites share a shape. Match it, so the network reads as one thing.

| Site | Version | Sections |
|---|---|---|
| **sgit.ai** | — | why · demos · catalogue · published vaults · compare · use-cases · case-studies · docs · api · vault · deploy · try · skills · briefs · updates · articles · **network** · security · admin |
| **pki.sgit.ai** | v0.1.4 | failure · rules · mandate · execution · bootstrap · enrolment · shipped · roadmap · documents · about/participant · admin/{comms,versions,index} |
| **nhi.sgit.ai** | v0.1.19 | thesis · method · options · research · hope · industry · documents · packs · pki · collection · frameworks · infographics · about · admin |
| **sg-sentinel.sgit.ai** | v0.1.1 | the system · the method · **the documents (all 23, verbatim, with reader pages)** · the code · site |

**The invariants:**
- `/llms.txt` at the root — **treat it as the primary surface, not a courtesy** (§3)
- `/documents/` with **raw markdown as source of truth** and rendered reader pages as presentation
- `/about/participant.html` — participant disclosure
- `/admin/comms.html` — a public working channel: numbered asks (N1, N2…) and tasks (T1, T2…) with explicit states (Done / Waiting / Open / Queued)
- `/admin/versions.html` — release history with version, date, and what changed
- `/admin/index.html` — how the site is built
- A **build order published unresolved**, with open questions and honest tensions stated rather than hidden
- Cross-links to the other `*.sgit.ai` sites
- **CC BY 4.0**, publisher "the sgit project"

**Adopt the comms board from day one.** It is how the founder feeds material in — pki.sgit.ai's N2 ask (*"the February–March PKI material identified"*) is exactly the mechanism that unblocks a site. Seed graphs.sgit.ai's board with: N1 the LinkedIn series (see §6), N2 the licence resolution, N3 the corpus glossary, N4 the render backlog.

---

## 2. Voice

From reading all four sites, the house voice is:

- **Short declarative sentences that make checkable claims.** *"The registry does not exist."* *"The shipped PKI has no revocation and no directory."*
- **Publish the argument before the implementation**, and say which is which.
- **Name what you got wrong.** pki.sgit.ai v0.1.3 shipped a page listing *"five things earlier briefs got wrong."* sg-sentinel publishes "built vs code-complete vs deferred."
- **Open questions stay open, in public, numbered.**
- **Honest tensions get their own section.** pki.sgit.ai's `/roadmap/#tensions` is a model.
- **No marketing adjectives.** The corpus's own strongest lines are structural, not promotional: *"the difference is not in the value, it is in the connectivity."*

For this site specifically, one addition: **earn the jargon.** The founder's own diagnosis is that the audience does not know these words. Every technical term gets a plain-English gloss on first use, and `/start/` uses none of them.

---

## 3. `llms.txt` — the load-bearing lesson

`briefs/08/14/sgit-site-and-hub/v0.33.58__cross-team-brief__sgit-ai-agent-access-report-markdown-is-excellent-site-is-not-indexed.md` records an agent trying to consume sgit.ai's docs:

- The index fetch worked and was *"better than almost anything comparable"* — an annotated map with one-line descriptions, install command, key format, agent command, cross-session state pattern.
- **Then link-following failed**, because agent fetch tools refuse URLs a search has not already returned — and a search for the page's exact title returned no sgit.ai result at all.
- Conclusion: ***"llms.txt is not a convenience for such agents but the whole surface."***

pki.sgit.ai hit the same wall independently: its own site review records *"documentation that is excellent and unreachable."*

**Three mitigations, in order of speed:**

1. **Make `llms.txt` self-sufficient.** Each entry carries the page's **single most important fact**, not just what it covers — *"because the descriptions are the only content it will ever see."*
   - ✅ Good: `/grammar/verbs/ — every edge is a verb with a distinct inverse; relates-to is banned because everything relates to everything`
   - ❌ Bad: `/grammar/verbs/ — about edge naming conventions`
2. **Publish a single-file concatenation** of the whole doc set, so one fetch gets everything. Call it `/llms-full.txt`. For this site that is genuinely valuable: an agent that reads it once has the whole graph vocabulary.
3. **Get indexed.** The measured hypothesis: *"a site whose pages are decrypted and assembled in the browser is exactly the shape a crawler struggles with."*

**⚠️ L2 — decide rendering before content.** A client-side-decrypted, browser-assembled vault site inherits the invisibility. Either serve pre-rendered HTML, or publish a static mirror. `scripts/build-vault-static.sh` already flattens a vault into a production URL shape and rewrites CDN URLs to local `/_common/` — that is the tool for it. GitHub Pages is the other option and it **renders Mermaid natively**, which solves crawler visibility and Wardley rendering in one move.

---

## 4. Every section serves three readers

From `briefs/08/14/sgit-site-and-hub/v0.33.58__strategy-brief__sgit-topic-sections-catalogue-read-keys-yes-write-keys-never-frozen-vaults.md`:

1. **Documentation** — prose, for a person evaluating
2. **Live demonstration** — an embedded read-only vault, browsable in-page
3. **Agent guidance** — a recipe and a pasteable reference — ***"the one most sites omit."***

For graphs.sgit.ai, reader 3 is unusually important: the whole reason this site exists is that agents under-weight this material. Every concept page should end with a short, pasteable **"for an agent"** block: the rule, in one sentence, in a form an LLM can carry into another session.

The same brief's four-element topic template: **the problem · the security properties · the deployment path · the demonstrations.** For a concepts site, substitute: **the problem · the rule · what it buys you · the worked example.**

---

## 5. Vault publishing rules — hard constraints

Same source. These are not style preferences.

- **Publish read keys. Never publish write keys.** A central list of vault keys is a single artefact whose compromise grants write access to everything.
- **Escrow the write key *before* publishing.** A vault whose write key is lost is not damaged, it is **frozen** — permanently readable by anyone holding the published key, never updatable, never revocable, never correctable. *Escrowing is a precondition of publishing, not good practice.*
- **Audit before publish.** The regulation-graph vault is a **redacted republication**: the original contained a plaintext vault key for another vault, found during audit. The current version carries new history with two credentials marked `<VAULT-KEY-REMOVED>` / `<READ-KEY-REMOVED>` and a `PUBLIC.md` transparency document. **Adopt the `PUBLIC.md` convention.**
- **No metered capability behind a published read key.** The Risk Graph Explorer's `PUBLIC.md` states this explicitly — never put LLM credentials behind a published read key. Its `app.json` requests `permissions: {}`.

---

## 6. Licensing — resolve before launch

**The default posture of this corpus is already public-ready:** 1,103 markdown files carry an explicit *"released under the Creative Commons Attribution 4.0 International licence (CC BY 4.0)"* line, including **223 graph-topic files**. All ~46 founder-authored conceptual briefs carry it.

**⚠️ But the intended centrepiece does not.**

`library/concepts/v0_4_0__thinking-in-graphs.md`, `v0_4_0__compatibility-through-connectivity.md`, `v0_4_0__lexicon-architecture.md`, `library/concepts/README.md`, `library/guides/agentic-setup/v0_4_0__role-ecosystem-guide.md` and the three `REFERENCE__from-issues-fs.md` role files **carry no licence line at all** and are attributed to **Issues-FS, a different project**. `library/concepts/README.md` says so explicitly.

These are the site's foundational pages — `/start/` is built almost entirely from `thinking-in-graphs.md`. **Resolve the licence and attribution before launch.** This is gap G8 and it is the only true blocker in the pack.

---

## 7. Redaction watch-list

Run these greps before any bulk publication.

| Item | Reach | Action |
|---|---|---|
| **`<PARTNER-NAME-REDACTED>` / `<PARTNER-NAME-REDACTED>`** — the one named healthcare partner | **20 files.** 3 are real partner references (`briefs/05/31/v0.31.7__strategy-brief__...industry-use-case-pages-embeds-metrics.md` lines 42, 107, 165; `briefs/05/29/v0.31.5__...`; `briefs/06/02/v0.31.9__...`). The other 17 are **code identifiers** in the vault-in-vault kernel and `library/guides/vault-html/AUTHORING.md` — engineering references, but the string still leaks the name | **Redact.** ✅ None of the graph examples in `03__worked-examples-index.md` contain it |
| **AWS account `<AWS-ACCOUNT-REDACTED>`** | **49 occurrences across 17 files**, with real bucket names and CloudFront ARNs. All infra/devops docs | **Scrub** on any bulk docs-tree publication. ✅ Touches no graph example |
| **`<PACK-NAME-REDACTED>` / `<PACK-NAME-REDACTED>`** — personalised vault packs | 2 files: `briefs/07/12/v0.33.48__index__2026-07-12.md:88`, `briefs/07/17/v0.33.49__index__2026-07-17.md:103`. Both lines say the packs are internal and excluded from every public zip. **The packs themselves are not in the repo** | **Strip these two lines** if day indexes are published |
| **`library/alchemist/`** — investor material | Whole directory: business plan, revenue model, pitch decks, competitive analysis, investor one-pager. The reality index flags that the one-pager references *"30 paying customers"* and *"592 tests"* which may not be current | **Internal only.** A stale customer count on a public site is a real risk |
| **LinkedIn network CRM** | `briefs/06/10/network-intelligence/v0.33.16__dev-brief__sg-send-linkedin-semantic-knowledge-graph-crm-outreach-workflow.md` — real network export | **Internal only** |
| **Odysseus case study** | `briefs/06/20/odysseus-mandate-analysis/v0.33.30__research-brief__...` — names a real product and analyses its security posture | **Legal read.** Sources public, tone fair, but the one entry an external party could object to |
| **Medical screenshots** | `.../use-cases/14-medical-page-json.png`, `15-medical-vault-split.jpeg` | **Verify synthetic data pixel-by-pixel** before republishing |

**No credentials found** anywhere in the repo: zero `AKIA` matches with real values; the 29 `aws_access_key` hits are config key *names*, not values.

---

## 8. Technical conventions to inherit

- **IFD versioning** — immutable versioned directories (`v0/v0.2/v0.2.3/`). Prior versions stay in-tree and frozen. **Any code excerpt on the site must cite its version explicitly** or it will go stale and become wrong. The vault UI has six frozen copies in-tree; the live one is `v0.2.3`.
- **Design tokens** — inherit `sgraph_ai_app_send__ui__open/v0/v0.4/v0.4.0/en-gb/_common/css/design-tokens.css` verbatim. Details in `04__visual-assets-and-infographics.md` §E1.
- **Semantic edge palette** — the Risk Graph Explorer already establishes it: **amber = exposure, green = assurance, ghosted = unanswered.** Ghosted-for-unanswered is a direct visual expression of concept C3. Use it consistently on every rendered graph.
- **Rendering rule, from the corpus** — *"Never render the whole graph; render the result of a query."* Mermaid is the **print** step (text, diffable, committable, unreadable beyond ~50 nodes); an interactive canvas is the **exploration** step. Legibility ceiling for a rendered graph is ~300–400 nodes.
- **Wardley coordinates are `[visibility, evolution]`** — reverse of the usual convention. Mermaid Wardley: added v11.14.0, production-stable v11.15.0, hand-drawn look unsupported. **Publish this trap prominently** — it is exactly the kind of hard-won detail the founder said he had nowhere to point at.
- **Wardley fences use a bare ``` with `wardley-beta` on line 1** — grep for `wardley-beta`, not for the fence tag, or you will miss all 13 maps.
- **Infographic folder shape** — `slides/slide-NN-name/{_page.json, brief.md, infographic.png}`. Prompt beside output, so every image is regenerable and auditable.

---

## 9. Three repo fixes worth doing alongside the site

These are cheap, and the first one is the actual cure for the problem that prompted this whole exercise.

1. **Add the `library/concepts/` cross-reference to `.claude/CLAUDE.md`.** This is Phase 2 of `briefs/06/10/_to-librarian/memo-to-librarian__thinking-in-graphs.md`, specified on 11 June and never executed. It is why every agent working forward from `CLAUDE.md` misses the philosophy. **One edit, and the under-weighting stops.**
2. **Resolve the licence status of the three `library/concepts/` documents** (§6).
3. **Import the founder's LinkedIn "graphs of graphs / meaning through connectivity" series** — requested as prerequisite reading on 10 June 2026, still absent, and blocking the site's most important page (G1).

A fourth, optional but on-theme: **create `team/roles/librarian/reality/graphs.md`.** There is no graph domain in the reality tree; graph material is scattered across `identity/`, `security/`, `vault/` and `ai-agents/`. A `graphs.md` domain index would make the next mapping exercise cheap instead of expensive — and it is the same gap the PKI review found for `pki.md`.
