(function () {
  "use strict";

  // ---- CANVAS PARTICULES ----
  const canvas = document.getElementById("particles-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let width,
      height,
      particles = [];
    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      particles = [];
      const count = Math.floor((width * height) / 12000);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: Math.random() * 2 + 1,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          col: `rgba(94,176,255,${Math.random() * 0.3 + 0.1})`,
        });
      }
    }
    function draw() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.col;
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
      });
      requestAnimationFrame(draw);
    }
    window.addEventListener("resize", resize);
    resize();
    draw();
  }

  // ---- CURSEUR ----
  const cursor = document.querySelector(".custom-cursor");
  if (cursor) {
    document.addEventListener("mousemove", (e) => {
      cursor.style.left = e.clientX + "px";
      cursor.style.top = e.clientY + "px";
    });
    document
      .querySelectorAll("a, button, .btn, .card, .timeline-item, .chip")
      .forEach((el) => {
        el.addEventListener("mouseenter", () => cursor.classList.add("hover"));
        el.addEventListener("mouseleave", () =>
          cursor.classList.remove("hover"),
        );
      });
  }

  // ---- SCROLL PROGRESS & NAV ----
  const progress = document.querySelector(".scroll-progress");
  const nav = document.getElementById("mainNav");
  const backBtn = document.querySelector(".back-to-top");
  const sections = document.querySelectorAll("section[id], header[id]");
  const navLinks = document.querySelectorAll(".nav-links a");

  function updateScroll() {
    const scrolled =
      (window.scrollY /
        (document.documentElement.scrollHeight - window.innerHeight)) *
      100;
    if (progress) progress.style.width = scrolled + "%";
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 20);
    if (backBtn) backBtn.classList.toggle("visible", window.scrollY > 400);

    let current = "";
    sections.forEach((s) => {
      if (
        window.scrollY + 100 >= s.offsetTop &&
        window.scrollY + 100 < s.offsetTop + s.offsetHeight
      ) {
        current = s.getAttribute("id");
      }
    });
    navLinks.forEach((link) => {
      link.classList.toggle(
        "active",
        link.getAttribute("href").substring(1) === current,
      );
    });
  }
  window.addEventListener("scroll", updateScroll);
  updateScroll();

  if (backBtn)
    backBtn.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: "smooth" }),
    );

  // ---- FADE-UP OBSERVER ----
  const fadeEls = document.querySelectorAll(".fade-up");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("visible");
      });
    },
    { threshold: 0.15 },
  );
  fadeEls.forEach((el) => observer.observe(el));

  // ---- COMPTEURS ----
  const counters = document.querySelectorAll(".counter");
  function startCounter(el) {
    if (el.dataset.animated) return;
    el.dataset.animated = true;
    const target = +el.dataset.target;
    let curr = 0;
    const inc = target / 30;
    const timer = setInterval(() => {
      curr += inc;
      if (curr >= target) {
        el.textContent = target;
        clearInterval(timer);
      } else el.textContent = Math.floor(curr);
    }, 20);
  }
  const counterObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) startCounter(e.target);
      });
    },
    { threshold: 0.3 },
  );
  counters.forEach((c) => counterObs.observe(c));

  // ---- MENU MOBILE ----
  const toggle = document.querySelector(".mobile-menu-toggle");
  const menu = document.querySelector(".nav-links");
  if (toggle) {
    toggle.addEventListener("click", () => {
      menu.classList.toggle("active");
      toggle.innerHTML = menu.classList.contains("active")
        ? '<i class="fas fa-times"></i>'
        : '<i class="fas fa-bars"></i>';
    });
  }
  navLinks.forEach((l) =>
    l.addEventListener("click", () => {
      menu.classList.remove("active");
      if (toggle) toggle.innerHTML = '<i class="fas fa-bars"></i>';
    }),
  );

  // ---- MACHINE À ÉCRIRE SIMPLE (optionnel) ----
  // déjà en place via le texte statique, mais on peut ajouter un effet au survol
})();
