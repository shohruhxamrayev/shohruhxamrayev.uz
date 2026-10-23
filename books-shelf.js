/* Books: 3D shelf, selected-book panel, reading list, book pages and collection.
   All content comes from books-data.js — add or edit books there. */
(function () {
  'use strict';

  if (typeof booksData === 'undefined') return;

  // ---------- helpers ----------
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function time(b) {
    var t = Date.parse(b.readDate || '');
    return isNaN(t) ? 0 : t;
  }

  // Currently reading first, then read books from newest to oldest.
  var books = booksData.slice().sort(function (a, b) {
    var ar = a.status === 'reading' ? 1 : 0, br = b.status === 'reading' ? 1 : 0;
    if (ar !== br) return br - ar;
    return time(b) - time(a);
  });

  function statusLine(b) {
    if (b.status === 'reading') {
      return '<span class="bk-reading">Currently Reading</span>' +
        (b.started ? ' &middot; Started: ' + esc(b.started) : '');
    }
    return 'Read: ' + esc(b.readDate) + (b.rating ? ' &middot; <strong>Rating: ' + esc(b.rating) + '</strong>' : '');
  }

  function hash(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return Math.abs(h);
  }

  var FALLBACK = [['#2f4a3a', '#efe7d6'], ['#c4703f', '#fff8ef'], ['#1f2a44', '#e9d8a6'], ['#e8e1d3', '#3f3122'], ['#7d1b26', '#f2e2c4'], ['#3d6f8e', '#f4efe4']];

  function spineColors(b, i) {
    if (b.spine) return [b.spine, b.spineInk || '#fff'];
    return FALLBACK[i % FALLBACK.length];
  }

  // Try to colour each spine from its real cover (works when the image host allows it).
  function sampleCover(b, el) {
    var key = 'spine2:' + b.cover;
    try {
      var cached = localStorage.getItem(key);
      if (cached) { apply(JSON.parse(cached)); return; }
    } catch (e) {}
    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () {
      try {
        var c = document.createElement('canvas');
        c.width = 24; c.height = 36;
        var ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0, 24, 36);
        var d = ctx.getImageData(0, 0, 24, 36).data, buckets = {}, best = null;
        // Dominant colour: group pixels into coarse buckets and take the biggest one.
        for (var p = 0; p < d.length; p += 4) {
          var k = (d[p] >> 4) + ',' + (d[p + 1] >> 4) + ',' + (d[p + 2] >> 4);
          var o = buckets[k] || (buckets[k] = { n: 0, r: 0, g: 0, b: 0 });
          o.n++; o.r += d[p]; o.g += d[p + 1]; o.b += d[p + 2];
          if (!best || o.n > best.n) best = o;
        }
        var r = Math.round(best.r / best.n), g = Math.round(best.g / best.n), bl = Math.round(best.b / best.n);
        var lum = (0.299 * r + 0.587 * g + 0.114 * bl) / 255;
        var out = ['rgb(' + r + ',' + g + ',' + bl + ')', lum > 0.6 ? '#2a2119' : '#fbf6ec'];
        try { localStorage.setItem(key, JSON.stringify(out)); } catch (e) {}
        apply(out);
      } catch (e) { /* cross-origin image: keep the hand-picked colour */ }
    };
    img.src = b.cover;
    function apply(c) { el.style.setProperty('--spine', c[0]); el.style.setProperty('--ink', c[1]); }
  }

  // ---------- shelf ----------
  var SPINE_MIN = 34, SPINE_MAX = 46, GAP = 3;

  function buildShelf(root, opts) {
    var base = opts.base || '';
    var n = books.length;
    var idx = Math.max(0, opts.startIndex || 0);
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    root.classList.add('shelf');
    root.innerHTML =
      '<div class="shelf-viewport" tabindex="0" aria-label="Bookshelf. Use left and right arrow keys to browse.">' +
        '<div class="shelf-track"></div>' +
        '<div class="shelf-board"></div>' +
      '</div>' +
      '<div class="shelf-controls">' +
        '<button class="shelf-btn shelf-prev" type="button" aria-label="Previous book">' +
          '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
        '<input class="shelf-range" type="range" min="0" max="' + (n - 1) + '" step="1" value="' + idx + '" aria-label="Browse books">' +
        '<button class="shelf-btn shelf-next" type="button" aria-label="Next book">' +
          '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
      '</div>';

    var viewport = root.querySelector('.shelf-viewport');
    var track = root.querySelector('.shelf-track');
    var range = root.querySelector('.shelf-range');
    var prev = root.querySelector('.shelf-prev');
    var next = root.querySelector('.shelf-next');
    var els = [];

    books.forEach(function (b, i) {
      var col = spineColors(b, i);
      var w = SPINE_MIN + hash(b.slug) % (SPINE_MAX - SPINE_MIN + 1);
      var a = document.createElement('a');
      a.className = 'shelf-book';
      a.href = base + 'books/' + b.slug + '.html';
      a.setAttribute('aria-label', b.title + ' by ' + b.author);
      a.style.setProperty('--spine', col[0]);
      a.style.setProperty('--ink', col[1]);
      a.style.setProperty('--spine-w', w + 'px');
      a.innerHTML =
        '<span class="shelf-spine" aria-hidden="true">' +
          '<span class="shelf-spine-title">' + esc(b.title) + '</span>' +
          '<span class="shelf-spine-num">' + (i + 1 < 10 ? '0' : '') + (i + 1) + '</span>' +
        '</span>' +
        '<span class="shelf-face" aria-hidden="true"><img src="' + esc(b.cover) + '" alt="" loading="' + (i < 12 ? 'eager' : 'lazy') + '" draggable="false"></span>';
      track.appendChild(a);
      els.push({ el: a, w: w });
      sampleCover(b, a);

      a.addEventListener('mouseenter', function () { if (canHover()) a.classList.add('is-peek'); });
      a.addEventListener('mouseleave', function () { a.classList.remove('is-peek'); });
      a.addEventListener('focus', function () { select(i); });
    });

    function canHover() { return window.matchMedia && window.matchMedia('(hover: hover)').matches; }

    function coverW() {
      var v = getComputedStyle(root).getPropertyValue('--cover-w');
      return parseFloat(v) || 150;
    }

    function layout() {
      var cw = coverW(), x = 0, center = 0, total = 0;
      els.forEach(function (e, i) {
        var w = i === idx ? cw : e.w;
        if (i === idx) center = x + w / 2;
        x += w + GAP;
      });
      total = x - GAP;
      var vw = viewport.clientWidth;
      var off = Math.max(0, Math.min(center - vw / 2, total - vw));
      if (total <= vw) off = 0;
      track.style.transform = 'translateX(' + (-off) + 'px)';
    }

    function select(i, silent) {
      i = Math.max(0, Math.min(n - 1, i));
      idx = i;
      els.forEach(function (e, j) { e.el.classList.toggle('is-open', j === i); });
      range.value = i;
      range.style.setProperty('--p', n > 1 ? (i / (n - 1)) * 100 + '%' : '100%');
      prev.disabled = i === 0;
      next.disabled = i === n - 1;
      layout();
      if (!silent && opts.onChange) opts.onChange(books[i], i);
    }

    prev.addEventListener('click', function () { select(idx - 1); });
    next.addEventListener('click', function () { select(idx + 1); });
    range.addEventListener('input', function () { select(+range.value); });

    viewport.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); select(idx - 1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); select(idx + 1); }
      else if (e.key === 'Enter') { location.href = els[idx].el.href; }
    });

    // Swipe on touch screens
    var sx = null, sy = null, swiped = false;
    viewport.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; swiped = false; }, { passive: true });
    viewport.addEventListener('touchmove', function (e) {
      if (sx === null) return;
      var dx = e.touches[0].clientX - sx;
      if (Math.abs(dx) > 36 && Math.abs(dx) > Math.abs(e.touches[0].clientY - sy)) {
        select(idx + (dx < 0 ? 1 : -1));
        sx = e.touches[0].clientX; swiped = true;
      }
    }, { passive: true });
    viewport.addEventListener('touchend', function () { sx = null; });
    viewport.addEventListener('click', function (e) { if (swiped) { e.preventDefault(); swiped = false; } }, true);

    // Trackpad / wheel sideways scrolling
    var wheelAcc = 0, wheelT = 0;
    viewport.addEventListener('wheel', function (e) {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      wheelAcc += e.deltaX;
      var now = Date.now();
      if (Math.abs(wheelAcc) > 40 && now - wheelT > 120) {
        select(idx + (wheelAcc > 0 ? 1 : -1)); wheelAcc = 0; wheelT = now;
      }
    }, { passive: false });

    window.addEventListener('resize', layout);
    if (reduce) root.classList.add('shelf-reduced');

    root.classList.add('no-anim');
    select(idx, true);
    requestAnimationFrame(function () { requestAnimationFrame(function () { root.classList.remove('no-anim'); }); });
    if (opts.onChange) opts.onChange(books[idx], idx);
    return { select: select };
  }

  window.BookShelf = { build: buildShelf, books: books };

  // ---------- list entries ----------
  function entryHTML(b, base) {
    var href = base + 'books/' + b.slug + '.html';
    return '<article class="bk-entry">' +
      '<a class="bk-entry-cover" href="' + href + '" tabindex="-1" aria-hidden="true"><img src="' + esc(b.cover) + '" alt="" loading="lazy"></a>' +
      '<div class="bk-entry-body">' +
        '<h3><a href="' + href + '">' + esc(b.title) + '</a></h3>' +
        '<p class="bk-author">' + esc(b.author) + '</p>' +
        '<p class="bk-status">' + statusLine(b) + '</p>' +
        (b.status === 'read' && b.summary ? '<p class="bk-excerpt">' + esc(b.summary) + '</p>' : '') +
      '</div>' +
    '</article>';
  }

  // ---------- pages ----------
  document.addEventListener('DOMContentLoaded', function () {
    var shelfEl = document.getElementById('shelf');
    var page = document.body.getAttribute('data-books-page');

    // Books landing page
    if (page === 'shelf' && shelfEl) {
      var info = document.getElementById('shelfInfo');
      buildShelf(shelfEl, {
        base: '',
        startIndex: 0,
        onChange: function (b) {
          info.innerHTML =
            '<h2 class="bk-title"><a href="books/' + b.slug + '.html">' + esc(b.title) + '</a></h2>' +
            '<p class="bk-author">' + esc(b.author) + '</p>' +
            '<p class="bk-status">' + statusLine(b) + '</p>';
        }
      });
      var list = document.getElementById('booksList');
      if (list) list.innerHTML = books.map(function (b) { return entryHTML(b, ''); }).join('');
    }

    // Single book page (books/<slug>.html)
    if (page === 'book' && shelfEl) {
      var slug = document.body.getAttribute('data-slug');
      var i = -1;
      books.forEach(function (b, j) { if (b.slug === slug) i = j; });
      var article = document.getElementById('bookArticle');
      if (i < 0) { article.innerHTML = '<p>Book not found. <a href="../books.html">Back to the shelf</a></p>'; return; }
      var b = books[i];
      document.title = b.title + ' — Shohruh Xamrayev';
      buildShelf(shelfEl, { base: '../', startIndex: i });
      var meta = 'By: ' + esc(b.author) + '<span class="bk-dot">&middot;</span>' +
        (b.status === 'reading'
          ? '<span class="bk-reading">Currently Reading</span>' + (b.started ? '<span class="bk-dot">&middot;</span>Started: ' + esc(b.started) : '')
          : 'Read: ' + esc(b.readDate) + (b.rating ? '<span class="bk-dot">&middot;</span><strong>Rating: ' + esc(b.rating) + '</strong>' : ''));
      article.innerHTML =
        '<h1 class="bk-page-title">' + esc(b.title) + '</h1>' +
        '<p class="bk-page-meta">' + meta + '</p>' +
        '<div class="bk-page-body">' + (b.thoughts || []).map(function (t) { return '<p>' + esc(t) + '</p>'; }).join('') + '</div>' +
        '<p class="bk-page-back"><a href="../books.html">&larr; Back to the shelf</a> <span class="bk-dot">&middot;</span> <a href="../books-collection.html">Full collection</a></p>';
    }

    // Collection page
    if (page === 'collection') {
      var grid = document.getElementById('collectionGrid');
      var search = document.getElementById('bookSearch');
      var tabs = document.querySelectorAll('.col-tab');
      var views = document.querySelectorAll('.col-view');
      var empty = document.getElementById('collectionEmpty');
      var filter = 'all', view = 'grid';

      try { view = localStorage.getItem('books:view') === 'list' ? 'list' : 'grid'; } catch (e) {}

      document.getElementById('countAll').textContent = books.length;
      document.getElementById('countRead').textContent = books.filter(function (b) { return b.status === 'read'; }).length;
      document.getElementById('countReading').textContent = books.filter(function (b) { return b.status === 'reading'; }).length;

      function render() {
        var q = search.value.trim().toLowerCase();
        var shown = books.filter(function (b) {
          return (filter === 'all' || b.status === filter) &&
            (!q || b.title.toLowerCase().indexOf(q) > -1 || b.author.toLowerCase().indexOf(q) > -1);
        });
        grid.className = view === 'list' ? 'col-list' : 'col-grid';
        grid.innerHTML = shown.map(function (b) {
          if (view === 'list') return entryHTML(b, '');
          return '<a class="col-card" href="books/' + b.slug + '.html">' +
            '<span class="col-cover"><img src="' + esc(b.cover) + '" alt="' + esc(b.title) + ' cover" loading="lazy"></span>' +
            '<span class="col-title">' + esc(b.title) + '</span>' +
            '<span class="col-author">' + esc(b.author) + '</span></a>';
        }).join('');
        empty.hidden = shown.length > 0;
        views.forEach(function (v) {
          var on = v.getAttribute('data-view') === view;
          v.classList.toggle('active', on);
          v.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
      }

      search.addEventListener('input', render);
      tabs.forEach(function (t) {
        t.addEventListener('click', function () {
          tabs.forEach(function (x) { x.classList.remove('active'); x.setAttribute('aria-selected', 'false'); });
          t.classList.add('active'); t.setAttribute('aria-selected', 'true');
          filter = t.getAttribute('data-filter');
          render();
        });
      });
      views.forEach(function (v) {
        v.addEventListener('click', function () {
          view = v.getAttribute('data-view');
          try { localStorage.setItem('books:view', view); } catch (e) {}
          render();
        });
      });
      render();
    }
  });
})();
