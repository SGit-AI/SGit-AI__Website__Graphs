# The workflows, formally

**Asked by** brief 41: *"a more formal definition of the workflows that are executing
here."*

Five workflows run in this estate. Four have been executing for weeks without being written
down; one was defined in brief 39 and ran for the first time at v0.6.3. Each is given here
as a trigger, numbered steps, the gates it must pass, and its done test.

Where a step is already enforced by machinery, that is named. Where it is only a habit, it
is marked **(habit)** — those are the candidates for the next gate.

---

## Workflow 1 — The loop: memo to release

The estate's primary rhythm. It has run 41 times.

**Trigger** a founder voice memo.

1. **Transcribe verbatim** into `v2/briefs/NN__<slug>.md`. Transcription artefacts stay.
   Never paraphrase. *(gated: `gen_memos` fails on an unregistered brief)*
2. **Write the numbered reading** beneath it, marked as the agent's, for the founder to
   correct. Disagree where the evidence disagrees.
3. **Ask what blocks.** Anything that would make the work useless if guessed wrong goes back
   to the founder now; everything else proceeds under a stated assumption.
4. **Build**, following the release ritual (workflow 2).
5. **Report** what was built, what was found, and what is still open.

**Done test** the founder can correct the reading without listening to the memo again, and
every instruction in it is either implemented, scheduled, or explicitly declined with a
reason.

---

## Workflow 2 — The release ritual

**Trigger** any change that will be pushed.

1. `git fetch origin dev --tags` **first**. Other agents ship while you work.
2. Choose the version: next patch, or a deliberate `.0` minor. *(gated: CI verifies the bump
   is next)*
3. `printf 'vX.Y.Z' > admin/build/version.txt`.
4. **Narrate a row** in `admin/versions.html`: what changed and why, understandable without
   the diff. *(habit — nothing checks that a row is good, only that it exists)*
5. Run the generator chain, ending with `chrome.py`.
6. `node admin/tests/run.mjs` and `node admin/build/validate.js`. *(gated: validate runs the
   suites itself)*
7. Commit with the version in the subject. *(gated: CI compares subject to version.txt)*
8. Push the branch, then `dev`. CI validates, tags, deploys.
9. **Verify live** before reporting it done.

**On collision** fetch, renumber, re-run the chain, retry. Never force.
**On a conflict in a generated file** take theirs and regenerate. Never hand-merge.

**Done test** the version is live on graphs.sgit.ai and tagged.

---

## Workflow 3 — Changing a book

**Trigger** any change to `v2/books/<slug>/content/`.

1. **Scope it** (editor): what is wrong, as a reader experiences it; two or three options
   with their costs; a recommendation.
2. **Approve** — the founder's, not a role's.
3. **Write** (writer): edit the markdown only. Every number computed or quoted in the same
   session; every screenshot photographed from the real page.
4. **Move BOTH versions** (publisher): the book's version in `gen_bookmeta.REGISTER` **and**
   the site's in `version.txt`. *(gated: content moving without the book version moving
   fails, and so does the reverse)*
5. **Record the pair** in the book's `changelog`: its version, the site release carrying it,
   and what moved it. *(gated: the last changelog entry must be the current version, and the
   site release must be one that was narrated)*
6. **Rebuild** the book, then `gen_bookmeta.py`, then `gen_bookpub.py`.
7. **Compare the PDF page by page** against the previous build. A one-chapter change should
   not move ninety pages. *(habit)*
8. Then workflow 2.

**Done test** `book.json` names the new version, its hashes match the files, the changelog
pairs it with a real release, and a reader can tell what changed.

---

## Workflow 4 — Change control on book content (the seven stages)

Defined in brief 39, first run at v0.6.3. Workflow 3 is *how* a change is made; this is
*whether* it is made, and it wraps around it.

| Stage | Who | Output |
|---|---|---|
| 1. **Plan** | whoever opens it | which roles have a **voice**, which are asked for an **opinion**, which are not asked |
| 2. **Map** | researcher | what is actually true, anchored, before anyone argues |
| 3. **Define** | the roles with a voice | options, each with what it costs |
| 4. **Review** | the roles asked | opinions from their own centres of gravity, allowed to disagree |
| 5. **Approve** | **the founder** | a decision. No role approves. |
| 6. **Implement** | writer, developer, publisher | workflow 3 |
| 7. **Approve the implementation** | **the founder** | confirmation the change is what was approved |

**The record** is a dev pack, book-stamped: `<book-slug>__vX.Y.Z__<slug>/`, carrying the
plan, the map, the options, the opinions, and the state.

**Done test** a reader can see who argued what, on what evidence, and where it stopped.

---

## Workflow 5 — Turning an escaped defect into a gate

**Trigger** something got through that a check could have caught.

1. State the rule as one sentence a test can assert.
2. **Write the test so it fails first**, against the broken state. *(A gate never seen red
   is not known to work — this is the estate's most-repeated lesson and it has caught real
   bugs five times.)*
3. Put it in the suite for its area, or `build.test.mjs` if it is about the repository.
4. Make the failure message name what broke, not the rule that noticed.
5. Record it in the release note, so the gate has a story.

**Done test** the gate fails on the known-bad case and passes on the fixed one.

---

## What is not yet a workflow

- **Publishing to Leanpub.** The steps exist in the v0.5.18 pack but have never been run,
  so calling them a workflow would be a guess. It becomes one after the first upload.
- **Retiring or archiving a book version.** Brief 41 asks for it (*"move some of the code
  historically into one of those archives, so that the code still works over time"*) and
  nothing supports it yet.
- **Deciding what a shared tool supports.** Brief 41's compatibility model — *"tools that
  only work on version v2.5+"* — has no mechanism. It is phase 4 of the structure review.
