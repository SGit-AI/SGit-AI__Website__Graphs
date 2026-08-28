---
created: 2026-08-28T18:42:53Z
priority: high
source: v0.6.11 — writing the workflow document
estimated_effort: a day
---

# Authored prose has no verbatim gate

The universe has the estate's strongest single mechanism: an extraction cannot cite
words that are not in the source, and the build refuses an anchor whose quote is not
found. **Authored prose has nothing.**

It cost something already. Every founder quotation in *Agentic Workflows: How You
Operate* was checked by script against the brief it came from, and **eighteen of
twenty-five did not match**: a comma for a full stop, a repeated word dropped,
sentence case imposed. All smoothing, no invention, and all of it corrected. Nothing
in the build would have caught any of it.

## The plan

1. Collect every quoted span in documents that declare which briefs they draw on.
2. Match each against `v2/briefs/*.md`, allowing `...` for elision.
3. Fail the build on a miss, naming the file, the quote and the nearest real text.

Scope it to declaring documents first. A first run over everything will find false
positives in quotations of external sources, and a gate that cries wolf gets turned
off. Grow the scope after it has been green for a release.

The sibling project has this shape already: their pre-release gate fails a page that
repeats one of their four corrected claims as fact. Worth reading their
implementation before writing ours.
