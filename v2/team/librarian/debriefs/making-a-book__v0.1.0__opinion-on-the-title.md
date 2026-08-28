# Opinion: the title, from the librarian

**Asked** what a rename touches across the registers.
**Position** no preference between candidates. One requirement, and one warning.

## The requirement: the old title must not vanish

Supersede, never delete. The book has been built, versioned and referenced under
*Creating a Book Using Fractal Semantic Graphs* since v0.5.12, and that name appears in:

- `admin/versions.html` and the archived `versions-v0.5.html` — **frozen narration**, which
  must not be edited; those rows describe what was true when they were written;
- `llms.txt`, the nav, the bookshelf, the front page — **generated**, and will follow;
- brief 38 (which commissioned it) and brief 40 (which challenges it) — **verbatim**, and
  must not be touched;
- the FSG book's own chapters, where it is named as a companion volume.

So the rename produces a **superseded name**, and the register must say so: the book was
called X from v0.5.12 to v0.6.x and is called Y after. That belongs in `book.json` as a
`former_titles` entry, and it is one line of `gen_bookmeta.py`.

## The warning: two chapters already name a file that no longer exists

Independent of the title, and outstanding since v0.5.20: chapters 4 and 15 name
`admin/tests/universe.test.mjs`, which was split into six suites and a runner. If the
writer opens this book for a title change, **fix that in the same pass** — it is the same
cost once the book is open and a second version move if it waits.

## No opinion on which name

Not this role's call. The only naming rule the librarian enforces here is that the folder
slug and the title are separate things, and the publisher is right that the slug should not
move.
