# The capability register — what writing a book here actually gets you

**Status** MEASURED. Every number was computed on 28 August 2026 at site v0.6.7.
**Asked by** brief 42: *"the first part of the making the book should almost be a
feature[s section], and go to town on it — literally describe, screenshot features, and
basically say: here is what writing a book in 2026 looks like."*
**Why this exists first** a feature tour written from memory would break the rule the whole
estate runs on. Before the chapter, the count.

---

## The comparison the memo asks for

Brief 42 sets it against *"a Word document, highly inefficient, takes lots of time, making
changes are very hard… a lot of ideas get locked sooner rather than later."* The honest
form of that comparison is not "ours is faster". It is **what becomes possible that was not
possible before**, which is a different claim and a checkable one.

| | The ordinary process | Here |
|---|---|---|
| Source of truth | the document file | markdown, and every surface is a projection of it |
| Changing a claim in three places | find and replace, hope | the claim is computed once and appears three times |
| Knowing the book is still consistent | read it again | **72 build gates and 101 tests** |
| A number in the text | typed, then ages | computed at build, or the build fails |
| Going back three drafts | a folder of copies | any of **101 tagged releases**, reconstructable |
| Publishing | export, upload, hope | one register projects into cover, sheet, sample, page |
| A second author | merge conflicts | a second agent on its own branch, gated |

## What exists, counted

### The book as a build artefact

| Capability | Measured |
|---|---|
| Books built from markdown | **3** — 47 chapter files |
| Print PDFs generated | **3** — 119, 92 and 91 pages |
| Figures carried into print | **45**, JPEG-converted so a book downloads before a flight |
| Covers | **4** files across 2 books, drawn as SVG and photographed to PNG |
| Shared build kit | `admin/build/bookkit/` — markdown, figures, weasyprint, page counting |
| Rebuild fidelity | both PDFs rebuilt page-for-page identical when the builder was refactored at v0.5.20 |

### The document decomposed, and put back

The capability brief 42 names first: *"breaking the book into a JSON file, where now we
have a two-way conversion from Markdown to JSON back to Markdown."*

`gen_coregraph.py` reports on every run, for the pilot document:

> 39 sections, 186 blocks, 342 sentences, 4,221 words (951 forms), 143 spans, 32 shards,
> 552,260 bytes; **rebuild byte-identical**

Every section, block, sentence and word is a node with a stable identity, and the markdown
is reconstructed from the graph **byte for byte** or the build fails. That is the machinery
behind refactoring a book structurally rather than textually.

### The gates that keep a book consistent

Brief 42's sharpest point is that consistency, not speed, is what fails without machinery:
*"I didn't have the ability to keep it consistent."* What holds it here:

| Gate | What it refuses |
|---|---|
| Chapter hashes | content changing without the book's version moving, **and the reverse** |
| Title agreement | a book called one thing in the register and another in its own front matter |
| Version streams | an artefact whose number does not say which clock it belongs to |
| The changelog | a book version not paired with the site release that carried it |
| Frozen edition | a single byte changing in the first edition |
| Page/markdown match | a rendered page drifting from the file it claims to render |
| Link integrity | a broken link anywhere across 250 pages |
| The unit suites | **101 tests in six suites**, run by the release gate itself |
| The gate's own gate | `validate.js` checked against a deliberately broken copy of the tree |

**72 distinct failure conditions** in the release validator.

### The history, as a working surface

| | |
|---|---|
| Narrated releases | **101**, each a paragraph a reader can understand without the diff |
| Founder memos, verbatim | **23** in this edition, one unbroken sequence since the first |
| Any release reconstructable | yes — `gen_changes.py` rebuilds the text of every version from the repository's own tags |
| Retrospectives | 2, one per closed era |
| Named techniques | **35** in the methods register, each naming the release it first shipped in |

### The team

Seven roles as folders, each with a central claim and a stated boundary, spun up in
parallel and kept isolated. Not for throughput — for judgement.

## What is NOT true, and must not be claimed

The estate's own rule about caveats applies to its own feature list.

- **This is not a product.** There is no installer, no service, no other user. Everything
  described here runs in one repository, driven by one person and agents.
- **It has never been used by anyone else.** Every claim is about this estate's own books.
- **It requires programming judgement**, and the founder says so himself in brief 42:
  *"I don't think it's realistic to say that somebody without programming experience could
  provide the prompts and the requests that I have."* A feature tour that implies otherwise
  would be selling something that does not exist.
- **The method is unfinished.** Also the founder, brief 41: *"I don't think we're fully
  there yet. I don't think we've connected all the dots."*

## What part one still needs, which does not exist yet

1. **Screenshots.** Brief 42 says *"literally describe, screenshot features"*. The harness
   exists and 45 figures were taken with it, but none of them show the *workflow* — they
   show the graph reader and the WCLM. **A feature tour needs its own photography.**
2. **The Leanpub failure story.** The founder's own control group: *"most of them I never
   finished… I had tonnes of notes made, but I didn't have the ability to keep it
   consistent."* This is the most persuasive evidence the book has and it **cannot be
   written from this repository**. It needs the founder.
3. **Agent-facing pages per capability** (brief 42, item 8). `llms.txt` and
   `llms-full.txt` exist; a machine surface per capability does not.

## The recommendation

Part one is **four chapters, not one**: what becomes possible; the machinery that makes it
possible; what it costs and what it demands of you; and what it is not. Written in that
order, a reader who stops after chapter one still knows whether this is for them, which is
the estate's own rule about books applied to its newest part.

And it should be written **after** the screenshots and **after** the founder supplies the
failure story, because both are load-bearing and neither can be invented.
