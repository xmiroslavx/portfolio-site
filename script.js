(() => {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector("#site-nav");
  const tabs = [...document.querySelectorAll(".tap-tab")];
  const panels = {
    hanassa: document.querySelector("#panel-hanassa"),
    takeaway: document.querySelector("#panel-takeaway"),
  };
  const form = document.querySelector("#booking-form");
  const status = document.querySelector("#booking-status");
  const beers = [...document.querySelectorAll(".beer-list li")];

  const onScroll = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  toggle?.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    nav?.classList.toggle("is-open", !open);
  });

  nav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      toggle?.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
    });
  });

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const panel = tab.dataset.panel;
      tabs.forEach((item) => {
        const active = item === tab;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-selected", String(active));
      });
      Object.entries(panels).forEach(([key, el]) => {
        if (!el) return;
        const active = key === panel;
        el.classList.toggle("is-active", active);
        el.hidden = !active;
      });
    });
  });

  const revealTargets = [
    ...document.querySelectorAll(
      ".story__inner, .stats, .section-head, .spaces, .whiskey__media, .whiskey__content, .tasting, .booking, .visit__info, .visit__map"
    ),
  ];
  revealTargets.forEach((el) => el.classList.add("reveal"));

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
  );

  revealTargets.forEach((el) => io.observe(el));

  const beerIo = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const index = beers.indexOf(entry.target);
        entry.target.style.transitionDelay = `${Math.max(index, 0) * 50}ms`;
        entry.target.classList.add("is-visible");
        beerIo.unobserve(entry.target);
      });
    },
    { threshold: 0.2 }
  );

  beers.forEach((beer) => beerIo.observe(beer));

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      status.textContent = "Täytä pakolliset kentät.";
      return;
    }
    status.textContent = "Kiitos! Tämä on konseptilomake — oikeassa sivussa pyyntö lähtisi baarille.";
    form.reset();
  });
})();
