/* Essays: featured essay, stats, search, surprise-me, hover previews; on essay pages a reading
   progress bar, previous/next essays and copy-link. The essays list page is the single source. */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  // Read every essay row (newest first) from a document: the live page, or a fetched copy.
  function readEssays(doc) {
    var out = [], year = '';
    $$('.essay-year-heading, .essay-row', doc).forEach(function (el) {
      if (el.classList.contains('essay-year-heading')) { year = el.textContent.trim(); return; }
      var a = $('h3 a', el);
      if (!a) return;
      out.push({
        el: el,
        title: a.textContent.trim(),
        href: a.getAttribute('href'),
        blurb: (($('.essay-content p', el) || {}).textContent || '').trim(),
        time: (($('.essay-reading-time', el) || {}).textContent || '').trim(),
        date: (($('.essay-date', el) || {}).textContent || '').trim(),
        year: year,
        img: ($('.essay-thumb', el) || { getAttribute: function () { return ''; } }).getAttribute('src')
      });
    });
    return out;
  }
  function mins(t) { var m = /(\d+)/.exec(t || ''); return m ? +m[1] : 0; }

  // ---------- index ----------
  function initIndex() {
    var list = readEssays(document);
    if (!list.length) return;
    var total = list.reduce(function (n, e) { return n + mins(e.time); }, 0);
    var years = list.map(function (e) { return e.year; }).filter(Boolean);
    var first = years[years.length - 1];

    $('#essayStats').innerHTML =
      '<div><b>' + list.length + '</b><span>essays</span></div>' +
      '<div><b>' + total + '</b><span>minutes of reading</span></div>' +
      (first ? '<div><span>since</span><b>' + esc(first) + '</b></div>' : '');

    var f = list[0];
    $('#essayFeature').innerHTML =
      '<a class="es-feature" href="' + esc(f.href) + '">' +
        '<span class="es-feature-img"><img src="' + esc(f.img) + '" alt=""></span>' +
        '<span class="es-feature-body">' +
          '<span class="es-feature-k">Latest essay</span>' +
          '<span class="es-feature-t">' + esc(f.title) + '</span>' +
          '<span class="es-feature-b">' + esc(f.blurb) + '</span>' +
          '<span class="es-feature-m">' + esc(f.date) + ', ' + esc(f.year) + ' · ' + esc(f.time) + '<i>Read essay →</i></span>' +
        '</span>' +
      '</a>';

    // whole row is clickable; numbered for rhythm
    list.forEach(function (e, i) {
      e.el.setAttribute('data-n', (list.length - i < 10 ? '0' : '') + (list.length - i));
      e.el.addEventListener('click', function (ev) { if (!ev.target.closest('a')) location.href = e.href; });
    });

    // search
    var input = $('#essaySearch'), empty = $('#essayEmpty');
    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase(), shown = 0;
      list.forEach(function (e) {
        var hit = !q || (e.title + ' ' + e.blurb).toLowerCase().indexOf(q) > -1;
        e.el.hidden = !hit;
        if (hit) shown++;
      });
      $$('.essay-year-heading').forEach(function (h) {
        var box = h.nextElementSibling;
        var any = box && $$('.essay-row', box).some(function (r) { return !r.hidden; });
        h.hidden = !any; if (box) box.hidden = !any;
      });
      empty.hidden = shown > 0;
    });

    $('#essayRandom').addEventListener('click', function () {
      location.href = list[Math.floor(Math.random() * list.length)].href;
    });

    // cursor-following preview image (mouse devices only)
    if (window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      document.body.classList.add('es-hover');
      var peek = document.createElement('div');
      peek.className = 'es-peek';
      peek.innerHTML = '<img alt="">';
      document.body.appendChild(peek);
      var img = $('img', peek), x = 0, y = 0, px = 0, py = 0, raf = null, on = false;
      function loop() {
        px += (x - px) * 0.18; py += (y - py) * 0.18;
        peek.style.transform = 'translate(' + px + 'px,' + py + 'px) rotate(' + Math.max(-6, Math.min(6, (x - px) * 0.08)) + 'deg)';
        raf = on || Math.abs(x - px) > 0.5 ? requestAnimationFrame(loop) : null;
      }
      list.forEach(function (e) {
        e.el.addEventListener('mouseenter', function (ev) {
          img.src = e.img; on = true;
          x = ev.clientX + 24; y = ev.clientY - 70;
          if (!peek.classList.contains('on')) { px = x; py = y; }
          peek.classList.add('on');
          if (!raf && !reduce) raf = requestAnimationFrame(loop);
          if (reduce) peek.style.transform = 'translate(' + x + 'px,' + y + 'px)';
        });
        e.el.addEventListener('mousemove', function (ev) { x = ev.clientX + 24; y = ev.clientY - 70; if (reduce) peek.style.transform = 'translate(' + x + 'px,' + y + 'px)'; });
        e.el.addEventListener('mouseleave', function () { on = false; peek.classList.remove('on'); });
      });
    }
  }

  // ---------- essay page ----------
  function initEssay() {
    var article = $('.es-article');
    if (!article) return;

    // reading progress under the header
    var bar = document.createElement('div');
    bar.className = 'es-progress';
    bar.innerHTML = '<i></i>';
    ($('header.site') || document.body).appendChild(bar);
    var fill = $('i', bar), body = $('.es-body');
    function upd() {
      var top = body.getBoundingClientRect().top + window.scrollY;
      var h = body.offsetHeight - window.innerHeight * 0.55;
      var p = Math.max(0, Math.min(1, (window.scrollY + 120 - top) / Math.max(1, h)));
      fill.style.transform = 'scaleX(' + p + ')';
    }
    window.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd);
    upd();

    // copy link
    var btn = $('[data-copy-link]');
    if (btn) btn.addEventListener('click', function () {
      var done = function () { btn.textContent = 'Link copied'; setTimeout(function () { btn.textContent = 'Copy link to this essay'; }, 1600); };
      if (navigator.clipboard) navigator.clipboard.writeText(location.href.split('#')[0]).then(done, function () {});
    });

    // previous / next from the essays list
    var nav = $('#essayNav');
    var here = location.pathname.split('/').pop();
    fetch('../essays.html').then(function (r) { return r.ok ? r.text() : ''; }).then(function (html) {
      var list = readEssays(new DOMParser().parseFromString(html, 'text/html'));
      var i = -1;
      list.forEach(function (e, j) { if (e.href.split('/').pop() === here) i = j; });
      if (i < 0) return;
      function cardFor(e, label, cls) {
        if (!e) return '<span></span>';
        return '<a class="es-nav-card ' + cls + '" href="' + esc(e.href.replace(/^essays\//, '')) + '">' +
          '<small>' + label + '</small><b>' + esc(e.title) + '</b><em>' + esc(e.date) + ', ' + esc(e.year) + ' · ' + esc(e.time) + '</em></a>';
      }
      nav.innerHTML = cardFor(list[i + 1], '← Older', 'es-older') + cardFor(list[i - 1], 'Newer →', 'es-newer');
    }).catch(function () {});
  }

  document.addEventListener('DOMContentLoaded', function () {
    var p = document.body.getAttribute('data-essay-page');
    if (p === 'index') initIndex();
    if (p === 'essay') initEssay();
  });
})();
