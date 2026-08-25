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
