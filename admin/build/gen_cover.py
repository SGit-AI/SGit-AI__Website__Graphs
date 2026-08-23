#!/usr/bin/env python3
"""Generates the book's cover — as code, in SVG, versioned like everything else.

Run AFTER gen_book.py (it reads the print edition's page count from
book/manifest.json to compute the spine width). Outputs:

  book/cover/front.svg   the front cover, clean 6x9 — the web-reusable artwork
  book/cover/wrap.svg    the full print wrap: back + spine + front, with bleed
  book/cover/wrap.html   the print shell for the wrap
  book/cover/meaning-through-connectivity-cover.pdf
                         Chromium's print of wrap.html at exact wrap size —
                         vector throughout, fonts embedded, one page

Geometry (KDP paperback, no-bleed interior, b/w on white paper):
  trim 6 x 9 in · bleed 0.125 in · spine = pages x 0.002252 in
  wrap = (0.125 + 6 + spine + 6 + 0.125) x (9 + 0.25) in
The gate ties the cover to the interior: if the print edition's page count
changes and the cover is not regenerated, the spine width is wrong and
validate fails.

The cover graph is not decoration: it is a true subgraph in the book's own
edge vocabulary (backed_by, gives_rise_to, impairs, protected_by,
accepted_by), every arrow reading as its sentence, one ghosted edge for the
unanswered — the palette rule the book teaches, applied to its own cover.
"""
import json
import re
import shutil
import subprocess
import sys
from glob import glob
from math import atan2, degrees, hypot
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
VERSION = (ROOT / "admin/build/version.txt").read_text().strip()
OUT = ROOT / "v1/book" / "cover"
PDF_NAME = "meaning-through-connectivity-cover.pdf"
DATE = "21 August 2026"

# --- geometry (1 unit = 1/100 in) ------------------------------------------
PW, PH = 600, 900          # one 6x9 panel
BLEED = 12.5
PAGE_PER_IN = 0.002252     # KDP b/w on white paper

# --- palette: the site's family, at night ----------------------------------
BG1, BG2 = "#0d3a34", "#071f1c"
CREAM = "#f7f4ec"
AMBER = "#e2a24f"
def cream(a): return f"rgba(247,244,236,{a})"

SERIF = "Georgia, 'Liberation Serif', serif"
SANS = "'Helvetica Neue', 'Liberation Sans', Arial, sans-serif"


def defs(idp):
    return f'''<defs>
  <linearGradient id="bg{idp}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="{BG1}"/><stop offset="1" stop-color="{BG2}"/>
  </linearGradient>
  <marker id="arr{idp}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7"
          markerHeight="7" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" fill="{cream(.75)}"/>
  </marker>
  <marker id="arrg{idp}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7"
          markerHeight="7" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" fill="{cream(.28)}"/>
  </marker>
  <filter id="glow{idp}" x="-80%" y="-80%" width="260%" height="260%">
    <feGaussianBlur stdDeviation="3.2"/>
  </filter>
</defs>'''


def mesh(ox=0):
    """The faint larger graph behind everything — build wide, find the few."""
    pts = [(40, 120), (250, 60), (520, 130), (570, 320), (30, 380), (300, 300),
           (560, 560), (40, 620), (580, 840), (200, 880), (420, 40), (90, 850)]
    links = [(0, 1), (1, 2), (2, 3), (0, 4), (4, 5), (5, 3), (3, 6), (6, 8),
             (4, 7), (7, 9), (9, 8), (1, 10), (10, 2), (7, 11), (11, 9), (5, 6)]
    out = [f'<g transform="translate({ox},0)" opacity="0.55">']
    for a, b in links:
        (x1, y1), (x2, y2) = pts[a], pts[b]
        out.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" '
                   f'stroke="{cream(.05)}" stroke-width="1"/>')
    for x, y in pts:
        out.append(f'<circle cx="{x}" cy="{y}" r="2.2" fill="{cream(.09)}"/>')
    out.append('</g>')
    return "\n".join(out)


# --- the true subgraph ------------------------------------------------------
# name: (x, y, label-side)
NODES = {
    "Fact":          (168, 590, "left"),
    "Evidence":      (95, 712, "below"),
    "Vulnerability": (330, 642, "below"),
    "Risk":          (474, 578, "above"),
    "Asset":         (298, 790, "left"),
    "Control":       (118, 820, "below"),
    "Owner":         (524, 724, "below"),
}
# (from, to, verb, {t: position along edge, off: perpendicular offset,
#                   rot: rotate with the edge — off for steep edges})
EDGES = [
    ("Fact", "Evidence", "backed_by", dict(t=.5, off=13, rot=True)),
    ("Fact", "Vulnerability", "gives_rise_to", dict(t=.44, off=13, rot=True)),
    ("Vulnerability", "Risk", "gives_rise_to", dict(t=.52, off=-11, rot=True)),
    ("Risk", "Asset", "impairs", dict(t=.55, off=13, rot=True)),
    ("Asset", "Control", "protected_by", dict(t=.5, off=13, rot=True)),
    ("Risk", "Owner", "accepted_by", dict(t=.5, off=0, rot=False)),
]
GHOST = ("Asset", (448, 850))  # the unanswered — ghosted, per the palette
R = 11


def edge_svg(x1, y1, x2, y2, verb, idp, cfg):
    dx, dy = x2 - x1, y2 - y1
    d = hypot(dx, dy)
    ux, uy = dx / d, dy / d
    sx, sy = x1 + ux * (R + 4), y1 + uy * (R + 4)
    ex, ey = x2 - ux * (R + 6), y2 - uy * (R + 6)
    tpos = cfg.get("t", .5)
    mx, my = sx + (ex - sx) * tpos, sy + (ey - sy) * tpos
    px, py = -uy, ux  # perpendicular
    line = (f'<line x1="{sx:.1f}" y1="{sy:.1f}" x2="{ex:.1f}" y2="{ey:.1f}" '
            f'stroke="{cream(.55)}" stroke-width="1.4" marker-end="url(#arr{idp})"/>')
    if cfg.get("rot", True):
        ang = degrees(atan2(dy, dx))
        if ang > 90 or ang < -90:
            ang += 180
        off = cfg.get("off", 13)
        lx, ly = mx - px * off, my - py * off
        return line + (f'<text x="{lx:.1f}" y="{ly:.1f}" '
                       f'transform="rotate({ang:.1f} {lx:.1f} {ly:.1f})" '
                       f'text-anchor="middle" font-family="{SERIF}" font-style="italic" '
                       f'font-size="14.5" fill="{AMBER}">{verb}</text>')
    # steep edge: horizontal label set just beside the midpoint
    return line + (f'<text x="{mx + 12:.1f}" y="{my + 5:.1f}" '
                   f'font-family="{SERIF}" font-style="italic" '
                   f'font-size="14.5" fill="{AMBER}">{verb}</text>')


def graph_svg(idp):
    out = []
    for a, b, verb, cfg in EDGES:
        x1, y1, _ = NODES[a]
        x2, y2, _ = NODES[b]
        out.append(edge_svg(x1, y1, x2, y2, verb, idp, cfg))
    # the ghosted edge, and its unanswered node
    (ga, (gx, gy)) = GHOST
    x1, y1, _ = NODES[ga]
    dx, dy = gx - x1, gy - y1
    d = hypot(dx, dy); ux, uy = dx / d, dy / d
    out.append(f'<line x1="{x1 + ux*(R+4):.1f}" y1="{y1 + uy*(R+4):.1f}" '
               f'x2="{gx - ux*(R+6):.1f}" y2="{gy - uy*(R+6):.1f}" '
               f'stroke="{cream(.28)}" stroke-width="1.3" stroke-dasharray="4 5" '
               f'marker-end="url(#arrg{idp})"/>')
    out.append(f'<circle cx="{gx}" cy="{gy}" r="{R-2}" fill="none" '
               f'stroke="{cream(.30)}" stroke-width="2" stroke-dasharray="3 4"/>')
    out.append(f'<text x="{gx + 20}" y="{gy + 5}" font-family="{SERIF}" '
               f'font-style="italic" font-size="13.5" fill="{cream(.45)}">unanswered</text>')
    # nodes over the edges
    for name, (x, y, side) in NODES.items():
        ring = AMBER if name == "Risk" else cream(.9)
        out.append(f'<circle cx="{x}" cy="{y}" r="{R}" fill="none" stroke="{ring}" '
                   f'stroke-width="2.6" filter="url(#glow{idp})" opacity=".9"/>')
        out.append(f'<circle cx="{x}" cy="{y}" r="{R}" fill="{BG2}" stroke="{ring}" '
                   f'stroke-width="2.6"/>')
        lx, ly, anchor = x, y - R - 11, "middle"
        if side == "below":
            ly = y + R + 21
        elif side == "left":
            lx, ly, anchor = x - R - 9, y + 5, "end"
        out.append(f'<text x="{lx}" y="{ly}" text-anchor="{anchor}" '
                   f'font-family="{SANS}" font-size="15.5" font-weight="600" '
                   f'fill="{cream(.92)}">{name}</text>')
    return "\n".join(out)


def cc_badge(x, y, scale=1.0):
    """The CC BY mark, drawn: the CC circle and the attribution (person) circle,
    used as Creative Commons intends — to state this work's licence."""
    r = 16 * scale
    s = f'<g transform="translate({x},{y})">'
    # CC circle
    s += (f'<circle cx="{r}" cy="{r}" r="{r}" fill="none" stroke="{CREAM}" stroke-width="{2.2*scale}"/>'
          f'<text x="{r}" y="{r + 5.5*scale}" text-anchor="middle" font-family="{SANS}" '
          f'font-weight="800" font-size="{15*scale}" fill="{CREAM}">CC</text>')
    # BY (person) circle
    ox = 2 * r + 7 * scale
    cx = ox + r
    s += f'<circle cx="{cx}" cy="{r}" r="{r}" fill="none" stroke="{CREAM}" stroke-width="{2.2*scale}"/>'
    s += f'<circle cx="{cx}" cy="{r - 5.5*scale}" r="{3.6*scale}" fill="{CREAM}"/>'
    s += (f'<path d="M {cx - 5.5*scale} {r + 9*scale} v-{6.5*scale} '
          f'a {5.5*scale} {5.5*scale} 0 0 1 {11*scale} 0 v{6.5*scale} z" fill="{CREAM}"/>')
    return s + '</g>'


def front_content(idp):
    t = []
    t.append(mesh())
    # eyebrow
    t.append(f'<text x="{PW/2}" y="82" text-anchor="middle" font-family="{SANS}" '
             f'font-size="16" font-weight="700" letter-spacing="5.5" fill="{cream(.85)}">'
             f'GRAPHS<tspan fill="{AMBER}">.SGIT.AI</tspan></text>')
    # title
    t.append(f'<text x="{PW/2}" y="192" text-anchor="middle" font-family="{SERIF}" '
             f'font-size="80" fill="{CREAM}">Meaning</text>')
    t.append(f'<text x="{PW/2}" y="272" text-anchor="middle" font-family="{SERIF}" '
             f'font-style="italic" font-size="80" fill="{AMBER}">Through</text>')
    t.append(f'<text x="{PW/2}" y="352" text-anchor="middle" font-family="{SERIF}" '
             f'font-size="76" fill="{CREAM}">Connectivity</text>')
    # rule + diamond
    t.append(f'<line x1="150" y1="388" x2="{PW/2-14}" y2="388" stroke="{cream(.35)}" stroke-width="1"/>')
    t.append(f'<line x1="{PW/2+14}" y1="388" x2="450" y2="388" stroke="{cream(.35)}" stroke-width="1"/>')
    t.append(f'<rect x="{PW/2-4}" y="384" width="8" height="8" transform="rotate(45 {PW/2} 388)" fill="{AMBER}"/>')
    # subtitle
    t.append(f'<text x="{PW/2}" y="424" text-anchor="middle" font-family="{SANS}" '
             f'font-size="14.5" letter-spacing="2" fill="{cream(.85)}">A DISCIPLINE OF GRAPHS IN WHICH</text>')
    t.append(f'<text x="{PW/2}" y="448" text-anchor="middle" font-family="{SANS}" '
             f'font-size="14.5" letter-spacing="2" fill="{cream(.85)}">THE EDGES CARRY THE MEANING</text>')
    t.append(f'<text x="{PW/2}" y="478" text-anchor="middle" font-family="{SANS}" '
             f'font-size="12.5" letter-spacing="1.5" fill="{cream(.55)}">'
             f'THE CLAIM &#183; THE GRAMMAR &#183; THE ARGUMENT &#183; THE PROOF</text>')
    # byline
    t.append(f'<text x="{PW/2}" y="526" text-anchor="middle" font-family="{SANS}" '
             f'font-size="22" font-weight="700" letter-spacing="4" fill="{CREAM}">DINIS CRUZ</text>')
    t.append(f'<text x="{PW/2}" y="550" text-anchor="middle" font-family="{SERIF}" '
             f'font-style="italic" font-size="15" fill="{cream(.65)}">with the SG/Send agentic team</text>')
    # the graph
    t.append(graph_svg(idp))
    # edition + publisher: the version and date are stamped at generation, so
    # every release that touches the content republishes as a dated edition
    t.append(f'<text x="{PW/2}" y="849" text-anchor="middle" font-family="{SANS}" '
             f'font-size="11" font-weight="600" letter-spacing="2.2" fill="{AMBER}">'
             f'FIRST EDITION &#183; {DATE.upper()}</text>')
    t.append(f'<text x="{PW/2}" y="870" text-anchor="middle" font-family="{SANS}" '
             f'font-size="11.5" letter-spacing="3.5" fill="{cream(.5)}">'
             f'THE SGIT PROJECT &#183; SITE {VERSION.upper()}</text>')
    return "\n".join(t)


def front_svg():
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {PW} {PH}" '
            f'font-kerning="normal" role="img" aria-label="Meaning Through Connectivity — book cover">\n'
            f'<!-- generated by admin/build/gen_cover.py at site {VERSION} — do not edit by hand -->\n'
            f'{defs("f")}\n<rect width="{PW}" height="{PH}" fill="url(#bgf)"/>\n'
            f'{front_content("f")}\n</svg>\n')


def wrap(text, width):
    words, lines, cur = text.split(), [], ""
    for w in words:
        if len(cur) + len(w) + 1 > width and cur:
            lines.append(cur); cur = w
        else:
            cur = f"{cur} {w}".strip()
    lines.append(cur)
    return lines


def back_content():
    t = [mesh()]
    y = 128
    quote = ["“in our graph we do not use properties,",
             "because properties do not have meaning,",
             "they are just words; we capture",
             "meaning through connectivity.”"]
    for ln in quote:
        t.append(f'<text x="60" y="{y}" font-family="{SERIF}" font-style="italic" '
                 f'font-size="22" fill="{CREAM}">{ln}</text>')
        y += 34
    t.append(f'<text x="60" y="{y+8}" font-family="{SANS}" font-size="11.5" '
             f'letter-spacing="2" fill="{cream(.55)}">&#8212; DINIS CRUZ, 26 JUNE 2026</text>')
    y += 52
    blocks = [
        ("THE CLAIM", "A node is just a node. The same value, differently connected, "
         "means different things: the difference is not in the value, it is in "
         "the connectivity."),
        ("THE GRAMMAR", "Every edge is a verb with a distinct inverse. Paths read as "
         "sentences. And never render the whole graph: render the result of a query."),
        ("THE PROOF", "Real worked graphs with real numbers, including three live "
         "vaults you can open and count."),
    ]
    for head, body in blocks:
        t.append(f'<text x="60" y="{y}" font-family="{SANS}" font-size="12.5" '
                 f'font-weight="700" letter-spacing="2.5" fill="{AMBER}">{head}</text>')
        y += 26
        for ln in wrap(body, 52):
            t.append(f'<text x="60" y="{y}" font-family="{SERIF}" font-size="15.5" '
                     f'fill="{cream(.88)}">{ln}</text>')
            y += 23
        y += 18
    for ln in wrap("Written by Dinis Cruz with a team of AI agents, from voice "
                   "memos developed into 1,300+ briefs across a 3,300-document "
                   "corpus. The living version is graphs.sgit.ai; this book is "
                   "generated from it, and cannot drift from it.", 50):
        t.append(f'<text x="60" y="{y}" font-family="{SERIF}" font-style="italic" '
                 f'font-size="14.5" fill="{cream(.6)}">{ln}</text>')
        y += 21
    # the edition line. "First edition" already implies more will follow, so it
    # stands alone (founder call, v0.3.5 — the fuller of-many statement lives in
    # the print colophon, where it has room). Anchored below the running y so
    # the authorship block can never collide with it, and kept above 755: the
    # line runs long enough to cross x=375, where the barcode zone begins.
    ey = y + 10
    t.append(f'<text x="60" y="{ey}" font-family="{SANS}" font-size="11.5" '
             f'font-weight="700" letter-spacing="2" fill="{AMBER}">'
             f'FIRST EDITION &#183; SITE {VERSION.upper()} &#183; {DATE.upper()}</text>')
    # the licence, made unmissable: the CC BY mark plus its plain meaning.
    # Caption lines stay short so nothing enters the barcode zone (x >= 350),
    # and the last baseline stays inside the 0.25in trim-safe margin.
    t.append(cc_badge(60, 798, scale=1.0))
    t.append(f'<text x="140" y="810" font-family="{SANS}" font-size="13" '
             f'font-weight="700" letter-spacing="1" fill="{CREAM}">CC BY 4.0</text>')
    t.append(f'<text x="140" y="827" font-family="{SERIF}" font-size="11.5" '
             f'fill="{cream(.75)}">Creative Commons Attribution 4.0</text>')
    t.append(f'<text x="140" y="843" font-family="{SERIF}" font-size="11.5" '
             f'fill="{cream(.75)}">International licence. Share and adapt</text>')
    t.append(f'<text x="140" y="859" font-family="{SERIF}" font-size="11.5" '
             f'fill="{cream(.75)}">freely, for any purpose, with credit.</text>')
    t.append(f'<text x="60" y="871" font-family="{SANS}" font-size="10.5" '
             f'letter-spacing="2.5" fill="{cream(.5)}">THE SGIT PROJECT &#183; GRAPHS.SGIT.AI</text>')
    # barcode clear zone: 2 x 1.2 in, 0.25 in from the trim corner — where KDP
    # actually prints its barcode; a zone placed further in gets overhung
    t.append(f'<rect x="{PW-25-200}" y="{PH-25-120}" width="200" height="120" rx="6" fill="#ffffff"/>')
    return "\n".join(t)


def wrap_svg(spine):
    W = BLEED + PW + spine + PW + BLEED
    H = PH + 2 * BLEED
    s = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W:.1f} {H:.1f}">',
         f'<!-- full KDP wrap at site {VERSION}: bleed {BLEED/100}in, spine {spine/100:.4f}in -->',
         defs("w"),
         f'<rect width="{W:.1f}" height="{H:.1f}" fill="url(#bgw)"/>',
         f'<g transform="translate({BLEED},{BLEED})">{back_content()}</g>']
    # spine
    sx = BLEED + PW
    cx, cy = sx + spine / 2, BLEED + PH / 2
    if spine >= 25:  # KDP allows spine text from ~79 pages up
        fs = min(20, spine - 12.5)
        s.append(f'<g transform="rotate(90 {cx:.1f} {cy:.1f})">'
                 f'<text x="{cx:.1f}" y="{cy + fs*0.35:.1f}" text-anchor="middle" '
                 f'font-family="{SANS}" font-size="{fs:.1f}" font-weight="600" '
                 f'letter-spacing="2.5" fill="{CREAM}">MEANING THROUGH CONNECTIVITY'
                 f'<tspan fill="{cream(.6)}">&#160;&#160;&#183;&#160;&#160;</tspan>'
                 f'<tspan fill="{AMBER}">DINIS CRUZ</tspan></text></g>')
    s.append(f'<g transform="translate({sx + spine},{BLEED})">{front_content("w")}</g>')
    s.append('</svg>\n')
    return "\n".join(s)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    manifest_path = ROOT / "v1/book/manifest.json"
    manifest = json.loads(manifest_path.read_text())
    pages = next(e["pages"] for e in manifest["pdfs"]
                 if e["file"] == "meaning-through-connectivity.pdf")
    spine_in = pages * PAGE_PER_IN
    spine = spine_in * 100

    (OUT / "front.svg").write_text(front_svg())
    wsvg = wrap_svg(spine)
    (OUT / "wrap.svg").write_text(wsvg)

    W_in = (BLEED + PW + spine + PW + BLEED) / 100
    H_in = (PH + 2 * BLEED) / 100
    (OUT / "wrap.html").write_text(f'''<!doctype html>
<html><head><meta charset="utf-8"><title>cover wrap — print shell</title>
<link rel="canonical" href="https://graphs.sgit.ai/book/cover/wrap.html">
<style>@page{{size:{W_in:.4f}in {H_in:.4f}in;margin:0}}html,body{{margin:0;padding:0}}
svg{{display:block;width:{W_in:.4f}in;height:{H_in:.4f}in}}</style></head>
<body>{wsvg}</body></html>\n''')

    chromium = next((c for c in
                     sorted(glob("/opt/pw-browsers/chromium-*/chrome-linux/chrome")) +
                     [shutil.which("chromium") or ""] if c and Path(c).exists()), None)
    pdf = OUT / PDF_NAME
    if chromium:
        subprocess.run([chromium, "--headless", "--no-sandbox", "--disable-gpu",
                        "--no-pdf-header-footer", f"--print-to-pdf={pdf}",
                        f"file://{OUT / 'wrap.html'}"], capture_output=True)
    ok = pdf.exists() and pdf.stat().st_size > 20_000
    manifest["cover"] = {
        "version": VERSION, "pages_basis": pages, "spine_in": round(spine_in, 4),
        "wrap_in": [round(W_in, 4), round(H_in, 4)],
        "files": ["cover/front.svg", "cover/wrap.svg", f"cover/{PDF_NAME}"],
    }
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n")
    print(f"gen_cover: spine {spine_in:.3f}in from {pages} pages; wrap "
          f"{W_in:.2f} x {H_in:.2f}in; PDF {'ok' if ok else 'NOT generated'}"
          + (f" ({pdf.stat().st_size:,} bytes)" if ok else ""))
    if not ok:
        sys.exit(1)


if __name__ == "__main__":
    main()
