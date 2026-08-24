# Brief 25 — founder note: pinned peaks, the document as a source, and summits for the derived groups

**Date:** 24 August 2026
**From:** Dinis Cruz, in chat, with four screenshots of the v0.4.15 graph view
**Status:** the founder's words are source material; the note is reproduced verbatim. The
instruction table and the answers below are the agent's reading, marked as such.

---

## The note, verbatim

> really cool, now let's do some improvements just on that graph view which is starting to be amazing
>
> * on pic1 can you see the two bugs (the top navigation is hiding the button to revert the mininize + see the graph options button) and that vertical line (from the slider of the graph) is visible . I think a good solution here is to hide the top menu, since we don't really need it for now
> * the next feature to add  is quite interesting because in something I've done before, I think I've done with VJS. Not sure I've done with Cytoscope. But if you look at pick one, you'll see that what I've done was I pushed those pea nodes  and I fixed them on the left and eight. And what that means, as you can see in pic1  is this idea that we now start to... on the canvas, we start to lock a number of nodes, which don't move, which, basically, they change how the force and the graph rendering works. It's just the case of them finding almost the right Zoom to have them there, but it works really, really well. As you could see, like, imagine the visualization I showed on pick one. If you actually allow the other notes to render, then that one will work really nicely. So I think we need to experiment a little bit with this concept or maybe have an option to lock those peaks, right, or lock some of those nodes, and you need to put them in ways that makes sense, which is... if you notice, I put two on the right, two on the left. And, in fact, what's really cool is you can already see that we found a gap here, which is the objectives, which only have one link
>
> the other small bug is that if I don't have any source selected , then there should be no nodes on the graph (right) see pic2 , it looks like those "derived keys' that I see when click that button (pic3) are the ones that should disapear when I un-select that option/button / right?
>
> the other thing we need is peek nodes for those "derived keys" which already have the natural groupings (by color)
>
> note how powerful it will be when I can pin on the left the document (creating a left tree like structure) and pin the peaks of the of the derived keys on the right
>
> any questions on  what I mean by having these 'locked' nodes (position wise) on the canvas, and letting the other nodes find it's place (btw I should be able to move those locked nodes manually and then trigger the graph layout)

*Transcription artefacts, read in context: "pea nodes" and "peek nodes" are peak nodes; "VJS" is
read as VivaGraphJS; "Cytoscope" is cytoscape; "pick one" is pic1; "derived keys" are the derived
links; "fixed them on the left and eight" is read as "on the left and right".*

---

## The instructions, as read

| # | Instruction | Where it landed |
|---|-------------|-----------------|
| 1 | Maximised graph: the top navigation hides the un-maximise and options buttons; hide the menu while maximised | The maximise toggle now hides the site nav, both splitters and the page scroll while the canvas owns the viewport. This is also the root cause fixed: the panel is a sticky element, so it traps the maximised box's stacking order beneath the nav; hiding the chrome removes every overlay. |
| 2 | The stray vertical line (the panel splitter) visible over the canvas | Same fix: the splitters are hidden while maximised. |
| 3 | An option to lock the peaks at fixed canvas positions, placed in ways that make sense, and let the force layout settle the free nodes around them | The new **pin peaks** toggle. The doc root and the family peaks stack on the left edge, the derived-group summits on the right, the gap scaled to how many free nodes must settle between them. Pinned summits are locked only during a layout run, so the physics treats them as anchors. |
| 4 | The pinned nodes must be movable by hand, and a re-triggered layout should respect the dragged spots | Between runs the summits are unlocked and draggable; every later layout run locks them at wherever they were dragged. Toggling pin off and on again re-places the canonical stacks. |
| 5 | With no sources selected the graph should be empty | The document's own extraction is now a source like the others: a **document** toggle, on by default, first in the sources group. All sources off leaves an empty canvas and the stats bar says so. |
| 6 | The derived links should disappear when their source is toggled off | They already did; what remained in pic2 was the document pack, which had no toggle until now. Answered below. |
| 7 | Peak nodes for the derived groupings | Each connected component of the derived links gets a summit, named after its best-connected member ("around connectivity"), joined by containment edges and shown with the derived source. |
| 8 | Pin the document tree left and the derived summits right | That is exactly the pin layout: doc root and family peaks left, derived-group summits right. |

## Answers to the founder's questions

**"those derived keys are the ones that should disappear when I un-select that option / right?"**
Not quite, and the distinction found a real gap. The derived toggle already removed the derived
links; the nodes still standing in pic2 were the document's own extraction nodes, which until now
had no toggle because the document pack was always on. The fix honours the note's model: the
document is a source of nodes like any other, so now un-selecting everything empties the canvas.

**"any questions on what I mean by having these locked nodes?"**
None; the concept is clear and it maps directly onto the engine: a locked cytoscape node is
immovable to layouts, so the force simulation settles the free nodes around the pinned summits
exactly as the VivaGraphJS experiment did. The one design choice made: summits are locked only
while a layout runs and are freely draggable between runs, because a permanently locked node
would also refuse the founder's hand.

**Noted, not actioned:** the observation that the objectives peak carries a single link is the
gap-finding working as intended; it is recorded in the extraction's coverage, not patched over.
