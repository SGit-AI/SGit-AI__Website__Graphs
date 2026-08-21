---
path: about/participant.html
title: Participant disclosure — graphs.sgit.ai
description: Who publishes this site, what they sell, where this approach loses, and the site-wide licence. Published by the sgit project, which builds the vault layer and the graph products this site argues for.
og_title: Participant disclosure — including where our approach loses
og_description: We are not a neutral observer. Here is what we build, what we would gain if you agreed with us, and four situations where this approach is the wrong choice.
crumb: Participant disclosure
parent: 
prev: ← How this site is built|../admin/index.html
next: Front page →|../index.html
---
# Participant disclosure

This site argues that provenance should be traversable and that the interested party should be a visible node. That applies to us.

## Who publishes this {#who}

graphs.sgit.ai is published by **the sgit project**, which builds the vault layer, the `sgit` CLI, and the graph products described across this network. It is written primarily from six and a half months of applied work by **Dinis Cruz** and the agentic team working with him, February to August 2026.

**We are not a neutral observer.** If the argument on this site is right, the products we build are more valuable. That is a real interest and it is worth holding in mind on every page — particularly the pages where the argument is elegant and the evidence is a design document rather than a running system.

## What we do about it {#mitigations}

- **[A page that separates what ships from what is argued](../shipped/index.html)**, listing what does not exist anywhere — including the absence of any graph database, which is the thing a vendor would most want to imply.
- **Every number is labelled** live or parsed-from-a-design-document, and the two are never mixed.
- **Every page written fresh says so**, and names which gap it fills. The bar for those is lower and you should hold them to it.
- **[The source documents are published in full](../documents/index.html)**, raw, with the three redactions [recorded](../documents/public.html). You can check any quotation against its source.
- **Our own errors are on the site**, not in a changelog. [Two corrections](../shipped/index.html#corrections), including a rule the project's own shipped configuration breaks.

## Where this approach loses {#loses}

Four situations where the argument on this site is the wrong one. If you are in one of them, do something else.

::: ladder

### 1 · Everyone already agrees, and always will

Inside one team, one codebase, one jurisdiction, with a stable vocabulary and no external party — a schema is simpler, faster, and it will catch mistakes this approach lets through. The whole argument here is about what happens at a boundary. No boundary, no benefit.

### 2 · You need the answer to be enforced, not computed

Enrichment rather than enforcement is a real cost. If your requirement is “this field must never be null”, a validator does that and a graph does not. Some systems need a gate, and a gate is a schema.

### 3 · The graph would be empty

This approach needs edges, and edges are work somebody has to do. Where nobody has done that work, traversal has nothing to say and similarity search will beat it outright. [Stated on the positioning page too.](../why-graphs/index.html#positioning)

### 4 · You want to buy it rather than build it

The honest state of the semantic layer is **designed, not shipped**. If you need something running next quarter, this site is a set of arguments you can use, not a product you can procure. [What actually ships →](../shipped/index.html)
:::

## Licence {#licence}

::: claim
All content on this site is released under **CC BY 4.0**. The raw markdown under `/briefs/` is the source of truth and carries the same licence.
:::

That follows a decision of 21 August 2026: unless a document explicitly says otherwise, every markdown file in the corpus was authored by Dinis Cruz and is released under CC BY 4.0, and the same applies to the entire content of every `*.sgit.ai` website. [The decision, in full →](../documents/licensing.html)

Irrevocability is the point rather than a risk being managed: the licence is what guarantees the material stays readable — by its author, by future collaborators, and by agents — regardless of what happens to any company, platform or vault that currently hosts it. A grant that could be withdrawn would not provide that guarantee.

**Two limits.** Third-party material quoted inside these documents stays under its own terms — vendor system cards, arXiv papers, EU AI Act text and external URLs are quoted, not relicensed. And code in the repository behind this site is under its own repository licence; [LICENSES.md](https://github.com/SGit-AI/SGit-AI__Website__Graphs/blob/dev/LICENSES.md) states the split.

## Corrections {#contact}

If something here is wrong, the fastest route is [the comms board](../admin/comms.html) or an issue on [the repository](https://github.com/SGit-AI/SGit-AI__Website__Graphs). Corrections that change a claim get a row in [the release history](../admin/versions.html), not a silent edit — [the site's own rule](../depth/index.html#supersede).
