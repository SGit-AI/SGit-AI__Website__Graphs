# Methodology

How a public AIUC-1 page becomes a catalog record, and what stops it becoming
something the source does not say.

## 1. Discovery, from the site's own model

The AIUC-1 site is a React application that ships its published control model in
the page payload: domains, controls, sub-controls, evidence expectations, keywords,
crosswalks. `src/discover_sources.py` reads that model out of the home page rather
than scraping rendered HTML, and writes `evidence/discovery-manifest.json`.

Nothing is hardcoded. There is no control list in the code. A control that stops
being published stops being discovered, and the inventory check in `src/validate.py`
notices the difference against the previous release.

A second hop reads the changelog page for the per-release changelog pages it links
to, so historical releases are discovered rather than assumed.

## 2. Capture, politely

`src/fetch_sources.py` is the only place bytes enter the build.

- One request per second per host, an explicit user agent naming this build.
- `robots.txt` fetched and honoured; if it cannot be retrieved at all, the fetcher
  refuses to fetch rather than assuming permission.
- Conditional requests when a prior snapshot carries an ETag.
- Bounded exponential backoff, transient status codes only.
- The exact received body saved gzipped under `evidence/snapshots/<day>/<ref>.html.gz`,
  with an observation recording the final URL, status, content type, retrieval time
  and SHA-256.

## 3. Extraction, structurally

`src/rsc.py` reads the payload format the site publishes: rows, length-prefixed
text rows, and references of the form `$<row>:<path>`. Two behaviours matter:

- **Pruning before expansion.** Each control carries a back-reference to its domain,
  which carries every control. Following it is unbounded, so it is dropped: the
  parent is known from context.
- **Self-references resolved against the model itself.** Repeated objects — crosswalk
  clauses above all — are published once and referenced by path afterwards. Those
  paths are walked against the control model rather than the whole page.

`src/parse_pages.py` then reads each control **from its own page**, not only from the
home-page index, and compares the two. All 53 controls in the current release are
confirmed by their own page; any that were not would be marked `needs_review`.

## 4. History, from the official repository

`src/parse_changelog.py` reads every commit in `aiunderwriting/AIUC-1-Changelog`
that touches `standard/`, capturing the blob SHA, the SHA-256 and the parsed content
of `controls.md` and `requirements.md` at that commit, and reads the official
changelog pages for the release dates and the published change table.

## 5. Matching a commit to a release, explicitly

The repository was created after the first releases and backfills them in order, so
commit date is not the signal. `src/release_sources.py` matches on the commit subject
naming the release month, rules out a subject naming a different day, and takes the
earliest unmatched commit. Every match records its rationale and a confidence (0.95
when the subject names the published day, 0.85 when it names only the month). The
2025-07-22 release has no commit that survives that test, so it is recorded as
`unbuilt` with the reason, rather than being given the nearest commit.

## 6. Normalisation, without overwriting

`src/normalize_catalog.py` builds the control records. Every mapped value sits beside
the source wording it came from:

```json
"frequency": { "value": "every_12_months", "raw_text": "Every 12 months" }
```

A label with no unambiguous mapping produces `{"value": null, "raw_text": "..."}` and
a finding. Sub-control descriptions carry one or more source bullets; they are split
on the bullet marker and kept verbatim alongside the whole description.

## 7. Reconciliation

`src/reconcile.py` compares the website's control set with the repository's markdown
at the matched commit: titles, statements, and the bullet sets. Differences are
classified:

- `title_conflict`, `summary_conflict`, `guidance_set_conflict` — **blocking**;
- `guidance_order_difference`, `guidance_formatting_difference` — recorded, not
  blocking, and each says why it is not.

At the 2026-07-15 release there are five findings, none blocking: three are markdown
escaping or a link written as markdown on one side and plain text on the other, two
are the same bullets in a different order.

## 8. The graph

`src/build_graph.py` decomposes the catalog into nodes and edges. Seventeen edge
kinds, each with the sentence that says what it means, in `graph/index.json`. The
point is the same one this estate keeps arriving at: a control's properties are just
words, and what it *is* shows in the edges traceable from it — its domain, its
requirements, the evidence each expects, the external clauses it is crosswalked to,
the release it appeared in, the commit that carries it and the page it was read from.

## 9. The gate

`src/validate.py` runs four levels — schema, source traceability, semantic, and
inventory. A release may only say `validated` when all four pass and no blocking
reconciliation finding exists. `tests/run.py` runs the schema gate and the
traceability gate **red** on purpose, because a validator that has never failed is
not known to work.
