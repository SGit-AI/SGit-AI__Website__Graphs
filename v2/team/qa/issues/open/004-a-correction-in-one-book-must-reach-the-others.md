---
created: 2026-09-19T20:10:00Z
priority: high
source: v0.6.21 — brief 47, found while checking the sibling site's reading
estimated_effort: half a day
---

# A correction recorded in one book has to reach the other two

On 23 August 2026 the founder recorded that the planning pack had defined *fractal* as
uniformity, and that uniformity is the mechanism rather than the claim. The Universe
volume carries that correction properly: both definitions kept, the superseded one
dated. That is this estate's supersede rule applied to its own vocabulary and it is
exactly right.

It never reached the other book. Chapter 6 of *Fractal Semantic Graphs* went on stating
the uniform version for two book versions, and `llms.txt` stated it for four weeks after
that. It was found on 19 September by a reader at a sibling site, not by anything here.

**This is the estate's own drift failure, one layer up.** Every gate we have watches a
projection against its source: the page against its markdown, the book against its
chapters, the graph against its rebuild. Nothing watches one *authored* statement against
another authored statement of the same thing in a different book.

## What a gate could look like

Not a general one. A general "do these two books agree" gate is a prose-comparison problem
and would be a lie dressed as a check. Something narrower is possible:

- The atlas already marks superseded definitions with a date. That is structure, not prose.
- A gate could extract every **superseded** entry from the Universe volume's register and
  fail the build if the superseded wording still appears in another book or in `llms.txt`
  without being marked as a quotation of the old form.

That checks the one thing that actually went wrong, and it is checkable because the
supersede is already declared as data. Run it red against chapter 6 as it stood at book
v0.2.0 before trusting it; if it does not go red on that, it is not the gate.

## The QA opinion

This sits beside `001-verbatim-gate-for-authored-quotations`. Both are the same species:
the estate gates what it *generates* and trusts what it *writes*. The generated half has
never been the problem.
