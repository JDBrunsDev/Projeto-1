/* ================================================
   LUMIÈRE ESTÉTICA AVANÇADA — script.js
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Header scroll effect ── */
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  /* ── Mobile menu ── */
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileNav.classList.toggle('open');
    document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
  });
  mobileNav?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* ── Scroll reveal ── */
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ── Animated counters ── */
  const counters = document.querySelectorAll('.stat-number[data-target]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => counterObserver.observe(c));

  function animateCounter(el) {
    const target  = +el.dataset.target;
    const suffix  = el.dataset.suffix || '';
    const prefix  = el.dataset.prefix || '';
    const duration = 1800;
    const start   = performance.now();
    const update  = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(eased * target);
      el.textContent = prefix + value.toLocaleString('pt-BR') + suffix;
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  /* ── Testimonials slider ── */
  const track  = document.querySelector('.testimonials-track');
  const slides = document.querySelectorAll('.testimonial-slide');
  const dots   = document.querySelectorAll('.t-dot');
  const btnPrev = document.querySelector('.t-prev');
  const btnNext = document.querySelector('.t-next');
  let current = 0;
  let autoTimer;

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function startAuto() { autoTimer = setInterval(() => goTo(current + 1), 5000); }
  function stopAuto()  { clearInterval(autoTimer); }

  btnPrev?.addEventListener('click', () => { stopAuto(); goTo(current - 1); startAuto(); });
  btnNext?.addEventListener('click', () => { stopAuto(); goTo(current + 1); startAuto(); });
  dots.forEach((d, i) => d.addEventListener('click', () => { stopAuto(); goTo(i); startAuto(); }));

  if (slides.length > 0) {
    goTo(0);
    startAuto();
  }

  /* Touch/swipe support for testimonials */
  let touchStartX = 0;
  track?.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track?.addEventListener('touchend', e => {
    const delta = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) {
      stopAuto();
      goTo(delta > 0 ? current + 1 : current - 1);
      startAuto();
    }
  });

  /* ── Smooth anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ── Form submit handler ── */
  const form = document.querySelector('.booking-form form');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('.form-submit');
    const original = btn.textContent;
    btn.textContent = '✓ Solicitação enviada!';
    btn.style.background = '#4CAF50';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = original;
      btn.style.background = '';
      btn.disabled = false;
      form.reset();
    }, 4000);
  });

  /* ── Floating petals parallax ── */
  const petals = document.querySelectorAll('.hero-petal');
  window.addEventListener('scroll', () => {
    const sy = window.scrollY;
    petals.forEach((p, i) => {
      const speed = 0.06 + i * 0.04;
      p.style.transform = `translateY(${sy * speed}px) rotate(${sy * 0.02}deg)`;
    });
  }, { passive: true });

  /* ── Active nav highlight ── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(a => {
          a.style.color = a.getAttribute('href') === '#' + entry.target.id
            ? 'var(--rose)' : '';
        });
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(s => sectionObserver.observe(s));

});
