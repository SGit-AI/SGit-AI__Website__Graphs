---
created: 2026-08-28T18:42:53Z
priority: high
source: v0.6.3 — requested before the rename, to protect the rename
closed: 2026-08-28T18:42:53Z
---

# A book must be called the same thing in all three places

A rename is the change most likely to leave one place behind: the register in
`gen_bookmeta`, the book's own `build.py`, and the front-matter heading.

**Built and shipped at v0.6.3**, before the rename it existed to protect. It found a
disagreement on its first run, which turned out to be correct and is now declared as
`front_matter_title` rather than hidden inside the test. It was then run red against
a half-finished rename before being trusted.
