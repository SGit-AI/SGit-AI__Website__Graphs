/* The concept map: a dictionary crossed with a thesaurus, entered from any concept.

   Every concept shows what it rests on, what rests on it, what it is called, what it
   is near but not, which units of the ladder carry it, and which published artefact
   demonstrates it. The peaks are computed, not chosen: strength is a stated formula
   over the edges, so a reader can disagree with the ranking by recomputing it. */
(function () {
  'use strict';
  var host = document.getElementById('concepts');
  if (!host) { return; }
  var D = null, cur = null, sort = 'strength';

  function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function fmt(t) { return esc(t).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/`([^`]+)`/g, '<code>$1</code>'); }
  function by(id) { return D.concepts.filter(function (c) { return c.id === id; })[0]; }
  function trailOf(id) {
    var t = [id], c = id, g = 0;
    while (D.nodes[c] && D.nodes[c].parents.length && g++ < 12) { c = D.nodes[c].parents[0]; t.unshift(c); }
    return t;
  }
  function verbNote(v) {
    var e = (D.edge_registry || []).filter(function (x) { return x.verb === v || x.inverse === v; })[0];
    return e ? e.note : '';
  }

  function list() {
    var cs = D.concepts.slice();
    cs.sort(sort === 'alpha' ? function (a, b) { return a.label.localeCompare(b.label); }
                             : function (a, b) { return b.strength.score - a.strength.score; });
    return '<div class="clist"><div class="clhead">' +
      '<b>' + cs.length + ' concepts</b>' +
      '<span><button class="altib' + (sort === 'strength' ? ' on' : '') + '" data-sort="strength">by strength</button>' +
      '<button class="altib' + (sort === 'alpha' ? ' on' : '') + '" data-sort="alpha">A&ndash;Z</button></span></div>' +
      cs.map(function (c) {
        var peak = D.peaks.indexOf(c.id) > -1;
        return '<a class="citem' + (cur === c.id ? ' cur' : '') + (peak ? ' peak' : '') +
          '" href="#' + c.id + '" data-c="' + c.id + '">' +
          '<span class="cbar" style="width:' + Math.min(100, c.strength.score * 4) + '%"></span>' +
          '<b>' + esc(c.label) + '</b>' +
          '<em>' + c.strength.score + (peak ? ' · peak' : '') + '</em></a>';
      }).join('') + '</div>';
  }

  function edges(title, list_, note) {
    if (!list_ || !list_.length) { return ''; }
    return '<div class="cedge"><span class="revlbl">' + title + '</span><ul>' +
      list_.map(function (e) {
        var c = by(e[1]);
        return '<li><code title="' + esc(verbNote(e[0])) + '">' + esc(e[0]) + '</code> ' +
               '<a href="#' + esc(e[1]) + '" data-c="' + esc(e[1]) + '">' + esc(c ? c.label : e[1]) + '</a></li>';
      }).join('') + '</ul>' + (note ? '<p class="small dim">' + note + '</p>' : '') + '</div>';
  }

  function panel(c) {
    var peak = D.peaks.indexOf(c.id) > -1, s = c.strength, h = [];
    h.push('<article class="cpanel" id="' + esc(c.id) + '">');
    h.push('<h2>' + esc(c.label) + (peak ? ' <span class="rstate rs-agreed">a peak</span>' : '') + '</h2>');
    h.push('<p class="cdef">' + fmt(c.definition) + '</p>');
    h.push('<div class="cthes">');
    if (c.also_called.length) {
      h.push('<p><span class="revlbl">Also called</span>' + c.also_called.map(esc).join(' · ') + '</p>');
    }
    if (c.near_but_not.length) {
      h.push('<p><span class="revlbl">Near, but not the same</span>' +
             c.near_but_not.map(function (x) { return '<span class="cnear">' + esc(x) + '</span>'; }).join('') + '</p>');
    }
    h.push('</div>');

    h.push('<div class="ccols">');
    h.push(edges('Outward &mdash; what this reaches', c.edges,
      'Each verb has a distinct inverse, so the same edge read from the other end says something different.'));
    h.push(edges('Inward &mdash; what reaches this', c.in_edges,
      'Written by the generator from the outward edges, so the graph can be walked in both directions without knowing the rule.'));
    h.push('</div>');

    h.push('<div class="cwhere"><span class="revlbl">Where it appears, across the altitudes</span><ul>');
    (c.units || []).forEach(function (u) {
      var n = D.nodes[u];
      if (!n) { return; }
      h.push('<li><span class="clv">L' + n.level + '</span> <a href="index.html?t=' +
             encodeURIComponent(trailOf(u).join(',')) + '">' + esc(n.title) + '</a></li>');
    });
    h.push('</ul><p class="small dim">A concept is not owned by one altitude. This is the crossing the ladder alone cannot show: the same idea consolidated above and expanded below.</p></div>');

    if (c.demonstrated_by.length) {
      h.push('<div class="cshown"><span class="revlbl">Demonstrated by</span><ul>' +
        c.demonstrated_by.map(function (u) {
          return '<li><a href="' + esc(u) + '">' + esc(u.replace('../vaults/', '').replace('/index.html', '').replace('.html', '')) +
                 '</a> <span class="small dim">a published artefact, not an argument</span></li>';
        }).join('') + '</ul></div>');
    }

    h.push('<p class="small dim"><b>Strength ' + s.score + '</b> = ' + esc(s.formula) +
           ' &nbsp;·&nbsp; ' + s.out + ' out, ' + s.incoming + ' in, ' + s.units + ' units, ' +
           s.shown + ' demonstrated. <a href="graph.html">See it in the graph &rarr;</a></p>');
    h.push('</article>');
    return h.join('');
  }

  function render() {
    var c = by(cur) || D.concepts[0];
    cur = c.id;
    host.innerHTML = '<div class="cwrap">' + list() + '<div class="cmain">' + panel(c) + '</div></div>';
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-c],[data-sort]');
    if (!a) { return; }
    if (a.hasAttribute('data-sort')) { e.preventDefault(); sort = a.getAttribute('data-sort'); render(); return; }
    e.preventDefault();
    cur = a.getAttribute('data-c');
    history.replaceState(null, '', '#' + cur);
    render();
    host.scrollIntoView({ block: 'start', behavior: 'smooth' });
  });

  fetch('data/altitudes.json').then(function (r) { return r.json(); }).then(function (d) {
    D = d;
    var inv = document.getElementById('cinv');
    if (inv) {
      var i = D.inventory;
      inv.innerHTML = '<div class="vfacts">' +
        '<div><b>' + i.concepts + '</b><span>concepts</span></div>' +
        '<div><b>' + i.fact + '</b><span>facts</span></div>' +
        '<div><b>' + i.assertion + '</b><span>assertions</span></div>' +
        '<div><b>' + i.opinion + '</b><span>opinions</span></div>' +
        '<div><b>' + i.units + '</b><span>units</span></div>' +
        '<div><b>' + i.findings + '</b><span>findings</span></div></div>' +
        '<p class="small dim">' + fmt(i.note) + '</p>';
    }
    var peaks = document.getElementById('cpeaks');
    if (peaks) {
      peaks.innerHTML = D.peaks.map(function (p, n) {
        var c = by(p);
        return '<a class="cpeak" href="#' + p + '" data-c="' + p + '"><b>' + (n + 1) + '</b>' +
               '<span>' + esc(c.label) + '</span><em>' + c.strength.score + '</em></a>';
      }).join('');
    }
    cur = location.hash.slice(1) || D.peaks[0];
    render();
  }).catch(function () { host.innerHTML = '<p class="small dim">Could not load the concepts.</p>'; });
})();
