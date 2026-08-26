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

Brief 30 adds the two layers the founder asked for sooner more than later:
the formatting graph (fmt.json: heading lines, gaps and raw markdown per block,
keyed by the same block IDs, so formatting lives beside the semantic graph, not
inside it) with the two-way transform gated on it, and the token analysis
(tokens.json: every word form classified, stemmed into families, scored for
different-meanings-in-the-same-document, and connected by sentence
co-occurrence into the document's own attention map).

Gates (any failure kills the build):
  1. block byte ranges reassemble each section body exactly (gaps whitespace-only)
  2. sentences reassemble each block's clean text (whitespace-collapsed equality)
  3. the word-form totals equal the word-instance total
  4. every span covers at least one word unless it marks pure punctuation or code
  5. the document rebuilds from the formatting graph BYTE-IDENTICAL to the source
  6. the semantic shards re-derive from the formatting graph alone (the two
     graphs cannot disagree, because one provably generates the other)
  7. the identity ledger (docs/<slug>/ids.json) covers every doc, section and
     block with a unique live uid, and a second carry-forward pass over its own
     output changes nothing (identity assignment is deterministic)
"""
import difflib
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SLUG = "thinking-in-graphs"
SRC = ROOT / "v2" / "universe" / "docs" / SLUG / "source.md"
OUT = ROOT / "v2" / "universe" / "data" / "core" / SLUG
LEDGER = ROOT / "v2" / "universe" / "docs" / SLUG / "ids.json"
PREFIX = "".join(w[0] for w in SLUG.split("-"))   # thinking-in-graphs -> tig
VERSION = (ROOT / "admin" / "build" / "version.txt").read_text().strip()

LADDER = {
    "doc": "document", "sec": "section", "blk": "block",
    "sen": "sentence", "wrd": "word", "mk": "span", "w": "form",
}
NO_SPLIT_AFTER = {"e.g", "i.e", "vs", "etc", "cf", "mr", "mrs", "dr", "st", "no", "fig"}

# the padding words (function words): the memo's "how many are padding". Curated, not
# exhaustive; a form not listed is assumed to carry meaning until a real POS pass exists.
STOP = set("""a an the this that these those it its it's is are was were be been being am
and or but nor so yet for of in on at by to from with without within into onto over under
between through during before after above below up down out off again further then once
here there where when why how what which who whom whose all any both each few more most
other some such only own same than too very just as if because while until unless about
against not no can will shall may might must could would should do does did doing have has
had having i you he she we they them their theirs my your his her our us me him also
etc e.g i.e via per vs""".split())

# common verbs plus this project's working verbs; heuristic, recorded as such in brief 30.
VERBS = set("""get gets got make makes made take takes took give gives gave go goes went
come comes came see sees saw know knows knew think thinks thought look looks looked want
wants use uses used find finds found tell tells told ask asks asked work works worked seem
seems call calls called try tries tried need needs leave leaves left mean means meant keep
keeps kept let lets begin begins put puts say says said show shows shown run runs ran move
moves connect connects connected create creates created build builds built store stores
stored capture captures captured resolve resolves resolved validate validates validated
derive derives derived emerge emerges emerged trace traces traced anchor anchors anchored
link links linked describe describes described define defines defined depend depends
depended carry carries carried hold holds held apply applies applied become becomes became
provide provides provided require requires required""".split())
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


def classify(form):
    """One class per form: number, code (identifier-shaped), padding, verb, content."""
    if re.fullmatch(r"[0-9]+", form):
        return "number"
    if "_" in form or re.search(r"[0-9]", form) or re.search(r"[a-z][A-Z]", form):
        return "code"
    lower = form.lower()
    if lower in STOP:
        return "padding"
    if lower in VERBS:
        return "verb"
    return "content"


def stem_key(form, vocab):
    """A grouping key: plural and inflection stripped, preferring keys the document
    actually uses. Grouping only, never a claim about morphology."""
    w = form.lower()
    if w.endswith("ies") and len(w) > 4:
        w = w[:-3] + "y"
    elif w.endswith("es") and len(w) > 4 and (w[-3] in "sxz" or w.endswith(("ches", "shes"))):
        w = w[:-2]
    elif w.endswith("s") and not w.endswith("ss") and len(w) > 3:
        w = w[:-1]
    for suf in ("ing", "ed"):
        if w.endswith(suf) and len(w) > len(suf) + 2:
            base = w[: -len(suf)]
            if base in vocab:
                return base
            if base + "e" in vocab:
                return base + "e"
    return w


def within_one_edit(a, b):
    """Levenshtein distance <= 1 without the full matrix."""
    if a == b or abs(len(a) - len(b)) > 1:
        return a == b
    if len(a) == len(b):
        return sum(1 for x, y in zip(a, b) if x != y) == 1
    if len(a) > len(b):
        a, b = b, a
    i = j = miss = 0
    while i < len(a) and j < len(b):
        if a[i] == b[j]:
            i += 1
        else:
            miss += 1
            if miss > 1:
                return False
        j += 1
    return True


def token_analysis(forms, sen_forms, form_sens):
    """The document as its own token universe (brief 30): classes, stem families,
    near-miss pairs, sentence co-occurrence, and the context-spread score that
    flags candidates for different-meanings-in-the-same-document."""
    vocab = set(forms)
    classes = {f: classify(f) for f in forms}
    keys = {f: stem_key(f, {stem_key(x, set()) for x in vocab} | vocab) for f in forms}
    stems = {}
    for f, k in keys.items():
        stems.setdefault(k, []).append(f)
    stems = {k: sorted(v) for k, v in stems.items() if len(v) > 1}

    meaty = sorted(f for f in forms if classes[f] in ("content", "code") and len(f) >= 5)
    near = []
    by_len = {}
    for f in meaty:
        by_len.setdefault(len(f), []).append(f)
    for f in meaty:
        for ln in (len(f), len(f) + 1):
            for g in by_len.get(ln, []):
                if g > f and keys[f] != keys[g] and within_one_edit(f, g):
                    near.append([f, g])

    co = {}
    for s in sen_forms:
        keep = sorted(x for x in s if classes[x] in ("content", "verb", "code"))[:30]
        for i, a in enumerate(keep):
            for b in keep[i + 1:]:
                co[(a, b)] = co.get((a, b), 0) + 1
    edges = [[a, b, w] for (a, b), w in co.items()
             if w >= 2 and len(forms[a]) >= 3 and len(forms[b]) >= 3]
    edges.sort(key=lambda e: -e[2])
    top = {}
    for a, b, w in edges:
        top.setdefault(a, []).append([b, w])
        top.setdefault(b, []).append([a, w])

    spread = {}
    for f, sens in form_sens.items():
        if len(sens) < 5 or classes[f] not in ("content", "code"):
            continue
        ctxs = []
        for si in sorted(set(sens))[:20]:
            ctx = {x for x in sen_forms[si] if x != f and classes[x] in ("content", "verb", "code")}
            if ctx:
                ctxs.append(ctx)
        if len(ctxs) < 3:
            continue
        js, pairs = 0.0, 0
        for i in range(len(ctxs)):
            for j in range(i + 1, len(ctxs)):
                inter = len(ctxs[i] & ctxs[j])
                js += inter / len(ctxs[i] | ctxs[j])
                pairs += 1
        spread[f] = round(1 - js / pairs, 3)

    n_inst = sum(len(v) for v in forms.values())
    pad_inst = sum(len(v) for f, v in forms.items() if classes[f] == "padding")
    rows = []
    for f in sorted(forms, key=lambda x: (-len(forms[x]), x)):
        r = {"form": f, "count": len(forms[f]), "class": classes[f]}
        if keys[f] in stems:
            r["stem"] = keys[f]
        if f in spread:
            r["spread"] = spread[f]
        if f in top:
            r["top"] = top[f][:6]
        rows.append(r)
    stats = {
        "instances": n_inst, "forms": len(forms),
        "by_class": {c: sum(1 for f in forms if classes[f] == c)
                     for c in ("content", "padding", "verb", "code", "number")},
        "padding_share": round(pad_inst / n_inst, 3) if n_inst else 0,
        "hapax": sum(1 for f in forms if len(forms[f]) == 1),
        "stem_families": len(stems),
    }
    return {"stats": stats, "forms": rows,
            "stems": sorted(([k, v] for k, v in stems.items())),
            "near": sorted(near), "edges": edges[:400]}


def assign_ids(current, ledger):
    """The identity ledger's match-then-mint pass (the founder's IDs question,
    answered): a short opaque uid (tig:b42) is minted once and carried forward
    across edits, so cross-references hold the identity while the locator (the
    human-readable structural path) is free to move. Matching order per node:
    same locator (edits in place update the hash), then same content hash (the
    node moved; identity follows it), then fuzzy similarity of locator and text
    head (renamed AND edited). Whatever the document no longer has is retired,
    never deleted, so identity history survives. Deterministic: same input plus
    same ledger always yields the same output (gate 7 enforces it).
    @param current: [(level, locator, text)] in document order
    @param ledger: the previous ids.json content ({} on first run)
    @returns (uid_by_locator, new_ledger_dict)
    """
    prev = {e["uid"]: e for e in (ledger.get("ids") or [])}
    minted = dict(ledger.get("minted") or {})
    unclaimed = {u: e for u, e in prev.items() if e["status"] == "live"}
    live_rows, uid_by_loc = [], {}
    lv = {"doc": "d", "sec": "s", "blk": "b"}

    def claim(uid, level, locator, h, head):
        del unclaimed[uid]
        live_rows.append({"uid": uid, "level": level, "locator": locator,
                          "hash": h, "head": head, "status": "live"})
        uid_by_loc[locator] = uid

    staged = [(level, locator, text,
               hashlib.sha256(text.encode("utf-8")).hexdigest()[:12], text[:80])
              for level, locator, text in current]
    loc_index = {e["locator"]: u for u, e in unclaimed.items()}
    remaining = []
    for level, locator, text, h, head in staged:
        u = loc_index.get(locator)
        if u in unclaimed and prev[u]["level"] == level:
            claim(u, level, locator, h, head)
        else:
            remaining.append((level, locator, text, h, head))
    hash_index = {}
    for u, e in unclaimed.items():
        hash_index.setdefault((e["level"], e["hash"]), []).append(u)
    still = []
    for level, locator, text, h, head in remaining:
        us = [u for u in hash_index.get((level, h), []) if u in unclaimed]
        if us:
            claim(us[0], level, locator, h, head)
        else:
            still.append((level, locator, text, h, head))
    for level, locator, text, h, head in still:
        best, score = None, 0.0
        for u, e in unclaimed.items():
            if e["level"] != level:
                continue
            r = max(difflib.SequenceMatcher(None, e["locator"], locator).ratio(),
                    difflib.SequenceMatcher(None, e.get("head", ""), head).ratio())
            if r > score:
                best, score = u, r
        if best and score >= 0.75:
            claim(best, level, locator, h, head)
        else:
            k = lv[level]
            minted[k] = minted.get(k, 0) + 1
            uid = f'{ledger.get("prefix", PREFIX)}:{k}{minted[k]}'
            live_rows.append({"uid": uid, "level": level, "locator": locator,
                              "hash": h, "head": head, "status": "live"})
            uid_by_loc[locator] = uid
    retired = sorted(
        [{**e, "status": "retired"} for e in unclaimed.values()]
        + [e for e in prev.values() if e["status"] == "retired"],
        key=lambda e: e["uid"])
    return uid_by_loc, {"doc": f"doc:{SLUG}", "prefix": ledger.get("prefix", PREFIX),
                        "levels": ["doc", "sec", "blk"], "minted": minted,
                        "ids": live_rows + retired}


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
    sen_forms, form_sens = [], {}          # per-sentence forms; form -> sentence indexes
    fmt_pieces, fmt_blocks, sem_check = [], {}, {}
    pending_shards = []                    # written after the ledger assigns uids
    fcur = 0                               # the formatting walk's byte cursor
    for s in secs:
        body_start = raw.find(b"\n", s["start"]) + 1
        body = raw[body_start:s["end"]]
        blocks = blocks_of(body, body_start)
        if raw[fcur:s["start"]].strip():
            raise SystemExit(f"gen_coregraph: unaccounted bytes before heading {s['id']}")
        if fcur < s["start"]:
            fmt_pieces.append({"g": raw[fcur:s["start"]].decode("utf-8")})
        fmt_pieces.append({"h": raw[s["start"]:body_start].decode("utf-8")})
        fcur = body_start
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
            if fcur < bs:
                fmt_pieces.append({"g": raw[fcur:bs].decode("utf-8")})
            plain = raw_text
            if kind == "item":
                plain = re.sub(r"^(\s*)(?:[-*+]|\d+\.)\s+", r"\1", plain)
            if kind == "quote":
                plain = re.sub(r"^>\s?", "", plain, flags=re.M)
            blk_id = f"blk:{s['title']}/{bn}"
            fmt_pieces.append({"b": blk_id})
            fmt_blocks[blk_id] = raw_text
            fcur = be
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
                    sidx = len(sen_forms)
                    sen_forms.append(set())
                    for wn, wm in enumerate(WORD_RE.finditer(stext), 1):
                        words.append(wm.group())
                        wid = f"wrd:{s['title']}/{bn}.{sn}.{wn}"
                        tok_index.append((soff + wm.start(), soff + wm.end(), wid))
                        f = wm.group().lower()
                        forms.setdefault(f, []).append(wid)
                        sen_forms[sidx].add(f)
                        form_sens.setdefault(f, []).append(sidx)
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
                sem_check[blk_id] = (kind, row["text"], len(span_rows))
            else:
                row["text"] = plain.strip()
                sem_check[blk_id] = (kind, row["text"], 0)
            blk_rows.append(row)

        entry = {"id": s["id"], "title": s["title"], "level": s["level"],
                 "parent": s["parent"], "counts": counts}
        if blk_rows:
            shard_n += 1
            entry["shard"] = f"sec-{shard_n:02d}.json"
            pending_shards.append((entry["shard"], {"sec": s["id"], "blocks": blk_rows}))
        index_secs.append(entry)
        for k in counts:
            totals[k] += counts[k]

    # the identity ledger (v0.4.40): stable uids beside the structural locators
    old = json.loads(LEDGER.read_text()) if LEDGER.exists() else {}
    current = ([("doc", doc_id, title)]
               + [("sec", s["id"], f'{s["level"]}|{s["title"]}') for s in secs[1:]]
               + [("blk", bid, md) for bid, md in fmt_blocks.items()])
    uid_by_loc, new_ledger = assign_ids(current, old)
    # gate 7: full coverage, unique uids, and an idempotent second pass
    live = [e for e in new_ledger["ids"] if e["status"] == "live"]
    if len(live) != len(current) or len({e["uid"] for e in new_ledger["ids"]}) != len(new_ledger["ids"]):
        raise SystemExit("gen_coregraph: the ledger lost coverage or minted a duplicate uid")
    again_uid, again = assign_ids(current, new_ledger)
    if again != new_ledger or again_uid != uid_by_loc:
        raise SystemExit("gen_coregraph: the ledger is not idempotent — carry-forward is unstable")
    LEDGER.write_text(json.dumps(new_ledger, ensure_ascii=False, indent=1) + "\n")
    for entry in index_secs:
        entry["uid"] = uid_by_loc[entry["id"]]
    for fname, payload in pending_shards:
        for b in payload["blocks"]:
            b["uid"] = uid_by_loc[b["id"]]
        (OUT / fname).write_text(json.dumps(payload, ensure_ascii=False) + "\n")

    # the formatting graph, and gate 5: the document rebuilds byte-identical
    if raw[fcur:].strip():
        raise SystemExit("gen_coregraph: unaccounted bytes at end of document")
    if fcur < len(raw):
        fmt_pieces.append({"g": raw[fcur:].decode("utf-8")})
    rebuilt = "".join(
        p.get("h") or p.get("g") or fmt_blocks[p["b"]] for p in fmt_pieces).encode("utf-8")
    if rebuilt != raw:
        raise SystemExit(f"gen_coregraph: rebuild differs from source "
                         f"({len(rebuilt)} vs {len(raw)} bytes) — the transform is not two-way")
    # gate 6: the semantic shards re-derive from the formatting graph alone
    for blk_id, md in fmt_blocks.items():
        kind, text, n_spans = sem_check[blk_id]
        p2 = md
        if kind == "item":
            p2 = re.sub(r"^(\s*)(?:[-*+]|\d+\.)\s+", r"\1", p2)
        if kind == "quote":
            p2 = re.sub(r"^>\s?", "", p2, flags=re.M)
        if kind in ("para", "item", "quote", "meta"):
            c2, sp2 = strip_inline(p2)
            if c2.strip() != text or len(sp2) != n_spans:
                raise SystemExit(f"gen_coregraph: {blk_id} does not re-derive from fmt.json")
        elif p2.strip() != text:
            raise SystemExit(f"gen_coregraph: {blk_id} does not re-derive from fmt.json")
    (OUT / "fmt.json").write_text(json.dumps(
        {"doc": doc_id, "pieces": fmt_pieces, "blocks": fmt_blocks},
        ensure_ascii=False) + "\n")

    # the token analysis (brief 30)
    tokens = token_analysis(forms, sen_forms, form_sens)
    (OUT / "tokens.json").write_text(json.dumps(
        {"doc": doc_id, "version": VERSION, **tokens}, ensure_ascii=False) + "\n")

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
        "fmt": "fmt.json", "tokens": "tokens.json",
        "sections": index_secs}, ensure_ascii=False, indent=1) + "\n")
    size = sum(f.stat().st_size for f in OUT.glob("*.json"))
    st = tokens["stats"]
    n_ret = sum(1 for e in new_ledger["ids"] if e["status"] == "retired")
    print(f"gen_coregraph: ledger {new_ledger['prefix']}: {len(live)} live uid(s), "
          f"{n_ret} retired, minted d{new_ledger['minted'].get('d', 0)}/"
          f"s{new_ledger['minted'].get('s', 0)}/b{new_ledger['minted'].get('b', 0)}")
    print(f"gen_coregraph: {SLUG} — {len(index_secs)} sections, {totals['blocks']} blocks, "
          f"{totals['sentences']} sentences, {totals['words']} words ({len(forms)} forms), "
          f"{totals['spans']} spans, {shard_n} shard(s), {size:,} bytes; "
          f"rebuild byte-identical; tokens: {st['by_class']['content']} content / "
          f"{st['by_class']['padding']} padding / {st['by_class']['verb']} verb forms, "
          f"padding {round(st['padding_share']*100)}% of instances, "
          f"{st['stem_families']} stem families, {len(tokens['near'])} near-miss pair(s), "
          f"{len(tokens['edges'])} co-occurrence edge(s)")


if __name__ == "__main__":
    main()
