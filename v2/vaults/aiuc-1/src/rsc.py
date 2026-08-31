"""Minimal React Server Components flight-payload reader.

The payload is a sequence of rows `<hex-id>:<body>`. Most bodies are one JSON
value terminated by a newline; `T<hex-len>,` rows carry that many raw characters
of text instead, and are not newline-terminated. Values may reference other rows
as `"$<row-id>:<path>"`, which `resolve` walks.
"""
import re, json

ROW_HEAD = re.compile(r'([0-9a-fA-F]+):')

def flatten(html_text):
    parts = re.findall(r'self\.__next_f\.push\(\[1,(".*?")\]\)</script>', html_text, re.S)
    out = []
    for p in parts:
        try:
            out.append(json.loads(p))
        except Exception:
            pass
    return ''.join(out)

def slice_value(flat, start):
    """Return the JSON value that begins at `start` in the flat payload."""
    opener = flat[start]
    closer = {'[': ']', '{': '}'}[opener]
    depth, in_string, escaped = 0, False, False
    for i in range(start, len(flat)):
        ch = flat[i]
        if in_string:
            if escaped:
                escaped = False
            elif ch == '\\':
                escaped = True
            elif ch == '"':
                in_string = False
            continue
        if ch == '"':
            in_string = True
        elif ch == opener:
            depth += 1
        elif ch == closer:
            depth -= 1
            if depth == 0:
                return json.loads(flat[start:i + 1])
    raise ValueError('unterminated JSON value at %d' % start)


def literal(flat, key):
    """The first literal value published under `key`, read without the row table."""
    needle = '"%s":' % key
    at = flat.find(needle)
    while at >= 0:
        start = at + len(needle)
        if flat[start] in '[{':
            return slice_value(flat, start)
        at = flat.find(needle, at + 1)
    raise ValueError('no literal value for %r in payload' % key)


def undefined_to_none(node):
    if isinstance(node, dict):
        return {k: undefined_to_none(v) for k, v in node.items()}
    if isinstance(node, list):
        return [undefined_to_none(v) for v in node]
    if node in ('$undefined', 'undefined'):
        return None
    return node


def prune(node, keys):
    """Drop keys whose values point back at an ancestor, before any expansion.

    The payload's `principle` back-reference makes every control contain its
    whole domain, which contains every control: following it is unbounded. The
    parent is known from context, so the back-reference is dropped, not walked.
    """
    if isinstance(node, dict):
        return {k: prune(v, keys) for k, v in node.items() if k not in keys}
    if isinstance(node, list):
        return [prune(v, keys) for v in node]
    return node


def rows(flat):
    table, i, n = {}, 0, len(flat)
    while i < n:
        m = ROW_HEAD.match(flat, i)
        if not m:
            j = flat.find('\n', i)
            if j < 0:
                break
            i = j + 1
            continue
        rid = m.group(1)
        i = m.end()
        if i < n and flat[i] == 'T':
            comma = flat.find(',', i)
            length = int(flat[i + 1:comma], 16)
            i = comma + 1
            table[rid] = flat[i:i + length]
            i += length
        else:
            j = flat.find('\n', i)
            if j < 0:
                j = n
            body = flat[i:j]
            if body[:1] in '[{"':
                try:
                    table[rid] = json.loads(body)
                except Exception:
                    table[rid] = None
            i = j + 1
        if i < n and flat[i] == '\n':
            i += 1
    return table

def resolve(node, table, depth=0):
    if depth > 100:
        return node
    if isinstance(node, str):
        if node.startswith('$') and not node.startswith('$$'):
            ref = node[1:]
            if ref == 'undefined':
                return None
            if ref[:1] == 'S':
                return node
            rid, _, path = ref.partition(':')
            if rid[:1] == 'L' and re.fullmatch(r'[0-9a-f]+', rid[1:] or ''):
                rid = rid[1:]
            if rid not in table:
                return node
            cur = table[rid]
            if path:
                for step in path.split(':'):
                    try:
                        cur = cur[int(step)] if isinstance(cur, list) else cur[step]
                    except Exception:
                        return node
            return resolve(cur, table, depth + 1)
        return node
    if isinstance(node, list):
        return [resolve(v, table, depth + 1) for v in node]
    if isinstance(node, dict):
        return {k: resolve(v, table, depth + 1) for k, v in node.items()}
    return node

def find_key(node, key, hits=None):
    if hits is None:
        hits = []
    if isinstance(node, dict):
        for k, v in node.items():
            if k == key:
                hits.append(v)
            find_key(v, key, hits)
    elif isinstance(node, list):
        for v in node:
            find_key(v, key, hits)
    return hits


SELF_REF = re.compile(r'principles:(.+)$')


_ROOT = object()


def reresolve(tree, node=_ROOT, depth=0):
    """Resolve payload self-references that point back into the principles tree.

    The site de-duplicates repeated objects (crosswalk entries above all) by
    pointing later occurrences at the first one by path. Once the principles
    tree is in hand, those paths can be walked against it directly.
    """
    if node is _ROOT:
        node = tree
    if depth > 100:
        return node
    if isinstance(node, str):
        if node.startswith('$'):
            match = SELF_REF.search(node)
            if not match:
                return node
            cur = tree
            for step in match.group(1).split(':'):
                try:
                    cur = cur[int(step)] if isinstance(cur, list) else cur[step]
                except Exception:
                    return node
            return reresolve(tree, cur, depth + 1)
        return node
    if isinstance(node, list):
        return [reresolve(tree, v, depth + 1) for v in node]
    if isinstance(node, dict):
        return {k: reresolve(tree, v, depth + 1) for k, v in node.items()}
    return node
