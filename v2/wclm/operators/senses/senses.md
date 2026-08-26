# senses — which world is this word from?

**T4 · optional · reads `stream` · writes `stream`**

Brief 34 made real. Two clues per word. **Number**: the stem families prove singular and
plural pairs, so `graphs` carries "plural of graph — more than one involved" as evidence,
because graph is not graphs and "graph of graphs" is not "graphs of graphs". **Sense**:
the authored senses register holds three to five definitions per word across industries —
the document's own sense always first — and each word declares which sense is ACTIVE: the
document's, unless the caller switches it. A switched word is marked foreign; downstream
it withdraws from this universe's concepts, binds its chosen sense instead, and converge
names the claims that stop applying (a graph that is a diagram is not fractal).

## the transformation

```
  stream ──────────────────────────────────────────────────────────►

   "graphs"
      ├── number:  stem family { graph, graphs } proves the pair
      │            ⇒ num = plural of "graph" (evidence)
      │
      └── sense:   register[graph] = [ doc: the network graph ◄ default
                                       chart: a chart of data
                                       plot / paper / social ]
                   chosen? ──no──► active = doc      (nothing changes)
                            yes──► active = chart, foreign = true
                                        │
                                        ▼   downstream (bind, converge):
                              withdrawn from doc concepts; binds the
                              sense; the lost claims are said out loud
```

## official data

`data.json` points at the senses register (`../../senses.json`) — **authored**, reviewed
by the founder, the training surface — and at the stem families, **derived** by
`gen_coregraph.py`. The default-to-document rule is **standard**.

## tuning notes

Add a word by adding senses to the register; the picker appears without a code change.
Open judgement (brief 34): plural forms currently inherit the singular's senses through
the family — plurals with senses of their own are accepted by the register as-is.
