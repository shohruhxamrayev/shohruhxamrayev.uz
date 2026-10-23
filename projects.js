/* Projects: filters, animated pipelines, step-through diagrams, reading progress, demos. */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  // ---------- category filter on the index ----------
  function initFilters() {
    var tabs = $$('.pj-tab');
    if (!tabs.length) return;
    var cards = $$('.pj-card');
    tabs.forEach(function (t) {
      var cat = t.getAttribute('data-cat');
      var n = cat === 'all' ? cards.length : cards.filter(function (c) { return (c.getAttribute('data-cat') || '').split(' ').indexOf(cat) > -1; }).length;
      var cnt = t.querySelector('span');
      if (cnt) cnt.textContent = n;
      t.addEventListener('click', function () {
        tabs.forEach(function (x) { x.classList.toggle('active', x === t); x.setAttribute('aria-selected', x === t ? 'true' : 'false'); });
        cards.forEach(function (c) {
          var show = cat === 'all' || (c.getAttribute('data-cat') || '').split(' ').indexOf(cat) > -1;
          c.hidden = !show;
        });
      });
    });
  }

  // ---------- steppers: tabs + anything with data-on="1 3" ----------
  // <div class="pj-stepper" data-auto="3200"> ... <button data-step="1"> ... <p data-cap="1"> ... <x data-on="1 2">
  function initSteppers() {
    $$('.pj-stepper').forEach(function (root) {
      var tabs = $$('[data-step]', root);
      var max = tabs.length ? Math.max.apply(null, tabs.map(function (t) { return +t.getAttribute('data-step'); })) : 0;
      if (!max) return;
      var cur = 1, timer = null, userTouched = false;
      var auto = +root.getAttribute('data-auto') || 0;

      function go(n) {
        cur = n;
        tabs.forEach(function (t) {
          var on = +t.getAttribute('data-step') === n;
          t.classList.toggle('active', on);
          t.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        $$('[data-cap]', root).forEach(function (c) { c.hidden = +c.getAttribute('data-cap') !== n; });
        $$('[data-on]', root).forEach(function (el) {
          var list = el.getAttribute('data-on').split(/\s+/).map(Number);
          el.classList.toggle('is-on', list.indexOf(n) > -1);
          el.classList.toggle('is-past', list.length === 1 && list[0] < n);
        });
        root.style.setProperty('--step', n);
        root.dispatchEvent(new CustomEvent('step', { detail: n }));
      }

      tabs.forEach(function (t) {
        t.addEventListener('click', function () { userTouched = true; stop(); go(+t.getAttribute('data-step')); });
        t.addEventListener('mouseenter', function () { if (root.hasAttribute('data-hover')) { userTouched = true; stop(); go(+t.getAttribute('data-step')); } });
      });

      function start() {
        if (!auto || reduce || userTouched || timer) return;
        timer = setInterval(function () { go(cur % max + 1); }, auto);
      }
      function stop() { clearInterval(timer); timer = null; }

      if (auto && 'IntersectionObserver' in window) {
        new IntersectionObserver(function (es) {
          es.forEach(function (e) { if (e.isIntersecting) start(); else stop(); });
        }, { threshold: 0.35 }).observe(root);
      }
      root.addEventListener('mouseenter', function () { if (root.hasAttribute('data-pause')) stop(); });
      root.addEventListener('mouseleave', function () { if (root.hasAttribute('data-pause') && !userTouched) start(); });
      go(1);
    });
  }

  // ---------- before / after ----------
  function initCompare() {
    $$('.pj-compare').forEach(function (root) {
      var input = $('input', root);
      function set(v) { root.style.setProperty('--x', v + '%'); }
      input.addEventListener('input', function () { set(input.value); });
      set(input.value);
      // nudge once so people notice it moves
      if (!reduce && 'IntersectionObserver' in window) {
        var done = false;
        new IntersectionObserver(function (es, obs) {
          es.forEach(function (e) {
            if (!e.isIntersecting || done) return;
            done = true; obs.disconnect();
            var t0 = performance.now();
            (function tick(t) {
              var k = Math.min(1, (t - t0) / 1400);
              var v = 50 + Math.sin(k * Math.PI * 2) * 18 * (1 - k);
              input.value = v; set(v);
              if (k < 1) requestAnimationFrame(tick);
            })(t0);
          });
        }, { threshold: 0.6 }).observe(root);
      }
    });
  }

  function ink(hex) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55 ? 'rgba(40,30,20,.75)' : 'rgba(255,255,255,.85)';
  }

  // ---------- style picker (Makon) ----------
  function initStyles() {
    $$('.pj-styles').forEach(function (root) {
      var data;
      try { data = JSON.parse($('script[type="application/json"]', root).textContent); } catch (e) { return; }
      var list = $('.pj-styles-list', root), panel = $('.pj-styles-panel', root);
      list.innerHTML = data.map(function (s, i) {
        return '<button type="button" class="pj-style-chip" data-i="' + i + '" style="--a:' + s.palette[0] + ';--b:' + s.palette[2] + ';--c:' + s.palette[3] + '">' +
          '<span class="pj-style-dot" aria-hidden="true"></span>' + s.name + '</button>';
      }).join('');
      function show(i) {
        var s = data[i];
        $$('.pj-style-chip', list).forEach(function (c) { c.classList.toggle('active', +c.getAttribute('data-i') === i); });
        panel.innerHTML =
          '<div class="pj-palette">' + s.palette.map(function (c) { return '<span style="background:' + c + ';--t:' + ink(c) + '" title="' + c + '"><code>' + c + '</code></span>'; }).join('') + '</div>' +
          '<p class="pj-style-note"><strong>' + s.name + '</strong> · ' + s.note + '</p>' +
          '<dl class="pj-mats">' + s.mats.map(function (m) { return '<div><dt>' + m[0] + '</dt><dd>' + m[1] + '</dd></div>'; }).join('') + '</dl>';
      }
      list.addEventListener('click', function (e) {
        var b = e.target.closest('.pj-style-chip');
        if (b) show(+b.getAttribute('data-i'));
      });
      show(0);
    });
  }

  // ---------- walkway check (Makon) ----------
  function initWalkway() {
    $$('.pj-walk').forEach(function (root) {
      var input = $('input', root), out = $('.pj-walk-out', root);
      function set() {
        var cm = +input.value;
        root.style.setProperty('--gap', cm);
        var tight = cm < 60;
        root.classList.toggle('is-tight', tight);
        out.innerHTML = tight
          ? '<strong>Tight walkway (' + cm + ' cm)</strong> to coffee table: flagged on both pieces.'
          : '<strong>' + cm + ' cm</strong> clear: comfortable to walk through.';
      }
      input.addEventListener('input', set);
      set();
    });
  }

  // ---------- reading progress with section ticks ----------
  function initProgress() {
    var article = $('.pj-article');
    if (!article) return;
    var heads = $$('h2[id]', article);
    var bar = document.createElement('div');
    bar.className = 'pj-progress';
    bar.innerHTML = '<div class="pj-progress-fill"></div>' + heads.map(function (h, i) {
      return '<a class="pj-progress-tick" href="#' + h.id + '" data-i="' + i + '"><span>' + h.textContent + '</span></a>';
    }).join('');
    var header = $('header.site');
    (header || document.body).appendChild(bar);
    var fill = $('.pj-progress-fill', bar), ticks = $$('.pj-progress-tick', bar);

    function measure() {
      var top = article.getBoundingClientRect().top + window.scrollY;
      var h = article.offsetHeight - window.innerHeight * 0.6;
      ticks.forEach(function (t, i) {
        var y = heads[i].getBoundingClientRect().top + window.scrollY - top;
        var pct = Math.max(0, Math.min(100, (y / Math.max(1, h)) * 100));
        t.style.left = pct + '%';
        t.classList.toggle('end', pct > 70);
      });
      update();
      function update() {
        var p = (window.scrollY + 140 - top) / Math.max(1, h);
        p = Math.max(0, Math.min(1, p));
        fill.style.transform = 'scaleX(' + p + ')';
        var y = window.scrollY + 160;
        ticks.forEach(function (t, i) { t.classList.toggle('done', heads[i].getBoundingClientRect().top + window.scrollY <= y); });
      }
      measure.update = update;
    }
    window.addEventListener('scroll', function () { if (measure.update) measure.update(); }, { passive: true });
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
    measure();
  }

  // ---------- live shelf embed ----------
  function initShelfEmbed() {
    var el = $('[data-embed-shelf]');
    if (!el || !window.BookShelf) return;
    var info = $('[data-embed-info]');
    window.BookShelf.build(el, {
      base: el.getAttribute('data-base') || '',
      startIndex: 0,
      onChange: function (b) {
        if (info) info.innerHTML = '<strong>' + b.title + '</strong> · ' + b.author;
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initFilters();
    initSteppers();
    initCompare();
    initStyles();
    initWalkway();
    initProgress();
    initShelfEmbed();
  });
})();
