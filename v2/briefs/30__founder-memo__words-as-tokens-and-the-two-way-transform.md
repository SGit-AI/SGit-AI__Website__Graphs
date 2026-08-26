# Brief 30 — founder memo: words as tokens, and the two-way transformation

**Date:** 26 August 2026
**Source:** a voice memo recorded by the founder, transcribed by otter.ai
**Status:** the founder's words are source material; the transcript is reproduced verbatim
below. The instruction table and the questions are the agent's reading, marked as such.
**Caveat recorded:** the founder notes up front that this was recorded before seeing the
browser version of v0.4.37's changes.

---

## The memo, verbatim

> Dinis Cruz 0:00
>
> So, with the caveat that I have not seen the browser version of the latest changes, I wanted
> to add some more thoughts and comments on what we're doing, because I think we're onto
> something really interesting here, and I want to expand on it. So the the basically the
> what's happening at the moment is that we had a first pass at creating the file with the
> document broken into sections, and the thing that I find is more interesting is the fact
> that that document, which is a distance-sized document, only had 4000 words, right? And this
> is where I want us to basically leverage and be inspired, but what's happening with the
> transformers and with, in a way, even the way the LLMs parse and the way it does tokens,
> which is to basically start viewing each of those words as a token. So basically, as a
> unique entry, and
>
> Speaker 1 1:27
>
> then and
>
> Dinis Cruz 1:30
>
> then look at each of those words as tokens, and let's now do a whole bunch of analysis and
> mappings on them because I think one of the things that we can do is we can actually start
> to get a lot of understanding and and mappings from it. And actually, there was one of the
> MVPs that we did actually worked quite well because it it also started to do connections
> between words, but I think we need to take that to the next level. But there's there's one
> very interesting concept here that I feel is very interesting to explore to see how much
> we're operating on, which is, for example, how many of those verb words are verbs, how many
> of those words have meaning, how many of those words are padding words, because then the
> analysis comes from top of it. So it's kind of like, you know, imagine having graphs that
> are created from the words, and and then we can also connect words that are misspelt, words
> that are very related, but even more interesting. And this is what I think is this gets
> super interesting. Is what we can also do is we can look at when words have different
> meanings in the same document, right? And and if you think about it, what we are doing here
> is the beginning of basically doing these sort of passes at layers because if you think
> about the abstraction, you know we should be doing this analysis at every layer because a
> not only is it interesting if the terms are better, but also if we start to have a better
> centres of gravity of what the words are doing and what are they connected to, and it's sort
> of like the the attention bit, right? So imagine, let's visual and use again the same thing
> that we did with the the you know the attention is all you need kind of thing. Where you
> know can we start to connect these words to other parts of the document, other words on the
> document, and how do they relate to each other? Right, but so the idea here is that each
> document kind of gets its own sort of token analysis, and instead of instead of breaking
> into tokens, which makes sense because they want to, you know, the idea is to try to limit
> the amount of the universe, right? Of of the possible words, but in this case we don't have
> that. We should literally be having each word has a meaning, but also we can consolidate
> some of this because there's going to be words that we can extract the meaning, and we don't
> need the padding around it, or we don't need other stuff around it. So we should actually be
> able to go down from 4,000 to others, and it also is going to be it's also going to be very
> interesting to do sort of statistical analysis and views on on actually what actually is
> going on with the the words and how are they used, and and how are they actually integrated
> with the rest of the document? So here's what I would like to explore. I think, you know, we
> if we can do a further analysis of the words, we start to understand what do they mean, what
> are we trying to say with them. But also, I mentioned that what I think is very interesting
> is that when words have different meanings, when words have different, and it's not just
> thingies that some words do have different meanings depending on their used, right? So, and
> this is why the graph is important because that's it's why, if you think about it, if we say
> there is a node, the nodes should be connected to graphs, right? So it's almost like what is
> the ontology of it? Because it could be, I could be referring to some other type of node,
> right? I could be referring to something else, right? Even graph, you know, I could be
> referring to different types of things, right? Because our graph is a network graph, so you
> start to see that when we look at our dictionary and our dinosaurs, and the connection, it's
> almost like every one of these words, special words that are nouns, they they describe their
> identifiers. They need to then have connections outwards, and this is where again we should
> have our identifiers now. This is one very very important concept, which is we actually have
> identifiers per document. So the document should have a set of identifiers that we can make
> reference to it. So these IDs again, each node gets a unique ID, and we don't need massive
> randomness, right? Because again, if you only have 4000, you're not going to have a lot of
> collision, right, on here. But but then you have you're going to have another set of IDs.
> For example, for the project, for the book. So if you think about it, the book will have its
> own unique ID for node, so that we can then connect, or unique ID for graph, or fractal, or
> you know, specific topic, or you know, even the concepts needs to have these unique IDs,
> because that's how we connect the dots. That's how eventually we start putting them all
> together via these unique IDs that fundamentally are the glue. But they need to be
> deterministic IDs, right? Actually, there's one more important topic that I think I forgot.
> It's very important that we have the ability to rebuild the document from the graph. So it's
> very important that we have a two-way transformation. So let's address that sooner more than
> later, because there's a lot of things that I would like us to do, and you need that,
> especially when you talk about refactoring and making changes and detecting changes. It's
> very important to what's it called to to be able to have a basically a lossless
> transformation from Markdown to our object representation back to Markdown, and that's why I
> was saying that you need to capture those properties, those in a way formatting properties
> in an what's it called in a separate dock in a separate graph connected to the main graph
> and in separate things, so that we have, we can go a two-way transformation back into the
> document, which is very, very, very important.
>
> Transcribed by https://otter.ai

---

## The instructions, as the agent reads them

| # | The founder's words (condensed) | What it commits the work to |
|---|---|---|
| 1 | "it's very important that we have the ability to rebuild the document from the graph … let's address that sooner more than later … lossless transformation from Markdown to our object representation back to Markdown" | The two-way transform, built first in this round: a formatting graph beside the semantic one, and a build gate that rebuilds the source markdown from the graph and fails unless it is byte-identical. |
| 2 | "capture those formatting properties in a separate graph connected to the main graph" | Formatting lives in its own file (`fmt.json`): heading lines, block markers, gaps, raw markdown per block, keyed by the same block IDs the semantic shards use. The semantic graph stays clean; the join is the ID. |
| 3 | "start viewing each of those words as a token … each document kind of gets its own sort of token analysis" | A token analysis pass over the word forms: the document is its own token universe, with no vocabulary cap, because unlike an LLM tokenizer there is nothing here to compress away. |
| 4 | "how many are verbs, how many have meaning, how many are padding" | Every form classified: padding (function words), verb (a curated common-verb list, heuristic), number, code (identifiers like Safe_UInt__Port), content (the rest); with the meaning-density statistics on top. |
| 5 | "connect words that are misspelt, words that are very related" | Stem groups (graph/graphs/graphing share a group) and near-miss pairs (edit distance one between content forms) computed and shipped in the token index. |
| 6 | "when words have different meanings in the same document … what is the ontology of it" | A context-spread score per frequent content form: how diverse the sentence neighbourhoods of its instances are. High count with low neighbourhood overlap marks a polysemy candidate ("node" the graph element vs "node" the tree row). First pass, statistical, no NLP model. |
| 7 | "the attention bit … connect these words to other parts of the document … centres of gravity" | A co-occurrence graph over content forms: edges weighted by shared sentences, each form carrying its top companions, the document's own attention map. |
| 8 | "statistical analysis and views on what is going on with the words" | The token index carries the totals (content vs padding, distinct forms, words used once) and the viewer's core tree pane gains a words mode that shows the ranked forms with their classes, and everything known about a form on the right. |
| 9 | "identifiers per document … no massive randomness … deterministic IDs" | Already the law since brief 29 and restated as such: core IDs are structural and deterministic (`sec:`, `blk:`, `sen:`, `wrd:`), no randomness anywhere. |
| 10 | "another set of IDs for the project, for the book … the glue … deterministic" | Read as design direction: book-scope concept IDs. The extraction's node slugs (e.g. `meaning-through-connectivity`) are already deterministic and book-unique; the registry that formalises them as the cross-document glue is the next structural step, not this round's build. |
| 11 | "we should be able to go down from 4,000 to others" | The compression instinct recorded: content forms minus padding is the first measured step of that descent; the statistics now say exactly how far down the meaning layer sits. |

## The agent's questions back

1. **Verb counting is honest-heuristic**: a curated list of common verbs plus obvious
   inflections, not a part-of-speech tagger. The real answer needs a POS pass (a small
   tagger, or an LLM pass over the 951 forms with the sentences as context). Is the heuristic
   enough for now, or is the LLM tagging pass worth a round of its own?
2. **Polysemy is scored, not resolved**: the context-spread score surfaces candidates, but
   splitting "node" into its senses and wiring each sense to its ontology is judgement work,
   exactly like the extraction was. Should sense-splitting become extraction content (agent
   proposes, founder reviews), with the candidates list as its worklist?
3. **The book-scope ID registry** (instruction 10): the natural shape is a single
   `ids.json` at the universe level, seeded from the extraction slugs and the lexicon, every
   entry deterministic and owned. Build it next round?
4. **Rebuild scope**: the round-trip gate proves markdown → graph → markdown byte-identical
   for the pilot. Change detection and refactoring (the founder's stated reasons) then want a
   diff at the graph level (which blocks changed between versions). Worth building as soon as
   a second version of the document exists?
