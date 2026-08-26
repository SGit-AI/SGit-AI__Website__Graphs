# translate — say it in their world

**optional · reads `meanings` · writes `meanings`**

Brief 35's ask, by name: analogies and equivalencies. To explain this material to
somebody from finance, do not repeat the words — find the equivalent concept in THEIR
world. When the caller names an audience, the top-ranked meanings are looked up in the
authored analogies register and restated in the listener's own concept, the why carried
("graphs of graphs → spreadsheets of spreadsheets, because finance genuinely nests
workbooks in consolidation packs"). A concept the register has no mapping for says
`no analogy authored yet` — a correction opportunity shown, never a silence.

## the transformation

```
  meanings ────────────────────────────────────────────────────────►

   winner: "graphs of graphs"        audience: finance
        │                                 │
        └────────── register lookup ──────┘
                        │
        ┌───────────────┴────────────────┐
      mapped                          unmapped
        │                                │
        ▼                                ▼
   "spreadsheets of spreadsheets"    "no analogy authored yet"
    + why it lands                    (a gap, said out loud)
    + for whom (label)
                                        meanings (translated) ─────►
```

## official data

`data.json` points at the analogies register (`../../analogies.json`) — **authored**,
three audiences (finance, operations, medicine), sixteen mappings, every `for` id gated
against the extraction's concepts so an equivalence can never point at nothing.

## tuning notes

Add an audience or a mapping by editing the register; the picker follows. The open
question recorded in brief 35: whether an audience should eventually BE another
document's extraction (ask THE FINANCE DOCUMENT how it says this) — that is the
ask-a-document destination, waiting on the fan-out.
