#!/usr/bin/env python3
"""Builds the book "Fractal Semantic Graphs: Meaning Through Connectivity".

Run from anywhere:  python3 v2/books/fsg/build.py

Three outputs, all projections of ONE source of truth (content/*.md):

  1. content/*.md  — the markdown chapters, authored. Nothing else is authored.
  2. index.html + <slug>.html  — the web hub and one page per chapter, each page
     rendering its own markdown client-side (assets/mdreader.js + marked), the
     estate's convention, so a page cannot drift from the file it claims to render.
  3. fsg.pdf  — the print book, built with weasyprint from the same markdown.
     This is the flight deliverable: self-contained, front matter, contents,
     figures embedded, readable offline start to finish.

The page skeleton is cribbed from admin/build/gen_devpack.py's PAGE template; the
empty <nav class="site"> and <footer class="site"> shells are stamped by chrome.py
at release time.

Also writes book.json: the machine surface (every chapter with its part, its word
count and the SHA-256 of its markdown), so a reader can check that a page or the
PDF describes the build it names.
"""
import hashlib
import html as html_mod
import json
import re
import shutil
from datetime import date
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
CONTENT = HERE / "content"
FIGURES = HERE / "figures"
SLUG = "fsg"
TITLE = "Fractal Semantic Graphs: Meaning Through Connectivity"
SITE = "https://graphs.sgit.ai"
GH = "https://github.com/SGit-AI/SGit-AI__Website__Graphs/blob/dev/v2/books/fsg/content"
VERSION = (ROOT / "admin/build/version.txt").read_text().strip()
TODAY = date.today().strftime("%-d %B %Y")

# ---------------------------------------------------------------- the shape --
# part title, part subtitle, the one-line promise, the chapter file stems.
PARTS = [
    ("Part one", "The claim",
     "Meaning through connectivity, from first principles, with no jargon before it is earned.",
     ["01__a-node-is-just-a-node", "02__why-graphs-at-all"]),
    ("Part two", "Semantic",
     "What makes a graph semantic rather than merely a network: a grammar of verbs, anchors "
     "instead of standards, and types that are computed paths rather than applied labels.",
     ["03__every-edge-is-a-verb", "04__anchors-not-standards", "05__a-type-is-a-path"]),
    ("Part three", "Fractal",
     "What the middle word of the title commits you to, how to falsify it, and what happens "
     "at every boundary and every zoom level once you take it seriously.",
     ["06__fractal-is-a-testable-claim", "07__a-graph-at-every-boundary",
      "08__documents-are-projections"]),
    ("Part four", "Computed",
     "The half the first edition could not write: how a document becomes a graph anchored to "
     "bytes, what identity means when a document changes, an engine that computes meaning "
     "deterministically, and why an explanation is a path rather than a narration.",
     ["09__the-universe-method", "10__two-kinds-of-address", "11__meaning-computed",
      "12__every-box-explains-itself"]),
    ("Part five", "In practice",
     "Where this runs today, what ships and what is argued, and how to build your own first "
     "graph tomorrow.",
     ["13__the-fractal-in-production", "14__what-ships-what-is-argued",
      "15__your-first-graph"]),
]
FRONT = ["00__front-matter"]
BACK = ["16__colophon", "17__reference-card"]

# one line per chapter, shown on the hub and in the contents. Authored, because
# "what it gives you" is a judgement the generator cannot make.
BLURB = {
    "00__front-matter": "What this book is, what you will know at the end, the editorial "
                        "choices recorded, and the disclosure.",
    "01__a-node-is-just-a-node": "The two 8080s, the five Reviews, the confidence ladder, and "
                                 "why a named absence beats a hidden one.",
    "02__why-graphs-at-all": "Three things people mean by graph and why this is the third; the "
                             "positions on GraphRAG, RDF, property graphs and vector search; and "
                             "the four situations where this argument is the wrong one.",
    "03__every-edge-is-a-verb": "Five rules you can apply tomorrow, the banned edge, the fifteen "
                                "verbs, and the register that makes the inverse rule "
                                "machine-checkable.",
    "04__anchors-not-standards": "Why merging two vocabularies destroys the finding, the "
                                 "three-layer arrangement that replaces it, and two bridge "
                                 "registers you can watch being used.",
    "05__a-type-is-a-path": "Node type formulas, the grounding ladder, supersede-never-delete, "
                            "and a compliance finding that is arithmetic.",
    "06__fractal-is-a-testable-claim": "The zoom test, applied to this estate's own two zooms, "
                                       "including the row where it fails.",
    "07__a-graph-at-every-boundary": "Where determinism, explainability and provenance actually "
                                     "die, the security property stated narrowly, twins, and the "
                                     "air gap.",
    "08__documents-are-projections": "The projection claim, and the build gate that rebuilds the "
                                     "document from the graph and fails unless the bytes match.",
    "09__the-universe-method": "How a raw document becomes a graph anchored to exact bytes, "
                               "coverage total by construction, and the usage rating that caught "
                               "the first edition misreading its own source.",
    "10__two-kinds-of-address": "Content address versus identity address, and a working "
                                "algorithm for keeping identity stable across edits.",
    "11__meaning-computed": "An engine in the shape of a transformer where nothing is learned "
                            "and everything is named, with its formulas in the open and its "
                            "limits stated.",
    "12__every-box-explains-itself": "Four properties an explanation must have to be checkable, "
                                     "and what happens when a diagram of a system is enforced by "
                                     "a test.",
    "13__the-fractal-in-production": "Twenty published vaults, the worked graphs with real "
                                     "numbers, and what a network of nineteen sites does and does "
                                     "not demonstrate.",
    "14__what-ships-what-is-argued": "What is running and checkable, what is a design, what does "
                                     "not exist anywhere, and four corrections this book carries.",
    "15__your-first-graph": "An afternoon, a week and a month of instructions, ten rules on one "
                            "page, and six ways this goes wrong.",
    "16__colophon": "How the book was made, what was cut, what remains open, where it might be "
                    "wrong, and every figure with its source.",
    "17__reference-card": "The thesis, the ten rules, the edge set, the two ladders, the "
                          "vocabulary, and the block to paste into an agent session.",
}

ORDER = FRONT + [s for _, _, _, ss in PARTS for s in ss] + BACK
PART_OF = {s: (p, sub) for p, sub, _, ss in PARTS for s in ss}


# ------------------------------------------------------------------ helpers --
def slug_of(stem):
    """01__a-node-is-just-a-node -> a-node-is-just-a-node"""
    return stem.split("__", 1)[1]


def read(stem):
    return (CONTENT / f"{stem}.md").read_text()


def title_of(md):
    m = re.search(r"^#\s+(.+)$", md, re.M)
    return m.group(1).strip() if m else "Untitled"


def esc(t):
    return html_mod.escape(str(t), quote=True)


def to_html(md):
    """Markdown -> HTML with the extensions this book's prose uses. Raw HTML
    (the note / warn / claim divs) passes through untouched, which is why the
    same markdown renders identically in the browser through marked."""
    import markdown
    h = markdown.markdown(
        md, extensions=["tables", "fenced_code", "attr_list", "md_in_html", "sane_lists"])
    return classify(h)


def classify(h):
    """A paragraph that is entirely one emphasis run is either a figure caption
    (it starts "Figure") or the chapter's promise line. Both want their own
    styling in print, and neither should turn every inline emphasis into a block,
    which is what a bare p > em:only-child selector does."""
    def repl(m):
        inner = m.group(1)
        text = re.sub(r"<[^>]+>", "", inner).strip()
        cls = "figcap" if text.startswith("Figure") else "promise"
        return f'<p class="{cls}"><em>{inner}</em></p>'
    return re.sub(r"<p><em>(.*?)</em></p>", repl, h, flags=re.S)


# --------------------------------------------------------------- web pages ---
PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title} &mdash; graphs.sgit.ai</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{site}/v2/books/fsg/{slug}.html">
<meta property="og:type" content="article">
<meta property="og:site_name" content="graphs.sgit.ai">
<meta property="og:url" content="{site}/v2/books/fsg/{slug}.html">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta name="twitter:card" content="summary">
<link rel="alternate" type="text/markdown" href="content/{stem}.md" title="The raw markdown, which is the source of truth">
<link rel="stylesheet" href="../../../assets/site.css">
</head>
<body>

<nav class="site"><div class="row"></div></nav>

<main class="doc">
<div class="crumb"><a href="../../../index.html">graphs.sgit.ai</a> &rarr; <a href="../../index.html">the second edition</a> &rarr; <a href="index.html">Fractal Semantic Graphs</a> &rarr; <b>{crumb}</b></div>
<h1>{title}</h1>
<p class="lead">{desc}</p>

<div class="docmeta">
  <span class="k">Book</span><span class="v">{book} &middot; {partline}</span>
  <span class="k">Read offline</span><span class="v"><a href="fsg.pdf">the whole book as one PDF</a></span>
  <span class="k">Licence</span><span class="v">CC BY 4.0</span>
  <span class="k">Source</span><span class="v"><a href="content/{stem}.md">raw markdown</a> &middot; <a href="{gh}/{stem}.md">view on GitHub</a></span>
</div>

<div class="mdread-label">&#128196; Rendered from the <a href="content/{stem}.md">raw markdown</a>, which is the source of truth. This page is presentation.</div>
<div class="mdread" id="mdread" data-src="content/{stem}.md"><noscript><p class="dim">In-page rendering needs JavaScript &mdash; <a href="content/{stem}.md">open the raw markdown</a>.</p></noscript></div>

<div class="pagenav">
  <span>{prev}</span>
  <span>{next}</span>
</div>
</main>

<footer class="site"><div class="cols"></div></footer>
<script src="../../../assets/vendor/marked.min.js"></script>
<script src="../../../assets/mdreader.js" defer></script>
<script>
/* The markdown is the source of truth and lives in content/, so its figure paths are
   ../figures/... — correct for that file, and wrong for this page, which sits one level
   up. mdreader renders the markdown into this page, so the paths are re-based here
   rather than bent in the source. Watches, because the render is asynchronous. */
(function () {{
  var el = document.getElementById('mdread');
  if (!el) return;
  function fix() {{
    el.querySelectorAll('img[src*="/figures/"]').forEach(function (i) {{
      var s = i.getAttribute('src');
      if (s.indexOf('../figures/') === 0) i.setAttribute('src', s.slice(3));
    }});
  }}
  new MutationObserver(fix).observe(el, {{ childList: true, subtree: true }});
  fix();
}})();
</script>
</body>
</html>
"""

HUB = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Fractal Semantic Graphs: Meaning Through Connectivity &mdash; graphs.sgit.ai</title>
<meta name="description" content="The second edition of the argument: meaning through connectivity, from first principles and from the running system. Fifteen chapters in five parts, and one PDF that reads start to finish offline.">
<link rel="canonical" href="{site}/v2/books/fsg/index.html">
<meta property="og:type" content="book">
<meta property="og:site_name" content="graphs.sgit.ai">
<meta property="og:url" content="{site}/v2/books/fsg/index.html">
<meta property="og:title" content="Fractal Semantic Graphs: Meaning Through Connectivity">
<meta property="og:description" content="A node connected to nothing means nothing. The edition that argues from first principles AND from the running system.">
<meta name="twitter:card" content="summary">
<link rel="stylesheet" href="../../../assets/site.css">
</head>
<body>

<nav class="site"><div class="row"></div></nav>

<main class="doc">
<div class="crumb"><a href="../../../index.html">graphs.sgit.ai</a> &rarr; <a href="../../index.html">the second edition</a> &rarr; <b>Fractal Semantic Graphs</b></div>
<h1>Fractal Semantic Graphs: Meaning Through Connectivity</h1>
<p class="lead">A node connected to nothing means nothing. What a thing is emerges from the edges traceable from it, and how much you can rely on that meaning is a function of how richly and how independently it is connected. This is the edition that argues that from first principles <b>and</b> from the running system.</p>

<div class="docmeta">
  <span class="k">Shape</span><span class="v">{nch} chapters in five parts, plus front matter, a colophon and a reference card &middot; {words:,} words</span>
  <span class="k">Offline</span><span class="v"><a href="fsg.pdf"><b>the whole book as one PDF</b></a> &middot; {pages} pages &middot; reads start to finish with no link followed</span>
  <span class="k">Source</span><span class="v">the markdown under <a href="content/">content/</a> is the source of truth; every page renders its own file</span>
  <span class="k">Machine</span><span class="v"><a href="book.json">book.json</a> &middot; every chapter with its part, word count and SHA-256</span>
  <span class="k">Licence</span><span class="v">CC BY 4.0 &middot; {version} &middot; {today}</span>
</div>

<div class="note"><b>Written by Dinis Cruz together with a team of AI agents.</b> This book was written by an AI agent working from a written commission, reading the corpus directly and anchoring every claim to it. The agent chose the structure, the chapter count, the voice and the figures, and recorded those choices in the front matter. <a href="../../../v1/about/participant.html">The full participant disclosure</a>, including the four situations in which this book's argument is the wrong one, applies here unchanged.</div>

{body}

<div class="agent">
  <h4>For an agent</h4>
  <p>The markdown under <code>content/</code> is the source of truth and carries the same CC BY 4.0 licence as everything else here; every page on this hub renders its own file client-side, so a page can never describe a chapter it did not render. <a href="book.json">book.json</a> carries every chapter with its part, its word count and the SHA-256 of its markdown, so a quotation can be checked against the build it came from. If you are summarising this book: it is <b>not a graph database pitch</b> and it says so; the semantic layer is <b>designed, not shipped</b>; and the chapter that separates the two is <a href="what-ships-what-is-argued.html">What ships, what is argued</a>. The block written to be pasted into an agent session is in <a href="reference-card.html">the reference card</a>.</p>
</div>
</main>

<footer class="site"><div class="cols"></div></footer>
</body>
</html>
"""


def build_pages(chapters):
    rows = []
    # front matter
    rows.append('<h2 id="front">Front matter</h2>')
    rows.append(chapter_cards([c for c in chapters if c["stem"] in FRONT]))
    for pnum, (part, sub, promise, stems) in enumerate(PARTS, 1):
        anchor = re.sub(r"[^a-z]+", "-", sub.lower()).strip("-")
        rows.append(f'<h2 id="{anchor}">{esc(part)}: {esc(sub)}</h2>')
        rows.append(f'<p>{esc(promise)}</p>')
        rows.append(chapter_cards([c for c in chapters if c["stem"] in stems]))
    rows.append('<h2 id="back">Back matter</h2>')
    rows.append(chapter_cards([c for c in chapters if c["stem"] in BACK]))
    return "\n".join(rows)


def chapter_cards(cs):
    out = ['<div class="tablewrap"><table><thead><tr><th>Chapter</th><th>What it gives you</th></tr></thead><tbody>']
    for c in cs:
        out.append(f'<tr><td><a href="{c["slug"]}.html"><b>{esc(c["title"])}</b></a>'
                   f'<br><span class="small dim">{c["words"]:,} words</span></td>'
                   f'<td>{esc(c["blurb"])}</td></tr>')
    out.append("</tbody></table></div>")
    return "\n".join(out)


# --------------------------------------------------------------------- PDF ---
PDF_CSS = """
@page {
  size: 168mm 240mm;           /* trade format: comfortable on a tablet, sane in print */
  margin: 16mm 15mm 15mm 15mm;
  @bottom-center { content: counter(page); font: 8.5pt "Source Serif 4", Georgia, serif; color: #6b6b6b; }
  @top-center { content: string(runhead); font: 7.5pt "Source Sans 3", system-ui, sans-serif;
                letter-spacing: .06em; text-transform: uppercase; color: #9a9a9a; }
}
@page :first { @bottom-center { content: none } @top-center { content: none } }
@page cover { margin: 0; @bottom-center { content: none } @top-center { content: none } }
@page part { @top-center { content: none } }

html { font-size: 9.8pt; }
body { margin: 0; font-family: "Source Serif 4", Georgia, "Times New Roman", serif;
       color: #1b1b1b; line-height: 1.385; hyphens: auto; text-align: justify; }
h1, h2, h3, h4 { font-family: "Source Sans 3", "Helvetica Neue", Arial, sans-serif;
                 font-weight: 600; color: #111; text-align: left; hyphens: none; }

/* ---- cover ---- */
/* Light on purpose: a cover that prints on an ordinary printer without laying down
   a full page of ink, and photocopies without going grey. The colour is carried by the
   rules and the kicker, not by the ground. */
.cover { page: cover; height: 240mm; padding: 30mm 18mm 16mm 18mm; box-sizing: border-box;
         background: #faf8f3; color: #1b1b1b; break-after: page;
         border-top: 6mm solid #17423a; }
.cover .kicker { font-family: "Source Sans 3", sans-serif; font-size: 8.5pt; letter-spacing: .18em;
                 text-transform: uppercase; color: #2f7a68; }
.cover h1 { font-size: 27pt; line-height: 1.1; margin: 10mm 0 0; color: #11332c; }
.cover .sub { font-size: 15pt; margin: 5mm 0 0; color: #2f5a52; font-style: italic; }
.cover .rule { height: 2px; background: #17423a; margin: 12mm 0 8mm; }
.cover p { font-size: 9.5pt; color: #33413d; text-align: left; margin: 0 0 3mm; }
.cover p b { color: #11332c; }
.cover .foot { position: absolute; bottom: 18mm; left: 18mm; right: 18mm; padding-top: 3mm;
               border-top: 1px solid #d7d3c8;
               font-family: "Source Sans 3", sans-serif; font-size: 8pt; color: #5c6a66; }

/* ---- part title pages ---- */
.part { page: part; break-before: page; break-after: page; padding-top: 42mm; }
.part .pnum { font-family: "Source Sans 3", sans-serif; font-size: 9pt; letter-spacing: .18em;
              text-transform: uppercase; color: #2f7a68; }
.part h1 { font-size: 26pt; margin: 4mm 0 0; }
.part p { font-size: 10.5pt; color: #444; margin-top: 7mm; max-width: 92%; }
.part ol { font-family: "Source Sans 3", sans-serif; font-size: 9.5pt; color: #555;
           margin-top: 10mm; padding-left: 5mm; }

/* ---- chapters ---- */
.chapter { break-before: page; }
.chapter.plain { break-before: page; }
.chapter h1 { font-size: 19pt; line-height: 1.12; margin: 0 0 4mm; string-set: runhead content(text); }
.chapter h2 { font-size: 12.2pt; margin: 6mm 0 1.8mm; break-after: avoid; }
.chapter h3 { font-size: 10.5pt; margin: 5mm 0 1.5mm; break-after: avoid; }
p { margin: 0 0 2.3mm; }
p + p { text-indent: 0; }
em { font-style: italic; }
blockquote { margin: 3mm 0 3mm 4mm; padding-left: 4mm; border-left: 2px solid #cfd8d4;
             color: #33413d; font-size: 9.8pt; }
blockquote p { margin-bottom: 1.5mm; }
hr { border: 0; border-top: 1px solid #dcdcdc; margin: 5mm 0; }

code { font-family: "DejaVu Sans Mono", "SF Mono", Consolas, monospace; font-size: .86em;
       background: #f1f0ec; padding: .5pt 1.6pt; border-radius: 2px; }
pre { background: #f6f5f1; border: 1px solid #e2e0da; border-radius: 3px;
      padding: 2.6mm 3.2mm; font-size: 7.3pt; line-height: 1.3; overflow: hidden;
      break-inside: avoid; margin: 3mm 0; }
pre code { background: none; padding: 0; font-size: 1em; }

table { border-collapse: collapse; width: 100%; font-size: 8.3pt; margin: 2.6mm 0;
        break-inside: avoid; font-family: "Source Sans 3", sans-serif; }
th { text-align: left; border-bottom: 1.5px solid #333; padding: 1.2mm 1.8mm; }
td { border-bottom: 1px solid #e4e4e4; padding: 1.2mm 1.8mm; vertical-align: top; }
table code { font-size: .9em; }

img { max-width: 84%; display: block; margin: 3.5mm auto 1.5mm; border: 1px solid #ddd; }
figure, .figwrap { break-inside: avoid; }
p.figcap { font-size: 8.3pt; color: #555; text-align: left; font-style: italic;
            margin: 0 0 4.5mm; break-before: avoid; }
p.figcap em { font-style: italic; }
p.promise { font-size: 9.6pt; color: #2f5a52; font-style: italic; text-align: left;
            margin: 0 0 4mm; }

.note, .warn, .claim, .agent { break-inside: avoid; margin: 3.5mm 0; padding: 2.8mm 3.2mm;
       font-size: 9.4pt; border-radius: 3px; }
.note  { background: #f2f6f5; border-left: 3px solid #2f7a68; }
.warn  { background: #fbf5ec; border-left: 3px solid #c08a2e; }
.claim { background: #eef4f2; border-left: 3px solid #17423a; font-size: 10.1pt;
         font-family: "Source Sans 3", sans-serif; }
.claim p, .note p, .warn p { margin-bottom: 1.6mm; }
.claim p:last-child, .note p:last-child, .warn p:last-child { margin-bottom: 0; }

ul, ol { margin: 0 0 2.6mm; padding-left: 5mm; }
li { margin-bottom: 1mm; }

/* ---- contents ---- */
.toc { break-before: page; }
.toc h1 { font-size: 19pt; margin-bottom: 5mm; }
.toc .tpart { font-family: "Source Sans 3", sans-serif; font-size: 9pt; letter-spacing: .12em;
              text-transform: uppercase; color: #2f7a68; margin: 6mm 0 2mm; }
.toc ol { list-style: none; padding: 0; margin: 0; }
.toc li { margin: 0 0 1.6mm; font-size: 9.6pt; }
.toc a { color: #1b1b1b; text-decoration: none; }
.toc a::after { content: "  " target-counter(attr(href), page); color: #777; font-size: 8.6pt; }
.toc .tsub { display: block; font-size: 8.3pt; color: #666; font-family: "Source Sans 3", sans-serif; }
a { color: #1b1b1b; text-decoration: none; }
.chapter a { text-decoration: none; border-bottom: .5px solid #c9d3d0; }
"""

PDF_SHELL = """<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>{title}</title>
<style>{css}</style>
</head><body>
{cover}
{toc}
{body}
</body></html>
"""


def pdf_cover():
    return f"""<section class="cover">
  <div class="kicker">graphs.sgit.ai &middot; second edition of the argument</div>
  <h1>Fractal Semantic&nbsp;Graphs</h1>
  <div class="sub">Meaning Through Connectivity</div>
  <div class="rule"></div>
  <p>A node connected to nothing means nothing. What a thing is emerges from the edges
     traceable from it, and how much you can rely on that meaning is a function of how richly
     and how independently it is connected.</p>
  <p>The first edition argued that from first principles. Since then the argument was built:
     a document decomposed to the word with every claim anchored to exact bytes, an engine
     that computes meaning deterministically with its arithmetic in the open, registers where
     a human corrects the machine and the correction is the training.</p>
  <p>This is the edition that argues from first principles <b>and</b> from the running system.</p>
  <div class="foot">Dinis Cruz with a team of AI agents &middot; {VERSION} &middot; {TODAY}
     &middot; CC BY 4.0 &middot; not a graph database pitch</div>
</section>"""


def pdf_toc(chapters):
    out = ['<section class="toc"><h1>Contents</h1>']
    def block(label, cs):
        out.append(f'<div class="tpart">{esc(label)}</div><ol>')
        for c in cs:
            out.append(f'<li><a href="#{c["slug"]}">{esc(c["title"])}</a>'
                       f'<span class="tsub">{esc(c["blurb"])}</span></li>')
        out.append("</ol>")
    block("Front matter", [c for c in chapters if c["stem"] in FRONT])
    for part, sub, _, stems in PARTS:
        block(f"{part} · {sub}", [c for c in chapters if c["stem"] in stems])
    block("Back matter", [c for c in chapters if c["stem"] in BACK])
    out.append("</section>")
    return "\n".join(out)


def pdf_part(pnum, part, sub, promise, cs):
    items = "".join(f"<li>{esc(c['title'])}</li>" for c in cs)
    return (f'<section class="part"><div class="pnum">{esc(part)}</div>'
            f'<h1>{esc(sub)}</h1><p>{esc(promise)}</p><ol>{items}</ol></section>')


PRINT_FIGS = HERE / "_printfigs"


def print_figures():
    """The web keeps crisp palette PNGs. The PDF gets JPEGs of the same pixels,
    written to a scratch directory that is removed after the build: weasyprint
    re-encodes a PNG into a flate stream of raw pixels, which triples the file, and
    a book meant to be downloaded before a flight should not be ten megabytes.
    Nothing about the figures changes, only how they are carried into the PDF."""
    from PIL import Image
    PRINT_FIGS.mkdir(exist_ok=True)
    for src in sorted(FIGURES.glob("*.png")):
        im = Image.open(src).convert("RGB")
        if im.width > 1500:
            im = im.resize((1500, round(im.height * 1500 / im.width)), Image.LANCZOS)
        im.save(PRINT_FIGS / (src.stem + ".jpg"), quality=86, optimize=True,
                progressive=True, subsampling=0)


def figure_paths(h):
    """Point the print HTML at the scratch JPEGs, by absolute path so weasyprint
    resolves them wherever the build runs from."""
    h = re.sub(r'src="\.\./figures/([^"]+)\.png"',
               lambda m: f'src="{PRINT_FIGS.as_posix()}/{m.group(1)}.jpg"', h)
    return h


# -------------------------------------------------------------------- main ---
def main():
    print_figures()
    chapters = []
    for stem in ORDER:
        md = read(stem)
        chapters.append(dict(
            stem=stem, slug=slug_of(stem), title=title_of(md),
            blurb=BLURB[stem], words=len(md.split()),
            sha256=hashlib.sha256((CONTENT / f"{stem}.md").read_bytes()).hexdigest(),
            md=md))

    # --- 1. the web pages -------------------------------------------------
    for i, c in enumerate(chapters):
        prev = (f'&larr; <a href="{chapters[i-1]["slug"]}.html">{esc(chapters[i-1]["title"])}</a>'
                if i else '&larr; <a href="index.html">the book</a>')
        nxt = (f'<a href="{chapters[i+1]["slug"]}.html">{esc(chapters[i+1]["title"])}</a> &rarr;'
               if i + 1 < len(chapters) else '<a href="fsg.pdf">the whole book as one PDF</a> &rarr;')
        part, sub = PART_OF.get(c["stem"], ("", ""))
        partline = f"{part}: {sub}" if part else (
            "front matter" if c["stem"] in FRONT else "back matter")
        (HERE / f'{c["slug"]}.html').write_text(PAGE.format(
            title=esc(c["title"]), desc=esc(c["blurb"]), slug=c["slug"], stem=c["stem"],
            crumb=esc(c["title"]), site=SITE, gh=GH, book=esc(TITLE),
            partline=esc(partline), prev=prev, next=nxt))

    # --- 2. the PDF -------------------------------------------------------
    body = []
    for pnum, (part, sub, promise, stems) in enumerate(PARTS, 1):
        cs = [c for c in chapters if c["stem"] in stems]
        body.append(pdf_part(pnum, part, sub, promise, cs))
        for c in cs:
            body.append(f'<section class="chapter" id="{c["slug"]}">'
                        + figure_paths(to_html(c["md"])) + "</section>")
    for c in chapters:
        if c["stem"] in BACK:
            body.append(f'<section class="chapter" id="{c["slug"]}">'
                        + figure_paths(to_html(c["md"])) + "</section>")

    front = "\n".join(
        f'<section class="chapter" id="{c["slug"]}">' + figure_paths(to_html(c["md"])) + "</section>"
        for c in chapters if c["stem"] in FRONT)
    doc = PDF_SHELL.format(title=esc(TITLE), css=PDF_CSS, cover=pdf_cover() + front,
                           toc=pdf_toc(chapters), body="\n".join(body))
    tmp = HERE / "_print.html"
    tmp.write_text(doc)
    pdf = HERE / f"{SLUG}.pdf"
    pages = None
    try:
        import weasyprint
        weasyprint.HTML(filename=str(tmp)).write_pdf(str(pdf))
        pages = pdf_page_count(pdf)
        engine = f"weasyprint {weasyprint.__version__}"
    except ImportError:
        engine = "not built (WeasyPrint unavailable)"
    tmp.unlink(missing_ok=True)
    shutil.rmtree(PRINT_FIGS, ignore_errors=True)

    # --- 3. the hub and the machine surface -------------------------------
    total = sum(c["words"] for c in chapters)
    (HERE / "index.html").write_text(HUB.format(
        site=SITE, body=build_pages(chapters), nch=15, words=total,
        pages=pages or "?", version=VERSION, today=TODAY))

    (HERE / "book.json").write_text(json.dumps(dict(
        title=TITLE, slug=SLUG, version=VERSION, date=TODAY, licence="CC BY 4.0",
        words=total, pdf=dict(file=f"{SLUG}.pdf", pages=pages, engine=engine,
                              bytes=pdf.stat().st_size if pdf.exists() else None),
        parts=[dict(part=p, subtitle=s, promise=pr, chapters=ss) for p, s, pr, ss in PARTS],
        chapters=[dict(stem=c["stem"], slug=c["slug"], title=c["title"], blurb=c["blurb"],
                       part=PART_OF.get(c["stem"], ("front/back matter", ""))[0],
                       words=c["words"], sha256=c["sha256"],
                       markdown=f'content/{c["stem"]}.md',
                       page=f'{c["slug"]}.html') for c in chapters],
        figures=sorted(p.name for p in FIGURES.glob("*.png")),
    ), indent=1) + "\n")

    print(f"fsg: {len(chapters)} chapters, {total:,} words, "
          f"{len(list(FIGURES.glob('*.png')))} figures")
    print(f"fsg: pdf {pdf.stat().st_size:,}b, {pages} pages ({engine})")
    return pages


def pdf_page_count(path):
    """Count pages in either PDF flavour. Lifted from gen_packs.py, which learnt it
    the hard way: WeasyPrint packs the object tree into compressed object streams
    and the naive count returns zero."""
    import zlib
    d = path.read_bytes()
    n = len(re.findall(rb"/Type\s*/Page[^s]", d))
    for st in re.findall(rb"stream\r?\n(.*?)endstream", d, re.S):
        try:
            n += len(re.findall(rb"/Type\s*/Page[^s]", zlib.decompress(st)))
        except Exception:
            continue
    return n or None


if __name__ == "__main__":
    main()
