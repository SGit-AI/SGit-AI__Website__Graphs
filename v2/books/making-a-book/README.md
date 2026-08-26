# Book C — the making-of · start here

You are the writing session for **"Creating a Book Using Fractal Semantic Graphs"** —
the true story of how the second book has been built, for authors who want to use
similar agentic workflows on their own books. This folder is your book's home and this
file is your initial prompt.

## Read, in order, before writing anything

1. `v2/dev-packs/v0.5.10__the-book-writing-pack/00__README.md` — the commission and the
   three governing rules.
2. `v2/dev-packs/v0.5.10__the-book-writing-pack/01__the-corpus.md` — what to read, where
   it lives, what wins on conflict.
3. `v2/dev-packs/v0.5.10__the-book-writing-pack/02__shared-conventions.md` — output
   shape, screenshot harness, honesty gates, repository discipline, definition of done.
4. `v2/dev-packs/v0.5.10__the-book-writing-pack/05__entry-c-the-making-of.md` — YOUR
   editorial charter (proposals, not orders), including the evidence list and the
   git-tag time-travel technique for re-taking the evolution screenshots.

## Your contract

- **Work on branch `claude/book-c-making-of`.** Push it early and often.
- **Everything lands in THIS folder**: chapters in `content/` (numbered
  `NN__<slug>.md`), your evolution figures in `figures/` (each captioned with the page
  and the git tag it was re-taken from), the web hub as `index.html` plus one page per
  chapter (self-rendering from the markdown, per the estate's convention), and the
  print PDF as `making-a-book.pdf`.
- **Send the PDF to the founder the moment a complete draft exists.**
- **The book ships on the site**: when it is complete, release to `dev` yourself,
  following the estate's FULL release ritual (the rules at the bottom of
  `admin/versions.html`: fetch `dev` and tags first, bump `admin/build/version.txt`,
  add a versions row, run the generator chain, `validate.js` green, commit
  `site vX.Y.Z: …`, push). Other agents share this repo — on any version collision,
  fetch, renumber, retry. Wire your pages into the sitemap/nav only as part of that
  release.
- **Do not wait for the other books.** Your story runs up to the version the repo is at
  when you start; say so in the front matter and stop there cleanly.

## Placeholders in this folder

- `content/` — your chapters replace the placeholder note inside it.
- `figures/` — your re-taken screenshots replace the note inside it.
- `making-a-book.pdf` — expected beside this README when the book is done.

Your audience is authors, not graph specialists. Every scene in this book must be
checkable at the tag its caption names — that is the book's own thesis applied to
itself.

---

## Delivered

**Status:** COMPLETE DRAFT, written against graphs.sgit.ai v0.5.11, 26 August 2026.

| | |
|---|---|
| The book | twelve chapters, three appendices and a colophon, ~31,000 words, in `content/` |
| The print PDF | `making-a-book.pdf` — 92 pages, A4, self-contained, figures embedded, reads offline |
| The web edition | `index.html` plus one page per chapter, each rendering its own markdown client-side |
| The figures | twenty, in `figures/`, each re-taken from the git tag its caption names |
| The builders | `build.py` (markdown → print HTML → PDF, weasyprint) and `gen_pages.py` (the web edition) |

**Rebuilding.** `python3 v2/books/making-a-book/build.py` then
`python3 v2/books/making-a-book/gen_pages.py` then `python3 admin/build/chrome.py`.
`build.py` needs `markdown` and `weasyprint` (`pip install markdown weasyprint`); the
latter is the same engine `admin/build/gen_packs.py` uses for the review packs. The
print HTML is written outside the repository, because the estate's rule is that print
sources carry no site chrome and a chrome-less page inside the tree would fail the gate.

**Two notes for whoever releases this.**

1. `v2/books/index.html` does not exist yet, so the bookshelf is not in the crumb trail of
   these pages. When the shelf gets a rendered hub, the crumbs in `gen_pages.py` should
   gain it back.
2. The eighteen new pages need sitemap entries (`gen_sitemap.py` picks them up) before
   `validate.js` will pass, and the book wants a line in `llms.txt` and one nav entry.
   None of that has been done here, because it belongs to the release rather than to the
   book.

**Figure paths.** The chapter markdown points at `figures/…`, which is relative to this
folder rather than to `content/`, because the client-side reader resolves an image against
the page that renders it and the rendered pages live here. The colophon says so too.
