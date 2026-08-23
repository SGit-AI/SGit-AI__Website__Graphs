# Founder review: decouple the book, evidence first, reviews as graphs

**Date:** 22 August 2026 · **Source:** voice memo, transcribed by Otter.ai, reproduced
verbatim below (per the house rule: the founder's voice is source material and is not
edited) · **Status:** Review **r003** on [the reviews register](../reviews/index.html),
normalised into six items with the agent's comments and proposals at
[/reviews/r003.html](../reviews/r003.html). No book content changes were made from this
memo: per the review workflow, the agent comments and proposes first. Two things did
land immediately, because they are review tooling rather than book content: the
**decisions register** every review now renders at the top of its page, and the
resequencing threads on r001 and r002.

**What it says, in one paragraph:** decouple the book from the website. The original
idea, one being a projection of the other, was already straining the language, but the
deeper problem is that the agent writing the book had to make assumptions because the
concepts lack enough references and explanation. Two needs got mixed: a website for
publishing the latest research and going into real depth on concepts, at far more
granularity than a book can carry, documented for agents too; and the book as **the
best of**, a condensed, markdown-driven set of files and images distilled from the
website. Splitting them ends the worst of both worlds (not enough evidence on the
website, not enough room in the book, everything flat) and is the Wardley evolution
from explorer to villager: refactor as the problem is understood better. What comes
next is a series of in-depth case studies of the existing vaults, which hold the
real-world evidence and techniques the book's statements need, done **before** the
next version of the book, with the founder guiding per vault what to go deeper on and
what to screenshot. The split also means the book becomes a clean, independently
versioned text that must link which parts, versions and commits of the website each
reference came from: the book as a graph again. And the reviews themselves evolve:
a new **decisions** mode showing the decisions needed, the answers, and the evidence;
each review becoming a folder with its own graph (every question, comment and piece of
information a node, the page a projection), managed with issues logic, because that is
what it is.

---

## Verbatim transcript

Dinis Cruz 0:01

Okay, so I now wanna. I think we need to create a third review with the ideas that I'm
gonna be provide here, and also there's a couple of updates that we're gonna do to the
other to the other reviews, and I also want to comment a little bit more about
capturing the reviews itself. But first, I think there's a very important change that
we need to do on the website that will require some refactoring. And again, you know,
this is perfect example of the worldly maps sort of evolution from Explorer to Village,
where we start to refactor and start to understand better the problem, and you start to
get more maturity. So, so I think we need to decouple the book from the website because
I think the original idea would be the website would be a projection of the book, which
already sort of was causing us some problems in language, but I think the problem is
more subtle than that, is because I think the reason where there's a number of concepts
that are sort of not well encaptured in the book is because, in a way, we don't have
enough references and we don't have enough good explanation of those concepts, and in a
way, the agent that write that wrote the book right correctly had to make a bunch of
assumptions. So, and I think we we are mixing two concepts here, which is, I need a
website that I can publish my latest research, my latest ideas, and go into detail
about specific concepts that we need to explore and expand and even document for
agents, but this needs to go to a way more level of granularity of that we need to go
or that we can go in a book. So in a way, the book should become the best off. The book
should become this Markdown, sort of driven version of files and images, which are
fundamentally are the best off. Are kind of then a condensed version of what we have on
the website, and what this allows us to do in a way is already have a bit of a
different fork between the book and the website, which I think is important, and allow
us to do what I'm not to describe next, which is really in-depth case studies of some
of the work we've done before. That will provide the body of work, will provide the
evidence, will provide the examples, will provide the technical, in a way, analysis so
that when you want to make a statement in a book, you are supported by the evidence.
But you, but then we don't end up on this sort of, you know, worst of both worlds where
we don't have enough evidence on the website, enough detail, because we don't want to
overload the book. But then the book doesn't have enough evidence, and and everything
is a bit sort of flat. Where this way, we can really zoom in on the website. We can
innovate. We can add more features. We can add a lot of content. We can add a lot of
visualisation, lots of case studies, which I want to talk about next, and then we can
pick those and basically break them to the book. And of course, the book can then
contain references to the contain references to the to the website where where needed
and or can lift. So, so for example, one of the things I feel it's missing here is I
think we have already lots of vaults that have really, really powerful techniques that
I've already used in practice to for the concepts that we talk about. Because again,
remember that we need evidence, right? Where there's the evidence, a lot of time this
comes is a lot of the vaults that I have created have that evidence, right? So and have
real-world examples of that. So and that's kind of what we capture, right? And again,
in the future, we might even have more examples of that, so we can capture there,
right? So, so we should be having, and I think we should capture this as a third
review, and maybe keep enriching the reviews, and and also I think the reviews need a
new mode called decisions, which basically means you can see where I'm going with this,
right? Which basically means that each review in itself needs to be a folder that has
its own graph that we need to visualise, and its own graph should have the sections,
and stature should have, for example, the decisions that are needed, and then the
answers to the decisions, right? And the evidence. So if you think about it, every
request, every question that is then on a review or piece of information or comments
should should itself be a node in a graph, where fundamentally the the view is a
projection of that right of the website. So we, so back on the backend on the website.
So on a yeah on a website GitHub repo that outlines the website. Each review in itself,
it's a folder. Inside its folder, it has its own, you know, basically items, issues,
questions, and if anything, we should be using issues here to clean this up, right?
Because that should be the logic, right, of managing this, right? Because that's in
itself. It's a graph. So, yeah, let's capture that. So, so what I would like to work
next is a series of case studies, sort of what we start doing on the Skit website. I
think that was a good one, but we should expand, and then I can guide also for each of
these vaults on what areas we should do more. We should take more screenshots. We
should capture the evidence, and and so basically, what I'm saying is that I think we
have a bit of work now to do on capturing all sorts of case studies, all sorts of
examples from the vaults that we have already created before we tackle the next version
of the book, because this is what will provide evidence to all those bits that we need
to do on the book. So yeah, so I think this is another review, and this again, like
this split means that there is a clean text now, which is the text of the book, which
we version, which should be kind of independent from the website, although you should
you need to link which parts of the website and which versions of the website and which
commits of the website we got the reference from, which is again the part of the graph
itself of the content of the book. This is again our effort in making the book a graph.

Transcribed by https://otter.ai
