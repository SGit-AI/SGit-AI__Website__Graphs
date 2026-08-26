# 3 · Briefs as the contract

*After this chapter you will know exactly what to put in the file you write after each
conversation with your agent, and why the raw transcript belongs above the tidy summary
rather than instead of it.*

---

## The rule

When the founder of this project says something, the exact words go into the repository
before anything is built. Not a summary of them. Not an action list derived from them.
The transcript, with its errors in place.

Underneath the transcript, the agent writes its reading: a numbered table of what it
understood each instruction to be and what that instruction commits the work to. The
table is labelled as the agent's, in the file, every time. Then a short list of the
questions the agent cannot answer on its own.

That structure has three parts and the order is the whole trick:

1. **The source.** Verbatim, immutable, wrong in places.
2. **The reading.** The agent's interpretation, clearly attributed to the agent.
3. **The questions.** What the agent guessed at, flagged so the guess can be corrected.

Nineteen of these exist for the second edition, briefs 20 to 38, running to 37,808 words.
Twenty-two more exist for the first. They are all published, all rendered as web pages,
all linked from the release notes that acted on them.

## What a brief actually looks like

Here is the header of brief 22, which is a voice memo about the graph viewer:

> **date** 24 August 2026 · **kind** founder voice memo, transcribed by otter.ai,
> reproduced **verbatim** below including transcription artefacts. The instruction table
> and everything after the quote is the agent's reading, and is marked as such.

Then about 2,700 words of unbroken speech. Here is a representative sentence, exactly as
published:

> A couple of little bugs is what I meant by the the box, and it's you know makes sense.
> It just maybe my brief wasn't clear. I'm not saying putting a box, rounded box around
> the label text underneath the circle, the the dot. I'm saying replace the shape instead
> of being a circle to be actually the box with a label inside of it because I think that
> makes it easier to read, and that means that when I'm reading stuff, I'm not. I don't
> have to find the dot, read down. Find the dot, read down.

Then the agent's table, whose second row reads:

> | 2 | Boxed labels: not a box under the dot; **replace the shape**: the node becomes the
> box with the label inside it | The boxed mode restyles nodes as label-sized rounded
> boxes, read directly and clicked directly, no dot-then-label eye movement. |

And then, in the same file, four questions the agent could not resolve. Question 3:

> **The exhibits edge.** The extraction records `graphs-of-graphs exhibits
> fractal-principle` (anchored to "At every level, the same principles apply"). Is the
> complaint about the direction of the fact, or about how the drawing renders direction?
> If the fact is wrong, the fix is one anchored edit in the extraction.

Notice what that question does. The founder said an edge read wrongly. There are two
completely different repairs depending on what he meant: change the data, or change how
the picture draws direction. The agent does not pick one and hope. It states both, says
which it would do in each case, and asks.

## Why verbatim

The obvious objection is that a transcript is worse than a summary. It is longer, it is
full of noise, and the important content is a fraction of it. All true. Keep it anyway,
for four reasons.

**It preserves the correction.** Read the quote above again. "It just maybe my brief
wasn't clear. I'm not saying putting a box, rounded box around the label text underneath
the circle. I'm saying replace the shape." That is a person correcting a previous
misreading in real time. A summary records the conclusion, "boxed labels replace the node
shape", and loses the fact that a plausible reading was already tried and was wrong. The
next agent, or the same agent next week, will make the same mistake, because nothing in
the record says it is a mistake.

**It preserves the reasoning you did not know was reasoning.** In brief 34, explaining
why the word "graph" needs multiple senses, the founder says: "the reason why I called
network graphs… a graph is connected to a network, is connected to nodes and edges, is
connected to mathematics". That is an aside inside a longer instruction. It is also the
justification for putting the document's own sense first in every sense list, which is
now a rule in the shipped code. A summary of that memo would have kept the instruction
and dropped the aside.

**It makes paraphrase drift visible.** This is the important one. If the only record is
the agent's summary, then the agent's misunderstandings are invisible, because the record
and the misunderstanding are the same document. With the transcript above and the reading
below, the two can be compared by anyone, including by the founder skimming the rendered
page on his phone. Brief 22's own header does exactly this, listing the garbles it had to
resolve: "tignogen graphs" is thinking-in-graphs, "doctrine/doctree" is the doc tree,
"Dinis or dictionaries" is likely "the claims or the dictionary". Those resolutions are
guesses. They are printed as guesses.

**It stops the instruction getting easier.** An agent that has interpreted a hard
instruction into an easy one has no incentive to notice. The verbatim text is the check.
The retrospective written at v0.5.0 puts it in one line:

> the verbatim capture meant no instruction was ever paraphrased into something easier to
> build

![The memos hub at v0.5.11: nineteen founder memos, each rendering its own raw markdown.](figures/19__v0.5.11__the-memos-hub.png)

*Figure 4. `/v2/memos/` at tag `v0.5.11`, 26 August 2026.*

## The reading is not optional either

Verbatim capture on its own is a pile of transcripts. What makes a brief usable is the
table underneath, and the table has a specific shape worth copying.

Two columns: what was said, and **what it commits the work to**. Not "what to do". What
it commits the work to. The difference matters. "Add a reset button" is a task. "A reset
control that clears the selection, filters, sizes and stored preferences for the
document" is a commitment: it says what state is in scope and, by omission, what is not.
When the founder later asks why reset did not clear something, the table is the record of
what reset was agreed to mean.

The table also lets the agent be honest about scale. Brief 22's row 11 ends:

> **Needs the founder's confirmation of the semantics before building** (question 1
> below).

One of twelve rows is marked as blocked. The other eleven were built the same day. That
is a much better outcome than either building all twelve on a guess or stopping the whole
round to ask.

## The questions are where the trust lives

Every brief in this corpus ends with the questions the agent owes answers on, and most of
them also record the defaults the agent took while waiting.

Brief 32, which is reproduced complete and annotated in Appendix A, ends like this:

> 1. **Placement**: right-side pane on desktop, below the columns on a phone — taken as
>    the default the memo suggested; easily moved.
> 2. **The diff baseline** is the previous run in this page session (not persisted), which
>    matches the pic1-to-pic2 gesture; a pinned-baseline compare ("diff against THIS run")
>    is a natural follow-up if wanted.
> 3. **The example set** was picked by the agent to walk the connectivity gradient and
>    includes the founder's own "meaning through nodes and graph sausages" verbatim,
>    unknown word and all, because it demonstrates honest failure. Swap any of them by
>    saying so.

Three decisions the founder never made, each shipped, each labelled, each with the way to
reverse it. That pattern, decide and disclose rather than ask and wait, is what lets the
loop run at thirty minutes. Asking would cost hours of latency. Deciding silently would
cost trust. Deciding and printing the decision costs a paragraph.

The founder does answer, eventually and in bulk. Brief 26's four questions came back
answered and each answer shipped in v0.4.29, in one release. Brief 38's two held questions
were answered the same evening and reshaped the whole handoff. The queue works because the
questions are written down where he can find them.

## The failure mode nobody warns you about

There is a specific way this goes wrong, and it is visible in the corpus.

A voice memo is a stream. It contains instructions, asides, jokes, corrections of things
said thirty seconds earlier, and thinking-out-loud that the speaker would not endorse if
you read it back. The agent has to sort those into "build this" and "note this", and it
will sometimes get the sort wrong in the expensive direction: building a musing.

The corpus handles this by having a third category. Here is the release note for
v0.5.6, saying in public what it did with the rest of brief 35:

> The rest of the memo is recorded in the brief as direction with questions back:
> ask-a-document (bring a graph TO a document and hear agree, disagree, evidence — queued
> on the document fan-out), corrections as first-class training artefacts, the 2D layer
> warm-up map with exact lines, and LLM-in-the-loop layers made safe by the schema
> contract because graph-in and graph-out are both kept as evidence.

Four ideas from one memo, all interesting, none built, all recorded as direction. Brief
32's row 6 does the same and labels itself: "Read as the direction, recorded not built".

If your brief only has two categories, built and not-mentioned, then every idea in every
memo is either work or waste. The third category, recorded as direction, is what lets a
person think out loud safely.

## What to copy

If you do one thing from this book, do this:

- After every conversation with your agent about what to build, put the raw text of what
  you said in a numbered file in the repository. If you spoke, put the transcript in with
  its errors.
- Have the agent write, in the same file and under a heading that says whose reading it
  is, a numbered table of instructions and what each commits the work to.
- Have it list, in the same file, every question it could not answer and every default it
  took anyway.
- Never edit the transcript. Add to the file, never rewrite it.
- Reference the brief number in whatever your release note is. The corpus does this in
  every release note: "Brief 31", "Brief 36, the founder pointing at the document's file
  explorer".

The cost is about ten minutes per round. The return is that six days later somebody can
reconstruct not only what was built but what was asked for and where the two diverged,
which is precisely the thing that normally survives nowhere.

---

**Where the live estate shows this.** Nineteen briefs at `/v2/memos/`, each rendering its
own raw markdown from `v2/briefs/`. The first edition's twenty-two are at `/v1/briefs/`.
Brief 22, quoted throughout this chapter, is at
`/v2/memos/22-founder-memo-universe-viewer.html`.
