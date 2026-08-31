# Limitations

What this catalog does not do, cannot do, or has not yet done. Read this before
citing it.

## It is not the standard

It is derived. AIUC has not reviewed it. Where it differs from
[aiuc-1.com](https://www.aiuc-1.com/), the site is right.

## Historical releases are thinner than the current one

Only the current release (2026-07-15) is built from the website, so only it carries
the published presentation metadata: mandatory/optional, frequency, control type,
keywords, capabilities, sub-controls, evidence expectations and crosswalks.

The three earlier built releases (2026-04-15, 2026-01-15, 2025-10-01) come from the
official changelog repository alone: control id, title, normative statement, and the
control shoulds and mays. They are marked `partial` in `catalog/index.json`, and that
is what `partial` means here. The site publishes no historical control pages, so
those fields cannot be recovered without inventing them.

## One named release has no artefact

AIUC's standard-history table names a **July 22, 2025** version. No commit in the
official changelog repository survives the matching test for it, so no control set
can be traced to a source revision at that date. It is listed as `unbuilt` with the
reason rather than being reconstructed from the nearest commit.

## The announced release is not built

The changelog page announces **October 15, 2026**. Announced is not published: it is
recorded in `catalog/index.json` as `announced` with the sentence that announced it,
and has no artefact.

## Crosswalks are AIUC's, not this build's

The 1,126 crosswalk mappings to 13 external frameworks are **published by AIUC**. They
are reproduced with their framework, reference and text; the relationship is recorded
as `published_crosswalk` for exactly that reason. No mapping was inferred, extended or
scored here, and the `gap` and `gapAnalysis` fields carry whatever the source carried,
including null.

## Sub-control status is not stated by the source

AIUC-1 publishes numbered sub-controls (`B006.1`) with an application of Core or
Supplemental. Whether a sub-control is normative, an example, or implementation
guidance is not stated. This catalog carries them as published requirements with their
application label, and `docs/source-policy.md` lists this as an open question.

## Five differences are recorded and unresolved

At 2026-07-15 the website and the official repository differ in five places: three are
markdown escaping or link syntax, two are bullet order. None changes meaning, so none
blocks the release — but none has been resolved either, because resolving them means
choosing a source, and that is not this build's to choose. They are in
`reports/reconciliation-latest.json`.

## Everything else is a snapshot in time

The catalog is what the official sources said at the retrieval timestamps in
`evidence/source-manifest.json`. The site is a deploying web application; it can change
between one read and the next. `src/drift.py` exists to tell you when it has, and
distinguishes a redeploy from a change in what the standard says. Nothing here
auto-updates.
