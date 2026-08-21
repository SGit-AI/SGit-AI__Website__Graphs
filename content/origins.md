---
path: origins/index.html
title: Origins: 2026 — graphs.sgit.ai
description: Ten phases from February to August 2026, dated from filenames and git. How the graph work went from cryptographic trust chains to a claim about where meaning lives — and the routing failure that kept the philosophy invisible.
og_title: Origins: 2026 — ten phases, dated
og_description: First graph thinking was cryptographic, not semantic. Revocation is the absence of trust, not the presence of a revocation entry — 21 February 2026, the earliest graph-native sentence in the corpus.
crumb: Origins
parent: 
prev: ← What ships, what is argued|../shipped/index.html
next: The network →|../network/index.html
---
# Origins: 2026

Six and a half months, February to August 2026, dated from filenames and commit history. It is published for the same reason everything else here is: a claim is easier to judge when you can see how it was arrived at — including the parts that were tried and dropped.

1. <span class="when">5 February 2026 · phase 0 — pre-history</span> <span class="what">The three foundational documents are written inside <b>a different project entirely</b> — Issues-FS, about issue tracking. They will not reach this corpus for four months. Everything at <a href="../start/index.html">altitude 1</a> comes from one of them.</span>
2. <span class="when">21 February – 24 March · phase 1 — graphs as infrastructure</span> <span class="what">The first graph thinking is <b>cryptographic, not semantic</b>: trust as a key graph. It produces the earliest graph-native sentence in the corpus — <em>“revocation is the absence of trust, not the presence of a revocation entry”</em> — which is still one of the best. <b>Paragraph-as-file</b> appears on 23 February and then lies dormant for five months.</span>
3. <span class="when">25 March – 2 May · phase 2 — graphs as the model of the system</span> <span class="what">The first inflection. A graph is proposed as the source of truth <em>about the product itself</em>, which produces the reframe: <b>“a bug is where reality diverges from the model.”</b> An Ontologist role is created.</span>
4. <span class="when">18 – 31 May · phase 3 — documents become graphs</span> <span class="what">Compliance as a living graph; rules as a fractal graph; then the universal document-to-graph pipeline. Graphs stop being infrastructure and start being the product.</span>
5. <span class="when">1 – 5 June · phase 4 — the concept explosion</span> <span class="what">Four days produce skills-as-graph, skill-as-projection, semantic knowledge graphs of identity, trust-through-connectivity. The first “meaning through connectivity” in the founder's own voice in this corpus. <b>And every one of these briefs assumes a philosophy that is not in the repository.</b></span>
6. <span class="when">10 – 11 June · phase 5 — the import, half-executed</span> <span class="what">An agent notices the assumption gap. Ten Issues-FS documents are imported and <code>library/concepts/</code> is created — phase 1 of the import memo. <b>Phase 2, adding the cross-reference so agents can find them, was specified and never executed.</b> That is why this site exists; see below.</span>
7. <span class="when">10 June · phase 6 — visualisation discipline</span> <span class="what">The blob anti-pattern, verb edges, the subgraph flip — <a href="../grammar/index.html">most of altitude 2</a>, in one day. The founder asks for his own LinkedIn series on graphs as prerequisite reading. It is not provided. <b>It still has not been.</b></span>
8. <span class="when">16 – 30 June · phase 7 — the formalisation</span> <span class="what">Peak density. Confidence through evidence, then a six-brief burst between 26 and 28 June: paths that read as language, directed edges and node explosion, twins, <b>node type formulas</b>, <b>ontologies of ontologies</b>, <b>the grounding ladder</b>. This is where the philosophy becomes <em>testable</em>.</span>
9. <span class="when">12 – 24 July · phase 8 — the architecture</span> <span class="what"><a href="../depth/boundaries.html#boundaries">A graph at every boundary</a> — six properties falling out of one decision. Registers of registers; messages as graph transformations; sovereignty computed rather than claimed.</span>
10. <span class="when">28 July – 2 August · phase 9 — the regulation build</span> <span class="what">Doctrine meets a real artefact: <b>every paragraph is a graph</b>, applied to the EU AI Act. Paragraph-as-file is resolved, closing a loop opened on 23 February. Appendix A of the 28 July brief is <b>the first and only place the corpus writes its own concepts down in one list</b> — the direct precursor of this website.</span>
11. <span class="when">6 – 9 August · phase 10 — meaning itself</span> <span class="what"><a href="../depth/index.html#concepts">Concepts, not words.</a> Decompilation, not compilation. The author as the only oracle, and <em>“that is not what I meant”</em> reframed as success. And the diagnosis that produced this site: the people who will use this do not know what an ontology is.</span>

## The routing failure, which is the reason this site exists {#routing}

It is worth stating exactly, because it is mechanical and it is fixable, and because the diagnosis generalises.

::: ladder

### 1 · The philosophy documents are in the repository

Three of them, in `library/concepts/`, imported on 11 June 2026.

### 2 · Almost nothing references them

Four files in the entire repository.

### 3 · And the file every agent starts from does not

They are not referenced from `.claude/CLAUDE.md`. The import memo specified adding that cross-reference as phase 2. It was never done.

### 4 · So an agent reading forwards never meets the philosophy

Which is why other sites in this network under-weight connectivity. **Not a comprehension failure. A routing failure.**

~ **The fix is an address.** Once this site exists, every other site and every future session can be pointed at one URL — and the one-line edit to `CLAUDE.md` can finally be made. It is [ask N1 on the comms board](../admin/comms.html).
:::

The generalisable version: **a document that nothing links to is, for a reader who follows links, a document that does not exist.** That is the same finding an agent reported when it tried to consume the parent site and could not follow the links — and it is why [llms.txt](../llms.txt) on this site carries facts rather than topic labels.

## Paths not taken {#not-taken}

The provenance discipline this network argues for, applied to itself. These were real proposals by capable people and they did not happen; recording that is cheaper than letting someone rediscover them.

| What | What happened |
|---|---|
| **The Lexicon as a shipped package** | Proposed 5 February, imported 11 June, never referenced again. The anchor-node *concept* survived and is [on this site](../grammar/index.html#anchor-nodes); the package did not. |
| **Compatibility testing across five artifact layers** | A complete design — extraction pipeline, compatibility engine, CLI — with **zero downstream references**. The most developed unimplemented idea in the corpus, and still a good one: prose, diagrams, code, config and runtime traces are five languages describing one system, so extract a graph from each and ask whether they agree. |
| **MGraph-DB as the store** | Named repeatedly, deferred every time: *“for now let's keep it simple.”* File-based won, and [the site says so](../shipped/index.html). |
| **The Ontologist role** | Created 25 March. Authors the best briefs of late June. Then vanishes — not in the current role roster. |
| **The `CLAUDE.md` cross-reference** | Specified 11 June, never done. One edit, and the under-weighting stops. See above. |

::: agent
If you are working in this corpus: the philosophy lives in `library/concepts/`, it is referenced by four files, and it is **not** reachable from the entry-point file you were given. Read it directly rather than assuming that working forwards will surface it. Everything at [altitude 1](../start/index.html) of this site comes from those documents.
:::
