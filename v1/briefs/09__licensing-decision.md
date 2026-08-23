# 09 — Licensing Decision

**Decided by Dinis Cruz, 21 August 2026.** This file records the decision and the mechanics of applying it. It supersedes the "resolve before launch" framing of gap **G8** in `08__gaps-and-fresh-writing.md`.

---

## The decision

> **Unless a document explicitly says otherwise, every `.md` file in the corpus was authored by Dinis Cruz and is released under CC BY 4.0. The same applies to the entire content of every `*.sgit.ai` website.**

Irrevocability is **the point, not a risk to be managed**: the licence is what guarantees the material stays readable — by its author, by future collaborators, and by agents — regardless of what happens to any company, platform or vault that currently hosts it. A grant that could be withdrawn would not provide that guarantee.

**G8 is therefore closed as a blocker.** What remains is mechanical: stamping the files that lack the line, fixing one attribution, and resolving one repo-level inconsistency.

---

## Canonical licence line

Use this exact wording — it is already the dominant form in the corpus (884 occurrences), placed as the last line of the document after a `---` rule:

```

---

This document is released under the Creative Commons Attribution 4.0 International licence (CC BY 4.0).
```

The longer variant (105 occurrences) is also acceptable and preferable for public-facing pages:

```
This document is released under the Creative Commons Attribution 4.0 International licence (CC BY 4.0). You are free to share and adapt this material for any purpose, including commercially, as long as you give appropriate credit.
```

For JSON artefacts, use a top-level field — the pattern already set by `v0.33.35__data__sg-send-2fa-mappings.json`:

```json
"license": "CC BY 4.0"
```

---

## Current state, measured at v0.33.62

| Scope | Count | State |
|---|---|---|
| `.md` files carrying the CC BY line | **1,103** | ✅ already released |
| Founder briefs carrying it | **1,027 of 1,302** | ✅ |
| Founder briefs **missing** it | **275** | ⬜ to stamp |
| Tier-0 graph documents carrying it | **15 of 17 `.md`** | ✅ |
| `library/concepts/*.md` | **0 of 4** | ⬜ see attribution note |
| `v0.33.35__data__sg-send-2fa-mappings.json` | inline `"license": "CC BY 4.0"` | ✅ |
| `.issues/config/*.json` | no licence field | ⬜ to stamp |

**Where the 275 unstamped *briefs* sit** — heavily front-loaded, so the graph corpus (June–August) is almost fully covered already:

| Month | Missing |
|---|---|
| March | 116 |
| February | 79 |
| May | 27 |
| April | 25 |
| June | 24 |
| August | 3 |
| July | 1 |

### The corpus-wide picture is larger than the briefs

Running `licence-audit.py` across `team/` and `library/` (excluding vendored dependencies and `library/alchemist/`) gives the real number:

```
CC BY 4.0 coverage: 1,101 / 3,248  (33.9%)
Unstamped: 2,147
```

| Area | Unstamped |
|---|---|
| `team/roles` | **1,075** |
| `team/humans` (beyond the briefs) | 569 |
| `library/sgraph-send` | 275 |
| `team/comms` | 123 |
| `library/guides` | 34 |
| `team/villager` | 26 |
| `team/town-planner` | 21 |
| `library/docs` | 11 |
| `library/skills` | 7 |
| `library/concepts` | 4 |
| `library/roadmap` | 2 |

The founder briefs were the well-tended part. **The role reviews — the Architect, AppSec, Dev, Librarian and QA output that makes up the bulk of the corpus — are almost entirely unstamped**, and several of them are Tier-0/Tier-1 candidates for both pki.sgit.ai and graphs.sgit.ai. One `--fix` run closes all of it.

---

## Three mechanical items

### 1 · `library/concepts/` — stamp, and fix the attribution

The four files carry no licence line, and `library/concepts/README.md` states they are *"canonical philosophy and architecture documents from the Issues-FS project… references — not SGraph Send artifacts."*

Under the decision above, same author, so **CC BY 4.0 applies**. But the attribution should name the origin correctly rather than silently reassigning it to SG/Send — that is the same provenance discipline these sites argue for. Suggested footer for each of the four:

```
---

Originally written for the Issues-FS project (v0.4.0, 5 February 2026); imported into SGraph Send on 11 June 2026.

This document is released under the Creative Commons Attribution 4.0 International licence (CC BY 4.0).
```

Files: `v0_4_0__thinking-in-graphs.md` · `v0_4_0__compatibility-through-connectivity.md` · `v0_4_0__lexicon-architecture.md` · `README.md`

**Consequence for the site:** `/start/` is unblocked. It is built almost entirely from `thinking-in-graphs.md`, and that page is now publishable.

### 2 · Repo-level LICENSE says Apache 2.0

`SGraph-AI__App__Send/LICENSE` is the Apache License 2.0. Someone reading only that file would reasonably conclude the whole repository — documents included — is Apache 2.0, which contradicts 1,103 per-file CC BY grants over the same text.

**Standard resolution — code and content licensed separately.** Add to the README, and to a `LICENSES.md`:

> **Code** in this repository is licensed under the Apache License 2.0 (see `LICENSE`).
> **Documentation and written content** — the `.md` files under `team/`, `library/` and `docs/`, and the content of the `*.sgit.ai` websites — are licensed under the Creative Commons Attribution 4.0 International licence (CC BY 4.0), unless a specific document states otherwise.

### 3 · `*.sgit.ai` websites

Each site already carries "CC BY 4.0 · the sgit project" in its footer. Under this decision that becomes a stated site-wide policy rather than a per-page footer. Add to each site's `/about/participant.html` or `/admin/index.html`, and to `llms.txt`:

> All content on this site is released under CC BY 4.0. The raw markdown under `/briefs/` is the source of truth and carries the same licence.

For **graphs.sgit.ai** specifically, put it in `llms.txt` as well as the footer — an agent that only ever reads `llms.txt` (see `06__house-style-and-conventions.md` §3) should learn the licence from that one fetch.

---

## What the licence does *not* change

CC BY 4.0 governs **reuse**. It says nothing about whether something **should be published**. These remain excluded regardless of licence, for reasons unrelated to copyright:

| Excluded | Reason |
|---|---|
| LinkedIn network CRM (`briefs/06/10/network-intelligence/v0.33.16__dev-brief__...linkedin-semantic-knowledge-graph-crm-outreach-workflow.md`) | Real personal data about third parties. Data protection, not licensing |
| Odysseus case study (`briefs/06/20/odysseus-mandate-analysis/v0.33.30__research-brief__...`) | Names a real third-party product and analyses its security posture — legal read |
| `library/alchemist/` | Commercial material; the one-pager cites *"30 paying customers"* and *"592 tests"* which may be stale |
| AppSec PKI reviews (`team/roles/appsec/reviews/02/21/v0.5.0__review__pki-architecture-security{,-revised}.md`) | An attack roadmap against code that is still live |
| `<PARTNER-NAME-REDACTED>` (20 files) · AWS account `<AWS-ACCOUNT-REDACTED>` (17 files) · `<PACK-NAME-REDACTED>` / `<PACK-NAME-REDACTED>` (2 files) | Redact before any bulk publication |

**Third-party material quoted inside CC BY documents stays under its own terms.** Vendor system cards, arXiv papers, the Brave Comet research, EU AI Act text and external URLs are quoted, not relicensed. Worth one line on the site's licence page.

---

## The audit script

`licence-audit.py` (shipped in this pack) reports and optionally fixes licence coverage. Run it from the repo root.

```bash
# report only
python3 licence-audit.py

# report, restricted to the graph corpus
python3 licence-audit.py --path team/humans/dinis_cruz/briefs/06

# apply the canonical line to every unstamped .md (writes files)
python3 licence-audit.py --fix

# CI mode: exit 1 if anything under the given paths is unstamped
python3 licence-audit.py --check team/ library/
```

Suggested CI gate: run `--check` on `team/` and `library/` so no new document lands without a licence line. That makes the default *stamped*, which is the whole point of the decision.

**Behaviour worth knowing before you run `--fix`:**

- **Idempotent.** A file that already carries the line is never touched, and re-running never double-stamps. Verified on a sandbox.
- **Markdown** gets `\n---\n\n<line>\n` appended — your canonical placement.
- **`--json` reflows the file.** Stamping a JSON artefact re-serialises it with `indent=2`, so the diff will show whitespace changes beyond the added key. Fine for `.issues/config/*.json`; check the diff before committing anything hand-formatted.
- **Skips by design:** `library/dependencies/` (vendored third-party docs — not yours to license) and `library/alchemist/` (commercial, excluded from publication). Edit `SKIP_PREFIXES` to change that.
- It stamps files, nothing else. It does not decide what should be *published* — see the exclusion table above.

---

This document is released under the Creative Commons Attribution 4.0 International licence (CC BY 4.0).
