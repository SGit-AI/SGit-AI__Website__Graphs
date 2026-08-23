#!/usr/bin/env python3
"""Generates /dev-pack/ — the reader for the dev pack under dev-packs/.

Run from anywhere: python3 admin/build/gen_devpack.py
Then run chrome.py, which fills in the nav and footer.

Same convention as /documents/: the raw markdown is the source of truth and every page
renders its own source file client-side, so a page cannot drift from the file it claims
to render. The hub is generated from the directory listing, so a file added to the pack
appears here on the next build and nothing has to be remembered.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PACK = "v0.3.27__the-second-book"
SRC = ROOT / "dev-packs" / PACK
OUT = ROOT / "dev-pack"
GH = f"https://github.com/SGit-AI/SGit-AI__Website__Graphs/blob/dev/dev-packs/{PACK}"

# one line per file, shown on the hub. Authored, because "what it gives you" is a judgement.
BLURB = {
 "00__README.md": "Orientation, the three governing rules, and what is already decided.",
 "01__the-memos.md": "The founder's two memos, verbatim, with every instruction mapped to what it commits the work to.",
 "02__what-exists-today.md": "The audit. Every unit, section, conclusion and generator, with a carry / lift / rewrite / drop verdict.",
 "03__freezing-the-first-book.md": "How the first edition is frozen, where it lives, and the front page that explains the sequence of events.",
 "04__the-argument.md": "The spine, top down: five statements, their evidence, and the descent through five altitudes.",
 "05__architecture.md": "The decisions, as ADRs: five source trees, six node families, computed themes, generated grammar.",
 "06__the-plumbing.md": "The graph format, the unit format, the generators, and the seven new gates.",
 "07__visualisations.md": "Which views are instruments and which are reading aids, the conventions, and eight figures of what exists now.",
 "08__implementation-plan.md": "Seven phases, each ending at a gate, and the two ways the plan fails.",
 "09__verification-and-open-questions.md": "Acceptance criteria, what the rewrite does to the ten open decisions, and the eight questions only the founder can answer.",
}

PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title} &mdash; graphs.sgit.ai</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="https://graphs.sgit.ai/dev-pack/{slug}.html">
<meta property="og:type" content="article">
<meta property="og:site_name" content="graphs.sgit.ai">
<meta property="og:url" content="https://graphs.sgit.ai/dev-pack/{slug}.html">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta name="twitter:card" content="summary">
<link rel="alternate" type="text/markdown" href="../dev-packs/{pack}/{src}" title="The raw markdown, which is the source of truth">
<link rel="stylesheet" href="../assets/site.css">
</head>
<body>

<nav class="site"><div class="row"></div></nav>

<main class="doc">
<div class="crumb"><a href="../index.html">graphs.sgit.ai</a> &rarr; <a href="index.html">the dev pack</a> &rarr; <b>{num}</b></div>
<h1>{title}</h1>
<p class="lead">{desc}</p>

<div class="docmeta">
  <span class="k">Pack</span><span class="v">v0.4.0 &middot; the second book</span>
  <span class="k">Status</span><span class="v">PROPOSED &mdash; nothing here is implemented</span>
  <span class="k">Licence</span><span class="v">CC BY 4.0</span>
  <span class="k">Source</span><span class="v"><a href="../dev-packs/{pack}/{src}">raw markdown</a> &middot; <a href="{gh}/{src}">view on GitHub</a></span>
</div>

<div class="mdread-label">&#128196; Rendered from the <a href="../dev-packs/{pack}/{src}">raw markdown</a>, which is the source of truth. This page is presentation.</div>
<div class="mdread" id="mdread" data-src="../dev-packs/{pack}/{src}"><noscript><p class="dim">In-page rendering needs JavaScript &mdash; <a href="../dev-packs/{pack}/{src}">open the raw markdown</a>.</p></noscript></div>

<div class="pagenav">
  <span>{prev}</span>
  <span>{next}</span>
</div>
</main>

<footer class="site"><div class="cols"></div></footer>
<script src="../assets/vendor/marked.min.js"></script>
<script src="../assets/mdreader.js" defer></script>
</body>
</html>
"""


def main():
    files = sorted(f.name for f in SRC.glob("*.md"))
    missing = [f for f in files if f not in BLURB]
    if missing:
        raise SystemExit("gen_devpack: pack files with no blurb: " + ", ".join(missing))
    OUT.mkdir(exist_ok=True)
    rows = []
    for i, f in enumerate(files):
        slug = f[:-3].replace("__", "-").replace("_", "-")
        num = f.split("__")[0]
        title = re.search(r"^#\s+(.+)$", (SRC / f).read_text(), re.M)
        title = title.group(1).strip() if title else f
        desc = BLURB[f]
        prev = (f'<a href="{files[i-1][:-3].replace("__", "-").replace("_", "-")}.html">'
                f'&larr; {files[i-1].split("__")[0]}</a>') if i else '<a href="index.html">&larr; The pack</a>'
        nxt = (f'<a href="{files[i+1][:-3].replace("__", "-").replace("_", "-")}.html">'
               f'{files[i+1].split("__")[0]} &rarr;</a>') if i + 1 < len(files) else '<a href="index.html">The pack &rarr;</a>'
        (OUT / f"{slug}.html").write_text(PAGE.format(
            slug=slug, src=f, pack=PACK, num=num, title=title,
            desc=desc.replace('"', "&quot;"), gh=GH, prev=prev, next=nxt))
        rows.append((num, slug, title, desc, f))
    print(f"gen_devpack: {len(rows)} page(s) from dev-packs/{PACK}")
    return rows


if __name__ == "__main__":
    main()
