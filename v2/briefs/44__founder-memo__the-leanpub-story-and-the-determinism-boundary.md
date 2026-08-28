# Brief 44 — founder memo: the Leanpub story, the title, and the determinism boundary

**Date:** 28 August 2026
**Source:** a founder memo, dictated. Unlike briefs 40 to 43 it carries no Otter speaker
label or timestamp, and the transcription artefacts are its own; it is reproduced exactly
as received. It answers three things the agent had flagged as blocked and adds one concept
the founder says he has not explained well before.
Reproduced verbatim below. The numbered reading beneath it is the agent's.

---

## The memo, verbatim

> Okay. So so the Lyn pub story is actually, you know, basically a story of me leveraging at the time a really powerful workflow of creating basically books from markdown that were integrated via GitHub through Dropbox, which actually allow me to reuse a lot of the blogs that I have written, kinda saw, like, some of the source documents, the early versions of the source documents that you now have that allow me to take specific topics that I had and put it together. Right? And some of them we're actually quite successful to a certain degree. Right? And then what I also did was I put them for free with the option for some people to pay a bit. And some did, which is quite cool, right, um, which Linpab allows you. So... but what I think, you know, the reason I would say, well, it was success from the point of view that I was able to publish a lot of great ideas. I helped a lot of people, um, and it showed me that publishing books isn't that hard. Uh, also, I took a couple of those books and and take... took the print... a friendly print ready PDF and put on KDP and even put on Amazon. Again, learn how that thought... what that difficult, which, of course, are lessons that we're now using. But the the data say it's a failure is that what I couldn't do is get them to the actual level of quality required to have a full finished book and to have, in a way, a book that can reach a wider audience. Right? And because the problem was, you know, I did it because, in the way, I... it was a good example as I was able to leverage technology so that without a lot of time commitment for me, I was able to maximize the content that I have and the ideas that I had. And I was able to really, you know, write a lot of content, but it was a substantial amount of time. And then once I finished that, I it's the next phase that become quite problematic. And it's the phase that we're doing right now, which is this ability to refactor, to change, to think about things, to take a step back, to challenge, to to really question what we're doing. Right? And I think that's the bit that I always wanted I never had because it's like with software. Right? Like, in in a way, I don't have an emotional attachment to a lot of the stuff that gets created. I care about the final product. I care about the experience. I care about the message. I care about, you know, that there's a conversion between what I'm trying to convey and how it comes out. And I think, again, a lot of these times, it's a discovery. And and what actually happens in some of those books is that you almost start to be locked by the first version of of the content because their making changes becomes quite painful. So those books ultimately would never finish because they run out of time. Right? And I run out of a team almost to do it, and they never reach good enough quality that somebody wanted to invest on it, you know, like an editor and publisher and do it. So that's the bit. that is worth capturing.
>
> So for the title, let's go with that, uh, creating a book using agentic workflows. Um, screenshots, actually, you should be able to leverage what we already have. So take a look at the screenshots that we already created, and you might need to create a ticket couple new ones, but we should already have most of the screenshots. And on your approach, absolutely. We structure, refactor before creating it because I think now you're on this path, we need to get to the point where the final results are published. In fact, one of the concepts that I don't think I have explained very well, which I think is gonna be relevant here is I always have a very clear distinction between what is the source materials and what is a transformation and a projection of those source materials. And one of the most important things for these workflow to scale is to make sure that you always have a workflow where your source... your projections are created from source materials plus transformation. Now you can have multiple of these in sequence, but what you means, it means that you have a CI pipeline for the creation of the final product. And this is very important. And and I think in our case, we we have a little variation, which is some of our final products have, I guess, pros connected to it. They have, you know, I guess, some text that might be created by another limb, which in that case, it is a projection that it's a one way you can go back from it. Right? Um, and it's kinda like that two way door thing and one way door where two way doors can go in and back, and one way door is one way only. So if you think about the creation of pros, it's a one way door. Right? Because we don't come back from it. right, the creation of prose is a transformation of the source materials. So... and I guess the question then is how deterministic that is. So when you move from one layer to the other, when you create the projection, how how deterministic is the projection, and how interpretation is the projection? So in our case, every time we introduce another lamb to the mix, we have an interpretation or a projection, which is now one way only, but it's very critical that, for example, the source materials and the source data is all in the sort of the deterministic layer of this. And it's the source ones that gets projected, which is why in our case, when we move from one layer to the other, a lot of those evidence... a lot of that becomes deterministic. A lot of those connections become deterministic, which basically means that you have a CI pipeline that is creating the materials, which basically also means that there's a lot of times where we could destroy the lead to refactor, lose a lot of the final bits, but not lose a lot of the projections, but not lose the content, not lose the the core. means that we need to be disciplined to where we're making changes. That's the key point here.

---

## The agent's reading

### The Leanpub story, which the agent asked for and could not have written

The capability register named this as one of two things part one could not be written
without. Here it is, and it is more interesting than "the books did not get finished".

1. **The workflow was already good, and that is the point.** Books built from markdown,
   integrated *"via GitHub through Dropbox"*, reusing his own blog posts — *"some of the
   early versions of the source documents that you now have"*. The corpus this estate
   carries is partly the same material.

2. **What succeeded, and it is a real list.** Published a lot of ideas; helped a lot of
   people; *"showed me that publishing books isn't that hard"*; free with an optional
   payment, and some people paid; a couple taken to print-ready PDF, onto KDP and Amazon —
   *"lessons that we're now using"*.

3. **What failed is precise and it is not the writing.** *"What I couldn't do is get them to
   the actual level of quality required to have a full finished book."* Writing the content
   worked. **The next phase did not**: *"the ability to refactor, to change, to think about
   things, to take a step back, to challenge, to really question what we're doing."*

4. **The sentence that is the book's whole argument, inverted:** *"You almost start to be
   locked by the first version of the content, because making changes becomes quite
   painful."*

5. **Why he is able to do this at all**, and it belongs in the book beside the caveat about
   programming experience: *"I don't have an emotional attachment to a lot of the stuff that
   gets created. I care about the final product. I care about the experience. I care about
   the message."* Refactoring prose requires being willing to lose prose.

6. **How they ended.** *"They ran out of time. And I ran out of a team almost to do it, and
   they never reached good enough quality that somebody wanted to invest in it — an editor,
   a publisher."*

### The three decisions

7. **The title is decided: *Creating a Book Using Agentic Workflows*.** It keeps the shape
   of the existing title and replaces the part the map found unearned. **One honest note,
   because the map is on the record**: the word *workflow* appears **8 times** in the
   current 31,221 words. The title is not yet true of the book as written — it becomes true
   as brief 42's part one lands. That is a reason to ship the retitle and the revision in
   the same era, not a reason to reopen the name.

8. **Restructure before publishing.** *"Absolutely. We restructure, refactor before creating
   it, because now you're on this path, we need to get to the point where the final results
   are published."*

9. **The screenshots exist, and the agent was wrong.** *"You should be able to leverage what
   we already have."* Checked: the making-of book carries **20 figures**, and the claim that
   they show only the reader and the engine was false. Figure **18 is the release history**,
   **19 is the memos hub**, **17 is the front page**, **08 is the file explorer showing raw
   and rendered side by side** — which is the memo-to-release loop and the projection chain,
   photographed. **The correction is the agent's.** What is genuinely missing is narrower
   than claimed: a gate failing, a version diff, and the team.

### The concept: source materials, and projections of them

The founder says he has not explained this well before. It is the most architecturally
load-bearing idea in the memo.

10. **The distinction.** *"I always have a very clear distinction between what is the source
    materials and what is a transformation and a projection of those source materials."*

11. **The scaling rule.** *"One of the most important things for these workflows to scale is
    to make sure that you always have a workflow where your projections are created from
    source materials plus transformation."* Chained, and *"it means that you have a CI
    pipeline for the creation of the final product."*

12. **Two-way doors and one-way doors.** A deterministic projection can be walked back; an
    interpreted one cannot. *"The creation of prose is a one-way door, because we don't come
    back from it."*

13. **The question to ask at every layer boundary.** *"How deterministic is the projection,
    and how interpretation is the projection?"* Every time another model enters the chain,
    that step becomes one-way.

14. **The rule that follows, and it governs the book-as-a-graph work:** *"It's very critical
    that the source materials and the source data is all in the deterministic layer, and
    it's the sources that get projected."*

15. **What it buys.** *"There's a lot of times where we could destroy [the outputs] to
    refactor, lose a lot of the final bits, but not lose the content, not lose the core."*
    If the deterministic layer holds the sources, everything downstream is disposable. That
    is exactly what makes brief 41's restructure affordable and brief 43's graph worth
    building.

16. **And the discipline it demands:** *"We need to be disciplined about where we're making
    changes. That's the key point here."*

## What the agent did with this

- **Executed the retitle** (stages 6 and 7 of the change-control workflow), which moves the
  book to **v0.2.0** and the site to **v0.6.9** — the first real exercise of the two-clock
  rule built at v0.6.5.
- **Captured the Leanpub story** as source material for part one, in the book's own folder
  rather than in a brief, because it is evidence the book will quote rather than an
  instruction to the agent.
- **Recorded the determinism boundary** in the book-as-a-graph plan, because it decides
  which layers of that graph are regenerable and which are authored.
- **Corrected the screenshot claim** in the capability register.
