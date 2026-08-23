<!--
Preserved verbatim as brief 15 on graphs.sgit.ai. Original filenames from the
librarian delivery: book-review-source-resolution__addendum-01.md (this file) and
addendum-01-sources.csv (preserved beside this file as 15__addendum-01-sources.csv).
It corrects brief 13 (13__librarian__source-resolution.md), which stays unedited per
the addendum own instruction. Received 22 August 2026, after the founder calibration
recorded at v0.3.12 and threaded on review r001 item 2 prompted the librarian to
re-run the search with the __Send and Issues-FS corpora restored.
-->

# Book Review Source Resolution — Addendum 01

**Corrects and extends:** `book-review-source-resolution.md` (22 Aug 2026) — already processed by the book agent. **This is a separate document; do not edit the original.**
**Prepared:** 22 August 2026
**Site:** [graphs.sgit.ai](https://graphs.sgit.ai/) v0.3.9 · *Meaning Through Connectivity*, intro + 16 chapters
**New sources since the original:** [`owasp-sbot/Issues-FS__Docs`](https://github.com/owasp-sbot/Issues-FS__Docs) · [`owasp-sbot/Issues-FS__Dev`](https://github.com/owasp-sbot/Issues-FS__Dev) · six Issues-FS module repos

---

## 0. What I got wrong

The original resolution was **biased toward `docs.diniscruz.ai`**. It treated the public article series as the principal answer to ask N3 and to review items r001-3, r001-4 and r001-5, and it under-weighted two corpora that matter more: the **`__Send` repo** and the **Issues-FS documentation**.

The specific failure is worth naming, because it is the same class of error the site itself is about.

I searched `docs.diniscruz.ai` for the phrase *"meaning through connectivity"*, found **zero hits**, and concluded the phrase had no dated published origin — then offered **G³** as the alternative canonical name. I never searched the Issues-FS corpus, because at that point I had not cloned it.

**The phrase has a precise, dated, single origin, and I had a byte-identical copy of it in a repo I had already read.**

---

## 1. The correction: where "Meaning Through Connectivity" comes from

```
# Thinking in Graphs: Meaning Through Connectivity

**Document:** issues-fs__thinking-in-graphs
**Version:**  v1.0
**Date:**     2026-02-05
**Status:**   Draft
**Scope:**    Foundational — this document underpins all other Issues-FS architecture documents
```

- **Git commit:** `70916cf`, **5 February 2026** — *"added two foundational docs, the 'Thinking in Graphs' one and the 'Lexicon'"*
- **Canonical path:** `Issues-FS__Docs/docs/to_classify/v0_4_0__issues-fs__thinking-in-graphs.md` · **5,013 words**
- **Also present, byte-identical** (`md5 51b67d93`) at:
  - `SGraph-AI__App__Send/library/concepts/v0_4_0__thinking-in-graphs.md`
  - `SGraph-AI__App__Send/team/humans/dinis_cruz/briefs/06/10/_to-librarian/docs-to-import/v0_4_0__issues-fs__thinking-in-graphs.md`

**The book's title is this document's subtitle.** The phrase also names Part 2 of the document (`## Part 2: Meaning Through Connectivity`) and recurs at line 230 and in the closing colophon.

### What this does to r001 item 2 (the retitle)

The original addendum framed the title decision as three-way: keep *Meaning Through Connectivity*, adopt *Fractal Semantic Graphs*, or adopt **G³**. That framing was built on the false premise that the current title was unsourced.

It is not. And the proposed alternative traces to **the same file**:

```
## Part 3: The Fractal Principle
```

> *"This is the fractal principle: the same structural pattern — nodes with edges, meaning through connectivity — repeats at every level of zoom."*
> — `thinking-in-graphs.md:230`

**Both candidate titles come from one document, dated 5 February 2026.** That reframes item 2 entirely: it is not "should we rename to something better", it is "which half of the foundational document's own vocabulary do we lead with". G³ remains a real third option — it is the *published* name, from the May 2025 white paper — but it is now the outsider, not the incumbent's rival.

**Recommendation:** put the colophon in front of the founder before v0.4.0. Whatever is chosen, the lineage chapter should record that both terms were coined in a single Issues-FS document on 5 February 2026.

---

## 2. r001 item 3 — the chapter audit, done properly

The review asks for *"a chapter-by-chapter table with source documents"*. The original addendum answered with a themed list of `docs.diniscruz.ai` articles. Here is the actual mapping, with the `__Send` and Issues-FS sources restored.

`briefs/` = `SGraph-AI__App__Send/team/humans/dinis_cruz/briefs/` · `IFS/` = `Issues-FS__Docs/docs/`

| # | Chapter | Primary source — **corrected** | Note |
|---|---|---|---|
| — | **Introduction** | `IFS/to_classify/v0_4_0__issues-fs__thinking-in-graphs.md` § *What This Document Is* | The book's opening claim restates this document's opening claim |
| 1 | **Why graphs at all** | ⚠️ Still gap **G3** — written fresh. Nearest source: same doc, Part 1 *Everything Is a Node* | The `Safe_UInt__Port` example lives here (§ *The Safe_UInt__Port Example*), and it is **real shipped code**, not a metaphor |
| 2 | **The five ideas** | **Same doc, § *Summary: Core Principles* — which lists TEN** | **This is the dilution the review is asking about, and it is measurable.** See §2.1 |
| 3 | **The rules you can apply tomorrow** | `briefs/06/10/network-intelligence/v0.33.16__arch-brief__…subgraph-flip-verb-edges.md` · `briefs/06/26/semantic-graph-and-query-paths/v0.33.35__arch-brief__…directed-edges…` · `…path-properties-read-as-language…` | `__Send`, not the articles |
| 4 | **The edge set** | **`Issues-FS/issues_fs/schemas/graph/Schema__Link__Type.py`** — `verb`, `inverse_verb`, **`source_types`**, **`target_types`** · plus the live `SGraph-AI__App__Send/.issues/config/link-types.json` | **The edge grammar is shipped, typed and domain/range-constrained in code.** The chapter currently argues it as doctrine; it can cite an implementation |
| 5 | **Against schema-first** | **Same doc, Part 4 § *The Semantic Web's Insight (and Mistake)*** | See §3 — this is also the r001-4 lineage answer |
| 6 | **A graph at every boundary** | `briefs/07/12/architecture/v0.33.48__arch-brief__…fractal-semantic-graphs…` | Correct in the original |
| 7–11 | **The worked graphs** | `__Send` briefs as listed in the original resolution | Correct in the original |
| 12 | **What ships, what is argued** | `SGraph-AI__App__Send/team/roles/librarian/reality/**` (59 files, 956 documents catalogued) · **plus the Issues-FS shipped surface** — `issues-fs` 0.7.0 and `issues-fs-cli` 0.3.0 on PyPI, 604 + 94 tests | The chapter can now name a second, independently shipped implementation |
| 13 | **Origins: 2026** | **`IFS/to_classify/6-feb-other/v0_4_0__issues-fs__the-journey.md`** — 3,483 w, Status **Historical Record**, Type *Design Evolution Narrative*, subtitled *"From Voice Memos to Compatibility Testing"* | **I never mentioned this. It is the origins chapter, pre-written, and it starts four months earlier than the book currently does** |
| 14 | **The network** | Sibling sites | — |
| 15 | **Glossary** | `briefs/08/06/voice-debrief/v0.33.56__arch-brief__…concepts-not-words…` terminology table · **plus `IFS/to_classify/v0_4_0__issues-fs__lexicon-architecture-v2.md`** (4,485 w) | The lexicon document is the anchor-node vocabulary the glossary is describing |
| 16 | **The author's interest** | Participant disclosure | — |

### 2.1 The dilution, measured

Chapter 2 is **"The five ideas."** The source document ends with **"Summary: Core Principles" — a numbered list of ten.** Five are in the book's framing; five are candidates for what was flattened:

| # | Principle (verbatim) | In the book's five? |
|---|---|---|
| 1 | *"Everything is a node.* Nodes carry local properties but have no obligation to declare what they are or how they should be used." | ✅ |
| 2 | *"Meaning comes from edges.* What a node 'is' emerges from the graph relationships that can be traced from it. No edges, no meaning." | ✅ |
| 3 | *"Confidence is proportional to connectivity."* | ✅ |
| 4 | *"The system is fractal.* Every scope — from the root Lexicon down to a single task — can define its own nodes, edges, types, and vocabulary." | ✅ |
| 5 | *"Anchor nodes enable interoperability without enforcing conformity.* … Partial mapping is normal and expected." | ✅ |
| 6 | *"Compatibility is computed, not declared.* … Compatibility is a spectrum, not a boolean." | ⚠️ **candidate** |
| 7 | *"Honest uncertainty is the default.* The system reports what the graph supports and what it doesn't. It never fills gaps with assumptions." | ⚠️ **candidate** |
| 8 | *"Enrichment, not enforcement.* When confidence is low, the remedy is adding edges, not adding validation rules. **The graph grows; it doesn't constrain.**" | ⚠️ **candidate** |
| 9 | *"Cross-graph edges are first-class.* The most powerful connections span graphs: from project issues to Type_Safe definitions, from local types to Lexicon anchors, from Lexicon anchors to schema.org references." | ⚠️ **candidate** |
| 10 | *"No node is aware of how it's used.* … extracted from the surrounding graph structure, not encoded as properties of the node itself." | ⚠️ **candidate** |

**This is a concrete, checkable answer to r001-3** — not "some concepts feel diluted" but "the source has ten and the chapter has five; here are the five that did not make it, verbatim." Principles 7 and 8 in particular are the honesty posture the rest of the estate now runs on, and 9 is the cross-graph argument the book's Part III depends on.

---

## 3. r001 item 4 — the lineage chapter, corrected

The original addendum pointed at `briefs/02/24/…solid-protocol-integration…` (3,278 w) as *"the document the review is reaching for."* That document is real and useful — **but it is not the primary source. The primary source is Part 4 of the foundational document itself.**

> **### The Semantic Web's Insight (and Mistake)**
>
> *"The Semantic Web community identified the right problem: how do independent parties exchange meaning without agreeing on everything upfront? Their answer — shared ontologies, RDF triples, linked data — was architecturally sound. The implementations (**schema.org, SKOS, Dublin Core, PROV-O**) produced genuinely useful reference vocabularies.*
>
> *But the community made a subtle mistake in practice. They ended up attaching meaning **to nodes** rather than deriving meaning **from edges**."*
>
> — `IFS/to_classify/v0_4_0__issues-fs__thinking-in-graphs.md:266–271`

And the correction that follows, § *The Graph-First Correction* (line 282):

> *"This is schema-first thinking dressed in graph syntax. The node knows what it is. Other nodes are expected to reference it. **The authority flows from the definition node outward.**"*
> *"In a graph-first model, the schema.org `Review` concept is just another node… It is a very well-connected node… But it is not special. It is not a schema that other nodes must conform to. It is a reference point that other nodes **may** link to."*

**Four named predecessors — schema.org, SKOS, Dublin Core, PROV-O — with the homage and the disagreement in the same passage.** That is the "on the shoulders" chapter, already written, dated 5 February 2026.

**Ordered source list for the lineage chapter:**

| Order | Source | Why |
|---|---|---|
| 1 | `IFS/…thinking-in-graphs.md` Part 4 | The homage *and* the disagreement, in the founder's own foundational document |
| 2 | `briefs/02/24/v0.6.17__architecture__solid-protocol-integration-complementary-architectures.md` (3,278 w) | Solid, RDF, Berners-Lee engaged directly; **4 Turtle/RDF blocks** for the chapter's code exhibits |
| 3 | `IFS/to_classify/v0_4_0__issues-fs__lexicon-architecture-v2.md` (4,485 w) | Anchor nodes as *reference without authority* — the positive form of the argument |
| 4 | [Bridging Niklas Luhmann's Ideas with SKGs and G³](https://docs.diniscruz.ai/2025/06/18/bridging-niklas-luhmanns-ideas-with-semantic-knowledge-graphs-and-g3.html) (2025-06-18) | **Zettelkasten lineage** — the non-computing ancestor, and the only source for it |
| 5 | `briefs/02/23/part-3/v0.6.14__research__pki-historical-analysis-and-market-viability.md` | The *"is this the right primitive?"* self-challenge |

The `docs.diniscruz.ai` articles stay in the chapter — but as **positioning against contemporaries**, not as the lineage source. The lineage is in the foundational document.

---

## 4. r001 item 5 — the database claim, extended

The original gave the right `__Send` quote (*"The Browser Is The Database"*, 12 Jul 2026) and the right live verification (the regulation-graph vault's SQLite interface and RDF/Turtle export). Both stand.

**What it missed: Issues-FS ships four storage backends, in code, today.**

`Issues-FS/issues_fs/schemas/enums/Enum__Graph__Storage__Backend.py`:
```python
MEMORY     = "memory"        # In-memory (tests)
LOCAL_DISK = "local_disk"    # Local file system
SQLITE     = "sqlite"        # SQLite database
ZIP        = "zip"           # ZIP archive
```

Constructed via `Graph__Repository__Factory.create_memory() / create_local_disk() / create_sqlite() / create_zip()`, over the memory-fs abstraction. **604 tests.**

So the corrected claim for chapter 5 is stronger and more precise than "we don't use databases":

> *"We use databases — SQLite among them — as ephemeral engines loaded from a durable file-system source of truth. What we do not have is a database as the source of truth."*

⚠️ **And a correction the book must not inherit.** Three Issues-FS documents claim an **MGraph-DB integration** — `Issues-FS/README.md`, `.claude/CLAUDE.md`, and the architecture overview. **`mgraph-db` appears in zero `pyproject.toml` files and `import mgraph_db` in zero source files.** `issues_fs/mgraph/` is a hand-rolled ~220-LOC in-memory graph that borrows MGraph-DB's four-layer naming convention only. Likewise **S3 is claimed in four documents and does not exist**. If the chapter cites Issues-FS as evidence, cite the enum and the factory, not the READMEs.

---

## 5. r001 item 8 — the IssuesFS case study, properly resourced

The original answered with the `.issues/` config files in `__Send` and the vendored architecture overview. That was thin. **The whole ecosystem is now available**, and it is the strongest of the four case studies because it is the only one with a shipped, installable, independently testable implementation.

| Element | Evidence |
|---|---|
| **The ontology, in code** | `Schema__Node.py` (13 fields, two identities per node — machine `node_id` + human `label`) · `Schema__Node__Link.py` (bidirectional, denormalised — **which is why 71 nodes report 141 link entries**) · `Schema__Link__Type.py` (`verb`, `inverse_verb`, `source_types`, `target_types`) |
| **The ID scheme** | `Safe_Str__Graph_Types.py` — five regex-validated primitives, `strict_validation = True`. **The single best teaching artefact in the codebase** |
| **What ships** | `issues-fs` **0.7.0** and `issues-fs-cli` **0.3.0** on PyPI · 5,401 LOC · **604 + 94 tests** · 14 CLI commands, **every one with `--for-agent`** |
| **The live graph** | `SGraph-AI__App__Send/.issues/` — **71 nodes, 141 link entries**, 12 node types, 10 verb pairs, max depth 8. Ecosystem-wide **147 nodes** across four graphs |
| **The origins** | `IFS/…the-journey.md` — voice memos → architecture, Status *Historical Record* |
| **The self-reference** | 11 role repos, each a submodule with its own `ROLE.md` and its own `.issues/`. *"The issue tracker tracks its own development"* |
| **Two undocumented surfaces** | The `.issues` flat-file **DSL** (11 source files, ~55 tests, 3 live examples, **zero prose documentation**) and **Issues-FS-lite** (agent mode, no binary — specified in §7 of an email manual in a different repo) |

⚠️ **Honest tension to narrate, not hide:** the live `link-types.json` ships a **`relates-to` / `relates-to`** self-inverse pair, and one edge instance uses it — while the book's own grammar chapter bans `relates-to` as meaningless. That contradiction between doctrine and shipped data is exactly the kind of thing the book should surface.

Full detail: the `issues-fs.sgit.ai` brief pack delivered separately.

---

## 6. Two review items the original resolution did not connect at all

### r002-3 — "build the book as a graph"
The proposal is to pilot one chapter into `book/graph/chNN.json` and have the author confirm the lift. **Two Issues-FS documents argue exactly this, from February 2026:**

- **`IFS/to_classify/6-feb-other/v0_4_0__issues-fs__compatibility-through-connectivity.md`** (3,847 w, Status **Foundational**) — architecture docs, diagrams, code, tests and runtime traces are different *languages* describing what should be the same truth; extract a graph from each and compatibility becomes measurable. **A book and its graph are two representations of one truth — that is this document's thesis applied to itself.**
- **`IFS/to_classify/6-feb/v0_4_0__issues-fs__semantic-graph-code-representation.md`** (2,868 w) — graph→code compilation; why assertions target structure rather than text, so rewording a paragraph does not break a check.

### r002-5 — "verification as a designed use case"
The proposal is to hand the book to an agent to check for accuracy. **`IFS/to_classify/6-feb-other/v0_4_0__issues-fs__llm-as-execution-engine.md`** (3,884 w, Status *Practical Guide*, 5 Feb 2026) is the argument, pre-written:

> *"**an LLM can act as the execution engine for code that doesn't exist yet**"* — specify the function, and the LLM performs it: same inputs, same logic, same outputs, callers cannot tell the difference. **The prompt is the specification; the LLM is the implementation.**

That is precisely what r002-5's "publish the checking prompt and run the first verification report" proposes. Cite it — the book gets to say the practice was designed sixteen months before it was used on the book itself.

Related, for r002-6 (per-chapter graph visualisation showing evidence depth): **`IFS/to_classify/6-feb/v0_4_0__issues-fs__semantic-testing-dsl.md`** (3,461 w) — `for each Risk in document / assert Risk.remediation exists`. ⚠️ Self-flags `[NEEDS EXPLORATION]`; label as exploratory.

---

## 7. Ask N3, restated

The original said: *"Ask N3 is `docs.diniscruz.ai`."* That is **half right and wrongly weighted.**

| | |
|---|---|
| **What N3 asked for** | *"The founder's LinkedIn 'graphs of graphs / meaning through connectivity' series"* — waiting since 10 June |
| **Where "graphs of graphs" was published** | `docs.diniscruz.ai` — **G³**, defined May 2025, four articles, LinkedIn post URLs recorded in front-matter |
| **Where "meaning through connectivity" was written** | **`thinking-in-graphs.md`, Issues-FS, 5 February 2026** — as the title |

N3 names two things and they have two different origins. The article series answers the first half. **The second half was never on LinkedIn; it was in the Issues-FS documentation repo all along, and a byte-identical copy has been sitting in `SGraph-AI__App__Send/library/concepts/` since 11 June 2026** — imported, per `library/concepts/README.md`, *precisely because* the June briefs "assume 'meaning through connectivity' … as first principles" and agents lacked the foundation.

**So N3 can be closed, with both halves named.** And gap **G1** in the graphs brief pack — *"the founder's own essay does not exist in this repo"* — should be revised: the essay exists, it is 5,013 words, and the only real question is the byline (the document carries none) and the Issues-FS attribution.

---

## 8. Corrected priority order

| # | Action | Change from the original |
|---|---|---|
| 1 | **Put the `thinking-in-graphs.md` colophon in front of the founder** — both candidate titles are in one 5 Feb 2026 document | **New. Supersedes the G³-first framing** |
| 2 | **Answer r001-3 with the ten-principles table** (§2.1) — a checkable measurement, not an impression | **New** |
| 3 | **Rebuild the lineage chapter on Part 4**, with Solid and Luhmann as supporting | **Reordered** — the original led with Solid |
| 4 | **Add `the-journey.md` to chapter 13** and move Origins back to 5 Feb 2026 | **New — omitted entirely from the original** |
| 5 | Seed the facts register with `paying-the-fact-creator` (242 papers + 10,000 hours) | Unchanged — still correct |
| 6 | **Cite `llm-as-execution-engine` in r002-5** and `compatibility-through-connectivity` in r002-3 | **New** |
| 7 | **Re-resource the IssuesFS case study** from the actual repos | **Upgraded** — the original was thin |
| 8 | Hand over `docs.diniscruz.ai` — still valuable, now correctly weighted as **the public positioning layer**, not the foundation | **Demoted from first place** |
| 9 | Ask for the reading screenshots | Unchanged — still the only blocked item |

---

## 9. Verification

| | |
|---|---|
| Repos read | `Issues-FS__Docs` (73 files, 58 md), `Issues-FS__Dev`, 6 module repos, `SGraph-AI__App__Send` @ v0.33.62 |
| Byte-identity | `thinking-in-graphs` and `lexicon-architecture` confirmed identical across Issues-FS and `__Send` by `md5sum` |
| Provenance | Commit `70916cf`, 2026-02-05, verified by `git log --diff-filter=A` |
| Book TOC | Fetched live from `graphs.sgit.ai/book/index.html`, 22 Aug 2026 |
| Quotes | All verbatim, line numbers from the Issues-FS canonical copy |

Companion machine-readable file: **`addendum-01-sources.csv`**.

---

This document is released under the Creative Commons Attribution 4.0 International licence (CC BY 4.0).

---

## Appendix — where the original's bias actually sat

For the record, since this site argues that corrections should be specific.

The original resolution was **not** short of `__Send` material in raw terms — it carried 34 `__Send` paths against 16 `docs.diniscruz.ai` articles. The bias was in **framing and in four specific omissions**:

| | |
|---|---|
| **Framing** | The headline read *"The largest single unblock: ask N3 is `docs.diniscruz.ai`."* That put the public article series first and the foundational documents nowhere |
| **r001-3** | Answered **entirely** with five `docs.diniscruz.ai` articles. Zero `__Send`, zero Issues-FS. The actual dilution is measurable against `thinking-in-graphs.md` |
| **r001-4** | Led with the Solid brief. Never mentioned Part 4 of the foundational document, which names schema.org, SKOS, Dublin Core and PROV-O |
| **Omitted entirely** | `thinking-in-graphs.md` as the title's origin · `the-journey.md` as the origins chapter · `llm-as-execution-engine.md` for r002-5 · `compatibility-through-connectivity.md` for r002-3 |
| **Thin** | The IssuesFS case study got two config JSONs where a shipped, tested, installable ecosystem was available |

**Source balance in this addendum:** 10 Issues-FS · 7 `__Send` · 5 Issues-FS code · 2 `docs.diniscruz.ai`.

`docs.diniscruz.ai` remains genuinely valuable — it is the **public positioning layer**, dated, circulated and citable. It is not the foundation. The foundation is a 5,013-word document written on 5 February 2026, and a byte-identical copy of it has been sitting in `SGraph-AI__App__Send/library/concepts/` since 11 June.

---

This document is released under the Creative Commons Attribution 4.0 International licence (CC BY 4.0).
