#!/usr/bin/env python3
"""Generates /book/ — the site's content as a book, in three reading modes.

Run from anywhere: python3 admin/build/gen_book.py
Then chrome.py (fills nav/footer on the generated pages), then regenerate the PDF
(this script does it automatically when a local Chromium is available), then
validate.js.

The design decision, stated once: **the book is a projection of the site.** The
chapters are not copies of the pages — they are generated from the pages' own
<main> content by this script, links rewritten, chrome stripped, order imposed.
That is the site's own argument ("documents are projections of graphs") applied
to itself, and it is what keeps 90%-shared content from drifting: validate.js
records a hash of every source page's main block in book/manifest.json and fails
the build if a source changed without the book regenerating.

Three modes, one source:
  book/index.html      cover, about-this-book, table of contents
  book/ch-NN-*.html    one chapter per page, persistent left TOC
  book/single.html     everything in one page (also the print source)
  book/print.html      the print-interior source: front matter (half-title,
                       title page, edition page, a contents whose page numbers
                       are computed by the renderer), part dividers, chapters
  book/meaning-through-connectivity-screen.pdf
                       the screen edition: Chromium's print of single.html at
                       US Letter, in the site's own design — the one that reads
                       well on a tablet. Colour, one column, no folios.
  book/meaning-through-connectivity.pdf
                       the print interior, typeset by WeasyPrint from
                       print.html: 6in x 9in trim, mirrored 0.75/0.5in margins,
                       folios bottom-outside, running heads (book title verso,
                       chapter title recto), justified and hyphenated,
                       monochrome, no bleed — the standard technical-book /
                       KDP paperback format, cover excluded (a cover is a
                       separate artefact). Falls back to Chromium (same trim,
                       no folios or contents page numbers) when WeasyPrint is
                       unavailable; committed, because CI has neither.

A structural note on single.html: each chapter sits in its own
<main class="doc chap"> block. Multiple <main> elements in one document is
technically invalid HTML; it is done deliberately, because the whole stylesheet
targets main.doc and one generated page is not a reason to fork the CSS. Reader
pages carry exactly one <main> each and are fully valid.
"""
import hashlib
import json
import re
import shutil
import subprocess
import sys
from glob import glob
from pathlib import Path
from posixpath import dirname as pdirname, join as pjoin, normpath

ROOT = Path(__file__).resolve().parents[2]
VERSION = (ROOT / "admin/build/version.txt").read_text().strip()
HOST = "https://graphs.sgit.ai"
OUT = ROOT / "book"
# Two PDF editions, one source. Both are regenerated on every release — the
# gate's freshness check makes that non-optional — and both carry the site
# version on their cover/edition page, so a reader can always tell which
# release of the content they are holding.
PDF_NAME = "meaning-through-connectivity.pdf"          # print interior, 6x9
SCREEN_PDF_NAME = "meaning-through-connectivity-screen.pdf"  # screen/tablet, Letter
DATE = "21 August 2026"

TITLE = "Meaning Through Connectivity"
SUBTITLE = ("A discipline of graphs in which the edges carry the meaning — "
            "the claim, the grammar, the full argument, and the worked proof.")
EPIGRAPH = ("“in our graph we do not use properties, because properties do not have "
            "meaning, they are just words; we capture meaning through connectivity.”")
BYLINE = "Dinis Cruz, with the SG/Send agentic team"

# (roman, title, one-paragraph intro)
PARTS = [
    ("I", "The claim",
     "The altitude of the city walls: five ideas that need no vocabulary, and the "
     "reason a sceptic should care before learning any of it."),
    ("II", "The grammar",
     "Zoom in to roads and buildings: the rules you can apply to a graph of your own "
     "tomorrow, and the concrete edge vocabulary this project uses."),
    ("III", "The full argument",
     "People and cars: where this discipline disagrees with schema-first practice, "
     "and what falls out — at every boundary of a system — when you take it seriously."),
    ("IV", "The proof",
     "Real worked graphs with real numbers. Every count is labelled live or "
     "parsed-from-a-design-document, and the two are never mixed."),
    ("V", "Reality",
     "What is actually built, where six and a half months of thinking came from, and "
     "how the argument reaches the sibling sites."),
    ("VI", "Appendices",
     "The vocabulary in plain English, and the disclosure of who is writing — "
     "including where this approach loses."),
]

# (part index 0-based, source page, chapter title)
CHAPTERS = [
    (0, "why-graphs/index.html", "Why graphs at all"),
    (0, "start/index.html", "The five ideas"),
    (1, "grammar/index.html", "The rules you can apply tomorrow"),
    (1, "grammar/edge-set.html", "The edge set"),
    (2, "depth/index.html", "Against schema-first"),
    (2, "depth/boundaries.html", "A graph at every boundary"),
    (3, "examples/index.html", "Worked graphs, with real numbers"),
    (3, "examples/browser-isolation.html", "Whose session is the agent using?"),
    (3, "examples/2fa.html", "The 2FA instance graph"),
    (3, "examples/article-26-5.html", "Article 26(5), fact to board and back"),
    (3, "maps/index.html", "Wardley maps as graphs"),
    (4, "shipped/index.html", "What ships, what is argued"),
    (4, "origins/index.html", "Origins: 2026"),
    (4, "network/index.html", "The network"),
    (5, "glossary/index.html", "Glossary"),
    (5, "about/participant.html", "The author's interest — and where this loses"),
]

ABOUT = f"""
<main class="doc">
  <h2 id="about">About this book</h2>
  <p>This book is <b>a projection of <a href="{HOST}/index.html">graphs.sgit.ai</a></b> — the
  same content, in a reading order, in three formats. The chain has three links and one
  source of truth: the chapter text is <b>authored in markdown</b> (each chapter is
  fetchable at <code>{HOST}/content/&lt;chapter&gt;.md</code>), the site pages are rendered
  from it, and this book is generated from those pages by
  <code>admin/build/gen_book.py</code>. Nothing can drift: the build fails if a page lags
  its markdown or the book lags a page. That is the book's own argument — <em>documents
  are projections of graphs</em> — applied to the book itself.</p>
  <p>The chapters therefore speak as the site speaks: where a page says “this site”,
  it means graphs.sgit.ai, of which this book is a view — and where a page says “this
  page”, the book says “this chapter”, because the projection rewrites self-references
  the same way it rewrites links. The site is the living version; the book is the
  version you can read on a train.</p>
  <p>Four ways to read it, same content in all four — the two PDFs are regenerated together from the same chapters on every release, and each carries the site version it was generated from on its cover:</p>
  <ul>
    <li><b><a href="index.html#toc">Chapter pages</a></b> — one chapter per page, with the
    table of contents beside you.</li>
    <li><b><a href="single.html">One single page</a></b> — the whole book in one HTML file,
    for reading straight through, searching with ctrl-F, or fetching once.</li>
    <li><b><a href="{SCREEN_PDF_NAME}">The screen PDF</a></b> — the single page printed at
    US Letter in the site's own design: colour, one column, comfortable on a tablet.</li>
    <li><b><a href="{PDF_NAME}">The print PDF</a></b> — a real 6&Prime;&nbsp;×&nbsp;9&Prime;
    print interior with gutters, folios and a paginated contents; the edition a
    print-on-demand service takes.</li>
  </ul>
  <h2 id="print">The print edition, and the formats deliberately not offered</h2>
  <p>There are two PDF editions, generated together from the same chapters.
  <b><a href="{SCREEN_PDF_NAME}">The screen edition</a></b> is the site's own design at
  US Letter — the one to read on a tablet. <b><a href="{PDF_NAME}">The print edition</a></b>
  is not a printout of the web pages — it is a <b>print interior</b> in the standard
  technical-book format, ready for print-on-demand (KDP and equivalents), cover
  excluded:</p>
  <ul>
    <li><b>6&Prime; × 9&Prime; trim</b>, the standard trade size, with <b>no bleed</b> —
    nothing runs to the page edge.</li>
    <li><b>Mirrored margins</b>: 0.75&Prime; inside (the gutter), 0.5&Prime; outside —
    above KDP's minimums for a no-bleed interior of this length (0.375&Prime; / 0.25&Prime;).</li>
    <li><b>Folios and running heads</b>: page numbers sit bottom-outside; the verso head
    carries the book title, the recto head the chapter title; front matter and part
    pages carry neither.</li>
    <li><b>A paginated contents</b> — the page numbers in it are computed by the
    typesetter at render time, so they cannot disagree with the pagination. The same
    no-drift rule as everything else here.</li>
    <li><b>Justified, hyphenated, monochrome</b>, with every font embedded. Colour
    exists only in the screen editions; ink is black.</li>
  </ul>
  <p>Two things are deliberately <em>not</em> here. <b>A cover</b> — a print cover is a
  separate artefact sized to trim plus spine plus bleed, where the spine width depends
  on the final page count; it is tracked on <a href="{HOST}/admin/comms.html">the comms
  board</a> rather than half-done here. And <b>a Kindle edition</b> — a fixed-layout PDF
  is the wrong upload for Kindle in every case; the right artefact is a reflowable EPUB,
  which this pipeline could generate from the same chapters, and which is queued rather
  than pretended to.</p>
  <p class="small dim">Edition: site {VERSION}, {DATE}. All content is released under the
  Creative Commons Attribution 4.0 International licence (CC BY 4.0). The raw source
  documents behind every chapter are published at
  <a href="{HOST}/documents/index.html">{HOST.replace('https://','')}/documents/</a>.</p>
</main>
"""


def slugify(title):
    s = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    return re.sub(r"-{2,}", "-", s)


def head(rel, title, desc, og_type="article"):
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{HOST}/book/{rel}">
<meta property="og:type" content="{og_type}">
<meta property="og:site_name" content="graphs.sgit.ai">
<meta property="og:url" content="{HOST}/book/{rel}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta name="twitter:card" content="summary">
<link rel="stylesheet" href="../assets/site.css">
</head>
<body class="bookpage">

<nav class="site"><div class="row"></div></nav>
'''

FOOT = '''
<footer class="site"><div class="cols"></div></footer>
</body>
</html>
'''


def extract(source):
    """Return (raw_main, content, source_hash). content = main minus crumb,
    pagenav and h1; raw_main is what validate.js will hash."""
    t = (ROOT / source).read_text()
    m = re.search(r'<main class="doc">(.*?)</main>', t, re.S)
    if not m:
        sys.exit(f"gen_book: {source} has no <main class=\"doc\"> block")
    raw = m.group(1)
    c = re.sub(r'<div class="crumb">.*?</div>\s*', '', raw, count=1, flags=re.S)
    c = re.sub(r'<div class="pagenav">.*?</div>\s*', '', c, flags=re.S)
    c = re.sub(r'<h1>.*?</h1>\s*', '', c, count=1, flags=re.S)
    # The projection rewrites self-references along with the links: on the site a
    # chapter's source IS a page, in the book it is a chapter. Audited: every
    # "this page" in the sources is a self-reference, so the phrase-level swap is
    # safe; anything narrower ("the page to…") is neutralised in the sources
    # instead, because a blind word swap would hit "GitHub Pages", "the pages
    # you visit" and the front page.
    for a, b in (("on this page", "in this chapter"),
                 ("On this page", "In this chapter"),
                 ("this page", "this chapter"),
                 ("This page", "This chapter")):
        c = c.replace(a, b)
    return raw, c, hashlib.sha256(raw.encode()).hexdigest()


def rewrite_links(content, source, mode, chnum, page_to_ch, ch_files):
    """Rewrite hrefs for the book. Book-internal targets become chapter links
    (reader mode) or #chNN anchors (single mode); everything else becomes an
    absolute site URL, so the links keep working in the PDF too."""
    src_dir = pdirname(source)

    def repl(m):
        href = m.group(1)
        if re.match(r'^(https?:|mailto:|data:)', href):
            return m.group(0)
        if href.startswith('#'):
            if mode == 'single':
                return f'href="#ch{chnum:02d}-{href[1:]}"'
            return m.group(0)
        path, frag = (href.split('#', 1) + [''])[:2]
        site_path = normpath(pjoin(src_dir, path)) if src_dir else normpath(path)
        if site_path in page_to_ch:
            n = page_to_ch[site_path]
            if mode == 'single':
                return f'href="#ch{n:02d}-{frag}"' if frag else f'href="#ch{n:02d}"'
            tgt = ch_files[n]
            return f'href="{tgt}#{frag}"' if frag else f'href="{tgt}"'
        url = f'{HOST}/{site_path}'
        return f'href="{url}#{frag}"' if frag else f'href="{url}"'

    return re.sub(r'href="([^"]+)"', repl, content)


def toc_html(current=None):
    """The persistent left TOC for reader pages."""
    out = ['<aside class="booktoc">']
    last_part = None
    for n, (pi, source, title) in enumerate(CHAPTERS, 1):
        if pi != last_part:
            roman, ptitle, _ = PARTS[pi]
            out.append(f'  <div class="tocpart">Part {roman} · {ptitle}</div>')
            last_part = pi
        here = ' here' if n == current else ''
        out.append(f'  <a class="tocch{here}" href="{CH_FILES[n]}">{n} · {title}</a>')
    out.append('  <div class="tocmodes">')
    out.append('    <a href="index.html">☰ Cover &amp; contents</a>')
    out.append('    <a href="single.html">Read it in one page</a>')
    out.append(f'    <a href="{PDF_NAME}">The print PDF (6×9)</a>')
    out.append(f'    <a href="{SCREEN_PDF_NAME}">The screen PDF (tablet)</a>')
    out.append('  </div>')
    out.append('</aside>')
    return '\n'.join(out)


def bookbar():
    return (f'<div class="bookbar"><a href="index.html">☰ Contents</a> · '
            f'<a href="single.html">single page</a> · '
            f'<a href="{PDF_NAME}">print PDF</a> · '
            f'<a href="{SCREEN_PDF_NAME}">screen PDF</a> · '
            f'<span>{TITLE} · site {VERSION}</span></div>')


def cover(link_prefix=''):
    return f'''<header class="bookcover">
  <div class="eyebrow">graphs.sgit.ai · the book</div>
  <h1>{TITLE}</h1>
  <p class="bsub">{SUBTITLE}</p>
  <blockquote>{EPIGRAPH}</blockquote>
  <p class="byline">{BYLINE}</p>
  <p class="ed">First edition · site {VERSION} · {DATE} · CC BY 4.0</p>
</header>
'''


# ---------------------------------------------------------------- build ----
OUT.mkdir(exist_ok=True)
for old in glob(str(OUT / "ch-*.html")):
    Path(old).unlink()

CH_FILES = {n: f"ch-{n:02d}-{slugify(t)}.html" for n, (_, _, t) in enumerate(CHAPTERS, 1)}
PAGE_TO_CH = {source: n for n, (_, source, _) in enumerate(CHAPTERS, 1)}

manifest = {"version": VERSION, "title": TITLE, "chapters": []}
singles = []

for n, (pi, source, title) in enumerate(CHAPTERS, 1):
    raw, content, digest = extract(source)
    roman, ptitle, _ = PARTS[pi]
    header = (f'<div class="chkick">Part {roman} · {ptitle}</div>\n'
              f'<div class="chnum">Chapter {n}</div>\n<h1>{title}</h1>\n')

    # reader page
    reader = rewrite_links(content, source, 'reader', n, PAGE_TO_CH, CH_FILES)
    prev_a = (f'<a href="{CH_FILES[n-1]}">← {n-1} · {CHAPTERS[n-2][2]}</a>'
              if n > 1 else '<a href="index.html">← Cover &amp; contents</a>')
    next_a = (f'<a href="{CH_FILES[n+1]}">{n+1} · {CHAPTERS[n][2]} →</a>'
              if n < len(CHAPTERS) else '<a href="index.html">Back to the contents →</a>')
    desc = (f"Chapter {n} of {TITLE}, the graphs.sgit.ai book. Also readable as a "
            f"single page or as a PDF.")
    page = head(CH_FILES[n], f"{n} · {title} — {TITLE}", desc)
    page += f'''
<div class="bookwrap">
{toc_html(n)}
  <div class="bookmain">
    {bookbar()}
    <main class="doc bookch">
{header}{reader}
      <div class="pagenav"><span>{prev_a}</span><span>{next_a}</span></div>
    </main>
  </div>
</div>
'''
    page += FOOT
    (OUT / CH_FILES[n]).write_text(page)

    # single-page fragment: prefix every id, then place under a #chNN anchor
    frag = rewrite_links(content, source, 'single', n, PAGE_TO_CH, CH_FILES)
    frag = re.sub(r'id="([^"]+)"', lambda m: f'id="ch{n:02d}-{m.group(1)}"', frag)
    singles.append((n, pi, title, header, frag))

    manifest["chapters"].append({
        "n": n, "part": f"Part {roman} · {ptitle}", "title": title,
        "file": CH_FILES[n], "source": source, "source_sha256": digest,
    })

# ------------------------------------------------------------ index.html ----
toc_index = ['<main class="doc" id="toc">', '<h2>Table of contents</h2>']
last = None
for n, (pi, source, title) in enumerate(CHAPTERS, 1):
    if pi != last:
        roman, ptitle, pintro = PARTS[pi]
        toc_index.append(f'<h3 class="dim" style="margin-top:1.6rem">Part {roman} · {ptitle}</h3>')
        toc_index.append(f'<p class="small dim">{pintro}</p>')
        last = pi
    toc_index.append(f'<p style="margin:.25rem 0"><a href="{CH_FILES[n]}"><b>{n}</b> · {title}</a></p>')
toc_index.append('</main>')

idx = head("index.html", f"{TITLE} — the graphs.sgit.ai book",
           "The site's content as a book: sixteen chapters in six parts, readable as "
           "chapter pages, as one single page, or as a PDF. Generated from the site's "
           "own pages — the book is a projection, and CI fails if they drift.",
           og_type="book")
idx += cover()
idx += f'''<div class="ctas noprint" style="margin:-.6rem 0 2.4rem">
  <a class="cta1" href="{CH_FILES[1]}">Start reading →</a>
  <a class="cta2" href="single.html">The whole book in one page →</a>
  <a class="cta2" href="{SCREEN_PDF_NAME}">The screen PDF →</a>
  <a class="cta2" href="{PDF_NAME}">The print PDF →</a>
</div>
'''
idx += ABOUT
idx += '\n'.join(toc_index)
idx += FOOT
(OUT / "index.html").write_text(idx)

# ----------------------------------------------------------- single.html ----
sp = head("single.html", f"{TITLE} — the whole book in one page",
          "All sixteen chapters of the graphs.sgit.ai book in a single HTML page: the "
          "claim, the grammar, the full argument, the worked proof, and reality. "
          "This page is also the print source for the PDF edition.")
sp += cover()
sp += f'''<div class="ctas noprint" style="margin:-.6rem 0 1rem">
  <a class="cta2" href="index.html">☰ Chapter pages →</a>
  <a class="cta2" href="{SCREEN_PDF_NAME}">The screen PDF →</a>
  <a class="cta2" href="{PDF_NAME}">The print PDF →</a>
</div>
<div class="singletoc noprint">
'''
last = None
for n, (pi, source, title) in enumerate(CHAPTERS, 1):
    if pi != last:
        roman, ptitle, _ = PARTS[pi]
        sp += f'  <div class="tocpart">Part {roman} · {ptitle}</div>\n'
        last = pi
    sp += f'  <a href="#ch{n:02d}">{n} · {title}</a>\n'
sp += '</div>\n'

last = None
for n, pi, title, header, frag in singles:
    if pi != last:
        roman, ptitle, pintro = PARTS[pi]
        sp += (f'<section class="parthead"><div class="pk">Part {roman}</div>'
               f'<h2>{ptitle}</h2><p>{pintro}</p></section>\n')
        last = pi
    # multiple <main> blocks by design — see the module docstring
    sp += f'<main class="doc chap" id="ch{n:02d}">\n{header}{frag}\n</main>\n'
sp += FOOT
(OUT / "single.html").write_text(sp)

# ------------------------------------------------------------ print.html ----
# The print-interior source. Front matter, part dividers, chapters — no site
# chrome at all. assets/print-book.css (loaded after site.css) carries the
# 6x9 page geometry, folios, running heads and the monochrome palette.
pp = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{TITLE} — print interior</title>
<meta name="description" content="The print-interior edition of {TITLE}: 6in x 9in trim, mirrored margins, folios, a paginated contents. Typeset from this file by WeasyPrint.">
<link rel="canonical" href="{HOST}/book/print.html">
<link rel="stylesheet" href="../assets/site.css">
<link rel="stylesheet" href="../assets/print-book.css">
</head>
<body class="bookpage">

<section class="fm halftitle"><h1>{TITLE}</h1></section>

<section class="fm titlepage">
  <div class="over">graphs.sgit.ai</div>
  <h1>Meaning Through<br>Connectivity</h1>
  <p class="sub">{SUBTITLE}</p>
  <p class="by">{BYLINE}</p>
  <p class="pub">the sgit project</p>
</section>

<section class="fm colophon">
  <p><b>{TITLE}</b> — first edition, {DATE}. Generated from graphs.sgit.ai at site
  {VERSION} by <code>admin/build/gen_book.py</code>; the site is the living version of
  this text, and this book is a projection of it.</p>
  <p>This work is released under the Creative Commons Attribution 4.0 International
  licence (CC BY 4.0). You are free to share and adapt this material for any purpose,
  including commercially, as long as you give appropriate credit. Third-party material
  quoted within it stays under its own terms.</p>
  <p>The raw source documents behind every chapter are published at
  {HOST}/documents/ — the markdown is the source of truth, and this rendering is
  presentation. Hyperlinks are live in the digital editions at {HOST}/book/.</p>
  <p>Interior: 6&Prime; × 9&Prime;, no bleed, typeset with WeasyPrint. Set in Liberation
  Serif, Liberation Sans and Liberation Mono.</p>
</section>

<section class="fm toc">
  <h1>Contents</h1>
  <div class="toc">
"""
last = None
for n, (pi, source, title) in enumerate(CHAPTERS, 1):
    if pi != last:
        roman, ptitle, _ = PARTS[pi]
        pp += f'    <div class="t-part">Part {roman} · {ptitle}</div>\n'
        last = pi
    pp += f'    <div class="t-ch"><a href="#ch{n:02d}">{n} · {title}</a></div>\n'
pp += "  </div>\n</section>\n"

last = None
for n, pi, title, header, frag in singles:
    if pi != last:
        roman, ptitle, pintro = PARTS[pi]
        pp += (f'<section class="part"><div class="pk">Part {roman}</div>'
               f'<h2>{ptitle}</h2><p>{pintro}</p></section>\n')
        last = pi
    pp += f'<section class="chapter" id="ch{n:02d}">\n{header}{frag}\n</section>\n'
pp += "</body>\n</html>\n"
(OUT / "print.html").write_text(pp)

(OUT / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
print(f"gen_book: {len(CHAPTERS)} chapters, index.html, single.html, manifest.json")

# ------------------------------------------------------------------ PDF ----
# Two editions from the same chapters, both stamped with the site version:
#   print  — WeasyPrint typesets print.html: 6x9 trim, folios, running heads,
#            paginated contents. Chromium fallback keeps the trim, loses the
#            margin-box apparatus, and says so.
#   screen — Chromium prints single.html at US Letter in the site's own
#            design: colour, one column, comfortable on a tablet.
# Both are committed (CI has neither WeasyPrint nor a browser), and the
# gate's freshness check forces this script to rerun on every release, so
# neither edition can lag the content or the version.

def pdf_pages(path):
    """Count pages in either PDF flavour: Chromium writes plain object headers,
    WeasyPrint (pydyf) packs the object tree into compressed object streams."""
    import zlib
    d = path.read_bytes()
    n = len(re.findall(rb"/Type\s*/Page[^s]", d))
    for s in re.findall(rb"stream\r?\n(.*?)endstream", d, re.S):
        try:
            n += len(re.findall(rb"/Type\s*/Page[^s]", zlib.decompress(s)))
        except Exception:
            continue
    return n

manifest["pdfs"] = []

def record(path, edition, typesetter):
    manifest["pdfs"].append({
        "file": path.name, "edition": edition, "version": VERSION,
        "pages": pdf_pages(path), "typesetter": typesetter,
    })
    (OUT / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    print(f"gen_book: {path.name} — {manifest['pdfs'][-1]['pages']} pages, "
          f"{path.stat().st_size:,} bytes ({edition}, {typesetter})")

chromium = next((c for c in
                 sorted(glob("/opt/pw-browsers/chromium-*/chrome-linux/chrome")) +
                 [shutil.which("chromium") or "", shutil.which("google-chrome") or ""]
                 if c and Path(c).exists()), None)

def chromium_print(src, dest):
    for flags in (["--no-pdf-header-footer"], ["--print-to-pdf-no-header"]):
        r = subprocess.run(
            [chromium, "--headless", "--no-sandbox", "--disable-gpu",
             "--virtual-time-budget=10000", *flags,
             f"--print-to-pdf={dest}", f"file://{src}"],
            capture_output=True)
        if dest.exists() and dest.stat().st_size > 50_000:
            return True
    print(f"gen_book: Chromium print failed for {src.name}: "
          f"{r.stderr.decode()[-300:]}", file=sys.stderr)
    return False

# --- the print interior ---
pdf = OUT / PDF_NAME
try:
    import weasyprint
    weasyprint.HTML(filename=str(OUT / "print.html")).write_pdf(str(pdf))
    record(pdf, "print interior 6x9", f"weasyprint {weasyprint.__version__}")
except ImportError:
    print("gen_book: WeasyPrint not available — Chromium fallback for the print "
          "interior (6x9, but no folios and no contents page numbers)")
    if chromium and chromium_print(OUT / "print.html", pdf):
        record(pdf, "print interior 6x9", "chromium fallback (no folios)")
    else:
        print("gen_book: print PDF NOT regenerated (the gate blocks a stale book)")

# --- the screen edition ---
spdf = OUT / SCREEN_PDF_NAME
if chromium and chromium_print(OUT / "single.html", spdf):
    record(spdf, "screen (US Letter)", "chromium")
else:
    print("gen_book: screen PDF NOT regenerated (no Chromium; the gate blocks a stale book)")
