# The second edition

This directory is where the second edition of the book is being made, from the top down,
as a graph. **No book text exists yet.** What lives here is everything *about* making it:
the plan ([the dev pack](dev-pack/index.html), raw under `dev-packs/`), the founder's
memos (raw under `briefs/`, read at [memos/](memos/index.html)), the review packs
([packs/](packs/index.html)), and, as they arrive, the project management, the universe
and the book's own graph. The founder's rule, 23 August 2026: everything for this next
set of work lives inside this folder, including the project management and scaffolding,
in preparation for the day `/v2/` becomes the archived version and a `/v3/` begins.

The plan's status is PROPOSED throughout. Phase 0, the move of the first edition into
`../v1/` and its freeze, shipped as **v0.4.0**; the gathering of the second edition's
material into this tree shipped as **v0.4.4**. Phase 1 is the plumbing and it has not
started.

One invariant to hold: **anything outside `/v1/` and `/v2/` is the site's own chrome and
is not part of any edition.** If everything outside the two edition trees were deleted,
neither edition would lose content. `/book/` at the root is a pointer to the current
edition, which is this one.

## The rule this directory exists to enforce

Each edition owns everything it uses. When the second edition needs a source document, a
vault analysis, a concept definition or a chapter's argument from the first edition, it
takes **its own copy into here**, and that copy records where it came from:

```json
{ "from": "v1/content/grammar.md",
  "sha256": "…", "release": "v0.3.26",
  "verdict": "CARRY", "changed": "none" }
```

`verdict` is one of CARRY, LIFT, REWRITE or NEW. The gate does not require the text to
match: it requires the origin to resolve and the verdict to be present. That is the
decoupling review r003 asked for, arriving as a property of the directory layout rather
than as a project.

Nothing here ever edits `../v1/`. The first edition is frozen at v0.3.26, its bytes are
recorded in `../v1/MANIFEST.json`, and the build fails if any of them changes.

---

This document is released under the Creative Commons Attribution 4.0 International licence (CC BY 4.0).
