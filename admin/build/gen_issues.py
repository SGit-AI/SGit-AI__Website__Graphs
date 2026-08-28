#!/usr/bin/env python3
"""Generates v2/team/issues.html — the folder explorer over every role's issue
tree, on the Issues-FS-lite pattern (v2/team/ISSUES.md).

The same shell as the document and book explorers, with one addition: an issue
file gets its own view, because in this pattern the FOLDER is the status and a
renderer that showed only the front matter would hide the one field that matters
by not being a field.

The manifest is generated, so a `git mv` between open/ and blocked/ moves the
issue in the tree with no other edit. That is the whole point of the pattern and
it is worth stating: nothing here is a second copy of the status.

Run from anywhere: python3 admin/build/gen_issues.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TEAM = ROOT / "v2" / "team"
VERSION = (ROOT / "admin" / "build" / "version.txt").read_text().strip()
ORDER = ["open", "blocked", "done"]


def esc(s):
    return (str(s).replace("&", "&amp;").replace("<", "&lt;")
            .replace(">", "&gt;").replace('"', "&quot;"))


def manifest():
    """One folder entry per role per state that holds anything, plus the spec.
    Open and blocked start expanded; done does not, because done is the archive."""
    folders, counts = [], {"open": 0, "blocked": 0, "done": 0}
    spec = TEAM / "ISSUES.md"
    if spec.exists():
        folders.append({"label": "the pattern", "base": "", "open": True,
                        "files": [{"n": spec.name, "b": spec.stat().st_size}]})
    for state in ORDER:
        for role in sorted(d for d in TEAM.iterdir() if d.is_dir()):
            d = role / "issues" / state
            if not d.is_dir():
                continue
            files = sorted(f for f in d.iterdir() if f.is_file() and f.suffix == ".md")
            if not files:
                continue
            counts[state] += len(files)
            folders.append({
                "label": f"{role.name} &middot; {state}",
                "base": f"{role.name}/issues/{state}",
                "open": state != "done",
                "files": [{"n": f.name, "b": f.stat().st_size} for f in files]})
    return folders, counts


PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>The issue tree &mdash; the team &mdash; graphs.sgit.ai</title>
<meta name="description" content="Every role's own work plan, on the Issues-FS-lite pattern: three folders, the folder is the status, four git mv operations, and the writer rule. {open} open, {blocked} blocked, {done} done.">
<link rel="canonical" href="https://graphs.sgit.ai/v2/team/issues.html">
<meta property="og:type" content="website">
<meta property="og:site_name" content="graphs.sgit.ai">
<meta property="og:url" content="https://graphs.sgit.ai/v2/team/issues.html">
<meta property="og:title" content="The issue tree">
<meta property="og:description" content="Each agent's own work plan, as files. The folder is the status.">
<meta name="twitter:card" content="summary">
<link rel="stylesheet" href="../../assets/site.css">
<link rel="stylesheet" href="../../assets/universe.css">
<link rel="stylesheet" href="../../assets/board.css">
</head>
<body>

<nav class="site"><div class="row"></div></nav>

<main class="doc uni-full">
<div class="crumb"><a href="../../index.html">graphs.sgit.ai</a> &rarr; <a href="../index.html">the second edition</a> &rarr; <a href="index.html">the team</a> &rarr; <b>the issue tree</b></div>
<h1>The issue tree</h1>
<p class="lead">Each role's own work plan, kept as files it owns: <b>{open} open, {blocked} blocked, {done} done</b> across {roles} roles. <b>The status is the folder.</b> There is no status field to forget, and moving an issue is <code>git mv</code>. Four operations, no tool, and none needed: this is the <a href="https://issues-fs.sgit.ai/lite/index.html">Issues-FS-lite</a> pattern, from the project the three February 2026 documents in this estate's corpus were written for.</p>

<div class="note"><b>The writer rule.</b> You may <em>read</em> another role's folder. You must <b>not write into it</b>. Tasks arrive by request, not by being filed on someone else's behalf, and a role that edits another's work plan has taken a decision that was not its to take. No build can check this; the diff can. <br>
<b>What the layout gives away for free.</b> <code>find v2/team -path '*/issues/open/*.md'</code> is a whole-team status view with no tooling at all. The table below is that command, rendered. The counts feed the making-of book's <a href="../books/making-a-book/board.html">project board</a>, which reads these files rather than holding its own copy.</div>

<div id="filex" class="fx"></div>

<h2 id="pattern">Why the folder and not a field</h2>
<p>A status field is a second place the truth can live, and the two places disagree the first time somebody edits one and not the other. A folder cannot disagree with itself. The cost is that a status change is a file move rather than an edit, which is exactly what makes it show up in a diff as a move, and what lets the whole state of the team be read by <code>find</code> rather than by a query.</p>
<p>The build refuses a file that does not hold to the pattern: no <code>created</code> or <code>priority</code>, a priority outside high/medium/low, a file in <code>blocked/</code> that does not say what it is blocked on, a file in <code>done/</code> with no closed date, or a <code>blocked_on</code> on a file that is not in <code>blocked/</code>. All five were run red before the gate was trusted.</p>

<div class="agent">
<h4>For an agent</h4>
<p>Read <a href="ISSUES.md">ISSUES.md</a> first: it is the whole specification, including the four operations and the writer rule. To open an issue, write <code>NNN-kebab-slug.md</code> into <b>your own</b> <code>issues/open/</code>, numbered from 001 within your folder, with <code>created</code> and <code>priority</code> in the front matter and your action plan as the body. If you do not yet know how to approach it, the specification's own instruction is to write that down rather than leave the body empty. Commit an issue change in the same commit as the work that caused it.</p>
</div>

</main>

<footer class="site"><div class="cols"></div></footer>
<script>window.FILEX = {manifest};</script>
<script src="../../assets/vendor/marked.min.js"></script>
<script type="module" src="../../assets/book-files.js"></script>
</body>
</html>
"""


def main():
    folders, counts = manifest()
    roles = len({f["base"].split("/")[0] for f in folders if "/" in f["base"]})
    (TEAM / "issues.html").write_text(PAGE.format(
        manifest=json.dumps({"slug": "team-issues", "kind": "issues", "folders": folders}),
        roles=roles, **counts))
    print(f'gen_issues: {counts["open"]} open, {counts["blocked"]} blocked, '
          f'{counts["done"]} done across {roles} role(s), '
          f'{len(folders)} folder(s) in the tree')


if __name__ == "__main__":
    main()
