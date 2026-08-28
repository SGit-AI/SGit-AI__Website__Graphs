# Debrief: naming the process, and where a document born here lives

**Brief** brief 45: *"We can't need a name for this process"*, which the transcription
renders for *we also need a name for this process*.
**Subject** the process that turns a source document into its folder of graph materials
**Method** candidates are built only from words this estate already uses, and every count
below is a case-insensitive match across the briefs, the release tables, the methods
register, the dev packs, the document READMEs, `README.md` and `CLAUDE.md`.

---

## What is being named

The founder describes it as a sequence and does not name it: *"you're going to create the
JSON transformation of the file... you're going to extract the key concepts, and basically
you're going to create the graph elements and the tissaurus and the semantic graph and the
ontologies."*

Two halves of that already have names here, and the whole does not.

| Half | What it does | Door | Existing name | Uses |
|---|---|---|---|---|
| The deterministic split | document to section to block to sentence to word, rebuilt byte-identical | two-way | **decomposition** | 11 |
| The authored reading | concepts, claims, edges, distinctions, each anchored to verbatim bytes | one-way | **extraction** | 108 |

Naming the whole matters for the reason the document itself gives: a step only ever
described in sentences gets done slightly differently each time, and a name is something a
folder can be stamped with and a gate can check.

## The candidates

Built from the estate's own vocabulary, with what each already means attached, because a
word that already means something else costs more than a new one.

| | Name | Estate uses | What it says | What it costs |
|---|---|---|---|---|
| **A** | **the intake** | 1 | What happens when a document arrives: it is taken in, and comes out as a folder. Says nothing about which half is deterministic, which is honest, because the process is both. | Nearly a new word here. One prior use, so no collision either. |
| **B** | **the treatment** | 7 | Already the estate's informal word for it: the universe hub says the other sources *"will get the same treatment"*. | Vague. A treatment is what you do, not what comes out. |
| **C** | **the decomposition** | 11 | Promote the existing word to cover the whole, and let the deterministic half be called *the split*. | Rewrites the meaning of a word used in eleven places, including release rows that are frozen narration. |
| **D** | **the document pass** | 2 | Fits the estate's habit of numbered passes over a body of work. | *Pass* here means a sweep of many things; this is one document at a time. |

**Librarian's recommendation: A, *the intake*.** It is the only candidate that names the
thing rather than the activity, it collides with nothing, and it reads correctly in the
sentence that matters: *this document has been through intake*. B is what people will say
anyway and can stay as the informal word. C is the one to refuse: renaming *decomposition*
would make eleven existing uses ambiguous, four of them in release rows that must not be
edited.

**One requirement whichever wins.** The name has to be recorded where the process is run,
not only where it is decided, or it will be a name in a pack that nobody uses.

## The other question this raises: where does a document born here live?

The estate's layer model says layer 0 is *"the frozen bytes: the 21 carried sources under
`/v1/docs/sources/`"*. This document was not carried. It was written here, on the day it
was extracted, and there is no frozen original for it anywhere.

Three ways to handle that, and only one is honest.

1. **Put it under `v1/docs/sources/`.** Refused. `v1/` is frozen and holds the first
   edition's material; adding to it would make the freeze mean less, and the document is
   not part of the first edition.
2. **Invent a second layer-0 folder and keep a copy in the document folder.** This
   preserves the two-file drift gate. It also creates two files a human must keep
   identical by hand, which is the failure the gate exists to catch, manufactured
   deliberately.
3. **Let the folder copy be the original, and say so.** The SHA-256 in `extraction.json`
   still pins the extraction to exact bytes, so editing the prose without re-extracting
   fails the build. That is the protection that actually matters.

**Chosen: 3.** The `doc` block carries `"born": "v2"`, the folder README states it in the
first row of its table, and the universe hub's layer-0 note now says it in the estate's
own voice rather than leaving a reader to notice the discrepancy.

**One consequence, and it is arithmetic.** The hub's queued row counts the carried sources
still to do. A document born here was never one of the 21, so counting it against them
would have quietly reported 19 remaining when 20 remain. The generator now counts carried
sources only.

## Supersede, never delete

The standing rule applies unchanged. If the process gets a name and the name later
changes, the first name is recorded as a former name rather than edited away, and the
frozen narration in the archived version tables is not touched.
