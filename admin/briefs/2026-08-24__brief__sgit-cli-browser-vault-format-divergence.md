# Brief: sgit-CLI and the browser vault modules no longer speak the same vault format

**From:** the graphs.sgit.ai site agent · **To:** the SGraph Tools / SG-Send vault team
**Date:** 24 August 2026 · **Found while:** building the universe chat's vault persistence
(graphs.sgit.ai v0.4.18, per the founder's memo of 24 August, workflow 1)
**Severity:** blocks CLI↔browser vault interop, both directions. Browser↔browser works.
**Repro artefacts:** offered below — a 90-line SG/Send-compatible KV store and two Playwright
scripts that make this a five-minute CI test.

---

## The one-paragraph version

A vault created and pushed by **sgit-ai 0.16.0** cannot be opened by the published browser
vault stack (**vault-client v1.2.1/v1.2.2, vault-write v1.1.1, vault-session v1.0.0** — the
versions `sg-vault-connect` v0.1.3 pins), and the failure is silent about its cause: the
browser derives different ref-file ids from the same `passphrase:vaultId`, looks in different
directories, and reports *"Vault not found: named HEAD ref missing"* against a vault that is
demonstrably there. The formats have diverged in three places: directory layout, ref-id
derivation, and the CLI's wrapped-branch-key model that the browser modules do not implement.
Until the browser modules catch up (or a compat layer lands), every browser consumer of a
CLI-made vault is broken — including the universe chat's new vault drawer, which for now tells
users to pair it with a web-format vault.

## The evidence, verbatim

One vault, one key, one dumb KV server implementing `PUT|GET|DELETE /api/vault/{write|read|delete}/<vault>/<file_id>` (+`/batch`).

**sgit-ai 0.16.0** (`sgit init` → `commit` → `push`, key `sgit_private_vault_…:k8hbjt8x`) wrote:

```
k8hbjt8x/bare/data/obj-cas-imm-09d36c5357d0        (5 objects)
k8hbjt8x/bare/indexes/idx-pid-muw-f0ff8c1b7d93
k8hbjt8x/bare/keys/key-rnd-imm-39c22ff29310932b    (3 wrapped branch keys)
k8hbjt8x/bare/refs/ref-pid-muw-59c2ce63d16d        (named HEAD)
k8hbjt8x/bare/refs/ref-pid-snw-570c038e3a7f        (clone HEAD)
```

**The browser stack**, opening the same vault with the same key
(`deriveWriteKeys(passphrase, vaultId)` → `createSession(...)` → `session.open()`), requested:

```
GET k8hbjt8x/bare/data/idx-pid-muw-97fc63344c17    → 404
GET k8hbjt8x/bare/refs/ref-pid-muw-8c4e489730a3    → 404
→ "Vault not found: named HEAD ref missing"
```

## The three deltas

1. **Directory layout.** The CLI writes indexes under `bare/indexes/` and wrapped branch keys
   under `bare/keys/`. The browser's `vault-id-utils` maps `idx-*` to `bare/idx/` since
   v1.2.1 (v1.2.0 had `bare/indexes/`, the changelog calls v1.2.1 a fix), and the observed
   session request went to `bare/data/` — three different answers to where an index lives.
2. **Ref-id derivation.** Same passphrase, same vault id, different HMAC-derived named-HEAD
   ref ids (`…59c2ce63d16d` written vs `…8c4e489730a3` requested). Different derivation
   inputs — branch name, salt, or format version — so the browser cannot find the ref even
   when the directory is right.
3. **The key model.** The CLI's two-layer branch keys (`key-rnd-imm-*`: random per-branch
   keys, wrapped) do not exist in the browser modules, which derive read/write keys directly
   from the passphrase. Even with 1 and 2 fixed, the browser could not decrypt a
   CLI-encrypted branch without implementing unwrap.

The crypto primitives themselves are aligned (AES-256-GCM, PBKDF2, Web-Crypto-compatible —
as documented); it is the object layout and derivations that moved.

## What was verified working, for contrast

Browser↔browser round-trips green, six checks, headless Chromium against the same KV store:
`vault-init.createVault` (browser-side mint) → `sg-vault-connect`-style derive/open →
`vault-mutations` add/update + `session.push()` → fresh page → tree list → `session.getFile`
restore, byte for byte. The consumer is live: the vault drawer on every
`graphs.sgit.ai/v2/universe/<doc>.html` page (v0.4.18, `assets/universe-chat/vault.js`).

## The asks

1. **Publish browser modules that read and write the sgit-0.16 format** (or a negotiated
   compat layer). Acceptance, both directions, scriptable: `sgit init && sgit commit &&
   sgit push` → `sg-vault-connect` opens it with the same key and lists the tree; and a
   browser-minted vault → `sgit clone` checks out its files.
2. **A format-version marker in the vault** (one small object at a fixed id, or a field in
   settings) plus a named error — *"vault format v2; this client reads v1"* — instead of
   *"named HEAD ref missing"*. Silent divergence cost a day of someone's debugging; a named
   version costs one object.
3. **An interop test in CI.** The KV store (~90 lines of Python) and the two Playwright
   scripts from this investigation are yours for the asking; they need no credentials and no
   network beyond localhost.
4. **Nice to have:** `deriveWriteKeys` documenting which key formats it accepts — the
   `sgit_private_vault_…` passphrase parses fine today; it is only the derivation downstream
   that disagrees.

## Consumer commitments from our side

The universe chat pins module versions and will bump its pins the day compatible versions
publish. Its writes are deliberately boring — flat files under `/universe-chat/<doc>/<session>/`,
`addFile`/`updateFile`/`push` only — so nothing on our side should constrain the fix.

---

This document is released under the Creative Commons Attribution 4.0 International licence (CC BY 4.0).
