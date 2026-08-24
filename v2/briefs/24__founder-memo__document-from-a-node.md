# Brief 24 · Founder memo: a document grown from one node

**date** 24 August 2026 · **kind** founder voice memo, sent as a chat message, reproduced
**verbatim** below. The reading and the plan after the quote are the agent's, and are
marked as such.

---

## The memo, verbatim

> So now I would like us to do an experiment which I think should work quite interestingly. So... and I think this needs to be on a complete separate page because it should reuse a lot of the components we have, but it's a very different user experience. So the logic here, and there's two parts of this. There's a programmatic part, and there's an LLM part that we can add a bit later. So let's first do the programmatic part. So the logic here is that Now that we start to have very rich graphs, very rich nodes where a lot of the nodes that we have will... when expanded, especially once you add the parts or very... or in a specific path that avoids the big blob and avoids the big dots, right, that creates a nice sort of tree downwards, I guess, tree structure from what is up to the peaks. Right? So assume there's a bunch of nodes that have that property. I would like to see the creation of multiple documents from the middle, which will become PDFs. But first, let's make a document, which is fundamentally almost the document that gets created from that one concept. And this is... should be quite interesting because what we really are exploring here is how rich some concepts are and how far can we take it as we go up, the layers that we had on the app. But then, you know, if you think about it, we should be able to do our whole book workflow from one of these words, right, one of these nodes because we should be able to go up to a point where we have that layer two, I think, that we define, which then would allow us to create a view that has all that information. basically, the universe of that node in our doc structure. And then this is where the LLM start to come into play. And then we we can then create the level one, create the level two, level three, level four, including the book. Right? So in principle, we should be able to have a mini book with, I don't know, five, ten pages or one page. It depends. Right? Just with the content that is created from that with original notes that we created. So let's explore this. But I think this needs to be a separate UI because we need to explore these concepts. But if you if you look at what we're doing here is we are improving the visualization and capabilities of the current mode, and we already experimenting what we'll do once we're gonna do this at scale with all the components and all the other bits. Right? Because if you think about it, we're creating a book. It's just a combination of doing this on steroids.

---

## The reading, and the plan

*The agent's reading.*

The experiment: pick one node and grow **the document of that node** from the graph:
everything the extraction verifiably holds about it, composed in the book's own document
structure, on a separate page with its own user experience, later printable to PDF. Two
phases, explicitly ordered:

1. **The programmatic phase (now).** No prose is written. The page assembles only what
   the anchored data already holds for the chosen node: its definition quote at its
   recorded bytes, the claims that are about it, the relationships it asserts and
   receives (each with its directional verb), the examples that demonstrate it, its
   place in the source document's structure, its weaker derived links, and its
   cross-references with their maturity ratings. The richness of a concept becomes
   measurable: some nodes will make a page, some will make ten.
2. **The LLM phase (later).** With the node's universe assembled, the book workflow runs
   from that one node upward through the altitude layers, drafting the connecting prose
   the programmatic phase deliberately leaves absent, up to a mini book per node.

Why it matters, in the memo's own frame: the whole book is this operation "on steroids";
the per-node page is the small end of the same telescope, and the components built for
the reader (the core extraction walkers, the peaks, the explore-by-degrees model) are
reused, not rebuilt.

| # | Commitment |
|---|---|
| 1 | A separate page, not a mode of the reader: a node picker and the composed document. |
| 2 | Programmatic first: every sentence on the page is a verbatim quote or a projection of the data; no authored prose. |
| 3 | Reuse the core tier: the explore walk, the packs, the kinds; only the composition is new. |
| 4 | Print-ready structure so the PDFs follow without a second build. |
| 5 | The LLM phase is out of scope until the founder calls it in. |

---

This document is released under the Creative Commons Attribution 4.0 International licence (CC BY 4.0).
