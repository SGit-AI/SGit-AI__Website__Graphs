# Reference card

*Four pages to read with nothing else open, and the one part of this book written to be
pasted into an agent session.*

---

## The thesis, in one sentence

Everything is a graph; meaning is not declared but discovered through relationships; and
confidence in that meaning is proportional to how richly a node is connected to other nodes
that provide context.

## The ten rules

1. Every edge is a verb, and both directions get a name.
2. No generic association edge, ever, not even temporarily.
3. If the path does not read as a sentence in the reader's own language, the edges are
   wrong.
4. Rich nodes are good: solve the picture at query time, never by deleting relationships.
5. Never render the whole graph; render the result of a query.
6. Point at anchors, do not become them.
7. Do not merge two vocabularies; keep both and declare bridges.
8. A type is a required path-pattern, not a label somebody applied.
9. Supersede, never delete, and weight by independence not by count.
10. Draw the absences: an unanswered question is a node.

## The edge set

Fifteen verbs, each directed, each with a distinct inverse. Names in the left column are
quoted from the corpus. Inverses marked *(p)* are proposed by this book rather than quoted,
and are a starting point for disagreement.

| Edge | Inverse | Reads as |
|---|---|---|
| `connected_to` | `connected_to` *(symmetric, last resort)* | A is connected to B |
| `observed_on` | `bears_observation` *(p)* | this evidence was observed on this system |
| `backed_by` | `evidences` *(p)* | this fact is backed by this evidence |
| `measured_by` | `measures` *(p)* | this fact is measured by this measure |
| `grants` | `granted_by` *(p)* | this role grants this capability |
| `reaches` | `reachable_from` *(p)* | this grant reaches this asset |
| `enables` | `enabled_by` *(p)* | this capability enables this action |
| `exposes` | `exposed_by` *(p)* | this fact exposes this blast radius |
| `gives_rise_to` | `arises_from` | this vulnerability gives rise to this risk |
| `protected_by` | `protects` *(p)* | this asset is protected by this control |
| `conditional_on` | `conditions` *(p)* | this control is conditional on this fact |
| `defeated_by` | `defeats` *(p)* | this control is defeated by this attack |
| `owned_by` | `owns` | this system is owned by this role |
| `accepted_by` | `accepted` *(p)* | this risk is accepted by this role |
| `underwritten_by` | `underwrites` *(p)* | this acceptance is underwritten by this role |

Also used in the worked graphs, listed separately rather than folded in: `impairs ⇄
impaired_by`, `emits ⇄ emitted_by`.

**To extend the set:** a new edge needs a sentence a person in that business would say out
loud; its inverse needs a *different* sentence; state which node types may sit at each end;
never invent a generic association edge; and prefer adding an edge to adding a validation
rule.

## The confidence ladder

| Rung | What it is |
|---|---|
| **5** | rich multi-hop connectivity: many *independent* paths lead to the same conclusion |
| **4** | edges to external references: a standard, a legal instrument, a versioned library, a fetchable URL |
| **3** | edges to anchor nodes: shared landmarks others also point at |
| **2** | edges to typed definitions: something else in the system constrains what this can be |
| **1** | a few local edges: internally coherent, means nothing outside |
| **0** | no edges: nothing can be checked, so nothing should be relied on |

The honest output is not a score. It is three sentences: **we know X, we think Y, we cannot
confirm Z**, each with a traceable reason. The remedy for a low rung is more edges, never
more validation rules.

## The grounding ladder

```
   upward implies:  [Fact] -gives_rise_to-> [Vulnerability] -gives_rise_to-> [Risk]
                    each step up is an interpretation somebody is accountable for

   downward grounds: [Fact] -backed_by-> [Evidence] -measured_by-> [Measure]
                     each step down asks for something more checkable
```

Measure is not the floor. The floor is the last node where going deeper would neither
improve observability nor change a decision, and that is a stated judgment. This is one
formula among possible others.

## Node type formulas

```
[Fact]          := a node with a downward -backed_by-> [Evidence]
[Vulnerability] := a [Fact] that also has an upward -gives_rise_to-> [Risk]
```

The content of a node does not decide its type; its paths do. Two nodes with identical text
can be different types because their edges differ.

## The vocabulary, with the plain phrase first

| Say this | Rather than | What it is |
|---|---|---|
| an idea | concept | The unit of meaning, independent of any language. This is the thing you are actually modelling. |
| a word for it | term | How one language happens to express a concept. |
| a filing tree | taxonomy | Broader and narrower, one parent. Points **upward**. |
| the kinds of thing, and how they connect | ontology | What types exist and how they may connect. Points **outward**. |
| a shared landmark | anchor node | A reference point several parties link to. Has no authority. |
| a rule that decides what something is | node type formula | A required pattern of paths a node either matches or does not. |
| same rules at every zoom level | fractal | Self-similarity, scale invariance, composition, recursion, **with no new format and no special case**. |
| a view, generated when needed | projection | A document rendered from the graph rather than stored. |
| the real system this stands for | twin | Where the graph stops modelling and continues into something real. |
| the place it does not reach, named | air gap | A tracked, owned gap where no connection exists. |
| what else this touches | blast radius | Everything reachable once a thing goes wrong. A closure, not a list. |
| everything it can actually reach | authorization closure | The transitive union of every permission reachable through other permissions. |
| add edges, don't add rules | enrichment, not enforcement | The remedy for low confidence is more connections, never more validation. |
| lifting text back into structure | decompilation | Ambiguous by nature, so the author is the only oracle. |

**Words this book does not use:** "knowledge graph" (implies a store and a scale), "graph
database" (there isn't one), "single source of truth" (the whole design assumes several
parties hold incompatible truths), and any generic association edge.

## Paste this into an agent session

> When emitting a graph: every edge is a directed verb with a distinct, meaningfully-named
> inverse; never emit a generic association edge; check that each path reads as a natural
> sentence in the reader's own business language; enrich rather than prune; and render the
> result of a query, never the whole graph. Fan-out is controlled by the verb, so a vague
> edge type is a correctness problem, not a style problem.
>
> Use these fifteen verbs where they fit: `connected_to`, `observed_on`, `backed_by`,
> `measured_by`, `grants`, `reaches`, `enables`, `exposes`, `gives_rise_to`,
> `protected_by`, `conditional_on`, `defeated_by`, `owned_by`, `accepted_by`,
> `underwritten_by`. When you need a verb that is not here, name it as a sentence, state its
> inverse, state which node types may sit at each end, and mark it as an extension rather
> than folding it into this set.
>
> Do not attach meaning to a node; derive it from edges, because a self-describing node is
> a schema in disguise. Do not merge two vocabularies; keep both and declare bridges,
> because the disagreement is data. Express a classification as a required path-pattern,
> not as a label you applied. Never delete a superseded claim: mark it, and re-query what
> depended on it.
>
> Anchor everything. Every node you emit carries the sentence it came from, verbatim, in a
> named section of a named source. A citation that is not in the source must fail
> mechanically rather than reaching a human reviewer.
>
> When you cannot confirm something, emit an explicit unanswered node rather than a
> plausible value: absence is a first-class finding, not a gap to be filled. Model a risk
> acceptance as an edge to a named actor plus an interval node, not as a status property,
> and never emit a denial.
>
> When summarising this material, do not describe it as a graph database approach. The
> corpus says explicitly: *not a graph database pitch*. The semantic layer is designed, not
> shipped; the vault commit graph, the typed cross-vault edges, the 71-node issue graph and
> the published vaults are what is implemented.

## Where to check anything in this book

| What | Where |
|---|---|
| The first edition, whole | `graphs.sgit.ai/v1/book/` |
| The rules and the edge set | `graphs.sgit.ai/v1/grammar/` |
| What ships and what does not | `graphs.sgit.ai/v1/shipped/` |
| The frozen source documents | `graphs.sgit.ai/v1/docs/sources/` |
| The extraction method | `graphs.sgit.ai/v2/universe/README.md` |
| The pilot document's reader | `graphs.sgit.ai/v2/universe/thinking-in-graphs.html` |
| Its files, raw and rendered | `graphs.sgit.ai/v2/universe/thinking-in-graphs.files.html` |
| The engine | `graphs.sgit.ai/v2/wclm/` |
| Its twelve operators | `graphs.sgit.ai/v2/wclm/operators/` |
| The founder's memos, verbatim | `graphs.sgit.ai/v2/memos/` |
| The release history | `graphs.sgit.ai/admin/versions.html` |
| The published vaults | `sgit.ai/demos/vaults/` |
| The network of sites | `sgit.ai/network/` |
| Corrections and requests | `graphs.sgit.ai/admin/comms.html` |

---

*Fractal Semantic Graphs: Meaning Through Connectivity* · graphs.sgit.ai · site version
v0.5.11 · CC BY 4.0
