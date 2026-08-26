#!/usr/bin/env python3
"""Generates the core graph: the document transformed all the way to the words.

Run from anywhere: python3 admin/build/gen_coregraph.py

Brief 29: the foundational graph that underpins everything else. Every level of the
document is a node with an ID — document, section, block, sentence, word — linked to
its parent, plus span nodes for inline markup (bold, italic, code, link) covering the
word instances they mark, and one form node per distinct word with its count and every
instance. IDs are the reference currency; byte ranges are kept only as build-time
verification metadata, never as the pointer a cross-reference uses.

Storage answers the one-big-file question with shards: an index with the section
skeleton and counts, one shard per section with prose, and a word-form index, so a
viewer can start at the document and expand bit by bit, fetching only what it opens.

Gates (any failure kills the build):
  1. block byte ranges reassemble each section body exactly (gaps whitespace-only)
  2. sentences reassemble each block's clean text (whitespace-collapsed equality)
  3. the word-form totals equal the word-instance total
  4. every span covers at least one word unless it marks pure punctuation or code
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SLUG = "thinking-in-graphs"
SRC = ROOT / "v2" / "universe" / "docs" / SLUG / "source.md"
OUT = ROOT / "v2" / "universe" / "data" / "core" / SLUG
VERSION = (ROOT / "admin" / "build" / "version.txt").read_text().strip()

LADDER = {
    "doc": "document", "sec": "section", "blk": "block",
    "sen": "sentence", "wrd": "word", "mk": "span", "w": "form",
}
NO_SPLIT_AFTER = {"e.g", "i.e", "vs", "etc", "cf", "mr", "mrs", "dr", "st", "no", "fig"}
WORD_RE = re.compile(r"[A-Za-z0-9_]+(?:['’-][A-Za-z0-9_]+)*")
INLINE_RE = re.compile(
    r"(?P<code>`[^`\n]+`)|(?P<bold>\*\*[^*\n]+\*\*)|"
    r"(?P<link>\[[^\]\n]+\]\([^)\n]+\))|(?P<ital>\*[^*\n]+\*|(?<![\w])_[^_\n]+_(?![\w]))")


def headings(raw):
    """(title, level, byte start) per heading, fences respected; duplicate titles fail."""
    heads, pos, fence = [], 0, False
    for ln in raw.split(b"\n"):
        if ln.strip().startswith(b"```"):
            fence = not fence
        if not fence and ln.startswith(b"#"):
            heads.append((ln.lstrip(b"#").strip().decode("utf-8"),
                          len(ln) - len(ln.lstrip(b"#")), pos))
        pos += len(ln) + 1
    titles = [t for t, _, _ in heads]
    dupes = {t for t in titles if titles.count(t) > 1}
    if dupes:
        raise SystemExit(f"gen_coregraph: duplicate heading(s): {sorted(dupes)}")
    return heads


def blocks_of(body, base):
    """Split a section body into (kind, byte start, byte end) blocks.
    Kinds: para, item, code, quote, table, rule, meta (the **k:** v header lines)."""
    out, lines, pos, i = [], body.split(b"\n"), base, 0
    offs = []
    for ln in lines:
        offs.append(pos)
        pos += len(ln) + 1
    while i < len(lines):
        ln = lines[i].strip()
        if not ln:
            i += 1
            continue
        start = offs[i]
        if ln.startswith(b"```"):
            j = i + 1
            while j < len(lines) and not lines[j].strip().startswith(b"```"):
                j += 1
            end = offs[j] + len(lines[j]) if j < len(lines) else offs[len(lines) - 1] + len(lines[-1])
            out.append(("code", start, end))
            i = j + 1
        elif ln in (b"---", b"***", b"___"):
            out.append(("rule", start, start + len(lines[i])))
            i += 1
        elif ln.startswith((b"- ", b"* ", b"+ ")) or re.match(rb"\d+\.\s", ln):
            # each top-level item is its own block; indented continuation folds into it
            def is_item(x):
                return x.startswith((b"- ", b"* ", b"+ ")) or bool(re.match(rb"\d+\.\s", x))
            j = i
            while True:
                k = j
                while (k + 1 < len(lines) and lines[k + 1].strip()
                       and lines[k + 1].startswith((b"  ", b"\t"))
                       and not is_item(lines[k + 1].strip())):
                    k += 1
                out.append(("item", offs[j], offs[k] + len(lines[k])))
                if k + 1 < len(lines) and lines[k + 1].strip() and is_item(lines[k + 1].strip()):
                    j = k + 1
                else:
                    i = k + 1
                    break
        else:
            kind = ("quote" if ln.startswith(b">") else
                    "table" if ln.startswith(b"|") else
                    "meta" if ln.startswith(b"**") and ln.endswith(b"  ") is False and b":**" in ln else "para")
            j = i
            while j + 1 < len(lines) and lines[j + 1].strip() and not lines[j + 1].strip().startswith(b"```"):
                j += 1
            out.append((kind, start, offs[j] + len(lines[j])))
            i = j + 1
    return out


def strip_inline(raw_text):
    """Markdown inline markup -> (clean text, spans). Span char ranges index the clean text."""
    clean, spans, last = [], [], 0
    cpos = 0
    for m in INLINE_RE.finditer(raw_text):
        pre = raw_text[last:m.start()]
        clean.append(pre)
        cpos += len(pre)
        kind = m.lastgroup
        g = m.group()
        if kind == "code":
            inner, href = g[1:-1], None
        elif kind == "bold":
            inner, href = g[2:-2], None
        elif kind == "ital":
            inner, href = g[1:-1], None
        else:
            mm = re.match(r"\[([^\]]+)\]\(([^)]+)\)", g)
            inner, href = mm.group(1), mm.group(2)
        spans.append({"kind": kind, "start": cpos, "end": cpos + len(inner), "href": href})
        clean.append(inner)
        cpos += len(inner)
        last = m.end()
    clean.append(raw_text[last:])
    return "".join(clean), spans


def sentences_of(text):
    """(sentence text, char offset) pairs. Heuristic split; brief 29 records it as such."""
    out, start, i, n = [], 0, 0, len(text)
    while i < n:
        c = text[i]
        if c in ".!?":
            j = i + 1
            while j < n and text[j] in "\"')]}":
                j += 1
            word = re.search(r"[A-Za-z.]+$", text[start:i])
            abbrev = word and word.group().rstrip(".").lower() in NO_SPLIT_AFTER
            decimal = c == "." and i + 1 < n and text[i + 1].isdigit()
            if j < n and text[j].isspace() and not abbrev and not decimal:
                k = j
                while k < n and text[k].isspace():
                    k += 1
                if k < n:
                    out.append((text[start:j], start))
                    start = k
                    i = k
                    continue
        i += 1
    if text[start:].strip():
        out.append((text[start:], start))
    return out


def main():
    raw = SRC.read_bytes()
    heads = headings(raw)
    title = heads[0][0]
    doc_id = f"doc:{SLUG}"
    OUT.mkdir(parents=True, exist_ok=True)

    stack, secs = [], []
    for i, (t, lv, start) in enumerate(heads):
        end = heads[i + 1][2] if i + 1 < len(heads) else len(raw)
        if i == 0:
            # the H1 is the document itself; its own body (the header block) is kept too
            secs.append({"id": doc_id, "title": t, "level": lv, "parent": None,
                         "start": start, "end": end})
            stack.append((lv, doc_id))
            continue
        while stack and stack[-1][0] >= lv:
            stack.pop()
        parent = stack[-1][1] if stack else doc_id
        secs.append({"id": f"sec:{t}", "title": t, "level": lv, "parent": parent,
                     "start": start, "end": end})
        stack.append((lv, f"sec:{t}"))

    forms = {}
    totals = {"blocks": 0, "sentences": 0, "words": 0, "spans": 0}
    index_secs = []
    shard_n = 0
    for s in secs:
        body_start = raw.find(b"\n", s["start"]) + 1
        body = raw[body_start:s["end"]]
        blocks = blocks_of(body, body_start)
        # gate 1: ranges reassemble the body; gaps are whitespace only
        cursor = body_start
        for kind, bs, be in blocks:
            if bs < cursor or be < bs:
                raise SystemExit(f"gen_coregraph: block ranges overlap or run backwards in {s['id']}")
            if raw[cursor:bs].strip():
                raise SystemExit(f"gen_coregraph: unaccounted bytes before {kind} in {s['id']}: {raw[cursor:bs][:60]!r}")
            cursor = be
        if raw[cursor:s["end"]].strip():
            raise SystemExit(f"gen_coregraph: unaccounted bytes at end of {s['id']}: {raw[cursor:s['end']][:60]!r}")

        blk_rows, counts = [], {"blocks": 0, "sentences": 0, "words": 0}
        for bn, (kind, bs, be) in enumerate(blocks, 1):
            raw_text = raw[bs:be].decode("utf-8")
            plain = raw_text
            if kind == "item":
                plain = re.sub(r"^(\s*)(?:[-*+]|\d+\.)\s+", r"\1", plain)
            if kind == "quote":
                plain = re.sub(r"^>\s?", "", plain, flags=re.M)
            blk_id = f"blk:{s['title']}/{bn}"
            row = {"id": blk_id, "kind": kind, "range": [bs, be]}
            counts["blocks"] += 1
            if kind in ("para", "item", "quote", "meta"):
                clean, spans = strip_inline(plain)
                sens = sentences_of(clean)
                # gate 2: sentences reassemble the clean text
                if re.sub(r"\s+", " ", " ".join(t for t, _ in sens)).strip() != re.sub(r"\s+", " ", clean).strip():
                    raise SystemExit(f"gen_coregraph: sentence reassembly failed in {blk_id}")
                sen_rows, tok_index = [], []
                for sn, (stext, soff) in enumerate(sens, 1):
                    words = []
                    for wn, wm in enumerate(WORD_RE.finditer(stext), 1):
                        words.append(wm.group())
                        wid = f"wrd:{s['title']}/{bn}.{sn}.{wn}"
                        tok_index.append((soff + wm.start(), soff + wm.end(), wid))
                        f = wm.group().lower()
                        forms.setdefault(f, []).append(wid)
                    sen_rows.append({"n": sn, "text": stext.strip(), "words": words})
                    counts["sentences"] += 1
                    counts["words"] += len(words)
                span_rows = []
                for pn, sp in enumerate(spans, 1):
                    covered = [wid for ws, we, wid in tok_index if ws < sp["end"] and we > sp["start"]]
                    only_sym = not WORD_RE.search(clean[sp["start"]:sp["end"]])
                    if not covered and not only_sym and sp["kind"] != "code":
                        raise SystemExit(f"gen_coregraph: span covers no words in {blk_id}: {sp}")
                    span_rows.append({"id": f"mk:{s['title']}/{bn}.{pn}", "kind": sp["kind"],
                                      **({"href": sp["href"]} if sp["href"] else {}), "covers": covered})
                totals["spans"] += len(span_rows)
                row.update({"text": clean.strip(), "sentences": sen_rows, "spans": span_rows})
            else:
                row["text"] = plain.strip()
            blk_rows.append(row)

        entry = {"id": s["id"], "title": s["title"], "level": s["level"],
                 "parent": s["parent"], "counts": counts}
        if blk_rows:
            shard_n += 1
            entry["shard"] = f"sec-{shard_n:02d}.json"
            (OUT / entry["shard"]).write_text(json.dumps(
                {"sec": s["id"], "blocks": blk_rows}, ensure_ascii=False) + "\n")
        index_secs.append(entry)
        for k in counts:
            totals[k] += counts[k]

    # gate 3: form totals equal instance total
    n_instances = sum(len(v) for v in forms.values())
    if n_instances != totals["words"]:
        raise SystemExit(f"gen_coregraph: form total {n_instances} != word total {totals['words']}")
    (OUT / "words.json").write_text(json.dumps({"doc": doc_id, "forms": [
        {"form": f, "count": len(ids), "instances": ids}
        for f, ids in sorted(forms.items(), key=lambda kv: (-len(kv[1]), kv[0]))
    ]}, ensure_ascii=False) + "\n")
    (OUT / "index.json").write_text(json.dumps({
        "version": VERSION, "slug": SLUG, "doc": doc_id, "title": title,
        "ladder": LADDER, "totals": totals, "forms": "words.json",
        "sections": index_secs}, ensure_ascii=False, indent=1) + "\n")
    size = sum(f.stat().st_size for f in OUT.glob("*.json"))
    print(f"gen_coregraph: {SLUG} — {len(index_secs)} sections, {totals['blocks']} blocks, "
          f"{totals['sentences']} sentences, {totals['words']} words ({len(forms)} forms), "
          f"{totals['spans']} spans, {shard_n} shard(s), {size:,} bytes")


if __name__ == "__main__":
    main()
