# House style for the chapter text

This file governs everything under `content/`. These files are the book: the PDF and
the website are both projections of them, and the PDF is the priority surface. The
policy below was set by the founder on 21 August 2026.

## 1. Write for the book first, neutrally where possible

The same text renders as a website chapter and as a printed page, so prefer wording
that works in both:

- Refer to the work as **"this book"** or just **"here"**, never "this site".
  (The website hosts the book, so "this book" reads correctly there too.)
- Never write "this page" or "on this page". The build rewrites leftovers to
  "this chapter" in the book, but new text should not need the safety net.
- Cross-reference other chapters **by their title**, linked: "as *What ships, what
  is argued* shows". Not "the shipped page".
- Web mechanics (llms.txt, fetch URLs, constructed paths) belong in the
  "For an agent" blocks and the site's admin pages, not in chapter prose.

## 2. Expand every shorthand at first use, per chapter

Each chapter is read standalone on the web and in sequence in the book, so the first
use **in each chapter** carries the expansion in parentheses:

- gap numbers: "gap G3 (the third of the twelve gaps catalogued in the brief pack:
  pages the corpus could not supply)"
- task/ask numbers: "task T1 on the comms board (the public task list at
  graphs.sgit.ai/admin/comms.html)"
- acronyms: 2FA, MFA, DAG, SBOM, RDF, IAM, HMAC, REPL and the rest are spelled out
  once per chapter. If a term is in the glossary, still expand it inline.

## 3. Punctuation: no em-dashes in our own prose

The em-dash (—) is the loudest tell of machine-written text, and this book is open
about how it was written; the tell still goes. In prose we write, use a comma, a
colon, a full stop, or parentheses instead. Two exceptions, deliberate:

- **Verbatim quotes keep their original punctuation.** The founder's transcribed
  voice is source material; do not edit it, ever.
- **Attribution lines** in `::: quote` blocks begin with "—" by typographic
  convention, and the renderer depends on it.

Related tells to avoid: "delve", "dive into", "it's worth noting", "crucially",
three-item flourishes used more than once per chapter.

## 4. What the markdown may contain

CommonMark plus: `::: note / warn / claim / quote / agent / ladder / meta`
directives, ` ```path ` fences ([Fact] -backed_by-> [Evidence]), ` ```mermaid `,
`{#anchor}` heading ids, `{.class}` after a table, and embedded HTML as the escape
hatch. See admin/build/gen_pages.py for the full grammar.

Edit these files, never the rendered pages: the build fails if the two disagree.
