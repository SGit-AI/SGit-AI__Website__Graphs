# Brief 37 — founder memo: keep zooming — the code itself gets the graph treatment

**Date:** 26 August 2026
**Source:** a typed message, sent minutes after v0.5.8 went live ("That worked great,
let's keep zooming"). Reproduced verbatim below. The instruction table is the agent's
reading, for the founder to correct.

---

## The memo, verbatim

> That worked great, let’s keep zooming
>
> - on the JavaScript pages, can you add a couple views that explain in a graph and visual
>   way what is going on: I know JS very well, but at the moment since I don’t have the
>   context you have, those scripts (although small) are still hard to read and understand
>   what is going on. Basically can you apply the graphs of graphs approach here, the
>   visualisation of grouping specific parts of the code and providing an explanation on a
>   right pane on what it does, what the variables do and what are the inputs and outputs
>   of those inner bits of code. Basically think : what would Brett victor do to explain
>   and visualise what this code is going (to an audience that knows what JS is, so no need
>   to explain what a variable is) . Actually, architecture and flowcharts and fluxograms
>   of the code would be great
> - can you apply the same visualisation and visual linking of components , data or ids
>   that we did on the main WCLM, so that we can make these operators much easier to
>   understand, explain and debug (think of each operator as a mini app that can have its
>   own js and css (for experiments, see below the productization path for the best ones))
> - see if this also apply to some of the json data files
> -in fact view the development of these minor data/operators visualizations as a way to
>   PoC and experiment with all sorts of ways to see, run, visualise  and debug these
>   operators (in a smaller problem space and code base) , in a way that we can then apply
>   the best ones (ie the ones that worked) to the main WCLM UI and workflows

---

## The agent's reading: the instructions, numbered

1. **The code gets the extraction treatment.** The graphs-of-graphs move, applied one zoom
   further in: an operator is a node in the pipeline graph, and zooming into it should open
   its own graph — the code's. *Built: every operator folder gains an authored
   `anatomy.json` — the code sliced into contiguous SEGMENTS, each a node with an id, a
   kind (docs, imports, data, contract, step, export), what it does in one or two
   sentences written for someone who knows JS, its variables with their roles, what it
   reads and writes, and `feeds` edges to the segments it drives. Anchoring follows the
   estate's own discipline: each segment is anchored by the exact text of its first line,
   the build resolves heads to line numbers, and a gate fails the release if the anatomy
   and the code drift — the extraction rule, applied to source.*

2. **The anatomy view — what Bret Victor would want on the right pane.** *Built: the
   explorer's rendered tab for a js file becomes the anatomy: a FLOWCHART of the segments
   at the top (kind-coloured boxes, feeds arrows — the fluxogram), the code below grouped
   into its segments (tinted, each block titled), and the explanation pane on the right —
   what this bit does, a variables table, its inputs and outputs, and clickable fed-by /
   feeds hops. Clicking a flow box, a code block or a hop selects the same segment
   everywhere: one id, three linked views. The tinted source stays one tab away on raw.*

3. **The WCLM's visual linking, inside every workbench.** *Built: the execute view stops
   showing JSON dumps and renders the operator the way the main WCLM page renders a layer
   — the input as the previous layer's evidence CHIPS, the operator box between, the
   output as the operator's own rendered chips, wired chip-to-chip with the same strict
   adjacency, every chip clickable for its record. The JSON moved to debug, where it
   belongs. And each operator is now honestly a mini app: the workbench loads an optional
   `<key>.css` from the folder if one exists, so an operator can be skinned or
   experimented on without touching the shared shell; a per-folder experiment js hook is
   the recorded next step if wanted.*

4. **The same zoom for json.** *Built where it earns its place this round: the schema's
   rendered view now DRAWS the typed IO flow (the same diagram the workbench header
   shows, from the same schema), on top of the contract table. The examples and data
   views keep their v0.5.8 tables — the anatomy pattern (segments, ids, linked panes) is
   the candidate for their next zoom, noted in the lab list below.*

5. **This is the lab.** The operator visualisations are the PoC space: small code, small
   data, fast rounds — try ways to see, run, visualise and debug, keep what works, then
   promote the winners into the main WCLM UI and workflows. *Recorded as the working
   frame. The lab list as of this round — proven here and candidates for promotion:
   chip-and-wire execute (already shared code with the main page by construction); the
   anatomy's one-id-three-views selection (candidate: the main page's layer cards could
   open the operator anatomy in place); vector replay as an in-page test button
   (candidate: a "replay the examples" control on the main WCLM page); the typed IO flow
   drawn from schema (already in both). Experiments that fail stay in the folders as
   recorded attempts — that is what a lab's notebook is for.*

## The agent's notes back

- **Anatomy is authored, not parsed.** No JS parser pretends to understand intent; the
  agent proposes the segmentation and the explanations, the founder corrects them, and
  the anchor gate keeps them honest against the code — the same trust model as the
  extraction and every register. When an operator's code changes, the build fails until
  its anatomy is re-anchored, which is exactly the reminder wanted.
- **Question — anatomy for the shared modules.** engine.js, opruntime.js, render.js and
  the page shells would benefit from the same treatment; this round covers the twelve
  operator files (the lab's problem space). Extending to the shared core is mechanical
  once the founder confirms the format reads well.
- **Question — the experiment hook.** The css hook ships this round. If a folder should
  also carry `<key>.lab.js` (custom panels, alternative visualisations, mounted beside
  the shared workbench), say so and it lands next round with the same pattern.
