#!/usr/bin/env python3
"""Generates the site's front page: index.html.

Run from anywhere: python3 admin/build/gen_front.py
Then run chrome.py, which fills in the nav and footer.

This page exists because the first edition moved to v1/ and the memo of 23 August asked
for "a front page that just links to everything and explains everything, including
explains the sequence of events".

Two of its sections are GENERATED and must never be hand-edited: the release timeline
comes from admin/versions.html, and the index of the first edition comes from the file
tree. The prose around them is authored. That split is the site's own rule applied to its
own front door: prose does not quote a computed number, it renders one.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
VERSION = (ROOT / "admin/build/version.txt").read_text().strip()
FROZEN = "v0.3.26"

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
}


def releases():
    t = (ROOT / "admin/versions.html").read_text()
    rows = re.findall(r'class="vnum">(v\d+\.\d+\.\d+)</td>\s*<td>([^<]+)</td>', t)
    return list(reversed(rows))          # oldest first


def first_edition_index():
    """Every published page of the first edition, from the file tree."""
    groups = [
        ("The book", "v1/book", ["index.html", "single.html", "changes.html"]),
        ("The chapters, as site pages", None, None),
    ]
    out = {}
    for d in sorted(p for p in (ROOT / "v1").iterdir() if p.is_dir()):
        pages = sorted(f.relative_to(ROOT).as_posix()
                       for f in d.rglob("*.html"))
        if pages:
            out[d.name] = pages
    return out


HEAD = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>graphs.sgit.ai &mdash; meaning through connectivity</title>
<meta name="description" content="A reference site about one use of graphs: meaning through connectivity. The first edition of the book is complete and frozen at {frozen}; the second is being written from the top down. This page explains both, and the sequence of events that got here.">
<link rel="canonical" href="https://graphs.sgit.ai/index.html">
<meta property="og:type" content="website">
<meta property="og:site_name" content="graphs.sgit.ai">
<meta property="og:url" content="https://graphs.sgit.ai/index.html">
<meta property="og:title" content="graphs.sgit.ai">
<meta property="og:description" content="Two editions of one book, and the sequence of events between them. The first is frozen; the second is being written as a graph, from the top down.">
<meta name="twitter:card" content="summary">
<link rel="stylesheet" href="assets/site.css">
</head>
<body>

<nav class="site"><div class="row"></div></nav>

<main class="doc">
  <h1>graphs.sgit.ai</h1>
  <p class="lead">A reference site about one use of graphs: <b>meaning through connectivity</b>. A node carries no inherent meaning, and what a thing <em>is</em> emerges from the edges traceable from it. There are now <b>two editions</b> of the book that argues this. The first is finished and frozen. The second is being written from the top down, as a graph, and does not exist yet.</p>

  <div class="tablewrap">
  <table>
    <thead><tr><th>Edition</th><th>State</th><th>Where</th></tr></thead>
    <tbody>
      <tr>
        <td><b>The first edition</b><br><span class="small dim">Meaning Through Connectivity</span></td>
        <td><span class="rstate rs-applied">complete &middot; frozen at {frozen}</span></td>
        <td><a href="v1/book/index.html">Read it</a> &middot; <a href="v1/book/single.html">one page</a> &middot; <a href="v1/book/meaning-through-connectivity.pdf">print PDF</a> &middot; <a href="v1/index.html">its front page</a></td>
      </tr>
      <tr>
        <td><b>The second edition</b><br><span class="small dim">Fractal Semantic Graphs: Meaning Through Connectivity</span></td>
        <td><span class="rstate rs-open">planned &middot; not started</span></td>
        <td><a href="dev-pack/index.html">The plan</a> &middot; <a href="v1/briefs/19__founder-memo__the-second-book.md">the memos that asked for it</a></td>
      </tr>
    </tbody>
  </table>
  </div>

  <div class="note"><b>Why there are two, and why the first one is frozen.</b> The first edition was written the way books usually are: prose first, structure discovered along the way, graphs added afterwards as illustration. It works, and it argues <em>up</em> to its thesis, which means a reader who stops at chapter three never reaches the claim the book is named after. The second edition starts at the claim and descends, so that a reader who stops at any altitude has a complete book. The first edition is not deleted or improved: it is the record of how this was worked out, including three corrections it made to itself, and it is <b>hashed and gated so the build fails if a byte of it changes</b>.</div>

  <h2 id="sequence">The sequence of events</h2>
  <p>Thirty-plus releases in three days, which is what happens when the projection chain is gated and a release costs a commit. The full table is <a href="admin/versions.html">the release history</a>, with a paragraph on each. The turns that changed the method rather than adding to it:</p>
  <div class="tablewrap">
  <table class="frontrel">
    <thead><tr><th>Release</th><th>Date</th><th>What turned</th></tr></thead>
    <tbody>
{timeline}
    </tbody>
  </table>
  </div>
  <p class="small dim">Generated from <a href="admin/versions.html">the release table</a> on every build, so it cannot drift from it.</p>

  <h2 id="estate">What else is here</h2>
  <p>Some of this belongs to the first edition and moved with it. Some belongs to the site and spans both editions.</p>
  <div class="tablewrap">
  <table>
    <thead><tr><th>Section</th><th>What it is</th><th>Belongs to</th></tr></thead>
    <tbody>
      <tr><td><a href="v1/vaults/index.html"><b>The vaults</b></a></td><td>Five published graph vaults analysed in depth, plus the capability scale that only the comparison produced.</td><td>the first edition</td></tr>
      <tr><td><a href="v1/docs/index.html"><b>The sources</b></a></td><td>Twenty-one documents the book was built from, carried byte for byte with their hashes.</td><td>the first edition</td></tr>
      <tr><td><a href="v1/altitudes/index.html"><b>The altitude ladder</b></a></td><td>The pilot: the book at five altitudes, its concept map, and the graph explorer. It proved the method the second edition is built on.</td><td>the first edition</td></tr>
      <tr><td><a href="v1/reviews/index.html"><b>The reviews</b></a></td><td>Four rounds of founder review, run as a serverless pull request.</td><td>the first edition</td></tr>
      <tr><td><a href="v1/documents/index.html"><b>The documents</b></a></td><td>The brief pack that produced the site, and the retrospective over the work.</td><td>the first edition</td></tr>
      <tr><td><a href="decisions/index.html"><b>The decisions</b></a></td><td>Every open question, drawn as the peak of its own graph, answered in your own browser.</td><td>both editions</td></tr>
      <tr><td><a href="dev-pack/index.html"><b>The dev pack</b></a></td><td>The plan for the second edition: ten files, seven phases, twenty gates, eight open questions.</td><td>the second edition</td></tr>
      <tr><td><a href="admin/index.html"><b>Engineering</b></a></td><td>The generators, the gates, the release process.</td><td>the site</td></tr>
    </tbody>
  </table>
  </div>

  <h2 id="index">Everything in the first edition</h2>
  <p>The complete index, from the file tree rather than from a list somebody maintains.</p>
{index}

  <div class="agent">
    <h4>For an agent</h4>
    <p>Start at <a href="llms.txt">llms.txt</a>, which names every section hub and is gate-checked against the file tree. The first edition is everything under <code>/v1/</code> and is frozen at <b>{frozen}</b>: its bytes are recorded in <code>/v1/MANIFEST.json</code> with SHA-256 per file, and the build fails if any of them changes. The second edition does not exist yet; its plan is at <code>/dev-pack/</code> and its status is PROPOSED throughout. Machine surfaces that span both: <code>/decisions/data/decisions.json</code>, <code>/v1/docs/data/docs.json</code>, <code>/v1/altitudes/data/altitudes.json</code>. Every page moved from <code>/x/</code> to <code>/v1/x/</code> on {frozen_next}, and the old addresses still resolve as redirects.</p>
  </div>
</main>

<footer class="site"><div class="cols"></div></footer>
</body>
</html>
"""


def main():
    rows = releases()
    turns = [(v, d, TURNS[v]) for v, d in rows if v in TURNS]
    timeline = "\n".join(
        f'      <tr><td class="vnum"><a href="admin/versions.html">{v}</a></td>'
        f'<td class="small dim">{d}</td><td>{note}</td></tr>'
        for v, d, note in turns)

    idx = first_edition_index()
    parts = []
    for name, pages in sorted(idx.items()):
        links = " &middot; ".join(
            f'<a href="{p}">{Path(p).name.replace(".html", "")}</a>' for p in pages)
        parts.append(f'    <div class="frontidx"><h4>{name}</h4><p>{links}</p></div>')
    index = '  <div class="frontidxs">\n' + "\n".join(parts) + "\n  </div>"

    (ROOT / "index.html").write_text(HEAD.format(
        frozen=FROZEN, frozen_next=VERSION, timeline=timeline, index=index))
    n = sum(len(v) for v in idx.values())
    print(f"gen_front: index.html — {len(turns)} turning releases, {n} first-edition pages indexed")


if __name__ == "__main__":
    main()
