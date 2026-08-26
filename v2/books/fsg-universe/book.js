/* The Universe volume — the in-page reader.

   Same contract as the estate's shared mdreader: the raw markdown named by
   #mdread[data-src] is fetched and rendered here, so the page can never disagree with
   the file it claims to render, and any failure falls back to a link to the raw file.

   Two additions this volume needs.

   1. Image paths. A chapter writes `../figures/x.png`, which is correct relative to the
      markdown file itself, so the raw file reads properly on GitHub and on disk. The page
      lives one level up, so after rendering those paths are rewritten to be relative to
      the page. The markdown stays the honest artefact; the rewrite is presentation.

   2. Heading anchors. An entry heading carries `{#its-id}`, which is the id every
      cross-reference in the book points at. marked leaves the braces in the text, so the
      id is lifted onto the heading and the braces removed. */
(function () {
  var el = document.getElementById('mdread');
  if (!el) return;
  var src = el.getAttribute('data-src');
  function fail() {
    el.innerHTML = '<p class="dim">Could not render the chapter in-page — ' +
      '<a href="' + src + '">open the raw markdown</a> instead.</p>';
  }
  el.innerHTML = '<p class="dim">Loading the chapter…</p>';
  fetch(src).then(function (r) {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.text();
  }).then(function (t) {
    if (!window.marked) return fail();
    el.innerHTML = marked.parse(t);

    el.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(function (h) {
      var m = h.textContent.match(/^(.*?)\s*\{#([a-z0-9-]+)\}\s*$/);
      if (m) { h.id = m[2]; h.textContent = m[1]; }
    });

    var base = src.replace(/[^/]*$/, '');           /* content/ */
    el.querySelectorAll('img[src]').forEach(function (img) {
      var s = img.getAttribute('src');
      if (/^(https?:)?\//.test(s) || s.indexOf('data:') === 0) return;
      img.src = new URL(base + s, location.href).href;
      img.loading = 'lazy';
    });

    if (location.hash) {
      var t2 = document.getElementById(location.hash.slice(1));
      if (t2) t2.scrollIntoView();
    }
  }).catch(fail);
})();
