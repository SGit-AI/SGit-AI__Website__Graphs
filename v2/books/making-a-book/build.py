#!/usr/bin/env python3
"""Builds this book: the markdown in content/ becomes one print HTML and one PDF.

Run from anywhere:  python3 v2/books/making-a-book/build.py

The markdown files in content/ are the source of truth. This script never edits them.
It produces:

  making-a-book.pdf          the flight deliverable, with the figures embedded

The intermediate print HTML is written outside the repository (under the system temp
directory, or to the path given as the first argument). It is a build artefact, not a
page of the site: the estate's rule is that print sources carry no site chrome, and a
chrome-less HTML file inside the tree would fail the pre-release gate rather than be
excluded from it. Pass a path to keep it for inspection.

Dependencies: python-markdown and weasyprint, the same engine admin/build/gen_packs.py
uses for the review packs. Install with: pip install markdown weasyprint
"""
import datetime
import html
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
CONTENT = HERE / "content"
FIGURES = HERE / "figures"
ROOT = HERE.parents[2]
sys.path.insert(0, str(ROOT / "admin" / "build"))
from bookkit import render as md_render, pair_figures, absolutise, build_pdf  # noqa: E402

TITLE = "Creating a Book Using Agentic Workflows"
SUBTITLE = "How one book was built with an agent, in six days and eighty-eight releases"
VERSION = (ROOT / "admin" / "build" / "version.txt").read_text().strip()
BUILT = datetime.date(2026, 8, 26).strftime("%-d %B %Y")

# ---------------------------------------------------------------- markdown
# smarty is this book's one addition to the kit's default set: the narrative wants
# typographic quotes and dashes, which the argument book deliberately does not use.
EXTENSIONS = ["tables", "fenced_code", "attr_list", "sane_lists", "smarty"]


def render(md_text):
    return md_render(md_text, EXTENSIONS, output_format="html5")


def slugify(s):
    s = re.sub(r"<[^>]+>", "", s)
    s = html.unescape(s).lower()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s or "section"


# ---------------------------------------------------------------- assembly

def main():
    files = sorted(CONTENT.glob("*.md"))
    if not files:
        raise SystemExit("build: no chapters in content/")

    parts, toc = [], []
    for f in files:
        raw = f.read_text(encoding="utf-8")
        h = pair_figures(render(raw))

        m = re.search(r"<h1[^>]*>(.*?)</h1>", h, re.S)
        title = re.sub(r"<[^>]+>", "", m.group(1)).strip() if m else f.stem
        cid = "ch-" + slugify(title)

        # h1 carries the anchor and the running-header string
        h = re.sub(r"<h1[^>]*>", f'<h1 id="{cid}">', h, count=1)

        subs = []
        def h2(mm):
            t = re.sub(r"<[^>]+>", "", mm.group(1)).strip()
            sid = cid + "--" + slugify(t)
            subs.append((sid, t))
            return f'<h2 id="{sid}">{mm.group(1)}</h2>'
        h = re.sub(r"<h2[^>]*>(.*?)</h2>", h2, h, flags=re.S)

        toc.append((cid, title, subs))
        parts.append(f'<section class="chapter" id="sec-{cid}">{h}</section>')

    # the table of contents, with page numbers resolved by weasyprint
    rows = []
    for cid, title, subs in toc:
        if title.lower().startswith(("colophon", "appendix")) or "·" in title:
            cls = "toc-ch"
        else:
            cls = "toc-ch"
        rows.append(f'<li class="{cls}"><a href="#{cid}">{html.escape(title)}</a></li>')
        for sid, t in subs:
            rows.append(f'<li class="toc-sub"><a href="#{sid}">{html.escape(t)}</a></li>')
    toc_html = "<ul class=\"toc\">" + "".join(rows) + "</ul>"

    body = COVER.format(title=html.escape(TITLE), subtitle=html.escape(SUBTITLE),
                        version=VERSION, built=BUILT)
    body += f'<section class="chapter toc-page"><h1 id="contents">Contents</h1>{toc_html}</section>'
    body += "".join(parts)

    doc = SHELL.format(title=html.escape(TITLE), css=CSS, body=body)
    doc = absolutise(doc, HERE)

    # The print HTML is a published artefact for this book, so it is kept — outside the
    # repository, because a print source carries no site chrome and the chrome gate is
    # right to fail one found inside v2/.
    import tempfile
    out_html = Path(sys.argv[1]) if len(sys.argv) > 1 else (
        Path(tempfile.gettempdir()) / "making-a-book.print.html")
    pdf = HERE / "making-a-book.pdf"
    pages, engine, size = build_pdf(doc, pdf, keep_html=out_html)
    print(f"build: {out_html.name} {out_html.stat().st_size:,}b · "
          f"{pdf.name} {size:,}b · {pages} pages · {engine}")
    return pages


# ---------------------------------------------------------------- templates

COVER = """
<section class="cover">
  <div class="cover-rule"></div>
  <p class="cover-kicker">The making-of</p>
  <h1 class="cover-title">{title}</h1>
  <p class="cover-sub">{subtitle}</p>
  <div class="cover-meta">
    <p><b>graphs.sgit.ai</b> · written against {version} · {built}</p>
    <p>Written by an AI agent, on the repository it describes.</p>
    <p>Creative Commons Attribution 4.0 International · CC BY 4.0</p>
  </div>
</section>
"""

SHELL = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{title}</title>
<style>{css}</style>
</head>
<body>
{body}
</body>
</html>
"""

CSS = r"""
@page {
  size: A4;
  margin: 20mm 20mm 18mm 20mm;
  @bottom-center { content: counter(page); font: 9pt "DejaVu Sans", "Liberation Sans", sans-serif; color: #8a8578; }
  @top-center { content: string(runhead); font: 8pt "DejaVu Sans", "Liberation Sans", sans-serif;
                color: #b4afa2; letter-spacing: .04em; }
}
@page :first { @top-center { content: none } @bottom-center { content: none } }

html { font-size: 10.5pt }
body {
  font-family: "Charter", "Bitstream Charter", "Liberation Serif", Georgia, serif;
  color: #23241f; line-height: 1.52; margin: 0;
  -weasy-hyphens: auto;
}

/* ---- cover ---- */
.cover { page-break-after: always; padding-top: 42mm }
.cover-rule { height: 5px; width: 62mm; background: #0d5c50; margin-bottom: 10mm }
.cover-kicker { font: 700 8.5pt/1 "DejaVu Sans", "Liberation Sans", sans-serif; letter-spacing: .16em;
  text-transform: uppercase; color: #0d5c50; margin: 0 0 6mm }
.cover-title { font-size: 30pt; line-height: 1.1; margin: 0 0 6mm; font-weight: 700;
  letter-spacing: -.01em; border-bottom: 0; padding-bottom: 0; string-set: none }
.cover-sub { font-size: 13pt; line-height: 1.45; color: #4a4b46; margin: 0 0 26mm;
  text-align: left; -weasy-hyphens: none }
.cover-meta { font: 9pt/1.7 "DejaVu Sans", "Liberation Sans", sans-serif; color: #5c5f66 }
.cover-meta p { margin: 0 0 1mm }
.cover-meta b { color: #23241f }

/* ---- chapters ---- */
.chapter { page-break-before: always }
h1 {
  string-set: runhead content(text);
  font-size: 21pt; line-height: 1.18; margin: 0 0 6mm; font-weight: 700;
  padding-bottom: 3mm; border-bottom: 2px solid #0d5c50;
  page-break-after: avoid;
}
h2 { font-size: 13.5pt; margin: 9mm 0 3mm; font-weight: 700; page-break-after: avoid;
     line-height: 1.25 }
h3 { font-size: 11.2pt; margin: 6mm 0 2mm; font-weight: 700; page-break-after: avoid }
p { margin: 0 0 3.2mm; text-align: justify; orphans: 2; widows: 2 }
em { font-style: italic }
strong { font-weight: 700 }

/* the italic standfirst under each chapter title */
h1 + p em { color: #3f5f58 }

ul, ol { margin: 0 0 3.5mm; padding-left: 6mm }
li { margin: 0 0 1.6mm }
li p { margin: 0 0 1.6mm }

blockquote {
  margin: 4mm 0; padding: 2.4mm 0 2.4mm 5mm;
  border-left: 2.5px solid #c9a227; background: #fbf8ef;
  page-break-inside: avoid;
}
blockquote p { margin: 0 0 2mm; font-size: 9.6pt; line-height: 1.5; text-align: left }
blockquote p:last-child { margin-bottom: 0 }
blockquote table { font-size: 8.4pt }

code { font-family: "DejaVu Sans Mono", monospace; font-size: 8.8pt;
  background: #f2f0e9; padding: 0 .8mm; border-radius: 2px }
pre { background: #f7f5ee; border: 1px solid #e4e0d6; border-radius: 3px;
  padding: 3mm 3.4mm; margin: 3.5mm 0; page-break-inside: avoid; overflow-wrap: break-word }
pre code { background: none; padding: 0; font-size: 8.1pt; line-height: 1.42;
  white-space: pre-wrap; word-break: break-word }

table { width: 100%; border-collapse: collapse; margin: 4mm 0; font-size: 8.8pt;
  page-break-inside: auto }
th { text-align: left; font-family: "DejaVu Sans", "Liberation Sans", sans-serif; font-size: 7.4pt;
  letter-spacing: .05em; text-transform: uppercase; color: #6b6d66; font-weight: 700;
  border-bottom: 1px solid #d8d4c8; padding: 1.4mm 2mm 1.4mm 0; vertical-align: bottom;
  white-space: nowrap; -weasy-hyphens: none }
td { padding: 1.4mm 2mm 1.4mm 0; border-bottom: 1px solid #efece2; vertical-align: top;
  line-height: 1.42 }
tr { page-break-inside: avoid }

figure { margin: 5mm 0 6mm; page-break-inside: avoid }
figure img { width: auto; max-width: 100%; max-height: 148mm;
  border: 1px solid #ddd9cd; border-radius: 3px; display: block; margin: 0 auto }
figcaption { font-family: "DejaVu Sans", "Liberation Sans", sans-serif; font-size: 8.2pt; line-height: 1.45;
  color: #5c5f66; margin-top: 1.8mm }

hr { border: 0; border-top: 1px solid #e4e0d6; margin: 6mm 0 }

/* ---- contents ---- */
.toc-page h1 { border-bottom-color: #c9a227 }
ul.toc { list-style: none; padding: 0; margin: 4mm 0 0; font-family: "DejaVu Sans", "Liberation Sans", sans-serif }
ul.toc li { margin: 0 }
ul.toc a { text-decoration: none; color: inherit }
ul.toc a::after { content: " · " target-counter(attr(href), page); color: #8a8578;
  font-size: 8.4pt }
li.toc-ch { font-size: 10.4pt; font-weight: 700; margin-top: 4mm; padding-bottom: 1mm;
  border-bottom: 1px solid #efece2 }
li.toc-sub { font-size: 8.6pt; color: #5c5f66; margin-left: 5mm; line-height: 1.55 }
"""

if __name__ == "__main__":
    main()
