# The plan — three passes, sized, with the version call

The founder asked for "one more pass of quality… maybe one or two passes more". The audit
found more than one pass of work, so it is split into three, ordered by what the review era
needs first. Each pass is a release of its own and ends green.

## The version call, restated

Everything here is **v0.5.x**. The 5.x era wraps with: these passes, per-book versioning,
the Leanpub release, and the site becoming the home of two books. **v0.6.0 opens with the
review machinery** and nothing else. The reasoning is in brief 39; the short form is that
the seam falls between *finishing the books as they are* and *changing the books under
control*, not between *tidy* and *new*.

## Pass one — the documents an agent reads first (v0.5.17, DONE)

The cheapest, highest-leverage work: what a new session learns before it touches anything.

- **`README.md` rewritten** against the real tree. Nine wrong paths corrected, the three
  books added, the v1/v2 split explained, the generator chain and the gates listed.
- **`CLAUDE.md` written**: the contributor contract for agents — the release ritual, the
  collision discipline, the SGraph size guidelines, the brief-verbatim rule, the anchoring
  rule, the CDP unique-port lesson, and the boundary between tool work and content work.
- **Nine `@module` headers added** to the undocumented v1-era modules, each stating that
  module's single responsibility in the estate's own voice.
- **The WCLM parked visibly**: a stated notice on the WCLM and operators pages, so a parked
  experiment reads as parked rather than as abandoned or live.

## Pass two — the builders and the gates (proposed, v0.5.18)

The work the review era leans on hardest, because it will run these paths constantly.

- **One shared book builder.** Lift the common pipeline out of the three per-book builders
  into `admin/build/bookkit/` — markdown to print HTML, weasyprint, self-rendering web
  pages — leaving each book only its own configuration (title, parts, figure rules, cover).
  Acceptance: each PDF rebuilds and is compared page-count and section-for-section against
  the shipped one before the old builder is deleted.
- **Per-book versioning**, which the Leanpub release requires: `v2/books/<slug>/book.json`
  gains a `version` and a `changelog` whose entries move only on CONTENT changes, a gate
  fails a content change that does not move the version, and each book's page and PDF
  colophon state their own version beside the site's.
- **Gates for the unwatched half**: a smoke test per generator (runs, is idempotent, output
  parses), a builder test per book (rebuilds, page count within tolerance, chapter hashes
  match `book.json`), and a self-test for `validate.js`.
- **Split the test file**: 942 lines and 84 tests in one file becomes a small runner plus
  `admin/tests/<area>.test.mjs`, so a content agent can run only what it touched.

## Pass three — the modules and the components (proposed, after v0.5.20)

### Correction: three of the modules cannot be split, and the reason is the freeze

This pass was planned before anyone checked WHO LOADS each oversized module. Measured
against `v1/MANIFEST.json`, every consumer page of three of them is frozen:

| Module | Lines | Consumer pages | Frozen |
|---|---|---|---|
| `assets/altitudes-graph.js` | 795 | `v1/altitudes/graph.html` | **1 of 1** |
| `assets/altitudes.js` | 415 | `v1/altitudes/index.html` | **1 of 1** |
| `assets/docs.js` | 298 | 22 pages under `v1/docs/` | **22 of 22** |
| `assets/decisions.js` | 491 | `decisions/index.html` | none |
| `assets/universe/components/uni-graph.js` | 435 | ESM imports only | none |
| `assets/wclm/wclm-page.js` | 343 | ESM imports only | none |

A frozen page cannot gain a second `<script src>` tag, so those three cannot be split into
additional files the ordinary way. Dynamic `import()` inside the existing script would
work without touching the HTML — and would make initialisation async on pages that are
frozen evidence, for no benefit to anything anyone is still editing.

So the call is: **leave the three, and say why.** Each carries the reason in its
`@module` header, where the next agent will actually read it. 1,508 lines stay long on
purpose. That is stated debt, which is the kind this estate allows.

- **Split the modules that are actually live**: `decisions.js` (491),
  `wclm-page.js` (343), and the long-recorded `uni-graph.js` debt (435). Leave
  `universe-chat/chat.js` (757) to the chat agent and `universe-api.js` (409) as it is: an
  API surface is allowed to be a list.
- **Promote the four real widgets to web components**: the altitudes graph, the file
  explorer, the operator workbench, and the chip-and-wire renderer. Each gets a tag, an
  attribute contract and a documented event surface — which is also what makes them
  mountable inside the review UI without copying code.
- **Fold the anatomy treatment into the shared core** (engine, runtime, renderers), now
  that the format has been read and judged.

## What this pass deliberately does NOT do

- It does not touch book content. The books are frozen until the review era changes them
  under control — that is the whole point of the change-control workflow.
- It does not restructure `v1/`. The first edition is frozen; its code is documented in
  place, not rewritten.
- It does not build any review machinery. That is v0.6.0, and it deserves its own memo,
  which the founder has said is coming.
