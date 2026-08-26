# tokenise — words become hash tokens

**T1 · core · reads `text` · writes `tokens`**

The first transformation and the reason the whole engine needs no registry: every word
becomes its own content address. The hash is FNV-1a 64-bit over code points, cut to 12 hex
characters, computed over the LOWERCASED form — so `Graph`, `GRAPH` and `graph` are one
token, in this document and in every document ever processed. The phrase gets the hash of
its joined token hashes, which is why "graph of graphs" and "graphs of graphs" can never
be confused: different tokens, different joins, different phrase address.

## the transformation

```
  text ─────────────────────────────────────────────────────────────►

  "graphs of graphs"
      │
      ├─ split on word boundaries (letters, digits, _, inner '- )
      │
      ▼
  ┌─────────┐   ┌────┐   ┌─────────┐
  │ graphs  │   │ of │   │ graphs  │        each: { i, w, form, hash }
  │ 86598…  │   │ 08b…│  │ 86598…  │        hash = fnv64(lowercase form)
  └─────────┘   └────┘   └─────────┘
       └──────────┴──────────┘
                  │  join hashes with '+', hash again
                  ▼
          phrase add2b4be2034            ◄──────────────── tokens
```

## official data

`data.json` carries the **standard** hash vectors — `fnv64('graph') = 32ec982977fe` and
friends — pinned identically in the Python generator (`gen_wclm.py`) and the JS engine, so
the two implementations can never drift. This data is true across every document.

## tuning notes

There is nothing statistical here to tune. What CAN change: the word regex (what counts as
a word — currently letters/digits/underscore with inner apostrophes and hyphens), and the
casefold rule. Both are stated in `tokenise.js`; both would change every downstream hash,
which is the point of keeping them boring.
