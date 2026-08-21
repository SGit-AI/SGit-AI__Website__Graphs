---
path: examples/index.html
title: Worked graphs, with real numbers — graphs.sgit.ai
description: Ten real applications of the graph discipline: browser isolation (59/75), the 2FA instance graph (51/53), Article 26(5), AWS IAM closures, browser extensions, the EU AI Act regulation graph (1,523/1,944, live) and more.
og_title: Worked graphs, with real numbers
og_description: Three are live and public — you can open them and count. The rest are parsed from their design documents. The two are never mixed.
crumb: Worked graphs
parent: 
prev: ← The edge set|../grammar/edge-set.html
next: Browser isolation →|browser-isolation.html
---
# Worked graphs, with real numbers

Twenty applications exist; ten are summarised here and three have their own pages. Each entry says what the graph shows that a table cannot — because if the answer to that is nothing, the graph was not worth building.

::: note
**How to read the numbers.** Three of these artefacts are <span class="pill p-live">live</span> and public: you can open them and count for yourself. The rest are <span class="pill p-argued">parsed</span> from their design documents — the graph is real and complete in the brief, but nothing has been deployed. The two are never mixed, and a number here always says which it is.
:::

## Already live and public {#live}

These three are published vaults on the parent site. This site links, explains and teaches from them rather than rebuilding them.

<div class="cards">
<a class="card" href="https://sgit.ai/demos/vaults/regulation-graph/">
<div class="tag">live vault</div>
<h3>The EU AI Act regulation graph</h3>
<p><b>1,523 nodes · 1,944 edges.</b> 113 articles, 500 paragraphs, 417 points, 180 recitals, 13 annexes, 68 definitions. Eleven views including a Cytoscape article graph, a SQLite interface, an RDF/Turtle export and an Article 9 Lab with a graph REPL. Parsed deterministically from official Formex XML; every element hash-verified to source bytes.</p>
<span class="go">Open the vault ↗</span>
</a>
<a class="card" href="https://sgit.ai/demos/vaults/risk-graph-explorer/">
<div class="tag">live vault</div>
<h3>Risk Graph Explorer</h3>
<p><b>18 facts · 37 risks · 14 provisions</b> in the “Exposed” preset. Seven views recomputed simultaneously. Amber is exposure, green is assurance, <b>ghosted edges are unanswered</b>. Requests <code>permissions: {}</code> — no network, no storage, entirely client-side, and you can check that in the network panel in ten seconds.</p>
<span class="go">Open the vault ↗</span>
</a>
<a class="card" href="https://sgit.ai/demos/vaults/agentic-browser-isolation/">
<div class="tag">live vault</div>
<h3>Agentic browser isolation</h3>
<p><b>17 entry points</b>, five stakeholder altitudes from IT to the board, acceptance-gated escalation with <b>no deny button</b>. Around 70 JSON files; 104 files, 2.4 MB, 4 commits; <code>fs.write: []</code>.</p>
<span class="go">Open the vault ↗</span>
</a>
</div>

## The three with their own pages {#detailed}

<div class="cards">
<a class="card" href="browser-isolation.html">
<div class="tag">59 nodes · 75 edges · start here</div>
<h3>Whose session is the agent using?</h3>
<p>Should an agent that browses and acts run inside the user's own browser — with their live post-MFA sessions — or in an isolated one with a scoped identity? Answered as <b>computed reach</b>, not adjectives. Includes three risks created <em>by the mitigation</em>.</p>
<span class="go">Read it →</span>
</a>
<a class="card" href="2fa.html">
<div class="tag">51 nodes · 53 edges · machine-readable</div>
<h3>The 2FA instance graph</h3>
<p>Two admin accounts without 2FA, carried from one configuration fact to the board and the regulator. The only artefact that is both a complete narrative and a parseable file — and it declares its own modelling principles inside the JSON.</p>
<span class="go">Read it →</span>
</a>
<a class="card" href="article-26-5.html">
<div class="tag">9 questions · 5 unanswered</div>
<h3>Article 26(5), fact to board and back</h3>
<p>One EU AI Act provision, one deployment, carried from a running system up to a board decision and back down. The output of the exercise is not the risks — it is the five questions nobody could answer.</p>
<span class="go">Read it →</span>
</a>
</div>

## And seven more {#more}

### AWS IAM configuration risk <span class="pill p-argued">24 nodes / 18 edges in the worked instance</span> {#aws-iam}

Six layers, roughly 31 node types, **20 edge types each with a named inverse — 40 readings — and 7 node type formulas.** The point is to compute rather than assert whether a configuration is a risk:

```path
[PublicExposure] becomes a [Vulnerability] only once -contains-> [DataClassification > public] and -exposes-> [real BlastRadius]
say: A public bucket is a Fact. It is a Vulnerability only when an upward path to a real risk exists. Every practitioner recognises the false-positive problem this dissolves.
```

The standout node type is `AuthorizationClosure` — the transitive union of every grant reachable over assume-role, pass-role and wildcard edges, called *the agentic union*. For an agent, that closure is the rating floor, not the nominal grant. [Node type formulas →](../depth/index.html#formulas)

### Browser extensions and the read-content closure <span class="pill p-argued">designed</span> {#extensions}

“Allow this extension to read the content of the pages you visit” quietly grants the authorization closure of **every site you are currently logged into**.

The graph is queryable in both directions, and that is the whole demonstration: walk *out* from the extension to the AWS console, the email, the CRM it reaches — or walk *back in* from “how could my email be attacked?” to the extensions that expose it. Two different tables. One graph. Everybody has browser extensions, which makes this the highest relatability-to-length ratio in the material and a strong candidate for a first “aha”.

### The customisation inversion <span class="pill p-live">live</span> {#regulation}

Every compliance tool hands you the whole standard and asks you to strike out what does not apply. Invert it: **nothing is relevant until your facts attach.** The customised standard starts from nothing and accretes — which is impossible to express as a document and trivial to express as a graph.

Two results worth carrying away. Amendments are **native graph operations**, not migrations: repealed provisions are marked `repealed_from`, never deleted. And a finding becomes arithmetic — **30 days retained against Article 26(6)'s six-month minimum** is a breach the graph *computes* from a fact plus a provision, which makes it the most defensible finding in the graph rather than the most arguable.

### The Permissions Bill of Materials <span class="pill p-argued">designed</span> {#pbom}

SBOM, but for permissions — and the argument for it is one sentence: **permissions gate exploitability.** A vulnerability does not matter if the account lacks the permissions to weaponise it. The PBOM carries the four things an SBOM misses: intent, blast radius, compounding, and reachability. Designed to augment CycloneDX, SPDX, VEX and AIBOM rather than replace them.

### Published incidents, mapped <span class="pill p-argued">designed</span> {#incidents}

Real, sourced, published AI-agent incidents turned into graph instances against a common ontology: the capability that made the harm possible, the control present or bypassed, who authorised the access and when, the blast radius opened, the worst case the same access allowed, malicious versus not, confidence — and **evidence gaps** as a first-class field.

### Fractal risk registers <span class="pill p-argued">18 nodes / 31 edges</span> {#registers}

One register per accepting role, in that role's own language, with relevance fading as you move away from the reader's altitude. Both graphs in this pair validate clean — zero dangling edges, zero orphan nodes.

The interesting part is a defect its own authors declared: *“Neither grounds to a Reality node through a Twin. Both are structural topology graphs rather than evidence-grounded risk graphs… a departure from the standing convention.”* A graph about graph discipline that admits where it broke discipline is a better teaching artefact than a clean one.

### The 10,000-hours citation network <span class="pill p-argued">external case</span> {#ten-thousand}

**242 papers, more than 200,000 supporting citation paths, traced back to nothing.** The best non-technical story here and the clearest case for corrections propagating through a graph. [On the front page](../index.html#hook), and [the rule it produces](../depth/index.html#supersede).

## What is deliberately not here {#not-here}

::: warn
Two worked examples exist and are not published, for reasons that have nothing to do with the licence:

- A **LinkedIn network graph** built from a real export. It contains real personal data about third parties. That is a data-protection question, not a licensing one, and the answer is no.
- A **case study naming a real third-party product** and analysing its security posture. The sources are public and the tone is fair — it is complimentary about the target's privacy engineering — but it is the one item an external party could reasonably object to, and it needs a legal read first.
:::

::: note
**And one thing this site would like to ship and has not.** The best interactive demo in the material is a **personal risk question graph**: six questions, each answer typed as fact, opinion, hypothesis or evidence, and you watch your own risk graph build itself — browser storage only, no backend, no account, no LLM required. It is [task T3 on the comms board](../admin/comms.html), and it is not built. Saying so is cheaper than implying it exists.
:::

::: agent
The three published artefacts are at `sgit.ai/demos/vaults/{regulation-graph, risk-graph-explorer, agentic-browser-isolation}/` and their counts are verifiable by fetching them. Every other number on this page is parsed from a design document and is not deployed — when summarising this material, carry that distinction, because the corpus itself does.
:::
