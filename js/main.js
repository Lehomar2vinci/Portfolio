/* ============================================================
   main.js — Portfolio Lehomar2vinci
   ============================================================ */

'use strict';

// ── Year in footer ──────────────────────────────────────────
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ── Sticky header shadow ────────────────────────────────────
const header = document.getElementById('site-header');
if (header) {
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ── Mobile nav toggle ───────────────────────────────────────
const navToggle = document.getElementById('nav-toggle');
const navLinks  = document.getElementById('nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on link click (mobile)
  navLinks.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
}

// ── Active nav link on scroll ───────────────────────────────
const sections = document.querySelectorAll('section[id]');
const links    = document.querySelectorAll('.nav__link');

if (sections.length && links.length) {
  const activateLink = () => {
    const scrollY = window.scrollY + 100;
    let current = '';
    sections.forEach(section => {
      if (scrollY >= section.offsetTop) current = section.id;
    });
    links.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  };
  window.addEventListener('scroll', activateLink, { passive: true });
  activateLink();
}

// ── Reveal on scroll (Intersection Observer) ────────────────
const revealTargets = document.querySelectorAll(
  '.skill-card, .project-card, .about__grid, .contact__inner, .hero__inner'
);

revealTargets.forEach(el => el.classList.add('reveal'));

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger cards slightly
          const delay = entry.target.closest('.skills__grid, .projects__grid')
            ? i * 60
            : 0;
          setTimeout(() => entry.target.classList.add('visible'), delay);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealTargets.forEach(el => observer.observe(el));
} else {
  // Fallback: show everything
  revealTargets.forEach(el => el.classList.add('visible'));
}
