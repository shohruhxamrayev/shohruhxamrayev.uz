/* Home + About: live "Lately" cards, link previews, label animation, scroll reveals.
   Reads books-data.js, journal-data.js, studio-data.js and the essays page, so nothing here needs editing by hand. */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  // ---------- data ----------
  var books = typeof booksData !== 'undefined' ? booksData : [];
  var journal = typeof journalData !== 'undefined' ? journalData.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; }) : [];
  var studio = typeof studioData !== 'undefined' ? studioData : null;

  function bookTime(b) { var t = Date.parse(b.readDate || ''); return isNaN(t) ? 0 : t; }
  var reading = books.filter(function (b) { return b.status === 'reading'; });
  var lastRead = books.filter(function (b) { return b.status === 'read'; }).sort(function (a, b) { return bookTime(b) - bookTime(a); })[0];
  var trip = journal.filter(function (e) { return (e.photos || []).length; })[0];

  function jDate(e) {
    var p = e.date.split('-'), m = MONTHS[+p[1] - 1];
    return m + ' ' + (+p[2]) + (e.end ? '–' + (+e.end.split('-')[2]) : '') + ', ' + p[0];
  }

  // Essays live as HTML, so read the first (newest) one straight from the essays page.
  var essaysPromise = null;
  function loadEssays() {
    if (essaysPromise) return essaysPromise;
    essaysPromise = fetch('essays.html').then(function (r) { return r.ok ? r.text() : ''; }).then(function (html) {
      var doc = new DOMParser().parseFromString(html, 'text/html');
      var rows = $$('.essay-row', doc);
      if (!rows.length) return { count: 0 };
      var first = rows[0], a = $('h3 a', first);
      var year = $('.essay-year-heading', doc);
      return {
        count: rows.length,
        title: a ? a.textContent.trim() : '',
        href: a ? a.getAttribute('href') : 'essays.html',
        blurb: ($('.essay-content p', first) || {}).textContent || '',
        time: ($('.essay-reading-time', first) || {}).textContent || '',
        date: (($('.essay-date', first) || {}).textContent || '') + (year ? ', ' + year.textContent.trim() : ''),
        thumb: ($('.essay-thumb', first) || { getAttribute: function () { return ''; } }).getAttribute('src')
      };
    }).catch(function () { return { count: 0 }; });
    return essaysPromise;
  }

  // ---------- label animation: "Student, builder, founder — curious." ----------
  function initLabels() {
    var labels = $$('.hm-label'), keep = $('.hm-keep');
    if (!labels.length) return;
    if (reduce) { labels.forEach(function (l) { l.classList.add('struck'); }); keep.classList.add('on'); return; }
    labels.forEach(function (l, i) { setTimeout(function () { l.classList.add('struck'); }, 900 + i * 520); });
    setTimeout(function () { keep.classList.add('on'); }, 900 + labels.length * 520 + 180);
  }

  // ---------- Lately cards ----------
  function card(cls, href, media, kicker, title, meta, extra) {
    return '<a class="hm-card ' + cls + '" href="' + href + '">' +
      '<span class="hm-card-media">' + media + '</span>' +
      '<span class="hm-card-body"><span class="hm-card-k">' + kicker + '</span>' +
      '<span class="hm-card-t">' + title + '</span>' +
      (meta ? '<span class="hm-card-m">' + meta + '</span>' : '') +
      (extra || '') + '</span></a>';
  }

  function initNow() {
    var grid = $('#nowGrid');
    if (!grid) return;
    var html = '';
    var r = reading[0];
    if (r) {
      html += card('hm-card-book', 'books/' + r.slug + '.html',
        '<img src="' + esc(r.cover) + '" alt="" loading="lazy">' + (reading[1] ? '<img class="hm-card-back" src="' + esc(reading[1].cover) + '" alt="" loading="lazy">' : ''),
        '<i class="hm-live"></i>Reading now', esc(r.title), esc(r.author) + (reading.length > 1 ? ' · and ' + (reading.length - 1) + ' more' : ''));
    } else if (lastRead) {
      html += card('hm-card-book', 'books/' + lastRead.slug + '.html', '<img src="' + esc(lastRead.cover) + '" alt="" loading="lazy">', 'Last read', esc(lastRead.title), esc(lastRead.author) + ' · ' + esc(lastRead.rating || ''));
    }
    if (trip) {
      var ph = trip.photos.slice(0, 3);
      html += card('hm-card-trip', 'journal/' + trip.slug + '.html',
        ph.map(function (p, i) { return '<img src="journal/thumbs/' + esc(p.src) + '" alt="" loading="lazy" style="--n:' + i + '">'; }).join(''),
        'Latest trip', esc(trip.title), jDate(trip) + ' · ' + trip.photos.length + ' photos');
    }
    html += card('hm-card-build', 'projects/makon.html',
      '<img src="projects/img/makon-after.jpg" alt="" loading="lazy">',
      'Latest build', 'Makon', 'Redesign with AI, build it in 3D, design every piece');
    html += '<a class="hm-card hm-card-essay" href="essays.html" id="essayCard"><span class="hm-card-body"><span class="hm-card-k">Latest essay</span><span class="hm-card-t hm-skel">&nbsp;</span><span class="hm-card-m hm-skel">&nbsp;</span></span></a>';
    grid.innerHTML = html;

    loadEssays().then(function (e) {
      var c = $('#essayCard');
      if (!c) return;
      if (!e.title) { c.remove(); return; }
      c.setAttribute('href', e.href);
      c.innerHTML = '<span class="hm-card-body"><span class="hm-card-k">Latest essay</span>' +
        '<span class="hm-card-t">' + esc(e.title) + '</span>' +
        '<span class="hm-card-m">' + esc(e.date) + (e.time ? ' · ' + esc(e.time) : '') + '</span>' +
        (e.blurb ? '<span class="hm-card-x">' + esc(e.blurb) + '</span>' : '') + '</span>';
    });
  }

  // ---------- explore counts ----------
  function initExplore() {
    var list = $$('.hm-ex a[data-k], .ab-ex a');
    if (!list.length) return;
    var counts = {
      books: books.length ? books.length + ' books' : '',
      journal: journal.length ? journal.length + ' entries' : '',
      projects: '2 projects',
      studio: studio ? (studio.quotes.length + studio.movies.length + studio.rules.length) + ' picks' : ''
    };
    function put() {
      list.forEach(function (a) {
        var k = a.getAttribute('data-k') || (a.getAttribute('href') || '').replace('.html', '');
        var em = $('em', a);
        if (em && counts[k]) em.textContent = counts[k];
      });
    }
    put();
    loadEssays().then(function (e) { if (e.count) { counts.essays = e.count + ' essays'; put(); } });
  }

  // ---------- link previews in the bio ----------
  function initPreviews() {
    var links = $$('a[data-preview]');
    if (!links.length || !(window.matchMedia && window.matchMedia('(hover: hover)').matches)) return;
    var pop = document.createElement('div');
    pop.className = 'hm-peek';
    pop.setAttribute('aria-hidden', 'true');
    document.body.appendChild(pop);
    var hideT = null;

    function content(k) {
      if (k === 'books') {
        var shown = books.slice(0, 5);
        return '<span class="hm-peek-k">' + books.length + ' books on the shelf</span>' +
          '<span class="hm-peek-covers">' + shown.map(function (b, i) { return '<img src="' + esc(b.cover) + '" alt="" style="--i:' + i + '">'; }).join('') + '</span>' +
          (reading[0] ? '<span class="hm-peek-t">Reading: ' + esc(reading[0].title) + '</span>' : '');
      }
      if (k === 'journal' && trip) {
        return '<span class="hm-peek-img"><img src="journal/thumbs/' + esc(trip.cover) + '" alt=""></span>' +
          '<span class="hm-peek-k">Latest · ' + jDate(trip) + '</span><span class="hm-peek-t">' + esc(trip.title) + '</span>';
      }
      if (k === 'projects') {
        return '<span class="hm-peek-img hm-peek-wide"><img src="projects/img/makon-after.jpg" alt=""></span>' +
          '<span class="hm-peek-k">2 projects</span><span class="hm-peek-t">Makon · Personal Website</span>';
      }
      if (k === 'essays') {
        return '<span class="hm-peek-k" data-essay-k>Essays</span><span class="hm-peek-t" data-essay-t>Loading…</span>';
      }
      return '';
    }

    function show(a) {
      clearTimeout(hideT);
      var k = a.getAttribute('data-preview');
      pop.innerHTML = content(k);
      pop.className = 'hm-peek hm-peek-' + k;
      if (k === 'essays') loadEssays().then(function (e) {
        var kk = $('[data-essay-k]', pop), tt = $('[data-essay-t]', pop);
        if (kk) kk.textContent = (e.count || '') + ' essays · latest';
        if (tt) tt.textContent = e.title || 'Essays';
      });
      var r = a.getBoundingClientRect();
      pop.style.left = Math.max(12, Math.min(window.innerWidth - 252, r.left + r.width / 2 - 120)) + window.scrollX + 'px';
      pop.style.top = r.top + window.scrollY - 10 + 'px';
      requestAnimationFrame(function () { pop.classList.add('on'); });
    }
    function hide() { hideT = setTimeout(function () { pop.classList.remove('on'); }, 80); }
    links.forEach(function (a) {
      a.addEventListener('mouseenter', function () { show(a); });
      a.addEventListener('mouseleave', hide);
      a.addEventListener('focus', function () { show(a); });
      a.addEventListener('blur', hide);
    });
  }

  // ---------- reveal on scroll ----------
  function initReveal() {
    var els = $$('.hm-bio p, .hm-now, .hm-explore, .ab-chapter, .ab-elsewhere');
    if (reduce || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { el.classList.add('rv'); io.observe(el); });
  }

  // ---------- about: the strength / weakness needle ----------
  function initScale() {
    var s = $('.ab-scale');
    if (!s || reduce) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { s.classList.add('swing'); io.disconnect(); } });
    }, { threshold: 0.8 });
    io.observe(s);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var p = document.body.getAttribute('data-home-page');
    if (p === 'home') { initLabels(); initNow(); initPreviews(); }
    initExplore();
    initReveal();
    if (p === 'about') initScale();
  });
})();
