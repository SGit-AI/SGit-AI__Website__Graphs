#!/usr/bin/env python3
"""Generates /v2/methods/ — the register of graph-like techniques and workflows this
project has invented or adopted while building the book.

Run from anywhere: python3 admin/build/gen_methods.py
Then run chrome.py.

The register exists because part of what the second edition talks about is how it was
made: every technique here was used in earnest before being written down, and the method
chapter draws on this register rather than on memory. Superseded techniques stay listed
with their supersession recorded, because the register obeys the discipline it documents.

The referential check: every path a method claims to be implemented in must exist,
unless the method is superseded (its implementation is allowed to be gone).
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(Path(__file__).resolve().parent))
from gen_packs import esc, fmt  # noqa: E402

VERSION = (ROOT / "admin/build/version.txt").read_text().strip()
OUT = ROOT / "v2" / "methods"

PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>The methods &mdash; graphs.sgit.ai</title>
<meta name="description" content="The register of graph-like techniques and workflows this project invented or adopted while building the book: what each is, the release where it first shipped, where it is implemented, and what it demonstrates for the second edition.">
<link rel="canonical" href="https://graphs.sgit.ai/v2/methods/index.html">
<meta property="og:type" content="website">
<meta property="og:site_name" content="graphs.sgit.ai">
<meta property="og:url" content="https://graphs.sgit.ai/v2/methods/index.html">
<meta property="og:title" content="The methods">
<meta property="og:description" content="Every graph technique this project has used in earnest, registered as book source material for the method chapter.">
<meta name="twitter:card" content="summary">
<link rel="stylesheet" href="../../assets/site.css">
</head>
<body>

<nav class="site"><div class="row"></div></nav>

<main class="doc">
  <div class="crumb"><a href="../../index.html">graphs.sgit.ai</a> &rarr; <a href="../index.html">the second edition</a> &rarr; <b>The methods</b></div>
  <h1>The methods register</h1>
  <p class="lead">{note}</p>

  <div class="note"><b>Why this is book material and not housekeeping.</b> The second edition argues that conclusions about a body of work should be computed, that history should be part of the graph, and that a rule with no enforcement is a preference. Every row below is one of those arguments having actually been lived, with the release where it first shipped and the code that enforces it. The method chapter of the second edition is written from this register.</div>

  <div class="tablewrap">
  <table>
    <thead><tr><th>Technique</th><th>What it is</th><th>Born</th><th>Lives in</th><th>For the book</th></tr></thead>
    <tbody>
{rows}
    </tbody>
  </table>
  </div>

  <div class="agent">
    <h4>For an agent</h4>
    <p>The machine surface is <a href="data/methods.json">data/methods.json</a>. Each entry names the release it first shipped in (checkable against <a href="../../admin/versions.html">the release history</a>) and the files that implement it (checked by the build for entries still in use). A superseded entry stays in the register with its supersession recorded; treat its presence as history, not as current practice.</p>
  </div>
</main>

<footer class="site"><div class="cols"></div></footer>
</body>
</html>
"""


def main():
    reg = json.loads((OUT / "data" / "methods.json").read_text())
    errors = []
    seen = set()
    for m in reg["methods"]:
        if m["id"] in seen:
            errors.append(f"duplicate method id {m['id']!r}")
        seen.add(m["id"])
        if m["status"] == "in use":
            for p in m["implemented_in"]:
                if not (ROOT / p).exists():
                    errors.append(f"method {m['id']}: implemented_in names a missing path: {p}")
    if errors:
        for e in errors:
            print("  ✗ " + e, file=sys.stderr)
        raise SystemExit(f"gen_methods: {len(errors)} error(s) — nothing written")

    rows = []
    for m in reg["methods"]:
        status = ""
        if m["status"] != "in use":
            status = f'<div><span class="rstate rs-declined">{esc(m["status"])}</span></div>'
        impl = "<br>".join(f"<code>{esc(p)}</code>" for p in m["implemented_in"])
        rows.append(
            f'      <tr id="m-{m["id"]}"><td><b>{esc(m["name"])}</b>{status}</td>'
            f'<td>{fmt(m["what"])}</td>'
            f'<td class="small"><a href="../../admin/versions.html">{esc(m["born"])}</a></td>'
            f'<td class="small">{impl}</td>'
            f'<td class="small dim">{fmt(m["for_the_book"])}</td></tr>')

    (OUT / "index.html").write_text(PAGE.format(note=esc(reg["note"]), rows="\n".join(rows)))
    n_sup = sum(1 for m in reg["methods"] if m["status"] != "in use")
    print(f"gen_methods: {len(reg['methods'])} technique(s), {n_sup} superseded")


if __name__ == "__main__":
    main()
