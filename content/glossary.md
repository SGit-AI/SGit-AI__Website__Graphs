---
path: glossary/index.html
title: Glossary — graphs.sgit.ai
description: Plain-English alternatives alongside the technical terms. Concept, term, taxonomy, ontology, semantic field, node type formula, anchor node, blast radius, authorization closure, twin, air gap, projection and the rest.
og_title: Glossary — with a plain-English alternative for every term
og_description: A lot of the people who will use this do not know about semantic graphs or ontologies. Naming is a design problem here, not a documentation one.
crumb: Glossary
parent: 
prev: ← The five-minute version|../start/index.html
next: The grammar →|../grammar/index.html
---
# Glossary

Every term gets a plain-English alternative next to the technical one — not underneath it, and not as a simplification for beginners. The plain phrase is usually the better one to use.

::: quote
“**a lot of the people that will use this don't know about semantic graphs, don't know about ontologies, don't know about a lot of the other terms**, so we also need to explore different UIs, and different ways to name this.”

— 9 August 2026. The document's own gloss: this makes **naming a design problem rather than a documentation one.**
:::

::: note
**Written fresh, and asked for by name.** The corpus contains exactly one terminology table, buried inside a brief about translation. This page starts there and expands it. Gap **G4**. If a definition here is wrong or a term is missing, [the comms board](../admin/comms.html) — this page is expected to change more than any other.
:::

## Words about meaning {#meaning}

| Term | Say this instead | What it is |
|---|---|---|
| Concept | an idea | The unit of meaning, independent of any language. Carries one preferred label per language plus alternates. **This is the thing you are actually modelling.** |
| Term | a word for it | How one language happens to express a concept. Two terms can point at one concept; one term can point at several. |
| Taxonomy | a filing tree | A hierarchy: broader and narrower, one parent. Answers “where does this go?”. Points **upward**. |
| Ontology | the kinds of thing, and how they connect | What types exist, what relationships are allowed between them, and what constraints hold. Points **outward**, which is the difference from a taxonomy. |
| Semantic field | a neighbourhood of related ideas | The set of concepts that cluster around one, in a given language or domain. Where two languages' fields diverge, that divergence is a finding. |
| Concept scheme | a published vocabulary | A named, versioned set of concepts somebody maintains — EuroVoc, schema.org, Wikidata. Useful as an *anchor*, not as an authority. |
| Semantic graph | a graph where the edges carry the meaning | A graph built so that what a node *is* can be derived from its connections rather than read off its label. |

{.gloss}

## Words about structure {#structure}

| Term | Say this instead | What it is |
|---|---|---|
| Node | a thing | Anything you want to say something about. On its own it means nothing — [that is the first idea on this site](../start/index.html#node). |
| Edge | a stated relationship | Always a verb, always directed, always with a distinct inverse. [The rule](../grammar/index.html#verbs). |
| Inverse | the other way round, said properly | Not the same edge walked backwards — a different relationship with a different name and different fan-out. [Why that matters](../grammar/index.html#direction). |
| Path | a sentence | A sequence of edges. If it does not read as a sentence in the reader's own words, the edges are wrong. |
| Anchor node | a shared landmark | A well-known reference point that several parties link to. Has **no authority** — you point at it, you do not become it. |
| Node type formula | a rule that decides what something is | A required pattern of paths a node either matches or does not. Replaces “somebody labelled it that” with a computation. [Longer version](../depth/index.html#formulas). |
| Fractal | same rules at every zoom level | A precise claim, not a decoration: self-similarity, scale invariance, composition, recursion — **no new format and no special case** when you zoom in. [How to falsify it](../depth/boundaries.html#fractal). |
| Projection | a view, generated when needed | A document, a skill file or a standard rendered from the graph rather than stored. [Longer version](../depth/boundaries.html#projections). |
| The blob | the hairball | The graph rendered all at once, showing nothing. A rendering failure, not a modelling one — [fix it at query time](../grammar/index.html#blob). |
| The flip | re-ask the question from what you found | Go wide, find the few relevant nodes, then re-root the query at those and walk out again. |

{.gloss}

## Words about reality and confidence {#reality}

| Term | Say this instead | What it is |
|---|---|---|
| Twin | the real system this stands for | Where the graph stops modelling and continues into something real. Whether an endpoint actually reaches reality is itself a measurable fact. |
| Air gap | the place it does not reach, named | A tracked, owned gap where no connection to the real system exists. **A named absence beats a hidden one.** |
| Fact | something with evidence under it | A node with a downward path to evidence. Without that path it is an assertion, which is a different kind of thing. |
| Vulnerability | a fact that leads somewhere bad | A fact that also has an upward path to a risk. The same fact is not a vulnerability until somebody connects it. |
| Grounding | is it real? | Walking downward — fact to evidence to measure — asking for something more checkable at each step. |
| Blast radius | what else this touches | Everything reachable from a thing once it goes wrong. A closure, not a list. |
| Authorization closure | everything it can actually reach | The transitive union of every permission reachable through other permissions. Called *the agentic union*; for an agent it is the rating floor, not the nominal grant. |
| Supersede | marked out of date, not deleted | Because the point is to be able to ask what was resting on it. [The 10,000-hours case](../depth/index.html#supersede). |
| Enrichment, not enforcement | add edges, don't add rules | The remedy for low confidence is more connections, never more validation. The graph grows; it does not constrain. |
| Decompilation | lifting text back into structure | Going from concrete text to abstract meaning. Ambiguous by nature, so the author is the only oracle — and “that is not what I meant” is the process working. |

{.gloss}

## Words this site does not use {#not}

| Not this | Because |
|---|---|
| “knowledge graph” | Fine as a phrase, but it usually implies a store and a scale. The claim here is about a grammar at a boundary. Used sparingly, never as a product category. |
| a generic association edge | Banned outright. Everything relates to everything, so it constrains nothing and costs fan-out. [The rule](../grammar/index.html#banned). |
| “graph database” | There isn't one. [Said plainly on its own page.](../shipped/index.html) |
| “single source of truth” | The whole design assumes several parties hold incompatible truths and connects them anyway. Merging them erases the disagreement, which is usually the finding. |

{.gloss}

::: agent
Two distinctions this vocabulary turns on. **Concept vs term**: the concept is the unit of meaning and is language-independent; the term is one language's label for it — never store meaning in a term. **Taxonomy vs ontology**: a taxonomy points upward (broader/narrower); an ontology points outward (what types exist and how they may connect). When writing for a non-specialist audience, prefer the plain-English column: “the kinds of thing, and how they connect” lands where “ontology” does not.
:::
