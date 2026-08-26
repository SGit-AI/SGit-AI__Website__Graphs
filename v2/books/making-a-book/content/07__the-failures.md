# 7 · The failures, lovingly

*After this chapter you will recognise nine specific ways an agentic project goes wrong,
you will know which of them your tests can catch and which of them only a person can, and
you will have a reason to stop treating your own verification tools as trustworthy.*

---

Nothing in this chapter is a confession. Every failure below was published in the release
table on the day it happened, usually in the same paragraph as the fix. That is the point
of the chapter: the record exists because failures were treated as ordinary events with a
row of their own rather than as things to be quietly repaired.

They are grouped by who could have caught them, because that turns out to be the useful
axis.

---

## Failures only a person using the thing could find

### 1. The iPad round

For nineteen releases the chat panel had been verified in headless Chromium and it
passed. Then, on 24 August, the founder used it on an iPad with a real API key. Release
v0.4.26:

> The iPad round: the founder's first live session found the two things headless Chromium
> never would. First real use of the chat with a live OpenRouter key surfaced (1) the
> request details could not be hidden — the family's sg-llm-stats has no compact mode, so
> its full panel (pre-send estimate, last request, session totals, streaming toggle) blew
> the footer up to half the screen and left the transcript squeezed above dead space; and
> (2) the panel could not be resized by touch — an 8-pixel grip with no touch-action, so
> Safari took the drag as a scroll.

Neither bug is subtle. Both are invisible to an automated test. The first only appears
when a real request has been made, because the statistics panel is empty until then. The
second only appears on a touch device, because a mouse can hit an eight-pixel target
without complaint.

What is worth copying is the ending:

> The suite grew seven checks that would have caught both: usage hidden by default, the
> footer under 60 pixels, the toggle round-trip, the capped drawer, the grip's width and
> touch-action, and a synthetic touch drag that must actually widen the panel.

Seven tests, written after the fact, that convert two lessons from a human session into
permanent machine knowledge. That pattern appears throughout this repository and it is
the single highest-value habit in the whole method: **every bug a person finds becomes a
test before the release ships.** The founder should not have to find the same class of
thing twice.

### 2. The button that did not say what it did

Three minutes and eleven seconds after v0.4.26, the founder asked how to close the chat
panel. Release v0.4.27:

> The close button now says so. The founder asked how to close the chat panel — which
> means the bare ✕ among nine header buttons did not read as "close the panel" on a
> wrapped iPad header.

Read the second clause carefully, because it contains a small piece of craft. The founder
asked a question. He did not report a bug. The agent translated a question into a
finding: if a user has to ask how to close a panel, the close control has failed,
regardless of whether it works.

That translation is a judgement, and it could be wrong. It is also the kind of judgement
worth making, because the cost of being wrong is a three-minute release and the cost of
being right and doing nothing is a user who quietly stops using the panel.

### 3. The wires that moved when the page scrolled

On 26 August, at v0.5.4, a page drew a set of chips connected by curved wires. The
founder scrolled it sideways and the wires landed in the wrong place. From v0.5.5:

> Also fixed from the founder's live catch on v0.5.4: wires drawn after scrolling right
> landed in the wrong place — chip positions are viewport-space and the canvas is
> content-space, and the horizontal scroll offset was never added back; wire geometry is
> now scroll-invariant, machine-checked.

Two coordinate systems, one missing addition. A classic. It is in this chapter because of
what did not catch it: a test suite that renders the page, takes measurements and asserts
on them, in a browser that never scrolls, because nothing in the test told it to.

Automated verification tests what you thought to test. A person using the thing tests
what they happen to do.

---

## Failures the picture itself revealed

### 4. The wire that jumped a layer

This is the best failure in the whole period, and it is worth telling slowly.

The WCLM, built at v0.5.2, is an engine with six named layers. Its central architectural
claim is that each layer reads only the layer before it, which is what makes the whole
thing explainable: you can walk any answer backwards, one adjacent step at a time, to the
words that produced it.

At v0.5.3 the page drew all six layers as columns with wires between them. It looked
correct. The founder narrated a review over it and, at moment 2, pointed at a wire.

From brief 33:

> **Layers must not be jumped** (moment 2, the connectivity click). The screenshot shows
> the wire running from L2 resolve straight to L4 bind, and from L4 straight to L6 —
> exactly what the founder called weird, because "in principle, every layer should be a
> bit independent from the previous one, so you shouldn't have layers jumping." The
> finding is correct: the wiring violated the model's own claim.

![The WCLM at v0.5.2, before the finding. Some wires run from L2 straight past L3.](figures/09__v0.5.2__the-wclm-six-layers.png)

*Figure 13. `/v2/wclm/` at tag `v0.5.2`, 26 August 2026.*

The engine was not wrong in its arithmetic. It was wrong in its structure, in a way that
only became visible when it was drawn, and only became a bug when someone took the drawing
seriously enough to check it against the claim the page was making three paragraphs above.

The fix, in v0.5.4, is not a rendering change. Two real stages were added, because the
missing wires were a symptom of missing work: an attention layer that carries a chip per
surviving token, and an expansion layer that carries one assembled chip per bound meaning.
With those in place, every wire connects adjacent layers because there is something
adjacent for it to land on.

Then the fix was made permanent by measurement, which is the part to steal:

> This is machine-checked: 500 wires across five pipeline shapes and six prompts, zero
> adjacency violations.

By v0.5.5 the same proof ran over the new layered shapes at 547 wires, and by v0.5.6 at
551. A structural claim became a number that a machine recomputes on every release.

![The same page at v0.5.4, with eight reorderable blocks and strict adjacency.](figures/10__v0.5.4__strict-layers-and-the-pipeline-bar.png)

*Figure 14. `/v2/wclm/` at tag `v0.5.4`, 26 August 2026.*

The general lesson: **draw your architecture and then check the drawing against the
claim.** Diagrams in most projects are decoration because nobody tests them. A diagram
generated from the running system is a test, and it will occasionally fail in public.

### 5. The negation that was not there

The same review contained a second finding, and it is a lovely one because the founder
found it by running an experiment on the live page rather than by reading anything.

He typed "meaning without connectivity" into an engine whose universe asserts that
meaning comes through connectivity. He got back exactly the same answer as "meaning
through connectivity". From brief 33:

> He ran the negated phrase and got the same winner — rightly called wrong.

The reason is almost funny. The engine classified small words as padding. "Through" was
padding, so it was ignored. "Without" was also padding, so it was ignored too. Two phrases
with opposite meanings tokenised to the same content.

The fix at v0.5.4 added an operators stage: without, not, no, never and versus mark what
follows, the negated word is withdrawn from positive binding, and, when the negated word
belongs to a claim the universe itself asserts, the answer says so:

> the answer now carries the warning that the prompt negates connectivity while this
> universe asserts meaning through connectivity — the query contradicts the world, said
> out loud

Two things to take from it. First, a system that ignores what it does not understand will
confidently produce the opposite of the right answer, and will look exactly as confident
doing it. Second, the founder's method here is worth copying directly: take the thing that
works, feed it the case where it should break, and see whether it notices.

---

## Failures where the agent's own tools lied

### 6. The zombie browser that cost an hour

From the v0.4.37 release note, published the day it happened:

> The round also burned an hour on a lesson worth recording: a zombie headless Chromium
> from a crashed test run held the debug port and served stale modules to every later test
> on that port, making a working feature look broken; the fix was kill, not code.

Read the failure mode again, because it is the nastiest one in the chapter. A feature was
built. It worked. The test harness said it did not. The agent then debugged working code,
guided by a harness that was serving a cached copy of an older version, on one specific
port, deterministically.

Deterministic is the key word. A flaky failure gets suspected quickly. A failure that
reproduces every time is trusted, and trusted failures send you looking in the wrong
place. An hour, in a project shipping every thirty minutes, is two releases.

The retrospective turns it into a rule:

> **Test the harness too.** An hour went to a zombie headless Chromium holding a debug
> port and serving stale modules, making a working feature look broken deterministically
> on one port. The fix was kill, not code. Verification infrastructure earns the same
> suspicion as the code it verifies.

The operational habits that came out of it are in this book's own harness, in Appendix C:
never reuse a debug port between runs, and always kill the browser you spawned, in a
`finally` block, whether or not the run succeeded. The twenty figures in this book were
taken with twenty separate ports and twenty browser shutdowns for exactly this reason.

### 7. When your own tests were the wrong shape

The pin_nodes defect from Chapter 6 belongs in this chapter too, and it is the purest
example of a failure that no single test suite could see.

The chat agent's tests passed. The reader agent's tests passed. The behaviour was still
broken, because the chat agent placed nodes outside a pipeline that the reader agent
re-ran on every control change. Each suite tested its own half of a contract neither had
written down.

It was found by one agent pulling the other's release and running its own suite against
it, which is a habit worth naming: **your tests only guard your assumptions. Find someone
whose assumptions differ and run their tests against your code.**

---

## Failures of claim, not of code

### 8. The neatest claim, broken by more data

On 23 August the project had fifteen source documents carried into it, and the agent
measured a property across all fifteen and reported it. Then the founder asked for six
more. Release v0.3.25:

> Six more sources, and the growth immediately broke the section's neatest claim. […] At
> fifteen documents, a claim is worth its chain of custody was measured in every single
> one, and the previous release said so. At twenty-one it is measured in twenty. The
> exception is Compatibility Through Connectivity, one of the three February documents,
> written before the provenance vocabulary hardened.

The claim went from universal to twenty out of twenty-one in one release, and the release
note leads with it. Not "we have expanded the corpus", but "the growth immediately broke
the section's neatest claim". The exception is named, and so is the reason it is an
exception.

An agent generating prose about a corpus will produce clean generalisations, because clean
generalisations read well. The remedy is not to write more carefully. It is to compute the
claim on every build so that the next batch of data breaks it out loud.

### 9. The correction the agent owed

The last one is the smallest and the least like a bug. From v0.4.3:

> And a correction I owed. The retrospective said every aggregate view produced findings
> and no per-item view did, and called the per-item ones reading aids. The measurement
> stands; the words were wrong. […] Judging a compression by whether it produced a novel
> finding is like judging level 2 of the ladder by the same test. The corrected statement
> is now in the dev pack's file 07.

The numbers were right. The interpretation was condescending to half the evidence, and
the founder's framing was better. So the agent said so, in the release table, in the
first person, and fixed the sentence in the document where it lived.

There is a related house rule the first edition already had, quoted in the v0.2.0 release
note: "per the site's own rule, corrections get a row, not a silent edit". A correction
gets a release of its own rather than being tidied away.

---

## What the pattern is

Nine failures, three shapes.

**Things only a human can find** live in touch, in real data, in the sequence of actions
nobody thought to script. There is no substitute for the founder opening the thing on an
iPad. The cost is that this only happens after you ship, which means shipping often is
part of the quality strategy, not opposed to it.

**Things the picture reveals** live in the gap between what a system claims about itself
and what it does. This project got two of its best fixes from drawing the architecture and
then checking the drawing. If your system has a diagram that is generated rather than
drawn, it can catch you lying.

**Things your tools hide** live in the verification layer, which is code, which has bugs,
and which no one tests. If the fix for a stubborn bug is "kill the process", that is a
finding about your harness and it deserves the same write-up as a finding about your
product.

And one meta-pattern, which is the reason this chapter could be written at all: every one
of these is in the public record, on the day, with the cost attached. Not one of them was
found by reading the code six days later. They were found by reading release notes that
somebody wrote honestly at the time, including the sentence "the round also burned an
hour".

---

**Where the live estate shows this.** The narrated review that produced failures 4 and 5
is at `/v2/memos/33-founder-review-the-detective-playbook.html`. The iPad round is
v0.4.26 and the zombie browser is v0.4.37, both in `/admin/versions-v0.4.html`. The
correction the agent owed is v0.4.3 in the same table.
