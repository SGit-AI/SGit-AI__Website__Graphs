# graphs.sgit.ai — meaning through connectivity

A node carries no inherent meaning. What a thing *is* emerges from the edges traceable from
it, and confidence in that meaning is proportional to how richly it is connected. Properties
are "just words"; connections are meaning.

**Not a graph database pitch.** The claim is that one grammar is the interface at every
boundary — not that things are stored in a graph. There is no graph database anywhere in the
work behind this site, and the site says so on its own page.

Live site: https://graphs.sgit.ai (GitHub Pages, deployed from `dev`).

## Structure

- `index.html` — the front page: the epigraph, the 10,000-hours story, three altitude doors,
  the proof strip, and the what-ships-what-is-argued split
- `index.md` — the markdown twin of the front page
- `start/` — **altitude 1**, the city walls: a node is just a node; the same value differently
  connected; the five Reviews; the confidence ladder; map the gaps
- `grammar/` — **altitude 2**, the rules you can apply tomorrow; `edge-set.html` publishes the
  edge vocabulary the corpus cites but never wrote
- `depth/` — **altitude 3**: against schema-first, ontologies of ontologies, node type
  formulas, the grounding ladder, supersede-never-delete, concepts-not-words; `boundaries.html`
  carries fractality, a graph at every boundary, projections, twins and the air gap
- `why-graphs/` — the page for a sceptic, and the GraphRAG / RDF / property-graph positioning
- `examples/` — worked graphs with real numbers; three have their own pages
- `maps/` — Wardley maps as graphs, and the `[visibility, evolution]` coordinate trap
- `book/` — **the site as a book**, *Meaning Through Connectivity*: sixteen chapters in six
  parts, generated from the site's own pages by `gen_book.py`, in three reading modes —
  chapter pages with a left table of contents, one single page, and two PDF editions
  regenerated together from the same chapters: a print interior (6″×9″, mirrored gutters,
  folios, paginated contents — typeset by WeasyPrint from `book/print.html`; KDP-ready,
  cover excluded) and a screen edition (Chromium's print of `single.html` at US Letter,
  in the site's own design). Each carries the site version on its cover.
  `book/manifest.json` records source hashes; the gate fails if the book goes stale
- `glossary/` — every technical term with a plain-English alternative beside it
- `shipped/` — what is built, what is argued, and what does not exist anywhere
- `origins/` — ten phases, February to August 2026, and the paths not taken
- `network/` — why the graph argument bears on each sibling site
- `documents/` — reader pages for the source documents (raw markdown is the source of truth)
- `briefs/` — those source documents, verbatim, with three redactions recorded in `PUBLIC.md`
- `about/participant.html` — the participant disclosure, the site-wide licence, and where our
  approach loses
- `admin/` — engineering: comms (asks & tasks), versions, build tooling
- `admin/build/chrome.py` — the single definition of nav and footer, applied across every page
- `admin/build/gen_documents.py` — generates the `documents/` reader pages from `briefs/`
- `admin/build/gen_llms_full.py` — generates `llms-full.txt`
- `admin/build/gen_book.py` — generates `book/` and its PDF
- `admin/build/validate.js` — the pre-release gate
- `assets/site.css` — shared stylesheet (sgit.ai design language)

Content is built from the **graphs.sgit.ai brief pack v1.0** (21 August 2026), prepared
against `the-cyber-boardroom/SGraph-AI__App__Send` at v0.33.62. The pack is published in full
under `briefs/`.

## Release process

1. Bump `admin/build/version.txt` (vX.Y.Z, exactly once per release), add a row to
   `admin/versions.html`, update `admin/comms.html`.
2. `python3 admin/build/gen_documents.py` — if a document was added.
3. `python3 admin/build/gen_llms_full.py` — if a document or `llms.txt` changed.
4. `python3 admin/build/gen_book.py` — always: the gate fails on a stale book. Also
   retypesets the PDF (`pip install weasyprint`; falls back to Chromium at the same trim
   size, minus folios and contents page numbers).
5. `python3 admin/build/chrome.py` — propagates the version badge and any nav/footer change to
   every page, and stamps the version into `llms.txt`, `llms-full.txt` and `index.md`.
6. `node admin/build/validate.js`
7. `git commit -am "site vX.Y.Z: ..." && git push origin dev`

Every push to `dev` runs `.github/workflows/deploy-pages.yml`: validate → auto-tag (`vX.Y.Z`,
verified against `version.txt` and the commit subject, next-minor enforced) → deploy to GitHub
Pages. Pull requests run validation only. Same pipeline as
[SGit-AI__Website](https://github.com/SGit-AI/SGit-AI__Website),
[SGit-AI__Website__NHI](https://github.com/SGit-AI/SGit-AI__Website__NHI) and
[SGit-AI__Website__PKI](https://github.com/SGit-AI/SGit-AI__Website__PKI).

### What the gate checks

1. **Version agreement** — `version.txt` against every page badge, the release table,
   `llms.txt`, `llms-full.txt` and `index.md`; and no version listed twice.
2. **Internal links** — every relative `href`, `src` and `data-src` resolves.
3. **Canonical host** — every page declares a canonical, and every canonical and `og:url`
   points at the host in `CNAME`.
4. **The agent surface** — every section hub is named in `llms.txt`, and the sitemap and the
   tree agree in both directions. For an agent, a page missing from `llms.txt` is a page that
   does not exist.
5. **Edge-grammar tripwire** — no page uses the banned generic association edge as a live edge
   name; quoting the ban requires a `data-banned-verb` attribute.
6. **Block balance** — every page closes every `<div>` it opens. Added after four pages
   shipped a note box closed with `</p>`, which browsers accept silently.
7. **The book is a projection** — `book/manifest.json` must carry this release's version
   and every chapter's source page must hash to what it recorded at generation. A source
   edited without regenerating the book fails the build.
8. **Key-leak tripwire** — nothing in the tree may look like a vault key.

## Licence

**Code** in this repository is licensed under the Apache License 2.0 (see `LICENSE`).
**Documentation and written content** — everything under `briefs/`, the HTML pages, `index.md`,
`llms.txt` and `llms-full.txt` — is licensed under CC BY 4.0. See `LICENSES.md`.
