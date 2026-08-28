---
created: 2026-08-28T18:42:53Z
priority: medium
source: brief 45 — the diff the founder asked for
estimated_effort: two days
parent: WS-04
---

# A graph diff needs a graph stored per book version

Brief 45 sets the bar plainly: *"you should be delting the diffs of the graphs, not
of the markdown. That would be the really test measurement of our success here."*

The pieces that exist: the book decomposes to 27,002 word nodes across 160 shards,
with a per-chapter identity ledger, and every chapter rebuilds byte-identical. The
piece that does not: **only the current version has a graph**, so the diff cannot be
computed backwards.

## The plan

1. Rebuild the graph at each tag that moved this book (v0.5.18, v0.6.9) into a
   versioned folder. The decomposition is deterministic, so this is a replay, not an
   authoring job.
2. Diff two graphs by identity: a sentence that kept its uid was reworded; one that
   did not was replaced; a section whose uid moved was moved.
3. Report a formatting-only change as exactly that, which the founder names as the
   thing markdown diffs cannot do.

**Do not ship the text diff and call it the answer.** It is available today from the
tags and it is the fragile half. Ship it if it is useful, labelled as the half.
