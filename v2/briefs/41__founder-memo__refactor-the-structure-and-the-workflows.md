# Brief 41 — founder memo: refactor the structure, and formalise the workflows

**Date:** 28 August 2026
**Source:** a voice memo (Otter transcription, speaker label and timestamp preserved),
recorded while reviewing the title question and stopping to deal with structure first.
It carries a change of publishing order, a proposed folder restructure, and the beginning
of a compatibility model for shared technology.
Reproduced verbatim below. The numbered reading beneath it is the agent's, for the founder
to correct, and it disagrees with one part of the memo on measured grounds.

---

## The memo, verbatim

> Dinis Cruz 0:01
> Okay, so as I review the title, and there's a topic I want to cover here. But before, let's just quickly talk about the structure and the refactoring. So, one of the key principles that I feel it's very important to have here is the ability to refactor, which is something that we basically adopting in software. And the thing the refactoring is always about make it better than it was before, and deal with the side effects. And I think what's interesting about our case is that because we have not shipped the book, because we have not actually released anything, we can literally change almost anything on the site, right? And this site does not have a lot of readers, and part of the reason why I want to have such a strong historical is because that's also the story, like we have right now, right? Like I think the the history, as you've seen, is is very important because, especially one of the reasons I think the making, the book book, was so effective. Is because the agent that wrote it was able to read the story and really understand where we come from, right? And in a way, and sometimes you do have these sort of mega paths or mega mega, I say, concepts that emerge that we need to embrace as we evolve. So, if you think about it, like the first thing I want to just clear clear here is that we started this journey by writing a book, and now we have two books. And in fact, I actually think the first book I want to publish that I want to talk about, because actually it is more mature, and is the book that I think will add value, and that has a market right now. Is the book about the making of a book, because that's the book that encapsulates a lot of the ideas of the workflow, which I want to talk next, in a in a practical way, right? And and I thought I want to reuse that book first because, in a way, the the graph book is a very mainly designed for providing references to other agents. B is a book that will take a couple more rounds to create, and it's okay, right? And it's probably a book that needs, ironically, it's a book that needs the technology advancements, advancements that we're going to do in the making a book to be happen, right? So, so actually, so let's let's basically refactor. Am I thinking here? Is I think we should have the top level should be books, right? So from a from a kind of structure point of view, is the top level entry should be books. Then you have the graph book, and then you have the making a book book, and then which we can call fractal semantic graphs, right? Because that's that is the name of the book, and that's not going to change, right? So, so we have that book, and then we have the making a book, book, and with agents. Maybe that's the name, making a book with agents. That can be a remember that that can be a temporary hold, right? Because you know, one of the powers of the scripts that you created, and this is literally the power of refactoring. I don't think a lot of people understand is that refactoring is not just so you can catch mistakes; it's so you can make changes, and you can make changes sometimes big changes. But you're comfortable making big changes because you know what will break, and once you know what will break, making a change is just an overhead to pay, right? And and these days again, the power of agents is that the agents can take that overhead, right? And just a couple more cycles, a couple more tokens, right? So it becomes much more straightforward. So what I think we should do is I think we should have the top level is books. So the top level folder and navigation is books. Then you have book title because again we might add another book on this run. You have book title. Then you have the the main. So this is kind of like the major versions in the bit that we're working on. This is not the version of the book. So so I think what we have here is we call it V1, V2 of the book, right? Technically, to be honest, if we were going to adopt the terminology that we've done on the other books, we call it we would call it V 0.1, V 02, because actually that's and that might be better to do that. So, so what we have is what we are calling v1 should actually be 0.1. What we calling v2 should be 0.2. So that means that if you think about it, we now have for the fractal semantic graph we have v0.1 and v0.2. That's the two versions that we have created, and for the making a book we have v0.1. So, for example, like that means that every folder, every file, everything that we created should be in there, and it's okay to go back and change a little bit the history or change a bit the content. Where where needed, leave a note or maybe leave a historical note to say, hey, for example, we a lot of our initial work started v1, and now we're going to call it v0.1, and actually it started as v1. You know, if you think about, we already done some major refactorings. This is just another one of those. So, so that makes sense. Okay, so let's restructure the book, and and and the reason again for versioning, and this is the other super powerful thing here, right? The reason versioning is so important, as you already found out, is that it basically allows us to be a lot more granular on the changes and allow us to keep a very strong historical record of what changed. And again, that cannot be underestimated because that's how you build history, like you know. Again, it's not coincidence that you're now able to write those amazing retrospectives and those amazing sort of like this is what happens because we version everything. And and in this case, for example, it means that you know again remember that we could be making, and especially because we will now start to have, for example, technology that is independent from the books, right? We will have technology that is not shared, and we have technology that exists per book. Although you have to be careful because we have to make sure that the previous version of the book still kind of works to a level. So you have to be a little bit careful on how you manage that, but but there's a lot of technology, and and maybe what you do is you do this with compatibility. Maybe you start to track the shared technology. You start to say, for example, like we're going to have technology and tools that only work on the Version V v2 or v2 five plus, or between v2 five and X or whatever, you're going to have a version that manage that, so so that you have. Okay, so so that you have you know we we we know you know how to use that because, for example, again what I want to talk about next is we've got to start developing technology that applies to both books. So again, you you have only one code base for that, or at least one part of the code base. And again, when we make incompatible changes, or we we think about moving forward, then then what we have is you might need to move some of the code historically into one of those archives, so that we make sure that the the code so it still works over time, and that's very important, right? So because we need to you know a bit go back, so cool. So that that needs to be figured out, and again, that's why your tests are important because your tests allows us to control this in a much better way than that you have there, right? So cool. All right, let's process that.
>
> Transcribed by https://otter.ai

---

## The agent's reading

Fourteen items. Item 7 disagrees with the memo, on measured grounds, and is the reason the
restructure has not been executed on the strength of this brief alone.

1. **Refactoring is a first-class capability, not a tidy-up.** *"Refactoring is not just so
   you can catch mistakes; it's so you can make changes, and you can make changes sometimes
   big changes. But you're comfortable making big changes because you know what will
   break."* The tests are what make a large move affordable, and the agent is what makes
   the overhead cheap: *"just a couple more cycles, a couple more tokens."*

2. **The window is open because nothing has shipped.** *"Because we have not shipped the
   book, because we have not actually released anything, we can literally change almost
   anything on the site."* True today. It closes the day the first Leanpub listing exists.

3. **The history is the product, not a by-product.** *"One of the reasons I think the
   making-of book was so effective is because the agent that wrote it was able to read the
   story."* This constrains the refactor: a move that breaks the readability of the history
   costs more than it saves.

4. **The publishing order changes.** The making-of book goes **first**. It is *"more
   mature"*, it *"has a market right now"*, and it carries the workflow ideas practically.
   *Fractal Semantic Graphs* is *"mainly designed for providing references to other
   agents"*, needs *"a couple more rounds"*, and — the founder's own irony — *"needs the
   technology advancements that we're going to do in the making-a-book to happen."*

5. **Two titles, one settled and one held.** *Fractal Semantic Graphs* is fixed: *"that is
   the name of the book, and that's not going to change."* The making-of book is
   tentatively ***Making a Book with Agents***, explicitly *"a temporary hold"*. That is
   close to candidate A from the naming pack and it says **agents**, not Claude.

6. **The proposed shape**: `books/` at the top level, then the book, then the version, and
   the version numbers should follow the book convention: what is called `v1` becomes
   **v0.1**, what is called `v2` becomes **v0.2**. So *Fractal Semantic Graphs* has v0.1
   and v0.2; the making-of book has v0.1.

7. **The agent disagrees with one part, and the disagreement is measured.** The memo says
   *"every folder, every file, everything that we created should be in there"* — inside the
   book and its version. Measured against the tree as it stands:

   | | Pages | Of which are the book | Not the book |
   |---|---|---|---|
   | `v1/` | 94 | 22 (`v1/book/`) | **72** |
   | `v2/` | 142 | 53 (`v2/books/`, all three) | **89** |

   And the freeze is worse: `v1/MANIFEST.json` hashes **200 files by path**, of which only
   **28** are inside `v1/book/`. **172 frozen files are elsewhere in `v1/`** — the vaults,
   the examples, the grammar, the source documents, the first twenty briefs.

   `v1/` and `v2/` are **not** editions of a book. Each contains one edition plus a great
   deal that is not a book at all. Filing the reference site, the WCLM, the team and the
   briefs inside *Fractal Semantic Graphs v0.1* would say something untrue about all of
   them. **The right split is by what a thing IS, not by when it was made** — which is the
   corpus's own rule about types, applied to its own folders.

8. **The memo already contains the correction.** Later in the same recording: *"we will now
   start to have technology that is independent from the books… technology that is not
   shared, and technology that exists per book."* That is the same distinction. The
   proposal in item 6 and the observation in item 8 pull in opposite directions, and item 8
   is the one that holds.

9. **Rewriting some history is sanctioned, with a note.** *"It's okay to go back and change
   a little bit the history… leave a historical note to say, hey, a lot of our initial work
   started v1, and now we're going to call it v0.1."* This is permission, and it has a
   limit the agent will hold to: **founder memos stay verbatim** and **narrated release
   rows stay as written**, because both are evidence rather than documentation.

10. **Why versioning earns its cost**: granularity and record. *"That's how you build
    history… it's not a coincidence that you're now able to write those retrospectives."*

11. **Compatibility becomes a tracked thing.** *"Tools that only work on version v2 or
    v2.5+, or between v2.5 and X."* Shared technology needs a declared version range per
    book, and an older book version must keep working.

12. **Archived code is a real requirement.** *"You might need to move some of the code
    historically into one of those archives, so that the code still works over time."* A
    frozen edition that no longer renders is not frozen, it is broken.

13. **The tests are the control.** *"That's why your tests are important, because your tests
    allow us to control this in a much better way."* Any structural move must be gated
    before it is made, not after.

14. **Next memo is about shared technology across both books.** *"What I want to talk about
    next is we've got to start developing technology that applies to both books."*

## What the agent did with this

Wrote the review rather than the move. The memo asks *"can you review these ideas"*, the
correction in item 7 changes the shape of the answer, and a 258-page restructure executed
on an uncorrected model would be the expensive kind of refactor rather than the cheap kind.
The review, the proposed structure, the costs and the phasing are in
[the structure pack](../dev-pack/structure-00-the-review.html); the workflow definitions the
memo also asks for are beside it.
