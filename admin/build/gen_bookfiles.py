#!/usr/bin/env python3
"""Generates v2/books/<slug>/files.html for every book — the file explorer over
a book's whole folder: the markdown that is the source of truth, the source
materials behind it, the figures, the graph the decomposition produced (one
folder per chapter), the publishing artefacts, and the generated pages.

The same shell as the document explorer (assets/explorer/shell.js), driven by a
manifest generated here so a new artefact appears in the tree without anyone
remembering to list it. Folders that are large or derived start collapsed; the
book's own markdown starts open, because that is what a reader came for.

Run from anywhere: python3 admin/build/gen_bookfiles.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BOOKS = ROOT / "v2" / "books"
VERSION = (ROOT / "admin" / "build" / "version.txt").read_text().strip()

# Files that are neither source nor artefact: the explorer's own page, and the
# rendered chapter pages, which are gathered into one folder rather than listed
# beside book.json where they would bury it.
SKIP = {"files.html"}


def esc(s):
    return (str(s).replace("&", "&amp;").replace("<", "&lt;")
            .replace(">", "&gt;").replace('"', "&quot;"))


def listing(folder, base, label, open_=False, names=None):
    """One manifest entry: every file in `folder`, or just `names` if given."""
    if not folder.is_dir():
        return None
    files = sorted(f for f in folder.iterdir()
                   if f.is_file() and f.name not in SKIP
                   and (names is None or f.name in names))
    if not files:
        return None
    return {"label": label, "base": base, "open": open_,
            "files": [{"n": f.name, "b": f.stat().st_size} for f in files]}


def manifest_for(book):
    """The folders of one book, in the order a reader should meet them."""
    out = []
    md = {f.name for f in book.iterdir() if f.is_file() and f.suffix == ".md"}
    meta = {f.name for f in book.iterdir()
            if f.is_file() and f.suffix in (".json", ".py", ".pdf")}
    pages = {f.name for f in book.iterdir() if f.is_file() and f.suffix == ".html"}

    for entry in [
        listing(book / "content", "content", "content &middot; the source of truth", True),
        listing(book / "sources", "sources", "sources &middot; the material behind it", True),
        listing(book, "", "the book folder", True, names=md | meta),
        listing(book / "figures", "figures", "figures", False),
        listing(book / "publish", "publish", "publish &middot; cover, sample, metadata", False),
    ]:
        if entry:
            out.append(entry)

    graph = book / "graph"
    if graph.is_dir():
        top = listing(graph, "graph", "graph &middot; the book level", True,
                      names={f.name for f in graph.iterdir() if f.is_file()})
        if top:
            out.append(top)
        for d in sorted(p for p in graph.iterdir() if p.is_dir()):
            e = listing(d, f"graph/{d.name}", f"graph/{d.name}", False)
            if e:
                out.append(e)

    if pages:
        out.append(listing(book, "", "the generated pages", False, names=pages))
    return [e for e in out if e]


PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title} &mdash; the files &mdash; graphs.sgit.ai</title>
<meta name="description" content="Every file of {title} at {bookver}, browsable: the markdown that is the source of truth, the source materials, the figures, the graph one folder per chapter where the book has one, and the generated pages. Raw bytes or each file's own view.">
<link rel="canonical" href="https://graphs.sgit.ai/v2/books/{slug}/files.html">
<meta property="og:type" content="website">
<meta property="og:site_name" content="graphs.sgit.ai">
<meta property="og:url" content="https://graphs.sgit.ai/v2/books/{slug}/files.html">
<meta property="og:title" content="{title} &mdash; the files">
<meta property="og:description" content="The book's artefacts, raw and viewed.">
<meta name="twitter:card" content="summary">
<link rel="stylesheet" href="../../../assets/site.css">
<link rel="stylesheet" href="../../../assets/universe.css">
</head>
<body>

<nav class="site"><div class="row"></div></nav>

<main class="doc uni-full">
<div class="crumb"><a href="../../../index.html">graphs.sgit.ai</a> &rarr; <a href="../index.html">the books</a> &rarr; <a href="index.html">{short}</a> &rarr; <b>the files</b></div>
<h1>The files of <em>{title}</em></h1>
<p class="lead"><b>{bookver}</b> &middot; {nfolders} folders, {nfiles} files. Everything this book is made of and everything the build derived from it, in one explorer. <b>Raw</b> is the exact bytes with minimal formatting; files the build understands also carry <b>their own view</b> &mdash; the markdown rendered, <code>book.json</code> as the two-clock changelog and the chapter hashes the version gate reads, the graph index as the chapter table, each chapter's shards as their blocks with uids. The markdown under <code>content/</code> is the source of truth: every rendered page and the PDF are projections of it.</p>
<div class="note"><b>Where the versions come from.</b> This book is at <b>{bookver}</b> and the site is at <b>{siteversion}</b>. Two clocks: the book's moves only when its content moves, the site's on every push. <a href="../../../admin/versions.html#rules">The rules</a>{graphlink}{boardlink} &middot; <a href="index.html">read the book</a></div>
<div id="filex" class="fx"></div>
</main>

<footer class="site"><div class="cols"></div></footer>
<script>window.FILEX = {manifest};</script>
<script src="../../../assets/vendor/marked.min.js"></script>
<script type="module" src="../../../assets/book-files.js"></script>
</body>
</html>
"""


def main():
    done = []
    for book in sorted(d for d in BOOKS.iterdir() if d.is_dir()):
        meta_path = book / "book.json"
        if not meta_path.exists():
            continue
        meta = json.loads(meta_path.read_text())
        folders = manifest_for(book)
        n_files = sum(len(f["files"]) for f in folders)
        (book / "files.html").write_text(PAGE.format(
            slug=book.name, title=esc(meta["title"]),
            short=esc(meta["title"].split(":")[0]),
            bookver=esc(meta["version"]), siteversion=VERSION,
            nfolders=len(folders), nfiles=n_files,
            graphlink=(' &middot; <a href="graph/index.html">the book as a graph</a>'
                       if (book / "graph" / "index.html").exists() else ''),
            boardlink=(' &middot; <a href="board.html">the project board</a>'
                       if (book / "board.html").exists() else ''),
            manifest=json.dumps({"slug": book.name, "kind": "book", "folders": folders})))
        done.append(f'{book.name} {len(folders)} folder(s) / {n_files} file(s)')
    print("gen_bookfiles: " + " · ".join(done))


if __name__ == "__main__":
    main()
