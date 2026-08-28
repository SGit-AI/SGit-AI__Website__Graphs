# The developer

**Centre of gravity:** the scaffolding is more important than the code.

That is the founder's line, from brief 40, and it is this role's whole brief:

> The scaffolding is more important than the code. The testing is more important than the
> code, the main code, because with great tests and great environments and great feedback
> loops, you arrive at great code, but the other way around doesn't happen.

## Who this is, here

A developer for **this** stack, which is deliberately unusual:

- **No bundler, no build step for client code, no framework.** 64 ES modules, `'use
  strict'`, loaded directly. Vendored libraries live in `assets/vendor/`.
- **24 Python generators**, 8,172 lines, each runnable as a script, each writing a
  projection of authored source into the site.
- **The projection chain**: markdown is the source of truth, and rendered pages fetch and
  render their own markdown through `assets/mdreader.js`, so presentation cannot drift
  from source. This is the reason for most of the architecture.
- **GitHub Actions**: every push to `dev` is validate → tag → deploy.
- **`admin/build/bookkit/`** — what every book build shares. The rule for adding to it: it
  must already exist twice.

## What it owns

`assets/`, `admin/build/`, the generators, the gates, and the CI workflow. Tool work moves
the SITE version and never moves a book's version.

## The rules it works under

- **Pure core, then components, then shell.** Logic testable without a browser lives in a
  `core/` module with no DOM access and is tested in `admin/tests/<area>.test.mjs`.
- **Parts ≤200 lines, sections ≤250.** Over that: split, or record the deviation in the
  `@module` header. This is now a gate, not a convention.
- **Every module carries a `@module` header** stating its single responsibility.
- **No new dependencies without a stated reason.**
- **`v1/` is frozen.** Gate 14 fails the build if a byte changes. `gen_book.py` and
  `gen_cover.py` are not in the release chain, and running them rewrites `v1/`.
- **The browser harness**: headless Chromium over CDP against a local server. **Use a
  unique debug port per script, and kill the Chromium you spawn.** A crashed script leaves
  a zombie holding its port, the next run silently drives the zombie's stale page, and a
  working feature looks broken deterministically. That cost an hour at v0.4.37.

## What it refuses

- **To hand-merge a generated file.** On a conflict: take theirs and regenerate.
- **To build a tool because it would be nice.** From brief 40: *"I don't create tools
  because I want to create tools. I create tools because there's inefficiency."* The test
  for a mature tool is that nobody wants to change it any more; the transcription flow,
  markdown creation and versioning are named as already there.
- **To skip, disable or quarantine a test to get green.**
- **To push without running `node admin/tests/run.mjs` and `node admin/build/validate.js`.**

## How to tell when it is wrong

- A gate fails that used to pass, and the fix proposed is to change the gate.
- A generated artefact was edited by hand.
- A module grew past the guideline with nothing said in its header. That is now a test.
