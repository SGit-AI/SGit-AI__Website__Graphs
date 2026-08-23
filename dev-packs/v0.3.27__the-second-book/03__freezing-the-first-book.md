# Freezing The First Book

**version** v0.3.27 · **date** 23 August 2026
**source** memo 2 in full

---

## What is being frozen, and why

The first book is the record of how this was worked out, including three corrections to claims
it made about itself, a ladder that ran out of altitude, and a contradiction it reached twice by
two different routes. That record is worth more intact than improved. Memo 2 is explicit:
"I don't want the new stuff to overwrite what we've done there because historically there's a
lot of stuff there to learn."

**The first edition freezes at v0.3.26**, the release that shipped the retrospective brief.
That is not arbitrary: it is the last release in which the first book was the only book.

---

## ADR-1 · How the freeze is done

**Status** PROPOSED, with one part awaiting the founder (open question 1).

### The decision

Freeze in two parts, because the source and the published pages have different requirements.

**Part A. The source is frozen by copy**, exactly as memo 2.6 asks.

```
books/
  01__first-edition/
    source/            byte-copy of content/*.md at v0.3.26   (17 units, 21,679 words)
    ladder/            byte-copy of the altitudes data at v0.3.26
    reviews/           byte-copy of r001 to r004 as they stood
    MANIFEST.json      every file with its SHA-256, the release, the commit, the date
    README.md          what this is, and the rule that it never changes
```

This is what the second book copies **from**, which is the purpose memo 2.7 gives the freeze.
A copy makes the first edition a nameable unit that can be opened without checking out an old
commit, and it survives the second book restructuring `content/` however it likes.

**Part B. The published pages are frozen in place.**

`/book/` and the sixteen chapter-source pages under `/start/`, `/why-graphs/`, `/grammar/`,
`/depth/`, `/examples/`, `/maps/`, `/shipped/`, `/origins/`, `/network/`, `/glossary/` and
`/about/` stay exactly where they are, and never change again.

### Why part B is not a copy

A literal copy of the published tree would duplicate two PDFs and a cover (about four megabytes)
and would move or duplicate **thirty-four published URLs**. Those URLs are linked from the four
reviews, the ladder's descent edges, the concept map's unit references, the twenty-one carried
sources' authored place links, and the six vault analyses. Every one of those links would need
rewriting, in files that are themselves records and should not be rewritten.

Freezing in place gives a stronger guarantee than copying: the bytes a reader fetched yesterday
are the bytes they fetch in a year, at the same address. It also removes the failure mode where
a copy and an original drift because someone edits the wrong one.

**The founder may prefer the literal reading of memo 2.6**, and it is his call. Open question 1.

### The gate that makes the freeze real

A rule with no enforcement is a preference. `validate.js` gains:

```
gate 14   every path listed in books/01__first-edition/MANIFEST.json must still hash
          to its recorded SHA-256, and every frozen published page must still hash to
          the value recorded at v0.3.26. The build fails on any difference.
```

This is the same mechanism already protecting the twenty-one carried source documents, applied
to the site's own history. It was verified once by deleting a tag and watching a build fail; the
same negative test is required here before the freeze is declared done.

---

## The front page that explains everything

Memo 2.3: "we should have a front page that just links to everything and explains everything,
including explains the sequence of events."

**`/books/first-edition/index.html`**, and it is the only new writing the first edition
receives. It is not a summary of the book. It is an account of how the book happened, which is
the part that is currently spread across the release history, the comms board, four reviews and
a retrospective brief, and which nobody can read in one sitting.

Contents, in order:

1. **What the first edition is**, in a paragraph, and how to read it: the reader, the single
   page, the print PDF, the screen PDF.
2. **The sequence of events**, as a dated narrative from v0.1.0 to v0.3.26. Thirty-four
   releases, generated from the release table rather than retold, with the six that changed the
   method called out in prose.
3. **The four reviews**, what each one asked for and what it changed.
4. **What it got wrong**, which is the section that justifies keeping it. Three corrections it
   made to itself, the ladder findings still open, and the honesty table's known defects.
5. **What carried forward**, linking each surviving idea to where it lives in the second book.
   This section is written last and updated once, when the second book's level 3 exists.
6. **Everything in it**, as a complete index: every chapter, every page, both PDFs, the cover,
   the ladder, the concept map, the reviews, the decisions as they stood.

Sections 2 and 6 are generated. Sections 1, 3, 4 and 5 are written.

---

## What the second book takes, and how it records that it took it

Material moves by copy, and every copy records its origin, in the same shape the carried source
documents already use:

```json
{ "from": "books/01__first-edition/source/grammar.md",
  "sha256": "…", "release": "v0.3.26", "verdict": "CARRY",
  "changed": "none" }
```

A `verdict` of `LIFT` or `REWRITE` records the origin without claiming the text is the same. The
point is not to prove the second book is a copy. It is that **for any passage in the second
book, a reader can ask where it came from and get an answer**, which is the provenance chapter
applied to the book itself rather than to somebody else's regulation.

This also answers a question the decoupling decision (r003-D1) has been holding open: the
relationship between editions is provenance edges, not equality. The second book is decoupled
from the first by construction, because it is a different tree that cites its ancestor.

---

## What does not freeze

The estate keeps moving: `/vaults/`, `/docs/`, `/documents/`, `/reviews/`, `/decisions/`,
`/admin/`. These belong to the site rather than to an edition. Both editions cite them, and
their movement is why editions need to be frozen in the first place.

The one consequence to note: a frozen chapter can cite a moving vault page, and the vault page
can change under it. That is acceptable and it is why the carried sources record hashes. If it
becomes a problem, the answer is the one the corpus already gives: an index is not a source, and
a citation without a date is indistinguishable from a claim.

---

This document is released under the Creative Commons Attribution 4.0 International licence (CC BY 4.0).
