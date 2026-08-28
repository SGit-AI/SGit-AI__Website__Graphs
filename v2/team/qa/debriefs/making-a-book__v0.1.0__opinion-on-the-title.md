# Opinion: the title, from QA

**Asked** whether the rename can be verified.
**Position** support any candidate. Two gates are missing and one of them is the reason
this question is hard.

## What the build will catch

- The title lives inside `content/00__front-matter.md` and `16__colophon.md`, so changing
  it moves the chapter hashes, and `gen_bookmeta.py` **fails the build** unless the book's
  version moves with it. The two-way drift gate does its job here without changes.
- The rebuilt PDF should be compared page by page against the current one. A title change
  should move **one or two pages**, not ninety. That comparison is already the publisher's
  workflow step 3.

## What the build will not catch, and should

1. **A title claimed in one place and not another.** `gen_bookpub.py`, `build.py`,
   `gen_bookmeta.REGISTER` and the book's own front matter each carry the title as a
   string. Nothing checks they agree. **This is a one-line gate and it should exist before
   the rename, not after** — otherwise the rename is exactly the change most likely to
   leave one of the four behind.
2. **Prose that has gone stale.** The known hole. Two live examples surfaced by this
   question alone: the colophon says *"the second book is not written"* (false since
   v0.5.11) and two chapters name a test file deleted at v0.5.20. Both passed every check
   in the estate. A title change is a good moment to notice that **the book's own claims
   about the repository are unverified**, and some of them are checkable: a file path in
   backticks either exists or it does not.

## Recommendation

Ship the rename with **gate 1** written first. **Gate 2** — file paths named in book prose
must exist — is a genuine first step into the freshness problem, small enough to write in
an afternoon, and would have caught the `universe.test.mjs` staleness the day it happened.
