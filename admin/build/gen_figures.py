#!/usr/bin/env python3
"""Generates the making-of book's figure graph and its viewer:

  v2/books/making-a-book/figures/index.json   one entry per image, with its
                                              metadata and its cross-links
  v2/books/making-a-book/figures.html         the gallery and the one-figure view

Every field is DERIVED. A figure's number, the release tag it was photographed
at and its slug come from its filename; its dimensions come from the PNG header;
its caption and the chapter and section that use it come from the markdown that
references it; the release it shows comes from the narrated version tables; and
the date it was taken is the tag's own commit date. Nothing here is authored,
which is the point: a figure's provenance is a fact about the repository, and a
fact about the repository should not be typed in by hand.

Three gates, and they make the book's own claim checkable. The book says every
figure was taken by checking out the tag its caption names; so a figure whose tag
is not in this repository fails the build, a figure no chapter uses fails the
build, and a reference to a figure that is not on disk fails the build.

Run from anywhere: python3 admin/build/gen_figures.py
"""
import hashlib
import json
import re
import struct
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BOOK = ROOT / "v2" / "books" / "making-a-book"
FIGS = BOOK / "figures"
CONTENT = BOOK / "content"
VERSION = (ROOT / "admin" / "build" / "version.txt").read_text().strip()
TABLES = ["versions.html", "versions-v0.5.html", "versions-v0.4.html", "versions-earlier.html"]

NAME = re.compile(r"^(\d{2})__(v\d+\.\d+\.\d+)__([a-z0-9-]+)\.png$")
REF = re.compile(r"!\[([^\]]*)\]\(figures/([^)]+)\)")


def esc(s):
    return (str(s).replace("&", "&amp;").replace("<", "&lt;")
            .replace(">", "&gt;").replace('"', "&quot;"))


def png_size(raw):
    """Width and height from the IHDR chunk, which is always first."""
    if raw[:8] != b"\x89PNG\r\n\x1a\n":
        return None, None
    return struct.unpack(">II", raw[16:24])


def git(*args):
    r = subprocess.run(["git", "-C", str(ROOT), *args], capture_output=True, text=True)
    return r.stdout.strip() if r.returncode == 0 else ""


def release_rows():
    """version -> (headline, which table it is narrated in). The headline is the
    row's opening bold sentence, which is how the estate writes a release."""
    out = {}
    for name in TABLES:
        p = ROOT / "admin" / name
        if not p.exists():
            continue
        for row in re.findall(r"<tr>.*?</tr>", p.read_text(), re.S):
            m = re.search(r'class="vnum">(v[\d.]+)</td>', row)
            if not m:
                continue
            b = re.search(r"<td><b>(.*?)</b>", row, re.S)
            headline = re.sub(r"<[^>]+>", "", b.group(1)).strip() if b else ""
            out[m.group(1)] = (re.sub(r"\s+", " ", headline), name)
    return out


def uses():
    """figure file -> the chapter, section and caption that use it."""
    found = {}
    for md in sorted(CONTENT.glob("*.md")):
        text = md.read_text()
        lines = text.split("\n")
        title = next((l[2:].strip() for l in lines if l.startswith("# ")), md.stem)
        for m in REF.finditer(text):
            line_no = text[:m.start()].count("\n") + 1
            section = ""
            for l in reversed(lines[:line_no]):
                if l.startswith("#") and not l.startswith("# "):
                    section = l.lstrip("#").strip()
                    break
            found.setdefault(m.group(2), []).append({
                "chapter": md.name,
                "title": title,
                "section": section,
                "line": line_no,
                "caption": m.group(1),
                "href": md.stem.replace("__", "-").replace("_", "-") + ".html",
            })
    return found


def build():
    used, rows, figures, errors = uses(), release_rows(), [], []
    on_disk = sorted(FIGS.glob("*.png"))

    for ref, wheres in used.items():
        if not (FIGS / ref).exists():
            errors.append(f"{wheres[0]['chapter']} references figures/{ref}, which is not on disk")

    for f in on_disk:
        m = NAME.match(f.name)
        if not m:
            errors.append(f"{f.name}: not NN__vX.Y.Z__slug.png, so its provenance cannot be read")
            continue
        n, tag, slug = int(m.group(1)), m.group(2), m.group(3)
        raw = f.read_bytes()
        w, h = png_size(raw)
        if not w:
            errors.append(f"{f.name}: not a PNG")
            continue
        if not git("rev-parse", "--verify", "--quiet", tag + "^{}"):
            errors.append(f"{f.name}: names tag {tag}, which is not in this repository — "
                          f"the book claims every figure was taken from the tag it names")
        where = used.get(f.name, [])
        if not where:
            errors.append(f"{f.name}: no chapter uses it")
        headline, table = rows.get(tag, ("", ""))
        figures.append({
            "id": f"fig-{n:02d}", "n": n, "file": f.name, "slug": slug,
            "width": w, "height": h, "bytes": len(raw),
            "sha256": hashlib.sha256(raw).hexdigest(),
            "tag": tag,
            "taken": git("log", "-1", "--format=%cI", tag),
            "release": {"version": tag, "headline": headline,
                        "href": f"../../../admin/{table}" if table else ""},
            "caption": where[0]["caption"] if where else "",
            "used_by": where,
        })

    if errors:
        for e in errors:
            print("  ✗ " + e)
        raise SystemExit(f"gen_figures: {len(errors)} problem(s) — nothing written")
    return figures


HTML = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>The figures &mdash; {title} &mdash; graphs.sgit.ai</title>
<meta name="description" content="Every figure in {title}, with the release tag it was photographed at, the chapter and section that use it, and the release it shows. {n} figures across {tags} tags, all checkable.">
<link rel="canonical" href="https://graphs.sgit.ai/v2/books/{slug}/figures.html">
<meta property="og:type" content="website">
<meta property="og:site_name" content="graphs.sgit.ai">
<meta property="og:url" content="https://graphs.sgit.ai/v2/books/{slug}/figures.html">
<meta property="og:title" content="The figures &mdash; {title}">
<meta property="og:description" content="Every figure with its provenance and its cross-links.">
<meta name="twitter:card" content="summary">
<link rel="stylesheet" href="../../../assets/site.css">
<link rel="stylesheet" href="../../../assets/board.css">
</head>
<body>

<nav class="site"><div class="row"></div></nav>

<main class="doc uni-full">
<div class="crumb"><a href="../../../index.html">graphs.sgit.ai</a> &rarr; <a href="../index.html">the books</a> &rarr; <a href="index.html">{short}</a> &rarr; <b>the figures</b></div>
<h1>The figures</h1>
<p class="lead"><b>{n} figures</b> across <b>{tags} release tags</b>, {mb} MB. Every one was taken by checking out the tag its caption names into a temporary worktree, serving that checkout, and photographing the page as it actually was. <b>None is a reconstruction</b>, and this page is where that claim stops being a sentence in a colophon: click any figure for the tag it came from, the chapter and section that use it, and what shipped in the release it shows.</p>

<div class="note"><b>Every field on this page is derived.</b> The figure number, the tag and the slug come from the filename; the dimensions from the PNG header; the caption, chapter and section from the markdown that references it; the release headline from the narrated version table; the date from the tag's own commit. Nothing is typed in, because a figure's provenance is a fact about the repository and a fact should not be re-entered by hand.<br>
<b>Three gates run on every release</b>, and together they make the book's claim checkable: a figure whose tag is not in this repository fails the build, a figure no chapter uses fails the build, and a chapter referencing a figure that is not on disk fails the build. The machine surface is <a href="figures/index.json">figures/index.json</a>.</div>

<div id="figures" class="fg"></div>

<div class="agent">
<h4>For an agent</h4>
<p><a href="figures/index.json">figures/index.json</a> holds one entry per image: <code>tag</code> and <code>taken</code> for provenance, <code>width</code>, <code>height</code>, <code>bytes</code> and <code>sha256</code> for the file, <code>used_by</code> for the chapter, section and line that reference it, and <code>release</code> for what shipped in the version photographed. To re-take one, check out its <code>tag</code> into a worktree and follow Appendix C. Do not edit this file: it is regenerated by <code>admin/build/gen_figures.py</code> on every release and three gates check it.</p>
</div>

</main>

<footer class="site"><div class="cols"></div></footer>
<script>window.FIGURES = {data};</script>
<script type="module" src="../../../assets/book-figures.js"></script>
</body>
</html>
"""


def main():
    figures = build()
    meta = json.loads((BOOK / "book.json").read_text())
    tags = sorted({f["tag"] for f in figures})
    total = sum(f["bytes"] for f in figures)
    data = {
        "schema": "book-figures-v1", "version": VERSION, "book": BOOK.name,
        "book_version": meta["version"], "title": meta["title"],
        "note": "One entry per image, every field derived: the filename carries the figure "
                "number and the release tag it was photographed at, the markdown carries the "
                "caption and the chapter that uses it, and the version tables carry what "
                "shipped in the release it shows.",
        "totals": {"figures": len(figures), "tags": len(tags), "bytes": total,
                   "chapters": len({u["chapter"] for f in figures for u in f["used_by"]})},
        "figures": figures,
    }
    (FIGS / "index.json").write_text(json.dumps(data, indent=1, ensure_ascii=False) + "\n")
    (BOOK / "figures.html").write_text(HTML.format(
        slug=BOOK.name, title=esc(meta["title"]), short=esc(meta["title"].split(":")[0]),
        n=len(figures), tags=len(tags), mb=round(total / 1e6, 1),
        data=json.dumps(data)))
    print(f'gen_figures: {len(figures)} figure(s) across {len(tags)} tag(s), '
          f'{data["totals"]["chapters"]} chapter(s), {total/1e6:.1f} MB; '
          f'every tag exists and every figure is used')


if __name__ == "__main__":
    main()
