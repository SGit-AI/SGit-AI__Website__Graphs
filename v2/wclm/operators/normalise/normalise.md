# normalise — this is what we think you said

**T2 · optional · reads `tokens` · writes `tokens`**

The dictionary and the thesaurus, placed early where brief 33 asked for them. A token the
world has never seen gets two chances at repair, in order: **the dictionary way** — edit
distance 1 against the universe's own forms (`graphz → graph`, `conected → connected`),
tie broken alphabetically so the repair is deterministic — then **the thesaurus way** —
the token's stem lands in a known stem family, and the family's most common member stands
in (`meaninged → meaning`). Every repair is a named fix carrying its evidence; what cannot
be repaired says `no fix` and stays visible, because an honest unknown beats a silent
guess.

## the transformation

```
  tokens ───────────────────────────────────────────────────────────►

   "graphz"── known? ──no──► ed1 vs world forms ──hit──► graph  fix: edit distance 1
      │                          │
     yes                        miss
      │                          ▼
      ▼                    stemKey(form) in stem families?
   pass through                  │
   unchanged            hit: family's most-said member   miss: fix = null
                                 │                            │
                                 ▼                            ▼
                          meaning  fix: thesaurus        "zebra" (no fix, kept dim)
```

## official data

`data.json` points at the two repair sources, both **derived** by another transformation:
the world's token forms and the stem families, computed by `gen_coregraph.py` from the
document itself. The repair RULES (length ≥ 4 before ed1 fires; dictionary before
thesaurus) are **standard** and stated inline.

## tuning notes

The length guard stops short words repairing into each other (`of → on`). Raising ed1 to
distance 2 would catch more typos and invent more meanings — a judgement the founder
owns. The thesaurus currently picks the family's most frequent member; picking the
number-preserving member instead (plural stays plural) is a candidate refinement.
