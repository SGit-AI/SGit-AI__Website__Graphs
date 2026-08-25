# Brief 27 — founder review: a narrated walkthrough of the viewer

**Date:** 25 August 2026
**Source:** a narrated review made with the narrated-review tool (tools.sgraph.ai) —
ten screen captures with the founder's words spoken over them, exported as a bundle
(session nr-2026-08-25-6f0a, 03:26 of audio). The moments below are the tool's
cleaned transcript, reproduced as delivered; spans the cleanup model was unsure of
are marked [unsure] and listed at the end, and the bundle keeps the raw recogniser
text beside every correction.
**Status:** the founder's words are source material. The reading table is the agent's.

---

# Narrated review — nr-2026-08-25-6f0a

*10 moments · 03:26 · captured with narrated-review (tools.sgraph.ai)*

**Session summary:** The user notes they can now select the "focus on selection" option, which they still see as a problem. They emphasize that the "peak board" is very important to show so they can see things in real time and explore how it actually works.

## 1. At 00:00

*(screenshot: pair-01.png)*

Okay, so I'm going to experiment using our narrated review.

## 2. At 00:14

*(screenshot: pair-02.png)*

To create and capture my nodes. So the first interesting one is that when I open the page, I actually have to scroll down in this view to get to the the graph, which is—looks pretty freaking cool, right? But the problem is that I, I would like actually to open this directly, because the graph now is becoming a super powerful view. In fact, this view here does not have the the options, and I think this is actually the PDF view. So what I need to do is I need to zoom out, and then only when I zoom out, I actually get, um...

## 3. At 00:46

*(screenshot: pair-03.png)*

No.

## 4. At 00:57

*(screenshot: pair-04.png)*

v0 [unsure], which is pretty cool, and that's the one that has the ability to, uh, click on that maximize button, uh, which basically then looks like this, which is

## 5. At 00:59

*(screenshot: pair-05.png)*

Pretty cool. Mm.

## 6. At 01:06

*(screenshot: pair-06.png)*

On... oh, sorry. It was working, I was just not seeing the the option there. Um cool. So, and so the first thing I want to say is on the right-hand side, what I was mentioning by this is: first of all, I should be able to click on this, uh which I can't right now on these node types in the view. And also, for example, on any of the nodes [unsure], which I don't think the, uh, what's it called, the focus on selection is actually doing, is that you'll see here—oh, that's interesting. It doesn't work. Actually, it's working now. Okay. Cool. So, okay, so one of the things that, I mean, show you the focus on selection, um

## 7. At 01:58

*(screenshot: pair-07.png)*

that, uh, that we have, which is like this. So, I need a way to remove everything else from here, right? So, I only see the selection, and you can see the options that I have, right? Because in this particular case, as I zoom in, I don't want to see the rest. I only want to see the bits that are here, right, in terms of this. Now, the peak board [unsure] is

## 8. At 02:22

*(screenshot: pair-08.png)*

Absolutely brilliant. I love it that I can move stuff around. And actually, I notice that it happens in real time. But what we need, we actually need this peak board, um, to actually be on the, um,

## 9. At 02:41

*(screenshot: pair-09.png)*

For example, I made the change, that you can see [unsure] now, right? I need this peak board [unsure] to actually be visible in this environment here. So, you could see here that the, um, the things have been pinned, um, although, I

## 10. At 03:11

*(screenshot: pair-10.png)*

Uh, I now can select the, the focus on selection, which is also a problem. Um, but but the peak board is very important to to show, or you know, to show me the real time [unsure] because I want to explore how that actually works.

## Uncertain corrections

*The cleanup model flagged these spans rather than resolving them silently:*

- Moment 4: "v0" — surface doubt: speaker may have said 'v0' or 'zero'
- Moment 6: "nodes" — Corrected 'modes' to 'nodes' based on context of the graph visualization.
- Moment 7: "peak board" — Corrected 'pasteboard' to 'peak board' based on the 'peak board' button visible in the VIEW options on screen.
- Moment 9: "that you can see" — Based on context, 'they can see' is likely a mishearing of 'that you can see'.
- Moment 9: "peak board" — Corrected 'big board' to 'peak board' based on the UI title.
- Moment 10: "the real time" — surface doubt: could refer to 'the real thing' or another system state, but 'the real time' is kept as the closest match.

---

## The findings, connected to the screens (the agent's reading)

| Moment | What was on screen | The finding | Landed (v0.4.31) |
|---|---|---|---|
| 2 | The extraction page scrolled to the STATIC drawing (the "compression, not an extra source" figure), no controls, chat button bottom right | The live graph should be one click away, not a scroll away; the static drawing was mistaken for the live view ("I think this is actually the PDF view") | `#graph` on a document page now lands straight in the maximised live graph, and the static drawing's caption links there ("Open the live graph, maximised") |
| 4-5 | Zoomed out, the panel appeared, maximise clicked | Working as intended once found — the entry problem above is the real issue | Covered by `#graph` |
| 6 | Maximised view, inspector legend listing every node and edge type | The legend rows should be clickable ("I should be able to click on these node types in the view") | Every legend row is now a control: an extraction family toggles the shared kind (mirrored in the source pane), a synthetic family toggles its source, an edge type hides and shows that relation — and a hidden relation keeps its row so the way back stays |
| 7 | Focus on selection at "to peaks", everything still faintly visible; stats showing 95 align and 7 rail | "I need a way to remove everything else... I only see the selection." The real bug: the alignment rails' invisible ties had joined the explore walk, so every section was reachable in two hops and the walk kept everything | The rails and their ties are now excluded from the explore walk, the stats bar and the legend — they are layout physics, not content. Focus on selection now actually empties the canvas down to the neighbourhood |
| 8-9 | The peak board open, covering the canvas; pins applied in real time behind it | "Absolutely brilliant... but we need this peak board to actually be visible in this environment here" — the board must not cover the graph it is re-anchoring | The board now docks to the lower left as a compact panel, the canvas stays visible beside it, and every drag re-anchors in view |
| 10 | Board open, focus on selection re-enabled | Same two threads: the explore behaviour and watching the board work in real time | Covered by the moment-7 fix and the docking |

## On the tool itself (the agent's verdict, asked for)

It works, and the alignment layer is what makes it: the bundle's `session.json` joins
every spoken sentence to the exact pixels on screen when it was said, keeps the raw
recogniser text beside the cleaned text, and flags its own uncertain corrections
("pasteboard" corrected to "peak board" from the button visible on screen) instead of
resolving them silently. That is the same discipline as the universe's anchors: words
tied to the evidence they were said about, provenance never overwritten. Ten moments
took three and a half minutes to record and carried six actionable findings, two of
which (the explore pollution, the board coverage) a written note would likely have
described less precisely than one screenshot each did.

---

## Follow-on (25 August 2026, in chat, verbatim)

> great, so how can we add some more info that is useful to you? (since the prob here is that the recorded doesn't have programatic access to the page it is being recorded
>
> what if we add a debug pane (bottom right) that has that info you asked for?

> relevant when I'm doing this type of narrations or other debug cases where you kinda want to have some extra info to help to diagnose something

**Acted on at v0.4.32: the state pane.** The founder's inversion is the right fix: if the
recorder cannot reach the page, the page broadcasts its state into the pixels the recorder
does capture, and the review tool's cleanup model, which already reads the screenshots,
transcribes the state the same way it read the "peak board" button. The pane sits bottom
right, off by default (it exists for narrations and debug sessions), enabled by `#debug`
on the URL, or the reader options popover, and it shows on short high-contrast monospace
lines: the site version, the document slug and hash, a clock (which joins each screenshot
to the recording's own timeline), the current selection, the layout and look, the sources
that are on, the explore state and any hidden edge kinds, the visible counts, and **the
last action taken** ("last: gpeaks→1", "select connectivity"), which is the line that
disambiguates "this" and "here" in a narration. The same truth is published as
`window.__uniState()` for any tool that does gain programmatic access, so pixels and API
can never disagree. The suggested tool-side half: teach the cleanup model that when a
capture contains the state pane, it should transcribe it into a per-moment `state` field
in `session.json`, which closes the loop the follow-on opened.
