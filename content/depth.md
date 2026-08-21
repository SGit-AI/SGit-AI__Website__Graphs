---
path: depth/index.html
title: The full argument — graphs.sgit.ai
description: Against schema-first and the mistake the Semantic Web made; why merging vocabularies erases the disagreement; classification as a computed path-pattern; the grounding ladder; supersede never delete; and concepts, not words.
og_title: Altitude 3 — the full argument
og_description: They ended up attaching meaning to nodes rather than deriving meaning from edges. The node becomes a little document that describes itself. This is schema-first thinking dressed in graph syntax.
crumb: Altitude 3 — the full argument
parent: 
prev: ← The grammar|../grammar/index.html
next: A graph at every boundary →|boundaries.html
---
# The full argument

This is the “then more, and then more” tier. It assumes [altitude 1](../start/index.html) and the [grammar](../grammar/index.html). Six arguments here; the four that concern boundaries, fractality, projections and twins are on [the second page](boundaries.html).

::: note
**Reading order, if you only want one.** A graph-literate reader should start at [§1, against schema-first](#schema-first) — it is the highest-signal section on the site for someone who already knows RDF. A security or risk reader should start at [§3, node type formulas](#formulas). Everyone else: in order.
:::

## 1 · Against schema-first — and the mistake the Semantic Web made {#schema-first}

The Semantic Web community identified the right problem, two decades early: meaning has to travel between systems that were not designed together. That was correct, and it is still correct.

::: quote
“They ended up attaching meaning **to nodes** rather than deriving meaning **from edges**. … The node becomes a little document that describes itself. **This is schema-first thinking dressed in graph syntax.**”
:::

That is the whole disagreement, and it is worth being precise about how narrow it is. It is not with RDF as a serialisation. It is not with URIs as identifiers, or with shared vocabularies as reference points — [anchor nodes](../grammar/index.html#anchor-nodes) are exactly that. It is with the practice of making a node self-describing, because a self-describing node has smuggled the schema back in.

### The two systems, side by side

|  | Schema-first | Graph-first |
|---|---|---|
| Meaning is | declared, in advance, centrally | discovered, at query time, locally |
| Disagreement is | a conflict to be resolved before you start | data — and often the most useful data you have |
| Crossing a boundary | forces conformity, or breaks | computes an overlap, which may be partial |
| Low confidence is fixed by | more validation rules | more edges |
| A third party can | request a schema change | add a mapping edge without touching either node |
| Failure mode | everyone lies about their process to fit the schema | the graph is thin where nobody did the work |

Both have failure modes. Note the difference between them: the schema-first failure is *invisible* — a conforming record that is false. The graph-first failure is *visible* — a sparse region you can point at and count. That asymmetry is most of the argument.

## 2 · Don't merge vocabularies — merging erases the disagreement {#ontologies}

Given two ontologies covering the same ground, the instinct is to merge them into one. The position here is that merging is a destructive operation, and what it destroys is the finding.

::: quote
“ontologies are not folded into a single shared definition, **because that erases the disagreement**, they are kept intact and connected through anchor nodes… which is **how meaning actually travels across languages, cultures, biases, and political agendas**, by maintaining translations between definitions that each side still owns.”
:::

The construction is three layers, and the separation between them is the whole design:

::: ladder

### 1 · Shared facts, owned by nobody

The factual graph. This account exists. This bucket is public. This provision is in force. Nobody has to agree about what any of it *means* to agree that it is the case.

### 2 · Per-party formulas

Each party classifies those shared nodes with its own rules. The CISO's definition of a critical risk, the CFO's, the regulator's. Three different answers over one set of facts, each internally consistent, each inspectable.

### 3 · Declared bridges

Explicit edges connecting formulas at specific points: *our “material” corresponds to their “reportable” under these conditions*. Owned by whoever declared them, and revisable without renegotiating anything.
:::

::: claim
Parties can disagree about meaning while still agreeing about facts — which is the only stable basis for working together.
:::

The founder's version is shorter: *“I always err on the side of understanding versus a standardized schema… instead of folding it, you make it compatible, which is why you need an ontology of ontologies.”*

## 3 · Stop asking a human “is this a vulnerability?” {#formulas}

The strongest single sentence in this material for a technical audience:

::: claim
The content of the node does not decide its type; its paths do. Two nodes with identical text can be different types because their edges differ.
:::

A node type stops being a label somebody applied and becomes a **required pattern of typed, directed paths** that a node either matches or does not. Written out:

```path
[Fact] := a node with a downward -backed_by-> [Evidence]
say: A claim with nothing under it is not a fact. It is an assertion — a different node type, and one worth being able to count.
```

```path
[Vulnerability] := a [Fact] that also has an upward -gives_rise_to-> [Risk]
say: The same public bucket is a Fact on Monday and a Vulnerability on Tuesday — not because anything about the bucket changed, but because somebody connected it to a risk.
```

Every security practitioner recognises the problem this solves. A scanner asserts a finding; the finding is a label; the label is wrong for this deployment; you triage it by hand; the triage lives in someone's head and is lost. Here the triage *is* the formula, and it is versioned.

**Judgment does not disappear.** That is the usual objection and it is worth answering directly. Somebody still decides that a vulnerability requires an upward path to a risk. What changes is where that decision lives: out of the classifier's head, into a formula that is visible, versioned, inspectable and arguable. You can now disagree with a classification by pointing at a line, which you could not do before.

The worked instance runs six layers, roughly thirty-one node types, twenty edge types with named inverses — forty readings — and seven formulas. [The AWS IAM example →](../examples/index.html#aws-iam)

## 4 · The grounding ladder {#ladder}

One worked formula set, and the most reusable thing on this page.

```path
[Fact] -backed_by-> [Evidence] -measured_by-> [Measure]
say: **Downward grounds.** Is it real? Each step down asks for something more checkable than the last.
```

```path
[Fact] -gives_rise_to-> [Vulnerability] -gives_rise_to-> [Risk]
say: **Upward implies.** What does it mean, and why does it matter? Each step up is an interpretation somebody is accountable for.
```

Two details in the source brief are easy to miss and are the parts that make it usable:

- **Measure is not the floor.** The true floor is the last node where going deeper would neither improve observability nor change a decision. That is a judgment, it is stated as one, and it is the reason the ladder terminates instead of receding forever.
- **It is explicitly *one* formula among possible others.** The brief says so. A ladder that presented itself as the ladder would be the schema-first move at one remove.

## 5 · Supersede, never delete — and corrections must propagate {#supersede}

A superseded claim is marked from a date. It is not removed. Removing it destroys the thing you most need: the record that something once rested on it.

Because the claim is still there and still connected, the graph can answer the question a document cannot — **which conclusions were resting on this?** [The 10,000-hours story](../index.html#hook) is the case: 242 papers, more than 200,000 supporting citation paths, and corrections that never attached to any of them because there was nothing for them to attach to.

Two companions to the rule, both from the same August 2026 briefs:

- **Attach, never mutate.** Contributions arrive as subgraphs attached to an author-confirmed spine. A bad contribution is discarded rather than repaired — which is what makes *abundance* a feature instead of a risk. You can accept a hundred evidence packs because accepting one costs nothing you cannot undo.
- **Weight by independence, not by count.** Ten citations of one source are one source. This is the rule the 10,000-hours network violates at scale, and it is the difference between a confidence number that means something and one that measures popularity.

And a third that is a different shape: **an index is not a source.** Pointer nodes and assertion nodes are structurally distinct — a pointer can be wrong without being dishonest, it is regenerable, it needs no attribution apparatus, and it is therefore *safe to prune*. That is the one place pruning is allowed.

## 6 · A nuance survives translation because it was never stored in a word {#concepts}

The unit of meaning is a **concept**, not a word. A concept is language-independent; it carries one preferred label per language plus alternates, and relates to other concepts as broader, narrower or related. A *term* is how one language happens to express it.

Once meaning lives in the concept rather than the term, a whole class of failure disappears by construction — you are no longer translating word to word and hoping the connotation survives.

The unexpected result is the better story. Rendering a set of concepts into Portuguese produced a bad Portuguese label — and the diagnosis was that **the English word was wrong**. Naming a concept in a second language forces a decision the source language let you avoid. Where two languages' induced graphs diverge, that divergence is either an error or a genuine lexical gap, and either way **it is a finding**, not noise to be smoothed away.

This is the same shape as everything else on this page: the disagreement is the data.

::: agent
Four rules from this page, in order of how often they will bite you: **(1)** do not attach meaning to a node — derive it from edges; a self-describing node is a schema in disguise. **(2)** Do not merge two vocabularies; keep both and declare bridges, because the disagreement is data. **(3)** Express a classification as a required path-pattern, not as a label you applied. **(4)** Never delete a superseded claim — mark it, and re-query what depended on it.
:::
