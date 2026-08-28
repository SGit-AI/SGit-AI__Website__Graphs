---
created: 2026-08-28T18:42:53Z
priority: low
source: v0.4.13 — named then, still open
estimated_effort: half a day
---

# uni-graph.js is over the size guideline, and has been for two eras

439 lines against a 250-line section budget. The deviation is stated in the module
header and in the release note, which is the estate's rule (unstated debt is the
thing to avoid, not debt), so this is not a defect. It is debt that has now outlived
the reason given for it.

The book's own colophon says it: *"the debt is still there... the remedy was named
at v0.4.13."*

## The plan

The element is doing three jobs: the cytoscape lifecycle, the instrument controls,
and the selection model. The selection model is the one that comes out cleanly and
is the one with logic worth testing without a browser. Take that first and see
whether the rest still needs splitting.

Low priority on purpose. Nothing is blocked on it and brief 45's rule applies: the
default is not to change the workflow.
