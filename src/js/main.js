const navbar = document.getElementById("nav");

window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});


(function () {
  'use strict';

  function createCarousel(root) {
    var track  = root.querySelector('[data-track]');
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-slide]'));
    var prevBtn = root.querySelector('[data-prev]');
    var nextBtn = root.querySelector('[data-next]');
    var dotsBox = root.querySelector('[data-dots]');
    var live    = root.querySelector('[data-live]');

    if (!track || slides.length === 0) return;

    var loop  = root.dataset.loop !== 'false';
    var delay = parseInt(root.dataset.autoplay, 10) || 0;
    var index = 0;
    var timer = null;
    var dots  = [];

    /* ---------- dots ---------- */
    if (dotsBox) {
      slides.forEach(function (_, i) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'carousel__dot';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        dot.addEventListener('click', function () {
          goTo(i);
          restart();
        });
        dotsBox.appendChild(dot);
        dots.push(dot);
      });
    }

    /* ---------- core ---------- */
    function goTo(next) {
      var last = slides.length - 1;

      if (next < 0)    next = loop ? last : 0;
      if (next > last) next = loop ? 0 : last;

      index = next;
      track.style.transform = 'translateX(' + (-100 * index) + '%)';

      slides.forEach(function (slide, i) {
        // Keep off-screen slides out of the tab order and the a11y tree.
        slide.setAttribute('aria-hidden', String(i !== index));
        slide.inert = i !== index;
      });

      dots.forEach(function (dot, i) {
        dot.setAttribute('aria-selected', String(i === index));
        dot.tabIndex = i === index ? 0 : -1;
      });

      if (!loop) {
        if (prevBtn) prevBtn.disabled = index === 0;
        if (nextBtn) nextBtn.disabled = index === last;
      }

      if (live) live.textContent = 'Slide ' + (index + 1) + ' of ' + slides.length;
    }

    var next = function () { goTo(index + 1); };
    var prev = function () { goTo(index - 1); };

    /* ---------- autoplay ---------- */
    var motionOk = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function start() {
      if (delay > 0 && motionOk && !timer) timer = setInterval(next, delay);
    }
    function stop() {
      clearInterval(timer);
      timer = null;
    }
    function restart() {
      stop();
      start();
    }

    /* ---------- events ---------- */
    if (nextBtn) nextBtn.addEventListener('click', function () { next(); restart(); });
    if (prevBtn) prevBtn.addEventListener('click', function () { prev(); restart(); });

    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); next(); restart(); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); prev(); restart(); }
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    root.addEventListener('focusin', stop);
    root.addEventListener('focusout', function (e) {
      if (!root.contains(e.relatedTarget)) start();
    });

    document.addEventListener('visibilitychange', function () {
      document.hidden ? stop() : start();
    });

    /* ---------- touch / swipe ---------- */
    var startX = 0;
    var dragging = false;

    root.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      startX = e.clientX;
      dragging = true;
      stop();
    });

    root.addEventListener('pointerup', function (e) {
      if (!dragging) return;
      dragging = false;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
      start();
    });

    root.addEventListener('pointercancel', function () {
      dragging = false;
      start();
    });

    goTo(0);
    start();
  }

  document.querySelectorAll('[data-carousel]').forEach(createCarousel);
})();



const nav = document.getElementById('nav');
const links = Array.from(document.querySelectorAll('.nav-link'));
const sections = links.map(a => document.querySelector(a.getAttribute('href')));

function updateActiveLink() {
  const navBottom = nav.getBoundingClientRect().bottom;
  let activeIndex = 0;

  sections.forEach((section, i) => {
    if (!section) return;
    const rect = section.getBoundingClientRect();
    if (rect.top <= navBottom + 1) activeIndex = i;
  });

  const atBottom =
    window.innerHeight + window.scrollY >=
    document.documentElement.scrollHeight - 2;
  if (atBottom) activeIndex = links.length - 1;

  links.forEach((link, i) => link.classList.toggle('active', i === activeIndex));
}
let ticking = false;
window.addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    updateActiveLink();
    ticking = false;
  });
}, { passive: true });

window.addEventListener('resize', updateActiveLink);
updateActiveLink();