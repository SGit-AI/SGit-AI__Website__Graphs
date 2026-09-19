# Brief 46 — founder memo: the reader who followed the link

**Date:** 19 September 2026
**Source:** two typed messages in the working session, with a screenshot of a LinkedIn
thread attached to the first. Typed rather than spoken, so there is no transcription to
preserve; the typing artefacts are preserved instead, as the memo convention requires.
Reproduced verbatim below. The numbered reading beneath it is the agent's.

---

## The messages, verbatim

> Hi Fable can you take a step back and look at our current homepage of this site and see how it is not doing a good justice to the content and ideas and ever tools and visualizations that we have created in this site / For example when I make reference to it on pic1 , that reader will be lost

*(pic1 is a screenshot of a LinkedIn comment thread. Its two comments, transcribed from
the image:)*

> **Kevin H.** — Dinis Cruz, I've never heard of fractal semantic graphs and am now going down a rabbit hole on it. Thank you!
>
> **Dinis Cruz** — I've written quite a lot about it at graphs.sgit.ai

And, after the analysis was delivered:

> Move the current homepage to its own page and focus on answering the questions and issues the you identified in your analysis

---

## The agent's reading

### 1. The memo names a specific reader, not an audience

Kevin has done three things in order: heard the phrase, not recognised it, and followed
a link that was offered as the answer. He arrives knowing exactly one string,
*fractal semantic graphs*, and wanting it defined. The founder's phrase for what happens
next is *"that reader will be lost"*, and the test the front page has to pass is
therefore narrow and checkable: does the page answer the phrase he came with.

### 2. What the page actually did, measured

The analysis that prompted the second message counted the front page rather than
describing it. The numbers, from the version on disk at v0.6.19:

| What | Count |
|---|---|
| Words in `<main>` | 1,525 |
| Occurrences of *book* | 31 |
| Occurrences of *graph* | 30 |
| Occurrences of *fractal* | **4** |
| …of those four, inside a book title or a filename | **4** |
| Images, SVG, canvas, custom elements | **0** |
| Words above the fold, on a phone | **14** |

The phrase the reader arrived with appeared four times and was defined none. The page
argued in prose that meaning is visible through connectivity while showing nothing.

### 3. The instruction is a split, not a rewrite

*"Move the current homepage to its own page"* is precise and it settles the open question
the analysis had put back to the founder. The archive is not the problem and is not to be
trimmed: it is to stop being the first thing a stranger meets. Everything it carried, the
shelf, the sequence of events, the section table and the complete first-edition index,
moves whole to `/site/` and keeps every link.

### 4. *"focus on answering the questions and issues"* fixes the brief for the new page

The six the analysis identified, and what each turns into:

1. The headline was the domain name. **Now it is the claim.**
2. The phrase was never defined. **Now it is answered above the fold, in the corpus's
   own words, quoted and checked byte for byte against the carried document on every
   build.**
3. The page was about books and governance rather than the idea. **Now the idea is first
   and the shelf is one link.**
4. Nothing on it moved or could be touched. **Now the corpus's own worked example is a
   live graph: add the edges one at a time and read what the graph becomes able to say.**
5. A phone got fourteen words. **It now gets the phrase, the claim and the whole
   definition in the first screen.**
6. The state map, the project board and the figure viewer were linked from nowhere.
   **All three are on the front page.**

### 5. The one thing the memo does not ask for, and which the estate's own rules do

A front page is the page nobody re-reads. So the split comes with a gate that fails the
build if the front door stops defining the phrase the site is found by, stops
demonstrating it, or stops naming its archive, and the gate was run red against a page
with the definition removed before it was trusted. Writing it turned up that
`gen_front.py` had never been in the build chain at all, which is why the page's own
release count had been nine releases stale while every other gate reported green.
