# Confidence, evidence and reality

After this chapter you will be able to say how much weight a claim will bear, and to show
your working: not a score, but a path somebody else can walk and disagree with.

Thirteen concepts. The region has two ladders in it, and they are not the same ladder,
which is the single most common misreading of this material.

## The region, drawn

<!-- gen:map:confidence -->

```
  A NAMED ABSENCE BEATS A HIDDEN ONE
     ◀── measures         ── map the gaps, not only the evidence
     ──▶ grounds          ── we know X, we think Y, we cannot confirm Z
     ──▶ generalises      ── the air gap
     ◀── requires         ── we know X, we think Y, we cannot confirm Z

  MAP THE GAPS, NOT ONLY THE EVIDENCE
     ──▶ implements       ── enrichment, not enforcement
     ──▶ grounds          ── the leverage point

  THE TWIN
     ◀── requires         ── the floor
     ──▶ bounds           ── everything modelled must be real
     ◀── requires         ── the air gap

  and the rest of this region's own connections:
     enrichment, not enforcement ──remedies──▶ the confidence ladder
     downward grounds, upward implies ──grounds──▶ the grounding ladder
     the floor ──bounds──▶ the grounding ladder
     the blast radius ──measures──▶ the confidence ladder
     the blast radius ──computes──▶ the leverage point
```

<!-- /gen:map:confidence -->

## Two ladders, and what each one is for

The **confidence ladder** measures connectivity. Six rungs, from a node on its own, through
local edges, typed definitions, anchor nodes and external references, to rich multi-hop
connectivity. It answers *how much can this bear*, and the answer is computable: count the
edges, measure the depth of traversal to anchor nodes, weigh the authority of what is
reached. There is one qualification on the top rung and it is load-bearing: weight by
independence, not by count. Ten citations of one source are one source.

The **grounding ladder** is something else entirely. It is a node type formula: fact grounds
to evidence, evidence grounds to measure, measure is taken on a twin, a twin is grounded in
its connection to reality. It answers *is this real*, and it runs downward. Walk it upward
instead and you get a different job: a fact becomes a vulnerability only when somebody draws
an edge to a risk. The same fact, unchanged in content, changes type because its paths
changed.

The estate is careful to say the grounding ladder is **one** formula among possible others.
A ladder presenting itself as *the* ladder would be the schema-first move at one remove.

## Where the ladder stops

A grounding chain that never terminates is a philosophy problem, not an engineering one, and
the estate pins it with a test rather than a taste. The floor is the last node where going
deeper would neither improve observability nor change a decision. Different analyses bottom
out at different depths, and the test is still checkable.

There is a second subtlety worth carrying: a measure is not the floor. A measure is a
measurement *of* something, and that something is what connects it to reality. So grounding
does not bottom out in a value; it bottoms out in a representation that touches the real
world, and how well that representation touches it is itself a measure.

## The gaps are the output

The strongest idea in this region is also the cheapest to implement and the least often
done. Most systems list what they have. An honest one also lists what it lacks.

If you need ten pieces of evidence and hold three, that is not a failure state to be hidden
behind a progress bar. It is a fact with three uses: it quantifies confidence, it names the
seven things to go and get, and it makes the business case for connecting them, because now
the missing dots have names. An absence that is stated can be counted, queried, assigned
and closed. An absence that is hidden silently supports whatever rests on it.

The operational sibling is the **air gap**: the place where the graph cannot reach the real
system, because there is no interface and someone re-keys the data on a Thursday. The
instinct is to leave that part of the diagram blank or to draw it as though it connects.
Neither. Hold a tracked gap with a name, an owner and a frequency, and it becomes something
that can be counted, argued about and funded.

## The discipline that keeps it honest

Two rules stop this region from turning into a brainstorm.

**Enrichment, not enforcement.** When confidence is low the remedy is more edges, never more
validation rules. Small to state and hard to hold on to, and it is what separates this from
every schema validator you have used.

**Everything modelled must be real.** No speculative risks, no hypothetical systems. Either
there is evidence and the thing exists, or it is not in the graph. Threat modelling
accumulates plausible risks that never materialise and become noise; this rule removes them
by construction, and the constraint is the source of the power rather than a limit on it.

## The entries

<!-- gen:entries:confidence -->

### the confidence ladder {#confidence-ladder}

`concept` · **How much a claim will bear is computable from how richly it is connected: no edges, local edges, typed definitions, anchor nodes, external references, rich multi-hop paths.**

> the answer is always computable from the graph: count the edges, measure the depth of
> traversal to anchor nodes, assess the authority of the nodes reached
>
> — *Thinking in Graphs: Meaning Through Connectivity*, § The Confidence Spectrum

*Also called:* the confidence spectrum

*Near, but not:* probability: the ladder is not a likelihood, it is a reachability measure

**In.** [Meaning through connectivity](#meaning-through-connectivity) determines this. [Enrichment, not enforcement](#enrichment-not-enforcement) remedies this. [The blast radius](#blast-radius) measures this. [The chain of custody](#provenance-chain) grounds this. [The WCLM, a deterministic transformer](#wclm) implements this. [Weight by independence, not by count](#weight-by-independence) bounds this.

*Where it shows up:* Six rungs in the first edition; the WCLM applies it to its own output as an anchoring declaration.

```
meaning through connectivity · enrichment, not enforcement · the blast radius
                        determines, measures, remedies
                                      │
                                      ▼
                        ╭───────────────────────────╮
                        │   THE CONFIDENCE LADDER   │
                        ╰───────────────────────────╯
```

### the grounding ladder {#grounding-ladder}

`concept` · **One node type formula: fact grounds to evidence to measure to twin to reality, and a fact becomes a vulnerability only by an upward path to a risk.**

> `Vulnerability := a Fact (grounded below) AND an upward path to a Risk.`
>
> — *The Grounding Ladder*, § The Formula, as Paths

**In.** [Classification is a query, not a judgment](#node-type-formula) generalises this. [Downward grounds, upward implies](#two-directions) grounds this. [The floor](#the-floor) bounds this. [Every paragraph is a graph](#every-paragraph-is-a-graph) requires this. [A register for every accepting role](#registers-of-registers) requires this.

*Where it shows up:* Stated explicitly as ONE formula among possible others, which is what stops it becoming a schema.

```
 classification is a query, not a judgment · downward grounds, upward implies
                                  the floor
                         bounds, generalises, grounds
                                      │
                                      ▼
                         ╭──────────────────────────╮
                         │   THE GROUNDING LADDER   │
                         ╰──────────────────────────╯
```

### downward grounds, upward implies {#two-directions}

`claim` · **Walking down asks whether something is real; walking up asks what it means and why it matters. The two directions do different jobs.**

> Downward is grounding: is this real, does it reach a measure, a twin, and ultimately
> reality? Upward is classification and implication: what is this node, and why does it
> matter?
>
> — *The Grounding Ladder*, § Two Directions, Two Jobs

**Out.** This grounds [the grounding ladder](#grounding-ladder). This grounds [classification is a query, not a judgment](#node-type-formula).

*Where it shows up:* A node with only upward paths is a hypothesis; with only downward paths, a fact on the shelf.

```
                   ╭──────────────────────────────────────╮
                   │   DOWNWARD GROUNDS, UPWARD IMPLIES   │
                   ╰──────────────────────────────────────╯
                                      │
                                   grounds
                                      ▼
       the grounding ladder · classification is a query, not a judgment
```

### the floor {#the-floor}

`concept` · **Grounding terminates at the last node where going deeper would neither improve observability nor change a decision. It is a stated judgement, not a node type.**

> the floor is the last node where going deeper would neither improve observability nor change
> a decision.
>
> — *The Grounding Ladder*, § What the Floor Actually Is

**Out.** This bounds [the grounding ladder](#grounding-ladder). This requires [the twin](#twin).

*Where it shows up:* One of the two places the source names where subjectivity can leak back into a computable formula.

```
                              ╭───────────────╮
                              │   THE FLOOR   │
                              ╰───────────────╯
                                      │
                               bounds, requires
                                      ▼
                       the grounding ladder · the twin
```

### the blast radius {#blast-radius}

`concept` · **Everything reachable from a thing once it goes wrong: a closure, not a list, and the thing confidence is actually about.**

> the confidence here is understanding the blast radius, for example for a vulnerability,
> understanding the impact of a change.
>
> — *Confidence Through Evidence: Blast Radius, And Mapping The Gaps*, § Confidence Is Understanding The Blast Radius

**Out.** This measures [the confidence ladder](#confidence-ladder). This computes [the leverage point](#leverage-point).

**In.** [Price the next hop](#explore-by-degrees) measures this.

*Where it shows up:* The WCLM scores it literally: blast radius is the degree of the winning meaning, and it is in the arithmetic.

```
                              price the next hop
                                   measures
                                      │
                                      ▼
                           ╭──────────────────────╮
                           │   THE BLAST RADIUS   │
                           ╰──────────────────────╯
                                      │
                              computes, measures
                                      ▼
                  the confidence ladder · the leverage point
```

### map the gaps, not only the evidence {#map-the-gaps}

`method` · **Three of the ten pieces of evidence you need is information: it quantifies confidence, names the seven to go and get, and makes the case to fund them.**

> You do not just map what you have, you map what you need, and this is the thing we do not do
> a lot in products: we do not list what is missing, so we can have assurance of how confident
> we are.
>
> — *Confidence Through Evidence: Blast Radius, And Mapping The Gaps*, § Map What You Have, And What Is Missing

**Out.** This measures [a named absence beats a hidden one](#named-absence). This implements [enrichment, not enforcement](#enrichment-not-enforcement). This grounds [the leverage point](#leverage-point).

*Where it shows up:* The Article 26(5) example: the output of the exercise is the five questions nobody could answer.

```
                 ╭─────────────────────────────────────────╮
                 │   MAP THE GAPS, NOT ONLY THE EVIDENCE   │
                 ╰─────────────────────────────────────────╯
                                      │
                        grounds, implements, measures
                                      ▼
       a named absence beats a hidden one · enrichment, not enforcement
                              the leverage point
```

### a named absence beats a hidden one {#named-absence}

`position` · **An absence that is stated can be counted, queried, assigned and closed; an absence that is hidden silently supports whatever rests on it. The lack of a fact is itself a fact.**

> Three of ten pieces of evidence is information. An absence that is stated can be queried,
> assigned and closed; an absence that is hidden silently supports whatever rests on it.
>
> — *The lexicon, in scopes*, § named-absence

> lack of evidence is evidence, lack of fact is a fact.
>
> — *Confidence Through Evidence: Blast Radius, And Mapping The Gaps*, § The Thesis: Confidence Is Based On Evidence — the absence of evidence is evidence

*Also called:* honest uncertainty · the ghosted node

*Near, but not:* a missing value, which is the absence of a record rather than a recorded absence

*The corpus also says it like this:* “mapping the gaps”

**Out.** This grounds [we know X, we think Y, we cannot confirm Z](#honest-uncertainty). This generalises [the air gap](#air-gap).

**In.** [Map the gaps, not only the evidence](#map-the-gaps) measures this. [We know X, we think Y, we cannot confirm Z](#honest-uncertainty) requires this. [Quote-anchored extraction](#quote-anchored-extraction) implements this. [What ships, what is argued](#what-ships-what-is-argued) carries this. [A node alone means nothing](#node-alone-means-nothing) grounds this. [The fifteen established edges](#the-fifteen-edges) carries this.

*Where it shows up:* Drawn, not omitted: the Risk Graph Explorer ghosts unanswered edges rather than leaving them out.

```
                     map the gaps, not only the evidence
    we know X, we think Y, we cannot confirm Z · quote-anchored extraction
                        implements, measures, requires
                                      │
                                      ▼
                  ╭────────────────────────────────────────╮
                  │   A NAMED ABSENCE BEATS A HIDDEN ONE   │
                  ╰────────────────────────────────────────╯
                                      │
                             generalises, grounds
                                      ▼
           we know X, we think Y, we cannot confirm Z · the air gap
```

### the air gap {#air-gap}

`concept` · **Where the graph cannot reach a real system, it holds an explicit, tracked gap with a name, an owner and a frequency, rather than a blank or a drawn connection it does not have.**

> this needs to be manually updated once a week, but the point is we now know where that gap
> is.
>
> — *A graph at every boundary*, § And where it cannot reach, name the gap

**Out.** This requires [the twin](#twin). This demonstrates [a map is a graph that gained position](#map-is-a-graph-with-position).

**In.** [A named absence beats a hidden one](#named-absence) generalises this.

*Where it shows up:* The sharpest Wardley map in the material: the ends are solved and the middle is people. Still unrendered.

```
                      a named absence beats a hidden one
                                 generalises
                                      │
                                      ▼
                             ╭─────────────────╮
                             │   THE AIR GAP   │
                             ╰─────────────────╯
                                      │
                            demonstrates, requires
                                      ▼
               the twin · a map is a graph that gained position
```

### enrichment, not enforcement {#enrichment-not-enforcement}

`position` · **The remedy for low confidence is adding edges, never adding validation rules. The graph grows; it does not constrain.**

> When the system identifies low-confidence nodes, the response is not validation failure. It
> is an opportunity for enrichment
>
> — *Thinking in Graphs: Meaning Through Connectivity*, § Enrichment, Not Enforcement

*Near, but not:* validation, which is enforcement wearing a helpful name

**Out.** This remedies [the confidence ladder](#confidence-ladder). This contradicts [declared meaning](#declared-meaning).

**In.** [Map the gaps, not only the evidence](#map-the-gaps) implements this.

*Where it shows up:* Small to state and hard to hold on to: it is what separates this from every schema validator.

```
                     map the gaps, not only the evidence
                                  implements
                                      │
                                      ▼
                     ╭─────────────────────────────────╮
                     │   ENRICHMENT, NOT ENFORCEMENT   │
                     ╰─────────────────────────────────╯
                                      │
                            contradicts, remedies
                                      ▼
                   the confidence ladder · declared meaning
```

### we know X, we think Y, we cannot confirm Z {#honest-uncertainty}

`position` · **The honest output of such a system is not a score but three sentences, each with a reason you can trace.**

> **Generate honest assessments**: "We know X. We think Y. We cannot confirm Z."
>
> — *Thinking in Graphs: Meaning Through Connectivity*, § What the System Can Observe

**Out.** This requires [a named absence beats a hidden one](#named-absence).

**In.** [A named absence beats a hidden one](#named-absence) grounds this. [The five Reviews](#five-reviews) demonstrates this.

*Where it shows up:* The WCLM answers nonsense with nothing, which is the same posture executed by a machine.

```
            a named absence beats a hidden one · the five Reviews
                            demonstrates, grounds
                                      │
                                      ▼
              ╭────────────────────────────────────────────────╮
              │   WE KNOW X, WE THINK Y, WE CANNOT CONFIRM Z   │
              ╰────────────────────────────────────────────────╯
                                      │
                                   requires
                                      ▼
                      a named absence beats a hidden one
```

### the leverage point {#leverage-point}

`claim` · **The node whose change propagates widest is often low in the graph and unremarkable, and it is where attention and money should go.**

> the places where you have the highest risk and the highest impact are almost the places of
> highest leverage.
>
> — *Confidence Through Evidence: Blast Radius, And Mapping The Gaps*, § The Leverage Point

**Out.** This extends [direction bounds the result, not the graph](#direction-bounds-fan-out).

**In.** [The blast radius](#blast-radius) computes this. [Map the gaps, not only the evidence](#map-the-gaps) grounds this.

*Where it shows up:* The evidence graph does not only measure confidence: it locates where to spend.

```
            the blast radius · map the gaps, not only the evidence
                              computes, grounds
                                      │
                                      ▼
                          ╭────────────────────────╮
                          │   THE LEVERAGE POINT   │
                          ╰────────────────────────╯
                                      │
                                   extends
                                      ▼
                  direction bounds the result, not the graph
```

### the twin {#twin}

`concept` · **Where the graph stops modelling and continues into a real system. Every place the graph would otherwise stop is a twin, and whether a given twin actually reaches reality is itself a measurable fact.**

> the power of the twin is that we always arrive at the twin, so the edges and the peaks and
> the endpoints of the graph continue into the twin, and then ideally into reality.
>
> — *Digital Twins of Anything, and the Discipline of Reality*, § The Twin Is the Endpoint of the Graph

> whether we can continue to reality is a measurable fact, it is connected or it is not.
>
> — *Digital Twins of Anything, and the Discipline of Reality*, § Connectedness Is a Measurable Fact — whether it reaches reality is a measurable fact

*Near, but not:* a control mapping, which attaches to a document about the thing

*The corpus also says it like this:* “the interface to reality”

**Out.** This bounds [everything modelled must be real](#reality-discipline).

**In.** [The floor](#the-floor) requires this. [The air gap](#air-gap) requires this.

*Where it shows up:* A twin can be made of an organisation, an inbox, a person, a behaviour, the weather, even luck.

```
                           the floor · the air gap
                                   requires
                                      │
                                      ▼
                               ╭──────────────╮
                               │   THE TWIN   │
                               ╰──────────────╯
                                      │
                                    bounds
                                      ▼
                       everything modelled must be real
```

### everything modelled must be real {#reality-discipline}

`position` · **No hypothetical risks, no speculative systems: either there is evidence and the thing exists, or it is not in the graph.**

> in this model, everything has to be relevant, everything has to be a fact, everything has to
> exist, because it is based on reality.
>
> — *Digital Twins of Anything, and the Discipline of Reality*, § The Discipline of Reality

**Out.** This refuses [the blob](#the-blob).

**In.** [The twin](#twin) bounds this.

*Where it shows up:* The rule that keeps a risk graph from turning into a brainstorm.

```
                                   the twin
                                    bounds
                                      │
                                      ▼
                   ╭──────────────────────────────────────╮
                   │   EVERYTHING MODELLED MUST BE REAL   │
                   ╰──────────────────────────────────────╯
                                      │
                                   refuses
                                      ▼
                                   the blob
```

<!-- /gen:entries:confidence -->

## Where the estate demonstrates this

The Risk Graph Explorer runs the palette this region implies: green is assurance, amber is
exposure, and a ghosted edge is a question nobody has answered. The unanswered edge is
drawn, not omitted, which is the named absence made visual.

The Article 26(5) worked example is the sharper demonstration. One provision, one
deployment, carried from a running system up to a board decision and back down, and the
output of the exercise is not the risks. It is the five questions nobody could answer.

And the estate applies the ladder to its own extraction. Every section of the pilot document
with prose either yields anchored nodes or is recorded as deliberately empty with a reason.
A recorded empty section is a finding; a silent one is a hole.
