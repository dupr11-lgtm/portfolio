// Ce qui se répète d'une page à l'autre : langue, thème, préparation des clics

// Sur téléphone, les images partent en 800 px puis passent en 1200 px, assez pour l'écran, dès que cette version est téléchargée
export const TELEPHONE = "(hover:none) and (max-width:900px)";
export const surTelephone = () => matchMedia(TELEPHONE).matches;

// iOS annonce un redimensionnement à chaque fois que sa barre d'adresse bouge pendant le défilement :
// sur téléphone, seul un changement de largeur demande de tout redessiner
export const surRedimension = (dessin) => {
  const taille = () => (surTelephone() ? `${innerWidth}` : `${innerWidth}x${innerHeight}`);
  let avant = taille(), tm;
  addEventListener("resize", () => {
    clearTimeout(tm);
    tm = setTimeout(() => {
      if (taille() == avant) return;
      avant = taille();
      dessin();
    }, 200);
  });
};

// L'élément le plus proche de l'écran : c'est lui qu'on prépare en premier
const distance = (el) => {
  const r = el.getBoundingClientRect();
  return r.top > innerHeight ? r.top - innerHeight : r.bottom < 0 ? -r.bottom : 0;
};
export const plusProche = (els) => [...els].sort((a, b) => distance(a) - distance(b))[0];

// Télécharge et décode une image sans l'afficher : le changement d'image ne clignote pas
export const prets = new Set();
export const charge = (url) => {
  const im = new Image();
  im.src = url;
  return im.decode().then(() => { prets.add(url); return true; }, () => false);
};

// Ce qui défile sans qu'on s'y arrête ne mérite pas de téléchargement : l'action attend qu'un élément reste une demi-seconde bien en vue
const apresRepos = (els, action, reglage) => {
  const minuteurs = new Map();
  const vues = new IntersectionObserver((entrees) => {
    for (const { isIntersecting, intersectionRatio, target } of entrees) {
      clearTimeout(minuteurs.get(target));
      if (isIntersecting && intersectionRatio >= (reglage.threshold || 0)) minuteurs.set(target, setTimeout(() => { vues.unobserve(target); action(target); }, 500));
    }
  }, reglage);
  els.forEach((el) => vues.observe(el));
};

// Une image à la fois, la plus proche de l'écran d'abord. L'accueil ne monte que ce qu'on regarde ;
// une page de projet (toutes) prépare toutes ses images, pour que les agrandir soit immédiat
export const imagesNettes = ({ toutes = false } = {}) => {
  if (!surTelephone() || navigator.connection?.saveData || /2g|3g/.test(navigator.connection?.effectiveType || "")) return;
  // Sur un écran de 800 pixels de large ou moins, la version légère est déjà nette
  if (innerWidth * devicePixelRatio <= 850) return;
  const file = new Set();
  let occupe = false, pret = false;
  const pose = (el, url) => {
    if (el.dataset.net) return el.style.setProperty("--carte-tel", `url(${url})`);
    el.previousElementSibling.srcset = `${url} 1200w`;
  };
  const suivante = async () => {
    if (!pret || occupe || !file.size) return;
    occupe = true;
    const el = plusProche(file);
    file.delete(el);
    const url = el.dataset.net || el.srcset.match(/([^\s,]+) 1200w/)?.[1];
    if (url && (await charge(url))) pose(el, url);
    occupe = false;
    suivante();
  };
  const elements = [...document.querySelectorAll(".im[srcset],.im[data-net]")];
  // loading="lazy" attend trop sur Safari : l'image part 1,5 écran avant d'arriver
  const proches = new IntersectionObserver((entrees) => {
    for (const { isIntersecting, target } of entrees) {
      if (!isIntersecting) continue;
      proches.unobserve(target);
      if (target.loading) target.loading = "eager";
    }
  }, { rootMargin: "150% 0px" });
  elements.forEach((el) => proches.observe(el));
  if (toutes) elements.forEach((el) => file.add(el));
  else apresRepos(elements, (el) => { file.add(el); suivante(); }, { threshold: .5 });
  const demarre = () => { pret = true; suivante(); };
  if (document.readyState == "complete") demarre();
  else addEventListener("load", demarre, { once: true });
};

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
    // Sur téléphone, la couverture du projet est la version 800 déjà vue sur la page
    if (lien.dataset.jeu && !surTelephone() && !prepares.has(lien.dataset.jeu)) {
      prepares.add(lien.dataset.jeu);
      ajoute({ rel: "preload", as: "image", imageSrcset: lien.dataset.jeu, imageSizes: lien.dataset.tailles });
    }
  };
  ["mouseover", "focusin", "touchstart"].forEach((ev) => document.addEventListener(ev, prepare, { passive: true }));
  // Sur téléphone il n'y a pas de survol, et Safari ignore prefetch : le texte et la mise en page d'un projet se préparent quand on s'arrête dessus
  if (!surTelephone()) return;
  const unePage = (href) => {
    if (prepares.has(href)) return Promise.resolve("");
    prepares.add(href);
    return fetch(href, { priority: "low" }).then((r) => r.text());
  };
  apresRepos([...document.querySelectorAll("a.it,.suite a")], (a) => {
    unePage(a.href)
      .then((html) => Promise.all((html.match(/\/_astro\/[^"]+\.css/g) || []).map((css) => unePage(new URL(css, location.href).href))))
      .catch(() => {});
  }, { rootMargin: "-40% 0px -40% 0px" });
};

// Redessine une fois les polices arrivées, seulement si elles ont changé la mise en page :
// on compare la taille de la page et de chaque ligne des textes que les courbes contournent
export const apresPolices = (dessin, textes) => {
  if (document.fonts?.status != "loading") return;
  const empreinte = () => {
    let s = innerWidth + "," + document.documentElement.scrollHeight;
    document.querySelectorAll(textes).forEach((el) => {
      const g = document.createRange();
      g.selectNodeContents(el);
      for (const q of g.getClientRects()) s += `|${Math.round(q.width)},${Math.round(q.height)}`;
    });
    return s;
  };
  const avant = empreinte();
  document.fonts.ready.then(() => (window.requestIdleCallback || setTimeout)(() => { if (empreinte() != avant) dessin(); }));
};
