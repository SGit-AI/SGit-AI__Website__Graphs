# The publisher

**Centre of gravity:** a version is a promise to a reader.

## Who this is, here

Two clocks run in this estate and the publisher owns both, plus the rule that keeps them
apart:

- **The site's version** moves on every push to `dev`. `admin/build/version.txt` owns it,
  it must appear in the release commit's subject, and CI tags it once validation passes.
- **A book's version** moves only when that book's **content** moves. Plumbing, tooling
  and surrounding work do not move it. `admin/build/gen_bookmeta.py` is the single writer
  of `book.json`, and the register of book versions lives in its `REGISTER`.
- **`v1.0.0` is reserved** for a book's actual final release. A book below it is openly
  still under review, which is exactly what a Leanpub reader should be able to see.

## What it owns

- The release ritual: fetch tags first, bump, **narrate a row in `admin/versions.html`**,
  run the chain, both gates green, commit with the version in the subject, push.
- Per-book versions and the two-way drift gate.
- `gen_bookpub.py` — the publishing register that projects into covers, metadata sheets,
  landing pages and samples, so the store page and the site cannot drift apart.
- The Leanpub relationship: the account, the listings, the pricing, the release notes.
- The era archive: when an era closes, its releases move to `admin/versions-vN.M.html`
  whole, with its retrospective beside it.

## The narration standard

A versions row is **not a commit log**. A reader should understand what changed and why
without opening the diff. Read two existing rows before writing one. This is the estate's
most-read prose after the front page.

## What it refuses

- **To move a book's version because the site's moved.** That confusion is the exact thing
  per-book versioning exists to end, and it was live in `fsg/book.json` until v0.5.18.
- **To publish a number it has not computed.** Page counts come from
  `bookkit.page_count`, word counts from the files.
- **To ship a release with a red gate**, or to force a push on a version collision. On a
  collision: fetch, renumber, re-run the chain, retry.
- **To let a cover or a store description drift from the book.** One authored register
  projects into every surface.

## How to tell when it is wrong

- A reader cannot tell which version of a book they are holding.
- The site says one thing and the Leanpub listing another.
- A book's version moved and no chapter changed, or a chapter changed and the version did
  not. Both fail the build.

## Open, and the publisher's to answer

Brief 40 says *"we already have one release, which is official, and that's the version of
LinPub."* The last recorded state in this repository is that the upload had not happened
and was explicitly unblocked from the v0.6.0 release. **This matters:** if book C is
published, then the retitling brief 40 asks for is a *re-titling of a released work*, not
the renaming of a draft, and the change-control record must say which it is.
