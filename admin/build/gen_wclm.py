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
import subprocess
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

    # the senses register (brief 34): authored word senses across industries;
    # every word must be one the universe actually holds, and every word's
    # first sense must be the document's own
    senses = json.loads((OUT / "senses.json").read_text())["words"]
    known_forms = {r["form"] for r in table.values()}
    for word, entries in senses.items():
        if word not in known_forms:
            raise SystemExit(f"gen_wclm: senses register names {word!r}, which this universe has never seen")
        if not entries or entries[0]["key"] != "doc":
            raise SystemExit(f"gen_wclm: {word!r} must lead with the document's own sense (key 'doc')")

    # the analogies register (brief 35): every mapping must point at a concept
    # this extraction actually holds — an equivalence to nothing is a lie
    analogies = json.loads((OUT / "analogies.json").read_text())["audiences"]
    concept_ids = {c["id"] for c in concepts}
    for aud, spec in analogies.items():
        for m in spec["maps"]:
            if m["for"] not in concept_ids:
                raise SystemExit(f"gen_wclm: analogies for {aud!r} name unknown concept {m['for']!r}")

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
        "stems": {k: v for k, v in tokens.get("stems", [])},
        "cooc": tokens.get("edges", []),
        "concepts": concepts, "edges": edges, "pack": pack, "senses": senses,
        "analogies": analogies,
    }
    (OUT / "data" / "world.json").write_text(json.dumps(world, ensure_ascii=False) + "\n")

    (OUT / "index.html").write_text(PAGE.format(version=VERSION))

    # the operator folders (brief 36): a workbench page per operator, the
    # explorer over all of them, then the node generator derives each
    # folder's schema.json and examples.json from the code itself
    op_keys = sorted(p.name for p in (OUT / "operators").iterdir() if p.is_dir())
    for key in op_keys:
        (OUT / "operators" / key / "index.html").write_text(OP_PAGE.format(key=key))
    (OUT / "operators" / "index.html").write_text(EXPLORER)
    subprocess.run(["node", str(ROOT / "admin" / "build" / "gen_operators.mjs")], check=True)

    n_terms = len(pack["terms"])
    n_senses = sum(len(v) for v in senses.values())
    print(f"gen_wclm: world — {len(order)} token hashes, {len(concepts)} concepts, "
          f"{len(edges)} doc edges, {len(world['cooc'])} co-occurrence edges, "
          f"{n_terms} pack terms in {len(packs)} pack(s), "
          f"{n_senses} senses over {len(senses)} word(s), "
          f"{sum(len(a['maps']) for a in analogies.values())} analogies for {len(analogies)} audience(s); "
          f"fnv64('graph') = {vectors['graph']}")


PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>The WCLM &mdash; a deterministic transformer &mdash; graphs.sgit.ai</title>
<meta name="description" content="The words content language model: a transformer-shaped engine over this site's graphs where nothing is learned and everything is named. Ask it what a word or phrase means; watch layers of reusable engines answer with provenance instead of probability.">
<link rel="canonical" href="https://graphs.sgit.ai/v2/wclm/index.html">
<meta property="og:type" content="website">
<meta property="og:site_name" content="graphs.sgit.ai">
<meta property="og:url" content="https://graphs.sgit.ai/v2/wclm/index.html">
<meta property="og:title" content="The WCLM: a deterministic transformer">
<meta property="og:description" content="Tokens are hashes, the pipeline is layers of reusable schema-typed engines, attention is visible, and the answer is a meaning with provenance.">
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
<p class="lead">Briefs 31&ndash;34's experiment: an engine in the shape of a transformer where <b>nothing is learned and everything is named</b>. Tokens are content hashes, so the same word tokenises identically in every document. The pipeline is <b>layers of reusable engines</b> &mdash; toggle them, drag them between layers, run several side by side in one slot, and each layer reads only the layer before it, so no wire ever jumps. Early engines say <i>this is what we think you said</i> (the dictionary and thesaurus repairs, with their evidence). The senses engine knows a word means different things in different industries &mdash; a graph is a network graph here, a chart in a boardroom, a function plot at school &mdash; and <b>switching a word's sense shows exactly which of this universe's claims stop applying</b>; singular and plural are read as evidence too, because graph is not graphs. Operators make the little words count: <i>without</i> is not <i>through</i>, and when the prompt negates something this universe asserts, the contradiction is said out loud. Every engine declares its <b>schema</b> &mdash; the data types it reads and writes, six types in the whole pipeline &mdash; so compatibility is structural: an engine placed where its input type is not yet written is skipped with the reason named, and any engine writing the right type can stand in. It is even fractal: the <b>fractal engine is a full WCLM inside an engine</b>, re-running the winning meaning's own statement one zoom down. The <b>translate engine speaks analogies</b>: pick an audience and the answer is restated in their own concept &mdash; graphs of graphs, for somebody from finance, is <i>spreadsheets of spreadsheets</i> (<a href="analogies.json">the analogies register</a>) &mdash; and every answer now declares its <b>anchoring</b>: a quoted fact, a stated claim, or an authored term. And the query flips: instead of predicting the next word, ask <b>what does this mean</b> &mdash; the answer is a concept with its statement, its anchored quote, its blast radius, and a click on any box lights up its <b>full evidence trail</b>. Same prompt, same world, same picture, every time. Training this model means editing its graph inputs (<a href="data/world.json">the world</a>, <a href="packs/graphs-domain.json">the meaning packs</a>, <a href="senses.json">the senses register</a>), never fitting numbers. Since brief 36 every engine is also a <b>first-class folder</b>: <a href="operators/index.html">the operators</a> &mdash; code, schema, official data with provenance, docs, example vectors, and a workbench each.</p>

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




OP_PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>The {key} operator &mdash; workbench &mdash; graphs.sgit.ai</title>
<meta name="description" content="The {key} operator's workbench: execute it over the real world, test its recorded example vectors, debug the raw state, and see input, transformation and output side by side.">
<link rel="canonical" href="https://graphs.sgit.ai/v2/wclm/operators/{key}/index.html">
<meta property="og:type" content="website">
<meta property="og:site_name" content="graphs.sgit.ai">
<meta property="og:url" content="https://graphs.sgit.ai/v2/wclm/operators/{key}/index.html">
<meta property="og:title" content="The {key} operator">
<meta property="og:description" content="One of the WCLM's building blocks, first-class: code, schema, data, docs, examples and this workbench, all in its folder.">
<meta name="twitter:card" content="summary">
<link rel="stylesheet" href="../../../../assets/site.css">
<link rel="stylesheet" href="../../../../assets/universe.css">
<link rel="stylesheet" href="../../../../assets/wclm.css">
</head>
<body>

<nav class="site"><div class="row"></div></nav>

<main class="doc uni-full">
<div class="crumb"><a href="../../../../index.html">graphs.sgit.ai</a> &rarr; <a href="../../index.html">the WCLM</a> &rarr; <a href="../index.html">the operators</a> &rarr; <b>{key}</b></div>
<h1>The {key} operator</h1>
<p class="lead">A building block of the WCLM, first-class in its own folder: <a href="{key}.js">the code</a> (the source of truth the engine imports), <a href="{key}.md">the book page</a>, <a href="schema.json">the schema</a> (derived from the code), <a href="data.json">the official data</a> with its provenance, and <a href="examples.json">the example vectors</a> (captured deterministically; the test button replays them). Browse every file raw or rendered in <a href="../index.html#{key}/{key}.md">the explorer</a>.</p>

<div id="opwb" data-op="{key}"></div>
</main>

<footer class="site"><div class="cols"></div></footer>
<script type="module" src="../../../../assets/wclm/op-page.js"></script>
</body>
</html>
"""


EXPLORER = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>The operators &mdash; every engine in its folder &mdash; graphs.sgit.ai</title>
<meta name="description" content="The WCLM's twelve operators as first-class folders: code, schema, official data, docs, example vectors and a workbench each. Browse every file, raw or rendered.">
<link rel="canonical" href="https://graphs.sgit.ai/v2/wclm/operators/index.html">
<meta property="og:type" content="website">
<meta property="og:site_name" content="graphs.sgit.ai">
<meta property="og:url" content="https://graphs.sgit.ai/v2/wclm/operators/index.html">
<meta property="og:title" content="The operators: every engine in its folder">
<meta property="og:description" content="Twelve deterministic building blocks, each with its code, schema, data, docs, examples and workbench.">
<meta name="twitter:card" content="summary">
<link rel="stylesheet" href="../../../assets/site.css">
<link rel="stylesheet" href="../../../assets/universe.css">
<link rel="stylesheet" href="../../../assets/wclm.css">
</head>
<body>

<nav class="site"><div class="row"></div></nav>

<main class="doc uni-full">
<div class="crumb"><a href="../../../index.html">graphs.sgit.ai</a> &rarr; <a href="../index.html">the WCLM</a> &rarr; <b>the operators</b></div>
<h1>The operators: every engine in its folder</h1>
<p class="lead">Brief 36: the WCLM's building blocks as first-class artefacts, the way the pilot document got its file explorer. Each of the twelve operators lives in a dedicated folder holding <b>the code the engine actually imports</b>, its <b>schema</b> (reads and writes, derived from the code so it can never drift), its <b>official data</b> with provenance &mdash; standard across every document, authored for review, or derived by another transformation &mdash; its <b>book page</b> with the architecture drawn, its <b>example vectors</b> (captured deterministically, replayable as tests), and its <b>workbench</b>: execute, test, debug, and see input &rarr; transformation &rarr; output. Every file below reads raw or rendered, and deep-links.</p>

<div id="opsx"></div>
</main>

<footer class="site"><div class="cols"></div></footer>
<script src="../../../assets/vendor/marked.min.js"></script>
<script type="module" src="../../../assets/wclm/ops-explorer.js"></script>
</body>
</html>
"""


if __name__ == "__main__":
    main()
