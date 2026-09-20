# Provenance is not conformance — a published vault

> A fork of the AIUC-1 catalogue vault that keeps every byte of it and adds one directory: attested_by kept permanently apart from evidenced_by, 53 conformance rows for a named subject where unevidenced is the default, and insurability computed as a query that turns into 53 exclusions when the date moves. Unofficial and derivative; not approved or endorsed by AIUC.

*Source: <https://sgit.ai/demos/vaults/aiuc-1-conformance/index.html> · site v0.2.95 · this file is generated from the same content as the page, so the two cannot drift. Every page on this site has a `.md` twin; internal links below point at them.*

---

[Home](../../../index.md) / [Vaults](../index.md) / AIUC-1 conformance layer

# Provenance is not conformance

**Unofficial and derivative. Read this first.** This vault is a copy of the [AIUC-1 catalogue vault](../aiuc-1-graph/index.md) with one directory added. It inherits that vault's `NOTICE.md` whole: it is **not** approved, certified, endorsed or reviewed by AIUC, **not** an official AIUC API or data feed, and **not** a substitute for the standard. The canonical sources are [aiuc-1.com ↗](https://www.aiuc-1.com/) and the [official changelog repository ↗](https://github.com/aiunderwriting/AIUC-1-Changelog); **where anything here disagrees with those, those are right and this is wrong.** The added layer carries a second disclaimer of its own, in its own words: *"It records what is evidenced and what is not; it certifies nobody, maps nothing officially, and makes no underwriting decision."* Nothing here is a compliance, certification, underwriting, insurance, legal or security claim about anybody, including the subjects it names — which are invented for the purpose.

A standard tells you what good looks like. It cannot tell you whether *you* do it. This vault keeps those two questions apart with two edges that are never allowed to touch — `evidenced_by`, *does the standard say this?*, and `attested_by`, *does this subject do this?* — and then asks the question the second edge makes possible: **given what is actually evidenced, on this date, what would be insurable?**

**Open it yourself — the key is the whole credential.**
 Read key: `sgit_private_read_0f01d367b04f886f6c65038649b76504f4cd2ad06480d88a5e933a671e0db072:2wzct4k7`
 From the CLI: `sgit clone sgit_private_read_0f01d367b04f886f6c65038649b76504f4cd2ad06480d88a5e933a671e0db072:2wzct4k7`
Published as a read key. The vault key is not published and never will be.

## See it live, here

[Open the vault in a new tab ↗](https://dev.vault.sgraph.ai/#sgit_private_read_0f01d367b04f886f6c65038649b76504f4cd2ad06480d88a5e933a671e0db072%3A2wzct4k7)Thirteen tabs and a graph canvas — it has far more room in its own tab than in the frame below.

## The decks, read straight out of the vault

Four decks climb the same four levels the vault does — what the standard is, the vault, the insurance model, and one control zoomed in. They are not screenshots of a deck and not a PDF sitting on a web server: the slides are read out of vault `2wzct4k7` as you click, with the same read key printed at the top of this page.

**What came from where.** The slides, the speaker notes, the screenshots and the PDF are vault files, fetched as ciphertext with the published read key and decrypted in your browser. Every control above it — the tabs, the slide list, prev and next, the notes toggle, the PDF button — is this site's, so the vault decides what is *shown* and never what this page *does*. The deck's own code runs in a sandboxed frame with no origin and no network; the slide you are looking at renders in a second one with scripting switched off entirely. [How this works, and why the PDF is a download rather than an embed →](../../../docs/vault/reading-a-vault-file.md)

**Each deck also has a page of its own** — the same slides, plus room for what the slides cannot carry. [All four decks, one page each →](decks/index.md)

## A fork, and what a fork is allowed to change

The [AIUC-1 catalogue](../aiuc-1-graph/index.md) is still published here, unchanged, and it is still the thing to read if what you want is the standard as data. **This vault contains all of it.** Not a summary of it, not a re-derivation — the same bytes:

> “`README.md`, `NOTICE.md`, `graph/`, `catalog/`, `sources/` and `evidence/` are byte-identical to the original, and the catalogue's own 21 tests still pass, including the one that rebuilds every source document to the word.”

That claim is checkable rather than decorative, and checking it is the first thing we did on the clone: `tests/run.py` reports **21/21 passed**, and the added layer's own `tests/test_conformance.py` reports **19 tests, 0 failed**. Neither opens the network.

It is the discipline that makes the fork readable at all. A derived artefact that quietly edits its source while adding to it leaves the reader unable to tell which parts are the standard and which are the opinion. Here the boundary is a directory: everything new is under `conformance/`, and stripping the extension returns the catalogue's app byte for byte — asserted by a test.

## The one rule the whole thing rests on

Two verbs, in two graphs, that are never traversed in one query without the query naming which it used:

| Edge | Lives in | Answers | Absent means |
|---|---|---|---|
| `evidenced_by` | the catalogue's `graph/edges.json` | does the standard say this? | a build defect |
| `attested_by` | the layer's `conformance/graph/edges.json` | does *this subject* do this? | **the control is unevidenced — which is the finding** |

The rule is enforced rather than described: *"`tests/test_conformance.py::test_two_edge_rule` is red if a layer edge ever reaches a `source_observation`."* In the explorer the two are drawn in different colours, under different legend headings, and never share a row.

The second row of that table is the interesting one. **Unevidenced is a state, and it is the default.** Every control in scope gets a row whether or not anyone has looked at it, so an absent row is never quietly read as compliance. The first build of one subject across all 53 controls comes out **2 evidenced, 48 unevidenced, 3 contradicted** — and that is the designed answer, not a failure to finish.

the layer, per control

### 53 rows, a level out of five, and the date it expires

Each row is a `conformance/v1` object: a state, a level from 0 to 5 derived from the requirements the control already has, the attestations behind it with their tier, and a `valid_until`. Levels are computed, not asserted — 1 is a core requirement evidenced, 2 is every core, 5 is all of them at the observed or third-party tier.

Two consequences of computing them fall straight out. Fourteen controls have no supplemental requirement and so skip level 3. And **six controls whose only requirement is third-party testing cannot leave level 0 on a self-report**, whatever the self-report says. A ladder you cannot climb by asserting things about yourself is a different object from a checklist.

Pick a subject and a date; every one of the 53 controls has a row, and most of them say `unevidenced`.

insurability

### The policy is a query, and time is what breaks it

The layer composes with the [Licence to Operate](../licence-to-operate/index.md) vault's instrument: the conformance state of each control becomes a **condition** or an **exclusion** on a `policy/v1`, and the bow ties decide which consequences are covered. At build time the answer is **1 condition met, 52 exclusions, 0 of 5 consequences covered** — every exclusion carrying its reason in the control's own words.

Then move the date. At 2027-01-15, **with nothing edited by anybody**, the single condition has expired and the policy has 53 exclusions. The vault states the point plainly: conditions become exclusions *"because the attestations behind them expire — which is the real-timeliness arriving as a consequence rather than as a feature."*

And then it declines to overreach. The policy object carries a `does_not_prove` field, and what it says it does not prove is *"that any control is in place: it proves what was attested, at what tier, and when it expires"* — and *"that the underwriter would write it."*

Coverage by consequence, with *why not* spelled out for each: no preventive barrier is evidenced at the required level.

two graphs, one canvas

### The crosswalk becomes a join, and the join finds a problem

AIUC-1 publishes 1,126 crosswalks to external frameworks as text. This layer resolves the EU AI Act ones into node ids in the published [regulation graph vault](../regulation-graph/index.md) — with CELEX and a hash on each edge — so a crosswalk stops being a string and becomes a traversal between two vaults.

**62 of the 1,126 resolve**, at article level, onto 27 articles. The remaining 1,064 target twelve frameworks with no published graph here, and are *reported unresolved rather than forced*. Then the join returns something neither vault knew alone: **8 of those 27 articles are amended by Regulation (EU) 2026/1744**, so the crosswalk was published against the text before amendment. That is a finding you cannot reach with a document.

The explorer, rebuilt on [graphs.sgit.ai](../../../network/graphs.md)'s universe techniques — and one of its packs is *another vault*.

The explorer states its own arithmetic in the header: *"Both graphs are loaded — the catalogue's 2788 nodes and 11610 edges, and the conformance layer's 182 and 414 — as one, and the canvas draws the neighbourhood you ask for, not all of it."* A verb register covers all **41 edge types across both graphs**, each with a unique inverse, so a link reads correctly from whichever end you stand at; **595 anchors** tie nodes to the exact bytes they came from, verified at build and again in the browser.

## What it is honest about

The layer publishes **17 findings** about itself, and the sharpest of them are the ones that undercut the ambition it was built with. The brief that specified it hoped the agent-to-standard join would be automatic; the finding records that it is not: *"the join needs an authored class map — it is not hand-free as the brief hoped."* Others record that the crosswalks resolve only at article level where the regulation graph has paragraphs, and that AIUC-1 has no recovery-barrier class at all, which is what stops several consequences from being coverable.

It also treats a stale acceptance as a first-class result. All three recorded acceptances, signed on 1 September, come back **stale** — not because anyone withdrew them, but because attestations written afterwards moved the barriers they were signed against. An acceptance is never edited here; its basis is captured at the moment of the decision and is allowed to go out of date on its own.

## Fourteen versions, seven of them a reconstruction

The Versions tab is this vault's own history, and it makes the fork's provenance the first thing you see: `hq21tlqu` named as the original, `2wzct4k7` as this one. Fourteen versions, seven with a real commit — and seven marked **reconstructed, no commit**, because everything the original catalogue ships was generated in a single run and nothing records it being built in stages.

Those seven carry `reconstructed: true` and a `basis[]` naming the files that make each stage a distinct thing. It would have been easier to write seven plausible commits. Labelling them as a reconstruction is the same instinct as leaving the unbuilt release in the catalogue: **a named absence is worth more than a tidy one.**

Both vault ids, stated at the top of the history: what was copied, and what this is.

## The first vault here that asks to write

The [catalogue](../aiuc-1-graph/index.md) it was forked from declares `"permissions": {}`. Two vaults published here have asked for something before — [the pitch](../voicedebrief-pitch/index.md) for downloads and external links, [licence to operate](../licence-to-operate/index.md) for filesystem *read* — but this is the first to ask for a write grant, and the first to ask for the model bridge:

```
"permissions": {
  "fs":  { "read": true,
           "write":  ["chat/"],
           "mkdir":  ["chat/"],
           "delete": ["chat/"] },
  "llm": { "chat": true, "models": true, "usage": true }
}
```

The **Chat** tab threads with the vault's own model through `sg.llm.*`, grounded by tools that can read any file in the vault, query both graphs, and drive the tabs. This is the bridge that [llms.sgit.ai](../../../network/index.md#agents-ai) documents and that [our own chat panel](../../../articles/chat-on-a-static-site.md) could not use: the key lives below the permission floor in the host, and the app never sees it.

The write grant is the part to notice. It is `["chat/"]` and nothing else — so the conversation is stored in the vault, versioned like everything else, while `conformance/terms/`, the authored inputs the whole query depends on, **cannot be written by the app at all**. The host refuses. As the vault puts it: *"the vault holds the terms and the browser holds the run; the app never writes the terms."* A read-key visitor cannot write anywhere regardless; the grant matters to whoever holds the write key.

## It reads this estate, and hashes what it reads

The References tab is unusual enough to call out. It names the sites and vaults this build drew on — [graphs.sgit.ai](../../../network/graphs.md) for the explorer's techniques, [risks.sgit.ai](../../../network/index.md#risk-governance) for the acceptance model, [pki.sgit.ai](../../../network/pki.md) for the `policy/v1` object, [coding.sgit.ai](../../../network/index.md#agents-ai) for the testing practice, and five published vaults including this site's own [regulation graph](../regulation-graph/index.md) and [licence to operate](../licence-to-operate/index.md) — and then copies the source documents into `references/documents/` **with a SHA-256 for each**.

It is the first vault published here that treats the rest of the network as a citable source rather than as background, and the first to record *where each idea it borrowed lands in its own files*. If the argument on [the network page](../../../network/index.md) is that these twenty sites are one body of work, this is the first artefact that demonstrates it from the inside.

## Notes

**649 files, 43 MB** — against the catalogue's 135 files and 18 MB. The added weight is the layer, the rebuilt explorer, three decks with PDF exports, and the copied reference documents.

**Audited before publishing.** No sgit vault keys, no third-party API keys, no private keys, no personal data. Two sgit read keys appear inside it, both by design and both already public: the [regulation graph](../regulation-graph/index.md) it resolves crosswalks into, and the [Risk Graph Explorer](../risk-graph-explorer/index.md) it inherits the acceptance model from.

**The subjects are invented.** `team:support` and `agent:concierge` are constructed for the demonstration. Nothing on the Conformance tab is a statement about a real organisation's controls, and the conformance object exists to show the shape of the question, not to answer it about anybody.

**The open question from the catalogue applies here too, doubled.** Its `NOTICE.md` records that reuse rights for the full AIUC-1 control text have not been confirmed with AIUC, and that anyone republishing it publicly should confirm them first. This vault republishes that text and adds a layer on top of it. It is here at the author's decision, with the disclaimers reproduced rather than summarised away, and the vault's own remedy stands: *"If you are AIUC and want something here changed or removed, the fastest route is the sgit.ai project behind graphs.sgit.ai. Removal will be honoured."* That undertaking is repeated here and applies to this page and to the [catalogue page](../aiuc-1-graph/index.md) alike.

[← The AIUC-1 catalogue this was forked from](../aiuc-1-graph/index.md) · [All published vaults](../index.md)


---

*[Site index for agents](../../../llms.txt) · [HTML version](https://sgit.ai/demos/vaults/aiuc-1-conformance/index.html)*
