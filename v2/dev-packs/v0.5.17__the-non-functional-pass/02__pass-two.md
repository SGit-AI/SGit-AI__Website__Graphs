# Pass two — the builders and the gates (v0.5.20, DONE)

The audit's finding 6 was that the test surface stopped at the v2 core: twenty Python
generators, the book builders and `validate.js` itself all ran ungated. Pass two closes
that, and folds the three book builders into one shared kit. Everything below is done and
green; what pass two proposed and pass three now inherits is listed at the end.

## The harness had a hole, and the hole was hiding a bug

The inline test harness called each test function and caught synchronous throws. An
**async** test returns a promise, and nothing awaited it. So a failing async test printed
`ok`, was counted as a pass, and surfaced later as an unhandled rejection after the
summary had already lied. Three tests in the suite are async.

Proven before it was fixed: a deliberate failing async test in a probe file printed `ok`
and the run exited zero.

`admin/tests/harness.mjs` now records a pending promise per test and `report()` awaits
them all before printing. Fixing it immediately turned up a **real, pre-existing failure**
the broken harness had been swallowing: `normalise/anatomy.json` declared that its `setup`
and `contract` segments feed a segment called `run`, and normalise has no segment called
`run` — its run half is split into `run-setup` and `run-repair`. Two dangling edges in the
code-anatomy graph, invisible for as long as the harness was broken. The other eleven
operators were audited for the same class of error and are clean.

## One file of 84 tests became six suites and a runner

`admin/tests/run.mjs` runs every `*.test.mjs` beside it, **each in its own process**. That
is deliberate: a suite that throws while loading, exits early, or leaves a module in a bad
state can then only fail itself. The cost is one node start per suite; the gain is that a
red suite always names itself.

| Suite | What it covers | Tests |
|---|---|---|
| `reader` | segments, markup, doc tree, graph styles, commands, kinds, explore, views | 25 |
| `graph` | family peaks, slots, schema, alignment rails, path queries, node documents | 21 |
| `chat` | vault persistence and the grounding prompt | 11 |
| `coretree` | the document-to-word tree and the file explorer's views | 8 |
| `wclm` | the pinned hash, the strict pipeline, senses, operators, code anatomy | 19 |
| `build` | **new** — generators, bookkit, the books, validate.js itself | 10 |

`node admin/tests/run.mjs wclm` runs one suite, so a content agent can run only what it
touched. Gate 27 in `validate.js` now calls the runner rather than one file, and **names
the failing tests** in its error: a gate that only says "the suite failed" costs whoever
reads the CI log a second run to learn anything.

## The gate got a gate

`validate.js` is 530 lines of gate and was itself ungated. It now takes an optional tree
argument, and the new `build` suite copies the repository, **breaks one thing on purpose**
(the version agreement) and insists the right error comes back — because a gate that
silently stopped checking looks exactly like a clean release.

Two things had to be true first. Gate 27 skips the unit suites when checking a tree other
than this one, or the self-test recurses forever: validate → run.mjs → build.test.mjs →
validate. And the copy has to be the whole tree, not a hand-written list of folders, which
is what the first version of the test got wrong.

It earned its keep on its first honest run, catching that the frozen first edition had
been regenerated: `gen_book.py` is not in the release chain, and running it rewrites v1/,
which gate 14 exists to forbid.

## Three book builders became one kit

`admin/build/bookkit/` — 233 lines holding what every book build needs:

| Module | What it owns |
|---|---|
| `markdown_kit.py` | markdown to HTML with the book's own extensions, figure/promise classes, figure pairing |
| `figures.py` | JPEGs of the figures in a scratch dir outside the repo, and resolving image paths |
| `pdf.py` | driving weasyprint, and the page counter |
| `chapters.py` | the chapter record: stem, slug, title, words, and the SHA-256 the version gate reads |

The page counter existed in **five** copies — `gen_book.py`, `gen_packs.py`,
`gen_universe.py` (by import) and both book builders — each carrying the same comment
about having learnt the trick the hard way. There is now one, and a test that fails if a
sixth is written.

Each book keeps what is genuinely its own: its shape, its cover, its CSS, its page
templates. A shared builder that owned those would either grow a flag per book or force
the books to look alike, and neither is worth it. The rule for adding to the kit: **it must
already exist twice.**

### The acceptance test, and what it proved

The plan required each PDF to rebuild and be compared against the shipped one before the
old builder was deleted. Both were, page by page, on extracted text:

| Book | Shipped | On the kit | Pages differing |
|---|---|---|---|
| Fractal Semantic Graphs | 119 pages | 119 pages | 1 — the cover, which carries the build date |
| Creating a Book | 92 pages | 92 pages | 1 — the cover, which carries the build date |

## book.json had two writers, and they were fighting

Found while converting the builders, not by looking for it. `gen_bookmeta.py` (v0.5.18)
and `fsg/build.py` both wrote `v2/books/fsg/book.json`, and they disagreed about what the
keys mean:

- `version` meant *the book's version* to one and *the site's version* to the other — the
  exact confusion per-book versioning was built to end.
- `pdf` was a **filename string** to the bookshelf hub and a **dict** to the builder, so
  whichever ran last decided whether the shelf rendered a filename or `[object Object]`.
- `chapters` was a **count** to one and a **list** to the other.

Whichever generator ran last won. Fixed by giving the file one writer: the builder writes
`build.json`, and `gen_bookmeta.py` — which owns the book's version and the chapter hashes
the version gate reads — folds it in under `build`. The carry-forward loop that used to
preserve the builder's keys is gone; it only preserved stale ones forever.

## What pass three inherits

- **The module splits**: `altitudes-graph.js` (787), `decisions.js` (484),
  `altitudes.js` (409), `wclm-page.js` (342), and the recorded `uni-graph.js` debt (434).
- **Four widgets promoted to web components.**
- **A smoke test per generator that actually runs it.** The `build` suite gates the
  generators' *shape* — they compile, they explain themselves, the ones other generators
  import are safe to import — not their behaviour. Running twenty generators twice to
  prove idempotence is a minutes-long test, and it belongs behind a flag, not in the
  gate every push runs.
- **`making-a-book` still has a second builder**, `gen_pages.py` (224 lines), which emits
  its web pages. It is not duplication with the kit; it is the one book that separates
  page generation from print generation, and folding it in is a change to that book's
  own build, best made when that book is next edited.
- **Chapters 4 and 15 of `making-a-book` name `admin/tests/universe.test.mjs`**, which no
  longer exists. Deliberately not corrected here: that book is sitting finished and
  waiting for its Leanpub upload, and editing its content would move its version and
  stale the generated PDF. It goes in with that book's next content edit. The reference in
  chapter 14 of *Fractal Semantic Graphs* is dated to v0.5.11 and stays correct as the
  historical claim it is.
