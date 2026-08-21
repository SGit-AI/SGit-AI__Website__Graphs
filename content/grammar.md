---
path: grammar/index.html
title: The rules you can apply tomorrow — graphs.sgit.ai
description: Five rules about edges: every edge is a verb with a distinct inverse, relates-to is banned, paths must read as sentences, rich nodes are good, and never render the whole graph — render the result of a query.
og_title: The grammar — five rules you can apply to your own graph tomorrow
og_description: Every edge is a verb with a distinct inverse. The generic association edge is banned because it costs fan-out and buys nothing. Build wide, find the few, flip.
crumb: Altitude 2 — the rules
parent: 
prev: ← Altitude 1|../start/index.html
next: Altitude 3 — the full argument →|../depth/index.html
---
# The rules you can apply tomorrow

Five rules about edges. They are short on purpose: this is the one to keep open while you are actually drawing a graph, and the one an agent should be given before it starts emitting one. If a rule here contradicts something you were taught about graph modelling, that is deliberate: [rule 4](#blob) in particular.

::: note
**The one-screen version.** Every edge is a verb. Every verb has a distinct inverse. <code data-banned-verb="">relates-to</code> is banned. If the path does not read as a sentence, the edges are wrong. Rich nodes are good: solve the picture at query time, never by removing relationships. And never render the whole graph: render the result of a query.
:::

## 1 · Every edge is a verb, stated in both directions {#verbs}

An edge is not a line. It is a claim, and a claim needs a verb.

| Edge | Its inverse | Reads as |
|---|---|---|
| `owned_by` | `owns` | this system is owned by this team · this team owns this system |
| `gives_rise_to` | `arises_from` | this vulnerability gives rise to this risk · this risk arises from this vulnerability |
| `backed_by` | `evidences` | this fact is backed by this evidence · this evidence evidences this fact |
| `grants` | `granted_by` | this role grants this permission · this permission is granted by this role |

Both directions get written down, and both get a name that is worth saying out loud. The test is not “is this technically the reverse?” It is “would a person in this business say this sentence?”

### And <code data-banned-verb="">relates-to</code> is banned {#banned}

::: quote
“the way I create graphs, they are always a two-way relationship and always to do with verbs. … **You can never have relates-to, because relates-to is meaningless, two things always relate to each other. The more granular the edge, the better the query you can write.**”

— 10 June 2026
:::

The reason is not aesthetic. An edge with no verb carries no constraint, so it cannot narrow a traversal, which means it costs you fan-out and buys you nothing. Every generic edge you add makes every query worse. **The granularity of the verb is the precision of the query.**

::: warn
**And the project breaks its own rule.** The live `.issues/` configuration in the source repository ships a <code data-banned-verb="">relates-to</code> / <code data-banned-verb="">relates-to</code> pair in `link-types.json`, and one edge instance uses it. It is named here rather than quietly fixed, because it is a better teaching moment than the rule is: the generic edge is what you reach for when you have not yet decided what you mean, and it survives because nothing forces the decision. [Also listed under corrections](../shipped/index.html#corrections).
:::

## 2 · The inverse is not the same edge walked backwards {#direction}

This is the rule that surprises people, and it is the one that makes traversal tractable.

`owned_by` and `owns` describe the same fact, but they are **different relationships with different fan-out**. A system has one owner. An owner has forty systems. Walking outward from the system is a step; walking outward from the owner is an explosion.

::: claim
The inverse of an edge is not the same edge walked backwards; it is a different, meaningful relationship, and that asymmetry is what guarantees monotonic progress toward a peak.
:::

Because each hop filters on edge type *and* direction, fan-out collapses at every step rather than compounding. Traversals converge on natural peaks: a board, an owner, a regulation, a register. The practical consequence is the one that matters when your graph gets big: **seed a query in a thousand places and the paths converge on a handful of peaks. Result size is bounded by the number of peaks, not by the fan-out.**

The source brief for this rule carries a full path language: five tiers, seventeen queries, with real notation: `-edge->` for outward, `<-edge-` for inward, `*` for transitive closure.

## 3 · If the path does not read as a sentence, the edges are wrong {#paths}

A well-built path is legible without a key:

```path
[Risk] <-arises_from- [Vulnerability] -impacts-> [System] -owned_by-> [Entity] -has_stakeholder-> [Role] -reports_to-> [Board]
say: “This risk arises from this vulnerability, which impacts this system, which belongs to this entity, which has this stakeholder, who reports to the board.” Nobody needs the legend. **The query is almost like a story.**
```

And the rule has a second half that is easy to skip: the sentence should read **in the reader's own language and business context**, not in yours. A path that reads beautifully to an architect and means nothing to a regulator is a path with the wrong verbs on it for that reader. The remedy is not to rename the edges. It is to add the ones that reader's question needs.

::: quote
“the path should read in English, or not even in English, it should read in the language and the culture and the business context we are talking about” — so that **“the graph explains itself to whoever is reading it, in their own terms.”**
:::

This is also the cheapest quality check you have. Read your paths aloud. The bad edges announce themselves.

## 4 · Rich nodes are good. Build wide, find the few, then flip {#blob}

Everyone who has done this has produced the blob: the hairball diagram that shows everything and therefore nothing. The usual response is to prune: fewer relationships, cleaner picture.

::: quote
“I see a lot of people get into semantic graphs, get excited, and **arrive at the big blob**… The weird problem is **a race to the bottom, where you start not wanting a lot of relationships because they make the graph more complicated.**” — countered by: “**the more rich a node is, the more connections it has, the better.**”
:::

The blob is a **rendering** failure being mistaken for a **modelling** failure, and pruning solves the picture by destroying the asset. Solve it at query time instead:

::: ladder

### 1 · Go wide

A first pass captures the universe around your subject. Do not economise here. Nodes and edges are close to free, and some nodes exist only to give a later query something to anchor on.

### 2 · Find the few

Run the question. Out of the universe, a handful of nodes are relevant to it.

### 3 · Flip

Re-root the query at those few and walk out again. This is the move that makes big graphs usable, and it is why the graph being large is not a problem to be managed but the condition that makes the flip worth doing.
:::

::: claim
Never render the whole graph. Render the result of a query.
:::

| Ceiling | Number | What it means in practice |
|---|---|---|
| Mermaid readability | **~50 nodes** | Mermaid (a text-to-diagram language) is the *print* step: text, diffable, committable, reviewable in a pull request. Past fifty it is unreadable. |
| Visualisation legibility | **~300–400 nodes** | An interactive canvas is the *exploration* step. Past this, a human is looking at texture, not information. |

“A diagram of everything is rarely useful; one node with its neighbours is always readable.” That rule governs this book's own rendering choices, which is why you will not find a hairball anywhere in it.

## 5 · Link to schema.org; do not become schema.org {#anchor-nodes}

An **anchor node** is well-connected, well-maintained, well-known, and has **no special authority**. It is a meeting point, not a standard.

The wrong move is to declare `I am a schema:Review`. That is a conformance claim, it is all-or-nothing, and it is usually a lie by the second field. The right move is a granular, honest, disputable edge:

```path
[our document_findings step] -similar_to-> [schema:reviewBody]
say: “Our *document\_findings* step is similar to what schema.org calls *reviewBody*.” Partial. Traversable. Arguable. And crucially: a third party can add this edge without touching either node.
```

Four properties fall out, and the fourth is the one that matters organisationally: **the mapping is a first-class object that someone else can own.** You do not need the vocabulary's permission, and the vocabulary does not need yours.

Partial mapping is the normal case, not a defect. And because nodes cost almost nothing, some exist purely to anchor a query, which matters as soon as you are working across languages and cultures, where the anchor is often the only thing two sides share.

## Where to go next {#next}

- [**The edge set**](edge-set.html): the concrete vocabulary, fifteen established edges with their inverses, and a worked node-type list. This is the reference to paste into an agent session.
- [**Altitude 3**](../depth/index.html): why schema-first fails, ontologies of ontologies, and classification as a computed path-pattern.
- [**The worked examples**](../examples/index.html): these rules applied to real problems, with node and edge counts.

::: agent
When emitting a graph: **every edge is a directed verb with a distinct, meaningfully-named inverse; never emit a generic association edge; check that each path reads as a natural sentence; enrich rather than prune; and render the result of a query, never the whole graph.** Fan-out is controlled by the verb, so a vague edge type is a correctness problem, not a style problem. The concrete vocabulary is at [/grammar/edge-set.html](edge-set.html).
:::
