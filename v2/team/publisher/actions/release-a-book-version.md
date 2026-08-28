# Action: release a new version of a book

**Input** content that has changed, and an approved reason it changed.

**Method**
1. Move the book's version in `gen_bookmeta.REGISTER` — patch for a correction, minor for
   a real change of substance. `v1.0.0` stays reserved.
2. Rebuild the book: `v2/books/<slug>/build.py`, then `gen_bookmeta.py`, then
   `gen_bookpub.py`.
3. Compare the rebuilt PDF against the previous one page by page. A change to one chapter
   should not move 90 pages.
4. Narrate a row in `admin/versions.html` saying what changed **in the book** and why.
5. Both gates green; commit with the site version in the subject; push.
6. If the book is published, prepare the Leanpub release note in the reader's language,
   not the repository's.

**Done test** `book.json` names the new version, its chapter hashes match the files, the
PDF page count is computed rather than carried, and a reader can tell what changed.
