# What The Graphs Found: Fourteen Releases, Twelve Discoveries, And The One Mechanism Behind All Of Them

**version** v0.3.26 · **date** 23 August 2026 · **from** the agent · **to** the founder, and
whoever runs the refactor · **type** Retrospective brief

---

## What This Is

A record of what the last fourteen releases actually produced, written before the refactoring
work starts, because the refactor will move most of this code and some of what matters here is
not in the code.

Between [v0.3.12](../../admin/versions.html) and v0.3.25 this site grew a decisions register, an
altitude ladder, a concept layer, a graph explorer, a path query, a findings register with
states, five build-time checks, an evidence estate of five vault analyses, a cross-vault
synthesis, and a section carrying twenty-one source documents with their hashes. That is the
visible part. The part worth preserving is what those things **found**, and the single
mechanism that made them capable of finding anything at all.

The claim of this brief in one sentence: **the visualisations did not produce the insights.
The arithmetic behind them did, and the visualisation is how a person notices.**

---

## The Fourteen Releases

| | |
|---|---|
| v0.3.12 | the reviewer calibrates the librarian |
| v0.3.13 | review r003, and the decisions register |
| v0.3.14 | the librarian corrects the librarian |
| v0.3.15 | the altitude ladder, one book at five altitudes |
| v0.3.16 | a fifth estate, read and threaded |
| v0.3.17 | the ladder becomes columns, and every level gets an ontology |
| v0.3.18 | the flicker fixed, and the ladder drawn as one graph |
| v0.3.19 | the title is decided, and the vault analyses begin |
| v0.3.20 | the concept layer, and a graph you can explore from anywhere |
| v0.3.21 | the path query, and contradictions as measurements |
| v0.3.22 | three risk vaults, the first cross-vault finding, decisions as a graph |
| v0.3.23 | the date on the agent surface was three releases stale |
| v0.3.24 | the sources this book was built from, carried whole |
| v0.3.25 | six more sources, and the growth broke the section's neatest claim |

Two of those fourteen are pure corrections, and both were found by the work rather than
reported by a reader. That ratio is the point of the whole exercise.

---

## The Mechanism

Every discovery below came from the same move, applied to a different claim:

> Take a sentence somebody wrote. Convert it into something a build can compute. Run it on
> every build. Then look at the result.

Not one of these findings required a new idea. Each required turning an assertion into an
arithmetic and then being willing to read the output. The graph is the medium in which the
arithmetic becomes visible to a human in under a second; it is not where the finding comes
from. This distinction matters enormously for the refactor, because it says which parts are
load-bearing: **the generators are load-bearing, the renderers are replaceable.**

The corollary is the uncomfortable half. An assertion that has not been converted into an
arithmetic is not being checked, however confidently it is written and however often it is
repeated. Everything in this document that broke, broke in that category.

---

## What The Graphs Actually Found

Twelve findings, each with the mechanism that produced it. Where a number appears, it is
recomputed on every build and can be checked against the published data.

### 1. The same correction, reached twice by different routes

Review r001 item 5 said the book's *no databases* line was wrong. Independently, the altitude
ladder reached the same correction by compression: pressing the book to level 2 forced the
claim into a form where it contradicted another claim in the same paragraph. A human reading
and a mechanical compression converged on one sentence. **A finding reached twice by
independent routes is worth more than the same finding reached once, and until the ladder
existed there was only one route.**

### 2. The position the book argues against is one of its strongest concepts

The concept map computes peaks by a stated formula rather than choosing them. *Schema-first
thinking*, the position this book exists to oppose, came out among the five peaks, because
five separate concepts define themselves partly by opposing it. It was kept rather than tuned
away, with the caution it carries: **a strongly connected node is not a well-supported one**,
and any future ranking that conflates connectivity with evidence will overstate whatever the
book repeats most often.

### 3. The grammar caught its own author

Fifty-three concept relations were declared by hand. Normalised to canonical triples in the
primary verb direction they came to **thirty-six**: seventeen were the same relation declared
from both ends, which surfaced as an edge appearing in both a concept's outward and inward
lists. The rule that caught it is the book's own (every verb has a distinct inverse), applied
to the book's own data.

### 4. A contradiction cannot be an edge

Reifying findings as nodes was not a design preference. A *contradicts* edge would be its own
inverse, which the grammar bans, so a contradiction has to become a node with two edges out of
it. **The grammar refused a shape and the data model changed.** That is the strongest evidence
in the corpus that the edge rules do real work rather than decorate.

### 5. Four decisions were two decisions wearing four names

The decisions register held twelve named pieces of blocked work. Giving each phrase a shared
key showed that **four of the twelve have more than one decision waiting on them**, and every
one of the four is named differently by each decision: the same task is *level 4 completion* in
one place and *level 4 rollout under D1* in another, because the two decisions were raised in
different reviews and each used its own review's vocabulary. A list cannot show this. The build
now fails on a block phrase it has never seen, which turns "is this new work?" into a question
the build asks rather than one nobody asks.

### 6. A scale that exists in no single document

Five vault analyses were written separately. Read side by side, their permission blocks form a
scale with a floor (`permissions: {}`, nothing requested), a hard middle (read one folder,
write one folder) and a ceiling (a model call whose key is sealed into the vault). **No single
case study contains it.** This is the first hard evidence that the case-study programme
produces findings the book could not have argued its way to.

### 7. A stale number nothing was watching

`llms.txt` opens with the site version and its date, and it is the first line any agent reads.
The version had been stamped by the build since v0.2.4, precisely because hand-editing it had
silently failed twice on a sibling site. The **date** beside it was never stamped, so it sat
three releases behind while the version moved. It is now read from the release's own row and
gated.

### 8. A stated property that had never been true

Decision r004-D5 asked what to do about Cytoscape, "this site's first third-party dependency".
Building the markdown readers surfaced that it never was: every `/documents/` page had loaded
**marked** from a content delivery network since that section shipped, and `mdreader.js` still
imports Mermaid from one. A network dependency is worse for the property at stake than a
vendored file, so the honest count was three, and two of them were the wrong kind. Marked is
now vendored; the Mermaid import is stated rather than silent. **The question was left standing
with the correction printed beside it**, which is the corpus's own supersede-rather-than-delete
rule applied to the site's own record.

### 9. A universal that was a property of the sample

At fifteen carried documents, *a claim is worth its chain of custody* was measured in **every
one**, and the release notes said so. At twenty-one it is measured in twenty. The exception is
*Compatibility Through Connectivity*, one of the three February documents, written before the
provenance vocabulary hardened. A property that survives to fifteen and fails at twenty-one was
never a property of the corpus. It is recorded rather than quietly dropped, and the earlier
statement stays as written.

### 10. Breadth of mention is not weight

The failure above produced a better measure. **Concentration** is the share of a concept's total
mentions sitting in its top three documents. Only two concepts come in under 0.55 (chain of
custody at 0.50 across twenty documents, one grammar at every altitude at 0.53 across thirteen).
Everything else sits above 0.7, meaning one or two documents carry it and the rest allude to it.
A count of documents-mentioning would have called a dozen concepts central. Two are.

### 11. An import chain that can be checked

Three of the twenty-one carried documents originate in a different public repository and were
imported on 11 June 2026. **All three are byte-identical across both repositories**, and those
same three are the only documents with no per-file CC BY line, because the licence audit
stamped one tree and not the references imported into it. Both facts were checked rather than
assumed, and the second explains the first pattern completely.

### 12. A generator whose completeness depended on ambient state

Found while writing this brief, which is the reason it is finding twelve rather than a footnote.
`gen_changes.py` builds the version-diff data by reading **whatever release tags the local clone
happens to hold**. This container held fifteen. Thirty-three releases had been published. So
`/book/changes.html` had been shipping a version diff missing **eighteen releases**, and saying
nothing, because a generator that reads ambient state cannot tell the difference between "there
are fifteen releases" and "I can see fifteen releases".

`admin/versions.html` is the authority on what has shipped, and it had all thirty-three rows the
whole time. The generator now compares the two and refuses to run when they disagree. The gate
was verified by deleting a tag and watching the build fail, then restoring it.

This is the same failure class as findings 7 and 8: a number nobody was checking. It is the
third instance in fourteen releases, and it is the reason the section below is the most
important part of this brief.

---

## Which Views Produced Findings, And Which Did Not

Worth stating plainly, because it is a design lesson and it is not the intuitive answer.

**The aggregate views produced every finding.** The whole-register decisions graph found the
shared blocks. The all-documents graph found the concept joins. The concept map's peak
computation found the schema-first result. The cross-vault table found the capability scale.

**The per-item ego graphs found nothing.** They are good navigation, they make a single
decision or document comprehensible in one screen, and they are what makes the section usable.
But no discovery came from one. The distinction to carry into the refactor: an ego graph is a
reading aid, an aggregate view is an instrument. They deserve different amounts of engineering
and different amounts of trust.

There is a second lesson underneath it. The aggregate views only produced findings **after**
something had been normalised: the block phrases needed keys before the shared work appeared,
the concept edges needed canonical direction before the duplicates appeared, the documents
needed a measured concept vector before the joins appeared. Drawing a graph over un-normalised
data produces a picture. Drawing one over normalised data produces a finding. **The
normalisation is the instrument; the layout is the lens.**

---

## The Three Kinds Of Link

The most reusable thing built in this run is not a feature. It is a discipline that the
`/docs/` section applies and the rest of the site should:

| Kind | What it means | How it is drawn |
|---|---|---|
| **Carried** | A byte-for-byte copy with a hash. The build fails if it drifts. | Not drawn. It is the evidence. |
| **Measured** | Counted mechanically from a published phrase list. | Dashed, labelled with its count |
| **Authored** | A judgement, written down as one, with a note saying what it is for. | Solid |

Nothing pretends the third kind is the second. A reader who wants to disagree with a measured
link argues with the phrase list, which is published. A reader who wants to disagree with an
authored link argues with the person. Those are different conversations and the graph should
not blur them.

---

## The Gates That Now Exist

Each of these fails the build rather than warning, which is the only version that works:

1. Every `/<section>/index.html` hub must be named in `llms.txt`.
2. The sitemap must agree with the file tree.
3. `versions.html` must carry a row for the current version.
4. Every internal link must resolve.
5. Pages must match their markdown, in both directions.
6. The book must not lag the pages; the cover spine must not lag the page count.
7. No page may use the banned generic edge as a live edge name.
8. No key-shaped strings anywhere.
9. `llms.txt`'s date must equal the current release's row date. *(new at v0.3.23)*
10. An open decision must have authored options under it. *(new at v0.3.22)*
11. A named piece of blocked work must have a key. *(new at v0.3.22)*
12. A carried source document must still match its recorded SHA-256. *(new at v0.3.24)*
13. Every release in the history table must have a tag this clone can see, so the version diff
    cannot silently omit releases. *(new at v0.3.26)*

And five checks that report rather than fail, each stating the rule it ran: strong concepts
with no published demonstration, units two independent findings both touch, concepts nothing
rests on, level 3 and 4 text the concept layer has not reached, and oppositions landing in one
passage. A check with zero hits is kept, because a rule with no hits is still a rule.

### The class that keeps recurring

All three of this run's corrections, and the twelfth finding above, are the same failure:
**a number that nothing was checking**. The stale date, the dependency count, the tag set, and
twice over the document count. Each was written once, was true once, and then quietly stopped
being true while everything around it kept working. None was reported by a reader.

That pattern is the strongest argument in this document for the mechanism at the top of it, and
it splits into two sub-classes, one now gated and one not.

**Gated: generator output that depends on ambient state.** Finding 12. Fixed by naming an
authority (`versions.html`) and refusing to run when the two disagree. Worth auditing the other
generators for the same shape.

**Still ungated: numbers written into prose.** The generators compute counts into JSON and the pages render
them, so rendered counts cannot drift. But hand-written prose that quotes those counts is
checked by nothing, and it drifted **twice in two days**: "fifteen documents" survived into a
release where there were twenty-one, and "measured in all fifteen" survived into a set where it
was twenty of twenty-one. Both were caught by rereading, which is not a mechanism.

This is the clearest single instruction for the refactor. Either prose stops quoting computed
numbers and renders them, or a gate extracts numerals near known nouns and checks them against
the register. The first is cheaper and probably correct.

---

## What The Refactoring Must Not Lose

In rough order of how expensive it would be to rediscover:

1. **The generators, and their right to fail the build.** Thirteen gates exist because thirteen
   things silently drifted at least once. A refactor that turns any of them into a warning has
   removed the only reason it was ever found.
2. **The stated formulas.** Strength, influence and concentration are each one line, published
   next to their result, with the explicit invitation to disagree by recomputing. That sentence
   is what makes them arguable rather than authoritative.
3. **The carried copies and their hashes.** The evidence is the copy, not the summary.
4. **Supersede rather than delete.** Three corrections in this run are printed beside the thing
   they correct rather than replacing it. The record of being wrong is the most valuable part
   of the record.
5. **The reification rule.** Anything whose relation would be its own inverse becomes a node.
   This is why findings are nodes, and it will recur.
6. **Normalisation before visualisation.** See above. This is the difference between the
   picture and the instrument.

---

## What The Refactoring Should Fix

1. **Prose numbers.** As above. The single largest source of drift left.
2. **The ladder is authored inline in its generator.** That was the honest shape of a pilot;
   inventing a source format before the shape was known would have been schema-first. The shape
   is now known. It should move to `content/altitudes/` and the generator should become a
   compiler with a gate check, which is decision r004-D1.
3. **Three generators share a graph-drawing layer that does not exist.** `altitudes-graph.js`,
   `decisions.js` and `docs.js` each rebuilt node styling, fit-on-layout, mode toggles and the
   dashed-versus-solid convention. That is three copies of one idea, and the third copy was
   where the convention actually got named.
4. **The phrase lists are the weakest measured input.** They are published, which is the honest
   minimum, but nobody has argued with one yet. A phrase list that nobody has disputed is a
   proposal wearing the clothes of a measurement.
5. **Audit every generator for ambient-state dependence.** `gen_changes.py` was found reading
   the local tag set; it is now gated against the history table. Nothing has checked whether the
   others have the same shape, and the failure is invisible by construction.
6. **The concept layer and the docs layer measure the same twenty-four concepts by different
   means** (declared edges in one, counted phrases in the other) and nothing compares the two.
   Comparing them is a finding waiting to happen: a concept the ladder says is central and the
   phrase count says is absent is either a naming failure or a real gap.

---

## What This Does Not Try To Be

It is not a design document for the refactor: it records what was found and what would be
expensive to lose, not how to restructure the code. It is not a claim that the twelve findings
are equally important; several are small, and three are corrections to my own earlier statements.
It is not an argument that the graphs are the reason the work went well, and the section on the
mechanism deliberately argues the opposite.

---

## Honest Tensions

**The scores are load-bearing on weights nobody has challenged.** Influence is `concepts + 2 ×
places + 3 × asks`. Strength is `out + 2 × incoming + units + 2 × demonstrations`. Both are
stated, published and recomputable, which is the honest minimum and not the same as being
right. Until somebody disagrees with a weight, these are proposals presented as measurements.

**Three of the twelve findings are corrections to claims I made or shipped.** Findings 8, 9 and 12
are all cases of the work catching something written confidently a few releases earlier, or in the
last case never checked at all. That is the system
working, and it is also a reason to discount the confidence of everything else in this document
by the same amount.

**Measuring concepts by counting phrases rewards documents that use house vocabulary.** A
document that makes an argument in different words scores low on it, which penalises exactly the
independent formulation that would be most valuable. *Compatibility Through Connectivity*
scoring zero on chain of custody may be a real absence, or it may be February vocabulary. The
measure cannot tell the difference and does not claim to.

**The estate is now producing evidence faster than the book can absorb it.** Twenty-one carried
documents, five vault analyses and a cross-vault synthesis all landed while the book itself
changed in no substantive way. That gap is deliberate under the current sequencing, and it is
still a gap.

---

## Open Questions

1. Should the measured and declared concept layers be reconciled, and what is the finding if
   they disagree?
2. Is concentration the right shape of measure, or should it be an entropy over the whole
   distribution rather than a top-three share?
3. Do the aggregate views keep producing findings as the data grows, or was this a one-time
   harvest of everything that had accumulated un-normalised?
4. What is the smallest gate that would have caught the prose-number drift?
5. Which of the thirteen gates would a reasonable person remove, and what does the answer say
   about the ones nobody would touch?

---

## Relationship To Previous Briefs

This brief sits downstream of the four reviews (r001 to r004) and of the fifteen-then-twenty-one
source documents carried at `/docs/`. Three of those documents are direct ancestors of what is
recorded here: *Refactoring Meaning* supplies the reason the ladder is many-to-many and the
warning that a ladder built by an agent is a proposal; *An Index Is Not A Source* supplies the
rule that this brief, like every summary, is a caching node rather than a source; and *The Graph
Canvas As A REPL* supplies the claim that whatever the operation vocabulary cannot express is a
finding about the model. All three were written before this work started and describe it better
than it described itself at the time.

---

## Key Claims

| # | Claim |
|---|-------|
| 1 | The visualisations did not produce the insights; the arithmetic behind them did, and the visualisation is how a person notices |
| 2 | An assertion that has not been converted into an arithmetic is not being checked, however confidently it is written |
| 3 | The generators are load-bearing and the renderers are replaceable, which is the refactor's first constraint |
| 4 | Every aggregate view produced findings; no per-item ego graph produced any |
| 5 | Normalisation is the instrument and layout is the lens: a graph over un-normalised data gives a picture, not a finding |
| 6 | A finding reached twice by independent routes is worth more than the same finding reached once |
| 7 | A strongly connected node is not a well-supported one, and conflating the two overstates whatever is repeated most |
| 8 | The grammar refused a shape and the data model changed, which is evidence that the edge rules do real work |
| 9 | Four of twelve blocked work items were shared between decisions under different names, which no list could show |
| 10 | Carried, measured and authored are three different kinds of link and must be drawn apart |
| 11 | A gate that warns instead of failing removes the only reason the drift was ever found |
| 12 | Numbers written into prose are the remaining ungated class, and they drifted twice in two days |
| 13 | A generator that reads ambient state cannot tell "there are fifteen" from "I can see fifteen", and shipped a version diff missing eighteen releases |
| 14 | Every correction in this run was the same failure: a number nothing was checking, written once, true once, and never reported by a reader |
| 15 | Stated formulas that nobody has yet disagreed with are proposals wearing the clothes of measurements |

---

This document is released under the Creative Commons Attribution 4.0 International licence (CC BY 4.0).
