#!/usr/bin/env python3
"""Generates the making-of book's version diff: one snapshot per BOOK version,
extracted from the site tag that carried it, plus the page that reads them.

Brief 45: "I should be able to read the changes between the two versions of the
book and between two particular versions of a book." This is the text half of
that, and it is deliberately labelled as the half. The founder set the bar at a
diff computed from the graphs — "you should be delting the diffs of the graphs,
not of the markdown" — and that needs a graph stored per book version, which does
not exist yet. Tracked as @developer/issues/open/001 and WS-04.

Why per BOOK version and not per site release: the site moved 116 times and the
book moved twice. A picker offering 116 identical snapshots would be a worse
answer than one offering two real ones. Each snapshot names the site release that
carried it, from the book's own two-clock changelog.

The units are the chapter MARKDOWN at that tag, not rendered HTML. The markdown is
the source of truth here, and diffing the source rather than a projection of it
means a presentational change to the template cannot show up as a content change.

Run from anywhere: python3 admin/build/gen_bookdiff.py
"""
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BOOK = ROOT / "v2" / "books" / "making-a-book"
OUT = BOOK / "changes" / "data"
CONTENT = "v2/books/making-a-book/content"
VERSION = (ROOT / "admin" / "build" / "version.txt").read_text().strip()


def esc(s):
    return (str(s).replace("&", "&amp;").replace("<", "&lt;")
            .replace(">", "&gt;").replace('"', "&quot;"))


def git(*args):
    r = subprocess.run(["git", "-C", str(ROOT), *args], capture_output=True, text=True)
    return r.stdout if r.returncode == 0 else None


def blocks(md):
    """A chapter as plain text blocks: paragraphs and list items, markdown
    stripped to what a reader would call the words. Fenced code is kept whole
    because a diff inside a code block is not a prose change."""
    out, buf, fence = [], [], False
    for line in md.split("\n"):
        if line.strip().startswith("```"):
            fence = not fence
            buf.append(line)
            if not fence:
                out.append("\n".join(buf).strip())
                buf = []
            continue
        if fence:
            buf.append(line)
            continue
        if not line.strip():
            if buf:
                out.append(" ".join(buf).strip())
                buf = []
            continue
        buf.append(line.strip())
    if buf:
        out.append(" ".join(buf).strip())
    return [b for b in out if b]


def unit_key(name):
    """The keys assets/changes.js sorts on: `intro`, then chNN. The book's
    00__front-matter is its introduction, and the rest are chapters in order."""
    n = int(name[:2])
    return "intro" if n == 0 else f"ch{n:02d}"


def snapshot(tag):
    """Every chapter of the book as it stood at one tag, keyed for the differ."""
    listing = git("ls-tree", "--name-only", f"{tag}:{CONTENT}")
    if listing is None:
        return None
    units = {}
    for name in sorted(n for n in listing.split() if n.endswith(".md")):
        md = git("show", f"{tag}:{CONTENT}/{name}")
        if md is None:
            continue
        title = next((l[2:].strip() for l in md.split("\n") if l.startswith("# ")), name)
        units[unit_key(name)] = {"title": title, "file": name, "blocks": blocks(md)}
    return units


PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>What changed between versions &mdash; {title} &mdash; graphs.sgit.ai</title>
<meta name="description" content="Read the delta between any two versions of {title}, chapter by chapter, block by block, and word by word inside a changed block. The text half of the diff brief 45 asked for.">
<link rel="canonical" href="https://graphs.sgit.ai/v2/books/{slug}/changes.html">
<meta property="og:type" content="website">
<meta property="og:site_name" content="graphs.sgit.ai">
<meta property="og:url" content="https://graphs.sgit.ai/v2/books/{slug}/changes.html">
<meta property="og:title" content="What changed between versions &mdash; {title}">
<meta property="og:description" content="The delta between two versions of the book, block by block.">
<meta name="twitter:card" content="summary">
<link rel="stylesheet" href="../../../assets/site.css">
<link rel="stylesheet" href="../../../assets/board.css">
</head>
<body>

<nav class="site"><div class="row"></div></nav>

<main class="doc">
<div class="crumb"><a href="../../../index.html">graphs.sgit.ai</a> &rarr; <a href="../index.html">the books</a> &rarr; <a href="index.html">{short}</a> &rarr; <b>what changed</b></div>
<h1>What changed between versions</h1>
<p class="lead">Pick two versions of <b>{title}</b> and read the delta the way a code review reads a diff: chapter by chapter, block by block, and word by word inside a changed block. <b>{n} version(s)</b> so far, each extracted from the release tag that carried it.</p>

<div class="note"><b>This is the text half, and it is labelled as the half deliberately.</b> Brief 45 asks to read the changes between two versions of the book, and sets the bar higher than this page reaches: <em>&ldquo;eventually should be a diff created from the graphs&hellip; you should be delting the diffs of the graphs, not of the markdown. That would be the really test measurement of our success here.&rdquo;</em> A graph diff can tell a reworded sentence from a replaced one and report a moved section as a move; this page cannot. It needs a graph stored per book version and only the current version has one. Tracked as <a href="../../team/issues.html">an open issue</a> and WS-04 on <a href="board.html">the board</a>.<br>
<b>Two clocks.</b> The picker offers <b>book</b> versions, not site releases: the site has moved {siteversions} times and the book twice. Each snapshot names the release that carried it. <b>The units are the chapter markdown</b>, not the rendered pages, so a change to a template cannot show up here as a change to the book.</div>

<div class="diffbar">
  <label>From <select id="from"></select></label>
  <span class="darrow">&rarr;</span>
  <label>To <select id="to"></select></label>
  <span class="dmodes">
    <label><input type="radio" name="mode" value="changes" checked> Changes only</label>
    <label><input type="radio" name="mode" value="context"> With context</label>
    <label><input type="radio" name="mode" value="all"> Everything</label>
  </span>
</div>

<p id="summary" class="small dim">Loading the version index&hellip;</p>
<div id="diff"></div>

<div class="agent">
<h4>For an agent</h4>
<p><code>changes/data/index.json</code> lists the book versions with the site release and date of each; one file per version holds the chapters as flat text blocks extracted from that version's tag. Extraction from a tag is deterministic, so a version's file never changes once its tag exists and each book release adds exactly one file. The diffing runs client-side in <code>assets/changes.js</code>.</p>
</div>

</main>

<footer class="site"><div class="cols"></div></footer>
<script src="../../../assets/changes.js" defer></script>
</body>
</html>
"""


def main():
    meta = json.loads((BOOK / "book.json").read_text())
    changelog = meta.get("changelog", [])
    OUT.mkdir(parents=True, exist_ok=True)
    index, missing = [], []
    for entry in changelog:
        tag = entry["site"]
        units = snapshot(tag)
        if units is None:
            missing.append(f'{entry["version"]} was carried by {tag}, which is not a tag here')
            continue
        date = (git("log", "-1", "--format=%cs", tag) or "").strip()
        (OUT / f'{entry["version"]}.json').write_text(json.dumps(
            {"version": entry["version"], "date": date, "site": tag,
             "note": entry["note"], "units": units}, ensure_ascii=False) + "\n")
        # `v` and `date` are the keys assets/changes.js reads; the rest is ours
        index.append({"v": entry["version"], "date": date,
                      "version": entry["version"], "site": tag, "note": entry["note"],
                      "units": len(units),
                      "blocks": sum(len(u["blocks"]) for u in units.values())})
    if missing:
        for m in missing:
            print("  ✗ " + m)
        raise SystemExit("gen_bookdiff: the changelog names a release with no tag — "
                         "run `git fetch origin --tags`")
    # oldest first: changes.js takes the LAST two entries as the default pair
    (OUT / "index.json").write_text(json.dumps({"versions": index}, indent=1) + "\n")

    n_site = len(re.findall(r'class="vnum"', (ROOT / "admin/versions.html").read_text())) \
        + sum(len(re.findall(r'class="vnum"', (ROOT / "admin" / f).read_text()))
              for f in ("versions-v0.5.html", "versions-v0.4.html", "versions-earlier.html"))
    (BOOK / "changes.html").write_text(PAGE.format(
        slug=BOOK.name, title=esc(meta["title"]), short=esc(meta["title"].split(":")[0]),
        n=len(index), siteversions=n_site))
    print(f'gen_bookdiff: {len(index)} book version(s) — '
          + " · ".join(f'{i["v"]} ({i["site"]}, {i["units"]} chapters, '
                       f'{i["blocks"]} blocks)' for i in index))


if __name__ == "__main__":
    main()
