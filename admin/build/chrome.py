#!/usr/bin/env python3
"""The single definition of this site's nav and footer, and the tool that applies it.

Run from anywhere: python3 admin/build/chrome.py

Every page is hand-written static HTML — that stays true, because a human should
be able to open any file and edit it. What is NOT hand-maintained is the chrome:
the nav row (including the version badge that validate.js requires to agree
everywhere) and the footer columns. Those are defined once here and rewritten in
place across the tree, which is what stops a thirty-page site from drifting.

Adding a page: add it to NAV or FOOTER if it belongs there, write the file with
any nav/footer block at all, then run this. The block contents are replaced; the
`here` state is set from the page's own path.

Ported from SGit-AI__Website__PKI with its rules intact.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
VERSION = (ROOT / "admin/build/version.txt").read_text().strip()
GH = "https://github.com/SGit-AI/SGit-AI__Website__Graphs"
PARENT = "https://sgit.ai"
PARENT_TITLE = ("sgit.ai — the parent project: the vault layer, the shipped CLI, and the "
                "three live graph vaults this site teaches from")

# The nav, two levels. Six groups, each wrapping to two rows on a laptop and a
# single collapsed menu on a phone. Each entry is
# (label, own page, [(sub-label, href), ...], (path prefixes)).
#
# Two rules the structure has to keep:
#   · A group label is always a link to a real page, never a menu-only stub. Nothing on
#     this site should be reachable only by opening a dropdown.
#   · `prefixes` decides the "here" state, so a page that is not itself in the nav
#     still lights up the group it belongs to.
NAV = [
    ("Start here", "start/index.html", [
        ("The five-minute version", "start/index.html"),
        ("Why graphs at all", "why-graphs/index.html"),
        ("Glossary", "glossary/index.html"),
    ], ("start/", "why-graphs/", "glossary/")),
    ("The book", "book/index.html", [
        ("Table of contents", "book/index.html"),
        ("Read it in one page", "book/single.html"),
        ("What changed between versions", "book/changes.html"),
        ("The reviews", "reviews/index.html"),
        ("The altitude ladder", "altitudes/index.html"),
        ("&hellip; as one graph", "altitudes/graph.html"),
        ("The print PDF (6&times;9)", "book/meaning-through-connectivity.pdf"),
        ("The screen PDF (tablet)", "book/meaning-through-connectivity-screen.pdf"),
    ], ("book/", "altitudes/")),
    ("The grammar", "grammar/index.html", [
        ("The rules you can apply tomorrow", "grammar/index.html"),
        ("The edge set", "grammar/edge-set.html"),
    ], ("grammar/",)),
    ("Depth", "depth/index.html", [
        ("The full argument", "depth/index.html"),
        ("A graph at every boundary", "depth/boundaries.html"),
    ], ("depth/",)),
    ("The vaults", "vaults/index.html", [
        ("The vaults, opened", "vaults/index.html"),
        ("VoiceDebrief", "vaults/voice-debrief/index.html"),
        ("&hellip; the junction rule", "vaults/voice-debrief/junction.html"),
        ("&hellip; the empty layer", "vaults/voice-debrief/absence.html"),
        ("Regulation Graph", "vaults/regulation-graph/index.html"),
        ("&hellip; the provenance chain", "vaults/regulation-graph/provenance.html"),
        ("&hellip; the query engines", "vaults/regulation-graph/engines.html"),
    ], ("vaults/",)),
    ("Examples", "examples/index.html", [
        ("Worked graphs, with real numbers", "examples/index.html"),
        ("Browser isolation", "examples/browser-isolation.html"),
        ("The 2FA graph", "examples/2fa.html"),
        ("Article 26(5), end to end", "examples/article-26-5.html"),
        ("Wardley maps as graphs", "maps/index.html"),
    ], ("examples/", "maps/")),
    ("Reality", "shipped/index.html", [
        ("What ships, what is argued", "shipped/index.html"),
        ("Origins: 2026", "origins/index.html"),
        ("The network", "network/index.html"),
    ], ("shipped/", "origins/", "network/")),
    ("Site", "documents/index.html", [
        ("The documents", "documents/index.html"),
        ("Comms: tasks &amp; requests", "admin/comms.html"),
        ("Release history", "admin/versions.html"),
        ("Publishing the book", "admin/publishing.html"),
        ("Admin &amp; engineering", "admin/index.html"),
        ("Where we lose", "about/participant.html"),
    ], ("documents/", "briefs/", "admin/", "about/")),
]

FOOTER = [
    ("Start here", [
        ("&#8594; The five-minute version", "start/index.html"),
        ("Why graphs at all", "why-graphs/index.html"),
        ("Glossary", "glossary/index.html"),
        ("The book", "book/index.html"),
        ("&nbsp;&nbsp;&hellip; in one page", "book/single.html"),
        ("&nbsp;&nbsp;&hellip; as a print PDF", "book/meaning-through-connectivity.pdf"),
        ("&nbsp;&nbsp;&hellip; as a screen PDF", "book/meaning-through-connectivity-screen.pdf"),
    ]),
    ("The grammar", [
        ("The rules", "grammar/index.html"),
        ("The edge set", "grammar/edge-set.html"),
        ("The full argument", "depth/index.html"),
        ("A graph at every boundary", "depth/boundaries.html"),
    ]),
    ("Worked graphs", [
        ("All of them", "examples/index.html"),
        ("Browser isolation", "examples/browser-isolation.html"),
        ("The 2FA graph", "examples/2fa.html"),
        ("Article 26(5)", "examples/article-26-5.html"),
        ("Wardley maps", "maps/index.html"),
    ]),
    ("Reality &amp; site", [
        ("What ships, what is argued", "shipped/index.html"),
        ("Origins: 2026", "origins/index.html"),
        ("The network", "network/index.html"),
        ("The documents", "documents/index.html"),
        ("Comms: tasks &amp; requests", "admin/comms.html"),
        ("llms.txt", "llms.txt"),
    ]),
]

BLURB = ("A reference site about one use of graphs: <b>meaning through connectivity</b> — "
         "a node carries no inherent meaning, and what a thing is emerges from the edges "
         "traceable from it. Part of the <a href=\"https://sgit.ai\" "
         "style=\"display:inline;padding:0\"><b>sgit.ai</b></a> network. "
         "All content on this site is released under CC BY 4.0.")
PARTNOTE = ('⚠ Participant disclosure: published by the sgit project, which builds the vault layer '
            'and the graph products this site argues for. <a href="{up}about/participant.html" '
            'style="display:inline;padding:0">Read the disclosure</a>.')
NETLINE = ('<a href="https://sgit.ai"><b>↗ sgit.ai</b></a> — the parent project, and the three live '
           'graph vaults · <a href="https://pki.sgit.ai">↗ pki.sgit.ai</a> — a key means nothing alone · '
           '<a href="https://nhi.sgit.ai">↗ nhi.sgit.ai</a> — graphs need identities too · '
           '<a href="https://sentinel.sgit.ai">↗ sentinel.sgit.ai</a> · '
           '<a href="https://sgit.ai/network/index.html">↗ the network</a>')
PARTNOTE_SELF = '⚠ Participant disclosure: published by the sgit project. You are on the disclosure page.'


def nav_html(rel, up):
    groups = []
    for label, own, subs, prefixes in NAV:
        active = rel == own or any(rel.startswith(pre) for pre in prefixes)
        links = "\n".join(
            f'      <a class="sl{" here" if href == rel else ""}" href="{up}{href}">{text}</a>'
            for text, href in subs)
        groups.append(
            f'    <div class="ni ni-has">\n'
            f'      <a class="nl{" here" if active else ""}" href="{up}{own}">{label}'
            f'<span class="caret">&#9662;</span></a>\n'
            f'      <div class="sub">\n{links}\n      </div>\n'
            f'    </div>')
    rows = "\n".join(groups)
    return (f'<nav class="site"><div class="row">\n'
            f'  <a class="brand" href="{up}index.html">graphs<span>.sgit.ai</span></a>\n'
            f'  <a class="parent" href="{PARENT}" title="{PARENT_TITLE}">↗ part of <b>sgit.ai</b></a>\n'
            f'  <span class="stage-pill">reference draft</span>\n'
            f'  <a class="ver" href="{up}admin/versions.html" title="Site release history">{VERSION}</a>\n'
            f'  <button class="nav-toggle" type="button" aria-expanded="false" aria-label="Menu">Menu</button>\n'
            f'  <div class="nav-items">\n{rows}\n  </div>\n'
            f'  <a class="gh" href="{GH}">★ GitHub</a>\n'
            f'  <script src="{up}assets/nav.js" defer></script>\n'
            f'</div></nav>')


def footer_html(rel, up):
    partnote = PARTNOTE_SELF if rel == "about/participant.html" else PARTNOTE.format(up=up)
    md_twin = f' · <a href="{up}index.md">this page as markdown</a>' if rel == "index.html" else ""
    cols = "\n".join(
        "  <div>\n"
        f"    <h4>{head}</h4>\n"
        + "\n".join(f'    <a href="{l if l.startswith("http") else up + l}">{t}</a>' for t, l in links)
        + "\n  </div>"
        for head, links in FOOTER)
    return (f'<footer class="site"><div class="cols">\n'
            f'  <div>\n'
            f'    <div class="brandline">graphs<span>.sgit.ai</span></div>\n'
            f'    <p>{BLURB}</p>\n'
            f'    <p class="netline">{NETLINE}</p>\n'
            f'    <p class="partnote">{partnote}</p>\n'
            f'    <p class="verline">site <a href="{up}admin/versions.html">{VERSION}</a> · '
            f'<a href="{up}admin/index.html">engineering</a>{md_twin}</p>\n'
            f'  </div>\n{cols}\n</div></footer>')


def stamp_text_twins():
    """The version also appears in llms.txt, llms-full.txt and index.md, and
    validate.js enforces that it agrees. Nothing used to SET it there on the
    sibling sites, so it was hand-edited every release — and hand-editing it
    silently missed twice. Own it here instead."""
    out = []
    for name, pat in (("llms.txt", r"Site version: v\d+\.\d+\.\d+"),
                      ("llms-full.txt", r"Site version: v\d+\.\d+\.\d+"),
                      ("index.md", r"· site v\d+\.\d+\.\d+ ·")):
        f = ROOT / name
        if not f.exists():
            continue
        t = f.read_text()
        repl = (f"Site version: {VERSION}" if "Site version" in pat else f"· site {VERSION} ·")
        t2, n = re.subn(pat, repl, t, count=1)
        if n and t2 != t:
            f.write_text(t2)
            out.append(name)
    return out


def main():
    changed = []
    for path in sorted(ROOT.rglob("*.html")):
        if ".git" in path.parts:
            continue
        if path.relative_to(ROOT).as_posix() in ("book/print.html", "book/cover/wrap.html"):
            # print sources carry no site chrome by design
            continue
        rel = path.relative_to(ROOT).as_posix()
        up = "../" * (len(path.relative_to(ROOT).parts) - 1)
        text = path.read_text()
        before = text
        text, n_nav = re.subn(r'<nav class="site">.*?</nav>', lambda _: nav_html(rel, up),
                              text, count=1, flags=re.S)
        text, n_foot = re.subn(r'<footer class="site">.*?</footer>', lambda _: footer_html(rel, up),
                               text, count=1, flags=re.S)
        if not n_nav or not n_foot:
            print(f"  ! {rel}: missing {'nav' if not n_nav else ''}"
                  f"{' and ' if not n_nav and not n_foot else ''}"
                  f"{'footer' if not n_foot else ''} block", file=sys.stderr)
        if text != before:
            path.write_text(text)
            changed.append(rel)
    changed += stamp_text_twins()
    print(f"chrome: {VERSION} applied — {len(changed)} file(s) updated")
    for c in changed:
        print(f"  · {c}")


if __name__ == "__main__":
    try:
        main()
    except BrokenPipeError:
        sys.stdout = None
