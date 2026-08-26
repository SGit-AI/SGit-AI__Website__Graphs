# Brief 35 — founder memo: the fractal nature of the WCLM (world models, analogies, anchored facts)

**Date:** 26 August 2026
**Source:** a voice memo (Otter transcription, speaker labels and timestamps preserved),
sent the same afternoon as brief 34 and its two addenda, introduced as "more thoughts on
the fractal nature of our WCLMs architecture we are building". Reproduced verbatim below.
The instruction table and the questions are the agent's reading, for the founder to
correct.

---

## The memo, verbatim

> Unknown 0:05
> So the reason why we need this sort of fractal nature, and it's quite interesting that
> we're sort of converging into what ultimately is transformation engines, right, or
> content transformations, but in ways that understand language, and and I think what we
> are creating, which is also my understanding of how the LLMs work, is we are creating
> these sort of world model views, right? World models transform us that basically create
> representation of reality, and the reason why I think, if you think about the way this
> will scale, is because the same way that it's almost like what we're doing at every layer
> is almost saying what does this mean, or can you expand this, or can you contract this?
> Can you give me more information? information about this so that I can then continue my
> analysis
>
> Unknown 1:04
> So that I can then continue my analysis, and ultimately, in an interesting way, that's
> what when we start to look at the cross book or say the cross document analysis, or even
> cross references analysis, and I think this is important because remember that ultimately
> we want to expand this to other documents and as a source of information, including some
> that will contradict some other things. What we want to be able to do is almost like ask
> a document, right?
>
> Unknown 1:37
> Ask a paragraph. Ask this to say, "Hey, here's where I'm going, or here's the graph of
> where I'm going. How does that graph compare, and what's the answers, and what, and does
> it work? Does he agree? Doesn't it doesn't agree, or does he provide evidence? Do we
> arrive at the same conclusion, or what insights do I get from that document based on
> this?
>
> Unknown 2:01
> And and this is fundamentally a graph, right? This is fundamentally a sequence, which is
> why I think this what we're creating here ultimately becomes kind of fractal, because you
> know the same way that we now have these engines and these engines can be quite simple.
> The engines then will expand, so then become an abstraction layer becomes just a node in
> our multiple transformation, and this actually becomes very powerful when we talk about
> transformations between languages or cultures or roles. If we take take into account,
> like for example, when we transform, you know, it's almost like think about like the way
> we, let's say, explain a particular topic or particular document to somebody from
> finance, right? So it's interesting because then what we need to do is we need to find
> analogies, which actually is something we haven't talked about. But you know, analogies
> or or or
>
> Unknown 3:04
> equivalencies, right? So, how do we then connect two nodes? Sorry, two concepts. Two
> concepts that may they might come from different places, but we need to use it to reflect
> that. So, a good example of I don't know if you talk about graphs of graphs.
>
> Unknown 3:22
> Maybe for the financial, we need to talk about, you know, some type of data or
> spreadsheets of spreadsheets, right? Because actually, in the financial world, we do have
> spreadsheets of spreadsheets of spreadsheets of spreadsheets, right? So, or air gaps and
> stuff like that. So, so basically, that becomes the key concept, and and the logic now is
> that I should be able to look at this sort of transformations and again correct them, and
> then the corrections is where it gets interesting because in principle the correction
> should be that we need better meaning, we need better objects, we need we're missing
> nodes, or we have to add some corrections to it, actually manually or like let's say
> manual overrides, which is kind of what again the learning the pre-trained does to an
> LLM, right? Fundamentally, and
>
> Unknown 4:20
> and basically what we are creating is that. In fact, I think one of the things I found
> interesting when I was looking and looking at the LLMs, and maybe this is a nice way to
> represent this, is they they used to plug the LLM, each of the layers, in a sort of a 2D
> space, and then you start to see that some topics warm up more one level, and other
> topics warm up the other level, or you have areas of focus. Kind of again, what the
> vector databases do, but I think what we're doing here is we're doing that with science,
> we're doing that with math, we're doing that with determinism. So we, it's almost like we
> will create a similar world, but in our world, the lines are exact and the connections
> are exact, well, as exact as they exist, right? So we we can anchor a lot of the
> movements on this. In fact, this is a great way to anchor facts because remember that
> again we haven't talked about this, but there's going to be a time where we go, hey,
> here's a fact. So now we we basically have one of our transformations could be the
> anchoring on the facts, anchoring of the hypothesis, and also let's take into account
> that we haven't got there, but we might do that. There might be some layers that do need
> an LLM to move from one layer to the other, right? Again, the coolest thing is that we
> then here have evidence because we can say, look, here's the graph that was given to an
> LLM, and the LLM made these analyses. Now here's the graph from that analysis, but we can
> now understand and check and and really connect the dots, which is where it gets very
> interesting.
>
> Transcribed by https://otter.ai

---

## The agent's reading: the instructions, numbered

1. **The engines are world-model transformations.** What every layer is really doing is
   asking: what does this mean, expand this, contract this, give me more so the analysis
   can continue. *Recorded as the architecture's stated purpose; the schema types shipped
   in v0.5.5 (text → tokens → stream → profiles → bindings → meanings) are exactly those
   questions made typed.*

2. **Ask a document; ask a paragraph.** Cross-document analysis is bringing a graph TO a
   document — "here's the graph of where I'm going; does this document agree, disagree,
   provide evidence, arrive at the same conclusion?" — including sources that contradict
   each other. *Recorded as the destination for the document fan-out (the estate holds 21
   sources, one extracted). The contradiction machinery shipped in v0.5.4–5 (negation
   against the world, sense withdrawal) is the single-document seed of exactly this. Not
   buildable this round without a second extracted document; queued.*

3. **Fractal scaling: an engine becomes a node.** Engines start simple, expand, and then a
   whole abstraction layer is just a node in a larger transformation. *Built in v0.5.5 as
   the fractal engine (a full WCLM inside an engine); this memo confirms the direction and
   widens it — any engine, not just the WCLM, should be composable as a node.*

4. **Analogies and equivalencies — new, and asked for by name.** To explain this material
   to somebody from finance, find the equivalent concept in THEIR world: graphs of graphs
   is spreadsheets of spreadsheets (finance genuinely nests workbooks in workbooks).
   Connect two concepts from different places with an edge that says so. *Built this
   round: an authored analogies register (`v2/wclm/analogies.json`) mapping this
   document's concepts into three audiences (finance, operations, medicine), and a
   `translate` engine (reads meanings, writes meanings) with an audience picker — the
   answer is restated in the listener's own concept, with the why carried, and an honest
   "no analogy authored yet" when the register has none.*

5. **Corrections are the training.** Looking at a transformation and correcting it —
   better meaning, better objects, missing nodes, manual overrides — is what pre-training
   is to an LLM. *Recorded; this has been the working loop since the first meaning pack
   (the bind formula edit, the senses register), and every register added this week is a
   correction surface.*

6. **The 2D warm-up map.** LLM layers plotted in 2D show topics warming different levels;
   ours can show the same picture with exact lines, because the connections are exact.
   *Recorded as a build candidate: the run already knows which chips light per engine;
   plotting prompt-over-prompt heat per layer is a visualisation round of its own.*

7. **Anchoring facts and hypotheses.** One of the transformations could be the anchoring:
   here is a fact, here is a hypothesis. *Built this round in the honest small form: every
   ranked meaning now declares its anchoring — a quote in a named section of the document
   (fact-anchored), a statement without a quote (stated claim), an authored register entry
   (proposed term / chosen sense). The answer card says which it is.*

8. **Some layers may need an LLM — with evidence.** A layer that hands its graph to an LLM
   and takes a graph back is acceptable BECAUSE both graphs are kept: what went in, what
   came out, checkable, connectable. *Recorded as direction: the v0.5.5 schema contract is
   deliberately what makes this safe — an LLM engine would declare reads/writes like any
   other, and its evidence is the pair of graphs. Not built: this site's pages stay
   deterministic; when built, it runs at generation time, never in the page.*

## The agent's notes back

- **Analogies flow the opposite way from senses**, and the two now bracket the word: the
  senses register says what YOUR word means in other worlds (and withdraws it when you
  mean theirs); the analogies register says how OUR concept is said in your world. Both
  are authored, reviewable registers — training by editing inputs.
- **Question — who picks the audience?** This round it is a picker on the page (explain it
  to: finance, operations, medicine). If the founder wants audiences to be another
  document's extraction (ask THE FINANCE DOCUMENT how it says this), that is the brief-35
  ask-a-document destination and needs the fan-out first.
- **Question — corrections as first-class artefacts.** The memo's "manual overrides"
  suggests a corrections file per register (what was wrong, what it was corrected to,
  when) rather than editing entries in place, so the training history stays visible. Cheap
  to add when wanted; not assumed this round.
- **Question — the 2D map.** Worth a dedicated round with real interaction (prompts as
  rows, engines as columns, heat as exact counts with every cell clickable to its chips)?
  It composes with the existing delta machinery.
