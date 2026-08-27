# 9 · The experiments

*After this chapter you will know how a "crazy experiment" travelled from a voice memo to
a tested, folder-structured subsystem in eight releases across one afternoon, and you will
have a template for running experiments in your own project without them either dying
quietly or taking the project over.*

---

## Building a lab

Every project of this kind acquires a graveyard of half-finished ideas. This one has a
different arrangement, and the arrangement is stated in the memo that started the biggest
experiment of the six days.

Brief 31, 26 August, the founder's voice memo:

> Okay, so using the artefacts that we've created, but I think you probably want to do
> this in a separate folder because this is in a sort of bit of a crazy experiment. But I
> would like to see how it can actually work.

And a little later, twice more:

> So what I would like to kind of create is a mini engine again. Do this in separate code,
> so that we can then figure out how to bring this back.

Three constraints in one breath: **separate folder, separate code, separate page**. The
release note for v0.5.2 records them as instructions and takes them literally: the whole
thing was built at `/v2/wclm/` with its own code and its own page.

This is the pattern. An experiment gets its own address so that it can be abandoned
without surgery, or promoted deliberately. The founder says the second half out loud
("figure out how to bring this back") at the moment he asks for the first half. The
experiment is scoped and its exit is named before a line of it exists.

Six releases later, at v0.5.9, the founder wrote the frame down completely:

> in fact view the development of these minor data/operators visualizations as a way to
> PoC and experiment with all sorts of ways to see, run, visualise and debug these
> operators (in a smaller problem space and code base), in a way that we can then apply
> the best ones (ie the ones that worked) to the main WCLM UI and workflows

A small problem space is a lab. Try things there where the blast radius is small, and
promote the ones that work into the main surface. The v0.5.9 release note names which
candidates were already promoted and which are queued.

## What the experiment was

The idea in brief 31 is a good one to explain because it is not really about language
models at all.

The founder's argument: a language model is not picking the next word at random. It has
built a rich internal model of the world and consults it. So, he asks, what if we build
something with the *shape* of a transformer, over graphs we already have, where nothing is
learned and everything is named?

> the main thing I want to map and visualise is the look back and the attention, and that
> loops that were created between the different layers. So I think would be cool is why
> don't we maybe start with five layers or seven layers, you know, like neural networks

And the query flips. Not "what word comes next" but:

> instead of maybe that's a better analogy, but this is not about about creating just
> embeddings. It's about visually representing and give us the example and the provenance
> and the paths between a component, an example, another example, and the concept. And I
> think this is where maybe instead of going from predicting the next word, we can be what
> is the definition of something?

He also named it. Not a large language model but, in his words, "a words content language
model": the WCLM.

## What shipped, in one afternoon

**v0.5.2, 13:44.** Six layers, each a pure deterministic function: tokenise, resolve,
attend, bind, expand, converge. Tokens are content hashes, so the same word tokenises
identically in every document with no registry anywhere. Every weight is a stated formula
written into a world file rather than a fitted number, which means, as the release note
puts it, "training the model is editing graph inputs and meaning packs, never fitting
numbers". The page draws the six layers as columns with weighted arcs between them.

One detail from that note is the best small story in the release table:

> one ranking bug in this very build was fixed by editing the bind formula, the training
> loop working as designed

The engine ranked something wrongly. The fix was to edit a formula in a data file. That is
what "nothing is learned and everything is named" buys you: a bug in the model's judgement
is a text edit.

**v0.5.3, 14:17.** Thirty-three minutes later, every box on the page is clickable and
explains itself in both directions: what produced it, with the reason on each wire, and
what it feeds. Appendix A reproduces the memo that asked for this and annotates it
segment by segment.

**v0.5.4, 15:35.** The detective playbook. Strict layer adjacency after the founder caught
a wire jumping (Chapter 7), negation handling after he ran "meaning without connectivity"
and got the wrong answer, a normalise stage that repairs misspellings and says what it
repaired, and the pipeline as eight reusable blocks you can toggle off and drag to
reorder.

**v0.5.5, 16:10.** Three separate instructions that arrived across one afternoon, shipped
together. Words get multiple senses across industries, with the document's own sense first;
picking a different sense for "graph" makes the engine say which of the universe's claims
stop applying. Layers can hold several engines side by side. And every engine declares its
input and output types, so compatibility becomes structural: an engine placed where its
input type has not been written is skipped, with the type named.

**v0.5.6, 16:27.** Analogies. The memo's ask, in the founder's words: to explain this
material to somebody from finance, do not repeat the words, find the equivalent concept in
their world. "Graphs of graphs" becomes spreadsheets of spreadsheets. An anchor node
becomes the chart of accounts. Sixteen concepts mapped into three audiences, each carrying
the reason for the mapping, and an honest "no analogy authored yet" wherever the register
has a gap.

**v0.5.7, 17:20.** The restructure, which gets its own section below.

**v0.5.8, 18:08.** An iPad review of v0.5.7 with four screenshots and four findings, each
fixed where it pointed.

**v0.5.9, 18:47.** The code itself gets the graph treatment.

Eight releases. Five hours and four minutes from the first to the last.

## The restructure: twelve folders

Brief 36 is a typed message, not a voice memo, and it is short. It points at a file
explorer that had been built for the document five releases earlier and asks for the same
treatment for the engine's own building blocks:

> Great, now I would like to work and fine tune each of those operators individually
>
> Like you did for the document's folder (file explorer + views)

Then a list: put them in a dedicated folder, create a view of the files, create the
markdown and html and js inside, schemas as files, examples and sample data, a reusable
workbench for execute and test and debug, and visual representations of the architecture.

What shipped at v0.5.7 is a real restructure, not a presentational one. The twelve
operators moved into twelve folders, and the file in each folder is the code the engine
actually imports. The shared engine file went from 374 lines to 161. The diff is 159 files
changed and 12,705 lines added. Seventy-four files live under the operators directory at
that release, and eighty-six by v0.5.11.

Each folder holds six kinds of artefact, and the six are worth listing because they are a
template:

- **the code** the engine really imports, not a copy;
- **the book page**, markdown, explaining what it does and walking through the
  transformation with an ascii architecture diagram;
- **the schema**, generated from the code's own declaration and gate-checked against it,
  so the description of the contract cannot drift from the contract;
- **the official data**, with the provenance of each item as a field rather than a
  comment: standard across every document, authored for review, or derived by another
  transformation;
- **the example vectors**, real input and output slices captured by running the engine.
  Thirty-nine across the twelve, and every one is replayed by a gate on every build;
- **the workbench**, a reusable page shell with execute, test and debug, which each
  operator can extend with its own controls.

The model for it had shipped five releases earlier, at v0.5.1, for the pilot document:
a file tree on the left, the file on the right, every file readable as exact bytes or as
a data-driven view, every file deep-linkable.

![The document's file explorer at v0.5.1, showing the identity ledger rendered as a table.](figures/08__v0.5.1__file-explorer-raw-and-rendered.png)

*Figure 16. `/v2/universe/thinking-in-graphs.files.html` at tag `v0.5.1`, 26 August 2026,
deep-linked to the pilot document's identity ledger.*

![The operator explorer at v0.5.7: twelve folders, every file readable raw or rendered.](figures/11__v0.5.7__the-operator-explorer.png)

*Figure 17. `/v2/wclm/operators/` at tag `v0.5.7`, 26 August 2026.*

![The workbench for one operator: input, transformation, output.](figures/12__v0.5.7__the-operator-workbench.png)

*Figure 18. `/v2/wclm/operators/tokenise/` at tag `v0.5.7`, 26 August 2026.*

Two things about this restructure are worth an author's attention even if they never build
an engine.

**The schema is generated from the code and gate-checked against it.** A description of
what something does, that cannot disagree with what it does, because a build fails if they
diverge. Apply that idea to a book: a summary generated from the chapter, with a gate that
fails if the chapter changes and the summary does not.

**Every example is replayed on every build.** Thirty-nine captured input-output pairs that
have to keep producing the same output forever. The release note calls them "deterministic
by construction", because they were captured by running the real engine rather than being
written by hand.

## Keeping zooming

Brief 37 arrived minutes after v0.5.8 went live, and it is four bullet points long. The
first one:

> on the JavaScript pages, can you add a couple views that explain in a graph and visual
> way what is going on: I know JS very well, but at the moment since I don't have the
> context you have, those scripts (although small) are still hard to read and understand
> what is going on. Basically can you apply the graphs of graphs approach here […]
> Basically think : what would Brett victor do to explain and visualise what this code is
> going

The ask is: apply the project's own extraction discipline one zoom further in, to the
source code itself.

What shipped is the same discipline exactly. Each operator's code is sliced into
contiguous authored segments. Each segment is a node with a kind, a description written
for somebody who already knows JavaScript, the variables it uses and their roles, what it
reads and writes, and edges to the segments it drives. Each segment is anchored to the
exact text of its first line, the build resolves those to line ranges, and the ranges must
tile the file completely. A gate fails the release the moment the code and its description
drift apart.

![The anatomy view: the flow diagram, the segmented code, and the explanation pane, all driven by one identifier.](figures/14__v0.5.9__the-code-anatomy-view.png)

*Figure 19. `/v2/wclm/operators/index.html#tokenise/tokenise.js` at tag `v0.5.9`, 26 August
2026.*

Click a box in the flow, a block of code, or an entry in the explanation, and the same
segment lights in all three.

Notice that the mechanism is the one from v0.4.5, unchanged: anchor an assertion to the
exact bytes it is about, and let a build gate check the anchor. It was applied to a
document first, then to the document's own structure, then to an engine's data, and now to
source code. That reuse is not a coincidence, it is the fractal claim the whole book is
about, applied by the people making the argument to their own tools.

![The WCLM at v0.5.9, after eight releases in one afternoon.](figures/13__v0.5.9__the-wclm-today.png)

*Figure 20. `/v2/wclm/` at tag `v0.5.9`, 26 August 2026.*

## How to run experiments this way

Four rules, each of which the corpus states in its own words:

1. **Separate folder, separate code, separate page.** So it can be abandoned without
   surgery.
2. **Name the exit at the start.** "So that we can then figure out how to bring this back."
3. **Register it honestly.** The methods register carries thirty-five techniques; the WCLM
   is entry thirty-five and its status is `experiment`, not `in use`. Every other entry
   names the release where it first shipped.
4. **Promote what worked, and say which.** The v0.5.9 note names the promotion candidates
   by name: the chip-and-wire execute view (which already shares its code with the main
   page by construction), the anatomy view's one-identifier-three-views selection, and the
   in-page replay.

An experiment nobody promotes is a hobby. An experiment nobody scopes is a rewrite. This
one was both scoped and promoted, in public, in nine hours.

---

**Where the live estate shows this.** The WCLM is at `/v2/wclm/`, the twelve operators at
`/v2/wclm/operators/`, and each operator's workbench at
`/v2/wclm/operators/<name>/`. The memos behind them are briefs 31 to 37 at `/v2/memos/`.
The methods register, with the WCLM marked as an experiment, is at `/v2/methods/`.
