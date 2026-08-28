# Action: map a book

**Asked by** brief 40: *"a research project where we map out what is the book, what is the
book about."*

**Input** a book slug under `v2/books/`.

**Output** `debriefs/NN__map-<slug>.md` containing, every claim anchored to the book's own
chapters:

1. **What the book actually does**, chapter by chapter, in one line each — derived from
   the chapter text, not from the chapter titles.
2. **The claims it makes** that a reader would repeat afterwards.
3. **What it refuses to claim**, and where each refusal appears.
4. **Who it addresses**, with evidence: the reading level it assumes, the tools it expects
   the reader to have, the passages that only make sense to someone who writes code.
5. **What it is not about**, tested against its own title.
6. **The words it uses for itself**, counted, so a title can be built from the book's own
   vocabulary rather than from a brainstorm.

**Done test** every numbered claim cites a chapter and a passage. A reader who disagrees
can go and check.
