# Opinion: the title, from the writer

**Asked** what each candidate would cost in prose.
**Position** support **A** for this edition, and **want the C brief** for the next.

## A costs three paragraphs

The title appears inside the book twice: `00__front-matter.md` (the *what is locked* note,
which explicitly says the title *"was set in the commission"*) and `16__colophon.md`. Under
**A** both passages get better, not merely different — the front-matter note becomes a
short account of why the book was renamed after it was read, which is the same kind of
honesty the book already applies to everything else.

## C is a real revision and I would rather be asked than assumed

The map is right that *scaffolding* and *feedback loop* appear **zero** times. That is not
a gap I can close with a find-and-replace. Making **C** honest means writing the argument
the founder states in brief 40 — *"with great tests and great environments and great
feedback loops, you arrive at great code, but the other way around doesn't happen"* — into
the body, with the estate's own evidence behind it, which exists and is not yet used:

- 97 tests in six suites, up from a single file, and every one of the escaped bugs that
  produced a gate (the async-swallowing harness, the two writers on `book.json`, the frozen
  edition regenerated);
- the v0.5 retrospective's finding that four of six mistakes were caught by gates built in
  the same era.

That is a chapter, or a substantial rewrite of chapter 4. **Two to three thousand words.**

## The correction I want regardless of the title

Brief 40: *"the book underplays the amount of stuff that we ship."* It does, and the fix is
computed rather than adjectival. The colophon also carries a sentence that is now false:
**"The second book is not written."** True at v0.5.11, false since. That is a factual
correction and should not wait for a naming decision.
