#!/usr/bin/env python3
"""Generates the making-of book's review register: reviews/index.json and
reviews.html, from the markdown under v2/books/making-a-book/reviews/.

A review is one reading of the book at one version, with its items recorded so
each can be answered, disagreed with or left open in public. The micro-format is
declared in reviews/REVIEWS.md and gated here, the same arrangement as the issue
folders: a declared shape a build can check is not the same thing as parsing
prose, and it keeps the source of truth in a file a person edits.

Three gates. A review must name a version the book has ACTUALLY been at, because
a reading of a version that never existed is not a reading. Every item must carry
one of the four declared states. And a review names the version it READ, never the
version it produced, so a review stamped with the current version when the book
has moved since is refused.

Run from anywhere: python3 admin/build/gen_reviews.py
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BOOK = ROOT / "v2" / "books" / "making-a-book"
DIR = BOOK / "reviews"
VERSION = (ROOT / "admin" / "build" / "version.txt").read_text().strip()

REQUIRED = ("review", "book_version", "reviewed", "reviewer", "state")
REVIEW_STATES = {"open", "actioned", "superseded"}
ITEM_STATES = {"open", "actioned", "declined", "superseded"}
NAME = re.compile(r"^r(\d{3})__[a-z0-9-]+\.md$")


def esc(s):
    return (str(s).replace("&", "&amp;").replace("<", "&lt;")
            .replace(">", "&gt;").replace('"', "&quot;"))


def front(text):
    if not text.startswith("---"):
        return {}, text
    end = text.find("\n---", 3)
    if end == -1:
        return {}, text
    fm = {}
    for line in text[3:end].splitlines():
        line = line.split(" #")[0]
        if ":" in line:
            k, v = line.split(":", 1)
            fm[k.strip()] = v.strip()
    return fm, text[end + 4:].lstrip("\n")


def items_of(body):
    """## Item N — title, each carrying a **State:** and an optional **Outcome:**."""
    out = []
    parts = re.split(r"^## Item (\d+)\s*[—-]\s*(.+)$", body, flags=re.M)
    for i in range(1, len(parts), 3):
        n, title, chunk = parts[i], parts[i + 1].strip(), parts[i + 2]
        st = re.search(r"^\*\*State:\*\*\s*(\S+)", chunk, re.M)
        oc = re.search(r"^\*\*Outcome:\*\*\s*(.+)$", chunk, re.M)
        out.append({"n": int(n), "title": title,
                    "state": st.group(1).strip() if st else None,
                    "outcome": oc.group(1).strip() if oc else ""})
    return out


def build():
    meta = json.loads((BOOK / "book.json").read_text())
    history = set(meta.get("former_versions", [])) | {meta["version"]}
    reviews, errors = [], []
    for f in sorted(DIR.glob("r*.md")):
        if not NAME.match(f.name):
            errors.append(f"{f.name}: name must be rNNN__kebab-slug.md")
            continue
        fm, body = front(f.read_text())
        where = f"reviews/{f.name}"
        for k in REQUIRED:
            if k not in fm:
                errors.append(f"{where}: front matter has no {k!r}")
        if fm.get("state") and fm["state"] not in REVIEW_STATES:
            errors.append(f"{where}: state {fm['state']!r} is not "
                          + "/".join(sorted(REVIEW_STATES)))
        bv = fm.get("book_version")
        if bv and bv not in history:
            errors.append(f"{where}: reviews book version {bv}, which this book has never "
                          f"been at (it has been at {', '.join(sorted(history))})")
        title = next((l[2:].strip() for l in body.splitlines() if l.startswith("# ")), f.stem)
        its = items_of(body)
        if not its:
            errors.append(f"{where}: has no items — a review with no findings is a note")
        for it in its:
            if it["state"] not in ITEM_STATES:
                errors.append(f"{where} item {it['n']}: state {it['state']!r} is not "
                              + "/".join(sorted(ITEM_STATES)))
        reviews.append({**{k: fm.get(k) for k in REQUIRED},
                        "file": f.name, "title": title, "source": fm.get("source", ""),
                        "items": its})
    if errors:
        for e in errors:
            print("  ✗ " + e)
        raise SystemExit(f"gen_reviews: {len(errors)} problem(s) against "
                         f"reviews/REVIEWS.md — nothing written")
    return meta, reviews


PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>The reviews &mdash; {title} &mdash; graphs.sgit.ai</title>
<meta name="description" content="Every recorded reading of {title}: what the reader found, item by item, and which findings are still open. {n} review(s), {open} item(s) open.">
<link rel="canonical" href="https://graphs.sgit.ai/v2/books/{slug}/reviews.html">
<meta property="og:type" content="website">
<meta property="og:site_name" content="graphs.sgit.ai">
<meta property="og:url" content="https://graphs.sgit.ai/v2/books/{slug}/reviews.html">
<meta property="og:title" content="The reviews &mdash; {title}">
<meta property="og:description" content="What each reader found, item by item, and what is still open.">
<meta name="twitter:card" content="summary">
<link rel="stylesheet" href="../../../assets/site.css">
<link rel="stylesheet" href="../../../assets/board.css">
</head>
<body>

<nav class="site"><div class="row"></div></nav>

<main class="doc uni-full">
<div class="crumb"><a href="../../../index.html">graphs.sgit.ai</a> &rarr; <a href="../index.html">the books</a> &rarr; <a href="index.html">{short}</a> &rarr; <b>the reviews</b></div>
<h1>The reviews</h1>
<p class="lead">Every recorded reading of this book: <b>{n} review(s)</b>, <b>{items} item(s)</b>, <b>{open} still open</b>. A review is not a change-control pack. A pack asks <em>should we change this?</em> A review reports <em>here is what I found when I read it</em>, and its items stay visible whether or not anything was done about them.</p>

<div class="note"><b>The first review is dated after the work it describes, and says so.</b> The founder read this book at v0.1.0 and opened brief 40 with the finding that its title did not hold. That reading produced the retitle and a change-control pack, and <b>was never recorded as a review</b> &mdash; the estate has had a review register since v0.3.7 and did not use it for the one substantive reading of this book. r001 records it late, because a pack records a decision and a review records what a reader saw, including the parts the decision did not act on.<br>
<b>A review names the version it READ</b>, not the version it produced: r001 is stamped v0.1.0, and the retitle it caused shipped as v0.2.0. The build refuses a review naming a version this book has never been at. The format is <a href="reviews/REVIEWS.md">reviews/REVIEWS.md</a>; the machine surface is <a href="reviews/index.json">reviews/index.json</a>. To see what a reading actually changed, read it beside <a href="changes.html">the version diff</a>.</div>

{body}

<div class="agent">
<h4>For an agent</h4>
<p><a href="reviews/index.json">reviews/index.json</a> carries every review with its items and their states: <code>open</code>, <code>actioned</code>, <code>declined</code>, <code>superseded</code>. An open item is a finding nobody has answered, and it is the half worth reading. To record a reading, write <code>rNNN__kebab-slug.md</code> into <code>reviews/</code> following <a href="reviews/REVIEWS.md">the micro-format</a>; the build gates it. Never edit a review to match what happened: mark it superseded and leave it.</p>
</div>

</main>

<footer class="site"><div class="cols"></div></footer>
</body>
</html>
"""

BADGE = {"open": "open", "actioned": "done", "declined": "blocked",
         "superseded": "queued"}


def main():
    meta, reviews = build()
    n_items = sum(len(r["items"]) for r in reviews)
    n_open = sum(1 for r in reviews for i in r["items"] if i["state"] == "open")
    (DIR / "index.json").write_text(json.dumps({
        "schema": "book-reviews-v1", "version": VERSION, "book": BOOK.name,
        "book_version": meta["version"], "title": meta["title"],
        "totals": {"reviews": len(reviews), "items": n_items, "open": n_open},
        "reviews": reviews}, indent=1, ensure_ascii=False) + "\n")

    blocks = []
    for r in reviews:
        rows = "\n".join(
            f'      <tr><td><b>{i["n"]}</b></td><td>{esc(i["title"])}</td>'
            f'<td><span class="bd-badge bd-{BADGE.get(i["state"], "open")}">{esc(i["state"])}</span></td>'
            f'<td class="small">{esc(i["outcome"])}</td></tr>' for i in r["items"])
        src = (f' &middot; the reading is published verbatim at '
               f'<code>{esc(r["source"])}</code>' if r["source"] else "")
        blocks.append(
            f'<h2 id="{esc(r["review"])}">{esc(r["review"])} &middot; {esc(r["title"])}</h2>\n'
            f'<p class="bd-meta">read at <b>{esc(r["book_version"])}</b> of the book &middot; '
            f'{esc(r["reviewed"])} &middot; {esc(r["reviewer"])} &middot; '
            f'<span class="bd-badge bd-{BADGE.get(r["state"], "open")}">{esc(r["state"])}</span>'
            f'{src} &middot; <a href="reviews/{esc(r["file"])}">the review, raw</a></p>\n'
            f'<div class="tablewrap"><table class="bd-tasks"><thead><tr><th>#</th><th>Finding</th>'
            f'<th>State</th><th>Outcome</th></tr></thead><tbody>\n{rows}\n</tbody></table></div>')

    (BOOK / "reviews.html").write_text(PAGE.format(
        slug=BOOK.name, title=esc(meta["title"]), short=esc(meta["title"].split(":")[0]),
        n=len(reviews), items=n_items, open=n_open, body="\n".join(blocks)))
    print(f"gen_reviews: {len(reviews)} review(s), {n_items} item(s), {n_open} open")


if __name__ == "__main__":
    main()
