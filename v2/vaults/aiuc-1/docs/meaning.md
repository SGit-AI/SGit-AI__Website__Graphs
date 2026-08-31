# Giving a paragraph and a word meaning

This vault started as a catalog: 53 controls, each with its fields and its sources. A
catalog is a set of nodes with properties, and on this estate's terms that is the weak
form. `thinking-in-graphs`, published at graphs.sgit.ai, puts it plainly: a node carries
no obligation to explain itself, meaning is not declared but discovered by tracing edges,
and confidence in that meaning is proportional to how richly connected the node is.

So the second half of this build adds no properties to any control. It adds edges, and it
grades them.

## The three grades, never mixed

| Grade | What it means | How it was arrived at |
|---|---|---|
| **structural** | Read from the sources. Exact, no judgement. | A section of `controls.md` headed `A001: …` states control A001. A paragraph that is character-for-character a requirement's published text is that requirement's wording. |
| **published** | AIUC publishes this crosswalk. The vocabulary evidence is this build's. | For each control-to-clause mapping AIUC publishes, which distinctive words the two texts share, and which of the clause's distinctive words the control never reaches. |
| **proposed** | This build's candidate. Not AIUC's, and not a mapping. | A control and a clause AIUC has **not** crosswalked share distinctive vocabulary. Recorded with `review_status: needs_review`. |

Every edge in `graph/meaning/edges.json` carries its grade. Nothing downstream treats a
proposal as a mapping, and the app marks a proposal on every surface it appears on.

## Why the paragraph had to be nailed down first

An edge to a paragraph is worth what the paragraph's identity is worth. So before any
meaning was added, every source document was decomposed with the estate's own
`gen_coregraph` — document, section, block, sentence, word, plus a formatting graph and an
identity ledger — and the gate that matters ran on each: **the markdown rebuilds from its
formatting graph byte-identical to its source**. Every document in the vault, every
paragraph in them, reversible.

That is what makes `blk:A006: Prevent PII leakage / Control shoulds/1` a thing you can
point at rather than a line number that moves.

The counts live in `graph/docs/index.json` and are deliberately not repeated here: this
file is one of the documents being counted, so quoting its own totals would make them wrong
the moment anyone edits it.

## What a term is, and why rarity decides

A term here is a stem, not a word: `agent`, `agents` and `agent's` are one term. The stemmer
is deliberately shallow and stated rather than clever, in `src/terms.py`, because a stem is
an internal key and the words as written travel with it.

A term is only evidence if it is **rare**. `data` appears in hundreds of clauses and says
nothing about which clause a control is about; `jailbreak` appears in a handful and says a
great deal. Each term is scored by inverse document frequency across the corpus of 489
distinct external clauses plus the 53 control texts, normalised to 0–1, and only terms above
a floor count as evidence. The score for a control-to-clause pair answers a specific
question — *how much of that clause's distinctive vocabulary does this control's text
reach?* — rather than the vaguer *do these look alike*.

## The gap is the honest half

For every published crosswalk this build reports two lists: the distinctive terms the two
texts share, and the distinctive terms the clause holds that the control never uses. The
second list is the interesting one. It is where the mapping is doing work that the wording
does not show.

**257 of the 1,126 crosswalks AIUC publishes share no distinctive vocabulary at all.** That
is not an error and it is not a criticism. It means AIUC mapped those on meaning rather than
on words, which is what a human crosswalk is for. Recording it makes the difference between
the two kinds of mapping visible instead of averaged away.

## Anchor nodes

An external clause is an anchor node in the sense that document gives the term: well
connected, maintained by someone else, well known, and carrying **no authority here**. There
are 489 of them. Nothing in this vault says a control *is* an article; the edges say a
control's text and an article's text share these words, and AIUC publishes a crosswalk
between them, and those are two different claims kept apart.

Where an EU AI Act anchor names an article, it also carries a pointer to the estate's
**Regulation Graph** vault, where Regulation (EU) 2024/1689 is parsed from official Formex
XML and hash-verified. That pointer is a reference, not an assertion about the article.

## What this does not do

- It does not propose a mapping AIUC should adopt. A candidate is a reason to look.
- It does not score how *compliant* anything is. There is no such number here and there
  will not be.
- It does not resolve the 257 wordless crosswalks. Resolving one means deciding what AIUC
  meant, which is not this build's to decide.
- It does not stem cleverly. `authorization` and `authorizing` land on different stems, and
  that inflates a shared count slightly. The terms as written are shown, so a reader can see
  it happening.

## Reading it

- `graph/meaning/index.json` — the grades, the counts, every anchor, every bridging term.
- `graph/meaning/controls/<id>.json` — one control's evidence and candidates in full.
- `graph/meaning/edges.json` — every edge with its grade and the sentence that says what it
  asserts.
- `graph/docs/<slug>/` — the decomposition each of those edges points into.

Or open the vault's own page: a control's panel shows the shared words and the gap, and the
graph explorer walks any of it one degree at a time.
