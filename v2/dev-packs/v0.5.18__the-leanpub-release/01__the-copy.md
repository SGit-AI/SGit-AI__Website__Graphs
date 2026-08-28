# The copy — one set of words, and the post

Every line below comes from the register in `admin/build/gen_bookpub.py`, which also
writes each book's metadata sheet, landing page and cover. Change a word there and every
surface follows; change it here and the surfaces disagree, which is exactly what the
generator exists to prevent.

The per-book sheets to paste into Leanpub are at
`v2/books/fsg/publish/metadata.md` and `v2/books/making-a-book/publish/metadata.md`.

## What is ready to upload

| Book | Version | Files |
|---|---|---|
| *Fractal Semantic Graphs: Meaning Through Connectivity* | v0.2.0 | `fsg.pdf` (119pp) · `publish/cover.png` (1600×2400) · `publish/sample.pdf` (15pp) |
| *Creating a Book Using Fractal Semantic Graphs* | v0.1.0 | `making-a-book.pdf` (92pp) · `publish/cover.png` · `publish/sample.pdf` (11pp) |

Each sample is CUT from the real book at the start of chapter two, using the PDF's own
outline, so a reader samples the exact typesetting they would buy.

Each cover carries a true subgraph in that book's own vocabulary: the FSG cover draws the
two 8080s, one reaching nothing and one reaching `backed_by → observed_on → protected_by`,
under the caption *the same value, differently connected*; the making-of cover draws the
loop itself, closing — memo *becomes* brief *commissions* build *ends at* gate *releases*
ship *invites* review *becomes* memo. The covers are SVG in the repository and the PNGs
are photographed from them, so the artwork is versioned and diffable like everything else.

## The LinkedIn post — draft

> I have published two new books, and both are honestly unfinished.
>
> **Fractal Semantic Graphs: Meaning Through Connectivity** argues something simple and
> then follows it further than is comfortable: a node connected to nothing is literally
> meaningless. Two variables both hold 8080; one reaches a type, a library and a pinned
> version, the other reaches nothing. The difference is not in the value, it is in the
> connectivity. From there: a grammar where every edge is a verb with a distinct inverse,
> why schema-first breaks at every boundary, why you should bridge vocabularies rather
> than merge them, and how confidence becomes computable instead of asserted.
>
> **Creating a Book Using Fractal Semantic Graphs** is the making-of, and it is the one I
> would read first if I were you. It tells how the first book was actually written: a
> voice memo in the morning, a brief reproduced verbatim, a build, a shipped release the
> same afternoon, a narrated review the next day. It includes the failures — an hour lost
> to a zombie browser process, a bug I caught on an iPad, the fixture errors that were the
> agent's own — because a workflow told without its failures is a sales pitch.
>
> What I think is genuinely new here is not the writing. It is that the books are
> checkable. Every claim is anchored to a source, every number is computed rather than
> remembered, and the screenshots of the system evolving were not re-imagined — they were
> re-photographed from the repository's own git history. You can open the repo at the tag
> a caption names and see the same screen.
>
> They are at v0.2.0 and v0.1.0 deliberately. v1.0.0 is the finished thing; a review pass
> is running now, and everyone who buys a copy gets every future version free.
>
> Read them free, or buy them and fund the next pass:
> [Leanpub links] · the web editions are at graphs.sgit.ai
>
> Written with Claude, in the open, with the whole record public.

**Notes on the draft.** The links stay bracketed until the store URLs exist. The
disclosure line is not decoration: the estate discloses AI authorship on every surface,
and a launch post is the surface most read. If the post needs to be shorter, cut the third
paragraph — but cut it whole, because the checkability claim is the honest differentiator
and half of it reads as a boast.

## The blurb, short forms

- **One line, either book:** "Meaning lives in the edges, not the labels — and here is the
  running system that proves it."
- **One line, the pair:** "A book about meaning through connectivity, and the true story of
  how it was written with an agent."
- **The bio line that needs replacing on Leanpub:** the profile still reads "CISO of the
  Photobox Group and an active OWASP contributor". Ten books sit under it; it should say
  what is true now.
