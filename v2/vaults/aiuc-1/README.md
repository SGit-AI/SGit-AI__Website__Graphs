# AIUC-1, as a graph you can cite

An **unofficial, derivative** machine-readable catalog of the public AIUC-1 agent
standard, and a graph built from it. Every field in it points back at the official
page or the official commit it was read from, with the SHA-256 of the bytes that
were retrieved and the time they were retrieved.

**This is not AIUC-1.** It is not approved, certified or endorsed by AIUC, it is not
an official API, and it does not replace the standard. Read `NOTICE.md` before you
use any of it, and verify every requirement against
[aiuc-1.com](https://www.aiuc-1.com/).

## What is here

| | |
|---|---|
| **5 releases** | 2025-10-01, 2026-01-15, 2026-04-15, 2026-07-15 built; 2025-07-22 named by AIUC but carrying no commit, so unbuilt and recorded as such |
| **53 controls** | in the current release (2026-07-15), across 6 domains |
| **144 requirements** | the numbered sub-controls, each with the evidence it expects |
| **1,126 crosswalks** | published mappings to 13 external frameworks, the EU AI Act among them |
| **194 change events** | derived from release-to-release differences, plus 104 change rows AIUC publishes itself |
| **1,238 nodes, 3,526 edges** | the whole thing as one graph |
| **82 source observations** | one per captured page, each with its URL, retrieval time, content hash and retained snapshot |

Numbers are the build's own, from `catalog/index.json`, `graph/index.json` and
`evidence/source-manifest.json`. They are computed, not remembered: rerun
`python3 src/build.py` and read them again.

## The layout

```
catalog/        current.json, index.json, releases/<release-id>.json
graph/          nodes.json, edges.json, index.json (the edge vocabulary and its meanings)
changes/        <release-id>.json — derived change events and the official change rows
evidence/       source-manifest.json, discovery-manifest.json, snapshots/<day>/<ref>.html.gz
                (the snapshots live in the vault, not in the public repository — see below)
reports/        validation-latest.json, reconciliation-latest.json, drift-latest.json
schemas/        the five JSON Schemas every artefact is validated against
src/            the build chain, one module per stage
docs/           methodology, source policy, review workflow, limitations
tests/          fixture-based parser tests and red tests for the gates
```

## Building it

```bash
python3 src/build.py        # the whole chain, in order, ending at the gate
python3 tests/run.py        # 11 tests, two of which run the gates red on purpose
python3 src/drift.py        # re-fetch and report drift against the recorded manifest
```

The chain is: `discover_sources` → `fetch_sources` → `parse_pages` →
`parse_changelog` → `normalize_catalog` → `diff_releases` → `build_graph` →
`validate`. Each stage runs on its own; `src/build.py` runs them in order. A
rebuild from the same snapshots and the same generator version produces the same
bytes.

## Where the bytes live

The retained response bodies — one gzipped copy of every page this catalog was read
from — are in the **vault**, under `evidence/snapshots/`, and are deliberately not in
the public git repository. They are copies of someone else's pages, and `NOTICE.md` is
explicit that reuse rights for that content have not been confirmed with AIUC.

What the repository does carry is every snapshot's **path and SHA-256**, in
`evidence/source-manifest.json`. So the chain holds either way: a reader with the
vault can check a claim against the bytes; a reader with only the repository can check
that the hash of those bytes is the one the catalog was built from.

## The rules this build holds to

1. **Evidence, not compliance.** Nothing here says an organisation passes, fails,
   or is certified. It says what the published standard says, and where.
2. **Every claim names its source.** A non-null canonical field carries at least one
   source reference; every reference resolves to an observation with a URL, a
   retrieval timestamp and a content hash. The gate fails otherwise.
3. **Conflicts are preserved, not resolved.** Where the website and the official
   changelog repository disagree, both readings are kept and the difference is
   recorded. A difference that changes meaning is blocking; one that is only
   markdown escaping or bullet order is not, and says which it is.
4. **Nothing is invented.** An enum exists only where the source publishes a label
   that maps unambiguously. Anything else is null beside its raw text, with a
   finding attached.
5. **The parser fails closed.** If a page stops yielding the model this build reads,
   the run opens a review item rather than emitting a guess.

## The terminology inversion, stated once

AIUC-1 calls a top-level item a **requirement** (`A001`) and its numbered children
**controls** (`A001.1`). The brief this catalog was built to calls the top-level item
a **control** and its children **requirements**. This catalog follows the brief, and
every control record carries `source_terminology` saying what the site calls it, so
the inversion is visible rather than silent.

## Licence and attribution

The AIUC-1 content quoted, hashed and linked here belongs to AIUC. See `NOTICE.md`.
The build code in `src/` and the schemas in `schemas/` are part of the sgit.ai graph
estate and carry that estate's licence (CC BY 4.0 for content, see the parent
repository).
