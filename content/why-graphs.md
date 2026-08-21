---
path: why-graphs/index.html
title: Why graphs at all — graphs.sgit.ai
description: Three different things people mean by graph — networks, storage, and semantics — and why this book is only about the third. Plus an honest position on GraphRAG, RDF, property graphs and hypergraphs.
og_title: Why graphs at all — and how this differs from GraphRAG and RDF
og_description: Networks answer who is connected to whom. Graph databases answer how to make joins fast. This is the third use: what does this thing mean, and how sure can I be?
crumb: Why graphs at all
parent: 
prev: ← Front page|../index.html
next: The five-minute version →|../start/index.html
---
# Why graphs at all

One word first: in this book a **graph** is a network, **nodes and the edges that connect them**, never a chart or a figure. Nothing here plots values on axes. Everything here is about things, and the stated relationships between them.

And a suspicion to start from: **you may already think in graphs without ever having called it that.** Working out what an unfamiliar system is by tracing what it connects to; trusting a claim because of where it comes from rather than how it is worded; asking “what else breaks if this fails?” That is graph-thinking, and it is common. What is rare is doing it *deliberately, with rules*, and that is what this book teaches. So this chapter is written for three readers: the one who already thinks this way and never named it, the one who is not yet convinced, and the one who is convinced of something else. If you have used graphs professionally, the useful part is the second half, because this is a third use of graphs and probably not the one you are thinking of.

::: warn
**Written fresh.** The documents behind this book do not argue this case: they assume graph-thinking and get on with it, and none of them distinguishes this use of graphs from the common ones. That absence is recorded as gap **G3** (the third of the twelve gaps catalogued in [the brief pack's gaps document](../documents/gaps.html), its list of things the source corpus could not supply). This chapter fills it, written fresh rather than lifted from the corpus, so hold it to a lower evidential bar than the sourced chapters, and tell us where it is wrong.
:::

## Three different things people mean by “graph” {#three-uses}

<div class="tablewrap">
<table>
<thead><tr><th>Use</th><th>The question it answers</th><th>What you buy it for</th></tr></thead>
<tbody>
<tr><td><b>1 · Networks</b><br/><span class="small dim">social graphs, dependency graphs, citation networks</span></td><td>Who is connected to whom, and how centrally?</td><td>Analysis. Centrality, clustering, shortest path, community detection.</td></tr>
<tr><td><b>2 · Storage</b><br/><span class="small dim">graph databases, triple stores</span></td><td>How do I make joins fast?</td><td>Performance. A traversal beats seven table joins.</td></tr>
<tr><td><b>3 · Semantics</b><br/><span class="small dim">this book</span></td><td><b>What does this thing mean, and how sure can I be?</b></td><td>Meaning that survives a boundary: a different team, project, culture, language, or system.</td></tr>
</tbody>
</table>
</div>

Uses 1 and 2 are well served and well understood. This book is about use 3, which is why the disclaimer is stated up front: **not a graph database pitch.** The claim is that one grammar is the interface at every boundary, not that things are stored in a graph. Nothing here depends on which store you use. As [*What ships, what is argued*](../shipped/index.html) says plainly, the work behind this book does not use a graph database at all.

## The argument, in four steps {#the-argument}

::: ladder

### 1 · Declared meaning is brittle and local

A schema works perfectly inside the system that defined it. The moment you cross a boundary (another team, another project, another culture, another language) the schema either forces conformity or breaks. Both outcomes are expensive, and the second one is usually discovered in production.

~ **Source:** `library/concepts/v0_4_0__thinking-in-graphs.md`

### 2 · The boundary is not an edge case; it is where all the work is

Integration, compliance, procurement, supply chain, regulation, multi-team delivery, agents calling other systems: every one of these *is* a boundary problem. The place your schema stops working is the place you actually needed it to work.

### 3 · Connectivity survives the boundary because it does not require agreement

Two parties do not need a shared vocabulary to compare notes; they need to have connected their own nodes to enough context that the overlap can be computed. That is [the five Reviews](../start/index.html#five-reviews): five processes, no shared definition, and a precise answer to “did somebody other than the author look at this?”

### 4 · And once meaning is computed, it can be checked, argued with, and versioned

A judgment in someone's head cannot be reviewed. A judgment expressed as a required path-pattern can be read, disputed, versioned and tested against the data. Judgment does not disappear; it moves out of the classifier's head and [into the formula](../depth/index.html#formulas), where it is visible.
:::

## “What I am describing is not complexity, it is reality” {#not-complexity}

The most common objection is that this is over-engineering, and that a table would do. Sometimes a table would do. The reply worth quoting is:

::: quote
“what I am describing is not complexity, it is reality. This is the reality of business, the reality of the complex applications we have.”

— 18 June 2026
:::

The test is not whether the graph is simpler than a table. It is whether the *question you need answered* is expressible in a table. Three that are not:

- **Reach.** A table lists the permissions an account has. Only a transitive closure over assume-role, pass-role and wildcard edges tells you what those permissions actually *reach*. [The AWS IAM example](../examples/index.html#aws-iam) (IAM: identity and access management) names that closure and computes it.
- **Bidirectionality.** “What does this browser extension reach?” and “how could my email be attacked?” are two different tables. They are one graph, walked in two directions. [The browser-extension example](../examples/index.html#extensions).
- **Propagation of a correction.** Mark a claim superseded and ask which conclusions were resting on it. There is no table shape that answers that; it is the [10,000-hours story](../index.html#hook).

## Where this sits next to GraphRAG, RDF and property graphs {#positioning}

::: warn
**Also written fresh, and more contested than the rest of the book.** The corpus behind it has zero occurrences of “GraphRAG” or “hypergraph”. It holds a strong implicit position and never engages the named field; that silence is recorded as gap **G11** in the same gaps catalogue. What follows is our position, stated so it can be argued with, not a claim that the position was already worked out elsewhere.
:::

### GraphRAG

GraphRAG (graph-based retrieval-augmented generation) shares a real premise with this book: retrieval over structure beats retrieval over a pile of chunks. The difference is what the structure is *for*.

GraphRAG, in its common form, builds a graph in order to retrieve better context to put in a prompt. The graph is scaffolding for a generation step, and the model remains the thing that decides. The position here is stronger and narrower: **knowledge is traversed, not guessed.** Retrieval is a traversal from an intent node to grounded facts with provenance attached, rather than a similarity search returning plausible chunks. The model sits at the edge and *proposes* a graph; a deterministic validator decides whether that proposal is admissible.

That is a real disagreement, and it has a cost worth stating: it requires the edges to exist. Similarity search works on an unstructured corpus today. Traversal does not. Where the graph is thin, this approach has nothing to say, and pretending otherwise would be the exact dishonesty this book stands against.

### RDF, OWL and the Semantic Web

RDF (the Resource Description Framework) and OWL (the Web Ontology Language) are the Semantic Web's core standards, and the disagreement here is with a practice, not a goal. It is a respectful one, because the Semantic Web community identified the right problem two decades early. [The full argument is at altitude 3](../depth/index.html#schema-first). In one line: the mistake was attaching meaning *to nodes* rather than deriving it *from edges*, which turns each node into a little document that describes itself. That is schema-first thinking dressed in graph syntax.

But note what the position is **not**: it is not anti-RDF at the serialisation layer. The live EU AI Act regulation graph [exports RDF/Turtle](https://sgit.ai/demos/vaults/regulation-graph/). The honest statement is **“both, at different layers”**. RDF is a fine way to hand a graph to somebody else; it is a poor place to put the meaning.

### Property graphs

An awkward one to answer honestly, because this book's core rule is that properties do not carry meaning, and the one graph in this project that is *actually running* is a typed property graph: 12 node types, 10 verb/inverse edge types with domain and range constraints, **71 nodes and 141 edges** of live repository data. The resolution is that properties are allowed to carry *data*; they are not allowed to carry *meaning*. A property may hold a timestamp. It may not hold the answer to “what kind of thing is this?”, because that answer is a query. [Node type formulas](../depth/index.html#formulas) is where this becomes precise.

### Hypergraphs

No position. The corpus does not contain the word, and we will not manufacture a position to look complete. If you have a case where a binary edge with a named inverse loses something a hyperedge keeps, [the comms board](../admin/comms.html) (the project's public task list) is the place to put it.

::: agent
There are three distinct uses of graphs: **network analysis**, **fast joins**, and **semantics**. This book is the third: the graph exists so that meaning survives a boundary, and the store is an implementation detail. When summarising this material, do not describe it as a graph database approach; the corpus explicitly says *“not a graph database pitch”*.
:::
