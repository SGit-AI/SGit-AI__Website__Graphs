#!/usr/bin/env python3
"""Generates /memos/ — readers for the briefs written after the first edition froze.

Run from anywhere: python3 admin/build/gen_memos.py
Then run chrome.py, which fills in the nav and footer.

Briefs 00 to 19 belong to the first edition and froze with it; they are at /v1/briefs/ and
are read at /v1/documents/. This generator serves the ones written since, which live at
/v2/briefs/ and continue the same numbering, because the corpus is one sequence even though
the editions are not.

Same convention as everywhere else here: the raw markdown is the source of truth and each
page renders its own source file client-side, so a page cannot drift from the file it
claims to render.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "v2" / "briefs"
OUT = ROOT / "v2" / "memos"
GH = "https://github.com/SGit-AI/SGit-AI__Website__Graphs/blob/dev/v2/briefs"

# one line per memo, shown on the hub. Authored, because "what it gives you" is a judgement.
BLURB = {
 "37__founder-memo__zooming-into-the-code-itself.md": (
     "Keep zooming: the code itself gets the graph treatment",
     "Graphs of graphs, one zoom further in: the operator scripts are small but "
     "context-heavy, so give them the Bret Victor treatment — group the parts "
     "of the code visually, explain each part on a right pane (what it does, "
     "what the variables do, the inputs and outputs of the inner bits), and "
     "draw the architecture as flowcharts and fluxograms, for an audience that "
     "knows JS. Apply the main WCLM's visual linking of components, data and "
     "ids to every operator — each one a mini app with its own js and css for "
     "experiments. Try it on the json files too. And frame all of it as the "
     "lab: PoC ways to see, run, visualise and debug in the small space, then "
     "promote the ones that worked into the main WCLM UI and workflows."),
 "36__founder-memo__operators-as-first-class-folders.md": (
     "Operators as first-class folders: tune each one individually",
     "The file-explorer treatment, applied to the engine's own building "
     "blocks: every operator in a dedicated folder with its code, its md, its "
     "html workbench and its json; schemas as json files; examples and sample "
     "data; official operator data marked standard, authored or derived (from "
     "another operator or transformation); a reusable UI to execute, test, "
     "debug and visualise input, transformation and output; and visual "
     "representations of architecture and execution, js-drawn and "
     "ascii-drawn."),
 "35__founder-memo__the-fractal-nature-of-the-wclm.md": (
     "The fractal nature of the WCLM: world models, analogies, anchored facts",
     "The engines are world-model transformations — every layer asks what does "
     "this mean, expand it, contract it, give me more so the analysis continues. "
     "The destination: ask a document, ask a paragraph — here's the graph of "
     "where I'm going; does it agree, provide evidence, reach the same "
     "conclusion? New and named: ANALOGIES — to explain this to somebody from "
     "finance, graphs of graphs must become spreadsheets of spreadsheets, "
     "because their world really nests them. Corrections are the training "
     "(better meaning, missing nodes, manual overrides — what pre-training is "
     "to an LLM). The LLM layer-warming picture, redone with determinism: our "
     "lines are exact, so facts and hypotheses can anchor to them. And some "
     "layers may one day need an LLM — acceptable, because graph in and graph "
     "out are both kept as evidence."),
 "34__founder-memo__words-have-many-meanings.md": (
     "Words have many meanings: senses, number, and the world model per word",
     "Each word needs a world model: singular is not plural (graph is not graphs, "
     "and 'graph of graphs' is not 'graphs of graphs'), and the same word means "
     "completely different things across industries — a graph is a network graph "
     "here, a chart in a boardroom, a function plot at school. The thought "
     "exercise: author three to five senses per word, let people switch to THEIR "
     "definition, and programmatically show what stops applying (a graph that is "
     "a diagram is not fractal). Two addenda from the same day: layers must hold "
     "MULTIPLE engines side by side (pass-through itself an engine, include it or "
     "block the stream), and every engine must declare its input/output schema — "
     "including a fractal mode where one engine is a full WCLM inside."),
 "33__founder-review__the-detective-playbook.md": (
     "The detective playbook: a narrated review of the WCLM",
     "Eight narrated moments over the deterministic transformer, and the finding "
     "that restructured it: layers must not be jumped — every layer adds or drops "
     "evidence, and clicking the answer must show every piece of evidence that got "
     "there, transitively. Plus the live experiment that became a block: 'meaning "
     "without connectivity' returned the same winner and rightly should not — so "
     "operators (without, not, no) now flip binding and surface contradictions. "
     "The dictionary and thesaurus move into the early layers, the layers become "
     "reusable mix-and-match blocks with a drag-to-order bar, and every weight is "
     "labelled opinion or evidence."),
 "32__founder-memo__every-box-explains-itself.md": (
     "Every box explains itself, both ways",
     "The WCLM verdict (it worked) and the next rounds: every chip at every layer "
     "clickable, opening its reason-to-be — caused by upstream, feeding downstream, "
     "because it's graphs all over. A side pane for the explanations, layer cards for "
     "the layers themselves, run-to-run impact made visible (adding one word made a "
     "massive difference and the engine should say exactly how much), and example "
     "buttons from strong to weak connectivity. Plus the direction: one of these "
     "engines at every abstraction jump of the book, rationally explaining each "
     "compression."),
 "31__founder-memo__the-wclm-a-deterministic-transformer.md": (
     "The WCLM: a deterministic transformer over our graphs",
     "The crazy experiment, commissioned: a mini engine in the shape of a "
     "transformer where nothing is learned and everything is named — tokens are "
     "content hashes, the layers are deterministic transformations with declared "
     "roles, attention is the co-occurrence and concept-binding made visible, and "
     "the query flips from predict-the-next-word to what-does-this-mean, answered "
     "with provenance, blast radius and weights instead of probability. Training "
     "is tweaking graph inputs, never fitting numbers. Meaning packs bring the "
     "world above the document: QA is part of development."),
 "30__founder-memo__words-as-tokens-and-the-two-way-transform.md": (
     "Words as tokens, and the two-way transform",
     "Each document is its own token universe: every word a unique entry with no "
     "vocabulary cap, classified (padding, verb, content), stemmed into families, "
     "scored for different-meanings-in-the-same-document, and connected by "
     "co-occurrence into the document's own attention map. Plus the instruction "
     "addressed sooner more than later: the graph must rebuild the markdown "
     "byte-for-byte, with formatting captured in its own graph beside the "
     "semantic one."),
 "29__founder-memo__the-core-graph-document-to-word.md": (
     "The core graph: document to word",
     "The foundational graph under everything else: transform the document all the way "
     "down — sections, paragraphs, sentences, words — like an AST driven by the content, "
     "every level a node with an ID, because pointing at character 256 breaks the moment "
     "the document changes. Bold and links become span nodes, every distinct word gets a "
     "counted form node, the tree expands bit by bit from sharded files, the controls "
     "move into tabs, and the inspector shows everything known about a node."),
 "28__founder-memo__node-navigation-and-path-queries.md": (
     "Node navigation, reverse verbs, and the path query",
     "Click a node and see its whole universe on the right: every link out with its "
     "verb, every link in read through the declared inverse, each row a hop that "
     "extends the path trail — the beginnings of the path query. Plus the scale "
     "framing (nodes will grow near-exponentially) and two pane bugs fixed where "
     "they pointed."),
 "27__founder-review__narrated-viewer-walkthrough.md": (
     "A narrated walkthrough of the viewer",
     "The first narrated review: ten screen captures with the founder's words spoken "
     "over them, words joined to pixels the way anchors join claims to bytes. Six "
     "findings connected to their screens — the live graph one click away, a clickable "
     "type legend, the explore walk cleansed of the rails' invisible ties, and the peak "
     "board docked so the canvas it re-anchors stays visible."),
 "26__founder-memo__stable-graphs-and-schema.md": (
     "Fixed nodes, the four areas, and the schema",
     "The stability principle: every node move costs the reader their mental picture, so "
     "what is on canvas holds still while newcomers settle. The four border areas with "
     "their aligned slots, the drag-and-drop peak board, the maximised view's inspector "
     "and type legend, the invisible alignment lines to come, and the schema view that "
     "judges the graph at the type level. Nine instructions mapped, four questions back."),
 "25__founder-note__pinned-peaks.md": (
     "Pinned peaks, and the document as a source",
     "Lock the summits at the edges of the canvas and let the physics settle everything "
     "else between them: doc root and family peaks left, derived-group summits right, "
     "hand-draggable between layout runs. Also: the document becomes a source like any "
     "other (all sources off = empty canvas), the derived groups get their own peaks, and "
     "the maximised graph finally owns the whole viewport."),
 "24__founder-memo__document-from-a-node.md": (
     "A document grown from one node",
     "The experiment after the reader: pick one node and compose the document of that "
     "concept from what the anchored data verifiably holds — programmatic first, no "
     "authored prose, on its own page, printable. The book workflow run from a single "
     "word upward; the whole book is the same operation on steroids."),
 "23__founder-notes__reader-round-two.md": (
     "Visible links, live physics, and exploring the graph",
     "Three notes sent while brief 22 was being built: every link in the source visible "
     "and toggleable from the pane itself, one toggle set driving both panes, physics "
     "applied as the slider moves, and the explore workflow — focus on a selection, grow "
     "it degree by degree towards the peaks, with stats that price the next hop before "
     "you pay for it. Answers two of brief 22's questions; three remain open."),
 "22__founder-memo__universe-viewer.md": (
     "The universe viewer, and where it goes next",
     "Feedback on using the reader in earnest: nodes as readable boxes, the doc tree as "
     "navigation, families as selectable node packs each with its own peak, stronger and "
     "weaker links between concepts, paths to the peaks, and a freeze-and-grow workflow. "
     "Twelve instructions mapped, four questions put back to the founder."),
 "21__founder-memo__review-packs.md": (
     "Review packs, and briefing other agents",
     "A website cannot control what a reviewer reads or in what order. A pack can: one "
     "continuous page and a PDF printed from it, read end to end on an iPad or on paper. "
     "The specification for the pack family, and a correction I owed about visualisations."),
 "20__founder-memo__the-universe-first.md": (
     "Build the universe first, then find the plot",
     "The memo that inverted the dev pack's construction order. The pack was defining answers "
     "before the questions were known; the universe of concepts, claims and evidence has to "
     "exist before any altitude can be decided. Also corrects what <em>fractal semantic "
     "graphs</em> means, and reverses the verdict on Wardley maps."),
}

PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title} &mdash; graphs.sgit.ai</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="https://graphs.sgit.ai/v2/memos/{slug}.html">
<meta property="og:type" content="article">
<meta property="og:site_name" content="graphs.sgit.ai">
<meta property="og:url" content="https://graphs.sgit.ai/v2/memos/{slug}.html">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta name="twitter:card" content="summary">
<link rel="alternate" type="text/markdown" href="../briefs/{src}" title="The raw markdown, which is the source of truth">
<link rel="stylesheet" href="../../assets/site.css">
</head>
<body>

<nav class="site"><div class="row"></div></nav>

<main class="doc">
<div class="crumb"><a href="../../index.html">graphs.sgit.ai</a> &rarr; <a href="../index.html">the second edition</a> &rarr; <a href="index.html">the memos</a> &rarr; <b>{num}</b></div>
<h1>{title}</h1>
<p class="lead">{desc}</p>

<div class="docmeta">
  <span class="k">Kind</span><span class="v">Founder memo &middot; source material, not edited</span>
  <span class="k">Licence</span><span class="v">CC BY 4.0</span>
  <span class="k">Source</span><span class="v"><a href="../briefs/{src}">raw markdown</a> &middot; <a href="{gh}/{src}">view on GitHub</a></span>
</div>

<div class="mdread-label">&#128196; Rendered from the <a href="../briefs/{src}">raw markdown</a>, which is the source of truth. This page is presentation.</div>
<div class="mdread" id="mdread" data-src="../briefs/{src}"><noscript><p class="dim">In-page rendering needs JavaScript &mdash; <a href="../briefs/{src}">open the raw markdown</a>.</p></noscript></div>

<div class="pagenav">
  <span><a href="index.html">&larr; All memos</a></span>
  <span><a href="../dev-pack/index.html">The dev pack &rarr;</a></span>
</div>
</main>

<footer class="site"><div class="cols"></div></footer>
<script src="../../assets/vendor/marked.min.js"></script>
<script src="../../assets/mdreader.js" defer></script>
</body>
</html>
"""

HUB = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>The memos &mdash; graphs.sgit.ai</title>
<meta name="description" content="Founder memos written after the first edition froze, reproduced verbatim with the instructions extracted and mapped to what each one commits the work to. Briefs 00 to 19 froze with the first edition and are at /v1/documents/.">
<link rel="canonical" href="https://graphs.sgit.ai/v2/memos/index.html">
<meta property="og:type" content="website">
<meta property="og:site_name" content="graphs.sgit.ai">
<meta property="og:url" content="https://graphs.sgit.ai/v2/memos/index.html">
<meta property="og:title" content="The memos">
<meta property="og:description" content="The founder's voice, verbatim, with every instruction mapped to what it commits the work to.">
<meta name="twitter:card" content="summary">
<link rel="stylesheet" href="../../assets/site.css">
</head>
<body>

<nav class="site"><div class="row"></div></nav>

<main class="doc">
  <div class="crumb"><a href="../../index.html">graphs.sgit.ai</a> &rarr; <a href="../index.html">the second edition</a> &rarr; <b>The memos</b></div>
  <h1>The memos</h1>
  <p class="lead">The founder's voice memos, transcribed and reproduced <b>verbatim</b>, because the house rule is that the founder's voice is source material and is not edited. Each one is followed by the instructions extracted from it and, for each instruction, what it commits the work to. That second half is the agent's reading and is marked as such.</p>

  <div class="note"><b>Where the earlier ones are.</b> Briefs 00 to 19 belong to the first edition and froze with it at <a href="../../admin/versions.html">v0.3.26</a>. They are readable at <a href="../../v1/documents/index.html">/v1/documents/</a> and raw at <code>/v1/briefs/</code>. This section holds the briefs written since, and <b>the numbering continues rather than restarting</b>, because the corpus is one sequence even though the editions are not.</div>

  <div class="tablewrap">
  <table>
    <thead><tr><th>#</th><th>Memo</th><th>What it gives you</th><th>Raw</th></tr></thead>
    <tbody>
{rows}
    </tbody>
  </table>
  </div>

  <div class="agent">
    <h4>For an agent</h4>
    <p>The raw markdown under <code>/briefs/</code> is the source of truth and each page here renders one client-side. Inside each file, the block quote is the founder verbatim, including transcription artefacts, and everything after it is the agent's reading. Do not attribute the second half to the founder. Where a memo corrects an earlier document, the correction is recorded beside the original rather than replacing it.</p>
  </div>
</main>

<footer class="site"><div class="cols"></div></footer>
</body>
</html>
"""


def main():
    files = sorted(f.name for f in SRC.glob("*.md"))
    missing = [f for f in files if f not in BLURB]
    if missing:
        raise SystemExit("gen_memos: briefs with no blurb: " + ", ".join(missing))
    OUT.mkdir(exist_ok=True)
    rows = []
    for f in files:
        slug = f[:-3].replace("__", "-").replace("_", "-")
        num = f.split("__")[0]
        title, desc = BLURB[f]
        (OUT / f"{slug}.html").write_text(PAGE.format(
            slug=slug, src=f, num=num, title=title,
            desc=desc.replace('"', "&quot;"), gh=GH))
        rows.append(f'      <tr><td class="dpnum">{num}</td>'
                    f'<td><a href="{slug}.html"><b>{title}</b></a></td>'
                    f'<td>{desc}</td><td><a href="../briefs/{f}">.md</a></td></tr>')
    (OUT / "index.html").write_text(HUB.format(rows="\n".join(rows)))
    print(f"gen_memos: {len(rows)} memo(s) plus the hub")


if __name__ == "__main__":
    main()
