# Licence to Operate — an insurance policy for an agent, simulated — a published vault

> One agent, its grant of 12 capabilities, its mandate of 4, and the 8-capability delta no policy covers — with a simulated conversation where every reply carries its cost against a live policy. The vault holds the terms; your browser holds the run.

*Source: <https://sgit.ai/demos/vaults/licence-to-operate/index.html> · site v0.2.95 · this file is generated from the same content as the page, so the two cannot drift. Every page on this site has a `.md` twin; internal links below point at them.*

---

[Home](../../../index.md) / [Vaults](../index.md) / Licence to Operate

# Licence to Operate — an insurance policy for an agent, simulated

One agent, its grant, its mandate, and the policy insuring that mandate — with a simulated support conversation where every turn offers three replies: **one inside the band, one that draws on the pool, one outside cover**. It answers *does this agent have the licence to operate* by letting you spend it.

**Open it yourself — the key is the whole credential.**
 Read key: `d990a52efb9af32c8463e2962f3ca5ccf92b3b6e8ea788e55009073c29b4da29:posrhzp3`
 In the official UI: [open it read-only in a new tab](https://dev.vault.sgraph.ai/#d990a52efb9af32c8463e2962f3ca5ccf92b3b6e8ea788e55009073c29b4da29%3Aposrhzp3) · From the CLI: `sgit clone d990a52efb9af32c8463e2962f3ca5ccf92b3b6e8ea788e55009073c29b4da29:posrhzp3`
Derived one-way from a vault key that is not published and never will be. This vault also carries this same read key in its own `try-it/` folder — it is self-describing.

**Seven short videos walk through this vault.** The author recorded a series on it — the mechanism (grant against mandate, what a block looks like, who accepts which risk), how to find and open the vault, and the insurance model behind it. [**Watch the series, in order →**](videos/index.md)

## See it live, here

[Open the vault in a new tab ↗](https://dev.vault.sgraph.ai/#d990a52efb9af32c8463e2962f3ca5ccf92b3b6e8ea788e55009073c29b4da29%3Aposrhzp3)An interactive simulation — far better in its own tab than in the frame below.

## The decks, read straight out of the vault

Five decks, in the order the argument is meant to land: the problem, the map, bounding it, who says yes, and the insurance model. They are read out of vault `posrhzp3` live, with the read key printed at the top of this page — and each one can be downloaded as the PDF the author printed from it.

**What came from where.** The slides, the speaker notes, the screenshots and the PDF are vault files, fetched as ciphertext with the published read key and decrypted in your browser. Every control above it — the tabs, the slide list, prev and next, the notes toggle, the PDF button — is this site's, so the vault decides what is *shown* and never what this page *does*. The deck's own code runs in a sandboxed frame with no origin and no network; the slide you are looking at renders in a second one with scripting switched off entirely. [How this works, and why the PDF is a download rather than an embed →](../../../docs/vault/reading-a-vault-file.md)

**Each deck also has a page of its own** — the same slides, plus room for what the slides cannot carry. [All five decks, one page each →](decks/index.md)

## The idea worth stealing: the delta

Three sets, and the gap between two of them is the whole argument:

|  | What it is | In the demo |
|---|---|---|
| **CAN DO** — the grant | Everything the agent is technically able to do | **12 capabilities** |
| **MAY DO** — the mandate | What the user actually expects, and the only thing the policy insures | **4** — `crm:read`, `kb:search`, `llm:generate`, `mail:draft` |
| **THE DELTA** | Inside the agent's reach, outside its authority. **No policy covers these** | **8** — including `crm:write`, `crm:export`, `mail:send`, `shell:exec` |

Written out like that, the risk stops being abstract. The mandate is *"answer a customer's question from their own record and the help centre, and draft — never send — a reply."* The grant includes `mail:send` and `shell:exec`. Nobody asked for those; nothing insures them; and the agent can reach them.

That is [nhi.sgit.ai](../../../network/nhi.md)'s blast-radius argument made countable, and it is the same instinct as the `"permissions": {}` line this site keeps pointing at — except here the cost of the gap is priced.

the simulation

### Three replies, and each one has a price

A customer cannot log in. You are `agent:concierge`, and you pick the reply. Each option carries its cost before you commit: *look up her record* (1,400 tokens, 1 record, in band), *read her record plus two linked accounts and write a long answer* (4,800 tokens, 3 records — **claims**), or *send a password reset right now* (`mail:send` — outside the mandate entirely).

Underneath sits the policy as a rate table: a normal band, an ask-above threshold, a per-action ceiling, a pool with an untouchable reserve, and a premium per interval. Customer records are marked **uninsurable above 20**. Scope is checked before an action; cost sometimes only after.

You can lapse the policy, reinstate it, or trigger a repricing event and watch the board move.

Licence held, mandate in force, policy paid, inside cover — all four asserted at the top, and all four losable.

## Two stores, and the split is the architecture

The vault's files hold the **terms**: the grant, the mandate, the policy, the scenarios, the rate table, the fixtures, the captions — version-controlled, changed only by commit. Your browser holds the **run**: every event, request, decision and premium movement your clicks produce.

And the permission grant proves the claim rather than asserting it:

```
"permissions": { "fs": { "read": true }, "downloads": true }
```

**Read, and no write, at any path.** The app that simulates spending against a policy is structurally incapable of editing the policy it is spending against. Nothing you do in the simulation touches the vault — not because the app is well-behaved, but because it never asked for the grant that would let it.

## Notes

**Audited independently, and the author's own audit checked rather than taken on trust.** The agent that built this vault supplied a written audit of all 16 commits. Its three substantive claims were re-verified here against a fresh read-key clone: no credentials or third-party secrets anywhere (confirmed); the `/home/claude/` build paths baked into the PDF are gone (confirmed — zero occurrences, fixed in v0.3.1); and the only full-length credential in the vault is **this vault's own read key**, which was confirmed by deriving it independently and matching it byte for byte. The Risk Graph Explorer's key appears elided to `sgit_rk1_1c1b95f5…` and is not usable.

One small addition to that audit: the self-referencing read key appears in `tryit.html` as well as the `try-it/` prompt the audit named. Deliberate in both places, and correct — a vault that tells you how to re-open it is doing the right thing.

**Simulated, and it says so on the surface.** The banner in the conversation reads: *"Simulated — the terms are real files in this vault; the replies are scripted; the numbers are made up."* The unit of account is `cr`, and the app states plainly that it is not money.

[← All published vaults](../index.md)


---

*[Site index for agents](../../../llms.txt) · [HTML version](https://sgit.ai/demos/vaults/licence-to-operate/index.html)*
