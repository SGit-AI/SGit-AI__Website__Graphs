# The naming question — the change-control record

**Status** ⏸ **WAITING ON THE FOUNDER at stage 5 of 7 (approve).**
**Opened by** brief 40: *"one of the first interesting questions to ask is, is the name of
the book correct? And I don't think it is."*
**Subject** *Creating a Book Using Fractal Semantic Graphs*, v0.1.0

This is the first run of the seven-stage workflow brief 39 asked for, and the first time
the team defined in brief 40 has been used. It is deliberately a small question, because
the point of a first run is to find out whether the machinery works.

---

## 1. Plan — which roles have a voice, and which are only asked

Brief 40 names this as part of the exercise: *"a good example of creating a plan and then
defining which agents should have a voice on this, and which agents we should ask for an
opinion."* The distinction was drawn like this:

| Role | Voice or opinion | Why |
|---|---|---|
| **researcher** | voice | The map is the input everything else argues from |
| **editor** | voice | A title is a promise to a reader, which is this role's centre of gravity |
| **publisher** | voice | A title is a store listing and a version move |
| **writer** | opinion | Must live with it, does not choose it |
| **librarian** | opinion | The old name must survive as a superseded name |
| **QA** | opinion | Asked only whether the change can be verified |
| **developer** | not asked | Nothing here is a code question |

The founder decides. No role approves.

## 2. Map — what the book actually is

[The researcher's map](../../team/researcher/debriefs/v0.6.3__map-the-making-of-book.md).
Its headline is computed, not argued:

> The title's two content words are the two rarest things in the book. *Fractal* appears
> **9 times in 31,221 words** and *semantic graph* **6** — against *release* 227, *graph*
> 193, *book* 182, *agent* 173. Six of the nine name the **other** book. Exactly one use is
> substantive, and even that one is about the other book's claim.

And the book had already said so itself, in its front matter: the title *"was set in the
commission"*, unlike everything else in it.

**The map also disagreed with the founder**, which is what a map is for. Brief 40 judges
the book leans explorer; the body contains **one code block and no shell commands** across
twelve chapters, with the technical material quarantined in an appendix that is 21% of the
words. As written it leans villager. That is either a finding about the title or a finding
about the body, and only the founder can say which.

## 3. Define — the candidates

[The editor's proposal](../../team/editor/debriefs/v0.6.3__the-title-proposal.md), built
only from words the book actually uses:

| | Title | Serves | Costs |
|---|---|---|---|
| **A** | *Writing a Book with an Agent* | villager first | a rename only |
| **B** | *The Loop* | either | a cover that says nothing alone |
| **C** | *Gates Buy Speed* | explorer | a real content pass first |
| **D** | *Ship, Then Improve the Ship* | either | ambiguous in print |

Deliberately excluded: *workflow* (8 uses), *fractal* (9). And the two words carrying the
founder's own thesis in brief 40 — *scaffolding* and *feedback loop* — appear **zero**
times in the book. They are the right ideas with the wrong evidence.

**Editor's recommendation: A, unless the founder wants a content pass, in which case C.**

## 4. Review — the opinions

- **[Publisher](../../team/publisher/debriefs/v0.6.3__opinion-on-the-title.md):** supports
  A. The Leanpub upload has not happened, so this is renaming a **draft** and the window is
  free until it is uploaded. The title lives inside the front matter and colophon, so the
  rename **is** a content change: the book's version moves v0.1.0 → v0.2.0. **Do not
  rename the folder slug.**
- **[Writer](../../team/writer/debriefs/v0.6.3__opinion-on-the-title.md):** supports A now,
  wants the C brief next. C means writing the scaffolding argument into the body with the
  estate's evidence: two to three thousand words. Separately: the colophon says *"the second
  book is not written"*, which was true at v0.5.11 and is false now.
- **[Librarian](../../team/librarian/debriefs/v0.6.3__opinion-on-the-title.md):** no
  preference. One requirement: **supersede, never delete** — the old title must be recorded
  as a former title, and the frozen narration in the archived version tables must not be
  edited.
- **[QA](../../team/qa/debriefs/v0.6.3__opinion-on-the-title.md):** supports any candidate,
  asked for two gates first.

## 5. Approve — the founder's, and open

Three questions, in the order they change the work:

1. **A or C?** Which is the same as asking: is the next edition a **rename** or a
   **revision**?
2. **Does the cover name Claude?** Brief 40 says the book is *"more about writing a book
   with Claude"*. The book names it four times in 31,221 words. If yes, candidate A takes
   it most easily as *Writing a Book with Claude*.
3. **The map's disagreement:** the body reads villager, the founder reads explorer. Retitle
   to match what it is, or revise to match what it should be?

## 6-7. Implement, and approve the implementation

Not started. Blocked on stage 5.

---

## What this release did do

QA's first requested gate is **built and shipped**, because it protects the rename itself:
a book is now checked to be called the same thing in `gen_bookmeta.REGISTER`, in its
`build.py`, and in its own front-matter heading. Nothing checked that before, which made a
rename the change most likely to leave one of the three behind.

It found a disagreement on its first run — the Universe volume heads its front matter with
the series name and puts its own name below. That is normal for a volume and not a mistake,
so it is now **declared in the register** as `front_matter_title` rather than hidden as a
special case inside a test. The gate was then run red against a half-finished rename before
being trusted.

**QA's second gate is not built**: file paths named in book prose must exist. It would have
caught chapters 4 and 15 naming `admin/tests/universe.test.mjs` the day it was deleted at
v0.5.20. It is the first tractable step into the estate's known hole — *prose has no
freshness gate* — and it is the recommended next piece of work whichever title wins.
