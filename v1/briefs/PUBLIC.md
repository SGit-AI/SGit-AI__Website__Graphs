# PUBLIC.md — what was changed before publication

The eleven documents in this directory are the **graphs.sgit.ai brief pack**, v1.0,
prepared 21 August 2026. They are the source of truth for this website: every claim on
a rendered page traces back to one of these files.

They are published **verbatim, with four exceptions**, all recorded here.

## Redactions applied

The pack's own §7 (`06__house-style-and-conventions.md`) carries a redaction watch-list
for bulk publication. That watch-list applies to the pack itself, because the pack names
the items in order to warn about them. Three files were affected.

| Redacted | Replaced with | Where | Why |
|---|---|---|---|
| The name of one healthcare partner | `<PARTNER-NAME-REDACTED>` | `06__house-style-and-conventions.md` §7 · `07__source-manifest.csv` row 90 | A named commercial partner of a third party. Not ours to publish. |
| One AWS account number | `<AWS-ACCOUNT-REDACTED>` | `06__house-style-and-conventions.md` §7 · `09__licensing-decision.md` | An account identifier. Not a credential, and not something to put on a public page either. |
| Two personalised vault pack names | `<PACK-NAME-REDACTED>` | `06__house-style-and-conventions.md` §7 · `09__licensing-decision.md` | Named individuals. |

Nothing else was altered: no sentence was rewritten, no table row removed, no argument
softened. The redaction markers are deliberately visible so that a reader can see that a
redaction happened and where — a silent redaction would be the worse of the two options.

## Not published at all

Two worked examples described in the pack are excluded from this site for reasons that
have nothing to do with the licence:

- A **LinkedIn network graph** built from a real export — real personal data about third
  parties. A data-protection question, not a licensing one.
- A **case study naming a real third-party product** and analysing its security posture.
  Sources public, tone fair, but it needs a legal read before republication.

Both exclusions are stated on <https://graphs.sgit.ai/examples/index.html#not-here>.

## Licence

All content in this directory is released under the Creative Commons Attribution 4.0
International licence (CC BY 4.0), per the decision recorded in
`09__licensing-decision.md`. Third-party material quoted inside these documents stays
under its own terms: vendor system cards, arXiv papers, EU AI Act text and external URLs
are quoted, not relicensed.

`licence-audit.py` is shipped alongside the documents it describes. It reports and
optionally fixes CC BY coverage across a corpus, and is the tool behind the CI gate the
pack recommends.

---

This document is released under the Creative Commons Attribution 4.0 International licence (CC BY 4.0).
