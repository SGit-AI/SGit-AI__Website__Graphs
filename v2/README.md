# The second edition

**Empty, on purpose.**

This directory is where the second edition of the book will be written, from the top down,
as a graph. Nothing is in it yet.

The plan is [dev pack v0.3.27](../dev-pack/index.html), and its status is PROPOSED
throughout. Phase 0, which is the move of the first edition into `../v1/` and its freeze,
shipped as **v0.4.0**. Phase 1 is the plumbing and it has not started.

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
