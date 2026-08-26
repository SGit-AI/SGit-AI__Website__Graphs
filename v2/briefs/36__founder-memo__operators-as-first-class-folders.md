# Brief 36 — founder memo: operators as first-class folders (tune each one individually)

**Date:** 26 August 2026
**Source:** a typed message, sent after the v0.5.6 round landed, pointing back at the file
explorer built for the document's folder (v0.5.1) as the model. Reproduced verbatim below.
The instruction table is the agent's reading, for the founder to correct.

---

## The memo, verbatim

> Great, now I would like to work and fine tune each of those operators individually
>
> Like you did for the document’s folder (file explorer + views)
>
> For each operator (I.e the building blocks of the layers with those input and output
> schemas and specific transformations) can you:
>
> - put them in a dedicated folder
> - create a view where I can see all files inside that folder
> - create the respective md, html, js and js inside that folder (each with the ability to
>   view raw or rendered)
> - schemas defined as jobs files
> - add some examples and sample data
> - add examples of official operator data (json files) which could be standard/unique
>   across multiple docs, or created from another operator or transformation
> - create an Ui (reusable in most operators, but some might need a custom Ui) that allows
>   the execution , test, debug and visualise the input, the transformation and the output
> - leverage js visualisation frameworks and if needed asciisart to provide visual
>   representations of the operator architecture and execution

---

## The agent's reading: the instructions, numbered

1. **A dedicated folder per operator.** All twelve engines move to
   `v2/wclm/operators/<key>/` — tokenise, normalise, resolve, senses, passthrough,
   operators, attend, bind, expand, converge, translate, fractal. The folder IS the
   operator: its code, its contract, its data, its documentation, its workbench. *Built.
   The engine's `run` functions genuinely moved: each folder's `<key>.js` is the source of
   truth, and `assets/wclm/engine.js` shrinks to the shared helpers, the type registry and
   the pipeline runner that imports the twelve modules. Recorded deviation: this puts pure
   core code under `v2/` by the founder's explicit structure; gate 27 still imports and
   tests it.*

2. **A view of all the files.** *Built: `v2/wclm/operators/index.html` — the explorer, in
   the v0.5.1 mould: every operator folder as a tree on the left, every file readable on
   the right, raw (tinted, byte-honest) or rendered, each file deep-linkable.*

3. **The respective md, html, js and json in each folder, raw or rendered.** ("jobs files"
   and the second "js" are read as json — transcription.) *Built per folder: `<key>.md`
   (the operator's book page: what it does, the contract, the transformation walked
   through, an ascii architecture diagram), `index.html` (the workbench), `<key>.js` (the
   implementation itself), `schema.json`, `data.json`, `examples.json`.*

4. **Schemas as json files.** *Built: `schema.json` per operator — the declared reads and
   writes with the full definition of every type touched, generated FROM the code's own
   `io` declaration so the file can never drift from the engine (a gate re-derives and
   compares).*

5. **Examples and sample data.** *Built: `examples.json` per operator — real vectors,
   captured deterministically by running the engine: the state the operator read, the
   state it wrote, per sample prompt. Because the engine is deterministic these double as
   test vectors: the workbench's test tab re-runs them and compares.*

6. **Official operator data, standard or derived.** *Built: `data.json` per operator, each
   entry marked with its provenance — `standard` (true across every document: the FNV-1a
   hash vectors, the negation table, the class weights), `authored` (a register the
   founder reviews: senses, analogies, meaning packs), or `derived` (created by another
   transformation: the token table from gen_coregraph, the co-occurrence edges, the
   extraction concepts). The distinction the memo draws — unique across docs versus made
   by another operator — is a field, not a comment.*

7. **A workbench UI: execute, test, debug, visualise.** *Built: one reusable shell
   (`assets/wclm/op-page.js`) mounted by every operator's `index.html`: a prompt (and
   per-operator presets where the operator needs them — senses and translate carry their
   pickers), EXECUTE (the prerequisite chain runs, then the operator; input state and
   output state rendered side by side with the operator between them), TEST (the
   examples.json vectors re-run and compared, green or red per vector), DEBUG (the raw
   before/after state slices and their diff). The per-operator custom part is declared in
   the operator's own module (`ui` export), so a new operator brings its own presets
   without touching the shell.*

8. **Visualisation: js frameworks and ascii art.** *Built with the estate's own
   instruments: the chip-and-wire SVG system from the WCLM page renders input, operator
   and output; an IO flow diagram (reads → operator → writes, typed) draws from the
   schema; and every operator's md carries an ascii architecture diagram that renders in
   the explorer. Cytoscape remains available where a graph view earns it; no new
   dependencies were added.*

## The agent's notes back

- **The operators word now means two things** — the T5 negation engine is literally named
  "operators", and this brief calls ALL twelve blocks operators. The folders adopt the
  brief's meaning; the T5 engine keeps its name inside the registry. Flagged in case the
  founder prefers a rename (T5 → "little words"?).
- **Question — tuning that writes back.** "Fine tune each operator individually" is read
  this round as: see everything, run anything, test against vectors. The next step the
  wording implies — editing an operator's data.json IN the workbench and watching the
  outputs move, then keeping the edit — needs a write path (a download, a PR, or the chat
  agent); flagged for the founder to choose.
- **Question — per-doc worlds.** examples.json vectors are captured against the pilot
  document's world. When the fan-out lands, standard data stays, derived data becomes
  per-document, and the examples should probably carry a `world` field naming their
  document.
