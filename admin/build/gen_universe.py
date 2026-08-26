#!/usr/bin/env python3
"""Generates /v2/universe/ — layer 1 of the second edition's universe: one local graph
per carried source document, every node anchored to the frozen bytes that carry it.

Run from anywhere: python3 admin/build/gen_universe.py
Then run chrome.py, which fills in the nav and footer on the site pages.

The layer model this implements (agreed with the founder, 23 August 2026):

  layer 0   the frozen bytes            v1/docs/sources/, hashed in v1/MANIFEST.json
  layer 1   per-document local graphs   v2/universe/docs/<slug>/          AUTHORED
  layer 2   the bridge layer            cross-document edges              not yet
  layer 3   the book's universe         the six families                  not yet

Every layer 1 node is a record of the form "this document says X, at this anchor".
Whether X is true is not evaluated here; that judgement belongs to layer 3.

The anchor mechanism is the point. The source documents are byte-frozen behind gate 14,
so an anchor is stable forever, and this generator REFUSES to build if any anchor's
quote is not found verbatim inside its named section of a file that still hashes to the
recorded SHA-256. An extraction that cites words that are not there cannot ship. The
coverage rule is enforced the same way: every section that has its own prose either
yields at least one anchored item or is listed as deliberately empty with a reason,
because a recorded empty section is a finding and a silent one is a hole.

The four reviewer-facing views (dictionary, taxonomy, thesaurus and near-but-not,
ontology) are PROJECTIONS of the one extraction file, never separate artefacts, so
they cannot disagree with each other.
"""
import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(Path(__file__).resolve().parent))
from gen_packs import pdf_page_count, esc, fmt  # noqa: E402

VERSION = (ROOT / "admin/build/version.txt").read_text().strip()
DOCS = ROOT / "v2" / "universe" / "docs"
OUT = ROOT / "v2" / "universe"
DATA = OUT / "data"

TOTAL_SOURCES = 21   # the carried estate this layer will eventually cover

# the verbs register (brief 26: one direction per relation, the inverse declared,
# never stored). Loaded from data so the register is reviewable estate, not code.
_VERBS = json.loads((ROOT / "v2" / "universe" / "verbs.json").read_text())
VERB_INVERSE = dict(_VERBS["asserted"])
ALL_INVERSES = {**_VERBS["asserted"], **_VERBS["structural"],
                **{v: v for v in _VERBS["symmetric"]}}

def _check_verbs():
    seen = {}
    for verb, inv in ALL_INVERSES.items():
        if verb != inv and inv in ALL_INVERSES:
            raise SystemExit(f"gen_universe: inverse {inv!r} of {verb!r} is itself a stored verb — one direction only")
        if inv in seen and verb not in _VERBS["symmetric"]:
            raise SystemExit(f"gen_universe: verbs {seen[inv]!r} and {verb!r} share the inverse {inv!r}")
        seen[inv] = verb
        if verb == inv and verb not in _VERBS["symmetric"]:
            raise SystemExit(f"gen_universe: {verb!r} is its own inverse but is not declared symmetric")
_check_verbs()

FAMILY_LABEL = {
    "concept": "Concept", "claim": "Claim", "hypothesis": "Hypothesis",
    "objective": "Objective", "example": "Example",
}


def sections_of(raw):
    """Heading text -> (start, end) byte range, heading to next heading of any level.
    Also returns the ordered heading list with levels for the taxonomy view."""
    lines = raw.split(b"\n")
    heads = []
    pos = 0
    in_fence = False
    for ln in lines:
        stripped = ln.strip()
        if stripped.startswith(b"```"):
            in_fence = not in_fence
        if not in_fence and ln.startswith(b"#"):
            level = len(ln) - len(ln.lstrip(b"#"))
            title = ln.lstrip(b"#").strip().decode("utf-8")
            heads.append((title, level, pos))
        pos += len(ln) + 1
    ranges = {}
    for i, (title, level, start) in enumerate(heads):
        end = heads[i + 1][2] if i + 1 < len(heads) else len(raw)
        if title in ranges:
            raise SystemExit(f"gen_universe: duplicate heading '{title}' — anchors would be ambiguous")
        ranges[title] = (start, end)
    return ranges, heads


def has_own_prose(raw, ranges, heads):
    """Sections whose body (before any child heading) contains non-empty text."""
    out = set()
    for i, (title, level, start) in enumerate(heads):
        end = heads[i + 1][2] if i + 1 < len(heads) else len(raw)
        body = raw[start:end].split(b"\n", 1)
        body = body[1] if len(body) > 1 else b""
        if body.strip():
            out.add(title)
    return out


def resolve_anchor(anchor, raw, ranges, errors, where):
    """Verify the quote sits verbatim inside the named section; return byte offsets."""
    sec = anchor.get("section")
    if sec not in ranges:
        errors.append(f"{where}: section not found: {sec!r}")
        return None
    start, end = ranges[sec]
    q = anchor["quote"].encode("utf-8")
    hits = []
    p = raw.find(q, start, end)
    while p != -1:
        hits.append(p)
        p = raw.find(q, p + 1, end)
    if not hits:
        errors.append(f"{where}: quote not found in section {sec!r}: {anchor['quote'][:60]!r}")
        return None
    occ = anchor.get("occurrence")
    if len(hits) > 1 and occ is None:
        errors.append(f"{where}: quote occurs {len(hits)}x in {sec!r} and no occurrence given")
        return None
    at = hits[(occ - 1) if occ else 0]
    para = raw.count(b"\n\n", start, at)
    return {"section": sec, "quote": anchor["quote"],
            "chars": [at, at + len(q)], "para": para}


def load_and_verify(folder):
    ex = json.loads((folder / "extraction.json").read_text())
    doc = ex["doc"]
    src = ROOT / doc["source"]
    raw = src.read_bytes()
    errors = []
    got = hashlib.sha256(raw).hexdigest()
    if got != doc["sha256"]:
        errors.append(f"{doc['slug']}: source hash mismatch — extraction records "
                      f"{doc['sha256'][:12]}…, file is {got[:12]}…")
        raise SystemExit("gen_universe: " + errors[0])
    if folder.name != doc["slug"]:
        raise SystemExit(f"gen_universe: folder {folder.name} holds extraction for {doc['slug']}")

    # the folder is standalone: its source copy must be byte-identical to the frozen original
    copy = folder / "source.md"
    if not copy.exists():
        errors.append(f"{doc['slug']}: folder has no source.md — the standalone folder must carry its own copy")
    elif hashlib.sha256(copy.read_bytes()).hexdigest() != doc["sha256"]:
        errors.append(f"{doc['slug']}: source.md in the folder no longer matches the frozen original")

    # crossrefs: every rating resolves in the usage model, every local path exists,
    # every concept named exists in the extraction
    model = json.loads((ROOT / "v2/universe/usage-model.json").read_text())
    levels = {l["id"] for l in model["levels"]}
    ex["_model"] = model
    crossrefs = {"refs": []}
    cr_path = folder / "crossrefs.json"
    if cr_path.exists():
        crossrefs = json.loads(cr_path.read_text())
        concept_ids = {n["id"] for n in ex["nodes"]}
        seen_ids = set()
        for r in crossrefs["refs"]:
            if r["id"] in seen_ids:
                errors.append(f"crossrefs {doc['slug']}: duplicate ref id {r['id']!r}")
            seen_ids.add(r["id"])
            if r["rating"] not in levels:
                errors.append(f"crossrefs {r['id']}: rating {r['rating']!r} is not in the usage model")
            if not r["where"].startswith("http") and not (ROOT / r["where"]).exists():
                errors.append(f"crossrefs {r['id']}: local path does not exist: {r['where']}")
            for c in r.get("what", []):
                if c not in concept_ids:
                    errors.append(f"crossrefs {r['id']}: names unknown node {c!r}")
            if not r.get("rated_by") or not r.get("rated"):
                errors.append(f"crossrefs {r['id']}: a rating is a judgement and must be signed and dated")
    ex["_crossrefs"] = crossrefs
    ranges, heads = sections_of(raw)

    anchored_sections = set()

    def note(a):
        if a:
            anchored_sections.add(a["section"])
        return a

    for n in ex["nodes"]:
        n["anchor"] = note(resolve_anchor(n["anchor"], raw, ranges, errors, f"node {n['id']}"))
    for e in ex["edges"]:
        if e["verb"] not in VERB_INVERSE:
            errors.append(f"edge {e['from']} -> {e['to']}: verb {e['verb']!r} has no declared inverse")
        e["inverse"] = VERB_INVERSE.get(e["verb"])
        e["anchor"] = note(resolve_anchor(e["anchor"], raw, ranges, errors, f"edge {e['from']}->{e['to']}"))
    for x in ex["near_but_not"]:
        x["anchor"] = note(resolve_anchor(x["anchor"], raw, ranges, errors, f"near-but-not {x['this']}"))
    for x in ex["aliases"]:
        x["anchor"] = note(resolve_anchor(x["anchor"], raw, ranges, errors, f"alias {x['a']}"))

    # node references resolve
    ids = {n["id"] for n in ex["nodes"]}
    for n in ex["nodes"]:
        for ref in n.get("about", []) + n.get("demonstrates", []):
            if ref not in ids:
                errors.append(f"node {n['id']}: reference to unknown node {ref!r}")
    for e in ex["edges"]:
        for endp in (e["from"], e["to"]):
            if endp not in ids:
                errors.append(f"edge: unknown endpoint {endp!r}")

    # coverage: every section with its own prose is anchored or deliberately empty
    prose = has_own_prose(raw, ranges, heads)
    declared_empty = {x["section"]: x["why"] for x in ex.get("empty_sections", [])}
    top_title = heads[0][0] if heads else None
    for sec in prose:
        if sec == top_title:
            continue                      # the H1's front-matter block is the doc's own metadata
        if sec not in anchored_sections and sec not in declared_empty:
            errors.append(f"coverage: section {sec!r} has prose but no anchor and no empty-entry")
    for sec, why in declared_empty.items():
        if sec in anchored_sections:
            errors.append(f"coverage: section {sec!r} is declared empty but has anchors — stale entry")
        if sec not in ranges:
            errors.append(f"coverage: empty-entry names unknown section {sec!r}")

    if errors:
        for e in errors:
            print("  ✗ " + e, file=sys.stderr)
        raise SystemExit(f"gen_universe: {len(errors)} error(s) in {path.name} — nothing written")

    ex["taxonomy"] = [{"title": t, "level": lv} for t, lv, _ in heads]
    ex["coverage"] = {
        "sections_with_prose": len([s for s in prose if s != top_title]),
        "anchored": len(anchored_sections),
        "declared_empty": [{"section": s, "why": w} for s, w in declared_empty.items()],
    }
    return ex


# ---------------------------------------------------------------- projections

def by_family(ex, fam):
    return [n for n in ex["nodes"] if n["family"] == fam]


def anchor_html(a, aid=None, small=True):
    cls = "small dim" if small else ""
    go = f' anchgo" data-aid="{aid}" title="Show these bytes in the source panel' if aid else ""
    glyph = ' <span class="uni-goglyph">&#8599;</span>' if aid else ""
    return (f'<div class="{cls}{go}" style="margin-top:.35rem">&sect; {esc(a["section"])} &middot; '
            f'bytes {a["chars"][0]:,}&ndash;{a["chars"][1]:,}{glyph}<br>'
            f'<span style="opacity:.85">&ldquo;{fmt(a["quote"])}&rdquo;</span></div>')


def doc_body(ex, for_print=False):
    """The per-document page body: the four projections plus coverage, all from one file."""
    d = ex["doc"]
    concepts = by_family(ex, "concept")
    claims = by_family(ex, "claim")
    hyps = by_family(ex, "hypothesis")
    objs = by_family(ex, "objective")
    exs = by_family(ex, "example")
    label = {n["id"]: n["label"] for n in ex["nodes"]}
    h = []

    h.append('<h2 id="method">How to read this page</h2>')
    h.append('<p>This is <b>layer 1</b> of the universe: one document\'s local graph. Every entry below is a record that <em>this document says something, at a named anchor</em>. Whether what it says is true is not judged here; that judgement belongs to the book\'s universe, which will connect to these nodes. The four views are projections of <a href="docs/' + esc(d["slug"]) + '/extraction.json">one extraction file</a>, so they cannot disagree with each other, and the build refuses to ship if any quoted anchor is not found verbatim in the frozen source, so nothing below can cite words that are not there.</p>')

    # 1 · dictionary
    h.append('<h2 id="dictionary">1 &middot; The dictionary: the document\'s own vocabulary</h2>')
    h.append(f'<p>{sum(1 for c in concepts if c["defined"])} terms the document defines in its own words, and {sum(1 for c in concepts if not c["defined"])} it uses without defining. An undefined term is recorded, not skipped: a named absence is worth more than a hidden one.</p>')
    h.append('<div class="tablewrap"><table><thead><tr><th>Term</th><th>Defined?</th><th>The document\'s words, anchored</th></tr></thead><tbody>')
    for c in sorted(concepts, key=lambda x: (not x["defined"], x["label"])):
        state = '<span class="rstate rs-applied">defined</span>' if c["defined"] else '<span class="rstate rs-open">used, never defined</span>'
        h.append(f'<tr id="n-{c["id"]}"><td><b>{esc(c["label"])}</b><div class="small dim">{esc(c["statement"])}</div></td>'
                 f'<td>{state}</td><td>{anchor_html(c["anchor"], aid=c["id"])}</td></tr>')
    h.append('</tbody></table></div>')

    # 2 · claims
    h.append('<h2 id="claims">2 &middot; The claims, by how the document supports them</h2>')
    counts = {}
    for c in claims:
        counts[c["support"]] = counts.get(c["support"], 0) + 1
    h.append(f'<p>{len(claims)} claims. <b>demonstrated</b> means the document backs the claim with a worked example in its own text ({counts.get("demonstrated",0)}); <b>argued</b> means reasoning is given ({counts.get("argued",0)}); <b>declared</b> means stated without support ({counts.get("declared",0)}). This is the document\'s own evidence state, which is not the same thing as being right.</p>')
    h.append('<div class="tablewrap"><table><thead><tr><th>Claim</th><th>Support</th><th>About</th><th>Anchor</th></tr></thead><tbody>')
    order = {"demonstrated": 0, "argued": 1, "declared": 2}
    for c in sorted(claims, key=lambda x: order[x["support"]]):
        cls = {"demonstrated": "rs-applied", "argued": "rs-discussing", "declared": "rs-open"}[c["support"]]
        about = ", ".join(f'<a href="#n-{a}">{esc(label[a])}</a>' for a in c.get("about", []))
        h.append(f'<tr id="n-{c["id"]}"><td><b>{esc(c["label"])}</b><div class="small dim">{esc(c["statement"])}</div></td>'
                 f'<td><span class="rstate {cls}">{c["support"]}</span></td>'
                 f'<td class="small">{about}</td><td>{anchor_html(c["anchor"], aid=c["id"])}</td></tr>')
    h.append('</tbody></table></div>')

    # 3 · hypotheses, objectives, examples
    h.append('<h2 id="rest">3 &middot; Hypotheses, objectives, and the document\'s own demonstrations</h2>')
    h.append('<div class="tablewrap"><table><thead><tr><th>Kind</th><th>Node</th><th>Anchor</th></tr></thead><tbody>')
    for n in hyps + objs + exs:
        extra = ""
        if n.get("demonstrates"):
            extra = '<div class="small">demonstrates: ' + ", ".join(
                f'<a href="#n-{x}">{esc(label[x])}</a>' for x in n["demonstrates"]) + "</div>"
        h.append(f'<tr id="n-{n["id"]}"><td><span class="rstate rs-discussing">{n["family"]}</span></td>'
                 f'<td><b>{esc(n["label"])}</b><div class="small dim">{esc(n["statement"])}</div>{extra}</td>'
                 f'<td>{anchor_html(n["anchor"], aid=n["id"])}</td></tr>')
    h.append('</tbody></table></div>')

    # 4 · edges
    h.append('<h2 id="edges">4 &middot; The ontology: relations the document itself asserts</h2>')
    h.append('<p>Concept-to-concept edges, each with its declared inverse per the house grammar, and each anchored to the sentence that asserts it. These are the document\'s relations, carried; the bridge layer (layer 2) will add cross-document edges as authored decisions.</p>')
    h.append('<div class="tablewrap"><table><thead><tr><th>From</th><th>Verb (inverse)</th><th>To</th><th>Anchor</th></tr></thead><tbody>')
    for i, e in enumerate(ex["edges"]):
        h.append(f'<tr id="edge-{i}"><td><a href="#n-{e["from"]}">{esc(label[e["from"]])}</a></td>'
                 f'<td><code>{e["verb"]}</code> <span class="small dim">({e["inverse"]})</span></td>'
                 f'<td><a href="#n-{e["to"]}">{esc(label[e["to"]])}</a></td><td>{anchor_html(e["anchor"], aid=f"edge-{i}")}</td></tr>')
    h.append('</tbody></table></div>')

    # 5 · thesaurus + near-but-not
    h.append('<h2 id="thesaurus">5 &middot; The thesaurus, and the distinctions drawn on purpose</h2>')
    h.append('<div class="tablewrap"><table><thead><tr><th></th><th>Pair</th><th>Anchor</th></tr></thead><tbody>')
    for i, x in enumerate(ex["aliases"]):
        h.append(f'<tr id="alias-{i}"><td><span class="rstate rs-applied">also called</span></td>'
                 f'<td><a href="#n-{x["a"]}">{esc(label[x["a"]])}</a> &harr; <b>{esc(x["b"])}</b></td>'
                 f'<td>{anchor_html(x["anchor"], aid=f"alias-{i}")}</td></tr>')
    for i, x in enumerate(ex["near_but_not"]):
        h.append(f'<tr id="nbn-{i}"><td><span class="rstate rs-declined">near but not</span></td>'
                 f'<td><a href="#n-{x["this"]}">{esc(label[x["this"]])}</a> is <b>not</b> {esc(x["not"])}</td>'
                 f'<td>{anchor_html(x["anchor"], aid=f"nbn-{i}")}</td></tr>')
    h.append('</tbody></table></div>')

    # 6 · graph
    h.append('<h2 id="graph">6 &middot; The local graph, drawn</h2>')
    if for_print:
        h.append('<p>The graph is an interactive view: it lives in the web page\'s side panel, where clicking a node opens both the extraction row and the cited bytes in the source. A static rendering would be a decoration here; the tables above are the graph\'s content in full.</p>')
    else:
        h.append(f'<p class="small dim">Concepts are the round nodes; claims, hypotheses, objectives and examples attach to what they are about. The graph lives in the <b>side panel</b> on wide screens, so it stays visible while you follow its links: clicking a node opens both the extraction row here and the cited bytes in the source. On narrow screens it renders below. Every element on the drawing exists in the tables above with its anchor; the drawing is a compression, not an extra source. <a href="#graph"><b>Open the live graph, maximised &rarr;</b></a> &middot; <a href="{d["slug"]}.graph.html"><b>or as its own page</b></a>, the same component with no reader around it &mdash; phone-friendly.</p>')
        h.append('<div id="unigraph-inline" style="width:100%;height:560px;border:1px solid var(--line,#ccc);border-radius:8px"></div>')

    # 7 · taxonomy + coverage
    h.append('<h2 id="coverage">7 &middot; The taxonomy, and the coverage rule</h2>')
    h.append(f'<p>The document\'s own structure, with what each section yielded. The rule this build enforces: every section with prose either yields at least one anchored item or is recorded as empty with a reason. {ex["coverage"]["sections_with_prose"]} sections carry prose; {len(ex["coverage"]["declared_empty"])} are deliberately empty.</p>')
    anchored = set()
    for n in ex["nodes"]:
        anchored.add(n["anchor"]["section"])
    for e in ex["edges"]:
        anchored.add(e["anchor"]["section"])
    for x in ex["near_but_not"] + ex["aliases"]:
        anchored.add(x["anchor"]["section"])
    empty = {x["section"]: x["why"] for x in ex["coverage"]["declared_empty"]}
    h.append('<div class="tablewrap"><table><thead><tr><th>Section</th><th>Yield</th></tr></thead><tbody>')
    for t in ex["taxonomy"][1:]:
        pad = "&nbsp;" * 4 * (t["level"] - 2) if t["level"] > 2 else ""
        if t["title"] in anchored:
            n_here = sum(1 for n in ex["nodes"] if n["anchor"]["section"] == t["title"])
            e_here = sum(1 for e in ex["edges"] if e["anchor"]["section"] == t["title"])
            x_here = sum(1 for x in ex["near_but_not"] + ex["aliases"] if x["anchor"]["section"] == t["title"])
            parts = [f"{n_here} node(s)" if n_here else "", f"{e_here} edge(s)" if e_here else "",
                     f"{x_here} pairing(s)" if x_here else ""]
            y = f'<span class="rstate rs-applied">{", ".join(p for p in parts if p)}</span>'
        elif t["title"] in empty:
            y = f'<span class="rstate rs-open">empty on purpose</span> <span class="small dim">{esc(empty[t["title"]])}</span>'
        else:
            y = '<span class="small dim">structural heading</span>'
        h.append(f'<tr><td>{pad}{"&#8203;" if pad else ""}{esc(t["title"])}</td><td>{y}</td></tr>')
    h.append('</tbody></table></div>')

    return "\n".join(h)


def graph_json(ex):
    els = []
    for n in ex["nodes"]:
        els.append({"data": {"id": n["id"], "label": n["label"], "family": n["family"]}})
    for n in ex["nodes"]:
        for a in n.get("about", []):
            els.append({"data": {"source": n["id"], "target": a, "kind": "about"}})
        for a in n.get("demonstrates", []):
            els.append({"data": {"source": n["id"], "target": a, "kind": "demonstrates"}})
    for i, e in enumerate(ex["edges"]):
        els.append({"data": {"source": e["from"], "target": e["to"], "kind": "asserted", "verb": e["verb"]}})
    return els


DOC_PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title} &mdash; the universe &mdash; graphs.sgit.ai</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="https://graphs.sgit.ai/v2/universe/{slug}.html">
<meta property="og:type" content="article">
<meta property="og:site_name" content="graphs.sgit.ai">
<meta property="og:url" content="https://graphs.sgit.ai/v2/universe/{slug}.html">
<meta property="og:title" content="{title} &mdash; the local graph">
<meta property="og:description" content="{desc}">
<meta name="twitter:card" content="summary">
<link rel="stylesheet" href="../../assets/site.css">
<link rel="stylesheet" href="../../assets/universe.css">
</head>
<body>

<nav class="site"><div class="row"></div></nav>

<main class="doc uni-full">
<div class="crumb"><a href="../../index.html">graphs.sgit.ai</a> &rarr; <a href="../index.html">the second edition</a> &rarr; <a href="index.html">the universe</a> &rarr; <b>{slug}</b></div>
<h1>The local graph of <em>{title}</em></h1>
<p class="lead">{lead}</p>

<div class="docmeta">
  <span class="k">Layer</span><span class="v">1 &middot; per-document local graph &middot; <b>the pilot</b>, 1 of {total} sources</span>
  <span class="k">Source</span><span class="v"><a href="../../{source}">{source}</a> &middot; frozen, SHA-256 <code>{sha12}&hellip;</code></span>
  <span class="k">Extraction</span><span class="v"><a href="docs/{slug}/extraction.json">docs/{slug}/extraction.json</a> &middot; authored by the agent, {extracted} &middot; every anchor build-verified against the frozen bytes</span>
  <span class="k">The folder</span><span class="v"><a href="docs/{slug}/index.html">docs/{slug}/</a> &middot; the document's standalone home: the source copy, the extraction, the cross-references &middot; portable between repositories</span>
  <span class="k">Used by</span><span class="v"><a href="docs/{slug}/index.html#crossrefs">{n_refs} known uses</a>, rated against <a href="usage-model.json">the usage model</a>: {refs_line}</span>
  <span class="k">Yield</span><span class="v">{n_concepts} concepts ({n_undefined} used-but-undefined) &middot; {n_claims} claims &middot; {n_hyp} hypotheses &middot; {n_obj} objective &middot; {n_ex} examples &middot; {n_edges} asserted edges</span>
  <span class="k">PDF</span><span class="v"><a href="{slug}.pdf">the extraction, printable</a> &middot; {pdf_pages} pages, for review with nothing else open</span>
</div>

{body}
</main>

<footer class="site"><div class="cols"></div></footer>
<script>window.UNIVERSE = {unidata};</script>
<script src="../../assets/vendor/cytoscape.min.js"></script>
<script src="../../assets/vendor/marked.min.js"></script>
<script type="module" src="../../assets/universe-view.js"></script>
<script type="module" src="../../assets/universe/universe-api.js"></script>
<script type="module" src="../../assets/universe-chat/boot.js"></script>
</body>
</html>
"""

HUB = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>The universe &mdash; graphs.sgit.ai</title>
<meta name="description" content="Layer 1 of the second edition's universe: one local graph per carried source document, every node anchored to the frozen bytes that carry it, every anchor verified on every build.">
<link rel="canonical" href="https://graphs.sgit.ai/v2/universe/index.html">
<meta property="og:type" content="website">
<meta property="og:site_name" content="graphs.sgit.ai">
<meta property="og:url" content="https://graphs.sgit.ai/v2/universe/index.html">
<meta property="og:title" content="The universe">
<meta property="og:description" content="The second edition's universe, built bottom up from the carried sources, one anchored local graph per document.">
<meta name="twitter:card" content="summary">
<link rel="stylesheet" href="../../assets/site.css">
</head>
<body>

<nav class="site"><div class="row"></div></nav>

<main class="doc">
  <div class="crumb"><a href="../../index.html">graphs.sgit.ai</a> &rarr; <a href="../index.html">the second edition</a> &rarr; <b>The universe</b></div>
  <h1>The universe, built bottom up</h1>
  <p class="lead">The second edition is written from a universe of concepts, claims and evidence, and the universe is built <b>bottom up</b>: one local graph per carried source document, each document keeping its own vocabulary, with bridges between them added later as authored decisions. Nothing here is book text. This is the material the book's own graph will connect to.</p>

  <div class="note"><b>The layer model.</b><br>
  <b>Layer 0</b> &middot; the frozen bytes: the {total} carried sources under <code>/v1/docs/sources/</code>, each hashed in the freeze manifest, so an anchor into one is stable forever.<br>
  <b>Layer 1</b> &middot; per-document local graphs, this section: the document's own dictionary, claims with their support state, hypotheses, objectives, demonstrations and asserted relations, every one anchored to a verbatim quote. <b>The build refuses to ship an anchor whose quote is not found in the frozen bytes</b>, so extraction cannot cite words that are not there. Every layer 1 node means only: <em>this document says this, here</em>.<br>
  <b>Layer 2</b> &middot; the bridge layer, not started: cross-document edges, authored with a note, recording where documents name the same idea differently and where they disagree. Divergence is preserved as a finding, never merged away.<br>
  <b>Layer 3</b> &middot; the book's universe, not started: the six node families of the dev pack's ADR-3, connecting down into layers 1 and 2 as evidence.</div>

  <h2 id="sources">The sources, and where extraction stands</h2>
  <div class="tablewrap">
  <table>
    <thead><tr><th>Document</th><th>State</th><th>Yield</th></tr></thead>
    <tbody>
{rows}
      <tr><td class="dim">the other {remaining} carried sources</td><td><span class="rstate rs-open">queued</span></td><td class="small dim">the pilot settles the method first; each will get the same treatment</td></tr>
    </tbody>
  </table>
  </div>

  <h2 id="nodedoc">The document of one node</h2>
  <p>The experiment of brief 24, programmatic phase: pick a node and read <a href="node-doc.html">the document that grows from it</a> &mdash; everything the anchored extraction verifiably holds about that one concept, composed in document structure with no authored prose. The picker ranks every node by how many links it carries, which makes the richness of each concept measurable before any writing happens.</p>

  <h2 id="rules">The rules this section holds itself to</h2>
  <ul>
    <li><b>One extraction file per document</b>, and the dictionary, taxonomy, thesaurus and ontology views are projections of it. Four authored artefacts per document would be four things that can disagree; one file with four views cannot.</li>
    <li><b>Every node is anchored</b> to a verbatim quote in a named section, and the build verifies the quote against the frozen bytes on every release. A hallucinated quote fails the build; a misread of a real quote is what review is for.</li>
    <li><b>Coverage is total by construction</b>: every section with prose either yields anchored items or is recorded as deliberately empty with a reason. A recorded empty section is a finding; a silent one is a hole.</li>
    <li><b>Truth is deferred.</b> Layer 1 records what a document says, including its own evidence state (demonstrated, argued, declared). Whether it is right is layer 3's question.</li>
    <li><b>The extractor is an author too.</b> The extraction is the agent's reading, marked as such, and it ships with the anchors a reviewer needs to check it. Undefined-but-used terms are recorded as named absences.</li>
  </ul>

  <div class="agent">
    <h4>For an agent</h4>
    <p>The machine surface is <a href="data/universe.json">data/universe.json</a>: every node, edge, alias and distinction, with resolved byte offsets into the frozen sources and the SHA-256 each anchor was verified against. Each document's standalone folder under <code>docs/</code> holds its source copy, its extraction and its cross-references (<code>crossrefs.json</code>, rated against <code>usage-model.json</code>). Treat a layer 1 node as a statement about a document, never as a statement about the world. If you are reviewing an extraction, use its PDF and read nothing else; come back item by item against the node ids. If you are building or changing anything interactive, first read <a href="../dev-pack/design-00-the-victor-register.html">the immediate-connection register</a>: it names the experience these viewers are built towards, maps which patterns already exist, and carries the checklist a change should pass.</p>
  </div>
</main>

<footer class="site"><div class="cols"></div></footer>
</body>
</html>
"""

GRAPH_PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title} &mdash; the graph &mdash; graphs.sgit.ai</title>
<meta name="description" content="The local graph of {title}, standalone: the same reusable component the reader embeds, with no reader around it. Phone-friendly.">
<link rel="canonical" href="https://graphs.sgit.ai/v2/universe/{slug}.graph.html">
<meta property="og:type" content="website">
<meta property="og:site_name" content="graphs.sgit.ai">
<meta property="og:url" content="https://graphs.sgit.ai/v2/universe/{slug}.graph.html">
<meta property="og:title" content="{title} &mdash; the graph">
<meta property="og:description" content="The local graph, standalone and full-viewport.">
<meta name="twitter:card" content="summary">
<link rel="stylesheet" href="../../assets/site.css">
<link rel="stylesheet" href="../../assets/universe.css">
</head>
<body>
<noscript><p style="padding:1rem">The graph is interactive and needs JavaScript &mdash; <a href="{slug}.html">the reader page</a> carries the same content as tables.</p></noscript>
<script>window.UNIVERSE = {unidata};</script>
<script src="../../assets/vendor/cytoscape.min.js"></script>
<script type="module" src="../../assets/universe-graph.js"></script>
</body>
</html>
"""

NODEDOC_PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>The document of one node &mdash; graphs.sgit.ai</title>
<meta name="description" content="Brief 24's experiment, programmatic phase: pick a node and read the document that grows from it — everything the anchored extraction verifiably holds about one concept, with no authored prose.">
<link rel="canonical" href="https://graphs.sgit.ai/v2/universe/node-doc.html">
<meta property="og:type" content="article">
<meta property="og:site_name" content="graphs.sgit.ai">
<meta property="og:url" content="https://graphs.sgit.ai/v2/universe/node-doc.html">
<meta property="og:title" content="The document of one node">
<meta property="og:description" content="Everything the anchored extraction verifiably holds about one concept, composed as a document.">
<meta name="twitter:card" content="summary">
<link rel="stylesheet" href="../../assets/site.css">
<link rel="stylesheet" href="../../assets/universe.css">
</head>
<body>

<nav class="site"><div class="row"></div></nav>

<main class="doc">
  <div class="crumb"><a href="../../index.html">graphs.sgit.ai</a> &rarr; <a href="../index.html">the second edition</a> &rarr; <a href="index.html">the universe</a> &rarr; <b>the document of one node</b></div>
  <h1>The document of one node</h1>
  <div id="ndoc"><p class="dim">Loading the extraction&hellip;</p></div>
  <div class="note"><b>What this is.</b> The experiment of brief 24, programmatic phase: the page assembles only what the anchored extraction and the cross-reference ledger verifiably hold about the chosen node. The connecting prose is deliberately absent; writing it, layer by layer up to a mini book per node, is the later phase. The composition is the pure module <code>assets/universe/core/nodedoc.js</code>; this page is one thin view over the same data the reader projects.</div>
</main>

<footer class="site"><div class="cols"></div></footer>
<script type="module" src="../../assets/universe/nodedoc-page.js"></script>
</body>
</html>
"""

PRINT_PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{title} — the extraction</title>
<link rel="stylesheet" href="../../assets/site.css">
<link rel="stylesheet" href="../../assets/pack.css">
</head>
<body class="pack">
<section class="packcover">
  <p class="small">graphs.sgit.ai &middot; the universe &middot; layer 1 &middot; {version}</p>
  <h1>The local graph of<br><em>{title}</em></h1>
  <p class="lead">{lead}</p>
  <h2 class="packsec" style="page-break-before:auto">Provenance</h2>
  <p>Source: <code>{source}</code>, frozen at v0.3.26, SHA-256 <code>{sha}</code>. Extraction authored {extracted} by the agent; every quoted anchor below was verified against the frozen bytes when this PDF was generated at {version}. This is not the book, and it is not the truth of what the document claims: it is the record of what the document says, anchored.</p>
  <p><b>If you are reviewing:</b> read this and nothing else. For each item, the question is the same: is this what the document says, and is the anchor fair? Come back item by item, by node id. Items you do not mention are taken as agreed.</p>
</section>
{body}
</body>
</html>
"""


FOLDER_PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{slug} &mdash; the document folder &mdash; graphs.sgit.ai</title>
<meta name="description" content="The standalone folder for one source document: its byte copy of the frozen source, its extraction, and its cross-references rated against the usage maturity model. Portable between repositories.">
<link rel="canonical" href="https://graphs.sgit.ai/v2/universe/docs/{slug}/index.html">
<meta property="og:type" content="article">
<meta property="og:site_name" content="graphs.sgit.ai">
<meta property="og:url" content="https://graphs.sgit.ai/v2/universe/docs/{slug}/index.html">
<meta property="og:title" content="{slug}: the document folder">
<meta property="og:description" content="Everything the estate holds about one source document, in one portable folder.">
<meta name="twitter:card" content="summary">
<link rel="stylesheet" href="../../../../assets/site.css">
</head>
<body>

<nav class="site"><div class="row"></div></nav>

<main class="doc">
  <div class="crumb"><a href="../../../../index.html">graphs.sgit.ai</a> &rarr; <a href="../../../index.html">the second edition</a> &rarr; <a href="../../index.html">the universe</a> &rarr; <a href="../../{slug}.html">{slug}</a> &rarr; <b>the folder</b></div>
  <h1>The document folder: <em>{title}</em></h1>
  <p class="lead">Everything this estate holds about one source document, in one standalone folder that can be moved or copied between repositories without losing anything. The reader over it is at <a href="../../{slug}.html">the document page</a>; these files are the sources of truth it projects.</p>

  <h2 id="files">The files</h2>
  <div class="tablewrap">
  <table>
    <thead><tr><th>File</th><th>What it is</th><th>Integrity</th></tr></thead>
    <tbody>
{file_rows}
    </tbody>
  </table>
  </div>

  <h2 id="crossrefs">Where this document is used, and how well</h2>
  <p>{cr_note}</p>
  <div class="tablewrap">
  <table>
    <thead><tr><th>Use</th><th>Of</th><th>How</th><th>Rating</th><th>Judgement</th></tr></thead>
    <tbody>
{cr_rows}
    </tbody>
  </table>
  </div>

  <h2 id="model">The usage maturity model</h2>
  <p>{model_principle}</p>
  <div class="tablewrap">
  <table>
    <thead><tr><th>Level</th><th>Meaning</th><th>The test</th></tr></thead>
    <tbody>
{model_rows}
    </tbody>
  </table>
  </div>

  <div class="agent">
    <h4>For an agent</h4>
    <p>This folder is self-contained: <code>source.md</code> is a build-verified byte copy of the frozen original, <code>extraction.json</code> is the layer 1 local graph with gate-verified anchors, and <code>crossrefs.json</code> records the known uses of this document with a signed, dated rating against <code>../../usage-model.json</code>. If you use this document's material anywhere, the honest move is to add a crossref entry for your use, rated unrated, so the document's steward can judge it. A rating judges the use, never the user.</p>
  </div>
</main>

<footer class="site"><div class="cols"></div></footer>
</body>
</html>
"""


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    DATA.mkdir(exist_ok=True)
    rows = []
    published = {"version": VERSION, "layer": 1, "sources": []}
    for folder in sorted(d for d in DOCS.iterdir() if d.is_dir()):
        ex = load_and_verify(folder)
        d = ex["doc"]
        concepts = by_family(ex, "concept")
        stats = dict(
            n_concepts=len(concepts),
            n_undefined=sum(1 for c in concepts if not c["defined"]),
            n_claims=len(by_family(ex, "claim")),
            n_hyp=len(by_family(ex, "hypothesis")),
            n_obj=len(by_family(ex, "objective")),
            n_ex=len(by_family(ex, "example")),
            n_edges=len(ex["edges"]),
        )
        crs = ex["_crossrefs"]["refs"]
        model = ex["_model"]
        by_rating = {}
        for r in crs:
            by_rating[r["rating"]] = by_rating.get(r["rating"], 0) + 1
        refs_line = " &middot; ".join(f'{v} {k}' for k, v in sorted(by_rating.items())) or "none recorded yet"
        stats["n_refs"] = len(crs)

        lead = (f'What one document actually says, as a graph: {stats["n_concepts"]} concepts in its own words, '
                f'{stats["n_claims"]} claims each carrying how the document supports them, '
                f'{stats["n_hyp"]} hypotheses, {stats["n_ex"]} worked demonstrations and {stats["n_edges"]} asserted relations, '
                f'every one anchored to the exact bytes that carry it.')
        desc = (f'The per-document local graph of {d["title"]}: dictionary, claims with support states, '
                f'hypotheses, demonstrations and asserted edges, every node anchored to the frozen source and build-verified.')
        body = doc_body(ex)

        # PDF first (chrome-free print form), so the page can state its page count
        pdf = OUT / f'{d["slug"]}.pdf'
        import weasyprint
        weasyprint.HTML(string=PRINT_PAGE.format(
            title=esc(d["title"]), lead=esc(lead), source=d["source"], sha=d["sha256"],
            extracted=d["extracted"], version=VERSION, body=doc_body(ex, for_print=True)),
            base_url=str(OUT) + "/").write_pdf(str(pdf))
        pages = pdf_page_count(pdf)

        # the reader's data: every anchor with the row it belongs to, so the panel's
        # highlights are driven by the same offsets gate 23 verifies
        anchors = []
        for n in ex["nodes"]:
            anchors.append({"aid": n["id"], "row": f'n-{n["id"]}', "kind": n["family"],
                            "section": n["anchor"]["section"],
                            "chars": n["anchor"]["chars"], "label": n["label"]})
        for i, e in enumerate(ex["edges"]):
            anchors.append({"aid": f"edge-{i}", "row": f"edge-{i}", "kind": "edge",
                            "chars": e["anchor"]["chars"],
                            "label": f'{e["from"]} {e["verb"]} {e["to"]}'})
        for i, x in enumerate(ex["near_but_not"]):
            anchors.append({"aid": f"nbn-{i}", "row": f"nbn-{i}", "kind": "nbn",
                            "chars": x["anchor"]["chars"],
                            "label": f'{x["this"]} is not {x["not"]}'})
        for i, x in enumerate(ex["aliases"]):
            anchors.append({"aid": f"alias-{i}", "row": f"alias-{i}", "kind": "alias",
                            "chars": x["anchor"]["chars"],
                            "label": f'{x["a"]} is also called {x["b"]}'})
        unidata = json.dumps({"slug": d["slug"], "title": d["title"],
                              "source": "../../" + d["source"],
                              "sha256": d["sha256"], "anchors": anchors,
                              "taxonomy": ex["taxonomy"],
                              "extraction": f'docs/{d["slug"]}/extraction.json',
                              "folder": f'docs/{d["slug"]}/',
                              "verbs": ALL_INVERSES,
                              "elements": graph_json(ex)})

        (OUT / f'{d["slug"]}.html').write_text(DOC_PAGE.format(
            title=esc(d["title"]), slug=d["slug"], desc=esc(desc), lead=lead,
            source=d["source"], sha12=d["sha256"][:12], extracted=d["extracted"],
            total=TOTAL_SOURCES, body=body, pdf_pages=pages or "?",
            unidata=unidata, refs_line=refs_line,
            **stats))

        # the standalone graph page: the same component, no reader around it
        (OUT / f'{d["slug"]}.graph.html').write_text(GRAPH_PAGE.format(
            title=esc(d["title"]), slug=d["slug"], unidata=unidata))

        # the folder page: files with their integrity, the crossrefs, the model
        label = {n["id"]: n["label"] for n in ex["nodes"]}
        file_rows = []
        for fname, what, integ in [
            ("source.md", "A byte copy of the frozen source, so the folder stands alone.",
             f'verified equal to <code>{d["source"]}</code> &middot; SHA-256 <code>{d["sha256"][:16]}&hellip;</code>'),
            ("extraction.json", "The layer 1 local graph: dictionary, claims, hypotheses, demonstrations, relations, every one anchored.",
             "every anchor verified against the frozen bytes on every build (gate 23)"),
            ("crossrefs.json", "The known uses of this document across the estate, each rated against the usage model.",
             "ratings, paths and named concepts validated on every build"),
            ("README.md", "What this folder is, for a reader who finds it outside this repository.", "&mdash;"),
        ]:
            fp = folder / fname
            size = f"{fp.stat().st_size:,} bytes" if fp.exists() else "missing"
            file_rows.append(f'      <tr><td><a href="{fname}"><code>{fname}</code></a><div class="small dim">{size}</div></td>'
                             f'<td>{what}</td><td class="small dim">{integ}</td></tr>')
        cr_rows = []
        rcls = {"aligned": "rs-applied", "stretched": "rs-discussing", "misaligned": "rs-declined", "unrated": "rs-open"}
        for r in crs:
            where = (f'<a href="{r["where"]}">{esc(r["where"])}</a>' if r["where"].startswith("http")
                     else f'<a href="../../../../{r["where"]}">{esc(r["where"])}</a>')
            what_l = ", ".join(
                f'<a href="../../{d["slug"]}.html#n-{c}">{esc(label[c])}</a>' for c in r.get("what", []))
            sup = f'<div class="small dim">superseded: {esc(r["superseded"])}</div>' if r.get("superseded") else ""
            cr_rows.append(
                f'      <tr id="cr-{r["id"]}"><td>{where}{sup}</td><td class="small">{what_l}</td>'
                f'<td class="small">{r["how"]}</td>'
                f'<td><span class="rstate {rcls.get(r["rating"], "rs-open")}">{r["rating"]}</span></td>'
                f'<td class="small dim">{esc(r["note"])}<div>{esc(r["rated_by"])} &middot; {esc(r["rated"])}</div></td></tr>')
        model_rows = []
        for lv in model["levels"]:
            model_rows.append(f'      <tr><td><span class="rstate {rcls.get(lv["id"], "rs-open")}">{esc(lv["label"])}</span></td>'
                              f'<td>{esc(lv["meaning"])}</td><td class="small dim">{esc(lv["test"])}</td></tr>')
        (folder / "index.html").write_text(FOLDER_PAGE.format(
            slug=d["slug"], title=esc(d["title"]), file_rows="\n".join(file_rows),
            cr_note=esc(ex["_crossrefs"].get("note", "")), cr_rows="\n".join(cr_rows),
            model_principle=esc(model["principle"]), model_rows="\n".join(model_rows)))

        rows.append(
            f'      <tr><td><a href="{d["slug"]}.html"><b>{esc(d["title"])}</b></a>'
            f'<div class="small dim">dated {d["dated"]} &middot; the cornerstone; the book\'s subtitle is this document\'s subtitle</div></td>'
            f'<td><span class="rstate rs-applied">extracted &middot; pilot</span></td>'
            f'<td class="small">{stats["n_concepts"]} concepts &middot; {stats["n_claims"]} claims &middot; '
            f'{stats["n_edges"]} edges &middot; {stats["n_refs"]} known uses &middot; '
            f'<a href="docs/{d["slug"]}/index.html">the folder</a> &middot; '
            f'<a href="{d["slug"]}.pdf">PDF, {pages}pp</a></td></tr>')

        published["sources"].append({**{k: d[k] for k in ("slug", "title", "source", "sha256", "dated", "extracted")},
                                     **stats, "pdf_pages": pages,
                                     "folder": f'v2/universe/docs/{d["slug"]}',
                                     "source_copy_sha256": hashlib.sha256((folder / "source.md").read_bytes()).hexdigest(),
                                     "crossrefs": crs,
                                     "nodes": ex["nodes"], "edges": ex["edges"],
                                     "near_but_not": ex["near_but_not"], "aliases": ex["aliases"],
                                     "taxonomy": ex["taxonomy"], "coverage": ex["coverage"]})
        print(f'gen_universe: {d["slug"]} — {len(ex["nodes"])} nodes, {len(ex["edges"])} edges, '
              f'all anchors verified against {d["sha256"][:12]}…, PDF {pages}pp')

    (OUT / "index.html").write_text(HUB.format(rows="\n".join(rows), total=TOTAL_SOURCES,
                                               remaining=TOTAL_SOURCES - len(rows)))
    (OUT / "node-doc.html").write_text(NODEDOC_PAGE)
    (DATA / "universe.json").write_text(json.dumps(published, indent=1, ensure_ascii=False) + "\n")
    print(f'gen_universe: {len(rows)} of {TOTAL_SOURCES} source(s) extracted, hub and data written')


if __name__ == "__main__":
    main()
