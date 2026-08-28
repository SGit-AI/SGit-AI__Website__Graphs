# Brief 43 — founder memo: everything is a graph, so put the book through the same machine

**Date:** 28 August 2026
**Source:** a voice memo (Otter transcription, speaker label and timestamp preserved). The
fourth of the day, and the one that turns the philosophy into a build instruction: take the
decomposition built for one pilot document and apply it to a whole book.
Reproduced verbatim below. The numbered reading beneath it is the agent's, and it carries a
feasibility probe run against the real book before answering.

---

## The memo, verbatim

> Dinis Cruz 0:01
> Okay, so the next piece of work, which is interesting that we're only doing this now, is that we need to do, like I mentioned, in a way I just described in the previous memo, the fact that we take books from Markdown all the way to JSON and then rebuild it from there, where the JSON becomes a source of truth, and everything becomes a transformation on that JSON. But we're not doing that right now in the in making the book, which I think is a good power. So what what I would like you to do next, which it's an interesting piece of work, is if you look at the patterns that we had applied to the the to the to the document. So, so if you look at the document that we created, the thinking in graphs, the patterns that we've created there, the the strategies, the workflows, the way we were thinking about that is exactly what we need to apply to the bigger book, right? So now eventually this will come from the source documents, but in this case we will start with the book because it's always like it's like we talk about the meaning, you know, to connectivity, right? Like the whole point is to be able to intersect and connect to individual graphs, so it never really matters where you start. What matters is that you start, and then you grow from there, right? So, and and and one of the concepts, the building in graphs, and I think it's important that you also start to capture some of these notes, so that when we go back to building graphs, so the semantic knowledge graphs we you take into account because again this is now a life experience of Dinis technology is that one of the key concepts that in my head I have with graphs is that everything is a graph right by everything I literally mean everything every file format everything every type every stuff, even stuff that is not connected-they are all graphs. Because ultimately, graphs is something you know could be a byte, could be a word, could be a node, could be a text, could be a document, could be a graph, could be a whole full-blown graph database, whatever that unit is-and that's the fractal element of this, right? The fractal element is that everything is connected to everything, right? Unless you have a real air gap, and then you represent the air gap. So even then, that's something that can represent so in the graph. So for me, everything is a graph, right? And and that's why I don't make big distinctions between graph databases and all the stuff, I just happen not to use graph databases because for me, they they provide a level of capability and overhead that I don't need because of the refactoring work that I do. Everything else becomes a JSON file. Everything else becomes a file, and then I use file-based technologies, which these days they scale spectacularly, right? So, why use a graph database if I can just have a whole bunch of JSON files that I can load from S3 in milliseconds and load them in memory, and then do memory manipulations on it, right? Using programmatic workflows, especially these days, using customised bits of code or small, you know, mini tools that we can create, right? It's much more efficient, but but the concept is everything is a graph. So and and it doesn't matter then what you start. It doesn't matter what you call it. So if you think about it, like our document right now, you know, written in HTML or Markdown, is a graph, right? But it's a it's a very hard to link graph, right? So so the whole point, and also it's a graph that is very hard to change. So the way I look at it is that the point of you know in a way the measurement of the graph, or the I would say the the maturity of it, is how how easy it is to link it, how easy it is to change it, and how easy it is to transform it, right? And how easy to sort of yeah, and the connection. So once you have that, everything just becomes a case of transformations, and that's also why what the let's concept talks about, you know, the load extractions from safe, is this idea that everything becomes a transformation. Everything goes from one state to another state to another state, and these the big inspiration here is nature, right? So if you look at nature, nature is a gigantic graph, right? Everything is connected to everything, right? But sometimes you have layers who have no idea what's happening above them because of the aggregation. You know, an atom doesn't know that is made into molecules. A molecule doesn't know it's made into cells. A cell doesn't know it's making into, you know, something else, right? You know, or an organ. An organ doesn't know it's made into an arm. An arm doesn't know it's made into a person, right? A person might not be aware that it's built of a bigger system, right? So every one of these are layers, and they all graphs, right? And and then that's the power of the graph is you can connect them. That's why for me, it's not about, for example, somebody might not use these techniques because they were happy with their graph. It's like no, like this, you know. This is an approach to graphing. This is an approach to connecting things. This approach to data representation. It's an approach to how do you hyperlink things. So, so then when you have techniques like semantic graphs and triplets and others, they are just a really cool technique to do that, right, and that's that's the key power here. So what what we need to do now is we need to apply these principles to this book. So we have a mature book that we're going to publish that we're very close to publishing. So let's now leverage these techniques into the book. So we need to basically have a version of the book that is JSON created, and you might need multiple JSON files for this, but again, we already have the technology for this. We already used it. Now we're going to use it at bigger scale. So we're going to learn, right? And the point of this is now we're going to try to apply the principles that we did on a small document to now a bigger document, which usually means we become more scalable, more effective. We're going to learn some limitations. We learn what works. We improve the tooling, and remember that as what we talked before, whenever we do one of these transformations, the tooling and visualisation observability, they are not nice to have, right? They are, in a way, they are more important than the final product because they are what allows you to scale. It's like the JSON file that you're going to create needs to be created by something else, right? And is that parser, and the visualisation of that parser, and the caption of that parser, and the tests of that parser, and the observability, all of that is more important than the actual output, because the actual output quality is a side effect of that. That's my point, and and you and eventually, it becomes invisible, of course, and that's when the quality goes up, and that's where everything we do goes up another level, right? So, so what we now need to do is we need to apply the principles that we did on one supporting document to now the main document, so that we now do the releases from there and we visualise this from there, and we have this sort of scalable way. So, and also where we should have also is those five layers. And then, what's interesting is that, including the universe, including all the bits that we then for the document. Because what's interesting is that when we then start talking about the the book title, and we start talking about the book content, and we start talking about the structure, and we start talking about, for example, the individual agents' work that they are working on. They will be operating at individual layers of this, right? And that's the power, right? The power is that you will see that each of these, you know, you know, it could be, for example, that you know, one of the, let's say, you can have an editor, right, or even the publisher that doesn't work at level five. The pros, it works more at the higher level, because the editor is trying to understand how the positioning of the book and trying to connect the messaging. And again, when I when we go out, so if you think about when Lin Pub says, "Oh, I can have a sample of the book. Actually, what we should be doing is also maybe making available the five versions of the book, right? You know, each level, so they can choose which level they want, right? So let's now experiment on this and and map out a series of activities for how can we leverage the ideas and the concepts and the tools, and you know the the the words, concepts, language, models, right? That we're creating because now this is where it becomes real, and and the point of this is to develop those things. So, but this is another key concept. Like we don't develop technology because it's a cool idea. We're experimenting, which we did a little bit with the with the word models, language models, right? We everything we do now serves a purpose, right? So when we develop a tool, develop something, there has to be a clear output for it.
>
> Transcribed by https://otter.ai

---

## The agent's reading

Seventeen items. Items 12 to 14 are the probe, which was run before answering because the
memo's central claim — *"we already have the technology for this"* — is checkable.

### The philosophy, to be carried into the semantic-knowledge-graph work

The memo asks for these to be captured as notes for later, and they are recorded here as
the founder's positions rather than the agent's.

1. **Everything is a graph, and *everything* is meant literally.** *"Every file format,
   every type, every stuff, even stuff that is not connected — they are all graphs."*

2. **The unit is whatever you choose.** *"Could be a byte, could be a word, could be a
   node, could be a text, could be a document, could be a graph, could be a whole
   full-blown graph database, whatever that unit is — and that's the fractal element."*

3. **Even disconnection is representable.** *"Everything is connected to everything, unless
   you have a real air gap, and then you represent the air gap."*

4. **Why not a graph database.** Not an objection to them, a fit judgement: *"they provide a
   level of capability and overhead that I don't need because of the refactoring work that
   I do."* Files instead — *"why use a graph database if I can just have a whole bunch of
   JSON files that I can load from S3 in milliseconds and load them in memory."*

5. **The maturity of a graph is measurable, and this is the memo's most usable idea.** *"The
   measurement of the graph, or the maturity of it, is how easy it is to link it, how easy
   it is to change it, and how easy it is to transform it."* By that test, markdown and HTML
   are graphs — *"but a very hard to link graph… and a graph that is very hard to change."*

6. **Everything then becomes transformations**, state to state to state.

7. **Nature is the model, and the point is aggregation blindness.** *"An atom doesn't know
   it is made into molecules. A molecule doesn't know it's made into cells… A person might
   not be aware that it's built of a bigger system."* Every layer is a graph, and the power
   is connecting them. Semantic graphs and triplets are *"just a really cool technique to do
   that"* — one approach among several, not the definition.

### The instruction

8. **Put the making-of book through the pilot's machine.** *"We need to basically have a
   version of the book that is JSON created, and you might need multiple JSON files for
   this."* JSON becomes the source of truth; everything else becomes a transformation of it.

9. **The five layers, for the book**, including the universe. Agents then work at different
   layers: *"you can have an editor, or even the publisher, that doesn't work at level five,
   the prose — it works more at the higher level, because the editor is trying to understand
   the positioning of the book and connect the messaging."*

10. **A publishing idea falls out of it.** Instead of one Leanpub sample, *"making available
    the five versions of the book, each level, so they can choose which level they want."*

11. **The tooling outranks the output, stated as strongly as it has been said here:** *"the
    parser, and the visualisation of that parser, and the tests of that parser, and the
    observability — all of that is more important than the actual output, because the
    actual output quality is a side effect of that."*

### The probe: is the technology really ready?

The memo says *"we already have the technology for this. We already used it. Now we're going
to use it at bigger scale."* That was tested before answering, by running the pilot's own
decomposition functions over all 17 chapters of the book.

12. **It runs, and the structure holds.** No failures, no exceptions, on every chapter.

    | | Pilot (1 file) | The book (17 files) | Factor |
    |---|---|---|---|
    | sections | 39 | **165** | 4.2x |
    | blocks | 186 | **819** | 4.4x |
    | sentences | 352 | **1,818** | 5.2x |
    | words | 4,136 | **26,118** | 6.3x |
    | distinct forms | 927 | **2,850** | 3.1x |
    | inline spans | 123 | **386** | 3.1x |

13. **Vocabulary saturates, and that is a finding.** Words grow **6.3x** while distinct
    forms grow only **3.1x**. A book reuses its own words far more than a document does,
    which means the token analysis, the stem families and the co-occurrence map will behave
    differently at book scale — denser, and probably more useful.

14. **Three strains are visible before any code is written.**
    - **Size.** The pilot's graph is 620KB for 4,136 words. Naively scaled, one book is
      close to **4MB** of JSON. The shard model exists for exactly this and will have to
      earn its keep.
    - **A missing level.** The pilot is document → section → block → sentence → word. A book
      needs **book → chapter** above that, which the current generator has no concept of.
    - **New block kinds at volume.** The book carries **13 code blocks, 11 tables, 88
      quotes and 63 rules**. The pilot exercised these lightly; gate 5, the byte-identical
      rebuild, is where they will bite.

### The constraint the memo ends on

15. **No technology for its own sake.** *"We don't develop technology because it's a cool
    idea… everything we do now serves a purpose. When we develop a tool, there has to be a
    clear output for it."* This is the WCLM lesson, applied in advance.

16. **So the output must be named first.** The agent's answer: the clear output is
    **brief 42's part one**. That memo asks for the book's structure to change — a new
    opening part, and the history moved after it. Doing that by hand is the expensive,
    inconsistent editing brief 42 itself complains about. Doing it as a **transformation on
    a graph** is the thing this estate can do and a Word document cannot. **The JSON book is
    the machinery that makes brief 42's restructure safe**, and that is its purpose.

17. **Second output**: the five reading levels, which serve both the Leanpub sample idea
    (item 10) and the agent-facing pages brief 42 asked for.

## Where the plan is

[The book-as-a-graph pack](../dev-pack/bookgraph-00-the-plan.html), with the activities the
memo asks to be mapped out, each naming what it produces and how it is checked.
