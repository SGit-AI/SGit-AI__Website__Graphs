# 1 · The loop

*After this chapter you will be able to describe, in one diagram, the working cycle that
produced eighty-eight releases in six days, and you will know the four numbers that tell
you whether your own cycle is running or stalled.*

---

## One hour, start to finish

At 13:44 on 26 August 2026 the repository behind graphs.sgit.ai was tagged v0.5.2. The
release note for it opens like this:

> The WCLM: a deterministic transformer over our graphs. Brief 31, the founder's
> self-described "crazy experiment", built in its own folder (v2/wclm/) with its own
> code, exactly as asked, and it works.

Thirty-three minutes later the repository was tagged v0.5.3, and its note opens:

> Every box explains itself, both ways. Brief 32, recorded through the viewer's own loop
> after the founder tried the WCLM ("this WORKED really WELL"), built the same hour.

Between those two timestamps a person opened a page that had existed for half an hour,
used it, spoke into a microphone about what he wanted next, sent two screenshots, and
received a rebuilt page with every element on it clickable and explaining its own
provenance in both directions.

That is the loop. It is not a metaphor for the process. It is the process, and it ran
between eighty-seven consecutive pairs of releases over six days.

## The five steps

**1. The founder records a voice memo.** Usually while using the thing that shipped an
hour ago, on a phone or an iPad, often in the middle of a sentence about something else.
It is transcribed automatically, by otter.ai in most cases or by the site's own chat
panel once that existed. The transcription is bad in the ordinary ways: "thinking in
graphs" comes out as "tignogen graphs", "peak board" comes out as "pasteboard", "nodes"
comes out as "modes".

**2. The memo is published verbatim as a brief.** Not summarised. Not cleaned up. The
transcript, garbles and all, goes into a numbered markdown file in the repository under
`v2/briefs/`, gets a rendered page on the website, and is the source of truth for what
was asked. The agent's reading of it is written underneath, in a table, marked as the
agent's. Chapter 3 is entirely about why this ordering matters.

**3. The agent builds.** Code, data, generated pages, the release note, the tests. In
the six days covered here there was never a design document written before the build
that was not itself a brief; the plan and the build were the same act, and the record
of what was decided is the release note.

**4. The release ships itself.** A push to the `dev` branch runs a pre-release
validator. If the validator passes, a machine tags the commit `vX.Y.Z` and deploys the
site. If the validator fails, nothing tags and nothing deploys. There is no manual
release step and no staging environment where things sit.

**5. The founder looks at the live site and starts again at step 1.** Often within
minutes. Sometimes he sends the memo before the previous release has finished
deploying, which is how three separate instructions arrived inside one afternoon and
shipped together as v0.5.5.

![The front page of graphs.sgit.ai at v0.5.11, the last release this book covers. Everything under "the second edition" was built in the six days described here.](figures/17__v0.5.11__the-front-page.png)

*Figure 1. The front page at v0.5.11, re-taken from the tag `v0.5.11` on a local server.*

## The four numbers

The loop either runs or it does not, and you can tell which from four measurements. All
four below are computed from the repository's own git history; the commands are in
Appendix C.

**Releases per day.** Thirteen, sixteen, fourteen, twenty, nine, sixteen. Eighty-eight
in six days, an average of 14.7 a day. The dip to nine on 25 August is worth reading
before you conclude it was a slow day: this book's judgement, and it is a judgement, is
that it is the day the two hardest design problems of the period were worked (the
stability principle of Chapter 5, and navigation as query), and that each release that
day carried more than the ones around it.

**The gap between releases.** The median gap between two consecutive tags is 31.2
minutes. If you exclude the overnight gaps and look only at pairs less than ten hours
apart, that is, releases inside the same working session, the median is 29.3 minutes.
Forty-two of the eighty-seven gaps are under half an hour.

**The working window.** The first and last release of each day, in UTC:

| Date | Releases | First to last | Span |
|---|---|---|---|
| 21 Aug | 13 | 14:47 to 21:39 | 6.9 hours |
| 22 Aug | 16 | 09:53 to 23:40 | 13.8 hours |
| 23 Aug | 14 | 00:17 to 22:25 | 22.1 hours |
| 24 Aug | 20 | 13:05 to 23:03 | 10.0 hours |
| 25 Aug | 9 | 11:48 to 20:12 | 8.4 hours |
| 26 Aug | 16 | 09:22 to 21:09 | 11.8 hours |

Two of these days are longer than any reasonable person should work. That is worth
saying plainly, and Chapter 12 says it again with the costs attached. The loop does not
require this pace; it survives being run twice a week. But the density is what makes the
evidence in this book unusually good, because six days of near-continuous releases leave
a record with almost no gaps in it.

**The ratio of releases to commits.** The repository contains 97 commits up to
v0.5.11. Eighty-nine of them have a subject line beginning `site v`, which is the
release convention. Eight do not: three merge commits, four working commits on side
branches, and the initial commit.

That last ratio is the one that surprised me most when I computed it. Ninety-two per
cent of all commits to this repository are releases. There is essentially no such thing
as work-in-progress in the main line. A change either passes the gate and ships, or it
does not exist yet.

## Why an hour and not a week

The obvious objection to a thirty-minute release cadence is that it produces churn:
lots of motion, no direction. The record does not support that reading, and the reason
is structural rather than heroic.

**A release is small enough to hold in one head.** Each of the eighty-eight release
notes describes one coherent change with its verification. Read v0.4.27 in full:

> The close button now says so. The founder asked how to close the chat panel — which
> means the bare ✕ among nine header buttons did not read as "close the panel" on a
> wrapped iPad header. It is now labelled ✕ close, visually set apart with its own
> hover, its tooltip says what happens (the 💬 button brings the panel back), and
> Escape closes the panel from anywhere except inside an input, where Escape belongs to
> the field. Three new suite checks: the label, the click, and the Escape path. 60
> checks green. No book content changed.

That entire release is one button label, one keyboard shortcut and three tests. It
shipped three minutes after v0.4.26. It is not churn, it is a question answered before
it could become an assumption.

**A short loop turns opinion into evidence.** When the founder said, at v0.5.4, that
"meaning without connectivity" should not answer identically to "meaning through
connectivity", the disagreement did not have to be argued. It was run, on the live page,
and the page agreed with him. Thirty minutes later the engine had a negation stage and
the answer had changed. The cost of being wrong about a design question fell to about the
cost of the conversation about it, which changes what kind of questions get asked.

**The reviewer is reviewing the real thing.** Every one of the founder's memos in this
period was recorded while using the deployed site, not while reading a plan. There are
no mockups anywhere in this story. There is no design phase separate from the build.
That is only possible because the build takes minutes.

## What holds it together

Speed like this normally breaks something. Three mechanisms stop it, and each gets its
own chapter later:

**The brief** (Chapter 3) fixes the instruction. Because the founder's words are
captured verbatim before the agent reads them, there is a permanent record of what was
asked that is independent of what got built. An instruction cannot be quietly softened
into an easier one, because the harder version is sitting in the repository with a URL.

**The gates** (Chapter 4) fix the quality. The pre-release validator grew from seven
checks at v0.1.0 to sixteen; the unit suite went from thirteen tests at v0.4.13 to
eighty-four at v0.5.9. A release that breaks an internal link, or lets a page drift from
the markdown it claims to render, or quotes a document at bytes the document does not
contain, does not tag and does not deploy.

**The release note** (Chapter 4 again) fixes the memory. Every release note in this
repository is a paragraph of prose that says what changed, why, what was verified and
how. They are long. v0.5.7's is over five hundred words. They are the single most
useful artefact in the whole repository, because six days later they are the only
reliable account of what happened, and unlike a commit log they were written by
somebody who knew why.

## The loop is not new; the cost of it is

None of the five steps above is an invention. Recording what a stakeholder actually said
is old practice. Shipping small is old practice. Automating validate, tag and deploy is
old practice.

What changed is the cost of step 3. When the build step takes an agent twenty minutes
instead of a team two weeks, every other step in the loop can be shortened to match, and
the loop as a whole crosses a threshold: it becomes faster to build the thing than to
argue about whether to build it. Past that threshold, the discipline you need is not
about planning better, it is about capturing intent faithfully and refusing to ship
anything you have not checked.

That is the whole method. The rest of this book is what it looks like in practice,
including the days it went wrong.

---

**Where the live estate shows this.** The release table at `/admin/versions.html` and
its two archive pages, `/admin/versions-v0.4.html` (41 rows) and
`/admin/versions-earlier.html` (35 rows), are the loop's own record: every release,
dated, with a paragraph on what happened. The briefs it responded to are at
`/v2/memos/` for the second edition and `/v1/briefs/` for the first.
