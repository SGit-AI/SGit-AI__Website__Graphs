#!/usr/bin/env python3
"""Decomposes a whole BOOK into the core graph — book, chapter, section, block,
sentence, word (brief 43, activity A2).

Run from anywhere: python3 admin/build/gen_bookgraph.py [book-slug]

Brief 43 asked for the machinery built for one pilot document to be applied at book scale,
so that JSON becomes the source of truth and everything else is a transformation of it.
The pilot's decomposition needed one thing it did not have: a level above the document.
A book is not a longer document, it is seventeen documents with an order.

The shape chosen, and why:

  book:<slug>                        this file
    chp:<n>  -> doc:<chapter-stem>   one core graph per chapter, in its own folder
      sec / blk / sen / wrd          exactly as the pilot builds them

Each chapter is decomposed by gen_coregraph.build(), which means **all seven of the
pilot's gates run per chapter, unchanged** — including the one that matters most here,
that the markdown rebuilds from the formatting graph byte-identical. A book whose chapters
each rebuild exactly is a book that can be restructured as a transformation rather than
retyped, which is the whole point of doing this (brief 42's part one).

Sharding is per chapter rather than per section. Brief 43 flagged size as a strain: the
pilot is 552KB for one 4,221-word document, and a naive book-shaped graph would be several
megabytes in one place. A reader or an agent opening one chapter fetches one chapter.

Each chapter keeps its OWN identity ledger, in its own folder. One ledger for the book was
considered and rejected: chapter identities are independent, a chapter can be reordered
without disturbing another's uids, and a per-chapter ledger keeps the carry-forward pass
that gate 7 checks small enough to stay obviously correct.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(Path(__file__).resolve().parent))
from gen_coregraph import build  # noqa: E402

BOOKS = ROOT / "v2" / "books"
VERSION = (ROOT / "admin" / "build" / "version.txt").read_text().strip()
DEFAULT = "making-a-book"


def chapter_prefix(book_slug, stem):
    """A short uid prefix per chapter: mab-04 for making-a-book chapter 04. Short because
    a uid is meant to be quotable, namespaced because two chapters both have a block 1."""
    initials = "".join(w[0] for w in book_slug.split("-"))
    num = stem.split("__", 1)[0]
    return f"{initials}-{num}"


def main(slug=DEFAULT):
    folder = BOOKS / slug
    if not folder.is_dir():
        raise SystemExit(f"gen_bookgraph: no book at {folder}")
    meta = json.loads((folder / "book.json").read_text())
    out_root = folder / "graph"
    out_root.mkdir(exist_ok=True)

    chapters, totals = [], {k: 0 for k in
                            ("sections", "blocks", "sentences", "words", "spans", "shards", "bytes")}
    files = sorted((folder / "content").glob("*.md"))
    if not files:
        raise SystemExit(f"gen_bookgraph: {slug} has no chapters")

    for n, f in enumerate(files, 1):
        stem = f.stem
        out = out_root / stem
        out.mkdir(exist_ok=True)
        s = build(stem, f, out, out / "ids.json", chapter_prefix(slug, stem), quiet=True)
        for k in ("sections", "blocks", "sentences", "words", "spans", "shards", "bytes"):
            totals[k] += s[k]
        chapters.append({
            "n": n, "id": f"chp:{n:02d}", "doc": f"doc:{stem}", "stem": stem,
            "title": s["title"], "graph": f"{stem}/index.json",
            "markdown": f"../content/{f.name}",
            "sections": s["sections"], "blocks": s["blocks"],
            "words": s["words"], "forms": s["forms"], "uids": s["uids"],
        })

    # The book's chapter list must be the book's chapter list. If book.json and the graph
    # disagree about what the book contains, one of them is describing a different book.
    listed = sorted(meta["content_hashes"])
    walked = sorted(f.name for f in files)
    if listed != walked:
        raise SystemExit(
            f"gen_bookgraph: {slug}'s graph covers {len(walked)} chapters but book.json "
            f"lists {len(listed)} — they must describe the same book")

    (out_root / "index.json").write_text(json.dumps({
        "version": VERSION,
        "book": f"book:{slug}",
        "slug": slug,
        "title": meta["title"],
        "book_version": meta["version"],
        "ladder": ["book", "chapter", "section", "block", "sentence", "word"],
        "note": ("Every chapter is a core graph built by gen_coregraph.build(), so all "
                 "seven of its gates ran per chapter — including the byte-identical "
                 "rebuild. Sharded per chapter: opening one chapter fetches one chapter."),
        "totals": totals,
        "chapters": chapters,
    }, ensure_ascii=False, indent=1) + "\n")

    write_page(folder, slug, meta, chapters, totals)

    print(f"gen_bookgraph: {slug} {meta['version']} — {len(chapters)} chapters, "
          f"{totals['sections']} sections, {totals['blocks']} blocks, "
          f"{totals['sentences']} sentences, {totals['words']:,} words, "
          f"{totals['shards']} shard(s), {totals['bytes']:,} bytes; "
          f"every chapter rebuilt byte-identical")
    return totals


PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>The book as a graph &mdash; graphs.sgit.ai</title>
<meta name="description" content="{title} {bver} decomposed to the word: book, chapter, section, block, sentence, word. Every chapter rebuilds from its formatting graph byte-identical, which is what makes the book restructurable as a transformation rather than a retype.">
<link rel="canonical" href="https://graphs.sgit.ai/v2/books/{slug}/graph/index.html">
<meta property="og:type" content="article">
<meta property="og:site_name" content="graphs.sgit.ai">
<meta property="og:url" content="https://graphs.sgit.ai/v2/books/{slug}/graph/index.html">
<meta property="og:title" content="The book as a graph">
<meta property="og:description" content="{title} {bver}, taken apart to the word and provably put back together.">
<meta name="twitter:card" content="summary">
<link rel="stylesheet" href="../../../../assets/site.css">
</head>
<body>

<nav class="site"><div class="row"></div></nav>

<main class="doc">
<div class="crumb"><a href="../../../../index.html">graphs.sgit.ai</a> &rarr; <a href="../../index.html">the books</a> &rarr; <a href="../index.html">{title}</a> &rarr; <b>the graph</b></div>
<h1>The book as a graph</h1>
<p class="lead"><b>{title}</b> {bver}, decomposed all the way to the word and provably put back together. Six levels: <b>book &rarr; chapter &rarr; section &rarr; block &rarr; sentence &rarr; word</b>. Built by <code>admin/build/gen_bookgraph.py</code> from <a href="../content/">the chapter markdown</a>, which stays the authored source.</p>

<div class="note"><b>Why this exists, and it is not because a graph is interesting.</b> Brief 42 asks for the book&rsquo;s opening to change: a new first part, the history moved behind it. Doing that by hand is exactly the edit the founder says broke his earlier books &mdash; <em>&ldquo;you almost start to be locked by the first version of the content, because making changes becomes quite painful.&rdquo;</em> Doing it as a <b>transformation on this graph</b>, with a gate proving every chapter that was not meant to move is byte-identical, is the thing a word processor cannot do. <b>Every chapter below rebuilt byte-identical on this build.</b> That is the claim the restructure rests on.</div>

<div class="tablewrap">
<table>
  <thead><tr><th>#</th><th>Chapter</th><th>Sections</th><th>Blocks</th><th>Words</th><th>Forms</th><th>Identities</th><th>Graph</th></tr></thead>
  <tbody>
{rows}
    <tr><td></td><td><b>The book</b></td><td><b>{t_sections}</b></td><td><b>{t_blocks}</b></td><td><b>{t_words:,}</b></td><td class="dim">&mdash;</td><td class="dim">&mdash;</td><td><a href="index.json">index.json</a></td></tr>
  </tbody>
</table>
</div>

<h2 id="shape">What each chapter folder holds</h2>
<div class="tablewrap">
<table>
  <thead><tr><th>File</th><th>What it is</th></tr></thead>
  <tbody>
    <tr><td><code>index.json</code></td><td>the chapter&rsquo;s section skeleton, counts and shard pointers</td></tr>
    <tr><td><code>sec-NN.json</code></td><td>one shard per section: its blocks, sentences and word instances</td></tr>
    <tr><td><code>fmt.json</code></td><td>the formatting graph &mdash; heading lines, gaps and raw markdown per block. <b>This is the half that makes the rebuild possible</b>; the semantic shards are provably derivable from it</td></tr>
    <tr><td><code>words.json</code></td><td>one node per distinct form, with every instance</td></tr>
    <tr><td><code>tokens.json</code></td><td>the token analysis: classes, stem families, co-occurrence</td></tr>
    <tr><td><code>ids.json</code></td><td>the identity ledger &mdash; short opaque uids carried across edits, so a cross-reference survives a rewrite</td></tr>
  </tbody>
</table>
</div>

<div class="note"><b>Sharded per chapter, on purpose.</b> Brief 43 flagged size as a strain before any code was written, and it was right: this graph is <b>{t_bytes:,} bytes</b> against 552KB for the single pilot document. Opening one chapter fetches one chapter. <b>The estimate made before building was ~4MB; the measured figure is {t_mb:.1f}MB.</b></div>

<div class="note"><b>What this does not yet do.</b> There is no explorer here &mdash; this page is a table, not the instrument brief 43 asks for (<em>&ldquo;the visualisation of that parser&hellip; is more important than the actual output&rdquo;</em>). That is activity A5. The five reading levels are A4, and the restructure this all exists to enable is A6. <a href="../../../dev-pack/bookgraph-00-the-plan.html">The plan</a> tracks all seven.</div>
</main>

<footer class="site"><div class="cols"></div></footer>
</body>
</html>
"""


def write_page(folder, slug, meta, chapters, totals):
    rows = "\n".join(
        f'    <tr><td class="vnum">{c["n"]:02d}</td>'
        f'<td><a href="../content/{c["stem"]}.md">{c["title"]}</a></td>'
        f'<td>{c["sections"]}</td><td>{c["blocks"]}</td><td>{c["words"]:,}</td>'
        f'<td>{c["forms"]:,}</td><td>{c["uids"]}</td>'
        f'<td><a href="{c["stem"]}/index.json">json</a></td></tr>'
        for c in chapters)
    (folder / "graph" / "index.html").write_text(PAGE.format(
        slug=slug, title=meta["title"], bver=meta["version"], rows=rows,
        t_sections=totals["sections"], t_blocks=totals["blocks"],
        t_words=totals["words"], t_bytes=totals["bytes"],
        t_mb=totals["bytes"] / 1_000_000))


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else DEFAULT)
