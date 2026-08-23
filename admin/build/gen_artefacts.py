#!/usr/bin/env python3
"""Generates /v2/artefacts/ — the catalogue of point-in-time artefacts, preserved byte
for byte so the history of how the result was reached stays part of the result's graph.

Run from anywhere: python3 admin/build/gen_artefacts.py
Then run chrome.py (which fills chrome on the index only; the artefacts themselves are
preserved bytes and are never touched).

The founder's rule, 23 August 2026: the experiments, views, documents and pages created
along the way must not be lost or overwritten, because each was created at a particular
moment with a particular set of source material and thinking. So an artefact enters this
catalogue as its original bytes, pulled from the release tag that built it, with every
file's SHA-256 recorded; this generator REFUSES to build if any catalogued byte has
changed, which is the freeze mechanism applied at artefact granularity. The era's
stylesheets are archived alongside so an artefact still renders as it did.
"""
import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(Path(__file__).resolve().parent))
from gen_packs import esc  # noqa: E402

VERSION = (ROOT / "admin/build/version.txt").read_text().strip()
OUT = ROOT / "v2" / "artefacts"

PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>The artefacts &mdash; graphs.sgit.ai</title>
<meta name="description" content="Point-in-time artefacts preserved byte for byte: pages and PDFs that captured a particular moment with a particular set of sources and thinking, hash-gated so they can never be silently overwritten.">
<link rel="canonical" href="https://graphs.sgit.ai/v2/artefacts/index.html">
<meta property="og:type" content="website">
<meta property="og:site_name" content="graphs.sgit.ai">
<meta property="og:url" content="https://graphs.sgit.ai/v2/artefacts/index.html">
<meta property="og:title" content="The artefacts">
<meta property="og:description" content="The catalogue of preserved moments: original bytes, recorded hashes, and the build fails if any of them changes.">
<meta name="twitter:card" content="summary">
<link rel="stylesheet" href="../../assets/site.css">
</head>
<body>

<nav class="site"><div class="row"></div></nav>

<main class="doc">
  <div class="crumb"><a href="../../index.html">graphs.sgit.ai</a> &rarr; <a href="../index.html">the second edition</a> &rarr; <b>The artefacts</b></div>
  <h1>The artefact catalogue</h1>
  <p class="lead">{note}</p>

  <div class="note"><b>How an artefact gets here, and why it can be trusted.</b> Its original bytes are pulled from the release tag that built it, never from the current tree; every file's SHA-256 is recorded in <a href="data/catalog.json">the catalogue</a>; and the build fails if any catalogued byte changes. The live sections keep moving (the current pack at <a href="../packs/index.html">/v2/packs/</a> regenerates every release); the catalogue is where the moments live. When a live artefact worth keeping is about to be superseded, it is snapshotted in here first.</div>

{entries}

  <div class="agent">
    <h4>For an agent</h4>
    <p>The machine surface is <a href="data/catalog.json">data/catalog.json</a>: every entry with its capture provenance (release, tag, original paths) and every preserved file with its SHA-256. Treat an artefact as what the site said <em>at that moment</em>, never as the current state: it will disagree with today's pages, and the disagreement is the point. Do not cite an artefact's numbers as current; cite them as of its release.</p>
  </div>
</main>

<footer class="site"><div class="cols"></div></footer>
</body>
</html>
"""


def main():
    cat = json.loads((OUT / "data" / "catalog.json").read_text())
    errors = []
    for e in cat["entries"]:
        for f in e["files"]:
            p = ROOT / f["path"]
            if not p.exists():
                errors.append(f"artefact {e['id']}: file is gone: {f['path']}")
                continue
            if hashlib.sha256(p.read_bytes()).hexdigest() != f["sha256"]:
                errors.append(f"artefact {e['id']}: {f['path']} no longer hashes to its record — "
                              "a catalogued artefact is immutable")
    if errors:
        for err in errors:
            print("  ✗ " + err, file=sys.stderr)
        raise SystemExit(f"gen_artefacts: {len(errors)} error(s) — nothing written")

    blocks = []
    for e in cat["entries"]:
        cap = e["captured_from"]
        files = "".join(
            f'<tr><td><code>{esc(f["path"].split("artefacts/", 1)[1])}</code></td>'
            f'<td class="small dim"><code>{f["sha256"][:16]}&hellip;</code></td></tr>'
            for f in e["files"])
        rel = e["open"].split("artefacts/", 1)[1]
        pdf = e["pdf"].split("artefacts/", 1)[1]
        blocks.append(f'''  <h2 id="{e["id"]}">{esc(e["title"])}</h2>
  <p>{esc(e["moment"])}</p>
  <p><a href="{rel}"><b>Open the page as it was</b></a> &middot; <a href="{pdf}">the PDF as it was</a> &middot; captured from tag <code>{esc(cap["tag"])}</code></p>
  <div class="tablewrap"><table>
    <thead><tr><th>Preserved file</th><th>SHA-256</th></tr></thead>
    <tbody>{files}</tbody>
  </table></div>''')

    (OUT / "index.html").write_text(PAGE.format(note=esc(cat["note"]), entries="\n".join(blocks)))
    n_files = sum(len(e["files"]) for e in cat["entries"])
    print(f"gen_artefacts: {len(cat['entries'])} artefact(s), {n_files} file(s), every hash verified")


if __name__ == "__main__":
    main()
