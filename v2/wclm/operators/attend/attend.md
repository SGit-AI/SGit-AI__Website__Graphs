# attend — the look-back, as data

**T6 · optional · reads `stream` · writes `profiles`**

The attention brief 31 most wanted to see. Each surviving token (known, not padding, not
an operator word, not sense-switched unless carried) gets a PROFILE: its **pairs** — the
other prompt tokens it shares sentences with in the document, weighted by the shared
count from the co-occurrence edges — and its **pulls** — its top companions from the
token analysis, words the document habitually says nearby. Pairs make binding smarter
about the phrase; pulls give bind its 0.1 nearby bonus. Every weight here is counted
evidence; nothing is learned.

## the transformation

```
  stream ──────────────────────────────────────────────────────────►

   meaning            connectivity
      │                    │
      ├── pairs: ◄────────►┤   share 4 sentence(s)  (cooc edge, evidence)
      │                    │
      ├── pulls:           ├── pulls:
      │    nodes ×4        │    meaning ×4
      │    meaning ×4      │    nodes ×4
      │    node ×3         │    node ×3
      ▼                    ▼
   profile             profile          ──────────────► profiles
```

## official data

`data.json` points at the co-occurrence edges and the per-token companions — both
**derived**, computed by `gen_coregraph.py` from sentence co-membership in the document.
Nothing standard beyond the shape.

## tuning notes

Pairs currently need weight > 0 (a shared sentence) to draw; a lower floor would draw
weaker affinities. Pulls are capped at 3 per token — widening shows more world, costs
more noise. Both caps are stated in `attend.js`. When a second document lands, its
co-occurrence graph makes this engine's output document-relative automatically.
