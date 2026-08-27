# 5 · From a page to an instrument

*After this chapter you will be able to see, in five screenshots taken from five points
in history, how a static page becomes something a person thinks with, and you will know
the one design law that made the difference.*

---

## Where it starts

On 23 August, release v0.4.5 put the first document into the second edition's universe.
One source document, *Thinking in Graphs: Meaning Through Connectivity*, read and
decomposed into a graph of what it says: twenty-two concepts, twenty-seven claims, three
hypotheses, four worked examples, one objective and eight asserted relations. Fifty-seven
nodes, each one anchored to a verbatim quote from the document, each anchor verified
against the frozen bytes on every build.

The page that showed it looked like this.

![The pilot extraction at v0.4.5: a document about a graph, rendered as a document.](figures/01__v0.4.5__pilot-extraction.png)

*Figure 6. `/v2/universe/thinking-in-graphs.html` at tag `v0.4.5`, 23 August 2026.*

It is a good page. It is also, in the terms this project cares about, a failure: it is a
page about a graph rather than a page you can use as one. Everything on it is text.

The single most important rule in this whole part of the project is stated on that page
and has held ever since: a node is a statement about a document, never about the world.
The graph does not say connectivity determines confidence. It says *this document says*
connectivity determines confidence, at this quote, in this section. Whether the document
is right is a different question, deliberately not answered here.

## The reader arrives

Fourteen hours and thirty-nine minutes later, v0.4.8:

> The universe reader: the source, the extraction and the graph on one screen. Founder
> request, on reading the pilot.

![The same page at v0.4.8: a resizable side panel with the live graph above the frozen source.](figures/02__v0.4.8__reader-side-panel.png)

*Figure 7. The same URL at tag `v0.4.8`, 24 August 2026.*

Same document, same extraction, same URL. The graph is now live, sitting above the source
text, with a draggable divider between them. Click something in one, the other follows.

The next release, twenty-nine minutes later, is the one that tells you what kind of
project this is. The founder used v0.4.8 and sent feedback. The note for v0.4.9 begins:

> The reader grows up: selection, the trail, the stepper, the tempo, and the whole width.
> Founder feedback on using v0.4.8, all of it acted on. The nasty bug first: clicking a
> graph node scrolled the extraction a little and to nowhere useful.

## Options as an instrument panel

By v0.4.11, three releases later, the graph has controls, and the controls are grouped by
what they are for rather than by what they are.

![The graph options at v0.4.11: layout, labels, physics, view.](figures/03__v0.4.11__graph-as-instrument.png)

*Figure 8. The reader's graph options at tag `v0.4.11`, 24 August 2026.*

Four rows. Layout picks the arrangement algorithm. Labels controls what text appears and
how big. Physics has two sliders, string and pull, that change how the arrangement
settles. View has doc tree, subtree only, fit and clear focus.

Five releases later, on the same day, the same panel looks like this.

![The graph options at v0.4.16, five releases later on the same day.](figures/04__v0.4.16__the-instrument-panel-grows.png)

*Figure 9. The same panel at tag `v0.4.16`, 24 August 2026.*

Three new rows have appeared and they are the interesting ones.

**Views** offers four named arrangements: overview, reading map, pyramids, concept web,
plus around selection.

**Sources** is the row that came straight out of brief 22. The founder's instruction was:
stop thinking in views and start thinking in *sources of nodes*. "It's almost like which
note packs we add in to the view." So the graph gained composable packs: the document
itself, the doc tree, the family peaks, the derived links. The view is whatever union of
those you switch on.

**Explore** has focus on selection, a grow control with plus and minus, and to peaks.
This is the walk: start somewhere, expand outwards a hop at a time, in a direction you
choose.

And **View** has gained pin peaks and paths to peaks.

Between figure 8 and figure 9 there are five releases and about three hours. Nothing in
the second panel was in a plan. Each row is one instruction from one memo, built and
shipped, then used, then corrected.

## The design law

At v0.4.28, two days later, the founder sent brief 26, about fixed nodes, and it produced
what the retrospective calls the era's deepest design law:

> **The stability principle** (v0.4.28–v0.4.31, brief 26). "Every node move costs the
> viewer their mental picture" became executable: stable-add holds the canvas still while
> newcomers settle, the viewport never moves uninvited, pinning anchors the summits, and
> the alignment rails pull structure into lines without joining the content.

Four mechanisms, one principle. Say the principle out loud because it generalises past
graphs: *every time the thing on screen rearranges itself, the person looking at it pays
in lost orientation, and you should charge yourself for it.*

The four mechanisms:

**Stable add.** When new nodes join the graph, everything already placed stays where it
is and only the newcomers settle. On by default.

**Never move the viewport uninvited.** Half the era's viewport bugs traced to one cause:
layout libraries that recentre the view when they finish. The retrospective's line is
"Fit is a decision, not a default." Every layout in this project now runs with automatic
fitting turned off and the caller decides.

**Pinned summits.** The most important nodes are placed deliberately and locked, so the
map has fixed landmarks between runs. This one has its own debrief document because the
founder asked for a written account of the technique.

**Alignment rails.** Invisible ties that pull related nodes into rows without being part
of the content. They are layout physics, not data, and Chapter 8 tells the story of what
happened when the two were confused.

## What it is for

The instrument is not decoration. Two releases in the same period turned it into a way of
asking questions.

At v0.4.33 clicking a node started showing its universe in plain English, in both
directions, using declared inverse verbs. At v0.4.34 the walk itself became a query.

![The links panel and the recorded path at v0.4.34.](figures/06__v0.4.34__links-panel-and-path-query.png)

*Figure 10. `/v2/universe/thinking-in-graphs.html#graph` at tag `v0.4.34`, 25 August 2026,
with the concept "connectivity" selected.*

Look at the right-hand panel. The node's statement, then its anchored quote from the
source, then **links out (1)**: "determines the confidence spectrum". Then **links in,
read from here (5)**: five claims, each reading "subject-of". That second heading is the
whole idea. The data records edges in one direction; the panel reads them from wherever
you are standing, in English, using the inverse verb.

Above it, a bar: `path: connectivity edit / run clear`. Walking from node to node records
a path query. It can be edited, generalised and re-run. Clicking around a picture becomes
a saved question.

The estate is honest about a limitation here, and the honesty is worth carrying: of the
fifteen edge names in the book's grammar, nine of the inverse names are proposals rather
than settled vocabulary, and they are marked as proposals wherever they appear.

## The component proof

On 26 August, v0.4.39 did something small that is worth more than it looks.

Since the v0.4.13 refactor, the graph had been a reusable custom element, `<uni-graph>`.
Claiming a component is reusable costs nothing. v0.4.39 proved it by building a second
page that embeds the same element with no reader around it: no source pane, no split
layout, a generated shell of twenty-four lines and a boot script under a hundred.

![The standalone graph page at v0.4.39, on a phone in landscape.](figures/07__v0.4.39__standalone-graph-phone-landscape.png)

*Figure 11. `/v2/universe/thinking-in-graphs.graph.html` at tag `v0.4.39`, taken at an
iPhone landscape viewport of 852 by 393 at device scale 3.*

The release note draws the moral itself: "Claims about architecture are cheap; second
call sites are evidence."

For an author, the transferable version is: if you have built a tool for your book, the
test of whether it is a tool or a one-off is whether a second thing can use it without
changes. Until then you have a page, not a component, whatever your file structure says.

## Where it lands

![The reader today, at v0.5.11.](figures/20__v0.5.11__the-reader-today.png)

*Figure 12. The same URL at tag `v0.5.11`, 26 August 2026, in its maximised graph view.*

Forty-seven releases from figure 6 to figure 12. Same document, same fifty-seven nodes,
same anchors. What changed is that a person can now sit with it, move things, ask it
where a claim came from, follow it in both directions and record the route.

The retrospective's judgement on the whole arc, which is the agent's and marked as such:

> The founder's feedback rounds drove every step, voice memo in, release out, usually the
> same day.

---

**Where the live estate shows this.** The reader is at
`/v2/universe/thinking-in-graphs.html`, the standalone graph at
`.../thinking-in-graphs.graph.html`, and adding `#graph` to the reader URL opens the
maximised view directly, which is itself a fix from Chapter 8's narrated review. The
stability principle and its four mechanisms are written up in the immediate-connection
register at `/v2/dev-pack/design-00-the-victor-register.html`.
