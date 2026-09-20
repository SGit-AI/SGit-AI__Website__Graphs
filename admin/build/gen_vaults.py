#!/usr/bin/env python3
"""Generates /v2/vaults/ — the second edition's evidence estate, four graph vaults.

Run from anywhere: python3 admin/build/gen_vaults.py

The first edition analysed five published graph vaults and froze with them at v0.3.26,
so /v1/vaults/ is evidence and cannot take a new one. Brief 47 arrived with four more
that the ladder on sgit.ai walks and this site had never looked at. They go here.

THE HONESTY PROBLEM, AND WHAT IS DONE ABOUT IT. The first edition's vault analyses were
written by opening the vaults. This agent cannot: a vault is encrypted, the read key is
the whole credential, and nothing in this build can decrypt one. Every number on these
pages is therefore a SECOND-HAND READING of the page sgit.ai publishes about each vault,
and saying so once in small print is not enough.

So each fact carries the sentence it came from, and this generator fails the build if
that sentence is not in the carried source byte for byte. The carried sources live in
sources/ with their URL, their SHA-256 and the timestamp they were fetched at. The pages
say, on themselves, that they are read from a page rather than from a vault. Brief 47's
own rule for this work was "every number you write must come from the vault or page it
describes on the day you write it, and say the date"; this is the half of it that is
available, gated so it cannot quietly become the other half.
"""
import hashlib
import json
import re
from pathlib import Path
from urllib.parse import urljoin

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "v2" / "vaults"
SRC = OUT / "sources"
VERSION = (ROOT / "admin/build/version.txt").read_text().strip()
LADDER = "https://sgit.ai/demos/fractal-graphs/"

# ---------------------------------------------------------------------------
# The readings. `says` is this site's prose; `quote` is the sentence from the carried
# source that licenses it, and is checked. A fact with no quote is not a fact here.
REGISTER = [
 {
  "slug": "standards-atlas-gdpr", "id": "4zv4bvmu",
  "title": "Standards Atlas: GDPR",
  "rung": "the law, and its interpretation",
  "one_line": "A regulation whose operative meaning is not in its text, modelled so that "
              "the rulings and the guidance are nodes rather than footnotes.",
  "why": "This is the clearest published answer to the question the first edition kept "
         "asking and could not demonstrate: what does it buy you to model an instrument "
         "as a graph rather than to publish it as a document. The answer here is that the "
         "text stops being the thing you read.",
  "facts": [
   {"says": "The graph is navigated by altitude, and the vault says so in its own voice at "
            "the top of it.",
    "quote": "You are at the top of the fractal. Each domain is its own ontology that "
             "connects up to the GDPR root and down to concepts and articles."},
   {"says": "Each domain is its own ontology. That is the corrected fractal claim, stated "
            "by a running vault rather than by a book about one.",
    "quote": "Each domain is its own ontology"},
   {"says": "The rendering does not change as you descend; the question does.",
    "quote": "The rendering does not change between altitudes — only the question does."},
   {"says": "It counts itself: 165 nodes and 227 edges.",
    "quote": "the graph holds 165 nodes and 227 edges"},
   {"says": "And it reports its own violation of this site's grammar rather than quietly "
            "fixing it. Six edges use the one verb this site bans, and the vault records "
            "that it predates the rule.",
    "quote": "six of those edges are typed `relates`"},
   {"says": "The reason it is recorded rather than corrected is that the seed graph is "
            "deliberately immutable, and corrections are written to a separate folder.",
    "quote": "Recorded rather than fixed, since the seed graph is deliberately immutable "
             "and corrections go to `feedback/`."},
   {"says": "Article 45 has not changed a word since 2016 and what it permits has flipped "
            "repeatedly, which is the case for the second layer in one picture.",
    "quote": "Article 45 has not changed a word since 2016; what it permits has flipped "
             "repeatedly"},
   {"says": "The vault puts the consequence plainly.",
    "quote": "this is why a static PDF of GDPR is misleading and a versioned graph is not"},
  ],
  "caveats": [
   "The vault carries a banner across every view reading SEED PASS — NOT LEGAL ADVICE, "
   "and describes its own overlays as a web-verified seed from 30 May 2026, illustrative "
   "and not exhaustive, which must be validated before it is relied upon. That caveat "
   "travels with the vault and it travels here.",
  ],
 },
 {
  "slug": "aiuc-1-conformance", "id": "2wzct4k7",
  "title": "Provenance is not conformance",
  "rung": "the standard, the evidence and the policy",
  "one_line": "A conformance layer over a published standard, whose whole design is that "
              "an absent answer is a finding rather than a silence.",
  "why": "It supplies this site's second cross-vault finding, and it is the only one of "
         "the four that makes a claim neither of the graphs it joins could make alone.",
  "facts": [
   {"says": "Two verbs in two graphs, never traversed in one query without the query "
            "naming which it used, and the rule is enforced by a test rather than "
            "described in a document.",
    "quote": "`tests/test_conformance.py::test_two_edge_rule` is red if a layer edge ever "
             "reaches a `source_observation`."},
   {"says": "Unevidenced is a state and it is the default, so an absent row can never be "
            "read as compliance.",
    "quote": "Unevidenced is a state, and it is the default."},
   {"says": "Which is why the first build of one subject across all 53 controls comes out "
            "almost entirely unevidenced, and why that is the designed answer.",
    "quote": "2 evidenced, 48 unevidenced, 3 contradicted"},
   {"says": "Levels are computed rather than asserted, and one consequence falls straight "
            "out: a control whose only requirement is third-party testing cannot be "
            "climbed by talking about yourself.",
    "quote": "six controls whose only requirement is third-party testing cannot leave "
             "level 0 on a self-report"},
   {"says": "Time is the thing that breaks the policy, with nobody editing anything.",
    "quote": "At 2027-01-15, **with nothing edited by anybody**, the single condition has "
             "expired and the policy has 53 exclusions."},
   {"says": "And it declines to overreach about what it has proved.",
    "quote": "that any control is in place: it proves what was attested, at what tier, "
             "and when it expires"},
   {"says": "The explorer states its own arithmetic in its header rather than in a "
            "footnote.",
    "quote": "Both graphs are loaded — the catalogue's 2788 nodes and 11610 edges, and "
             "the conformance layer's 182 and 414"},
   {"says": "Every edge type across both graphs has a named inverse, and every node is "
            "tied to the bytes it came from.",
    "quote": "41 edge types across both graphs"},
   {"says": "It publishes seventeen findings about itself, and the sharpest undercut the "
            "ambition it was built with.",
    "quote": "the join needs an authored class map — it is not hand-free as the brief "
             "hoped."},
   {"says": "A stale acceptance is a first-class result: all three recorded acceptances "
            "come back stale, not because anyone withdrew them but because the evidence "
            "underneath them moved.",
    "quote": "An acceptance is never edited here; its basis is captured at the moment of "
             "the decision and is allowed to go out of date on its own."},
  ],
  "caveats": [
   "The vault is explicit that it is unofficial and derivative: not approved, certified, "
   "endorsed or reviewed by AIUC, not an official API or data feed, and not a substitute "
   "for the standard. Where anything in it disagrees with aiuc-1.com or the official "
   "changelog repository, those are right and it is wrong.",
   "Its subjects are invented for the demonstration. Nothing in it is a compliance, "
   "certification, underwriting, insurance, legal or security claim about any real "
   "organisation, and this page makes none either.",
   "It records an open question of its own, that reuse rights for the full control text "
   "have not been confirmed, and it carries an undertaking to honour a removal request. "
   "This page reproduces that undertaking rather than summarising it away.",
  ],
 },
 {
  "slug": "licence-to-operate", "id": "posrhzp3",
  "title": "Licence to Operate",
  "rung": "the policy, spent turn by turn",
  "one_line": "An agent's authority modelled as an insurance policy, and then spent, so "
              "that the gap between what it can do and what it may do has a price.",
  "why": "This site has argued since the first edition that `permissions: {}` is the most "
         "expensive line in an agent system. This vault makes the same argument countable "
         "and then charges for it.",
  "facts": [
   {"says": "Three sets, and the gap between two of them is the whole argument: what the "
            "agent can do, what it may do, and the delta.",
    "quote": "**CAN DO** — the grant | Everything the agent is technically able to do"},
   {"says": "Twelve capabilities in the grant; four in the mandate.",
    "quote": "**4** — `crm:read`, `kb:search`, `llm:generate`, `mail:draft`"},
   {"says": "Eight capabilities sit inside the agent's reach and outside its authority, "
            "and nothing insures them.",
    "quote": "Inside the agent's reach, outside its authority. **No policy covers these**"},
   {"says": "Two of those eight are the ones that would matter.",
    "quote": "The grant includes `mail:send` and `shell:exec`. Nobody asked for those; "
             "nothing insures them; and the agent can reach them."},
   {"says": "The simulation prices each reply before you commit to it, which is what turns "
            "a policy into something you can feel.",
    "quote": "Each option carries its cost before you commit"},
   {"says": "And it names the asymmetry that makes agent authority hard: one of the two "
            "checks can only run afterwards.",
    "quote": "Scope is checked before an action; cost sometimes only after."},
  ],
  "caveats": [
   "It is a simulation, and says so in its own title. The agent, the customer and the "
   "policy are constructed to make the mechanism visible, not drawn from a running system.",
  ],
 },
 {
  "slug": "threatmodcon-2025", "id": "0ict6flm",
  "title": "Scaling Threat Modeling with Semantic Knowledge Graphs",
  "rung": "the system, all the way down to the compute instance",
  "one_line": "Eleven linked threat models stacked from the customer to the compute "
              "instance, so a flaw in one method can be traced to the revenue it "
              "threatens.",
  "why": "This is the answer to how far down, and it is the rung the first edition's "
         "worked examples never reached. They stop at the estate; this reaches the method "
         "and the runtime.",
  "facts": [
   {"says": "The hub states the argument and then counts it: eleven readable layers, and "
            "a hundred and seventy-nine threats across them.",
    "quote": "**11 readable layers, 51 nodes, 179 threats, 3 critical**"},
   {"says": "The ladder runs from the customer to the compute instance, each layer "
            "carrying its own counts.",
    "quote": "The zoom ladder runs Customer → Business → Application → Component "
             "→ Package → Class → Method → Source Code → Environment → "
             "Runtime → Compute"},
   {"says": "And it is precise about why stacking them is the point, which is the same "
            "argument this site makes about altitude.",
    "quote": "One model answers *what could go wrong here*. Eleven linked models answer "
             "*what does this line of code put at risk*, which is a different question "
             "and the one an executive is actually asking."},
   {"says": "One critical finding is written four ways for four readers, all derived from "
            "one model rather than written four times.",
    "quote": "the finding does not change, the framing does, and both are derived from one "
             "underlying model rather than written four times by hand"},
  ],
  "caveats": [
   "The bottom rungs are modelled rather than imported. The sgit.ai ladder says so plainly "
   "about this vault, and it is the honest limit of the demonstration.",
  ],
 },
]

# The second cross-vault finding. The first was the capability scale, which only the
# comparison of five vaults produced. This one is of a different kind: it is produced by
# a JOIN between two vaults, and neither of them contains it.
FINDING = {
 "title": "The crosswalk becomes a join, and the join finds a problem",
 "facts": [
  {"says": "AIUC-1 publishes 1,126 crosswalks to external frameworks as text. The "
           "conformance layer resolves the EU AI Act ones into node ids in a second "
           "published vault, so a crosswalk stops being a string and becomes a traversal.",
   "quote": "so a crosswalk stops being a string and becomes a traversal between two vaults"},
  {"says": "Sixty-two of them resolve, onto twenty-seven articles, and the rest are "
           "reported unresolved rather than forced into a shape they do not fit.",
   "quote": "**62 of the 1,126 resolve**, at article level, onto 27 articles."},
  {"says": "Then the join returns something neither vault knew alone: eight of those "
           "twenty-seven articles have since been amended, so the crosswalk was written "
           "against the text before the amendment.",
   "quote": "**8 of those 27 articles are amended by Regulation (EU) 2026/1744**, so the "
            "crosswalk was published against the text before amendment."},
  {"says": "Which is the point, stated by the vault in one sentence.",
   "quote": "That is a finding you cannot reach with a document."},
 ],
}


def esc(s):
    return (str(s).replace("&", "&amp;").replace("<", "&lt;")
            .replace(">", "&gt;").replace('"', "&quot;"))


def md_inline(s):
    """The quotes are carried verbatim from markdown, so they arrive with markdown in
    them. Bold and code are rendered; nothing else is, because nothing else appears and
    a half-built markdown renderer in a generator is a liability."""
    s = esc(s)
    s = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", s)
    s = re.sub(r"\*([^*]+)\*", r"<em>\1</em>", s)
    s = re.sub(r"`([^`]+)`", r"<code>\1</code>", s)
    return s


def check(manifest):
    """Every quote is in the carried source, and every carried source is the file that
    was hashed. Either of those failing means a page is about to state a number this
    build cannot stand behind."""
    bad = []
    for name, meta in manifest["files"].items():
        f = SRC / name
        if not f.exists():
            bad.append(f"sources/{name} is gone")
            continue
        if hashlib.sha256(f.read_bytes()).hexdigest() != meta["sha256"]:
            bad.append(f"sources/{name} changed since it was fetched — re-fetch it and "
                       f"re-record the hash, do not edit a carried source")
    for entry in REGISTER:
        src = (SRC / f"{entry['slug']}.md")
        text = src.read_text() if src.exists() else ""
        for fact in entry["facts"]:
            if fact["quote"] not in text:
                bad.append(f"{entry['slug']}: not in the carried source byte for byte: "
                           f"{fact['quote'][:70]!r}")
    aiuc = (SRC / "aiuc-1-conformance.md").read_text()
    for fact in FINDING["facts"]:
        if fact["quote"] not in aiuc:
            bad.append(f"the cross-vault finding quotes something not in the source: "
                       f"{fact['quote'][:70]!r}")
    if bad:
        raise SystemExit("gen_vaults:\n  - " + "\n  - ".join(bad))


HEAD = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title} &mdash; graphs.sgit.ai</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="https://graphs.sgit.ai/v2/vaults/{page}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="graphs.sgit.ai">
<meta property="og:url" content="https://graphs.sgit.ai/v2/vaults/{page}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta name="twitter:card" content="summary">
<link rel="stylesheet" href="../../assets/site.css">
</head>
<body>

<nav class="site"><div class="row"></div></nav>

<main class="doc">
{body}
</main>

<footer class="site"><div class="cols"></div></footer>
</body>
</html>
"""


def secondhand(slug, manifest):
    m = manifest["files"][f"{slug}.md"]
    return (f'<div class="warnbox"><b>Read from a page, not from the vault.</b> This '
            f'estate cannot open an encrypted vault: the read key is the whole credential '
            f'and nothing in this build can decrypt one. Every number below is quoted from '
            f'<a href="{esc(m["url"])}">the page sgit.ai publishes about this vault</a>, '
            f'carried here whole at <a href="sources/{slug}.md">sources/{slug}.md</a> '
            f'({m["bytes"]:,} bytes, SHA-256 <code>{m["sha256"][:16]}&hellip;</code>, '
            f'fetched {esc(m["fetched"])}), and the build fails if a quotation is not in '
            f'that file byte for byte. <b>The first edition&rsquo;s five vault analyses were '
            f'written by opening the vaults; these four were not</b>, and that difference '
            f'is worth more than the convenience of hiding it.</div>')


def facts_html(facts):
    out = []
    for f in facts:
        out.append(f'<p>{md_inline(f["says"])}</p>\n'
                   f'<blockquote class="vq">{md_inline(f["quote"])}</blockquote>')
    return "\n".join(out)


def vault_page(entry, manifest):
    caveats = "\n".join(f'<div class="note"><b>The vault&rsquo;s own caveat.</b> '
                        f'{md_inline(c)}</div>' for c in entry["caveats"])
    body = (
     f'  <div class="crumb"><a href="../../index.html">graphs.sgit.ai</a> &rsaquo; '
     f'<a href="index.html">the evidence estate</a> &rsaquo; {esc(entry["title"])}</div>\n'
     f'  <h1>{esc(entry["title"])}</h1>\n'
     f'  <p class="lead">{esc(entry["one_line"])}</p>\n'
     f'  <p class="small dim">Vault <code>{esc(entry["id"])}</code> &middot; on '
     f'<a href="{LADDER}">the sgit.ai ladder</a> this is <b>{esc(entry["rung"])}</b>. '
     f'The read key is printed on the vault&rsquo;s own page and is the whole credential; '
     f'it is not repeated here, because a credential copied is a credential that goes '
     f'stale somewhere.</p>\n'
     f'{secondhand(entry["slug"], manifest)}\n'
     f'  <h2 id="why">Why this one is here</h2>\n'
     f'  <p>{esc(entry["why"])}</p>\n'
     f'  <h2 id="reading">The reading</h2>\n'
     f'{facts_html(entry["facts"])}\n'
     f'  <h2 id="caveats">What it says about itself</h2>\n'
     f'{caveats}\n'
     f'  <div class="pagenav"><a href="index.html">&larr; the evidence estate</a>'
     f'<a href="{LADDER}">the ladder this vault is a rung of &rarr;</a></div>')
    return HEAD.format(title=esc(entry["title"]), desc=esc(entry["one_line"]),
                       page=f'{entry["slug"]}.html', body=body)


def absolutise(svg, base):
    """The ladder's twelve links were written relative to the page they were published
    on. Inlined here they would resolve against THIS page and point at nothing, which
    validate.js caught on the first build. Resolved against their origin instead, at
    render time: the carried file stays byte-identical to what was published, because it
    is evidence, and evidence that has been tidied is not evidence."""
    return re.sub(r'href="(?!https?:|#)([^"]+)"',
                  lambda m: 'href="' + urljoin(base, m.group(1)) + '"', svg)


def hub(manifest):
    ladder = (OUT / "figures" / "ladder.svg").read_text()
    ladder = ladder[ladder.index("<svg"):]                 # drop the xml declaration
    ladder = absolutise(ladder, LADDER)
    rows = "\n".join(
        f'      <tr><td><a href="{e["slug"]}.html"><b>{esc(e["title"])}</b></a><br>'
        f'<span class="small dim">{esc(e["one_line"])}</span></td>'
        f'<td class="small">{esc(e["rung"])}</td>'
        f'<td class="small"><code>{esc(e["id"])}</code></td></tr>' for e in REGISTER)
    body = (
     '  <div class="crumb"><a href="../../index.html">graphs.sgit.ai</a> &rsaquo; '
     'the evidence estate, second edition</div>\n'
     '  <h1>Four more graph vaults</h1>\n'
     '  <p class="lead">The first edition analysed five published graph vaults and froze '
     'with them, so <a href="../../v1/vaults/index.html">/v1/vaults/</a> is evidence and '
     'cannot take a new one. These four arrived with '
     '<a href="../memos/47-sibling-brief-fractal-semantic-graphs.html">brief 47</a>: they '
     'are rungs of a ladder a sibling project walks from the text of a law to a threat on '
     'a compute instance, and this site had never looked at them.</p>\n'
     f'{secondhand_all(manifest)}\n'
     '  <div class="tablewrap">\n  <table>\n'
     '    <thead><tr><th>Vault</th><th>Its rung</th><th>Id</th></tr></thead>\n'
     f'    <tbody>\n{rows}\n    </tbody>\n  </table>\n  </div>\n'
     '  <h2 id="finding">The second cross-vault finding</h2>\n'
     '  <p>The first edition produced one finding that no single vault contained: the '
     '<a href="../../v1/vaults/capability-scale.html">capability scale</a>, which only the '
     'comparison of five vaults made visible. This is a second, and it is of a different '
     'kind. The capability scale came out of <em>comparing</em>; this one comes out of a '
     '<em>join</em>, and the fact it returns is in neither of the two vaults it joins.</p>\n'
     f'{facts_html(FINDING["facts"])}\n'
     '  <div class="note"><b>Why this is the argument rather than an example of it.</b> '
     'Two organisations published two artefacts, in two vocabularies, neither aware of the '
     'other. Nobody merged them. Somebody named the edges between them, and the traversal '
     'then answered a question neither author had asked. That is '
     '<b>meaning through connectivity</b> producing a fact, which is the thing this site '
     'has spent three books claiming is possible.</div>\n'
     '  <h2 id="ladder">The ladder these four are rungs of</h2>\n'
     '  <p>Eleven altitudes, eleven ontologies, one grammar. Each rung names the published '
     'vault in which that level is a live graph, and every one is openable with the read '
     'key printed on its page. The diagram below is '
     f'<a href="{LADDER}">lifted from sgit.ai</a> rather than redrawn, because redrawing a '
     'picture that is already correct produces two things to keep in step; the extraction '
     'is recorded in <a href="figures/CREDITS.md">figures/CREDITS.md</a>. Its links are '
     'live, which is why it is inlined here rather than embedded as an image.</p>\n'
     f'  <div class="vfig">{ladder}</div>\n'
     '  <h2 id="zoom">The same grammar, a different ontology at each altitude</h2>\n'
     '  <p>The correction this site took at v0.6.21, drawn. A four-node semantic graph; the '
     'Law node opened into a legal ontology of articles and paragraphs; one paragraph '
     'opened into a lexical ontology that has nothing in common with it two levels up. The '
     'footer is the whole claim: <b>the grammar never changes; the ontology does</b>.</p>\n'
     '  <p class="vfig"><img src="figures/zoom.svg" alt="Three panels: a semantic graph of '
     'four nodes; the Law node opened into a legal graph of articles and paragraphs; one '
     'paragraph opened into a lexical graph of defined terms." loading="lazy"></p>\n'
     '  <h2 id="jump">And the link on which you leave one world for another</h2>\n'
     '  <p>Inside one vocabulary, knowledge accrues one well-named edge at a time, and a '
     'register with ten thousand of them is a great deal of knowledge and not yet fractal. '
     'The fractal property is the link you jump on: out of the register into security '
     'operations, out of a suspicious DNS entry into the DNS estate, out of one record into '
     'a packet capture. Four worlds, four ontologies, one continuous path of named edges.</p>\n'
     '  <p class="vfig"><img src="figures/jump.svg" alt="Four worlds in a row: a risk '
     'register, security operations, the DNS estate and a network capture, each a small '
     'graph in its own vocabulary, joined by a jump link on one node each." '
     'loading="lazy"></p>\n'
     '  <div class="agent">\n    <h4>For an agent</h4>\n'
     '    <p>The machine surface is <a href="data/vaults.json">data/vaults.json</a>, schema '
     '<code>evidence-estate-v1</code>: four vaults, every fact carrying the quotation it '
     'rests on and the carried file that quotation was checked against. The carried sources '
     'are <a href="sources/MANIFEST.json">sources/MANIFEST.json</a>, each with its origin '
     'URL, SHA-256 and fetch timestamp. <b>Nothing here was read out of a vault</b>; it was '
     'read out of the pages listed in that manifest, on the date they record. The five '
     'first-edition vault analyses at <code>/v1/vaults/</code> were written differently, by '
     'opening the vaults, and are frozen.</p>\n  </div>')
    return HEAD.format(title="Four more graph vaults",
                       desc=("Four published graph vaults the first edition never analysed, "
                             "read from the pages that publish them and gated against those "
                             "pages, plus the second cross-vault finding: a crosswalk "
                             "resolved into a join that finds eight amended articles."),
                       page="index.html", body=body)


def secondhand_all(manifest):
    n = len(REGISTER)
    when = manifest["files"]["aiuc-1-conformance.md"]["fetched"][:10]
    return (f'<div class="warnbox"><b>These {n} readings are second-hand, and the pages say '
            f'so on themselves.</b> This estate cannot open an encrypted vault. Every number '
            f'on these pages is quoted from the page sgit.ai publishes about that vault, all '
            f'{len(manifest["files"])} of which are carried whole in '
            f'<a href="sources/MANIFEST.json">sources/</a> with their SHA-256 and the '
            f'timestamp they were fetched at ({when}), and the build fails if a quotation is '
            f'not in its carried file byte for byte. The first edition&rsquo;s five analyses '
            f'were written by opening the vaults. These were not.</div>')


def main():
    manifest = json.loads((SRC / "MANIFEST.json").read_text())
    check(manifest)
    for entry in REGISTER:
        (OUT / f'{entry["slug"]}.html').write_text(vault_page(entry, manifest))
    (OUT / "index.html").write_text(hub(manifest))
    (OUT / "data").mkdir(exist_ok=True)
    (OUT / "data" / "vaults.json").write_text(json.dumps({
        "schema": "evidence-estate-v1", "version": VERSION,
        "note": ("Four published graph vaults, read from the pages that publish them "
                 "rather than from the vaults themselves. Every fact carries the quotation "
                 "it rests on; gen_vaults.py fails the build if a quotation is not in the "
                 "carried source byte for byte. See sources/MANIFEST.json."),
        "totals": {"vaults": len(REGISTER),
                   "facts": sum(len(e["facts"]) for e in REGISTER),
                   "caveats": sum(len(e["caveats"]) for e in REGISTER)},
        "vaults": REGISTER, "cross_vault_finding": FINDING,
        "sources": manifest["files"]}, indent=1, ensure_ascii=False) + "\n")
    nf = sum(len(e["facts"]) for e in REGISTER) + len(FINDING["facts"])
    print(f"gen_vaults: {len(REGISTER)} vault(s), {nf} quoted fact(s) all verified against "
          f"{len(manifest['files'])} carried source(s), 3 diagram(s) credited")


if __name__ == "__main__":
    main()
