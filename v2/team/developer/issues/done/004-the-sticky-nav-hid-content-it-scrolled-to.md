---
created: 2026-08-28T19:20:00Z
priority: high
source: the founder, reading a screenshot taken at v0.6.15 — "can you see the bug"
closed: 2026-08-28T19:20:00Z
---

# The sticky nav hid the content the page had just scrolled to

The founder spotted it in a screenshot where the banner sat in the middle of the
page. The agent's first reading was that this was a capture artefact of a sticky
header in a full-page screenshot. **That was wrong**, and measuring it took two
minutes where arguing about it took longer.

## What it was

`nav.site` is `position: sticky; top: 0`. Anything scrolled to the top of the
viewport lands underneath it. The site had a convention for that, and the
convention was two hard-coded numbers: `scroll-margin-top: 64px` and `70px`.

**The nav row wraps**, so its real height depends on width:

| Width | Nav height | Content hidden, before |
|---|---|---|
| desktop 1440 | 104px | **87px** on the figure view, 34px on every anchor jump |
| phone 390 | 92px | 76px |
| iPad 820 | 55px | 38px |

So the hard-coded value was wrong at two of the three widths, and the figure
viewer shipped at v0.6.15 had no offset at all, which is why the founder saw it
there first. **Every in-page anchor on the site was affected**, not just the new
page: `#rules`, `#figures` and every `h2` link landed 34px under the banner.

## The fix

`nav.js` measures the nav and publishes `--navh`, refreshed by a `ResizeObserver`
on the nav itself so a wrap updates it. `site.css` sets
`html { scroll-padding-top: var(--navh, 104px) }`, which corrects **every** anchor
jump and every `scrollIntoView` on the site with one rule, and the two hard-coded
`scroll-margin-top` values now read the same variable.

The fallback is the tallest of the three heights, because over-scrolling leaves a
gap and under-scrolling hides content, and only one of those is a bug.

Measured after: 16 to 17px of clearance at all three widths, 0px hidden on the
anchor jumps that were 34px under.

## The gate

A test refuses any hard-coded pixel `scroll-margin-top` or `scroll-padding-top` in
`site.css`, and requires `nav.js` to publish `--navh`. Run red against the old
`64px` before it was trusted.

## What to take from it

A screenshot is evidence. The agent looked at one, saw something wrong, explained
it away as an artefact of its own tooling, and moved on. Two of the estate's own
rules cover this: measure rather than remember, and a view is an instrument — a
new view routinely finds an error nobody was looking for. It did. The instrument
was working; the reading was not.
