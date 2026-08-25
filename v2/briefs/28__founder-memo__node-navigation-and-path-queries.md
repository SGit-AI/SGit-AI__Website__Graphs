# Brief 28 — founder memo: node navigation, reverse verbs, and the path query

**Date:** 25 August 2026
**Source:** a voice memo recorded by the founder, transcribed by otter.ai
**Status:** the founder's words are source material; the transcript is reproduced verbatim
below. The instruction table and the questions are the agent's reading, marked as such.

---

## The memo, verbatim

> Dinis Cruz 0:00
> Okay, so this is to continue the sort of the instructions and the ideas for the graph that we're creating about the document, which ultimately is how we're going to be managing content. Because you have to remember that, and you know this the amount of content, the amount of nodes is gonna increase almost exponentially because we're gonna be adding more and more documents, and the documents will also contain links to itself, right? So this is why it's very important that we. It's not just about what we have now, and and by the way, we already are at that sort of dot slash blob of graph where it's actually interesting, but it's not that useful. Although we already have some very interesting outputs of it, but I mean useful. I think we we're going to make it way, way, way more useful than it is now. So, so here's a couple more concepts. So one of the reasons why we need that bidirectional links, which at the moment are not being shown on the on the right in that UI, and by the way, there's a bug also on the UI where the new panes that we add, they need you need to resize the canvas to take them into account because they are overwriting the so they they are now going on top of the canvas, which basically means that, for example, when I pin stuff, I don't see them all in one go, right? I don't see all the pins, which is a problem. So, so one of the interesting concepts, like if you let's let's take OneNote because OneNote is quite interesting, right? So I should be able to click on just a node and have no, and basically from that node, I should be able to see all of the out links that come out of that node, and and in a way there will be different node types, and there will be different link types, or what we call the the verbs, right? And and that's what I want to see on the right hand side. I want to see this node, and it's that's where we can kind of create that sort of mini sort of description and and rich environment because we should be able to see them there. But then, what I should be able to to do, and maybe maybe we also do some kind of drag and drop environment, is that what we are building here is the path query, right? So, so the way you kind of want to think about this, and maybe we create a mode where I can expand and so click in that mode, and then see out of the graph that is going to generate, or maybe a subgraph. Maybe we have another thing on the right-hand side that shows me the subgraph out of it, because so the logic is that if I click on a node and I see the paths. So let's say this node links to another node, right? Let's say another five nodes, right? So that I should now see the relationships, and in fact, even just those verbs are very important because those verbs already tell me something that is actually quite interesting, in in a way that that works, right? So, so when I then, if I then click on one of those nodes that there's no links to, and I see it from that point of view, I shall I should now see the reverse verb, right? Because I should see the reverse verb, which leads me to the pre. verb, previous node. So I mean, so if A, you know, points to B, then if I click B, I should say is pointed by A. You know, again the the reverse. So if if and also this is where the verbs sometimes it's it's okay for the verbs to be a little bit specific to the to what it is because you have to remember that they have to read in English. It's very important. So in a way, it's not sometimes not just a verb, but it's almost like I don't know a statement. Not statement, but it's like an action. Like so, if you have the the book contains chapters, and then you have the chapter, or contains chapter, contains section, and then you have each section of. So you start to actually already have a judgement of that link type, and that's very important. And then I should be able to keep expanding. So, so because one of the most important mental picture that you have to think here is that I should be able to, starting from a node, I should be able to first see, hey, what is the universe that this node has? Then I should be able to say, well, okay, I want to follow this node up based on this, right? And then I should see the that particular you know verb or that particular node type, and that's how I then navigate it. And then we need to start exploring different ways to visualise that selection that we have, which is why we then need to hide all the other nodes that exist. And also sometimes it's worth having the peaks involved, which I'll come back next. But let's see if we can make sense of this
>
> Unknown 6:04
> one.
>
> Transcribed by https://otter.ai

*Read in context: "OneNote" is taken as the linked-note navigation pattern the founder has
used before; the closing "one" is the end of "make sense of this one".*

---

## The instructions, as read

| # | Instruction | Where it landed (v0.4.33) |
|---|-------------|---------------------------|
| 1 | Scale framing: nodes will grow near-exponentially as documents (and their self-links) join; design for that, not for today's counts | Recorded as the design constraint behind everything below; the type-level surfaces (schema, legend) and the one-direction verb rule are the scale strategy. |
| 2 | Bug: bidirectional links are not shown on the right | The inspector now lists the tapped node's **links out** (with their stored verbs) and **links in, read from here** (through each verb's declared inverse from the verbs register), colour-coded by the other node's family. |
| 3 | Bug: new panes sit on top of the canvas, so pinned nodes hide behind them | In the maximised view the canvas insets now exclude the inspector's 300px, and opening the peak board shifts the canvas beside it and refits, so every pin is visible in one go; closing restores. |
| 4 | Click a node, see all its out-links with their verbs and types on the right — the rich mini environment | The link rows, under the node's statement and anchored quote. |
| 5 | Clicking through to a linked node shows the reverse verb ("A points to B; from B, is pointed by A") | In-links read through the declared inverse (about becomes subject-of, contains becomes part-of), so every row reads in English from the current node's viewpoint. |
| 6 | Verbs must read in English, and may be phrase-like ("contains chapter"); the verb already carries a judgement of the link | The verbs register accepts any string; the schema and the link rows render it verbatim. Authoring richer phrase verbs is extraction work, now unblocked. |
| 7 | Following links hop by hop IS building the path query | The **path trail** at the top of the inspector: every hop taken by following a link row appends "-verb→ node"; a fresh tap starts a new trail; clear resets. This is the recorded walk that a future run-again query grows from. |
| 8 | A mode to expand from a node and see only that universe, hiding everything else | Already live as focus-on-selection with the degree stepper (and its brief 27 fix); the trail now names the path through it. |
| 9 | Maybe a subgraph panel on the right showing what grows out of the selection | Question 1 below. |
| 10 | "Sometimes it's worth having the peaks involved, which I'll come back next" | Held open for the next memo. |

## Questions for the founder

1. **The subgraph panel.** The main canvas already becomes the subgraph in
   focus-on-selection mode. Is the ask a SECOND, small canvas on the right showing the
   selection's neighbourhood while the main canvas keeps the whole universe? That is
   buildable (a mini cytoscape in the inspector), but it doubles the rendering surface,
   so it deserves a yes before it exists.
2. **The path query's next step.** The trail currently records the walk. The natural
   next move is making it executable: save a trail as a named path query (node type +
   verb sequence), and re-run it from any starting node to see what it matches. Is that
   the direction you meant, and should saved queries live in the document folder like
   crossrefs do?
3. **Drag-and-drop query building** got one mention ("maybe some kind of drag and drop
   environment"). Park it until the trail proves the concept, or sketch it now?
