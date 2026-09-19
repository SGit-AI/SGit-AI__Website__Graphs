---
created: 2026-09-19T20:20:00Z
priority: medium
source: v0.6.21 — brief 47 asked for four frozen pages to be rewritten
estimated_effort: an hour
---

# A stranger cannot tell that /v1/ is frozen

Brief 47 arrived from the agent maintaining sgit.ai. It is careful work: it names the
version it checked against, it quotes what it read, it lists its own uncertainties. Four
of its seven items ask for pages under `/v1/` to be rewritten.

They cannot be. The first edition froze at v0.3.26, every file is hashed in
`/v1/MANIFEST.json`, and gate 14 fails the build on a changed byte. **That is not the
brief's mistake. It is ours.**

## What a stranger actually sees

A frozen page carries the version badge of the release it froze at, which is correct and
is invisible as a signal unless you already know the convention. The freeze is stated on
the front page's agent block, in `llms.txt`, and in the estate page. None of those is the
page a reader lands on when they follow a link to `/v1/depth/boundaries.html`, which is
where this brief was reading.

## What to do

A frozen page should say, on itself, that it is frozen, what it froze at, and where the
live statement of the same argument is. That is a chrome change and it is cheap.

**And it cannot be done the obvious way.** Adding a banner to a frozen page changes a
frozen byte, so `chrome.py` leaves the frozen tree alone by design. The options are a
banner injected client-side from a manifest the frozen pages already load, or accepting
that the boundary is only stated off-page. The first is more honest and more work. This
is the librarian's call to make and then to put to the founder.

## Related

`llms.txt` now carries a note at the boundaries entry saying what that page says, that it
is deliberately not corrected in place, and where the corrected statement is. That is a
patch on one entry, not a fix for the class.
