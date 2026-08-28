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
<meta name="description" content="A reference site about one use of graphs: meaning through connectivity. Three books written from this repository, each with its own version, plus the working surface they were written from. The first edition is complete and frozen at {frozen}.">
<link rel="canonical" href="https://graphs.sgit.ai/index.html">
<meta property="og:type" content="website">
<meta property="og:site_name" content="graphs.sgit.ai">
<meta property="og:url" content="https://graphs.sgit.ai/index.html">
<meta property="og:title" content="graphs.sgit.ai">
<meta property="og:description" content="Three books about meaning through connectivity, written from this repository and published from it, alongside the working surface they came out of.">
<meta name="twitter:card" content="summary">
<link rel="stylesheet" href="assets/site.css">
</head>
<body>

<nav class="site"><div class="row"></div></nav>

<main class="doc">
  <h1>graphs.sgit.ai</h1>
  <p class="lead">A reference site about one use of graphs: <b>meaning through connectivity</b>. A node carries no inherent meaning, and what a thing <em>is</em> emerges from the edges traceable from it. That argument is now made by <b>three books</b>, written from this repository and published from it. The first edition is finished and frozen. The second argues the same claim from first principles <em>and</em> from the running system it describes &mdash; a system you can open on this site and use. The third is the making-of, for anyone who wants to work this way themselves.</p>

  <p class="lead">Every book here is markdown first: the pages render their own source in your browser, so a page cannot drift from the file it claims to show. <b>Each book carries its own version</b>, which moves only when that book&rsquo;s content moves, while the site&rsquo;s version moves on every push. <a href="v2/books/index.html">The shelf</a> holds all three.</p>

  <div class="tablewrap">
  <table>
    <thead><tr><th>Book</th><th>Version and state</th><th>Where</th></tr></thead>
    <tbody>
{books}
    </tbody>
  </table>
  </div>

  <p class="small dim">A book below <b>v1.0.0</b> is openly still under review; v1.0.0 is reserved for a book&rsquo;s actual final release. The rule, and the gate that enforces it in both directions, are on <a href="v2/books/index.html">the shelf</a>.</p>

  <div class="note"><b>The books are not the only thing here.</b> They were written from a working surface you can open. One pilot document, <em>Thinking in Graphs</em>, is carried whole and extracted twice over: a <a href="v2/universe/thinking-in-graphs.html">graph of what it says</a> (57 anchored nodes, every quote byte-verified on every build) and a core graph of what it <em>is</em> (every section, block, sentence and word a node with a stable identity, the markdown rebuildable from the graph byte-for-byte). Around them an instrument &mdash; pinned summits, layouts that never scramble the mental map, path queries you write by walking, a token analysis that knows 45% of the document is padding &mdash; and beside it the <a href="v2/wclm/index.html">WCLM</a>, a deterministic transformer that computes a meaning and shows its arithmetic. The techniques are named and catalogued in <a href="v2/methods/index.html">the methods register</a>.</div>

  <div class="note"><b>Why there is a second edition, and why the first one is frozen.</b> The first edition was written the way books usually are: prose first, structure discovered along the way, graphs added afterwards as illustration. It works, and it argues <em>up</em> to its thesis, which means a reader who stops at chapter three never reaches the claim the book is named after. The second edition starts at the claim and descends, so that a reader who stops at any altitude has a complete book. The first edition is not deleted or improved: it is the record of how this was worked out, including three corrections it made to itself, and it is <b>hashed and gated so the build fails if a byte of it changes</b>.</div>

  <div class="note"><b>What this site does not claim.</b> It is <b>not a graph database pitch</b>, and the books say so in their own words. The semantic layer described here is <em>designed</em>, not shipped; the chapter that separates the two is <a href="v2/books/fsg/what-ships-what-is-argued.html">What ships, what is argued</a>. Nine of the edge inverses in the verbs register are this site&rsquo;s proposals rather than quotations from the corpus, and are marked as such where they appear.</div>

  <h2 id="sequence">The sequence of events</h2>
  <p>{nrel} narrated releases across three eras, which is what happens when the projection chain is gated and a release costs a commit. Every one of them is narrated: not a commit log, but a paragraph a reader can understand without opening the diff. The history is kept whole by era: <a href="admin/versions.html">current (v0.6, review as change control)</a> &middot; <a href="admin/versions-v0.5.html">the v0.5 era</a> (the books, 24 releases) &middot; <a href="admin/versions-v0.4.html">the v0.4 era</a> (the working surface, 41 releases) &middot; <a href="admin/versions-earlier.html">the beginnings</a>. Each closed era is also weighed in a retrospective &mdash; what compounded, what was got wrong, and how each mistake was found: <a href="v2/dev-pack/retro5-00-the-v05-retrospective.html">v0.5, the books</a> &middot; <a href="v2/dev-pack/retro-00-the-v04-retrospective.html">v0.4, the working surface</a>. The turns that changed the method rather than adding to it:</p>
  <div class="tablewrap">
  <table class="frontrel">
    <thead><tr><th>Release</th><th>Date</th><th>What turned</th></tr></thead>
    <tbody>
{timeline}
    </tbody>
  </table>
  </div>
  <p class="small dim">Generated from <a href="admin/versions.html">the release tables</a> (all eras) on every build, so it cannot drift from them.</p>

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
      <tr><td><a href="v2/index.html"><b>The second edition</b></a></td><td>Everything about making it, gathered in one tree: the dev pack, the memos, the review packs.</td><td>the second edition</td></tr>
      <tr><td><a href="admin/index.html"><b>Engineering</b></a></td><td>The generators, the gates, the release process.</td><td>the site</td></tr>
    </tbody>
  </table>
  </div>

  <h2 id="index">Everything in the first edition</h2>
  <p>The complete index, from the file tree rather than from a list somebody maintains.</p>
{index}

  <div class="agent">
    <h4>For an agent</h4>
    <p>Start at <a href="llms.txt">llms.txt</a>, which names every section hub and is gate-checked against the file tree. The first edition is everything under <code>/v1/</code> and is frozen at <b>{frozen}</b>: its bytes are recorded in <code>/v1/MANIFEST.json</code> with SHA-256 per file, and the build fails if any of them changes. The second edition does not exist as a book yet; everything about making it lives under <code>/v2/</code> (hub: /v2/index.html), its plan is at <code>/v2/dev-pack/</code>, and its status is PROPOSED throughout. <code>/book/</code> always points at the current edition, which is the second. Machine surfaces that span both: <code>/decisions/data/decisions.json</code>, <code>/v1/docs/data/docs.json</code>, <code>/v1/altitudes/data/altitudes.json</code>. Every page moved from <code>/x/</code> to <code>/v1/x/</code> on {frozen_next}; the redirect stubs that briefly held the old addresses were retired at v0.4.7, so only the edition-prefixed addresses exist.</p>
  </div>
</main>

<footer class="site"><div class="cols"></div></footer>
</body>
</html>
"""


# The shelf row per book, built from book.json so the front page quotes the same
# numbers the version gate computes. A remembered page count on the busiest page of
# the site is exactly the kind of claim this estate does not allow itself.
BOOK_ORDER = ["fsg", "making-a-book", "fsg-universe"]
BOOK_BLURB = {
    "fsg": "The argument whole: from first principles, and from the running system.",
    "making-a-book": "The making-of: how this book was written with agents, and how to do it.",
    "fsg-universe": "The reference atlas for the method. Held back from this release.",
}


def book_rows():
    out = []
    for slug in BOOK_ORDER:
        meta = json.loads((ROOT / "v2" / "books" / slug / "book.json").read_text())
        held = meta["status"] == "held"
        where = [f'<a href="v2/books/{slug}/index.html">Read it</a>']
        if (ROOT / "v2" / "books" / slug / "about.html").exists():
            where.append(f'<a href="v2/books/{slug}/about.html">about this book</a>')
        if meta.get("pdf"):
            where.append(f'<a href="v2/books/{slug}/{meta["pdf"]}">PDF</a>')
        where.append(f'<a href="v2/books/{slug}/book.json">book.json</a>')
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
        '        <td><a href="v1/book/index.html">Read it</a> &middot; '
        '<a href="v1/book/single.html">one page</a> &middot; '
        '<a href="v1/book/meaning-through-connectivity.pdf">print PDF</a> &middot; '
        '<a href="v1/index.html">its front page</a></td>\n'
        '      </tr>')
    return "\n".join(out)


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
        frozen=FROZEN, frozen_next=VERSION, timeline=timeline, index=index,
        books=book_rows(), nrel=len(rows)))
    n = sum(len(v) for v in idx.values())
    print(f"gen_front: index.html — {len(BOOK_ORDER)} books, {len(turns)} turning releases, "
          f"{n} first-edition pages indexed")


if __name__ == "__main__":
    main()
