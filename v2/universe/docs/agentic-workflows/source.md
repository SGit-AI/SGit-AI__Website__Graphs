# Agentic Workflows: How You Operate

**A reference document on what a workflow is, what changed in 2026, and how to tell a
mature workflow from an unfinished one.**

Written from the founder's memo of 28 August 2026, published verbatim in this repository
at `v2/briefs/45__founder-memo__what-a-workflow-is.md`. Companion to *Thinking in Graphs:
Meaning Through Connectivity*, which is about how meaning is represented. This one is about
how work is done.

## What This Document Is

This is a source document, and it is a projection of a spoken memo rather than a
transcript of one. The founder said what a workflow is; this document arranges what he
said, connects it to the record of a repository that has been running one, and states the
principles plainly enough to be argued with.

That makes its provenance worth stating before anything else. The memo is the source
material. This prose is an interpretation of it, produced by an agent, and interpretation
is a one-way door: you cannot mechanically recover the memo from this document. Every
claim below that comes from the founder carries his words. Every claim that does not is
the agent's reading, and is marked where it matters.

The document is deliberately mundane about its subject. A workflow here is not a diagram,
a product category or an automation platform. It is how you operate.

## Part 1: A Workflow Is How You Operate

### The Definition

A workflow is the set of steps you actually take to get something done. In the founder's
words: "what I call a workflow is fundamentally is how you operate. You know, is the the
steps that you have". Nothing in that definition requires software, automation or an
agent. A workflow you have never written down is still a workflow, and it is usually the
one governing your day.

This is a deliberately low bar, and the low bar is the point. Reserving the word for
automated pipelines hides the fact that everyone already has one, which in turn hides the
question that matters: is yours the one you would choose?

### Three Workflows for Writing a Book

The same task, done three ways, shows how much of the outcome the workflow decides.

The first is the ordinary one. You open a word processor, you write, you save, you send
the file to somebody else. The document is a binary blob, the history is a list of
autosaves, and a change is something you do by hand and hope you did consistently.

The second is markdown with a build attached. You edit plain text, you press save, and a
pipeline turns the text into a PDF. This is the workflow the founder used on Leanpub, and
he is precise about what it bought: plain text is "much easier to copy and paste, much
easier to diff". The build is the part that makes the text feel like a book rather than a
folder of files.

The third is the one this repository runs. A spoken memo becomes a verbatim brief, the
brief becomes work, the work becomes a validated and tagged release, and the release is
readable on a public page within the hour. Each of those steps is mechanical, most are
enforced by a gate, and the human step is the first one.

The three differ in ability, not in effort. All three authors work hard. Only the third
one can ask what changed between two versions and get an answer.

### The Workflow Decides What Questions You Can Ask

The interesting property of a workflow is not its speed. It is the set of questions it
makes cheap. A word processor makes *what does this look like printed* cheap and
*what changed since Tuesday* expensive. A markdown pipeline reverses that. A repository
with tagged releases makes *show me every version this paragraph has had* a command
rather than a project.

Choosing a workflow is therefore choosing which questions you will get in the habit of
asking, which over months decides what you notice about your own work.

## Part 2: What Changed in 2026

### Four Things a Workflow Can Now Change

The founder's claim about this moment is narrow and testable: "the power in 2026 with this
agentic world. Is actually the agentic workflows that we can have, which is the workflows
that allows us to change the tooling and to change the visualisation and to change the
comprehension and to change the context."

Four things, and they are worth separating because they fail differently.

**Tooling** is the scripts, generators and gates that do the work. This has been
changeable for decades; what changed is the cost of a small one-off tool, which has fallen
far enough that writing a throwaway script is now cheaper than doing the task by hand
once.

**Visualisation** is how the work is shown back to you. A table, a graph, a diff, a page.
This is the change most often underestimated, because a view is not an output: it is an
instrument, and a new instrument routinely finds an error nobody was looking for.

**Comprehension** is what the system can be asked to understand rather than merely
transform. Summarising a corpus, naming what a document is about, noticing that two
sections disagree.

**Context** is what the worker, human or agent, has in front of them at the moment of
deciding. Assembling the right five files and the right three quotes is now something a
workflow can do, and it used to be the whole job.

### The Purpose Is the Zone

None of the four is the goal. The goal the founder names is a state of attention: to
"allow the author to stay in the zone". A workflow earns its keep when it removes the
interruptions that break concentration, and a workflow that adds a step to be more
correct has to pay for that step out of the same budget.

This is why speed alone is a poor measure. A pipeline that halves the wall-clock time but
demands attention at three new points is a worse workflow for an author, and a better one
for a machine.

### Agentic Is Not the Same as Automated

An automated workflow does the same thing every time and is valuable exactly because it
does. An agentic workflow is one where part of the work is done by something that
interprets. The difference is not degree, it is kind: an automated step can be verified by
replaying it, and an interpreting step cannot.

The practical consequence is that agentic workflows need a boundary drawn through them,
and Part 5 is about where to draw it.

## Part 3: The Villager and the Explorer

### Two Phases, Not Two Kinds of Person

The founder distinguishes the person consuming a workflow from the person changing it:
"The villager phase consumes stuff. The explorer also will create workflows. Will
customise workflows. Will fine-tune the workflows".

He says *phase* both times, and the word is load-bearing. This is not a taxonomy of
people. The same person is a villager on the days they are producing and an explorer on
the days they are sharpening. Treating it as a personality type produces the wrong
conclusion, which is that some readers should be given a lesser version.

### Skill Changes Reach, Not Route

What experience changes is how far into the workflow you can reach: "depending on your
programming skills and depending on your programming ability and experience in developing
and experience in engineering, you can have more or less impact on the workflows that you
have".

It does not change the route. The founder is explicit that the steps are the same for
everyone: "sometimes the difference between somebody with more or less experience is just
that they consume materials faster, but they still go to the same steps".

This has a direct consequence for anything written to teach a workflow. One account of the
work serves both audiences, at different reading speeds. Writing two versions, a simple one
and a real one, solves a problem that was not there.

### The Explorer Trigger Is a Manual Step

Nobody should be looking for workflow improvements continuously; that is its own way of
never finishing anything. The founder describes the trigger as a noticing rather than a
schedule: "I'm doing something that is actually quite manual. I'm doing something that it
can be done better, so I allow myself to go into that explorer mode".

Two words in that sentence carry the discipline. *Allow* means the default is no. And the
signal is a specific felt thing, a step done by hand that should not be, rather than a
general sense that the tooling could be nicer.

### The Instinct Is Not to Change the Workflow

Stated plainly, and it is the opposite of how tool-building is usually described: "my
instinct is always not to change the workflow. My instinct is always, I want to be
productive".

An author who enjoys improving their tools will improve their tools instead of writing.
The defence is not willpower, it is having a trigger specific enough to be absent most of
the time.

### The Point of Diminishing Returns

Every detour is bounded by cost on both sides: "there's there's always a point of
diminishing returns here". The bridge analogy names the payback period the founder finds
acceptable: "you you want to cross a bridge, or when I cross something, and you you
realise, oh, I need a better tool to build this. I go, okay, let me go and build the tool.
Let me sharpen the saw", because "I believe that in two years, two hours, or two days from
now, I'm going to have a better saw or a better tool to do what I want to do better".

The spoken correction lands on hours and days. A tooling detour that pays back in two days
is worth taking mid-project. One that pays back in two years is a different project and
should be recognised as one.

## Part 4: Maturity Is When You Stop Changing It

### The Measure of Success

This is the sharpest idea in the memo and it is stated as a test: "the ultimate measure of
success is: Can I do a process without making any changes to the workflow? If I can do
that, that's a major success, and and that tells me that is always the metric that I take
on maturing, and that's how I know something's been productized or commoditized".

A workflow is mature when running it does not tempt you to change it. Note what the test
is not. It is not that the workflow is complete, elegant, documented or fast. It is that
it survived a real piece of work without needing to be touched.

### The Consequence for How Progress Is Read

The test inverts the natural reading of a busy period. A stretch of releases that each
changed the machinery is not the achievement; it is the price. The achievement is the run
of work where the machinery was left alone.

This is uncomfortable for anybody narrating their own tooling, because the changes are
visible and the not-changing is invisible. Any honest account of a workflow should
therefore report the stretches where nothing was improved, and treat them as the good
news.

### Maturing Is Not Finishing

Work can be left in a useful state without being complete: "we didn't finish all the
workflows that we were doing before, but we matured them to a point where now in here we
can now reuse some of them".

Parked is a legitimate state and is not the same as abandoned. A parked workflow has a
finding attached, a reason it stopped, and parts that other work has already reused. The
distinction is worth recording explicitly, because an unlabelled stop looks like a failure
to anyone reading later, including the author.

### Reusable Pieces Are the Unit

The founder's own analogy for how the pieces accumulate is a developer's: "If you think
about like development, you you create classes, you create structures, you create web
services, you create these reusable modules. That's kind of what I do, and that's kind of
how I think".

The test for a reusable piece is whether it can be lifted out. A step that only works
inside the workflow that grew it has not been matured, it has only been used.

## Part 5: Source Materials and Projections

### The Distinction

The founder holds one distinction above the others, stated in his memo of 27 August 2026
and published at `v2/briefs/44__founder-memo__the-leanpub-story-and-the-determinism-boundary.md`:
"I always have a very clear distinction between what is the source materials and what is a
transformation and a projection of those source materials".

Source materials are the things a human authored or a machine captured. Projections are
everything computed from them: rendered pages, PDFs, indexes, graphs, summaries. The
scaling rule follows from it: "one of the most important things for these workflow to
scale is to make sure that you always have a workflow where your source... your projections
are created from source materials plus transformation".

### Two-Way Doors and One-Way Doors

A projection is a two-way door when it is deterministic. Given the transformation, you can
walk back from the output to the input, or at least rebuild the output exactly and prove
nothing was lost.

A projection is a one-way door when something interpreted it. Prose written from notes is
the clearest case: "if you think about the creation of pros, it's a one way door. Right?
Because we don't come back from it."

The question to ask at every boundary is therefore not whether a step is automated but
"how how deterministic is the projection, and how interpretation is the projection?" Every
time a model enters the chain, that step becomes one-way, and everything downstream of it
inherits the property.

### Keep the Sources on the Deterministic Side

The rule that follows governs how a workflow should be laid out: "it's very critical that,
for example, the source materials and the source data is all in the sort of the
deterministic layer of this. And it's the source ones that gets projected".

Put the interpreted step as late as possible. If prose is generated from a graph, the
graph is recoverable and the prose is not, which is survivable. If the graph is generated
from prose, nothing upstream is recoverable, and the workflow has no floor.

### Where This Document Sits

This document is on the wrong side of that boundary, and says so rather than hiding it. It
is prose interpreted from a memo. The memo is the source material and remains published
verbatim; this document is a one-way projection of it, and its own decomposition into a
graph is a two-way projection of the prose.

That is the honest arrangement available: a one-way step, declared, with a deterministic
layer built underneath it.

## Part 6: A Workflow Leaves Artefacts

### Everything Gets a Folder

A workflow that produces scattered outputs cannot be reused, because there is nothing to
lift. The convention the founder asks for is that a subject gets a folder and the folder
holds everything about it: the source, the transformations, the extracted concepts, the
views.

The test is portability. If the folder can be copied into another repository and still
make sense, the workflow that produced it can be run somewhere else. If it cannot, the
workflow is entangled with the place it grew.

### The Chain Is the Product

When projections are built from sources by transformations, and transformations are
chained, the chain itself becomes the deliverable. In the founder's words: "it means that
you have a CI pipeline for the creation of the final product".

The consequence is that the final product stops being a file somebody produced and becomes
a thing the pipeline can produce again. That is the difference between having written a
book and being able to rebuild one.

### A Named Process Is Repeatable; a Described One Is Not

A step that is only ever described in sentences gets done slightly differently each time.
Naming it fixes it: the name becomes something a person can be asked for, a folder can be
stamped with, and a gate can check.

This is the smallest and most reliable improvement available to any workflow, and it costs
one decision.

## Part 7: Reading the Work Back

### A Diff Is a Workflow Step, Not a Feature

The ability to see what changed is part of how you operate, not an extra. Without it, a
review means rereading everything, which means reviews stop happening. The founder frames
it as a requirement of continuing: he has read one version, and what he needs now is the
delta, "the changes between the two versions of the book and between two particular
versions of a book".

### Why a Graph Diff Beats a Text Diff

A text diff compares lines. It is available immediately and it is "much more fragile",
because a reflowed paragraph, a renamed heading or a moved section all read as large
changes when nothing was said differently.

A graph diff compares identified things. If a sentence has an identity that survives
editing, then a diff can distinguish a sentence that was reworded from one that was
replaced, and can report a moved section as a move. The founder sets this as the bar:
"eventually should be a diff created from the graphs, right? Because you need the two
graphs, because you should be delting the diffs of the graphs, not of the markdown. That
would be the really test measurement of our success here".

The test is well chosen, because a graph diff is only possible if the decomposition is
stable, the identities carry across versions, and the graph for each version was kept.
Three things a workflow either did or did not do, exposed by one feature.

### Formatting Changes Are Findings

One benefit is named explicitly: working on the JSON structure "also allows to detect
things like formatting changes". Being able to say *this change altered presentation and
said nothing new* is useful in both directions. It tells a reviewer what to skip, and it catches a change that
was supposed to be presentational and was not.

## Part 8: The Loop, End to End

### One Round

The workflow this document was produced by is small enough to state completely.

A memo is spoken. It is transcribed and published verbatim, transcription artefacts
included, with the agent's reading beneath it and marked as the agent's. The reading names
the work. The work is done on a branch, against gates that run in seconds. A version
number is taken, a paragraph is written saying what changed and why, and the push triggers
validation, tagging and deployment. The result is readable on a public page, and the
paragraph explaining it is readable next to it.

### What Each Step Buys

The verbatim brief buys the ability to check a later claim against what was actually said.
The reading buys a record of what the agent understood, separable from what it was told.
The gates buy speed rather than costing it, because they make small changes safe enough to
be frequent. The narrated release row buys a history a person can read instead of a commit
log they will not.

The versioning buys the diff, which is what makes review possible at all, which is what
lets the work be corrected rather than defended.

### What It Does Not Buy

It does not buy quality of thought. Every step above is about the handling of material,
not about whether the material is any good. A workflow of this shape will ship a bad idea
quickly, with a well-narrated release row and a green test suite.

It also does not remove the interpreted step. The one-way door is still there, in the same
place, and no amount of machinery around it changes what happens inside it.

## Summary: Core Principles

1. **A workflow is how you operate.** It is the steps you actually take, whether or not
   you wrote them down, and everyone has one.
2. **The workflow decides which questions are cheap**, and over time that decides what you
   notice about your own work.
3. **Four things a workflow can now change**: the tooling, the visualisation, the
   comprehension and the context.
4. **The purpose is the zone.** A workflow earns its keep by removing interruptions, and
   any step that adds one has to pay for itself.
5. **Villager and explorer are phases, not people.** Consuming and improving are two modes
   the same person moves between.
6. **Experience changes reach, not route.** The steps are the same; skill decides how deep
   into the workflow you can change things, and how fast you read.
7. **The explorer trigger is a manual step**, noticed. The default is not to change the
   workflow.
8. **Detours are bounded by payback.** Hours or days is a tooling detour; years is a
   different project.
9. **Maturity is measured by not changing it.** A workflow that survived real work
   untouched is a workflow that has been productised.
10. **Parked is not abandoned.** A stop with a reason and reusable parts is a result.
11. **Projections come from sources plus transformations**, and sources stay in the
    deterministic layer.
12. **Interpretation is a one-way door.** Put it as late in the chain as possible and
    declare where it is.
13. **Everything gets a folder**, and the test of the folder is whether it can be lifted
    out.
14. **A named process is repeatable.** Naming is the cheapest improvement available.
15. **A diff is a step, not a feature.** Diff the graphs, not the markdown, and formatting
    changes become findings rather than noise.
