#!/usr/bin/env python3
"""Generates /docs/ — the fifteen source documents this site was built from.

Run from anywhere: python3 admin/build/gen_docs.py
Then run chrome.py, which fills in the nav and footer.

Three things happen here, and they are deliberately different in kind:

  · The DOCUMENTS are carried, not summarised. Each .md under docs/sources/ is a
    byte-for-byte copy of a file in a public repository, with its SHA-256, source
    commit and licence in docs/sources/manifest.json. The page renders that copy.
    A reader can re-fetch the original and check the hash.

  · The CONCEPT LINKS are measured. Every concept in the ladder's concept layer has
    a declared list of phrases (MATCH below). This script counts, mechanically, how
    many times those phrases occur in each document. The phrase list is authored and
    published on the page — so the measurement is reproducible and the list is
    arguable, which is the honest split.

  · The SITE LINKS are authored. Which chapter, layer, vault or page a document
    actually feeds is a judgement, and it is written down as one (CONTEXT below),
    with a note saying what the link is for. Nothing here pretends to be derived.

Influence is then a stated formula over the three, in the same spirit as the concept
map's peaks: computed, not chosen, so it can be disagreed with by recomputing it.
"""
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
VERSION = (ROOT / "admin/build/version.txt").read_text().strip()
SRC = ROOT / "docs/sources"


def P(kind, label, href, note):
    return dict(kind=kind, label=label, href=href, note=note)


# The phrases counted per concept. Authored, published, and mechanically applied:
# the count is not a judgement, the list is. A phrase is matched case-insensitively
# on word boundaries; a document scores a concept only if the phrase actually occurs.
MATCH = {
 "meaning-through-connectivity": ["meaning through connectivity", "meaning is not declared",
                                  "meaning comes from connectivity", "meaning emerges"],
 "node-alone-means-nothing":     ["a node alone", "in isolation", "on its own means nothing",
                                  "does not exist in a vacuum"],
 "confidence-from-connectivity": ["confidence is", "confidence in that meaning", "blast radius",
                                  "more connected", "connectedness"],
 "enrichment-not-enforcement":   ["enrichment", "enrich", "does not constrain"],
 "named-absence":                ["the gaps", "missing", "absence of evidence", "unhooked",
                                  "never defined", "not answered"],
 "edge-is-a-verb":               ["verb edge", "verb-based", "named inverse", "distinct inverse",
                                  "inverse verb", "every edge is directed"],
 "banned-generic-edge":          ["relates-to", "relates to", "generic edge", "related-to"],
 "path-reads-as-a-sentence":     ["read as a sentence", "reads as a sentence", "read as language",
                                  "reads as language", "natural sentence"],
 "bidirectional-paths":          ["inward and outward", "outward path", "inward path",
                                  "both directions", "two directions"],
 "render-the-query":             ["the blob", "flip the subgraph", "subgraph flip", "narrow it",
                                  "wide first", "visualisation limit", "condensed graph"],
 "fractal":                      ["fractal", "graphs of graphs", "ontologies of ontologies",
                                  "all the way down", "at every altitude", "at every boundary"],
 "junction-rule":                ["node to node", "node-to-node", "junction", "never document to document"],
 "twin-attachment":              ["twin", "twins", "hooks into reality", "twin primitive"],
 "schema-first":                 ["schema-first", "standardized schema", "standardised schema",
                                  "conform first", "conform-first", "semantic web"],
 "dont-merge-vocabularies":      ["bridges, not merges", "never merges", "divergence", "diverge",
                                  "keep their own definitions", "bridge"],
 "compatibility-computed":       ["compatibility", "compatible", "partial equivalence", "a spectrum"],
 "anchor-nodes":                 ["anchor node", "anchor nodes", "lexicon", "reference graph"],
 "classification-as-query":      ["classification is a query", "node type formula", "classification as a query",
                                  "type is set by edges", "path pattern", "path-pattern"],
 "supersede-never-delete":       ["supersede", "do not delete", "never delete", "amendment"],
 "two-identities":               ["two identities", "content hash", "positional", "deterministic address"],
 "provenance-chain":             ["provenance", "chain of custody", "attribution", "citation"],
 "ephemeral-engines":            ["the browser is the database", "source of truth", "indexeddb",
                                  "sqlite", "ephemeral", "no backend", "file system is the source"],
 "projection":                   ["projection", "projected", "derived rather than curated", "a projection of"],
 "properties-carry-data-not-meaning": ["properties are words", "properties carry", "property is just",
                                       "properties, behaviours"],
}

# Authored context: why each document is here, what it says, and where the site rests
# on it. `resolves` names a review item or decision that went looking for this material.
CONTEXT = {
 "thinking-in-graphs": dict(
   title="Thinking in Graphs: Meaning Through Connectivity",
   dated="5 February 2026",
   short="The cornerstone. The book's subtitle is this document's subtitle.",
   intro="If this site has one source document, it is this one. It is the foundational "
         "document of the Issues-FS ecosystem, and it states the thesis in a single sentence: "
         "everything is a graph, meaning is not declared but discovered through relationships, "
         "and confidence in that meaning is proportional to how richly connected a node is. "
         "Three of the five computed peaks on the concept map are named in its part headings, "
         "and the book's subtitle is lifted from its title unchanged.",
   summary=["Everything is a node, and a node alone carries no meaning (parts 1 and 2).",
            "The fractal principle: the same structure at every scale (part 3).",
            "Anchor nodes and reference graphs: reference without authority (part 4).",
            "Confidence as a function of connectivity, which the book makes a computed peak (part 5).",
            "Graphs of graphs, the idea published elsewhere as G3 (part 6)."],
   reread="Read part 5 against the concept map. The formula there is prose; the site turned it "
          "into arithmetic, and the two do not perfectly agree.",
   places=[P("book", "Chapter 1 · Why graphs at all", "../book/ch-01-why-graphs-at-all.html",
             "the thesis in the form the chapter argues it"),
           P("book", "Chapter 2 · The five ideas", "../book/ch-02-the-five-ideas.html",
             "four of the five ideas are this document's parts"),
           P("layer", "L1 · the whole book in 135 words", "../altitudes/index.html",
             "the top of the ladder compresses to this document's central claim"),
           P("page", "The concept map", "../altitudes/concepts.html",
             "the dictionary layer takes its definitions from here")],
   resolves=["r001 item 2 · the title", "N3 · the canonical statement of the thesis"]),

 "fractal-semantic-graphs": dict(
   title="Fractal Semantic Graphs All The Way Down",
   dated="12 July 2026",
   short="Where the book's title comes from, and the sharpest statement of a graph at every boundary.",
   intro="The founder's decision of 22 August named the book <b>Fractal Semantic Graphs: Meaning "
         "Through Connectivity</b>. The first half of that title is this document's title, and "
         "the argument under it is the one chapter 6 makes: the conventional stack loses meaning "
         "at every seam because layers are glued by payloads and prompts, and the fix is to make "
         "a semantic graph the interface at every boundary. If the identity release needs one "
         "source to distil, it is this.",
   summary=["The conventional stack loses meaning at every seam, because layers are glued by payloads and prompts.",
            "Fractal means one grammar, one validator, one query engine and one provenance rule at every altitude.",
            "The model lives at the edge and only proposes a graph; a deterministic validator executes it.",
            "Untrusted input is data and can never become an instruction, so injection fails at the validator.",
            "Authorisation lives in the tool graph, so an ungranted action is impossible rather than denied."],
   reread="The ten key claims at the end are the closest thing the corpus has to a specification "
          "of the title. Chapter 6 argues five of them.",
   places=[P("book", "Chapter 6 · A graph at every boundary", "../book/ch-06-a-graph-at-every-boundary.html",
             "the chapter is this document's stack argument, retold"),
           P("page", "A graph at every boundary", "../depth/boundaries.html",
             "the long-form version on the site"),
           P("layer", "L3 · the fractal section", "../altitudes/index.html",
             "the level-3 unit on one grammar at every altitude"),
           P("decision", "r001-D1 · the title", "../decisions/index.html#r001-D1",
             "the answered decision that made this document the title source")],
   resolves=["r001 item 2 · the title", "r002 item 1 · the fractal chapter"]),

 "digital-twins-of-anything": dict(
   title="Digital Twins of Anything, and the Discipline of Reality",
   dated="26 June 2026",
   short="Tier 0 in the source manifest. The site's epigraph is one sentence from here.",
   intro="The shortest document in the set and the one the source manifest ranks first. It carries "
         "the tightest formulation of the whole thesis (properties are words; meaning is captured "
         "through connectivity) and it supplies the primitive the regulation work depends on: a "
         "twin is where the graph stops being about itself and touches something real. Whether an "
         "endpoint reaches reality is itself a measurable fact, which is what makes coverage "
         "computable rather than claimed.",
   summary=["A digital twin can be made of anything: a system, a person, a behaviour, an event.",
            "Meaning comes from connectivity, and every graph endpoint continues into a twin.",
            "Whether a twin reaches reality is a measurable fact: connected, or not.",
            "Everything in the graph must be a real, existing fact, which is what avoids pollution.",
            "Twins make risk testable with the techniques of software engineering."],
   reread="Six pages, and the densest of the fifteen. The 2FA worked example is its companion, and "
          "the site already carries that.",
   places=[P("book", "Chapter 9 · The 2FA instance graph", "../book/ch-09-the-2fa-instance-graph.html",
             "the worked example this document names as its companion"),
           P("page", "The 2FA graph", "../examples/2fa.html", "obligations attaching at the instance"),
           P("concept", "Obligations attach at the twin", "../altitudes/concepts.html#twin-attachment",
             "the concept the site derives from here")],
   resolves=["tier 0 · the site epigraph"]),

 "graphs-of-graphs": dict(
   title="Graphs Of Graphs: Mapping Reality, Not Complexity",
   dated="18 June 2026",
   short="G3 in the founder's own later vocabulary, applied to permissions.",
   intro="The published article on G3 is older and better known; this is the same idea after the "
         "vault work, and it is more useful because it is applied rather than defined. Its move is "
         "the one the book borrows in chapter 2: the objection that a graph of graphs is too "
         "complex mistakes the map for the territory. The complexity is already there, in the "
         "business. The graph is what makes it visible.",
   summary=["Permissions are an evidence graph, navigated to grant an action.",
            "Graphs of graphs and ontologies of ontologies underpin the model.",
            "Each company and division has its own ontologies and graphs.",
            "This is not complexity, it is the reality of business.",
            "Agents will find this reality, so the blast radius has to be contained."],
   reread="Short, and the clearest answer to the most common objection the book will face.",
   places=[P("book", "Chapter 2 · The five ideas", "../book/ch-02-the-five-ideas.html",
             "the fractal idea, and the reply to the complexity objection"),
           P("vault", "The capability scale", "../vaults/capability-scale.html",
             "permissions as a declared graph, read across five vaults"),
           P("concept", "The same grammar at every altitude", "../altitudes/concepts.html#fractal",
             "one of the two sources for the concept")],
   resolves=["N3 · G3 named and defined"]),

 "ontologies-of-ontologies": dict(
   title="Ontologies of Ontologies: Multiple Definitions, Three Layers, and Bridges",
   dated="28 June 2026",
   short="Why the site refuses to merge vocabularies, in twelve hundred words.",
   intro="The book's fifth idea, and the concept map's fifth peak, is that merging two vocabularies "
         "erases the disagreement that was the finding. This is where that argument is made in full, "
         "and it is stronger than the chapter: the same node can be a vulnerability under one formula "
         "and a fact under another, and both are valid, which is exactly why classification has to be "
         "a query rather than a stored label. Read it beside the altitude ladder's per-level ontologies.",
   summary=["The system must hold multiple node type formulas at once, and a node can be two things at once.",
            "That is why classification is a query, not a stored label.",
            "Three layers: the graph is shared and factual, the formulas are owned, the bridges are negotiated.",
            "Ontologies are connected by bridges, not dissolved by merges.",
            "Partial and conditional bridges are honest, surfacing where worldviews diverge."],
   reread="The three-layer split (graph, formulas, bridges) is the cleanest structural idea in the "
          "set, and the site has only half-implemented it.",
   places=[P("book", "Chapter 5 · Against schema-first", "../book/ch-05-against-schema-first.html",
             "the chapter's central argument"),
           P("layer", "Per-level ontology and taxonomy", "../altitudes/index.html",
             "each ladder level declares its own node and edge types"),
           P("concept", "Merging erases the disagreement", "../altitudes/concepts.html#dont-merge-vocabularies",
             "a computed peak, sourced here")],
   resolves=["r004 item 8 · an ontology and a taxonomy for every layer"]),

 "path-properties": dict(
   title="Graph Path Properties: Reading as Language, and Multi-Graph Creation Paths",
   dated="26 June 2026",
   short="The sentence test, stated as a requirement rather than a nicety.",
   intro="The site's grammar rule that a path must read as a sentence comes from here, and so does "
         "the reason it is a rule rather than a style preference: a path that does not read as a "
         "sentence is one whose edges were never named properly, and the failure shows up as soon "
         "as a reader tries to follow it. The graph explorer's path readout is this document, built.",
   summary=["A path should read as a natural sentence in the reader's language and context.",
            "The recurring edge, such as managed-by up an org chart, is the clearest case for why direction matters.",
            "The model errs toward understanding over a standardised schema.",
            "Nodes and edges are nearly free, so anchor nodes can connect vocabularies and languages.",
            "Build the universe wide, then narrow it with queries: build the graph for the story."],
   reread="Compare its acceptance criteria against what the graph explorer now does. Two of the four "
          "are built; the other two are not.",
   places=[P("book", "Chapter 4 · The edge set", "../book/ch-04-the-edge-set.html",
             "the sentence test as a grammar rule"),
           P("page", "The edge set", "../grammar/edge-set.html", "every edge with its inverse"),
           P("page", "The ladder as one graph", "../altitudes/graph.html",
             "paths print as sentences, using each edge's verb or its inverse")],
   resolves=["r004 item 11 · paths read as sentences"]),

 "directed-edges-query-paths": dict(
   title="Directed Edges, Inward and Outward Paths, and Query Paths",
   dated="26 June 2026",
   short="The direct source for the path-query engine built in v0.3.21.",
   intro="This is the document the path-query UI was built from, and it is worth reading against "
         "what got built. Its argument is that fixing the edge type and direction at every step is "
         "what collapses fan-out and prevents the explosion of nodes, and that every edge needs a "
         "named inverse or there is a direction the graph simply cannot be queried in. The site's "
         "grammar enforces the second; the query engine implements the first.",
   summary=["Every edge is directed and has a distinct inverse.",
            "Each node has an outward path (what it opens) and an inward path (what led to it), and they read differently.",
            "A query path fixes the edge type and direction at every step, which collapses fan-out.",
            "Multi-seed queries converge on the natural peaks, so results stay bounded.",
            "Query paths can be indexed as path-to-node-set and grow by extension rather than rewriting."],
   reread="Claim 8, the two-pass analysis (mark the peaks, then walk directed paths to them), is "
          "exactly what the concept map does and neither was written with the other in view.",
   places=[P("page", "The path query", "../altitudes/graph.html#query",
             "a pattern is a start filter plus up to three edge-and-node steps"),
           P("book", "Chapter 4 · The edge set", "../book/ch-04-the-edge-set.html",
             "every verb with a distinct inverse"),
           P("concept", "Both directions carry a name", "../altitudes/concepts.html#bidirectional-paths",
             "the concept sourced here")],
   resolves=["r004 decision D6 · the path query"]),

 "avoid-the-blob": dict(
   title="Visualising Semantic Graphs: Avoid The Blob, Use Verb Edges, And Flip The Subgraph",
   dated="10 June 2026",
   short="Everything the graph explorer does, and three things it still does not.",
   intro="A graph visualisation that renders everything renders nothing: it collapses into a hairball "
         "with no readable structure. This document is the method for avoiding that, and it is the "
         "closest thing the corpus has to a specification for the explorer on this site: rich nodes "
         "are good, edges are two-way verbs and never <code data-banned-verb="">relates-to</code>, build the universe in "
         "a first pass, then <b>flip the query around a found node</b> to get a small, relevant graph.",
   summary=["The blob anti-pattern: rendering the whole graph produces something with no readable structure.",
            "Rich nodes are good; the answer is not fewer properties, it is fewer nodes on screen.",
            "Two-way verb edges, and never a generic association edge.",
            "The subgraph flip: find a node, then re-query around it for a small, condensed graph.",
            "The LLM builds and prunes the query; the final query stays pure node-and-edge mathematics."],
   reread="The subgraph flip is the one big idea the explorer has only partly built. Radius exploration "
          "is the flip with a fixed depth rather than a re-query.",
   places=[P("page", "The ladder as one graph", "../altitudes/graph.html",
             "radius, collapse, and the view file"),
           P("book", "Chapter 3 · The rules you can apply tomorrow", "../book/ch-03-the-rules-you-can-apply-tomorrow.html",
             "never render the whole graph"),
           P("concept", "Never render the whole graph", "../altitudes/concepts.html#render-the-query",
             "the concept sourced here")],
   resolves=["r002 item 6 · the per-chapter graph visualisations"]),

 "the-grounding-ladder": dict(
   title="The Grounding Ladder: One Node Type Formula for Fact, Evidence, Measure, Vulnerability and Risk",
   dated="28 June 2026",
   short="The formula behind the site's fact / assertion / opinion inventory.",
   intro="The altitude ladder counts the book down to fourteen facts, twenty-six assertions and no "
         "opinions, and the reason that count can be derived rather than typed is this document. Its "
         "claim is that a node's type is set by its edges: downward paths confer grounding, upward "
         "paths confer classification, and promotion or demotion is an edge event rather than an "
         "editorial decision. It also names its own bias, in a section titled that.",
   summary=["The grounding ladder is one node type formula, not <em>the</em> definition.",
            "Downward paths confer grounding; upward paths confer classification and implication.",
            "A measure is not the floor: it is an observation grounded on a twin and on reality.",
            "The floor is the last node where going deeper neither improves observability nor changes a decision.",
            "Classification is a dynamic path query; the formula carries visible, arguable bias."],
   reread="The section called <em>This Formula's Visible Bias</em> is the model for how every claim "
          "on this site should end.",
   places=[P("layer", "The ladder's evidence states", "../altitudes/index.html",
             "every claim carries an evidence state rather than a flat assertion"),
           P("layer", "The inventory", "../altitudes/concepts.html",
             "14 facts, 26 assertions, 0 opinions, derived from evidence state"),
           P("concept", "Classification is a query, not a judgment", "../altitudes/concepts.html#classification-as-query",
             "the concept sourced here")],
   resolves=["r004 item 4 · what the climb surfaced"]),

 "confidence-through-evidence": dict(
   title="Confidence Through Evidence: Blast Radius, And Mapping The Gaps",
   dated="16 June 2026",
   short="A computed peak of the concept map, argued in full.",
   intro="Confidence is a function of connectivity is the third-strongest concept on this site's "
         "concept map, and it was computed there rather than chosen. This is where it is argued: "
         "confidence is not a feeling and not a percentage, it is understanding the blast radius, "
         "and it grows with connected evidence. The move that makes it operational is the second "
         "half: <b>map the gaps as well as the evidence</b>, because absence of evidence is itself evidence.",
   summary=["Confidence is a spectrum that grows with connected evidence.",
            "Confidence here means understanding the blast radius.",
            "Map not only the evidence you have but the gaps you are missing.",
            "Evidence has weight, and the absence of evidence is itself evidence.",
            "The core failure is that blast radius does not propagate across air-gapped graphs."],
   reread="Its gap-mapping argument is the source of the site's named-absence rule, and the two are "
          "not quite the same claim.",
   places=[P("book", "Chapter 2 · The five ideas", "../book/ch-02-the-five-ideas.html",
             "confidence as a function of connectivity"),
           P("concept", "Confidence is a function of connectivity", "../altitudes/concepts.html#confidence-from-connectivity",
             "a computed peak"),
           P("concept", "A named absence beats a hidden one", "../altitudes/concepts.html#named-absence",
             "mapping the gaps")],
   resolves=["r002 item 4 · the evidence layer"]),

 "a-fact-in-a-vacuum": dict(
   title="A Fact Does Not Exist In A Vacuum: Agenda Is Context Rather Than A Verdict",
   dated="9 August 2026",
   short="The evidence-layer source, and the sharpest thing in the set on provenance.",
   intro="The most quotable of the fifteen, and the one that most directly implicates this site. Its "
         "argument is that a claim node is incomplete without its surrounding attribution, that "
         "asserted, vouched for, funded, published and cited are five different edges, and that "
         "<b>the citers matter more than the author</b> because distortion happens downstream. Then it "
         "turns the rule on its own corpus: the graph has an agenda too, and exempting it would "
         "repeat a failure the corpus already named. That is why this site has a participant disclosure.",
   summary=["A claim node is incomplete without its surrounding attribution.",
            "Asserted, vouched for, funded, published and cited are different relationships and should be different edges.",
            "Citers matter most, because distortion happens downstream of the author.",
            "The hazard is provenance-based dismissal, so the discipline must be disclosure rather than dismissal.",
            "Corrections supersede from a date rather than delete, so what we believed in March stays answerable."],
   reread="Claim 7 is the one to sit with: the graph has an agenda too. This site's disclosure page "
          "exists because of it.",
   places=[P("page", "Participant disclosure", "../about/participant.html",
             "the rule applied to this site"),
           P("concept", "A claim is worth its chain of custody", "../altitudes/concepts.html#provenance-chain",
             "a computed peak"),
           P("concept", "Supersede, never delete", "../altitudes/concepts.html#supersede-never-delete",
             "the correction discipline"),
           P("vault", "The provenance chain", "../vaults/regulation-graph/provenance.html",
             "the same rule, running on real bytes")],
   resolves=["r002 item 4 · the evidence layer", "r003 item 2 · provenance edges"]),

 "concepts-not-words": dict(
   title="Concepts, Not Words: The Model Already Exists, And Where The Graphs Diverge Is The Finding",
   dated="6 August 2026",
   short="The source of the concept map: a dictionary crossed with a thesaurus.",
   intro="The founder asked for a concept layer that works like a dictionary and a thesaurus at once, "
         "with several centres of gravity rather than one. This is where that idea comes from, and it "
         "goes further than the layer built on this site: a published standard already models exactly "
         "this (one concept, one preferred label per language, alternative labels, broader and narrower "
         "relations), and comparing the graphs induced by two locales is computable. Where they diverge "
         "is not an error to fix. It is the finding.",
   summary=["The word being reached for is <em>concept</em>, distinct from term or label.",
            "A published standard already models it: one concept, preferred and alternative labels, broader and narrower relations.",
            "Meaning survives translation because it was never stored in a word.",
            "A bad translation revealed that the English word was probably wrong first, so the layer is quality control on the original.",
            "Divergence should be surfaced rather than resolved."],
   reread="It diagnoses a translation failure as an English failure. That inversion is the most "
          "useful idea in the set for anyone editing this book.",
   places=[P("page", "The concept map", "../altitudes/concepts.html",
             "definition, also-called, and near-but-not, per concept"),
           P("vault", "VoiceDebrief", "../vaults/voice-debrief/index.html",
             "the vault this brief was written alongside"),
           P("concept", "Merging erases the disagreement", "../altitudes/concepts.html#dont-merge-vocabularies",
             "divergence as output")],
   resolves=["r004 item 10 · the concept layer"]),

 "the-browser-is-the-database": dict(
   title="The Browser Is The Database: Local Databases As The Query Engine",
   dated="12 July 2026",
   short="The correction review r001 asked for, in the founder's own words.",
   intro="Review r001 item 5 said the book's <em>no databases</em> line was wrong, and this is the "
         "document that settles it. The position is not that there are no databases: it is that the "
         "vault is the source of truth and the file system holds it, while the browser runs the query "
         "engine (IndexedDB natively, SQL via SQLite compiled to WebAssembly). The altitude ladder "
         "reached the same correction independently by compression, which is the most interesting "
         "thing that has happened on this site.",
   summary=["The vault is the source of truth: no-database means the file system holds the truth, not that there are no databases.",
            "The data already exists as files; the missing piece was querying.",
            "The browser is the query engine: IndexedDB natively, and SQL via SQLite compiled to WebAssembly.",
            "Storing the vault commit id turns every later load into an incremental delta, not a rebuild.",
            "A SQLite database is a single file, so it can be dumped into the vault as a release snapshot."],
   reread="Read it beside the ladder's finding on the same contradiction. Two routes, one correction.",
   places=[P("book", "Chapter 12 · What ships, what is argued", "../book/ch-12-what-ships-what-is-argued.html",
             "the sentence under correction"),
           P("vault", "The query engines", "../vaults/regulation-graph/engines.html",
             "the same architecture, running"),
           P("concept", "The file system is the source of truth", "../altitudes/concepts.html#ephemeral-engines",
             "the concept sourced here"),
           P("layer", "The ladder's findings", "../altitudes/index.html#findings",
             "the contradiction the climb reached independently")],
   resolves=["r001 item 5 · the database correction"]),

 "every-paragraph-is-a-graph": dict(
   title="Every Paragraph Is A Graph: Turning The EU AI Act Into Fractal Semantic Graphs",
   dated="28 July 2026",
   short="The method behind the regulation vault, with the concepts appendix.",
   intro="The Regulation Graph vault is the artefact; this is the method. Its claim is that every "
         "paragraph of an instrument was written for a reason, so every paragraph yields something: "
         "a fact, a risk, a control, a requirement, or work to be done. The two ideas worth the read "
         "are that the instrument's own definitions are the first and most valuable layer of nodes, "
         "and that <b>terms used but never defined are where interpretive risk concentrates</b> — which "
         "makes surfacing them an artefact in its own right.",
   summary=["Every paragraph yields a fact, a risk, a control, a requirement, or work to be done.",
            "Each provision carries its own subgraph rather than folding into one flat graph.",
            "The hooks into reality are twins, and whether an endpoint reaches reality is computable.",
            "The instrument's own definitions are the first and most valuable layer of nodes.",
            "Terms used without definition are where interpretive risk concentrates."],
   reread="Appendix A lists the established concepts the pipeline assumes. It is a compact index of "
          "the corpus, and half the concept map is in it.",
   places=[P("vault", "Regulation Graph", "../vaults/regulation-graph/index.html",
             "the vault this method produced"),
           P("book", "Chapter 10 · Article 26(5), fact to board and back", "../book/ch-10-article-26-5-fact-to-board-and-back.html",
             "one provision, end to end"),
           P("page", "Article 26(5), end to end", "../examples/article-26-5.html",
             "the worked example")],
   resolves=["r001 item 8 · the case studies"]),

 "fractal-risk-registers": dict(
   title="Fractal Risk Registers: One Per Accepting Role, In Their Language",
   dated="17 July 2026",
   short="Where the seven stakeholder altitudes and the acceptance mechanism come from.",
   intro="The Agentic Browser Isolation vault writes the same risk seven times, once per stakeholder, "
         "and this site's decisions page runs that vault's acceptance rules over the book's own open "
         "questions. Both come from here. The argument is that wherever there is a stakeholder "
         "accepting a risk, that entity needs a register; that registers are fractal, using the same "
         "grammar at every altitude; and that only the role's own register is stored, with the views "
         "above derived by relevance rather than curated.",
   summary=["Wherever there is a stakeholder accepting a risk, that entity needs a register.",
            "Registers are fractal: the same grammar and tooling at every altitude.",
            "A person's register is all the risks that bubble up to them, derived rather than curated.",
            "The role's own register is stored; the registers above are derived by a relevance fade.",
            "The register belongs to the role, and the role connects to a person, which is what makes succession work."],
   reread="The relevance fade is the mechanism the browser-isolation vault implements as seven "
          "stakeholder altitudes. Read them together.",
   places=[P("vault", "The acceptance mechanism", "../vaults/agentic-browser-isolation/acceptance.html",
             "the four rules, running on a real risk"),
           P("page", "The decisions", "../decisions/index.html",
             "the same four rules, running on this book's open questions"),
           P("concept", "The same grammar at every altitude", "../altitudes/concepts.html#fractal",
             "registers as the fractal case")],
   resolves=["r003 item 4 · the decisions mode"]),

 "refactoring-meaning": dict(
   title="Refactoring Meaning: This Is Decompilation Rather Than Compilation",
   dated="9 August 2026",
   short="The altitude ladder's own source, and the answer to why it is not a clean tree.",
   intro="The altitude ladder on this site exists because of a voice memo in review r004. This is "
         "the document that memo was reaching for, written two weeks earlier. Its central move is "
         "one the ladder needed and did not have: going <em>up</em> the ladder, from text toward "
         "meaning, is <b>decompilation rather than compilation</b>, and decompilation is the "
         "ambiguous direction. Lifting is one-to-many, so something has to resolve the ambiguity, "
         "and only the author holds the answer. That is why a ladder built by an agent is a proposal "
         "and not a finding.",
   summary=["Upward is decompilation rather than compilation, which is the ambiguous direction.",
            "The transformation can be deterministic; the interpretation cannot, and the two should not be conflated.",
            "The artefact is a graph of author-confirmed meaning, not a claim about truth: <em>is this what you meant</em> is answerable in seconds, <em>is this true</em> is not.",
            "A reader disputing the reading is the elicitation working. Disagreement is the product.",
            "The fractal property is <b>intersection rather than nesting</b>: one mention sits in several graphs at once.",
            "Altitude and query are different controls, and a reader needs both."],
   reread="Claim 10 answers r004 item 3 directly, and better than the item does. The ladder is "
          "many-to-many because meaning intersects, not because the compression was sloppy.",
   places=[P("layer", "The altitude ladder", "../altitudes/index.html",
             "five levels, each a compression of the one below"),
           P("page", "The ladder as one graph", "../altitudes/graph.html",
             "altitude and query as two separate controls, which is claim 11 built"),
           P("decision", "r004-D1 · does the ladder continue", "../decisions/index.html#r004-D1",
             "the open decision this document is the strongest argument for"),
           P("page", "Review r004", "../reviews/r004.html",
             "the review whose central item this document precedes by two weeks")],
   resolves=["r004 item 1 · build the ladder", "r004 item 3 · many-to-many, not a clean tree"]),

 "an-index-is-not-a-source": dict(
   title="An Index Is Not A Source: Caching Nodes Are A Separate Class",
   dated="9 August 2026",
   short="The rule this section is judged by. An index page is not evidence.",
   intro="The most uncomfortable document to publish inside an index, which is why it belongs here. "
         "Its rule is that <b>a node either asserts or points, and a reader must always be able to "
         "tell which</b>. A caching node, meaning a pre-computed mapping or a lookup or a "
         "convenience, asserts nothing, needs no attribution apparatus, and is prunable by "
         "definition. The failure mode is letting the index quietly become the source, at which "
         "point every claim downstream inherits the credibility of the weakest cache.",
   summary=["A pre-created mapping is not a weak source: it is not a source at all.",
            "A node either asserts or points, and the two classes must be structurally distinguishable.",
            "If claims and routes are indistinguishable, every claim inherits the credibility of the weakest cache.",
            "Caching nodes are prunable by definition, because they assert nothing.",
            "A cached value without the date of its lookup is indistinguishable from a claim.",
            "It does not matter where you start, which answers the belief that a complete ontology must come first."],
   reread="Then look back at this page. Every summary in this section is a caching node: it points "
          "at the document and asserts nothing on its own. The carried markdown is the source, and "
          "the hash is what keeps the two distinguishable.",
   places=[P("page", "The sources", "../docs/index.html",
             "this section is an index, and is built to the rule in this document"),
           P("page", "The edge set", "../grammar/edge-set.html",
             "typed edges that say which class a node is in"),
           P("concept", "Reference without authority", "../altitudes/concepts.html#anchor-nodes",
             "the anchor node, which points rather than asserts")],
   resolves=["r002 item 4 · the evidence layer", "r003 item 2 · provenance edges"]),

 "compatibility-through-connectivity": dict(
   title="Compatibility Through Connectivity: Testing Across Artifact Types",
   dated="5 February 2026",
   short="The companion to the cornerstone: compatibility as a measurement, not a declaration.",
   intro="Written the same day as <a href=\"thinking-in-graphs.html\">Thinking in Graphs</a> and "
         "declaring a dependency on it, this is the thesis pushed to a working conclusion. An "
         "architect writes prose, a developer writes code, a runtime produces traces: these are "
         "different languages for what should be the same truth, and the question worth asking is "
         "not <em>does the code work</em> but <b>does the system work the way the architect thinks "
         "it works</b>. Compatibility becomes something you compute by comparing the graphs "
         "extracted from each representation, which is where this site's <em>compatibility is "
         "computed, not declared</em> comes from.",
   summary=["Compatibility is measured by comparing graphs extracted from different representations of the same system.",
            "The question is not whether the code works, but whether all representations agree.",
            "Two types of test: within a representation, and across representations.",
            "Five layers, from prose to runtime trace, each yielding a graph.",
            "Compatibility is a spectrum with an assessment, not a boolean anyone declares."],
   reread="Part 7 extends meaning through connectivity beyond where the cornerstone leaves it. It "
          "is the half of the thesis this book has argued least.",
   places=[P("concept", "Compatibility is computed, not declared", "../altitudes/concepts.html#compatibility-computed",
             "the concept sourced here"),
           P("book", "Chapter 2 · The five ideas", "../book/ch-02-the-five-ideas.html",
             "compatibility as a spectrum"),
           P("vault", "The junction rule", "../vaults/voice-debrief/junction.html",
             "two representations joined at the node layer and compared")],
   resolves=["N3 · the canonical statement of the thesis"]),

 "issues-fs-lexicon": dict(
   title="Issues-FS Lexicon: The Root Graph of the Ecosystem",
   dated="5 February 2026",
   short="Anchor nodes in full, and the sharpest anti-schema statement in the corpus.",
   intro="Every system that refuses a central schema eventually faces the same question: what stops "
         "everyone inventing their own words? This document is the answer, and the answer is not a "
         "registry. The Lexicon is explicitly <b>not the authoritative source of definitions</b>. It "
         "is simply the most well-connected graph in the ecosystem, and other graphs link to it "
         "because doing so raises the confidence and interoperability of their own nodes. Authority "
         "by connectivity rather than by decree, which is the same trick the whole book turns.",
   summary=["The Lexicon is the root graph of the ecosystem: well-connected anchor nodes for shared concepts.",
            "It is <b>not</b> a schema registry and not the authoritative source of definitions.",
            "Any scope can extend, specialise or override a bootstrap definition.",
            "Graphs link to it to increase the confidence and interoperability of their own nodes.",
            "The model is fractal: the same anchor-and-reference pattern at every scope."],
   reread="It is the longest document in the set and the one that most directly answers the "
          "objection every reader of chapter 5 will raise.",
   places=[P("concept", "Reference without authority", "../altitudes/concepts.html#anchor-nodes",
             "the concept sourced here, in full"),
           P("book", "Chapter 5 · Against schema-first", "../book/ch-05-against-schema-first.html",
             "the alternative to a registry"),
           P("decision", "r003-D2 · which issues logic runs a review folder", "../decisions/index.html#r003-D2",
             "the pattern the in-repo option would adopt")],
   resolves=["r003 item 5 · reviews as folders with their own graphs"]),

 "graph-canvas-repl": dict(
   title="The Graph Canvas As A REPL: Un-Blinding The Agent",
   dated="2 August 2026",
   short="Why the explorer renders a query and not a graph, and what it is still missing.",
   intro="The problem this names is one every agent-assisted session has and few people say out "
         "loud: <b>the agent works blind while the person works slowly, on the same object</b>. A "
         "canvas fixes half of that. Feeding the rendered result back to the agent fixes the other "
         "half. What makes it a REPL rather than a viewer is the three requirements it lists, a "
         "fast cycle, inspectable state and non-destructive exploration, and this site's explorer "
         "currently has two of the three.",
   summary=["The real problem is that the agent works blind while the person works slowly, on the same object.",
            "A REPL requires a fast cycle, inspectable state and non-destructive exploration.",
            "The recorded session is already the specification: the brief is the operation sequence plus a sentence of intent.",
            "Operations should be a closed vocabulary in the established node and edge grammar, and anything it cannot express is a real gap in the model.",
            "Never render the whole graph: render the result of a query.",
            "Text diagrams are wrong for the canvas and right for the output, being diffable, committable and readable by both people and agents."],
   reread="Claim 7 is the one to steal: what your operation vocabulary cannot express is a finding "
          "about your model, not a missing feature.",
   places=[P("page", "The ladder as one graph", "../altitudes/graph.html",
             "the canvas, with the view file as its inspectable state"),
           P("concept", "Never render the whole graph", "../altitudes/concepts.html#render-the-query",
             "a second source for the concept, after the blob brief"),
           P("book", "Chapter 3 · The rules you can apply tomorrow", "../book/ch-03-the-rules-you-can-apply-tomorrow.html",
             "render the query, not the graph")],
   resolves=["r004 item 9 · the ladder as one graph", "r004 item 11 · explore from anywhere"]),

 "paying-the-fact-creator": dict(
   title="Paying The Fact Creator: The Question Is Not Whether A Claim Is True",
   dated="31 July 2026",
   short="Citation diversion, and the most checkable worked example in the corpus.",
   intro="The companion to <a href=\"a-fact-in-a-vacuum.html\">A Fact Does Not Exist In A Vacuum</a>, "
         "and the more practical of the two. Its reframing is the useful part: <b>the billable "
         "question is not whether a claim is true but whether this use of it is sound</b>, because "
         "the common failure is a true finding applied to a conclusion it never supported. The "
         "ten-thousand-hours case is worked through in detail: an average reported as a threshold, "
         "half the studied group below it, deliberate practice reduced to time served, and the "
         "original researcher spending years correcting it with none of the corrections attaching "
         "to the claim.",
   summary=["The fact creator should carry a continuing responsibility for accuracy, which currently nobody does.",
            "Validation consumes somebody's paid time, so it is never free; outside a firm nobody pays it, and the public evidence base decays.",
            "The billable question is not whether a claim is true but whether <em>this use</em> of it is sound.",
            "Citation research documents the graph-depth effect, including the conversion of hypothesis into fact by citation alone.",
            "It also names <b>citation diversion</b>: citing work that does not quite say what the citer implies.",
            "Caching by claim-and-context pair is what makes repeated validation economically viable."],
   reread="The ten-thousand-hours worked example is checkable end to end, which makes it the best "
          "single demonstration in the corpus of why a claim needs its chain of custody.",
   places=[P("concept", "A claim is worth its chain of custody", "../altitudes/concepts.html#provenance-chain",
             "a computed peak, and the concept measured in every document here"),
           P("vault", "The provenance chain", "../vaults/regulation-graph/provenance.html",
             "hash-verified custody on real bytes"),
           P("page", "Participant disclosure", "../about/participant.html",
             "the same discipline turned on this site")],
   resolves=["r002 item 4 · the evidence layer"]),
}


PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title} &mdash; graphs.sgit.ai</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="https://graphs.sgit.ai/docs/{slug}.html">
<meta property="og:type" content="article">
<meta property="og:site_name" content="graphs.sgit.ai">
<meta property="og:url" content="https://graphs.sgit.ai/docs/{slug}.html">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta name="twitter:card" content="summary">
<link rel="alternate" type="text/markdown" href="sources/{slug}.md" title="The carried source markdown">
<link rel="stylesheet" href="../assets/site.css">
</head>
<body>

<nav class="site"><div class="row"></div></nav>

<main class="doc wide">
<div class="crumb"><a href="../index.html">graphs.sgit.ai</a> &rarr; <a href="index.html">the sources</a> &rarr; <b>{shorttitle}</b></div>
<h1>{title}</h1>
<p class="lead">{short}</p>

<div class="srcprov">
  <span class="k">Source</span><span class="v"><a href="{repo_url}">{repo}</a> &middot; <code>{path}</code></span>
  <span class="k">Commit</span><span class="v"><code>{commit_short}</code> &middot; carried 23 August 2026</span>{origin}
  <span class="k">Licence</span><span class="v">{licence} (repository) &middot; {ccby}</span>
  <span class="k">Bytes</span><span class="v">{bytes:,} &middot; {words:,} words &middot; SHA-256 <code>{sha_short}</code></span>
  <span class="k">Dated</span><span class="v">{dated}</span>
</div>

<h2 id="why">Why it is here</h2>
<p>{intro}</p>

<h2 id="says">What it says</h2>
<ul class="srcsum">{summary}</ul>
<p class="srcreread"><b>Worth re-reading for.</b> {reread}</p>

<h2 id="graph">Where this document lands on the site</h2>
<p>The document is the peak. Below it hang the <b>concepts measured in its text</b> and the <b>places on this site that rest on it</b> &mdash; and the two are different kinds of link, drawn differently: a measured edge is dashed and carries its count, an authored edge is solid. <a href="index.html#method">The method is stated in full</a> on the hub.</p>
<div id="docgraph" data-slug="{slug}"></div>

<h2 id="read">Read it</h2>
<div class="mdread-label">&#128196; Rendered from <a href="sources/{slug}.md">the carried copy</a>, byte-for-byte from the source repository. Re-fetch the original and check the SHA-256 above.</div>
<div class="mdread" id="mdread" data-src="sources/{slug}.md"><noscript><p class="dim">In-page rendering needs JavaScript &mdash; <a href="sources/{slug}.md">open the markdown</a>.</p></noscript></div>

<div class="pagenav">
  <span><a href="index.html">&larr; All fifteen sources</a></span>
  <span><a href="sources/{slug}.md">The markdown &rarr;</a></span>
</div>
</main>

<footer class="site"><div class="cols"></div></footer>
<script src="../assets/vendor/cytoscape.min.js"></script>
<script src="../assets/vendor/marked.min.js"></script>
<script src="../assets/docs.js" defer></script>
<script src="../assets/mdreader.js" defer></script>
</body>
</html>
"""


def emit_pages(docs):
    out = ROOT / "docs"
    for d in docs:
        stamped = "CC BY 4.0 stated in the file" if d["ccby"] else "no per-file licence line"
        o = d.get("origin")
        origin = ("" if not o else
                  '\n  <span class="k">Origin</span><span class="v">imported 11 June 2026 from '
                  '<a href="%s">%s</a> &middot; <code>%s</code> &middot; <b>%s</b></span>'
                  % (o["repo_url"], o["repo"], o["path"],
                     "the two copies are byte-identical" if o["identical"]
                     else "the two copies DIFFER \u2014 see the hub"))
        short_title = d["title"].split(":")[0].strip()
        (out / f'{d["slug"]}.html').write_text(PAGE.format(
            slug=d["slug"], title=d["title"], shorttitle=short_title,
            desc=d["short"].replace('"', "&quot;").replace("<b>", "").replace("</b>", ""),
            short=d["short"], intro=d["intro"], reread=d["reread"],
            summary="".join(f"<li>{x}</li>" for x in d["summary"]),
            repo=d["repo"], repo_url=d["repo_url"], path=d["path"],
            commit_short=d["commit"][:10], licence=d["licence"], ccby=stamped,
            bytes=d["bytes"], words=d["words"], sha_short=d["sha256"][:16],
            dated=d["dated"], origin=origin))
    return len(docs)


def count_phrases(text, phrases):
    low = text.lower()
    n = 0
    for p in phrases:
        n += len(re.findall(r"(?<![a-z0-9])" + re.escape(p.lower()) + r"(?![a-z0-9])", low))
    return n


def main():
    manifest = json.loads((SRC / "manifest.json").read_text())
    alt = json.loads((ROOT / "altitudes/data/altitudes.json").read_text())
    concepts = {c["id"]: c for c in alt["concepts"]}
    peaks = set(alt["peaks"])

    missing = [m["slug"] for m in manifest if m["slug"] not in CONTEXT]
    if missing:
        raise SystemExit("gen_docs: carried documents with no authored context: " + ", ".join(missing))

    docs = []
    for m in manifest:
        f = SRC / (m["slug"] + ".md")
        raw = f.read_bytes()
        sha = hashlib.sha256(raw).hexdigest()
        if sha != m["sha256"]:
            raise SystemExit(f'gen_docs: {m["slug"]}.md does not match its recorded hash. '
                             "The carried copy is the evidence; it is not edited here.")
        text = raw.decode("utf-8", "replace")
        c = CONTEXT[m["slug"]]
        ccby = "Creative Commons Attribution 4.0" in text

        hits = []
        for cid, phrases in MATCH.items():
            if cid not in concepts:
                raise SystemExit(f"gen_docs: MATCH names an unknown concept: {cid}")
            n = count_phrases(text, phrases)
            if n:
                hits.append(dict(id=cid, label=concepts[cid]["label"], n=n,
                                 peak=cid in peaks, phrases=phrases))
        hits.sort(key=lambda h: (-h["n"], h["label"]))

        places = c["places"]
        score = len(hits) + 2 * len(places) + 3 * len(c["resolves"])
        docs.append(dict(
            slug=m["slug"], title=c["title"], dated=c["dated"], short=c["short"],
            intro=c["intro"], summary=c["summary"], reread=c["reread"],
            places=places, resolves=c["resolves"], concepts=hits,
            words=m["words"], bytes=m["bytes"], sha256=sha,
            repo=m["repo"], repo_url=m["repo_url"], commit=m["commit"], ccby=ccby,
            origin=m.get("origin"),
            licence=m["licence"], path=m["path"],
            influence=dict(score=score, concepts=len(hits), places=len(places),
                           resolves=len(c["resolves"]),
                           formula="concepts + 2 × places + 3 × review asks resolved")))

    docs.sort(key=lambda d: -d["influence"]["score"])
    rank = {d["slug"]: i + 1 for i, d in enumerate(docs)}
    for d in docs:
        d["rank"] = rank[d["slug"]]

    # Two documents are joined when they measure the same concept. Computed, so the
    # consolidated graph shows the corpus's own shape rather than one drawn by hand.
    shared, weight = {}, {}
    for d in docs:
        for h in d["concepts"]:
            shared.setdefault(h["id"], []).append(d["slug"])
            weight.setdefault(h["id"], []).append((h["n"], d["slug"]))
    # A concept mentioned in every document is not the same as a concept carried by every
    # document. Concentration says how much of a concept's total sits in its top three
    # documents: high means a few documents do the work and the rest allude to it.
    common = []
    for k, v in shared.items():
        if len(v) < 2:
            continue
        w = sorted(weight[k], reverse=True)
        total = sum(n for n, _ in w)
        top3 = sum(n for n, _ in w[:3])
        common.append({"id": k, "label": concepts[k]["label"], "docs": v, "n": len(v),
                       "total": total, "top": [{"slug": s_, "n": n_} for n_, s_ in w[:3]],
                       "concentration": round(top3 / total, 2) if total else 0})
    common.sort(key=lambda x: (-x["n"], x["label"]))

    out = dict(version=VERSION, docs=docs, common=common,
               match={k: v for k, v in MATCH.items()},
               totals=dict(docs=len(docs), words=sum(d["words"] for d in docs),
                           concepts=len(shared), places=sum(len(d["places"]) for d in docs)))
    p = ROOT / "docs/data/docs.json"
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(out, indent=1, ensure_ascii=False) + "\n")
    print(f'gen_docs: {len(docs)} documents, {out["totals"]["words"]:,} words, '
          f'{len(shared)} concepts measured, {len(common)} of them in more than one document')
    for d in docs[:5]:
        print(f'  {d["rank"]:>2}. {d["influence"]["score"]:>3}  {d["slug"]}')
    n = emit_pages(docs)
    print(f'gen_docs: {p.stat().st_size:,} bytes, {n} reader pages')


if __name__ == "__main__":
    main()
