# Opinion: what a second document cost the machinery

**Asked** what adding a document to the universe costs, and whether anything broke
**Subject** the generators, at v0.6.10 going into v0.6.11
**Role** developer, opinion only on this change

---

**Supports it. The machinery took a second document without redesign, which is the first
evidence that the fan-out claim is true.**

## What had to change, and it was less than expected

| Change | Why | Size |
|---|---|---|
| `gen_coregraph` gained a register | It built one hard-coded document; it now decomposes every folder under `v2/universe/docs/` that carries a `source.md` | ~25 lines |
| A uid-prefix collision check | The prefix is the slug's initials, so two slugs with the same initials would silently share a ledger | 6 lines, refuses rather than warns |
| `gen_universe`: the hub row | The blurb and state were hard-coded to the pilot's, so a second document would have described itself as *"the cornerstone"* | 3 lines; both now come from the extraction |
| `gen_universe`: the queued count | It subtracted extracted documents from the 21 carried sources; a document born here was never one of them | 4 lines, counts carried only |

**Nothing in `gen_coregraph.build()` changed.** A1 at v0.6.10 made it a function taking the
document, its output, its ledger and its prefix; this release is the first caller that was
not the pilot, and it needed no further parameterisation. That is what A1 was for, and it
held.

**Proof it was additive:** the pilot's entire output is byte-identical afterwards, ledger
included, and `git status` shows no change under `v2/universe/data/core/thinking-in-graphs/`
or `v2/universe/docs/thinking-in-graphs/` other than the two metadata fields the hub row now
reads.

## One defect found and fixed in passing

`gen_universe.load_and_verify()` raised its error summary with `path.name`, and there is no
`path` in that scope. Every extraction error would have crashed with a `NameError` instead
of printing the errors it had just collected. It had never fired because no extraction had
ever failed. This one did fail, twice, on the way in, which is how it was found.

**The developer's reading:** an error path that has never run is not tested, and this
estate has more of them. Worth a sweep, not worth a release of its own.

## What the developer will not pretend

Two documents is not fan-out. The pilot's release notes promised the machinery would scale
to twenty-one without redesign, and this release moves that from one to two. It is real
evidence and it is one data point. The token analysis in particular will change character
when the vocabulary of several documents overlaps, and nothing here tests that yet.
