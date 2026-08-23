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

## Vendored third-party code

Two JavaScript libraries are committed into this repository under `assets/vendor/` and served
from it. They are **not** relicensed: each keeps its own licence, and its copyright header is
left intact in the file.

| File | Library | Version | Licence | Size | Used by |
|---|---|---|---|---|---|
| `assets/vendor/cytoscape.min.js` | [Cytoscape.js](https://js.cytoscape.org/) | 3.30.2 | MIT | 373 KB | the [ladder graph](https://graphs.sgit.ai/altitudes/graph.html), the [decisions](https://graphs.sgit.ai/decisions/index.html) graphs, the [docs](https://graphs.sgit.ai/docs/index.html) graphs |
| `assets/vendor/marked.min.js` | [marked](https://marked.js.org/) | 12.0.2 | MIT | 35 KB | every in-page markdown reader under `/documents/` and `/docs/` |

They are vendored rather than loaded from a content delivery network on purpose. A page that
needs a third party to be reachable before it can render its own source document has a chain of
custody with a hole in it, which is the failure this site spends sixteen chapters arguing
against. Vendoring also means the pages render offline and that the exact bytes served are the
bytes in this repository's history.

**One remaining exception, stated rather than hidden.** `assets/mdreader.js` renders
```` ```mermaid ```` fences by dynamically importing Mermaid from `cdn.jsdelivr.net`. That import
is best-effort: when it fails, the fence stays visible as a code block and nothing else on the
page is affected. It has not been vendored because the library is roughly two orders of magnitude
larger than the two above and only a handful of documents contain a mermaid fence. This is a
judgement, not an oversight, and it is recorded here so it can be argued with.
