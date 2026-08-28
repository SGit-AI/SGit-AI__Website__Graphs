---
created: 2026-08-28T18:42:53Z
priority: high
source: v0.6.3 — the naming question, QA's opinion
estimated_effort: half a day
---

# File paths named in prose are not checked

Asked for at v0.6.3 and still not built. Three instances of the defect since:

- chapters 4 and 15 named `admin/tests/universe.test.mjs` the day it was deleted
- the researcher's first debrief named `briefs/v0.6.3__map-the-making-of-book.md`,
  renamed at v0.6.4, corrected four releases late
- both found by **reading**, which is the argument

## The plan

Walk the markdown under `v2/`, pull anything that looks like a repo path out of
inline code spans, and fail the build if it does not exist. Two known exceptions to
handle rather than ignore: paths inside verbatim founder quotes (the memo said what
it said, even if the file has since moved), and paths that name a thing deliberately
described as absent.

This is the estate's known hole stated in its own retrospective: *prose has no
freshness gate*. This closes the tractable half of it.
