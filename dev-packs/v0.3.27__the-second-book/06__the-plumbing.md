# The Plumbing

**version** v0.3.27 · **date** 23 August 2026
**status** PROPOSED. Formats are sketches to be settled in phase 1, not final schemas.

---

## The chain, in one picture

```
  books/02__second-edition/graph/*.json        the book's own graph        AUTHORED
  books/02__second-edition/l1..l5/*.md         the units at each altitude  AUTHORED
                 │
                 ├─ gen_graph.py      validate the graph, resolve evidence, compute peaks
                 ├─ gen_levels.py     project units to pages, both reading and hyperlinked
                 ├─ gen_book.py       reader, single page, print interior, PDFs, cover   (carried)
                 ├─ gen_checks.py     the checks, over the graph and over the text
                 └─ validate.js       the gates
                 │
  /v2/l1 .. /v2/l5   pages        book/*.pdf   PDFs        graph/*.json   the machine surface
```

The rule that makes this a chain rather than a pile: **each step reads only what the step
before it wrote**, and each step's output is hashed into a manifest the next step checks. That
is how the first book's markdown-to-pages-to-book chain works today and it is the one piece of
its plumbing that never went wrong.

---

## The graph format

Three files, authored, small enough to read in a diff.

### `graph/nodes.json`

```json
{ "id": "meaning-through-connectivity",
  "family": "concept",
  "label": "Meaning through connectivity",
  "definition": "What a thing **is** emerges from the edges traceable from it…",
  "also_called": ["the thesis"],
  "near_but_not": ["semantic search, which infers meaning from similarity"],
  "level": "L1",
  "objective": "make the reader stop looking inside the node" }
```

`family` is one of the six in ADR-3. `level` is the highest altitude the node appears at.
`objective` is optional and only on units.

### `graph/edges.json`

```json
{ "from": "l2-s2", "verb": "compresses", "to": "l3-meaning",
  "kind": "descent" }
{ "from": "fact-1523-nodes", "verb": "backed_by", "to": "src:regulation-graph",
  "kind": "evidence", "sha256": "…", "retrieved": "2026-08-22" }
```

Every verb resolves in the edge registry and has a distinct inverse. `kind` is `descent`,
`evidence`, `concept`, `objective` or `provenance`. An evidence edge that points outside the
repository carries a hash and a retrieval date, because a citation without a date is
indistinguishable from a claim.

### `graph/registry.json`

The edge vocabulary: verb, inverse, domain, range, note. This is the single definition that
ADR-5 makes the grammar chapter a projection of.

---

## The unit format

Markdown with a front-matter block that ties it to its node. Not a new grammar: the house
directives (`::: note / warn / claim / quote / agent / ladder / meta`), the `path` fence, and
mermaid all carry over from `gen_pages.py`.

```markdown
---
node: l2-s2
compresses: [l3-meaning, l3-properties]
from: { edition: 1, unit: "why-graphs.md", verdict: LIFT }
---

Prose here. Every claim in it carries a claim id that resolves in nodes.json.
```

`compresses` is the descent edge, authored, and gated: the targets must exist, and every node at
the level below must be compressed by exactly one node above. `from` is the provenance block of
ADR-8.

---

## The generators

| Generator | Job | Provenance |
|---|---|---|
| `gen_graph.py` | validate nodes and edges, resolve evidence, compute peaks and inventory, emit `graph.json` | new; absorbs the analysis half of `gen_altitudes.py` |
| `gen_levels.py` | project units to pages, in reading and hyperlinked forms, per altitude | new; replaces `gen_pages.py` |
| `gen_checks.py` | run the checks over graph and text, emit the register | new; absorbs the checking half of `gen_altitudes.py` |
| `gen_book.py` | reader, single page, print interior, both PDFs, cover, manifest | carried, parameterised by edition and altitude |
| `gen_grammar.py` | project `registry.json` into the edge set chapter | new, small, ADR-5 |
| `gen_decisions.py`, `gen_docs.py`, `gen_documents.py`, `gen_changes.py`, `gen_llms_full.py`, `chrome.py`, `gen_cover.py` | unchanged | carried |

`gen_altitudes.py` does not survive as a file. Its 920 lines are today an author, a compiler and
an analyst in one, which is why decision r004-D1 exists. The rewrite splits it and answers the
decision.

---

## The gates

Thirteen exist. The second book adds seven, and every one of them exists because something
already drifted or because a rule with no enforcement is a preference.

| # | Gate | Because |
|---|---|---|
| 14 | The frozen first edition still hashes to its manifest | Rule 2 |
| 15 | Every descent edge resolves, and every node below L1 has exactly one parent | ADR-2 |
| 16 | Every claim node has an evidence state, and every `fact` has a resolving evidence edge | the inventory must stay derived |
| 17 | Every spine node passes `theme-has-converging-evidence` | ADR-4, memo 1.9 |
| 18 | The edge set chapter matches `registry.json` | ADR-5 |
| 19 | The reading version survives anchor-stripping with no sentence losing its subject or object | ADR-6 |
| 20 | Every unit carries a resolving `from` block with a verdict | ADR-8 |

And one that is not a gate but should be, and is the open problem the retrospective named:

> **Numbers written into prose.** The generators compute counts and the pages render them, so
> rendered counts cannot drift. Hand-written prose quoting those counts is checked by nothing,
> and it drifted twice in two days. The second book's answer is structural: **prose does not
> quote computed numbers.** A number in a sentence is a `{{node.count}}` reference resolved at
> build time, or it is not in the sentence. That is gate 21, and it is the cheapest of the lot.

---

## What the machine surface looks like

`/v2/graph.json` publishes the whole book graph: nodes, edges, evidence with hashes, peaks with
the formula that produced them, and the checks with their rules. An agent reading the second
book does not need to parse prose to know what it claims, which is the "for humans and agents"
subtitle meaning something operational rather than being a nice phrase.

`llms.txt` gains the second book as a section, and the first edition stays listed as the first
edition. Both are hubs, both are gated.

---

## What is reused unchanged, and why that matters

Seven generators, the whole review workflow, the decisions register, the carried sources, the
vault estate, the chrome, the CI pipeline and the release discipline. **The rewrite is of the
book, not of the site.** If this plan starts rewriting `chrome.py` it has lost its scope, and
the check on that is simple: any pull request touching a carried generator needs a reason in the
commit message that names a gate.

---

This document is released under the Creative Commons Attribution 4.0 International licence (CC BY 4.0).
