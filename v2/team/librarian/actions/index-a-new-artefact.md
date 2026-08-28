# Action: index a new artefact

**Input** a file that now exists and is not yet in any register.

**Method**
1. Decide what it is: a brief, a dev pack, a technique, a lexicon term, a book chapter, a
   decision.
2. Add it to that register's authored half — `gen_memos.BLURB`, `gen_devpack.PACKS`,
   `v2/methods/data/methods.json`, and so on.
3. Write the blurb from having read the thing. "What it gives you" is a judgement.
4. Re-run the generator and confirm it stops complaining.

**Done test** the generator that owns the register runs clean, `validate.js` passes, and
the artefact is reachable from a hub a person would actually look at.

**Refusal** never invent a blurb for a file nobody has read.
