# 4 · Anchors, not standards

*After this chapter you will know why merging two vocabularies is a destructive operation,
what to build instead, and what a bridge between two worlds looks like when it is a
first-class object somebody owns rather than a mapping table nobody maintains.*

---

Given two ontologies covering the same ground, the instinct is to merge them into one. An
ontology, in the plain phrasing this book prefers, is **the kinds of thing that exist and
how they may connect**. Two of them describing the same domain look like duplication, and
duplication looks like a problem.

The position here is that merging is a destructive operation, and what it destroys is the
finding.

> "ontologies are not folded into a single shared definition, **because that erases the
> disagreement**, they are kept intact and connected through anchor nodes… which is **how
> meaning actually travels across languages, cultures, biases, and political agendas**, by
> maintaining translations between definitions that each side still owns."

Read the last clause twice. *Each side still owns.* That is not a courtesy. It is the
property that makes the arrangement survive a change of personnel, a reorganisation, or a
falling-out.

## The three layers

The construction has three layers, and the separation between them is the whole design.

```
  3 · DECLARED BRIDGES
      explicit edges connecting formulas at specific points:
      "our 'material' corresponds to their 'reportable' under these
       conditions".
      owned by whoever declared them. revisable without renegotiating
      anything. wrong bridges are removable without touching either side.
                                   ^
                                   |
  2 · PER-PARTY FORMULAS
      each party classifies the shared nodes with its OWN rules.
      the chief information security officer's definition of a critical
      risk, the chief financial officer's, the regulator's. three
      different answers over one set of facts, each internally
      consistent, each inspectable.
                                   ^
                                   |
  1 · SHARED FACTS, OWNED BY NOBODY
      the factual graph. this account exists. this bucket is public.
      this provision is in force. nobody has to agree about what any of
      it MEANS in order to agree that it is the case.
```

*Figure 4.1 · The three-layer arrangement. Layer one is shared, layer two is owned, layer
three is negotiated one bridge at a time.*

<div class="claim">

Parties can disagree about meaning while still agreeing about facts, which is the only
stable basis for working together.

</div>

The founder's version is shorter: *"I always err on the side of understanding versus a
standardized schema… instead of folding it, you make it compatible, which is why you need
an ontology of ontologies."*

Three consequences fall out of the separation, and they are the reason to build it this
way rather than as a shared model with per-party extensions.

**A disagreement becomes localised.** When two parties disagree, the disagreement is a
specific bridge, or the absence of one, at a named point. You can look at it. You can date
it. You can assign it. In a merged model a disagreement is diffuse: it shows up as a field
that means something different depending on who filled it in, and nobody can point at it.

**A correction propagates without renegotiation.** Change a formula in layer two and every
answer that used it moves. Nobody else's formula changes. In a merged model a correction
is a schema change, which means a meeting.

**A third party can contribute without permission.** A bridge is an edge between two nodes
that neither party owns. Somebody outside both organisations can assert one, and be wrong,
and be corrected, without either organisation touching its own model. This is the single
biggest practical difference and it is easy to miss because nothing about it is technical.

## The anchor node, precisely

An anchor node is well-connected, well-maintained, well-known, and has **no special
authority**. Chapter three introduced it as a rule about edges. Here is what it is as an
object.

An anchor is a meeting point that several parties independently point at. `schema.org` is
one. A published concept scheme such as EuroVoc or Wikidata is one. So is a named
regulation, a named standard, a named library at a pinned version, and, inside a company,
the chart of accounts.

Three things an anchor is not:

**Not an authority.** You point at it; you do not become it. The difference between
`similar_to schema:reviewBody` and `is a schema:Review` is the difference between a
disputable claim and a conformance assertion. The first can be partial and can be argued
with. The second is all-or-nothing and is usually false by the second field.

**Not a merge target.** Two parties both pointing at an anchor have not merged. They have
each declared a relationship to a third thing, which is precisely what lets them compute
an overlap without agreeing.

**Not necessarily well-designed.** An anchor earns its role by being *pointed at*, not by
being good. A widely-used vocabulary with known flaws is a better anchor than an elegant
one nobody references, because the whole value is in the convergence.

Partial mapping is the normal case, not a defect. And because nodes cost almost nothing,
some exist purely to anchor a query, which matters most as soon as you are working across
languages and cultures, where the anchor is often the only thing two sides share.

## A nuance survives translation because it was never stored in a word

The unit of meaning is a **concept**, not a word. A concept is language-independent: it
carries one preferred label per language plus alternates, and it relates to other concepts
as broader, narrower, or related. A **term** is how one language happens to express it.

Once meaning lives in the concept rather than the term, a whole class of failure
disappears by construction. You are no longer translating word to word and hoping the
connotation survives.

The unexpected result is the better story. Rendering a set of concepts into Portuguese
produced a bad Portuguese label, and the diagnosis was that **the English word was
wrong**. Naming a concept in a second language forces a decision that the source language
let you avoid. Where two languages' induced graphs diverge, that divergence is either an
error or a genuine lexical gap, and either way **it is a finding**, not noise to be
smoothed away.

This is the same shape as everything else in the chapter: the disagreement is the data.

## Bridges you can watch being used

The first edition argued for bridges and had none running. The second edition has two
kinds, both authored, both reviewable, both wired into a working engine. They are worth
looking at because between them they show the two directions a bridge can point.

### Senses: what your word means in other worlds

A **senses register** holds, for a word, the meaning this document gives it and three to
five meanings other industries give it. It is a small file, authored by an agent and
corrected by a human, and it currently covers four words:

| Word | Senses held |
|---|---|
| `graph` | the network graph (this document) · a chart of data (business reporting) · the graph of a function (school mathematics) · graph paper (stationery) · the social graph (social platforms) |
| `node` | a point in a graph (this document) · Node.js the runtime (software tooling) · a lymph node (medicine) · a stem node (botany) · a host in a cluster |
| `fractal` | this document's sense · the mathematical sense · the artistic sense · the fractal antenna · the figurative sense |
| `task` | this document's sense · project management · the operating system sense · a household chore |

The document's own sense is always first, and it is always the default. Switching away
from it is explicit, visible and reversible, which is the register's most important
property: it does not decide what you meant, it asks.

The `task` row is there for a reason. The corpus's own foundational essay uses "task" as
its example of a word whose meaning changes with culture, so the register carrying it is
the corpus's argument applied to the corpus.

### Analogies: how your concept is said in their world

The **analogies register** points the other way. Instead of asking what your word means
elsewhere, it asks how *your concept* is said in the listener's world, and it carries the
reason.

It came from a memo of 26 August 2026, asking for it by name:

> "it's interesting because then what we need to do is we need to find analogies, which
> actually is something we haven't talked about. But you know, analogies or or or
> equivalencies, right? So, how do we then connect two nodes? Sorry, two concepts. Two
> concepts that may they might come from different places, but we need to use it to reflect
> that. So, a good example of I don't know if you talk about graphs of graphs. Maybe for
> the financial, we need to talk about, you know, some type of data or spreadsheets of
> spreadsheets, right? Because actually, in the financial world, we do have spreadsheets of
> spreadsheets of spreadsheets of spreadsheets, right?"

The register that answers it holds **sixteen mappings across three audiences**: six for
finance, five for operations, five for medicine. Each entry names one of this document's
concepts, the audience's own concept, and the why. Four of them, quoted from the file:

| This document's concept | Said to somebody from finance | Why |
|---|---|---|
| graphs of graphs | spreadsheets of spreadsheets | "finance nests workbooks inside workbooks inside consolidation packs, the same structure at every zoom, and everyone in the room has lived it" |
| node | a cell with a name | "a named cell means nothing alone; its formula references, what it reads, what reads it, are what make it matter" |
| meaning through connectivity | the consolidation trail | "a number in the group accounts IS its roll-up: subsidiary lines, eliminations, adjustments, remove the trail and the number is just ink" |
| anchor node | the chart of accounts | "the shared reference everyone maps their local codes to, so two subsidiaries can disagree locally and still consolidate" |

*Figure 4.2 · Four of the sixteen entries in `v2/wclm/analogies.json`, quoted verbatim
including their stated reasons.*

Notice what the last row does. The analogy for anchor node **is an anchor node**: the
chart of accounts is exactly a well-known reference point that several parties map their
local codes to, with no authority of its own, so that two subsidiaries can disagree
locally and still consolidate. The bridge and the thing it bridges to are the same shape,
which is a small piece of evidence that the concept is real rather than invented for this
book.

And the register is honest where it is empty. When an audience has no analogy authored for
a concept, the engine says "no analogy authored yet" rather than improvising one. That is
the same rule as the ghosted edge in chapter one: the absence is drawn.

### Both registers are training data, and the training is editing

The thing to take from these two files is not their content. It is what changing them
does.

Both are **authored inputs**, marked as agent-proposed and human-reviewed, and both are
read by a running engine. Correcting an analogy is not filing a bug against a model. It is
editing a file, after which the engine's answer changes, deterministically, and the change
is visible in the diff. The founder's own framing, from the same memo:

> "the corrections is where it gets interesting because in principle the correction should
> be that we need better meaning, we need better objects, we need we're missing nodes, or
> we have to add some corrections to it, actually manually or like let's say manual
> overrides, which is kind of what again the learning the pre-trained does to an LLM"

Chapter eleven takes that seriously and shows what it means for a system's weights to be
stated formulas over edited graph inputs rather than fitted numbers.

## Enrichment, not enforcement

The rule that ties the chapter together, and the one most often abandoned under pressure.

**The remedy for low confidence is more edges, never more validation rules.** The graph
grows; it does not constrain.

The reason is structural rather than stylistic. A validation rule works by rejecting
something, which means somebody whose data is rejected has two choices: change their
reality, or misrepresent it. In practice they misrepresent it, because their reality is
not yours to change. The schema-first failure mode is therefore *invisible*: a conforming
record that is false. The graph-first failure mode is *visible*: a sparse region you can
point at and count.

| | Schema-first | Graph-first |
|---|---|---|
| Meaning is | declared, in advance, centrally | discovered, at query time, locally |
| Disagreement is | a conflict to resolve before you start | data, and often the most useful data you have |
| Crossing a boundary | forces conformity, or breaks | computes an overlap, which may be partial |
| Low confidence is fixed by | more validation rules | more edges |
| A third party can | request a schema change | add a mapping edge without touching either node |
| Failure mode | everyone lies about their process to fit the schema | the graph is thin where nobody did the work |

That asymmetry of failure modes is most of the argument. It is not that the graph is more
accurate. It is that when the graph is wrong, you can see where.

<div class="warn">

**And the honest cost.** Enrichment does not stop anything. There are systems that need a
gate, and a gate is a schema. The right answer in a real organisation is usually both, at
different layers: a schema at the point where you control both ends and need enforcement,
and a graph at the boundary where you control one end and need understanding. Saying
"graph everywhere" would be the same mistake as "schema everywhere", made in the other
direction.

</div>

<div class="note">

**Where the live estate demonstrates this.** The senses register is
`v2/wclm/senses.json` and the analogies register is `v2/wclm/analogies.json`; both are
readable raw and rendered through the operator explorer at
`graphs.sgit.ai/v2/wclm/operators/`. The engine that consumes them is at
`graphs.sgit.ai/v2/wclm/`: the sense picker appears for any prompt word the register
knows, and the audience picker restates the answer in the listener's own concept with the
reason carried. The three-layer arrangement is argued at
`graphs.sgit.ai/v1/depth/#ontologies`.

</div>
