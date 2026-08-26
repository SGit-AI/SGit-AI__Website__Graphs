# Book A — the Universe volume · start here

You are the writing session for **the Universe volume of "Fractal Semantic Graphs:
Meaning Through Connectivity"**: the concept graph of this estate's whole corpus,
presented as a readable atlas. This folder is your book's home and this file is your
initial prompt.

## Read, in order, before writing anything

1. `v2/dev-packs/v0.5.10__the-book-writing-pack/00__README.md` — the commission and the
   three governing rules.
2. `v2/dev-packs/v0.5.10__the-book-writing-pack/01__the-corpus.md` — what to read, where
   it lives, what wins on conflict.
3. `v2/dev-packs/v0.5.10__the-book-writing-pack/02__shared-conventions.md` — output
   shape, screenshot harness, honesty gates, repository discipline, definition of done.
4. `v2/dev-packs/v0.5.10__the-book-writing-pack/03__entry-a-the-universe.md` — YOUR
   editorial charter (proposals, not orders).

## Your contract

- **Work on branch `claude/book-a-universe`.** Push it early and often.
- **Everything lands in THIS folder**: chapters in `content/` (numbered
  `NN__<slug>.md`), the machine twin in `data/universe.json`, the web hub as
  `index.html` plus one page per chapter (self-rendering from the markdown, per the
  estate's convention), and the print PDF as `fsg-universe.pdf`.
- **Send the PDF to the founder the moment a complete draft exists** — the flight does
  not wait for anything else.
- **The book ships on the site**: when it is complete, release to `dev` yourself,
  following the estate's FULL release ritual (the rules at the bottom of
  `admin/versions.html`: fetch `dev` and tags first, bump `admin/build/version.txt`,
  add a versions row, run the generator chain, `validate.js` green, commit
  `site vX.Y.Z: …`, push). Other agents share this repo — on any version collision,
  fetch, renumber, retry. Wire your pages into the sitemap/nav only as part of that
  release.
- **Do not wait for the other books.** Books B and C run in parallel sessions; anchor
  to the corpus directly.

## Placeholders in this folder

- `content/` — your chapters replace the placeholder note inside it.
- `data/` — your `universe.json` (the pilot extraction's shape) replaces the note.
- `fsg-universe.pdf` — expected beside this README when the book is done.

The title is locked. The structure, voice and selection are yours — decide confidently
and record your choices in the book's front matter.
