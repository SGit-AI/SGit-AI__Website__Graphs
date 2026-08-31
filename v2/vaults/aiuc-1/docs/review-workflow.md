# Review workflow

Automation here produces a queue, not a decision. Nothing ambiguous is resolved by
the build.

## What opens a review item

- A drift run finds a page whose **published control model** changed (a change in raw
  bytes alone is classified as a site deploy and does not).
- A page stops yielding a control model — the parser fails closed.
- The official changelog repository has a commit the catalog was not built from.
- A source label appears that no mapping table covers.
- The website and the official repository disagree in a way that changes meaning.

## What a review item carries

```json
{
  "review_id": "rev_2026_08_31_src_2026_08_31_control_b006",
  "opened_at": "<timestamp>",
  "affected": "<source ref, control id or field>",
  "url": "<official page>",
  "kind": "content_change",
  "reason": "<why this could not be decided automatically>",
  "parser_version": "0.1.0",
  "proposed_value": null,
  "reviewer": null,
  "decided_at": null,
  "rationale": null,
  "status": "open"
}
```

Open items live in `reports/review-queue.json`; the run that opened them is in
`reports/drift-latest.json`.

## The loop

1. A scheduled `src/drift.py` run re-fetches every discovered page and the repository.
2. It classifies each difference as **known** (presentation only) or **unknown**.
3. Every unknown difference becomes a review item, and its snapshot is retained;
   snapshots for known differences are discarded, because nothing was learned.
4. A human reads the retained snapshot beside the recorded one — both are complete
   response bodies, so they can be diffed.
5. An approved correction becomes either a deterministic parser rule or an explicit
   recorded override. It never becomes a hand-edited catalog file.
6. `src/build.py` reruns; `src/validate.py` decides whether the release may say
   `validated`.

## The rule about language models

A language model may propose a label, explain what changed between two snapshots, or
draft a test. **It is never the authority for a normative value.** Every canonical
field in this catalog is grounded in captured official text and a deterministic
check, and the gate enforces that independently of how a value was proposed.
