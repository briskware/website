// Briskware — small progressive enhancements. The page works without this file.
(function () {
  var root = document.documentElement;

  // ---- Theme toggle (initial theme is set inline in <head>) ----
  var themeBtn = document.getElementById('theme-toggle');
  function savedTheme() {
    try { return localStorage.getItem('theme'); } catch (e) { return null; }
  }
  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    themeBtn.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }
  applyTheme(root.getAttribute('data-theme') || 'light');
  themeBtn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });
  // Follow OS changes until the visitor picks a theme themselves.
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var onChange = function (e) { if (!savedTheme()) applyTheme(e.matches ? 'dark' : 'light'); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  // ---- Mobile menu ----
  var nav = document.getElementById('site-nav');
  var menuBtn = document.getElementById('menu-toggle');
  function setMenu(open) {
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  menuBtn.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  // ---- Header border once the page scrolls ----
  var header = document.querySelector('.site-header');
  function onScroll() { header.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---- Highlight the nav link for the section in view ----
  var links = {};
  Array.prototype.forEach.call(nav.querySelectorAll('a[href^="#"]'), function (a) {
    links[a.getAttribute('href').slice(1)] = a;
  });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        Object.keys(links).forEach(function (id) { links[id].classList.remove('active'); });
        if (links[entry.target.id]) links[entry.target.id].classList.add('active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (s) { io.observe(s); });
  }

  // ---- Service and case study cards open in a shared dialog ----
  var dialog = document.getElementById('case-dialog');
  var items = document.querySelectorAll('.svc, .case');
  if (dialog && typeof dialog.showModal === 'function') {
    var art = dialog.querySelector('.cd-art');
    var title = document.getElementById('case-dialog-title');
    var eyebrow = document.getElementById('case-dialog-sector');
    var content = dialog.querySelector('.cd-content');

    var openItem = function (item) {
      var isCase = item.classList.contains('case');
      var detail = item.querySelector(isCase ? '.case-detail' : '.svc-body');
      var svg = item.querySelector(isCase ? '.case-art svg' : '.svc-art svg');
      art.innerHTML = '';
      art.appendChild(svg.cloneNode(true));
      title.textContent = item.querySelector(isCase ? '.case-title' : '.svc-title').textContent;
      eyebrow.textContent = isCase ? 'Case study · ' + item.querySelector('.sector').textContent : 'Service';
      content.innerHTML = detail.innerHTML;
      dialog.scrollTop = 0;
      if (!dialog.open) {
        root.classList.add('modal-open');
        dialog.showModal();
      }
    };

    Array.prototype.forEach.call(items, function (item) {
      item.querySelector('button').addEventListener('click', function () { openItem(item); });
    });
    dialog.querySelector('.cd-close').addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('click', function (e) {
      // "Related work" links switch the dialog to that case study.
      var link = e.target.closest('[data-case]');
      if (link) {
        var target = document.getElementById(link.getAttribute('data-case'));
        if (target) openItem(target);
        return;
      }
      // A click on the backdrop lands on the dialog element itself.
      if (e.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', function () { root.classList.remove('modal-open'); });
  } else {
    // Fallback for browsers without <dialog>: expand the details in place.
    Array.prototype.forEach.call(items, function (item) {
      item.querySelector('button').addEventListener('click', function () {
        var detail = item.querySelector('.case-detail, .svc-detail');
        detail.hidden = !detail.hidden;
      });
    });
  }

  // ---- Keep the copyright year current ----
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
