// Ce qui se répète d'une page à l'autre : langue, thème, préparation des clics

// Changer de langue ouvre l'autre version de la page, en revenant au même endroit
export const initLangue = () => {
  document.querySelectorAll(".jour .lg").forEach((a) => a.addEventListener("click", () => {
    try { localStorage.setItem("lang", a.dataset.l); sessionStorage.setItem("lang-y", String(Math.round(scrollY))); } catch (e) {}
  }));
  try {
    const memo = sessionStorage.getItem("lang-y");
    if (memo == null) return;
    sessionStorage.removeItem("lang-y");
    history.scrollRestoration = "manual";
    const y = +memo;
    scrollTo({ top: y, behavior: "instant" });
    addEventListener("load", () => { if (Math.abs(scrollY - y) < 500) scrollTo({ top: y, behavior: "instant" }); });
  } catch (e) {}
};

export const initTheme = () => {
  const boutons = [...document.querySelectorAll(".jour button[data-t]")];
  const regle = (t) => {
    document.body.dataset.theme = t;
    boutons.forEach((b) => b.setAttribute("aria-pressed", b.dataset.t == t));
    try { localStorage.setItem("theme", t); } catch (e) {}
  };
  regle(document.body.dataset.theme || "");
  boutons.forEach((b) => (b.onclick = () => regle(b.dataset.t)));
  // Retour arrière depuis le cache : la page reprend le thème choisi entre-temps
  addEventListener("pageshow", (e) => { if (e.persisted) try { regle(localStorage.getItem("theme") || ""); } catch (x) {} });
};

// Au survol ou au toucher de n'importe quel lien du site, la page visée (et son image) se prépare : le clic est immédiat
export const anticipeLiens = () => {
  if (navigator.connection?.saveData) return;
  const prepares = new Set();
  const ajoute = (o) => document.head.append(Object.assign(document.createElement("link"), o));
  const prepare = (e) => {
    const lien = e.target.closest?.("a[href]");
    if (!lien || lien.hasAttribute("download")) return;
    const url = new URL(lien.href, location.href);
    url.hash = "";
    const ici = new URL(location.href);
    ici.hash = "";
    if (url.origin != location.origin || url.href == ici.href) return;
    if (!prepares.has(url.href)) {
      prepares.add(url.href);
      ajoute({ rel: "prefetch", href: url.href });
    }
    if (lien.dataset.jeu && !prepares.has(lien.dataset.jeu)) {
      prepares.add(lien.dataset.jeu);
      ajoute({ rel: "preload", as: "image", imageSrcset: lien.dataset.jeu, imageSizes: lien.dataset.tailles });
    }
  };
  ["mouseover", "focusin", "touchstart"].forEach((ev) => document.addEventListener(ev, prepare, { passive: true }));
};

// Redessine une fois les polices arrivées, seulement si elles ont changé la mise en page
export const apresPolices = (dessin) => {
  if (document.fonts?.status == "loading") document.fonts.ready.then(() => (window.requestIdleCallback || setTimeout)(() => dessin()));
};
