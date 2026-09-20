#!/usr/bin/env python3
"""Generates the site's two front pages: index.html and site/index.html.

Run from anywhere: python3 admin/build/gen_front.py
Run gen_home.py FIRST (it computes everything quoted here), and chrome.py after (it
fills in the nav and footer).

There are two of them because one page was being asked to do two jobs and was doing the
second one. A reader who has just heard the phrase "fractal semantic graphs" and followed
a link arrived at a domain name, a shelf of books and a file index, and the phrase they
came for appeared four times, every one of them inside a title or a filename. Nothing on
the page defined it.

So:

  · index.html is the FRONT DOOR. It names the claim, answers the phrase in the corpus's
    own words above the fold, demonstrates it in a graph the reader can pull apart, runs
    the fractal claim's own test on this estate's book, and then offers three ways in.
  · site/index.html is EVERYTHING ELSE, whole: the shelf, the sequence of events, what
    each section is, and the complete index of the first edition. That page is the one
    that used to be the front page, moved rather than trimmed, because the archive was
    never the problem — being the first thing a stranger met was.

Two of the archive's sections are GENERATED and must never be hand-edited: the release
timeline comes from admin/versions.html, and the index of the first edition comes from
the file tree. The front door quotes nothing it has not computed: every number comes from
home/data/home.json and every quotation is checked against its source there.
"""
import json
import math
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
VERSION = (ROOT / "admin/build/version.txt").read_text().strip()
FROZEN = "v0.3.26"
HOME = json.loads((ROOT / "home/data/home.json").read_text())

# the releases that changed the method rather than adding to it, with why. Authored.
TURNS = {
    "v0.2.0": "the site becomes a book: chapters, one page, a PDF, and a gate that fails if the book lags its source",
    "v0.3.0": "the chapter text moves to markdown, and the chain becomes markdown to pages to book, gated at both links",
    "v0.3.13": "reviews gain a decisions register, so what is being waited on stops being buried in threads",
    "v0.3.15": "the altitude ladder: the book at five altitudes, and the first finding reached by compression",
    "v0.3.22": "the decisions register is drawn as a graph, and four pieces of blocked work turn out to be two",
    "v0.3.24": "the twenty-one source documents are carried whole, byte for byte, with their hashes",
    "v0.3.26": "the retrospective: every correction in the run turned out to be a number nothing was checking",
    "v0.3.27": "the plan to write the book again, from the top down",
    "v0.4.0":  "the first edition moves to v1/ and freezes. The second edition begins, empty.",
    "v0.4.37": "the core graph: a document taken apart to the word and put back byte-identical",
    "v0.5.18": "each book gets its own version, independent of the site's",
    "v0.6.20": "the front page splits in two: a door for a stranger, and this page for everything",
}


def releases():
    """All releases across the era pages (the history is split by era since v0.5.0)."""
    rows = []
    for page in sorted(ROOT.glob("admin/versions*.html")):
        rows += re.findall(r'class="vnum">(v\d+\.\d+\.\d+)</td>\s*<td>([^<]+)</td>',
                           page.read_text())
    rows.sort(key=lambda r: [int(x) for x in r[0][1:].split(".")])
    # These are the NARRATED releases, which is what the front page counts. CI tags each
    # one after the push that carries it, so at build time the newest row is always one
    # ahead of the tag list — "tagged releases" would be off by one on every build.
    return rows                          # oldest first


def first_edition_index():
    """Every published page of the first edition, from the file tree."""
    out = {}
    for d in sorted(p for p in (ROOT / "v1").iterdir() if p.is_dir()):
        pages = sorted(f.relative_to(ROOT).as_posix() for f in d.rglob("*.html"))
        if pages:
            out[d.name] = pages
    return out


# ---------------------------------------------------------------------------
# the front door
# ---------------------------------------------------------------------------

FRONT = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Fractal semantic graphs &mdash; graphs.sgit.ai</title>
<meta name="description" content="Fractal semantic graphs, defined and demonstrated: a node carries no inherent meaning, what it is arrives through its edges, and the same grammar repeats at every level of zoom. A live graph you can pull apart, the fractal claim run as a test, and three books.">
<link rel="canonical" href="https://graphs.sgit.ai/index.html">
<meta property="og:type" content="website">
<meta property="og:site_name" content="graphs.sgit.ai">
<meta property="og:url" content="https://graphs.sgit.ai/index.html">
<meta property="og:title" content="Fractal semantic graphs, defined and demonstrated">
<meta property="og:description" content="A node means nothing on its own. What it is arrives through its edges, and the same grammar repeats at every level of zoom. Start with a live graph you can pull apart.">
<meta name="twitter:card" content="summary">
<link rel="stylesheet" href="assets/site.css">
<link rel="stylesheet" href="assets/home.css">
</head>
<body>

<nav class="site"><div class="row"></div></nav>

<header class="front">
  <div class="eyebrow">Fractal semantic graphs</div>
  <h1>A node means nothing on its own.<br>What it <em>is</em> arrives through its edges.</h1>
  <p class="answer">If you followed the phrase here, this is the whole of it: <q>{defquote}</q>.
  <b>Semantic</b>, because meaning comes from the edges rather than from the label on the box.
  <b>Fractal</b>, because zooming into any node lands you in another semantic graph with <em>its
  own</em> node types, verbs and taxonomy, joined by a named edge to the one you left. The
  grammar survives every zoom. The vocabulary is meant to change.</p>
  <p class="prov">Quoted, not paraphrased: <a href="{defwhere}">{defdoc}</a>, section
  &ldquo;{defsection}&rdquo;, carried whole on this site and checked byte for byte on every build.
  The same idea was called <em>graphs of graphs of graphs</em>, and <em>ontologies of ontologies
  of ontologies</em>, before it had this name.
  This page is the door; <a href="site/index.html">everything on the site</a> is one page along.</p>
  <div class="ctas">
    <a class="cta1" href="#demo">Show me, in one graph &rarr;</a>
    <a class="cta2" href="v1/start/index.html">The five-minute version &rarr;</a>
    <a class="cta2" href="v2/books/fsg/index.html">The whole argument &rarr;</a>
  </div>
</header>

<section class="band alt" id="demo">
  <h2>Here is a node. Give it edges.</h2>
  <p class="blurb">This is the corpus&rsquo;s own worked example, live. Two nodes hold the value
  <code>8080</code>: one is connected to a type, which is constrained, which is inherited, which
  belongs to a released library. The other is connected to nothing. <b>Add the edges one at a
  time</b> and watch the list on the right grow. Drag a node if you want to be sure this is a
  graph and not a picture of one.</p>
  <port-graph></port-graph>
  <div class="zoom">
    <p class="cap"><b>&ldquo;{closeq}&rdquo;</b> Both scenarios hold <code>8080</code>.
    &ldquo;{closeq2}&rdquo; Every claim above is backed by a
    traceable path through the graph, which is the only reason the graph may make it.
    <a href="{demowhere}">Read the section this comes from</a>.</p>
  </div>
</section>

<section class="band" id="zoom">
  <h2>Fractal is a test, not a flourish</h2>
  <p class="blurb">The test has two halves and both are worth running. <b>If the inside has the
  same types and verbs as the outside, all the way down, you have a hierarchy</b>, and a folder
  tree is the clean example. <b>If the inside needs a different grammar, so that it is no longer
  a semantic graph, the claim is false.</b> In between, every zoom that opens a new vocabulary
  joined by a named edge is the claim working.</p>
  <div class="zoom">
    <ol>
{ladder}
    </ol>
    <p class="cap">This estate&rsquo;s own making-of book at <b>{bookver}</b>, taken apart six
    levels and put back byte-for-byte or the build fails: {shards} shards, one format, one
    validator. That is <b>scale invariance</b>, and it is the honest label, because the
    vocabulary never changes on the way down. <b>By the first half of the test, this ladder on
    its own is a hierarchy.</b> The book says so about itself, in the chapter that states the
    test. <a href="{ladderwhere}">Open it and zoom it yourself &rarr;</a></p>
  </div>
  <div class="split" style="margin-top:1.6rem">
    <div class="note"><b>So where is the fractal part?</b> In the vocabulary changing. The same
    pilot document on this site carries <em>two</em> graphs at once: a core graph of sections,
    blocks, sentences and words, and an extraction of concepts, claims, hypotheses and
    objections joined by verbs like <code>departs-from</code> and <code>licenses</code>. Neither
    is derived from the other; they share nodes by anchor. Open a word in one and you are in a
    lexical world, open a claim in the other and you are in an argumentative one.
    <a href="v2/books/fsg/fractal-is-a-testable-claim.html">The chapter runs the test on this
    estate and reports where it fails</a>.</div>
    <div class="note"><b>The meaning of a node is supplied by the ontology at the altitude where
    it sits</b>, which is why the same node means different things at different altitudes.
    Article 9 is a binding provision in a graph of instruments, a container of paragraphs inside
    the regulation, and a source of definitions to the paragraph that cites it. Same node,
    different edges around it at each level.</div>
    <div class="note"><b>Nobody is forced to conform.</b> An organisation, a division, a team, a
    person or a regulator can each define their own world in their own words and connect by
    drawing edges rather than by adopting a shared schema. That is the consequence of
    <a href="v1/depth/index.html">don&rsquo;t merge vocabularies, bridge them</a>: shared facts
    owned by nobody, formulas per party, declared bridges between them.</div>
    <p class="cap" style="margin-top:1rem">The fullest worked demonstration is not on this site.
    <a href="https://sgit.ai/demos/fractal-graphs/"><b>sgit.ai walks eleven altitudes across seven
    published vaults</b></a>, from the text of a law to a threat on a compute instance, each rung
    modelled by its own author in its own vocabulary and every one openable with the read key on
    its page. Markdown twin for agents:
    <a href="https://sgit.ai/demos/fractal-graphs/index.md">index.md</a>. Four of those
    rungs are now read and gated here, in <a href="v2/vaults/index.html">the evidence
    estate</a>, alongside the ladder itself.</p>
  </div>
</section>

<section class="band alt" id="doors">
  <h2>Three ways in, depending on why you came</h2>
  <p class="blurb">They are genuinely different readings, not the same page at three lengths.</p>
  <div class="cards" style="max-width:1000px">
    <a class="card" href="v1/start/index.html">
      <div class="tag">just the idea</div>
      <h3>The five-minute version</h3>
      <p>Five ideas in the order that makes each one necessary, and no jargon before it is
      earned. You will not meet the word <em>ontology</em> in it.</p>
      <span class="go">Start here &rarr;</span>
    </a>
    <a class="card" href="#open">
      <div class="tag">show me it working</div>
      <h3>The instruments</h3>
      <p>A document taken apart to the word, a book decomposed and provably rebuilt, a
      deterministic transformer that shows its arithmetic. All in your browser, no server.</p>
      <span class="go">Open something &rarr;</span>
    </a>
    <a class="card" href="v2/books/index.html">
      <div class="tag">the whole argument</div>
      <h3>{nbooks} books, {bookwords} words</h3>
      <p>The argument from first principles and from the running system; the making-of, for
      anyone who wants to work this way; and the frozen first edition as the record.</p>
      <span class="go">The shelf &rarr;</span>
    </a>
  </div>
</section>

<section class="band" id="open">
  <h2>Things you can open</h2>
  <p class="blurb">Each one is a working surface over real data, built for the work rather than
  built for this page. They are the reason there is anything to argue about.</p>
  <div class="cards">
    <a class="card" href="v2/universe/thinking-in-graphs.html">
      <div class="tag">a document, extracted</div>
      <h4>The pilot graph</h4>
      <p>One carried document, every concept a node with the quote it came from, verified byte
      for byte on every build. Pin summits, query by walking, ask what is padding.</p>
      <span class="go">Open the reader &rarr;</span>
    </a>
    <a class="card" href="{ladderwhere}">
      <div class="tag">a book, to the word</div>
      <h4>The book as a graph</h4>
      <p>Six levels down and back: every chapter rebuilds from its own formatting graph
      byte-identical, or the build refuses it.</p>
      <span class="go">Zoom it &rarr;</span>
    </a>
    <a class="card" href="v2/books/making-a-book/figures.html">
      <div class="tag">{nfigures} figures</div>
      <h4>The figure graph</h4>
      <p>Every screenshot with the release tag it was photographed at, the chapter that uses it
      and the release it shows. Three gates: the tag exists, the figure is used, the reference
      resolves.</p>
      <span class="go">Open the viewer &rarr;</span>
    </a>
    <a class="card" href="v2/books/making-a-book/board.html">
      <div class="tag">the work itself</div>
      <h4>The project board</h4>
      <p>The book&rsquo;s own workstreams as a board, each pack moving through seven stages, with
      the agents&rsquo; open issues read straight from their folders.</p>
      <span class="go">Open the board &rarr;</span>
    </a>
    <a class="card" href="v2/team/workflow.html">
      <div class="tag">how a change moves</div>
      <h4>The state map</h4>
      <p>Nine states in four lanes, each naming who owns it, what it costs and whether the door
      out of it swings both ways. A gate fails the build if the drawing and the pipeline
      disagree.</p>
      <span class="go">Follow a change &rarr;</span>
    </a>
    <a class="card" href="v2/team/issues.html">
      <div class="tag">seven roles</div>
      <h4>The issue tree</h4>
      <p>Every role&rsquo;s open, blocked and done work. The folder is the status, a status change
      is a <code>git mv</code>, and a role may read another&rsquo;s issues but never write into them.</p>
      <span class="go">Open the tree &rarr;</span>
    </a>
    <a class="card" href="v2/books/making-a-book/changes.html">
      <div class="tag">what changed</div>
      <h4>The version diff</h4>
      <p>Two versions of the book side by side, chapter by chapter, computed from the release
      tags rather than from a changelog somebody remembered to write.</p>
      <span class="go">Compare versions &rarr;</span>
    </a>
    <a class="card" href="v2/wclm/index.html">
      <div class="tag">no model, no weights</div>
      <h4>The WCLM</h4>
      <p>A deterministic transformer over these graphs: twelve operators, each in its own folder,
      computing a meaning and showing every step of the arithmetic.</p>
      <span class="go">Run it &rarr;</span>
    </a>
    <a class="card" href="v2/vaults/index.html">
      <div class="tag">four more vaults</div>
      <h4>The evidence estate</h4>
      <p>Four published graph vaults, read from the pages that publish them because this
      estate cannot decrypt one. Every fact carries the sentence it came from, and the
      build fails if that sentence has moved.</p>
      <span class="go">Read the estate &rarr;</span>
    </a>
    <a class="card" href="v2/methods/index.html">
      <div class="tag">{nmethods} techniques</div>
      <h4>The methods register</h4>
      <p>Every technique in use here, named, dated to the release that introduced it, and
      pointed at the code that implements it.</p>
      <span class="go">Read the register &rarr;</span>
    </a>
  </div>
</section>

<section class="band alt" id="honest">
  <h2>What this is not</h2>
  <p class="blurb">The corpus&rsquo;s own caveats, which travel with its ideas.</p>
  <div class="split">
    <div class="note"><b>It is not a graph database pitch.</b> The claim is that one grammar is
    the interface at every boundary, <em>not</em> that things are stored in a graph. There is no
    graph database, no SPARQL and no RDF behind this site. The chapter that separates what ships
    from what is argued is <a href="v2/books/fsg/what-ships-what-is-argued.html">What ships, what
    is argued</a>.</div>
    <div class="note"><b>Nine of the edge inverses are proposals, not quotations.</b> They are
    this site&rsquo;s own suggestions rather than anything the corpus says, and they are marked as
    such everywhere they appear.</div>
    <div class="note"><b>The books are under review, and say so.</b> A book below
    <b>v1.0.0</b> is openly unfinished; v1.0.0 is reserved for a book&rsquo;s actual final release,
    and a gate enforces that in both directions.</div>
  </div>
  <div class="counts">
    <span><b>{npages}</b> pages</span>
    <span><b>{nrel}</b> narrated releases</span>
    <span><b>{nmemos}</b> founder memos, verbatim</span>
    <span><b>{nsources}</b> carried source documents</span>
    <span><b>{nmethods}</b> named techniques</span>
    <span><b>{ntests}</b> tests</span>
    <span><b>{nconds}</b> validator conditions</span>
  </div>
  <div class="zoom">
    <p class="cap">Every number on this page is counted from the repository at build time, and
    every quotation is checked against its source. The machine-readable form is at
    <a href="home/data/home.json">home/data/home.json</a>.<br>
    <a href="site/index.html"><b>Everything on this site</b></a> is one page along: the shelf, the
    sequence of events, what each section is, and the complete index.</p>
  </div>
</section>

<main class="doc" style="padding-top:1rem">
  <div class="agent">
    <h4>For an agent</h4>
    <p>Start at <a href="llms.txt">llms.txt</a>, which names every section hub and is gate-checked
    against the file tree; <a href="llms-full.txt">llms-full.txt</a> is the whole document set in
    one fetch. This page&rsquo;s own data, including the definition above with its anchor, is at
    <code>/home/data/home.json</code>. The estate index is at <a href="site/index.html">/site/</a>.
    The first edition is everything under <code>/v1/</code> and is frozen at <b>{frozen}</b>: its
    bytes are recorded in <code>/v1/MANIFEST.json</code> with SHA-256 per file, and the build fails
    if any of them changes. The second edition lives under <code>/v2/</code> (hub: /v2/index.html).
    <code>/book/</code> always points at the current edition. Machine surfaces that span both:
    <code>/decisions/data/decisions.json</code>, <code>/v1/docs/data/docs.json</code>,
    <code>/v1/altitudes/data/altitudes.json</code>.</p>
  </div>
</main>

<footer class="site"><div class="cols"></div></footer>
<script>window.HOME = {homejson};</script>
<script type="module" src="assets/home.js"></script>
</body>
</html>
"""


def ladder_rows():
    """The zoom ladder, drawn. The bar is log-scaled because the counts span four orders
    of magnitude and a linear bar would draw five of the six levels as nothing."""
    levels = HOME["ladder"]["levels"]
    top = math.log(max(l["count"] for l in levels) + 1)
    out = []
    for l in levels:
        pct = max(2.0, math.log(l["count"] + 1) / top * 100)
        out.append(
            f'      <li><span class="lv">{l["level"]}</span>'
            f'<span class="bar" style="width:{pct:.1f}%"></span>'
            f'<span class="ct">{l["count"]:,}</span></li>')
    return "\n".join(out)


def front():
    d, inv, lad = HOME["definition"], HOME["inventory"], HOME["ladder"]
    return FRONT.format(
        defquote=d["quote"], defsection=d["section"], defdoc=d["doc"], defwhere=d["where"],
        closeq=HOME["demo"]["closing"]["quote"],
        closeq2=HOME["demo"]["closing"]["second"].replace("**", ""),
        demowhere=HOME["demo"]["where"],
        ladder=ladder_rows(), bookver=lad["book_version"], ladderwhere=lad["where"],
        shards=f'{lad["shards"]:,}',
        nbooks=inv["books"], bookwords=f'{inv["book_words"]:,}',
        nfigures=inv["figures"], nmethods=inv["methods"], npages=f'{inv["pages"]:,}',
        nrel=inv["releases"], nmemos=inv["memos"], nsources=inv["sources"],
        ntests=inv["tests"], nconds=inv["conditions"], frozen=FROZEN,
        homejson=json.dumps(HOME, ensure_ascii=False, separators=(", ", ": ")))


# ---------------------------------------------------------------------------
# the estate page: what the front page used to be, moved whole
# ---------------------------------------------------------------------------

ESTATE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Everything on this site &mdash; graphs.sgit.ai</title>
<meta name="description" content="The whole estate in one page: three books each with its own version, the working surface they were written from, {nrel} narrated releases in sequence, what every section is, and a complete index of the first edition, frozen at {frozen}.">
<link rel="canonical" href="https://graphs.sgit.ai/site/index.html">
<meta property="og:type" content="website">
<meta property="og:site_name" content="graphs.sgit.ai">
<meta property="og:url" content="https://graphs.sgit.ai/site/index.html">
<meta property="og:title" content="Everything on this site">
<meta property="og:description" content="The shelf, the sequence of events, what each section is, and the complete index.">
<meta name="twitter:card" content="summary">
<link rel="stylesheet" href="{up}assets/site.css">
</head>
<body>

<nav class="site"><div class="row"></div></nav>

<main class="doc">
  <div class="crumb"><a href="{up}index.html">graphs.sgit.ai</a> &rsaquo; everything on this site</div>
  <h1>Everything on this site</h1>
  <p class="lead">This page was the front page until {thisver}, and it is here unchanged in
  substance, because the archive was never the problem: being the first thing a stranger met was.
  <a href="{up}index.html">The front door</a> now answers the question people arrive with. This is
  the whole estate, listed and indexed.</p>

  <p class="lead">A reference site about one use of graphs: <b>meaning through connectivity</b>. A
  node carries no inherent meaning, and what a thing <em>is</em> emerges from the edges traceable
  from it. That argument is now made by <b>three books</b>, written from this repository and
  published from it. The first edition is finished and frozen. The second argues the same claim
  from first principles <em>and</em> from the running system it describes &mdash; a system you can
  open on this site and use. The third is the making-of, for anyone who wants to work this way
  themselves.</p>

  <p class="lead">Every book here is markdown first: the pages render their own source in your
  browser, so a page cannot drift from the file it claims to show. <b>Each book carries its own
  version</b>, which moves only when that book&rsquo;s content moves, while the site&rsquo;s version
  moves on every push. <a href="{up}v2/books/index.html">The shelf</a> holds all three.</p>

  <div class="tablewrap">
  <table>
    <thead><tr><th>Book</th><th>Version and state</th><th>Where</th></tr></thead>
    <tbody>
{books}
    </tbody>
  </table>
  </div>

  <p class="small dim">A book below <b>v1.0.0</b> is openly still under review; v1.0.0 is reserved for a book&rsquo;s actual final release. The rule, and the gate that enforces it in both directions, are on <a href="{up}v2/books/index.html">the shelf</a>.</p>

  <div class="note"><b>The books are not the only thing here.</b> They were written from a working surface you can open. One pilot document, <em>Thinking in Graphs</em>, is carried whole and extracted twice over: a <a href="{up}v2/universe/thinking-in-graphs.html">graph of what it says</a> (57 anchored nodes, every quote byte-verified on every build) and a core graph of what it <em>is</em> (every section, block, sentence and word a node with a stable identity, the markdown rebuildable from the graph byte-for-byte). Around them an instrument &mdash; pinned summits, layouts that never scramble the mental map, path queries you write by walking, a token analysis that knows 45% of the document is padding &mdash; and beside it the <a href="{up}v2/wclm/index.html">WCLM</a>, a deterministic transformer that computes a meaning and shows its arithmetic. The techniques are named and catalogued in <a href="{up}v2/methods/index.html">the methods register</a>.</div>

  <div class="note"><b>Why there is a second edition, and why the first one is frozen.</b> The first edition was written the way books usually are: prose first, structure discovered along the way, graphs added afterwards as illustration. It works, and it argues <em>up</em> to its thesis, which means a reader who stops at chapter three never reaches the claim the book is named after. The second edition starts at the claim and descends, so that a reader who stops at any altitude has a complete book. The first edition is not deleted or improved: it is the record of how this was worked out, including three corrections it made to itself, and it is <b>hashed and gated so the build fails if a byte of it changes</b>.</div>

  <div class="note"><b>What this site does not claim.</b> It is <b>not a graph database pitch</b>, and the books say so in their own words. The semantic layer described here is <em>designed</em>, not shipped; the chapter that separates the two is <a href="{up}v2/books/fsg/what-ships-what-is-argued.html">What ships, what is argued</a>. Nine of the edge inverses in the verbs register are this site&rsquo;s proposals rather than quotations from the corpus, and are marked as such where they appear.</div>

  <h2 id="sequence">The sequence of events</h2>
  <p>{nrel} narrated releases across three eras, which is what happens when the projection chain is gated and a release costs a commit. Every one of them is narrated: not a commit log, but a paragraph a reader can understand without opening the diff. The history is kept whole by era: <a href="{up}admin/versions.html">current (v0.6, review as change control)</a> &middot; <a href="{up}admin/versions-v0.5.html">the v0.5 era</a> (the books, 24 releases) &middot; <a href="{up}admin/versions-v0.4.html">the v0.4 era</a> (the working surface, 41 releases) &middot; <a href="{up}admin/versions-earlier.html">the beginnings</a>. Each closed era is also weighed in a retrospective &mdash; what compounded, what was got wrong, and how each mistake was found: <a href="{up}v2/dev-pack/retro5-00-the-v05-retrospective.html">v0.5, the books</a> &middot; <a href="{up}v2/dev-pack/retro-00-the-v04-retrospective.html">v0.4, the working surface</a>. The turns that changed the method rather than adding to it:</p>
  <div class="tablewrap">
  <table class="frontrel">
    <thead><tr><th>Release</th><th>Date</th><th>What turned</th></tr></thead>
    <tbody>
{timeline}
    </tbody>
  </table>
  </div>
  <p class="small dim">Generated from <a href="{up}admin/versions.html">the release tables</a> (all eras) on every build, so it cannot drift from them.</p>

  <h2 id="estate">What else is here</h2>
  <p>Some of this belongs to the first edition and moved with it. Some belongs to the site and spans both editions.</p>
  <div class="tablewrap">
  <table>
    <thead><tr><th>Section</th><th>What it is</th><th>Belongs to</th></tr></thead>
    <tbody>
      <tr><td><a href="{up}v1/vaults/index.html"><b>The vaults</b></a></td><td>Five published graph vaults analysed in depth, plus the capability scale that only the comparison produced.</td><td>the first edition</td></tr>
      <tr><td><a href="{up}v1/docs/index.html"><b>The sources</b></a></td><td>Twenty-one documents the book was built from, carried byte for byte with their hashes.</td><td>the first edition</td></tr>
      <tr><td><a href="{up}v1/altitudes/index.html"><b>The altitude ladder</b></a></td><td>The pilot: the book at five altitudes, its concept map, and the graph explorer. It proved the method the second edition is built on.</td><td>the first edition</td></tr>
      <tr><td><a href="{up}v1/reviews/index.html"><b>The reviews</b></a></td><td>Four rounds of founder review, run as a serverless pull request.</td><td>the first edition</td></tr>
      <tr><td><a href="{up}v1/documents/index.html"><b>The documents</b></a></td><td>The brief pack that produced the site, and the retrospective over the work.</td><td>the first edition</td></tr>
      <tr><td><a href="{up}decisions/index.html"><b>The decisions</b></a></td><td>Every open question, drawn as the peak of its own graph, answered in your own browser.</td><td>both editions</td></tr>
      <tr><td><a href="{up}v2/team/index.html"><b>The team</b></a></td><td>Seven roles, one folder each, every one naming what it refuses. Their work plan is the <a href="{up}v2/team/issues.html">issue tree</a> and their pipeline is the <a href="{up}v2/team/workflow.html">state map</a>.</td><td>the second edition</td></tr>
      <tr><td><a href="{up}v2/index.html"><b>The second edition</b></a></td><td>Everything about making it, gathered in one tree: the dev pack, the memos, the review packs.</td><td>the second edition</td></tr>
      <tr><td><a href="{up}admin/index.html"><b>Engineering</b></a></td><td>The generators, the gates, the release process.</td><td>the site</td></tr>
    </tbody>
  </table>
  </div>

  <h2 id="index">Everything in the first edition</h2>
  <p>The complete index, from the file tree rather than from a list somebody maintains.</p>
{index}

  <div class="agent">
    <h4>For an agent</h4>
    <p>Start at <a href="{up}llms.txt">llms.txt</a>, which names every section hub and is gate-checked against the file tree. The first edition is everything under <code>/v1/</code> and is frozen at <b>{frozen}</b>: its bytes are recorded in <code>/v1/MANIFEST.json</code> with SHA-256 per file, and the build fails if any of them changes. Everything about the second edition lives under <code>/v2/</code> (hub: /v2/index.html), its plan is at <code>/v2/dev-pack/</code>. <code>/book/</code> always points at the current edition, which is the second. Machine surfaces that span both: <code>/decisions/data/decisions.json</code>, <code>/v1/docs/data/docs.json</code>, <code>/v1/altitudes/data/altitudes.json</code>. The front door&rsquo;s own data is at <code>/home/data/home.json</code>. Every page moved from <code>/x/</code> to <code>/v1/x/</code> at v0.4.0; the redirect stubs that briefly held the old addresses were retired at v0.4.7, so only the edition-prefixed addresses exist.</p>
  </div>
</main>

<footer class="site"><div class="cols"></div></footer>
</body>
</html>
"""


# The shelf row per book, built from book.json so the page quotes the same numbers the
# version gate computes. A remembered page count is exactly the kind of claim this estate
# does not allow itself.
BOOK_ORDER = ["fsg", "making-a-book", "fsg-universe"]
BOOK_BLURB = {
    "fsg": "The argument whole: from first principles, and from the running system.",
    "making-a-book": "The making-of: how this book was written with agents, and how to do it.",
    "fsg-universe": "The reference atlas for the method. Held back from this release.",
}


def book_rows(up):
    out = []
    for slug in BOOK_ORDER:
        meta = json.loads((ROOT / "v2" / "books" / slug / "book.json").read_text())
        held = meta["status"] == "held"
        where = [f'<a href="{up}v2/books/{slug}/index.html">Read it</a>']
        if (ROOT / "v2" / "books" / slug / "about.html").exists():
            where.append(f'<a href="{up}v2/books/{slug}/about.html">about this book</a>')
        if meta.get("pdf"):
            where.append(f'<a href="{up}v2/books/{slug}/{meta["pdf"]}">PDF</a>')
        where.append(f'<a href="{up}v2/books/{slug}/book.json">book.json</a>')
        pages = f' &middot; {meta["pdf_pages"]}pp' if meta.get("pdf_pages") else ""
        out.append(
            f'      <tr>\n'
            f'        <td><b>{meta["title"]}</b><br>'
            f'<span class="small dim">{BOOK_BLURB[slug]}</span></td>\n'
            f'        <td><span class="rstate {"rs-open" if held else "rs-applied"}">'
            f'{meta["version"]} &middot; {meta["status"]}</span>'
            f'<br><span class="small dim">{meta["chapters"]} chapters &middot; '
            f'{meta["words"]:,} words{pages}</span></td>\n'
            f'        <td>{" &middot; ".join(where)}</td>\n'
            f'      </tr>')
    # the frozen first edition closes the table: it is evidence, not a current book
    out.append(
        '      <tr>\n'
        '        <td><b>Meaning Through Connectivity</b><br>'
        '<span class="small dim">The first edition. Kept as the record of how this was worked out.</span></td>\n'
        f'        <td><span class="rstate rs-applied">complete &middot; frozen at {FROZEN}</span>'
        '<br><span class="small dim">hashed and gated: the build fails if a byte changes</span></td>\n'
        f'        <td><a href="{up}v1/book/index.html">Read it</a> &middot; '
        f'<a href="{up}v1/book/single.html">one page</a> &middot; '
        f'<a href="{up}v1/book/meaning-through-connectivity.pdf">print PDF</a> &middot; '
        f'<a href="{up}v1/index.html">its front page</a></td>\n'
        '      </tr>')
    return "\n".join(out)


def estate():
    up = "../"
    rows = releases()
    turns = [(v, d, TURNS[v]) for v, d in rows if v in TURNS]
    timeline = "\n".join(
        f'      <tr><td class="vnum"><a href="{up}admin/versions.html">{v}</a></td>'
        f'<td class="small dim">{d}</td><td>{note}</td></tr>'
        for v, d, note in turns)

    idx = first_edition_index()
    parts = []
    for name, pages in sorted(idx.items()):
        links = " &middot; ".join(
            f'<a href="{up}{p}">{Path(p).name.replace(".html", "")}</a>' for p in pages)
        parts.append(f'    <div class="frontidx"><h4>{name}</h4><p>{links}</p></div>')
    index = '  <div class="frontidxs">\n' + "\n".join(parts) + "\n  </div>"

    html = ESTATE.format(up=up, frozen=FROZEN, thisver=VERSION, timeline=timeline,
                         index=index, books=book_rows(up), nrel=len(rows))
    return html, len(turns), sum(len(v) for v in idx.values())


def main():
    (ROOT / "index.html").write_text(front())
    html, nturns, npages = estate()
    out = ROOT / "site/index.html"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(html)
    print(f"gen_front: index.html — the front door, {len(HOME['demo']['edges'])} demo edges, "
          f"{len(HOME['ladder']['levels'])} zoom levels")
    print(f"gen_front: site/index.html — the estate, {len(BOOK_ORDER)} books, "
          f"{nturns} turning releases, {npages} first-edition pages indexed")


if __name__ == "__main__":
    main()
