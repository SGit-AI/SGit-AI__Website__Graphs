# Brief 39 — founder memo: park the engine, ship the books, open the review era

**Date:** 27 August 2026
**Source:** a voice memo (Otter transcription, speaker label and timestamp preserved),
recorded after reading the books on the flight — one and a half of the three. The first
observation is a finding about the work itself; the rest is a change of direction.
Reproduced verbatim below. The instruction table is the agent's reading, for the founder
to correct.

---

## The memo, verbatim

> Dinis Cruz 0:10
> Okay, so I want to sort of capture my ideas and notes and observations from reading the
> the books that we created, the PDFs that we created. So the two committee we created
> three books, and I read one and a half. I'm in the post of the second one. So I read the
> first one. I read was the the making the book, which is making, which is the book that
> basically describe what we've been working on. Anyway, it's exactly workflow, and then I
> start reading the the actual risks, so not the universe, but the actual risk book and
> the fractal semantic graphs, and I mean anything while. it's quite interesting that the
> beyond the quality of the right word, but the alignment of the writing the book is way
> way stronger, like by orders of magnitude, than the alignment of the factor of its
> pressure, and I think I think it's a good example of the power of the source material
> and the power of having really good, basically materials to base the content on. So
> there are a whole bunch of stuff that I'd like us to do next. So let me try to break
> down in in bits. So the first one is let's do one more pass of quality, same way we did
> before. So let's do a refactoring pass where you go to the code, you go to the files,
> you see what needs to be cleaned up, you see what files needs to be refactored, you see
> what we need to basically improve the quality. Anyway, see if we actually need to
> improve the quality of our testing frameworks, improve the quality of our harness. You
> know, basically, do a proper non-functional requirements pass on this, and also some
> JavaScript files need to be refactored. Some need to be moved to web components. Some
> need better documentation. So just do that, and and basically capture that maybe the one
> or two passes more, and then once we finish, let's and probably also counter some of
> these plans on this version, and then let's do another major version because I want to
> change a couple of things on on here, right? So now, so an interesting question is
> whether the refactoring, sorry, where the release I'm about to describe next will happen,
> and. in the current version, on the next major. So, so we're going to basically wrap up
> the 5x. We're going to start the 6x. So, let's just make a call whether the the
> positioning is already all created within the 5x to wrap it up, and then we put on 6x. It
> kind of makes sense to be 5x because that's sort of the ending of, or actually, yeah.
> Let's see. Let's let's do the pros and cons. I'm kind of easy, but either way, so the key
> decisions I'd like us to make is that we're gonna we're gonna pause a little bit. We'll
> do some more work, but fundamentally pause a little bit the work we've been doing with
> the word models we were the word content language models we were experimenting and the
> operators because I think that was a good example of and solution that I can develop.
> that needed kind of a better a better target, a better environment, which is basically
> what I'm about to describe next. So let's use what we're going to create next to. To to
> create it. So, so here's yeah. So here's the core idea. Let's release the two books we
> have. Don't worry about the universe for now. Let's, you know, in the sort of spirit of
> having a CI pipeline and end-to-end flow, this Am release the two books we have all the
> way to Lin Pub, because in a way they are good enough, right? There's a lot of good
> ideas, a lot of good material, and and what we should do is actually prepare it for the
> next phase, which we're about to describe next. So, so we're going to basically create
> the. the resources and and basically the the graph website needs to refactor a bit to
> take into account that is now the home of two books, one is the fractal semantic graphs,
> meaning to connectivity, and the other one is making the book using fractal graphs. But I
> want to revise this title of the second one, but not not to start with. So So basically,
> the the strategy here is that what we're going to focus on next, which we already
> started, that we weren't doing a lot, and now we will do a lot of this. So, so what we're
> going to do is we're going to focus on the review process of the books we have. So I have
> a bunch of notes, a bunch of changes to make on both books, and what I want us to do is
> to treat the review process as a way to figure out a lot of the moving pieces of the
> puzzle, including a lot of the. A lot of the the workflows, and even even the
> transformations, and even the different altitudes, and it's kind of like we're gonna
> we're gonna start working a little bit from the top down, and then once we define and do
> the bottom up from the document in a way, we should be meeting in the middle. But I think
> it's gonna help us a lot to have a good again sense of where we want to go, too. Right.
> So, so for the for the reviews, I really want us to implement a super professional and
> efficient workflow where we're going to be introducing a lot of agents to the mix, and
> I'll explain that in a separate memo. But we're basically going to have, including human
> reviewers, but we're also going to have agentic reviewers, and and I want us to use the
> the comments and the reviews and the process again as a kind of a change control system,
> where whenever we have a review that we want to make, we start by planning, mapping,
> defining, reviewing, approving, and then implementing, and then approving the
> implementation. Right. So we we make it a lot more sort of professional, because in a
> way, and and sort of operational. Because in a way, we are actually making changes to the
> books, right? We actually are transforming the book's content, so we actually need to be
> quite thorough, and and this is in preparation for, you know, the phases in more in the
> future when you know we might be doing official releases, and and now we need to have
> diffs, and we need to have the technology element to this, so so fundamentally the first
> major change, and that's why I said let's do a refactoring phase, so that we can really
> clean up this, and then prepare for what's coming next, including the folder structure,
> the documentation, you know, that's really cleaned it up. The the repo, right? Make it as
> professional as we can, in preparation for what's coming next. Because we're literally
> going to have an explosion of files, even more more tools, more capabilities. Because now
> it's going to get a lot more interactive, right? And we're going to have a lot more
> agents operating here from a content point of view, which is also a sign of maturity,
> right? Where we we start to have a more of a distinction between tool creation and
> content creation and and refactoring and evidence, and in a way using the concepts that
> we talk about actually in the book that we're developing, so that's kind of the first
> major decision here, which is we park the work we're doing, we do a next version, and now
> we basically have two books that we need to officially release, and that's going to be
> the focus. So there's already, I believe, either either here or on the other one. I think
> I think on the first book we actually wrote instructions for how to put it on Linpub and
> Kindle Destiny Publishing. Let's just focus first on Linpub because Linpub gives a
> release. So let's focus on the the materials. You know, even from a marketing point of
> view, from a publishing point of view, we need to kind of have that to a decent level. We
> need to have the materials, the information, and then I want to put something on LinkedIn.
> So we kind of need to have a bit of a marketing push, right? To to just get this, and and
> the point here is to do a release, right? So the point here is then we need to ship
> because shipping something is one of the most important things you can do. So this is
> where we basically need to ship a product, and the product is the version that we have,
> right? It's version. In fact, this is version two of the book, right? Or in fact, it's
> version 0.20 of the graph book, and it's version 1.1x or 2x and 2x from the from the
> making book. And this is important because one of the things that we're now going to
> have, and this this you know this starts as modules, and eventually could even be what's
> it called individual repos, but now it's all in the same repo. But we what we're doing
> here is we are. What's it called? What we're doing with this is we are mapping out the.
> Yeah, so so each book now will have its own release number, cycles, etc. So so the way to
> think about this is every time you make a change to the GitHub repo, you increase
> basically every commits that we have, right? Every major set of changes that we push
> basically has a new version number in the kit of repos. So that's the versions that we
> have: the V4x and now 5x and now 6x. But each book in itself also has its own versions,
> which is every time we change the content of that book, so it's different. So, so this
> means that, for example, if we make a change to the plumbing or to the technology that is
> used, or some of the tools that are used, or some of the stuff around the content, but we
> don't change the content of the book, then the version of the book doesn't change.
> Doesn't go from viewport 1.5 to 1.6, or 0.77, or whatever the number is, right? And and
> also, you know, it could be a case where we we start to do you know more releases. So so
> basically, we are keeping them kind of in sync, right? In terms of no, with each other.
> So each each one contains its own universe, because it's each version is focused on its
> own area of of activity, which you know in this case is the book, which is centre of
> gravity, or the reaper itself, which is the centre of gravity. So, so yeah, so that's the
> first set of changes. So now I'm going to create a couple more memos about specific
> things, more about specific changes to each of the books, but but I think that now can
> come on the the 6x sort of you know, set of changes to what happens there.
>
> Transcribed by https://otter.ai

---

## The agent's reading: the instructions, numbered

1. **The finding, recorded first.** The making-of book's alignment is "way way stronger,
   like by orders of magnitude" than the FSG book's, and the founder reads that as
   evidence for the power of the source material: book C was written over 41 narrated
   release rows, 38 verbatim briefs and a repository it could interrogate; book B was
   written over an argument. *Recorded as a finding about the method, not a complaint
   about the writing. It is also the strongest argument yet for the review era: the way
   to give book B that alignment is to give it the same density of anchored source
   material, which is what a thorough review process produces.*

2. **A quality pass, maybe two.** Go through the code and the files: what needs cleaning
   up, what needs refactoring, whether the testing framework and the harness are good
   enough, a proper non-functional requirements pass; some JavaScript needs refactoring,
   some needs moving to web components, some needs better documentation. Folder structure
   and documentation included; make the repo as professional as it can be. *Started this
   round: the audit is real and written down (`v2/dev-packs/v0.5.17__the-non-functional-pass/`),
   pass one is executed, passes two and three are planned and sized.*

3. **The reason for the pass, stated plainly**: an explosion of files is coming — more
   tools, more capabilities, more interaction, and many more agents operating on CONTENT
   rather than on code. That maturity needs a repo where tool creation, content creation,
   refactoring and evidence are visibly different things.

4. **Park the WCLM and the operators.** Not abandoned: paused, because the experiment
   "needed a better target, a better environment" — and the review era is that environment.
   *Recorded. The twelve operator folders, the anatomy views and the workbenches stay
   exactly as they are, and the parking is stated on the page rather than left implied.*

5. **Ship the two books, all the way to Leanpub.** Not the Universe volume for now. They
   are good enough: there is a lot of good material, and shipping is one of the most
   important things you can do. Leanpub first because Leanpub gives a release; Kindle
   Direct Publishing later. Marketing and publishing materials to a decent level, then a
   LinkedIn post.

6. **The site becomes the home of two books**: *Fractal Semantic Graphs: Meaning Through
   Connectivity* and *Creating a Book Using Fractal Semantic Graphs* (title to be revised
   later, not at the start). The graphs website needs a refactor to say so.

7. **The review process becomes the work** — and the vehicle for discovering the rest.
   The founder has notes on both books. Treating review seriously is how the workflows,
   the transformations and the altitudes get figured out: top-down from the review process
   meeting bottom-up from the document work in the middle.

8. **Review as change control, with agents.** Human reviewers AND agentic reviewers, in a
   professional operational workflow: plan → map → define → review → approve → implement →
   approve the implementation. Thorough because these are real transformations of book
   content, and in preparation for official releases where diffs matter. A separate memo
   will describe the agent mix.

9. **Per-book versioning, separate from the repo's.** The repository version advances on
   every pushed set of changes (v0.4.x, v0.5.x, v0.6.x). Each book carries its OWN version,
   which advances only when that book's CONTENT changes — plumbing, tooling and
   surrounding work do not move it. Each is its own universe with its own centre of
   gravity; today they share a repo, later they could be modules or even separate repos.

10. **More memos are coming** about specific changes to each book, expected to land in the
    6.x set of changes.

## The agent's call on the version question

The founder asked for pros and cons and said either way is fine. The recommendation is
**wrap in 5.x, open 6.x with the review era** — the refactor passes, the per-book
versioning, the Leanpub release and the site becoming the home of two books all land as
v0.5.x, and v0.6.0's first commit is the review machinery.

*For 5.x:* the v0.5 era's story is exactly "the working surface got built and the books
came out of it" — the books shipping at v0.5.12 to v0.5.16 is the era's climax, and
finishing them is the same sentence, not a new one. A refactoring pass is cleanup of v0.5
work, so it belongs to what it cleans. Publishing needs per-book versions, so that scheme
must land before the release rather than after it. And v0.6.0 then opens with a single
clean identity instead of a tidy-up.

*For 6.x:* there is a real precedent the other way — v0.5.0 was itself the tidy-up that
closed v0.4 ("The v0.4 era closes, and the site catches up with what it built"), so
era-closing cleanups have opened eras here before. And publishing to Leanpub is arguably a
new kind of act for this estate, which is what major versions are for.

*Why 5.x still wins:* the seam is not between "tidy" and "new", it is between **finishing
the books as they are** and **changing the books under control**. Everything before the
review era is the first; the review era is the second. Cutting there gives v0.6.0 the
cleanest possible meaning, and leaves the v0.5 retrospective a complete arc to narrate.

## The agent's notes back

- **Question — the book version numbers.** The transcript is fuzzy here ("version two of
  the book… version 0.20 of the graph book… version 1.1x or 2x") and the numbers matter
  the moment they are published. The proposal: *Fractal Semantic Graphs* releases as
  **v2.0.0** (it is the second edition of the argument the frozen first book made, and
  Leanpub readers will see the lineage), and *Creating a Book Using Fractal Semantic
  Graphs* releases as **v1.0.0** (a first edition of a new book). Both then advance only
  on content changes: patch for corrections, minor for new or rewritten material, major
  for a new edition. Correct these before the release if they are wrong.
- **Question — how the review notes arrive.** The founder has notes on both books. Whether
  they come as a voice memo, a marked-up PDF, or comments anchored to chapters changes
  what the review machinery must ingest on day one. The safest build is the one that takes
  all three, but knowing the real first case would sharpen it.
- **Question — Leanpub mechanics.** Everything up to the account is buildable here (the
  manuscript layout Leanpub expects, the metadata, the cover, the sample, the landing
  copy). The account, the pricing and the publish button are the founder's hands. Say
  whether the account already exists so the pack targets the right first step.
- **Recorded, not asked:** the Universe volume stays published on the site and simply is
  not part of this release; the making-of book keeps its current title until the founder
  revises it.

---

## Addendum — the founder's answers (typed, same night)

> 1. So the v1.0.0 will be the actual final release, so for Fractal Semantic Graphs it
> should be v0.2.0 and Creating a Book should be v0.1.0
> 2. It will be voice memos, or in some cases I will use a modified version of the
> Narration tool (which supports screenshots)
> 3. Yes, you can see it here https://leanpub.com/u/diniscruz where I published a good
> number of books several years ago
>
> Yes, let's keep the Universe where it is (we'll come back to this book later on)

The agent's reading, built as v0.5.18:

11. **The version scheme is settled, and it says something.** `v1.0.0` is reserved for the
    ACTUAL final release, so a book below 1.0 is openly a book still under review:
    *Fractal Semantic Graphs* starts at **v0.2.0** (it has a first edition behind it),
    *Creating a Book Using Fractal Semantic Graphs* at **v0.1.0**, and the Universe volume
    takes **v0.1.0** as a held draft. Leanpub readers see the number, so the number is a
    promise: this is in progress, you get every update, 1.0 is the finished thing. *Built:
    every book carries a `book.json` with its OWN version and a per-chapter content hash;
    a gate fails any content change that does not move the book's version, and any version
    move that changes no content.*

12. **The review notes arrive as voice memos or narrated-review exports with screenshots.**
    Both are formats this estate already handles — every brief in `v2/briefs/` is a
    transcribed memo, and briefs 27 and 33 came from narrated reviews with paired
    screenshots. *Recorded as the review machinery's day-one input contract; the v0.6.0
    memo will say what it does with them.*

13. **The Leanpub account is real and has history**: ten published books, one unpublished,
    and a published bundle (`All Books`) at `leanpub.com/u/diniscruz`. Two consequences
    recorded rather than assumed: there is a bundle precedent, so the two books can ship as
    a pair; and the author bio on the profile is years stale (it still reads "CISO of the
    Photobox Group"), so updating it belongs to the release checklist rather than to
    marketing copy written fresh.

14. **The Universe volume stays where it is** — published on the site, out of this release,
    returned to later. It takes a version like the others so its state is legible, but it
    is not part of the Leanpub pair.
