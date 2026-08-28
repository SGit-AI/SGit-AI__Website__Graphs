# Action: revise a chapter

**Input** an approved, scoped change naming the chapter and what is wrong.

**Method**
1. Edit `v2/books/<slug>/content/NN__*.md`. Nothing else.
2. Any number that enters the prose is computed or quoted in the same session; record
   where it came from.
3. Any screenshot is taken from the real page with the repository's harness.
4. Rebuild the book, and read the rendered page rather than the markdown.
5. Hand to the publisher: the chapter hash has changed, so the book's version must move.

**Done test** `gen_bookmeta.py` passes, meaning content and version moved together. The
chapter reads in the estate's voice. No em-dash entered the authored prose.
