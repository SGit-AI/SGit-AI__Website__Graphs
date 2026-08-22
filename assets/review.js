/* Renders a review object (reviews/rNNN.json) onto its page. The JSON is the
   review: this script is only a projection of it, the same relationship the
   book has to the site. Plain text with **bold**; everything else escaped. */
(function () {
  'use strict';
  var main = document.querySelector('main[data-review]');
  if (!main) { return; }

  function esc(t) {
    return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function fmt(t) {
    return esc(t)
      .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
  }

  var STATES = {
    noted: 'noted', proposed: 'proposed', discussing: 'in discussion',
    agreed: 'agreed', applied: 'applied', declined: 'declined'
  };

  fetch(main.getAttribute('data-review')).then(function (r) { return r.json(); })
    .then(function (rev) {
      var h = [];
      h.push('<div class="revhead">');
      h.push('<p><b>' + esc(rev.reviewer) + '</b> · ' + esc(rev.received) +
             ' · ' + esc(rev.source_kind) + ' · reviewed at <b>' +
             esc(rev.version_reviewed) + '</b> · state: <span class="rstate rs-' +
             esc(rev.state) + '">' + esc(rev.state) + '</span></p>');
      if (rev.state_note) { h.push('<p class="small dim">' + fmt(rev.state_note) + '</p>'); }
      h.push('<p class="small dim">The verbatim source is <a href="../' + esc(rev.source) +
             '">' + esc(rev.source) + '</a>; this page is its normalised projection, and the ' +
             'machine-readable review is <a href="' + esc(rev.id) + '.json">' +
             esc(rev.id) + '.json</a>.</p>');
      h.push('</div>');

      rev.items.forEach(function (it) {
        h.push('<section class="revitem" id="item-' + it.n + '">');
        h.push('<h2>' + it.n + ' · ' + esc(it.topic) +
               ' <span class="rstate rs-' + esc(it.state) + '">' +
               esc(STATES[it.state] || it.state) + '</span></h2>');
        h.push('<blockquote class="revq"><span class="revlbl">The reviewer</span>' +
               fmt(it.reviewer_says) + '</blockquote>');
        h.push('<div class="revc"><span class="revlbl">Comment</span><p>' +
               fmt(it.comment) + '</p></div>');
        h.push('<div class="revp"><span class="revlbl">Proposal</span><p>' +
               fmt(it.proposal) + '</p></div>');
        if (it.needs && it.needs.length) {
          h.push('<div class="revn"><span class="revlbl">Needed before this lands</span><ul>' +
                 it.needs.map(function (n) { return '<li>' + fmt(n) + '</li>'; }).join('') +
                 '</ul></div>');
        }
        if (it.thread && it.thread.length) {
          h.push('<div class="revth"><span class="revlbl">Thread</span>' +
            it.thread.map(function (e) {
              var s = '<div class="revte"><p class="revwho">' + esc(e.from) +
                      ' · ' + esc(e.date) + '</p><p>' + fmt(e.note) + '</p>';
              if (e.sources && e.sources.length) {
                s += '<ul>' + e.sources.map(function (x) {
                  return '<li>' + fmt(x) + '</li>';
                }).join('') + '</ul>';
              }
              return s + '</div>';
            }).join('') + '</div>');
        }
        if (it.impact && it.impact.length) {
          h.push('<p class="small dim">Touches: ' + it.impact.map(esc).join(' · ') + '</p>');
        }
        h.push('</section>');
      });
      document.getElementById('review').innerHTML = h.join('\n');
    })
    .catch(function () {
      document.getElementById('review').innerHTML =
        '<p class="small dim">Could not load the review data.</p>';
    });
})();
