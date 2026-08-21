---
path: examples/2fa.html
title: The 2FA instance graph — graphs.sgit.ai
description: A 51-node, 53-edge instance graph carrying two admin accounts without 2FA from a single configuration fact to the board and the regulator — the only artefact that is both a complete narrative and a machine-readable file.
og_title: The 2FA instance graph — 51 nodes, 53 edges, in one file
og_description: It declares its own modelling principles inside the JSON: meaning comes from connectivity not properties; facts only in phase one; every edge directed with a named inverse; every change cascades to the register.
crumb: The 2FA graph
parent: Worked graphs|index.html
prev: ← Browser isolation|browser-isolation.html
next: Article 26(5) →|article-26-5.html
---
# The 2FA instance graph

The only artefact here that is **both a complete narrative and a machine-readable file**. One configuration fact, two admin accounts without 2FA (two-factor authentication), carried through the wrong acceptor, a governance air gap, a five-whys chain, and up to the board and the regulator.

::: meta
Graph:: **51 nodes · 53 edges** plus an `acceptances` block, as one standalone parseable JSON file <span class="pill p-argued">parsed from the brief</span>
Ontology:: **22 node classes, 34 edge-type rows** in the companion brief
Source:: `briefs/06/26/semantic-graph-and-query-paths/v0.33.35__data__sg-send-2fa-mappings.json` and four companion briefs · 26 June 2026
Licence:: The file carries `"license": "CC BY 4.0"` as a top-level field, the pattern this project uses for JSON artefacts
:::

::: warn
**The file is not mirrored here yet.** The JSON lives in the source repository, which is not public. Publishing it as a download, with its ontology brief beside it, is task T1 on [the comms board](../admin/comms.html) (the project's public task list) and the single highest-value thing this book's companion site could add. Until it is there, this chapter describes the file rather than pretending to serve it.
:::

## It declares its own principles, inside the data {#principles}

This is the detail that makes the file worth studying even before you can download it. The JSON carries its modelling rules as data, next to the nodes they govern:

- **“meaning comes from connectivity, not properties”**
- **“facts only in phase one”**, meaning nothing hypothetical enters the graph
- **“every edge is directed and has a named inverse”**
- **“every change cascades to the register”**

A schema states what is allowed. This states what the author was *trying to do*, in a place where anyone reading the data will see it. That is provenance applied to the modelling decisions themselves, and it costs four lines.

## What is in it {#shape}

`Risk` (9) · `Actor` (9) · `Evidence` (6) · `Interval` (6) · `Fact` (5) · `Impact` (3) · `System` (2) · `Vulnerability` (2) · `DataClass` (2) · `Asset` · `ThreatAgent` · `Attack` (MITRE ATT&CK technique T1110.004, credential stuffing) · `Obligation` · `Register` · `Twin` · `Agent`

The chain, walked as a sentence:

```path
[2FA not enforced] -backed_by-> [config export] · [the same fact] -gives_rise_to-> [credential stuffing] -impairs-> [customer data] -gives_rise_to-> [regulatory exposure] -accepted_by-> [the wrong person]
say: The finding is the last hop. The risk *was* accepted, by somebody without the authority to accept it. A register records that an acceptance exists. The graph records who, and lets you ask whether that person's authority reaches this impact.
```

It blooms outward through confidentiality, integrity and availability, so one configuration fact produces three different impact chains reaching three different owners, which is the thing a single risk row in a spreadsheet flattens away.

## The mechanic worth stealing: there is no deny button {#no-deny}

Six `Interval` nodes: **1 hour · 4 hours · 2 days · 2 weeks · 1 month · 6 months**.

A real risk is never denied. It is **accepted for an interval**, by a named person, after which it comes back. That is a small change with a large effect, and it works because of what each option does to the person facing it:

|  | Deny | Accept for an interval |
|---|---|---|
| What it feels like | An argument you have to win | A decision you can make today |
| What it records | Nothing; the risk stays open and unowned | Who accepted it, at what altitude, until when |
| What happens next | It is re-raised by whoever cares most, eventually | It returns on a date, automatically, to the same person |
| Failure mode | Risks accumulate in a register nobody reads | Somebody has to keep choosing an interval, which is visible |

The same graph shows a **governance air gap**: a risk not connected to the register at all. Not denied, not accepted: unconnected. [A named absence beats a hidden one →](../depth/boundaries.html#air-gap)

## What it teaches {#teaches}

- **An instance graph is small.** Fifty-one nodes is one screen, and it carries a complete argument from a config setting to a regulator.
- **Acceptance is an edge, not a status field.** Which is what lets you ask whether the acceptor's authority actually reaches the impact.
- **Intervals beat verdicts.** Six of the fifty-one nodes are just durations, and they change the behaviour of the whole system.
- **Machine-readable is a different kind of proof.** Anyone can query it and disagree with the specific edges, which is the point.

::: agent
Model a risk acceptance as an edge to a named actor plus an interval node, not as a status property; then the question “was this accepted by someone whose authority reaches this impact?” becomes a traversal instead of a judgement. Never emit a denial: emit an acceptance bounded by an interval, or an explicit unconnected node if nobody has accepted it.
:::
