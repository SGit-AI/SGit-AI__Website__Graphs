# Working in this repository

This file is the contributor contract for agent sessions. Several agents work here at
once — at the time of writing, five have — and more are coming to work on CONTENT rather
than on code. Read this before touching anything. `README.md` describes the layout; this
file describes the behaviour expected of you.

## The one-paragraph orientation

This repository is a website (`graphs.sgit.ai`), three books, and the machinery that keeps
both honest. Markdown is the source of truth for every document; rendered pages fetch and
render their own markdown, so presentation cannot drift from source. Anything under `v1/`
is frozen. Every push to `dev` is a narrated, tagged, deployed release.

## The release ritual — every push to `dev`

Follow all of it, in order. Skipping a step breaks the estate for everyone else.

1. **`git fetch origin dev --tags` FIRST.** Other agents ship while you work. Never choose a
   version number without fetching.
2. `printf 'vX.Y.Z' > admin/build/version.txt` — the next patch, or a deliberate `.0` minor.
3. Add a row to `admin/versions.html` saying, in substance, what changed and why. Not a
   commit log: a reader should understand the change without opening the diff.
4. Run the generator chain (see `README.md`), ending with `chrome.py`.
5. `node admin/tests/run.mjs` and `node admin/build/validate.js` — both green.
6. Commit with the version in the subject, in **exactly** this form:
   `site vX.Y.Z: what changed` — the colon comes straight after the version, because CI
   parses it and refuses a release whose `version.txt` disagrees. **A book's version goes
   in the BODY, never the subject.** A subject reading `site v0.6.9 / making-a-book
   v0.2.0: …` cost a failed release and a hand-made tag; a test now checks the form.
7. Push your branch, then push to `dev`. CI validates, tags and deploys.

**On a version collision** (someone else took your number): fetch, renumber, re-run the
chain, retry. Never force. **On a conflict in a generated file**: take theirs and
regenerate — never hand-merge a generated file.

## Branch discipline

Work on your own branch (`claude/<what-you-are-doing>-<suffix>`). Push it early and often.
Only push to `dev` as part of a complete release. Do not rewrite history on a branch
another agent may have checked out.

## The team

`v2/team/` holds seven roles, one folder each (brief 40): librarian, researcher, writer,
editor, developer, QA, publisher. Each has a `role.md` with four sections — Identity (core
mission, **central claim**, **not responsible for**), Foundation (the principles, each with
the reason it exists here), Primary Responsibilities, and numbered Core Workflows; an
`actions/` folder, each action naming its done test; and `briefs/` and `debriefs/` as its
work environment, with outputs stamped `vX.Y.Z__<slug>.md`.

That shape is inherited from `the-cyber-boardroom/SGraph-AI__App__Send`, which brief 40
names as the reference. Do not reinvent it; if a convention is missing here, look there
first.

If you are working as one of these roles, **read that `role.md` first** — it is the
definition, and the rendered page is only presentation. Two rules the gate enforces: every
role names what it REFUSES, and no role may read the way it would in any other repository.
A generic role definition has failed the brief that asked for it, and the gate was run red
against a deliberately generic definition before being trusted.

## Building a book

Each book under `v2/books/<slug>/` owns its shape, its cover and its CSS in its own
`build.py`. What every book build shares — markdown rendering, print figures, weasyprint,
counting the pages that came out — lives in `admin/build/bookkit/`. Import it; do not
copy it. The rule for adding to the kit: it must already exist twice.

`book.json` has exactly ONE writer, `admin/build/gen_bookmeta.py`, which owns each book's
own version and the chapter hashes the version gate reads. A book's builder writes
`build.json` and gen_bookmeta folds it in.

## Three version streams, and naming that says which

There is the **site's** version, which moves on every push, and one version **per book**,
which moves only when that book's content moves. They are independent of each other, and
`v1.0.0` is reserved for a book's final release.

**A change to a book therefore moves TWO versions**, and both must be recorded:

- the **book's** version, in `gen_bookmeta.REGISTER`;
- the **site's** version, in `admin/build/version.txt` and a narrated row, as for any push.

The pair identifies the change: *this went into v0.1.15 of the book, which shipped in
v0.6.7 of the repo.* That pairing lives in each book's **`changelog`**, authored in
`gen_bookmeta.REGISTER` alongside the version. It is authored and not derived, because a
version move is a decision: an earlier generator appended to a derived list on every run,
and a sixty-second experiment left behind an entry for a version the book was never at.

The build refuses a book whose last changelog entry is not its current version, and refuses
a changelog naming a site release that does not exist in `admin/versions*.html`.

So **a file or folder name carrying a version must say which stream it belongs to**:

| The work is about | The name | Example |
|---|---|---|
| the site | `vX.Y.Z__<slug>` | `v0.5.17__the-non-functional-pass` |
| a book | `<book-slug>__vX.Y.Z__<slug>` | `making-a-book__v0.1.0__the-naming-question` |

A book stamp carries **that book's** version, which is the version the work reviewed. This
is enforced: a book-stamped artefact must name a real book at a version that book has
actually been at (its current one or one in `former_versions`), and a pack declaring a
`book` in `gen_devpack` must agree with its folder name. Book-scoped pages state the book
and its version on every rendered surface, so a reader never has to guess.

The rule exists because it was broken: the first change-control pack was named
`v0.6.3__the-naming-question` — the site's version — for work reviewing a book at v0.1.0,
a version that book has never had.

## Code guidelines

- **Pure core, then components, then shell.** Logic that can be tested without a browser
  lives in a `core/` module with no DOM access, and is tested in the suite for its area
  (`admin/tests/<area>.test.mjs`; `run.mjs <area>` runs just that one). Components own
  their element. Shells wire them together.
- **Size**: parts ≤200 lines, sections ≤250. Over that, split — or record the deviation in
  the module header and in the release note. Unstated debt is the thing to avoid, not debt.
- **Every module carries a `@module` header** stating its single responsibility in one or
  two sentences. All 40 hand-written modules have one; keep it that way.
- `'use strict'`, no bundler, no build step for client code, no new dependencies without a
  stated reason. Vendored libraries live in `assets/vendor/`.

## Content conventions

- **Founder memos are reproduced VERBATIM** in `v2/briefs/NN__*.md`, transcription
  artefacts included, with the agent's numbered reading marked clearly as the agent's.
  Never paraphrase a memo into a brief.
- **Anchored claims only.** Quotes name their source; numbers are computed or quoted, never
  remembered; screenshots are taken from real pages, never described from imagination.
- **The corpus's own caveats travel with its ideas** — above all "not a graph database
  pitch", and that nine of the edge inverses are this site's proposals rather than quotes.
- **Prose style**: plain sentences, short words, no em-dashes in authored prose (verbatim
  quotes excepted), British-leaning but unfussy. Read two release rows before writing.

## Tool work and content work are different jobs

The estate is starting to distinguish them, and you should say which you are doing:

- **Tool work** changes `assets/`, `admin/build/`, generators, gates. It moves the SITE
  version and never moves a book's version.
- **Content work** changes a book's markdown or a document's source. It moves that BOOK's
  version (`v2/books/<slug>/book.json`) as well as the site's.
- **Evidence work** adds anchors, figures, extractions and registers. It moves neither
  unless it changes what a book says.

## The browser harness, and the lesson that cost an hour

Screenshots and browser checks use headless Chromium at
`/opt/pw-browsers/chromium-1194/chrome-linux/chrome`, driven over CDP, against a local
server (`python3 -m http.server 8902 --directory <repo>`).

**Use a unique debug port per script, and kill the Chromium you spawn.** A crashed script
leaves a Chromium holding its port; the next run on that port silently drives the zombie's
page with stale cached modules, and a working feature looks broken deterministically. That
happened at v0.4.37 and cost about an hour. The fix was `kill`, not code.

For historical screenshots: `git worktree add /tmp/hist-<tag> <tag>`, serve that worktree
on its own port, photograph the page as it was, remove the worktree.

## What is parked

The WCLM and its twelve operators (`v2/wclm/`) are **parked** as of brief 39 — a working
experiment waiting for a better target, not abandoned work. Do not extend them without an
explicit instruction; do not delete them either.

## Where to look when you need context

| You want | Read |
|---|---|
| Why something is the way it is | `v2/briefs/` — 39 memos, verbatim, newest highest |
| What happened and when | `admin/versions.html` (v0.5), `versions-v0.4.html` (41 rows) |
| The techniques in use | `/v2/methods/` — 35+ named techniques |
| A plan an agent was given | `v2/dev-packs/` |
| The rules for versions | `admin/versions.html#rules` |
| The interaction principles | `v2/dev-packs/design__immediate-connection/` |
