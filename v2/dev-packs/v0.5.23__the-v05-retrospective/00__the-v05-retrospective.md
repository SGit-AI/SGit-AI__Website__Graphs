# The v0.5 retrospective: three books came out of the surface

**version** written at v0.5.23, closing the v0.5 era (v0.5.0, 26 August 2026 &rarr; v0.5.22, 28 August 2026)
**status** RETROSPECTIVE. Facts drawn from the release history, the briefs, `book.json`,
the test suites and the file tree; judgements are the agent's, marked as such.
**the full record** every release, with a paragraph on each: [the v0.5 era](../../../admin/versions.html)

---

## What v0.5 was for

v0.4 answered "what should the second book BE" by building a working surface: the universe
reader, the extraction discipline, the core graph, the instrument. It ended with a surface
and no book.

v0.5 answered the obvious next question, and answered it twice. First: **what does that
surface actually compute?** That produced the WCLM, a deterministic transformer that takes a
prompt and a document and answers with meaning, provenance and contradictions, showing every
weight as a stated formula. Second, and unplanned at the era's start: **can books come out of
this?** They can. Three did.

The era is three days long. That is not a boast about speed; it is the point about the loop.
Twenty-three releases, nine founder memos, three books.

## What exists now that did not on 26 August

| | |
|---|---|
| Books | **3**, 47 chapters, 99,946 words, 302 PDF pages |
| The WCLM | 12 operators in first-class folders, 951 token hashes, 57 concepts, strict layer adjacency |
| Briefs processed | 31 through 39, each reproduced verbatim with the agent's numbered reading |
| Tests | 95, in six suites, up from 84 in one file |
| Generators | 24, 8,172 lines |
| Client modules | 64, 9,809 lines, every one carrying a `@module` header |
| Named techniques | 35 in the methods register |

## The achievements, in the order they compounded

1. **The file explorer, then the WCLM** (v0.5.1–v0.5.3, briefs 31–32). A document's artefacts
   became browsable raw and rendered; then the transformer arrived, and the rule that every
   box explains itself. The WCLM was never a language model. It was the demonstration that
   meaning can be computed from a graph with its arithmetic in the open, which is the second
   edition's central claim made executable.

2. **Strict layers and typed engines** (v0.5.4–v0.5.6, briefs 33–35). The pipeline became
   layers of engines rather than a chain of steps: several engines side by side in one slot,
   each declaring its input and output schema, no wire permitted to jump a layer. 551 wires,
   zero violations, proved by gate rather than asserted. And the fractal claim got its test:
   an engine that is itself a full WCLM.

3. **Operators as folders, and code that draws itself** (v0.5.7–v0.5.9, briefs 36–37). Each
   operator became a folder with its own schema, data, examples, JavaScript and CSS &mdash; and
   then its own *anatomy*: authored segments anchored by the exact text of each first line,
   resolved to line ranges that must tile the file completely, with a gate that fails on
   drift. Restructuring twelve operators changed behaviour in not one recorded vector.

4. **The books** (v0.5.10–v0.5.16, brief 38). One pack, three entry points, three agents. The
   founder's instinct that book B need not wait for book A was right: *Fractal Semantic
   Graphs* and *Creating a Book* were written in parallel by separate agents against a shared
   corpus and shared conventions, and neither blocked the other.

5. **Per-book versioning** (v0.5.18, brief 39). A book's version moves when its content moves;
   the site's moves on every push; v1.0.0 is reserved for a final release. Enforced in both
   directions by a gate that fails a content change without a version move *and* a version
   move without a content change.

6. **The non-functional passes** (v0.5.17, v0.5.20–v0.5.22). What the review era will lean on:
   the contributor contract, one shared book kit, six test suites and a runner, a self-test
   for the release gate, and the size guideline turned from a convention into a check.

## What was got wrong, and how it was found

This is the more useful half. Four of the six were caught by gates built in the same era,
which is the argument for building gates at all.

1. **The test harness was lying.** `test()` caught synchronous throws but never awaited an
   async test, so a failing async test printed `ok` and counted as a pass. Three tests were
   async. It had been wrong for as long as async tests had existed here. Fixing it immediately
   exposed a **real dangling edge** in `normalise/anatomy.json` that the lie had been hiding.
   *Found by looking, at v0.5.20; it was never going to surface on its own, because the thing
   that would have reported it was the thing that was broken.*

2. **`book.json` had two writers who disagreed about its keys.** Introduced at v0.5.18 and
   not noticed, because the two writers never ran in the same session. `version` meant the
   book's version to one and the site's to the other; `pdf` was a filename to the shelf and a
   dict to the builder; `chapters` a count to one and a list to the other. Whichever ran last
   won. *Found while converting the builders at v0.5.20, not by looking for it.*

3. **The front page denied the books existed.** It said the second edition's text "does not
   exist yet" for ten releases after the text existed, on the site's most-read page, while the
   books were being prepared for sale. *Found at v0.5.22, by reading the page instead of the
   generator.* The lesson is uncomfortable and worth keeping: **every gate here checks that
   pages match their sources; none checks that a source still tells the truth.**

4. **The frozen first edition was regenerated.** `gen_book.py` is not in the release chain, and
   running it rewrites `v1/`. *Caught within minutes by the validate self-test written hours
   earlier* &mdash; the gate's first honest run was on its author.

5. **Pass three was planned without checking who loads the code.** Three of the five modules
   marked for splitting are loaded only by frozen pages, which cannot gain a script tag.
   *Found at v0.5.21, by measuring instead of assuming.* 1,508 lines now stay long on purpose,
   with the reason in each header.

6. **The covers took three layout passes.** Labels on their own lines, then a verb colliding
   with a node, then a straight descent that finally read at thumbnail size. *Found by looking
   at the rendered image each time*, which is the only way this class of error is ever found.

## The judgement (the agent's, not the founder's)

The era's real output is not the three books. It is that **a book became a build artefact**:
markdown in, gated PDF and web pages out, with a version that moves only when the content
moves and a hash per chapter proving it. The books are the first three things to come off that
line, and the line is what makes the review era possible.

The weakest part of the estate is now visible and stated: **prose has no freshness gate.** A
generated page cannot drift from its source, and the build proves it on every push. But a
sentence that was true in August and false in September passes every check this repository
has. The front page was wrong for ten releases in the middle of a publishing push, and only a
person reading it found out. If v0.6.0 wants one non-review thing, it is that.

## What v0.5 did not do

- **The Leanpub upload.** The books, covers, samples, metadata sheets, landing pages and the
  post are all built; creating the listings and pressing publish is the founder's hands.
- **Pass three's remaining splits.** `decisions.js`, `wclm-page.js` and `uni-graph.js` are
  still long; the plan for each is recorded in its header.
- **The review machinery.** That is v0.6.0's whole content, and it waits on the memo brief 39
  promised: *"a separate memo will describe the agent mix."*
