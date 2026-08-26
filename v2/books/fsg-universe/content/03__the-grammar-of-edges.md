# The grammar of edges

After this chapter you will be able to look at a graph somebody else drew and say, with
reasons, which of its edges are wrong. You will also know why the estate treats a vague
edge as a correctness bug rather than a matter of taste.

Twelve concepts. This is the region a reader can apply tomorrow, and it is the one that
survives disagreement with everything else in the book: even a reader who rejects the
thesis outright will draw better graphs after it.

## The region, drawn

<!-- gen:map:grammar -->

```
  EVERY EDGE IS A VERB
     ──▶ requires         ── the inverse is a different relationship
     ──▶ refuses          ── the generic association edge is banned
     ◀── measures         ── a path must read as a sentence
     ◀── implements       ── the fifteen established edges

  THE INVERSE IS A DIFFERENT RELATIONSHIP
     ──▶ enables          ── direction bounds the result, not the graph
     ◀── requires         ── classification is a query, not a judgment
     ◀── requires         ── a path must read as a sentence

  THE BLOB
     ◀── bounds           ── direction bounds the result, not the graph
     ◀── contradicts      ── rich nodes are good
     ◀── remedies         ── build wide, find the few, flip
     ◀── remedies         ── never render the whole graph

  and the rest of this region's own connections:
     queries are walked, not written ──implements──▶ never render the whole graph
     queries are walked, not written ──extends──▶ build wide, find the few, flip
     the generic association edge is banned ──bounds──▶ direction bounds the result, not the graph
     a path must read as a sentence ──grounds──▶ queries are walked, not written
     the fifteen established edges ──refuses──▶ the generic association edge is banned
     rich nodes are good ──requires──▶ never render the whole graph
```

<!-- /gen:map:grammar -->

## Why a verb, and why two of them

If meaning is what a node reaches, then a traversal has to be able to tell one hop from
another, and an edge with no verb tells you nothing. That is the first rule and it is not
aesthetic: an edge that carries no constraint cannot narrow a search, so it costs fan-out
and buys nothing. Every generic edge you add makes every query worse.

The second rule is the one that surprises people. An edge and its inverse are not the same
relationship walked backwards. A system has one owner; an owner has forty systems. Walking
out from the system is a step and walking out from the owner is an explosion. Because the
two directions are different relationships with different fan-out, a query can filter on
one of them, and filtering at every hop is what stops the result growing combinatorially.
The consequence is the sentence worth memorising: **the size of the result is bounded by
the number of peaks, not by the fan-out of the graph.**

Then a test anybody can run without tooling. Read the path aloud. If it does not sound
like something a person in that business would say, the edges are wrong. And the test has
a second half that is easy to skip: it has to read in the *reader's* language, not yours. A
path that is beautiful to an architect and meaningless to a regulator has the wrong verbs
on it for that reader, and the remedy is not renaming the edges but adding the ones that
reader's question needs.

## The blob, and the three answers to it

Everyone who has drawn a semantic graph has produced the hairball, and the usual response
is to prune. The estate's position is that pruning solves the picture by destroying the
asset, because the blob is a rendering failure being mistaken for a modelling failure.

Three answers, and they compose. **Rich nodes are good**: keep every relationship, because
richness is what the graph is for. **Build wide, find the few, flip**: capture the universe,
run the question, then re-root the query at the handful of nodes it found and walk out from
there. **Never render the whole graph**: what appears on screen is the result of a query,
always, and a diagram of everything is rarely useful where one node with its neighbours
always is.

The estate then made the third one mechanical. If navigating hop by hop *is* writing a
query, then the trail a reader walks can be recorded, edited as a row of steps, generalised
one step at a time and re-run. Queries are not written. They are walked.

## The entries

<!-- gen:entries:grammar -->

### every edge is a verb {#edge-is-a-verb}

`method` · **An edge is not a line but a claim, and a claim needs a verb, stated in both directions.**

> the way I create graphs, they are always a two-way relationship and always to do with verbs.
>
> — *Visualising Semantic Graphs: Avoid The Blob, Use Verb Edges, And Flip The Subgraph*, § Two-Way Verb Edges, And Never Relates-To

*Near, but not:* a labelled edge: a label is not yet a verb, and a verb without a distinct inverse is half an edge

**Out.** This requires [the inverse is a different relationship](#distinct-inverse). This refuses [the generic association edge is banned](#banned-generic-edge).

**In.** [Discovered meaning](#discovered-meaning) requires this. [A path must read as a sentence](#path-reads-as-a-sentence) measures this. [The fifteen established edges](#the-fifteen-edges) implements this. [The schema is the graph's own review pack](#schema-view) measures this.

*Where it shows up:* The fifteen-edge vocabulary; the WCLM's verbs register, which resolves displayed inverses back to stored direction.

```
             discovered meaning · a path must read as a sentence
                        the fifteen established edges
                        implements, measures, requires
                                      │
                                      ▼
                         ╭──────────────────────────╮
                         │   EVERY EDGE IS A VERB   │
                         ╰──────────────────────────╯
                                      │
                              refuses, requires
                                      ▼
                   the inverse is a different relationship
                    the generic association edge is banned
```

### the inverse is a different relationship {#distinct-inverse}

`method` · **An inverse is not the same edge walked backwards: it has a different name, a different reading and a different fan-out, and that asymmetry is what bounds traversal.**

> The inverse of an edge is not the same edge walked backwards; it is a different, meaningful
> relationship.
>
> — *Directed Edges, Inward and Outward Paths, and Query Paths*, § Why Inward and Outward Must Differ

**Out.** This enables [direction bounds the result, not the graph](#direction-bounds-fan-out).

**In.** [Every edge is a verb](#edge-is-a-verb) requires this. [Classification is a query, not a judgment](#node-type-formula) requires this. [A path must read as a sentence](#path-reads-as-a-sentence) requires this.

*Where it shows up:* Brief 28 turned it into navigation: click a node and read what points at it, in English.

```
       every edge is a verb · classification is a query, not a judgment
                        a path must read as a sentence
                                   requires
                                      │
                                      ▼
               ╭─────────────────────────────────────────────╮
               │   THE INVERSE IS A DIFFERENT RELATIONSHIP   │
               ╰─────────────────────────────────────────────╯
                                      │
                                   enables
                                      ▼
                  direction bounds the result, not the graph
```

### the generic association edge is banned {#banned-generic-edge}

`position` · **A generic association edge constrains nothing, so it cannot narrow a traversal: it costs fan-out and buys nothing.**

> You can never have relates-to, because relates-to is meaningless, two things always relate
> to each other. The more granular the edge, the better the query you can write.
>
> — *Visualising Semantic Graphs: Avoid The Blob, Use Verb Edges, And Flip The Subgraph*, § Two-Way Verb Edges, And Never Relates-To

*Near, but not:* a weak edge, which still says something, where a generic edge says nothing

**Out.** This bounds [direction bounds the result, not the graph](#direction-bounds-fan-out).

**In.** [Every edge is a verb](#edge-is-a-verb) refuses this. [The fifteen established edges](#the-fifteen-edges) refuses this.

*Where it shows up:* Broken by the project's own shipped configuration, and narrated rather than quietly fixed.

```
             every edge is a verb · the fifteen established edges
                                   refuses
                                      │
                                      ▼
                ╭────────────────────────────────────────────╮
                │   THE GENERIC ASSOCIATION EDGE IS BANNED   │
                ╰────────────────────────────────────────────╯
                                      │
                                    bounds
                                      ▼
                  direction bounds the result, not the graph
```

### a path must read as a sentence {#path-reads-as-a-sentence}

`method` · **If a traversal does not read as natural language in the reader's own tongue and business context, the edges are wrong.**

> the path should read in English, or not even in English, it should read in the language and
> the culture and the business context we are talking about.
>
> — *Graph Path Properties: Reading as Language*, § Paths Should Read as Language

*Also called:* the sentence test

**Out.** This measures [every edge is a verb](#edge-is-a-verb). This requires [the inverse is a different relationship](#distinct-inverse). This grounds [queries are walked, not written](#path-query-is-walked). This enables [meaning travels by translation, not agreement](#meaning-travels-by-translation).

*Where it shows up:* The cheapest quality check in the estate: read the paths aloud and the bad edges announce themselves.

```
                    ╭────────────────────────────────────╮
                    │   A PATH MUST READ AS A SENTENCE   │
                    ╰────────────────────────────────────╯
                                      │
                         grounds, measures, requires
                                      ▼
        every edge is a verb · the inverse is a different relationship
                       queries are walked, not written
```

### direction bounds the result, not the graph {#direction-bounds-fan-out}

`claim` · **Because each hop filters on edge type and direction, multi-seed queries converge on a handful of peaks instead of exploding.**

> The size of the result is then bounded by the number of peaks, not by the fan-out of the
> graph.
>
> — *Directed Edges, Inward and Outward Paths, and Query Paths*, § Why This Prevents the Explosion of Nodes

**Out.** This bounds [the blob](#the-blob).

**In.** [The inverse is a different relationship](#distinct-inverse) enables this. [The generic association edge is banned](#banned-generic-edge) bounds this. [The leverage point](#leverage-point) extends this. [Pinned peaks, free field](#pinned-peaks) implements this.

*Where it shows up:* The reader's paths-to-peaks view gold-lines the shortest route from a selection to every visible summit.

```
                   the inverse is a different relationship
         the generic association edge is banned · the leverage point
                           bounds, enables, extends
                                      │
                                      ▼
              ╭────────────────────────────────────────────────╮
              │   DIRECTION BOUNDS THE RESULT, NOT THE GRAPH   │
              ╰────────────────────────────────────────────────╯
                                      │
                                    bounds
                                      ▼
                                   the blob
```

### the fifteen established edges {#the-fifteen-edges}

`artefact` · **A concrete, versioned, public edge vocabulary, every one a directed verb, with nine of the inverse names proposed by the book rather than quoted.**

> Every one of them is a verb; every one is directed.
>
> — *The edge set*, § The fifteen established edges

**Out.** This implements [every edge is a verb](#edge-is-a-verb). This carries [a named absence beats a hidden one](#named-absence). This refuses [the generic association edge is banned](#banned-generic-edge).

**In.** [The schema is the graph's own review pack](#schema-view) measures this. [The voice memo loop](#the-voice-memo-loop) enables this.

*Where it shows up:* Published so it can be argued with; the honesty of the proposed column is load-bearing.

```
       the schema is the graph's own review pack · the voice memo loop
                              enables, measures
                                      │
                                      ▼
                    ╭───────────────────────────────────╮
                    │   THE FIFTEEN ESTABLISHED EDGES   │
                    ╰───────────────────────────────────╯
                                      │
                         carries, implements, refuses
                                      ▼
          every edge is a verb · a named absence beats a hidden one
                    the generic association edge is banned
```

### classification is a query, not a judgment {#node-type-formula}

`concept` · **A node type is a required pattern of typed, directed paths that a node either matches or does not; the content does not decide the type, the paths do.**

> A fact and a vulnerability can have identical content; what makes one a vulnerability is the
> upward edge to a risk.
>
> — *The Grounding Ladder*, § Type Is Set by Edges: Classification as a Query

*Also called:* node type formulas

*Near, but not:* tagging, which records a judgment instead of computing one

**Out.** This implements [discovered meaning](#discovered-meaning). This requires [the inverse is a different relationship](#distinct-inverse). This generalises [the grounding ladder](#grounding-ladder).

**In.** [Properties carry data, never meaning](#properties-carry-data-not-meaning) requires this. [Three layers: facts, formulas, bridges](#three-layers) enables this. [Downward grounds, upward implies](#two-directions) grounds this. [The capability scale](#capability-scale) extends this.

*Where it shows up:* Roughly 31 node types and 7 formulas in the AWS IAM worked instance; nothing executes them.

```
properties carry data, never meaning · three layers: facts, formulas, bridges
                       downward grounds, upward implies
                          enables, grounds, requires
                                      │
                                      ▼
              ╭───────────────────────────────────────────────╮
              │   CLASSIFICATION IS A QUERY, NOT A JUDGMENT   │
              ╰───────────────────────────────────────────────╯
                                      │
                      generalises, implements, requires
                                      ▼
         discovered meaning · the inverse is a different relationship
                             the grounding ladder
```

### the blob {#the-blob}

`concept` · **The hairball render that shows everything and therefore nothing, and tempts people to delete relationships to make the picture better. Past three or four hundred nodes a render conveys texture, not information.**

> I see a lot of people get into semantic graphs, get excited, and arrive at the big blob, the
> big visualisation of thousands or millions of interconnections, just one big blob.
>
> — *Visualising Semantic Graphs: Avoid The Blob, Use Verb Edges, And Flip The Subgraph*, § The Blob Anti-Pattern

> anything above 300 or 400 nodes cannot be easily visualised.
>
> — *Visualising Semantic Graphs: Avoid The Blob, Use Verb Edges, And Flip The Subgraph*, § The Visualisation Limit — the visualisation limit

**In.** [Direction bounds the result, not the graph](#direction-bounds-fan-out) bounds this. [Rich nodes are good](#rich-nodes-are-good) contradicts this. [Build wide, find the few, flip](#build-wide-find-the-few-flip) remedies this. [Never render the whole graph](#render-the-query) remedies this. [Everything modelled must be real](#reality-discipline) refuses this.

*Where it shows up:* Named again by the founder about his own viewer in brief 28: interesting, but not yet useful.

```
       direction bounds the result, not the graph · rich nodes are good
                        build wide, find the few, flip
                        bounds, contradicts, remedies
                                      │
                                      ▼
                               ╭──────────────╮
                               │   THE BLOB   │
                               ╰──────────────╯
```

### rich nodes are good {#rich-nodes-are-good}

`position` · **The blob is a rendering failure mistaken for a modelling failure; pruning solves the picture by destroying the asset.**

> the more rich a node is, the more connections it has, the better.
>
> — *Visualising Semantic Graphs: Avoid The Blob, Use Verb Edges, And Flip The Subgraph*, § Rich Nodes Are Good

**Out.** This contradicts [the blob](#the-blob). This requires [never render the whole graph](#render-the-query).

**In.** [A node alone means nothing](#node-alone-means-nothing) grounds this.

*Where it shows up:* The reason the pilot document was extracted twice: a reading and the text itself.

```
                          a node alone means nothing
                                   grounds
                                      │
                                      ▼
                         ╭─────────────────────────╮
                         │   RICH NODES ARE GOOD   │
                         ╰─────────────────────────╯
                                      │
                            contradicts, requires
                                      ▼
                   the blob · never render the whole graph
```

### build wide, find the few, flip {#build-wide-find-the-few-flip}

`method` · **Capture the universe first, run the question, then re-root the query at the handful of nodes it found and walk out again.**

> You flip it and query from that node, which dramatically reduces the graph, because you now
> see only the nodes relevant to that person, that unit, that company.
>
> — *Visualising Semantic Graphs: Avoid The Blob, Use Verb Edges, And Flip The Subgraph*, § The Subgraph Flip

*Also called:* the subgraph flip · multi-graph creation paths

*The corpus also says it like this:* “multi-graph creation paths”

**Out.** This remedies [the blob](#the-blob).

**In.** [Queries are walked, not written](#path-query-is-walked) extends this. [Price the next hop](#explore-by-degrees) implements this.

*Where it shows up:* The reader's explore-by-degrees walk is this move with a price shown before each hop.

```
             queries are walked, not written · price the next hop
                             extends, implements
                                      │
                                      ▼
                    ╭────────────────────────────────────╮
                    │   BUILD WIDE, FIND THE FEW, FLIP   │
                    ╰────────────────────────────────────╯
                                      │
                                   remedies
                                      ▼
                                   the blob
```

### never render the whole graph {#render-the-query}

`method` · **The default view is never the graph; it is the result of a query, because a diagram of everything is rarely useful.**

> a diagram showing everything is rarely useful, while a diagram showing one node interacting
> with its neighbours is always readable.
>
> — *The Graph Canvas As A REPL*, § Never Render The Whole Graph

*Near, but not:* filtering, which hides what it does not show, where a query states what it asked

**Out.** This remedies [the blob](#the-blob).

**In.** [Queries are walked, not written](#path-query-is-walked) implements this. [Altitude is how much, query is which part](#altitude-and-query) extends this. [Rich nodes are good](#rich-nodes-are-good) requires this. [Pinned peaks, free field](#pinned-peaks) requires this. [The schema is the graph's own review pack](#schema-view) implements this. [Every node move costs the reader their mental picture](#stability-principle) extends this.

*Where it shows up:* Every rendered graph in the first edition; the reader's five preset views.

```
 queries are walked, not written · altitude is how much, query is which part
                             rich nodes are good
                        extends, implements, requires
                                      │
                                      ▼
                     ╭──────────────────────────────────╮
                     │   NEVER RENDER THE WHOLE GRAPH   │
                     ╰──────────────────────────────────╯
                                      │
                                   remedies
                                      ▼
                                   the blob
```

### queries are walked, not written {#path-query-is-walked}

`method` · **Navigating a graph hop by hop IS writing a query, so the trail a reader walks is recorded, edited as steps, generalised and re-run.**

> Queries are not written, they are walked: the reader's own navigation is the query language,
> and generalising one step at a time is how a single observation becomes a reusable question.
>
> — *The methods register*, § path-query

**Out.** This implements [never render the whole graph](#render-the-query). This extends [build wide, find the few, flip](#build-wide-find-the-few-flip).

**In.** [A path must read as a sentence](#path-reads-as-a-sentence) grounds this.

*Where it shows up:* Shipped at v0.4.34: trail, board and a pure tested runner, with named queries persisted per document.

```
                        a path must read as a sentence
                                   grounds
                                      │
                                      ▼
                   ╭─────────────────────────────────────╮
                   │   QUERIES ARE WALKED, NOT WRITTEN   │
                   ╰─────────────────────────────────────╯
                                      │
                             extends, implements
                                      ▼
        never render the whole graph · build wide, find the few, flip
```

<!-- /gen:entries:grammar -->

## Where the estate demonstrates this

The fifteen established edges are published as a versioned vocabulary with their inverses,
and nine of those inverse names are marked as proposed by the book rather than quoted from
the corpus. That marking is the interesting part: if the book becomes the place people cite
for that vocabulary, the distinction between quoted and proposed has to survive, or the
estate will have done the thing it warns about.

The rule against the generic edge is broken by the project's own shipped configuration, and
the estate names it rather than fixing it quietly, on the grounds that it is a better
teaching moment than the rule is. It is in *What the atlas found*, with both sides quoted.

And the schema view is the region turned on itself: one node per node type, one edge per
typed relation labelled with its verb, and a count. On day one against the pilot document
it showed claims reaching concepts through a single relation used forty times, while
concept-to-concept ran through seven verbs used once or twice each. That is a graph telling
its authors which half of their grammar is real.
