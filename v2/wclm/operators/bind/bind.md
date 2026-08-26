# bind — forms light the meanings they cover

**T7 · core · reads `stream` · writes `bindings`**

Where words become candidate meanings. The surviving forms (attention profiles when
attend ran, the content stream otherwise) light every document concept, pack term and
chosen sense whose label they cover. The score is a stated formula:
**bind = ½·(label coverage) + ½·(prompt coverage) + 0.1·(pulled nearby)** — coverages are
evidence, the halves and the bonus are opinion, and the second half exists because of a
real training moment: the one-word "connectivity" once outranked the exact concept, and
the founder's fix was editing this formula, not fitting a number. Negated forms withdraw;
sense-switched words withdraw once per word and bind their chosen sense instead
(unless passthrough carried them).

## the transformation

```
  stream ──────────────────────────────────────────────────────────►

   present = { meaning, connectivity }        withdrawn: ⊘negated, foreign
      │
      ├─► concept "meaning through connectivity"  forms {meaning, connectivity}
      │      label coverage 2/2 · prompt coverage 2/2 ⇒ bind 1.0
      │
      ├─► concept "connectivity"                  forms {connectivity}
      │      label 1/1 · prompt 1/2 ⇒ bind 0.75
      │
      ├─► pack term "meaning"                     ⇒ bind 0.75
      │
      └─► sense "graph as a chart"  (only when the word was switched)
                                                  bindings ──────────►
```

## official data

`data.json` names the three lit surfaces and their provenance: concepts **derived** from
the extraction, pack terms **authored** (the meaning packs), senses **authored** (the
register). The formula's constants are **standard** opinion, stated where editable.

## tuning notes

This is the engine the training loop has already touched once. The knobs, in honesty
order: the half/half split, the 0.1 pull bonus, and whether a negated term should also
demote concepts that mention it (brief 33's open judgement, still open).
