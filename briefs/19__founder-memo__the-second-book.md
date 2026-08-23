# Founder memo: the second book, written top down

**Date:** 23 August 2026 · **Source:** two voice memos, transcribed live by otter.ai and
reproduced verbatim below (per the house rule: the founder's voice is source material and is
not edited) · **Status:** the input to [dev pack v0.3.27](../dev-pack/index.html), which
extracts every instruction and says what each one commits the work to.

**What they say, in one paragraph:** the refactoring that was planned is cancelled. There is now
enough structural evidence, tooling and workflow to start again and write the book properly,
from the top down, beginning at fractal semantic graphs and meaning through connectivity and
descending. First, a plan, in the shape of the dev packs the other repositories already use.
The book is written **by levels**: five versions at five altitudes, each larger than the one
above, each leading to the next, and those five are the source material for later audience and
language variants. The book is the intersection of its structure with its concepts, opinions,
hypotheses, facts and objectives, all of which are centres of gravity in one bidirectional
graph. Themes are not declared: when the graphs are well connected and carry ontologies and
taxonomies, the conclusions become **computed rather than opinions**, and evidence should
converge on the themes by itself. Separately, the first book is packaged as a named version,
frozen in time, with a front page that explains everything in it including the sequence of
events, and the second book lives in its own folder and copies from the frozen one. Level five
does not exist in the first phase; it arrives once the graphs are agreed and mapped.

---

## Memo 1

> Okay, so this is a first memo. This is a continuation of the the book. So I think we now are
> at a really nice stage, where I think we can go into the next phase, and instead of cleaning
> up the current and doing the refactoring as we planned, I think there's now enough structural
> evidence, technology workflows, etc. for us to basically start again and actually do this
> properly from the ground up, so, so, what I would like you to first of all create a plan for
> how you're going to do this, and put that in a sort of a we usually call this a dev pack. In
> fact, if you see the other repos, the other Skit vaults, you'll see that we have already
> created a number of these sort of dev packs, which are basically super detailed plans of
> action, and I think this now needs one of those because I think there's a lot of moving parts
> that we should try to get it right from the beginning. Because what I think we can now do,
> which is very exciting is we can actually write this book the way I wanted to write it, which
> is from the top down. So if you think about it, the you know if you start from the fractal
> semantic graphs and then the meaning to connectivity concepts, which is fundamental, is this
> whole idea. If you think about it, of the fractal element of the nature of what we're doing,
> because it's all open source, it's all distributed, it's all zooming in and zooming out. In
> fact, even the book now, if you think about it, is fractal at that level because we're
> applying the same concepts at every level, and. and we navigate downwards. The meaning to
> connectivity is exactly the concepts that we've been exploring, which is this whole idea that
> the graphs, you know, are determined by by the creator, and Yeah. So, and I think that's the
> whole point of basically the message we're trying to say in the book, right? Which is, a lot
> of graph projects are, you know, they they kind of try to define everything one go, which is
> again well. When we talk about the semantic web, I think some of the mistakes they made, but
> it doesn't mean it's not right. You know, ultimately everything is a triplet, right? It's just
> the relationships, right? It's just about the zoom in and zoom out. But also, I think the
> other thing that I really want to stress out is that if you look at even on this book, and I
> think it's interesting that even you have experienced already, you know, Claude, that is
> helping to do this. Is that it's only when we do a certain degree of visualisation and
> analysis that we are able to find a bunch of stuff. And the other thing that I think was very
> interesting that you start to see also is that when we do the graphs and we have the graphs
> well connected, and we start to add the ontologies and taxonomies and the multiple levels. The
> other thing that happens, which is super interesting, is that you start to find conclusions
> that are mathematical evidence. So they compute conclusions, not an opinion. And I think
> that's super powerful, right? You know, it's kind of like you said. Like if you, if I want to
> say this is the themes of the book, then the references and the evidence should link that way.
> You should have these sort of natural peaks, even external evidence, right? They should have
> these natural peaks that should take you there, right? And and ultimately, that's the whole
> point, right? So, so what I would like us to do is to try to create this book now from the top
> down. But first of all, again, make the plan, define the architecture, define the plumbing,
> define the visualisations, the graphs, and also use examples, right? You can actually see
> examples and screenshots of the pages that we take in. It's also worthwhile going back and
> reviewing every single page, every single conclusion that we have. So when we create the plan,
> we can go from there, right? And this is remember, this is the plan to write the plan, right?
> This is the plan to write the the first version of the book. But the first, but the way I
> would like us to do the book is I like us to do the book by levels. So if you think about it,
> and also find a way to, so if you take those five levels that we have, the way to do this is
> to actually create the five versions of the book, right? So if you think about it, there's a
> there's a hyperlinked version, but there's also a reading version. So I should basically have
> five versions of the book with five altitudes, right? Where each version is bigger than the
> x1, and each version leads to the next one. So it's almost like zooming in the version of the
> book, and and what this is then is creating is the source materials. When later on, we then
> create the multiple versions and the multiple, what's it called, sorry, audiences and even
> multiple languages, where we have this. But but this is where we we started to find all the
> terms, all the concepts, all the facts, all the things first. So the book ultimately is this
> intersection of the structure of the book with the concepts that we're defining on the book,
> with the opinions on the book, with the hypotheses that we have, with the facts that we have
> created, and and almost I really liked the objective, right? And I'm kind of like, what's the
> point I'm trying to make? Again, so you can see all of those become central gravity that link
> our graph. And again, it should be a bidirectional graph to do it. Just one more comment
> because I've seen a couple of times, and I think it's important to clarify. And I know there's
> a document that says this, although we might not have not picked it up, but if not, maybe it's
> worth doing it. But I can just make the point here, because I've written about this: is that
> the reason I don't like graph rag at the moment is not because of the graph part of it,
> because I think the graph part of it is great, but because most graph rags solutions, the
> trivalent generation, they are not pure graphs. They're almost using graphs to generate some
> parts of it, but they still use vector stores. And the reason I don't like vector stores is
> because the vectors are non-deterministic, and they're not explainable, and they don't have
> provenance. So, you know, yes, it's an approximation, but it's always also an approximation,
> and I don't. That's what I don't like about it. Unlike when we can go graphs all the way down,
> if needed, all the way down to the word, right, and the concept, and the dictionary, and the
> evidence, and all that jazz. So that's why I don't like graph drag, because there's a
> non-deterministic element of it, which is by design, right? Which is by design these
> approximations. So you, in a way, you're using the graph element to compensate for some of
> this, which of course produces good results. You would, but I, for me, graph rag. I'm a
> purist. I think you should be either you only use graph technology, but the term is gone, so
> unless we call it G3 G3 rag, but yeah, let's just make the point that at the moment, or maybe
> you know, maybe mention it, but it should not be a big thing.

---

## Memo 2

> So yeah, one more thing on the new structure of the plan to create. So the idea is that we
> will take everything which is created and package it up into a version. And by this I mean the
> book materials and all the other support information that we create. Basically, I think
> everything that's on that book section, we'll take all of that and we'll package that up as
> almost a version, a previous version of the the book. So, so we can. I want to. I don't want
> the new stuff to overwrite what we've done there because this is historically there's a lot of
> stuff there to learn. In fact, we should have a front page that just links to everything and
> explains everything, including explains the sequence of events. So this should be like a
> version X, or even tied to the particular version of the release that we have, and that's a
> version of the book, right? Which, in a way, is the first version of the book. If you think
> about it, that's literally the first version, and we can even name it the first version of the
> book. So we now work on the second version of the book, which is the refactoring that I
> mentioned above. But I think it's very important that you copy everything to a particular
> folder that we then froze that in time, and none of that gets changed in the future. So
> everything else in the future gets copied from there in terms of in terms of the material that
> we're going to create for the new version. So the new book ends up being a copy of all of
> that, of all the bits that we care and we want to know, and we're going to reuse from here. So
> that means that, for example, not all of the book, the references, documents might be copied,
> right? It might be some who don't make it, because remember that the new book is going to
> start from the top down, and and but also we also had to have the whole narrative lined up,
> right? So we need all the evidence, all the material that we connect. So, so the version two
> becomes a different folder that then is the one we're going to make changes. So it's almost
> like every version of the book is now independent because remember we start from the top down,
> we start from the structure. So, in the first phase of the book, we don't have the level five,
> for example. That will come once we agreed and map out all the graphs. So, we're going to it's
> a graph first created book, and again, meaning to connectivity, right? The meaning and the
> description of the book arrives as we zoom in and add more detail and lower, in a way, the
> altitude of what we're working on.

---

*Transcribed by otter.ai. Reproduced without edit, including transcription artefacts.*

This document is released under the Creative Commons Attribution 4.0 International licence (CC BY 4.0).
