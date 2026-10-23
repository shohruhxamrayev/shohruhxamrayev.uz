/* Journal: map of trips, photo-card index, photo-story entries and a full-screen viewer.
   Content lives in journal-data.js; map outline in journal-map.js. */
(function () {
  'use strict';
  if (typeof journalData === 'undefined') return;

  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function parts(iso) { var p = iso.split('-'); return { y: +p[0], m: +p[1] - 1, d: +p[2] }; }

  function fmtDate(e, short) {
    var a = parts(e.date), b = e.end ? parts(e.end) : null;
    var mon = function (m) { return short ? MONTHS[m].slice(0, 3) : MONTHS[m]; };
    var s;
    if (!b) s = mon(a.m) + ' ' + a.d;
    else if (a.m === b.m && a.y === b.y) s = mon(a.m) + ' ' + a.d + '–' + b.d;
    else s = mon(a.m) + ' ' + a.d + ' – ' + mon(b.m) + ' ' + b.d;
    return short ? s : s + ', ' + (b ? b.y : a.y);
  }

  var entries = journalData.slice().sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });

  // ---------- map ----------
  function project(lat, lon) {
    var m = journalMap;
    return [(lon - m.lon0) * m.c * m.k, -(lat - m.lat0) * m.k];
  }

  function places() {
    var byName = {}, list = [];
    entries.forEach(function (e) {
      (e.stops || []).forEach(function (s) {
        if (!byName[s.name]) {
          var xy = project(s.lat, s.lon);
          byName[s.name] = { name: s.name, x: xy[0], y: xy[1], entries: [] };
          list.push(byName[s.name]);
        }
        if (byName[s.name].entries.indexOf(e) < 0) byName[s.name].entries.push(e);
      });
    });
    return list;
  }

  function pct(x, y) {
    var vb = journalMap.viewBox;
    return [((x - vb[0]) / vb[2]) * 100, ((y - vb[1]) / vb[3]) * 100];
  }

  function mapSVG(opts) {
    var vb = journalMap.viewBox;
    var routes = '';
    if (opts.routes) {
      entries.forEach(function (e) {
        if (!e.stops || e.stops.length < 2) return;
        var d = '';
        for (var i = 1; i < e.stops.length; i++) {
          var a = project(e.stops[i - 1].lat, e.stops[i - 1].lon), b = project(e.stops[i].lat, e.stops[i].lon);
          var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
          var dx = b[0] - a[0], dy = b[1] - a[1], len = Math.sqrt(dx * dx + dy * dy) || 1;
          var cx = mx - dy / len * len * 0.22, cy = my + dx / len * len * 0.22;
          d += (i === 1 ? 'M' + a[0].toFixed(1) + ',' + a[1].toFixed(1) : '') + 'Q' + cx.toFixed(1) + ',' + cy.toFixed(1) + ' ' + b[0].toFixed(1) + ',' + b[1].toFixed(1);
        }
        routes += '<path class="jm-route" data-slug="' + e.slug + '" d="' + d + '"/>';
      });
    }
    var dots = '';
    if (opts.dots) {
      opts.dots.forEach(function (s) {
        var xy = project(s.lat, s.lon);
        dots += '<circle class="jm-dot-halo" cx="' + xy[0].toFixed(1) + '" cy="' + xy[1].toFixed(1) + '" r="' + (opts.dotR || 6) * 2.4 + '"/>' +
          '<circle class="jm-dot" cx="' + xy[0].toFixed(1) + '" cy="' + xy[1].toFixed(1) + '" r="' + (opts.dotR || 6) + '"/>';
      });
    }
    return '<svg class="jm-svg" viewBox="' + vb.join(' ') + '" aria-hidden="true" focusable="false">' +
      '<defs><pattern id="jmHatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" class="jm-hatch"/></pattern></defs>' +
      (opts.neighbours !== false ? '<path class="jm-nb" d="' + journalMap.neighbours + '"/>' : '') +
      '<path class="jm-uz-shadow" d="' + journalMap.uz + '"/>' +
      '<path class="jm-uz" d="' + journalMap.uz + '"/>' +
      '<path class="jm-uz-hatch" d="' + journalMap.uz + '"/>' +
      (opts.label ? '<text class="jm-country" x="-150" y="20">UZBEKISTAN</text>' : '') +
      routes + dots + '</svg>';
  }

  // ---------- index ----------
  function initIndex() {
    var mapEl = $('#journalMap'), list = $('#journalList'), stats = $('#journalStats'), tabsEl = $('#journalTabs');
    var pl = places();
    var photos = entries.reduce(function (n, e) { return n + (e.photos || []).length; }, 0);
    var trips = entries.filter(function (e) { return (e.stops || []).length; }).length;
    var first = entries.length ? parts(entries[entries.length - 1].date).y : '';

    stats.innerHTML = [
      [entries.length, entries.length === 1 ? 'entry' : 'entries'],
      [trips, trips === 1 ? 'trip' : 'trips'],
      [pl.length, pl.length === 1 ? 'place' : 'places'],
      [photos, 'photos'],
      [first, 'since']
    ].map(function (s, i) {
      return '<div><b>' + s[0] + '</b><span>' + s[1] + '</span></div>';
    }).join('');
    // "since 2024" reads better with the label first
    var last = stats.lastElementChild;
    if (last) last.innerHTML = '<span>since</span><b>' + first + '</b>';

    // map + pins
    mapEl.innerHTML = '<div class="jm-frame">' + mapSVG({ routes: true, label: true }) +
      pl.map(function (p, i) {
        var xy = pct(p.x, p.y);
        var crowded = pl.some(function (q) { var b = pct(q.x, q.y); return q !== p && b[0] > xy[0] && b[0] - xy[0] < 18 && Math.abs(b[1] - xy[1]) < 8; });
        var label = (xy[0] > 70 || crowded) ? 'jm-pin-l' : '';
        return '<button type="button" class="jm-pin ' + label + '" data-place="' + esc(p.name) + '" style="left:' + xy[0].toFixed(2) + '%;top:' + xy[1].toFixed(2) + '%;--d:' + (i * 120) + 'ms" aria-label="' + esc(p.name) + ', ' + p.entries.length + (p.entries.length === 1 ? ' entry' : ' entries') + '">' +
          '<span class="jm-pin-dot"></span><span class="jm-pin-name">' + esc(p.name) + (p.entries.length > 1 ? ' <em>' + p.entries.length + '</em>' : '') + '</span></button>';
      }).join('') +
      '<div class="jm-pop" role="dialog" aria-live="polite" hidden></div></div>' +
      '<p class="jm-hint">Hover a place to see its entries. Tap to open.</p>';

    var pop = $('.jm-pop', mapEl), frame = $('.jm-frame', mapEl), hideT = null;

    function showPop(pin) {
      clearTimeout(hideT);
      var p = pl.filter(function (x) { return x.name === pin.getAttribute('data-place'); })[0];
      pop.innerHTML = '<p class="jm-pop-h">' + esc(p.name) + '</p>' + p.entries.map(function (e) {
        return '<a class="jm-pop-row" href="journal/' + e.slug + '.html">' +
          '<img src="journal/thumbs/' + e.cover + '" alt="" style="background:' + ((e.photos[0] || {}).tone || '#ddd') + '">' +
          '<span><b>' + esc(e.title) + '</b><small>' + fmtDate(e) + ' · ' + e.photos.length + ' photos</small></span></a>';
      }).join('');
      pop.hidden = false;
      var l = parseFloat(pin.style.left), t = parseFloat(pin.style.top);
      pop.style.left = Math.max(2, Math.min(l, 98)) + '%';
      pop.style.top = t + '%';
      pop.classList.toggle('jm-pop-left', l > 55);
      pop.classList.toggle('jm-pop-up', t > 55);
      highlight(p.entries.map(function (e) { return e.slug; }), p.name);
    }
    function hidePop() {
      hideT = setTimeout(function () { pop.hidden = true; highlight(null); }, 160);
    }

    $$('.jm-pin', mapEl).forEach(function (pin) {
      pin.addEventListener('mouseenter', function () { showPop(pin); });
      pin.addEventListener('mouseleave', hidePop);
      pin.addEventListener('focus', function () { showPop(pin); });
      pin.addEventListener('blur', hidePop);
      pin.addEventListener('click', function () {
        var p = pl.filter(function (x) { return x.name === pin.getAttribute('data-place'); })[0];
        if (p.entries.length === 1 && window.matchMedia('(hover: hover)').matches) location.href = 'journal/' + p.entries[0].slug + '.html';
        else showPop(pin);
      });
    });
    pop.addEventListener('mouseenter', function () { clearTimeout(hideT); });
    pop.addEventListener('mouseleave', hidePop);
    document.addEventListener('click', function (e) { if (!e.target.closest('.jm-pin, .jm-pop')) { pop.hidden = true; highlight(null); } });

    function highlight(slugs, placeName) {
      $$('.jr-card', list).forEach(function (c) {
        c.classList.toggle('is-hot', !!slugs && slugs.indexOf(c.getAttribute('data-slug')) > -1);
        c.classList.toggle('is-dim', !!slugs && slugs.indexOf(c.getAttribute('data-slug')) < 0);
      });
      $$('.jm-pin', mapEl).forEach(function (p) {
        var hot = false;
        if (placeName) hot = p.getAttribute('data-place') === placeName;
        else if (slugs) {
          var pp = pl.filter(function (x) { return x.name === p.getAttribute('data-place'); })[0];
          hot = pp.entries.some(function (e) { return slugs.indexOf(e.slug) > -1; });
        }
        p.classList.toggle('is-hot', hot);
      });
      $$('.jm-route', mapEl).forEach(function (r) { r.classList.toggle('is-hot', !!slugs && slugs.indexOf(r.getAttribute('data-slug')) > -1); });
      frame.classList.toggle('has-hot', !!slugs);
    }

    // filters
    var types = [];
    entries.forEach(function (e) { if (types.indexOf(e.type) < 0) types.push(e.type); });
    var filter = 'all';
    tabsEl.innerHTML = '<button class="jr-tab active" data-type="all" aria-pressed="true">All <span>' + entries.length + '</span></button>' +
      types.map(function (t) {
        return '<button class="jr-tab" data-type="' + esc(t) + '" aria-pressed="false">' + esc(t) + ' <span>' + entries.filter(function (e) { return e.type === t; }).length + '</span></button>';
      }).join('');
    tabsEl.addEventListener('click', function (ev) {
      var b = ev.target.closest('.jr-tab');
      if (!b) return;
      filter = b.getAttribute('data-type');
      $$('.jr-tab', tabsEl).forEach(function (x) { x.classList.toggle('active', x === b); x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      render();
    });

    function card(e, i) {
      var ph = (e.photos || []).slice(0, 8);
      var covers = ph.length ? ph : [{ src: e.cover, tone: '#2a2119' }];
      var segs = covers.length > 1 ? '<span class="jr-segs">' + covers.map(function (_, j) { return '<i' + (j === 0 ? ' class="on"' : '') + '></i>'; }).join('') + '</span>' : '';
      return '<a class="jr-card' + (ph.length ? '' : ' jr-card-text') + '" href="journal/' + e.slug + '.html" data-slug="' + e.slug + '" style="--i:' + i + '">' +
        '<span class="jr-cover" style="background:' + (covers[0].tone || '#ddd') + '">' +
          covers.map(function (p, j) {
            return '<img src="journal/thumbs/' + p.src + '" alt="" loading="' + (i < 2 && j === 0 ? 'eager' : 'lazy') + '"' + (j === 0 ? ' class="on"' : '') + '>';
          }).join('') +
          (ph.length ? '' : '<span class="jr-cover-quote">' + e.summary + '</span>') +
          segs +
          (ph.length ? '<span class="jr-count">' + e.photos.length + ' photos</span>' : '') +
        '</span>' +
        '<span class="jr-kicker">' + esc(e.type) + (e.stops && e.stops.length ? ' · ' + esc(e.stops.map(function (s) { return s.name; }).join(' → ')) : '') + '</span>' +
        '<span class="jr-title">' + esc(e.title) + '</span>' +
        '<span class="jr-date">' + fmtDate(e) + '</span>' +
        (ph.length ? '<span class="jr-sum">' + e.summary + '</span>' : '') +
      '</a>';
    }

    function render() {
      var shown = entries.filter(function (e) { return filter === 'all' || e.type === filter; });
      var years = [], byYear = {};
      shown.forEach(function (e) {
        var y = parts(e.date).y;
        if (!byYear[y]) { byYear[y] = []; years.push(y); }
        byYear[y].push(e);
      });
      var n = 0;
      list.innerHTML = years.map(function (y) {
        return '<section class="jr-year"><h2 class="jr-year-h"><span>' + y + '</span><em>' + byYear[y].length + (byYear[y].length === 1 ? ' entry' : ' entries') + '</em></h2>' +
          '<div class="jr-grid">' + byYear[y].map(function (e) { return card(e, n++); }).join('') + '</div></section>';
      }).join('');
      bindCards();
    }

    function bindCards() {
      $$('.jr-card', list).forEach(function (c) {
        var cover = $('.jr-cover', c), imgs = $$('img', cover), segs = $$('.jr-segs i', cover), cur = 0;
        function show(k) {
          if (k === cur || !imgs[k]) return;
          imgs[cur].classList.remove('on'); if (segs[cur]) segs[cur].classList.remove('on');
          imgs[k].classList.add('on'); if (segs[k]) segs[k].classList.add('on');
          cur = k;
        }
        if (imgs.length > 1) {
          cover.addEventListener('mousemove', function (ev) {
            var r = cover.getBoundingClientRect();
            show(Math.min(imgs.length - 1, Math.max(0, Math.floor((ev.clientX - r.left) / r.width * imgs.length))));
          });
          cover.addEventListener('mouseleave', function () { show(0); });
        }
        var e = entries.filter(function (x) { return x.slug === c.getAttribute('data-slug'); })[0];
        c.addEventListener('mouseenter', function () { if (e.stops && e.stops.length) highlight([e.slug]); });
        c.addEventListener('mouseleave', function () { highlight(null); });
      });
    }

    render();
  }

  // ---------- entry ----------
  function initEntry() {
    var slug = document.body.getAttribute('data-slug');
    var idx = -1;
    entries.forEach(function (e, i) { if (e.slug === slug) idx = i; });
    var root = $('#journalEntry');
    if (idx < 0) { root.innerHTML = '<p>Entry not found. <a href="../journal.html">Back to the journal</a></p>'; return; }
    var e = entries[idx];
    document.title = e.title + ' — Shohruh Xamrayev';
    var ph = e.photos || [];
    var y = parts(e.date).y;

    var meta = [e.place, fmtDate(e)].filter(Boolean);
    if (ph.length) meta.push(ph.length + ' photos');

    var head =
      '<nav class="crumbs je-crumbs" aria-label="Breadcrumb"><a href="../journal.html">Journal</a><span>/</span><span aria-current="page">' + y + '</span></nav>' +
      '<header class="je-head' + (e.stops && e.stops.length ? ' has-map' : '') + '">' +
        '<div>' +
          '<p class="je-kicker">' + esc(e.type) + (e.stops && e.stops.length > 1 ? ' · ' + esc(e.stops.map(function (s) { return s.name; }).join(' → ')) : '') + '</p>' +
          '<h1 class="je-title">' + esc(e.title) + '</h1>' +
          '<p class="je-meta">' + meta.map(esc).join('<span class="bk-dot">&middot;</span>') + '</p>' +
        '</div>' +
        (e.stops && e.stops.length ? '<div class="je-locator">' + mapSVG({ dots: e.stops, neighbours: false, dotR: 15 }) + '</div>' : '') +
      '</header>';

    var lede = (e.body || []).map(function (p) { return '<p>' + p + '</p>'; }).join('');

    // photo story: a cover, then alternate pairs and singles
    var groups = [], i = 0;
    if (ph.length) { groups.push([0]); i = 1; }
    var pair = true;
    while (i < ph.length) {
      if (pair && i + 1 < ph.length) { groups.push([i, i + 1]); i += 2; }
      else { groups.push([i]); i += 1; }
      pair = !pair;
    }
    var story = groups.map(function (g, gi) {
      return '<div class="je-row je-row-' + g.length + (gi === 0 ? ' je-row-cover' : '') + '">' + g.map(function (k) {
        var p = ph[k];
        return '<figure class="je-fig">' +
          '<button type="button" class="je-ph" data-k="' + k + '" style="aspect-ratio:' + p.w + ' / ' + p.h + ';background:' + (p.tone || '#ddd') + '" aria-label="Open photo ' + (k + 1) + ': ' + esc(p.alt) + '">' +
            '<img src="' + (gi === 0 ? p.src : 'thumbs/' + p.src) + '"' + (gi === 0 ? '' : ' data-full="' + esc(p.src) + '"') + ' alt="' + esc(p.alt) + '" width="' + p.w + '" height="' + p.h + '" loading="' + (gi === 0 ? 'eager' : 'lazy') + '" decoding="async">' +
          '</button>' +
          '<figcaption><span>' + (k + 1 < 10 ? '0' : '') + (k + 1) + '</span>' + esc(p.alt) + '</figcaption>' +
        '</figure>';
      }).join('') + '</div>';
    }).join('');

    var older = entries[idx + 1], newer = entries[idx - 1];
    function navCard(x, label, cls) {
      if (!x) return '<span class="je-nav-empty"></span>';
      return '<a class="je-nav-card ' + cls + '" href="' + x.slug + '.html">' +
        '<img src="thumbs/' + x.cover + '" alt="" loading="lazy" style="background:' + ((x.photos[0] || {}).tone || '#2a2119') + '">' +
        '<span><small>' + label + '</small><b>' + esc(x.title) + '</b><em>' + fmtDate(x) + '</em></span></a>';
    }

    root.innerHTML = head +
      (lede ? '<div class="je-lede' + (ph.length ? '' : ' je-lede-solo') + '">' + lede + '</div>' : '') +
      (ph.length ? '<div class="je-story">' + story + '</div>' : '') +
      '<nav class="je-nav" aria-label="More entries">' + navCard(newer, '← Newer', 'je-newer') + navCard(older, 'Older →', 'je-older') + '</nav>' +
      '<p class="bk-page-back"><a href="../journal.html">&larr; All entries</a></p>';

    // upgrade thumbnails to full size once they are close to the viewport
    var lazy = $$('img[data-full]', root);
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          if (!en.isIntersecting) return;
          var img = en.target; io.unobserve(img);
          var full = new Image(); full.src = img.getAttribute('data-full');
          full.onload = function () { img.src = full.src; };
        });
      }, { rootMargin: '400px 0px' });
      lazy.forEach(function (img) { io.observe(img); });
    }

    // reveal on scroll
    var figs = $$('.je-fig', root);
    if (!reduce && 'IntersectionObserver' in window) {
      var rv = new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); rv.unobserve(en.target); } });
      }, { threshold: 0.12 });
      figs.forEach(function (f) { f.classList.add('pre'); rv.observe(f); });
    }

    if (ph.length) initViewer(ph, root);
  }

  // ---------- full-screen viewer ----------
  function initViewer(ph, root) {
    var v = document.createElement('div');
    v.className = 'jv';
    v.setAttribute('role', 'dialog');
    v.setAttribute('aria-modal', 'true');
    v.setAttribute('aria-label', 'Photo viewer');
    v.hidden = true;
    v.innerHTML =
      '<div class="jv-stage"><img class="jv-img" alt=""></div>' +
      '<button class="jv-btn jv-close" type="button" aria-label="Close">' +
        '<svg viewBox="0 0 20 20"><path d="M5 5l10 10M15 5 5 15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>' +
      '<button class="jv-btn jv-prev" type="button" aria-label="Previous photo">' +
        '<svg viewBox="0 0 20 20"><path d="M12.5 4 6.5 10l6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
      '<button class="jv-btn jv-next" type="button" aria-label="Next photo">' +
        '<svg viewBox="0 0 20 20"><path d="m7.5 4 6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
      '<div class="jv-bar"><span class="jv-count"></span><span class="jv-cap"></span></div>' +
      '<div class="jv-strip">' + ph.map(function (p, k) { return '<button type="button" data-k="' + k + '" aria-label="Photo ' + (k + 1) + '"><img src="thumbs/' + p.src + '" alt="" loading="lazy"></button>'; }).join('') + '</div>';
    document.body.appendChild(v);

    var img = $('.jv-img', v), cap = $('.jv-cap', v), count = $('.jv-count', v), strip = $$('.jv-strip button', v);
    var cur = 0, lastFocus = null;

    function show(k, dir) {
      cur = (k + ph.length) % ph.length;
      var p = ph[cur];
      img.classList.remove('jv-in-l', 'jv-in-r');
      void img.offsetWidth;
      if (dir && !reduce) img.classList.add(dir > 0 ? 'jv-in-r' : 'jv-in-l');
      img.src = 'thumbs/' + p.src;
      var full = new Image();
      full.onload = function () { if (ph[cur] === p) img.src = full.src; };
      full.src = p.src;
      img.alt = p.alt;
      cap.textContent = p.alt;
      count.textContent = (cur + 1) + ' / ' + ph.length;
      strip.forEach(function (b, j) { b.classList.toggle('on', j === cur); });
      if (strip[cur]) strip[cur].scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduce ? 'auto' : 'smooth' });
      [cur + 1, cur - 1].forEach(function (j) { var n = ph[(j + ph.length) % ph.length]; (new Image()).src = n.src; });
    }
    function open(k) {
      lastFocus = document.activeElement;
      v.hidden = false;
      document.documentElement.classList.add('jv-lock');
      requestAnimationFrame(function () { v.classList.add('open'); });
      show(k);
      $('.jv-close', v).focus();
    }
    function close() {
      v.classList.remove('open');
      document.documentElement.classList.remove('jv-lock');
      setTimeout(function () { v.hidden = true; }, reduce ? 0 : 200);
      if (lastFocus) lastFocus.focus();
    }

    $$('.je-ph', root).forEach(function (b) { b.addEventListener('click', function () { open(+b.getAttribute('data-k')); }); });
    $('.jv-close', v).addEventListener('click', close);
    $('.jv-prev', v).addEventListener('click', function () { show(cur - 1, -1); });
    $('.jv-next', v).addEventListener('click', function () { show(cur + 1, 1); });
    strip.forEach(function (b) { b.addEventListener('click', function () { var k = +b.getAttribute('data-k'); show(k, k > cur ? 1 : -1); }); });
    $('.jv-stage', v).addEventListener('click', function (ev) { if (ev.target === ev.currentTarget) close(); });

    document.addEventListener('keydown', function (ev) {
      if (v.hidden) return;
      if (ev.key === 'Escape') close();
      else if (ev.key === 'ArrowRight') show(cur + 1, 1);
      else if (ev.key === 'ArrowLeft') show(cur - 1, -1);
      else if (ev.key === 'Tab') {
        var f = $$('button', v).filter(function (b) { return b.offsetParent !== null; });
        var i = f.indexOf(document.activeElement);
        if (ev.shiftKey && i <= 0) { ev.preventDefault(); f[f.length - 1].focus(); }
        else if (!ev.shiftKey && i === f.length - 1) { ev.preventDefault(); f[0].focus(); }
      }
    });

    var sx = null, sy = null;
    v.addEventListener('touchstart', function (ev) { sx = ev.touches[0].clientX; sy = ev.touches[0].clientY; }, { passive: true });
    v.addEventListener('touchend', function (ev) {
      if (sx === null) return;
      var dx = ev.changedTouches[0].clientX - sx, dy = ev.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) show(cur + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
      else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) close();
      sx = null;
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var page = document.body.getAttribute('data-journal-page');
    if (page === 'index') initIndex();
    if (page === 'entry') initEntry();
  });
})();
