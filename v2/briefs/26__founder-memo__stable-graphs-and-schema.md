# Brief 26 — founder memo: fixed nodes, the four areas, and the schema

**Date:** 24 August 2026
**Source:** a voice memo recorded by the founder, transcribed by otter.ai
**Status:** the founder's words are source material; the transcript is reproduced verbatim
below. The instruction table and the questions are the agent's reading, marked as such.

---

## The memo, verbatim

> Dinis Cruz 0:04
> Okay, so this is a voice memo to try to really continue the great work we're doing on the graph for the documents with the multiple views, and one of the concepts I want to try to explain, which is again something I've done before and now it's really cool to be doing again, is the idea of the fixed nodes is actually super powerful because what it allows it allows a level of stability and a level of navigation that is what makes a difference when you're creating those graphs. Those graphs are very easy to to become interesting but not that useful, and we actually get to the point where they are getting useful. But there's a couple of principles that we really have to work on. So one of the principles is that every time any node on the page moves, there is context switching cost, and that's very problematic, because one of the things that, especially now that we can add and and remove layers, right, and we can add and remove what's it called nodes, it's that becomes quite an interactive flow because what you end up doing is you you can navigate up and down, and you sort of the graph becomes a way to explore the the content, especially because we have different paths and different dimensions, and in a way we're already showing the whole graphs of graphs in there, right? But what's very important is that every time we we basically. move any node in the canvas, which basically means we force a redraw. There is an a cost from a context point of view because the mental picture that one has about the graph disappears, right? And that's a problem. Even you know, even from you know you know agents looking at it, right? Like basically, imagine if you have a graph with five nodes, and I add one, and all the nodes, and now you have six nodes, but they're all in different locations. Well, that's a problem, right? Where if I add, if the five that were there stayed exactly in the same place, and the what's it called the the sixth node gets added, at that moment in time it doesn't really matter where it gets added or where it stabilises. What matters is locked. So so what I would like to experiment here, and this is now, we really need to do these experiments as add-ons and almost like modules, so that we don't break the functionality that's there. And I really want us sort of to keep expanding on that sort of control set as we sort of zoom in and try to make it work. Right. So, can you add a mode where, when we add and remove nodes. The nodes that were already there don't don't change. And I think the way to do this is to freeze all the nodes that exist, add the new ones, let them stabilise in the sort of the, the sort of the, the force fields, etc. and then re-enable everything, and hopefully by then, we they shouldn't move or they stay fixed because at the moment you're already fixing them because what happens is when I move one, none of the others move, so I think we're actually probably closer, so that's the first one. That's very important. The other one that I want us to start exploring, which also some a really powerful trick that I use, is that at the moment we have two. We we start to put the anchors on the the page, and the way I would like you to think about this is: imagine you have four areas, you know, basically four rectangles: one above, one below, one to the left, one to the right, and that's the inside those rectangles, which basically like a border, right? That's the place where we will put those fixed nodes. So it's very important that the fixed nodes are also quite aligned in there, because again, the fixed nodes initially should be peaks, and we shouldn't have too many peaks, or else they're not a peak. And if you have too many, add another one, right? So I want us to, I want you to play around with two things. The first one is have those four areas, but then can you create a specific UI which is just designed for me to be able to drag and drop the current peaks, right? So that should be an extra UI that pops up that only shows me the peaks, and I should be able to move them around to one of those four areas, and maybe inside those four areas, create sections. Maybe five or or seven. Maybe five is a good one. So you, because that's a nice, or maybe six, right? Whatever number that is. So you have a nice combination of of numbers. Sorry, of slots. So what what what these are? These are the slots that I can put the the peaks on. So so the workflow is, and you can assign them initially, but the logic will be that if I want to move a peak from left to right, I can do it on this UI. If I want to move a peak from top to bottom, I should be able to do that too. And and that's what's it called a very powerful workflow, because the other thing. So, and then you should be colour coded different types of peaks, so I can know which one they are, and so you can see that what we're doing is we're starting to create these sort of basically places where we can force the the The we can anchor, sorry, specific, basically places that keep pushing them across, right? And and and what this takes us is to the other interesting point, which is we. And then I'm not sure if you can visualise this, but we can actually use the vertical, the vertical peaks to anchor with another line, almost like at a certain level. So I can have all the level twos and the level threes aligned in a particular way, which kind of creates a tree from the left-hand side because they are kind of being pushed together in there, and they all like aligned. But the interesting concept here is that, and and this is something that works quite well, is that those, for example, vertical lines that are glueing them together so that they are on the same line, we can then hide them. So there's almost you could also have this graph that has these sort of invisible lines that push some nodes to a particular place so that we can visualise them better. So yeah, so that's the super powerful workflow in terms of the design of this graph. The other thing that would be good to have on the side is every time I click a node, and this is again this is only for the the main graph view. So only when we maximise. So don't worry about the other ones. So here I will also we also need a way that when I click a node, I can see the details and the description of the node on the right, the way we have it, because we already have a really nice way to present the nodes. And also, what I also need to have on the right is all a list of every single node type and a list of every single edge type that we have currently, so I can start to think about creating the path, and the other thing that's missing, and I think this is a bit of work, but it needs to have, is that every node needs to be connected to the other nodes via a path, and remember that there's two paths. So you might actually have some cases where you actually show two nodes, a node having two edges, right? One two and one from, but the point is that well, I think in some graphs we probably only want one edge because again we remember that we only want something to go in one direction, and I think we already have an explosion of nodes that are caused by that because we should be going just in one direction, so that's why you need to change the graph so that every and like our definition, every node has an edge that has two edges, one to and one from the other nodes, node types. And actually, the other thing that would be really powerful to do is to have a visualisation of just the schema, and the schema is fundamentally all the node types and all the edge types that connect to them. So, and that's a great way to also understand how good we are and what refractors we need to do.
>
> Transcribed by https://otter.ai

*Transcription artefacts, read in context: "refractors" is refactors; "one two and one from"
is read as "one to and one from".*

---

## The instructions, as read

| # | Instruction | Where it landed (v0.4.28) |
|---|-------------|---------------------------|
| 1 | **The stability principle**: every node move costs the reader (and an agent) their mental picture; when the view gains or loses nodes, what was there must not move | The **stable add** mode, on by default: removals move nothing at all; additions freeze every node already on canvas, seed each newcomer beside an already-placed neighbour, settle only the newcomers in the force field, then unlock. The viewport holds too (no re-fit), because a zoom jump costs the same mental picture. An explicit ask (a layout button, the physics sliders, a preset, pin-on) still lays out everything, because asking for a new arrangement is not a context switch, it is the point. |
| 2 | Build these experiments as add-ons and modules, without breaking what exists | Each landed as its own module: the slot geometry and the schema aggregation in the pure core (gate-27-tested), the board and the inspector as component parts. The stable-add and schema toggles sit in the existing strip; every prior suite still passes. |
| 3 | Four border rectangles (above, below, left, right) where the fixed nodes live, aligned; peaks only, and few | The four **areas** with **six aligned slots** each; pinned peaks sit in slots along the border bands and the field between scales with the free nodes. |
| 4 | A dedicated pop-up UI showing only the peaks, drag-and-drop between areas and slots, colour-coded by peak type, assigned initially | The **peak board**: chips coloured by summit type (doc root, family peak, derived group), draggable into any slot (or tap chip, tap slot), swap on collision, a tray for unplaced peaks, reset to defaults; every change re-anchors the graph immediately and persists per document. |
| 5 | Invisible alignment lines: use the vertical peaks to pull same-level nodes onto a line, then hide the lines | **Queued as the next experiment**, question 3 below confirms the reading before it is built. |
| 6 | Maximised view only: click a node, see its details and description on the right, in the existing presentation style | The **inspector**, maximised view only: the tapped node's family chip, statement, support state and anchored quote (fetched from the extraction), in the node-document style. |
| 7 | Also on the right: every node type and every edge type currently in view | The inspector's **live legend**: node types and edge types with counts, recomputed on every visibility change. |
| 8 | Every node connected via paths; one direction per relation as the rule; two-way needs its own two verbs | Question 4 below, because this is an extraction-schema decision, not a viewer feature. |
| 9 | A visualisation of just the schema: all node types and the edge types connecting them, to judge quality and refactors | The **schema** source toggle: one node per family with its member count, one edge per typed relation with its verb (never the bare kind when a verb exists) and occurrence count, exclusive view, same canvas, same instrument. Day one it already shows the shape of the pilot: claims reach concepts through one relation used forty times, while concept-to-concept runs through seven verbs used once or twice each. |

## Questions for the founder

1. **Slots per area.** The memo weighs five, seven, then six. Six shipped, as one constant
   (`SLOT_COUNT` in `core/slots.js`); say the word to change it.
2. **"We shouldn't have too many peaks, or else they're not a peak. And if you have too
   many, add another one."** Read as: add another *level* of peaks, a summit of summits,
   rather than widening the border. Is that right? If so, that connects directly to the
   peaks-of-peaks idea from brief 22 and can be the same mechanism one level up.
3. **The invisible alignment lines.** The reading to confirm before building: synthetic
   high-pull edges from a vertical peak to its level-2 and level-3 members, so the physics
   pulls each level onto a shared line (a tree growing from the left band), with the edges
   styled invisible once they have done their work. Also worth deciding: should the
   alignment survive in stable-add mode (aligned nodes join the frozen set once placed)?
4. **One direction per relation.** The memo says the graph should go one way per relation,
   with the reverse being its own named verb, and suspects the current explosion comes from
   breaking this. The extraction already declares an inverse per verb
   (`VERB_INVERSE` in the generator). Proposal: the schema view marks any relation whose
   inverse is undeclared or which appears in both directions under one name, and gate-level
   enforcement follows once the marking has been reviewed. Enforce at the gate now, or
   review in the schema view first?

---

## The founder's answers (24 August 2026, in chat, verbatim)

> 1 , use 7 slots
> 2 yes that is correct
> 3 yes exactly, and we need a toggle to make them visible and invisible
> 4 i think it will better to have a first go at creating those inverse verbs , and then we use our new visualisations (like the schema one) to improve them

**Acted on at v0.4.29:**

1. `SLOT_COUNT` is 7.
2. Peaks-of-peaks is a confirmed direction: when a summit family grows too crowded to
   read as peaks, the answer is another level of summit, the same mechanism one level up.
   Recorded here; built when the crowding first appears.
3. The **align** source ships: one invisible rail per heading level, locked in its own
   column, every section tied to its rail with a short invisible edge, so the physics
   pulls each level onto its own line and the document reads as a left-rooted tree. The
   **align lines** toggle reveals and hides the rails and their ties; hidden or shown,
   they are always doing the pulling. The rails stay locked through stable-add runs, so
   the alignment survives adding and removing sources.
4. The first go at the inverse verbs is the **verbs register**, `v2/universe/verbs.json`:
   every asserted verb with its declared inverse, the structural relations (about ⇄
   subject-of, demonstrates ⇄ demonstrated-by, contains ⇄ part-of), and the symmetric
   relations (derived) marked as such. The build fails on a verb the register does not
   carry, on two verbs sharing an inverse, and on an undeclared self-inverse. The schema
   view now labels every relation with both directions (verb ⇄ inverse ×count), which is
   the review surface for improving the first-go names, exactly as answered.
