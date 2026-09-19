---
created: 2026-09-19T13:00:00Z
priority: medium
source: v0.6.20 — the front door's numbers strip
closed: 2026-09-19T13:20:00Z
---

# A counter that returns zero reads as a claim that the thing does not exist

The front door carries a card for the methods register, and the card's tag is the
number of techniques in it, counted at build time rather than typed. On the first
render the card read **"0 TECHNIQUES"** above a link to thirty-five of them.

The counter was `len(glob("v2/methods/*.html")) - 1`: count the files, subtract the
hub. It is a correct count of a register that is a folder of pages. The methods
register is one page holding a `<tr>` per technique, so the count was `1 - 1`.

The same pass had a second one. `memos` globbed every numbered markdown file in both
brief folders and got 46, but a brief folder also holds the librarian's notes and the
original pack documents. The honest count is the files that name a founder: 33.

## Why this is worth an issue rather than a fix

Because the page renders derived numbers specifically so that it cannot state a
remembered one, and a derived number that is wrong is worse than a remembered one:
it carries the authority of having been computed. Nothing in the build objected. The
test that checks the numbers strip passed, because it checks that every number on the
page came from the inventory, and zero did.

## The fix

`methods` counts `<tr id="m-` rows. `memos` counts brief files naming a founder.

## The gate

`gen_home.inventory()` raises if any count comes back falsy, naming the counters that
returned nothing: *"these counted nothing, so they are not counting"*. Run red by
forcing `methods` to 0 in a throwaway copy of the generator, which named it.

Zero is not a safe default for a count of something the page is linking to. Every
number in that strip is a count of something this estate has more than none of, so
zero always means the counter broke.
