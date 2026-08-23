---
path: depth/boundaries.html
title: A graph at every boundary — graphs.sgit.ai
description: What fractal actually claims and how to falsify it; why meaning is lost and re-guessed at every seam of an AI stack; documents as projections of graphs; and twins, where the graph stops modelling and touches reality.
og_title: A graph at every boundary — meaning is lost at the seams
og_description: Determinism, explainability, provenance and sovereignty are not features. They are consequences of one decision: nothing crosses a layer as an opaque blob or a sentence.
crumb: A graph at every boundary
parent: Altitude 3|index.html
prev: ← The full argument|index.html
next: The worked examples →|../examples/index.html
---
# A graph at every boundary

Four arguments that only make sense once you accept the first three at [altitude 3](index.html): what fractal actually claims, what happens at the seams of an AI system, why documents are projections rather than sources, and where the graph stops modelling and touches something real.

<div class="evbox ev-warn">
<span class="evtag">Rewritten</span>
<p>Two of the four sections below are the highest-value rewrites identified in the brief pack: gaps <b>G7</b> and <b>G2</b> in its catalogue of twelve gaps, the things the source corpus could not supply (<a href="../documents/gaps.html">the gaps document lists them all</a>). The source briefs open with a single bolded sentence of four to five hundred words; the ideas are highly accessible, but the documents are not readable cold. The <em>argument</em> here is the corpus's; the <em>prose</em> is ours.</p>
</div>

## 1 · Fractal is a precise claim, not a decoration {#fractal}

“Graphs of graphs of graphs” sounds like a flourish. It is meant literally, and it means four specific things:

| Claim | What it commits you to |
|---|---|
| **Self-similarity** | The same node-and-edge grammar at every altitude. A property, a paragraph, a person, a national estate: same rules. |
| **Scale invariance** | One validator, one query engine, one provenance rule. Not a family of them per level. |
| **Composition** | Graphs combine into graphs without an adapter layer. Risk registers of risk registers. |
| **Recursion** | Zoom into any node and it expands into a graph obeying identical rules, **with no new format and no special case**. |

That last clause is the falsifiable part, and it is how you check whether a system is fractal or merely hierarchical. If zooming in requires a different file format, a different validator, or a special case, the claim is false. It is a testable property, not a description of a feeling.

What it buys you is that the system has no natural stopping point and no integration tax. *“there might be an article that is so meaty that it requires its own ontology and taxonomy, and that's the power of the fractal element.”* The graph starts wherever the work is (*“it is kind of like a Lego structure where one feeds to the other”*) and grows outward from there. Which is also why [it does not matter where you start](#anywhere).

## 2 · Meaning is lost and re-guessed at every seam {#boundaries}

Here is the AI-native argument, stated plainly rather than in one sentence.

A conventional agentic stack is a pile of layers: a retriever, a model, a tool router, a policy check, an executor, a log. They are glued together with **JSON payloads and prompt text**. At every one of those seams, the structure of what was known (what grounded it, where it came from, how confident anyone was) is flattened into a string and then **re-guessed by the next layer**.

That flattening is not a detail of the implementation. It is precisely where determinism, explainability, provenance, sovereignty and auditability die. Not one of the five is lost inside a layer; all five are lost *between* them.

::: quote
“at every boundary meaning is lost and re-guessed; the alternative is to make a semantic graph the interface at every boundary, so each layer emits a graph and consumes a graph and **nothing crosses a layer as an opaque blob or a sentence.**”
:::

### What falls out

The point of the design is that these are **consequences, not features**. Nobody built a provenance subsystem:

- **Determinism.** The model proposes a graph; a deterministic validator executes it. The same proposal produces the same result.
- **Explainability.** The explanation is the path. It was already there; you just have to render it.
- **Provenance.** Every node carries where it came from, because it crossed the boundary as a node rather than as prose about a node.
- **Sovereignty.** Computed, not claimed. You can point at which parts of the graph left your jurisdiction, because parts of a graph have addresses.
- **Auditability.** The transaction log is a by-product. Every mutation is an ordered message, and a message *is* the change rather than a notification about it.

### And the security property, which is the sharpest one

::: claim
The model sits at the edge and only *proposes* a graph. A deterministic validator decides what is admissible. Untrusted input is therefore data and can never become instruction, so prompt injection fails at the validator, **structurally**.
:::

Be careful with that claim, in both directions. It does not say a model cannot be manipulated: of course it can, and it will propose something wrong. It says the manipulated proposal **has to pass a validator that does not read prose**, so the class of attack that works by talking the system into doing something never reaches the executor. What remains is a proposal that is structurally valid and semantically wrong, which is a much smaller and much more detectable problem. That is a real reduction, not an elimination, and the source brief carries its own honest-tensions table saying so.

Finally, the retrieval consequence: **knowledge is traversed, not guessed.** Retrieval becomes a traversal from an intent node to grounded facts with provenance attached, rather than a similarity search that returns plausible chunks. [How that sits next to GraphRAG →](../why-graphs/index.html#positioning)

## 3 · Documents are projections of graphs {#projections}

::: warn
**This one has no home document, and that is worth knowing before you read it.** The principle is invoked across the corpus as *already established* (“the same way I talk about documents being projections of graphs”) and then applied to skills, compliance standards and legal texts. It is never argued anywhere; that absence is gap **G2** in the brief pack's catalogue. This section is the synthesis, written fresh.
:::

The claim: the graph is the truth; the document is a **view** of it, generated in the context of use.

::: quote
“The same way I talk about documents being projections of graphs, **the skill is a projection of a graph**… The skills we have today are just **a photograph of what it should be**, because it is static.”
:::

Three things that look like separate problems turn out to be the same one:

::: ladder

### 1 · A skill file

A static description of how to do something, which drifts from how it is actually done. As a projection: the graph of how the work is done is the truth, and the file is rendered from it when needed.

### 2 · A compliance standard

A document handed to you whole, from which you strike out what does not apply. As a projection: nothing is relevant until your facts attach, so the standard starts *empty* and accretes. [The customisation inversion →](../examples/index.html#regulation)

### 3 · A consolidated legal text

The sharpest version. Do not **store** the consolidated text at all. Hold the base text plus the amendment instructions as data, and **compute** the consolidated version as a projection.
:::

And then the result that makes the whole idea pay for itself: **consolidation and per-organisation customisation turn out to be one mechanism, not two.** The maintenance burden and the flagship feature share an engine. That is the kind of thing that only shows up if you take the projection claim seriously enough to build on it.

The same shape appears in the document-to-graph direction: a document is not one blob but a hierarchy of paragraphs, points and definitions, each written for a reason and therefore yielding something extractable. **Every paragraph is a graph.** A document's own definitions are the first and most valuable node layer, and three kinds of work follow: how they relate, **where they contradict**, and what the text uses but never defines. The second is the highest-value output and the one nobody produces. The third is where interpretive risk concentrates.

### Which means lifting text into a graph is decompilation

Going from concrete text to abstract structure runs the same direction a decompiler runs, and it inherits the same property: **it is ambiguous, and it cannot be done reliably without help.** The help is the author. The goal is not absolute truth but *the author's own meaning, confirmed by the author*, so a reader saying **“that is not what I meant”** is not a failure of extraction. It is the elicitation working. Every node at every altitude carries a source map back to the span it came from, which is what makes that correction cheap.

## 4 · Twins, and the air gap {#twins}

A graph that only ever refers to itself is a very well-organised opinion. A **twin** is where it stops modelling and continues into a real system.

::: quote
“the power of the twin is that we always arrive at the twin, so the edges and the peaks and the endpoints of the graph continue into the twin, and then ideally into reality.”
:::

A twin can be made of almost anything (an organisation, an inbox, a person, a behaviour, the weather) because a twin is just a system with properties, behaviours, functions, inputs and outputs. Two disciplines come with it:

- **Whether an endpoint actually reaches reality is itself a measurable fact.** Not an assumption about the diagram; a property of it you can query.
- **Everything modelled must be real**, so the graph never fills up with hypothetical risks. This is the rule that keeps a risk graph from becoming a brainstorm.

### And where it cannot reach, name the gap {#air-gap}

::: note
**Written fresh.** The air gap is a load-bearing idea that appears only as paragraphs inside two longer briefs; that absence is gap **G9** in the brief pack's catalogue. This chapter gives it its first home.
:::

Sometimes the graph cannot reach the real system. There is no API (no programmatic interface at all), the data arrives by email, someone re-keys it on a Thursday. The instinct is to leave that part of the diagram blank, or to draw it as though it connects.

Neither. The twin holds an **explicit, tracked gap**: *“this needs to be manually updated once a week, but the point is we now know where that gap is.”*

The air gap is the operational sibling of [map the gaps](../start/index.html#gaps). Any risk not connected to the register is an air gap. Any provision whose hooks reach no twin is a provision not actually mapped, which turns hook coverage into a real coverage measure over an instrument rather than an assertion that it was reviewed.

::: claim
A named absence beats a hidden one. In the graph an air gap is a node with a name, an owner and a frequency, which means it can be counted, argued about, and funded.
:::

There is a Wardley map for this, and it is the sharpest single map in the material: the ends are solved and the middle is people. [The maps →](../maps/index.html)

## Two smaller notes, and one open question {#anywhere}

**It does not matter where you start.** The graph will be deep where the work is and absent everywhere else. That is not a defect to apologise for. It is the property that makes the project finite. A graph that had to be complete before it was useful would never be either.

**A bug is a divergence, not a breakage.** *“A bug is something that we have mapped in the graph that is not happening in reality.”* Which reframes it from “something is broken” to “the reality diverges from the model”, and leaves open which of the two is wrong.

::: warn
**Open: time is asserted and never developed.** “Time is an event, things change” is close to the whole treatment. The corpus repeatedly says the graph moves and never explains how. Adjacent material circles it: the acceptance-interval ladder (1h / 4h / 2d / 2w / 1m / 6m), `repealed_from` in the regulation graph, supersede-never-delete, temporal permissions, and the vault's own commit DAG (directed acyclic graph), which is after all a working answer to “how does a graph change over time”. Gap **G10** in the catalogue, and the chapter is not written. If you have a view, [the comms board](../../admin/comms.html).
:::

::: agent
**Fractal** is a testable claim: if zooming into a node needs a new format or a special case, the system is hierarchical, not fractal. **At a boundary**, emit a graph rather than JSON-plus-prose: determinism, explainability and provenance are consequences of that one decision, not separate features. **A document is a projection** of a graph, so compute it rather than storing it. **Where you cannot reach a real system**, emit a named air-gap node with an owner and a refresh frequency; do not draw the connection you do not have.
:::
