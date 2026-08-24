# thinking-in-graphs — the document folder

Everything this estate holds about one source document, in one standalone folder that
can be moved or copied between repositories without losing anything.

| File | What it is |
|---|---|
| `source.md` | A byte copy of the frozen source. Verified on every build against the SHA-256 recorded in `extraction.json`, so the copy cannot drift from the original at `v1/docs/sources/thinking-in-graphs.md`. |
| `extraction.json` | The layer 1 local graph: the document's dictionary, claims with their support state, hypotheses, objectives, demonstrations and asserted relations, every one anchored to a verbatim quote whose bytes the build verifies. |
| `crossrefs.json` | Where this document is used across the estate, each use rated against the usage maturity model (`../../usage-model.json`): aligned, stretched, misaligned, unrated. A first pass that grows as more documents join. |
| `index.html` | The folder, browsable (generated). |

The reader for this document is at `../../thinking-in-graphs.html` and its printable
extraction at `../../thinking-in-graphs.pdf`; both are projections and regenerate on
every release. The files above are the sources of truth.
