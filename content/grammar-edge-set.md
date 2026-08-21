---
path: grammar/edge-set.html
title: The edge set — graphs.sgit.ai
description: Fifteen established edges with their inverses, the node types from the two most complete worked graphs, and the rules for extending the set. The public, versioned edge vocabulary the corpus cites but never published.
og_title: The edge set — a public, versioned edge vocabulary
og_description: connected_to, observed_on, backed_by, measured_by, grants, reaches, enables, exposes, gives_rise_to, protected_by, conditional_on, defeated_by, owned_by, accepted_by, underwritten_by — each directed, each with a distinct inverse.
crumb: The edge set
parent: The grammar|index.html
prev: ← The rules|index.html
next: The worked examples →|../examples/index.html
---
# The edge set

A concrete, versioned, public vocabulary. This is the reference to paste into an agent session before asking it to build a graph, and the place to argue with if you think an edge is missing or wrongly named.

<div class="evbox ev-warn">
<span class="evtag">Provenance</span>
<p>Appendix A of the 28 July 2026 brief cites “the concepts glossary” as the authority on edge-grammar discipline and lists the established edge set. <b>No such file exists in the source repository</b> — it lives in another project. That absence is gap <b>G5</b>, and the recommendation in the brief pack was that this website should either import it or <em>become</em> it.</p>
<p><b>This page becomes it.</b> Which means: the fifteen edge names below are quoted from the corpus and are load-bearing. Several of the <em>inverse</em> names are not — where the corpus does not supply one, this site proposes it, and says so in the table. Proposed names are a starting point for disagreement, not a standard.</p>
</div>

## The fifteen established edges {#edges}

Cited in Appendix A of `briefs/07/28/regulation-graph-and-acceptability/v0.33.53__arch-brief__…every-paragraph-is-a-graph…` as the established set. Every one of them is a verb; every one is directed.

| Edge | Inverse | Reads as | Where the inverse comes from |
|---|---|---|---|
| `connected_to` | `connected_to` | A is connected to B | <span class="pill p-argued">symmetric</span> |
| `observed_on` | `bears_observation` | this evidence was observed on this system | <span class="pill p-argued">proposed here</span> |
| `backed_by` | `evidences` | this fact is backed by this evidence | <span class="pill p-argued">proposed here</span> |
| `measured_by` | `measures` | this fact is measured by this measure | <span class="pill p-argued">proposed here</span> |
| `grants` | `granted_by` | this role grants this capability | <span class="pill p-argued">proposed here</span> |
| `reaches` | `reachable_from` | this grant reaches this asset | <span class="pill p-argued">proposed here</span> |
| `enables` | `enabled_by` | this capability enables this action | <span class="pill p-argued">proposed here</span> |
| `exposes` | `exposed_by` | this fact exposes this blast radius | <span class="pill p-argued">proposed here</span> |
| `gives_rise_to` | `arises_from` | this vulnerability gives rise to this risk | <span class="pill p-ships">in the corpus</span> |
| `protected_by` | `protects` | this asset is protected by this control | <span class="pill p-argued">proposed here</span> |
| `conditional_on` | `conditions` | this control is conditional on this fact | <span class="pill p-argued">proposed here</span> |
| `defeated_by` | `defeats` | this control is defeated by this attack | <span class="pill p-argued">proposed here</span> |
| `owned_by` | `owns` | this system is owned by this role | <span class="pill p-ships">in the corpus</span> |
| `accepted_by` | `accepted` | this risk is accepted by this role | <span class="pill p-argued">proposed here</span> |
| `underwritten_by` | `underwrites` | this acceptance is underwritten by this role | <span class="pill p-argued">proposed here</span> |

::: warn
**One row is in tension with the site's own rule.** `connected_to` is the only symmetric edge in the set, and a symmetric edge with a broad verb sits uncomfortably close to [the one that is banned](index.html#banned). It survives because in the graphs that use it it means something specific — physically or logically attached — rather than “associated somehow”. Treat it as a last resort: wherever you can name what kind of connection it is, name it, and the query gets better. If you think it should be dropped from the set, [say so](../admin/comms.html).
:::

### Also used in the worked graphs {#also-used}

These appear in the browser-isolation graph and the 2FA graph but are not in the fifteen. They are listed separately rather than folded in, because folding them in would quietly enlarge a set somebody else cited.

| Edge | Inverse | Reads as |
|---|---|---|
| `impairs` | `impaired_by` | this risk impairs this asset |
| `emits` | `emitted_by` | this control emits this detection signal |

::: warn
**One name is deliberately absent, and its absence is a rule.** There is no generic association edge in this set. If you find yourself wanting one, the graph is telling you that you have not yet decided what the relationship is — [rule 1](index.html#banned).
:::

## Node types, from the worked graphs {#node-types}

Node types are more domain-specific than edges, so this is a worked example rather than a standard. These are the types in the two most complete graphs in the corpus.

### The risk / assurance chain <span class="small dim">— browser isolation, 59 nodes / 75 edges</span>

`Reality` · `Twin` · `Asset` · `Evidence` · `Measure` · `Fact` · `Grant` · `AuthorizationClosure` · `BlastRadius` · `Vulnerability` · `Risk` · `PreventiveControl` · `DetectiveControl` · `Owner` · `AcceptanceDecision`

`AuthorizationClosure` is the one to notice: the transitive union of every grant reachable over assume-role, pass-role and wildcard edges. It is called *the agentic union* — and for an agent, the closure is the rating floor, not the nominal grant. It is a node type that only exists because the graph can compute it.

### The instance graph <span class="small dim">— 2FA, 51 nodes / 53 edges</span>

`Risk` (9) · `Actor` (9) · `Evidence` (6) · `Interval` (6) · `Fact` (5) · `Impact` (3) · `System` (2) · `Vulnerability` (2) · `DataClass` (2) · `Asset` · `ThreatAgent` · `Attack` · `Obligation` · `Register` · `Twin` · `Agent`

[The 2FA graph in full →](../examples/2fa.html)

## The one that is actually running {#shipped}

Everything above is designed. One typed property graph in this project is **live repository data**: the issue tracker's own configuration — **12 node types, 10 verb/inverse edge types with domain and range constraints, 71 nodes and 141 edges** across 107 issue files, with edges stored bidirectionally.

It is the cheapest credibility on this site and the most instructive artefact on this page, for two reasons. It demonstrates that domain and range constraints on a verb pair are enough structure to be useful. And it ships the banned edge — which is what the rule looks like when nothing enforces it. [What ships, in full →](../shipped/index.html)

## Rules for extending this set {#rules}

1. **A new edge needs a sentence.** If you cannot write “A ⟨verb⟩ B” and have a person in that business say it out loud, it is not an edge yet.
2. **And its inverse needs a different sentence.** If the inverse is just the same sentence read backwards, you have one relationship where you thought you had two — check whether the direction you chose is the one with lower fan-out.
3. **Domain and range, stated.** Which node types may sit at each end. This is what makes a malformed graph detectable rather than merely wrong.
4. **No generic association edge, ever.** Not even temporarily. Temporarily is how the one in `link-types.json` got there.
5. **Prefer adding an edge to adding a validation rule.** Enrichment, not enforcement. The graph grows; it does not constrain.

::: agent
Use these fifteen verbs where they fit: `connected_to`, `observed_on`, `backed_by`, `measured_by`, `grants`, `reaches`, `enables`, `exposes`, `gives_rise_to`, `protected_by`, `conditional_on`, `defeated_by`, `owned_by`, `accepted_by`, `underwritten_by`. Each is directed and takes a distinct inverse. Do not invent a generic association edge. When you need a verb that is not here, name it as a sentence, state its inverse, state its domain and range, and mark it as an extension rather than folding it into this set.
:::
