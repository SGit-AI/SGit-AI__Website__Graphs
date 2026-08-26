# Brief 38 — founder memo: three books from this estate (the book-writing pack)

**Date:** 26 August 2026
**Source:** a typed message, sent after v0.5.9 went live, commissioning something a
little bit different: not a build round but a WRITING round — three books, three fresh
sessions, one pack. Reproduced verbatim below. The agent's reading follows; the pack
itself is at `v2/dev-packs/v0.5.10__the-book-writing-pack/` and is rendered under
`/v2/dev-pack/`.

---

## The memo, verbatim

> Great work , now for something a little bit different, can you write a brief to write
> three books/pdf created from this repo and the work we have done so far (I have a long
> flight tomorrow and will use it to read these)
>
> - on a new Claude code session
> - taking into account the 1st book, the 21 referenced docs , the fractal examples in
>   this repo + the others added to https://sgit.ai/demos/vaults/index.html , the
>   multiple *.sgit.ai sites we have been creating (in other Claude sessions)
>   https://sgit.ai/network/index.html and very importantly the work and workflows from
>   the 2nd book , namely the universe work (which really shows a lot of the practices
>   and ideas in action)
> - using the title: “Fractal Semantic Graphs: Meaning Through Connectivity”
> - (apart from the title which is locked) have full editorial freedom on the books
>   content and structure
>
> Create these books/webpage/pdf
>
> 1) the universe for the “Fractal Semantic Graphs: Meaning Through Connectivity”
> 2) the “Fractal Semantic Graphs: Meaning Through Connectivity” book
> 3) a new book focused on “Creating a book using Fractal Semantic Graphs” (which
>    basically tells the story so far of how we have been doing on book 2 , namely all
>    the experimentations, discoveries, MVPs / Pocs (with screenshots of the evolution),
>    the use of Claude and our agentic workflow …. Basically an expansion of that great
>    analysis that you did on the v0.4.x versions . This book is aimed at other authors
>    that want to use similar agentic workflows to write their own books
>
> Basically what I need you to do is to create a book writing pack (same style as the
> dev packs) so that I can create 3 different Claude code sessions (one per book) and
> say: read this initial prompt (which should contain instructions for everything that
> needs to be read). Make this one pack with 3 entry points, since most should be very
> similar between the briefs to each agent

---

## The agent's reading: the instructions, numbered

1. **One pack, three entry points.** Most of the material is common, so it is said once:
   a shared README (the commission, the run instructions, three governing rules), a
   shared corpus file (five layers of reading with fetch paths, skim markers and
   precedence rules), shared conventions (output shape, screenshot harness, honesty
   gates, branch discipline, definition of done) — and one entry file per book carrying
   a paste-ready prompt plus that book's editorial charter. *Built as working pack
   `v0.5.10__the-book-writing-pack`, dev-pack style, rendered on the site like every
   other pack.*

2. **The corpus is everything named**: the first book and its 17 chapter sources; the
   referenced documents (the briefs at their stable constructed URLs, the carried docs,
   the second edition's 21-source list); the fractal examples in this repo AND the two
   live external indexes (the vault demos and the network of *.sgit.ai sites — fetched
   fresh, described only as found); and, weighted most heavily, the second book's
   working surface — the universe work, the WCLM and its operators, the briefs, the
   registers, the narrated release history.

3. **The title is locked; the rest is editorial freedom.** The pack repeats this in
   every entry, and each charter is explicitly marked proposals-not-orders.

4. **The flight is the deadline shape**: each book must land as ONE self-contained
   60–120 page PDF that reads offline start to finish, sent to the founder the moment a
   complete draft exists, with the web version as companion.

5. **Book A** is the universe FOR the title: the concept graph of the whole corpus as a
   readable atlas, one spread per concept, grouped by neighbourhood, with a machine twin
   (universe.json in the pilot's extraction shape) so the atlas is literally the
   universe book B and future engines can stand on.

6. **Book B** is the book: the argument from first principles AND from the running
   system, with a proposed eight-chapter spine and the corpus's honesty positions
   carried verbatim.

7. **Book C** is the expansion of the v0.4 retrospective through the v0.5 era, for other
   authors: the loop, the briefs-as-contract, the gates, the two-agent discipline, the
   experiments as PoC-to-product stories, the failures lovingly told, and a playbook
   that stands alone — with the evolution screenshots RE-TAKEN from history via the
   repo's own git tags (worktree per tag, serve, screenshot), so the figures are
   evidence, not memory.

## The agent's notes back

- **Three parallel sessions share one repo**, so the pack makes the collision rule
  explicit: each book on its own branch, no push to `dev` without the full release
  ritual, integration as a separate single-session step. The PDF reaches the founder
  directly either way — the flight does not wait for a merge.
- **Question — book A and B coupling.** B is told to use A's universe if it exists in
  time and to anchor directly to the corpus otherwise, so neither session blocks on the
  other. If the founder prefers strict sequencing (A first, then B reads A), say so in
  the sessions' prompts.
- **Question — where the books ship.** The pack proposes `v2/books/<slug>/` and leaves
  site navigation and llms.txt entries to the integration step, deliberately outside
  the three writing sessions' scope.
