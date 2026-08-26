# 10 · The founder's craft

*After this chapter you will know what to say to an agent, in what shape, and you will
have five habits from a person who steered eleven build rounds in six days without
writing a line of code.*

---

This chapter is the one that transfers most directly, because it is about the half of the
loop a person does.

Nineteen briefs and eighty-eight release notes are a large sample of one person
instructing an agent. Read as a set, they have a consistent style, and the style is
learnable. Five habits do most of the work.

---

## 1. Point at a thing, then say what is wrong with it

Almost every instruction in this corpus is attached to a specific object on a specific
screen.

> when I open up the the tignogen graphs, the graph it doesn't fit. It's not in a fit
> state. So we should literally you should run the fit here

> the graph options gear was only visible after scrolling to the very top

> The screenshot shows the wire running from L2 resolve straight to L4 bind

Compare that with the kind of instruction that produces nothing useful: "the graph view
needs work", "make the navigation better". The corpus contains essentially none of these,
and the difference is not politeness or precision of language. It is that a located
complaint contains its own test. An agent can tell whether it has fixed "the graph opens
unfitted". It cannot tell whether it has fixed "needs work".

The strongest form is a screenshot plus a sentence, which is exactly what the narrated
review of Chapter 8 industrialised: ten screenshots, three and a half minutes of talking,
six findings.

## 2. Say the principle, not only the fix

The most valuable memos in this corpus contain a rule alongside the request. Brief 26,
about fixed nodes, produced the line that the retrospective calls the era's deepest design
law:

> Every node move costs the viewer their mental picture

That sentence is not an instruction. It is a principle from which a dozen instructions can
be derived, and the agent derived four mechanisms from it across four releases: stable
add, never moving the viewport uninvited, pinned summits, alignment rails.

The same shape appears elsewhere. Brief 22's instruction 4, in the founder's own words:

> I want you to start thinking in terms of sources of nodes to add. So it's almost like not
> necessarily a view, but sources that we adding to the thing

That is a reframing, not a feature request. "Views" and "sources" imply completely
different architectures: views are a fixed list somebody maintains, sources compose. The
whole node-pack design comes from that one sentence.

An agent will implement a feature request accurately and narrowly. Give it the principle
and it will apply it in the places you did not think of.

## 3. Name the reference

Twice in this period the founder handed the agent a name instead of a specification, and
both times it produced more than a specification would have.

At v0.4.35 he named Bret Victor's talk *Inventing on Principle* as the experience the
viewer was aiming at. The agent went and looked, found that half the viewer's strongest
features were already unwitting implementations of Victor's patterns, and wrote a standing
register mapping the patterns to the releases, with two fully specified gaps any future
agent can pick up.

At v0.5.9, in brief 37, he wrote:

> Basically think : what would Brett victor do to explain and visualise what this code is
> going (to an audience that knows what JS is, so no need to explain what a variable is)

Two useful things in one bullet: a reference for the standard, and a statement of who the
audience is not. "No need to explain what a variable is" removes an entire register of
output the agent would otherwise have produced.

Naming a reference is high-bandwidth. It transfers taste, which is the thing hardest to
write down.

## 4. Ask "does this make sense, any questions?"

The corpus is full of the agent's questions, because the founder keeps asking for them.
Every brief in `v2/briefs/` ends with a numbered list of the questions the agent owes
answers on, and that section exists because it is asked for.

This matters more than it sounds. An agent that is never asked for questions will not
volunteer confusion; it will resolve ambiguity silently and plausibly, and you will find
out which way it resolved when you see the result. An agent that knows it will be asked
writes the ambiguity down as it goes.

The founder's answering pattern is also worth copying: he answers in batches, on his own
schedule, and each answer ships. Brief 26's four questions came back answered and all four
shipped in one release, v0.4.29, whose note opens "The founder's four answers, applied".
Brief 38's two held questions were answered the same evening and reshaped an entire
handoff.

The queue works because the questions are written down in a file with a URL, rather than
being asked in a conversation that scrolls away.

## 5. Praise the specific thing, then correct

The corpus's verdicts are recorded before the corrections, deliberately. Brief 33's header
carries the line "Verdict recorded first: 'this is looking really good.'" Brief 32's
carries "this WORKED really WELL … you did a great job at those first transformations,
which now we can add more and tweak."

The praise is not decoration and it is not, in any meaningful sense, for the agent's
feelings. It is information. "You did a great job at those first transformations, which now
we can add more and tweak" tells the agent that the transformation layer is settled and
the work is now additive. Brief 20's cancellation of an entire plan opens with "the brief
is amazing, right? Like it's really cool", and then names the six of ten files that have
to change. The praise is the boundary of the correction.

An agent given only corrections will over-rotate, because it cannot tell which parts of
its work survived.

---

## What he did not do

Five absences from this corpus are as instructive as the habits.

**He did not write code.** The record contains no instance of the founder editing a
source file. The two places where he made a technical decision, moving rather than copying
the first edition at v0.4.0, and deleting the 108 redirect stubs at v0.4.7, are structural
calls, not implementations.

**He did not write specifications.** There is not one document in the second edition's
corpus written by the founder in advance of a build that specifies behaviour. The only
planning document in the whole period, the ten-file dev pack at v0.3.27, was written by
the agent and largely cancelled by the founder's response to it.

**He did not review code.** He reviewed running software, on his own devices, with real
data. The iPad round of v0.4.26 found two bugs no code review would have surfaced.

**He did not accumulate feedback.** Twenty releases on 24 August means feedback arriving
roughly every thirty minutes. The v0.4.9 note begins "Founder feedback on using v0.4.8, all
of it acted on", twenty-nine minutes after v0.4.8. Batching feedback into a weekly review
would have made every one of those rounds worse, because the agent would have been three
days downstream of the thing being reviewed.

**He did not mediate between the two agents.** He commissioned the exchange in Chapter 6
and let them write to each other.

---

## The trade this represents

Put the five habits together and the founder's job is: decide what matters, look at the
real thing often, say precisely what is wrong with a specific object on the screen, supply
the principle behind the fix, and answer the questions that come back.

That is a substantial job and it is not a passive one. Two of the six days ran past
fourteen hours. But it is a different job from the one an author normally does, and the
difference is worth naming: **almost none of it is production, and almost all of it is
judgement.**

The parts of writing a book that a person is uniquely good at, deciding what the book is
for, noticing when something is subtly wrong, knowing which of two right answers is the
one you meant, are exactly the parts this arrangement leaves with the person. The parts
that are laborious are the parts it moves.

That is the case for the method, stated as strongly as the evidence allows. Chapter 12
states the case against.

---

**Where the live estate shows this.** All nineteen memos are at `/v2/memos/`, each with
its instruction table and its questions. The immediate-connection register, which is what
came of naming Bret Victor, is at
`/v2/dev-pack/design-00-the-victor-register.html`.
