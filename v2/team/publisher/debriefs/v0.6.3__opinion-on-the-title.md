# Opinion: the title, from the publisher

**Asked** which candidate survives contact with a store page.
**Position** support **A**, with one correction to how the change is recorded.

## The change is cheaper than it looks, and the window is now

Confirmed with the founder: **the Leanpub upload has not happened.** So this is renaming a
**draft**, not re-titling a released work. Nothing to migrate, no reader holding a copy
with the old name, no store URL to redirect. Every day the upload waits, this stays free;
the day after it, it stops being free.

## What a rename costs here, precisely

| Surface | Cost |
|---|---|
| `gen_bookmeta.REGISTER` | one string |
| `gen_bookpub.REGISTER` | title, hook, description |
| The cover SVG and its 1600x2400 render | regenerate |
| The book's own `build.py` (`TITLE`, `SUBTITLE`) | two strings |
| `content/00__front-matter.md` and `16__colophon.md` | **content change** |
| The folder slug `making-a-book/` | see below |

The fifth line is the one that matters: the title appears **inside** the front matter and
the colophon, so a rename is unavoidably a content change. **The book's version must move**
— v0.1.0 to v0.2.0, since a title is not a patch — and the PDF and cover rebuild.

## Do not rename the folder

`v2/books/making-a-book/` should stay. It is a slug, not a title; it is already correct as
a description; and it appears in the chapter hashes' paths, the sitemap, `llms.txt`, the
nav, the in-folder entry prompt, and every figure path in the book. Renaming it buys
nothing a reader can see and costs a link-integrity sweep. **A title is not a filename.**

## Against C, from this seat

**C** commits the estate to a content pass before the book can ship honestly. That is fine
as a plan and bad as a release: it means the pair does not go to Leanpub until the writer
has finished, and brief 39 wanted the books out. If the founder wants **C**'s argument,
the cheapest honest path is **ship under A now, revise toward C for the next edition** —
which is exactly what per-book versioning is for.

## On naming Claude on the cover

Against, weakly. A tool name on a cover dates the book to a model generation, and this
estate's own convention is to name a tool where it is load-bearing. The map found four
uses in 31,221 words. If the founder wants it, it belongs in the **subtitle**, where it can
be changed in a later version without changing what the book is called.
