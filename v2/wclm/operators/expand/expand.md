# expand — the world model, gathered per meaning

**T8 · optional · reads `bindings` · writes `bindings`**

Brief 31's "can you expand this?" as an engine. Each bound meaning assembles its
neighbourhood: every document edge that touches it (in either direction, verb carried)
and every pack edge its term declares. The result is the world model arriving — what this
meaning is CONNECTED to — and the degree becomes the blast radius converge scores with.
Skipping this engine is legal (converge falls back to degree zero); the answer then rests
on coverage alone, which is exactly what the delta banner will show moved.

## the transformation

```
  bindings ────────────────────────────────────────────────────────►

   "meaning through connectivity"  (bind 1.0)
        │  gather every edge touching the id
        ▼
   ┌──────────────────────────────────────────────┐
   │  departs-from → schema-first        (doc)    │
   │  the central claim → about         (doc)     │
   │  not a metaphor → about            (doc)     │
   │  the difference is connectivity →… (doc)     │
   │  … degree 5 ⇒ blast radius 5                 │
   └──────────────────────────────────────────────┘
        │  neighbours kept (first 6 shown), degree counted
        ▼                                  bindings (assembled) ────►
```

## official data

`data.json` names the edge sources and their provenance: document edges **derived** from
the extraction (including `about` attachments flattened by `gen_wclm.py` so blast radius
counts what the viewer shows), pack edges **authored** in the meaning packs.

## tuning notes

The neighbour display cap (6) and the downstream blast bonus (0.1 per neighbour, opinion,
applied in converge) are the knobs. When more documents land, cross-document edges make
this engine the place where a meaning's neighbourhood spans sources — the brief-35
ask-a-document seed.
