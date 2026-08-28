# Opinion: the workflow document and the version streams

**Asked** which versions this moves, and what it means for the Leanpub upload
**Subject** *Creating a Book Using Agentic Workflows*, **v0.2.0**
**Role** publisher, opinion only on this change

---

**Supports the document. Notes that as shipped it moves the SITE version only, and that
step 4 is what moves the book.**

## Which clock moves, and when

| The work | Site version | Book version |
|---|---|---|
| The source document, its folder and its decomposition | **moves** | does not move |
| The change-control record and the role debriefs | **moves** | does not move |
| Connecting the vocabulary to the book's chapters (step 4) | moves | **moves, to v0.3.0** |

This is the estate's own distinction from `CLAUDE.md`, applied: evidence work moves
neither clock unless it changes what a book says, and this document does not change what
the book says until it is quoted in it.

**Why v0.3.0 rather than v0.2.1 when step 4 lands.** A new chapter plus a vocabulary pass
across twelve chapters is not a patch. The book went v0.1.0 to v0.2.0 for a retitle
touching four files; a change of this size cannot be smaller than that one.

## The pack's stamp

This pack is `making-a-book__v0.2.0__the-workflow-document`, and **v0.2.0 is the version
the work reviewed**, not the version it will produce. That is the convention set at v0.6.4
after the first pack was stamped with the site's version by mistake, and the gate now
enforces it.

## The Leanpub position, unchanged and now clearer

The upload has still not happened, and the publisher has said twice that this is the free
window: a draft can be renamed and restructured at no cost until it is uploaded.

**That window should now be held deliberately rather than by accident.** With part one and
a workflow vocabulary both queued, uploading v0.2.0 would put a version on a store that
the estate already knows is superseded. The publisher's recommendation is to upload after
step 4, not before, and to say so on the open task rather than leaving it looking blocked.

## One thing the publisher wants recorded

If the founder approves step 4, the book's `changelog` entry in `gen_bookmeta.REGISTER`
should name **this pack**, not just the release. The two-clock changelog exists so a reader
can ask why a version moved; *"the workflow vocabulary was written into the book"* answers
that better than a release number, and the pack is where the reasoning lives.
