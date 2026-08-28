# Debrief: what this estate holds about workflows, mapped

**Brief** brief 45, *"one of the comments you made was that there wasn't a lot of
workflows, documents, and reference material, right? So let's add it."*
**Subject** *Creating a Book Using Agentic Workflows*, **making-a-book v0.2.0**, and the
material behind it
**Method** every count below is reproducible from the repository at v0.6.10. Book counts
come from the book's own graph (`v2/books/making-a-book/graph/`), which is the estate's
canonical word count; corpus counts are case-insensitive matches on the raw markdown.

---

## The headline finding

**The book is named after a word it barely uses, and the corpus behind it is not.**

| Where | Occurrences of *workflow* / *workflows* |
|---|---|
| The book, across 27,002 words of prose in 17 chapters | **6** |
| The founder's memos, 14 of them, brief 45 excluded | **64** |
| The v0.6 release table, 11 rows | 7 rows mention it |
| The methods register, 35 named techniques | 3 |

The book was retitled *Creating a Book Using Agentic Workflows* at v0.6.9, and the record
of that decision already flagged this: the title *"is not yet true of the book as written"*.
This map confirms it from the other direction. The material to make it true exists, and it
is in the memos rather than in the book.

**The vocabulary gap is total, not partial.** Every load-bearing word in the founder's
account of what a workflow is appears **zero** times in the book's 27,002 words:

| Word | In the book |
|---|---|
| villager | 0 |
| zone | 0 |
| pacing | 0 |
| maturity | 0 |
| commoditised / productised | 0 |
| explorer | 7 |

*Explorer* is the exception, and it is the one that most needs care: the book uses it
seven times, and brief 45 uses it in a sense the book does not, which is the next finding.

## The finding that changes an earlier one

**The book and brief 40 were read as disagreeing about who the book is for, and they were
not.** The map made at v0.6.3 found the book leans villager while brief 40 judged it
explorer, and treated the pair as a contradiction the founder had to settle.

Brief 45 settles it and neither reading was right. The founder: *"sometimes the difference
between somebody with more or less experience is just that they consume materials faster,
but they still go to the same steps"*. Villager and explorer are **phases the same person
moves between**, not audiences to choose between. The book being villager-shaped and an
explorer reading it faster are the same fact.

**Consequence for the open question at v0.6.3.** One of the three things waiting on the
founder there was whether the book should serve one audience or the other. It is no longer
a question; both are served by one account, and the open items reduce to the title of the
cover and whether the cover names Claude.

## What exists already, and what it is missing

Five workflows were written down for the first time at v0.6.6, in
`v2/dev-packs/v0.6.6__the-structure-refactor/01__the-workflows.md`: the memo-to-release
loop, the release ritual, changing a book, the seven-stage change control, and turning an
escaped defect into a gate. Each carries a trigger, steps, which steps are machine-enforced,
and a done test.

That document is **procedure**. What nothing in the estate holds is the **concept**: what a
workflow is, why it is worth changing one, when to stop, and how to tell a mature workflow
from an unfinished one. The five procedures assume all of that and state none of it.

**Reference material by shape**, counted:

| Shape | Count | Where |
|---|---|---|
| Carried source documents, extracted | 1 of 21 | `v2/universe/docs/` |
| Named techniques | 35 | `v2/methods/` |
| Written-down procedures | 5 | the v0.6.6 pack |
| Concept documents about how work is done | **0** | nowhere |

## What the founder asked to be added, in his own order

1. Extract from the memo. (Brief 45's reading.)
2. Write a source document from it, *"like the thinking and graphs document"*.
3. Give it its own folder and produce inside it the JSON transformation, the key concepts,
   the graph elements, the thesaurus, the semantic graph and the ontologies.
4. Connect the result to the book and update the content using it as reference.

Steps 1 to 3 are additive and reversible. **Step 4 changes the book**, which is why this
map exists and why the change is in front of the founder rather than done.

## One risk the researcher will not leave unstated

The pilot document was written by a human, years before the extraction machinery existed,
and had to be read as found. A document written by the same agent that will extract it is
a different case: it can be written to extract well, and any measurement of how richly it
extracts is then partly a measurement of how it was written.

That is a finding about the method rather than an objection to the document. It should be
recorded on the document's own page, and the estate should not compare extraction yields
across a carried document and a projected one without saying which is which.
