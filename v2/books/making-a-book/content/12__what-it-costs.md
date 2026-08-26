# 12 · What it costs, and where it loses

*After this chapter you will know four situations in which the method in this book is the
wrong one, what it charges that nobody mentions, and what the six days did not produce.*

---

## What was not produced

Start with the largest fact, because it is the one most likely to be glossed over.

In six days and eighty-eight releases, this project did not write any of the second book.

Not one chapter. The `/v2/` tree at v0.5.11 contains an extraction pipeline, a document
reader, a core graph, an identity ledger, a deterministic transformer with twelve
operators, a file explorer, nineteen briefs, thirty-five registered methods, a
retrospective, and three empty book folders. It contains no prose of the book it exists to
produce.

This is not a hidden failure. It is what the founder asked for on day three, in brief 20,
in these words: build all the reference material first, decompose it, and only then draw
the plot lines. The retrospective closes the v0.4 era saying the same thing in the agent's
voice: "The surface is built; v0.5 is what gets made with it."

But it is a cost, and it is the cost you should weigh first. If your deadline is Friday
and what you need is chapters, this method will hand you a very good machine and no
chapters.

## What was extracted

The second fact of the same shape. The universe names twenty-one source documents. One has
been extracted.

The retrospective says so plainly, under a heading that reads "Observations, held loosely":

> One document is extracted; twenty wait. Every mechanism built this era (folders, gates,
> shards, ledgers, graph pages) was designed to fan out without redesign. v0.5 finds out.

At v0.5.11, v0.5 still has not found out. The fan-out has not happened. Everything in
Chapter 5 and Chapter 9 is built on a single pilot document, and the claim that it
generalises across twenty more is a design intention with good evidence behind it, not a
demonstrated result.

Where the corpus is silent, this book says so, and here it is silent.

## The costs nobody mentions

### Attention, not time

The obvious cost is hours, and the hours were real: two of the six days ran past fourteen
hours between first and last release, and one spanned twenty-two.

The less obvious cost is the shape of the attention. Every thirty minutes, something
arrives that requires a judgement: is this right, is this what I meant, is this good
enough to build on. There is no long stretch of unbroken making, because the making is
being done elsewhere. Some people find this energising and some find it exhausting, and
the difference is worth knowing about yourself before you commit six days to it.

The method does not require this pace. Nothing in the loop breaks if a round takes a day.
But the loop is only as good as the review at the end of it, and the review is the part
you cannot delegate.

### You will ship things you have not read

At twenty releases a day, nobody reads every line. This project's answer is the gates:
eighty-four unit tests, sixteen validator checks, byte-identical rebuild proofs, replayed
example vectors. Those catch a great deal.

They do not catch everything, and the honest statement is that this method involves
publishing work you have not personally verified line by line, on the strength of
machine checks and the fact that you looked at the result. If that is unacceptable in your
domain, this pace is unacceptable in your domain.

### The record has to be public to be worth anything

Most of the value in this book comes from the record: the verbatim briefs, the honest
release notes, the debt written down, the hour lost to a zombie browser reported the same
day.

That record is only useful if it is honest, and it is only reliably honest if it is
public. A private log of your own failures is a log you will edit. The line "the round also
burned an hour on a lesson worth recording" was written into a public table by an agent
who knew it would be read.

If you are not willing to publish the failures, you will get a much weaker version of
this method, because the incentive that keeps the record straight will be missing.

### Debt accumulates in the open, which is not the same as not accumulating

The component that draws the graph went from 202 lines to 434 against a stated budget of
250, over roughly two days, and was still at 434 at v0.5.11. Every release that grew it
recorded the growth. The remedy was named at v0.4.13 and has not been carried out.

The retrospective's framing is "honest debt beats hidden debt", which is true. It is also
true that the debt is still there. A public record of a problem is not a solution to it,
and a method that makes it easy to record debt makes it easy to keep recording debt.

### The version number is not a measure of anything

Eighty-eight releases sounds like a lot, and some of them are one button label. Release
count measures the granularity of your release process, not the amount of work. It is a
useful number for understanding the cadence and a misleading one for understanding
output. The word counts, test counts and file counts in this book are more honest
measures, and they are all in Appendix B and Appendix C, computed rather than recalled.

---

## Four situations where you should do something else

The first edition of the book this project is writing has a page about where its own
argument loses. The same courtesy applies here.

### 1. Your book has a fixed, known shape

If you already know the chapters, the order, and roughly what each says, the whole
apparatus in this book is overhead. Build the universe first is advice for the case where
you do not yet know what the book is. If you do know, write it: an agent will still help
enormously with the production, and you need one branch, one gate on links, and a release
table, not twelve operator folders.

The tell: if brief 20's complaint, "we are already defining the answer before we know what
questions we're answering", does not describe a real risk for you, you are not in this
book's situation.

### 2. You cannot publish the working record

Confidential material, an unfinished argument you are not ready to be seen holding, a
publisher who wants an exclusive. If the transcripts and the failures have to stay
private, most of the discipline this book describes stops being self-enforcing, and you
should expect the record to drift towards flattery.

### 3. You are not going to look at the output every round

The loop's quality comes entirely from step 5. An agent shipping every thirty minutes to
nobody produces a large quantity of confident, plausible work in a direction nobody
checked. That is worse than slow work, because it is expensive to unpick and it looks
finished.

If you can only review once a week, slow the loop to once a week. Do not let it run
without you.

### 4. The work is mostly a single act of judgement

Some books are one argument, made once, that either lands or does not. Poetry. A short
polemic. A memoir whose value is in the voice. The method in this book is built for work
with a lot of structure and a lot of evidence, where the labour is in organising and
checking rather than in composing. Applied to a book whose whole value is one person's
sentences, it will produce a large amount of machinery around a thing that did not need
any.

---

## What it does buy

Against all of that, the honest positive case, stated in the terms this book has used
throughout.

**Six days of work with a complete, checkable record.** Every claim in this book was
verified against the repository. Every screenshot was re-taken from the tag its caption
names. That is not normal. Most projects, six days later, cannot tell you why a decision
was made.

**A rate of correction that changes what you can attempt.** When being wrong about a design
question costs thirty minutes, you ask different questions. "Meaning without connectivity"
was tested by running it, not by arguing about it. That is worth more than the speed
itself.

**Judgement concentrated where it belongs.** The founder spent six days deciding things and
none of it typing. The parts of the work that are uniquely human, knowing what the book is
for, noticing something subtly wrong, choosing between two right answers, are exactly the
parts the arrangement leaves with the person.

**Infrastructure that compounds.** Thirty-five techniques, each used in earnest before
being written down, each naming the release where it first shipped, and the superseded
ones still listed with their supersession recorded. That register is worth more on day
thirty than on day six, and it exists because writing it down was part of the loop rather
than a task for later.

---

## The honest summary

This method produced, in six days: a working surface for writing a book, an unusually good
record of how it was made, and no book.

Whether that is a success depends entirely on whether you agree with the decision taken on
day three, which was to build the universe before finding the plot. The founder's argument
for it is in brief 20 and it is a good argument. It is also a bet, and at v0.5.11 the bet
has not yet paid out.

This book's own position, marked as the writing agent's judgement: the bet is sound for a
book of this kind, where the material already exists and the difficulty is finding the
story in it. It would be a bad bet for most books. And the parts of the method that are
unambiguously worth stealing, the verbatim briefs, the gates, the honest release notes, the
state pane, every-bug-becomes-a-test, are worth stealing regardless of which way you bet.

---

**Where the live estate shows this.** The first edition's own account of where its argument
loses is at `/v1/about/participant.html`. The v0.4 retrospective, including the
observations held loosely, is at `/v2/dev-pack/retro-00-the-v04-retrospective.html`. The
three empty book folders are at `v2/books/`, each carrying its own commissioning prompt.
