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
