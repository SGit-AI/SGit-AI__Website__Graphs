#!/usr/bin/env python3
"""Generates sitemap.xml from the file tree.

Run from anywhere: python3 admin/build/gen_sitemap.py

It was hand-maintained until v0.4.0, which worked while the tree was small and became a
liability the moment a hundred pages moved at once. validate.js already requires the
sitemap and the tree to agree; generating it removes the only way they could disagree.

Redirect stubs are excluded: they carry noindex and are signposts, not pages. Dates come
from the last commit that touched each file, so a page's lastmod is a fact rather than
the date of the build.
"""
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HOST = (ROOT / "CNAME").read_text().strip()
SKIP_DIRS = {".git", ".github", "node_modules", "assets", "dev-packs"}


def is_stub(p):
    t = p.read_text(errors="replace")
    return '<meta name="robots" content="noindex">' in t and "This page moved" in t


def last_commit(rel):
    r = subprocess.run(["git", "log", "-1", "--format=%ad", "--date=short", "--", rel],
                       cwd=ROOT, capture_output=True, text=True)
    return r.stdout.strip() or subprocess.run(
        ["git", "log", "-1", "--format=%ad", "--date=short"],
        cwd=ROOT, capture_output=True, text=True).stdout.strip()


def main():
    pages = []
    for p in sorted(ROOT.rglob("*.html")):
        rel = p.relative_to(ROOT).as_posix()
        if rel.split("/")[0] in SKIP_DIRS or is_stub(p):
            continue
        pages.append(rel)
    for pdf in sorted(ROOT.rglob("*.pdf")):
        rel = pdf.relative_to(ROOT).as_posix()
        if rel.split("/")[0] not in SKIP_DIRS:
            pages.append(rel)

    # the front page first, then the second edition's plan, then the first edition
    def rank(r):
        return (0 if r == "index.html" else 1 if r.startswith("dev-pack/")
                else 2 if not r.startswith("v1/") else 3, r)

    rows = "\n".join(
        f"  <url><loc>https://{HOST}/{r}</loc><lastmod>{last_commit(r)}</lastmod></url>"
        for r in sorted(set(pages), key=rank))
    (ROOT / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        f"{rows}\n</urlset>\n")
    print(f"gen_sitemap: {len(set(pages))} page(s), stubs excluded")


if __name__ == "__main__":
    main()
