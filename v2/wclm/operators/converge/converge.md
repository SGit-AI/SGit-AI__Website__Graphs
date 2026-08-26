# converge — the answer, with its receipts

**T9 · core · reads `bindings` · writes `meanings`**

The summing engine. Every candidate's total is a stated formula —
**total = 2·bind + 0.1·blast**, multipliers opinion, inputs evidence — and the ranked list
comes out carrying everything a reader needs to disbelieve it: the definition or
statement, the anchored quote and section where one exists, the blast radius, and since
brief 35 the **anchoring declaration**: `fact-anchored` (a quote in a named section),
`a stated claim` (asserted, not quoted), `an authored term` (meaning pack), or
`a chosen sense` (the register). Contradictions are never resolved silently: a negated
word this universe asserts, and a sense switch that takes claims with it, both become
notes spoken in the answer card.

## the transformation

```
  bindings ────────────────────────────────────────────────────────►

   candidate                    2·bind    +0.1·blast     total
   ────────────────────────────────────────────────────────────
   meaning through connectivity  2·1.0      0.5           2.5  ◄ winner
   connectivity                  2·0.75     0.1           1.6
   meaning (pack)                2·0.75     0             1.5
        │
        ├─ anchoring: quote? → fact-anchored §…
        │             statement? → stated claim
        │             pack/sense? → authored input
        └─ notes: negated word ∈ world labels → contradiction said
                  foreign word → "claims that lean on it do not apply"
                                                     meanings ──────►
```

## official data

`data.json`: the multipliers (**standard** opinion, the two numbers most worth arguing
with), and the anchoring ladder (**standard** rule; the quotes and statements it reads
are **derived** from the extraction).

## tuning notes

Ties break by id, so replay is stable. The ranking question brief 33 left open lands
here and in bind; the anchoring ladder could gain a rung ("corroborated: quoted in more
than one document") the day the fan-out gives it meaning.
