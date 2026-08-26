# Shared conventions — the rules all three book sessions follow

## Output shape (identical for A, B and C)

Each book lands three ways, all from one markdown source of truth:

1. **Markdown chapters** — `v2/books/<slug>/content/NN__*.md`, one file per chapter,
   authored first. The slug is yours to choose (suggested: `fsg-universe`, `fsg`,
   `making-a-book`).
2. **Web pages** — a hub `v2/books/<slug>/index.html` plus one page per chapter,
   following the estate's convention: the page renders its own markdown client-side
   (`assets/mdreader.js` + `marked`), so presentation can never drift from source. Crib
   the page skeleton from `admin/build/gen_devpack.py`'s PAGE template; empty
   `<nav class="site">` and `<footer class="site">` shells get stamped by `chrome.py`.
3. **One print PDF** — `v2/books/<slug>/<slug>.pdf`, built with weasyprint (installed;
   `admin/build/gen_packs.py` is the working precedent for markdown → styled HTML → PDF).
   This PDF is the flight deliverable: self-contained, front matter, table of contents,
   figures embedded, readable offline start to finish.

## Figures and screenshots

- Screenshots come from real pages, taken with the repo's own harness: headless Chromium
  at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`, CDP over a UNIQUE debug port
  per script, against a local server
  (`python3 -m http.server 8902 --directory <repo>`). Working examples of the whole
  pattern are in the release notes' history; the essential rule learned the hard way:
  never reuse a debug port, and kill the chrome you spawn.
- **Time travel for book C**: the repo carries a tag per release (v0.1.0 … v0.5.9).
  `git worktree add /tmp/hist-<tag> <tag>`, serve that worktree on its own port, and
  screenshot the page as it WAS — the evolution figures do not have to be re-imagined,
  they can be re-taken. Remove worktrees when done.
- Diagrams: the estate draws its own SVG (see `assets/wclm/ioflow.js`,
  `code-anatomy.js`) and uses ascii art in markdown; both render well in print. No new
  chart libraries.

## Honesty gates (all three books)

- Anchored claims only: name the chapter, brief, page or release row behind every
  attributed position; compute or quote numbers, never recall them.
- The corpus's own caveats travel with the ideas they qualify (not a graph database
  pitch; proposed inverse names are proposals; GraphRAG/RDF positions as stated at
  `/v1/why-graphs/`).
- The briefs are VERBATIM founder records — quote them exactly, mark your reading as
  yours. Book C especially: the story's evidence is the briefs plus the release rows;
  where the two disagree, say so.
- AI authorship is disclosed in each book's front matter, in the estate's existing
  voice (see `/about/participant.html` and the memos hub for precedent).

## Repository discipline (three sessions in parallel)

- Each session works on ITS OWN branch: `claude/book-a-<suffix>`, `claude/book-b-…`,
  `claude/book-c-…`. Push the branch; NEVER push to `dev` from a book session without
  running the estate's full release ritual (version bump, versions row, generator chain,
  `validate.js` green — the rules are at the bottom of `admin/versions.html`). The
  recommended path: finish the book on the branch, push it, and hand the founder the PDF;
  integration into `dev` is a separate, single-session step afterwards.
- Do not modify anything outside `v2/books/<slug>/` except where a generator hookup is
  genuinely needed — and if you hook into the chain, the whole ritual applies.
- The PDF is also SENT to the founder directly (SendUserFile or the session's file
  surface) the moment a complete draft exists — the flight does not wait for a merge.

## Voice and quality bar

- The estate's voice: plain sentences, short words, the technical terms spelled out,
  em-dash-free prose, British-leaning but unfussy. Read two release rows and one brief
  before writing a page; match that register.
- Every chapter opens with what the reader will be able to DO or SEE differently after
  it, and closes with where the live estate demonstrates it.
- Definition of done, per book: markdown complete; web pages render their own source;
  ONE PDF, 60–120 pages, TOC, front matter with the locked title, disclosure, and the
  date; every figure captioned with its source page and version; a final self-review
  pass listing (in the book's colophon) what was cut and what remains open.
