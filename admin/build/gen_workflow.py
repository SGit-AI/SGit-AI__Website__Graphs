#!/usr/bin/env python3
"""Generates v2/team/workflow.html — the state map: the states a change moves
through here, each naming the one role that can advance it and the DOOR the next
role will not take the work without.

Borrowed from newsroom.sgit.ai's brief 10 §8, which reports that the state map
turned out more useful than the room it was built beside, for a reason worth
repeating: modelling doors makes one fact impossible to keep soft. Theirs was a
state nothing had ever passed. Ours is below, and it was found by counting rather
than by being written down.

WHAT IS AUTHORED AND WHAT IS COUNTED. A state's meaning and its door are
judgements and live in v2/team/workflow.json. Which states are occupied, which
have ever been passed, and therefore WHICH DOORS ARE SHUT are counted from the
board on every build. Their §3.1 is the rule: a sentence with a number in it that
a human typed is a sentence that will be false later.

THE GATE, their §7 generalised: every visual claim needs a check that compares
the drawing to the declaration. This page draws an order, so the seven
stage-bearing states must match, in sequence, the seven stages the change-control
workflow declares in gen_board.STAGES. Reorder one and forget the other and the
build fails rather than drawing last month's process.

Run from anywhere: python3 admin/build/gen_workflow.py
"""
import importlib.util
import json
import sys
from pathlib import Path

# This generator is the estate's first cross-generator import: the gate below
# compares this map to the pipeline gen_board.py declares. A plain `import
# gen_board` read a STALE __pycache__ during development and the gate passed
# against a declaration that was no longer on disk — a gate that can be fed
# yesterday's constants is not a gate. Load it from its file, every run, and
# write no bytecode.
sys.dont_write_bytecode = True

ROOT = Path(__file__).resolve().parents[2]


def declared_stages():
    """The seven stages, read from gen_board.py's source on every run."""
    path = ROOT / "admin" / "build" / "gen_board.py"
    spec = importlib.util.spec_from_file_location("_gen_board_for_gate", path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return list(mod.STAGES)
TEAM = ROOT / "v2" / "team"
BOARD = ROOT / "v2" / "books" / "making-a-book" / "boards" / "workstreams.json"
VERSION = (ROOT / "admin" / "build" / "version.txt").read_text().strip()


def esc(s):
    return (str(s).replace("&", "&amp;").replace("<", "&lt;")
            .replace(">", "&gt;").replace('"', "&quot;"))


def occupancy(states):
    """Count the board's seven-stage packs against the states. An item SITS at
    the first stage it has not finished; it has PASSED every stage before that.
    Nothing here is typed: a shut door is a door with items waiting and none
    through, and that is a computation, not an opinion."""
    board = json.loads(BOARD.read_text())
    by_stage = {s["stage"]: s for s in states if s["stage"]}
    at = {s["id"]: [] for s in states}
    passed = {s["id"]: [] for s in states}
    for w in board["workstreams"]:
        tasks = w.get("tasks", [])
        stages = [t for t in tasks if t["title"].split(". ", 1)[-1] in by_stage]
        if len(stages) != len(by_stage):
            continue                      # not a seven-stage pack; it has no state here
        here = None
        for t in stages:
            sid = by_stage[t["title"].split(". ", 1)[-1]]["id"]
            if t["status"] == "done":
                passed[sid].append(w["id"])
            elif here is None:
                here = sid
        if here:
            at[here].append(w["id"])
    return at, passed


def build():
    wf = json.loads((TEAM / "workflow.json").read_text())
    states = sorted(wf["states"], key=lambda s: s["seq"])
    ids = {s["id"] for s in states}
    errors = []

    # the state machine is closed
    for s in states:
        for e in s["exits"]:
            if e not in ids:
                errors.append(f'state {s["id"]}: exits to {e!r}, which is not a state')
        if not s["exits"] and s["seq"] != max(x["seq"] for x in states):
            errors.append(f'state {s["id"]}: has no exit and is not the last state')
        if not s.get("door"):
            errors.append(f'state {s["id"]}: has no door — a state nobody has to pass is a label')
        roles = {"@" + d.name for d in TEAM.iterdir() if d.is_dir()} | {"the founder"}
        if s["owner"] not in roles:
            errors.append(f'state {s["id"]}: owner {s["owner"]!r} is not a role or the founder')

    # THE GATE: the drawing must match the declaration
    STAGES = declared_stages()
    drawn = [s["stage"] for s in states if s["stage"]]
    if drawn != STAGES:
        errors.append(f"the map runs {drawn} but the change-control workflow declares "
                      f"{STAGES} — the map would draw a process that does not exist")

    if errors:
        for e in errors:
            print("  ✗ " + e)
        raise SystemExit(f"gen_workflow: {len(errors)} problem(s) — nothing written")

    at, passed = occupancy(states)
    for s in states:
        s["at"] = at[s["id"]]
        s["passed"] = sorted(set(passed[s["id"]]))
        # A door is shut when work is waiting at it and nothing has ever gone through.
        s["shut"] = bool(s["at"]) and not s["passed"]
    return wf, states


PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>The state map &mdash; the team &mdash; graphs.sgit.ai</title>
<meta name="description" content="The states a change moves through here, each naming the one role that can advance it and the door the next role will not take the work without. {shut} door(s) currently shut.">
<link rel="canonical" href="https://graphs.sgit.ai/v2/team/workflow.html">
<meta property="og:type" content="website">
<meta property="og:site_name" content="graphs.sgit.ai">
<meta property="og:url" content="https://graphs.sgit.ai/v2/team/workflow.html">
<meta property="og:title" content="The state map">
<meta property="og:description" content="Nine states, each with the door it must pass, and which doors are shut.">
<meta name="twitter:card" content="summary">
<link rel="stylesheet" href="../../assets/site.css">
<link rel="stylesheet" href="../../assets/board.css">
</head>
<body>

<nav class="site"><div class="row"></div></nav>

<main class="doc uni-full">
<div class="crumb"><a href="../../index.html">graphs.sgit.ai</a> &rarr; <a href="../index.html">the second edition</a> &rarr; <a href="index.html">the team</a> &rarr; <b>the state map</b></div>
<h1>The state map</h1>
<p class="lead">The states a change moves through here. Each names the <b>one role that can advance it</b> and the <b>door</b>: the condition the next role will not take the work without. Nine states, {stages} of them a stage of the seven-stage change control, and <b>{shut} door currently shut</b>.</p>

<div class="note"><b>Which doors are shut is counted, not written down.</b> A door is shut when work is waiting at it and nothing has ever gone through, and both halves are read off <a href="../books/making-a-book/board.html">the board</a> on every build. The meanings and the doors are authored in <a href="workflow.json">workflow.json</a>, because what a state <em>means</em> is a judgement; what is sitting in it is not.<br>
<b>A gate compares the drawing to the declaration.</b> This page draws an order, so the seven stage-bearing states must match, in sequence, the stages <code>admin/build/gen_board.py</code> declares. Reorder one and forget the other and the build fails, rather than the map going on confidently drawing last month's process. Borrowed, with the reasoning, from <a href="https://newsroom.sgit.ai/briefs/10__the-newsroom-floor.md">newsroom.sgit.ai's brief 10</a>.</div>

{finding}

{lanes}

<h2 id="reading">How to read a shut door</h2>
<p>A door with nothing through it is not a criticism of whoever owns it. It is the honest shape of the process at this moment, and it is worth drawing for the reason the sibling site gives: before their state map existed, one shut door was four separate caveats on four separate pages. Ours was the same &mdash; the same fact was stated on the board, in two pack records, in the issue tree and in four replies.</p>
<p><b>What a shut door does NOT mean is that nothing downstream has happened.</b> It means nothing has passed <em>through the workflow</em>. Work can and does go around a shut door, and when it does, the map shows the door still shut while the release table shows the change shipped. That gap is the useful part: it says the process and the practice have diverged, and which of the two to fix is a decision rather than a bug.</p>

<div class="agent">
<h4>For an agent</h4>
<p><a href="workflow.json">workflow.json</a> is the machine surface: <code>id</code>, <code>label</code>, <code>lane</code>, <code>seq</code>, <code>stage</code>, <code>owner</code>, <code>means</code>, <code>door</code> and <code>exits</code>. The occupancy fields on this page (<code>at</code>, <code>passed</code>, <code>shut</code>) are computed at build time from the board and are not in the file &mdash; read them from the board rather than caching them here. To add a state, add it to <code>workflow.json</code> with its door and its exits; the build refuses a state with no door, an exit that names nothing, or a stage sequence that disagrees with the declared workflow.</p>
</div>

</main>

<footer class="site"><div class="cols"></div></footer>
</body>
</html>
"""


def main():
    wf, states = build()
    lanes_html = []
    for lane in wf["lanes"]:
        cards = []
        for s in [x for x in states if x["lane"] == lane["id"]]:
            n_at, n_passed = len(s["at"]), len(s["passed"])
            pill = ('<span class="bd-badge bd-blocked">door shut</span>' if s["shut"]
                    else f'<span class="bd-badge bd-done">{n_passed} through</span>'
                    if n_passed else '<span class="bd-badge bd-queued">nothing yet</span>')
            stage = (f'<span class="wf-stage">stage {s["seq"]}</span>' if s["stage"]
                     else '<span class="wf-stage dim">outside the seven</span>')
            waiting = (f'<p class="wf-at"><b>{n_at}</b> waiting: '
                       + ", ".join(f'<code>{esc(i)}</code>' for i in s["at"]) + '</p>') if s["at"] else ''
            cards.append(
                f'<article class="wf-state{" wf-shut" if s["shut"] else ""}" id="{esc(s["id"])}"'
                f' style="border-left-color:{esc(lane["colour"])}">'
                f'<h4>{esc(s["label"])} {pill}</h4>'
                f'<p class="wf-meta">{stage} &middot; advanced by <b>{esc(s["owner"])}</b></p>'
                f'<p class="bd-desc">{esc(s["means"])}</p>'
                f'<p class="wf-door"><span class="wf-dl">the door</span> {esc(s["door"])}</p>'
                f'{waiting}</article>')
        lanes_html.append(
            f'<section class="wf-lane"><h3 style="border-bottom-color:{esc(lane["colour"])}">'
            f'{esc(lane["label"])}</h3><div class="wf-cards">{"".join(cards)}</div></section>')

    shut = [s for s in states if s["shut"]]
    if shut:
        s = shut[0]
        finding = (
            f'<div class="wf-finding"><h3>The shut door</h3>'
            f'<p><b>{esc(s["label"])}</b> has <b>{len(s["at"])}</b> item(s) waiting at it and '
            f'<b>nothing has ever passed through it</b>. It is advanced by '
            f'<b>{esc(s["owner"])}</b>, and its door is: {esc(s["door"])}</p>'
            f'<p class="small">Waiting: '
            + ", ".join(f'<code>{esc(i)}</code>' for i in s["at"]) +
            f'. Everything downstream of it &mdash; '
            + ", ".join(f'<b>{esc(x["label"])}</b>' for x in states if x["seq"] > s["seq"]
                        and x["stage"]) +
            f' &mdash; has therefore never been entered by any pack, which does not mean '
            f'nothing has shipped: it means what shipped went around the workflow rather '
            f'than through it.</p></div>')
    else:
        finding = ('<div class="wf-finding"><h3>No door is shut</h3>'
                   '<p>Every state with work waiting has had something pass through it. '
                   'That is the state to be in and it is worth saying when it is true.</p></div>')

    (TEAM / "workflow.html").write_text(PAGE.format(
        lanes="\n".join(lanes_html), finding=finding, shut=len(shut),
        stages=sum(1 for s in states if s["stage"])))
    print(f'gen_workflow: {len(states)} states in {len(wf["lanes"])} lanes, '
          f'{sum(1 for s in states if s["stage"])} carrying a declared stage; '
          f'shut: {", ".join(s["id"] for s in shut) or "none"}')


if __name__ == "__main__":
    main()
