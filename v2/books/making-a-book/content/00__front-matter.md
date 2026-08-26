# Creating a Book Using Fractal Semantic Graphs

**How one book was built with an agent, in six days and eighty-eight releases**

---

## What this book is

This is the true story of how a second book got built, told for people who want to
build one the same way.

The book being built is *Fractal Semantic Graphs: Meaning Through Connectivity*. It is
not finished. Its first edition shipped, was frozen, and now sits at `/v1/` of a
website called graphs.sgit.ai; the second edition is being written now, out in the
open, by one person talking into a phone and a set of AI agents turning what he says
into working software and rendered pages, several times a day.

Everything in this book happened between the morning of 21 August 2026 and the evening
of 26 August 2026. In those six days the repository behind that website went from
version v0.1.0 to version v0.5.11: eighty-eight tagged releases, each one validated,
tagged and deployed by a machine, each one carrying a paragraph in a public release
table saying what changed and why.

The story stops at v0.5.11 because that is where the repository was when this book was
commissioned. It ends cleanly, not tidily. The second book is not written. What exists
is the machine for writing it, and the machine is the interesting part.

## Who it is for

You have a book in you. You have an AI agent at hand. You suspect the two facts are
related and you do not know what the working day actually looks like.

That is the reader this book is written for. You do not need to know what a graph
database is. You do not need to be able to program. Roughly nothing in the six days
described here required the author to write a line of code, and the parts that did are
called out where they happen.

What you do need is the willingness to run a repository, ship small, and be told when
you are wrong by a test rather than by a reader.

## What you will know at the end that you do not know now

1. **The shape of the working day.** A loop that runs voice memo, verbatim brief, build,
   release, live review, usually inside one hour. The evidence for it, and the numbers
   underneath it.
2. **Why verbatim beats paraphrase.** The single highest-leverage habit in the whole
   method, and the one most authors get wrong on day one.
3. **Why gates make you faster.** Eighty-eight releases in six days was possible because
   of the test suite, not despite it. The counterintuitive arithmetic of that.
4. **What failure looks like here.** Six real failures, told with the cost attached: an
   hour lost to a browser that would not die, a bug caught on an iPad that no test
   would have found, a wire that jumped a layer and betrayed the whole architecture.
5. **How to steer an agent.** What the memos actually contain, why the good ones are
   specific and small, and what "does this make sense, any questions?" buys you.
6. **A playbook you can start on Monday.** Chapter 11 stands alone. Tear it out. It
   lists what to set up, what to say first, what to expect to go wrong, and what it
   costs.

## How to check anything in this book

Every scene here can be re-opened.

The repository carries a git tag for every one of the eighty-eight releases. Every
figure in this book was taken by checking out the tag its caption names, serving that
checkout on a local port, and photographing the page as it actually was on the day.
None of the screenshots are reconstructions. Appendix C gives the exact scripts.

Every number was computed, not remembered. Where a number comes from the release table
it is quoted; where it comes from git history the command that produced it is in
Appendix C. Where the corpus is silent, this book says so.

Every quotation from the founder is verbatim, including the transcription errors, and
is already published in the repository at the brief it names. The readings around those
quotations are the agent's, and are marked as such, exactly as they are in the source.

## Disclosure

This book was written by an AI agent (a Claude Code session) working from a written
commission, on the repository it describes. That is the same arrangement the book
describes, applied to itself, which is both the point and a hazard: an agent narrating
a method it is itself an instance of has an obvious interest in the method looking good.

Three things are done about it.

The judgements are marked as judgements. Where this book says a thing worked, the
evidence is named and you can disagree with the reading. Where it says a thing failed,
the failure is a matter of public record in the release table, not an admission
extracted under duress.

The failures get real space. Chapter 7 is the longest chapter for a reason.

The costs are stated. Chapter 12 is about what this method does not buy, what it charges,
and the four situations in which you should do something else.

The wider disclosure the estate already publishes applies here too. The people who
built this have an interest in the argument being right: they sell tools built on it.
That is worth holding in mind in every chapter, and particularly in the ones where the
story is elegant.

## What is locked and what is not

The title of the book being written, *Fractal Semantic Graphs: Meaning Through
Connectivity*, is the founder's and is fixed. The title of this book, *Creating a Book
Using Fractal Semantic Graphs*, was set in the commission. Everything else here,
structure, chapter count, voice, which figures to take and which stories to tell, was
the writing agent's call, made confidently, and is recorded as such.

One position from the corpus travels with everything in this book, because the corpus
insists on it and would be misrepresented without it: **this is not a graph database
pitch**. There is no graph database anywhere in the system described here, and no
RDF, SPARQL or Cypher in the code. The graphs are JSON files in a git repository.

---

**Version** written against graphs.sgit.ai at v0.5.11, 26 August 2026.
**Licence** Creative Commons Attribution 4.0 International (CC BY 4.0).
**The repository** `SGit-AI/SGit-AI__Website__Graphs`, branch `dev`, tags `v0.1.0` to `v0.5.11`.
