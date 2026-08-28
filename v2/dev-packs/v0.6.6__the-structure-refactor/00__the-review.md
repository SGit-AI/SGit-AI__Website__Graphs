# The structure refactor — a review, not yet a move

**Status** PROPOSED. Nothing here has been executed.
**Asked by** brief 41: *"can you review these ideas to refactor the files and folder
structure."*
**Scope** the whole tree: 258 pages, 200 frozen files, three books, two version streams.

---

## The verdict first

**The principle is right, the publishing order is right, and the target shape is nearly
right.** One part of the proposal would file most of the estate inside a book it does not
belong to, and that is the only thing this review pushes back on.

The founder's argument for why a big move is affordable is also correct, and worth
restating because it is the reason this can be attempted at all:

> Refactoring is not just so you can catch mistakes; it's so you can make changes… you're
> comfortable making big changes because you know what will break.

This estate knows what will break. 101 tests, a 27-gate release validator, a link check
over every page, a frozen-file hash gate, and a sitemap that must agree with the tree. That
is the machinery that turns "restructure the site" from a gamble into an overhead.

## What the tree actually is

The memo proposes that `v1` becomes *Fractal Semantic Graphs* **v0.1** and `v2` becomes
**v0.2**, with *"every folder, every file, everything that we created"* inside. Measured:

| | Pages | The book | Not the book |
|---|---|---|---|
| `v1/` | 94 | 22 in `v1/book/` | **72** |
| `v2/` | 142 | 53 in `v2/books/` (all three books) | **89** |

The freeze is the sharper number. `v1/MANIFEST.json` hashes **200 files by path**, and only
**28** of them are inside `v1/book/`. **172 frozen files sit elsewhere in `v1/`**: the
vaults, the examples, the grammar pages, the twenty-one carried source documents, the first
twenty briefs.

So `v1/` is not an edition. It is *an edition plus a reference site plus a corpus plus a
brief archive*, which all happened to be true at the same moment. Same for `v2/`: one book
folder and eleven folders of working surface, history and tooling.

**`v1` and `v2` are timestamps, not types.** Filing them as book versions would preserve a
historical accident and lose the distinction the estate actually runs on — which is the
corpus's own rule, applied to its own folders: *a type is a path, not a label.*

## The proposed shape

Four zones, each holding one kind of thing. The founder's `books/` at the top level is
kept, and it becomes truthful because only books are in it.

```
books/                                  the published work
  fractal-semantic-graphs/
    v0.1/                               the first edition, frozen
    v0.2/                               the second edition, current
    book.json                           identity and changelog ACROSS versions
  making-a-book-with-agents/
    v0.1/
    book.json

corpus/                                 the evidence the books argue from
  sources/                              21 byte-frozen documents + MANIFEST
  briefs/                               41 founder memos, one sequence, verbatim
  decisions/                            the decisions register and its amendments

lab/                                    the working surface, not a book
  universe/                             the reader and the extraction
  wclm/                                 the parked transformer and its operators
  methods/  lexicon/  packs/            the registers

admin/                                  the machinery (unchanged)
  build/  tests/  versions*.html
team/                                   the seven roles (unchanged)
dev-packs/                              the plans
```

The reference site now inside `v1/` (vaults, examples, grammar, depth, maps, network,
altitudes, docs) is the honest problem: it is neither book nor corpus nor lab. It is **the
first edition's website**, and it belongs with the first edition as
`books/fractal-semantic-graphs/v0.1/site/` — which is also the only placement that keeps
the freeze coherent, because those pages were frozen together.

## What it costs

| | |
|---|---|
| Pages whose URL changes | **~236 of 258** |
| Frozen files whose path changes | **200** — every one |
| Generators needing path updates | 15 of 24 |
| Book chapters naming a moved path | unmeasured; at least the two already known stale |
| Redirects needed | none technically (few readers) but every external link dies |

Three things break in ways worth naming before anyone starts:

1. **The freeze gate breaks by design.** Gate 14 compares hashes at recorded paths, and
   *"a gate anyone can silence by re-running a generator is not a gate."* A move means
   rewriting `MANIFEST.json`, which is the exact act the gate forbids. **This needs a
   designed answer before the move**, not after: the honest one is that the manifest gains
   a `moved_from` per file, the hashes stay identical, and a new check proves every frozen
   file's content is unchanged across the move. **The content is the freeze; the path was
   only ever how we found it.**

2. **The books describe the tree.** Both books name real paths in their prose. Moving the
   tree makes those sentences false, which is a **content change to two books**, which
   moves **two book versions and the site version**. That is not an objection; it is the
   cost, and it should be paid deliberately in one release rather than discovered later.

3. **Verbatim material must not move its words.** Forty-one briefs quote paths inside
   founder memos. Those stay exactly as recorded. The memo's permission to *"change a
   little bit the history"* is taken to cover generated pages, hubs and documentation —
   **not** memos and **not** narrated release rows, both of which are evidence.

## The phasing

The move is affordable but not atomic. Four releases, each green, each shippable alone:

- **Phase 1 — the manifest learns about moves.** `moved_from`, and a gate proving frozen
  content survives a relocation byte-for-byte. Nothing moves yet. This is the release that
  makes the rest safe, and it is the one to do first whatever else is decided.
- **Phase 2 — `corpus/` and `lab/`.** Move the non-book material out of `v1/` and `v2/`.
  This is most of the pages and none of the books.
- **Phase 3 — `books/`.** The two editions of *Fractal Semantic Graphs* become v0.1 and
  v0.2 under one book folder; the making-of book moves beside it. Both books' versions
  move, with changelog entries pairing them to the site release.
- **Phase 4 — the compatibility model.** Shared technology declares which book versions it
  serves; a frozen edition that no longer renders is a failing test.

## What this review does not decide

- **Whether to do it at all.** The estate works today. The case for the move is that the
  next twelve months of book work will be cheaper, and that is a judgement about the
  future, not a measurement.
- **The names.** `corpus/` and `lab/` are placeholders chosen to be argued with.
- **The making-of book's title.** Brief 41 offers *Making a Book with Agents* as *"a
  temporary hold"*. It is close to the naming pack's candidate A and says **agents**
  rather than Claude. The naming question is still at stage 5 of 7.

## The recommendation

**Do phase 1 now, whatever else is decided.** The manifest change is small, it is useful on
its own, and without it every later phase is blocked on the same problem.

**Then decide phases 2 to 4 against the publishing order.** Brief 41 moves the making-of
book to the front of the queue. If that book ships to Leanpub soon, the window the founder
names — *"we have not actually released anything, we can literally change almost
anything"* — closes for everything the book's prose points at. **Restructure before
publishing, or accept that the structure is fixed for a while afterwards.** Those are the
two coherent orders; doing half a restructure and then publishing is the one to avoid.
