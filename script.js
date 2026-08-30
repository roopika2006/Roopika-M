(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- scroll progress / signal bar ---------- */
  const signalFill = document.querySelector(".signal-fill");
  function updateSignal(){
    const h = document.documentElement;
    const scrolled = h.scrollTop;
    const height = h.scrollHeight - h.clientHeight;
    const pct = height > 0 ? (scrolled / height) * 100 : 0;
    if (signalFill) signalFill.style.width = pct + "%";
  }
  document.addEventListener("scroll", updateSignal, { passive: true });
  updateSignal();

  /* ---------- custom cursor ---------- */
  const dot = document.querySelector(".cursor-dot");
  const ring = document.querySelector(".cursor-ring");
  if (dot && ring && !reduceMotion) {
    let mx = 0, my = 0, rx = 0, ry = 0;
    window.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + "px"; dot.style.top = my + "px";
    });
    function loop(){
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.left = rx + "px"; ring.style.top = ry + "px";
      requestAnimationFrame(loop);
    }
    loop();

    document.querySelectorAll("a, button, input, textarea").forEach((el) => {
      el.addEventListener("mouseenter", () => ring.style.transform = "translate(-50%,-50%) scale(1.7)");
      el.addEventListener("mouseleave", () => ring.style.transform = "translate(-50%,-50%) scale(1)");
    });
  }

  /* ---------- magnetic buttons ---------- */
  if (!reduceMotion) {
    document.querySelectorAll(".btn").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.35}px)`;
      });
      btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
    });
  }

  /* ---------- scroll reveal ---------- */
  const revealEls = document.querySelectorAll(".reveal-up");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ---------- section nav active state + index highlighting ---------- */
  const sections = document.querySelectorAll("main .stage[id]");
  const navLinks = document.querySelectorAll(".index-nav a");
  if ("IntersectionObserver" in window && sections.length) {
    const navIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const link = document.querySelector(`.index-nav a[href="#${entry.target.id}"]`);
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach((l) => l.classList.remove("active"));
          link.classList.add("active");
        }
      });
    }, { threshold: 0.5 });
    sections.forEach((s) => navIO.observe(s));
  }

  /* ---------- mobile menu ---------- */
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileMenu = document.getElementById("mobileMenu");
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      const open = mobileMenu.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
      mobileMenu.setAttribute("aria-hidden", open ? "false" : "true");
    });
    mobileMenu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        mobileMenu.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        mobileMenu.setAttribute("aria-hidden", "true");
      });
    });
  }

  /* ---------- back to top ---------- */
  const toTop = document.querySelector(".to-top");
  if (toTop) {
    toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- contact form (presentational) ---------- */
  const form = document.getElementById("contactForm");
  if (form) {
    const status = form.querySelector(".form-status");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        status.textContent = "Please fill in every field before sending.";
        return;
      }
      status.textContent = "Message ready — thank you. I'll reply by email shortly.";
      form.reset();
    });
  }

  /* ---------- hero constellation, built from real skill set ---------- */
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.getElementById("constellation");
  if (svg) {
    const skills = ["Python", "Java", "C", "TensorFlow", "OpenCV", "Django", "MySQL", "Power BI", "Git"];
    const W = 1000, H = 1000;
    const cx = W * 0.72, cy = H * 0.46, radius = 300;
    const nodes = skills.map((label, i) => {
      const angle = (i / skills.length) * Math.PI * 2 + 0.4;
      const r = radius * (0.62 + (i % 3) * 0.18);
      return {
        label,
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r * 0.82
      };
    });

    const frag = document.createDocumentFragment();

    // connecting lines from a central hub to each node, plus a few cross-links
    nodes.forEach((n) => {
      const line = document.createElementNS(svgNS, "line");
      line.setAttribute("x1", cx); line.setAttribute("y1", cy);
      line.setAttribute("x2", n.x); line.setAttribute("y2", n.y);
      line.setAttribute("class", "node-line");
      frag.appendChild(line);
    });
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i], b = nodes[(i + 3) % nodes.length];
      const line = document.createElementNS(svgNS, "line");
      line.setAttribute("x1", a.x); line.setAttribute("y1", a.y);
      line.setAttribute("x2", b.x); line.setAttribute("y2", b.y);
      line.setAttribute("class", "node-line");
      line.style.opacity = "0.12";
      frag.appendChild(line);
    }

    // hub
    const hub = document.createElementNS(svgNS, "circle");
    hub.setAttribute("cx", cx); hub.setAttribute("cy", cy); hub.setAttribute("r", 5);
    hub.setAttribute("class", "node-dot");
    frag.appendChild(hub);

    nodes.forEach((n, i) => {
      const dot = document.createElementNS(svgNS, "circle");
      dot.setAttribute("cx", n.x); dot.setAttribute("cy", n.y); dot.setAttribute("r", 3.4);
      dot.setAttribute("class", "node-dot");
      if (!reduceMotion) {
        dot.style.animation = `pulse-node 3.6s ease-in-out ${i * 0.25}s infinite`;
      }
      frag.appendChild(dot);

      const label = document.createElementNS(svgNS, "text");
      label.setAttribute("x", n.x + (n.x > cx ? 10 : -10));
      label.setAttribute("y", n.y + 4);
      label.setAttribute("text-anchor", n.x > cx ? "start" : "end");
      label.setAttribute("class", "node-label");
      label.textContent = n.label;
      frag.appendChild(label);
    });

    svg.appendChild(frag);

    // inject keyframes for node pulse since it's built at runtime
    const style = document.createElement("style");
    style.textContent = `@keyframes pulse-node{0%,100%{opacity:.55;r:3.4;}50%{opacity:1;r:5;}}`;
    document.head.appendChild(style);
  }

})();
