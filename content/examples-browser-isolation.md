---
path: examples/browser-isolation.html
title: Whose session is the agent using? — graphs.sgit.ai
description: A 59-node, 75-edge risk graph answering whether an AI agent should browse inside the user's own browser or an isolated one — as computed reach rather than adjectives, including three risks created by the mitigation itself.
og_title: Whose session is the agent using?
og_description: 59 nodes, 75 edges, five stakeholder altitudes, and an answer that is a computed closure difference a buyer can check rather than a claim they have to trust.
crumb: Browser isolation
parent: Worked graphs|index.html
prev: ← All worked graphs|index.html
next: The 2FA graph →|2fa.html
---
# Whose session is the agent using?

The best single artefact here for the question *why is a graph better than a slide?* — because the answer it produces is a computed difference a buyer can check, not an adjective they have to trust.

::: meta
Graph:: **59 nodes · 75 edges**, complete inline JSON <span class="pill p-argued">parsed from the brief</span>
Live sibling:: [The published vault](https://sgit.ai/demos/vaults/agentic-browser-isolation/) — 17 entry points, 5 altitudes, ~70 JSON files <span class="pill p-live">live</span>
Source:: `briefs/07/12/worked-business-case/v0.33.48__briefing__…five-levels-graph.md` · 4,601 words · 12 July 2026
Evidence:: Designed, not deployed — but the graph is a real parseable artefact and every external claim carries a public URL (seven of them: browser-agent prompt-injection research, arXiv 2505.13076, vendor system cards)
Licence:: CC BY 4.0. Vendor-anonymous, no customer, no personal data; carries its own “not legal advice” note
:::

## The question {#question}

An AI agent that browses the web and acts on what it finds has to run *somewhere*. Two options:

<div class="split" style="padding:0">
<table>
<thead><tr><th>Option A — the user's own browser</th><th>Option B — an isolated browser with a scoped identity</th></tr></thead>
<tbody><tr>
<td>Inherits the user's live, already-past-MFA sessions, their desktop, their network position, their extensions, their cookies. Nothing to set up.</td>
<td>Starts with nothing. Whatever it can reach, somebody had to grant it deliberately.</td>
</tr></tbody>
</table>
</div>

Everyone can argue this in adjectives — “safer”, “more convenient”, “enterprise-grade”. Nobody wins those arguments, and nothing is checkable afterwards.

## The graph's answer: reach is computed, not asserted {#answer}

The graph replaces the adjective with a node type. `AuthorizationClosure` is the transitive union of everything a given identity can reach by following grants — including grants reached *through* other grants. Compute it for both options and subtract.

```path
[Agent] -grants-> [Grant] -reaches-> [Asset] -exposes-> [BlastRadius] -gives_rise_to-> [Risk] -owned_by-> [Owner] -accepted_by-> [AcceptanceDecision]
say: One path, walked from a browser setting all the way to a person who has to sign. The brief walks exactly this for risk R1 — from a web page to the board.
```

::: claim
“What isolation changes” stops being a claim and becomes a closure difference: these assets are reachable in A and not in B. A buyer can check it against their own estate.
:::

## The shape of the graph {#shape}

**Node types.** `Reality` · `Twin` · `Asset` (4) · `Evidence` (6) · `Measure` (4) · `Fact` (5) · `Grant` (2) · `AuthorizationClosure` (2) · `BlastRadius` (2) · `Vulnerability` (6) · `Risk` (13) · `PreventiveControl` (3) · `DetectiveControl` · `Owner` (7) · `AcceptanceDecision` (2)

**Edge types.** `backed_by` · `observed_on` · `measured_by` · `grants` · `exposes` · `reaches` · `impairs` · `gives_rise_to` · `owned_by` · `protected_by` · `conditional_on` · `emits` · `accepted_by` · `underwritten_by` · `connected_to` — [the edge set](../grammar/edge-set.html)

The seven owners are the interesting count: IT → CISO → CFO / COO / DPO → CEO → Board. Five altitudes, and the escalation between them is **a property of the edges, not of a workflow rule**. Nobody escalates anything. A risk arrives at the CFO because the path from it leads there and nobody below has accepted it.

## Three risks *of the mitigation* {#honest}

Thirteen risks, and three of them are risks created by isolation itself. This is the detail worth stealing.

A slide comparing two options never lists the harms of the option it is recommending, because a slide has a direction. A graph does not: a risk node arising from a control node is the same shape as any other risk node, so it gets drawn, gets an owner, and needs accepting. **Honesty is not a discipline you have to remember here; it is what the structure produces if you do not go out of your way to suppress it.**

## What it teaches {#teaches}

- **Reach is computed, not asserted** — a table lists permissions; only a closure tells you what they reach.
- **Escalation without an escalator** — the board is reached by a path, not by somebody deciding to raise it.
- **The mitigation is in the graph too** — which is what stops a risk assessment from being a sales document.
- **Every external claim carries a URL** — the seven public sources are nodes, so “where did this come from?” is a traversal.

::: agent
When comparing two deployment options for an agent, do not compare adjectives. Compute the **authorization closure** of each — the transitive union of every grant reachable over assume-role, pass-role and wildcard edges — and report the difference. For an agent, the closure is the rating floor, not the nominal grant. And model the risks created by the mitigation as first-class risk nodes.
:::
