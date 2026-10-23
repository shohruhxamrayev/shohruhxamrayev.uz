document.addEventListener('DOMContentLoaded', function () {
  var year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
  var up = document.querySelector('[data-to-top]');
  if (up) up.addEventListener('click', function () {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });

  var toggle = document.querySelector('.menu-toggle');
  var nav = document.querySelector('nav.primary');
  if (!toggle || !nav) return;
  toggle.setAttribute('aria-expanded', 'false');
  function setOpen(on) {
    nav.classList.toggle('open', on);
    toggle.classList.toggle('open', on);
    document.body.classList.toggle('nav-open', on);
    toggle.setAttribute('aria-expanded', on ? 'true' : 'false');
  }
  toggle.addEventListener('click', function (e) { e.stopPropagation(); setOpen(!nav.classList.contains('open')); });
  document.addEventListener('click', function (e) { if (nav.classList.contains('open') && !e.target.closest('nav.primary')) setOpen(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('open')) { setOpen(false); toggle.focus(); } });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
});
