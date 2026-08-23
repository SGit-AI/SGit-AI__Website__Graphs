#!/usr/bin/env python3
"""Generates redirect stubs at the addresses the first edition used before it moved to v1/.

Run from anywhere: python3 admin/build/gen_redirects.py

Every HTML page that moved keeps a stub at its old path: a meta refresh, a canonical link
to the new address, and a visible line saying where it went. The site is two days old and
its outbound links are mostly from sibling sites, so this is cheap insurance rather than
a permanent compatibility layer.

Two addresses cannot be preserved: the print and screen PDFs, because a PDF cannot carry a
redirect. That is stated on the front page and in the dev pack rather than discovered.

Stubs are NOT part of the first edition and are excluded from its freeze manifest.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
V1 = ROOT / "v1"
SKIP = {"content"}          # source markdown was never published at a URL

STUB = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Moved to the first edition &mdash; graphs.sgit.ai</title>
<meta http-equiv="refresh" content="0; url={to}">
<link rel="canonical" href="https://graphs.sgit.ai/{new}">
<meta name="robots" content="noindex">
<link rel="stylesheet" href="{up}assets/site.css">
</head>
<body>
<main class="doc">
<h1>This page moved</h1>
<p class="lead">The first edition of the book was frozen and moved under <code>/v1/</code> at v0.4.0, so that the second edition could be written without overwriting it. This address still works and now redirects.</p>
<p><a href="{to}"><b>Continue to {new}</b></a></p>
<p class="small dim">If you are not redirected automatically, follow the link above. The move is explained on <a href="{up}index.html">the front page</a> and in <a href="{up}dev-pack/03-freezing-the-first-book.html">the dev pack</a>.</p>
</main>
</body>
</html>
"""


STUB2 = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Moved into the second edition's tree &mdash; graphs.sgit.ai</title>
<meta http-equiv="refresh" content="0; url={to}">
<link rel="canonical" href="https://graphs.sgit.ai/{new}">
<meta name="robots" content="noindex">
<link rel="stylesheet" href="{up}assets/site.css">
</head>
<body>
<main class="doc">
<h1>This page moved</h1>
<p class="lead">Everything that belongs to the second edition &mdash; its plan, its memos, its review packs &mdash; moved under <code>/v2/</code> at v0.4.4, so that each edition owns everything it uses. This address still works and now redirects.</p>
<p><a href="{to}"><b>Continue to {new}</b></a></p>
<p class="small dim">If you are not redirected automatically, follow the link above. The rule is explained on <a href="{up}v2/index.html">the second edition's front page</a>.</p>
</main>
</body>
</html>
"""

# Trees that moved from the root into v2/ at v0.4.4. Markdown and PDF files cannot carry a
# redirect; their loss is recorded in the release notes rather than discovered.
V2_MOVED = ("memos", "dev-pack", "packs")


def main():
    n = 0
    for f in sorted(V1.rglob("*.html")):
        rel = f.relative_to(V1).as_posix()
        if rel.split("/")[0] in SKIP:
            continue
        old = ROOT / rel
        if old.exists() and not old.read_text(errors="replace").startswith("<!doctype html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n<title>Moved"):
            continue                                  # never overwrite a live page
        depth = rel.count("/")
        up = "../" * depth
        old.parent.mkdir(parents=True, exist_ok=True)
        old.write_text(STUB.format(to=up + "v1/" + rel, new="v1/" + rel, up=up))
        n += 1
    n2 = 0
    for tree in V2_MOVED:
        for f in sorted((ROOT / "v2" / tree).rglob("*.html")):
            rel = f.relative_to(ROOT / "v2").as_posix()
            old = ROOT / rel
            if old.exists() and "<title>Moved" not in old.read_text(errors="replace")[:400]:
                continue                              # never overwrite a live page
            depth = rel.count("/")
            up = "../" * depth
            old.parent.mkdir(parents=True, exist_ok=True)
            old.write_text(STUB2.format(to=up + "v2/" + rel, new="v2/" + rel, up=up))
            n2 += 1
    print(f"gen_redirects: {n} stub(s) at the first edition's former addresses, "
          f"{n2} at the second edition's")


if __name__ == "__main__":
    main()
