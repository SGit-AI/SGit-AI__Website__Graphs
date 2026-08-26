# 11 · The playbook

*This chapter stands alone. It is written so it can be torn out, printed, or pinned up
without the rest of the book around it. Everything in it is drawn from the six days
described in Chapters 1 to 10, and every claim has a chapter behind it.*

---

## Before you start: what this is and is not

This is a way of writing a book, or any large structured document, in which an AI agent
does the production and you do the judgement. It assumes:

- you are willing to run a git repository, or to let the agent run one for you;
- you can review a working artefact rather than a draft;
- you want the process to leave a record you can check afterwards.

It does not assume you can program. It does not require a graph database, or any database.
The system this playbook is drawn from stores everything as markdown files and JSON files
in a git repository.

---

## Day 0: set up five things

Set these up before you write anything. In the project this book describes, the pipeline
shipped as release v0.1.0 before there was a single chapter, and that ordering is the
reason the next eighty-seven releases were possible.

### 1. A repository with one release branch

One branch that is the published one. Every change lands there. No long-lived feature
branches: in six days and ninety-seven commits, this project had three merges total.

### 2. Automatic validate, tag and deploy

A push to the release branch should run your checks, and only if they pass, tag the commit
and publish. No manual release step. The consequence, worth having, is that every version
of your book that ever existed is recoverable by name forever. Every figure in this book
was re-taken from a tag.

### 3. Seven checks to start with

Do not design a test strategy. Copy these, adapt the ones that apply:

1. **Version agreement.** One file owns the version number; everything that displays it
   must match.
2. **Internal links.** Every link and image path resolves to a file that exists.
3. **Canonical addresses.** Every page declares one canonical URL and it is right.
4. **Structural completeness.** Every section of your work is listed in whatever index
   you maintain, in both directions.
5. **A vocabulary tripwire.** Pick the one word or construction your project has banned
   and fail the build if it appears. This project bans a vague relationship name,
   `relates-to`, and permits it only where a page is quoting the ban.
6. **A secret tripwire.** Nothing in the tree may look like a key or a token.
7. **A structural balance check.** Something cheap that catches the class of error your
   format allows silently. This project counts opening and closing `<div>` tags, after
   four pages shipped with a note element closed by the wrong tag and browsers accepted
   it silently.

Add the eighth check the first time something goes wrong. That is how this project got
from seven to sixteen.

### 4. A briefs folder

`briefs/`, numbered files, one per instruction round. See Day 1.

### 5. A release table

A page listing every release: version, date, and a paragraph on what changed. Prose, not
commit messages. This will become the most useful artefact you own. Six days later it is
the only reliable account of what happened, because unlike a commit log it was written by
somebody who knew why.

---

## Day 1: your first memo

Talk, do not type. The nineteen briefs behind this book are mostly transcribed voice
memos, and they are richer than typed instructions because people say more when they
speak.

Record while using the thing, not while thinking about it. Every memo in this corpus was
recorded with the deployed site open.

**What to say, in this order:**

1. **The verdict, first.** "This worked really well" or "this is not right". Say which
   part is settled. It tells the agent whether the next work is additive or corrective.
2. **The specific complaints, each attached to an object.** "When I open X, Y does not
   happen." Point at things. If you can send a screenshot, send one.
3. **The principle behind the complaint, if you have one.** "Every node move costs the
   viewer their mental picture" was worth four releases. A principle is worth ten feature
   requests.
4. **The direction, marked as direction.** Say out loud the things you are thinking about
   but do not want built yet. Ask for them to be recorded, not built.
5. **The question.** "Does this make sense, any questions?" Ask every time.

**What to do with the recording:**

Have the agent write a file, `briefs/NN__whatever.md`, with three parts in this order:

- the transcript, verbatim, including the transcription errors, never edited afterwards;
- the agent's reading: a numbered table of every instruction and, in the second column,
  **what it commits the work to** (not what to do: what is now in scope and, by omission,
  what is not), under a heading that says whose reading it is;
- the questions the agent could not answer, and the defaults it took anyway, each with the
  way to reverse it.

Then reference the brief number in the release note when the work ships.

Ten minutes per round. It is the highest-return habit in this book.

---

## The loop, in five steps

Run this as often as you can stand.

1. **Record a memo while using the current version.**
2. **The agent publishes it verbatim, with its reading and its questions.**
3. **The agent builds, and writes the release note as part of the build.**
4. **The push runs the gates; if they pass, a machine tags and deploys.**
5. **You open the deployed thing and start again at 1.**

Target: one round in under an hour. This project's median gap between releases was 31
minutes over six days. You will not do that, and you do not need to. What matters is that
a round is short enough that you review the real thing rather than a memory of it.

---

## Rules that make it work

**Never edit a transcript.** Add to the file. Do not rewrite it. The transcript is the
only independent record of what you asked for, and if the agent can edit it, it is not
independent.

**Every bug you find becomes a test before the release ships.** When the founder found two
bugs on an iPad, that release added seven checks that would have caught them. You should
not have to find the same class of thing twice.

**Corrections get a release, not a silent edit.** When something in your published work is
wrong, fix it in a release with a row in the table saying what was wrong. The project's own
rule, from its second day.

**Record debt in public.** One component in this project grew from 202 lines to 434
against a stated budget of 250. Every release that grew it said so, and the remedy was
named. Debt you have written down behaves completely differently from debt you have not.

**State the third category.** Built, not-mentioned, and *recorded as direction*. Without
the third one, every idea you say out loud is either work or waste, and you will stop
thinking out loud.

**Give experiments their own folder.** And name the exit at the start: "do this in
separate code, so that we can then figure out how to bring this back."

**Put the state in the pixels.** Every interactive page should have a switchable panel
printing the version, the current selection and the last action taken. It costs an
afternoon and it makes every screenshot you ever send diagnosable.

---

## What to expect to go wrong

From Chapter 7, in the order you will meet them.

**Your agent's tests will pass and the thing will still be broken.** Automated
verification tests what somebody thought to test. Use the real thing, on a real device,
with real data, regularly. Two of this project's best bug reports came from an iPad
session, and one from scrolling a page sideways.

**Your verification tools will lie to you.** A stale process holding a port cost this
project an hour of debugging code that was already correct, deterministically. If a
stubborn failure is fixed by killing a process, that is a finding about your harness.
Never reuse a port between runs, and always kill what you spawned.

**Your agent will write clean generalisations that more data breaks.** The remedy is to
compute your claims on every build so the next batch of evidence breaks them out loud
instead of quietly.

**Your agent will build the thing you were musing about.** Hence the third category.

**Two agents will collide.** Give each one a tree of files it owns and forbid it from
touching another's; have every agent fetch the release branch and tags before choosing a
version number; and when one has comments about another's work, have it write a document
addressed to a peer rather than silently refactoring.

---

## Signs the loop has stalled

- **The gap between releases is growing.** Something has become expensive. Usually it is a
  missing gate: the agent is hand-checking things.
- **Your memos are getting longer and less specific.** You have stopped using the thing and
  started theorising about it.
- **The agent has stopped asking questions.** It is guessing. Ask for the questions
  explicitly, every round.
- **Release notes have become one line.** Nobody will be able to reconstruct this week.
- **You are reviewing plans rather than software.** The plan is not the product, and a
  plan reviewed is a plan that has consumed a round without producing evidence.

---

## The honest costs

Read Chapter 12 for the full version. In brief:

- **This is not passive.** Two of the six days behind this book ran past fourteen hours of
  releases. The method does not require that pace, but it does require your attention
  every round, and the attention is judgement, which is tiring in a different way from
  production.
- **You will ship things you have not fully read.** That is what the gates are for, and it
  is still true.
- **You will produce more infrastructure than book.** In six days this project produced an
  entire working surface for writing its second edition and none of its chapters. That was
  a deliberate choice, taken on day three, and it was the right one, but if what you want
  is chapters by Friday this is the wrong method.
- **The record is public and permanent.** Everything in this playbook assumes you are
  willing to publish your failures on the day they happen. If you are not, most of the
  benefits go away, because the value of the record comes from it being honest.

---

## The one-page version

1. Pipeline before prose: repository, gates, automatic tag and deploy, on day zero.
2. Talk while using the thing. Point at objects. Give the principle.
3. Transcript verbatim, then the agent's reading, then the questions. Never edit the
   transcript.
4. Ship small and often. Every release gets a paragraph saying what changed and what was
   verified.
5. Every bug a human finds becomes a test that day.
6. Record debt, corrections, and directions-not-built in public.
7. Experiments get their own folder and a named exit.
8. Suspect your harness as much as your code.
9. Ask "any questions?" every round, and answer them in batches.
10. Keep the tags. They are how you check, later, that any of this was true.
