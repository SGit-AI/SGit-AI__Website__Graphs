#!/usr/bin/env python3
"""The publishing surface for the v2 books (brief 39): covers, metadata sheets,
sample PDFs and landing pages, all from one authored register.

Run from anywhere: python3 admin/build/gen_bookpub.py   (after gen_bookmeta.py)

One source of words. The store description, the hook, the licence line and the author
line are written ONCE in the REGISTER below and projected into every surface — the
metadata sheet the founder pastes into Leanpub, the landing page on this site, and the
cover itself. The store page and the site therefore cannot drift apart, which is the same
discipline every other generator here follows.

The cover is drawn, not decorated. Each one carries a true subgraph in the book's own
vocabulary, every arrow reading as its sentence — the rule the first book's cover
established and this one keeps. SVG is the source; the PNG Leanpub wants (1600 x 2400) is
photographed from it by the estate's own headless Chromium harness.

The sample PDF is CUT from the real book rather than rebuilt, so what a reader samples is
exactly what a reader buys, down to the typesetting. The cut lands at the start of chapter
two, found in the PDF's own outline.
"""
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BOOKS = ROOT / "v2" / "books"
SHELLS = Path(tempfile.gettempdir()) / "graphs-cover-shells"
SHELLS.mkdir(exist_ok=True)
SITE_VERSION = (ROOT / "admin" / "build" / "version.txt").read_text().strip()
AUTHOR = "Dinis Cruz"
LICENCE = "CC BY 4.0 — the text is free to share and adapt with attribution."

# ---- the authored half: the words, written once ---------------------------------
REGISTER = {
    "fsg": {
        "subtitle": "The second edition",
        "hook": "A node connected to nothing is literally meaningless. This book is what "
                "follows from taking that seriously.",
        "description": (
            "Two variables both hold 8080. One reaches a type, a library and a pinned "
            "version; the other reaches nothing. The difference is not in the value, it "
            "is in the connectivity — and once you accept that, a great deal follows.\n\n"
            "This book argues that meaning lives in edges rather than in labels, and then "
            "shows the argument running. It sets out a grammar where every edge is a verb "
            "with a distinct inverse and the generic association edge is banned; it "
            "explains why schema-first breaks at every boundary and what to do instead "
            "(bridge vocabularies through anchor nodes rather than merging them, which "
            "erases the disagreement); it makes confidence computable and honest "
            "uncertainty the default; and it follows the fractal principle down through "
            "every altitude, where the same grammar holds at every level of zoom.\n\n"
            "What separates this edition from the first is that the argument is no longer "
            "only argued. It is demonstrated by a working estate: a document decomposed to "
            "the word with stable identities, an engine that computes meaning "
            "deterministically and shows its provenance, and registers where a human "
            "corrects what the machine proposes. Every figure in the book was taken from "
            "the running system."),
        "audience": "Engineers, architects and anyone who has watched two teams use the "
                    "same word to mean different things and had to make the systems agree.",
        "categories": ["Computer Programming", "Software Architecture", "Data Science"],
        "keywords": ["knowledge graphs", "semantics", "ontology", "software architecture",
                     "provenance", "AI"],
        "unfinished": ("This is v0.2.0, not a finished book. The argument is whole and the "
                       "evidence is real, but a review pass is running now: expect "
                       "corrections, sharper examples and new material. Buy it once and "
                       "every future version is yours."),
        "graph": {
            "caption": "the same value, differently connected",
            "lone": ("8080", "reaches nothing"),
            "nodes": {"a": ("8080", 1130, 1010), "b": ("Port", 1130, 1230),
                      "c": ("Service", 1130, 1450), "d": ("Policy", 1130, 1670)},
            "edges": [("a", "b", "backed_by"), ("b", "c", "observed_on"),
                      ("c", "d", "protected_by")],
        },
    },
    "making-a-book": {
        "subtitle": "An agentic workflow, told from the inside",
        "hook": "A voice memo in the morning, a shipped release by the afternoon, "
                "and a repository where every claim can be checked.",
        "description": (
            "This is the true story of how a book was written with an AI agent — the "
            "loop, the gates, the failures and the costs — told for authors who want to "
            "try the same thing.\n\n"
            "The loop is simple enough to copy: a voice memo becomes a brief reproduced "
            "verbatim, the brief commissions a build, the build ships the same day, and a "
            "narrated review starts the next round. What makes it work is not the model "
            "but the discipline around it: gates that fail loudly, release notes written "
            "in substance rather than as a commit log, and a rule that every claim is "
            "anchored to a source or is not made.\n\n"
            "The book is unusually checkable. It was written inside the repository it "
            "describes, so every scene can be verified at the git tag its caption names, "
            "and the screenshots of the system evolving were not re-imagined — they were "
            "re-photographed from history. The failures are told in full, including the "
            "hour lost to a zombie browser process and the bug the author caught on an "
            "iPad. It ends with a playbook that stands alone."),
        "audience": "Authors, technical writers and anyone curious about what agentic "
                    "work actually looks like when the record is kept honestly.",
        "categories": ["Computer Programming", "Writing", "Artificial Intelligence"],
        "keywords": ["AI writing", "agentic workflow", "Claude", "technical writing",
                     "publishing", "software craft"],
        "unfinished": ("This is v0.1.0, a first release. The story runs to a point and "
                       "stops honestly; the workflow it describes is still running, so "
                       "later versions will carry it further. Buy it once and every "
                       "future version is yours."),
        "graph": {
            "caption": "the loop, and it closes",
            "ring": [("memo", "becomes"), ("brief", "commissions"), ("build", "ends at"),
                     ("gate", "releases"), ("ship", "invites"), ("review", "becomes")],
        },
    },
}

# ---- the cover ------------------------------------------------------------------
W, H = 1600, 2400
CREAM, INK, TEAL, AMBER = "#f7f4ec", "#1a1f24", "#2a7f76", "#c07a1f"
SERIF = "Georgia, 'Liberation Serif', serif"
SANS = "'Helvetica Neue', 'Liberation Sans', Arial, sans-serif"


def esc(s):
    return (str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))


def wrap(text, per_line):
    words, lines, cur = text.split(), [], ""
    for w in words:
        if len(cur) + len(w) + 1 > per_line and cur:
            lines.append(cur)
            cur = w
        else:
            cur = (cur + " " + w).strip()
    if cur:
        lines.append(cur)
    return lines


def node_svg(x, y, label, ghost=False, side="above"):
    """side: 'above' suits a ring or a lone node; 'left' keeps a vertical chain clear."""
    stroke = AMBER if ghost else TEAL
    dash = ' stroke-dasharray="7 7"' if ghost else ""
    if side == "left":
        lx, ly, anchor = x - 40, y + 12, "end"
    else:
        lx, ly, anchor = x, y - 40, "middle"
    return (f'<circle cx="{x}" cy="{y}" r="21" fill="{CREAM}" stroke="{stroke}" '
            f'stroke-width="3.5"{dash}/>'
            f'<text x="{lx}" y="{ly}" text-anchor="{anchor}" font-family="{SANS}" '
            f'font-size="35" fill="{INK}">{esc(label)}</text>')


def edge_svg(x1, y1, x2, y2, verb):
    dx, dy = x2 - x1, y2 - y1
    ln = max(1.0, (dx * dx + dy * dy) ** 0.5)
    ux, uy = dx / ln, dy / ln
    sx, sy = x1 + ux * 24, y1 + uy * 24
    ex, ey = x2 - ux * 31, y2 - uy * 31
    mx, my = (sx + ex) / 2, (sy + ey) / 2
    # push the verb off the line along its normal, so the sentence stays readable
    px, py = -uy, ux
    if px < 0:
        px, py = -px, -py
    lx, ly = mx + px * 30, my + py * 30 + 9
    return (f'<line x1="{sx:.0f}" y1="{sy:.0f}" x2="{ex:.0f}" y2="{ey:.0f}" '
            f'stroke="{TEAL}" stroke-width="3" marker-end="url(#ar)"/>'
            f'<text x="{lx:.0f}" y="{ly:.0f}" text-anchor="middle" '
            f'font-family="{SANS}" font-size="27" fill="{TEAL}" font-style="italic">'
            f'{esc(verb)}</text>')


def graph_block(spec):
    """The cover's subgraph: real nodes, real verbs, drawn to be read."""
    out = []
    if "ring" in spec:
        import math
        cx, cy, r = W / 2, 1370, 330
        n = len(spec["ring"])
        pts = []
        for i, (label, _) in enumerate(spec["ring"]):
            a = -math.pi / 2 + i * 2 * math.pi / n
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a), label))
        for i, (x, y, label) in enumerate(pts):
            x2, y2, _ = pts[(i + 1) % n]
            out.append(edge_svg(x, y, x2, y2, spec["ring"][i][1]))
        for x, y, label in pts:
            out.append(node_svg(x, y, label))
    else:
        lx, ly = 430, 1340
        out.append(node_svg(lx, ly, spec["lone"][0], ghost=True))
        out.append(f'<text x="{lx}" y="{ly + 66}" text-anchor="middle" font-family="{SANS}" '
                   f'font-size="27" fill="{AMBER}" font-style="italic">{esc(spec["lone"][1])}</text>')
        out.append(f'<line x1="790" y1="960" x2="790" y2="1760" stroke="{INK}" '
                   f'stroke-width="1" opacity="0.18"/>')
        nodes = spec["nodes"]
        for a, b, verb in spec["edges"]:
            (_, x1, y1), (_, x2, y2) = nodes[a], nodes[b]
            out.append(edge_svg(x1, y1, x2, y2, verb))
        for label, x, y in nodes.values():
            out.append(node_svg(x, y, label, side="left"))
    cap = spec["caption"]
    out.append(f'<text x="{W/2}" y="1830" text-anchor="middle" font-family="{SERIF}" '
               f'font-size="34" fill="{INK}" opacity="0.72" font-style="italic">{esc(cap)}</text>')
    return "\n".join(out)


def cover_svg(slug, meta, spec):
    """spec is the book's whole register entry; spec['graph'] is its cover subgraph."""
    title_lines = wrap(meta["title"].split(":")[0], 18)
    sub = meta["title"].split(":", 1)[1].strip() if ":" in meta["title"] else spec["subtitle"]
    y = 300
    title = []
    for ln in title_lines:
        title.append(f'<text x="110" y="{y}" font-family="{SERIF}" font-size="118" '
                     f'font-weight="700" fill="{INK}">{esc(ln)}</text>')
        y += 132
    subl = []
    yy = y + 20
    for ln in wrap(sub, 32):
        subl.append(f'<text x="114" y="{yy}" font-family="{SERIF}" font-size="52" '
                    f'fill="{TEAL}">{esc(ln)}</text>')
        yy += 66
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7"
 orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="{TEAL}"/></marker></defs>
<rect width="{W}" height="{H}" fill="{CREAM}"/>
<rect x="0" y="0" width="{W}" height="18" fill="{TEAL}"/>
{''.join(title)}
{''.join(subl)}
<line x1="110" y1="{yy + 40}" x2="{W - 110}" y2="{yy + 40}" stroke="{INK}" stroke-width="2" opacity="0.25"/>
{graph_block(spec['graph'])}
<text x="110" y="{H - 250}" font-family="{SANS}" font-size="46" fill="{INK}">{esc(AUTHOR)}</text>
<text x="110" y="{H - 190}" font-family="{SANS}" font-size="30" fill="{INK}" opacity="0.6">{esc(meta["version"])} &#183; graphs.sgit.ai</text>
<text x="{W - 110}" y="{H - 190}" text-anchor="end" font-family="{SANS}" font-size="28" fill="{AMBER}">under review</text>
<rect x="0" y="{H - 18}" width="{W}" height="18" fill="{AMBER}"/>
</svg>'''


# ---- the metadata sheet ---------------------------------------------------------
SHEET = """# {title} — the publishing metadata sheet

**One source of words.** Everything below is generated from
`admin/build/gen_bookpub.py`'s register. Paste it into Leanpub unchanged; the landing page
on this site is built from the same lines, so the store and the site cannot drift apart.

| | |
|---|---|
| Title | {title} |
| Subtitle | {subtitle} |
| Author | {author} |
| Version | **{version}** ({status}) |
| Length | {chapters} chapters · {words:,} words · {pages} pages |
| Licence | {licence} |
| Site | https://graphs.sgit.ai/v2/books/{slug}/ |

## The one-line hook

{hook}

## The store description

{description}

**Say this plainly on the store page:** {unfinished}

## Who it is for

{audience}

## Categories

{categories}

## Keywords

{keywords}

## The files to upload

| Slot | File |
|---|---|
| The book | `{pdf}` ({pages} pages) |
| Cover | `publish/cover.png` (1600 × 2400) |
| Free sample | `publish/sample.pdf` ({sample_pages} pages — front matter and chapter one, cut from the real book) |
| EPUB | leave empty for now; a reflowable edition joins the same listing later |
"""


def write_sheet(slug, meta, spec, pages, sample_pages):
    (BOOKS / slug / "publish").mkdir(exist_ok=True)
    txt = SHEET.format(
        title=meta["title"], subtitle=spec["subtitle"], author=AUTHOR,
        version=meta["version"], status=meta["status"], chapters=meta["chapters"],
        words=meta["words"], pages=pages, licence=LICENCE, slug=slug,
        hook=spec["hook"], description=spec["description"], unfinished=spec["unfinished"],
        audience=spec["audience"], categories=" · ".join(spec["categories"]),
        keywords=", ".join(spec["keywords"]), pdf=meta["pdf"], sample_pages=sample_pages)
    (BOOKS / slug / "publish" / "metadata.md").write_text(txt)


# ---- the landing page -----------------------------------------------------------
LANDING = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title} &mdash; graphs.sgit.ai</title>
<meta name="description" content="{hook_attr}">
<link rel="canonical" href="https://graphs.sgit.ai/v2/books/{slug}/about.html">
<meta property="og:type" content="book">
<meta property="og:site_name" content="graphs.sgit.ai">
<meta property="og:url" content="https://graphs.sgit.ai/v2/books/{slug}/about.html">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{hook_attr}">
<meta property="og:image" content="https://graphs.sgit.ai/v2/books/{slug}/publish/cover.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="../../../assets/site.css">
<style>
.bk-hero {{ display: flex; gap: 2rem; align-items: flex-start; flex-wrap: wrap; margin: 1rem 0 1.5rem; }}
.bk-cover {{ flex: 0 0 260px; max-width: 100%; border: 1px solid var(--line2, #ddd);
  border-radius: 4px; box-shadow: 0 2px 14px rgba(0,0,0,.13); }}
.bk-side {{ flex: 1 1 20rem; min-width: 0; }}
.bk-hook {{ font-size: 1.24rem; line-height: 1.45; margin: 0 0 .8rem; }}
.bk-get {{ display: flex; gap: .5rem; flex-wrap: wrap; margin: .9rem 0; }}
.bk-get a {{ display: inline-block; padding: .45rem .9rem; border-radius: 8px;
  border: 1px solid #2a9d8f; background: rgba(42,157,143,.12); font-size: .9rem; }}
.bk-get a.sec {{ border-color: var(--line2, #ccc); background: #fff; }}
.bk-note {{ border-left: 4px solid #c58f00; background: rgba(240,180,41,.09);
  padding: .55rem .85rem; border-radius: 6px; font-size: .93rem; }}
.bk-facts {{ font-size: .88rem; }}
.bk-facts td {{ padding: .12rem .7rem .12rem 0; vertical-align: top; }}
</style>
</head>
<body>

<nav class="site"><div class="row"></div></nav>

<main class="doc">
<div class="crumb"><a href="../../../index.html">graphs.sgit.ai</a> &rarr; <a href="../index.html">the books</a> &rarr; <b>{short_title}</b></div>
<h1>{title}</h1>

<div class="bk-hero">
  <img class="bk-cover" src="publish/cover.png" alt="The cover of {short_title}: the title above a small graph drawn in the book's own edge vocabulary." width="260">
  <div class="bk-side">
    <p class="bk-hook">{hook}</p>
    <div class="bk-get">
      <a href="{pdf}">Read the PDF &middot; {pages} pages</a>
      <a class="sec" href="index.html">Read on the web</a>
      <a class="sec" href="publish/sample.pdf">The sample</a>
      <a class="sec" href="content/">The markdown</a>
    </div>
    <p class="bk-note">{unfinished}</p>
    <table class="bk-facts"><tbody>
      <tr><td>Version</td><td><b>{version}</b> &middot; {status}</td></tr>
      <tr><td>Length</td><td>{chapters} chapters &middot; {words:,} words &middot; {pages} pages</td></tr>
      <tr><td>Author</td><td>{author}</td></tr>
      <tr><td>Licence</td><td>{licence}</td></tr>
    </tbody></table>
  </div>
</div>

<h2>What it is</h2>
{description_html}

<h2>Who it is for</h2>
<p>{audience}</p>

<h2>How this book is versioned</h2>
<p>This book carries its own version, and that version moves only when the book&rsquo;s
content moves &mdash; the site around it releases far more often. <b>v1.0.0 is reserved for
the actual final release</b>, so {version} says plainly that a review pass is still running.
The machine-readable record is <a href="book.json">book.json</a>, which holds the version
and the SHA-256 of every chapter; a build gate fails if content changes without the version
moving.</p>

<div class="pagenav">
  <span><a href="../index.html">&larr; All the books</a></span>
  <span><a href="index.html">Start reading &rarr;</a></span>
</div>
</main>

<footer class="site"><div class="cols"></div></footer>
<script src="../../../assets/nav.js" defer></script>
</body>
</html>
"""


def write_landing(slug, meta, spec, pages):
    short = meta["title"].split(":")[0]
    desc_html = "\n".join(f"<p>{esc(p)}</p>" for p in spec["description"].split("\n\n"))
    (BOOKS / slug / "about.html").write_text(LANDING.format(
        title=esc(meta["title"]), short_title=esc(short), slug=slug,
        hook=esc(spec["hook"]), hook_attr=esc(spec["hook"]).replace('"', "&quot;"),
        pdf=meta["pdf"], pages=pages, version=meta["version"], status=meta["status"],
        chapters=meta["chapters"], words=meta["words"], author=esc(AUTHOR),
        licence=esc(LICENCE), unfinished=esc(spec["unfinished"]),
        description_html=desc_html, audience=esc(spec["audience"])))


# ---- the sample, cut from the real book ------------------------------------------
def cut_sample(slug, meta):
    """Front matter and chapter one, taken from the shipped PDF so the sample is
       typeset identically to the book. The cut point is chapter two's own outline
       entry; nothing is guessed."""
    from pypdf import PdfReader, PdfWriter
    src = BOOKS / slug / meta["pdf"]
    reader = PdfReader(str(src))
    starts = []
    for item in reader.outline:
        if hasattr(item, "title") and re.match(r"^\s*\d+\s*[·.]", str(item.title)):
            starts.append((str(item.title), reader.get_destination_page_number(item)))
    if len(starts) < 2:
        raise SystemExit(f"gen_bookpub: {slug}: cannot find chapter two in the PDF outline")
    cut = starts[1][1]                      # first page of chapter two, 0-based
    writer = PdfWriter()
    for i in range(cut):
        writer.add_page(reader.pages[i])
    out = BOOKS / slug / "publish" / "sample.pdf"
    out.parent.mkdir(exist_ok=True)
    with open(out, "wb") as fh:
        writer.write(fh)
    return len(reader.pages), cut, starts[1][0]


# ---- the run ---------------------------------------------------------------------
def main():
    lines = []
    for slug, spec in REGISTER.items():
        meta = json.loads((BOOKS / slug / "book.json").read_text())
        pub = BOOKS / slug / "publish"
        pub.mkdir(exist_ok=True)

        svg = cover_svg(slug, meta, spec)
        (pub / "cover.svg").write_text(svg)
        # the render shell carries no site chrome, so it lives outside the repository
        shell = SHELLS / f"{slug}.html"
        shell.write_text(
            f'<!doctype html><meta charset="utf-8">'
            f'<style>html,body{{margin:0;padding:0;background:{CREAM}}}</style>{svg}')

        pages, cut, ch2 = cut_sample(slug, meta)
        write_sheet(slug, meta, spec, pages, cut)
        write_landing(slug, meta, spec, pages)
        lines.append(f"{slug} {meta['version']}: cover + sheet + landing + sample "
                     f"({cut}pp, cut at {ch2.strip()!r})")

    # the PNG Leanpub wants: photographed from the SVG by the estate's own harness
    subprocess.run(["node", str(ROOT / "admin" / "build" / "gen_covers.mjs"), str(SHELLS)], check=True)
    print("gen_bookpub: " + " · ".join(lines))


if __name__ == "__main__":
    main()
