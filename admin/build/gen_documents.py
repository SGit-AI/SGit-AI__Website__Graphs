#!/usr/bin/env python3
"""Generates documents/*.html — the in-page reader for every raw document under briefs/.

Run from anywhere: python3 admin/build/gen_documents.py
Then run chrome.py, which fills in the nav and footer.

The convention, inherited from pki.sgit.ai and sg-sentinel.sgit.ai: **the raw markdown
under /briefs/ is the source of truth; the rendered page is presentation.** Every reader
page says so, links the raw file, and renders it client-side from that same file — so a
page can never drift from the document it claims to render. It is the provenance
discipline this site argues for, applied to itself.

Adding a document: drop the .md into briefs/, add a row to DOCS, run this, run chrome.py,
add the page to sitemap.xml and llms.txt, and bump the version.
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
GH = "https://github.com/SGit-AI/SGit-AI__Website__Graphs/blob/dev/briefs"

# slug, source file, title, kind, the single most important fact in it, why it is on the site
DOCS = [
    ("brief", "00__BRIEF.md", "The brief",
     "Brief · v1.0 · 21 August 2026",
     "The mission, the thesis in nine sentences, the five audiences, the four lessons "
     "inherited from the sibling sites, the ten-step build order, and the honesty "
     "constraint that produced /shipped/.",
     "The document this site was built from. Everything else in this directory is an "
     "appendix to it."),
    ("pack-readme", "00__pack-readme.md", "Pack readme and tiers",
     "Readme · v1.0 · 21 August 2026",
     "Every repo path in the pack — including all 89 manifest rows — was verified to "
     "exist at v0.33.62, and two filenames were corrected against the repository during "
     "preparation.",
     "The map of the pack, and the tier definitions the manifest uses."),
    ("the-thesis", "01__the-thesis.md", "The thesis: 35 sourced quotes",
     "Quote bank · v1.0 · 21 August 2026",
     "The founder's own canonical essay on meaning through connectivity does not exist "
     "in the source corpus — every statement of the thesis in it is a fragment inside a "
     "brief about something else.",
     "The spine of the site. Every quotation on a rendered page comes from here, with "
     "its source path and date."),
    ("concepts", "02__concepts-index.md", "Thirty concepts, and the teaching order",
     "Index · v1.0 · 21 August 2026",
     "Thirty concepts with canonical sources, maturity and — the column that decides "
     "what could be published near-as-is — whether a newcomer could follow the existing "
     "document.",
     "The eighteen-step teaching order in this file is the site's information "
     "architecture. /start/, /grammar/ and /depth/ are that order, cut into three "
     "altitudes."),
    ("worked-examples", "03__worked-examples-index.md", "Twenty worked examples, with counts",
     "Index · v1.0 · 21 August 2026",
     "Numbers for the three live vaults come from the published pages; numbers for repo "
     "artefacts come from parsing the documents — and the pack never mixes the two.",
     "The source of every number on /examples/, and of the shortlist of five."),
    ("visual-assets", "04__visual-assets-and-infographics.md", "Visual assets and the render backlog",
     "Index · v1.0 · 21 August 2026",
     "Wardley coordinates are [visibility, evolution] — the reverse of the usual "
     "convention — and a map with its axes transposed renders happily and says "
     "something entirely different.",
     "Behind /maps/, and the backlog of what is still unrendered."),
    ("site-architecture", "05__site-architecture.md", "The proposed site architecture",
     "Architecture · v1.0 · 21 August 2026",
     "The site follows the sibling-site pattern but adds a progressive-depth spine, "
     "because progressive disclosure is altitude — which makes the navigation a "
     "demonstration of the argument rather than merely a choice.",
     "The page-by-page IA this site is built against. Read it next to /admin/index.html "
     "to see what was built, what was merged, and what is still outstanding."),
    ("house-style", "06__house-style-and-conventions.md", "House style, conventions and constraints",
     "Conventions · v1.0 · 21 August 2026 · redacted",
     "llms.txt is not a convenience for agents but the whole surface — because when an "
     "agent tried to consume the parent site, the index fetch worked and then "
     "link-following failed.",
     "The conventions this site inherits, and the hard constraints on publishing. "
     "Redacted before publication — see PUBLIC.md."),
    ("what-the-graphs-found", "18__agent__what-the-graphs-found.md",
     "What the graphs found",
     "Retrospective brief · v0.3.26 · 23 August 2026",
     "The visualisations did not produce the insights: the arithmetic behind them did, and "
     "the visualisation is how a person notices. That is why the generators are "
     "load-bearing and the renderers are replaceable.",
     "Fourteen releases, twelve findings and the one mechanism behind all of them, written "
     "before the refactor so that what would be expensive to rediscover is on the record. "
     "Includes the thirteen gates that now fail the build, the class that keeps recurring "
     "(a number nothing was checking, which is every correction in the run), and what the "
     "refactor must not lose."),
    ("gaps", "08__gaps-and-fresh-writing.md", "The twelve gaps",
     "Gaps · v1.0 · 21 August 2026",
     "Twelve pages the corpus cannot supply. Two were blockers; the rest are marked on "
     "the pages that fill them.",
     "Every page on this site that says “written fresh” is filling a gap from this "
     "document, and names which one."),
    ("licensing", "09__licensing-decision.md", "The licensing decision",
     "Decision · 21 August 2026 · redacted",
     "Unless a document explicitly says otherwise, every .md file in the corpus is "
     "released under CC BY 4.0 — and the same applies to the entire content of every "
     "*.sgit.ai website. Irrevocability is the point, not a risk to be managed.",
     "The decision that unblocked this site, and the mechanics of applying it."),
    ("public", "PUBLIC.md", "What was changed before publication",
     "Transparency note",
     "Three redactions, in three files, with visible markers — because a silent "
     "redaction is the worse of the two options.",
     "The transparency convention this network uses when republishing anything."),
]

HEAD = '''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title} — graphs.sgit.ai</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="https://graphs.sgit.ai/documents/{slug}.html">
<meta property="og:type" content="article">
<meta property="og:site_name" content="graphs.sgit.ai">
<meta property="og:url" content="https://graphs.sgit.ai/documents/{slug}.html">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta name="twitter:card" content="summary">
<link rel="alternate" type="text/markdown" href="../briefs/{src}" title="The raw markdown, which is the source of truth">
<link rel="stylesheet" href="../assets/site.css">
</head>
<body>

<nav class="site"><div class="row"></div></nav>

<main class="doc">
<div class="crumb"><a href="../index.html">graphs.sgit.ai</a> / <a href="index.html">documents</a> / {slug}</div>
<h1>{title}</h1>

<div class="docmeta">
  <span class="k">Kind</span><span class="v">{kind}</span>
  <span class="k">Author</span><span class="v">Prepared by the SG/Send agentic team for graphs.sgit.ai</span>
  <span class="k">Licence</span><span class="v">CC BY 4.0</span>
  <span class="k">Source</span><span class="v"><a href="../briefs/{src}">raw markdown</a> · <a href="{gh}/{src}">view on GitHub</a></span>
</div>

<h2 id="fact">The single most important thing in it</h2>
<p class="lead">{fact}</p>

<h2 id="on-site">Why it is on this site</h2>
<p>{why}</p>

<h2 id="read">Read the document</h2>
<div class="mdread-label">📄 Rendered from the <a href="../briefs/{src}">raw markdown</a> — which is the source of truth. This page is presentation.</div>
<div class="mdread" id="mdread" data-src="../briefs/{src}"><noscript><p class="dim">In-page rendering needs JavaScript — <a href="../briefs/{src}">open the raw markdown</a>.</p></noscript></div>

<div class="pagenav">
  <span><a href="index.html">← All documents</a></span>
  <span><a href="../briefs/{src}">Raw markdown →</a></span>
</div>
</main>

<footer class="site"><div class="cols"></div></footer>
<script src="../assets/vendor/marked.min.js"></script>
<script src="../assets/mdreader.js" defer></script>
</body>
</html>
'''


def main():
    out = ROOT / "documents"
    out.mkdir(exist_ok=True)
    written = []
    for slug, src, title, kind, fact, why in DOCS:
        if not (ROOT / "briefs" / src).exists():
            print(f"  ! briefs/{src} is missing", file=sys.stderr)
            continue
        desc = fact.replace('"', "&quot;")
        (out / f"{slug}.html").write_text(HEAD.format(
            slug=slug, src=src, title=title, kind=kind, fact=fact, why=why,
            desc=desc, gh=GH))
        written.append(f"documents/{slug}.html")
    print(f"gen_documents: {len(written)} reader page(s)")
    for w in written:
        print(f"  · {w}")


if __name__ == "__main__":
    main()
