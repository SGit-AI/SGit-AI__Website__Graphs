# Standards Atlas: GDPR — a published vault

> The General Data Protection Regulation as a navigable semantic graph, where CJEU rulings, regulator guidance and per-country variation are first-class nodes layered over the articles they bend — with a validation surface that writes corrections back into the vault.

*Source: <https://sgit.ai/demos/vaults/standards-atlas-gdpr/index.html> · site v0.2.95 · this file is generated from the same content as the page, so the two cannot drift. Every page on this site has a `.md` twin; internal links below point at them.*

---

[Home](../../../index.md) / [Vaults](../index.md) / Standards Atlas — GDPR

# Standards Atlas — GDPR

**"The standard is the graph."** GDPR cannot be read at face value: its operative meaning lives in the rulings, the regulators' guidance, and the per-country variation the text never mentions. This vault makes those first-class nodes layered over the articles they bend — and it is one of the earliest experiments here in shipping a graph as a vault.

**Open it yourself — the key is the whole credential.**
 Read key: `sgit_rk1_439ca57ab9e53b4edfa67e99da1b70948c297d323376c890292dc2f0876aa15c:4zv4bvmu`
 In the official UI: [open it read-only in a new tab](https://dev.vault.sgraph.ai/#sgit_rk1_439ca57ab9e53b4edfa67e99da1b70948c297d323376c890292dc2f0876aa15c%3A4zv4bvmu) · From the CLI: `sgit clone sgit_rk1_439ca57ab9e53b4edfa67e99da1b70948c297d323376c890292dc2f0876aa15c:4zv4bvmu`
Published deliberately, and **derived** one-way from a vault key that is not published and never will be.

## See it live, here

Both surfaces open automatically below. You can also [**open the app in its own window ↗**](https://dev.vault.sgraph.ai/#sgit_rk1_439ca57ab9e53b4edfa67e99da1b70948c297d323376c890292dc2f0876aa15c%3A4zv4bvmu).

## What is in it

the claim

### Read the text at face value and you miss most of it

The vault holds the whole workshop rather than a finished artefact: the raw Regulation (EU) 2016/679, a normalised form, the graph that connects it, the visualisations rendered from that graph, and the provenance that makes each claim auditable. Nine views run from **The text** through **Structure**, **The graph**, **Beyond the text**, **Sources**, **Validate** and **Provenance**.

Its sources are public record and named as such — CJEU proceedings including *Meta Platforms Inc. v Bundeskartellamt*, regulator material from the German federal DPA, and enforcement decisions. Nothing private is in it, by construction.

The overview: the standard as a graph, with the not-legal-advice banner above it and the source instrument below.

the honesty

### A banner across every page, and a seed that says it is a seed

Above every view sits `SEED PASS — NOT LEGAL ADVICE`, and the overview repeats it in full: *"a structural and educational artefact, not legal advice. The rulings/guidance/per-country overlays are a web-verified seed (30 May 2026), illustrative and not exhaustive, and must be validated before they are relied upon."*

That is why the **Validate** view matters. Corrections are written from inside the vault to `/feedback/`, gated on the `fs.write: ["feedback/"]` grant — so a read-only reader records changes in the page only, while the seed graph stays immutable and reviewers layer validated provenance on top.

The vault browser: the graph, its sources and provenance, and the narrow write grant behind Validate.

## The graph view, by altitude

Added 19 September 2026, captured from a read-key clone of the vault with a local host bridge. The graph view is navigated *by altitude*, and the panel says so in its own words: *“You are at the top of the fractal. Each domain is its own ontology that connects up to the GDPR root and down to concepts and articles.”* Descend into a domain and the ring becomes its concepts; descend into a concept and it shows its provenance and the article it anchors to. The rendering does not change between altitudes — only the question does. This vault is one rung of [the ladder that runs from the law to the compute instance](../../fractal-graphs/index.md).

altitude 0 → 1

### The Regulation, then one of its eight domains

At the top: GDPR and eight domains on a ring, one per group of chapters. Pick *Principles* and the ring is Article 5's seven principles — *“the spine the whole graph hangs from”* — seven concepts, one article. The layout is computed from the graph, not drawn.

**An honest count:** the graph holds 165 nodes and 227 edges, and six of those edges are typed `relates` — the one verb [the grammar](https://graphs.sgit.ai/v1/grammar/index.html) bans, because it constrains nothing. This vault predates the rule. Recorded rather than fixed, since the seed graph is deliberately immutable and corrections go to `feedback/`.

Altitude 1: *Principles*, its seven concepts, and Article 5.

beyond the text

### One unchanged article, five rulings

Article 45 has not changed a word since 2016; what it permits has flipped repeatedly — Safe Harbour, Schrems I, Privacy Shield, Schrems II, the Data Privacy Framework, an appeal pending. The view draws the rulings as a timeline over the article node, which is the case for the second layer in one picture: *“this is why a static PDF of GDPR is misleading and a versioned graph is not.”*

The moving target: international transfers, as ruling nodes over one constant article.

## Notes

**The narrowest interesting grant on the site.** Most vaults here request read and no write. This one requests `fs.write` and `fs.mkdir` on exactly one path — `feedback/` — which is how it accepts corrections without ever letting a reviewer alter the graph they are reviewing.

[← All published vaults](../index.md)


---

*[Site index for agents](../../../llms.txt) · [HTML version](https://sgit.ai/demos/vaults/standards-atlas-gdpr/index.html)*
