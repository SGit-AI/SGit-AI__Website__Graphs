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
    ("Start here", "v1/start/index.html", [
        ("The five-minute version", "v1/start/index.html"),
        ("Why graphs at all", "v1/why-graphs/index.html"),
        ("Glossary", "v1/glossary/index.html"),
    ], ("v1/start/", "v1/why-graphs/", "v1/glossary/")),
    ("The book", "v2/index.html", [
        ("The second edition &middot; current", "v2/index.html"),
        ("&hellip; the dev pack: the plan", "v2/dev-pack/index.html"),
        ("&hellip; the memos", "v2/memos/index.html"),
        ("&hellip; the review packs", "v2/packs/index.html"),
        ("&hellip; the universe, layer 1", "v2/universe/index.html"),
        ("&hellip; the open decisions", "decisions/index.html"),
        ("The first edition &middot; frozen", "v1/book/index.html"),
        ("&hellip; read it in one page", "v1/book/single.html"),
        ("&hellip; what changed between versions", "v1/book/changes.html"),
        ("&hellip; the reviews", "v1/reviews/index.html"),
        ("&hellip; the sources it came from", "v1/docs/index.html"),
        ("&hellip; the altitude ladder", "v1/altitudes/index.html"),
        ("&hellip; the print PDF (6&times;9)", "v1/book/meaning-through-connectivity.pdf"),
        ("&hellip; the screen PDF (tablet)", "v1/book/meaning-through-connectivity-screen.pdf"),
    ], ("v2/", "book/", "v1/book/", "v1/altitudes/", "v1/reviews/", "decisions/", "v1/docs/")),
    ("The grammar", "v1/grammar/index.html", [
        ("The rules you can apply tomorrow", "v1/grammar/index.html"),
        ("The edge set", "v1/grammar/edge-set.html"),
    ], ("v1/grammar/",)),
    ("Depth", "v1/depth/index.html", [
        ("The full argument", "v1/depth/index.html"),
        ("A graph at every boundary", "v1/depth/boundaries.html"),
    ], ("v1/depth/",)),
    ("The vaults", "v1/vaults/index.html", [
        ("The vaults, opened", "v1/vaults/index.html"),
        ("VoiceDebrief", "v1/vaults/voice-debrief/index.html"),
        ("&hellip; the junction rule", "v1/vaults/voice-debrief/junction.html"),
        ("&hellip; the empty layer", "v1/vaults/voice-debrief/absence.html"),
        ("Regulation Graph", "v1/vaults/regulation-graph/index.html"),
        ("&hellip; the provenance chain", "v1/vaults/regulation-graph/provenance.html"),
        ("&hellip; the query engines", "v1/vaults/regulation-graph/engines.html"),
        ("Risk Mandate", "v1/vaults/risk-mandate/index.html"),
        ("Agentic Browser Isolation", "v1/vaults/agentic-browser-isolation/index.html"),
        ("&hellip; the acceptance mechanism", "v1/vaults/agentic-browser-isolation/acceptance.html"),
        ("Risk Graph Explorer", "v1/vaults/risk-graph-explorer/index.html"),
        ("The capability scale", "v1/vaults/capability-scale.html"),
    ], ("v1/vaults/",)),
    ("Examples", "v1/examples/index.html", [
        ("Worked graphs, with real numbers", "v1/examples/index.html"),
        ("Browser isolation", "v1/examples/browser-isolation.html"),
        ("The 2FA graph", "v1/examples/2fa.html"),
        ("Article 26(5), end to end", "v1/examples/article-26-5.html"),
        ("Wardley maps as graphs", "v1/maps/index.html"),
    ], ("v1/examples/", "v1/maps/")),
    ("Reality", "v1/shipped/index.html", [
        ("What ships, what is argued", "v1/shipped/index.html"),
        ("Origins: 2026", "v1/origins/index.html"),
        ("The network", "v1/network/index.html"),
    ], ("v1/shipped/", "v1/origins/", "v1/network/")),
    ("Site", "v1/documents/index.html", [
        ("The documents", "v1/documents/index.html"),
        ("&hellip; what the graphs found", "v1/documents/what-the-graphs-found.html"),
        ("The memos", "v2/memos/index.html"),
        ("The review packs", "v2/packs/index.html"),
        ("The dev pack: the second book", "v2/dev-pack/index.html"),
        ("Comms: tasks &amp; requests", "admin/comms.html"),
        ("Release history", "admin/versions.html"),
        ("Publishing the book", "admin/publishing.html"),
        ("Admin &amp; engineering", "admin/index.html"),
        ("Where we lose", "v1/about/participant.html"),
    ], ("v1/documents/", "v1/briefs/", "admin/", "v1/about/")),
]

FOOTER = [
    ("Start here", [
        ("&#8594; The five-minute version", "v1/start/index.html"),
        ("Why graphs at all", "v1/why-graphs/index.html"),
        ("Glossary", "v1/glossary/index.html"),
        ("The book", "v1/book/index.html"),
        ("&nbsp;&nbsp;&hellip; in one page", "v1/book/single.html"),
        ("&nbsp;&nbsp;&hellip; as a print PDF", "v1/book/meaning-through-connectivity.pdf"),
        ("&nbsp;&nbsp;&hellip; as a screen PDF", "v1/book/meaning-through-connectivity-screen.pdf"),
    ]),
    ("The grammar", [
        ("The rules", "v1/grammar/index.html"),
        ("The edge set", "v1/grammar/edge-set.html"),
        ("The full argument", "v1/depth/index.html"),
        ("A graph at every boundary", "v1/depth/boundaries.html"),
    ]),
    ("Worked graphs", [
        ("All of them", "v1/examples/index.html"),
        ("Browser isolation", "v1/examples/browser-isolation.html"),
        ("The 2FA graph", "v1/examples/2fa.html"),
        ("Article 26(5)", "v1/examples/article-26-5.html"),
        ("Wardley maps", "v1/maps/index.html"),
    ]),
    ("Reality &amp; site", [
        ("What ships, what is argued", "v1/shipped/index.html"),
        ("Origins: 2026", "v1/origins/index.html"),
        ("The network", "v1/network/index.html"),
        ("The documents", "v1/documents/index.html"),
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
    partnote = PARTNOTE_SELF if rel == "v1/about/participant.html" else PARTNOTE.format(up=up)
    md_twin = f' · <a href="{up}v1/index.md">this page as markdown</a>' if rel == "v1/index.html" else ""
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


def release_date():
    """The date of the current release, read from its own row in the history table.
    Read rather than stamped as today, so a rebuild of an old release does not
    silently re-date it."""
    t = (ROOT / "admin/versions.html").read_text()
    m = re.search(r'class="vnum">' + re.escape(VERSION) + r"<[^>]*>\s*<td>([^<]+)</td>", t)
    return m.group(1).strip() if m else None


def stamp_text_twins():
    """The version also appears in llms.txt, llms-full.txt and index.md, and
    validate.js enforces that it agrees. Nothing used to SET it there on the
    sibling sites, so it was hand-edited every release — and hand-editing it
    silently missed twice. Own it here instead.

    The DATE beside the version in llms.txt is stamped here too, and for the same
    reason: it was not, so it drifted three releases behind before anyone read it."""
    date = release_date()
    stamp = f"Site version: {VERSION}" + (f" ({date})" if date else "")
    out = []
    twins = [("llms.txt", r"Site version: v\d+\.\d+\.\d+(?: \([^)]*\))?", stamp),
             ("llms-full.txt", r"Site version: v\d+\.\d+\.\d+(?: \([^)]*\))?", stamp)]
    if not FREEZE_MANIFEST.exists():
        # the first edition's markdown twin froze with the page it mirrors
        twins.append(("v1/index.md", r"· site v\d+\.\d+\.\d+ ·", f"· site {VERSION} ·"))
    for name, pat, repl in twins:
        f = ROOT / name
        if not f.exists():
            continue
        t = f.read_text()
        # llms-full.txt carries the bare form on its generated header line and the
        # dated form in the copy of llms.txt below it; both are rewritten
        count = 0 if name == "llms-full.txt" else 1
        t2, n = re.subn(pat, repl, t, count=count)
        if n and t2 != t:
            f.write_text(t2)
            out.append(name)
    return out


def is_stub(t):
    """Redirect stubs left at the first edition's former addresses carry no chrome by
    design: they are signposts, not pages, and adding a nav to one would invite a reader
    to stay on it."""
    return '<meta name="robots" content="noindex">' in t and 'This page moved' in t


# Once the first edition is frozen its chrome freezes with it: a frozen page carries the
# nav and the version badge of the release it froze at, which is the honest thing for an
# artefact that is evidence rather than working material. Without this, every release
# would rewrite the nav inside v1/ and gate 14 would fail on the next build.
FROZEN_TREE = ROOT / "v1"
FREEZE_MANIFEST = FROZEN_TREE / "MANIFEST.json"


def main():
    frozen = FREEZE_MANIFEST.exists()
    changed = []
    skipped = 0
    for path in sorted(ROOT.rglob("*.html")):
        if ".git" in path.parts:
            continue
        if frozen and FROZEN_TREE in path.parents:
            skipped += 1
            continue
        rel_ = path.relative_to(ROOT).as_posix()
        if rel_ in ("v1/book/print.html", "v1/book/cover/wrap.html"):
            # print sources carry no site chrome by design
            continue
        if rel_.startswith("v2/packs/") and rel_ != "v2/packs/index.html":
            # a review pack is a document, not a page of the site: it carries its own cover
            # and must read end to end with no link followed, so a nav would be an invitation
            # to leave it
            continue
        rel = path.relative_to(ROOT).as_posix()
        up = "../" * (len(path.relative_to(ROOT).parts) - 1)
        text = path.read_text()
        if is_stub(text):
            continue
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
    note = f", {skipped} frozen page(s) left alone" if skipped else ""
    print(f"chrome: {VERSION} applied — {len(changed)} file(s) updated{note}")
    for c in changed:
        print(f"  · {c}")


if __name__ == "__main__":
    try:
        main()
    except BrokenPipeError:
        sys.stdout = None
