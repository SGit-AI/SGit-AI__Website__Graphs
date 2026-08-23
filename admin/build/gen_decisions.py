#!/usr/bin/env python3
"""Generates decisions/data/decisions.json — every decision across every review,
merged with the context a decision needs before anybody can answer it.

The questions themselves are NOT authored here: they are read out of reviews/r*.json,
so this file can never drift from the register. What is authored here is the layer a
decision register normally lacks — why it matters, what each option would actually do,
what it unblocks, and which parts of the estate it touches.

The mechanism is borrowed, deliberately, from the Agentic Browser Isolation vault:
one named owner, no deny button (answer, defer with a reason, or ask for more data),
and nothing moves until it is taken personally. See /vaults/agentic-browser-isolation/
acceptance.html — borrowing a mechanism from an artefact you analysed is the strongest
form of citation, because it either works or it visibly does not."""
import json, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
VERSION = (ROOT / "admin/build/version.txt").read_text().strip()

def opt(label, does, cost=None, rec=False):
    return dict(label=label, does=does, cost=cost, recommended=rec)

def A(kind, label, href):
    return dict(kind=kind, label=label, href=href)

# The authored layer, keyed by review and decision number.
CONTEXT = {
 "r001-D2": dict(
   short="Sign off the sequencing",
   why="Everything with a dependency waits on this. The order decides whether the "
       "identity release (title, cover, lineage and fractal chapters) comes before or "
       "after the evidence programme, and the two pull in opposite directions: the "
       "cover is decided and unshipped, while the estate is producing evidence faster "
       "than the book can absorb it.",
   options=[opt("Sign off as reshaped",
                "Evidence programme first, identity release after, corrections along the way, "
                "chapter audit throughout.",
                "The cover says one thing and the published book says another for longer.", True),
            opt("Adjust the order",
                "Name what moves and the rest re-plans around it.",
                "Anything moved ahead of the evidence programme has to be written from "
                "argument rather than from artefacts.")],
   blocks=["v0.4.0 identity release", "T26 the case-study programme's pace"],
   answer_with=["r002-D3"],
   affects=[A("review", "r001 item 9", "../reviews/r001.html"),
            A("page", "the vault analyses", "../vaults/index.html")]),

 "r002-D2": dict(
   short="Pick the graph pilot chapter",
   why="The book-as-a-graph work needs one chapter lifted into nodes with the author "
       "confirming the lift, because for a decompilation the author is the oracle. The "
       "choice matters more than it looks: a claim-dense chapter with thin evidence "
       "shows the ghosted nodes honestly, and a well-evidenced one makes the pilot look "
       "better than the method is.",
   options=[opt("Chapter 5, Against schema-first",
                "Claim-dense, evidence-thin: the ghosts will show.",
                "It is also the chapter most likely to change in the identity release.", True),
            opt("Another chapter",
                "Name it and the pilot moves.",
                "A well-evidenced chapter flatters the pilot and teaches less.")],
   blocks=["r002 item 3", "the per-chapter graph visualisations of r002 item 6"],
   affects=[A("concept", "the concept layer", "../altitudes/concepts.html"),
            A("review", "r002 item 3", "../reviews/r002.html")]),

 "r002-D3": dict(
   short="The combined sequencing",
   why="The same question as r001 D2 seen from the agent-facing side. Answer them "
       "together or they will drift apart, which is itself a small instance of the "
       "problem the book keeps describing.",
   options=[opt("Sign off as reshaped", "Matches r001 D2.", None, True),
            opt("Adjust", "Say what moves.")],
   blocks=["the standalone wins: footnotes, the agent toolbox, the database correction"],
   answer_with=["r001-D2"],
   affects=[A("review", "r002 item 9", "../reviews/r002.html")]),

 "r003-D1": dict(
   short="Adopt the decoupling",
   why="The largest structural decision open, and the vault analyses have made it "
       "urgent rather than tidy: seven deep pages now sit outside the book's gate by "
       "accident rather than by design. The equality gate still requires the book to "
       "match the site, which is the constraint that flattens both surfaces.",
   options=[opt("Adopt as proposed",
                "The book gets its own source tree seeded at zero drift; the gate flips from "
                "equality to provenance, so every book unit names the pages, version and commit "
                "it distilled from, and drift is reported rather than forbidden.",
                "One release of pipeline work before any new writing, and provenance blocks to "
                "maintain from then on.", True),
            opt("Adjust the architecture",
                "Same split, different mechanism — say what changes.",
                "Any weaker gate risks silent drift, which is the failure the current gate exists to stop."),
            opt("Keep the coupling for now",
                "Nothing changes; the site stays constrained by what the book can carry.",
                "The vault programme either duplicates the estate or stays thin about it.")],
   blocks=["T25", "T26 at full depth", "the book's provenance edges"],
   affects=[A("review", "r003 item 1", "../reviews/r003.html"),
            A("page", "the capability scale, which argues the same test", "../vaults/capability-scale.html")]),

 "r003-D2": dict(
   short="Which issues logic runs a review folder",
   why="Reviews are already graphs in all but name. The choice is where the conversation "
       "lives, and it decides whether this workflow keeps the property it is named for.",
   options=[opt("In-repo issues, the IssuesFS pattern",
                "Issues as files, states as data, the graph computable from the folder.",
                "No notifications: somebody has to look.", True),
            opt("GitHub issues",
                "Notifications and a familiar interface.",
                "The serverless-pull-request property is lost, and the record leaves the artefact."),
            opt("Both",
                "In-repo as the record, GitHub mirrored for notification.",
                "Two places to keep in step, which is the drift problem this project keeps writing about.")],
   blocks=["T27 reviews as folders with their own graphs"],
   affects=[A("review", "r003 item 5", "../reviews/r003.html")]),

 "r004-D1": dict(
   short="Does the ladder continue",
   why="Levels 1 to 3 are complete and level 4 covers two chapters. The cost of the "
       "remaining fifteen is now measured rather than guessed, and every finding the "
       "ladder produced came from the levels that exist.",
   options=[opt("Finish the pilot: level 4 for all seventeen units",
                "Completes the ladder at its most productive altitude.",
                "The largest single writing task open.", True),
            opt("Adopt into the build",
                "The ladder is authored in content/, gate-checked like the book.",
                "Gate-checking a thing that is still changing shape slows both."),
            opt("Stop here",
                "The ladder stays a published experiment.",
                "The concept layer and the checks keep working; only the level 4 coverage stalls.")],
   blocks=["level 4 completion", "the audience variants of D3"],
   affects=[A("page", "the altitude ladder", "../altitudes/index.html")]),

 "r004-D2": dict(
   short="Where the findings live",
   why="Partly overtaken by events, and narrower than when it was written: findings now "
       "carry states with reasons, and five checks run on every build, which is already "
       "a standing register in everything but name. What is left is whether it gets its "
       "own page and its own numbering.",
   options=[opt("A standing register with its own page",
                "Findings get stable ids that a release can close, like the comms board's tasks.",
                "Another register to keep current.", True),
            opt("Leave it as it is",
                "The ladder page carries findings and checks together.",
                "A finding cannot be cited by id from outside the page.")],
   blocks=["T29"],
   affects=[A("page", "findings and checks", "../altitudes/index.html#findings")]),

 "r004-D3": dict(
   short="Which audience variant first",
   why="The ladder's claim is that the graph survives a change of audience and only the "
       "projection changes. One variant tests it; the translation case tests it hardest, "
       "because a language change cannot hide behind familiar examples.",
   options=[opt("Business, from level 2", "Cheapest, and the most likely to be asked for."),
            opt("Graph-literate, from level 3", "Tests whether the vocabulary can go up rather than down."),
            opt("A non-English projection of level 2",
                "The strongest test of the claim: if the argument changes, that is a finding about the graph.", None, True),
            opt("None yet", "Stabilise the ladder first.")],
   blocks=["T30"],
   affects=[A("page", "the altitude ladder", "../altitudes/index.html")]),

 "r004-D4": dict(
   short="Confirm the taxonomy classes",
   why="The per-level classes are the agent's first pass, and for a classification of "
       "your own book the author is the oracle. Three calls are genuinely arguable: "
       "chapter 4 (the edge set) classed Prescription rather than Apparatus; the "
       "Introduction classed Argument rather than Signpost; and level 4's whole "
       "vocabulary being about what a section does to the reader rather than what kind "
       "of matter it is.",
   options=[opt("Confirm as authored", "The classes stand and the level 4 rollout uses them.", None, True),
            opt("Correct specific classes", "Name them and the data changes with the next build."),
            opt("Rework a level's vocabulary", "The largest change: a level's classes are replaced wholesale.")],
   blocks=["level 4 rollout under D1"],
   affects=[A("page", "the ontology and taxonomy panels", "../altitudes/index.html#onttax")]),

 "r004-D5": dict(
   short="The vendored dependency",
   why="This site now vendors **two** third-party libraries: Cytoscape.js (MIT, 373 KB) for the "
       "graphs and marked (MIT, 35 KB) for the markdown readers. The premise this decision was "
       "raised on was wrong, as the correction above records, and the honest position is that "
       "there are two vendored libraries plus one stated network exception (Mermaid, best-effort). "
       "An unrecorded exception to a stated property is exactly what the honesty table exists to "
       "prevent, and this is the second sentence in chapter 12 that this work has put under strain.",
   options=[opt("Keep both and state the exception in the honesty table",
                "The claim becomes precise: no runtime dependency except two vendored libraries, named and versioned, plus a best-effort diagram renderer.",
                "Chapter 12 grows a line, and the line is longer than it would have been in August.", True),
            opt("Keep both, no further statement",
                "Nothing changes.",
                "A stated property with a silent exception, which is the failure mode this book names."),
            opt("Replace Cytoscape with a hand-written layout, keep marked",
                "The dependency list shrinks to a markdown parser, which is far easier to defend.",
                "Weeks of work to reproduce a mature library, and a worse graph while it happens.")],
   blocks=["chapter 12's wording, jointly with the path-query correction"],
   affects=[A("page", "the graph explorer", "../altitudes/graph.html"),
            A("page", "the sources", "../docs/index.html"),
            A("book", "chapter 12", "../book/ch-12-what-ships-what-is-argued.html")]),

 # answered, kept for the record and for the paths that pass through them
 "r001-D1": dict(short="The title", why="Answered on 22 August.", options=[],
                 blocks=["v0.4.0"], affects=[A("book", "the cover and interior", "../book/index.html")]),
 "r002-D1": dict(short="Humans and agents", why="Answered with r001 D1.", options=[], blocks=[], affects=[]),
 "r003-D3": dict(short="The case-study order", why="Answered by starting the programme.", options=[],
                 blocks=[], affects=[A("page", "the vaults", "../vaults/index.html")]),
 "r004-D6": dict(short="The path query", why="Answered by building it.", options=[], blocks=[],
                 affects=[A("page", "the query", "../altitudes/graph.html#query")]),
}

# Every decision names the work it blocks in its own words — that is how the register was
# written, and how a person actually talks. The wording is kept, because it is the wording
# on the page. But each phrase is also given a KEY here, and that is what turns a list into
# a graph: two decisions raised in two reviews, months apart, in two vocabularies, turn out
# to be waiting on the same piece of work. A phrase with no key FAILS THE BUILD, which
# forces the only question worth asking when new work is named: is this new, or is it
# something another decision is already holding up?
BLOCK_KEYS = {
    "v0.4.0":                                     ("v040", "the v0.4.0 identity release"),
    "v0.4.0 identity release":                    ("v040", "the v0.4.0 identity release"),
    "T26 the case-study programme's pace":        ("t26", "T26 · the vault case-study programme"),
    "T26 at full depth":                          ("t26", "T26 · the vault case-study programme"),
    "level 4 completion":                         ("t28", "T28 · finish or adopt the ladder"),
    "level 4 rollout under D1":                   ("t28", "T28 · finish or adopt the ladder"),
    "the audience variants of D3":                ("t30", "T30 · audience and translation variants"),
    "T30":                                        ("t30", "T30 · audience and translation variants"),
    "T25":                                        ("t25", "T25 · decouple the book from the website"),
    "T27 reviews as folders with their own graphs": ("t27", "T27 · reviews as folders with their own graphs"),
    "T29":                                        ("t29", "T29 · the findings register"),
    "r002 item 3":                                ("pilot", "r002 item 3 · the graph pilot chapter"),
    "the per-chapter graph visualisations of r002 item 6": ("chgraphs", "the per-chapter graph visualisations"),
    "the standalone wins: footnotes, the agent toolbox, the database correction":
                                                  ("standalone", "the standalone corrections"),
    "the book's provenance edges":                ("prov", "the book's provenance edges"),
    "chapter 12's wording, jointly with the path-query correction":
                                                  ("ch12", "chapter 12's wording"),
}


def block(phrase):
    """One named piece of work, in the decision's own words and under its shared key."""
    if phrase not in BLOCK_KEYS:
        raise SystemExit(f"gen_decisions: block phrase with no key: {phrase!r}. Add it to "
                         "BLOCK_KEYS — either its own key, or the key of the work it shares.")
    key, work = BLOCK_KEYS[phrase]
    return dict(label=phrase, key=key, work=work)


# The reviews froze into v1/ at v0.4.0, so a decision that needs correcting afterwards
# cannot be edited at source, which is the point of freezing it. Amendments live outside the
# frozen tree and are merged on: the original record stands, the amendment prints beside it.
AMENDMENTS = {}
_amf = ROOT / "decisions/amendments.json"
if _amf.exists():
    for a in json.loads(_amf.read_text())["amendments"]:
        AMENDMENTS.setdefault(a["id"], []).append(a)

decisions = []
for f in sorted((ROOT / "v1/reviews").glob("r0*.json")):
    rev = json.loads(f.read_text())
    for d in rev.get("decisions", []):
        did = f'{rev["id"]}-D{d["n"]}'
        c = CONTEXT.get(did, {})
        decisions.append(dict(
            id=did, review=rev["id"], review_title=rev["title"], n=d["n"], item=d["item"],
            short=c.get("short", f'{rev["id"]} decision {d["n"]}'),
            question=d["question"], options_raw=d.get("options", []),
            state=d["state"], answer=d.get("answer"), date=d.get("date"),
            correction=d.get("correction", ""),
            amendments=AMENDMENTS.get(did, []),
            why=c.get("why", ""), options=c.get("options", []),
            blocks=[block(b) for b in c.get("blocks", [])],
            answer_with=c.get("answer_with", []),
            affects=c.get("affects", []),
            href=f'../reviews/{rev["id"]}.html#item-{d["item"]}'))

known = {d["id"] for d in decisions}
orphans = [k for k in AMENDMENTS if k not in known]
if orphans:
    raise SystemExit("gen_decisions: amendments name decisions that do not exist: " + ", ".join(orphans))

missing = [d["id"] for d in decisions if d["state"] == "open" and not d["why"]]
if missing:
    raise SystemExit("gen_decisions: open decisions with no authored context: " + ", ".join(missing))

# Which pieces of work more than one decision is holding up. Computed, not asserted: the
# page states this number, and if the register changes so that nothing is shared, the page
# says nothing is shared.
bykey = {}
for d in decisions:
    for b in d["blocks"]:
        bykey.setdefault(b["key"], dict(key=b["key"], work=b["work"], names=[], decisions=[]))
        bykey[b["key"]]["decisions"].append(d["id"])
        if b["label"] not in bykey[b["key"]]["names"]:
            bykey[b["key"]]["names"].append(b["label"])
shared = [v for v in bykey.values() if len(v["decisions"]) > 1]
shared.sort(key=lambda v: (-len(v["decisions"]), v["key"]))

out = dict(version=VERSION, decisions=decisions,
           open=sum(1 for d in decisions if d["state"] == "open"),
           blocks=sorted(bykey.values(), key=lambda v: v["key"]), shared=shared,
           mechanism=dict(
             source="../vaults/agentic-browser-isolation/acceptance.html",
             rules=["One named owner. Every decision here is the founder's; the agent proposes and never decides.",
                    "Answer, defer with a reason, or ask for more data. **There is no deny button**: a decision cannot be made to go away by not looking at it.",
                    "Nothing moves until it is taken personally. An answer recorded here is what unblocks the work that waits on it.",
                    "The reason travels with the answer, so a decision can be argued with later rather than only obeyed."]))

p = ROOT / "decisions/data/decisions.json"
p.parent.mkdir(parents=True, exist_ok=True)
p.write_text(json.dumps(out, indent=1, ensure_ascii=False) + "\n")
print(f'gen_decisions: {len(decisions)} decisions ({out["open"]} open), {len(bykey)} pieces of work, {len(shared)} of them blocked by more than one decision')
for v in shared:
    print(f'  · {v["work"]} — {", ".join(v["decisions"])} (named: {"; ".join(v["names"])})')
print(f'gen_decisions: {p.stat().st_size:,} bytes')
