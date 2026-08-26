# Brief 31 — founder memo: the WCLM, a deterministic transformer over our graphs

**Date:** 26 August 2026
**Source:** a voice memo recorded by the founder, transcribed by otter.ai
**Status:** the founder's words are source material; the transcript is reproduced verbatim
below. The instruction table and the questions are the agent's reading, marked as such.
**Framing recorded:** the founder calls it "a bit of a crazy experiment" and asks for it in a
separate folder, separate code and a separate page, so it can be brought back deliberately.
He also coins the name this brief adopts: not a large language model but "a words content
language model" — the **WCLM**.

---

## The memo, verbatim

> Dinis Cruz 0:00
>
> Okay, so using the artefacts that we've created, but I think you probably want to do this in
> a separate folder because this is in a sort of bit of a crazy experiment. But I would like
> to see how it can actually work. So here's my thinking. I would like you to try to create a
> mini LLM kind of engine based on this data, so that we, in a way, can build the predict the
> next word kind of concept, but sort of based on what I'm about to describe, which is also my
> thinking of how the LLMs work, and I would like to to capture it here in a visual way, and
> also maybe do a little research on how a lot of people have visualised and showed LLMs, but
> I would like to do it with our concepts and our examples. So, my understanding of how LLMs
> work is that LLMs take the text that we provide, the context, right? The prompt, and of
> course, they have their own already mental models. And what they do is they create a world
> model. They create sort of a graphical representation of reality using the multiple
> transformers, using the multiple layers, and the layers connect one to the other, and then
> eventually you get the result in the end. So the reason why something is connected to
> another, or the prediction of the next word, but I think the logic here is is the same way
> that we talk about here. Is I don't think predicting of the next word is doing a disservice
> because the models are not predicting the next word based on random. The models have already
> created a very rich graph, a very rich mental representation of what something is, so that
> we, you know, so that then they they know sort of from there what what is most likely to
> come next. So what I would like to kind of create is a mini engine again. Do this in
> separate code, so that we can then figure out how to bring this back. But my thinking is, if
> you take the primitives that we already have and take the the concepts is can we build a
> sort of transformer like model with you know GPT right you know fundamentally the generative
> you know I guess pre trained is the information we already provide but the main thing I want
> to map and visualise is the look back and the attention, and that loops that were created
> between the different layers. So I think would be cool is why don't we maybe start with five
> layers or seven layers, you know, like neural networks, right? And and the logic here is I
> know you you know internally it works in tokens, so let's start to do that. So, but I would
> like is to be deterministic. So this is not creating; it's kind of building maybe like a the
> the sort of the not you know the embeddings, but instead of maybe that's a better analogy,
> but this is not about about creating just embeddings. It's about visually representing and
> give us the example and the provenance and the paths between a component, an example,
> another example, and the concept. And I think this is where maybe instead of going from
> predicting the next word, we can be what is the definition of something? You know, like if
> we have a phrase or a word, you know, what what is the meaning of it? And this is where I
> think the graph internally. So I think we need to add almost the graphs that you need to
> going to create that provide almost the the world view of what we have. So when we have a
> node, that node should be connected to basically the ontology and taxonomy, kind of of
> semantic graphs of nodes and graphs, you know, of of nodes and edges and all that world.
> Right. When we talk about a primitive, we should have that. When we talk about a principle,
> when we talk about a task, right? It's almost like let's go a couple levels deep and start
> defining what these means, right? In these kind of workflows, we talk about QA. You know, QA
> is not a random word; it's part of development. So it's starting to add these extra
> universe, extra sort of views. But one of the things that I think is very important is to
> also do this a little bit mathematically, where you want to start assigning some weights to
> this, but for that you need to transform, and this is what I was saying that I think the
> words and the the transformations that we do with the words and the combination of words
> because I think that's what you end up with. You end up with saying I have a word that has a
> particular ID and a particular weight, and then I have a combination of words and that has
> its own IDs. But but you want to be able to programmatically calculate a lot of this stuff,
> which is why I feel that we need to get to the point where every word has, and maybe the way
> to do it is the the the actual ID is actually the hash of the word. Maybe that's how we do
> it, right? And then you actually have the hash of the combined words, so you start to
> operate on top of hashes. So fundamentally, it's kind of like you know the way you tokenize,
> so the tokens are the hash, and that's interesting because it means you're always going to
> have the same hash, and then you start to address the same concept of multiple words have
> multiple meanings. But I think there's some really cool visualisations that we can do here,
> especially on the whole thing of connecting the dots. And when I really like when I was
> learning about LLMs, those sort of those visualisations that show a word having connections
> with other words and having connections with other systems, and and and when you have the
> neural network, so in a way we let's kind of create multiple neural network sort of you know
> levels or what they call layers, right? Like one level, another level, another level,
> another level, and then get the result, and then maybe our levels, instead of being sort of,
> I think that the logic here is that instead of as defining the layers of the LLM or the
> neural network to be random, let's create our own layers, and each layer has a very specific
> role, and is deterministic that role and the inputs and the outputs of those layers. So
> those layers are more transformations than you know blind mathematical formulas that you you
> just then randomly when you want to learn. So this is what's interesting. So when I want to
> train the model. In this case, I'm going to train the model using graph inputs and tweaks on
> the graph inputs, and connectivity and meaning, which is the whole point of what I do,
> versus randomly or you know moving numbers around and saying, oh, these answers will be
> better than that one, and then changing the numbers. So, but I do think that you need to
> bring down the each word and then each combination of words into the a number a hash that is
> then consistent and then maybe those hashes are numbered or something like that so that you
> inside the model you operate inside the engine that we're creating you operating in a
> deterministic way and this should also then work across documents. So cool. Let's let's do
> an MVP of this, and I think this should be on a separate page, right? But basically, we are
> kind of maybe building our own light version of a. It's almost like it's not a large
> language model. It's like a words content language model or something like that, and and
> then that allows us to even, for example, have things like grammar, like verbs. Like why
> does these things? So then you you start to bring this sort of these meaning packs to the to
> the mix, and it's the combination of those meaning packs that then ends up having something
> in the end. You know, like you know, even like this. This is stuff about issues, FS, right?
> So then, information about a version file system versioning should be here, right? Like, you
> know, this is kind of what my vision here is. Every word I should be able to see its blast
> radius and understand its provenance. It's almost like what's the word? Is it etymology or
> something like that, where it talks about the provenance of words, so this is not just about
> talking about the provenance words. It's talking about the impact, the culture, the
> reference, what we're talking about, where does it come from, the weight of it. Because it's
> only when we have these abstraction layers, and then we start connecting things to the
> abstraction layers, that I think the real connections really start to come, and the real
> abstractions really come into play.
>
> Transcribed by https://otter.ai

---

## The instructions, as the agent reads them

| # | The founder's words (condensed) | What it commits the work to |
|---|---|---|
| 1 | "a mini LLM kind of engine based on this data … in a separate folder … separate code … a separate page" | The WCLM lives at `v2/wclm/` with its own code under `assets/wclm/`, deliberately outside the reader, to be brought back on purpose once it earns it. |
| 2 | "the layers connect one to the other … five layers or seven … each layer has a very specific role, and is deterministic … more transformations than blind mathematical formulas" | Six named layers, each a pure function with declared inputs and outputs: tokenise, resolve, attend, bind, expand, converge. Same prompt, same world, same picture, every time. |
| 3 | "the tokens are the hash … you're always going to have the same hash … the hash of the combined words … work across documents" | Token identity is a content hash (FNV-1a 64-bit of the case-folded word; a phrase hashes the joined word-hashes). The same word tokenises identically in every document with no registry. Recorded distinction: the hash is a CONTENT address (changes when the spelling changes); the ledger uid is an IDENTITY address (survives change). The engine uses hashes; provenance still lands on uids. |
| 4 | "assign some weights … programmatically calculate … train the model using graph inputs and tweaks on the graph inputs" | Every weight is a stated formula over the graphs we already computed (counts, classes, co-occurrence, spread), written in the world file where it can be read and tweaked. Training is editing graph inputs, never fitting numbers. |
| 5 | "the main thing I want to map and visualise is the look back and the attention" | The page draws the layers as columns with the connections between them, attention links weighted by co-occurrence, and every hop clickable back to its provenance. |
| 6 | "instead of predicting the next word … what is the definition of something?" | The query the MVP answers: give it a word or phrase, and the output is its MEANING — the concepts it binds to, their statements and anchored quotes, the examples and claims reachable from them, and the paths that got there. |
| 7 | "the node should be connected to the ontology and taxonomy … QA is not a random word; it's part of development … meaning packs … issues-FS, versioning should be here" | Meaning packs: small curated ontology files (`v2/wclm/packs/`) that add the world above the document — kind-of and part-of edges for the graph domain and the issues-fs domain. Authored like extractions: the agent proposes, the founder reviews. |
| 8 | "every word I should be able to see its blast radius and understand its provenance … etymology … the weight of it" | The output card for any word: its hash, class, weight, count, where it lives in the document (via the core graph), what concepts it feeds, and everything one hop out. |
| 9 | "do a little research on how people have visualised LLMs" | Recorded in this brief (from the agent's training knowledge, not fetched): Jay Alammar's Illustrated Transformer (layers as columns, attention as weighted arcs), BertViz (per-head attention lines between token columns), 3Blue1Brown's transformer series (vectors moving through blocks), TensorFlow Playground (small named layers, live weights), distill.pub's circuits work, and closest of all in spirit, Anthropic's interpretability programme (features and attribution graphs), which reverse-engineers exactly the thing the WCLM gets for free: OUR attribution graph is inspectable by construction, because the layers are deterministic and named. The MVP borrows the column-and-arc language deliberately. |
| 10 | "it's not a large language model. It's like a words content language model" | The name ships: WCLM. |

## The agent's questions back, and the defaults taken

1. **The first query type is "meaning of", not "next word"** — built as instructed. A
   next-word mode is a natural second query (the co-occurrence graph can propose likely
   companions with weights); parked until asked.
2. **The hash**: FNV-1a 64-bit, 12 hex chars, case-folded. Deterministic, pure, testable,
   collision-safe at this scale. Swappable for SHA-256 later without changing the engine's
   shape. Taken as default.
3. **The first meaning pack** (`graphs-domain`) is agent-authored: the graph/ontology ladder
   plus the issues-fs and development terms the memo names (QA part-of development,
   versioning part-of a version file system). It is extraction-style content: review it as
   you would an extraction, and correct it in the file.
4. **"Maybe those hashes are numbered"**: the world file numbers every token hash (t0, t1,
   …) in deterministic order so the engine can speak both ways; kept as a lookup, not a
   second identity.
5. **Grammar and verbs as their own meaning pack** is the right next step after the MVP
   proves the shape (the verbs register is already a proto-pack); parked with a note here.
