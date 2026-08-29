---
created: 2026-08-29T08:00:00Z
priority: high
source: newsroom.sgit.ai brief 10 §11, which lost its entire generator to this line
closed: 2026-08-29T08:00:00Z
---

# A bare `build/` in .gitignore matches at every depth

A sibling site published a postscript worth acting on: a generic Python
`.gitignore` carries `build/`, which is **unanchored and therefore matches at
every depth**. It had been silently excluding their whole generator from every
commit since the section was created, and the site kept deploying correctly the
entire time, because the *generated HTML* was committed and only the thing that
generated it was missing.

**A generated site can be green, deployed and completely unrebuildable at the same
time, and nothing in a normal build will tell you.**

## What we found

**Nothing is ignored today.** Every generator, test and book builder is tracked.
This repository hit the same line once before, at v0.1.0, and fixed it the same
way they did: `!admin/build/`, re-including one path by name. Which is exactly why
the brief warns that it recurs.

**The exposure was live for anything new.** Checked with `git check-ignore`:

| Path | Before |
|---|---|
| `v2/books/making-a-book/build/` | **would have been silently ignored** |
| `governance/build/` | **would have been silently ignored** |
| `assets/build/` | **would have been silently ignored** |
| `admin/build/` | tracked, by the one re-include |

The first of those is not hypothetical. Each book already owns a `build.py`, and a
book whose build tooling grew into a `build/` folder would have disappeared from
the repository without a single warning.

## The fix

`build/` is anchored to `/build/`. The rule exists for Python packaging artefacts,
which appear at the repository root and nowhere else, so anchoring costs nothing and
fixes the class rather than adding a second re-include. The `!admin/build/`
re-include stays as belt and braces.

## The gate

Re-including by name is what failed twice. So the test checks the **outcome**, not
the rule: every generator the README chain runs must be on disk *and* tracked by
`git ls-files`, plus each book's own `build.py` and `gen_pages.py`. Run red by
ignoring `gen_board.py`, which reported it as unrebuildable rather than missing.

## What to take from it

The estate's rules are written for content drifting from source. This is the same
failure one layer down: the *build* drifting from the repository. Worth a general
form, which is the sibling's own phrasing: **check that your generator is in your
repository, then add a check that keeps it there.**
