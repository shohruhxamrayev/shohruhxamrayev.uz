document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.querySelector('nav.primary');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', function () {
    nav.classList.toggle('open');
    toggle.classList.toggle('open');
  });
});
