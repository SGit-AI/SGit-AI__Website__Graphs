# Entry C — the making-of

## The entry prompt (paste this into a fresh session on this repository)

> The one-line form now works too: this book's home folder is `v2/books/making-a-book/`,
> and its README carries this same prompt — "hi, you are going to focus on writing this
> book: `v2/books/making-a-book/README.md`".

> You are writing book C of a three-book commission. Read, in order:
> `v2/dev-packs/v0.5.10__the-book-writing-pack/00__README.md`, `01__the-corpus.md`,
> `02__shared-conventions.md`, and then this file, `05__entry-c-the-making-of.md`, in
> full. Then write **"Creating a Book Using Fractal Semantic Graphs"** — the true story
> of how the second book has been built so far, for authors who want to use similar
> agentic workflows on their own books. Work on branch `claude/book-c-making-of`,
> deliver markdown + web pages + one print PDF under `v2/books/making-a-book/` (slug
> yours to change), and send the PDF the moment a complete draft exists.

## What this book is

An expansion of the v0.4 retrospective into a full book, carried through the v0.5 era.
The audience is other AUTHORS — people with a book in them and an AI agent at hand — not
graph specialists. The promise: here is a working loop for writing a book with agents,
demonstrated end to end on a real one, failures included. Every claim in this book is
checkable in the repository it describes, which is the loop's whole point.

## The evidence (all first-hand, all in the repo)

- `admin/versions-v0.4.html` (41 narrated releases) and `admin/versions.html` (the v0.5
  era) — the chronology, round by round.
- `v2/briefs/20*.md`–`38*.md` — the founder's voice memos and typed notes VERBATIM, each
  with the agent's numbered reading: the commissioning records.
- `v2/dev-packs/v0.5.0__the-v04-retrospective/00__the-v04-retrospective.md` — the seed
  this book expands.
- The working packs under `v2/dev-packs/` — including the two-agent exchange
  (`v0.4.21__brief-to-the-chat-agent`) where two Claude sessions negotiated an API over
  four written notes.
- The methods register (`/v2/methods/`), the immediate-connection register (Victor
  patterns), and the gates (`admin/tests/universe.test.mjs`, `admin/build/validate.js`).

## Editorial charter (proposals, not orders)

- **Tell it as a story with a system underneath.** A possible spine: (i) the loop —
  voice memo → brief verbatim → build → ship → narrated review, same day, every day;
  (ii) briefs as the contract — why verbatim memos plus a numbered reading beat
  paraphrase; (iii) gates buy speed — the test suite, validate, byte-identical rebuilds,
  CI tag-and-deploy, and why honesty in release notes compounds; (iv) two agents, one
  repo — the collision discipline that let a reader agent and a chat agent share dev;
  (v) the experiments — universe reader, core graph, identity ledger, WCLM, operators:
  each as a PoC-to-product story; (vi) the failures, lovingly — the zombie Chromium that
  burned an hour, the scrolled-wires bug the founder caught live on an iPad, the
  duplicated withdrawal, the fixture errors that were the agent's own; (vii) the
  founder's craft — what the memos show about steering an agent (small findings,
  concrete screenshots, "does it make sense, any questions?"); (viii) the playbook — a
  distilled, transferable checklist for an author starting Monday, with the honest
  costs.
- **Screenshots of the evolution, re-taken from history**: the repo has a tag per
  release. `git worktree add /tmp/hist-<tag> <tag>`, serve that worktree, screenshot the
  page AS IT WAS with the CDP harness (unique debug port; kill your chrome). A figure
  series — the same page at v0.4.8, v0.4.16, v0.4.31, v0.5.3, v0.5.9 — is worth a
  chapter of prose.
- **Numbers computed, not remembered**: releases per day, briefs per week, tests over
  time (`git show <tag>:admin/tests/universe.test.mjs | grep -c "^test("`), lines moved
  in the operator split — small scripts over git history, cited in the text.
- **The reader leaves with artifacts**: the playbook chapter should stand alone —
  reprintable as a checklist — and an appendix should carry one complete brief
  (verbatim, with permission already given by its publication) annotated line by line.

## What done looks like, beyond the shared bar

An author who has never used an agent finishes the PDF knowing exactly what to set up
(a repo, a release ritual, gates, a briefs folder), what to say in their first memo, and
what failure modes to expect — and can verify any scene in the book by opening the repo
at the tag the caption names.
