---
created: 2026-09-19T12:40:00Z
priority: high
source: v0.6.20 — adding /site/index.html, the estate page
closed: 2026-09-19T13:10:00Z
---

# The same ignore trap, one layer out: a published PAGE this time

Issue 005 anchored `build/` to `/build/` and gated it: every generator the README
chain runs must be on disk and tracked. That gate is still green and still right.
It did not catch this one, because this one is not a generator.

`/site/index.html` was added at v0.6.20: the estate page, everything the front page
used to carry, moved whole. The stock Python `.gitignore` this repository started
from carries `/site` under the comment **"mkdocs documentation"**. This repository
has never used mkdocs.

So the page rendered, the links resolved, `validate.js` reported OK across 272
pages, and `git status` simply never mentioned the file. Had it shipped, the
deployment from this machine would have carried a page the repository does not
contain, and the next agent to clone would have found the front page linking to
nothing.

## How it was found

By accident, reading `git status` before committing and noticing `?? home/` with no
`?? site/` beside it. That is not a way of finding things.

## The fix

The `/site` line is gone, with a comment saying why it was there and why it is not
any more. Nothing else used it.

## The gate

`repo: no published page or asset is ignored by git` in `build.test.mjs`. It walks
the tree for every `.html`, `.css`, `.mjs`, `.js` and `.json` the site publishes and
pushes the lot through one `git check-ignore --stdin`; anything that comes back is a
failure naming the path. Run red by putting `/site` back, which reported
`site/index.html` by name, then restored.

Issue 005's gate asks whether the thing that BUILDS the site is in the repository.
This one asks whether the site IS. Both questions needed asking, and only one of
them was.

## What to take from it

A stock language `.gitignore` is a list of guesses about what your repository is
called. `build`, `site`, `dist`, `docs`, `public`, `tmp` and `out` are all in
common templates and all are plausible names for a real section of a website. The
general form: **when you add a top-level folder, check that git will take it,
before you check anything else.** The gate now asks on every run.
