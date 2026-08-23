#!/usr/bin/env python3
"""Generates /book/changes/data/ — the text of every version of the book,
extracted from the repository's own release tags, so that book/changes.html
can show a GitHub-style diff between ANY two versions in the browser.

Run from anywhere: python3 admin/build/gen_changes.py
(after gen_book.py, so the current release's manifest is fresh; validate.js
fails the build if the data lacks a snapshot for the current version.)

Founder brief (22 August 2026, the review-workflow memo): for every version
of the book there must be a way to compare versions, ideally any pair, in a
browser-generated view that shows the deltas the way GitHub shows diffs —
change by change, or all in one go, with just the changes or a little
context around them. This is the foundation of the review workflow and of
the future delta editions of the book.

Design: one small JSON file per version, one index. Each snapshot holds the
book's units (the introduction plus every chapter) as a flat list of plain
text blocks extracted from that version's source pages, using the tags as
the archive — the pipeline's own history is the dataset, nothing is stored
twice. Extraction from a tag is deterministic, so a version's file never
changes once its tag exists; each release simply adds one file. The diffing
itself happens client-side in assets/changes.js.
"""
import html as htmlmod
import json
import re
import subprocess
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
VERSION = (ROOT / "admin/build/version.txt").read_text().strip()
OUT = ROOT / "v1/book/changes/data"

# The unit list comes from the book's own manifest: the machine-readable
# projection of gen_book's chapter table, so the two cannot drift.
manifest = json.loads((ROOT / "v1/book/manifest.json").read_text())
UNITS = [("intro", "Introduction", manifest["intro"]["source"])]
UNITS += [(f"ch{ch['n']:02d}", ch["title"], ch["source"]) for ch in manifest["chapters"]]


def git(*args):
    return subprocess.run(["git", *args], cwd=ROOT, capture_output=True, text=True)


def blocks(fragment):
    """Plain-text blocks from a page fragment: split at block-level closing
    tags, strip the rest. Coarser than the DOM and exactly fine for diffing:
    a block is roughly a paragraph, heading, list item or table row."""
    h = re.sub(r"<(script|style)[^>]*>.*?</\1>", "", fragment, flags=re.S)
    h = re.sub(r"<!--.*?-->", "", h, flags=re.S)
    h = re.sub(r'<div class="crumb">.*?</div>', "", h, flags=re.S)
    h = re.sub(r'<div class="pagenav">.*?</div>', "", h, flags=re.S)
    out = []
    for part in re.split(r"</(?:p|h1|h2|h3|h4|li|tr|blockquote|pre|dt|dd|figcaption)>", h):
        t = htmlmod.unescape(re.sub(r"<[^>]+>", " ", part))
        t = re.sub(r"\s+", " ", t).strip()
        if t:
            out.append(t)
    return out


def extract(source, text):
    """The same regions the book projects: <main class="doc"> for a chapter
    page, the hero..footer region for the front page."""
    if source == "index.html":
        m = re.search(r'<header class="hero">.*?(?=<footer class="site">)', text, re.S)
    else:
        m = re.search(r'<main class="doc">(.*?)</main>', text, re.S)
    return blocks(m.group(0 if source == "index.html" else 1)) if m else None


def snapshot(read):
    units = {}
    for key, title, source in UNITS:
        text = read(source)
        if text is None:
            continue
        b = extract(source, text)
        if b:
            units[key] = {"title": title, "blocks": b}
    return units


def semver_key(v):
    return [int(x) for x in v.lstrip("v").split(".")]


tags = sorted((t for t in git("tag").stdout.split() if re.fullmatch(r"v\d+\.\d+\.\d+", t)),
              key=semver_key)

# This generator's completeness depends on ambient repository state: it reads whatever tags
# the local clone happens to hold. A shallow or partial clone therefore produces a version
# diff that is silently missing releases, which is exactly what happened before v0.3.26 —
# fifteen tags present, thirty-three releases published, and nothing checking. The release
# history in admin/versions.html is the authority, so compare against it and fail loudly.
rows = re.findall(r'class="vnum">(v\d+\.\d+\.\d+)<',
                  (ROOT / "admin/versions.html").read_text())
absent = [v for v in rows if v != VERSION and v not in tags]
if absent:
    raise SystemExit(
        "gen_changes: admin/versions.html lists releases this clone has no tag for: "
        + ", ".join(sorted(absent, key=semver_key))
        + ".\nThe version diff would ship with those releases missing and say nothing. "
          "Run `git fetch --tags origin` and re-run.")

OUT.mkdir(parents=True, exist_ok=True)
index = []

for tag in tags:
    if tag == VERSION:
        continue  # the current release is snapshotted from the working tree below

    def read_tag(source, tag=tag):
        # The first edition moved under v1/ at v0.4.0. A tag from before the move holds the
        # page at its old path, one from after holds it under v1/. Try both, newest layout
        # first, so the version diff keeps working across the move instead of silently
        # losing every release before it.
        for candidate in (source, source[3:] if source.startswith("v1/") else "v1/" + source):
            r = git("show", f"{tag}:{candidate}")
            if r.returncode == 0:
                return r.stdout
        return None

    d = git("log", "-1", "--format=%ad", "--date=format:%-d %B %Y", tag).stdout.strip()
    (OUT / f"{tag}.json").write_text(json.dumps(
        {"version": tag, "date": d, "units": snapshot(read_tag)},
        ensure_ascii=False) + "\n")
    index.append({"v": tag, "date": d})

def read_tree(source):
    p = ROOT / source
    return p.read_text() if p.exists() else None

today = date.today().strftime("%-d %B %Y")
(OUT / f"{VERSION}.json").write_text(json.dumps(
    {"version": VERSION, "date": today, "units": snapshot(read_tree)},
    ensure_ascii=False) + "\n")
index.append({"v": VERSION, "date": today})

(OUT / "index.json").write_text(json.dumps({"versions": index}, ensure_ascii=False) + "\n")
total = sum(f.stat().st_size for f in OUT.glob("*.json"))
print(f"gen_changes: {len(index)} versions ({index[0]['v']} … {index[-1]['v']}), "
      f"{len(UNITS)} units, {total:,} bytes in book/changes/data/")
