# Scaling Threat Modeling with Semantic Knowledge Graphs — a published vault

> ThreatModCon 2025, Barcelona: eleven linked threat models from customer to compute instance, five interactive views and five Wardley map walkthroughs, running offline inside the vault — with two upstream-broken data files repaired and the repair proved as a pure block move.

*Source: <https://sgit.ai/demos/vaults/threatmodcon-2025/index.html> · site v0.2.95 · this file is generated from the same content as the page, so the two cannot drift. Every page on this site has a `.md` twin; internal links below point at them.*

---

[Home](../../../index.md) / [Vaults](../index.md) / ThreatModCon 2025

# Scaling Threat Modeling with Semantic Knowledge Graphs

ThreatModCon 2025, Barcelona. Eleven linked threat models stacked from the customer at the top to the compute instance at the bottom — **a graph of graphs**, so a vulnerability in a single line of code can be traced up to the revenue it puts at risk. Five interactive views and five Wardley map walkthroughs, all running inside the vault with no network.

**Open it yourself — the key is the whole credential.**
 Read key: `sgit_rk1_23fb205247b2b9c88a943d7ffece9dacf9c00c50cc94840668b4916f247b8ec4:0ict6flm`
 In the official UI: [open it read-only in a new tab](https://dev.vault.sgraph.ai/#sgit_rk1_23fb205247b2b9c88a943d7ffece9dacf9c00c50cc94840668b4916f247b8ec4%3A0ict6flm) · From the CLI: `sgit clone sgit_rk1_23fb205247b2b9c88a943d7ffece9dacf9c00c50cc94840668b4916f247b8ec4:0ict6flm`
Published deliberately, and **derived** one-way from a vault key that is not published and never will be.

## See it live, here

Opens on the hub; every visualisation below it runs from the vault. You can also [**open it in its own window ↗**](https://dev.vault.sgraph.ai/#sgit_rk1_23fb205247b2b9c88a943d7ffece9dacf9c00c50cc94840668b4916f247b8ec4%3A0ict6flm).

## What is in it

the thesis

### A threat model of one system tells you very little

The hub states the argument and then quantifies it: **11 readable layers, 51 nodes, 179 threats, 3 critical**. The zoom ladder runs Customer → Business → Application → Component → Package → Class → Method → Source Code → Environment → Runtime → Compute, each layer carrying its own node and threat counts.

The point of stacking them is traversal, not tidiness. One model answers *what could go wrong here*. Eleven linked models answer *what does this line of code put at risk*, which is a different question and the one an executive is actually asking.

Eleven layers, counted. Everything below the fold is live and runs offline.

the same fact, four audiences

### One SQL injection, four different messages

The fifth Wardley walkthrough takes a single critical finding in a payment gateway and writes the message four ways — **Board Member**, **CISO**, **CTO**, **Developer** — each with guidance on how to communicate and a message ready to send.

It is the same instinct as the [pentest report vault](../pentest-report/index.md): the finding does not change, the framing does, and both are derived from one underlying model rather than written four times by hand.

Board, CISO, CTO and Developer — one finding, four framings.

the maps

### From graph to Wardley map, in five steps

The Wardley set walks from a plain graph to a positioned map, through evolution stages, to security prioritisation — *from "everything is critical" to risk-based decisions* — and ends on the multi-persona cost view.

It pairs naturally with [wardley-maps.sgit.ai](../../../network/index.md#graphs-method), whose argument is that *maps are claims, not pictures*. These are the claims, drawn.

Step 3 of 5: evolution stages applied to security prioritisation.

the flat view

### The whole estate on one screen

Alongside the layered explorer there is a flat view of the same data — end customer, payment processing, user authentication, order fulfilment — for when you want the shape of the system rather than a path through it.

The same eleven layers, flattened.

## Two upstream data files were broken, and both were repaired in the open

This is the part worth reading even if threat modelling is not your subject. `tm-6-class-layer.json` and `tm-11-compute-layer.json` **are not valid JSON in the source repository**, so the class and compute layers do not load there at all. Both are fixed in this vault, and the vault documents the repair rather than quietly shipping it:

**Every change moves existing text or closes a bracket. No field was edited and nothing was invented.** The untouched originals are kept alongside, in `source/threat-models-data/`.

The upstream being public is what makes the repair auditable rather than merely asserted: the broken originals are at [DinisCruz/Presentation-Threat-Mod-Con-2025 ↗](https://github.com/DinisCruz/Presentation-Threat-Mod-Con-2025), and the vault keeps its own untouched copies beside the repaired ones.

And the fix is stated as something you can check rather than trust: comparing original against repaired line by line, the only differences are **four stray closing brackets removed and one `],` added** — the multiset of all content lines is unchanged. That is a repair expressed as a proof, which is a good deal rarer than a repair expressed as a changelog entry.

## Making a presentation survive inside a vault

The pages were already standalone HTML. The work was making them run on a `blob:` origin with no reliable network:

- **Libraries inlined at identical versions** — d3 7.8.5, three.js r128, tween.js 18.6.4, taken from each library's npm dist. No page touches the network.
- **Data repointed.** The explorer used to fetch its layers from an origin bucket. It now tries the vault's own copy through `sg.vfs.readText()` first, keeps the bucket as a second chance, and falls back to a snapshot inlined at build time — and **reports failure on screen instead of silently rendering nothing**.
- **A host handshake per page.** Every page posts `sg-app-ready`, because each one becomes the iframe document when you navigate to it.

Verified before publishing: a contract scan of all eleven pages for vault-relative references and surviving CDN links, `node --check` on every inline script block, hub links resolved against the filesystem, and a jsdom render of each page asserting that d3, THREE and TWEEN initialise and the SVG actually builds.

One class of jsdom error is filtered from that test — and the vault records that it was **checked against the untouched original first**, which produces the same error. Filtering a failure you have not first reproduced on a known-good input is how a test quietly stops testing.

## Notes

**It asks for nothing.** `app.json` declares `"permissions": {}` with `present: true`.

**Audited before publishing.** No sgit credentials, no third-party API keys, no private keys, no emails, no external company or client named. The modelled estate is a worked example, not a real customer.

**One thing you will only see inside the vault.** The threat-model explorer loads its eleven layers through `sg.vfs.readText()`. Open the file straight off disk and it sits on a loading spinner, because there is no vault bridge to answer it — which is the clearest small demonstration on this site of what the bridge actually does.

[← All published vaults](../index.md)


---

*[Site index for agents](../../../llms.txt) · [HTML version](https://sgit.ai/demos/vaults/threatmodcon-2025/index.html)*
