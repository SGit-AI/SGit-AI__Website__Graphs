#!/usr/bin/env python3
"""Generates /v2/team/ pages — the agentic team, one role per folder (brief 40).

Run from anywhere: python3 admin/build/gen_team.py
Then run chrome.py, which fills in the nav and footer.

The founder specified the shape exactly: "a folder that provides a whole bunch of
definitions per role, so every role has a folder. Every role has a role.md, has actions,
has briefs, has debriefs, and basically has this work environment."

Same convention as every other register here: the markdown IS the definition, and each
page renders its own source client-side, so a role page cannot drift from the role file an
agent is actually handed. A role folder that is missing a required part fails the build,
because a half-defined role is worse than no role: it reads as authoritative and is not.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "v2" / "team"
GH = "https://github.com/SGit-AI/SGit-AI__Website__Graphs/blob/dev/v2/team"

# The authored half: the order roles are shown in, and the one line that says what each
# role is FOR. Ordered by where work enters and leaves — find it, ground it, write it,
# judge it, build it, check it, ship it.
ROLES = [
    ("librarian", "Nothing is lost, and everything is findable",
     "Keeps the registers agreeing with each other: the briefs, the methods, the lexicon, "
     "the dev packs, the decisions and their amendments, and the names of things."),
    ("researcher", "No claim without an anchor",
     "Answers questions from the closed local corpus and refuses to answer from anywhere "
     "else. Owns the anchors, and the honesty of a section that yields nothing."),
    ("writer", "A reader who stops early still gets a whole book",
     "Owns the chapter markdown, and nothing else. Computes or quotes every number that "
     "enters the prose."),
    ("editor", "The book's voice, and what it refuses to claim",
     "Reads as a reader rather than an author. Owns structure, voice, and the refusals "
     "that travel with every idea this estate publishes."),
    ("developer", "The scaffolding is more important than the code",
     "A developer for THIS stack: no bundler, 24 Python generators, a projection chain, "
     "and a frozen first edition that fails the build if a byte moves."),
    ("qa", "A gate anyone can silence is not a gate",
     "Owns the suites and the release gate, and the standard of evidence for a claim that "
     "something works. Carries the estate's known hole: prose has no freshness gate."),
    ("publisher", "A version is a promise to a reader",
     "Owns two clocks and the rule that keeps them apart: the site's version moves every "
     "push, a book's version moves only when its content does."),
]

REQUIRED = ["role.md", "actions", "briefs", "debriefs"]


def title_of(md):
    m = re.search(r"^#\s+(.+)$", md, re.M)
    return m.group(1).strip() if m else "Untitled"


def esc(t):
    return (str(t).replace("&", "&amp;").replace("<", "&lt;")
            .replace(">", "&gt;").replace('"', "&quot;"))


PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title} &mdash; graphs.sgit.ai</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="https://graphs.sgit.ai/v2/team/{slug}.html">
<meta property="og:type" content="article">
<meta property="og:site_name" content="graphs.sgit.ai">
<meta property="og:url" content="https://graphs.sgit.ai/v2/team/{slug}.html">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta name="twitter:card" content="summary">
<link rel="alternate" type="text/markdown" href="{src}" title="The raw markdown, which is the source of truth">
<link rel="stylesheet" href="../../assets/site.css">
</head>
<body>

<nav class="site"><div class="row"></div></nav>

<main class="doc">
<div class="crumb"><a href="../../index.html">graphs.sgit.ai</a> &rarr; <a href="../index.html">the second edition</a> &rarr; <a href="index.html">the team</a> &rarr; <b>{crumb}</b></div>
<h1>{title}</h1>
<p class="lead">{desc}</p>

<div class="docmeta">
  <span class="k">Role</span><span class="v">{roleline}</span>
  <span class="k">Defined by</span><span class="v"><a href="../memos/40-founder-memo-the-agentic-team-and-who-the-book-is-for.html">brief 40</a> &middot; the agentic team</span>
  <span class="k">Work</span><span class="v">{workline}</span>
  <span class="k">Source</span><span class="v"><a href="{src}">raw markdown</a> &middot; <a href="{gh}">view on GitHub</a></span>
</div>

<div class="mdread-label">&#128196; Rendered from the <a href="{src}">raw markdown</a>, which is the source of truth. An agent is handed that file, not this page.</div>
<div class="mdread" id="mdread" data-src="{src}"><noscript><p class="dim">In-page rendering needs JavaScript &mdash; <a href="{src}">open the raw markdown</a>.</p></noscript></div>

<div class="pagenav">
  <span>{prev}</span>
  <span>{next}</span>
</div>
</main>

<footer class="site"><div class="cols"></div></footer>
<script src="../../assets/vendor/marked.min.js"></script>
<script src="../../assets/mdreader.js" defer></script>
</body>
</html>
"""

HUB = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>The team &mdash; graphs.sgit.ai</title>
<meta name="description" content="Seven roles, one folder each: the agentic team defined in brief 40. Every role carries its own definition, its actions, its briefs and its debriefs, and every one is customised to this estate rather than generic.">
<link rel="canonical" href="https://graphs.sgit.ai/v2/team/index.html">
<meta property="og:type" content="website">
<meta property="og:site_name" content="graphs.sgit.ai">
<meta property="og:url" content="https://graphs.sgit.ai/v2/team/index.html">
<meta property="og:title" content="The team">
<meta property="og:description" content="Seven roles with declared centres of gravity, so that a decision is made against disagreement rather than against silence.">
<meta name="twitter:card" content="summary">
<link rel="alternate" type="text/markdown" href="README.md" title="The raw markdown, which is the source of truth">
<link rel="stylesheet" href="../../assets/site.css">
</head>
<body>

<nav class="site"><div class="row"></div></nav>

<main class="doc">
<div class="crumb"><a href="../../index.html">graphs.sgit.ai</a> &rarr; <a href="../index.html">the second edition</a> &rarr; <b>the team</b></div>
<h1>The team</h1>
<p class="lead">Seven roles, one folder each, defined in <a href="../memos/40-founder-memo-the-agentic-team-and-who-the-book-is-for.html">brief 40</a>. Every role carries its own <code>role.md</code>, its actions, and its briefs and debriefs &mdash; the work environment an agent is spun up into.</p>

<div class="note"><b>Why this exists, and it is not throughput.</b> It is <b>judgement</b>. The founder&rsquo;s reason, in the memo: <em>&ldquo;it was very powerful when you have agents advocating for certain things, who have specific centres of gravity.&rdquo;</em> One generalist asked a hard question gives one answer shaped by whatever it read last. Seven roles with declared centres of gravity disagree in useful ways, and <b>a decision made against disagreement is worth more than one made against silence</b>. Isolation is the second reason and it is practical: a role spun up on its own carries only its own context.</div>

<div class="tablewrap">
<table>
  <thead><tr><th>Role</th><th>Centre of gravity</th><th>What it is for</th></tr></thead>
  <tbody>
{rows}
  </tbody>
</table>
</div>

<div class="note"><b>Every role here is customised to this estate.</b> Brief 40 is explicit: <em>&ldquo;It&rsquo;s not just a writer. It&rsquo;s a writer for this type of book&hellip; It&rsquo;s not just a developer &mdash; it&rsquo;s a developer focusing on the JavaScript stack that we have, the CI pipeline that we have.&rdquo;</em> A role definition that would read the same in any repository has failed this brief.</div>

<div class="note"><b>The team arrived late, and the books must say so.</b> From the same memo: <em>&ldquo;It&rsquo;s important to say that they don&rsquo;t start here. In fact, look at the situation. I&rsquo;m only introducing these now, not in the beginning.&rdquo;</em> One person and one agent wrote three books before this folder existed. The team is what the work grew into, not what it started as, and any chapter presenting it as a starting condition is wrong.</div>

<h2 id="shape">The shape of a role folder</h2>
<pre><code>v2/team/&lt;role&gt;/
  role.md        Identity, Foundation, Primary Responsibilities, Core Workflows
  actions/       one file per thing the role can be asked to do, each naming
                 its inputs, its output and its done test
  briefs/        what the role was asked      &mdash; vX.Y.Z__&lt;slug&gt;.md
  debriefs/      what it did and what it learnt &mdash; vX.Y.Z__&lt;slug&gt;.md</code></pre>
<p><b>Each role also owns its own work plan</b>, as files: <code>issues/open/</code>, <code>issues/blocked/</code> and <code>issues/done/</code>, on the <a href="https://issues-fs.sgit.ai/lite/index.html">Issues-FS-lite</a> pattern where the folder <em>is</em> the status and a status change is a <code>git mv</code>. <a href="issues.html"><b>Browse the issue tree &rarr;</b></a> &middot; <a href="ISSUES.md">the pattern, and the writer rule</a></p>
<p><code>briefs/</code> and <code>debriefs/</code> start empty. They are the work environment, and they fill as a role is used; an empty <code>debriefs/</code> is an honest statement that the role has not run yet. Outputs are <b>stamped with the site version at the time of writing</b>, so a debrief can be placed against the release history without opening it.</p>

<p>The definition itself carries four sections, and the first two are where the work is. <b>Identity</b> gives the role&rsquo;s core mission, its <b>central claim</b> (the thing it can be held to) and its <b>not responsible for</b> (the boundary that stops it drifting into another role&rsquo;s territory). <b>Foundation</b> gives the principles it works under, each with the reason it exists here &mdash; most were learnt by getting something wrong. Then the responsibilities, naming real paths, and the workflows as numbered steps.</p>

<div class="note"><b>Where this shape came from.</b> The founder pointed at an existing team: <em>&ldquo;we already have good definitions and good examples from other projects, especially the Send project.&rdquo;</em> That is <a href="https://github.com/the-cyber-boardroom/SGraph-AI__App__Send">the-cyber-boardroom/SGraph-AI__App__Send</a>, whose team folder carries seventeen roles under the same discipline. <b>Inherited</b>, because it is proven: the identity table with its central claim and its boundary, the principles table, the numbered workflows, and version-stamped outputs. <b>Not inherited</b>, because this is a different job: its seventeen roles (AppSec, DevOps, GRC, a DPO &mdash; which a three-book publishing estate does not need), its issues filesystem, and its Wardley tier folders that split roles by evolution stage. Brief 40 names two <em>audiences</em> in those terms but does not ask for the roles to be split that way. <b>Kept from brief 40 over Send&rsquo;s convention:</b> the file is <code>role.md</code>, lowercase, because the memo says so directly.</div>

<div class="mdread-label">&#128196; The rest of this page is rendered from <a href="README.md">the raw markdown</a>, which is the source of truth.</div>
<div class="mdread" id="mdread" data-src="README.md"><noscript><p class="dim">In-page rendering needs JavaScript &mdash; <a href="README.md">open the raw markdown</a>.</p></noscript></div>
</main>

<footer class="site"><div class="cols"></div></footer>
<script src="../../assets/vendor/marked.min.js"></script>
<script src="../../assets/mdreader.js" defer></script>
</body>
</html>
"""


def main():
    problems = []
    for slug, _, _ in ROLES:
        folder = SRC / slug
        for part in REQUIRED:
            if not (folder / part).exists():
                problems.append(f"{slug}/ has no {part}")
    on_disk = sorted(p.name for p in SRC.iterdir() if p.is_dir())
    listed = sorted(s for s, _, _ in ROLES)
    if on_disk != listed:
        problems.append(f"folders {on_disk} do not match the register {listed}")
    if problems:
        for p in problems:
            print(f"gen_team: ERROR {p}")
        raise SystemExit(1)

    rows, pages, actions_total = [], [], 0
    for i, (slug, gravity, what) in enumerate(ROLES):
        folder = SRC / slug
        md = (folder / "role.md").read_text()
        acts = sorted((folder / "actions").glob("*.md"))
        actions_total += len(acts)
        nb = len(list((folder / "briefs").glob("*.md"))) - 1        # minus the README
        nd = len(list((folder / "debriefs").glob("*.md"))) - 1
        prev = (f'&larr; <a href="{ROLES[i-1][0]}.html">{title_of((SRC / ROLES[i-1][0] / "role.md").read_text())}</a>'
                if i else '&larr; <a href="index.html">the team</a>')
        nxt = (f'<a href="{ROLES[i+1][0]}.html">{title_of((SRC / ROLES[i+1][0] / "role.md").read_text())}</a> &rarr;'
               if i + 1 < len(ROLES) else '<a href="../books/index.html">the books they work on</a> &rarr;')
        workline = (f"{len(acts)} action(s) &middot; {nb} brief(s) &middot; {nd} debrief(s)"
                    if (nb or nd) else f"{len(acts)} action(s) &middot; not yet run")
        (SRC / f"{slug}.html").write_text(PAGE.format(
            title=esc(title_of(md)), desc=esc(what), slug=slug, crumb=esc(slug),
            roleline=esc(gravity), workline=workline,
            src=f"{slug}/role.md", gh=f"{GH}/{slug}/role.md", prev=prev, next=nxt))
        pages.append(slug)
        act_links = " &middot; ".join(
            f'<a href="{slug}/actions/{a.name}">{esc(title_of(a.read_text()).replace("Action: ", ""))}</a>'
            for a in acts) or '<span class="dim">none yet</span>'
        rows.append(
            f'    <tr><td><a href="{slug}.html"><b>{esc(title_of(md))}</b></a></td>'
            f'<td>{esc(gravity)}</td>'
            f'<td>{esc(what)}<br><span class="small dim">actions: {act_links}</span></td></tr>')

    (SRC / "index.html").write_text(HUB.format(rows="\n".join(rows)))
    print(f"gen_team: {len(pages)} role(s) plus the hub, {actions_total} action(s) defined")


if __name__ == "__main__":
    main()
