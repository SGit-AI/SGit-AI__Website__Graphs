#!/usr/bin/env python3
"""Generates the making-of book's project board: four JSON files under
v2/books/making-a-book/boards/ plus the page that renders them.

The schemas are sgraph.ai's (project-workstreams-v2, project-issues-v1,
project-agents-v2, project-releases-v1), taken verbatim so a board here can be
read by that dashboard and the reverse. Its own guide recommends the static
option for project tracking, which is what this is: JSON in the repository,
rendered client-side, no server and no vault.

WHAT IS AUTHORED AND WHAT IS DERIVED, and why the line falls where it does:

  authored   the workstreams and their tasks, and the issues. A stage's status
             is a judgement about work, exactly as a book's version move is, and
             this estate's rule since v0.6.5 is that a judgement is written down
             once rather than inferred from prose. Parsing "waiting at stage 5"
             out of a record would be guessing at a sentence.
  derived    the agent roster (from v2/team/*/role.md and the debriefs each role
             has actually produced), and the releases (from the book's own
             two-clock changelog in book.json). Both are counts, not opinions.

Two gates run here: every change-control pack stamped for this book must appear
in the register, so a new pack cannot be silently missing from the board, and
every task status must be one the renderer knows.

Run from anywhere: python3 admin/build/gen_board.py
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BOOK = ROOT / "v2" / "books" / "making-a-book"
OUT = BOOK / "boards"
PACKS = ROOT / "v2" / "dev-packs"
TEAM = ROOT / "v2" / "team"
VERSION = (ROOT / "admin" / "build" / "version.txt").read_text().strip()

STATUSES = {"queued", "next", "in-progress", "done", "blocked"}
STAGES = ["plan", "map", "define", "review", "approve",
          "implement", "approve the implementation"]

# ---------------------------------------------------------------- authored

# A change-control pack is a workstream and its seven stages are its tasks.
# `done` through `stage`; the stage itself carries its own status.
CONTROL = [
    {"id": "WS-01", "pack": "making-a-book__v0.1.0__the-naming-question",
     "title": "The naming question", "color": "#6366f1",
     "description": "Is the book's title right? The first run of the seven-stage workflow, "
                    "on a deliberately small question. The title was decided at v0.6.9; "
                    "the cover and the audience are still open.",
     "done_through": 4, "stage_status": "blocked", "waiting_on": "the founder",
     "notes": {5: "Two of three questions still open: does the cover name Claude, "
                  "and is 'Making a Book with Agents' the decision or a placeholder"}},
    {"id": "WS-02", "pack": "making-a-book__v0.2.0__the-workflow-document",
     "title": "The workflow document", "color": "#0d9488",
     "description": "Brief 45: write a source document about workflows and connect it to "
                    "the book. The document shipped at v0.6.11; connecting it changes the "
                    "book, so it is in front of the founder.",
     "done_through": 4, "stage_status": "blocked", "waiting_on": "the founder",
     "notes": {5: "Four questions: connect it (book moves to v0.3.0), name the process, "
                  "which book gets part one, build QA's quotation gate",
               6: "3,500 to 4,500 words: a new chapter plus a vocabulary pass"}},
]

# A pack that plans activities rather than running the seven stages carries its
# own task list; the gate below still requires it to be here.
PLANS = [
    {"id": "WS-08", "pack": "making-a-book__v0.1.0__the-book-as-a-graph",
     "title": "The book as a graph", "color": "#be185d",
     "description": "Brief 43: put the whole book through the decomposition built for one "
                    "pilot document, so JSON becomes the source of truth. Seven activities, "
                    "each naming what it produces and how it is checked.",
     "href": "../../dev-pack/bookgraph-00-the-plan.html",
     "tasks": [
         {"id": "WS-08-A1", "title": "A1 — parameterise the decomposition", "status": "done",
          "owner": "@developer", "note": "v0.6.10; the pilot's output byte-identical afterwards"},
         {"id": "WS-08-A2", "title": "A2 — add the book level", "status": "done",
          "owner": "@developer", "note": "v0.6.10; 17 chapters, 27,002 words, every chapter byte-identical"},
         {"id": "WS-08-A3", "title": "A3 — run the book and let the gates find the strains",
          "status": "done", "owner": "@qa", "note": "ran clean in A2; the strains did not appear"},
         {"id": "WS-08-A4", "title": "A4 — the five levels", "status": "queued", "owner": "@researcher",
          "note": "the pack marks the table a proposal, not a result"},
         {"id": "WS-08-A5", "title": "A5 — the observability brief 43 ranks above the output",
          "status": "next", "owner": "@developer",
          "note": "the file explorer at v0.6.12 is the first half of this"},
         {"id": "WS-08-A6", "title": "A6 — the restructure, as a transformation", "status": "queued",
          "owner": "@developer", "note": "depends on part one being decided"},
         {"id": "WS-08-A7", "title": "A7 — the five samples", "status": "queued", "owner": "@writer"},
     ]},
]

# Work on this book that is not a pack at all.
OTHER = [
    {"id": "WS-03", "title": "Part one: the art of the possible", "color": "#d97706",
     "status": "queued",
     "description": "Briefs 42, 44 and 45 all ask the book to open by showing what writing "
                    "a book here gets you, before telling the story of getting there.",
     "href": "../../dev-pack/features-00-the-capability-register.html",
     "tasks": [
         {"id": "WS-03a", "title": "Count what part one could truthfully show", "status": "done",
          "owner": "@researcher", "note": "the capability register, v0.6.7"},
         {"id": "WS-03b", "title": "The founder's Leanpub failure story as source material",
          "status": "done", "owner": "@founder", "note": "sources/the-leanpub-years.md, v0.6.9"},
         {"id": "WS-03c", "title": "Confirm the screenshots that show the workflow", "status": "done",
          "owner": "@qa", "note": "figures 08, 17, 18, 19 already show it; the earlier claim was wrong"},
         {"id": "WS-03d", "title": "Decide which book part one opens", "status": "blocked",
          "owner": "@founder", "note": "brief 45 says 'the first book'; read here as the making-of"},
         {"id": "WS-03e", "title": "Write it", "status": "queued", "owner": "@writer"},
     ]},
    {"id": "WS-04", "title": "The version diff", "color": "#9333ea", "status": "next",
     "description": "Brief 45 asks to read the changes between two versions of the book, and "
                    "sets the bar at a diff computed from the graphs rather than the markdown: "
                    "'that would be the really test measurement of our success here'.",
     "tasks": [
         {"id": "WS-04a", "title": "A book graph per chapter, with identities that survive an edit",
          "status": "done", "owner": "@developer", "note": "v0.6.10"},
         {"id": "WS-04b", "title": "Text diff between two book versions from the tags",
          "status": "next", "owner": "@developer",
          "note": "the mechanism exists for the first edition at /v1/book/changes.html"},
         {"id": "WS-04c", "title": "Store a graph per book version", "status": "queued",
          "owner": "@developer", "note": "only the current version has one; this is the gap"},
         {"id": "WS-04d", "title": "Diff the graphs, not the markdown", "status": "queued",
          "owner": "@developer", "note": "the measure of success the memo names"},
     ]},
    {"id": "WS-05", "title": "The gates the reviews asked for", "color": "#dc2626", "status": "next",
     "description": "Two gates QA has requested and neither is built. Both protect claims the "
                    "book makes about itself.",
     "tasks": [
         {"id": "WS-05a", "title": "Quoted founder text must be verbatim in the brief it cites",
          "status": "next", "owner": "@qa",
          "note": "earned at v0.6.11: 18 of 25 quotations had been smoothed before a script caught them"},
         {"id": "WS-05b", "title": "File paths named in prose must exist", "status": "next",
          "owner": "@qa", "note": "asked at v0.6.3; two instances of the defect found by reading since"},
         {"id": "WS-05c", "title": "A book is called the same thing everywhere", "status": "done",
          "owner": "@qa", "note": "built at v0.6.3, run red against a half-finished rename first"},
     ]},
    {"id": "WS-06", "title": "Publishing", "color": "#0891b2", "status": "queued",
     "description": "The book is built and waiting. The publisher's position is to hold the "
                    "upload until the restructure lands rather than put a superseded version "
                    "on a store.",
     "tasks": [
         {"id": "WS-06a", "title": "Cover, metadata, sample, landing page", "status": "done",
          "owner": "@publisher", "note": "v0.5.19"},
         {"id": "WS-06b", "title": "Leanpub upload", "status": "blocked", "owner": "@founder",
          "note": "held deliberately until part one lands"},
     ]},
    {"id": "WS-07", "title": "The project board", "color": "#65a30d", "status": "in-progress",
     "description": "This board. Issues-FS for the coordination around the book, sgraph.ai's "
                    "board schemas for seeing it.",
     "tasks": [
         {"id": "WS-07a", "title": "Read the reference dashboard and its schemas", "status": "done",
          "owner": "@developer", "note": "sgraph.ai/en-gb/library/guides/dev-board-system.md"},
         {"id": "WS-07b", "title": "Adopt the four schemas verbatim, write our own renderer",
          "status": "done", "owner": "@developer",
          "note": "their guide publishes an unescaped-interpolation defect; ours escapes everything"},
         {"id": "WS-07c", "title": "Derive the board from the packs, the team and the changelog",
          "status": "done", "owner": "@developer"},
         {"id": "WS-07d", "title": "Per-agent task folders on the Issues-FS-lite pattern",
          "status": "queued", "owner": "@developer",
          "note": "issues/open|blocked|done per agent, four mv operations, the writer rule"},
     ]},
]

ISSUES = [
    {"id": "MAB-01", "title": "Authored prose has no verbatim gate",
     "status": "open", "priority": "high", "owner": "@qa",
     "description": "An extraction cannot cite words that are not in the source; authored prose "
                    "can. Eighteen of twenty-five founder quotations in the workflow document "
                    "had been smoothed into readability before a script caught them.",
     "href": "../../dev-pack/mab-workflow-00-the-record.html"},
    {"id": "MAB-02", "title": "File paths named in prose are not checked",
     "status": "open", "priority": "high", "owner": "@qa",
     "description": "Chapters 4 and 15 named a test file the day it was deleted. The "
                    "researcher's first debrief named a brief path renamed four releases "
                    "earlier. Both found by reading.",
     "href": "../../dev-pack/mab-naming-00-the-record.html"},
    {"id": "MAB-03", "title": "The title is not yet earned by the body",
     "status": "open", "priority": "high", "owner": "@editor",
     "description": "The book is called Creating a Book Using Agentic Workflows and its own "
                    "graph counts workflow six times in 27,002 words. Closing this is what "
                    "part one and the vocabulary pass are for.",
     "href": "../../universe/agentic-workflows.html"},
    {"id": "MAB-04", "title": "Does the cover name Claude?",
     "status": "blocked", "priority": "medium", "owner": "@founder",
     "description": "Brief 40 said 'writing a book with Claude'; brief 41 said 'making a book "
                    "with agents'. The book names Claude four times. The two memos point "
                    "different ways and it has not been decided.",
     "href": "../../dev-pack/mab-naming-00-the-record.html"},
    {"id": "MAB-05", "title": "A graph diff needs a graph per book version",
     "status": "open", "priority": "medium", "owner": "@developer",
     "description": "Only the current version has a graph, so the diff the founder asked for "
                    "cannot be computed backwards yet. A text diff is available from the tags "
                    "today and should not be mistaken for the answer."},
    {"id": "MAB-06", "title": "Issues-FS is missing from the network page",
     "status": "open", "priority": "low", "owner": "@librarian",
     "description": "Logged as task T31 in the v0.3.27 pack and still open. Their site cites "
                    "this one for the philosophy; this one does not list them at all."},
    {"id": "MAB-07", "title": "The fractal principle's February origin is not credited in prose",
     "status": "open", "priority": "medium", "owner": "@researcher",
     "description": "Part 3 of Thinking in Graphs, written for Issues-FS on 5 February 2026, "
                    "names and works through the fractal principle five months before the "
                    "document called Fractal Semantic Graphs. The anchored extraction holds it; "
                    "the timeline in origins.md does not say it."},
    {"id": "MAB-08", "title": "Per-agent task folders are not built",
     "status": "open", "priority": "medium", "owner": "@developer",
     "description": "The board shows the workstreams. The day-to-day list each agent owns, on "
                    "the Issues-FS-lite pattern with the writer rule, does not exist yet."},
]


def esc(s):
    return (str(s).replace("&", "&amp;").replace("<", "&lt;")
            .replace(">", "&gt;").replace('"', "&quot;"))


# ---------------------------------------------------------------- derived

def control_workstreams():
    """A pack becomes a workstream whose tasks are the seven stages."""
    out = []
    for c in CONTROL:
        folder = PACKS / c["pack"]
        if not folder.is_dir():
            raise SystemExit(f"gen_board: register names a pack that does not exist: {c['pack']}")
        tasks = []
        for i, name in enumerate(STAGES, start=1):
            if i <= c["done_through"]:
                status = "done"
            elif i == c["done_through"] + 1:
                status = c["stage_status"]
            else:
                status = "queued"
            tasks.append({"id": f'{c["id"]}-s{i}', "title": f"{i}. {name}", "status": status,
                          "owner": "@founder" if name.startswith("approve") else "@team",
                          "note": c.get("notes", {}).get(i, "")})
        slug = c["pack"].split("__")[-1].replace("-", "")
        out.append({"id": c["id"], "title": c["title"], "description": c["description"],
                    "color": c["color"], "waiting_on": c.get("waiting_on"),
                    "pack": c["pack"],
                    "href": f'../../dev-pack/mab-{"naming" if "naming" in c["pack"] else "workflow"}-00-the-record.html',
                    "tasks": tasks})
    return out


def agents():
    """The roster, computed: a role is active if it has produced a debrief for
    the book at its CURRENT version, idle if it has only worked at an earlier
    one. An empty debriefs folder is an honest statement that a role never ran."""
    book_version = json.loads((BOOK / "book.json").read_text())["version"]
    rows = []
    for folder in sorted(d for d in TEAM.iterdir() if d.is_dir()):
        role_md = folder / "role.md"
        if not role_md.exists():
            continue
        text = role_md.read_text()
        m = re.search(r"\|\s*\*\*Core Mission\*\*\s*\|\s*(.+?)\s*\|", text)
        mission = m.group(1) if m else ""
        debriefs = sorted((folder / "debriefs").glob("making-a-book__*.md"))
        at_current = [d for d in debriefs if f"__{book_version}__" in d.name]
        rows.append({
            "alias": "@" + folder.name,
            "id": f"{folder.name}.making-a-book",
            "session_status": "active" if at_current else "idle",
            "model": "agent",
            "role": mission,
            "location": f"v2/team/{folder.name}/",
            "output": (f"{len(debriefs)} debrief(s) on this book"
                       f"{', ' + str(len(at_current)) + ' at ' + book_version if at_current else ''}")
            if debriefs else "has not run on this book",
        })
    return rows


def releases():
    """From the book's own two-clock changelog: its version, the site release
    that carried it, and the reason, which is authored in gen_bookmeta."""
    meta = json.loads((BOOK / "book.json").read_text())
    out = []
    for entry in reversed(meta.get("changelog", [])):
        out.append({"version": entry["version"], "site": entry["site"],
                    "status": "released" if entry["version"] != meta["version"] else "current",
                    "date": "", "note": entry["note"],
                    "tasks": [{"id": entry["site"], "title": f'shipped in site {entry["site"]}',
                               "owner": "@publisher"}]})
    return out


# ---------------------------------------------------------------- gates

def check(boards):
    stamped = sorted(p.name for p in PACKS.iterdir()
                     if p.is_dir() and p.name.startswith("making-a-book__"))
    registered = {c["pack"] for c in CONTROL} | {p["pack"] for p in PLANS}
    missing = [p for p in stamped if p not in registered]
    if missing:
        raise SystemExit("gen_board: change-control pack(s) for this book are not on the board — "
                         "add them to CONTROL: " + ", ".join(missing))
    ws = boards["workstreams"]["workstreams"]
    for w in ws:
        for t in w["tasks"]:
            if t["status"] not in STATUSES:
                raise SystemExit(f'gen_board: {t["id"]} has status {t["status"]!r}, '
                                 f'which no column renders')
    ids = [w["id"] for w in ws] + [t["id"] for w in ws for t in w["tasks"]]
    dupes = {i for i in ids if ids.count(i) > 1}
    if dupes:
        raise SystemExit("gen_board: duplicate id(s): " + ", ".join(sorted(dupes)))


PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>The project board &mdash; {title} &mdash; graphs.sgit.ai</title>
<meta name="description" content="The work around {title} at {bookver}, on one screen: the workstreams as a Kanban board with the seven-stage change control as tasks, the open issues, the agent roster, and the two-clock release log.">
<link rel="canonical" href="https://graphs.sgit.ai/v2/books/{slug}/board.html">
<meta property="og:type" content="website">
<meta property="og:site_name" content="graphs.sgit.ai">
<meta property="og:url" content="https://graphs.sgit.ai/v2/books/{slug}/board.html">
<meta property="og:title" content="The project board &mdash; {title}">
<meta property="og:description" content="Workstreams, issues, agents and releases for one book, derived from the repository.">
<meta name="twitter:card" content="summary">
<link rel="stylesheet" href="../../../assets/site.css">
<link rel="stylesheet" href="../../../assets/board.css">
</head>
<body>

<nav class="site"><div class="row"></div></nav>

<main class="doc uni-full">
<div class="crumb"><a href="../../../index.html">graphs.sgit.ai</a> &rarr; <a href="../index.html">the books</a> &rarr; <a href="index.html">{short}</a> &rarr; <b>the project board</b></div>
<h1>The project board</h1>
<p class="lead">The work <em>around</em> <b>{title}</b> at <b>{bookver}</b>, on one screen. Not the book's structure: its <b>coordination</b> &mdash; who is doing what, what is blocked and on whom, which reviews are open, and which agent has actually run. Four boards, {ws} workstreams, {tasks} tasks, {issues} open issues.</p>

<div class="note"><b>Where this comes from, and why you cannot edit it here.</b> The board is a <b>projection</b>. The workstreams and issues are authored once in <code>admin/build/gen_board.py</code>, because a stage's status is a judgement in the same way a version move is; the roster is computed from <code>v2/team/</code> and the debriefs each role has produced; the releases come from the book's own two-clock changelog. To move a card, move the thing it is derived from and rebuild. A board you can edit in a browser is a second source of truth, and this estate has been bitten by one already.<br>
<b>The schemas are not ours.</b> <code>project-workstreams-v2</code>, <code>project-issues-v1</code>, <code>project-agents-v2</code> and <code>project-releases-v1</code> are <a href="https://sgraph.ai/en-gb/library/guides/dev-board-system.md">sgraph.ai's dev board schemas</a>, adopted verbatim so a board here reads on that dashboard and the reverse. The renderer is this estate's own: that guide publishes a defect where card helpers interpolate <code>title</code> and <code>description</code> as raw strings, so every value here goes through an escape.</div>

<div id="board" class="bd"></div>

<h2 id="how">How a card moves</h2>
<p>A workstream's column is <b>derived from its tasks</b> unless it declares its own status: all tasks done makes it Done, any task in progress makes it In Progress. That is the reference's rule and it is worth keeping, because it means the board cannot report progress the task list does not support. A pack's seven stages are its tasks, so <b>&ldquo;waiting at stage 5 of 7&rdquo; is a progress bar</b> rather than a sentence buried in a record.</p>
<p>The two change-control workstreams are both blocked at the same stage, on the same person, for decisions of the same kind. That was true before this page existed and was visible nowhere.</p>

<div class="agent">
<h4>For an agent</h4>
<p>The machine surface is the four files under <a href="boards/">boards/</a>, each declaring its <code>schema</code> at the top level. Read <code>workstreams.json</code> for what is in flight and who is blocked, <code>issues.json</code> for what is outstanding and where it is argued, <code>agents.json</code> for which role has run on this book and at which version, and <code>releases.json</code> for the two-clock history. Do not hand-edit them: they are regenerated by <code>admin/build/gen_board.py</code> on every release, and a gate refuses a change-control pack for this book that is not on the board.</p>
</div>

</main>

<footer class="site"><div class="cols"></div></footer>
<script>window.BOARDS = {manifest};</script>
<script type="module" src="../../../assets/book-board.js"></script>
</body>
</html>
"""


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    meta = json.loads((BOOK / "book.json").read_text())
    ws = control_workstreams() + [dict(p) for p in PLANS] + OTHER
    boards = {
        "workstreams": {"schema": "project-workstreams-v2", "version": VERSION,
                        "title": "Workstreams and tasks",
                        "note": "A change-control pack is a workstream and its seven stages are "
                                "its tasks. Click a card for the stages.",
                        "workstreams": ws},
        "issues": {"schema": "project-issues-v1", "version": VERSION,
                   "note": "What is outstanding on this book, each with where it is argued.",
                   "issues": ISSUES},
        "agents": {"schema": "project-agents-v2", "version": VERSION,
                   "note": "Computed from v2/team/ and the debriefs each role has produced for "
                           "this book. Active means it has worked at the book's current version.",
                   "agents": agents()},
        "releases": {"schema": "project-releases-v1", "version": VERSION,
                     "note": "The book's own clock, paired with the site release that carried it.",
                     "releases": releases()},
    }
    check(boards)
    counts = {"workstreams": len(ws), "issues": len(ISSUES),
              "agents": len(boards["agents"]["agents"]),
              "releases": len(boards["releases"]["releases"])}
    for name, data in boards.items():
        (OUT / f"{name}.json").write_text(json.dumps(data, indent=1, ensure_ascii=False) + "\n")

    manifest = {"book": BOOK.name, "boards": [
        {"slug": n, "title": t, "file": f"boards/{n}.json",
         "schema": boards[n]["schema"], "count": counts[n]}
        for n, t in [("workstreams", "Workstreams"), ("issues", "Issues"),
                     ("agents", "Agents"), ("releases", "Releases")]]}
    n_tasks = sum(len(w["tasks"]) for w in ws)
    (BOOK / "board.html").write_text(PAGE.format(
        slug=BOOK.name, title=esc(meta["title"]), short=esc(meta["title"].split(":")[0]),
        bookver=esc(meta["version"]), ws=len(ws), tasks=n_tasks,
        issues=sum(1 for i in ISSUES if i["status"] != "resolved"),
        manifest=json.dumps(manifest)))
    blocked = [w["id"] for w in ws if any(t["status"] == "blocked" for t in w["tasks"])]
    print(f'gen_board: making-a-book — {len(ws)} workstream(s), {n_tasks} task(s), '
          f'{counts["issues"]} issue(s), {counts["agents"]} agent(s), '
          f'{counts["releases"]} release(s); blocked: {", ".join(blocked) or "none"}')


if __name__ == "__main__":
    main()
