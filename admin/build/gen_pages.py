#!/usr/bin/env python3
"""Renders content/*.md into the site's chapter pages. The markdown is the
source of truth for the book's text; the pages are its first projection, and
the book is a projection of the pages — one chain:

    content/*.md  ->  the site pages  ->  /book/ (reader, single page, PDFs)

Run order at release: gen_pages.py, then gen_book.py (the gate enforces both:
check 9 fails if a page lags its markdown or was hand-edited; check 8 fails if
the book lags a page).

The markdown grammar — CommonMark plus tables, raw HTML passthrough, and the
house extensions:

  ::: note / ::: warn        the bordered boxes (note / warnbox)
  ::: claim                  a stated-rule callout (one paragraph)
  ::: quote                  blockquote.challenge; a final line starting with
                             an em-dash becomes the attribution
  ::: agent                  the "For an agent" block (heading added here)
  ::: ladder                 numbered caps; "### N · Title" starts each cap,
                             a line starting "~ " becomes the .from note
  ::: meta                   the docmeta grid; lines of "Key:: value"
  ```path                    a pathline: [Node] -edge-> [Node] <-edge- ...,
                             plain text passes through, "say:" adds the gloss
  ```mermaid                 a rendered diagram (loader added only when used)
  ## Heading {#anchor}       explicit ids, preserved for cross-page links
  {.classname} after a table applies the class (e.g. the glossary tables)

Anything else — cards, timelines, legends — is embedded HTML in the markdown,
which CommonMark passes through verbatim: the escape hatch that guarantees no
layout is lost while the grammar grows. First paragraph after the H1 renders
as the lead.
"""
import hashlib
import html as html_mod
import json
import re
import sys
from pathlib import Path

from markdown_it import MarkdownIt
from mdit_py_plugins.container import container_plugin

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "v1/content"
HOST = "https://graphs.sgit.ai"

MERMAID_LOADER = """
<script type="module">
  import m from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
  m.initialize({ startOnLoad: false, theme: 'neutral',
    themeVariables: { fontFamily: 'ui-sans-serif, system-ui, sans-serif' } });
  m.run({ nodes: document.querySelectorAll('pre.mermaid') });
</script>"""


def front_matter(text):
    m = re.match(r"---\n(.*?)\n---\n", text, re.S)
    fm = {}
    for line in m.group(1).splitlines():
        k, _, v = line.partition(":")
        fm[k.strip()] = v.strip()
    return fm, text[m.end():]


# ---------------------------------------------------------------- parser ----
def build_md():
    md = MarkdownIt("commonmark", {"html": True}).enable("table")

    def simple(name, open_html, close_html):
        def render(self, tokens, idx, options, env):
            return open_html if tokens[idx].nesting == 1 else close_html
        container_plugin(md, name, render=render)

    simple("note", '<div class="note">', "</div>\n")
    simple("warn", '<div class="warnbox">', "</div>\n")
    simple("claim", '<div class="__claim">', "</div>\n")
    simple("quote", '<div class="__quote">', "</div>\n")
    simple("agent", '<div class="agent">\n<h4>For an agent</h4>', "</div>\n")
    simple("ladder", '<div class="__ladder">', "</div>\n")

    def path_fence(self, tokens, idx, options, env):
        tok = tokens[idx]
        if tok.info.strip() == "path":
            return render_pathline(tok.content, md)
        if tok.info.strip() == "mermaid":
            env["mermaid"] = True
            return f'<pre class="mermaid">{html_mod.escape(tok.content)}</pre>\n'
        return self.renderToken(tokens, idx, options, env) if False else \
            f'<pre><code>{html_mod.escape(tok.content)}</code></pre>\n'
    md.add_render_rule("fence", path_fence)
    return md


PATH_TOKEN = re.compile(r"\[([^\]]+)\]|-([A-Za-z0-9_]+)->|<-([A-Za-z0-9_]+)-")


def render_pathline(content, md):
    lines = [l for l in content.splitlines() if l.strip()]
    say = None
    body_lines = []
    for l in lines:
        if l.startswith("say:"):
            say = l[4:].strip()
        else:
            body_lines.append(l.strip())
    body = " ".join(body_lines)
    out, pos = [], 0
    for m in PATH_TOKEN.finditer(body):
        lit = body[pos:m.start()].strip()
        if lit:
            out.append(f" {html_mod.escape(lit)} ")
        if m.group(1) is not None:
            out.append(f'<span class="nd">{html_mod.escape(m.group(1))}</span>')
        elif m.group(2) is not None:
            out.append(f'<span class="ed">{m.group(2)}</span>')
        else:
            out.append(f'<span class="ed back">{m.group(3)}</span>')
        pos = m.end()
    tail = body[pos:].strip()
    if tail:
        out.append(f" {html_mod.escape(tail)} ")
    say_html = (f'\n    <span class="say">{md.renderInline(say)}</span>' if say else "")
    return ('<div class="pathline">\n    ' + "".join(out) + say_html + "\n  </div>\n")


# ------------------------------------------------------------ post-passes ----
def fix_claims(h):
    return re.sub(r'<div class="__claim">\s*<p>(.*?)</p>\s*</div>',
                  r'<p class="claim">\1</p>', h, flags=re.S)


def fix_quotes(h):
    def one(m):
        inner = m.group(1).strip()
        paras = re.findall(r"<p>(.*?)</p>", inner, re.S)
        text = paras[0] if paras else inner
        att = ""
        for p in paras[1:]:
            if p.strip().startswith(("—", "&#8212;", "&mdash;")):
                att = (f'\n    <span class="small dim" style="display:block;'
                       f'font-style:normal;margin-top:.7rem">{p.strip()}</span>')
            else:
                text += "<br>" + p
        return f'<blockquote class="challenge">{text}{att}</blockquote>'
    return re.sub(r'<div class="__quote">(.*?)</div>', one, h, flags=re.S)


def fix_ladders(h):
    def one(m):
        inner = m.group(1)
        inner = re.sub(r"<p>~ (.*?)</p>", r'<span class="from">\1</span>', inner, flags=re.S)
        parts = re.split(r"<h3>(.*?)</h3>", inner)
        out = []
        for i in range(1, len(parts), 2):
            head, body = parts[i], parts[i + 1]
            num, sep, title = head.partition(" · ")
            if not sep:
                num, title = "·", head
            out.append(f'<div class="cap"><div class="capnum">{num}</div>'
                       f"<h3>{title}</h3>{body.strip()}</div>")
        return '<div class="ladder">\n' + "\n".join(out) + "\n</div>"
    return re.sub(r'<div class="__ladder">(.*?)</div>\n', one, h, flags=re.S)


def fix_tables(h):
    # a paragraph of exactly {.classes} following a table applies the classes
    def cls(m):
        classes = m.group(2).replace(".", " ").strip()
        return m.group(1).replace("<table>", f'<table class="{classes}">', 1)
    h = re.sub(r"(<table>.*?</table>)\s*<p>\{(\.[a-z .-]+)\}</p>", cls, h, flags=re.S)
    # wrap each table in .tablewrap as one atomic open+close, skipping tables the
    # embedded HTML already wrapped — pairing opens and closes separately once
    # unbalanced a page whose table sat inside another raw div
    def wrap(m):
        prefix = h[max(0, m.start() - 40):m.start()]
        if 'tablewrap"' in prefix:
            return m.group(0)
        return '<div class="tablewrap">\n' + m.group(0) + "\n</div>"
    h = re.sub(r"<table[^>]*>.*?</table>", wrap, h, flags=re.S)
    return h


def fix_heading_ids(h):
    return re.sub(r"<h([23])>(.*?) \{#([A-Za-z0-9-]+)\}</h\1>",
                  r'<h\1 id="\3">\2</h\1>', h)


def fix_lead(h):
    return re.sub(r"(</h1>\n)<p>", r'\1<p class="lead">', h, count=1)


def meta_blocks(text, md):
    """::: meta blocks are handled before parsing: Key:: value lines."""
    def one(m):
        rows = []
        for line in m.group(1).strip().splitlines():
            k, _, v = line.partition("::")
            rows.append(f'    <div class="k">{k.strip()}</div>'
                        f'<div class="v">{md.renderInline(v.strip())}</div>')
        return '<div class="docmeta">\n' + "\n".join(rows) + "\n  </div>\n"
    # match the closing ::: to its own line end only — \s* would eat the blank
    # line after the block, and an HTML block with no blank line after it
    # swallows the markdown that follows (CommonMark html-block rules)
    return re.sub(r"^::: meta\n(.*?)^:::[ \t]*\n", one, text, flags=re.S | re.M)


# ------------------------------------------------------------------ page ----
def render_page(md_file):
    fm, body = front_matter(md_file.read_text())
    md = build_md()
    env = {}
    body = meta_blocks(body, md)
    h = md.render(body, env)
    for f in (fix_claims, fix_quotes, fix_ladders, fix_heading_ids, fix_tables, fix_lead):
        h = f(h)

    path = fm["path"]
    # two roots now: `up` reaches the first edition's root (v1/), `site` reaches the
    # site root, which is one level further out since the move at v0.4.0.
    up = "../" * (len(Path(path).parts) - 1)
    site = up + "../"
    crumb = f'<a href="{site}index.html">graphs.sgit.ai</a>'
    if fm.get("parent"):
        lbl, _, href = fm["parent"].partition("|")
        crumb += f' → <a href="{href}">{lbl}</a>'
    crumb += f" → <b>{fm['crumb']}</b>"

    nav_bits = []
    for key in ("prev", "next"):
        if fm.get(key):
            lbl, _, href = fm[key].partition("|")
            nav_bits.append(f'<span><a href="{href}">{lbl}</a></span>')
        else:
            nav_bits.append("<span></span>")
    pagenav = f'<div class="pagenav">{nav_bits[0]}{nav_bits[1]}</div>'

    main = f'<main class="doc">\n  <div class="crumb">{crumb}</div>\n{h}\n  {pagenav}\n</main>'
    mermaid = MERMAID_LOADER if env.get("mermaid") else ""

    page = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{fm["title"]}</title>
<meta name="description" content="{fm["description"]}">
<link rel="canonical" href="{HOST}/v1/{path}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="graphs.sgit.ai">
<meta property="og:url" content="{HOST}/v1/{path}">
<meta property="og:title" content="{fm["og_title"]}">
<meta property="og:description" content="{fm["og_description"]}">
<meta name="twitter:card" content="summary">
<link rel="alternate" type="text/markdown" href="{up}content/{md_file.stem}.md" title="This chapter as markdown — the source of truth">
<link rel="stylesheet" href="{site}assets/site.css">
</head>
<body>

<nav class="site"><div class="row"></div></nav>

{main}
{mermaid}
<footer class="site"><div class="cols"></div></footer>
</body>
</html>
'''
    (ROOT / "v1" / path).write_text(page)
    main_m = re.search(r'<main class="doc">(.*?)</main>', page, re.S)
    return {
        "md": f"v1/content/{md_file.name}",
        "md_sha256": hashlib.sha256(md_file.read_bytes()).hexdigest(),
        "path": "v1/" + path,
        "main_sha256": hashlib.sha256(main_m.group(1).encode()).hexdigest(),
    }


def main():
    entries = [render_page(f) for f in sorted(SRC.glob("*.md"))
               if f.read_text().startswith("---")]  # STYLE.md etc. are not chapters
    (SRC / "manifest.json").write_text(json.dumps(
        {"pages": entries}, indent=2) + "\n")
    print(f"gen_pages: {len(entries)} page(s) rendered from content/")


if __name__ == "__main__":
    main()
