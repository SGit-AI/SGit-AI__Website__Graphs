# Brief 40 — founder memo: the agentic team, and who the making-of book is for

**Date:** 28 August 2026
**Source:** a voice memo (Otter transcription, speaker label and timestamp preserved),
recorded after reading *Creating a Book Using Fractal Semantic Graphs*. The first memo of
the v0.6 era. It carries three things: a verdict on the book as it stands, the definition
of an agentic team, and a challenge to the book's own title and audience.
Reproduced verbatim below. The numbered reading beneath it is the agent's, for the founder
to correct.

---

## The memo, verbatim

> Dinis Cruz 0:00
> Okay, so now I want to record a number of comments about the making book, and which, like I said, is interesting because reading the book, there was actually not that much stuff I felt wanted to change. I thought the content was really well lined, the voicing was great. It felt very natural. It felt, you know, basically aligned to the stuff we do. I like the editorial choices. You know, some of the pacing, the comments was really cool, right? But I think we need to make a couple changes to to the book structure, and we need to think about the way we're going to be creating this for this sort of next release of the book, right? Remember that we already have one release, which is official, and that's the version of LinPub. And remember that LinPub allows to do new releases, right? So, so this can now happen in parallel with what's happening with the other work, and this is where we eventually start to delegate this to multiple agents, right? So, so the first thing we need to do is we need to create an agentic team for this, and this is what I've done in other projects. And what basically what I mean is that an agentic team fundamentally means you have a folder that provides a whole bunch of definitions per role, so every role has a folder. Every role has a role.md has actions, has briefs, has debriefs, and that and basically has this work environment, right? To do that, and what this allows us to do is allow us to create personas that basically will be agents, especially now that the Claude can spin up new agents in parallel, because sometimes it's important that they are isolated, right? And it's also from a better sort of context management point of view. So, so these agents that we can now start in parallel, basically what they're going to do is they're going to be focusing on specific areas of the book, right? They're not always going to be active, but it allows us to have much better focus. And what I found is also allow us to have a much better judgement, especially once we need to have some decisions making, or only to have multiple opinions. I found that it was very powerful when you have agents advocating for certain things, who have specific centres of gravity for for that to operate, and and that's basically what we are describing here, right? So what I'm describing here is the agents that now I'm going to basically be defining, and again, each of these contain its own role, contain its own execution, and its own logs, its own flows from there, right? So, so we're all going to have is have agents that are going to be things like the librarian, which is going to be responsible for indexing everything. We already have good definitions and good examples from other projects, especially the Send project underscore underscore Send project has that. We need to have the editor of the book. We need to have the publisher of the book. We have a developer who works on the tools and the code and the plumbing and the testing. We need to have the again the QA agent. We need to have the researcher agent and and every one of these agents is basically focused on specific things, right? He's going to be focusing on answering specific questions. We're going to have the writer, right? And and you could see that each of these there. And and what's important about these roles are all roles are highly customised to what we have here. So it's not just a writer. It's a writer for this type of book is not just a researcher. It's a researcher for the kind of book that we are creating right now. It's not just a developer, you know. It's a developer focusing on the JavaScript stack that we have, the CI pipeline that we have, etc. Right. So that's that's very important because you know that's how we we map the things, right? So, so so, and this needs to be a team needs to be defined. And and what's interesting about this, and this I'm going to come back to this theme, is that this is also a good example of the evolution of the book environment, because when when we start to define how people can replicate what we're doing. It's important to say that they don't start here. In fact, look at the situation. I'm only introducing these now, not in the beginning, right? But also, again, depends on the process. Depends on how they want to to slice this, right? In terms of of the flows. So, so one of the one of the interesting questions I want to ask, and this is actually a good example of creating a plan and then defining which agents should have a voice on this, and which agents we should ask for an opinion, which again I think that worked really well when when we implement things like that, is one of the first interesting questions to ask is is the name of the book correct? And I don't think it is, because I think the current name of the book is something like creating a book using fractal semantic graphs, which actually doesn't make a lot of sense because we are not using the fractal element here, in in in specifically with the book, and although it's a graph-like environment, this is more about the workflows that we're creating. And if you look at the book that we have, and also the you know the the flows that we have created. One of the things that it's important is this idea that who is the book for, which is kind of what I want to cover next. Like who is the book aim that, and that's something we have to think about because the title should reflect that, right, and that's what I want to talk next, right. So, I feel that we need to do a research project where we map out what is the book, what is the book about, especially where some of the variables I want to add in just a second, and then we should do a research and then a proposal for different names of the book, right, and and different, you know, and see what the targets we're going to hit here, right? So my thinking here is that if you look at what we're really doing here, is we are basically showing how to develop, how to I think we're doing two things. We we're providing a really good set of templates for how to write a book using agents, so which is for the audience of the book that is, I would say, less developer focus and more operationalized, and and this is also again if you look at the worldly maps, you know, are we talking more to a villager or to an explorer, and I think that's important. The villagers want a product, right? Want something nice productized, where the explorers will still be developing technology, and this is important because I think the book has two two key audiences here, or at least, right? It has an audience that just wants to write a book, And and basically wants to use all the tools, all the capabilities, and wants to sort of get a good understanding of the thinking, right? And especially the workflows, because the workflows, if you look at it, right? Like I, I at the same time operate at two levels, right? I operate at the the user level, but I also provided the the creation of the tools for the user, and this is one of the things that's interesting. If you look at my workflows, it's always like I want the workflows to be easy, right? I want the answers. I want I want it to be smooth. I want it to be super productive. So I know that I hate a good workflow where I don't feel the need to add more things. I don't feel the need to change flows. I don't feel the need to change a tool because the tool reached a level of maturity which is now powerful enough. Look at some of the flows with the transcriptions. Look at some of the flows with the way the Markdown files are created. Look at the versioning. Like there's a lot of things that have now reached a really good level of maturity, and that's kind of the idea, right? The idea is that once they reach that level, then I don't care. You know, not I don't care. Like I don't feel the need to go and change. So my point is that I don't create tools because I want to create tools. I create tools because there's inefficiency, and I want to improve my efficiency on doing something. That's how I operate. So, the so so I think there's a market of the book, which is the the people that want to have that writing book experience, right? And I think there's another market of the book, which is they want to what's it called? They want to understand the flow. They want to a understand how the sausage was made, right? The how the workflow was made, but also they want to programme. You know, they want to make those changes themselves, right? Or this is for a lot, but I think I think the the the there's a an audience that just wants to consume it, but there's also an audience that wants to see and get ideas for how to create it. And this is what I would say, there will be more on the explorer side than on the villager side, and that's where I think there's two audiences for this book, right? Because one wants to learn and wants to use the tools, and eventually there might be even a service that provides this, and then the other one wants to see and learn this interactive flow that I've created or that I'm using, not just to do something but to improve the tooling as I go along. Which is one of the most key points I think I want to make is that I've always been a big proponent and I always invested in non-functional requirements in the tooling, and like I used to argue that the scaffolding is more important than the code. The testing is more important than the code, the main code, because with great tests and great environments and great feedback loops, you arrive at great code, but the other way around doesn't happen, right? So, and and we already have that example of the more tests we have, the faster we go, right? So, and I think one of the powers of this gen AI development, and there's some times in the book that has some lovely examples where you fix things super fast. You know, and if you look at, I even think sometimes the book underplays the amount of stuff that we ship, right? I think we it's ridiculous the amount of features that we're pushing now, that we are releasing, that we are basically taking into production, right? And I think it's super insane the quality of what we're doing. So, so that's you know I think an audience. So now, if you think about it, right? I think this book then is more about writing a book with Claude, right? Is writing a book in a sort of interactive. You know, it's almost like the idea that you we're building the ship as we preparing to fly. Right, so we we we are recreating the tooling. So if you look at, for example, the the environment that we have now when we started, we are way more mature, right? We have much better flows, and you can see that inequality of gets produced, right? It's a, it's a much more, you know, there's a, like the worldly maps example, right? We we keep productizing, commoditizing, small and small components, so that we gain speed and we focus on the higher order things. So that's where I think there's a name here that is going to be around that. There's a name here that is going to be around this idea of basically doing the what's it called, you know, developing as you go along and then creating environments and creating experiments that have a level of quality that was never there before. Like, and if and if you see like some of the stuff that I've been doing, I've been surprising myself, right? Because I'm going, wow, we can do this. Well, then we can do this. And then if we can do this, then we can do that. So it's it's very powerful to be able to iterate very quickly on ideas, to be able to go back on ideas, to be able to change your mind, to be able to really experiment with things because that is again that is ridiculously powerful, and that's the power here, right? And then, but in the end, you end up with a really powerful, mature workflows, which is kind of what we want, right? And and this is sort of like one of the things to capture here, which is this is for me how you create great things, right? You you keep refactoring, refactor is like the power of design. You is how things work. So we are designing the experience of writing the book, so that we are productive in writing a book, and I don't think we're fully there yet. I don't think we've connected all the dots. I think we still have quite a bit of work to do, but I think that now we're in a much better place. So yeah, so let's capture these two because I think this is an interesting question and these interesting audiences for who the book is and what the book should be, and the next next phases of the book.
>
> Transcribed by https://otter.ai

---

## The agent's reading

Nineteen items. The founder's words are quoted where the wording carries the instruction;
everything unquoted is the agent's paraphrase and may be wrong.

1. **The book passes.** "There was actually not that much stuff I felt wanted to change.
   I thought the content was really well lined, the voicing was great. It felt very
   natural." The editorial choices, the pacing and the comments are all approved. This
   matters for scoping everything below: **what follows is not a rewrite.** It is a change
   of frame — structure, title, audience — around prose that is already right.

2. **Two changes are wanted**: "a couple changes to the book structure", and a decision
   about "the way we're going to be creating this for this sort of next release".

3. **The next release runs in parallel.** Leanpub supports new releases, so work on
   book C does not have to queue behind anything else. *Open question below: the memo says
   "we already have one release, which is official, and that's the version of LinPub",
   and the agent cannot tell whether the upload has now happened.*

4. **Build an agentic team.** The structure is specified exactly: "a folder that provides
   a whole bunch of definitions per role, so every role has a folder. Every role has a
   role.md, has actions, has briefs, has debriefs, and basically has this work
   environment."

5. **Why folders and not prompts.** Personas become agents that can be spun up in
   parallel, and isolation is the point: "sometimes it's important that they are isolated
   … it's also from a better sort of context management point of view."

6. **Why personas and not one generalist.** Focus, and something stronger — judgement.
   "It was very powerful when you have agents advocating for certain things, who have
   specific centres of gravity." Multiple opinions are the deliverable, not a side effect.

7. **They are not always on.** "They're not always going to be active." A role is a
   standing definition that gets woken for its area, not a process that runs continuously.

8. **The roles named in the memo**: the **librarian** ("responsible for indexing
   everything"), the **editor**, the **publisher**, the **developer** ("works on the tools
   and the code and the plumbing and the testing"), the **QA** agent, the **researcher**,
   and the **writer**.

9. **Every role is customised to this estate, and that is the whole point.** "It's not
   just a writer. It's a writer for this type of book. It's not just a researcher. It's a
   researcher for the kind of book that we are creating right now. It's not just a
   developer — it's a developer focusing on the JavaScript stack that we have, the CI
   pipeline that we have." A generic role definition would fail this brief.

10. **The team's late arrival is itself content for the book.** "It's important to say
    that they don't start here. In fact, look at the situation. I'm only introducing these
    now, not in the beginning." The book must not present the team as a starting
    condition, because it was not one.

11. **The first question to put through the team**: is the book's name correct? The
    founder's answer is no. *Creating a Book Using Fractal Semantic Graphs* does not hold
    up "because we are not using the fractal element here … although it's a graph-like
    environment, this is more about the workflows that we're creating."

12. **And the method for answering it is the point of the exercise**: "creating a plan and
    then defining which agents should have a voice on this, and which agents we should ask
    for an opinion". Then "a research project where we map out what is the book, what is
    the book about", and from that "a proposal for different names".

13. **Two audiences, in Wardley's terms** ("worldly maps" in the transcript is *Wardley
    maps*):
    - the **villager**, who "just wants to write a book", wants the tools and capabilities
      productised, and wants to understand the thinking and above all the workflows —
      "less developer focus and more operationalized";
    - the **explorer**, who wants "to understand how the sausage was made … but also they
      want to programme … they want to make those changes themselves".
    The founder's own judgement: the book leans explorer.

14. **The founder works at both levels at once.** "I operate at the user level, but I also
    provide the creation of the tools for the user." The book's real subject may be that
    double position rather than either half of it.

15. **Why tools get built here.** "I don't create tools because I want to create tools. I
    create tools because there's inefficiency, and I want to improve my efficiency."
    Maturity has a test: you stop wanting to change it. Named as already mature — the
    transcription flow, the way markdown files are created, the versioning.

16. **The non-functional thesis, stated plainly** and worth quoting in the book as it is
    said here: "the scaffolding is more important than the code. The testing is more
    important than the code … because with great tests and great environments and great
    feedback loops, you arrive at great code, but the other way around doesn't happen."
    With the estate's own evidence: "the more tests we have, the faster we go."

17. **The book undersells its own throughput.** "I even think sometimes the book underplays
    the amount of stuff that we ship." A correction the writer can make with computed
    numbers rather than adjectives.

18. **Where the title is pointing.** "This book then is more about writing a book with
    Claude … it's almost like the idea that we're building the ship as we're preparing to
    fly" — developing as you go, and "creating environments and creating experiments that
    have a level of quality that was never there before". Plus the Wardley motion:
    "we keep productizing, commoditizing, smaller and smaller components, so that we gain
    speed and we focus on the higher order things." And the design claim: **"refactor is
    like the power of design."**

19. **An honest limit, from the founder.** "I don't think we're fully there yet. I don't
    think we've connected all the dots. I think we still have quite a bit of work to do."

## What the agent needs answered

- **Has the Leanpub upload happened?** Item 3 reads as though a release now exists.
  The last exchange left it open and explicitly unblocked from v0.6.0. It matters here for
  a concrete reason: if the book is published, then a title change is a **re-titling of a
  released work**, which is a different act from renaming a draft, and the change-control
  record should say so.
- **The Send project's role definitions could not be read.** The memo names
  `SGraph-AI__App__Send` as the reference for team structure. That repository is outside
  this session's scope and could not be fetched, so the team below is built from the
  structure the memo itself specifies. If the Send definitions carry conventions worth
  inheriting, they should be folded in rather than reinvented.
- **Does the retitling extend to book B?** *Fractal Semantic Graphs: Meaning Through
  Connectivity* genuinely is about fractal semantic graphs; the objection in item 11 lands
  on book C alone, which borrowed the phrase without using the idea. The agent has assumed
  book B's title stands.
