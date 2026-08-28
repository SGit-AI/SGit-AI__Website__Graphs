"""Markdown to HTML, the way the browser does it.

The estate's rule is that a page renders its own markdown client-side through
assets/mdreader.js (marked), so the page can never drift from the file it claims to
render. Print has no browser, so this module has to produce the same HTML from the same
source. That is why the extension set is a parameter and not a constant: each book pins
the extensions its own prose uses, and pinning them in the book keeps the choice visible
where the prose is written.
"""
import html as _html
import re

# What both shipped books use. A book may pass its own; smarty is the one real
# divergence (making-a-book wants typographic quotes, fsg does not).
DEFAULT_EXTENSIONS = ["tables", "fenced_code", "attr_list", "sane_lists"]


def esc(t):
    return _html.escape(str(t), quote=True)


def render(md_text, extensions=None, output_format=None):
    """Markdown -> HTML. Raw HTML in the source (the note / warn / claim divs) passes
    through untouched, which is exactly why the same markdown renders identically in the
    browser through marked."""
    import markdown
    kw = {"extensions": list(DEFAULT_EXTENSIONS if extensions is None else extensions)}
    if output_format:
        kw["output_format"] = output_format
    return markdown.markdown(md_text, **kw)


def title_of(md):
    """The first level-one heading is the chapter's title."""
    m = re.search(r"^#\s+(.+)$", md, re.M)
    return m.group(1).strip() if m else "Untitled"


def emphasis_classes(h):
    """A paragraph that is entirely one emphasis run is either a figure caption (it
    starts "Figure") or the chapter's promise line. Both want their own styling in print,
    and neither should turn every inline emphasis into a block, which is what a bare
    p > em:only-child selector does."""
    def repl(m):
        inner = m.group(1)
        text = re.sub(r"<[^>]+>", "", inner).strip()
        cls = "figcap" if text.startswith("Figure") else "promise"
        return f'<p class="{cls}"><em>{inner}</em></p>'
    return re.sub(r"<p><em>(.*?)</em></p>", repl, h, flags=re.S)


FIGPAIR = re.compile(r'<p>(<img\b[^>]*>)</p>\s*<p><em>(Figure \d+\..*?)</em></p>', re.S)


def pair_figures(h):
    """<p><img></p> followed by <p><em>Figure N. …</em></p> becomes one <figure>, so the
    caption cannot be orphaned onto the next page away from its image."""
    return FIGPAIR.sub(
        lambda m: f'<figure>{m.group(1)}<figcaption>{m.group(2)}</figcaption></figure>', h)
