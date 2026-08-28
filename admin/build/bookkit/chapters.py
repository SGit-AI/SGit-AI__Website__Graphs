"""The chapter record: the one shape every book build passes around.

A chapter is its stem (the numbered filename), its slug (the published name), its title
(the first heading), its word count, and the SHA-256 of its markdown. The hash is what
lets book.json's per-book version gate tell a content change from a rebuild, so it is
computed from the FILE BYTES, never from the rendered text.
"""
import hashlib
from pathlib import Path

from .markdown_kit import title_of


def load_chapters(content_dir, order=None, blurbs=None):
    """Read the book's markdown into chapter records, in `order` if given (a list of
    stems) or filename order otherwise. `blurbs` maps stem -> one-line description."""
    content_dir = Path(content_dir)
    stems = order if order is not None else [p.stem for p in sorted(content_dir.glob("*.md"))]
    out = []
    for stem in stems:
        path = content_dir / f"{stem}.md"
        raw = path.read_bytes()
        md = raw.decode("utf-8")
        out.append(dict(
            stem=stem,
            slug=stem.split("__", 1)[1] if "__" in stem else stem,
            title=title_of(md),
            blurb=(blurbs or {}).get(stem, ""),
            words=len(md.split()),
            sha256=hashlib.sha256(raw).hexdigest(),
            path=path,
            md=md,
        ))
    return out
