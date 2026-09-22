const navbar = document.getElementById("nav");

window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

/* ---------- carousel ---------- */

const createCarousel = (root) => {
  const track = root.querySelector('[data-track]');
  const slides = Array.from(root.querySelectorAll('[data-slide]'));
  const prevBtn = root.querySelector('[data-prev]');
  const nextBtn = root.querySelector('[data-next]');
  const dotsBox = root.querySelector('[data-dots]');
  const live = root.querySelector('[data-live]');

  if (!track || slides.length === 0) return;

  const loop = root.dataset.loop !== 'false';
  const delay = parseInt(root.dataset.autoplay, 10) || 0;
  const motionOk = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dots = [];

  let index = 0;
  let timer = null;

  /* ---------- core ---------- */
  const goTo = (target) => {
    const last = slides.length - 1;
    let wanted = target;

    if (wanted < 0) wanted = loop ? last : 0;
    if (wanted > last) wanted = loop ? 0 : last;

    index = wanted;
    track.style.transform = `translateX(${-100 * index}%)`;

    slides.forEach((slide, i) => {
      // Keep off-screen slides out of the tab order and the a11y tree.
      slide.setAttribute('aria-hidden', String(i !== index));
      slide.inert = i !== index;
    });

    dots.forEach((dot, i) => {
      dot.setAttribute('aria-selected', String(i === index));
      dot.tabIndex = i === index ? 0 : -1;
    });

    if (!loop) {
      if (prevBtn) prevBtn.disabled = index === 0;
      if (nextBtn) nextBtn.disabled = index === last;
    }

    if (live) live.textContent = `Slide ${index + 1} of ${slides.length}`;
  };

  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  /* ---------- autoplay ---------- */
  const start = () => {
    if (delay > 0 && motionOk && !timer) timer = setInterval(next, delay);
  };

  const stop = () => {
    clearInterval(timer);
    timer = null;
  };

  const restart = () => {
    stop();
    start();
  };

  /* ---------- dots ---------- */
  if (dotsBox) {
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel__dot';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => {
        goTo(i);
        restart();
      });
      dotsBox.appendChild(dot);
      dots.push(dot);
    });
  }

  /* ---------- events ---------- */
  if (nextBtn) nextBtn.addEventListener('click', () => { next(); restart(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); restart(); });

  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); restart(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); restart(); }
  });

  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);
  root.addEventListener('focusin', stop);
  root.addEventListener('focusout', (e) => {
    if (!root.contains(e.relatedTarget)) start();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });

  /* ---------- touch / swipe ---------- */
  let startX = 0;
  let dragging = false;

  root.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    startX = e.clientX;
    dragging = true;
    stop();
  });

  root.addEventListener('pointerup', (e) => {
    if (!dragging) return;
    dragging = false;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
    start();
  });

  root.addEventListener('pointercancel', () => {
    dragging = false;
    start();
  });

  goTo(0);
  start();
};

document.querySelectorAll('[data-carousel]').forEach(createCarousel);

/* ---------- reading-position indicator ---------- */

const nav = document.getElementById('nav');
const links = Array.from(document.querySelectorAll('.nav-link'));
const sections = links.map((a) => document.querySelector(a.getAttribute('href')));

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

/* ---------- modals ---------- */

document.querySelectorAll('[data-modal-target]').forEach((trigger) => {
  trigger.addEventListener('click', () => {
    const dialog = document.getElementById(trigger.dataset.modalTarget);
    if (dialog) dialog.showModal();
  });
});

document.querySelectorAll('dialog.modal').forEach((dialog) => {
  dialog.querySelectorAll('[data-modal-close]').forEach((btn) => {
    btn.addEventListener('click', () => dialog.close());
  });

  // Clicking the backdrop closes; clicking the content does not.
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
});