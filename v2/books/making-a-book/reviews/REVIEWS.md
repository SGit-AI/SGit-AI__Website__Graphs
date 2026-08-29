# Reviews of this book — the micro-format

A **review** is one reading of the book at one version, by one reader, with its items
recorded so that each can be answered, disagreed with, or left open in public. It is
not a change-control pack: a pack asks *should we change this?*, a review reports
*here is what I found when I read it.*

```
v2/books/making-a-book/reviews/
  rNNN__<slug>.md      one reading
```

## The file

Front matter, then the reading. The build refuses a file that does not hold to it.

```markdown
---
review: r001
book_version: v0.1.0        # the version that was READ
reviewed: 2026-08-28
reviewer: the founder
source: v2/briefs/44__...md # where the reading is published verbatim
state: actioned             # open | actioned | superseded
---

# r001 — a one-line summary of what the reading found

Any preamble.

## Item 1 — one line naming the finding
**State:** actioned
**Outcome:** what happened, or what is still open.

The item itself.
```

`review`, `book_version`, `reviewed`, `reviewer` and `state` are required. An item is
an `## Item N — …` heading carrying a `**State:**` line; `open`, `actioned`, `declined`
and `superseded` are the four an item may be in.

## The rules

**A review names the version it read, not the version it produced.** The reading that
retitled the book read **v0.1.0**; the retitle shipped as v0.2.0. Stamping it v0.2.0
would claim the reader saw a book that did not exist yet.

**The reading is quoted, never paraphrased.** If it came from a founder memo, the memo
stays the source of truth and the review cites it. The estate's rule for briefs applies
unchanged.

**An item may stay open forever, visibly.** A review with every item closed is either a
very good book or a review that stopped asking. Open items are the useful half.

**A review is never edited to match what happened.** If a later reading supersedes it,
the earlier one is marked `superseded` and left where it is.

## Where the reviews are read

[The review page](../reviews.html) renders every review with its items and their states,
and [the version diff](../changes.html) shows what actually changed between two versions
of the book, so a reading and its consequence can be read side by side.
