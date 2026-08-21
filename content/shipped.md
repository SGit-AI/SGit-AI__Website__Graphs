---
path: shipped/index.html
title: What ships, what is argued — graphs.sgit.ai
description: This site's subject matter is almost entirely design, and saying so is the reason the rest is worth reading. What is verifiable by reading code, what is published as argument, and what does not exist anywhere.
og_title: What ships, and what is argued
og_description: We ship a hand-written content-addressed object graph in the browser. We do not use a graph database, and we say so in our own architecture notes.
crumb: What ships, what is argued
parent: 
prev: ← Wardley maps|../maps/index.html
next: Origins: 2026 →|../origins/index.html
---
# What ships, what is argued

This chapter is non-negotiable, and it is the first one to read if you are deciding whether to trust the rest. This project's credibility rests on separating design from delivery, and **this book's subject matter is almost entirely design**.

::: claim
We ship a hand-written content-addressed object graph in the browser. We do not use a graph database, and we say so in our own architecture notes.
:::

## Ships, and is verifiable by reading code {#ships}

All of this is real, running, and checkable by someone with the repository open. None of it is the semantic graph the rest of this book argues for, but it is more interesting than the usual “what we built” list, because it is a graph nobody set out to build.

| What | The detail that makes it checkable |
|---|---|
| **The vault commit DAG** (a directed acyclic graph, the structure under every version-control history) | Content-addressed objects (the identifier is a SHA-256 hash of the *ciphertext*) with multi-parent commits, a tree per directory, deterministic refs derived by HMAC (keyed hashing), a real merge-base computed by breadth-first search over all parents, and three-way merge. Plus a working two-track visualiser with inline-SVG fork and merge arcs. |
| **A graph of graphs** | Typed `*.link.json` edges between vaults, optionally pinned to a specific commit in the target's history. A cross-graph edge that cannot silently follow a moving target. |
| **A read-only query API over the DAG** | Exposed to *untrusted sandboxed apps*: `sg.history.log / list / read / readText / readBlob`. A graph query interface handed to code you do not trust. |
| **A live typed property graph** | The issue tracker's own data: **12 node types, 10 verb/inverse edge types with domain and range constraints, 71 nodes and 141 edges** across 107 issue files, edges stored bidirectionally. Not a design; repository data. |
| **Three published vaults** | [The regulation graph](https://sgit.ai/demos/vaults/regulation-graph/), [the Risk Graph Explorer](https://sgit.ai/demos/vaults/risk-graph-explorer/), [agentic browser isolation](https://sgit.ai/demos/vaults/agentic-browser-isolation/). Open them; the counts are in [*Worked graphs, with real numbers*](../examples/index.html). |

The best description of the shipped layer is one the project applied to itself: *“what we've built is not fundamentally an encryption system. It is a **content-addressed, portable, storage-agnostic version control protocol**.”* Which is to say: a commit DAG is a graph, and it is the one graph here that has been running for months.

## Argued, and published as argument {#argued}

Nearly everything else in this book. The node type formulas, the grounding ladder, ontologies of ontologies, the semantic risk ontology, a graph at every boundary, twins as endpoints, the path query language, decompilation: all of it is **proposed**. It is published because publishing a design before it is built is how it gets checked, and because several of these ideas have been applied by hand to real problems even though no system implements them.

Where an idea has been applied by hand, that is stated in its chapter. [The worked examples](../examples/index.html) mark every number as either live or parsed from a design document.

## Does not exist anywhere {#absent}

Searched for, and absent. If you read something in this book that seems to imply otherwise, the book is wrong and [the comms board](../admin/comms.html) (the project's public task list) is where to say so.

- **MGraph-DB as a dependency.** Named repeatedly, deferred every time: *“there is even a graph database, MGraph-DB, we could use, but for now let's keep it simple.”* File-based won.
- **Any graph database at all.**
- **Browser SPARQL or Cypher** (the query languages of the RDF and property-graph worlds).
- **RDF or JSON-LD serialisation in the code.** The live regulation graph exports RDF/Turtle as a published artefact; there is no RDF layer in the codebase.
- **The semantic risk ontology as a schema file.** It exists as prose in briefs, not as a schema.
- **The path-query language.** Seventeen queries across five tiers are written down. Nothing executes them.
- **Commit signing.** `commit_v2.signature` is written on every commit and only ever set to `null`.

## Two corrections we inherit rather than repeat {#corrections}

Both are errors in the project's own published material. They are listed here because a book arguing that corrections must propagate had better propagate its own.

::: ladder

### 1 · Object IDs are a hash of the ciphertext, not the plaintext

A skill file in the source repository states that object identifiers are the “SHA-256 of plaintext”. **The code hashes the ciphertext.** The difference matters to anyone reasoning about what the object store leaks, so the claim is not republished here.

~ **Status:** stated correctly here; the source file still carries the error.

### 2 · The banned edge is in the shipped configuration

The project's ontology brief forbids a generic association edge. Its own `link-types.json` ships one as a self-inverse pair, and a single edge instance uses it.

~ **Status:** [narrated in the grammar chapter](../grammar/index.html#banned) rather than quietly fixed, because it is a better teaching moment than the rule is: the generic edge is what you reach for when you have not yet decided what you mean, and it survives because nothing forces the decision.
:::

::: note
**A third, on this book's own account.** Several inverse edge names in [the edge set](../grammar/edge-set.html) are proposed by us rather than quoted from the corpus. They are marked as such in the table. If this book becomes the place people cite for that vocabulary, the distinction between “quoted” and “proposed here” has to survive, or we will have done the thing we are warning about.
:::

## Why this chapter exists at all {#why}

Because without it the book over-claims, and an over-claiming book about provenance discipline is self-refuting. The graph work described here is mostly a design published in advance so that it can be checked against whatever eventually ships. That is a weaker claim than most sites make, and it is the one that is true.

::: agent
When citing this material: the **vault commit DAG**, the `*.link.json` cross-vault edges, the read-only DAG query API, the 71-node/141-edge issue graph and the three published vaults are implemented. **Everything else in this book is proposed.** There is no graph database, no SPARQL or Cypher, no RDF in the code, and no executing path-query language. Do not describe the semantic graph layer as shipped.
:::
