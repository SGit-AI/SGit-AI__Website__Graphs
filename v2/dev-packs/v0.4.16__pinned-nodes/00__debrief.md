# Pinned nodes: a debrief

**version** written at v0.4.19, about the technique shipped at v0.4.16
**date** 24 August 2026
**status** DEBRIEF. The technique is live in the universe reader and was used in earnest
before being written down, which is the methods register's admission rule.
**author** the agent, from the founder's direction in brief 25 and the founder's earlier
VivaGraphJS experiment; the judgements below are the agent's reading and are marked as such.
**implementation** `assets/universe/core/packs.js` (`pinPositions`, pure, gate-27-tested),
`assets/universe/components/graph-fx.js` (`runPinnedLayout`),
`assets/universe/components/uni-graph.js` (the **pin peaks** toggle).

---

## The technique in one paragraph

Choose a small set of structurally important nodes, fix their positions on the canvas, and
let the force layout settle every other node around them. In the universe reader the pinned
set is the summits: the document root and the family peaks stacked down the left edge, the
derived-group summits down the right, the gap between the stacks scaled to how many free
nodes must settle in it. The pins are locked only while a layout runs, so the physics treats
them as immovable anchors; between runs they are ordinary draggable nodes, and the next run
respects wherever a hand put them.

## Why force layouts fail without it

A force-directed layout is an optimiser with no memory and no frame of reference. Run it
twice and the same graph lands in two different orientations; add one node and the whole
picture rotates; grow past a hundred edges and it converges on the familiar hairball, a blob
that is technically correct and practically unreadable. The failure is not the physics. The
physics is doing exactly what it was asked: minimise energy with every node free. The failure
is that **a map with no fixed landmarks is not a map**. Nothing on the canvas means anything
by being *where* it is, so the only readable signal is adjacency, and adjacency is exactly
what drowns first in a dense graph.

## What pinning changes

Pinning spends a few nodes' freedom to buy meaning for every other node's position.

**1. Position becomes information.** With the dictionary, claims, hypotheses, objectives and
examples pinned left and the derived groupings pinned right, the horizontal axis acquires a
reading: structure on one side, emergent association on the other. A free node's resting
place is now the visible sum of the forces on it. A claim that settles hard against the
concept it is about *says so spatially*. Before pinning, position was an accident of the
solver's seed; after, it is a measurement.

**2. The layout becomes stable.** The landmarks never move, so re-running the layout, adding
a node pack, or toggling a family produces a picture that is recognisably *the same map*,
locally rearranged. Orientation survives interaction, which is what makes exploration
cumulative instead of starting over on every click.

**3. Gaps become visible.** This was the founder's first observation on first contact with
the pinned view, before the feature was even built: "you can already see that we found a
gap here, which is the objectives, which only have one link". A pinned summit holds its
place whether or not the graph rewards it, so a starved family reads as a peak with almost
nothing tethered to it. Pinning turns under-connection, normally an absence you would have
to query for, into something the eye trips over.

**4. Graphs become comparable.** The pinned frame is the same for every document, so when
the extraction fans out across the carried sources, twenty-one local graphs will share one
spatial grammar: dictionary top-left, derived groupings right. Two documents can be compared
at a glance because the reference frame no longer belongs to the solver.

**5. The human and the machine split the work correctly.** The machine places the many free
nodes, which is the part with too many degrees of freedom for a hand. The hand places the
few pins, which is the part that needs judgement about what this view is *for*, and then
re-triggers the layout. Neither could do the other's half well. The drag-then-relayout loop
is the collaboration the founder asked for, and it is the same shape as the wider project
discipline: the machine does the verifiable bulk, the person supplies the few decisions
that give it meaning.

## The mechanism, precisely

- **Placement is a pure function.** `pinPositions(leftIds, rightIds, freeCount)` returns a
  position per pin: left stack at x = 0, right stack at a width scaled to the free node
  count, each stack spread vertically. Pure means gate 27 holds a known-answer vector for
  the geometry.
- **Lock only during the run.** Cytoscape treats a locked node as immovable to layouts and
  to hands alike, so a permanently locked pin would refuse the founder's drag.
  `runPinnedLayout` locks the summits, runs the layout synchronously, unlocks. The physics
  gets anchors; the person keeps their hands.
- **Placement happens once per pin-on.** Toggling the pin on places the canonical stacks;
  after that, every layout run keeps whatever positions the pins have, dragged or not.
  Toggling off and on again is the reset.
- **The pinned set is a selector, not a hard-coded list.** Whatever is visible and carries
  family `docroot`, `peak` or `dgroup` gets pinned, so the technique composes with the
  source toggles: fewer sources, fewer pins, same grammar.

## Problems it does not solve, recorded rather than hidden

- **Overshoot.** The solver may still push a few free nodes past the right-hand stack;
  the pins anchor the frame but do not fence it. A clamped corridor between the stacks is
  the obvious next experiment if the founder wants one.
- **Which nodes deserve pinning is a judgement.** The current answer (the summits) is one
  reading. Pinning an arbitrary hand-picked set, or the current selection's neighbourhood,
  are unexplored variants.
- **It does not reduce edge clutter.** Pinning organises nodes; the derived links can still
  haystack the middle. The source toggles and the explore view remain the tools for that.

## Provenance

The founder ran this experiment years earlier in VivaGraphJS and asked for it in brief 25
after seeing the v0.4.15 graph view: "we start to lock a number of nodes, which don't move,
which basically they change how the force and the graph rendering works... I put two on the
right, two on the left". It is the natural continuation of brief 22's peaks and centres of
gravity: first every family got a summit, then the summits got a fixed geography. The verbatim
note lives in `v2/briefs/25__founder-note__pinned-peaks.md`; the release notes for v0.4.16
record what shipped and how it was verified.
