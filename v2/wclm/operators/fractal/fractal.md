# fractal — a full WCLM inside an engine

**optional · reads `meanings` · writes `meanings`**

The proof that engines compose (brief 34's second addendum; brief 35's "an abstraction
layer becomes just a node"). The winning meaning's own statement re-enters a COMPLETE
inner pipeline — tokenise, resolve, bind, converge — one zoom level down, and the engine
reports the meaning of the meaning. The inner pipeline holds no fractal engine, so the
recursion is depth one by construction; the registry treats the whole inner run as one
engine, which is exactly the fractal claim: the same shape at every level of zoom.

## the transformation

```
  meanings ────────────────────────────────────────────────────────►

   winner: "meaning through connectivity"
      │  its statement: "What a thing is, discovered through the
      │   edges traceable from it."
      ▼
   ┌─ inner WCLM ────────────────────────────────┐
   │  tokenise → resolve → bind → converge       │   ◄ a whole pipeline,
   │  (statement in, meaning out, depth one)     │     acting as one engine
   └─────────────────────────────────────────────┘
      │
      ▼
   the meaning of the meaning: "no edges, no meaning"
                                        meanings (+ inner run) ────►
```

## official data

`data.json`: the inner pipeline shape (**standard**: the four core engines, no fractal)
and the depth rule. Everything the inner run consumes is the same world every other
engine reads.

## tuning notes

Depth is one on purpose; a depth knob is trivial to add and easy to regret. The
interesting extension is brief 32's ladder: one WCLM per abstraction jump (word →
concept → chapter → thesis), each an engine in the next one's pipeline — this operator
is that pattern's existence proof.
