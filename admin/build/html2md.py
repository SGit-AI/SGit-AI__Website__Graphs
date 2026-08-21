#!/usr/bin/env python3
"""One-shot migration: lifts the sixteen chapter sources from hand-written HTML
into markdown under content/, in the grammar gen_pages.py renders.

Kept in the repository as provenance — it documents how content/ was born — but
it is not part of the release process: after the migration, content/*.md is the
source of truth and this script should never run again (it would overwrite
editorial work with a lift of the generated pages).

The contract: prose becomes markdown (headings, paragraphs, lists, tables,
links, emphasis); the house components become ::: directives (note, warn,
claim, quote, agent, ladder, meta) or a ```path fence; anything the converter
is not certain about passes through as embedded HTML, verbatim — markdown
allows that, and fidelity beats purity. gen_pages.py's check script proves the
round trip loses no text.
"""
import re
from pathlib import Path
from bs4 import BeautifulSoup, NavigableString, Tag

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "content"

# output-page path -> content name (chapter order = book order, plus glossary etc.)
PAGES = {
    "why-graphs/index.html": "why-graphs",
    "start/index.html": "start",
    "grammar/index.html": "grammar",
    "grammar/edge-set.html": "grammar-edge-set",
    "depth/index.html": "depth",
    "depth/boundaries.html": "depth-boundaries",
    "examples/index.html": "examples",
    "examples/browser-isolation.html": "examples-browser-isolation",
    "examples/2fa.html": "examples-2fa",
    "examples/article-26-5.html": "examples-article-26-5",
    "maps/index.html": "maps",
    "shipped/index.html": "shipped",
    "origins/index.html": "origins",
    "network/index.html": "network",
    "glossary/index.html": "glossary",
    "about/participant.html": "about-participant",
}

MD_ESCAPE = str.maketrans({c: "\\" + c for c in "*_[]`"})


def inline(node):
    """Inline HTML -> inline markdown; unknown spans stay as raw HTML."""
    if isinstance(node, NavigableString):
        return str(node).translate(MD_ESCAPE)
    if not isinstance(node, Tag):
        return ""
    inner = "".join(inline(c) for c in node.children)
    if node.name in ("b", "strong"):
        return f"**{inner}**"
    if node.name in ("i", "em"):
        return f"*{inner}*"
    if node.name == "code":
        raw = node.get_text()
        fence = "``" if "`" in raw else "`"
        out = f"{fence}{raw}{fence}"
        if node.attrs and node.attrs != {}:  # data-banned-verb etc: keep raw
            return str(node)
        return out
    if node.name == "a" and set(node.attrs) <= {"href"}:
        return f"[{inner}]({node['href']})"
    return str(node)  # spans with classes, br, anything styled: raw HTML


def cell(td):
    return "".join(inline(c) for c in td.children).replace("|", "\\|").replace("\n", " ").strip()


def table_md(table):
    rows = table.find_all("tr")
    heads = [cell(th) for th in rows[0].find_all(["th", "td"])]
    lines = ["| " + " | ".join(heads) + " |",
             "|" + "|".join("---" for _ in heads) + "|"]
    for tr in rows[1:]:
        lines.append("| " + " | ".join(cell(td) for td in tr.find_all("td")) + " |")
    cls = table.get("class") or []
    attr = " {." + " .".join(cls) + "}" if cls else ""
    # the class line needs a blank line before it, or the table parser eats it as a row
    return "\n".join(lines) + (f"\n\n{attr.strip()}" if attr else "")


def pathline_md(div):
    parts = []
    for c in div.children:
        if isinstance(c, NavigableString):
            s = str(c).strip("\n")
            if s.strip():
                parts.append(s)
            continue
        cls = c.get("class") or []
        if "nd" in cls:
            parts.append(f"[{c.get_text()}]")
        elif "ed" in cls:
            parts.append(f"<-{c.get_text()}-" if "back" in cls else f"-{c.get_text()}->")
        elif "say" in cls:
            parts.append("\nsay: " + "".join(inline(x) for x in c.children).strip())
        else:
            parts.append(str(c))
    body = " ".join(p.strip() for p in parts if p.strip() and not p.startswith("\nsay:"))
    say = next((p[1:] for p in parts if p.startswith("\nsay:")), None)
    out = "```path\n" + body + "\n"
    if say:
        out += say + "\n"
    return out + "```"


def ladder_md(div):
    out = ["::: ladder"]
    for cap in div.find_all("div", class_="cap", recursive=False):
        num = cap.find("div", class_="capnum").get_text().strip()
        h3 = cap.find("h3")
        out.append(f"\n### {num} · {''.join(inline(c) for c in h3.children)}\n")
        for el in cap.children:
            if not isinstance(el, Tag) or el.name in ("div", "h3"):
                continue
            if el.name == "span" and "from" in (el.get("class") or []):
                # blank line first, or the ~ line lazily continues the paragraph above
                out.append("\n~ " + "".join(inline(c) for c in el.children).strip())
            elif el.name == "p":
                out.append("".join(inline(c) for c in el.children).strip())
            else:
                out.append(str(el))
    out.append(":::")
    return "\n".join(out)


def docmeta_md(div):
    out = ["::: meta"]
    ks = div.find_all("div", class_="k")
    vs = div.find_all("div", class_="v")
    for k, v in zip(ks, vs):
        out.append(f"{k.get_text().strip()}:: " + "".join(inline(c) for c in v.children).strip())
    out.append(":::")
    return "\n".join(out)


BLOCK_TAGS = {"p", "ul", "ol", "table", "div", "h2", "h3", "h4", "blockquote", "pre"}


def container(name, div):
    """A note/warn box usually holds one inline run (text + <b> + links straight
    in the div); an agent box holds <p> blocks. Treat each shape as itself —
    splitting an inline run on every tag fragments the sentence."""
    from bs4 import Tag as _Tag
    has_blocks = any(isinstance(c, _Tag) and c.name in BLOCK_TAGS for c in div.children)
    if not has_blocks:
        inner = "".join(inline(c) for c in div.children).strip()
    else:
        body = []
        for c in div.children:
            body.append(block(c) if isinstance(c, Tag) else str(c).strip())
        inner = "\n\n".join(b for b in body if b and b.strip())
    return f"::: {name}\n{inner}\n:::"


def quote_md(bq):
    parts, attribution = [], None
    for c in bq.children:
        if isinstance(c, Tag) and c.name == "span" and "small" in (c.get("class") or []):
            attribution = "".join(inline(x) for x in c.children).strip()
        elif isinstance(c, NavigableString):
            if str(c).strip():
                parts.append(str(c).strip("\n"))
        else:
            parts.append(inline(c))
    text = "".join(parts).strip()
    out = f"::: quote\n{text}\n"
    if attribution:
        out += f"\n{attribution}\n"
    return out + ":::"


def block(el):
    if isinstance(el, NavigableString):
        s = str(el).strip()
        return s
    name, cls = el.name, (el.get("class") or [])
    if name == "h1":
        return "# " + "".join(inline(c) for c in el.children)
    if name in ("h2", "h3"):
        level = "#" * int(name[1])
        txt = "".join(inline(c) for c in el.children)
        anchor = f" {{#{el['id']}}}" if el.get("id") else ""
        return f"{level} {txt}{anchor}"
    if name == "p":
        if "claim" in cls:
            return "::: claim\n" + "".join(inline(c) for c in el.children).strip() + "\n:::"
        if cls and cls != ["lead"]:
            return str(el)  # styled paragraph: raw
        return "".join(inline(c) for c in el.children).strip()
    if name in ("ul", "ol"):
        out = []
        for i, li in enumerate(el.find_all("li", recursive=False), 1):
            mark = "-" if name == "ul" else f"{i}."
            out.append(f"{mark} " + "".join(inline(c) for c in li.children).replace("\n", " ").strip())
        return "\n".join(out)
    if name == "div":
        if "note" in cls: return container("note", el)
        if "warnbox" in cls: return container("warn", el)
        if "agent" in cls:
            h4 = el.find("h4")
            if h4: h4.decompose()
            return container("agent", el)
        if "pathline" in cls: return pathline_md(el)
        if "ladder" in cls: return ladder_md(el)
        if "docmeta" in cls: return docmeta_md(el)
        if "tablewrap" in cls:
            t = el.find("table")
            if t and not t.find("br") and not t.find("ul"):
                return table_md(t)
            return str(el)
        return str(el)  # cards, timeline, epal, evbox, split: raw passthrough
    if name == "blockquote" and "challenge" in cls:
        return quote_md(el)
    if name == "table":
        return table_md(el)
    return str(el)


def convert(page_path, name):
    t = (ROOT / page_path).read_text()
    soup = BeautifulSoup(t, "html.parser")
    head = {
        "title": soup.title.get_text(),
        "description": soup.find("meta", attrs={"name": "description"})["content"],
        "og_title": soup.find("meta", attrs={"property": "og:title"})["content"],
        "og_description": soup.find("meta", attrs={"property": "og:description"})["content"],
    }
    main = soup.find("main", class_="doc")
    crumb = main.find("div", class_="crumb")
    crumb_label, parent = "", ""
    if crumb:
        b = crumb.find("b")
        crumb_label = b.get_text() if b else ""
        anchors = crumb.find_all("a")
        if len(anchors) > 1:  # a middle level, e.g. grammar -> edge set
            parent = f"{anchors[1].get_text()}|{anchors[1]['href']}"
        crumb.decompose()
    nav = main.find("div", class_="pagenav")
    prev_l = next_l = ""
    if nav:
        spans = nav.find_all("span", recursive=False)
        if len(spans) == 2:
            pa, na = spans[0].find("a"), spans[1].find("a")
            if pa: prev_l = f"{pa.get_text()}|{pa['href']}"
            if na: next_l = f"{na.get_text()}|{na['href']}"
        nav.decompose()

    blocks = [block(c) for c in main.children]
    body = "\n\n".join(b for b in blocks if b and b.strip())
    body = re.sub(r"\n{3,}", "\n\n", body)

    fm = ["---",
          f"path: {page_path}",
          f"title: {head['title']}",
          f"description: {head['description']}",
          f"og_title: {head['og_title']}",
          f"og_description: {head['og_description']}",
          f"crumb: {crumb_label}",
          f"parent: {parent}",
          f"prev: {prev_l}",
          f"next: {next_l}",
          "---", ""]
    (OUT / f"{name}.md").write_text("\n".join(fm) + body + "\n")


OUT.mkdir(exist_ok=True)
for page, name in PAGES.items():
    convert(page, name)
print(f"html2md: {len(PAGES)} chapters lifted into content/")
