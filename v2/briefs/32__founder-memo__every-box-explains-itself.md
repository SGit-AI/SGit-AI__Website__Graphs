# Brief 32 — founder memo: every box explains itself, both ways

**Date:** 26 August 2026
**Source:** a voice memo recorded by the founder through the viewer's own loop ("voice memo
via your ux"), sent with two screenshots of the WCLM: the default prompt, and the same prompt
widened to "meaning through nodes and graph sausages" — which, as the founder noted with
delight, nicely detects the word the universe does not have.
**Status:** the founder's words are source material; the transcript is reproduced verbatim
below. The instruction table and the questions are the agent's reading, marked as such.
**Verdict recorded first:** "this WORKED really WELL … you did a great job at those first
transformations, which now we can add more and tweak."

---

## The memo, verbatim

> what also worked really well is the ability to put multiple works and phases where we go
> from the default one (pic1) into that with more words (pic2) which for example nicely
> detects works not used :) So for this next set of changes, can we experiment with this?
> First of all, every single box at every single layer needs to be clickable so we can zoom in
> into why that's there because that's kind of the point. Right? The point is to start to
> explain why we have certain words, why we have certain, you know, layers on our, you know,
> basically, Yeah. So every one of our layers. Right? So... and then let's start thinking
> about... I think you probably maybe below or maybe add to the right, or let's find a good
> place to put it. Like, the information about that layer. And it's it's the same thing as
> before. Think about it. It's it's graphs or graphs. Right? So every note, every item of
> every one of those layers now had the reason to be there, which is caused by downstream but
> also upstream. So we wanna start showing that. And what we now need to do is start looking
> at abstractions concepts and and then start thinking about the output that one to create.
> Because if you think about it, we're probably gonna have multiple of these. Right? Because
> what we are building here is sort of the transformation engine, which is gonna be based on
> this kind of concept of layers. And, again, the visualization that you did, again, inspired
> by how all of the other llms that visualize, I think is brilliant. importantly, what we now
> have here is a great way to have a rational explanation for the abstraction both up and
> downwards. So if you think about it, what we now start to have here is a nice mathematical
> way to start to explain why the compressions worked. And and if you look at it again, the
> going back to the beginning of our universe, which is everything we build up to the top of
> the document, we now starting to create these transformations. And I think we need this in
> between layers of the book. So not like as in between, I guess, these layers, but in
> between abstraction levels, we need one of these engines. So in a way, this sort of, you
> know, this sort of content, this sort of word content language model is sort of how we can
> then rationally explain how we go all the way to the top of the book, which is the the
> the... that level one explanation all the way to each chapter, each thing. So in a way,
> each chapter will have one of these. Eventually, each... every time we move an obstruction
> layer, we have one of these. Or every time we wanna connect parts of the book or we wanna
> connect bits. So... yeah. So let's now do multiple rounds of this. I think the next
> fundamental part is make sure that every part of this is a graph. I can click on it, but
> also I can see what happens. Like, when I add a new word, you know, how much that impact.
> So, again, if you look at the two pictures attached, you see that... when I added graph,
> then it made a massive difference. Right? Because suddenly, there was a lot more
> connections in there. And I think that's a good example. Right? Of what we're trying to do
> and and those connections. because eventually, what we wanna do is to map what was x
> saying. Once we have a phrase and based on the phrase, we'll then start to arrive at
> something on the right hand side, maybe the concepts and the metadata or sort of the
> structures or the central gravity, which then again will will connect into a prose. Also,
> can you also create a bunch of examples at the top. So little buttons I can click so you
> can maybe pick four or five or six or seven, maybe, you know, and good examples all the way
> from loss of connectivity to weak connectivity so that we we can... again, easily test this
> out.

---

## The instructions, as the agent reads them

| # | The founder's words (condensed) | What it commits the work to |
|---|---|---|
| 1 | "every single box at every single layer needs to be clickable so we can zoom in into why that's there … that's kind of the point" | Every chip is clickable. Clicking selects it, lights its wires, dims the rest, and opens its explanation. |
| 2 | "every item of every one of those layers had the reason to be there, which is caused by downstream but also upstream … it's graphs all over" | The explanation pane shows the item as a node in the explanation graph: **because of** (everything upstream that produced it, with the reason on each wire) and **leads to** (everything downstream it feeds), every entry itself clickable, so the why can be walked in both directions. |
| 3 | "maybe below or maybe add to the right … the information about that layer" | A side pane on the right (below on a phone). Clicking a layer header explains the layer itself: its role, its inputs, its outputs, its counts this run. |
| 4 | "when I add a new word … how much that impact … when I added graph, it made a massive difference" | Run-to-run impact made visible: the engine diffs each layer against the previous run — chips that are new carry a badge, a delta line says what arrived, what left, and whether the winner changed. |
| 5 | "create a bunch of examples at the top … little buttons … all the way from lots of connectivity to weak connectivity" | Seven preset buttons, ordered strong to weak: the central concept, a multi-concept phrase, a mid phrase, a pack-only word, the founder's own sausages phrase (one unknown word), and a nothing-bound phrase. One click runs it. |
| 6 | "we're probably gonna have multiple of these … in between abstraction levels … each chapter will have one of these … rationally explain how we go all the way to the top of the book" | Read as the direction, recorded not built: the WCLM is the transformation-engine PATTERN, and one engine sits at every abstraction jump — word to concept, concept to chapter, chapter to thesis — each explaining its compression mathematically. The layers-with-reasons structure being built now is what every such engine reuses. |
| 7 | "map what was x saying … based on the phrase, arrive at the concepts and the metadata … which then will connect into a prose" | Also direction: phrase in, structured meaning out, prose composed from it — the generative half. Parked until the explanation half is solid. |

## The agent's questions back, and the defaults taken

1. **Placement**: right-side pane on desktop, below the columns on a phone — taken as the
   default the memo suggested; easily moved.
2. **The diff baseline** is the previous run in this page session (not persisted), which
   matches the pic1-to-pic2 gesture; a pinned-baseline compare ("diff against THIS run") is a
   natural follow-up if wanted.
3. **The example set** was picked by the agent to walk the connectivity gradient and includes
   the founder's own "meaning through nodes and graph sausages" verbatim, unknown word and
   all, because it demonstrates honest failure. Swap any of them by saying so.
