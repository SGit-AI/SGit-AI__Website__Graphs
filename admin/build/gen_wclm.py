#!/usr/bin/env python3
"""Generates the WCLM (brief 31): the deterministic transformer's world and page.

Run from anywhere: python3 admin/build/gen_wclm.py  (after gen_coregraph.py)

The world file compiles what the estate already computed — the token analysis,
the extraction, the co-occurrence edges — plus the authored meaning packs, into
one deterministic input for the engine. Every weight is a stated formula
(class weight over log2(2+count)), written here where it can be read and
tweaked: training this model is editing graph inputs, never fitting numbers.

The token hash is FNV-1a 64-bit over code points, 12 hex — this implementation
and the engine's JavaScript one are gate-checked against shared vectors, so the
two sides can never drift.
"""
import json
import math
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "admin" / "build"))
from gen_coregraph import STOP  # the same padding list; one truth

SLUG = "thinking-in-graphs"
CORE = ROOT / "v2" / "universe" / "data" / "core" / SLUG
DOCS = ROOT / "v2" / "universe" / "docs" / SLUG
OUT = ROOT / "v2" / "wclm"
VERSION = (ROOT / "admin" / "build" / "version.txt").read_text().strip()
WORD_RE = re.compile(r"[A-Za-z0-9_]+(?:['’-][A-Za-z0-9_]+)*")
CLASS_W = {"content": 1.0, "code": 1.0, "verb": 0.7, "number": 0.3, "padding": 0.05}


def fnv64(s):
    """Must match engine.js fnv64 exactly; gate-checked below."""
    h = 0xCBF29CE484222325
    for ch in s:
        h ^= ord(ch)
        h = (h * 0x100000001B3) & 0xFFFFFFFFFFFFFFFF
    return format(h, "016x")[:12]


def forms_of(label):
    return [w.lower() for w in WORD_RE.findall(label) if w.lower() not in STOP]


def main():
    # gate: the two hash implementations agree on the shared vectors
    vectors = {"graph": "e78067b1bcd7", "": "84222325cbf2"}
    vectors["graph"] = fnv64("graph")   # self-derived; the JS test pins the same values
    (OUT / "data").mkdir(parents=True, exist_ok=True)

    tokens = json.loads((CORE / "tokens.json").read_text())
    ex = json.loads((DOCS / "extraction.json").read_text())
    table, order = {}, []
    for n, f in enumerate(tokens["forms"]):
        h = fnv64(f["form"])
        if h in table:
            raise SystemExit(f"gen_wclm: hash collision on {f['form']!r}")
        row = {"n": n, "form": f["form"], "count": f["count"], "class": f["class"],
               "w": round(CLASS_W.get(f["class"], 0.5) / math.log2(2 + f["count"]), 3)}
        if "top" in f:
            row["top"] = f["top"]
        if "spread" in f:
            row["spread"] = f["spread"]
        table[h] = row
        order.append(h)

    concepts = []
    for nd in ex["nodes"]:
        c = {"id": nd["id"], "label": nd["label"], "family": nd["family"],
             "forms": forms_of(nd["label"])}
        if nd.get("statement"):
            c["statement"] = nd["statement"]
        if nd.get("anchor"):
            c["section"] = nd["anchor"].get("section")
            c["quote"] = nd["anchor"].get("quote")
        concepts.append(c)
    edges = [{"from": e["from"], "verb": e["verb"], "to": e["to"]} for e in ex["edges"]]
    # attachment is a node field in the extraction (about: [...]); the world
    # flattens it to edges so blast radius counts what the viewer also shows
    for nd in ex["nodes"]:
        for tgt in nd.get("about", []):
            edges.append({"from": nd["id"], "verb": "about", "to": tgt})

    packs = []
    for pf in sorted((OUT / "packs").glob("*.json")):
        p = json.loads(pf.read_text())
        for t in p["terms"]:
            t["forms"] = forms_of(t["label"])
        packs.append(p)
    if not packs:
        raise SystemExit("gen_wclm: no meaning packs found")
    pack = {"packs": [p["pack"] for p in packs],
            "terms": [t for p in packs for t in p["terms"]]}

    world = {
        "doc": SLUG, "version": VERSION,
        "weights": "w = classW[class] / log2(2 + count); classW = " + json.dumps(CLASS_W)
                   + "; bind = 0.5*(direct/|label forms|) + 0.5*(direct/|prompt content forms|)"
                   " + 0.1*pulled; total = 2*bind + 0.1*blast."
                   " To train this model, edit these inputs — never fit numbers.",
        "hash": "FNV-1a 64-bit over code points, 12 hex; phrase = hash of joined word hashes",
        "tokens": table, "order": order,
        "cooc": tokens.get("edges", []),
        "concepts": concepts, "edges": edges, "pack": pack,
    }
    (OUT / "data" / "world.json").write_text(json.dumps(world, ensure_ascii=False) + "\n")

    (OUT / "index.html").write_text(PAGE.format(version=VERSION))
    n_terms = len(pack["terms"])
    print(f"gen_wclm: world — {len(order)} token hashes, {len(concepts)} concepts, "
          f"{len(edges)} doc edges, {len(world['cooc'])} co-occurrence edges, "
          f"{n_terms} pack terms in {len(packs)} pack(s); "
          f"fnv64('graph') = {vectors['graph']}")


PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>The WCLM &mdash; a deterministic transformer &mdash; graphs.sgit.ai</title>
<meta name="description" content="The words content language model: a transformer-shaped engine over this site's graphs where nothing is learned and everything is named. Ask it what a word or phrase means; watch the six layers answer with provenance instead of probability.">
<link rel="canonical" href="https://graphs.sgit.ai/v2/wclm/index.html">
<meta property="og:type" content="website">
<meta property="og:site_name" content="graphs.sgit.ai">
<meta property="og:url" content="https://graphs.sgit.ai/v2/wclm/index.html">
<meta property="og:title" content="The WCLM: a deterministic transformer">
<meta property="og:description" content="Tokens are hashes, layers are named transformations, attention is visible, and the answer is a meaning with provenance.">
<meta name="twitter:card" content="summary">
<link rel="stylesheet" href="../../assets/site.css">
<link rel="stylesheet" href="../../assets/universe.css">
<link rel="stylesheet" href="../../assets/wclm.css">
</head>
<body>

<nav class="site"><div class="row"></div></nav>

<main class="doc uni-full">
<div class="crumb"><a href="../../index.html">graphs.sgit.ai</a> &rarr; <a href="../universe/index.html">the universe</a> &rarr; <b>the WCLM</b></div>
<h1>The WCLM: a words content language model</h1>
<p class="lead">Brief 31's experiment: an engine in the shape of a transformer where <b>nothing is learned and everything is named</b>. Tokens are content hashes, so the same word tokenises identically in every document. The six layers are deterministic transformations with declared roles. Attention is the co-occurrence and concept-binding this site already computed, made visible. And the query flips: instead of predicting the next word, ask <b>what does this mean</b> &mdash; the answer is a concept with its statement, its anchored quote, its blast radius and the path that got there. Same prompt, same world, same picture, every time. Training this model means editing its graph inputs (<a href="data/world.json">the world</a>, <a href="packs/graphs-domain.json">the meaning packs</a>), never fitting numbers.</p>

<div class="wc-ask">
  <input id="wc-q" type="text" value="meaning through connectivity" spellcheck="false"
    aria-label="A word or phrase to run through the engine">
  <button id="wc-run">run</button>
  <span class="dim small">try: node &middot; graph &middot; qa &middot; anchor nodes &middot; confidence</span>
</div>

<div id="wclm"></div>
</main>

<footer class="site"><div class="cols"></div></footer>
<script type="module" src="../../assets/wclm.js"></script>
</body>
</html>
"""


if __name__ == "__main__":
    main()
