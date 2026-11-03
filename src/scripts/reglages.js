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

// Au survol ou au toucher, la page visée et son image se préparent : le clic est immédiat
const prepares = new Set();
export const anticipe = (lien) => {
  const prepare = () => {
    if (prepares.has(lien)) return;
    prepares.add(lien);
    const ajoute = (o) => document.head.append(Object.assign(document.createElement("link"), o));
    ajoute({ rel: "prefetch", href: lien.getAttribute("href") });
    if (lien.dataset.jeu) ajoute({ rel: "preload", as: "image", imageSrcset: lien.dataset.jeu, imageSizes: lien.dataset.tailles });
  };
  ["mouseenter", "focus", "touchstart"].forEach((ev) => lien.addEventListener(ev, prepare, { passive: true }));
};

// Redessine une fois les polices arrivées, seulement si elles ont changé la mise en page
export const apresPolices = (dessin) => {
  if (document.fonts?.status == "loading") document.fonts.ready.then(() => (window.requestIdleCallback || setTimeout)(() => dessin()));
};
