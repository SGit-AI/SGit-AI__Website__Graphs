---
path: examples/article-26-5.html
title: Article 26(5), fact to board and back — graphs.sgit.ai
description: One EU AI Act provision, one deployment, carried from a running system up to a board decision and back down. Nine question nodes, five of them unanswered — and the unanswered five are the actual output of the exercise.
og_title: Article 26(5) — the output is the five questions nobody could answer
og_description: Eight facts, one deliberately unevidenced. A 2x2 whose bottom row is empty, and the emptiness is the finding. Every invented element marked as invented.
crumb: Article 26(5)
parent: Worked graphs|index.html
prev: ← The 2FA graph|2fa.html
next: Wardley maps as graphs →|../maps/index.html
---
# Article 26(5), fact to board and back

One provision of the EU AI Act. One concrete deployment — a creditworthiness agent. Carried from a running system all the way up to a board decision, and then back down. The most complete single chain in the material, and the one whose output is an absence.

::: meta
Graph:: 1 Reality · 1 Twin · **8 Facts** (one deliberately unevidenced) · 7 Evidence (one absent) · 5 Provisions · 3 Vulnerabilities · 5 Risks · 4 stakeholder altitudes · 3 Decisions (+1 deliberately absent) · **9 Questions, 5 unanswered** · 2 Projects (+1 unfunded)
Source:: `briefs/08/02/vault-as-substrate/v0.33.55__arch-brief__…article-26-5-creditworthiness-agent-fact-to-board.md` · 4,272 words · 2 August 2026
Evidence:: Designed, honestly. The organisation is invented and **every invented element is marked as invented.** The Act provisions are verified against five external sources
Live sibling:: [The regulation graph](https://sgit.ai/demos/vaults/regulation-graph/) — 1,523 nodes / 1,944 edges <span class="pill p-live">live</span>
:::

## The output is the five questions nobody could answer {#output}

Nine question nodes. Five unanswered. The brief calls those five *“the actual output of the exercise”*, and that sentence is the reason this example is here.

Run the same exercise as a document and you get a report whose unanswered questions are, at best, a section near the end that nobody actions. Run it as a graph and each unanswered question is a **node**: it has a name, it can be assigned, it can be counted, and — because it is connected — you can ask what conclusions are currently resting on *not* knowing it.

<div class="epal">
<span><i class="assurance"></i> green — assurance</span>
<span><i class="exposure"></i> amber — exposure</span>
<span><i class="unanswered"></i> ghosted — <b>unanswered</b>, drawn rather than omitted</span>
</div>

Eight facts, and one of them deliberately carries no evidence. Seven pieces of evidence, and one of them is deliberately absent. Three decisions, and a fourth deliberately missing. **The absences are authored.** They are the part of the model that a register cannot hold and a graph can.

## The 2×2 whose empty row is the finding {#quadrant}

Four quadrants: accepted or not, against acceptable or not.

|  | Acceptable | Not acceptable |
|---|---|---|
| **Accepted** | Fine. This is what governance is supposed to produce. | A known bad decision, on the record, with a name on it. Rare and survivable. |
| **Not accepted** | *empty* | *empty* |

The bottom row is empty, and **the emptiness is the finding**: there is no mechanism by which a risk gets to be *not accepted*. Nothing is denied; things simply are not accepted, silently, by nobody, forever. You cannot see that in a risk register — a register has rows, and an absent row looks like nothing at all.

## Escalation without an escalator {#escalation}

The line worth quoting from the source, on what the graph shows that a register cannot:

::: quote
R3 reaches the CFO because **nobody accepted it** — not because anybody raised it.
:::

That is a structural property. Acceptance is an edge; where the edge is missing, the path keeps going upward until it reaches somebody whose authority covers the impact. No workflow rule, no escalation policy, no reminder email. The absence of an acceptance *is* the escalation.

And a second dimension the same graph makes first-class: **recoverability**. *“the money can be refunded; the customer cannot be un-declined.”* Two risks with similar financial magnitude and completely different shapes — a distinction that a single severity score erases and an edge preserves.

## A finding that is arithmetic {#arithmetic}

From the same body of work, the cleanest demonstration that a graph can *compute* a compliance breach rather than assert one: a system retains logs for **30 days**; Article 26(6) requires a **six-month minimum**. Fact plus provision produces a vulnerability by computation.

Which makes it, in the brief's own words, **the most defensible finding in the graph** — there is nothing to argue about except the two inputs, and both are checkable.

## One structure, four views {#views}

Four stakeholder altitudes, each rendered as its own register from the same chain. *“nothing is duplicated; each view is a query over one structure.”*

This is the practical payoff of [documents as projections](../depth/boundaries.html#projections). The four registers are not four documents that have to be kept in sync. They are four queries, and they cannot drift apart, because there is only one thing there.

::: agent
When mapping a provision to a deployment, emit **question nodes for what you could not determine** and mark facts that carry no evidence as unevidenced — do not fill either in. The unanswered set is the output. And prefer a finding that is arithmetic over one that is an opinion: fact plus provision produces a vulnerability by computation, and that is the finding nobody can argue with.
:::
