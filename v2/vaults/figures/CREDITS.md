# Where these diagrams came from

All three are **inline SVG lifted from the source of
<https://sgit.ai/demos/fractal-graphs/>**, fetched 20 September 2026, by the same author
and project as this site, and published under CC BY 4.0. They are carried here rather
than redrawn, because redrawing them would produce a second version of a picture that is
already correct and would then have two things to keep in step.

| File | What it shows | Class prefix, as published |
|---|---|---|
| `zoom.svg` | Three panels: a four-node semantic graph; the Law node opened into a legal ontology; a paragraph opened into a lexical one. Footer: *the grammar never changes; the ontology does.* | `fz-` |
| `jump.svg` | Four worlds in a row, a risk register, security operations, the DNS estate and a network capture, each a small graph in its own vocabulary, joined by a jump link on one node each. | `hj-` |
| `ladder.svg` | Eleven altitudes from the text of a law to a compute instance, each rung naming the published vault where that altitude is a live graph. Twelve links, which is why this one is inlined rather than embedded as an image. | `lad-` |

Each carries its own `<style>` block with prefixed class names, so nothing here collides
with `site.css`. Every text in all three was measured against its viewBox at build time by
the site that made them, which is why they embed at any width without overflowing.

The extraction is mechanical: one `<style>` element and one `<svg>` element per diagram,
with the style moved inside the SVG so the file stands alone. **The carried files are not
edited beyond that**, because they are evidence, and evidence that has been tidied is not
evidence.

One thing is changed at RENDER time rather than in the file. `ladder.svg` carries twelve
links written relative to the page it was published on; inlined into a page here they
would resolve against this site's tree and point at nothing. `gen_vaults.py` resolves them
against their origin when it inlines the diagram, and leaves the file alone. `validate.js`
caught it on the first build, which is the correct order of events.
