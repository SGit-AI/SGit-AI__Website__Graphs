# Brief 33 — founder review: the detective playbook (narrated, over the WCLM)

**Date:** 26 August 2026
**Source:** a narrated review (tools.sgraph.ai) of the WCLM page: 8 moments over 07:04, the
founder's voice joined to screenshots, delivered trimmed to exactly what the agent uses
(words and images; no PDF, no audio in the working copy). The verbatim moments and the
cleanup model's flagged corrections are preserved in the review file; this brief carries the
findings and what each commits the work to.
**Verdict recorded first:** "this is looking really good."

---

## The findings, each connected to its screen

1. **Layers must not be jumped** (moment 2, the connectivity click). The screenshot shows
   the wire running from L2 resolve straight to L4 bind, and from L4 straight to L6 —
   exactly what the founder called weird, because "in principle, every layer should be a bit
   independent from the previous one, so you shouldn't have layers jumping." The finding is
   correct: the wiring violated the model's own claim. Committed: **strict adjacency**. The
   attend layer now carries a profile chip per surviving token (its pairs stacked vertically
   between profiles, as asked), so binding wires from attention, not from resolve; the
   expand layer now carries one assembled chip per bound meaning (its neighbourhood gathered
   inside), so converge wires from expansion, not from bind. Every wire connects adjacent
   executed layers only.

2. **The detective playbook** (moments 2 and 5). "Every layer has to add a bit of evidence,
   or chooses to drop evidence… when I click on this one at the end, what I expect to see is
   all the connections backwards — every piece of evidence that was created to get here."
   Committed: clicking any chip now lights the **transitive** trace, the full ancestry back
   to the tokens and the full descent to the answer, not just the direct neighbours.

3. **"Through" matters, and "meaning without connectivity" must not equal "meaning through
   connectivity"** (moments 6–7, the founder's live experiment). He ran the negated phrase
   and got the same winner — rightly called wrong. Committed: an **operators block**: the
   little words that flip meaning (without, not, no, never, versus) are marked, the negated
   word is excluded from positive binding, and when the negated word belongs to the label of
   the world's own claims, the answer carries the contradiction openly: negating
   connectivity contradicts this universe's central claim.

4. **The dictionary and thesaurus belong in the early layers** (moment 7). Committed: a
   **normalise block** between tokenise and resolve: an unknown word is repaired by edit
   distance against the universe's own forms (the misspelling case) or by stem family (the
   thesaurus case), and the chip says exactly what was fixed and by what evidence — each
   layer literally saying "this is what we think you said", reviewable and correctable.

5. **Layers as reusable blocks, mix and match, drag to order** (moments 7–8). "Imagine we
   have 5, 10 or 20 different types of layers, and I can mix and match them… I need a mode,
   same way we did the pin-and-move." Committed: the pipeline is now a **registry of
   blocks**, each declaring what it needs; the page gets a pipeline bar where optional
   blocks toggle on and off and drag to reorder, and a block whose needs are not met simply
   reports itself skipped and why. The engine runs whatever legal pipeline it is handed —
   the building block the founder wants for every abstraction jump.

6. **Weights: opinionated versus evidence-based** (moment 8). "Some might be opinionated,
   which is okay, because we will capture them, and some might be based on evidence."
   Committed: every formula surface now labels each factor **(opinion)** — the authored
   constants — or **(evidence)** — the counted quantities, so tweaking knows what kind of
   number it is touching.

## The agent's notes back

- The LETS framing (load, extract, transform, save) is recorded: the WCLM is its visual
  version, and the block registry is the transform library forming.
- "Some of these may actually be bigger words… paragraphs… conclusions" — the block
  contract deliberately does not assume tokens: a future block whose items are sentences or
  conclusions fits the same {needs, run, trace} shape.
- The negation semantics shipped are the honest minimum (negated words withdraw from
  positive evidence; contradictions with the world are surfaced, never resolved). Whether a
  negated query should also RANK by contradiction strength is a judgement question left
  open for the founder.
