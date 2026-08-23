---
path: about/participant.html
title: Participant disclosure — graphs.sgit.ai
description: Who publishes this site, what they sell, where this approach loses, and the site-wide licence. Published by the sgit project, which builds the vault layer and the graph products this site argues for.
og_title: Participant disclosure — including where our approach loses
og_description: We are not a neutral observer. Here is what we build, what we would gain if you agreed with us, and four situations where this approach is the wrong choice.
crumb: Participant disclosure
parent: 
prev: ← How this site is built|../../admin/index.html
next: Front page →|../index.html
---
# Participant disclosure

This book argues that provenance should be traversable and that the interested party should be a visible node. That applies to us.

## Who wrote this, and how {#who}

This book, and the website it is projected from, is published by **the sgit project**, which builds the vault layer, the `sgit` command-line tool, and the graph products described across these chapters.

**It was written by Dinis Cruz together with a team of AI agents**, and the working method is part of the material: ideas are recorded as voice memos, transcribed and developed by agents into structured briefs, reviewed and corrected by the author, and finally distilled into these chapters. The scale of that corpus, measured at version v0.33.62 of the source repository, is worth stating because it is the evidence base of everything here:

- **more than 1,300 founder briefs** (1,302 at the count), each developed from the author's voice memos, recorded almost daily across six and a half months (8 February to 20 August 2026), on thinking that goes back many years;
- **some 3,300 markdown documents** in the corpus overall (3,317 tracked, 956 of them formally catalogued), built over 4,335 commits;
- **around 135,000 words** in the ~55 core conceptual documents alone, before the worked examples and the reviews around them.

Distillation ran the direction this book teaches: wide first, then the few, then the flip. The numbers above are reported from the brief pack published with this book, and where a figure is an approximation it is marked as one.

**We are not a neutral observer.** If the argument in this book is right, the products we build are more valuable. That is a real interest and it is worth holding in mind in every chapter, particularly the ones where the argument is elegant and the evidence is a design document rather than a running system.

## What we do about it {#mitigations}

- **[A chapter that separates what ships from what is argued](../shipped/index.html)**, listing what does not exist anywhere, including the absence of any graph database, which is the thing a vendor would most want to imply.
- **Every number is labelled** live or parsed-from-a-design-document, and the two are never mixed.
- **Every chapter written fresh says so**, and names which gap it fills. The bar for those is lower and you should hold them to it.
- **[The source documents are published in full](../documents/index.html)**, raw, with the three redactions [recorded](../documents/public.html). You can check any quotation against its source.
- **Our own errors are in the book**, not in a changelog. [Two corrections](../shipped/index.html#corrections), including a rule the project's own shipped configuration breaks.

## Where this approach loses {#loses}

Four situations where the argument of this book is the wrong one. If you are in one of them, do something else.

::: ladder

### 1 · Everyone already agrees, and always will

Inside one team, one codebase, one jurisdiction, with a stable vocabulary and no external party, a schema is simpler, faster, and it will catch mistakes this approach lets through. The whole argument here is about what happens at a boundary. No boundary, no benefit.

### 2 · You need the answer to be enforced, not computed

Enrichment rather than enforcement is a real cost. If your requirement is “this field must never be null”, a validator does that and a graph does not. Some systems need a gate, and a gate is a schema.

### 3 · The graph would be empty

This approach needs edges, and edges are work somebody has to do. Where nobody has done that work, traversal has nothing to say and similarity search will beat it outright. [Stated in the positioning section too.](../why-graphs/index.html#positioning)

### 4 · You want to buy it rather than build it

The honest state of the semantic layer is **designed, not shipped**. If you need something running next quarter, this book is a set of arguments you can use, not a product you can procure. [What actually ships →](../shipped/index.html)
:::

## Licence {#licence}

::: claim
All content in this book and on its companion site is released under **CC BY 4.0** (the Creative Commons Attribution licence: share and adapt freely, for any purpose, with credit). The raw markdown behind every chapter carries the same licence.
:::

That follows a decision of 21 August 2026: unless a document explicitly says otherwise, every markdown file in the corpus was authored by Dinis Cruz and is released under CC BY 4.0, and the same applies to the entire content of every `*.sgit.ai` website. [The decision, in full →](../documents/licensing.html)

Irrevocability is the point rather than a risk being managed: the licence is what guarantees the material stays readable, by its author, by future collaborators, and by agents, regardless of what happens to any company, platform or vault that currently hosts it. A grant that could be withdrawn would not provide that guarantee.

**Two limits.** Third-party material quoted inside these documents stays under its own terms: vendor system cards, arXiv papers, EU AI Act text and external URLs are quoted, not relicensed. And code in the repository behind this book is under its own repository licence; [LICENSES.md](https://github.com/SGit-AI/SGit-AI__Website__Graphs/blob/dev/LICENSES.md) states the split.

## Corrections {#contact}

If something here is wrong, the fastest route is [the comms board](../../admin/comms.html) or an issue on [the repository](https://github.com/SGit-AI/SGit-AI__Website__Graphs). Corrections that change a claim get a row in [the release history](../../admin/versions.html), not a silent edit: [this book's own rule](../depth/index.html#supersede).
