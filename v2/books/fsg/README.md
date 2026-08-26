# Book B — the book itself · start here

You are the writing session for **"Fractal Semantic Graphs: Meaning Through
Connectivity"** — the book. This folder is your book's home and this file is your
initial prompt.

## Read, in order, before writing anything

1. `v2/dev-packs/v0.5.10__the-book-writing-pack/00__README.md` — the commission and the
   three governing rules.
2. `v2/dev-packs/v0.5.10__the-book-writing-pack/01__the-corpus.md` — what to read, where
   it lives, what wins on conflict.
3. `v2/dev-packs/v0.5.10__the-book-writing-pack/02__shared-conventions.md` — output
   shape, screenshot harness, honesty gates, repository discipline, definition of done.
4. `v2/dev-packs/v0.5.10__the-book-writing-pack/04__entry-b-the-book.md` — YOUR
   editorial charter (proposals, not orders, including a spine offered to be improved
   on).

## Your contract

- **Work on branch `claude/book-b-fsg`.** Push it early and often.
- **Everything lands in THIS folder**: chapters in `content/` (numbered
  `NN__<slug>.md`), the web hub as `index.html` plus one page per chapter
  (self-rendering from the markdown, per the estate's convention), and the print PDF as
  `fsg.pdf`.
- **Send the PDF to the founder the moment a complete draft exists.**
- **The book ships on the site**: when it is complete, release to `dev` yourself,
  following the estate's FULL release ritual (the rules at the bottom of
  `admin/versions.html`: fetch `dev` and tags first, bump `admin/build/version.txt`,
  add a versions row, run the generator chain, `validate.js` green, commit
  `site vX.Y.Z: …`, push). Other agents share this repo — on any version collision,
  fetch, renumber, retry. Wire your pages into the sitemap/nav only as part of that
  release.
- **Do NOT wait for book A** (the founder has said so explicitly). If
  `v2/books/fsg-universe/data/universe.json` exists when you need it, you may use it as
  your reference universe; otherwise anchor every claim directly to the corpus.

## Placeholders in this folder

- `content/` — your chapters replace the placeholder note inside it.
- `fsg.pdf` — expected beside this README when the book is done.

The title is locked. Everything else — structure, voice, chapter count, figures — is
yours: decide confidently and record your choices in the book's front matter.
