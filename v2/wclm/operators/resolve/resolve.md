# resolve — each hash looks itself up in the world

**T3 · core · reads `tokens` · writes `stream`**

The lookup that turns addresses into evidence. Each token hash finds its record in the
world's token table and comes back carrying its form, its class (content, verb, number,
padding — assigned by the token analysis), its count in the document, its weight, and its
top companions (used later by attend). A hash with no record is marked honestly:
`known: false`, class `unknown`, weight zero — this universe has never seen the word, and
nothing downstream will pretend otherwise.

## the transformation

```
  tokens ──────────────────────────────────────────────────────────►

   hash 32ec98…  ──lookup──►  world.tokens[hash]
                                   │
              ┌────────────────────┴─────────────────────┐
            found                                     not found
              │                                           │
              ▼                                           ▼
   { known: true,                              { known: false,
     class: content,   ◄─ the token analysis     class: unknown,
     count: ×27,       ◄─ counted evidence       count: 0, w: 0 }
     w: 0.206,         ◄─ classW/log2(2+count)
     top: [...] }      ◄─ companions                stream ─────►
```

## official data

`data.json` names the sources: the token table is **derived** — created by
`gen_coregraph.py`'s token analysis, per document — while the class weights
(`content 1.0 · code 1.0 · verb 0.7 · number 0.3 · padding 0.05`) are **standard**
opinion, stated in the world's weights string where they can be edited.

## tuning notes

The weight formula (classW over log2(2+count)) deliberately dampens very common words
without silencing them. Changing a class weight retunes the whole engine — that IS the
training loop. The class assignments themselves are corrections territory: a word
misclassified as padding is fixed in the generator's lists, never here.
