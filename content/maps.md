---
path: maps/index.html
title: Wardley maps as graphs — graphs.sgit.ai
description: A graph says these things are connected; a map adds where they sit. Plus the coordinate trap that will bite you on day one: Wardley coordinates are [visibility, evolution], the reverse of the usual convention.
og_title: Wardley maps as graphs — and the coordinate trap
og_description: A map with its axes transposed renders happily and says something entirely different. Mermaid Wardley: added v11.14.0, production-stable v11.15.0.
crumb: Wardley maps
parent: 
prev: ← Worked graphs|../examples/index.html
next: What ships, what is argued →|../shipped/index.html
---
# Wardley maps as graphs

A map belongs on a graph site for a specific reason, and it is not that both have boxes and lines.

::: claim
A graph says these things are connected. A map adds **where they sit**. Connectivity says what relates; position says what to do.
:::

Everything else on this site is about the first half. A Wardley map is the same node-and-edge structure with two coordinates attached — how visible a component is to the user, and how evolved it is — and those coordinates turn a description into a decision. It is the natural next thing to do to a graph once you have one, which is why it lives here rather than on a separate strategy site.

And a map has the property this site keeps asking for elsewhere: **a map is a falsifiable claim, not a picture.** Someone can point at a component and say “that is not where that sits”, and they are making a checkable statement. That is the same move as [turning a classification into a path-pattern](../depth/index.html#formulas).

## The coordinate trap {#trap}

::: warn
**Wardley coordinates are `[visibility, evolution]` — the reverse of the convention you will assume.** Everything else you have ever plotted takes `[x, y]`. This does not.

The failure mode is the bad one: **a map with its axes transposed renders happily and says something entirely different.** No error, no warning, a perfectly good-looking picture making a claim you did not make. If you take one thing from this page, take this one.
:::

| Detail | Value |
|---|---|
| Mermaid Wardley support | Added in **v11.14.0**; production-stable at **v11.15.0** |
| Coordinate order | `[visibility, evolution]` — **not** `[x, y]` |
| Hand-drawn look | Not supported |
| Fence marker | The maps in the corpus use a bare fence with `wardley-beta` on the first line — so **grep for `wardley-beta`**, not for the fence tag, or you will find none of them |

That last row is the kind of hard-won detail that has nowhere to live. It is here because the founder said he had nowhere to point people at for exactly this.

## Maps as text are maps that survive the meeting {#text}

The strongest practical argument for the Mermaid toolchain is not that it is convenient. It is that a map written as text is diffable, committable, reviewable in a pull request, and can be regenerated. A map drawn in a whiteboard tool is a screenshot within a week and a lie within a month.

Same argument as everywhere else here: **the artefact and the reasoning behind it should live together, in a form that a change can be argued with.**

## What exists, and what is still to render {#backlog}

| Set | State |
|---|---|
| **The strategy maps** — eight rendered images, the only rendered graph visuals in the corpus | <span class="pill p-ships">rendered</span> Some exist as inline SVG on the parent site: [sgit.ai/demos/strategy-maps.md](https://sgit.ai/demos/strategy-maps.md) |
| **Mermaid `wardley-beta` source blocks** — twelve in the corpus | <span class="pill p-ships">source exists</span> |
| **The permissions set** — four maps, including one called “Hope Driven Development” | <span class="pill p-argued">unrendered</span> One render command away |
| **The air-gap map** — the sharpest single map here | <span class="pill p-argued">unrendered</span> [Task T4](../admin/comms.html) |

## The air-gap map: the ends are solved, the middle is people {#airgap}

The map worth rendering first, and the best single map for a public site. It shows both ends of a process sitting at high evolution — commodity, automated, solved — with a gap in the middle that is filled by human labour.

The reason it works as a map rather than as a sentence is structural: **a gap has no evolution**. There is nothing to plot, because nothing is there. So what you plot is *the labour that fills it* — and once that labour is on the map, at a position, it is something a strategy can act on rather than something everyone works around.

It is the same argument as [the air gap in the graph](../depth/boundaries.html#air-gap), drawn: a named absence beats a hidden one.

<p class="small dim">One adjudication rule that comes with it, and is worth knowing before your first argument about a custom axis: if you replace the evolution axis with your own, you must say what the new axis means and who decides where something sits on it. Otherwise the map becomes unfalsifiable, which is the one thing a map must not be.</p>

::: agent
When generating a Mermaid Wardley map, coordinates are `[visibility, evolution]` — **the reverse of `[x, y]`**. A transposed map renders without error and asserts something different, so verify the order before you emit. Mermaid Wardley requires v11.14.0 or later (stable at v11.15.0) and does not support the hand-drawn look. To find existing maps in a corpus, grep for `wardley-beta`, not for the fence tag.
:::
