# 8 · Reviewing out loud

*After this chapter you will know how to give an agent feedback about something visual
without writing a specification, and you will know the one change to make to your own
pages so that a screenshot of them is diagnosable.*

---

## The problem with written feedback about visual things

Writing down what is wrong with a screen is slow and lossy. "The panel covers the thing it
is supposed to be adjusting" takes a paragraph to say precisely, and by the time you have
written the paragraph you have lost the second, third and fourth thing you noticed.

On 25 August the founder tried a different approach. He recorded his screen while using
the site, spoke over it, and let a tool cut the recording into moments: ten screenshots,
each with the words that were being said when that screenshot was taken. Three minutes
and twenty-six seconds of audio. The bundle was handed to the agent.

The result was v0.4.31:

> The narrated review lands: six findings, each fixed where its screenshot pointed.

Six actionable findings from three and a half minutes of talking. Compare that to the
effort of writing six precise UI bug reports.

## What the transcript actually looks like

It is not tidy. Here is moment 6 in full, exactly as published in brief 27:

> On... oh, sorry. It was working, I was just not seeing the the option there. Um cool.
> So, and so the first thing I want to say is on the right-hand side, what I was
> mentioning by this is: first of all, I should be able to click on this, uh which I can't
> right now on these node types in the view. And also, for example, on any of the nodes
> [unsure], which I don't think the, uh, what's it called, the focus on selection is
> actually doing, is that you'll see here—oh, that's interesting. It doesn't work.
> Actually, it's working now. Okay. Cool.

The words "this", "here", "the option there" and "these node types" are doing most of the
work in that paragraph, and none of them mean anything on their own. They mean something
because there is a screenshot attached to that exact moment.

That is the whole mechanism: deixis plus pixels. The founder can point instead of
describe, and pointing is enormously faster.

## What the tool got right

The agent was asked for a verdict on the review tool itself and gave one, recorded in
brief 27:

> It works, and the alignment layer is what makes it: the bundle's `session.json` joins
> every spoken sentence to the exact pixels on screen when it was said, keeps the raw
> recogniser text beside the cleaned text, and flags its own uncertain corrections
> ("pasteboard" corrected to "peak board" from the button visible on screen) instead of
> resolving them silently. That is the same discipline as the universe's anchors: words
> tied to the evidence they were said about, provenance never overwritten.

Three properties, all of which are the same properties a good brief has:

**The words are joined to the evidence.** Each sentence knows which screenshot it belongs
to, the same way each node in the project's document graphs knows which quote it belongs
to.

**The raw text survives the cleanup.** A model tidies the recogniser output into readable
sentences, and the untidy original stays beside it. Nothing is overwritten.

**Uncertainty is surfaced, not resolved.** The brief carries a list at the end of every
correction the cleanup model was not sure about:

> - Moment 7: "peak board" — Corrected 'pasteboard' to 'peak board' based on the 'peak
>   board' button visible in the VIEW options on screen.
> - Moment 9: "peak board" — Corrected 'big board' to 'peak board' based on the UI title.

A model looked at a screenshot, saw a button labelled "peak board", and used it to fix a
mis-hearing. That is good work, and it is also a guess, and the brief prints it as a
guess with its reasoning.

## The finding that mattered

Five of the six findings were interface problems: the legend rows should be clickable, the
peak board should not cover the canvas it is adjusting, the live graph should be one click
away rather than one scroll away. All real, all fixed in the same release.

The sixth was a genuine bug, and the founder found it without knowing it was a bug. At
moment 7 he said:

> I need a way to remove everything else from here, right? So, I only see the selection

There was already a control for that, called focus on selection. It was on. It was not
working. The agent's investigation, recorded in the brief's findings table:

> The real bug: the alignment rails' invisible ties had joined the explore walk, so every
> section was reachable in two hops and the walk kept everything

Recall from Chapter 5 that alignment rails are invisible ties that pull related nodes into
rows. They are layout physics. But they had been implemented as edges in the same graph as
the content, and the walk that decides what is near your selection could not tell the
difference. Every node was two hops from everything, so focusing on one thing kept
everything.

The fix separates the two categories properly:

> The rails and their ties are now excluded from the explore walk, the stats bar and the
> legend — they are layout physics, not content. Focus on selection now actually empties
> the canvas down to the neighbourhood

The release note adds the number: seven nodes of ninety-eight.

![After the narrated review: the maximised graph with a clickable legend on the right.](figures/05__v0.4.31__after-the-narrated-review.png)

*Figure 15. `/v2/universe/thinking-in-graphs.html#graph` at tag `v0.4.31`, 25 August 2026.
The `#graph` fragment itself is one of the six fixes: at moment 2 the founder had scrolled
to a static drawing and mistaken it for the live view.*

## The inversion: pages that broadcast their own state

The founder's follow-up message, sent in chat the same day and recorded verbatim in the
same brief, is the best single idea in this chapter:

> great, so how can we add some more info that is useful to you? (since the prob here is
> that the recorded doesn't have programatic access to the page it is being recorded
>
> what if we add a debug pane (bottom right) that has that info you asked for?

The recorder cannot see inside the page. It only captures pixels. So instead of giving the
recorder access, put the state into the pixels.

Eight minutes later, v0.4.32:

> The state pane: the page broadcasts its state into the pixels a recording captures. […]
> Bottom right, off by default (it exists for narrations and debug sessions), enabled by
> #debug on the URL or the reader options popover: the site version, document and hash, a
> running clock that joins each screenshot to the recording's own timeline, the current
> selection, layout and look, the sources that are on, the explore state and hidden edge
> kinds, the visible counts, and the last action taken ("last: gpeaks→1", "select
> connectivity"), the line that disambiguates "this" and "here" in a narration.

Two details make this more than a debug overlay.

**The clock.** Every screenshot carries a running clock, which means every screenshot can
be placed on the recording's timeline independently of whatever metadata the recorder
produced. If the two disagree, the pixels win.

**The last action.** "last: gpeaks→1". When a narrator says "I just did this and look what
happened", the pane says what "this" was. That is the single line that converts an
ambiguous sentence into a reproducible one.

The release note also says who the text is written for: "Short high-contrast monospace
lines, written for OCR and vision models as much as for eyes."

And it closes the loop back to programmatic access rather than replacing it:

> The same truth is published as window.__uniState(), so a tool that does gain
> programmatic access reads exactly what the pixels say.

One source of truth, two readers. The pane and the API cannot disagree, because the pane
renders the API.

## The rule for anyone building anything an agent must diagnose

The retrospective states it as a transferable learning:

> **Screenshots need state in the pixels.** The narrated-review round exposed that a
> recording cannot see page state; the state pane put version, selection, sources and the
> last action into every screenshot. Any surface an agent must diagnose from images should
> broadcast its own state.

If you take one thing from this chapter into your own project: **put a small, switchable
panel on every interactive page that prints the version, the current selection, and the
last action taken.** It costs an afternoon. It pays for itself the first time somebody
sends you a screenshot with a complaint attached.

## Why this is easier than writing a specification

The narrated review is faster than written feedback, but the deeper reason it works is
that it changes what kind of feedback is possible.

A written bug report is a claim about a system. A narrated review is a recording of a
person's experience of a system, in order, including the parts where they were confused,
tried something, and it turned out to be working after all. Moment 6 above contains "It
doesn't work. Actually, it's working now." A written report would never contain that
sentence, and the sentence is diagnostic: something took long enough to respond that a
person concluded it was broken.

The brief's own summary of the trade:

> Ten moments took three and a half minutes to record and carried six actionable findings,
> two of which (the explore pollution, the board coverage) a written note would likely have
> described less precisely than one screenshot each did.

---

**Where the live estate shows this.** The narrated review is published at
`/v2/memos/27-founder-review-narrated-viewer-walkthrough.html`, moment by moment, with the
findings table and the uncertain corrections. The second narrated review, over the WCLM, is
at `/v2/memos/33-founder-review-the-detective-playbook.html`. The state pane is still on
every reader page: add `#debug` to the URL.
