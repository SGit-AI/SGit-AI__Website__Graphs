#!/usr/bin/env python3
"""Generates altitudes/data/altitudes.json — the altitude ladder experiment.

Five levels. Level 5 is the book itself (not duplicated here, only linked).
Levels 4 to 1 are compressions, each built bottom-up from the level below it,
so every phrase at a level has children at the level under it.

The ladder is authored inline in this file, which is the honest description of
a pilot: there is no separate source format yet, and inventing one before the
shape is known would be schema-first. If the experiment is adopted, the
authored text moves to content/altitudes/ and this becomes a compiler.

Link syntax inside a projection: [phrase](node-id). Everything outside a
bracketed span is plain text that carries no descent.
"""
import json, re, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
VERSION = (ROOT / "admin/build/version.txt").read_text().strip()

LEVELS = [
    dict(n=1, name="The book in a paragraph",
         note="One paragraph. Every sentence descends into a part."),
    dict(n=2, name="The six parts",
         note="One or two sentences per part. Phrases descend into chapters."),
    dict(n=3, name="The seventeen units",
         note="One paragraph per chapter, plus the introduction."),
    dict(n=4, name="The sections",
         note="Two or three sentences per section. Pilot coverage: chapters 2 and 5 only."),
    dict(n=5, name="The book itself",
         note="The written text, ~20,000 words. Not duplicated here: every level 4 and level 3 unit links into it."),
]

# ---------------------------------------------------------------- ontology & taxonomy
# Per level, two different objects, kept apart because the book's own glossary keeps
# them apart: a TAXONOMY points upward (broader/narrower — what kind of unit is this?)
# and an ONTOLOGY points outward (what types exist here and how may they connect?).
# Every edge below is a verb with a distinct inverse and a stated domain and range,
# because the grammar chapter requires it of any graph this project publishes.

def ont(types, edges):
    return dict(node_types=types, edge_types=edges)

def et(verb, inverse, domain, rng, note):
    return dict(verb=verb, inverse=inverse, domain=domain, range=rng, note=note)

ONTOLOGY = {
 1: ont(
   [dict(name="Work", definition="The book as a single node. There is exactly one, and that is the level's whole population."),
    dict(name="Thesis", definition="The claim the work stands or falls on, carried in the level's graph rather than its text.")],
   [et("asserts", "asserted_by", "Work", "Thesis", "The work asserts the thesis; the thesis is asserted by the work."),
    et("compresses", "compressed_by", "Work", "Part", "The descent edge. One sentence here stands for a part below.")]),
 2: ont(
   [dict(name="Part", definition="A division of the argument. Six of them, each holding two to five units."),
    dict(name="Claim", definition="An assertion a part makes, with an evidence state attached.")],
   [et("compresses", "compressed_by", "Part", "Chapter", "The descent edge."),
    et("precedes", "follows", "Part", "Part", "Reading order. Distinct inverse, and not symmetric: Part I precedes Part II, which follows it."),
    et("carries", "carried_by", "Part", "Claim", "A part carries a claim; the claim is carried by that part.")]),
 3: ont(
   [dict(name="Chapter", definition="A written unit of the book. Sixteen, plus one Introduction, which is a Chapter that opens rather than continues."),
    dict(name="Claim", definition="An assertion a chapter makes."),
    dict(name="Evidence", definition="A number, source or artefact a claim rests on.")],
   [et("compresses", "compressed_by", "Chapter", "Section", "The descent edge, live for chapters 2 and 5 in this pilot."),
    et("precedes", "follows", "Chapter", "Chapter", "Reading order."),
    et("cites", "cited_by", "Chapter", "Chapter", "A cross-reference inside the book. Chapter 1 cites chapter 5 for the full argument; chapter 5 is cited by it."),
    et("backed_by", "backs", "Claim", "Evidence", "Taken from the book's own published edge set rather than invented here.")]),
 4: ont(
   [dict(name="Section", definition="A numbered division of a chapter. Twelve exist in this pilot, across two chapters."),
    dict(name="Claim", definition="An assertion a section makes."),
    dict(name="Evidence", definition="What a claim rests on.")],
   [et("compresses", "compressed_by", "Section", "Passage", "The descent edge into level 5. Passage is the level-5 type and is not lifted here."),
    et("precedes", "follows", "Section", "Section", "Reading order within a chapter."),
    et("backed_by", "backs", "Claim", "Evidence", "As above.")]),
 5: ont(
   [dict(name="Passage", definition="The written text itself. Not lifted: level 5 is the book, and giving it an ontology here would duplicate the book-as-a-graph work proposed in review r002 item 3.")],
   []),
}

def tx(root, classes, note):
    return dict(root=root, classes=classes, note=note)

TAXONOMY = {
 1: tx("Work",
   [dict(id="work", name="Work", parent=None,
         note="The only class, holding the only unit.")],
   "**A taxonomy of one is not a taxonomy.** At the top of the ladder the classification collapses: "
   "there is nothing to distinguish from anything else. Recorded rather than padded out, because an "
   "invented second class here would be schema-first — a category created to make the shape look right."),
 2: tx("Matter",
   [dict(id="argument", name="Argument", parent="Matter", note="Parts that make the case."),
    dict(id="evidence", name="Evidence", parent="Matter", note="Parts that test the case against real graphs."),
    dict(id="disclosure", name="Disclosure", parent="Matter", note="Parts that say what is real and what is designed."),
    dict(id="apparatus", name="Apparatus", parent="Matter", note="Parts that serve the reader rather than the argument.")],
   "Four classes over six units. This is the level where the taxonomy is most useful: enough units to "
   "separate, few enough that every class earns its place."),
 3: tx("Unit",
   [dict(id="argument", name="Argument", parent="Unit", note="Units that advance the thesis."),
    dict(id="prescription", name="Prescription", parent="Unit", note="Units that tell the reader what to do."),
    dict(id="evidence", name="Evidence", parent="Unit", note="Units that show a real graph with real numbers."),
    dict(id="record", name="Record", parent="Unit", note="Units that state what exists, what happened, and what surrounds the work."),
    dict(id="apparatus", name="Apparatus", parent="Unit", note="Units that serve the reader: vocabulary and disclosure.")],
   "Five classes over seventeen units. Note that these are **not** the level-2 classes with more members: "
   "Prescription appears here and has no parent class above it, because at level 2 the rules were absorbed "
   "into Argument. Compression does not just shorten, it re-classifies."),
 4: tx("Move",
   [dict(id="definition", name="Definition", parent="Move", note="Sections that fix what a term means."),
    dict(id="demonstration", name="Demonstration", parent="Move", note="Sections that show the idea working on a concrete case."),
    dict(id="rule", name="Rule", parent="Move", note="Sections that state what to do or not do."),
    dict(id="correction", name="Correction", parent="Move", note="Sections that say where an existing practice goes wrong."),
    dict(id="signpost", name="Signpost", parent="Move", note="Sections that position the reader rather than argue.")],
   "Five classes over twelve sections, and the classes have changed kind entirely: at this altitude a unit "
   "is best described by **what it does to the reader**, not by what kind of matter it is. The taxonomy's "
   "vocabulary is level-dependent, which is the strongest argument in this experiment for keeping one per level "
   "rather than one for the book."),
 5: tx("Passage", [], "Not lifted: level 5 is the book."),
}

# node type and taxonomy class per node
CLASSOF = {
 "L1": ("Work", "work"),
 "L2-1": ("Part", "argument"), "L2-2": ("Part", "argument"), "L2-3": ("Part", "argument"),
 "L2-4": ("Part", "evidence"), "L2-5": ("Part", "disclosure"), "L2-6": ("Part", "apparatus"),
 "L3-intro": ("Chapter", "argument"), "L3-1": ("Chapter", "argument"), "L3-2": ("Chapter", "argument"),
 "L3-3": ("Chapter", "prescription"), "L3-4": ("Chapter", "prescription"),
 "L3-5": ("Chapter", "argument"), "L3-6": ("Chapter", "argument"),
 "L3-7": ("Chapter", "evidence"), "L3-8": ("Chapter", "evidence"), "L3-9": ("Chapter", "evidence"),
 "L3-10": ("Chapter", "evidence"), "L3-11": ("Chapter", "evidence"),
 "L3-12": ("Chapter", "record"), "L3-13": ("Chapter", "record"), "L3-14": ("Chapter", "record"),
 "L3-15": ("Chapter", "apparatus"), "L3-16": ("Chapter", "apparatus"),
 "L4-2-1": ("Section", "definition"), "L4-2-2": ("Section", "demonstration"),
 "L4-2-3": ("Section", "demonstration"), "L4-2-4": ("Section", "rule"),
 "L4-2-5": ("Section", "rule"), "L4-2-6": ("Section", "signpost"),
 "L4-5-1": ("Section", "correction"), "L4-5-2": ("Section", "rule"),
 "L4-5-3": ("Section", "rule"), "L4-5-4": ("Section", "definition"),
 "L4-5-5": ("Section", "rule"), "L4-5-6": ("Section", "definition"),
}

# ---------------------------------------------------------------- level 1
N = {}

def node(nid, level, title, text, book=None, claims=None, note=None):
    N[nid] = dict(id=nid, level=level, title=title, text=text,
                  book=book, claims=claims or [], note=note)

def claim(t, state, ev=None):
    """state: evidenced (a number or source backs it) | argued (the book argues
    it) | unevidenced (asserted, nothing attached yet)."""
    return dict(text=t, state=state, evidence=ev or [])

node("L1", 1, "Meaning Through Connectivity, in one paragraph",
 "[A node carries no inherent meaning: what a thing is emerges from the edges traceable from it, and confidence in that meaning is proportional to how richly it is connected.](L2-1) "
 "[That makes the edge, not the node, the unit of design: every edge a verb with a distinct inverse, the generic association edge banned, and no graph ever rendered whole, only queried.](L2-2) "
 "[It also makes schema-first the mistake to avoid, because merging vocabularies erases the disagreement that parties can safely keep while still agreeing about facts.](L2-3) "
 "[The claim is tested against real graphs with real numbers rather than argued in the abstract.](L2-4) "
 "[Most of the layer described here is proposed rather than shipped, and the book says which is which.](L2-5) "
 "[Terms are given in plain English, and the publisher's interest in the argument is disclosed.](L2-6)",
 claims=[
   claim("Meaning is derived from edges, not carried by nodes.", "argued"),
   claim("Confidence is a function of connectivity.", "argued"),
   claim("The same grammar holds at every altitude (fractal).", "argued",
         ["Stated as falsifiable in chapter 6; not tested in this book"]),
   claim("Most of the semantic layer is designed, not shipped.", "evidenced",
         ["Chapter 12's separation, verifiable by reading the source repository"]),
 ])

# ---------------------------------------------------------------- level 2
node("L2-1", 2, "Part I · The claim",
 "[Two variables both holding 8080 mean different things, because one reaches a type, a library and a pinned version while the other reaches nothing at all.](L3-intro) "
 "[Of the three things people call a graph — network analysis, fast joins, semantics — this book is only the third.](L3-1) "
 "[Five ideas carry the rest: a node alone means nothing; the same value differently connected means different things; nobody has to agree for the overlap to be computable; confidence is a function of connectivity; and a named absence beats a hidden one.](L3-2)",
 claims=[
   claim("The difference between the two variables is in the connectivity, not the value.", "evidenced",
         ["Both are real Python; Safe_UInt__Port is shipped code, not a metaphor"]),
   claim("Nobody has to agree on a definition for compatibility to be computed.", "argued"),
 ])

node("L2-2", 2, "Part II · The grammar",
 "[Five rules you can apply tomorrow: every edge is a verb with a distinct inverse, the generic association edge is banned, paths must read as sentences, rich nodes are good, and you render the result of a query rather than the graph.](L3-3) "
 "[Fifteen established edges with their inverses make the vocabulary pasteable, with nine of the inverse names proposed by this book and marked as such.](L3-4)",
 claims=[
   claim("Inverse asymmetry (owned_by vs owns) is what bounds fan-out.", "argued"),
   claim("Nine of the fifteen inverse names are this book's proposals, not the corpus's.", "evidenced",
         ["Marked row by row in the edge-set table"]),
 ])

node("L2-3", 2, "Part III · The full argument",
 "[Meaning attached to nodes rather than derived from edges is schema-first thinking in graph syntax; the alternative is three layers — shared facts owned by nobody, per-party formulas, declared bridges — with classification as a computed path pattern and corrections that supersede rather than delete.](L3-5) "
 "[The same grammar is claimed to hold at every altitude, which is a falsifiable claim about the seams in a stack, not a metaphor.](L3-6)",
 claims=[
   claim("Merging vocabularies erases the disagreement, which is the valuable part.", "argued"),
   claim("Classification can be moved from a human judgment to a visible formula.", "argued",
         ["Node type formulas are written; no executing implementation exists"]),
   claim("The fractal claim is falsifiable and the book states how.", "argued"),
 ])

node("L2-4", 2, "Part IV · The proof",
 "[Ten worked applications, with their numbers stated so a reader can check them.](L3-7) "
 "[A 59-node risk graph that includes three risks created by the mitigation itself,](L3-8) "
 "[a 51-node instance graph carrying one configuration fact to the board and the regulator,](L3-9) "
 "[one EU AI Act provision traced down and back with five of nine questions left unanswered,](L3-10) "
 "[and Wardley maps read as graphs, with coordinates the reverse of the convention most readers carry.](L3-11)",
 claims=[
   claim("The regulation graph holds 1,523 nodes and 1,944 edges.", "evidenced", ["Live vault, published"]),
   claim("The browser-isolation graph holds 59 nodes and 75 edges, three of them risks of the mitigation.", "evidenced",
         ["Parsed from the brief; the file is published"]),
   claim("The unanswered questions are the output, not a shortfall.", "argued"),
 ])

node("L2-5", 2, "Part V · Reality",
 "[A commit DAG, typed cross-vault edges, a read-only query API and three published vaults ship; the graph database, the path-query language and the RDF layer do not exist anywhere.](L3-12) "
 "[Ten phases from February to August 2026 show the work moving from cryptographic trust chains to a claim about where meaning lives, and the routing failure that kept the philosophy invisible.](L3-13) "
 "[Four sibling sites carry the same argument into keys, identities, control flow and vaults.](L3-14)",
 claims=[
   claim("The commit DAG, merge-base and three-way merge are implemented.", "evidenced",
         ["Verifiable by reading the source repository"]),
   claim("No graph database exists anywhere in the work.", "evidenced",
         ["Stated in chapter 12; MGraph-DB is not a dependency"]),
   claim("The philosophy documents are not routed from the file agents start at.", "evidenced",
         ["Ask N1, open since 11 June 2026"]),
 ])

node("L2-6", 2, "Part VI · Appendices",
 "[Every technical term has a plain-English alternative beside it.](L3-15) "
 "[The publisher builds the products this book argues for, and the places where the approach loses are listed by the publisher rather than left to a critic.](L3-16)",
 claims=[
   claim("Concept and term are different objects; meaning is never stored in a term.", "argued"),
   claim("The participant disclosure names where the approach loses.", "evidenced", ["Chapter 16"]),
 ])

# ---------------------------------------------------------------- level 3
node("L3-intro", 3, "Introduction", 
 "Two variables in a Python program both hold 8080. One is an int, and that is the whole graph. The other is a type carrying a range constraint, which reaches a library, a pinned version, its tests, its repository, its licence and its maintainer. The difference is not in the value: the meaning is identical in the developer's head and radically different in the graph, and the graph is what another system, another team or an agent has to work from. Expertise takes 10,000 hours, a claim carried through 242 papers and more than 200,000 citation paths back to a 1993 study that said something else. A document cannot fix that. A graph can: mark the claim superseded from a date, then ask which conclusions were resting on it.",
 book="../book/introduction.html",
 claims=[
   claim("The 10,000-hours claim was an average, not a threshold, and half the top group had not reached it.", "evidenced",
         ["1993 Berlin violin study; Greenberg, BMJ 2009 for the citation network (PubMed 19622839)"]),
   claim("242 papers and 200,000+ citation paths carried it.", "evidenced", ["Greenberg, BMJ 2009"]),
   claim("A graph can propagate the correction where a document cannot.", "argued"),
 ])

node("L3-1", 3, "1 · Why graphs at all",
 "People mean three different things by graph: network analysis, fast joins, and semantics. This book is only the third. GraphRAG traverses knowledge rather than guessing it, but traversal needs edges to exist, and where the graph is thin, similarity search wins. RDF is a fine way to hand a graph to somebody else and a poor place to put the meaning, so the honest position is both, at different layers. Properties may carry data; they may never carry meaning.",
 book="../book/ch-01-why-graphs-at-all.html")

node("L3-2", 3, "2 · The five ideas",
 "[A node is just a node: a label is not a meaning, and a node connected to nothing is literally meaningless.](L4-2-1) "
 "[The same value, differently connected, means different things, which is why the difference is never in the value itself.](L4-2-2) "
 "[Five teams each call something a Review, and none of them has to agree for the overlap between them to be computable.](L4-2-3) "
 "[Confidence is a function of connectivity, and the remedy for low confidence is enrichment, never enforcement.](L4-2-4) "
 "[Three of ten pieces of evidence is information, so a named absence beats a hidden one.](L4-2-5) "
 "[That is altitude one, and the rest of the book descends from it.](L4-2-6)",
 book="../book/ch-02-the-five-ideas.html",
 claims=[
   claim("A node with no edges carries no meaning.", "argued"),
   claim("Compatibility is a spectrum, asymmetric and purpose-relative.", "argued"),
   claim("The chapter carries five ideas; the foundational source lists ten principles.", "evidenced",
         ["Thinking in Graphs (5 February 2026), Summary: Core Principles; addendum 01"]),
 ])

node("L3-3", 3, "3 · The rules you can apply tomorrow",
 "Every edge is a verb, and every verb has a distinct inverse that is not the same edge walked backwards: owned_by and owns have different fan-out, and that asymmetry is what stops the graph exploding. The generic association edge is banned, because everything relates to everything, so it constrains nothing and costs fan-out. If a path does not read as a sentence in the reader's own language, the edges are wrong. Rich nodes are good: the blob is a rendering failure, not a modelling one. And never render the whole graph — render the result of a query.",
 book="../book/ch-03-the-rules-you-can-apply-tomorrow.html")

node("L3-4", 3, "4 · The edge set",
 "Fifteen established edges with their inverses, the node types from the two most complete worked graphs, and the rules for extending the set: a new edge needs a sentence, its inverse needs a different sentence, and both need a stated domain and range. Nine of the inverse names are proposed by this book rather than quoted from the corpus, and the table marks which, because the glossary that would settle them does not exist.",
 book="../book/ch-04-the-edge-set.html")

node("L3-5", 3, "5 · Against schema-first",
 "[The Semantic Web identified the right problem and made a subtle mistake in practice: meaning ended up attached to nodes rather than derived from edges, which is schema-first thinking dressed in graph syntax.](L4-5-1) "
 "[So do not merge vocabularies, because merging erases the disagreement; keep three layers instead — shared facts owned by nobody, per-party formulas, declared bridges.](L4-5-2) "
 "[Stop asking a human whether something is a vulnerability and write the formula instead.](L4-5-3) "
 "[The grounding ladder says downward grounds and upward implies, and it is one formula among possible others.](L4-5-4) "
 "[Supersede, never delete, so that a correction can be asked what was resting on it.](L4-5-5) "
 "[And the unit of meaning is a concept, not a word, which is why a nuance survives translation.](L4-5-6)",
 book="../book/ch-05-against-schema-first.html",
 claims=[
   claim("The Semantic Web attached meaning to nodes rather than deriving it from edges.", "argued",
         ["Part 4 of Thinking in Graphs names schema.org, SKOS, Dublin Core and PROV-O"]),
   claim("Parties can disagree about meaning while agreeing about facts.", "argued"),
   claim("Judgment moves into a visible, versioned formula rather than disappearing.", "argued"),
 ])

node("L3-6", 3, "6 · A graph at every boundary",
 "Fractal here is a precise claim rather than a metaphor: one grammar, one validator, one provenance rule at every altitude, so that zooming into any node expands it into a graph obeying identical rules. It is falsifiable, and the chapter says how to falsify it. Meaning is lost and re-guessed at every seam of an AI stack, which is where the cost actually shows up. Documents are projections of graphs. And twins are where the graph stops modelling and touches reality.",
 book="../book/ch-06-a-graph-at-every-boundary.html")

node("L3-7", 3, "7 · Worked graphs, with real numbers",
 "Ten real applications with their numbers stated so a reader can check them: browser isolation at 59 nodes and 75 edges, the 2FA instance graph at 51 and 53, Article 26(5) end to end, AWS IAM closures, browser extensions, and the live EU AI Act regulation graph at 1,523 nodes and 1,944 edges, with eleven views including a SQLite interface, an RDF/Turtle export and a graph REPL, parsed deterministically from official XML with every element hash-verified to source bytes.",
 book="../book/ch-07-worked-graphs-with-real-numbers.html")

node("L3-8", 3, "8 · Whose session is the agent using?",
 "Should an AI agent browse inside the user's own browser or an isolated one? The question is answered as computed reach rather than adjectives: a 59-node, 75-edge risk graph parsed from a brief, including three risks created by the mitigation itself. That is the graph's value here — the mitigation's own risks sit in the same structure as the risks it removes, which no adjective-based assessment surfaces.",
 book="../book/ch-08-whose-session-is-the-agent-using.html")

node("L3-9", 3, "9 · The 2FA instance graph",
 "Two admin accounts without two-factor authentication, carried from a single configuration fact to the board and the regulator through 51 nodes and 53 edges. It is the only artefact in the book that is both a complete narrative and a machine-readable file, which is the point: one structure serves the reader and the machine with no translation step between them.",
 book="../book/ch-09-the-2fa-instance-graph.html")

node("L3-10", 3, "10 · Article 26(5), fact to board and back",
 "One EU AI Act provision, one deployment, carried from a running system up to a board decision and back down. Nine question nodes, five of them unanswered — and the unanswered five are the actual output of the exercise. The graph's job was to name what nobody had answered, rather than produce a confident summary that hid it.",
 book="../book/ch-10-article-26-5-fact-to-board-and-back.html")

node("L3-11", 3, "11 · Wardley maps as graphs",
 "A graph says these things are connected; a map adds where they sit. Wardley maps read cleanly as graphs, with one trap that will bite on day one: the coordinates are visibility and evolution, the reverse of the convention most readers carry into the exercise.",
 book="../book/ch-11-wardley-maps-as-graphs.html")

node("L3-12", 3, "12 · What ships, what is argued",
 "This book's subject matter is almost entirely design, and saying so is the reason the rest is worth reading. Verifiable by reading code: a content-addressed commit DAG with multi-parent commits, a real merge-base and three-way merge, typed cross-vault edges, a read-only query API exposed to untrusted sandboxed apps, and three published vaults. Does not exist anywhere: any graph database, MGraph-DB as a dependency, browser SPARQL or Cypher, RDF in the code, the path-query language, and commit signing, which is written and only ever null.",
 book="../book/ch-12-what-ships-what-is-argued.html")

node("L3-13", 3, "13 · Origins: 2026",
 "Ten phases from February to August 2026, dated from filenames and git rather than memory. The work moved from cryptographic trust chains to a claim about where meaning lives. The three canonical philosophy documents sit in a library folder, are referenced by four files, and are not referenced from the file every agent starts from: a routing failure rather than a comprehension failure, which is why the fix is an address.",
 book="../book/ch-13-origins-2026.html")

node("L3-14", 3, "14 · The network",
 "Four sibling sites carry the same argument into different material: a public key means nothing alone; the Semantic Web's verification gap means graphs need identities too; control-flow graphs and the WAF Achilles heel; and a vault that is itself a graph. The reciprocal bridge pages that would make the philosophy linkable from each of them are still open asks.",
 book="../book/ch-14-the-network.html")

node("L3-15", 3, "15 · Glossary",
 "Every technical term with a plain-English alternative beside it. Two distinctions do most of the work: a concept is the language-independent unit of meaning while a term is one language's label, so meaning is never stored in a term; and a taxonomy points upward, broader to narrower, while an ontology points outward, naming what types exist and how they may connect.",
 book="../book/ch-15-glossary.html")

node("L3-16", 3, "16 · The author's interest, and where this loses",
 "The book is published by the project that builds the vault layer and the graph products it argues for, and that disclosure sits on its own page rather than in a footnote. It lists where the approach loses: where a document beats a graph, where the discipline costs more than it returns, and where a reader should not adopt it.",
 book="../book/ch-16-the-author-s-interest-and-where-this-loses.html")

# ---------------------------------------------------------------- level 4
def l4(nid, title, text, book, claims=None):
    node(nid, 4, title, text, book=book, claims=claims)

l4("L4-2-1", "A node is just a node",
   "A label is not a meaning. `Review` as a node with no edges tells a reader nothing about which of five processes it belongs to, who may run it, or what it produces. Connected to nothing, it is literally meaningless, and the fix is edges rather than a better name.",
   "../book/ch-02-the-five-ideas.html#node",
   [claim("A label is not a meaning.", "argued")])
l4("L4-2-2", "The same value, differently connected",
   "`port = 8080` reaches an int and stops. `port = Safe_UInt__Port(8080)` reaches a type carrying a range constraint, a library, a pinned version, its tests, its repository, its licence and its maintainer. The meaning is identical in the developer's head and radically different in the graph.",
   "../book/ch-02-the-five-ideas.html#connectivity",
   [claim("Safe_UInt__Port is real shipped code, not an illustration.", "evidenced",
          ["The type exists in the source library"])])
l4("L4-2-3", "Five teams, five processes, one word",
   "Five teams each call something a Review and mean five different processes. Nobody has to agree on a shared definition for the overlap to be computable: compatibility turns out to be non-binary, asymmetric and purpose-relative, computed from the edges rather than declared in a standard.",
   "../book/ch-02-the-five-ideas.html#five-reviews",
   [claim("Compatibility is computed, not declared.", "argued",
          ["Principle 6 of the foundational source, absent from this chapter"])])
l4("L4-2-4", "Confidence is a function of connectivity",
   "Confidence runs from no edges, through a few local edges, typed definitions, anchor nodes and external references, to rich multi-hop connectivity. The remedy for low confidence is enrichment, adding edges, never enforcement, adding rules: the graph grows rather than constrains.",
   "../book/ch-02-the-five-ideas.html#confidence",
   [claim("Enrichment, not enforcement.", "argued",
          ["Principle 8 of the foundational source, stated here but not named as a principle"])])
l4("L4-2-5", "Three of ten pieces of evidence is information",
   "Three of ten is information, not a failure. \"We cannot confirm Z\" is a better answer than a guess, because a named absence can be queried, assigned and closed, while a hidden one silently supports whatever rests on it.",
   "../book/ch-02-the-five-ideas.html#gaps",
   [claim("Honest uncertainty is the default posture.", "argued",
          ["Principle 7 of the foundational source"])])
l4("L4-2-6", "That is altitude one",
   "Altitude one is the city walls: enough to act on without any of the grammar below it. The rest of the book descends — roads and buildings in the grammar, people and cars in the full argument.",
   "../book/ch-02-the-five-ideas.html#next")

l4("L4-5-1", "Against schema-first, and the Semantic Web's mistake",
   "The Semantic Web community identified the right problem — how independent parties exchange meaning without agreeing on everything upfront — and produced genuinely useful reference vocabularies. The mistake was in practice: meaning ended up attached to nodes rather than derived from edges, so each node became a little document describing itself. That is schema-first thinking dressed in graph syntax.",
   "../book/ch-05-against-schema-first.html#schema-first",
   [claim("The Semantic Web identified the right problem.", "argued"),
    claim("schema.org, SKOS, Dublin Core and PROV-O are the useful outputs.", "evidenced",
          ["Named in Part 4 of the foundational source"])])
l4("L4-5-2", "Don't merge vocabularies",
   "Merging two vocabularies erases the disagreement, which is usually the most valuable thing present. Three layers keep it: shared facts owned by nobody, per-party formulas over those facts, and declared bridges between them. Parties can disagree about meaning while agreeing about facts, which is the only stable basis for working together.",
   "../book/ch-05-against-schema-first.html#ontologies",
   [claim("Merging erases the disagreement.", "argued")])
l4("L4-5-3", "Classification is a query, not a judgment",
   "Stop asking a human \"is this a vulnerability?\" and write the formula: a Vulnerability is a Fact that also has an upward `gives_rise_to` path to a Risk. Judgment does not disappear; it moves out of the classifier's head into a formula that is visible, versioned and arguable.",
   "../book/ch-05-against-schema-first.html#formulas",
   [claim("Node type formulas make judgment visible and arguable.", "argued",
          ["Written as design; no executing implementation exists"])])
l4("L4-5-4", "The grounding ladder",
   "Downward grounds and upward implies: a claim is grounded by what it rests on, and implies what rests on it. The ladder is one formula among possible others, and the chapter says so rather than presenting it as the only one.",
   "../book/ch-05-against-schema-first.html#ladder",
   [claim("The ladder is one formula among others.", "argued")])
l4("L4-5-5", "Supersede, never delete",
   "A superseded claim is marked from a date; it is not removed. Removing it destroys the thing you most need: the record that something once rested on it. The question a correction must be able to ask is which conclusions were resting on the thing just corrected.",
   "../book/ch-05-against-schema-first.html#supersede",
   [claim("Deleting a claim destroys the record of what rested on it.", "argued")])
l4("L4-5-6", "A nuance survives translation",
   "The unit of meaning is a concept, not a word: language-independent, carrying one preferred label per language plus alternates, related to other concepts as broader, narrower or related. A nuance survives translation because it was never stored in a word in the first place.",
   "../book/ch-05-against-schema-first.html#concepts",
   [claim("Meaning must never be stored in a term.", "argued")])

# ---------------------------------------------------------------- findings
FINDINGS = [
 dict(kind="contradiction", title="The book says both that there is no query engine and that there is one",
  state="open", because="A correction is proposed and awaits agreement; until the wording lands, a reader can still meet both sentences and believe the book contradicts itself.",
  detail="At level 3 the paragraph for chapter 12 (\"no graph database, no browser SPARQL or Cypher, no RDF in the code\") "
         "sits four units from the paragraph for chapter 7 (\"eleven views including a SQLite interface, an RDF/Turtle export "
         "and a graph REPL\"). Both sentences are true — one describes the codebase, the other describes a published vault — "
         "but compressed onto one page they read as a contradiction, and a reader of the full book meets them forty pages apart.",
  where=["L3-12", "L3-7"],
  verdict="Open. This is exactly the correction the reviewer asked for in review r001 item 5, reached independently by climbing "
          "the ladder rather than by being told. The compression is what made it visible."),
 dict(kind="repeat", title="The Semantic Web's mistake is stated twice, in two parts",
  state="accepted", because="Deliberate altitude repetition, signposted in the text: chapter 1 states it and points at chapter 5 for the argument. Repetition across altitudes is the book's design, not a defect, and removing it would make chapter 1 incomplete for a reader who stops there.",
  detail="Chapter 1 carries the mistake in one paragraph with a pointer to the full treatment; chapter 5's first section is the "
         "full treatment. At level 3 the two paragraphs say nearly the same sentence. Climbing to level 2 forced a choice, and "
         "Part III took it — which means Part I's own summary leans on a claim that Part III owns.",
  where=["L3-1", "L3-5", "L2-3"],
  verdict="Legitimate as written: deliberate altitude repetition, signposted in the text. Worth noting that compression makes "
          "the ownership question decidable, where prose leaves it ambiguous."),
 dict(kind="compression-loss", title="Five ideas, from a source that lists ten principles",
  state="open", because="The chapter audit has not run yet. Three of the missing five are present in the prose without being named as principles, which is a fixable gap rather than a disagreement.",
  detail="Climbing from level 4 to level 3 in chapter 2 loses nothing, because the chapter only ever had five. The loss happened "
         "below level 5, between the foundational source document and the book: the source's summary lists ten core principles. "
         "Three of the missing five are still present in this chapter's prose without being named as principles (compatibility "
         "computed not declared, honest uncertainty, enrichment not enforcement); two are absent (cross-graph edges as "
         "first-class, no node aware of how it is used).",
  where=["L3-2", "L4-2-3", "L4-2-4", "L4-2-5"],
  verdict="Open, and now localised. Review r001 item 3 asked which chapters were diluted relative to their sources; the ladder "
          "says where on the ladder the dilution happened, which is a more useful answer than which chapter."),
 dict(kind="weight", title="Compressed honestly, the book's top paragraph has no room for \"fractal\"",
  state="accepted", because="Accepted with a condition rather than closed: the title decision was taken knowing this, and the fractal treatment grows in the v0.4.0 identity release. If v0.4.0 ships without the interior growing, this returns to open, because then the cover would promise what the text does not carry.",
  detail="Level 1 was built bottom-up from level 2, and fractal did not survive the climb: it holds six mentions in one chapter "
         "and one elsewhere, so it entered level 2 as a single clause inside Part III and was squeezed out at level 1. It appears "
         "in the level 1 graph as a claim, but not in the level 1 text.",
  where=["L1", "L2-3", "L3-6"],
  verdict="Evidence for an open decision. Review r001 item 2 warns that retitling to Fractal Semantic Graphs without growing the "
          "fractal treatment puts a promise on the cover the interior underdelivers. The ladder turns that warning into a test: "
          "the title is right when the one-paragraph version of the book cannot be written without the word."),
 dict(kind="concept", title="The position the book argues against is one of its strongest nodes",
  state="accepted", because="The metric is measuring connectivity, which is what it claims to measure. A book of arguments has its antagonist as a centre of gravity, and a strength score that hid that would be measuring agreement instead.",
  detail="Adding the concept layer produced a ranking nobody chose: strength is a stated formula over the "
         "edges, and **schema-first thinking** — the thing this book exists to argue against — comes out among "
         "the peaks, level with confidence-is-a-function-of-connectivity. It earns that place honestly: five "
         "separate concepts define themselves partly by opposing it, so the edges genuinely converge there.",
  where=["L2-3", "L3-5", "L4-5-1"],
  verdict="Worth keeping rather than tuning away. A book of arguments will always have its antagonist as a "
          "centre of gravity, and a strength metric that hid that would be measuring agreement rather than "
          "connectivity. It does carry one caution for the evidence layer: **a strong node is not a supported "
          "one.** Schema-first has high connectivity and, by design, no evidence attached — the two axes are "
          "independent, and any future ranking that conflates them will overstate whatever the book repeats "
          "most often."),
 dict(kind="classification", title="Compression does not just shorten, it re-classifies",
  state="accepted", because="A result rather than a defect. The classes are level-dependent by nature, and forcing one vocabulary across all levels would be the schema-first move this book argues against.",
  detail="Giving each level its own taxonomy was meant to be bookkeeping. It produced a result instead. The "
         "classes do not survive the climb: a section classed **Rule** at level 4 sits inside a chapter classed "
         "**Prescription** at level 3, inside a part classed **Argument** at level 2. Nothing inherits. And the "
         "vocabulary changes kind, not just granularity: at level 4 a unit is best described by what it does to the "
         "reader (definition, demonstration, rule, correction, signpost), while at level 2 it is best described by "
         "what kind of matter it is (argument, evidence, disclosure, apparatus). At level 1 the taxonomy collapses "
         "entirely, because a taxonomy of one unit is not a taxonomy.",
  where=["L1", "L2-3", "L3-3", "L4-5-2"],
  verdict="A result, not a defect, and it argues against a single book-wide ontology. One taxonomy imposed across "
          "all levels would have to be either too coarse to classify sections or too fine to classify parts. Each "
          "level earning its own vocabulary is the fractal claim behaving as advertised: the same grammar (verbs "
          "with inverses, stated domain and range) at every altitude, with different vocabularies inside it. It also "
          "gives review r002 item 3 a warning it did not have: the book-as-a-graph pilot should expect its node "
          "types to be level-dependent rather than universal."),
 dict(kind="cross-estate", title="Two sibling sites publish the same graph with different numbers",
  state="open", because="Ask N15 is unanswered, and 141 does not divide cleanly into two-entry relationships, so neither convention can be adopted until the sibling estate explains the remainder.",
  detail="This book reports the issue tracker's own graph as **71 nodes and 141 edges** in four places, adding "
         "\"edges stored bidirectionally\" in two of them. The Issues-FS site, published 22 August 2026, reports the "
         "same graph as **141 link entries across 71 nodes, for roughly 70 logical relationships**, because a link is "
         "written to both endpoints by design: one `link` command produces two entries. Both estates measured the same "
         "repository and neither is careless. The gap is a convention: this book counts a directed verb as an edge, "
         "which is its own grammar's rule that an inverse is not the same edge walked backwards, while the sibling "
         "counts relationships and says so. A reader who counts relationships and a reader who counts entries will "
         "disagree by a factor of two.",
  where=["L3-7", "L3-12"],
  verdict="Open, and the first finding to arrive from outside the book rather than from the climb. Proposed fix, for "
          "review r001 item 8: report both, as \"71 nodes, 141 link entries, roughly 70 relationships (each link is "
          "stored on both endpoints)\", which is truthful under either convention and teaches the denormalisation in "
          "passing. One reconciliation is still open and is ask N15: 141 is odd, so it does not divide cleanly into "
          "two-entry relationships, and only the sibling estate can say why."),
 dict(kind="control", title="A contradiction the book already narrates, which the method correctly does not flag as new",
  state="accepted", because="Disclosed in the text where it occurs, with the reasoning. It is kept as the control case that shows the method distinguishes a hidden contradiction from a stated one.",
  detail="Chapter 3 bans the generic association edge, then names the project's own live configuration shipping a relates-to pair "
         "with one edge instance using it. The ladder surfaces the tension; the book had already disclosed it deliberately, in the "
         "same chapter, with the reasoning.",
  where=["L3-3"],
  verdict="No action, and kept here on purpose: it is the control case showing that the method distinguishes a hidden "
          "contradiction from a disclosed one. A finding process that flagged this as a discovery would be over-reporting."),
]

# ---------------------------------------------------------------- the concepts
# The ontology above types the UNITS (what kind of chunk of book is this?). It says
# nothing about the ideas the units carry, which is the layer review r004's second
# round asked for: a dictionary (what does this concept mean?) crossed with a
# thesaurus (what is it called, and what is it near but not the same as?), and edges
# between concepts that are verbs with distinct inverses rather than a bag of
# "related" links. A concept also crosses the altitude ladder sideways: it appears in
# units at several levels at once, which is the intersection the ladder alone cannot
# show.

CONCEPT_EDGES = [
 et("grounds", "grounded_by", "Concept", "Concept",
    "A is what B rests on. Reading down a grounds chain reaches the assumptions."),
 et("specialises", "generalises", "Concept", "Concept",
    "A is the narrower case of B. This is the taxonomy axis of the concept layer."),
 et("constrains", "constrained_by", "Concept", "Concept",
    "A limits how B may be used. Not the same as grounding: a constraint can be dropped and leave B standing."),
 et("enables", "enabled_by", "Concept", "Concept",
    "A is what makes B possible in practice."),
 et("opposes", "opposed_by", "Concept", "Concept",
    "A is the position this work takes against B. Named rather than merged, per the book's own rule."),
 et("appears_in", "carries", "Concept", "Unit",
    "The crossing edge: a concept appears in a unit of the ladder; that unit carries it."),
 et("demonstrated_by", "demonstrates", "Concept", "Evidence",
    "A published artefact that shows the concept working, rather than an argument that it would."),
]

def c(cid, label, definition, also=None, near=None, edges=None, units=None, shown=None):
    return dict(id=cid, label=label, definition=definition, also_called=also or [],
                near_but_not=near or [], edges=edges or [], units=units or [],
                demonstrated_by=shown or [])

V = "../vaults/"
CONCEPTS = [
 c("meaning-through-connectivity", "Meaning through connectivity",
   "What a thing **is** emerges from the edges traceable from it, not from anything stored inside it. The node is the address; the edges are the meaning.",
   ["the thesis", "the title after the colon"],
   ["semantic search — which infers meaning from similarity rather than deriving it from structure"],
   [("grounded_by", "node-alone-means-nothing"), ("grounded_by", "confidence-from-connectivity"),
    ("enables", "classification-as-query"), ("constrains", "properties-carry-data-not-meaning")],
   ["L1", "L2-1", "L3-intro", "L3-2", "L4-2-1", "L4-2-2"],
   [V + "voice-debrief/junction.html"]),
 c("node-alone-means-nothing", "A node alone means nothing",
   "A label is not a meaning. A node with no edges cannot be distinguished from any other node carrying the same label, so it carries no information at all.",
   ["a node is just a node"],
   ["an empty node — which has a type and a place, and is therefore not the same thing"],
   [("grounds", "meaning-through-connectivity"), ("grounds", "confidence-from-connectivity")],
   ["L1", "L2-1", "L3-2", "L4-2-1"], []),
 c("confidence-from-connectivity", "Confidence is a function of connectivity",
   "How much a claim can be trusted is computable from how richly it is connected: no edges, local edges, typed definitions, anchor nodes, external references, rich multi-hop paths.",
   ["the confidence ladder"],
   ["probability — the ladder is not a likelihood, it is a reachability measure"],
   [("grounds", "meaning-through-connectivity"), ("enables", "enrichment-not-enforcement"),
    ("enabled_by", "provenance-chain")],
   ["L1", "L2-1", "L3-2", "L4-2-4"], []),
 c("enrichment-not-enforcement", "Enrichment, not enforcement",
   "When confidence is low the remedy is adding edges, never adding rules. The graph grows; it does not constrain.",
   ["the graph grows, it doesn't constrain"],
   ["validation — which is enforcement wearing a helpful name"],
   [("grounded_by", "confidence-from-connectivity"), ("opposes", "schema-first")],
   ["L3-2", "L4-2-4"], []),
 c("named-absence", "A named absence beats a hidden one",
   "Three of ten pieces of evidence is information. An absence that is stated can be queried, assigned and closed; an absence that is hidden silently supports whatever rests on it.",
   ["honest uncertainty", "the ghosted node"],
   ["a missing value — which is the absence of a record, not a recorded absence"],
   [("grounded_by", "confidence-from-connectivity"), ("enables", "provenance-chain")],
   ["L1", "L2-1", "L3-2", "L4-2-5"],
   [V + "voice-debrief/absence.html"]),
 c("edge-is-a-verb", "Every edge is a verb with a distinct inverse",
   "An edge is named as a verb, and its inverse is a **different** verb rather than the same edge walked backwards: `owned_by` and `owns` have different fan-out, and that asymmetry is what bounds traversal.",
   ["the grammar rule", "verb edges"],
   ["a labelled edge — a label is not yet a verb, and a verb without a distinct inverse is half an edge"],
   [("grounds", "path-reads-as-a-sentence"), ("constrains", "banned-generic-edge"),
    ("enables", "render-the-query")],
   ["L1", "L2-2", "L3-3", "L3-4"], []),
 c("banned-generic-edge", "The generic association edge is banned",
   "`relates-to` is refused because everything relates to everything: it constrains nothing, costs fan-out, and is what you reach for when you have not yet decided what you mean.",
   ["no relates-to"],
   ["a weak edge — which still says something, where a generic edge says nothing"],
   [("constrained_by", "edge-is-a-verb"), ("specialises", "edge-is-a-verb")],
   ["L1", "L2-2", "L3-3"], []),
 c("path-reads-as-a-sentence", "A path must read as a sentence",
   "If a traversal does not read as natural language in the reader's own tongue, the edges are wrong. The test is linguistic because the failure is semantic.",
   ["the sentence test"],
   ["a readable label — the test is over a whole path, not one edge"],
   [("grounded_by", "edge-is-a-verb"), ("enables", "bidirectional-paths")],
   ["L2-2", "L3-3"], []),
 c("bidirectional-paths", "Both directions carry a name",
   "Because every edge names its inverse, a path can be walked and read in either direction, and the reading changes: down a grounds chain reaches assumptions, up it reaches consequences.",
   ["walk it both ways"],
   ["an undirected edge — which has no reading at all"],
   [("grounded_by", "path-reads-as-a-sentence"), ("enables", "classification-as-query")],
   ["L2-2", "L3-3", "L3-4"], []),
 c("render-the-query", "Never render the whole graph",
   "You render the **result of a query**, never the graph itself. Build wide, find the few, then flip. A rendered graph past a few hundred nodes is a picture of nothing.",
   ["build wide, find the few, flip"],
   ["filtering — which hides what it does not show; a query states what it asked"],
   [("enabled_by", "edge-is-a-verb"), ("constrains", "projection")],
   ["L1", "L2-2", "L3-3"], []),
 c("fractal", "The same grammar at every altitude",
   "One grammar, one validator, one provenance rule at every level of zoom: expand any node and the thing inside obeys identical rules. Stated as falsifiable, not as a metaphor.",
   ["fractal semantic graphs", "graphs of graphs of graphs", "G3"],
   ["self-similar visuals — the claim is about rules, not about how the picture looks"],
   [("grounds", "junction-rule"), ("constrains", "meaning-through-connectivity")],
   ["L2-3", "L3-6"],
   [V + "voice-debrief/junction.html"]),
 c("junction-rule", "Join at the node layer, never document to document",
   "To connect two bodies of text, lift **both** into typed nodes first and join at an intermediate layer. A document-to-document link is only as good as the sentence somebody wrote around it.",
   ["node-to-node", "the junction"],
   ["a citation — which points at a document and stops"],
   [("grounded_by", "fractal"), ("enables", "twin-attachment"), ("opposes", "schema-first")],
   ["L3-6"],
   [V + "voice-debrief/junction.html"]),
 c("twin-attachment", "Obligations attach at the twin",
   "A duty binds the running instance and its telemetry, not the paragraph in the register beside it. The graph attaches the obligation where it actually bites.",
   ["attach at the instance"],
   ["a control mapping — which attaches to a document about the thing"],
   [("enabled_by", "junction-rule")],
   ["L3-6", "L3-10"],
   [V + "voice-debrief/junction.html"]),
 c("schema-first", "Schema-first thinking",
   "Deciding in advance what types exist and requiring everything to conform, so that meaning is attached **to nodes** rather than derived from edges. The position this book takes a stand against.",
   ["conform-first", "the Semantic Web's practical mistake"],
   ["having a schema at all — the objection is to the direction of authority, not to structure"],
   [("opposed_by", "meaning-through-connectivity"), ("opposed_by", "dont-merge-vocabularies")],
   ["L2-3", "L3-5", "L4-5-1"], []),
 c("dont-merge-vocabularies", "Merging erases the disagreement",
   "Two parties' vocabularies are kept intact and bridged, because the disagreement between them is usually the most valuable thing present. Three layers: shared facts owned by nobody, per-party formulas, declared bridges.",
   ["keep both senses", "divergence as output"],
   ["translation — which produces one text where there were two positions"],
   [("opposes", "schema-first"), ("enabled_by", "anchor-nodes"), ("grounds", "compatibility-computed")],
   ["L1", "L2-3", "L3-5", "L4-5-2"],
   [V + "voice-debrief/absence.html"]),
 c("anchor-nodes", "Reference without authority",
   "A shared vocabulary node others **may** link to, rather than a definition they **must** conform to. Interoperability without conformity; partial mapping is normal.",
   ["the lexicon", "bridge nodes"],
   ["a canonical model — which is an anchor that acquired authority"],
   [("enables", "dont-merge-vocabularies"), ("opposed_by", "schema-first")],
   ["L3-5", "L3-15"], []),
 c("compatibility-computed", "Compatibility is computed, not declared",
   "Whether two things can work together is a spectrum, asymmetric and purpose-relative, computed from the edges — not a boolean somebody asserts in a standard.",
   ["a spectrum, not a boolean"],
   ["conformance testing — which asks whether one thing matches a fixed target"],
   [("grounded_by", "dont-merge-vocabularies"), ("grounded_by", "meaning-through-connectivity")],
   ["L2-1", "L3-2", "L4-2-3"], []),
 c("classification-as-query", "Classification is a query, not a judgment",
   "A node type is a **formula over paths**: a Vulnerability is a Fact with an upward `gives_rise_to` path to a Risk. Judgment does not disappear; it moves out of a head and into something visible, versioned and arguable.",
   ["node type formulas", "the content does not decide the type, the paths do"],
   ["tagging — which records a judgment instead of computing one"],
   [("enabled_by", "meaning-through-connectivity"), ("enabled_by", "bidirectional-paths")],
   ["L2-3", "L3-5", "L4-5-3"], []),
 c("supersede-never-delete", "Supersede, never delete",
   "A corrected claim is marked from a date and kept, because removing it destroys the record of what was resting on it. The question a correction must be able to ask is: what rested on this?",
   ["mark it, keep it"],
   ["versioning — which keeps the old text without keeping what depended on it"],
   [("grounds", "provenance-chain"), ("enabled_by", "two-identities")],
   ["L2-3", "L3-5", "L4-5-5"],
   [V + "regulation-graph/provenance.html"]),
 c("two-identities", "Two identities for one thing",
   "A positional identity that survives renumbering and a content identity that moves with the wording, so a citation can outlive an amendment without pretending the text is unchanged.",
   ["positional hash and content hash"],
   ["a version number — one identity trying to do two jobs"],
   [("enables", "supersede-never-delete"), ("enables", "provenance-chain")],
   ["L3-6"],
   [V + "voice-debrief/junction.html"]),
 c("provenance-chain", "A claim is worth its chain of custody",
   "Claim, graph node, file, commit, official source with the hash of the retrieved bytes. Every link walkable by a reader who holds nothing privileged.",
   ["chain of custody", "end-to-end provenance"],
   ["a citation list — which names sources without making them checkable"],
   [("grounded_by", "supersede-never-delete"), ("enables", "confidence-from-connectivity")],
   ["L3-intro", "L3-7", "L3-12"],
   [V + "regulation-graph/provenance.html"]),
 c("ephemeral-engines", "The file system is the source of truth",
   "Query engines are loaded on demand over files and thrown away. There is no live database anywhere, and that is an architectural position rather than a purity claim: an engine with no state of its own cannot drift.",
   ["no live databases", "the browser is the database"],
   ["no databases at all — the corrected claim is narrower and stronger"],
   [("constrains", "projection"), ("enabled_by", "provenance-chain")],
   ["L2-5", "L3-7", "L3-12"],
   [V + "regulation-graph/engines.html"]),
 c("projection", "Documents are projections of graphs",
   "A page, a chapter, a PDF and a slide are renderings of one underlying structure. Change the structure and every projection follows; change a projection and you have created a fork.",
   ["render, do not author twice"],
   ["export — which copies a document rather than deriving it"],
   [("constrained_by", "render-the-query"), ("enabled_by", "meaning-through-connectivity")],
   ["L3-6", "L3-12"], []),
 c("properties-carry-data-not-meaning", "Properties may carry data, never meaning",
   "A property may hold a timestamp. It may not hold the answer to *what kind of thing is this?*, because that answer is a query over edges.",
   ["properties are just words"],
   ["property graphs — which are a storage model, not the objection"],
   [("constrained_by", "meaning-through-connectivity"), ("grounds", "classification-as-query")],
   ["L3-1", "L2-1"], []),
]

# ---------------------------------------------------------------- cross-references
# Chapter-to-chapter links, measured from the markdown rather than asserted, so the
# cross-layer edges in the graph view stay true as the book changes. A cites edge is a
# real anchor in the text: "the full argument is at altitude 3" is one.
CHAPTER_FILE = {
 "why-graphs": "L3-1", "start": "L3-2", "grammar": "L3-3", "grammar-edge-set": "L3-4",
 "depth": "L3-5", "depth-boundaries": "L3-6", "examples": "L3-7",
 "examples-browser-isolation": "L3-8", "examples-2fa": "L3-9",
 "examples-article-26-5": "L3-10", "maps": "L3-11", "shipped": "L3-12",
 "origins": "L3-13", "network": "L3-14", "glossary": "L3-15", "about-participant": "L3-16",
}
HREF_FILE = {
 "why-graphs/index.html": "why-graphs", "start/index.html": "start",
 "grammar/index.html": "grammar", "grammar/edge-set.html": "grammar-edge-set",
 "depth/index.html": "depth", "depth/boundaries.html": "depth-boundaries",
 "examples/index.html": "examples", "examples/browser-isolation.html": "examples-browser-isolation",
 "examples/2fa.html": "examples-2fa", "examples/article-26-5.html": "examples-article-26-5",
 "maps/index.html": "maps", "shipped/index.html": "shipped", "origins/index.html": "origins",
 "network/index.html": "network", "glossary/index.html": "glossary",
 "about/participant.html": "about-participant",
}

def cross_references():
    out = {}
    for stem, nid in CHAPTER_FILE.items():
        f = ROOT / "v1/content" / (stem + ".md")
        if not f.exists():
            continue
        for href in re.findall(r"\]\(\.\./([a-z0-9\-/]+\.html)", f.read_text()):
            tgt = HREF_FILE.get(href)
            if tgt and tgt != stem:
                k = (nid, CHAPTER_FILE[tgt])
                out[k] = out.get(k, 0) + 1
    return [dict(source=a, target=b, weight=w) for (a, b), w in sorted(out.items())]

# ---------------------------------------------------------------- compile
SPAN = re.compile(r"\[([^\]]+)\]\(([A-Za-z0-9\-]+)\)")

for nid, n in N.items():
    segs, pos, kids = [], 0, []
    for m in SPAN.finditer(n["text"]):
        if m.start() > pos:
            segs.append(dict(t=n["text"][pos:m.start()]))
        segs.append(dict(t=m.group(1), to=m.group(2)))
        kids.append(m.group(2))
        pos = m.end()
    if pos < len(n["text"]):
        segs.append(dict(t=n["text"][pos:]))
    n["segments"] = segs
    n["children"] = kids
    n["words"] = len(re.sub(SPAN, r"\1", n["text"]).split())
    del n["text"]

for nid, n in N.items():                      # parents, from the children edges
    for k in n["children"]:
        if k not in N:
            raise SystemExit(f"gen_altitudes: {nid} descends into unknown node {k}")
        N[k].setdefault("parents", []).append(nid)
for n in N.values():
    n.setdefault("parents", [])

for nid, n in N.items():
    t, c = CLASSOF.get(nid, (None, None))
    n["type"], n["class"] = t, c

for L in LEVELS:
    L["ontology"] = ONTOLOGY[L["n"]]
    L["taxonomy"] = TAXONOMY[L["n"]]
    for cl in L["taxonomy"]["classes"]:
        cl["members"] = [nid for nid, n in N.items()
                         if n["level"] == L["n"] and n["class"] == cl["id"]]
    units = [n for n in N.values() if n["level"] == L["n"]]
    L["units"] = len(units)
    L["words"] = sum(n["words"] for n in units)
L = {x["n"]: x for x in LEVELS}
L[5]["units"], L[5]["words"] = 17, 20000      # the book itself, measured by the book build

CITES = cross_references()

# ---- deterministic checks
# The founder's point, made executable: a contradiction that only a careful reader spots
# is an opinion; one a rule finds every time is a measurement. Each check states the rule
# it ran, so a reader can disagree by recomputing rather than by arguing — and a check
# that finds nothing today is kept, because a rule with zero hits is still a rule.
def checks_over(concepts, nodes, findings):
    out = []

    strong = [c for c in concepts if c["strength"]["score"] >= 10 and not c["demonstrated_by"]]
    out.append(dict(id="strong-but-unshown", severity="watch",
        rule="concept where strength >= 10 AND demonstrated_by is empty",
        asks="Which ideas is the book leaning on hardest without a published artefact behind them?",
        hits=[c["label"] for c in strong],
        reading="Connectivity and evidence are independent axes. A concept can be central to "
                "the argument and carry nothing but argument, which is not a fault in the "
                "concept — it is a fact about where the evidence programme should go next."))

    touched = {}
    for i, f in enumerate(findings):
        for w in f["where"]:
            touched.setdefault(w, []).append(f["title"])
    multi = {k: v for k, v in touched.items() if len(v) > 1}
    out.append(dict(id="units-under-two-findings", severity="watch",
        rule="unit referenced by more than one finding",
        asks="Where do independent problems land on the same piece of text?",
        hits=[f'{nodes[k]["title"]} — {len(v)} findings' for k, v in sorted(multi.items())],
        reading="Two findings on one unit is the signal a list of findings cannot give you. "
                "It usually means the unit is doing too many jobs at once."))

    lonely = [c["label"] for c in concepts if not c["in_edges"]]
    out.append(dict(id="nothing-rests-on-it", severity="note",
        rule="concept with zero inward edges",
        asks="Which ideas does nothing else in the book depend on?",
        hits=lonely,
        reading="A leaf idea is not a weak one: some concepts are terminal by nature. But a "
                "leaf that the book treats as foundational is either mis-modelled or "
                "under-connected, and this is the list to read with that question in mind."))

    unlinked = [n["title"] for nid, n in nodes.items()
                if n["level"] in (3, 4)
                and not any(nid in c["units"] for c in concepts)]
    out.append(dict(id="text-with-no-concept", severity="note",
        rule="level 3 or 4 unit carried by no concept",
        asks="Which parts of the book are not yet connected to the idea layer?",
        hits=unlinked,
        reading="Not a defect in the text: it means the concept layer has not reached there "
                "yet. It is the honest to-do list for extending the concept map, and it "
                "shrinks as the map grows."))

    opposed = []
    for c in concepts:
        for verb, tgt in c["edges"]:
            if verb == "opposes":
                other = [x for x in concepts if x["id"] == tgt][0]
                shared = sorted(set(c["units"]) & set(other["units"]))
                if shared:
                    opposed.append(f'{c["label"]} vs {other["label"]} — both in ' +
                                   ", ".join(nodes[u]["title"] for u in shared))
    out.append(dict(id="opposition-in-one-place", severity="watch",
        rule="two concepts joined by an opposes edge that both appear in the same unit",
        asks="Where does the book put a position and its antagonist in the same passage?",
        hits=opposed,
        reading="Usually deliberate and usually good: that is where an argument is made. "
                "Worth watching because it is also where a reader is most likely to leave "
                "with the wrong half."))
    return out

# ---- concept layer: validate, mirror the inverses, and compute strength
INV = {}
for e in CONCEPT_EDGES:
    INV[e["verb"]] = e["inverse"]; INV[e["inverse"]] = e["verb"]

CBY = {c["id"]: c for c in CONCEPTS}
for c_ in CONCEPTS:
    for verb, tgt in c_["edges"]:
        if verb not in INV:
            raise SystemExit(f"gen_altitudes: {c_['id']} uses unknown verb {verb}")
        if tgt not in CBY:
            raise SystemExit(f"gen_altitudes: {c_['id']} {verb} unknown concept {tgt}")
    for u in c_["units"]:
        if u not in N:
            raise SystemExit(f"gen_altitudes: {c_['id']} appears_in unknown unit {u}")

# A relation stated from either end is the SAME relation, so it is normalised to one
# canonical triple before anything is counted. Without this, declaring "A grounded_by B"
# on one concept and "B grounds A" on the other produces two edges that are really one,
# and the strength ranking quietly rewards whoever wrote the data twice.
PRIMARY = set(e["verb"] for e in CONCEPT_EDGES)
triples = set()
for c_ in CONCEPTS:
    for verb, tgt in c_["edges"]:
        if verb in PRIMARY:
            triples.add((c_["id"], verb, tgt))
        else:
            triples.add((tgt, INV[verb], c_["id"]))     # flip to the primary direction

for c_ in CONCEPTS:
    c_["edges"], c_["in_edges"] = [], []
for src, verb, tgt in sorted(triples):
    CBY[src]["edges"].append([verb, tgt])               # outward, in the primary verb
    CBY[tgt]["in_edges"].append([INV[verb], src])       # inward, named with the inverse

# Strength: how much of the estate arrives at this concept. Degree in the concept graph
# plus the units that carry it plus the artefacts that demonstrate it — stated as a
# formula rather than a mystery number, because a ranking nobody can recompute is an
# opinion wearing a metric's clothes.
for c_ in CONCEPTS:
    out_, in_ = len(c_["edges"]), len(c_["in_edges"])
    c_["strength"] = dict(out=out_, incoming=in_, units=len(c_["units"]),
                          shown=len(c_["demonstrated_by"]),
                          score=out_ + 2 * in_ + len(c_["units"]) + 2 * len(c_["demonstrated_by"]),
                          formula="out + 2*incoming + units + 2*demonstrations")
PEAKS = sorted(CONCEPTS, key=lambda x: -x["strength"]["score"])[:5]

# ---- the inventory: what the book reduces to, derived rather than hand-typed
KIND_OF = {"evidenced": "fact", "argued": "assertion", "unevidenced": "opinion"}
INVENTORY = dict(concepts=len(CONCEPTS), units=len(N), findings=len(FINDINGS),
                 cites=len(CITES), fact=0, assertion=0, opinion=0)
for n in N.values():
    for cl in n["claims"]:
        cl["kind"] = KIND_OF.get(cl["state"], "assertion")
        INVENTORY[cl["kind"]] += 1
INVENTORY["note"] = ("Derived, not hand-typed: an evidenced claim is counted as a **fact**, "
                     "an argued one as an **assertion**, an unevidenced one as an **opinion**. "
                     "A hand-typed register that separates a claim from an assertion properly "
                     "is review r002 item 4's job, and this is the honest placeholder for it.")

EDGE_REGISTRY = ([et("compresses", "compressed_by", "Unit", "Unit", "The descent edge of the ladder."),
                  et("cites", "cited_by", "Chapter", "Chapter", "A real cross-reference in the book's text."),
                  et("flags", "flagged_by", "Finding", "Unit", "A finding reaches every unit it involves."),
                  et("carries", "carried_by", "Unit", "Claim", "A unit carries a claim.")]
                 + CONCEPT_EDGES)

CHECKS = checks_over(CONCEPTS, N, FINDINGS)

out = dict(version=VERSION, root="L1", levels=LEVELS,
           nodes=N, findings=FINDINGS, cites=CITES, checks=CHECKS,
           concepts=CONCEPTS, peaks=[x["id"] for x in PEAKS],
           edge_registry=EDGE_REGISTRY, inventory=INVENTORY,
           coverage=dict(
             full_levels=[1, 2, 3],
             pilot_levels={"4": ["chapter 2", "chapter 5"]},
             graph_lifted=[nid for nid, n in N.items() if n["claims"]],
             ontology_taxonomy="Every level carries its own ontology (node types, and edge types with "
                  "verb, inverse, domain and range) and its own taxonomy (broader/narrower classes with "
                  "members). Level 5's are deliberately empty: that is the book, and lifting it here would "
                  "duplicate the book-as-a-graph work proposed in review r002 item 3.",
             note="Levels 1 to 3 are complete. Level 4 exists for two chapters only, and the "
                  "graph layer is lifted for the nodes on those two paths plus every node at "
                  "levels 1 and 2. Everything not lifted is stated as not lifted rather than "
                  "left to look finished."))

p = ROOT / "v1/altitudes/data/altitudes.json"
p.write_text(json.dumps(out, indent=1, ensure_ascii=False) + "\n")
print(f"gen_altitudes: {len(CITES)} measured cites edges between chapters")
print("gen_altitudes: %d concepts, %d concept edges (each mirrored), peaks: %s"
      % (len(CONCEPTS), sum(len(x["edges"]) for x in CONCEPTS),
         ", ".join(x["label"] for x in PEAKS[:3])))
print("gen_altitudes: checks — " + "; ".join(
      "%s %d" % (c["id"], len(c["hits"])) for c in CHECKS))
print("gen_altitudes: findings — %d open, %d accepted" % (
      sum(1 for f in FINDINGS if f.get("state") == "open"),
      sum(1 for f in FINDINGS if f.get("state") == "accepted")))
print("gen_altitudes: inventory — %d facts, %d assertions, %d opinions"
      % (INVENTORY["fact"], INVENTORY["assertion"], INVENTORY["opinion"]))
print(f"gen_altitudes: {len(N)} nodes across levels 1-4 "
      f"({', '.join(str(x['units']) + '@L' + str(x['n']) for x in LEVELS)}), "
      f"{len(FINDINGS)} findings, {p.stat().st_size:,} bytes")
