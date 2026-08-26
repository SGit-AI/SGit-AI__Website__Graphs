# Brief 29 — founder memo: the core graph, document to word

**Date:** 26 August 2026
**Source:** a voice memo recorded by the founder, transcribed by otter.ai
**Status:** the founder's words are source material; the transcript is reproduced verbatim
below. The instruction table and the questions are the agent's reading, marked as such.

---

## The memo, verbatim

> Dinis Cruz 0:02
>
> Okay, so now for the next version of the graph in this. Graph viewer that we've been working
> on. I I want to do an experiment to see how this scales, and and how we can implement
> basically. What we have described in a document, I believe that you should have around the
> idea that we transform documents into paragraphs. So documents into graphs, where we go all
> the way to the detail of the sections, the paragraphs, and even the words. So, so what I
> would like you to do is we already have a tree, which is the first pass at creating a mapping
> of the structure of the document. So, I would like you to do is to create a kind of a
> complete separate structure and code base. Well, tool and and component. Well, tool is going
> to help with this, where it's basically going to transform, visualise, and transform that
> document all the way to the words. So what I mean by at the moment we have the document with
> two layers, which is like the top layer, then the document, then the 10 of the sections, and
> then the subsections. And what I would like us to do is to keep zooming in. So basically,
> what we need to do. So you need to, and then we need to figure out the best way to scale this
> in terms of creation of files, where you create one big file or you create multiple files.
> This is the whole graphs of graphs of graphs, right? But the logic here is I should be able
> to start from the document and keep expanding it, like you know, bit by bit by bit by bit.
> Let's say on a tree structure, and I should be able to expand it all the way to the
> paragraph. In fact, all the way to the word, so the way to think about this is kind of like
> an AST, the abstract syntax tree, but you know, for now, very driven by the by the content
> itself. So, so if you think about it, and I think we also talked about this in terms of
> contracts, right? So you think about you have a document, that's the note, then then you have
> the sections, the notes down, and for each section, you have the and we need names for this
> because you need to break this down into. You know a logical structure. Then you have the
> next layer down, and then and then you have basically structures, and each one is sort of
> that that compression. So so maybe you have areas or sections or thingies, and then
> eventually you're going to arrive at a paragraph, who then will have bullet points, for
> example, or will have text inside the text. You're going to have, you know, probably
> sentences, right? And and inside there, you're going to have words, right? So we basically we
> need to have each of these needs needs to be a node in a graph that is linked to the previous
> one before, right? And we need to have this level of granularity, right? All the way down.
> And basically, the and but the other thing that you need to also capture, and this is one of
> the key powers here, is that you also need to capture the idea of needs to capture the idea
> of of adding extra nodes and extra connections to to the to the nodes, right? So, for
> example, if you have a bold, right? Let's say, then you need to link. You need to have a node
> that links that bold, those three nodes, to a bold, so we can basically understand which one
> of those are because the bold has extra meaning, so that's going to be more important. And
> the logic here is to start to create these sort of cross-referenced indexes within the
> document, and and really allow us to have a level granularity up to the words, up to the
> concept. So, so in a way, I think what what I'm trying to say here is that we need a
> foundational graph, which is almost like the core graph, which is the one that will underpin
> everything, because that's the one that actually has the connection. And in fact, you you can
> see the problem here, because at the moment you are already, if I'm understanding correctly,
> you are already doing linkage based on word count and number count. I think, and even
> character count, which is very fragile, which basically means that every time there's a
> little change in a document, everything breaks and you you can't really refactor, and it's
> really sort of fragile. Where you really should having a sort of expat, sort of, or even ID
> base, sort of cross-reference, right? Because actually that's the thing. So we we can give
> some IDs to to these documents, to these to these sections. Maybe no ID ID to up to a word,
> but at least multiple levels. And then the logic will be that if I want to point something on
> a particular part of the document, I should have a reference ID. I shouldn't be saying you
> know this is start set character 256 and ends on character 259 right or 1,75 whatever right
> so so we need this fundamental graph and that's what we're creating here so that's I think so
> that's why I think you might have might want to explore with a different viewer first so that
> we don't pollute the entire graph, or maybe do it on the other one because I think it's
> already quite flexible and and you already have quite a lot of components and it's already
> well refactored. So maybe just do it there. But what I want us to the next phase is let's
> create a view and also this is this is like a tree view. You can even do this on a one of the
> views that you can add is like a tree view, literally like a sort of an expand. And if you
> think about what I'm saying, is I should be able to expand that tree all the way to the word,
> right? And that's and but then and and again that that's that's the core graph, and and it's
> from from there that we then create all the context analysis. So what it means? It means you.
> If you if you imagine then if as you go up from there, you could say, oh, this topic that is
> very important that we do. Oh, it's these seven words here. So you link them. So we could
> even have graphs now are connected to one word. So we can even say how many how many times a
> particular word appears in the graph, in which is in the document, which is very important,
> right? So, cool, right? So let's map this out. Another another thing is I feel that we now
> need you need to start refactoring a little bit the the controls and the ones at the top. So
> in two tabs, maybe different sections, because it's it's getting bigger, and we need more
> options to control it, right? So we need to have a bit more flexibility. So maybe have
> different tabs, so we can basically start continue to experiment with that, and and then and
> then the other thing on on the right is very important that every time you click on a node in
> the graph, that gets updated. And what I was thinking of is one of the questions I have is I
> want to know. It's almost like on the right, I'm more interested in knowing everything that
> you know about a node, not necessarily just that little view of that. Because at the moment,
> you're almost giving the view that I have on the on the main graph, but I think what will be
> cool is on the right is almost like show me everything that we know about a particular node,
> right? So oh cool. Well let's let's build this
>
> Unknown 9:17
>
> up
>
> Transcribed by https://otter.ai

---

## The instructions, as the agent reads them

| # | The founder's words (condensed) | What it commits the work to |
|---|---|---|
| 1 | "transform that document all the way to the words … kind of like an AST, but very driven by the content itself" | A core graph of the document: document → section → paragraph → sentence → word, each level a node linked to its parent, generated from the source markdown. |
| 2 | "we need names for this … a logical structure" | A named ladder. This build names it: **document, section (any heading level, level recorded), block (paragraph, bullet item, code, quote, table), sentence, word**; plus **span** (markup covering words) and **form** (the shared word-index node). |
| 3 | "one big file or multiple files … graphs of graphs of graphs … expand it bit by bit" | Sharded storage: an index file with the section skeleton and counts, one shard per section holding its blocks, sentences and words, loaded only when that section is expanded. |
| 4 | "if you have a bold … a node that links those three nodes to a bold … cross-referenced indexes" | Markup captured as span nodes: bold, italic, code, link, each covering the word instances it marks, so emphasis is queryable structure rather than lost formatting. |
| 5 | "how many times a particular word appears … in the document" | A word-form index: one node per distinct form with its count and the ids of every instance, so a form connects to everywhere it occurs. |
| 6 | "character count … is very fragile … I should have a reference ID, not character 256 to 259" | IDs are the reference currency at every level down to the word instance. Byte ranges are kept only as build-time verification metadata, never as the pointer a cross-reference uses. |
| 7 | "maybe do it on the other one because it's already quite flexible … well refactored" | Build in this reader, as a separate tool (its own generator) and a separate component, not woven into the extraction pipeline; the core data lives beside the universe data, and the existing graph is not polluted. |
| 8 | "a tree view, literally like a sort of an expand … all the way to the word" | An expandable tree pane in the viewer: document at the root, expand to sections, blocks, sentences, words; each expansion that needs a shard fetches it then. |
| 9 | "refactoring the controls at the top … two tabs" | The options strip reorganised into tabs so it can keep growing. |
| 10 | "on the right … show me everything that we know about a particular node" | The inspector stops mirroring the graph's view of a node and shows the full record: every data field, its connections both ways, where it sits in the document, and what else the build knows. |
| 11 | "it's from there that we then create all the context analysis … this topic is these seven words here" | Parked deliberately: linking topics and extracted nodes down to word instances is the next phase, and it becomes possible exactly because the word instances now have IDs. |

## The agent's questions back

1. **Sentence splitting is a heuristic** (full stop, question or exclamation mark followed by a
   capital, with guards for common abbreviations). It will be wrong occasionally. Is a
   first-pass heuristic acceptable until sentences earn their own review loop, or should
   sentence boundaries be treated as extraction content that a reviewer can correct?
2. **Word IDs are positional within their sentence** (section / block / sentence / word
   number). That survives edits elsewhere in the document but not edits inside the same
   sentence. The memo says "maybe no ID up to a word, but at least multiple levels"; this
   build gives every word an ID anyway, since it costs nothing and the fragility is scoped to
   the sentence that changed. Confirm or trim.
3. **Should the extraction's own anchors migrate?** The current layer 1 anchors are
   quote-plus-section, verified by byte offset at build time. The core graph now offers
   stable IDs down to the sentence. Migrating extraction anchors to core IDs is the obvious
   next step and the real answer to "everything breaks when the document changes"; it touches
   the extraction format, so it waits for the word.
4. **Code blocks are kept as blocks, not split into words** (their text is verbatim and their
   words are code, not prose). Same for tables. Right call, or should code identifiers join
   the word index too?
