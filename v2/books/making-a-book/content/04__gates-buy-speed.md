# 4 · Gates buy speed

*After this chapter you will understand why adding automated checks makes an agentic
project faster rather than slower, you will know which seven checks to start with, and
you will know what a release note has to contain to still be useful six days later.*

---

## The counterintuitive claim

Eighty-eight releases in six days sounds like a project with no safety rails. It is the
opposite. The v0.4 retrospective states the relationship directly:

> **Gates buy speed, not caution.** Forty-one releases in four days was possible BECAUSE
> every release ran the same validator: 61 unit tests, anchor verification, page/markdown
> parity, link resolution, and by the end the round-trip and ledger gates. Nothing shipped
> on hope.

The mechanism is worth spelling out, because it is not obvious.

At thirty minutes per release, nobody can manually check a site of 176 pages. Nobody can
remember whether the last change broke a link on a page they have not opened in four days.
Nobody can eyeball whether a rendered page still matches the markdown it claims to render.
So the choice is not between checking carefully and checking quickly. It is between
checking automatically and not checking at all.

And an unchecked release is not fast. It is fast until it is not, and then it costs a day.

## The seven checks that came first

The repository's first release, before there was any content, shipped a pre-release
validator with seven checks. Reading the file today, its header still lists them in the
order they were added. These seven are a good starting set for anybody:

1. **Version agreement.** One file owns the version number. Every page's version badge,
   the release table, the agent-facing text files and the index all have to agree with it.
   A release that bumps the number in one place and not the others fails.
2. **Internal links.** Every relative link and image source in every HTML file has to
   resolve to a file that exists.
3. **Canonical host.** Every page declares exactly one canonical URL, and it points at
   the host in the repository's own `CNAME` file.
4. **The agent surface.** Every section of the site is named in `llms.txt`, and the
   sitemap and the file tree agree in both directions. The comment in the validator
   explains why this one is not cosmetic: "This site exists because agents under-weight
   this material; llms.txt is the whole surface for them, so a page that is not in it is,
   for that reader, a page that does not exist."
5. **Edge grammar.** The book bans a particular sloppy relationship name, `relates-to`.
   No page may use it as a live edge name. It is allowed only where a page is quoting the
   ban, marked with an attribute. The site's own rule, enforced against the site.
6. **Key leak.** Nothing in the tree may look like a vault key.
7. **Div balance.** Every page opens and closes the same number of `<div>` elements.

That last one has a story attached, and the validator records it in a comment:

> Added after four pages shipped a `<div class="note">` closed with `</p>`, which browsers
> accept silently and which ran the note's left border down the whole page.

That is the general pattern for how gates get added here. Something goes wrong. The fix
ships. And in the same release, a check ships that would have caught it. By v0.4.13 the
validator was at sixteen checks and 530 lines, and it has stayed there through the whole
v0.5 era, because the newer guarantees moved into the unit suite instead.

## The unit suite

The second gate is a plain Node test file, `admin/tests/universe.test.mjs`, run by the
validator on every release. Its growth is the clearest single measure of the project
hardening:

| Release | Date | Tests |
|---|---|---|
| v0.4.13 | 24 Aug | 13 |
| v0.4.16 | 24 Aug | 27 |
| v0.4.20 | 24 Aug | 37 |
| v0.4.25 | 24 Aug | 43 |
| v0.4.31 | 25 Aug | 52 |
| v0.4.34 | 25 Aug | 57 |
| v0.4.40 | 26 Aug | 61 |
| v0.5.2 | 26 Aug | 68 |
| v0.5.4 | 26 Aug | 71 |
| v0.5.7 | 26 Aug | 82 |
| v0.5.9 | 26 Aug | 84 |

Thirteen to eighty-four in a little over two days. Every one of those tests is a
known-answer vector over a pure function: given this input, the function must produce
exactly this output. There is no mocking and no test framework beyond what Node ships
with.

The suite appeared at v0.4.13, and the release that created it is worth reading because
it is the only release in the whole period whose visible output is nothing:

> The reader refactored: zero visible change, and the tool is now portable across all
> twenty-one documents. A pure quality release, per the founder's SGraph JS and Testing
> guidelines: the 703-line reader script became a three-tier structure under
> assets/universe/ with one-way dependencies.

One script of 703 lines became a core tier that is pure and testable with no browser, a
components tier of three custom elements, and a shell that wires them together. The diff
is 55 files changed, 1,219 lines added, 781 removed. Nothing on screen changed, and the
release note says so in its first eight words.

The reason this matters for the argument of the chapter: the thirteen tests could not
have been written before the refactor, because the logic they test was tangled with the
browser. The refactor was not tidiness, it was the precondition for the gate, and the
gate is what made the following seventy-five releases safe to ship in a hurry.

## The gates that check the content, not the code

Three of this project's gates check things most projects never check, and they are the
ones most worth stealing for a book.

**Every quotation is verified against the source bytes.** The extraction of the pilot
document contains fifty-seven nodes, and every one carries a quote from the document it
is about. On every build, each of those quotes is searched for, verbatim, in the frozen
source file. If a quote is not found, the build dies. The page that shows the extraction
says so on its face: "the build refuses to ship if any quoted anchor is not found
verbatim in the frozen source, so nothing below can cite words that are not there."

For a book, this is the gate. It means no claim attributed to a source can drift, because
the drift is a build failure rather than an embarrassment.

**Every rendered page is checked against the markdown it claims to render.** The chapters
are markdown; the pages are generated from them; a manifest records the hash of each
markdown file and of the page it produced. Edit the markdown without regenerating, or
hand-edit a page behind the markdown's back, and the release fails. The book PDF is
checked the same way against the pages it was printed from.

The site's own name for this is a projection chain, and the validator's header states the
guarantee: "markdown -> pages -> book, no drift at either link."

**Rebuilding must produce identical bytes.** By v0.4.38 the core graph could rebuild the
source document from its own structure, and a gate compares the rebuild to the original
byte for byte. By v0.4.40 the identity ledger had a gate of the same shape: run the
carry-forward algorithm twice, and the second run must change nothing.

That last pattern, run it twice and demand no change, is cheap to implement and catches a
whole class of bug that is otherwise invisible until much later.

## The release note as a gate

The third mechanism is not automated at all. Every release ships with a paragraph in a
public table saying what changed, why, what was verified and how.

They are long. The twelve v0.5 notes average 365 words each; across all eighty-eight
releases the longest is v0.4.2's, at 570 words. They are also the most useful thing in the repository, and there are three
reasons to write them this way.

**They record the verification.** Almost every note in this period ends with a sentence
of the same shape: "84 gate-27 tests including the anatomy anchoring gates; verified in
headless Chromium (flow-to-code-to-pane selection, hops, schema flow, chip-wired
workbench with wires painted, first-operator prompt chip)." That is a claim about what
was checked, published, with enough specificity to be embarrassing if untrue.

**They record the debt.** The component that draws the graph, `uni-graph.js`, is 202
lines when the refactor creates it at v0.4.13 and 434 lines by v0.4.40, against a stated
budget of 250. It grew past its budget in public, and each release that grew it said so.
The retrospective names this as a principle:

> **Honest debt beats hidden debt.** `uni-graph.js` sits at ~450 lines against a 250
> budget, recorded in release notes each time it grew, with the v0.4.13 split as the named
> remedy. The debt is real; so is the record of it.

**They record what did not change.** Almost every note in this period ends with the same
four words: "No book content changed." That line exists because the whole project is a
book, and a reader deserves to know whether a release touched the argument or only the
machinery. All twelve v0.5 notes carry it, and thirty-nine of the forty-one in v0.4:
sixty-six of the eighty-eight releases in total.

![The release history at v0.5.11. Every row is a paragraph, not a commit message.](figures/18__v0.5.11__the-release-history.png)

*Figure 5. The release table at tag `v0.5.11`. The v0.4 era's forty-one rows moved to
their own page at v0.5.0, and the thirty-five earliest to a third, with the generators
that read release history taught to read all three so nothing computed from it was lost.*

## Automating the release itself

The last piece is that no human runs the release. A push to the `dev` branch triggers a
three-job pipeline: validate, tag, deploy. Validation also runs on pull requests, so
branch work is gated before it can reach `dev`. If validation fails, nothing tags and
nothing deploys. If it passes, a machine reads the version from the version file, checks
it agrees with the commit subject line, checks the bump is the next one in sequence, and
tags the commit.

The consequence, computed from the git history, is the ratio quoted in Chapter 1:
eighty-nine of ninety-seven commits are releases. There is no "I will tag this later" and
no drift between what is tagged and what is deployed. It is also why every figure in this
book could be re-taken: the tags exist because a machine made them, on every single
release, without being asked.

## The arithmetic

Here is the trade in plain numbers, using this project's own history.

The gates cost, roughly: one release out of eighty-eight spent entirely on making the
code testable (v0.4.13), plus a few minutes per release writing tests, plus the
validator's runtime.

They buy: eighty-seven releases that could be shipped without a manual regression pass,
by a person who was mostly reviewing on an iPad. And one specific thing that is hard to
value and easy to feel: the ability to accept a change you do not fully understand,
because if it broke something the build will say so.

That last one is the real product of a test suite in an agentic project. You are going to
be handed code you did not write, at a rate you cannot review line by line. The gate is
what makes that safe enough to be worth doing.

---

**Where the live estate shows this.** The validator is `admin/build/validate.js`, the
unit suite is `admin/tests/universe.test.mjs`, and the pipeline is
`.github/workflows/deploy-pages.yml`, all readable in the repository. The rules for how a
version is decided are published at the bottom of `/admin/versions.html`.
