"""Getting figures into print without tripling the file.

The web keeps crisp palette PNGs. WeasyPrint re-encodes a PNG into a flate stream of raw
pixels, so a book that is 4MB as JPEGs lands at 10MB+ as PNGs — and these books are meant
to be downloaded before a flight. print_figures writes JPEGs of the same pixels to a
scratch directory outside the repo and hands back a rewriter that points the print HTML
at them. Nothing about the figures changes, only how they are carried into the PDF.

The scratch directory is a temp directory, not a folder in the book: a stray print
artefact inside v2/ fails the chrome gate, which is the right gate for it to fail.
"""
import re
import shutil
import tempfile
from pathlib import Path


def print_figures(figures_dir, max_width=1500, quality=86):
    """JPEG the book's PNGs into a scratch directory. Returns (rewrite, cleanup):
    `rewrite(html)` repoints ../figures/x.png at the scratch JPEG by absolute path so
    weasyprint resolves it wherever the build ran from, and `cleanup()` removes the
    directory. Call cleanup in a finally so a failed build leaves nothing behind."""
    figures_dir = Path(figures_dir)
    scratch = Path(tempfile.mkdtemp(prefix="bookkit-figs-"))
    from PIL import Image
    for src in sorted(figures_dir.glob("*.png")):
        im = Image.open(src).convert("RGB")
        if im.width > max_width:
            im = im.resize((max_width, round(im.height * max_width / im.width)), Image.LANCZOS)
        im.save(scratch / (src.stem + ".jpg"), quality=quality, optimize=True,
                progressive=True, subsampling=0)

    def rewrite(h):
        return re.sub(r'src="(?:\.\./)?figures/([^"]+)\.png"',
                      lambda m: f'src="{scratch.as_posix()}/{m.group(1)}.jpg"', h)

    def cleanup():
        shutil.rmtree(scratch, ignore_errors=True)

    return rewrite, cleanup


def absolutise(h, base):
    """Resolve every <img src> against `base` and fail loudly on a missing file.

    Figure paths in chapter markdown are relative to the BOOK FOLDER, not to content/,
    because that is where the rendered pages live and mdreader.js resolves an image
    against the page that renders it, never against the markdown file. The print HTML is
    rendered from a string, so the paths have to be resolved here — and a missing figure
    should stop the build, not be discovered later as a blank box in the PDF."""
    base = Path(base)

    def sub(m):
        p = (base / m.group(2)).resolve()
        if not p.exists():
            raise SystemExit(f"bookkit: figure not found: {m.group(2)}")
        return f'<img alt="{m.group(1)}" src="{p.as_uri()}">'
    return re.sub(r'<img alt="([^"]*)" src="([^"]+)"\s*/?>', sub, h)
