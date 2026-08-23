#!/usr/bin/env python3
"""Generates /v2/lexicon/ — the book's lexicon as SCOPES that may extend, specialise or
override one another. This is the corrected meaning of fractal semantic graphs (brief 20)
applied to the book's own vocabulary: multiple lexicons at different altitudes, a
well-connected root any scope may link to, and local override without asking the centre.

Run from anywhere: python3 admin/build/gen_lexicon.py
Then run chrome.py.

Scopes are authored under v2/lexicon/scopes/. The book scope (root) carries its terms
inline, seeded as a provenance copy of the first edition's concept layer. A source scope
carries NO terms of its own: its terms live in the universe extraction, anchored to the
frozen bytes, and the scope file only declares the authored MAPPINGS onto the book's
vocabulary (same-concept, grounds) plus notes for what stays unmapped. An unmapped term
is a finding, not an error.

An override records its authority and keeps the superseded definition visible:
supersede, never delete, applied to the vocabulary itself.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(Path(__file__).resolve().parent))
from gen_packs import esc, fmt  # noqa: E402

VERSION = (ROOT / "admin/build/version.txt").read_text().strip()
SCOPES = ROOT / "v2" / "lexicon" / "scopes"
OUT = ROOT / "v2" / "lexicon"
DATA = OUT / "data"

RELATIONS = {"same-concept", "grounds"}


def load_scopes():
    scopes = [json.loads(f.read_text()) for f in sorted(SCOPES.glob("*.json"))]
    errors = []
    ids = {s["scope"] for s in scopes}
    for s in scopes:
        if s["parent"] is not None and s["parent"] not in ids:
            errors.append(f"scope {s['scope']}: parent {s['parent']!r} does not exist")
    book = next((s for s in scopes if s["kind"] == "root"), None)
    if book is None:
        errors.append("no root scope")
        raise SystemExit("gen_lexicon: " + "; ".join(errors))
    book_terms = {t["id"]: t for t in book["terms"]}
    if len(book_terms) != len(book["terms"]):
        errors.append("book scope: duplicate term ids")
    for t in book["terms"]:
        if not t.get("definition", "").strip():
            errors.append(f"book term {t['id']}: empty definition")
        if "superseded" in t:
            if not t["superseded"].get("by"):
                errors.append(f"book term {t['id']}: override without an authority")
            if not t["superseded"].get("definition"):
                errors.append(f"book term {t['id']}: override without the superseded definition kept")

    uni = json.loads((ROOT / "v2/universe/data/universe.json").read_text())
    uni_terms = {}          # source slug -> {concept id: node}
    for src in uni["sources"]:
        uni_terms[src["slug"]] = {n["id"]: n for n in src["nodes"] if n["family"] == "concept"}

    for s in scopes:
        if s["kind"] != "source-scope":
            continue
        slug = s["scope"].split(":", 1)[1]
        terms = uni_terms.get(slug)
        if terms is None:
            errors.append(f"scope {s['scope']}: no universe extraction for {slug!r}")
            continue
        mapped = set()
        for m in s["mappings"]:
            if m["term"] not in terms:
                errors.append(f"scope {s['scope']}: mapping names unknown document term {m['term']!r}")
            if m["book_term"] not in book_terms:
                errors.append(f"scope {s['scope']}: mapping names unknown book term {m['book_term']!r}")
            if m["relation"] not in RELATIONS:
                errors.append(f"scope {s['scope']}: unknown relation {m['relation']!r}")
            if m["term"] in mapped:
                errors.append(f"scope {s['scope']}: term {m['term']!r} mapped twice")
            mapped.add(m["term"])
        for t in terms:
            if t not in mapped and t not in s.get("unmapped_notes", {}):
                errors.append(f"scope {s['scope']}: term {t!r} neither mapped nor noted unmapped — "
                              "an unnoted gap is a hole, a noted one is a finding")
        for t in s.get("unmapped_notes", {}):
            if t in mapped:
                errors.append(f"scope {s['scope']}: {t!r} is both mapped and noted unmapped")
            if t not in terms:
                errors.append(f"scope {s['scope']}: unmapped note names unknown term {t!r}")
        s["_terms"] = terms

    if errors:
        for e in errors:
            print("  ✗ " + e, file=sys.stderr)
        raise SystemExit(f"gen_lexicon: {len(errors)} error(s) — nothing written")
    return scopes, book, book_terms


PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>The lexicon &mdash; graphs.sgit.ai</title>
<meta name="description" content="The book's vocabulary as scopes that may extend, specialise or override one another: the root scope seeded from the first edition's concepts, a scope per source document, overrides recorded with their authority and the superseded definition kept visible.">
<link rel="canonical" href="https://graphs.sgit.ai/v2/lexicon/index.html">
<meta property="og:type" content="website">
<meta property="og:site_name" content="graphs.sgit.ai">
<meta property="og:url" content="https://graphs.sgit.ai/v2/lexicon/index.html">
<meta property="og:title" content="The lexicon">
<meta property="og:description" content="Multiple lexicons at different altitudes, with local override: fractal semantic graphs applied to the book's own vocabulary.">
<meta name="twitter:card" content="summary">
<link rel="stylesheet" href="../../assets/site.css">
</head>
<body>

<nav class="site"><div class="row"></div></nav>

<main class="doc">
  <div class="crumb"><a href="../../index.html">graphs.sgit.ai</a> &rarr; <a href="../index.html">the second edition</a> &rarr; <b>The lexicon</b></div>
  <h1>The lexicon, in scopes</h1>
  <p class="lead">The book's vocabulary, held the way the book says vocabulary should be held: <b>multiple lexicons at different altitudes</b>, a well-connected root that any scope may link to, and local override without asking the centre. That is the corrected meaning of <em>fractal semantic graphs</em> (brief 20), demonstrated on the book's own terms. A term's meaning at any scope is computable: the scope's own definition if it has one, the parent's otherwise, and every override carries its authority with the superseded definition kept visible.</p>

  <div class="note"><b>The scopes today.</b> The <b>book scope</b> is the root: {n_carried} terms carried as a provenance copy of the first edition's concept layer (recorded against <code>{prov_from}</code>, {prov_release}, verdict {prov_verdict}), plus {n_authored} authored at v2, with {n_overridden} already overridden. One <b>source scope</b> per extracted document follows: its terms live in <a href="../universe/index.html">the universe extraction</a>, anchored to the frozen bytes, and the scope only declares how they map onto the book's vocabulary. Altitude scopes (L1&ndash;L5) will join when the levels exist.</div>

{override_html}

  <h2 id="book">The book scope, term by term</h2>
  <p>Each term shows where its definition came from, and which source-document terms ground it. <span class="rstate rs-applied">same concept</span> means a source scope names this same idea; <span class="rstate rs-discussing">grounds</span> means the source's term is what this one compresses or narrows.</p>
  <div class="tablewrap">
  <table>
    <thead><tr><th>Term</th><th>Definition at the book scope</th><th>Origin</th><th>Grounded by</th></tr></thead>
    <tbody>
{book_rows}
    </tbody>
  </table>
  </div>

  <h2 id="divergence">What the source scopes carry that the book does not</h2>
  <p>Terms a document defines that have no book term to map to. <b>These are findings, not errors</b>: each is a candidate for the universe to surface in phase 2, or a deliberate absence with its reason recorded. The build fails on a source term that is neither mapped nor noted, because an unnoted gap is a hole and a noted one is information.</p>
  <div class="tablewrap">
  <table>
    <thead><tr><th>Scope</th><th>Term</th><th>Why unmapped</th></tr></thead>
    <tbody>
{unmapped_rows}
    </tbody>
  </table>
  </div>

  <div class="agent">
    <h4>For an agent</h4>
    <p>The machine surface is <a href="data/lexicon.json">data/lexicon.json</a>: every scope, every term with its definition, origin and evidence, every mapping with its relation, every override with its authority and superseded definition. The authored scope files are under <code>scopes/</code>. Resolution rule: a term at a scope means that scope's definition if present, else the parent's. Do not treat the book scope as authoritative for a source document's usage: the source's own definition, anchored in the universe, is what that document means.</p>
  </div>
</main>

<footer class="site"><div class="cols"></div></footer>
</body>
</html>
"""


def main():
    scopes, book, book_terms = load_scopes()
    OUT.mkdir(parents=True, exist_ok=True)
    DATA.mkdir(exist_ok=True)

    grounded = {}    # book term id -> [(scope, doc term id, relation)]
    unmapped_rows = []
    for s in scopes:
        if s["kind"] != "source-scope":
            continue
        for m in s["mappings"]:
            grounded.setdefault(m["book_term"], []).append((s["scope"], m["term"], m["relation"], m.get("note", "")))
        slug = s["scope"].split(":", 1)[1]
        for t, why in s.get("unmapped_notes", {}).items():
            node = s["_terms"][t]
            unmapped_rows.append(
                f'      <tr><td class="small"><code>{esc(s["scope"])}</code></td>'
                f'<td><a href="../universe/{slug}.html#n-{t}"><b>{esc(node["label"])}</b></a></td>'
                f'<td class="small">{esc(why)}</td></tr>')

    book_rows = []
    n_over = 0
    for t in book["terms"]:
        origin = t["origin"]
        badge = {"carried-from-v1": '<span class="rstate rs-applied">carried from v1</span>',
                 "authored-at-v2": '<span class="rstate rs-discussing">authored at v2</span>',
                 "carried-from-v1, overridden-at-v2": '<span class="rstate rs-declined">overridden at v2</span>'}[origin]
        if "superseded" in t:
            n_over += 1
        g = grounded.get(t["id"], [])
        gh = "<br>".join(
            f'<a href="../universe/{sc.split(":", 1)[1]}.html#n-{term}"><code>{esc(term)}</code></a> '
            f'<span class="rstate {"rs-applied" if rel == "same-concept" else "rs-discussing"}">{rel.replace("-", " ")}</span>'
            for sc, term, rel, _ in g) or '<span class="small dim">nothing yet</span>'
        nbn = "".join(f'<div class="small dim">near but not: {fmt(x)}</div>' for x in t.get("near_but_not", []))
        also = ""
        if t.get("also_called"):
            also = '<div class="small dim">also called: ' + ", ".join(esc(x) for x in t["also_called"]) + "</div>"
        book_rows.append(
            f'      <tr id="t-{t["id"]}"><td><b>{esc(t["label"])}</b></td>'
            f'<td>{fmt(t["definition"])}{also}{nbn}</td>'
            f'<td>{badge}</td><td class="small">{gh}</td></tr>')

    over = [t for t in book["terms"] if "superseded" in t]
    override_html = ""
    if over:
        parts = ['  <h2 id="override">The override on record</h2>']
        for t in over:
            parts.append(
                '  <div class="note"><b>' + esc(t["label"]) + '</b> &mdash; overridden, with the history kept.<br>'
                '<span class="small dim">The superseded definition (first edition): </span>'
                f'<em>{fmt(t["superseded"]["definition"])}</em><br>'
                '<span class="small dim">The definition now: </span>'
                f'<b>{fmt(t["definition"])}</b><br>'
                f'<span class="small dim">Authority: {esc(t["superseded"]["by"])}. {esc(t["superseded"].get("note", ""))}</span></div>')
        override_html = "\n".join(parts)

    prov = book["provenance"]
    n_carried = sum(1 for t in book["terms"] if t["origin"].startswith("carried"))
    n_authored = sum(1 for t in book["terms"] if t["origin"] == "authored-at-v2")

    (OUT / "index.html").write_text(PAGE.format(
        n_carried=n_carried, n_authored=n_authored, n_overridden=n_over,
        prov_from=prov["from"], prov_release=prov["release"], prov_verdict=prov["verdict"],
        override_html=override_html,
        book_rows="\n".join(book_rows), unmapped_rows="\n".join(unmapped_rows)))

    pub = {"version": VERSION, "scopes": []}
    for s in scopes:
        row = {k: v for k, v in s.items() if not k.startswith("_")}
        pub["scopes"].append(row)
    (DATA / "lexicon.json").write_text(json.dumps(pub, indent=1, ensure_ascii=False) + "\n")
    n_map = sum(len(s.get("mappings", [])) for s in scopes)
    print(f"gen_lexicon: {len(scopes)} scope(s), {len(book['terms'])} book terms "
          f"({n_over} overridden), {n_map} mappings, {len(unmapped_rows)} unmapped findings")


if __name__ == "__main__":
    main()
