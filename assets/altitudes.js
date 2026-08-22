/* Renders the altitude ladder (altitudes/data/altitudes.json).
   Each level is a compression of the level below it, and every bracketed phrase
   descends into the nodes it compresses. The page is a projection of the data:
   the ladder is the artefact, this is one way of looking at it. */
(function () {
  'use strict';
  var host = document.getElementById('ladder');
  if (!host) { return; }
  var D = null, cur = null;

  function esc(t) {
    return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function fmt(t) {
    return esc(t).replace(/`([^`]+)`/g, '<code>$1</code>')
                 .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  }
  function levelOf(n) { return D.levels.filter(function (l) { return l.n === n; })[0]; }

  function go(id, push) {
    if (!D.nodes[id]) { return; }
    cur = id;
    render();
    if (push !== false) {
      history.replaceState(null, '', '?n=' + encodeURIComponent(id));
    }
    host.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  function bar() {
    var h = ['<div class="altbar">'];
    D.levels.forEach(function (l) {
      var on = cur && D.nodes[cur].level === l.n;
      var first = null;
      for (var k in D.nodes) { if (D.nodes[k].level === l.n) { first = k; break; } }
      var wpu = l.units ? Math.round(l.words / l.units) : 0;
      h.push('<button class="altlv' + (on ? ' on' : '') + '"' +
             (first ? ' data-go="' + first + '"' : ' disabled') + '>' +
             '<b>L' + l.n + '</b><span>' + esc(l.name) + '</span>' +
             '<em>' + l.units + ' unit' + (l.units === 1 ? '' : 's') + ' · ' +
             (l.n === 5 ? '~' : '') + l.words.toLocaleString() + ' words · ' +
             (l.n === 5 ? '~' : '') + wpu.toLocaleString() + ' each</em></button>');
    });
    h.push('</div>');
    return h.join('');
  }

  function render() {
    var n = D.nodes[cur], lv = levelOf(n.level), h = [bar()];
    h.push('<article class="altnode">');

    if (n.parents.length) {
      h.push('<p class="altup">' + n.parents.map(function (p) {
        return '↑ <a href="#" data-go="' + p + '">' + esc(D.nodes[p].title) + '</a>';
      }).join(' · ') + '</p>');
    }
    h.push('<h3>' + esc(n.title) + ' <span class="altlvl">level ' + n.level + '</span></h3>');
    h.push('<p class="small dim">' + esc(lv.note) + ' This unit: <b>' + n.words +
           ' words</b>' + (n.children.length ? ', compressing <b>' + n.children.length +
           '</b> unit' + (n.children.length === 1 ? '' : 's') + ' below it' : '') + '.</p>');

    h.push('<div class="altproj">' + n.segments.map(function (s) {
      if (!s.to) { return fmt(s.t); }
      return '<a class="altseg" href="#" data-go="' + s.to + '" title="descend to: ' +
             esc(D.nodes[s.to] ? D.nodes[s.to].title : s.to) + '">' + fmt(s.t) + '</a>';
    }).join('') + '</div>');

    if (n.children.length) {
      h.push('<p class="small dim">Every highlighted phrase descends. ' +
             (n.level === 3 ? 'At level 3 only chapters 2 and 5 were taken further down in this pilot.' : '') +
             '</p>');
    }

    if (n.claims && n.claims.length) {
      h.push('<div class="altgraph"><span class="revlbl">The graph behind this text</span><ul>');
      n.claims.forEach(function (c) {
        h.push('<li class="ac-' + esc(c.state) + '"><span class="acst">' + esc(c.state) +
               '</span> ' + fmt(c.text) +
               (c.evidence && c.evidence.length ?
                 '<ul class="acev">' + c.evidence.map(function (e) {
                   return '<li>' + fmt(e) + '</li>'; }).join('') + '</ul>' : '') + '</li>');
      });
      h.push('</ul><p class="small dim">Three states: <b>evidenced</b> (a number or a named source ' +
             'backs it), <b>argued</b> (the book argues it and does not claim external evidence), ' +
             '<b>unevidenced</b> (asserted, nothing attached yet). Unevidenced claims are shown ' +
             'rather than hidden.</p></div>');
    } else {
      h.push('<p class="altnolift small dim">The graph layer was not lifted for this unit in the ' +
             'pilot. Stated rather than left blank: an empty panel and an unbuilt one look the same ' +
             'otherwise.</p>');
    }

    if (n.book) {
      h.push('<p class="altbook">↓ <a href="' + esc(n.book) + '">Read this at level 5, in the book itself</a></p>');
    }
    if (n.children.length) {
      h.push('<p class="small dim">Descends into: ' + n.children.map(function (c) {
        return '<a href="#" data-go="' + c + '">' + esc(D.nodes[c].title) + '</a>';
      }).join(' · ') + '</p>');
    }
    h.push('</article>');
    host.innerHTML = h.join('\n');
  }

  function findings() {
    var el = document.getElementById('findings-list');
    if (!el) { return; }
    var KIND = { contradiction: 'contradiction', repeat: 'repeated content',
                 'compression-loss': 'compression loss', weight: 'weight mismatch',
                 control: 'control case' };
    el.innerHTML = D.findings.map(function (f) {
      return '<div class="altfind af-' + esc(f.kind) + '">' +
        '<h3>' + esc(f.title) + ' <span class="rstate">' + esc(KIND[f.kind] || f.kind) + '</span></h3>' +
        '<p>' + fmt(f.detail) + '</p>' +
        '<p class="altverdict"><span class="revlbl">Verdict</span>' + fmt(f.verdict) + '</p>' +
        '<p class="small dim">Where: ' + f.where.map(function (w) {
          return '<a href="#" data-go="' + w + '">' + esc(D.nodes[w] ? D.nodes[w].title : w) + '</a>';
        }).join(' · ') + '</p></div>';
    }).join('');
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-go]');
    if (!a || a.disabled) { return; }
    e.preventDefault();
    go(a.getAttribute('data-go'));
  });

  fetch('data/altitudes.json').then(function (r) { return r.json(); }).then(function (d) {
    D = d;
    findings();
    var q = new URLSearchParams(location.search).get('n');
    go(D.nodes[q] ? q : D.root, false);
  }).catch(function () {
    host.innerHTML = '<p class="small dim">Could not load the ladder data.</p>';
  });
})();
