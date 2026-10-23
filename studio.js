/* Studio: bento index, quote stage, flip-card film shelf, rules and arsenal. Content: studio-data.js */
(function () {
  'use strict';
  if (typeof studioData === 'undefined') return;
  var D = studioData;
  var ROOT = document.body && document.body.getAttribute('data-studio-page') !== 'index' ? '../' : '';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function plural(n, a, b) { return n + ' ' + (n === 1 ? a : b); }

  // Quote of the day: same for everyone on a given date
  function dayIndex(n) {
    var d = new Date();
    return hash(d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate()) % n;
  }

  // ---------- generative film poster (abstract, not the real artwork) ----------
  var PALETTES = [
    ['#1f2a44', '#e9d8a6', '#c4703f'], ['#2a1714', '#e8c766', '#b23a2a'], ['#0f3b3a', '#f2e6d0', '#e08a4c'],
    ['#3b2328', '#f3d9c4', '#c95b4f'], ['#20252b', '#d9dde2', '#7fa3b8'], ['#4a3c30', '#efe4d2', '#d79f2b'],
    ['#14213d', '#fca311', '#e5e5e5'], ['#2f3e2c', '#e6dcc0', '#b5651d']
  ];
  function motif(h, c) {
    var m = h % 6, a = c[1], b = c[2];
    switch (m) {
      case 0: return '<circle cx="100" cy="92" r="46" fill="' + b + '"/><rect x="0" y="150" width="200" height="150" fill="' + c[0] + '" opacity=".55"/><line x1="0" y1="150" x2="200" y2="150" stroke="' + a + '" stroke-width="1.5"/>';
      case 1: return [0, 1, 2, 3, 4].map(function (i) { return '<circle cx="100" cy="110" r="' + (18 + i * 16) + '" fill="none" stroke="' + (i % 2 ? a : b) + '" stroke-width="' + (i === 0 ? 10 : 2) + '" opacity="' + (1 - i * 0.14) + '"/>'; }).join('');
      case 2: return [0, 1, 2, 3, 4, 5, 6, 7].map(function (i) { return '<rect x="0" y="' + (40 + i * 18) + '" width="200" height="' + (4 + i) + '" fill="' + (i % 3 === 0 ? b : a) + '" opacity="' + (0.25 + i * 0.09) + '"/>'; }).join('');
      case 3: return '<path d="M0 230 L100 60 L200 230 Z" fill="' + b + '" opacity=".9"/><path d="M40 230 L100 120 L160 230 Z" fill="' + c[0] + '"/><circle cx="150" cy="56" r="10" fill="' + a + '"/>';
      case 4: return [0, 1, 2, 3, 4, 5].map(function (i) { return '<line x1="' + (-40 + i * 50) + '" y1="300" x2="' + (60 + i * 50) + '" y2="0" stroke="' + (i % 2 ? b : a) + '" stroke-width="' + (i % 2 ? 14 : 3) + '" opacity=".75"/>'; }).join('');
      default: return '<rect x="38" y="40" width="124" height="150" fill="none" stroke="' + a + '" stroke-width="2"/><rect x="58" y="62" width="84" height="106" fill="' + b + '"/><rect x="78" y="86" width="44" height="58" fill="' + c[0] + '"/>';
    }
  }
  function poster(m, small) {
    var h = hash(m.title), n = D.movies.indexOf(m);
    if (n < 0) n = h;
    var c = PALETTES[n % PALETTES.length];
    return '<span class="st-poster' + (small ? ' st-poster-sm' : '') + '" style="--bg:' + c[0] + ';--fg:' + c[1] + ';--ac:' + c[2] + '">' +
      '<svg viewBox="0 0 200 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' + motif(n, c) + '</svg>' +
      '<span class="st-poster-kind">' + (m.kind === 'series' ? 'Series' : 'Film') + '</span>' +
      '<span class="st-poster-foot"><span class="st-poster-title">' + esc(m.title) + '</span>' +
      (small ? '' : '<span class="st-poster-credit">' + esc(m.credit.replace(/^(Directed|Created) by /, '')) + '</span>') + '</span>' +
      // A real poster, when the data has one, sits on top of the generated design (which shows if the image fails).
      (m.poster ? '<img class="st-poster-img" src="' + esc(ROOT + m.poster) + '" alt="' + esc(m.title) + ' poster" loading="lazy" onerror="this.remove()">' : '') +
    '</span>';
  }
  function ratingBadge(m) {
    if (typeof m.rating === 'number') {
      var p = Math.max(0, Math.min(1, (m.rating - 5) / 5));
      return '<span class="st-rate" style="--p:' + (p * 100).toFixed(0) + '%" title="IMDb ' + m.rating.toFixed(1) + '/10"><b>' + m.rating.toFixed(1) + '</b><small>IMDb</small></span>';
    }
    return '<span class="st-rate st-rate-note">' + esc(m.ratingNote || '') + '</span>';
  }

  // ---------- laptop line drawing ----------
  var LAPTOP = '<svg class="st-laptop" viewBox="0 0 240 150" aria-hidden="true">' +
    '<rect x="42" y="12" width="156" height="102" rx="7" class="st-l-lid"/>' +
    '<rect x="50" y="20" width="140" height="84" rx="2" class="st-l-screen"/>' +
    '<g class="st-l-code"><rect x="58" y="30" width="46" height="4" rx="2"/><rect x="58" y="40" width="80" height="4" rx="2"/><rect x="66" y="50" width="62" height="4" rx="2"/><rect x="66" y="60" width="38" height="4" rx="2"/><rect x="58" y="70" width="70" height="4" rx="2"/><rect x="58" y="80" width="28" height="4" rx="2"/></g>' +
    '<rect x="91" y="80" width="2.5" height="7" class="st-l-caret"/>' +
    '<path d="M20 118 H220 L212 132 Q210 136 205 136 H35 Q30 136 28 132 Z" class="st-l-base"/>' +
    '<rect x="104" y="118" width="32" height="4" rx="2" class="st-l-notch"/>' +
    '</svg>';

  // ---------- index ----------
  function initIndex() {
    var q = D.quotes, mv = D.movies, ru = D.rules;
    var tools = D.arsenal.reduce(function (n, g) { return n + g.items.length; }, 0);
    var qi = dayIndex(q.length);

    $('#studioGrid').innerHTML =
      '<a class="st-tile st-tile-quote" href="studio/quotes.html">' +
        '<span class="st-tile-h"><b>Quotes</b><em>' + plural(q.length, 'line', 'lines') + '</em></span>' +
        '<span class="st-qrot" aria-live="polite"><span class="st-qrot-text">“' + esc(q[qi].text) + '”</span><span class="st-qrot-by">' + esc(q[qi].by) + '</span></span>' +
        '<span class="st-tile-foot">Lines that stuck with me <i>→</i></span>' +
      '</a>' +
      '<a class="st-tile st-tile-movies" href="studio/movie-recommendations.html">' +
        '<span class="st-tile-h"><b>Movies</b><em>' + plural(mv.length, 'title', 'titles') + '</em></span>' +
        '<span class="st-fan">' + mv.slice(0, 3).map(function (m) { return poster(m, true); }).join('') + '</span>' +
        '<span class="st-tile-foot">Worth your time <i>→</i></span>' +
      '</a>' +
      '<a class="st-tile st-tile-rules" href="studio/rules.html">' +
        '<span class="st-tile-h"><b>Rules</b><em>' + plural(ru.length, 'rule', 'rules') + '</em></span>' +
        '<span class="st-rule-mini"><span>01</span><b>' + esc(ru[0] ? ru[0].text : '') + '</b></span>' +
        '<span class="st-tile-foot">What I live by <i>→</i></span>' +
      '</a>' +
      '<a class="st-tile st-tile-arsenal" href="studio/arsenal.html">' +
        '<span class="st-tile-h"><b>Arsenal</b><em>' + plural(tools, 'tool', 'tools') + '</em></span>' +
        '<span class="st-ars-mini">' + LAPTOP + '<span class="st-ars-list">' + D.arsenal.map(function (g) {
          return g.items.map(function (it) { return '<span><b>' + esc(it.name) + '</b><small>' + esc(it.what) + '</small></span>'; }).join('');
        }).join('') + '</span></span>' +
        '<span class="st-tile-foot">The setup I actually use <i>→</i></span>' +
      '</a>';

    // rotate quotes on the tile
    if (!reduce && q.length > 1) {
      var box = $('.st-qrot'), t = $('.st-qrot-text'), by = $('.st-qrot-by'), cur = qi, paused = false;
      var tile = $('.st-tile-quote');
      tile.addEventListener('mouseenter', function () { paused = true; });
      tile.addEventListener('mouseleave', function () { paused = false; });
      setInterval(function () {
        if (paused || document.hidden) return;
        box.classList.add('out');
        setTimeout(function () {
          cur = (cur + 1) % q.length;
          t.textContent = '“' + q[cur].text + '”';
          by.textContent = q[cur].by;
          box.classList.remove('out');
        }, 380);
      }, 4800);
    }
  }

  // ---------- quotes ----------
  function initQuotes() {
    var q = D.quotes, stage = $('#quoteStage'), list = $('#quoteList');
    var m = /^#q(\d+)$/.exec(location.hash);
    var cur = m ? Math.max(0, Math.min(q.length - 1, +m[1] - 1)) : dayIndex(q.length);
    var today = dayIndex(q.length);

    stage.innerHTML =
      '<div class="st-qcard">' +
        '<span class="st-qmark" aria-hidden="true">“</span>' +
        '<p class="st-qday"></p>' +
        '<blockquote class="st-qtext"><p></p><footer></footer></blockquote>' +
        '<div class="st-qbar">' +
          '<button type="button" class="st-qbtn" data-act="prev" aria-label="Previous quote"><svg viewBox="0 0 16 16"><path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
          '<span class="st-qcount"></span>' +
          '<button type="button" class="st-qbtn" data-act="next" aria-label="Next quote"><svg viewBox="0 0 16 16"><path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
          '<span class="st-qsp"></span>' +
          '<button type="button" class="st-qbtn st-qbtn-txt" data-act="shuffle">Shuffle</button>' +
          '<button type="button" class="st-qbtn st-qbtn-txt" data-act="copy">Copy</button>' +
        '</div>' +
      '</div>';

    list.innerHTML = q.map(function (x, i) {
      return '<button type="button" class="st-qitem" data-i="' + i + '"><span class="st-qitem-n">' + pad(i + 1) + '</span><span class="st-qitem-t">“' + esc(x.text) + '”</span><span class="st-qitem-b">' + esc(x.by) + '</span></button>';
    }).join('');

    var txt = $('.st-qtext p', stage), foot = $('.st-qtext footer', stage), count = $('.st-qcount', stage), day = $('.st-qday', stage), card = $('.st-qcard', stage);

    function show(i, anim) {
      cur = (i + q.length) % q.length;
      function put() {
        txt.textContent = q[cur].text;
        foot.textContent = '— ' + q[cur].by;
        count.textContent = pad(cur + 1) + ' / ' + pad(q.length);
        day.textContent = cur === today ? 'Quote of the day' : 'Quote ' + pad(cur + 1);
        $$('.st-qitem', list).forEach(function (b) { b.classList.toggle('on', +b.getAttribute('data-i') === cur); });
        if (history.replaceState) history.replaceState(null, '', '#q' + (cur + 1));
        card.classList.remove('out');
      }
      if (anim && !reduce) { card.classList.add('out'); setTimeout(put, 260); } else put();
    }

    stage.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]');
      if (!b) return;
      var a = b.getAttribute('data-act');
      if (a === 'prev') show(cur - 1, true);
      if (a === 'next') show(cur + 1, true);
      if (a === 'shuffle' && q.length > 1) { var r; do { r = Math.floor(Math.random() * q.length); } while (r === cur); show(r, true); }
      if (a === 'copy') {
        var s = '“' + q[cur].text + '” — ' + q[cur].by;
        var done = function () { b.textContent = 'Copied'; setTimeout(function () { b.textContent = 'Copy'; }, 1400); };
        if (navigator.clipboard) navigator.clipboard.writeText(s).then(done, function () {});
      }
    });
    list.addEventListener('click', function (e) {
      var b = e.target.closest('.st-qitem');
      if (!b) return;
      show(+b.getAttribute('data-i'), true);
      stage.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    });
    document.addEventListener('keydown', function (e) {
      if (e.target.closest('input, textarea')) return;
      if (e.key === 'ArrowRight') show(cur + 1, true);
      if (e.key === 'ArrowLeft') show(cur - 1, true);
    });
    show(cur);
  }

  // ---------- movies ----------
  function initMovies() {
    var mv = D.movies.map(function (m, i) { m._i = i; return m; });
    var grid = $('#movieGrid'), stats = $('#movieStats'), tabs = $('#movieTabs'), sortSel = $('#movieSort');
    var fine = $('#movieFine');
    if (fine) fine.hidden = mv.every(function (m) { return m.poster; });
    var films = mv.filter(function (m) { return m.kind !== 'series'; }).length;
    var rated = mv.filter(function (m) { return typeof m.rating === 'number'; });
    var avg = rated.length ? rated.reduce(function (s, m) { return s + m.rating; }, 0) / rated.length : 0;
    var people = {};
    mv.forEach(function (m) { var k = m.credit.replace(/^(Directed|Created) by /, ''); people[k] = (people[k] || 0) + 1; });
    var top = Object.keys(people).sort(function (a, b) { return people[b] - people[a]; })[0];

    stats.innerHTML =
      '<div><b>' + mv.length + '</b><span>titles</span></div>' +
      '<div><b>' + films + '</b><span>films</span></div>' +
      '<div><b>' + (mv.length - films) + '</b><span>series</span></div>' +
      (rated.length ? '<div><b>' + avg.toFixed(1) + '</b><span>average IMDb</span></div>' : '') +
      (top && people[top] > 1 ? '<div><b>' + people[top] + '×</b><span>' + esc(top) + '</span></div>' : '');

    tabs.innerHTML = [['all', 'All', mv.length], ['film', 'Films', films], ['series', 'Series', mv.length - films]].map(function (t, i) {
      return '<button type="button" class="jr-tab' + (i === 0 ? ' active' : '') + '" data-kind="' + t[0] + '" aria-pressed="' + (i === 0) + '">' + t[1] + ' <span>' + t[2] + '</span></button>';
    }).join('');

    var kind = 'all', sort = 'mine';

    function render() {
      var list = mv.filter(function (m) { return kind === 'all' || (kind === 'series' ? m.kind === 'series' : m.kind !== 'series'); });
      list.sort(function (a, b) {
        if (sort === 'rating') return (b.rating || 0) - (a.rating || 0) || a._i - b._i;
        if (sort === 'title') return a.title.replace(/^The /, '').localeCompare(b.title.replace(/^The /, ''));
        return a._i - b._i;
      });
      grid.innerHTML = list.map(function (m, i) {
        return '<div class="st-mv" style="--i:' + i + '">' +
          '<button type="button" class="st-flip" aria-pressed="false" aria-label="' + esc(m.title) + ': show my note">' +
            '<span class="st-face st-front">' + poster(m) + '</span>' +
            '<span class="st-face st-back"><span class="st-back-k">' + (m.kind === 'series' ? 'Series' : 'Film') + '</span><b>' + esc(m.title) + '</b><small>' + esc(m.credit) + '</small><span class="st-back-note">' + esc(m.note) + '</span></span>' +
          '</button>' +
          '<span class="st-mv-meta"><span class="st-mv-t">' + esc(m.title) + '</span>' + ratingBadge(m) + '</span>' +
        '</div>';
      }).join('');
      $$('.st-flip', grid).forEach(function (b) {
        b.addEventListener('click', function () {
          var on = !b.classList.contains('on');
          b.classList.toggle('on', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
      });
    }
    tabs.addEventListener('click', function (e) {
      var b = e.target.closest('.jr-tab');
      if (!b) return;
      kind = b.getAttribute('data-kind');
      $$('.jr-tab', tabs).forEach(function (x) { x.classList.toggle('active', x === b); x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      render();
    });
    sortSel.addEventListener('change', function () { sort = sortSel.value; render(); });
    render();
  }

  // ---------- rules ----------
  function initRules() {
    $('#ruleList').innerHTML = D.rules.map(function (r, i) {
      return '<li class="st-rule" style="--i:' + i + '"><span class="st-rule-n" aria-hidden="true">' + pad(i + 1) + '</span><p>' + esc(r.text) + '</p></li>';
    }).join('');
  }

  // ---------- arsenal ----------
  function initArsenal() {
    $('#arsenalList').innerHTML = D.arsenal.map(function (g) {
      return '<section class="st-ars-g"><h2 class="st-ars-h"><span>' + esc(g.group) + '</span><em>' + plural(g.items.length, 'item', 'items') + '</em></h2>' +
        '<div class="st-ars-items">' + g.items.map(function (it) {
          var hero = /laptop/i.test(it.what);
          return '<article class="st-ars-card' + (hero ? ' st-ars-hero' : '') + '">' +
            (hero ? '<div class="st-ars-art">' + LAPTOP + '</div>' : '<span class="st-ars-mono" aria-hidden="true">' + esc(it.name.charAt(0)) + '</span>') +
            '<div class="st-ars-body"><p class="st-ars-what">' + esc(it.what) + '</p><h3>' + esc(it.name) + '</h3>' + (it.why ? '<p class="st-ars-why">' + esc(it.why) + '</p>' : '') + '</div>' +
          '</article>';
        }).join('') + '</div></section>';
    }).join('');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var p = document.body.getAttribute('data-studio-page');
    if (p === 'index') initIndex();
    if (p === 'quotes') initQuotes();
    if (p === 'movies') initMovies();
    if (p === 'rules') initRules();
    if (p === 'arsenal') initArsenal();
  });
})();
