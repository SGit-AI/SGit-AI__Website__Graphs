#!/usr/bin/env python3
"""Generates the web edition of this book: the hub and one page per chapter.

Run from anywhere:  python3 v2/books/making-a-book/gen_pages.py
Then run admin/build/chrome.py, which fills in the nav and footer shells.

Same convention as /v2/dev-pack/ and /v2/memos/: the raw markdown in content/ is the
source of truth and every page renders its own source file client-side with
assets/mdreader.js, so a page cannot drift from the file it claims to render. The page
skeleton is cribbed from admin/build/gen_devpack.py.
"""
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
CONTENT = HERE / "content"
FIGURES = HERE / "figures"
ROOT = HERE.parents[2]
GH = ("https://github.com/SGit-AI/SGit-AI__Website__Graphs/blob/dev/"
      "v2/books/making-a-book")
CANON = "https://graphs.sgit.ai/v2/books/making-a-book"

TITLE = "Creating a Book Using Agentic Workflows"
LEAD = ("The true story of how the second edition of <i>Fractal Semantic Graphs: Meaning "
        "Through Connectivity</i> is being built: one person talking into a phone, a set "
        "of AI agents, and eighty-eight tagged releases in six days. Written for authors "
        "who want to work this way, not for graph specialists. Every scene in it is "
        "checkable at the git tag its caption names.")

# authored, because "what it gives you" is a judgement
BLURB = {
 "00__front-matter.md": "What the book is, who it is for, what you will know at the end, how to check any claim in it, and the AI-authorship disclosure.",
 "01__the-loop.md": "Voice memo, verbatim brief, build, release, live review, usually inside an hour. The four numbers that tell you whether the loop is running.",
 "02__the-pivot.md": "A book written in three days, and then the memo that cancelled the plan for the second one: build the universe first, find the plot afterwards.",
 "03__briefs-as-the-contract.md": "Why the raw transcript goes above the tidy summary rather than instead of it, and the three-part shape every brief in this corpus has.",
 "04__gates-buy-speed.md": "Why automated checks make an agentic project faster. The seven checks to start with, the unit suite from 13 tests to 84, and the release note as a gate.",
 "05__the-instrument.md": "Five screenshots from five points in history, and the design law underneath them: every node move costs the viewer their mental picture.",
 "06__two-agents-one-repo.md": "Two Claude sessions, one repository, three merge commits. The four-note exchange, the bug neither could see alone, and the four rules that held.",
 "07__the-failures.md": "Nine failures with the cost attached: the iPad round, the wire that jumped a layer, the negation that was not there, and the hour lost to a zombie browser.",
 "08__reviewing-out-loud.md": "Ten screenshots and three and a half minutes of talking produced six findings. And the inversion that followed: pages that broadcast their own state.",
 "09__the-experiments.md": "A crazy experiment from voice memo to tested, folder-structured subsystem in eight releases across one afternoon, with its exit named before it started.",
 "10__the-founders-craft.md": "Five habits from a person who steered eleven build rounds in six days without writing a line of code, and the five things he did not do.",
 "11__the-playbook.md": "The chapter that stands alone. What to set up on day zero, what to say in your first memo, what to expect to go wrong, and the honest costs.",
 "12__what-it-costs.md": "What the six days did not produce, the costs nobody mentions, and four situations where this method is the wrong one.",
 "13__appendix-a-one-brief-annotated.md": "One complete brief, verbatim, annotated segment by segment, with the release it produced thirty-three minutes later.",
 "14__appendix-b-the-chronology.md": "All eighty-eight releases in order, by day, with timestamps and the opening of each release note.",
 "15__appendix-c-the-harness.md": "The scripts: time travel by git tag, the screenshot harness and its port rule, and every command that produced a number in this book.",
 "16__colophon.md": "How the book was made, what was cut, what remains open, and the honesty positions carried from the corpus.",
}

PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title} &mdash; graphs.sgit.ai</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{canon}/{slug}.html">
<meta property="og:type" content="article">
<meta property="og:site_name" content="graphs.sgit.ai">
<meta property="og:url" content="{canon}/{slug}.html">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta name="twitter:card" content="summary">
<link rel="alternate" type="text/markdown" href="content/{src}" title="The raw markdown, which is the source of truth">
<link rel="stylesheet" href="../../../assets/site.css">
<style>
/* This book's chapters embed figures, which the site's shared markdown reader has no
   opinion about. The rule lives here rather than in assets/site.css because it is this
   book's presentation, not the site's. */
.mdread img {{ max-width: 100%; height: auto; display: block; margin: 1.4rem auto .4rem;
  border: 1px solid #e4e0d6; border-radius: 8px }}
.mdread p:has(img) {{ margin-bottom: 0 }}
.mdread p:has(img) + p {{ font-size: .85rem; line-height: 1.5; color: #5c5f66;
  margin-top: .2rem }}
</style>
</head>
<body>

<nav class="site"><div class="row"></div></nav>

<main class="doc">
<div class="crumb"><a href="../../../index.html">graphs.sgit.ai</a> &rarr; <a href="../../index.html">the second edition</a> &rarr; <a href="index.html">creating a book</a> &rarr; <b>{num}</b></div>
<h1>{title}</h1>
<p class="lead">{desc}</p>

<div class="docmeta">
  <span class="k">Book</span><span class="v"><a href="index.html">Creating a Book Using Agentic Workflows</a> &middot; written against v0.5.11</span>
  <span class="k">Print</span><span class="v"><a href="making-a-book.pdf">the whole book as one PDF</a> &middot; 92 pages, reads offline</span>
  <span class="k">Licence</span><span class="v">CC BY 4.0</span>
  <span class="k">Source</span><span class="v"><a href="content/{src}">raw markdown</a> &middot; <a href="{gh}/content/{src}">view on GitHub</a></span>
</div>

<div class="mdread-label">&#128196; Rendered from the <a href="content/{src}">raw markdown</a>, which is the source of truth. This page is presentation.</div>
<div class="mdread" id="mdread" data-src="content/{src}"><noscript><p class="dim">In-page rendering needs JavaScript &mdash; <a href="content/{src}">open the raw markdown</a>.</p></noscript></div>

<div class="pagenav">
  <span>{prev}</span>
  <span>{next}</span>
</div>
</main>

<footer class="site"><div class="cols"></div></footer>
<script src="../../../assets/vendor/marked.min.js"></script>
<script src="../../../assets/mdreader.js" defer></script>
</body>
</html>
"""

HUB = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Creating a Book Using Agentic Workflows &mdash; graphs.sgit.ai</title>
<meta name="description" content="The making-of: how the second book is being built with AI agents, in six days and eighty-eight releases. Twelve chapters, three appendices, twenty figures re-taken from git tags.">
<link rel="canonical" href="{canon}/index.html">
<meta property="og:type" content="book">
<meta property="og:site_name" content="graphs.sgit.ai">
<meta property="og:url" content="{canon}/index.html">
<meta property="og:title" content="Creating a Book Using Agentic Workflows">
<meta property="og:description" content="The true story of how the second book is being built, for authors who want to use similar agentic workflows.">
<meta name="twitter:card" content="summary">
<link rel="stylesheet" href="../../../assets/site.css">
</head>
<body>

<nav class="site"><div class="row"></div></nav>

<main class="doc">
<div class="crumb"><a href="../../../index.html">graphs.sgit.ai</a> &rarr; <a href="../../index.html">the second edition</a> &rarr; <b>Creating a book</b></div>
<h1>Creating a Book Using Agentic Workflows</h1>
<p class="lead">{lead}</p>

<div class="docmeta">
  <span class="k">Read it</span><span class="v"><a href="making-a-book.pdf"><b>the print PDF</b></a> &middot; 92 pages, self-contained, reads offline &middot; or chapter by chapter below</span>
  <span class="k">Written</span><span class="v">against graphs.sgit.ai v0.5.11, 26 August 2026, by an AI agent on the repository it describes</span>
  <span class="k">Covers</span><span class="v">v0.1.0 (21 August 2026) to v0.5.11 (26 August 2026) &middot; 88 tagged releases &middot; 6 days</span>
  <span class="k">Source</span><span class="v">markdown in <a href="{gh}/content">content/</a> &middot; figures in <a href="{gh}/figures">figures/</a> &middot; built by <a href="{gh}/build.py">build.py</a></span>
  <span class="k">Licence</span><span class="v">CC BY 4.0</span>
</div>

<div class="note"><b>Not a graph database pitch.</b> This position travels with everything on this site and with everything in this book: there is no graph database in the system described here, and no RDF, SPARQL or Cypher in its code. The graphs are JSON files in a git repository. The book is about a way of working, not a product.</div>

<h2 id="what">What it is</h2>
<p>An expansion of <a href="../../dev-pack/retro-00-the-v04-retrospective.html">the v0.4 retrospective</a> into a full book, carried through the v0.5 era, and aimed at a different reader: not a graph specialist, but somebody with a book in them and an AI agent at hand. It is the third of <a href="../../dev-pack/book-pack-00-README.html">three books commissioned from this estate</a>, and the only one about the making rather than the material.</p>
<p>The promise: here is a working loop for writing a book with agents, demonstrated end to end on a real one, failures included. Every claim is checkable in the repository it describes, which is the loop's whole point.</p>

<h2 id="chapters">The book</h2>
<div class="tablewrap">
<table>
  <thead><tr><th>#</th><th>Chapter</th><th>What it gives you</th><th>Raw</th></tr></thead>
  <tbody>
{rows}
  </tbody>
</table>
</div>

<h2 id="checking">How to check any of it</h2>
<p>The repository carries a git tag for every one of the eighty-eight releases. Every figure in this book was taken by checking out the tag its caption names into a temporary worktree, serving it, and photographing the page as it actually was. None is a reconstruction, and any of them can be re-taken with the two scripts in <a href="15-appendix-c-the-harness.html">Appendix C</a>. Every number was computed from the repository rather than recalled, and the commands are in the same appendix. Every founder quotation is verbatim and was already published at <a href="../../memos/index.html">the memos hub</a> before this book was started.</p>

<h2 id="figures">The twenty figures</h2>
<p>Each one re-taken from the tag in its caption. In the order they appear in the book.</p>
<div class="dpfigs">
{figs}
</div>

</main>

<footer class="site"><div class="cols"></div></footer>
</body>
</html>
"""


def title_of(p):
    m = re.search(r"^#\s+(.+)$", p.read_text(encoding="utf-8"), re.M)
    return m.group(1).strip() if m else p.stem


def slug_of(name):
    return name[:-3].replace("__", "-").replace("_", "-")


def main():
    files = sorted(CONTENT.glob("*.md"))
    missing = [f.name for f in files if f.name not in BLURB]
    if missing:
        raise SystemExit("gen_pages: chapter(s) with no blurb: " + ", ".join(missing))

    rows = []
    for i, f in enumerate(files):
        slug = slug_of(f.name)
        num = f.name.split("__")[0]
        title = title_of(f)
        desc = BLURB[f.name]
        prev = (f'<a href="{slug_of(files[i-1].name)}.html">&larr; {files[i-1].name.split("__")[0]}</a>'
                if i else '<a href="index.html">&larr; The book</a>')
        nxt = (f'<a href="{slug_of(files[i+1].name)}.html">{files[i+1].name.split("__")[0]} &rarr;</a>'
               if i + 1 < len(files) else '<a href="index.html">The book &rarr;</a>')
        (HERE / f"{slug}.html").write_text(PAGE.format(
            slug=slug, src=f.name, num=num, title=title,
            desc=desc.replace('"', "&quot;"), canon=CANON, gh=GH,
            prev=prev, next=nxt), encoding="utf-8")
        rows.append(f'      <tr><td class="dpnum">{num}</td>'
                    f'<td><a href="{slug}.html"><b>{title}</b></a></td>'
                    f'<td>{desc}</td>'
                    f'<td><a href="content/{f.name}">.md</a></td></tr>')

    figs = []
    for p in sorted(FIGURES.glob("*.png")):
        n, tag, rest = p.stem.split("__", 2)
        figs.append(f'  <figure class="dpfig"><img src="figures/{p.name}" '
                    f'alt="{rest.replace("-", " ")} at {tag}" loading="lazy">'
                    f'<figcaption><b>{tag}</b> &middot; {rest.replace("-", " ")}</figcaption></figure>')

    (HERE / "index.html").write_text(HUB.format(
        rows="\n".join(rows), figs="\n".join(figs), lead=LEAD, canon=CANON, gh=GH),
        encoding="utf-8")
    print(f"gen_pages: index.html + {len(files)} chapter page(s)")


if __name__ == "__main__":
    main()
