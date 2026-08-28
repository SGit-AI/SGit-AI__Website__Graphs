# The non-functional audit — what the estate looks like before the review era

**Status:** MEASURED — every number below was counted, not remembered
**Date:** 27 August 2026, at v0.5.16
**Commissioned by:** brief 39 ("do a proper non-functional requirements pass on this")

The founder's reason for this pass is not tidiness. It is that an explosion of files is
coming: more tools, more capabilities, more interaction, and many more agents operating on
CONTENT rather than on code. The repository has to be legible to those agents before they
arrive. What follows is the honest state.

## The shape

| | |
|---|---|
| Tracked files | 843 |
| HTML | 226 · Markdown 177 · JSON 212 · JavaScript 80 · Python 28 |
| Top-level directories | `admin/` `assets/` `book/` `decisions/` `v1/` `v2/` |
| JavaScript, hand-written | 9,731 lines across 40 modules (vendor excluded) |
| Python generators | 8,017 lines across 20 files in `admin/build/` |
| Tests | 84, all in one file (`admin/tests/universe.test.mjs`, 942 lines) |
| Validator | `admin/build/validate.js`, 530 lines |
| Books | three, 32 chapter files, three PDFs (13.6 MB total) |

## Finding 1 — the root README documents a layout that no longer exists

`README.md` describes ten top-level directories. **Nine of them moved into `v1/` at
v0.4.1** and the README was never updated: `start/`, `grammar/`, `depth/`, `why-graphs/`,
`examples/`, `maps/`, `content/`, `docs/`, `briefs/`. An agent cloning this repository and
reading the README is told the wrong thing about nine paths before it reads a single file.

This is the single highest-value fix in the pass, because it is the first document every
new agent reads.

## Finding 2 — no contributor contract for agents

There is no `CLAUDE.md` and no equivalent. Everything that governs work here — the release
ritual, the collision discipline for parallel agents, the SGraph size guidelines, the
brief-verbatim rule, the anchoring rule, the CDP port lesson — is either in a release note,
a brief, or an agent's memory. Five agent sessions have now worked in this repository; the
next wave will be larger and content-focused.

## Finding 3 — the documentation line is exactly the v1/v2 boundary

Every module written under the SGraph guidelines carries a `@module` header stating its
single responsibility. Every module written before them does not:

| Undocumented | Lines |
|---|---|
| `assets/altitudes-graph.js` | 787 |
| `assets/decisions.js` | 484 |
| `assets/altitudes.js` | 409 |
| `assets/docs.js` | 292 |
| `assets/changes.js` | 229 |
| `assets/concepts.js` | 142 |
| `assets/review.js` | 111 |
| `assets/nav.js` | 42 |
| `assets/mdreader.js` | 40 |

Nine files, 2,536 lines, no stated responsibility between them. Fixed in pass one.

## Finding 4 — seven modules exceed the size guideline, and only one is recorded

The guideline is parts ≤200 lines, sections ≤250, with deviations recorded. The recorded
deviation is `uni-graph.js` (434). The unrecorded ones:

| Module | Lines | Verdict |
|---|---|---|
| `assets/altitudes-graph.js` | 787 | split: graph build / layout / interaction |
| `assets/universe-chat/chat.js` | 756 | the chat agent's; flag, do not touch unilaterally |
| `assets/decisions.js` | 484 | split: data load / table / filters |
| `assets/universe/components/uni-graph.js` | 434 | recorded debt since v0.4.13; still owed |
| `assets/altitudes.js` | 409 | split: page shell / ladder / controls |
| `assets/universe/universe-api.js` | 408 | acceptable: it is a published API surface, one export per command |
| `assets/wclm/wclm-page.js` | 342 | split: bar / draw / paint |

## Finding 5 — three books, three separate builders

Three writing sessions each wrote their own markdown-to-PDF pipeline:

| Book | Builder | Lines |
|---|---|---|
| `fsg` | `build.py` | 596 |
| `making-a-book` | `build.py` + `gen_pages.py` | 289 + 224 |
| `fsg-universe` | `build/` (build.sh, gen_chapters.py, validate.py) | separate again |

All three do the same three things: render markdown to print HTML, run weasyprint, and
emit self-rendering web pages. The review era will rebuild books constantly, so this is
the duplication that will hurt most. It is also the one to touch most carefully: each
book's PDF is a shipped artefact and must rebuild byte-comparably after any refactor.

## Finding 6 — the test surface stops at the v2 core

The 84 tests cover the universe core, the WCLM engine and the operator folders. Nothing
covers:

- the twenty Python generators (8,017 lines) — the chain that builds the whole site
- the three book builders — which produce the artefacts about to be published
- the nine undocumented v1-era JavaScript modules
- `validate.js` itself (530 lines of gate, ungated)

The gates that exist are strong. The gap is that they only look at one half of the estate,
and the half about to be published is the unwatched one.

## Finding 7 — only three web components exist

`uni-graph`, `uni-options` and `uni-source` are custom elements. Everything else is a
module that reaches into the DOM by id. The candidates the founder named are real: the
altitudes graph, the file explorers, the operator workbench and the chip-and-wire renderer
are all self-contained widgets with clear inputs, mounted on multiple pages.

## Finding 8 — the WCLM is parked but does not say so

Brief 39 parks the WCLM and the operators. Nothing on the page or in the folders says so.
A visitor — human or agent — cannot tell an active experiment from a parked one, which is
exactly the distinction the estate claims to care about.

## What is genuinely healthy

Said plainly, because an audit that only lists faults is not honest: the projection chain
holds (every page renders its own markdown; nothing drifts silently); `validate.js` and
gate 27 have caught real regressions all week; the release ritual works under five
concurrent agents; the anchoring discipline survived three parallel book sessions; and the
v2 code written under the guidelines is documented, tested and small. The problems above
are almost entirely at the v1/v2 seam and in the newest, fastest-written corners.
