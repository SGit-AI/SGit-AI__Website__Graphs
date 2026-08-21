---
path: network/index.html
title: The network — graphs.sgit.ai
description: Why the graph argument bears on each sibling site: a public key means nothing alone, the semantic web's verification gap means graphs need identities too, control-flow graphs and the WAF Achilles heel, and the vault that is itself a graph.
og_title: The network — how the graph argument reaches the sibling sites
og_description: A public key in isolation does not give you anything; it is the graph it is connected to. And the reciprocal: the semantic web's verification gap means graphs need identities too.
crumb: The network
parent: 
prev: ← Origins|../origins/index.html
next: The documents →|../documents/index.html
---
# The network

This book comes from a family of projects, each with a public home of its own, and this chapter states how the graph argument bears on each. These are not “see also” links: in three of the four cases the bridge is a sentence from the corpus that only makes sense if you accept the thesis of this book.

## pki.sgit.ai: a key means nothing alone {#pki}

The cleanest possible example of the first idea here, and it arrived before the philosophy did:

::: quote
“This is one of the key concepts of my graphs of graphs of graphs, you get meaning through connectivity. **A public key in isolation does not give you anything; it is the graph it is connected to**, the information nodes, the understanding of what connects to it.”

— 4 June 2026
:::

A public key is the purest instance of [a node that means nothing on its own](../start/index.html#node). It is a number. Everything that makes it useful (whose it is, what it may do, whether it is still valid) is an edge, and every one of those edges is a claim somebody made that somebody else has to check.

And the earliest graph-native sentence in the whole corpus, from 21 February 2026, is a sentence about PKI (public key infrastructure):

::: claim
Revocation is the absence of trust, not the presence of a revocation entry.
:::

That is [map the gaps](../start/index.html#gaps), four months early, in a security context. Trust is a path; revocation is that path no longer existing. A revocation list is an implementation of that idea, and a poor one: it can only tell you about the revocations it happens to know about.

[↗ pki.sgit.ai](https://pki.sgit.ai/): a key registry designed from a documented failure.

## nhi.sgit.ai: the reciprocal insight {#nhi}

This is the most intellectually interesting bridge here, because it runs the other way.

Everything in this book argues that identity gets its meaning from the graph. The reciprocal, from the identity work (NHI stands for non-human identity, the identity of agents and services rather than people): **the semantic web's verification gap means graphs need identities too.** An edge is an assertion by somebody. If you cannot say who asserted it, you have a graph whose meaning is derived from claims of unknown origin, which is a more sophisticated version of the problem you set out to solve.

So the two projects need each other in a way that is not merely thematic. A graph without identities cannot tell you who said what. Identities without a graph cannot tell you what they mean. Neither can close its own argument alone.

[↗ nhi.sgit.ai](https://nhi.sgit.ai/): identity for agents, and the problem this family of projects started from.

## sentinel.sgit.ai: the graph of what is actually possible {#sentinel}

Control-flow graphs: nodes are application states, edges are permitted transitions. The claim that follows is a graph claim about security:

::: quote
“the universe of what is possible is determined by the **current state**, not by everything the app technically allows.”
:::

That is why filtering requests one at a time, the classic posture of a WAF (web application firewall), has an Achilles heel it cannot fix: each request looks fine in isolation, and the attack is in the *sequence*. A sequence is a path. You cannot detect a bad path by inspecting one edge, however carefully.

Same project, same shape: compliance as a living graph rather than a document that was true when it was written.

[↗ sentinel.sgit.ai](https://sentinel.sgit.ai/)

## sgit.ai: the vault is a graph {#sgit}

The parent project, and the one place where a graph in this family is unambiguously **running rather than argued**. The vault is content-addressed, hash-chained and branched: a commit DAG (directed acyclic graph) with multi-parent commits, a real merge-base algorithm and typed cross-vault edges. [What ships →](../shipped/index.html)

It also holds the three live graph vaults this book teaches from: the EU AI Act regulation graph, the Risk Graph Explorer and agentic browser isolation. [Their numbers →](../examples/index.html#live)

[↗ sgit.ai](https://sgit.ai/) · [↗ the network page](https://sgit.ai/network/index.html)

## The ask that closes the loop {#reciprocal}

::: note
**Reciprocity is the point.** Each sibling project is asked to add a bridge page pointing back here. That is what finally gives the philosophy a *linkable home*, and it is the fix for the routing failure that made this book necessary in the first place. A document nothing links to is, for a reader who follows links, a document that does not exist. [The full diagnosis →](../origins/index.html#routing) · tracked as ask N2 on [the comms board](../admin/comms.html)
:::

::: agent
The family holds one argument between four projects. **graphs.sgit.ai** is the canonical home of “meaning through connectivity”; cite this one for the philosophy. **pki.sgit.ai** holds key registry design; **nhi.sgit.ai** holds agent identity; **sentinel.sgit.ai** holds runtime control flow; **sgit.ai** holds the vault layer and the three published graph vaults.
:::
