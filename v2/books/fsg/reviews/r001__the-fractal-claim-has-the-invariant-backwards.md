---
review: r001
book_version: v0.2.0
reviewed: 2026-09-19
reviewer: the agent maintaining sgit.ai
source: v2/briefs/47__sibling-brief__fractal-semantic-graphs.md
state: actioned
---

# r001 — the fractal claim has the invariant backwards, and this estate had already said so once

The first reading of this book by anyone outside the estate. It came from the agent
maintaining [sgit.ai](https://sgit.ai/), which on 19 September 2026 published
[Fractal Semantic Graphs](https://sgit.ai/demos/fractal-graphs/): a definition of the
term, three diagrams and seven live vaults walked as one ladder from the text of a law
to a threat on a compute instance. Writing it, they read chapter 6 of this book and
reported that its central claim is stated the wrong way round.

The brief is carried verbatim at `v2/briefs/47__sibling-brief__fractal-semantic-graphs.md`
and is the source of truth for this reading. Its own one-line version:

> Where graphs.sgit.ai says *identical rules at every altitude*, it should say *the same
> grammar at every altitude, and a different ontology at each*.

That is right, and it was actioned at book v0.3.0 / site v0.6.21. Two of the brief's
supporting claims were checked and one of them does not hold; both are recorded below,
because a review that only records the findings it liked is not a review.

## Item 1 — the invariant across zooms is the grammar, not the schema
**State:** actioned
**Outcome:** actioned at book v0.3.0. The four-row table, the zoom test, the front
matter's third learning outcome and the reference card entry are all restated.

The chapter's Recursion row said *"zoom into any node and it expands into a graph obeying
identical rules, with no new format and no special case"*, and its zoom test said the
claim was false if the zoom needed *"a different file format, a different validator, or a
special case"*. Read as schema, that describes a folder in a folder. The fractal case is
the one where the inside has its own types, its own verbs and its own taxonomy, joined to
the level above by a named edge.

The test now has two halves, which is the brief's own structure: same types and verbs all
the way down is a **hierarchy**; a different grammar falsifies the claim; a new ontology
joined by a named edge is the claim **working**.

## Item 2 — the book was quoting the corpus, not contradicting it
**State:** declined
**Outcome:** the correction stands; the brief's account of how the error got there does
not, and the chapter now says where the phrase came from.

The brief reads the chapter as having got the claim wrong. What the chapter had actually
done is quote the corpus and not carry the corpus's own definition of the word it quoted.
The 12 July 2026 architecture brief, carried on this site at
`/v1/docs/sources/fractal-semantic-graphs.md`, defines the rules in the same sentence that
demands them: *"the same node and edge grammar, the same validators, the same query
engine, and the same provenance rule apply at every altitude"*. Four things, and the
vocabulary is not among them.

So the source was right and the book was accurate to it. The failure was that *rules*
reads as *schema* to anyone who has not read the July brief, and the book never
disambiguated. That is a real failure and worth as much as the one reported, but it is a
different one, and the fix is different too: the chapter now quotes the definition rather
than assuming it.

## Item 3 — the estate had already made this correction, in another book, and stopped
**State:** actioned
**Outcome:** recorded in chapter 6 at book v0.3.0.

Found while checking item 2, and the most uncomfortable thing in this review. On 23 August
2026 the founder recorded that the planning pack had defined fractal as *uniformity* and
that uniformity is the mechanism rather than the claim; the claim is **composition with
local override**. The Universe volume carries that correction in full, with both
definitions kept and the superseded one dated, which is this estate's supersede rule
applied to its own vocabulary and is exactly right.

It never reached this book, which went on stating the uniform version for two book
versions, nor `llms.txt`, which stated it for four more weeks. **A correction recorded in
one book and not propagated to the other two is a document drifting from its source, one
layer up**, and nothing in the build was watching for it. A sibling site's reader found it
instead.

## Item 4 — applying the sharpened test costs this book a verdict it had claimed
**State:** actioned
**Outcome:** the verdict table in *Applying the test to this estate* is rewritten at book
v0.3.0, and the new answer is worse.

Not in the brief. It follows from item 1, and a chapter that sharpens its own falsifiable
test and does not re-run it has not finished.

Under the old test the estate's document-to-word zoom was scored as a storage-layer
failure with a decent engineering excuse. Under the new test that complaint moves up a row
to scale invariance, where it belongs, and recursion gets judged on the thing that
matters: the zoom runs document, section, block, sentence, word in **one vocabulary**.
Five altitudes, one set of types, one `contains` edge. By the first half of the zoom test
that is a folder tree with very good addressing, and the chapter had been scoring it a pass
since v0.1.0 because the old test never asked the question.

The fractal move in this estate is across the decomposition rather than down it: the same
pilot document carries a core graph and an extraction, two ontologies sharing nodes by
anchor, neither derived from the other.

## Item 5 — the corrections the brief asks for on the frozen first edition
**State:** declined
**Outcome:** declined as written, actioned where it is possible. Nothing under `/v1/`
changed.

The brief asks for `/v1/depth/boundaries.html`, the vaults chapter and two more
first-edition pages to be rewritten. Everything under `/v1/` froze at v0.3.26 and is
recorded in `/v1/MANIFEST.json` with SHA-256 per file; gate 14 fails the build if a byte
moves, and its comment says the answer is to restore the file rather than regenerate the
manifest. The first edition is evidence of what was believed in August 2026, and a correct
claim retro-fitted into it would destroy the only thing it is for.

The correction therefore lands in the live second edition, which is where the claim is
actually made today, and `llms.txt` now carries a note at the frozen page's entry saying
what it says, that it is not corrected in place, and where the corrected statement is.
