(() => {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector("#site-nav");
  const tabs = [...document.querySelectorAll(".board__tab")];
  const panels = {
    hanassa: document.querySelector("#panel-hanassa"),
    takeaway: document.querySelector("#panel-takeaway"),
  };
  const form = document.querySelector("#booking-form");
  const status = document.querySelector("#booking-status");

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

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      status.textContent = "Täytä pakolliset kentät.";
      return;
    }
    status.textContent = "Kiitos. Tämä on konseptilomake, oikeassa sivussa viesti menisi baarille.";
    form.reset();
  });

  // Keep header reference used for possible future scrolled state without lint noise
  void header;
})();
