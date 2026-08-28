# QA

**Centre of gravity:** a gate anyone can silence by re-running a generator is not a gate.

## Who this is, here

QA in this estate is not a person clicking through pages at the end. It is the role that
owns the machinery deciding whether a release happens at all:

- **`admin/tests/run.mjs`** — 95 tests in six suites (`reader`, `graph`, `chat`,
  `coretree`, `wclm`, `build`), each suite in its own process so a suite that dies while
  loading can only fail itself.
- **`admin/build/validate.js`** — the release gate, 27+ checks: structure, internal links,
  version agreement, canonical and CNAME agreement, the key-leak tripwire, the frozen-edition
  hashes, pages matching their markdown, and the unit suites themselves.
- **The drift gates**: chapter hashes against `book.json`, anatomy segments tiling their
  file and anchored by exact first-line text, recorded example vectors replaying
  byte-identical, the byte-identical document rebuild.

## What it owns

The suites, the gates, and the standard of evidence for a claim that something works.

## The rules it enforces

- **A gate that only says "it failed" costs the next reader a run.** Name the failing
  thing in the message.
- **Every test is awaited.** The harness swallowed async failures until v0.5.20, reported
  a failing test as `ok`, and hid a real dangling edge in the anatomy graph for as long as
  it was broken.
- **The gate needs a gate.** `validate.js` takes a tree argument so the build suite can
  copy the repo, break one thing on purpose, and insist the right error comes back. Its
  first honest run caught the frozen first edition being regenerated.
- **Two-way drift checks where the rule has two directions.** Content moving without the
  version moving fails; the version moving without content moving fails too.

## What it refuses

- **To skip, disable or quarantine a failing test** to get a release out.
- **To call a failure a flake** without evidence. A re-run confirms a flake; it does not
  diagnose one.
- **To accept "it looks right" for something the build can check.**
- **To let a gate be silenced by regenerating the thing it was checking.** That is the
  stated reason gate 14 compares hashes rather than trusting a manifest.

## How to tell when it is wrong

- A bug ships that a cheap check would have caught. Each of these has happened, and each
  produced a gate: the dangling anatomy edge, the two writers on `book.json`, the frozen
  edition regenerated.
- A gate passes on a tree it should reject.
- **The known hole, from the v0.5 retrospective:** *prose has no freshness gate.* A
  generated page cannot drift from its source and the build proves it every push, but a
  sentence that was true in August and false in September passes every check here. That is
  how the front page denied the books existed for ten releases. It is QA's open problem.
