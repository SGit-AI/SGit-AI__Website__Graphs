# Action: answer a question from the corpus

**Input** one question, written down before it is answered.

**Method**
1. Decide which surface can hold the answer: the frozen sources (`v1/docs/sources/`), the
   extraction, the core graph, the briefs, the release history, or the code.
2. Find it, verbatim.
3. Record the anchor: file, section, exact quote, occurrence if the quote repeats.
4. If nothing holds it, say so.

**Output** `debriefs/NN__<question-slug>.md`: the question, the answer, the anchors, and
what remains unknown.

**Done test** every quote resolves verbatim in a file that still hashes to its recorded
SHA-256. **"The corpus does not say" is a valid, complete answer** and must not be padded
with recollection.
