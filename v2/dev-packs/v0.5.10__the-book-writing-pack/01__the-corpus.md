# The corpus — what to read, where it lives, what wins on conflict

Everything below is readable from this repository or fetchable at a stable URL. Read in
the order given: each layer assumes the one before it. Budget your context — the SKIM
markers say what to read fully versus sample.

## 1 · The first book (READ FULLY — it is the argument's foundation)

- `v1/content/*.md` — the 17 chapter sources, markdown, the source of truth. The rendered
  book is at `/v1/book/` (single-page: `/v1/book/single.html`).
- The section hubs distil the same argument at three altitudes: `/v1/start/`,
  `/v1/grammar/` (+ `edge-set.html` — the fifteen edges and their inverses),
  `/v1/depth/`, `/v1/why-graphs/`, `/v1/glossary/`.
- One-fetch alternative: `llms-full.txt` at the site root concatenates the agent surface
  plus the project documents.
- The honesty positions live at `/v1/shipped/` and in `llms.txt` — carry them verbatim:
  not a graph database pitch; no RDF/SPARQL/Cypher in the code; properties carry data,
  never meaning; nine of the inverse names are proposals, marked as such.

## 2 · The referenced documents (SKIM ALL, READ the ones your book leans on)

- `v1/briefs/*.md` — 22 files: the documents the first book was projected from, each at
  the stable constructed URL `graphs.sgit.ai/v1/briefs/<filename>.md`.
- `/v1/docs/` — the 22 carried source pages with per-document concept graphs and
  influence measures.
- `/v2/universe/` — the second edition's corpus list (21 sources named; one extracted so
  far, and that one deeply).

## 3 · The fractal examples (READ the vault pages; FETCH the two external indexes)

- In this repo: `/v1/vaults/` — VoiceDebrief (the junction rule, the empty layer),
  Regulation Graph (provenance chain, query engines, RDF/Turtle export), Risk Mandate,
  Agentic Browser Isolation (the acceptance mechanism), Risk Graph Explorer, and the
  capability scale. `/v1/examples/` — worked graphs with real numbers (browser isolation,
  the 2FA graph, Article 26(5), Wardley maps).
- External, fetch live before writing: `https://sgit.ai/demos/vaults/index.html` (the
  vault demos added beside this repo's) and `https://sgit.ai/network/index.html` (the
  *.sgit.ai sites built in other sessions — the network the books sit inside). Treat both
  as primary sources for WHAT EXISTS; describe only what the fetched pages actually show.

## 4 · The second book's working surface (THE MOST IMPORTANT LAYER — practices in action)

Read in this order:

- **The pilot document end to end**: `/v2/universe/thinking-in-graphs.html` (the
  instrument reader), `v2/universe/docs/thinking-in-graphs/` (the folder: `source.md`
  frozen byte-exact, `extraction.json`, `crossrefs.json`, `ids.json` — the identity
  ledger), `v2/universe/data/core/thinking-in-graphs/` (the core graph: document →
  section → block → sentence → word, `tokens.json`), and the two explorers
  (`thinking-in-graphs.files.html`, `.graph.html`).
- **The WCLM**: `/v2/wclm/` (the deterministic transformer), `v2/wclm/data/world.json`
  (the compiled world and its stated weight formulas), the registers
  (`v2/wclm/senses.json`, `v2/wclm/analogies.json`, `v2/wclm/packs/`), and
  `/v2/wclm/operators/` — twelve engines, each a folder with code, schema, provenance-
  marked data, examples, anatomy and workbench.
- **The briefs**: `v2/briefs/20*.md` through `37*.md` — every founder memo verbatim with
  the agent's numbered reading. These are the raw material of book C and the intent
  record for books A and B.
- **The registers and retrospective**: `/v2/methods/` (35+ techniques), `/v2/lexicon/`,
  `/v2/artefacts/`, `/v2/dev-pack/` (the second-book plan and the working packs), and
  `v2/dev-packs/v0.5.0__the-v04-retrospective/00__the-v04-retrospective.md` — book C
  expands this document.
- **The release history**: `admin/versions.html` (v0.5.x, narrated), and
  `admin/versions-v0.4.html` (41 rows) — each row is a first-hand account of a build
  round; book C's chronology lives here. `admin/versions-earlier.html` covers the
  beginnings.

## 5 · Precedence on conflict

1. The raw markdown sources and json data beat the rendered pages.
2. The corpus's stated positions beat any paraphrase — quote them.
3. The release history beats memory for WHAT HAPPENED and WHEN.
4. Live fetches of the two external sgit.ai indexes beat any description of them here.
5. Where the corpus is silent, say so — the gaps are worth mapping too.
