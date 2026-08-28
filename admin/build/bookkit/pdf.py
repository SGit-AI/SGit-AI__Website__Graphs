"""Driving weasyprint, and counting what came out.

page_count existed in four copies across this repo — gen_book.py, gen_packs.py and both
book builders — each carrying the same comment about having learnt the trick the hard
way. This is that one copy.
"""
import re
import tempfile
import zlib
from pathlib import Path


def page_count(path):
    """Count the pages of a PDF in either flavour.

    The naive /Type /Page scan returns zero on a WeasyPrint file, because WeasyPrint
    packs the object tree into COMPRESSED OBJECT STREAMS. So: count what is visible, then
    inflate every stream and count again inside it."""
    d = Path(path).read_bytes()
    n = len(re.findall(rb"/Type\s*/Page[^s]", d))
    for st in re.findall(rb"stream\r?\n(.*?)endstream", d, re.S):
        try:
            n += len(re.findall(rb"/Type\s*/Page[^s]", zlib.decompress(st)))
        except Exception:
            continue
    return n or None


def build_pdf(html_text, out_path, keep_html=None):
    """Render print HTML to `out_path`. Returns (pages, engine, bytes).

    The intermediate HTML goes to a temp file by default rather than into the book
    folder: a print source carries no site chrome, and one left inside v2/ fails the
    chrome gate. Pass keep_html to write it somewhere on purpose — a book whose print
    HTML is itself a published artefact does that."""
    out_path = Path(out_path)
    if keep_html:
        tmp = Path(keep_html)
        tmp.write_text(html_text)
    else:
        fd = tempfile.NamedTemporaryFile("w", suffix=".html", delete=False)
        fd.write(html_text)
        fd.close()
        tmp = Path(fd.name)
    try:
        import weasyprint
    except ImportError:
        if not keep_html:
            tmp.unlink(missing_ok=True)
        return None, "not built (WeasyPrint unavailable)", None
    try:
        weasyprint.HTML(filename=str(tmp)).write_pdf(str(out_path))
    finally:
        if not keep_html:
            tmp.unlink(missing_ok=True)
    return page_count(out_path), f"weasyprint {weasyprint.__version__}", out_path.stat().st_size
