# Brief 23 · Founder notes: visible links, live physics, and exploring the graph

**date** 24 August 2026 · **kind** three founder chat messages, sent while the work of
brief 22 was in progress, reproduced **verbatim** below (the screenshots the messages
reference are described in brackets where the reading needs them). The instruction
table and everything after the quotes is the agent's reading, and is marked as such.
The third message answers questions 1 and 4 of brief 22.

---

## The first message, verbatim

> ahh, I spotted another bug, pic1 is a view of the document viewer, which doesn't show the (really cool) link (nicely colour coded) to the (in this case) thesaurus entry
>
> That link only shows when I hover it (pic2)
>
> note that once I clicked on it (pic3), I now can see the link permanently (i.e. don't need to hover it )
>
> what we need is for a) all those links to be visible depending on b) the options/checkboxes/buttons  I have selected in that doc section (missing at the moment), this would allow me to see more or less of those selections . What will be really cool is to see (as you have in some cases) a paragraph that has tons of links
>
> note that a work, section or paragraph can have more than one link (when there multiple ones, the last one added link will win), and when I hover then, what about if you do a UI nudge on that label (which I can use to hide them) that describes the type of link that it is (i.e. the type of universe item)
>
> in fact, these 'types' that we I'm talking about in the document viewer, and the same ones as the graph peaks that you are adding now, right?
>
> maybe we could only have one selection mode for nodes in the graph and links in the document viewer? (i.e the same toggle handles both)

*[pic1: the source pane showing a paragraph with no visible highlight; pic2: the same
span showing its highlight and native tooltip only under the pointer; pic3: the span
permanently lit after being clicked.]*

## The second message, verbatim

> small little fix on the physics , since they are already split into specific values (the string and pull value) can you apply them to the UI as soon as I move the slider (vs when I release the click, which is what happens now)

## The third message, verbatim

> on the graph, can you also add (I might have asked for this in the last memo), when I click on a node I would like the option to
>
> a) just see that node's selection
> b) have the ability to add (to that frozen view) the nodes it is connected to, all the way to those peaks
> c) when adding those 'nodes on the way to peak' have the ability to chose how many nodes to add (i.e. navigate up (1, 2, 3 .. max)
> d) show in the graph UI (or below in a another area) the stats of the selected node types and edge types that we are seeing in the current graph
> e) let's experiment with this next one, since we could hit some performance issues or massive node count, but it would also be super powerful if on that d) view described above, I could also see the status of the next batch of nodes. I.e. when seeing the stats of '2 node's degree of separation' I could also see the stats, node and edge types of the 3rd degree of sepration
> f) what this will allow me to do is to then (specially as the graph gets bigger and we have more and more nodes available), to chose which 'path to follow' (if you still have this reference, this a more interactive way to navigate the graph the 'path' mode we created a while back)
> g) one of the outcomes of the exploration above, is to create a set of 'pre-defined' & common paths that we can then just make available to the user via a click (i.e. pre-created views). in fact can you have a go at creating some of these?
> h) the reason these last items above are very important, is because we are now on a (great) path to add more and more connections/links/edges to the super powerful nodes that we have, which is exactly what we need to do, but will have the practical effect to create the 'dot' visualisation that is the common problem with most graphdb visualisations that I have seen (we actually have a briefing doc that talks about this 🙂 )
> i) note that this paths can become massive, specially when we start connecting document's graphs with each other (all the way to the book's own universe and peeks)
> j) finally, can you add the ability to maximise the graph area (where we don't need to keep updating the other views)

---

## The instructions, and what each commits the work to

*The agent's reading.*

| # | Instruction | What it commits the work to |
|---|---|---|
| 1 | Every link in the source is visible by default, controlled by options **in that doc section**, not only in the popover | The kinds default flips from none to all, and the pane head gains a kind bar: one colour-coded toggle per kind present in the document, with counts. |
| 2 | A span can carry several links; **the last one added wins**; hovering shows a nudge naming the type | The winning link decides the colour, the chip and the click; a hover chip names the kind (plus how many more links share the span); the full list stays in the tooltip. |
| 3 | The types in the document viewer are the same as the graph's peak families; **one toggle set should drive both** | One kinds list lives in the core tier; the kind bar, the options popover and the graph's family visibility all read and write the same state. |
| 4 | Physics sliders apply while the slider moves, not on release | The cose layout re-runs live, one run per animation frame, as either slider moves. |
| 5 | (a) Option to see just the selected node | The explore group's focus-on-selection mode at degree 0 shows exactly the selection. This, with (b) and (c), is the answer to brief 22's questions 1 and 4: the explore view replaces the old subtree mode. |
| 6 | (b, c) Grow that frozen view towards the peaks, choosing how many degrees (1, 2, 3 … max) | A degree stepper on the explore view: each step adds one ring of neighbours; "to peaks" removes the limit. |
| 7 | (d) Stats of the node and edge types in the current view | A stats bar under the graph counts visible nodes by family and edges by kind, updated on every change. |
| 8 | (e) Also show what the **next** degree would add, before adding it | The stats bar prices the next hop: the families and edge kinds one more degree would bring in. Accepted as an experiment; cost is two pure walks over the visible set. |
| 9 | (f) Together these are the interactive way to choose a path as the graph grows | The paths-to-peaks highlight stays; the explore stepper plus next-hop stats are the choose-before-walking affordance. |
| 10 | (g) Pre-defined common views, applied with one click; have a go at creating some | A views group with five presets: overview, reading map (doc tree as a top-down tree), pyramids (family peaks as trees), concept web (derived links), around selection (explore at two degrees with paths on). Preference bundles, editable as data. |
| 11 | (h, i) The dot-blob problem is coming as edges multiply, and paths will span documents | Recorded as the design constraint the explore model exists for; nothing to build yet beyond it. |
| 12 | (j) Maximise the graph area | A maximise toggle on the graph box takes it over the whole viewport and back. |

## Open questions carried forward

1. **Brief 22, question 2 (the first weaker-link derivation)** still stands: co-claimed
   concepts is the derivation shipped; the founder may prefer co-location or thesaurus
   adjacency next.
2. **Brief 22, question 3 (the exhibits edge)** still stands: the extraction records
   `graphs-of-graphs exhibits fractal-principle`; if the fact is recorded backwards, the
   fix is one anchored edit.
3. **Directional expansion** ("maybe on this direction, a direction", brief 22): the
   explore walk shipped undirected; splitting the stepper into upstream and downstream
   growth is a small follow-up once the founder confirms the current feel.

---

This document is released under the Creative Commons Attribution 4.0 International licence (CC BY 4.0).
