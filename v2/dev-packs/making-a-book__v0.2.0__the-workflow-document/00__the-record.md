# The workflow document — the change-control record

**Status** ⏸ **WAITING ON THE FOUNDER at stage 5 of 7.** Stages 1 to 4 are done and the
document is built and shipped. Stage 6, connecting it to the book, is the part that changes
a book and is not started.
**Opened by** brief 45: *"one of the comments you made was that there wasn't a lot of
workflows, documents, and reference material, right? So let's add it."*
**Subject** *Creating a Book Using Agentic Workflows*, **v0.2.0** — the book's own version,
which is the version this work reviewed
**The deliverable** [*Agentic Workflows: How You Operate*](../../universe/agentic-workflows.html),
a source document in its own folder with its decomposition, its extraction and its
cross-references

This is the second run of the seven-stage workflow, and the first one where the deliverable
was built rather than only proposed. The naming question at v0.6.3 asked *should we change
this?* This one asks *here is the thing, should it go in the book?*

---

## Why it is a review rather than just a piece of work

Brief 45 sets four phases: extract from the memo, write a source document, transform it
into its folder of graph materials, then *"connect them to are making the book, and you can
update the content using that as reference."*

**The first three are additive and reversible. The fourth changes a book.** So the first
three were done, and the fourth is in front of the founder with the cost counted. That
split is the change-control workflow doing what it is for, and it is why the document
exists on the site today while the book is untouched.

## 1. Plan — which roles have a voice, and which are only asked

| Role | Voice or opinion | Why |
|---|---|---|
| **researcher** | voice | What the estate actually holds about workflows has to be counted before anything is written |
| **writer** | voice | The deliverable is prose, and the writer is the one who would connect it to the book |
| **librarian** | voice | Two questions are hers: what the process is called, and where a document born in v2 lives |
| **editor** | opinion | Asked whether the document says one thing |
| **publisher** | opinion | Asked which clocks move and when |
| **developer** | opinion | Asked what a second document costs the machinery |
| **QA** | opinion | Asked what can be verified and what cannot |

Different from the naming question's split, deliberately. There the researcher, editor and
publisher had the voices because a title is a promise to a reader. Here the writer and the
librarian have them, because the question is what to write and where to put it.

The founder decides. No role approves.

## 2. Map — what this estate holds about workflows

[The researcher's map](../../team/researcher/debriefs/making-a-book__v0.2.0__map-the-workflow-material.md).
Computed, not argued:

> **The book is named after a word it barely uses, and the corpus behind it is not.**
> *Workflow* appears **6 times in the book's 27,002 words** of prose, and **64 times across
> the founder's memos** with brief 45 excluded.

And the vocabulary gap is total rather than partial: *villager*, *zone*, *pacing*,
*maturity*, *productised* and *commoditised* appear **zero** times in the book.

**The map also closed an open question.** At v0.6.3 the book was found to lean villager
while brief 40 judged it explorer, and that was recorded as a contradiction for the founder
to settle. Brief 45 settles it and neither reading was right: villager and explorer are
phases the same person moves between, and *"they still go to the same steps"*. The book
being villager-shaped and an explorer reading it faster are the same fact, so **one of the
three questions still open at v0.6.3 is no longer a question.**

What exists already is *procedure*: the five workflows written down at v0.6.6, each with a
trigger and a done test. What did not exist is the *concept*, and the count of concept
documents about how work is done was **zero**.

## 3. Define — the document, and the name

### The document

[*Agentic Workflows: How You Operate*](../../universe/agentic-workflows.html). Eight parts
and a summary of fifteen principles; 3,365 words by the estate's own count, decomposed to
39 sections, 84 blocks and 203 sentences, and extracted to **81 nodes, 18 asserted edges,
6 distinctions and 4 aliases**, every one anchored to verbatim bytes the build verifies.

Its central claim is the founder's, and it is the sharpest thing in the memo:

> *"the ultimate measure of success is: Can I do a process without making any changes to
> the workflow? If I can do that, that's a major success... that's how I know something's
> been productized or commoditized"*

**The document declares its own position on the boundary it argues for.** Part 5 ends with
a section saying the prose is a one-way projection of a memo, and that the memo, not this
document, is the source of truth for anything the founder said. A reference document
arguing for keeping sources in the deterministic layer, while presenting itself as a
source, would have failed its own test on the first page.

### The name the founder asked for

[The librarian's proposal](../../team/librarian/debriefs/making-a-book__v0.2.0__naming-the-process.md),
built only from words this estate already uses:

| | Name | Estate uses | Recommendation |
|---|---|---|---|
| **A** | **the intake** | 1 | **Recommended.** Names the thing rather than the activity; collides with nothing |
| **B** | the treatment | 7 | The word people already use informally; keep it informal |
| **C** | the decomposition | 11 | **Refuse.** Promoting it would make eleven existing uses ambiguous, four of them in frozen release narration |
| **D** | the document pass | 2 | *Pass* means a sweep of many things here; this is one document at a time |

Two halves of the process already have names and the whole does not: **decomposition** is
the deterministic split, **extraction** is the authored reading, and they are the two-way
and one-way halves of the same act.

## 4. Review — the opinions

- **[Editor](../../team/editor/debriefs/making-a-book__v0.2.0__opinion-on-the-workflow-document.md):**
  supports adding and connecting. Says the document says one thing, names Part 4 as the
  best idea in the corpus this month, and Part 8 as the weakest. **Would refuse** writing
  the vocabulary into the book *before* part one exists, because that puts an abstract
  frame in front of a reader who has not yet seen anything worth framing.
- **[Publisher](../../team/publisher/debriefs/making-a-book__v0.2.0__opinion-on-the-workflow-document.md):**
  as shipped this moves the **site** version only; the book's clock moves at step 6, and to
  **v0.3.0** rather than a patch. Recommends holding the Leanpub upload until after step 6
  rather than uploading a version already known to be superseded.
- **[Developer](../../team/developer/debriefs/making-a-book__v0.2.0__opinion-on-the-workflow-document.md):**
  the machinery took a second document for about 40 lines of change, and
  `gen_coregraph.build()` itself needed none, which is what A1 was for. Found and fixed a
  latent defect: the extraction error path crashed with a `NameError` instead of printing
  the errors it had collected, because it had never run. **Will not pretend two documents
  is fan-out.**
- **[QA](../../team/qa/debriefs/making-a-book__v0.2.0__opinion-on-the-workflow-document.md):**
  five checks run and pass. Requests a gate that would have caught the worst thing found
  during writing, and repeats the gate it asked for at v0.6.3.

### The finding QA will not let pass quietly

Every founder quotation in the document was checked by script against the brief it came
from. **Eighteen of twenty-five did not match**, because they had been smoothed into
readability: a comma for a full stop, a repeated word dropped, sentence case imposed. All
eighteen were corrected against the brief.

Nothing would have caught that. The universe has a gate saying an extraction cannot cite
words that are not there; **authored prose has no such gate**, and authored prose is
exactly where smoothing happens, because prose wants to read well and a transcript does
not. That is QA's first requested gate and it is now the estate's best-earned one.

QA's second request is unchanged since v0.6.3: file paths named in prose must exist. This
release found a second instance of that defect, in the researcher's own first debrief,
which named a brief path renamed at v0.6.4. Corrected here, by reading, four releases late.

## 5. Approve — the founder's, and open

Four questions. The first is the one that matters.

1. **Connect it to the book?** The writer costs it at **3,500 to 4,500 words**: a new
   chapter stating the frame, plus a vocabulary pass across the existing twelve. The editor
   and the writer agree it should land **after part one**, not before, so the vocabulary is
   written once rather than twice. Approving this moves the book to v0.3.0.
2. **The name of the process.** *The intake* is recommended. The founder asked for a name
   and the choice is his.
3. **Which book gets part one?** Brief 45 says *"the first book should start by the Art of
   the Possible"*. In this estate *the first book* has meant the frozen first edition;
   brief 42 asked for the same opening in the making-of book. The reading taken has been
   the making-of book. If that is wrong, part one is being planned for the wrong volume.
4. **Build QA's quotation gate?** It is a day's work at most and it protects the estate's
   loudest claim, which is that everything the founder is quoted as saying, he said.

## 6-7. Implement, and approve the implementation

Not started. Blocked on stage 5, question 1.

---

## What this release did do without waiting

The document, its folder and its decomposition are live, because they change nothing the
book says. The machinery grew a register rather than a second hard-coded path, so the third
document costs nothing at all.

**One measured claim, and one refusal to make a claim.** The pilot's fan-out promise moved
from one document to two, and the pilot's output is byte-identical afterwards. But the new
document extracted to 81 nodes against the pilot's 57, and **that comparison is not
evidence about the method**: the pilot was written by a human years before the machinery
existed, and this document was written by the agent that extracted it, with the extraction
in mind. Both the researcher and QA insisted that be said on the document's own page, not
only here.

## The diff brief 45 also asks for, and does not get here

The memo asks for a version diff between two versions of a book, *"ideally... backed by
graphs"*, and names it as *"the really test measurement of our success"*. That is a separate
piece of work and it is now specified rather than vague:

- Between **v0.1.0 and v0.2.0** of this book, four files changed, 30 lines added and 14
  removed. A **text** diff of that is available from the tags today, using the same
  approach as the first edition's `/v1/book/changes.html`.
- A **graph** diff needs a graph stored per book version. Only the current version has one.
  The book graph landed at v0.6.10 with per-chapter identity ledgers, which is the piece
  that makes a graph diff different in kind from a text diff: it can tell a reworded
  sentence from a replaced one, and report a move as a move.

**The honest position:** the text diff is a small piece of work and the graph diff is the
one the founder actually asked for. Doing the text one first is defensible only if it is
not mistaken for the answer.
