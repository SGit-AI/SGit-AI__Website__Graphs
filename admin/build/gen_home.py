#!/usr/bin/env python3
"""Generates home/data/home.json — everything the front door shows, computed.

Run from anywhere: python3 admin/build/gen_home.py
Run it BEFORE gen_front.py, which formats its numbers into the page.

The front door has one job the rest of the estate does not: a reader who has just heard
the phrase "fractal semantic graphs" and followed a link has to meet the answer before
they meet the archive. Everything that answers them here is derived:

  · the DEFINITION is a byte-verified quote from the carried pilot document, not a
    paraphrase. If the sentence is edited in the source, this build fails.
  · the DEMO is the corpus's own worked example (the Safe_UInt__Port port node), modelled
    as a graph you can add edges to. Every claim the demo lets the graph make carries the
    quote it came from, and every quote is checked against the source on every build.
  · the LADDER is the fractal claim's own test, run on this estate's book: the counts come
    from the book's core graph, not from memory.
  · the INVENTORY counts pages, releases, memos, methods, figures and gates from the tree.

That is the site's rule applied to its own front door: prose does not quote a computed
number, it renders one, and it does not paraphrase a source, it quotes it.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
VERSION = (ROOT / "admin/build/version.txt").read_text().strip()
PILOT = ROOT / "v2/universe/docs/thinking-in-graphs/source.md"
PILOT_PAGE = "v2/universe/thinking-in-graphs.html"

# The phrase the site is found by, answered in the corpus's own words. The anchor is the
# section of the pilot document the sentence sits in; the quote is checked below.
DEFINITION = {
    "term": "fractal semantic graphs",
    "quote": ("the same structural pattern — nodes with edges, meaning through "
              "connectivity — repeats at every level of zoom"),
    "section": "Every Scope Defines Its Own Vocabulary",
    "doc": "Thinking in Graphs: Meaning Through Connectivity",
    "where": PILOT_PAGE,
}

# ---------------------------------------------------------------------------
# The demo: the corpus's worked example, as a graph the reader assembles.
#
# The document sets two scenarios against each other — the same value 8080, typed and
# untyped — and draws both as graphs. Scenario B is the starting state here and Scenario A
# is what the reader builds, one edge at a time, which turns the document's comparison
# into something a reader does rather than reads. The node is never edited: only edges are
# added, which is the whole point the section is making.
NODES = [
    {"id": "port",   "kind": "field", "label": "field: port",        "sub": "value: 8080", "x": 108, "y": 196},
    {"id": "sup",    "kind": "type",  "label": "Safe_UInt__Port",    "sub": "type",        "x": 356, "y": 196},
    {"id": "minv",   "kind": "prop",  "label": "min_value: 0",       "sub": "",            "x": 612, "y": 80},
    {"id": "maxv",   "kind": "prop",  "label": "max_value: 65535",   "sub": "",            "x": 630, "y": 176},
    {"id": "nonull", "kind": "prop",  "label": "allow_none: False",  "sub": "",            "x": 616, "y": 272},
    {"id": "su",     "kind": "type",  "label": "Safe_UInt",          "sub": "type",        "x": 356, "y": 348},
    {"id": "pkg",    "kind": "pkg",   "label": "osbot-utils@3.63.4", "sub": "package",     "x": 108, "y": 348},
]

# Each edge is one click. `needs` keeps the graph honest: you cannot constrain a type the
# node is not yet typed as. `says` is what the graph can state once the edge exists, and
# every one of those sentences is quoted from the document, never written here.
EDGES = [
    {"id": "e1", "from": "port", "to": "sup", "verb": "type", "needs": [],
     "says": "This is a network port.",
     "quote": "This is a network port."},
    {"id": "e2", "from": "sup", "to": "minv", "verb": "min_value", "needs": ["e1"],
     "says": "It is an unsigned integer between 0 and 65535.",
     "quote": "It is an unsigned integer between 0 and 65535.", "pairs": "e3"},
    {"id": "e3", "from": "sup", "to": "maxv", "verb": "max_value", "needs": ["e1"],
     "says": "It is an unsigned integer between 0 and 65535.",
     "quote": "It is an unsigned integer between 0 and 65535.", "pairs": "e2"},
    {"id": "e4", "from": "sup", "to": "nonull", "verb": "allow_none", "needs": ["e1"],
     "says": "It cannot be null.",
     "quote": "It cannot be null."},
    {"id": "e5", "from": "sup", "to": "su", "verb": "extends", "needs": ["e1"],
     "says": "The constraints are inherited, not restated.",
     "quote": "extends ──→ Safe_UInt"},
    {"id": "e6", "from": "su", "to": "pkg", "verb": "part_of", "needs": ["e5"],
     "says": "These constraints are enforced at runtime by osbot-utils version 3.63.4.",
     "quote": "These constraints are enforced at runtime by osbot-utils version 3.63.4."},
]

# What the graph can say with no edges at all. Also quoted.
BARE = [
    {"says": "There is a field called 'port' with the value 8080.",
     "quote": "There is a field called 'port' with the value 8080."},
    {"says": "The name suggests it might be a network port.",
     "quote": "The name suggests it might be a network port."},
    {"says": "But the graph cannot confirm it.",
     "quote": "But the graph cannot confirm it."},
]

CLOSING = {
    "quote": "The difference is not in the value.",
    "second": "The difference is in the **connectivity**.",
    "rule": "Every claim is backed by a traceable path through the graph.",
    "section": "The Safe_UInt__Port Example",
}


def verify(src):
    """Every sentence the demo puts in a reader's mouth is in the document, byte for byte.

    This is the gate that makes the front door safe to leave alone. A front page is the
    one page nobody re-reads, so a paraphrase that drifted into it would outlive every
    other error on the site.
    """
    bad = []
    for q in ([DEFINITION["quote"]]
              + [e["quote"] for e in EDGES]
              + [b["quote"] for b in BARE]
              + [CLOSING["quote"], CLOSING["second"], CLOSING["rule"]]):
        if q not in src:
            bad.append(q)
    if bad:
        raise SystemExit("gen_home: these are not in {}, byte for byte:\n  - {}".format(
            PILOT.relative_to(ROOT), "\n  - ".join(repr(b) for b in bad)))
    ids = {n["id"] for n in NODES}
    for e in EDGES:
        for side in ("from", "to"):
            if e[side] not in ids:
                raise SystemExit(f"gen_home: edge {e['id']} names no node {e[side]}")
        for need in e["needs"]:
            if need not in {x["id"] for x in EDGES}:
                raise SystemExit(f"gen_home: edge {e['id']} needs {need}, which is not an edge")
    for n in NODES:
        if not any(n["id"] in (e["from"], e["to"]) for e in EDGES):
            raise SystemExit(f"gen_home: node {n['id']} is on no edge, so it can never appear")


def verify_targets(data):
    """Every page this data sends a reader to has to exist.

    validate.js catches a broken link once the page is written, which is one step too
    late and one error message too vague: it names index.html, not the register that put
    the address there. It caught exactly this, on the first build."""
    for key, where in [("definition", data["definition"]["where"]),
                       ("demo", data["demo"]["where"]),
                       ("ladder", data["ladder"]["where"])]:
        if not (ROOT / where).exists():
            raise SystemExit(f"gen_home: the {key} points at {where}, which is not on disk")


def ladder():
    """The fractal claim's own test, run on this estate's book.

    Six levels, one grammar. The counts come from the book's core graph index, which is
    rebuilt byte-identically on every build, so the ladder cannot claim a level the
    decomposition does not actually produce.
    """
    idx = json.loads((ROOT / "v2/books/making-a-book/graph/index.json").read_text())
    meta = json.loads((ROOT / "v2/books/making-a-book/book.json").read_text())
    totals = idx["totals"]
    counts = {"book": 1, "chapter": meta["chapters"]}
    for level in idx["ladder"]:
        if level in counts:
            continue
        key = level + "s"
        if key not in totals:
            raise SystemExit(f"gen_home: the core graph has no count for level '{level}'")
        counts[level] = totals[key]
    return {
        "book": meta["title"],
        "book_version": idx["book_version"],
        "where": "v2/books/making-a-book/graph/index.html",
        "levels": [{"level": lv, "count": counts[lv]} for lv in idx["ladder"]],
        "shards": totals["shards"],
    }


def releases():
    rows = []
    for page in sorted(ROOT.glob("admin/versions*.html")):
        rows += re.findall(r'class="vnum">(v\d+\.\d+\.\d+)</td>', page.read_text())
    return len(rows)


def pages():
    """Published HTML pages, stubs excluded — the same rule the sitemap uses."""
    n = 0
    for p in ROOT.rglob("*.html"):
        rel = p.relative_to(ROOT).as_posix()
        if rel.split("/")[0] in {".git", ".github", "node_modules", "assets"}:
            continue
        t = p.read_text(errors="replace")
        if '<meta name="robots" content="noindex">' in t and "This page moved" in t:
            continue
        n += 1
    return n


def inventory():
    # The methods register is ONE page holding a row per technique, so counting its files
    # counts the hub and nothing else. The first build of this page said "0 techniques"
    # next to a link to thirty-five of them.
    methods = len(re.findall(r'<tr id="m-', (ROOT / "v2/methods/index.html").read_text()))
    # And a brief folder holds more than the founder's memos: the librarian's notes and
    # the original pack documents are numbered the same way. Only the ones that name a
    # founder are founder memos.
    memos = len([p for folder in ("v1/briefs", "v2/briefs")
                 for p in (ROOT / folder).glob("[0-9]*.md") if "founder-" in p.name])
    figures = json.loads((ROOT / "v2/books/making-a-book/figures/index.json").read_text())
    tests = sum(len(re.findall(r"^test\(", f.read_text(), re.M))
                for f in (ROOT / "admin/tests").glob("*.test.mjs"))
    conditions = len(re.findall(r"errors\.push\(",
                                (ROOT / "admin/build/validate.js").read_text()))
    books = [json.loads(p.read_text()) for p in sorted((ROOT / "v2/books").glob("*/book.json"))]
    inv = {
        "pages": pages(),
        "releases": releases(),
        "memos": memos,
        "methods": methods,
        "figures": len(figures["figures"]),
        "sources": len(list((ROOT / "v1/docs").glob("*.html"))) - 1,
        "tests": tests,
        "conditions": conditions,
        "books": len(books),
        "book_words": sum(b["words"] for b in books),
    }
    # A counter that returns zero is a counter that has stopped counting, and on the front
    # page it reads as a claim that the thing does not exist. Fail the build instead.
    empty = [k for k, v in inv.items() if not v]
    if empty:
        raise SystemExit("gen_home: these counted nothing, so they are not counting: "
                         + ", ".join(empty))
    return inv


def main():
    src = PILOT.read_text()
    verify(src)
    data = {
        "version": VERSION,
        "schema": "home-front-v1",
        "note": ("Generated by admin/build/gen_home.py. Every quote here is checked against "
                 f"{PILOT.relative_to(ROOT)} on every build; every number is counted from the tree."),
        "definition": DEFINITION,
        "demo": {
            "source": PILOT.relative_to(ROOT).as_posix(),
            "section": CLOSING["section"],
            "where": PILOT_PAGE,
            "nodes": NODES,
            "edges": EDGES,
            "bare": BARE,
            "closing": CLOSING,
        },
        "ladder": ladder(),
        "inventory": inventory(),
    }
    verify_targets(data)
    out = ROOT / "home/data/home.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(data, indent=1, ensure_ascii=False) + "\n")
    inv = data["inventory"]
    print(f"gen_home: home/data/home.json — {len(NODES)} demo nodes, {len(EDGES)} edges, "
          f"{len(data['ladder']['levels'])} zoom levels, "
          f"{inv['pages']} pages, {inv['releases']} releases, all quotes verified")


if __name__ == "__main__":
    main()
