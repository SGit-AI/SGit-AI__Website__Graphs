# Licences

This repository carries two licences, and which one applies depends on whether a file is code
or content. Stating the split explicitly is the standard resolution, and it is worth doing
because a reader who opens only `LICENSE` would reasonably conclude the whole repository —
documents included — is Apache 2.0.

> **Code** in this repository is licensed under the Apache License 2.0 (see `LICENSE`).
>
> **Documentation and written content** — the `.md` files under `briefs/`, the HTML pages, and
> the content of the `*.sgit.ai` websites — are licensed under the Creative Commons Attribution
> 4.0 International licence (CC BY 4.0), unless a specific document states otherwise.

## What that means here

| Path | Licence |
|---|---|
| `admin/build/*.py`, `admin/build/*.js`, `assets/*.js`, `assets/*.css`, `.github/workflows/*` | Apache License 2.0 |
| `briefs/*.md`, `briefs/*.csv`, `index.md`, `llms.txt`, `llms-full.txt`, every `*.html` page | CC BY 4.0 |
| `briefs/licence-audit.py` | Apache License 2.0 as code; it ships alongside the documents it audits |

## The decision behind it

Per a decision of 21 August 2026, recorded in `briefs/09__licensing-decision.md`:

> Unless a document explicitly says otherwise, every `.md` file in the corpus was authored by
> Dinis Cruz and is released under CC BY 4.0. The same applies to the entire content of every
> `*.sgit.ai` website.

Irrevocability is the point rather than a risk being managed: the licence is what guarantees
the material stays readable — by its author, by future collaborators, and by agents —
regardless of what happens to any company, platform or vault that currently hosts it. A grant
that could be withdrawn would not provide that guarantee.

## Two limits

**Third-party material quoted inside CC BY documents stays under its own terms.** Vendor system
cards, arXiv papers, EU AI Act text and external URLs are quoted, not relicensed.

**CC BY 4.0 governs reuse, not publication.** Some material is excluded from this site for
reasons unrelated to copyright — real personal data about third parties, and one case study
that names a real product and needs a legal read. Those exclusions are stated at
`briefs/PUBLIC.md` and on https://graphs.sgit.ai/examples/index.html#not-here.
