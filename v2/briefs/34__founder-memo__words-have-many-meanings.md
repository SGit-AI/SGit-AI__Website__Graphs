# Brief 34 — founder memo: words have many meanings (senses, number, and the world model per word)

**Date:** 26 August 2026
**Source:** a voice memo, recorded against v0.5.3 before the founder had seen the detective
playbook build (v0.5.4) — "because I have not seen anything building, right? So this is
still working on… I'm looking at v0.5.3." Reproduced verbatim below, transcription
artifacts and all. The instruction table and the questions are the agent's reading, for the
founder to correct.

---

## The memo, verbatim

> Okay. So this is voice memo recorded. But it is done before  I looked as you creating the
> preview... the next version, but I think there's a number of important concepts that I
> wanna share, which either you not ready or or we cannot do the next version. And, um,
> yeah. because I have not seen anything building. Right? So this is still working on... I'm
> looking at v0.3.5 point three. So here's the question I'm thinking. Right? Ultimately,
> this is graphs or graphs, and ultimately, words matter and meaning to connectivity, which
> basically means that we are creating these graphs that have have context. And each graph
> needs to have a world model, each word in a way, or each phrase needs to have a world
> model that you have here. And and one of the things that's interesting about this is that
> we can then start to apply language language rules and implications of certain things that
> you have to take into account even... eventually, grammar rules. But... because what we're
> doing is we're capturing now the intent of the words. So even something as, for example,
> singular and plural is important because graph is different than graphs. Node is different
> than nodes. And what's interesting is that maybe, you know, there's a mistake in the in
> the text. So graph is using set of graphs, then we should catch it. Like, for example,
> graph of graphs is very different than graph of graph or graphs of graphs. Right?  all of
> those are different. And I think the way to capture this is, like I said, on our multiple
> level transformations is where we add evidence. So if you have, let's say, graphs, we
> should have somewhere in that as, oh, this is the plural. That means there's gonna be more
> than one involved here. And the the thought exercise I'll I'll like us to make... maybe we
> use some of these and different mappings to experiment on this. It fundamentally is if you
> take the word graphs and notes and fractal and maybe a other words is can you do an
> exercise where you find three to five definitions of those words, which will mean
> different things, ideally across different industries, different completely meanings of
> it? because that's the point. So a good example is a lot of people when they think of
> graphs, they don't think of network graphs, which is kinda what I mean. They think of
> other things. Maybe they think of a diagram or they think of something else. Right? Um,
> they might even think of, you know, a different view. Right? So let's map them because the
> reason why I called network graphs, it means that in my graph, a graph is connected to a
> network, is connected to nodes and edges, is connected to mathematics, is connected to all
> these sort of principles that eventually you arrive at almost like a definition of it, a a
> particular type of graph, which is different than other types. And what we should do is in
> those transformations, we should capture that. And I think what's... this arrives at be
> very interesting is that, again, we are defining the ontology and the taxonomy of a
> particular document that... and it's okay for this to be specific. If like, this should be
> designed for people to make up to For, sorry, for people to not make up or define, right,
> or use their own definitions of what they mean, and that's okay. Right? Because, like, I
> think we mentioned already, is meaning to connectivity. It's only when we connect the dots
> that it becomes relevant. If I... we can already use the example that was used on his
> book, right, which on this... even I think on this document, which is the definition of
> task, right, which changes depending on culture, depending on things. So we need to
> represent in our words context a sort of content language model. We need to represent this
> by bringing those reference in, by bringing those graphs that come from other places. And
> this is lovely that that this will scale because the more of these mappings you have and
> the more we can say, oh, when I want this document, I'm meaning this. It doesn't mean you
> have to do this all the time. It means you leverage the fact that now you're ready you're
> ready to find what you mean by this, which is kind of what if you if you think about it
> will will happen, you know, in practice, right, where the more of a book we have, the more
> of a documents we get processed, the more of definitions become made, the faster we go. In
> fact, there's an argument we said that, you know, every person, every website, every sort
> of new piece of work, every project should start by defining their own language, their own
> context, their own graphs, and what they connect to others, which is, again, where some of
> these will eventually arrive at schema dot org. In fact, we should be able to arrive there
> from here because what schema dot org provide and we can provide ourselves is those big
> definitions, those big anchors, those peaks. Okay. So let's experiment this. So I think the
> thing that is very interesting in here is how can we also programmatically show The The
> the effects of those multiple word definitions where they should impact. So, for example,
> like, again, if I go on graphs or graphs and I change my definition of a graph is to, for
> example, to be a diagram, right, a line diagram or something else, well, then the fractal
> element will not apply. Right? Or, for example, yeah, graph of graph will not be fractal.
> Right? So we should be able to start also applying people's definitions into the... into
> here or even common definitions of the industry and then see where we want to move from
> there. Cool. Alright.  I think there's some some interesting experiments that we can do
> here.

---

## The agent's reading: the instructions, numbered

1. **Each word needs a world model of its own.** The graphs we build carry context; a word
   (or phrase) means something only inside a world. The WCLM already runs one world (the
   pilot document's); this memo asks for the next step: the same word across MANY worlds —
   its different senses — held side by side. *Built: an authored senses register
   (`v2/wclm/senses.json`) compiled into the world; each entry is a word with its
   document sense first and three to five industry senses beside it.*

2. **Singular and plural are evidence, not noise.** Graph is different from graphs; node
   from nodes; "graph of graphs" from "graph of graph" from "graphs of graphs" — all
   different. Somewhere in the transformations there should be a chip that says "this is
   the plural: more than one involved". *Built: the senses block reads the stem families
   and annotates every token's number — plural forms carry "more than one involved", with
   the family as the named evidence. The three graph-of-graph variants are example buttons,
   and they produce visibly different runs (different hashes, different tokens, different
   bindings) — which is the honest version of "we should catch it".*

3. **The thought exercise: three to five definitions per word, across industries.** For
   graphs, nodes ("notes" in the transcript is read as nodes), fractal, and other words.
   *Built: senses authored for graph, node, fractal and task (the document's own example of
   culture-dependent meaning), each with a domain label and a definition — proposed by the
   agent for the founder's review, exactly like the meaning packs.*

4. **"Network graphs" is a position in a graph, not just a label.** The founder's sense of
   graph is the one connected to network, nodes, edges, mathematics — the definition is
   reached through its connections. *Recorded: each document sense in the register states
   this in its definition; the document's own extraction is the evidence.*

5. **A document defining its own ontology is a feature.** People use their own definitions
   and that is okay; meaning through connectivity means the connections make it relevant.
   The task example: its definition changes with culture. *Recorded and built: the
   document's sense is always the default; switching to another sense is explicit, visible
   and reversible.*

6. **Programmatically show the effects of a changed definition.** If graph becomes "a
   diagram", the fractal element does not apply. *Built: a sense picker appears for any
   prompt word that has senses. Switching a word away from the document's sense withdraws
   it from binding against this universe's concepts, binds the chosen sense's own
   definition instead, and the answer says out loud which of this universe's claims lean on
   that word and no longer apply — computed from the concept labels, not authored. The
   run delta banner measures the movement, layer by layer.*

7. **This scales toward shared anchors.** More documents, more mappings, faster meaning;
   every project should start by defining its language; the big definitions eventually meet
   schema.org — and we should be able to arrive there from here. *Recorded as direction:
   the senses register is the seed of that mapping; wiring senses to external anchor
   vocabularies (schema.org and the estate's own peaks) is future work, noted in the open
   questions below.*

## The agent's notes back

- **"Graph is using set of graphs, then we should catch it"** is read as: when the text's
  own number disagrees with itself (singular verb, plural noun; a singular where the
  structure implies many), the engine should notice. The number evidence built this round
  is the raw material for that check; the grammar rule that consumes it (agreement across
  a phrase) is deliberately left for a later round, since the memo itself says grammar
  rules come "eventually".
- **Where senses live**: as a sibling of the meaning packs, not inside them. A pack says
  what a term means IN this domain; the senses register says what the same word means in
  OTHER domains. Both are authored inputs, reviewable in the open.
- **Question — sense scope.** When the founder switches graph to "a chart", should the
  switch also pull that sense's own world in (bind against a chart vocabulary), or only
  show what breaks here? This round does the second (plus the sense's own definition as
  the answer); bringing foreign worlds in wholesale is a bigger move, flagged for review.
- **Question — plural as its own sense.** "Graphs" currently inherits the senses of
  "graph" through the stem family, with the plural noted as evidence. If the founder wants
  plural forms to carry senses of their own (graphs-the-discipline vs graphs-the-objects),
  the register accepts them without a code change.
- **Question — schema.org.** Arriving at schema.org from here suggests each document sense
  eventually carries an `anchors` list (schema.org URLs, the estate's peaks). Cheap to add
  to the register when wanted; left out this round to keep the experiment focused.

---

## Addendum — the follow-up note (typed, same day, after reading the v0.5.4 summary)

> I just read your latest comments above (for the v0.5.4 release) and one of the things I
> don't think you picked up is that we need to support multiple 'engines/transformations'
> in one layer (since each of those engines is able to bring clues needed for the next
> layer). This can get interesting since one of those engines could be just' passthough
> from the previous layer, or block all from previous later and only use the new engines in
> that layer

The agent's reading, built this round:

8. **A layer is a slot; a slot can hold several engines.** The pipeline stops being a flat
   list of blocks and becomes a list of LAYERS, each holding one or more engines that run
   side by side over the previous layer's output, each stacking its own clues for the next
   layer. *Built: the pipeline format accepts layers of engines; the default pipeline runs
   senses and operators TOGETHER in one layer (both need only resolve, and attend reads
   both engines' clues); the pipeline bar draws the grouping, and dragging an engine onto
   another joins its layer while dropping it into a gap gives it a layer of its own. An
   engine that needs a sibling from its own layer is skipped with the reason named —
   needs are satisfied by earlier layers only, because within a layer the engines are
   deliberately independent.*

8b. *(superseded in part by the second addendum below: the needs contract described
   here shipped as TYPED input/output declarations, not engine-key dependencies.)*

9. **Pass-through is itself an engine.** Include it in a layer and the previous layer's
   evidence flows on beside the new engines' clues; leave it out and the layer's engines
   replace the stream — "block all from previous layer and only use the new engines".
   *Built: a `passthrough` engine in the registry. The attend layer is where the fork is
   real today: attend alone is strict (only what attention keeps reaches binding — the
   existing behaviour); attend plus passthrough is additive (content that fell out of
   attention still binds, visibly carried). Generalising the gate to every layer — each
   layer declaring exactly what flows on — is recorded as the next structural step rather
   than half-done now.*

---

## Second addendum — the schema note (typed, same day, during the build)

> I think for this many to many function workflows to work (and to have multiple engines
> on the same layer) you need to add an abstraction layer that defines what is the input
> and the output (aka schema) for each of those engines , since data is transformed as it
> moves between the layers and there will be incompatible engines for a particular layer)
>
> the good news is that we don't have that many types of data and schemas
>
> this model needs to support a fractal mode, where one of these 'engines' is a full WCML
> inside it

The agent's reading, built this round:

10. **Every engine declares its schema.** The registry stops naming dependencies by engine
    key ("needs bind") and instead declares, per engine, what data TYPES it reads and
    writes. The good news held: the whole pipeline moves only six types — `text` (the
    prompt), `tokens` (hashed words), `stream` (tokens resolved against the world,
    carrying every clue mark), `profiles` (attention), `bindings` (candidate meanings),
    `meanings` (the ranked answer). *Built: each engine carries `io: {reads, writes}`; an
    engine runs only when every type it reads has been written by an EARLIER layer, and an
    incompatible placement is skipped with the type named ("needs bindings — nothing
    upstream writes it"). Compatibility is now structural: any engine writing `bindings`
    can stand in for bind, which is exactly what makes engines swappable and layers
    many-to-many.*

11. **Fractal mode: an engine that is a full WCLM inside.** *Built: a `fractal` engine
    (reads `meanings`, writes `meanings`): it takes the winning meaning's own statement
    and runs it through a complete inner pipeline — tokenise, resolve, bind, converge —
    one zoom level down, and reports the meaning of the meaning. The inner pipeline
    contains no fractal engine, so the recursion is depth one by construction; deeper
    zooms are a picker away when wanted. The engine registry treats it exactly like any
    other engine, which is the point: the WCLM composes with itself.*
