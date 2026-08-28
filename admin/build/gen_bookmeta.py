#!/usr/bin/env python3
"""Per-book versioning (brief 39): each book carries its own version, and it moves
only when the book's CONTENT moves.

Run from anywhere: python3 admin/build/gen_bookmeta.py [--check]

The founder's rule, stated in the memo: "every time you make a change to the GitHub
repo, you increase... the version number in the repo. But each book in itself also has
its own versions, which is every time we change the content of that book. So if we make
a change to the plumbing or to the technology that is used... but we don't change the
content of the book, then the version of the book doesn't change."

This generator holds both halves of that rule honest. Every book folder carries a
`book.json` naming its own version and the SHA-256 of every chapter markdown file. On
each build the hashes are recomputed:

  * content changed but the version did not move  -> the build fails
  * the version moved but no content changed      -> the build fails
  * neither moved, or both moved                  -> the manifest is rewritten and passes

v1.0.0 is reserved for the actual final release of a book. A book below 1.0 is openly
still under review, which is exactly what a Leanpub reader should be able to see.
"""
import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(Path(__file__).resolve().parent))
from bookkit import page_count  # noqa: E402
BOOKS = ROOT / "v2" / "books"
SITE_VERSION = (ROOT / "admin" / "build" / "version.txt").read_text().strip()

# The authored half: what each book is, and the version it is at. Everything else in
# book.json is derived. Edit the version here when the content changes.
REGISTER = {
    "fsg": {
        "title": "Fractal Semantic Graphs: Meaning Through Connectivity",
        "version": "v0.2.0",
        "status": "under review",
        "release": "the Leanpub pair",
        "note": "The second edition of the argument the frozen first book made.",
    },
    "making-a-book": {
        "title": "Creating a Book Using Fractal Semantic Graphs",
        "version": "v0.1.0",
        "status": "under review",
        "release": "the Leanpub pair",
        "note": "The making-of, for authors who want to use the same agentic workflow.",
    },
    "fsg-universe": {
        "title": "The Universe Volume for Fractal Semantic Graphs",
        "version": "v0.1.0",
        "status": "held",
        "release": "not in this release",
        "note": "Stays on the site; returned to later (brief 39).",
    },
}

SEMVER = re.compile(r"^v(\d+)\.(\d+)\.(\d+)$")


def chapter_hashes(folder):
    """Every chapter markdown, hashed. This IS the book's content, by definition."""
    out = {}
    for md in sorted((folder / "content").glob("*.md")):
        out[md.name] = hashlib.sha256(md.read_bytes()).hexdigest()
    return out


def main(check_only=False):
    problems, lines = [], []
    for slug, spec in REGISTER.items():
        folder = BOOKS / slug
        if not folder.is_dir():
            problems.append(f"{slug}: no folder")
            continue
        if not SEMVER.match(spec["version"]):
            problems.append(f"{slug}: version {spec['version']!r} is not vN.N.N")
            continue

        now = chapter_hashes(folder)
        meta_path = folder / "book.json"
        prev = {}
        if meta_path.exists():
            try:
                prev = json.loads(meta_path.read_text())
            except json.JSONDecodeError:
                prev = {}

        prev_hashes = prev.get("content_hashes") or {}
        prev_version = prev.get("version")
        # a book.json written before this generator carried the SITE version in
        # `version`; that is the confusion this generator exists to end.
        if prev_version and not SEMVER.match(str(prev_version)):
            prev_version = None
        # with no stored hashes this book has never been managed here, so we cannot
        # know whether its content moved and must not judge: adopt it as it stands.
        adopting = not prev_hashes
        content_moved = not adopting and prev_hashes != now
        version_moved = not adopting and bool(prev_version) and prev_version != spec["version"]

        if content_moved and not version_moved:
            changed = sorted(set(now) ^ set(prev_hashes)) or [
                f for f in now if prev_hashes.get(f) != now[f]]
            problems.append(
                f"{slug}: content changed ({', '.join(changed[:4])}"
                f"{', …' if len(changed) > 4 else ''}) but the book is still at "
                f"{spec['version']} — move it in gen_bookmeta.REGISTER")
        if version_moved and not content_moved:
            problems.append(
                f"{slug}: the version moved {prev_version} -> {spec['version']} but no "
                f"chapter changed — a book's version tracks its content, not the site's")

        words = sum(len(md.read_text().split()) for md in sorted((folder / "content").glob("*.md")))
        pdf = next((p for p in folder.glob("*.pdf")), None)
        # Counted from the file, for every book — not read back from whatever the book's
        # own builder happened to record. Only one of the three writes a build.json, and a
        # page count that exists for one book and not the others is a number nobody can
        # use. Anything quoting these (the front page, the shelf) then quotes a
        # measurement rather than a memory.
        pages = page_count(pdf) if pdf else None
        # a book's own builder writes build.json (its pages, its parts, its figures).
        # It is folded in here rather than merged key-by-key, because book.json has one
        # writer and this is where the two halves meet.
        build_path = folder / "build.json"
        build = json.loads(build_path.read_text()) if build_path.exists() else None
        meta = {
            "title": spec["title"],
            "slug": slug,
            "version": spec["version"],
            "status": spec["status"],
            "release": spec["release"],
            "note": spec["note"],
            "chapters": len(now),
            "words": words,
            "pdf": pdf.name if pdf else None,
            "pdf_pages": pages,
            "built_at_site_version": SITE_VERSION,
            "versioning": ("This book's version moves only when its content moves; the "
                           "site's version moves on every push. v1.0.0 is reserved for "
                           "the actual final release."),
            "content_hashes": now,
            "build": build,
        }
        # Nothing is carried over from the previous file. It used to be, back when the
        # book's builder wrote here too and its keys had to survive; build.json ended
        # that, and carrying keys forward only preserves stale ones forever.
        if not check_only:
            meta_path.write_text(json.dumps(meta, indent=1, ensure_ascii=False) + "\n")
        lines.append(f"{slug} {spec['version']} ({len(now)} chapters, {words:,} words, "
                     f"{pages or '?'}pp, {spec['status']})")

    write_shelf(check_only)

    if problems:
        for p in problems:
            print(f"gen_bookmeta: ERROR {p}", file=sys.stderr)
        raise SystemExit(1)
    print("gen_bookmeta: " + " · ".join(lines))


SHELF = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>The books &mdash; graphs.sgit.ai</title>
<meta name="description" content="The books this estate has produced: Fractal Semantic Graphs: Meaning Through Connectivity, Creating a Book Using Fractal Semantic Graphs, and the Universe volume. Each with its own version, its markdown, its web edition and one print PDF.">
<link rel="canonical" href="https://graphs.sgit.ai/v2/books/index.html">
<meta property="og:type" content="website">
<meta property="og:site_name" content="graphs.sgit.ai">
<meta property="og:url" content="https://graphs.sgit.ai/v2/books/index.html">
<meta property="og:title" content="The books">
<meta property="og:description" content="Three books, each versioned on its own content rather than on the site's releases.">
<meta name="twitter:card" content="summary">
<link rel="stylesheet" href="../../assets/site.css">
</head>
<body>

<nav class="site"><div class="row"></div></nav>

<main class="doc">
<div class="crumb"><a href="../../index.html">graphs.sgit.ai</a> &rarr; <b>the books</b></div>
<h1>The books</h1>
<p class="lead">Three books, written out of this estate and living inside it. Each one is
markdown first: the chapters are the source of truth, the web edition renders them, and one
print PDF carries the whole thing offline. <b>Each book also carries its own version</b>,
and that version moves only when the book&rsquo;s content moves &mdash; the site&rsquo;s
version, in the badge above, moves on every push. <b>v1.0.0 is reserved for a book&rsquo;s
actual final release</b>, so a number below it says plainly that the book is still under
review.</p>

{cards}

<h2>How a book is versioned</h2>
<p>The rule comes from <a href="../memos/39-founder-memo-the-review-era-opens.html">brief
39</a>: change the plumbing, the tooling or anything around a book and its version stays
put; change what the book <em>says</em> and the version moves. <code>book.json</code> in
each folder holds the version and the SHA-256 of every chapter, and
<code>admin/build/gen_bookmeta.py</code> fails the build if content moved without the
version moving, or the version moved without content moving.</p>

<div class="pagenav">
  <span><a href="../index.html">&larr; The second edition</a></span>
  <span><a href="../memos/index.html">The memos &rarr;</a></span>
</div>
</main>

<footer class="site"><div class="cols"></div></footer>
<script src="../../assets/nav.js" defer></script>
</body>
</html>
"""

CARD = """<div class="ov-card" style="margin:.7rem 0">
<h3 style="margin:0 0 .2rem"><a href="{slug}/index.html">{title}</a>
<span class="small dim">{version} &middot; {status}</span></h3>
<p class="small">{note}</p>
<p class="small">{chapters} chapters &middot; {words:,} words &middot;{about}
<a href="{slug}/{pdf}">the print PDF</a> &middot;
<a href="{slug}/content/">the markdown</a> &middot;
<a href="{slug}/book.json">book.json</a></p>
</div>
"""


def write_shelf(check_only=False):
    """The shelf hub, generated from the same register that versions the books."""
    cards = []
    for slug in ("fsg", "making-a-book", "fsg-universe"):
        meta = json.loads((BOOKS / slug / "book.json").read_text())
        # only the books being published have a landing page; the held one does not
        about = (f'\n<a href="{slug}/about.html">about this book</a> &middot;'
                 if (BOOKS / slug / "about.html").exists() else "")
        cards.append(CARD.format(
            slug=slug, title=meta["title"], version=meta["version"],
            status=meta["status"], note=meta["note"], chapters=meta["chapters"],
            words=meta["words"], pdf=meta["pdf"] or "", about=about))
    if not check_only:
        (BOOKS / "index.html").write_text(SHELF.format(cards="\n".join(cards)))


if __name__ == "__main__":
    main(check_only="--check" in sys.argv)
