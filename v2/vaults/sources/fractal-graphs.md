# Fractal Semantic Graphs — sgit.ai

> What a Fractal Semantic Graph is: every node opens into a semantic graph with its own ontology, joined to the worlds above and below by named edges, down to the word; why that lets everything connect with everything without forcing anyone to share a schema; and the evidence: seven published vaults from the text of a law to a threat in one method on one compute instance, with screenshots, counts, and the rungs still modelled rather than imported.

*Source: <https://sgit.ai/demos/fractal-graphs/index.html> · site v0.2.95 · this file is generated from the same content as the page, so the two cannot drift. Every page on this site has a `.md` twin; internal links below point at them.*

---

[Home](../../index.md) / [Vaults](../vaults/index.md) / Fractal Semantic Graphs

# Fractal Semantic Graphs

A **semantic graph** is nodes joined by edges that mean something: every edge a verb, read in both directions. A **fractal** semantic graph is one where **every node opens into a semantic graph of its own, with its own node types, its own verbs, its own ontology**, and so does every node inside that, down to the smallest thing that still matters to the question you are asking. In most of our work that smallest node is a word, a number or a symbol. What stays constant between the worlds is not the schema but the grammar: edges are verbs, meaning lives in connectivity, every claim keeps its provenance. That is what lets everything connect to everything without anyone being forced to share a schema. For a long time we called this *graphs of graphs of graphs*, or *ontologies of ontologies of ontologies*. This page defines it, shows it, and then proves it with seven published vaults you can open.

## What a Fractal Semantic Graph is

Most visitors here already know three of the four words. A **graph** is nodes and edges. A **semantic graph** gives the edges meaning: `arises_from`, `evidenced_by`, `owned_by`, each with a named inverse, so a link reads correctly from whichever end you stand at. An **ontology** is the agreed vocabulary of node types and verbs a graph is allowed to use. The fourth word is the new one.

**Fractal** means the graph has no privileged level and no single schema. Zoom into any node and you enter a new world: its own node types, its own verbs, its own taxonomy, its own centre of gravity. A regulation is a node in a graph of instruments and jurisdictions; open it and it is a graph of articles, recitals and amendments, a legal ontology; open an article and it is a graph of paragraphs and points; open a paragraph and it is a graph of the terms it uses, each an edge from the article that defines it, a lexical ontology nothing like the one two levels up. Each of these worlds was defined by whoever owns it, in its own vocabulary, and none was made to conform to the others. What connects them is that each is still a semantic graph, every edge a verb with an inverse and every node traceable to its source, so an edge can be drawn from any node in one world to any node in another. There is no top and no bottom, only the altitude you happen to be looking from, and how much definition you choose to load at it.

*[diagram]*

The test for the word is what happens at a link. Start inside one world, a risk register. It is already a rich semantic graph with a large vocabulary of verbs, each carrying meaning: a fact `gives_rise_to` a risk, a risk `is_owned_by` a role, a person `reports_to` a person, a control `mitigates` a risk, evidence `backs` a fact. Every link that makes sense inside that ontology teaches you something, and the knowledge accumulates one link at a time; a register with ten thousand well-named edges is a great deal of knowledge. Nothing about it is fractal yet. It is one graph, however large and however deeply it nests, in one vocabulary. A system that never lets you leave that vocabulary is a single graph, or a hierarchy, and not a fractal.

**The fractal property is that on one of those links you can jump into another universe.** Follow the register's *fact* node for an incident and you land in the security operations world: alerts, signals, the systems that were touched, ATT&CK techniques, attack trees, its own verbs and its own taxonomy, none of them borrowed from the register. In that world you meet a DNS entry that looks like command-and-control; follow it and you are in the DNS estate: zones, records, parents, values, every request the resolvers logged, a dataset perhaps millions of nodes large and quite possibly served through an abstraction layer over a SQL database, a graph database or a GraphQL endpoint rather than held as files. Follow one record to the traffic it produced and you are reading network captures, flows and a single TCP packet, in yet another vocabulary. Four worlds, four ontologies, four taxonomies, and one continuous path of named edges between them.

*[diagram]*

**What makes it fractal rather than merely linked** is that in every one of those self-contained worlds you find the same building blocks: nodes, edges with verbs and inverses, an ontology, a taxonomy, triplets, provenance. The grammar is what lets the jump work, in either direction, without an adapter. And it runs upward as well as down: everything just described can itself be one node in a larger graph that analyses it, next to graphs of behaviour, of agentic actions, of agendas, of funding. Even the schema can be fractal, in the way the Mandelbrot set is one formula whose structure repeats at every zoom: graphs composed from graphs, with properties of their own, treated as a graph all the way up.

**Every connection you follow should teach you something.** Even when the answer is *nothing to see here*, you now know that door was empty, and that is knowledge too. Whether a link added value is for the observer, or the query, to decide; the graph's job is to make the link available and keep its provenance. The more granularity you can reach, the better your representation of reality and the better the decisions and the understanding built on it. But granularity is chosen per context: you load as much as this question needs and no more, because the rest stays one edge away. Custom views built on top of the whole, each showing one context at one granularity, are what make all of this scale.

**Nobody is forced to conform.** An organisation, a division, a team, a single person, a regulator can each define their own world in their own vocabulary, and connect to everyone else's by drawing edges rather than by adopting a shared schema. [graphs.sgit.ai](https://graphs.sgit.ai/v1/depth/index.html) puts it as three layers: shared facts owned by nobody, per-party formulas, declared bridges between them.

## Why connect everything with everything

Because in our world **everything is already a graph, and so is every file format.** A regulation is a graph of articles; a PDF of that regulation is a graph of pages, blocks, lines and glyphs; a spreadsheet is a graph of sheets, rows, cells and formulas; a codebase is a graph of packages, classes, methods and tokens; a JSON document is a tree, which is a graph with one verb. None of them needs to be *converted into* a graph; each only needs its edges named. Once they are, the boundaries between formats stop mattering, and four things become possible that no document can do:

- **A question can cross formats without a join table.** *Which method in our code implements the control that the crosswalk maps to the article the amendment changed?* is one traversal, word in a law to control in a standard to attestation to method, because each step is an edge somebody named. The [AIUC-1 vault below](#standard) does exactly the first half of that walk, into a second vault, and finds eight amended articles nobody had noticed.
- **A correction propagates instead of being republished.** Mark one node superseded and every path that rested on it becomes a query (*what did we build on this?*) rather than an archaeology project. A document cannot do this: the correction is a new document, and nothing connects it to the thousand that already cite the error.
- **The smallest node is whatever your question needs, not what the format offers.** For a lawyer it is the defined term. For a threat model it is the method. For a conformance check it is the attestation and its expiry date. For the atlas below it is, literally, the word. Because every word is a node, *foreseeable* in Article 9(2) can be one edge from the ruling that decided what it means.
- **Every unit keeps its own world.** A regulation is modelled in a regulator's vocabulary, a risk register in the risk team's, a threat model in the engineers', and none of them is asked to change. The bridges between them are edges somebody declares (`crosswalks_to`, `evidenced_by`, `mitigates`), not a merged schema everybody has to agree on first. That is why the ladder below can have eleven rungs from seven authors and still be one traversal.
- **Provenance comes free.** When the leaf is a word and the word is connected to the byte range it came from and the hash of the file that held it, every claim at every altitude above it is traceable to source without any additional machinery. The Regulation Graph below ends every provenance chain in a SHA-256 of the retrieved bytes for exactly this reason.

The one discipline that makes “everything with everything” useful rather than noise is that **the edge has to be a verb**. `relates_to` is banned, because two things always relate; an edge with no verb constrains nothing and cannot narrow a query. The granularity of the verb is the precision of the question you can later ask.

## Four words, one of them new

| Word | What it adds | Where it stops |
|---|---|---|
| **Graph** | Nodes and edges | The edges mean nothing in particular |
| **Semantic graph** | Every edge is a verb with a named inverse; meaning is in connectivity, not in properties | One level: the nodes are atoms |
| **Ontology** | The agreed vocabulary of node types and verbs | One ontology per domain; joining two by merging them is a project that usually fails |
| **Fractal Semantic Graph** | Every node opens into a semantic graph with its own ontology, at every altitude, down to the word; ontologies are joined by declared edges, never merged: an ontology of ontologies | Where somebody has not yet named the edges between two worlds. That is a gap, and it is listed below |

## How far down does the graph go?

All the way. One grammar, eleven ontologies: from the text of a regulation, through a standard's controls, through a risk and the person who accepts it, down to a threat in one line of code on one compute instance, each rung modelled in its own vocabulary by its own author, and every one joined to the next by a named edge. The rest of this page is the evidence: **seven published vaults and three sibling sites**, each a live fractal semantic graph at a different altitude, every one openable with the read key printed on its page.

## The ladder, and who covers which rung

Eleven altitudes, eleven ontologies, one grammar. The left column is the level of the world being described; the right column names the published vault in which that level is a live graph; each name is a link to that vault's page, where its read key is. No two rungs share a schema: a regulation's articles, a standard's controls, a register's risks and a threat model's methods were each modelled by their own author in their own vocabulary. What they share is the grammar, which is why one traversal can cross all eleven.

*[diagram]*

## The grammar that survives every zoom, in full

Each altitude gets its own schema; what none of them gets to change is the grammar. It is published on [graphs.sgit.ai](https://graphs.sgit.ai/v1/grammar/index.html) and it is short: **every edge is a verb**, stated in both directions with an inverse a person in the business would actually say (`gives_rise_to` / `arises_from`, `evidenced_by` / `evidences`); **`relates-to` is banned**, because an edge with no verb carries no constraint and cannot narrow a query; **properties carry data, never meaning**, so two nodes both holding `8080` differ only in what they are connected to; **supersede, never delete**, so a correction becomes a query over everything that rested on the error; and **never render the whole graph**; render the result of a question.

The consequence is the thing the ladder above shows: zooming from an article into a paragraph, from a control into the attestation behind it, from a threat into the method it lives in, lands you in a different ontology each time, and the walk still works, because every edge on the way is a verb with an inverse and every node knows where it came from. The Standards Atlas below puts it in its own words when you open its graph view: *“You are at the top of the fractal. Each domain is its own ontology that connects up to the GDPR root and down to concepts and articles.”*

## Altitude 0: the law, as a graph you can cite

Regulation Graph · vault 73heuprz

### The EU AI Act, parsed from its own XML and hashed to the byte

Regulation (EU) 2024/1689 read from official Formex XML, decomposed into **113 articles, 500 paragraphs, 417 points, 180 recitals, 13 annexes and 68 definitions**, 1,523 nodes and 1,944 edges in all, with the SHA-256 of the retrieved bytes at the end of every provenance chain. Eleven views, including SQL and RDF exports, all client-side.

This is the bottom of the provenance ladder and the top of the semantic one: when a risk somewhere else says *touches Article 12*, this is the vault that can say what Article 12 says and prove the bytes. [The vault's page →](../vaults/regulation-graph/index.md)

Article-level citations, with halos on the articles amended by Regulation (EU) 2026/1744. There is no official consolidated text yet, so the graph composes the two.

Standards Atlas · GDPR · vault 4zv4bvmu

### “You are at the top of the fractal”

The GDPR's 99 articles as a graph whose operative meaning lives in a second layer the text never mentions: **rulings, regulators' guidance, and per-country variation**, modelled as nodes anchored to the articles they bend. The graph view is explicitly navigated *by altitude* (the Regulation, then a domain, then a concept, then the articles and the rulings that interpret them), and the layout is computed from the graph rather than drawn.

It is also the earliest experiment here and it shows: six of its 227 edges are typed `relates`, the one verb the grammar bans. Recorded rather than hidden, because the rule was written after this vault was. [The vault's page →](../vaults/standards-atlas-gdpr/index.md)

Altitude 0: the Regulation and its eight domains. Pick one to descend.

one level down

### Same grammar, one altitude lower

Descend into *Principles* and the ring is Article 5's seven principles, each a concept node connecting up to the domain and down to the articles, rulings and guidance anchored on it. Descend again and one principle shows its provenance: the pipeline stage that proposed it, the confidence it was given, and the official text it points at. Nothing about the rendering changed between the three altitudes; only the question did.

Altitude 1: *Principles*, “the spine the whole graph hangs from”, and its seven concepts, one article.

the layer the text omits

### Why a static PDF of a law is wrong and a versioned graph is not

Article 45 of the GDPR has not changed a word since 2016. What it permits has flipped four times: Safe Harbour, Schrems I, Privacy Shield, Schrems II, the Data Privacy Framework, an appeal pending. The atlas draws that as a timeline of ruling nodes over one unchanged article node, which is the whole argument for the second layer in one picture.

One article, five rulings, twenty-five years. The text is a constant; its meaning is the graph.

## Altitudes 1 to 3: the standard, the evidence, the policy

AIUC-1 conformance layer · vault 2wzct4k7

### A standard's controls, joined node-to-node to the law they cite

The AIUC-1 agent standard as data, **53 controls, 2,788 nodes, 11,610 edges** and 82 hashed source snapshots, plus a conformance layer added as one directory without changing a byte of the original. Its explorer loads *two vaults as one graph*: one of its packs is literally `The AI Act, by article (vault 73heuprz)`.

That join is where a crosswalk stops being a string. AIUC-1 publishes 1,126 crosswalks as text; **62 resolve** into Regulation Graph node ids at article level, and the traversal returns something neither vault knew alone: **8 of the 27 articles reached are amended**, so the crosswalk was written against the pre-amendment text. [The vault's page →](../vaults/aiuc-1-conformance/index.md)

Two vaults, one canvas. The chip row is the join: standard, crosswalks, *another vault's* articles, conformance, bow ties, acceptances.

the evidence rung

### Two edges that are never allowed to touch

`evidenced_by` answers *does the standard say this?* and lives in the catalogue. `attested_by` answers *does this subject do this?* and lives in the layer. A test is red if a layer edge ever reaches a source observation. Every control in scope gets a row whether or not anyone has looked, so the first build of one subject comes out **2 evidenced, 48 unevidenced, 3 contradicted**, and that is the designed answer. Unevidenced is a state, and it is the default.

53 rows, a level out of five computed from the attestations behind it, and the date each one expires.

the policy rung

### The policy is a query, and time is what breaks it

Each control's conformance state becomes a **condition** or an **exclusion** on a `policy/v1` object, and bow ties decide which consequences are covered. At build time: 1 condition met, 52 exclusions, 0 of 5 consequences covered. Move the as-of date to January 2027 with nothing edited by anybody and the one condition has expired: *“real-timeliness arriving as a consequence rather than as a feature.”* The [Licence to Operate](../vaults/licence-to-operate/index.md) vault is the same object from the other end: an agent's grant, its mandate, and the policy insuring the mandate, spent one conversational turn at a time.

Coverage by consequence, with *why not* spelled out for each.

## Altitudes 4 to 6: from a fact about your estate to a board decision

Risk Graph Explorer · vault 3simlnqe

### Answers become facts; facts give rise to risks; risks cause risks

Answer questions about a system and the register assembles: 18 facts, 37 risks, 14 provisions, seven views recomputing as you go. Risk chains run inherent-to-corporate left to right and are walkable in both directions (*leads to* navigates up, *led by* walks back to the answers that caused it), with cycles drawn as dashed edges because the cycles are real. The app declares `permissions: {}`: a vault allowed to do nothing at all. [The seven views, explained →](../vaults/risk-graph-explorer/views/index.md)

Risks that cause risks. Click either end of an edge and the graph is walked from there.

the owner rung

### The org chart, with risks flowing up it

The role risk map distinguishes what a role *holds* from what arrives *through* it because the graph says it must, so no risk is orphaned and every path terminates at the board. The same organisation under the *Typical* and *Governed* presets has the same org chart; only what is true about the agent changes, which is the whole argument in one comparison.

Assigned versus through. Nothing stops short of the board.

Agentic Browser Isolation · vault 0610gsp9

### The same exposure, in seven languages

Should an agent browse with your logged-in sessions? Seventy JSON files hold the register (risks, controls, evidence, owners, acceptances), and the same nodes are read at **seven stakeholder altitudes**, IT to Board, each owning the risk in its own vocabulary. A risk sits *pending* until its named owner accepts it personally, and only an accepted risk escalates to the altitude above. There is no deny button: accept, mitigate, or ask for more data. [The vault's page →](../vaults/agentic-browser-isolation/index.md)

IT has five risks pending; everyone above is `waiting`, because nothing has been passed up yet.

## Altitudes 7 to 11: all the way down to the compute instance

ThreatModCon 2025 · vault 0ict6flm

### Eleven linked threat models, customer to compute

This is the vault that answers the *“all the way down”* question most directly. A threat model of one system tells you very little; this one is a **graph of graphs**: eleven models linked down a zoom ladder: Customer → Business → Application → Component → Package → Class → Method → Source Code → Environment → Runtime → Compute. **51 nodes, 179 threats, 3 critical**, each layer carrying its own counts.

The demonstration is a single SQL injection traced upward from the method it lives in to the revenue it puts at risk, and then framed four ways, for the Board, the CISO, the CTO and the developer, from one fact. Everything runs inside the vault, offline. [The vault's page →](../vaults/threatmodcon-2025/index.md)

The zoom ladder, counted: 11 layers, 51 nodes, 179 threats. The bottom rung is a compute instance.

the flat view

### The whole estate on one screen, because it is one graph

Flatten the eleven layers and the result is still one graph, which is the point. A vulnerability at the bottom and a revenue obligation at the top are not in different tools with a spreadsheet between them; they are nodes a query can connect.

The same eleven layers, flattened.

## Between vaults: the edges that cross a boundary

The join above, a control in one vault pointing at an article in another, is the property that turns a set of graphs into a fractal rather than a pile. Two mechanisms carry it. The AIUC-1 layer records **595 anchors** that tie its nodes to the exact bytes they came from, verified at build and again in the browser, and resolves its crosswalks into another vault's node ids *with the CELEX identifier and a hash on each edge*. And sgit's own object model ships **typed `*.link.json` edges between vaults**, optionally pinned to a commit in the target's history: a cross-graph edge that cannot silently follow a moving target. Both are documented on [graphs.sgit.ai's reality page](https://graphs.sgit.ai/v1/shipped/index.html), which is careful to say which of its claims are running and which are argued.

The vault commit graph underneath all of this is a graph too, content-addressed over ciphertext, multi-parent, with a real merge-base, which is why the read-only query API a vault app gets (`sg.history.log`, `list`, `read`) is the same surface every explorer on this page runs on.

## What is still modelled rather than imported

The honest half of the answer. The ladder reaches the compute instance, but not every rung is fed from a live source yet:

- **Environment, runtime and compute are modelled layers.** ThreatModCon's bottom four rungs are nodes an author placed, not a live import from a CMDB, an IaC repository or a cloud account. The grammar to receive such an import exists; the connector that emits it is not published here.
- **Enterprise architecture is a gap.** No published vault holds an EA repository (capabilities, applications, data flows) as a graph joined upward to obligations. The rungs on either side of it (business capability at the top of ThreatModCon, application and component below) are there; the EA layer between the standard and the system is the one this page cannot yet point at.
- **The AIUC-1 crosswalks resolve at article level only**, where the Regulation Graph has paragraphs; and 1,064 of 1,126 target frameworks with no published graph, reported unresolved rather than forced.
- **The GDPR atlas is a seed pass**, dated 30 May 2026, illustrative and not exhaustive, and it uses the banned `relates` edge six times.
- **standards.sgit.ai models one instrument** and says so in capitals: *“ZERO crosswalks exist between any two instruments.”* The crosswalks that do exist are in the AIUC-1 vault, not on that site.
- **The agent rung is a vocabulary, not yet a join.** abp.sgit.ai's 23 capability primitives are the right shape to attach to a system's actual permission set; no published vault yet imports a real grant and computes the delta against a mandate at scale.

Named gaps get filled. Unnamed ones do not, which is why this section is here.

## The three sites that carry the argument

graphs.sgit.ai · Graphs & method · [Fractal Semantic Graphs ↗](https://graphs.sgit.ai/) · The grammar in three altitudes: five rules you can apply tomorrow, the working edge set with its numbered gaps, and the full positioning against schemas and vector search, including the four situations in which the argument is wrong. The *reality* page separates what ships from what is argued, and the examples include Article 26(5) carried from a running system to a board decision and back. · “A node is just a node. Meaning lives in the edges.” · part of the sgit.ai network

standards.sgit.ai · Risk & governance · [Laws, standards and frameworks as addressable provisions ↗](https://standards.sgit.ai/) · A citation scheme where every provision has a constructible URL and a recomputable positional hash, a grounding ladder, and the rule for agents: report which provision a claim points at, never that a requirement is met. One instrument modelled, and a status page that says so in capitals. · “Point at the provision, or you are asserting.” · part of the sgit.ai network

abp.sgit.ai · Agents & AI · [The Agent Behaviour Policy ↗](https://abp.sgit.ai/) · Four objects (the grant, the mandate, the delta between them, and the barrier that decides whether anything is actually in the way) for one agent in one deployment, written in a capability grammar of 23 `verb.object.reach` primitives. It publishes the record and never the verdict: no score, no rating, no risk level anywhere, including in the data. The rung where the graph meets a real permission set. · “You know what you asked for. You do not know what it can do.” · part of the sgit.ai network

## Open them

| Altitude | Vault | Size | Page, with the read key |
|---|---|---|---|
| Law | Regulation Graph `73heuprz` | 207 files · 14.9 MB | [regulation-graph](../vaults/regulation-graph/index.md) |
| Law + its interpretation | Standards Atlas GDPR `4zv4bvmu` | 116 files · 6.3 MB | [standards-atlas-gdpr](../vaults/standards-atlas-gdpr/index.md) |
| Standard · evidence · policy | AIUC-1 conformance layer `2wzct4k7` | 649 files · 43 MB | [aiuc-1-conformance](../vaults/aiuc-1-conformance/index.md) |
| Fact · risk · acceptance | Risk Graph Explorer `3simlnqe` | 33 files · 428 KB | [risk-graph-explorer](../vaults/risk-graph-explorer/index.md) |
| Owner, at seven altitudes | Agentic Browser Isolation `0610gsp9` | 104 files · 2.4 MB | [agentic-browser-isolation](../vaults/agentic-browser-isolation/index.md) |
| Policy, spent turn by turn | Licence to Operate `posrhzp3` | not measured | [licence-to-operate](../vaults/licence-to-operate/index.md) |
| System → compute | ThreatModCon 2025 `0ict6flm` | 53 files · 4.1 MB | [threatmodcon-2025](../vaults/threatmodcon-2025/index.md) |

Every read key is on the vault's own page, published on purpose; none of them can write. Agents: the machine-readable list of all thirty vaults, with ids and keys, is [/demos/vaults/llms.txt](../vaults/llms.txt). The grammar for drawing your own is at [graphs.sgit.ai/llms.txt](https://graphs.sgit.ai/llms.txt).

[← Published vaults](../vaults/index.md)[Start at the law →](../vaults/regulation-graph/index.md)


---

*[Site index for agents](../../llms.txt) · [HTML version](https://sgit.ai/demos/fractal-graphs/index.html)*
