# The universe: how a raw document becomes a local graph

This directory is **layer 1 of the second edition's universe**: one local graph per carried
source document, built bottom up, every node anchored to the exact frozen bytes that carry it.
Nothing here is book text. This is the reference material the book's own graph (layer 3) will
connect to as evidence, per [founder memo 20](../briefs/20__founder-memo__the-universe-first.md):
*the universe precedes the plot, and the plot precedes the levels.*

One document has been through the pipeline so far — the pilot,
[thinking-in-graphs](docs/thinking-in-graphs/) — and this file documents the method it settled,
so the remaining twenty carried sources can get the same treatment.

## The layer model

Agreed with the founder, 23 August 2026:

| Layer | What it is | Where | State |
|---|---|---|---|
| 0 | the frozen bytes | `v1/docs/sources/`, hashed in `v1/MANIFEST.json`, held by gate 14 | frozen at v0.3.26 |
| 1 | per-document local graphs | this directory, one folder per document under `docs/` | pilot done, 1 of 21 |
| 2 | the bridge layer: cross-document edges, authored with a note | — | not started |
| 3 | the book's universe: the six node families of the dev pack's ADR-3 | — | not started |

Every layer 1 node is a record of the form *"this document says X, at this anchor."* Whether X
is true is **not evaluated here**; that judgement belongs to layer 3. Each document keeps its
own vocabulary; where documents name the same idea differently, or disagree, layer 2 will record
that as an authored bridge — divergence is preserved as a finding, never merged away.

## The pipeline, from raw document to published graph

The generator is `admin/build/gen_universe.py`. The steps, in the order the pilot runs them:

### 1 · The source is already frozen

The raw document lives at `v1/docs/sources/<slug>.md`, byte-frozen when the first edition froze
at v0.3.26, its SHA-256 recorded in `v1/MANIFEST.json` and held by gate 14. This is what makes
everything downstream possible: **an anchor into a frozen file is stable forever.**

### 2 · The document gets a standalone folder

`docs/<slug>/` is the document's home in this estate, portable between repositories without
losing anything:

| File | What it is |
|---|---|
| `source.md` | a byte copy of the frozen source, verified on every build against the recorded SHA-256, so the folder stands alone and the copy cannot drift |
| `extraction.json` | the local graph itself — the single authored artefact (see step 3) |
| `crossrefs.json` | where the document is used across the estate, each use rated against the usage maturity model (see step 6) |
| `README.md` | what the folder is, for a reader who finds it outside this repository |
| `index.html` | the folder, browsable (generated — not a source of truth) |

### 3 · The extraction is authored, as one file

`extraction.json` is the agent's reading of the document, marked as such, and it is the **only**
authored artefact per document. It holds:

- **`doc`** — slug, title, source path, the SHA-256 the anchors were verified against, the
  document's date, the extraction date, and the extractor.
- **`nodes`** — every node carries a family, a label, a one-line `statement` in the extractor's
  words, and an anchor (step 4). The families at this layer:
  - `concept` — a term the document uses, with `defined: true|false`. An undefined-but-used
    term is recorded, not skipped: **a named absence is worth more than a hidden one.**
  - `claim` — with its `support` state, which is the document's *own* evidence state, not a
    truth judgement: `demonstrated` (backed by a worked example in the text), `argued`
    (reasoning given), `declared` (stated without support). Claims point at the concepts they
    are `about`.
  - `hypothesis` — what the document expects to test later.
  - `objective` — what a passage is trying to achieve for its reader.
  - `example` — the document's own worked demonstrations, with what each `demonstrates`.
- **`edges`** — concept-to-concept relations **the document itself asserts**, each with a verb
  from the declared vocabulary (every verb has a registered inverse; the generic association
  edge stays banned), each anchored to the sentence that asserts it.
- **`aliases`** — the thesaurus: X is also called Y, anchored.
- **`near_but_not`** — the distinctions the document draws on purpose: X is *not* Y, anchored.
- **`empty_sections`** — every prose-bearing section that deliberately yields nothing, with the
  reason why (see step 5).

These layer 1 families are the raw-material counterpart of the book's six families in ADR-3
(unit, concept, claim, objective, plus the candidates): a layer 1 claim records what a
*document* says; a layer 3 claim will be what the *book* says, connected down to records like
these as evidence.

### 4 · Every item is anchored, and the build refuses a bad anchor

An anchor names a **section** (a heading in the source) and a **verbatim quote**, plus an
`occurrence` index when the quote appears more than once in that section. At build time,
`gen_universe.py`:

1. hashes the source and refuses to build if it no longer matches the recorded SHA-256;
2. verifies the folder's `source.md` is byte-identical to the frozen original;
3. finds the quote **verbatim inside its named section** — a quote that is not there, an
   unknown section, or an ambiguous quote with no occurrence index each fail the build;
4. resolves the anchor to exact byte offsets (`chars`) into the frozen file, which is what the
   reader's highlights and gate 23 both run on.

**An extraction that cites words that are not there cannot ship.** A hallucinated quote fails
the build; a misread of a real quote is what review is for — the two failure modes are separated
on purpose, one for the machine, one for the reviewer.

### 5 · Coverage is total by construction

Every section that has its own prose either yields at least one anchored item or is listed in
`empty_sections` with a reason. The build fails on a silent gap, and also on a stale entry (a
section declared empty that now has anchors). A recorded empty section is a finding; a silent
one is a hole.

### 6 · The document's uses are cross-referenced and rated

`crossrefs.json` records where the document is used across the estate — a page, a derivation, a
paraphrase — each entry naming the extraction concepts it draws on (validated against the
extraction), and each **rated** against [`usage-model.json`](usage-model.json):

| Rating | The test |
|---|---|
| aligned | the source's author would say: yes, that is what I said |
| stretched | that came from my document, but it is not quite what I meant |
| misaligned | that is not what the document says |
| unrated | a known use nobody has judged yet — the named absence, awaiting judgement |

A rating is a signed, dated judgement about the **use, never the user** — the build rejects an
unsigned or undated one. The pilot's ledger caught the first edition's fractal-semantic-graphs
definition as a stretched use on day one, which is the model earning its keep: the misreading
memo 20 corrected is recorded, not erased.

### 7 · Everything a reader sees is a projection of the one file

Four reviewer-facing views — the dictionary, the taxonomy, the thesaurus and near-but-not, the
ontology — plus the claims table, the drawn graph and the coverage table are all **projections
of `extraction.json`**, generated, never separately authored, so they cannot disagree with each
other. The outputs per document:

- `<slug>.html` — the document page and reader: the tables with their anchors, the source and
  the local graph in a side panel, where clicking a node opens both the extraction row and the
  cited bytes (`assets/universe-view.js`, unit-tested under gate 27).
- `<slug>.pdf` — the extraction, printable, for review with nothing else open (memo 21: a PDF
  controls the sequence of events in a way a hyperlinked site cannot, and survives as a
  historical record). The review contract is printed on its cover: *for each item, is this what
  the document says, and is the anchor fair? Come back item by item, by node id. Items you do
  not mention are taken as agreed.*
- `docs/<slug>/index.html` — the folder page: the files with their integrity, the usage ledger,
  the model.
- `index.html` — the hub: every source and where its extraction stands.
- `data/universe.json` — **the machine surface**: every node, edge, alias and distinction with
  resolved byte offsets and the SHA-256 each anchor was verified against, for agents.

### 8 · The gates re-verify what the generator promised

Independently of the generator, `admin/build/validate.js` holds:

- **gate 23** — re-verifies, from the *published* `data/universe.json`, that every anchor's
  quote matches the bytes at its recorded offsets in a source that still hashes to its recorded
  SHA-256; that the universe was generated at the current site version; that every page, PDF
  and source copy exists and has not drifted; and that every crossref rating resolves in the
  usage model.
- **gate 27** — the reader's unit suite is green.

So the promise is checked twice: once when the extraction is built, and again on every release,
against what actually shipped.

## The rules this directory holds itself to

1. **One extraction file per document**; everything a reader sees is a projection of it.
2. **Every node is anchored** to a verbatim quote in a named section of a frozen source, and
   the build verifies the quote on every release.
3. **Coverage is total by construction**: anchored, or declared empty with a reason.
4. **Truth is deferred.** Layer 1 records what a document says, including the document's own
   evidence state. Whether it is right is layer 3's question.
5. **The extractor is an author too.** The extraction is a reading, marked as such, shipped
   with the anchors a reviewer needs to check it, and reviewed from its PDF.

## The pilot, in numbers

*Thinking in Graphs: Meaning Through Connectivity* (dated 2026-02-05, extracted 2026-08-23,
published at v0.4.5, reader from v0.4.8): 22 concepts (3 used-but-undefined) · 27 claims
(7 demonstrated, 15 argued, 5 declared) · 3 hypotheses · 1 objective · 4 worked demonstrations ·
8 asserted edges · 8 known uses rated (7 aligned, 1 stretched) · a 14-page review PDF.

## What comes next

- **The remaining twenty carried sources**, each through the same pipeline, the pilot's method
  applied unchanged unless its review changes it.
- **Layer 2, the bridge layer**: cross-document edges as authored decisions with a note —
  where documents name the same idea differently, and where they disagree.
- **Layer 3, the book's universe**: the six families of ADR-3, connecting down into layers 1
  and 2 as evidence; then plot lines (ADR-9), the pacing gate (ADR-10), and the spine *derived*
  from where the plot lines converge — per the
  [implementation plan](../dev-packs/v0.3.27__the-second-book/08__implementation-plan.md),
  phases 2 and 3.
- **The stopping rule** (gate 2 of the plan): the universe is sufficient when every candidate
  plot line can be traced end to end through it without a gap, and every spine candidate has
  converging evidence or is explicitly labelled an opinion. The universe is not trying to be
  complete; it is trying to be sufficient for the story being chosen.

---

This document is released under the Creative Commons Attribution 4.0 International licence (CC BY 4.0).
