# Appendix C · The harness

*Every number and every figure in this book was produced by one of the scripts below,
run against the repository it describes. They are here so that any claim in the book can
be re-derived rather than believed, and because the time-travel technique is the single
most reusable thing in this appendix.*

---

## 1 · Time travel: photographing a page as it was

The repository carries a git tag for every release. A tag plus a worktree plus a local
web server is a working copy of the site as it existed at that moment, and a headless
browser can photograph it.

Every figure in this book was taken this way. None is a reconstruction.

### The rule learned the hard way

From the v0.4.37 release note, quoted in Chapter 7:

> a zombie headless Chromium from a crashed test run held the debug port and served stale
> modules to every later test on that port, making a working feature look broken; the fix
> was kill, not code

Two operational rules follow, and they are not optional:

- **Never reuse a port.** Not the browser's debug port, not the web server's port. One run,
  one port, forever.
- **Always kill what you spawned**, in a block that runs whether the work succeeded or
  failed.

The twenty figures in this book used twenty distinct server ports and twenty separate
browser launches, each closed in a `finally`.

### The shell script

```bash
#!/bin/bash
# travel.sh <tag> <port> <jobs.json>
# Creates a worktree at <tag>, serves it on <port>, runs the screenshot harness,
# then tears both down.
set -u
TAG=$1; PORT=$2; JOBS=$3
REPO=/path/to/repo
WT=/tmp/hist-$TAG

cd "$REPO"
git worktree add --detach -f "$WT" "$TAG" >/dev/null 2>&1 || { echo "worktree failed for $TAG"; exit 1; }

python3 -m http.server "$PORT" --directory "$WT" --bind 127.0.0.1 >/dev/null 2>&1 &
SRV=$!
for i in $(seq 1 40); do curl -s -o /dev/null "http://127.0.0.1:$PORT/" && break; sleep 0.25; done

node shot.mjs "$PORT" "$JOBS"

kill $SRV 2>/dev/null; wait $SRV 2>/dev/null
cd "$REPO" && git worktree remove --force "$WT" >/dev/null 2>&1
echo "-- $TAG done, worktree removed, server $SRV killed"
```

`git worktree` is the piece that makes this cheap. It checks out a second working copy of
any commit beside your live one, without touching your branch, in under a second, and
`git worktree remove` puts it back.

### The screenshot script

```js
/* shot.mjs — usage: node shot.mjs <port> <jobs.json>
   jobs.json is an array of { path, out, w, h, dpr, settle, wait, script, full } */
import { chromium } from 'playwright';
import fs from 'node:fs';

const [port, jobsFile] = process.argv.slice(2);
const jobs = JSON.parse(fs.readFileSync(jobsFile, 'utf8'));
const base = `http://127.0.0.1:${port}`;

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--font-render-hinting=none'],
});
try {
  for (const j of jobs) {
    const ctx = await browser.newContext({
      viewport: { width: j.w || 1280, height: j.h || 860 },
      deviceScaleFactor: j.dpr || 2,
    });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(String(e).slice(0, 160)));
    try {
      await page.goto(base + j.path, { waitUntil: 'networkidle', timeout: 45000 });
      if (j.wait) await page.waitForSelector(j.wait, { timeout: 20000 }).catch(() => {});
      if (j.script) await page.evaluate(j.script).catch(e => errs.push('script: ' + e.message));
      await page.waitForTimeout(j.settle ?? 2500);
      await page.screenshot({ path: j.out, fullPage: !!j.full });
      console.log(`ok   ${j.out}  ${j.path}${errs.length ? '  [errors: ' + errs[0] + ']' : ''}`);
    } catch (e) {
      console.log(`FAIL ${j.out}  ${j.path}  ${e.message.slice(0, 140)}`);
    }
    await ctx.close();
  }
} finally {
  await browser.close();     // the non-negotiable line
}
```

Four details that matter:

**`settle`.** A graph laid out by a physics simulation is still moving when the network
goes quiet. Every figure of a graph in this book waited between six and nine seconds after
load. Without it you photograph a tangle.

**`script`.** An optional snippet evaluated in the page, used to open a panel or select a
node before the shot. Figure 10 selects the concept "connectivity" by calling the graph
component's own API; figure 11 calls its fit method after resizing.

**`pageerror`.** Console errors are collected and printed beside the result. A screenshot
that looks fine from a page that threw is a figure you should not publish.

**`deviceScaleFactor`.** Set to 2 or 3, so figures are legible when printed.

### Verifying a figure is not blank

A screenshot of a page whose script failed is a white rectangle, and white rectangles are
easy to miss in a batch of twenty. A cheap check:

```python
from PIL import Image
import glob
for f in sorted(glob.glob('figures/*.png')):
    im = Image.open(f).convert('L').resize((100, 100))
    ink = sum(1 for p in im.get_flattened_data() if p < 230)
    print(f"{f}  ink={ink}%")
```

Anything under about 3 per cent is worth opening.

---

## 2 · The numbers

Every number in this book came from one of these.

### Release cadence

```bash
# every tag with the author date of its tagged commit
for t in $(git tag --sort=v:refname); do
  echo "$t $(git log -1 --format=%aI $t)"
done > tagdates.txt

# releases per calendar day
awk '{split($2,a,"T"); print a[1]}' tagdates.txt | sort | uniq -c
```

```python
# median gap, gaps under thirty minutes, the daily working window
import datetime, statistics, collections
rows = [l.split() for l in open('tagdates.txt')]
ts = [(t, datetime.datetime.fromisoformat(d)) for t, d in rows]
gaps = [((ts[i][1] - ts[i-1][1]).total_seconds() / 60, ts[i-1][0], ts[i][0])
        for i in range(1, len(ts))]
print('median gap:', round(statistics.median(g for g, _, _ in gaps), 1), 'min')
print('median within a session (<10h):',
      round(statistics.median(g for g, _, _ in gaps if g < 600), 1), 'min')
print('gaps under 30 min:', sum(1 for g, _, _ in gaps if g < 30), 'of', len(gaps))

by = collections.defaultdict(list)
for t, d in ts: by[d.date()].append((d, t))
for day in sorted(by):
    v = sorted(by[day])
    span = (v[-1][0] - v[0][0]).total_seconds() / 3600
    print(f"{day}  {len(v):2d} releases  {v[0][0]:%H:%M}–{v[-1][0]:%H:%M} UTC  ({span:.1f}h)")
```

### Commits and merges

```bash
git rev-list --count v0.5.11                       # 97
git log v0.5.11 --format=%s | grep -c '^site v'    # 89
git log v0.5.11 --merges --format='%h %ad %s' --date=short   # the 3 merges
```

### Tests and gates over time

```bash
# unit tests at any tag
for t in v0.4.13 v0.4.20 v0.4.31 v0.4.40 v0.5.4 v0.5.9 v0.5.11; do
  printf "%-9s %s\n" "$t" "$(git show $t:admin/tests/universe.test.mjs | grep -c '^test(')"
done

# validator checks at any tag (one header comment per check)
for t in v0.1.0 v0.3.0 v0.4.0 v0.4.13 v0.5.11; do
  n=$(git show $t:admin/build/validate.js | grep -c '^// --- ')
  printf "%-9s %s checks\n" "$t" "$((n-1))"
done
```

The `-1` is because the file's report section carries the same comment shape as a check.
It is the kind of adjustment worth writing down beside the number rather than silently
applying.

### Refactor sizes

```bash
git diff --shortstat v0.5.6 v0.5.7            # the operator split
git show v0.5.6:assets/wclm/engine.js | wc -l # 374
git show v0.5.7:assets/wclm/engine.js | wc -l # 161
git diff --shortstat v0.4.12 v0.4.13          # the reader refactor
```

### Component growth against its budget

```bash
for t in v0.4.13 v0.4.16 v0.4.25 v0.4.31 v0.4.40 v0.5.11; do
  printf "%-9s %s lines\n" "$t" \
    "$(git show $t:assets/universe/components/uni-graph.js | wc -l)"
done
```

### Corpus size

```bash
ls v2/briefs/*.md | wc -l          # 19
cat v2/briefs/*.md   | wc -w       # 37,808
ls v1/content/*.md | grep -v STYLE | xargs cat | wc -w   # 20,838
find . -name '*.html' -not -path './.git/*' | wc -l      # 176
```

### Reading the release table as data

The release notes live in HTML tables across three pages. Parsing them into
`version | date | note` triples makes them greppable, and the chronology in Appendix B is
generated from the result:

```python
import re, sys
from html.parser import HTMLParser

class T(HTMLParser):
    def __init__(s):
        super().__init__(); s.rows=[]; s.cur=None; s.cell=None
    def handle_starttag(s, t, a):
        if t == 'tr': s.cur = []
        elif t in ('td', 'th') and s.cur is not None: s.cell = []
        elif t == 'br' and s.cell is not None: s.cell.append(' ')
    def handle_endtag(s, t):
        if t == 'tr' and s.cur is not None:
            if s.cur: s.rows.append(s.cur)
            s.cur = None
        elif t in ('td', 'th') and s.cell is not None:
            s.cur.append(re.sub(r'\s+', ' ', ''.join(s.cell)).strip()); s.cell = None
    def handle_data(s, d):
        if s.cell is not None: s.cell.append(d)

p = T(); p.feed(open(sys.argv[1], encoding='utf-8').read())
for r in p.rows:
    if len(r) >= 3 and re.match(r'v?\d+\.\d+\.\d+', r[0]):
        print(f"{r[0]} | {r[1]} | {r[2]}")
```

---

## 3 · One caution about your own history

A repository cloned with `--depth` (a shallow clone, which many automated environments
create by default) has no history and often no tags. Both time travel and every number in
this appendix need the full history:

```bash
git fetch --unshallow origin    # if the clone is shallow
git fetch --tags origin         # tags are not always fetched with branches
git tag | wc -l                 # sanity check: 88 for this repository at v0.5.11
```

This book's own writing session started against a shallow clone with zero tags, and the
first thing it had to do was notice.

---

## 4 · The figures in this book

Twenty figures, each captioned in the text with the page it shows and the tag it was
re-taken from. In order:

| # | Tag | Page |
|---|---|---|
| 1 | v0.5.11 | `/index.html` |
| 2 | v0.2.0 | `/book/index.html` |
| 3 | v0.3.15 | `/altitudes/index.html` |
| 4 | v0.5.11 | `/v2/memos/index.html` |
| 5 | v0.5.11 | `/admin/versions.html` |
| 6 | v0.4.5 | `/v2/universe/thinking-in-graphs.html` |
| 7 | v0.4.8 | `/v2/universe/thinking-in-graphs.html` |
| 8 | v0.4.11 | `/v2/universe/thinking-in-graphs.html`, graph options open |
| 9 | v0.4.16 | `/v2/universe/thinking-in-graphs.html`, graph options open |
| 10 | v0.4.34 | `/v2/universe/thinking-in-graphs.html#graph`, node selected |
| 11 | v0.4.39 | `/v2/universe/thinking-in-graphs.graph.html`, 852×393 at scale 3 |
| 12 | v0.5.11 | `/v2/universe/thinking-in-graphs.html#graph` |
| 13 | v0.5.2 | `/v2/wclm/index.html` |
| 14 | v0.5.4 | `/v2/wclm/index.html` |
| 15 | v0.4.31 | `/v2/universe/thinking-in-graphs.html#graph` |
| 16 | v0.5.1 | `/v2/universe/thinking-in-graphs.files.html#docs/thinking-in-graphs/ids.json` |
| 17 | v0.5.7 | `/v2/wclm/operators/index.html` |
| 18 | v0.5.7 | `/v2/wclm/operators/tokenise/index.html` |
| 19 | v0.5.9 | `/v2/wclm/operators/index.html#tokenise/tokenise.js` |
| 20 | v0.5.9 | `/v2/wclm/index.html` |

Every one of them can be re-taken, by anybody, with the two scripts at the top of this
appendix. That is the property the whole book rests on: not that you should trust the
figures, but that you do not have to.
