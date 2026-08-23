# Founder memo: the review workflow, and delta editions

**Date:** 22 August 2026 · **Source:** voice memo, transcribed by Otter.ai, reproduced
verbatim below (per the house rule: the founder's voice is source material and is not
edited) · **Status:** the source brief for ask **N9** on the comms board, decomposed
there into tasks T20 to T24.

**What it asks for, in one paragraph:** a browser view that diffs any two versions of
the book, GitHub-style (the foundation, shipped first as T20); a review intake that
normalises whatever a reviewer sends (numbered screenshots with comments, voice memos,
documents) onto a presentable page; a review loop where the agent comments and proposes
before changing anything, threads run until agreement, and the diff view shows exactly
what a review changed, with approval before anything lands; all of it packed in JSON as
a kind of serverless pull request, aware that content drifts between a review and a
later version; and, on the same technology, **delta editions**: published PDFs showing
only what changed between the version a reader has and the current one. Plus two
standing notes: the site should carry a section documenting the whole
how-to-publish-a-book workflow, and this machine should produce more books (the risk
acceptance workflow is named as the next candidate).

---

## Verbatim transcript

Dinis Cruz 0:00

Okay, so this is to create a brief for the agent that is helping me with graphs sgit
website, which is actually working out really nicely. So we created a graphs skit
website, which actually it was so good that we also created a book. So we actually made
the process of creating a book for Leanpub and KDP, which is the Kindle Desktop
Publishing. So we're going to probably make it a real book out of it. And and what
we're now going through is a review process where I'm basically reviewing the book, and
I am basically going through the process of making changes. And what I would like us to
focus here is on a review workflow that I also want to make it sort of official,
because there's a number of components that I want to have, but also as I share the
book and I ask people to provide feedback on it, the what is going to be very important
is to what's it called? To provide the to provide the workflow that we can receive
feedback, we can process it, we can diff it, and really take a step back and think
about the best practices in terms of publishing and reviewing that we can have. So so
here's what I kind of would like us to have. First of all, we need that visually we can
show the deltas between versions of the book. So, so the logic is we need to make sure
that when for every version that we have on the book, just about like GitHub, I have a
way that I can compare versions, ideally even different versions, not just with the
latest one, and I can have a version that gets, you know, in a way, browser generated,
right? That allows me to see the delta, i.e. the diff, kind of like GitHub diffs of the
the content changes, but also this is important because this also allows me to see, for
example, the changes that the agent does. So when we make comments, it's very
important. So so this should look like a sort of a web page. So we already have a web
page to browse the book. So we now need a web page to diff the changes, and it should
allow me to see change by change, but also should allow me to see them all in one go,
and ideally should allow just to see the changes, or maybe see a bit of the text before
and after, so a bit for context, so you you get a bit of a sense of of what is changed,
right? So so that's kind of the critical part, and then once we have this capability,
which is very powerful, and and also just as a side note, make a note that I want to do
a number of these books because I think even just the PDF or even the website, they
actually are really good for some of the key concepts, and it's very important. Like
you know, this book is already a little bit written for agents, but the because the
reason, in fact, the reason I created a book was there's a lot of important concepts
that I feel are now being missed, and I need a really nice way to tell an agent, hey,
read this, consume this, create a view for this for what we're talking about. So, for
example, I will need to do this for the risk acceptance workflow, which again it has
some particular particularities about it, and and other workflows that I have, so so we
it's important to then have start to have a section in in this book, so in this graph
dot skit basically this book website, and the website fundamentally contains all the
content plus the book stuff, but it's good to have a section in there that will be a
section almost like how to publish a book, you know, like information about all the
details, the workflow we've done so far, guidance like this, the creation of this, etc.
So we can map it out. So okay, so once we got that way to do the delta and the diffing,
which is very important, then what we want to do is to start to do reviews, and the
reviews should be, for example, a mode. So there's a couple of modes here. There's the
review, the mode to create the review, and then there's a mode of what to do once you
have a review. So to create a review, one of the things I'm thinking of is I'm taking
right now screenshots of the of the book as I'm reading, and I'm basically going to
then number them all, and I'm going to make comments on the screenshots that I have,
which will allow me to then provide that feedback to the to the to the agent. So, so
this is what I mean. So this should be, and this could just be a voice memo, right?
This could be anything, but fundamentally there'll be a document or a PDF or document
list images that contains the review of somebody, right? Comments, etc. So the first
thing we need to do is just process that, put on a web page, and and sort of normalise
that a little bit so that it's presentable, and then we start the review process. So
the first thing the review process is the agent should comment on it, not making a
change. It should comment and say, "Yeah, agree. What about this? What about that? And
make basically a set of proposed changes to the book or the content of the website.
Because remember, the the book is synchronised with the content of the website. From
it, then I can have a thread about it. Then we can agree. Then we can make the changes,
which is why the delta that we just created and the UI we just created before is
important, because then we should be using that in that UI to show me just the delta
between the version and the changes made. I can then view them, and then actually,
ideally, there I also have a way to approve or disapprove or make comments, which
should either go to the same review or should create a new review, and then we can
rinse and repeat, right? Until we're happy, and then that gets then pushed to the the
text. So, so in a way, and again, this should all be packed with JSON and mapped out.
So you should have. So basically, what you have here is a it's almost like a pull
request serverless version or a non persistent pull request version because up until
now we have not made any changes to the text right and I think what's interesting here
is to capture the existing text that is relevant or at least a bit blob in a JSON file
before during and after, right? But then take into account that in the future, the the
content might have drifted. So you you could have, for example, a feedback that then is
commented, and then a new version. We might want to go back and say, "Hey, have we made
changes that impact this? So we take a much more three-dimensional and graph view of
it. But the point here is to think of these reviews as a good opportunity to clean up
stuff, but also an opportunity now to develop the tooling that will allow us to review
this much more effectively, and to make this publishing and this process more
important, especially because one of the things I want to have, especially because I
want to do new versions, I want to use the same technology to publish delta versions of
the book. So I want to publish a version of the book, and this isn't going to be
printed, right? But it's going to be, I'll do some PDF where you can see only the bits
that have changed between a different version of the book, and that'll be quite
powerful, right? Because I want to publish new versions regularly, and you should be
able to go, oh, I got, I read version one. What has version two changed, or what has
version 2.5 change, and one has version between 1.7, which when I read, and 2.5 change,
and stuff like that. So, so this is the beginning of developing the technology and the
workflows for that to be possible.

Transcribed by https://otter.ai
