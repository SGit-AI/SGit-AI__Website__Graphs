# agentic-workflows — the document folder

Everything this estate holds about one source document, in one standalone folder that
can be moved or copied between repositories without losing anything.

| File | What it is |
|---|---|
| `source.md` | The document itself. Unlike the carried sources, this one was **born in v2**: there is no separate frozen original under `v1/docs/sources/`, so this file is the original and the copy at once. The SHA-256 in `extraction.json` still pins the extraction to exact bytes, so editing the prose without re-extracting fails the build. |
| `extraction.json` | The layer 1 local graph: the document's dictionary, claims with their support state, hypotheses, objectives, demonstrations and asserted relations, every one anchored to a verbatim quote whose bytes the build verifies. |
| `ids.json` | The identity ledger for the decomposition: a short stable uid for the document, every section and every block, carried forward across edits. |
| `crossrefs.json` | Where this document is used across the estate, each use rated against the usage maturity model (`../../usage-model.json`). |
| `index.html` | The folder, browsable (generated). |

The decomposition to the word lives at `../../data/core/agentic-workflows/`. The reader is
at `../../agentic-workflows.html` and its printable extraction at
`../../agentic-workflows.pdf`; both are projections and regenerate on every release.

## What is different about this one, and why it is said out loud

The pilot document was **carried**: written by a human, frozen under `v1/`, hashed in the
freeze manifest, and extracted afterwards. This document was **projected**: written by an
agent from a founder memo, in this folder, on the day it was extracted.

That puts it on the interpreted side of the boundary the estate insists on, and the
document says so about itself in the section *Where This Document Sits*. The memo it comes
from stays published verbatim at `v2/briefs/45__founder-memo__what-a-workflow-is.md`, and
that brief, not this prose, is the source of truth for anything the founder said.

The arrangement is therefore: a one-way step, declared, with a deterministic layer built
underneath it. Everything below this file's prose is two-way, and rebuilds byte-identical.
