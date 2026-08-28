"""bookkit — the parts every book build needs, in one place.

Three writing sessions each wrote their own markdown-to-PDF pipeline, and the three
converged on the same four problems: render markdown the way mdreader.js renders it in
the browser, get figures into print without tripling the file, drive weasyprint, and
count the pages of what came out. The page counter existed in FOUR copies, each carrying
the same comment about having learnt it the hard way.

What lives here is what is genuinely the same for any book. What stays in each book's
own build.py is what is genuinely its own: its shape (parts, order, blurbs), its cover,
its CSS, its page templates. A shared builder that tried to own those would either grow
a flag per book or force the books to look alike, and neither is worth it.

The rule for anything added here: it must already exist twice.
"""
from .markdown_kit import render, emphasis_classes, pair_figures, title_of, esc
from .figures import print_figures, absolutise
from .pdf import build_pdf, page_count
from .chapters import load_chapters

__all__ = [
    "render", "emphasis_classes", "pair_figures", "title_of", "esc",
    "print_figures", "absolutise",
    "build_pdf", "page_count",
    "load_chapters",
]
