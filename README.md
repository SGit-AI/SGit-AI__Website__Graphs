# graphs.sgit.ai — meaning through connectivity

A node carries no inherent meaning. What a thing *is* emerges from the edges traceable from
it, and confidence in that meaning is proportional to how richly it is connected. Properties
are "just words"; connections are meaning.

**Not a graph database pitch.** The claim is that one grammar is the interface at every
boundary — not that things are stored in a graph. There is no graph database anywhere in the
work behind this site, and the site says so on its own page (`/v1/shipped/`).

Live site: https://graphs.sgit.ai — static HTML on GitHub Pages, deployed from `dev`.

## What is here

Three books, a working surface that produced two of them, and the machinery that keeps
every page honest about the markdown behind it.

| | |
|---|---|
| **The books** | `v2/books/` — three, each with its markdown, its web edition and one print PDF |
| **The first edition** | `v1/` — frozen at v0.3.26: the chapters, the sources, the vaults, the examples |
| **The second edition's surface** | `v2/universe/`, `v2/wclm/` — the document universe and the deterministic transformer |
| **The record** | `v2/briefs/` (39 founder memos, verbatim), `admin/versions*.html` (every release, narrated) |
| **The build** | `admin/build/` — 20 generators, the validator, the test suite |

## The layout

```
admin/          the build: generators, validator, tests, release history
  build/        gen_*.py (the chain), chrome.py (nav/footer), validate.js (the gate)
    bookkit/    what every book build shares: markdown, print figures, weasyprint
  tests/        run.mjs (the runner) + <area>.test.mjs — 94 tests, six suites
  versions.html + versions-v0.4.html + versions-earlier.html — every release, narrated
assets/         all client-side code and styling (no build step, no bundler)
  universe/     the document reader: core/ (pure, tested), components/ (custom elements)
  wclm/         the deterministic transformer: engine, renderers, workbench shells
  universe-chat/ the chat agent's panel
book/           the first edition's reading modes and version-diff data
decisions/      the open decisions register
v1/             THE FIRST EDITION, FROZEN — start/, grammar/, depth/, why-graphs/,
                examples/, maps/, vaults/, docs/, briefs/, content/ (chapter markdown),
                book/ (three reading modes + print PDFs)
v2/             the second edition and everything since
  books/        fsg/ · fsg-universe/ · making-a-book/ — a folder per book
  briefs/       the founder's memos, verbatim, with the agent's numbered reading
  dev-packs/    the plans and working packs agents exchange
  universe/     the document universe: per-document folders, the core graph, the reader
  wclm/         the words content language model and its twelve operator folders
  memos/ methods/ lexicon/ artefacts/ packs/ dev-pack/   the rendered registers
```

Note the v1/v2 split: **anything under `v1/` is frozen** and changes only to fix a factual
error. Everything else is live.

## The rules that hold it together

1. **Markdown is the source of truth.** Every rendered document fetches and renders its own
   markdown client-side (`assets/mdreader.js`), so a page cannot silently drift from the
   file it claims to render. `validate.js` fails the build if one does.
2. **Every release is narrated.** A push to `dev` is a release: bump `admin/build/version.txt`,
   add a row to `admin/versions.html` saying what changed in substance, put the version in
   the commit subject (`site vX.Y.Z: …`). CI validates, tags and deploys.
3. **Claims are anchored.** A quote names its source; a number is computed, not remembered.
   The generators enforce this where they can (byte-identical rebuilds, anchor verification,
   drift gates).
4. **Gates before speed.** `node admin/tests/run.mjs` and `node admin/build/validate.js`
   are green before anything is pushed. (validate.js runs the suites too, so the second
   covers the first; run them separately when you want the failing test named.)

## Building

```bash
python3 admin/build/gen_coregraph.py     # the core graph: document -> word
python3 admin/build/gen_wclm.py          # the WCLM world + the operator folders
python3 admin/build/gen_universe.py      # the document universe
python3 admin/build/gen_memos.py         # the briefs, rendered
python3 admin/build/gen_team.py          # the agentic team, one folder per role
python3 admin/build/gen_devpack.py       # the dev packs, rendered
python3 admin/build/gen_changes.py       # the version diff data (needs tags fetched)
python3 admin/build/gen_sitemap.py
python3 admin/build/gen_llms_full.py
python3 admin/build/chrome.py            # stamps nav, footer and the version badge
node admin/tests/run.mjs                 # the unit gate (add a name to run one suite)
node admin/build/validate.js             # the site gate
```

`admin/index.html` documents the pipeline in full, and `admin/versions.html#rules`
documents how a version is decided.

## Working here as an agent

Read `CLAUDE.md` first. It carries the release ritual, the discipline for several agents
sharing this repository, the code guidelines, and the conventions that are not obvious from
the tree.

## Licence

Content is CC BY 4.0; see `LICENSES.md`. The raw markdown under `v1/briefs/` and `v2/briefs/`
is the source of truth and carries the same licence.
