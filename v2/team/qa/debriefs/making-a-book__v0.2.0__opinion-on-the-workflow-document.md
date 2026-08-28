# Opinion: can this change be verified

**Asked** what checks this needs before and after the founder's decision
**Subject** the workflow document and its folder
**Role** QA, opinion only on this change

---

**Supports it. Three checks already run and pass. Two gates requested, one of which is the
same gate QA asked for at v0.6.3 and still does not exist.**

## What is already verified, on this change

| Check | Result |
|---|---|
| Every anchor quote is found verbatim in the source's named section | 81 nodes, 18 edges, 6 distinctions, 4 aliases, all resolved |
| Coverage: every section with prose is anchored or declared empty with a reason | 30 sections with prose, 29 anchored, 1 declared empty |
| The decomposition rebuilds the source byte-identically | pass, all seven core-graph gates |
| The pilot document is unchanged by the register refactor | byte-identical, ledger included |
| Every founder quotation in the document is verbatim in the brief it comes from | 25 of 25, checked by script |

That last one was **not** a gate and should be. It was run by hand during writing, it
found eighteen quotations that had been smoothed into readability, and every one of them
was corrected against the brief. Eighteen out of twenty-five is not a near miss.

## Gate 1, requested: authored quotations must be verbatim in the source they cite

**What it checks.** For any document in the estate that quotes a founder brief, every
quoted span must appear verbatim in a brief under `v2/briefs/`, allowing an ellipsis for
elision.

**Why it is worth building.** The universe already has this gate for extraction anchors,
and it is the estate's strongest single mechanism: an extraction cannot cite words that are
not there. Authored prose has no such gate, and authored prose is where the smoothing
happens, because prose wants to read well and a transcript does not.

**Why it is not free.** Not every quotation in the estate is from a brief, and a
first run will find false positives in quotations of external sources. QA's proposal is to
scope it to documents that declare which briefs they draw on, and to grow the scope from
there.

## Gate 2, still requested, unchanged since v0.6.3: file paths named in prose must exist

Asked for at v0.6.3 and not built. It would have caught chapters 4 and 15 naming a deleted
test file. **This release found a second instance of the same defect**: the researcher's
first debrief, at `v2/team/researcher/debriefs/making-a-book__v0.1.0__map-the-making-of-book.md`,
named its own brief as `briefs/v0.6.3__map-the-making-of-book.md`, which was renamed at
v0.6.4 and no longer exists. The prose was not updated when the file moved. It has been
corrected in this release, by reading, which is the point: the first instance was also
found by reading, four releases after it appeared.

Two instances of one defect class, found by reading rather than by a gate, is the argument.
QA's position is that this is now the estate's most-earned unbuilt gate.

## What QA will not sign off

**The extraction yield of this document should not be compared with the pilot's.** 81 nodes
against 57, and 18 edges against 8, looks like the method improving. It is not measured
that way: the pilot was written by a human years before the machinery existed, and this
document was written by the agent that extracted it, with the extraction in mind.

Any claim made from those two numbers is a claim about who wrote the prose, not about the
method. The researcher's map says the same thing, and QA wants it on the document's own
page rather than only in a debrief.
