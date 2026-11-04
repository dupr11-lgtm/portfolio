// Les formes du site : utilisées au build (disques) et dans le navigateur (contour de l'accueil)
import { plusProche, surTelephone } from "./reglages.js";

export const rng = (s) => () => ((s = Math.imul(s ^ (s >>> 15), 1 | s) + 0x6d2b79f5 | 0), ((s ^ (s >>> 14)) >>> 0) / 4294967296);

// Le contour : un cercle déformé par quelques harmoniques, comme un cerne ou une courbe de niveau
export const contour = (seed, wob = 0.16) => {
  const r = rng(seed), h = [2, 3, 4, 5, 7].map((n, i) => ({ n, a: wob * r() / (i + 1), p: r() * 6.28 }));
  return (t, k = 1) => 1 + h.reduce((s, x) => s + x.a * Math.sin(x.n * t + x.p + k * 0.5), 0);
};

export const ringPath = (f, cx, cy, rad, k, sx = 1, sy = 1) => {
  let d = "";
  for (let i = 0; i <= 200; i++) {
    const t = (i / 200) * 6.2832, q = rad * f(t, k);
    d += (i ? "L" : "M") + (cx + Math.cos(t) * q * sx).toFixed(1) + " " + (cy + Math.sin(t) * q * sy).toFixed(1);
  }
  return d + "Z";
};

// Papier découpé, une forme vectorielle différente à chaque graine.
// Chaque coup de ciseaux est un arc légèrement bombé, et les jonctions restent à peine marquées.
export const disque = (graine, bleu) => {
  const r = rng(101 + graine * 37), lent = [2, 3].map((k) => ({ k, a: .02 + r() * .06, p: r() * 6.28 })), nb = 17 + Math.floor(r() * 9), pts = [];
  let t = r() * 6.28;
  const pas = [];
  for (let i = 0; i < nb; i++) pas.push(.55 + r() * .9);
  const tot = pas.reduce((a, b) => a + b, 0);
  for (let i = 0; i < nb; i++) { t += pas[i] / tot * 6.28319; pts.push([t, 90 * (1 + lent.reduce((v, h) => v + h.a * Math.sin(h.k * t + h.p), 0)) + (r() - .5) * 2.4]); }
  const xy = (t, q) => [100 + Math.cos(t) * q, 100 + Math.sin(t) * q];
  let d = "";
  pts.forEach((c, i) => {
    const e = pts[(i + 1) % nb], [x, y] = xy(c[0], c[1]);
    if (!i) d += `M${x.toFixed(2)} ${y.toFixed(2)}`;
    const u = e[0] < c[0] ? e[0] + 6.28319 : e[0], [cx, cy] = xy((c[0] + u) / 2, (c[1] + e[1]) / 2 / Math.cos((u - c[0]) / 2) * (.992 + r() * .012)), [ex, ey] = xy(e[0], e[1]);
    d += `Q${cx.toFixed(2)} ${cy.toFixed(2)} ${ex.toFixed(2)} ${ey.toFixed(2)}`;
  });
  return `<svg viewBox="0 0 200 200" aria-hidden="true"><path d="${d}Z" fill="${bleu ? "var(--disc-b)" : "var(--r)"}"/></svg>`;
};

// Les courbes de niveau, découpées en bandes de hauteur fixe. Avec un seul masque flouté pour toute la page,
// le téléphone recalcule la page entière à chaque morceau d'écran à dessiner, et l'écran reste vide pendant le défilement.
const BANDE = 800, MARGE_FLOU = 16;
const chiffre = (n) => n.toFixed(1);
export const bandes = (H) => {
  const lots = Array.from({ length: Math.max(1, Math.ceil(H / BANDE)) }, () => ({ fin: "", fort: "", x: 0, y: 0, f: -1 }));
  return {
    lots,
    // Un bout de courbe va dans chaque bande qu'il touche : le bord de la bande le coupe net, la suivante reprend au même pixel
    courbe(f, ax, ay, cx, cy, bx, by) {
      const premiere = Math.max(0, Math.floor((Math.min(ay, cy, by) - 2) / BANDE));
      const derniere = Math.min(lots.length - 1, Math.floor((Math.max(ay, cy, by) + 2) / BANDE));
      for (let k = premiere; k <= derniere; k++) {
        const l = lots[k], suite = l.f == f && l.x == ax && l.y == ay;
        const d = `${suite ? "" : `M${chiffre(ax)} ${chiffre(ay)}`}Q${chiffre(cx)} ${chiffre(cy)} ${chiffre(bx)} ${chiffre(by)}`;
        if (f) l.fort += d;
        else l.fin += d;
        l.x = bx;
        l.y = by;
        l.f = f;
      }
    },
  };
};

// Chaque bande a son propre dessin et son propre masque, limité à ce qui la touche.
// Les coordonnées restent celles de la page : seul le viewBox change d'une bande à l'autre.
const dessinBande = (l, k, { W, H, trous, force, silhouette }, couleur, enPage) => {
  const Y = k * BANDE, h = Math.min(BANDE, H - Y);
  const dans = (q) => q.y < Y + h + MARGE_FLOU && q.y + q.h > Y - MARGE_FLOU;
  const marge = W > 900 ? `<rect x="${W - 260}" y="${Y}" width="260" height="${h}" fill="url(#fondu${k})"/>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg"${enPage ? ` style="position:absolute;left:0;top:${Y}px"` : ""} width="${W}" height="${h}" viewBox="0 ${Y} ${W} ${h}"><defs>
    <linearGradient id="fondu${k}" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".8"/></linearGradient>
    <filter id="flou${k}" filterUnits="userSpaceOnUse" x="0" y="${Y - MARGE_FLOU}" width="${W}" height="${h + MARGE_FLOU * 2}"><feGaussianBlur stdDeviation="4"/></filter>
    <mask id="garde${k}" maskUnits="userSpaceOnUse" x="0" y="${Y}" width="${W}" height="${h}"><rect y="${Y}" width="${W}" height="${h}" fill="#fff"/><g fill="#000" opacity="${force}" filter="url(#flou${k})">${trous.filter(dans).map((q) => q.r).join("")}</g>${marge}${silhouette && dans(silhouette) ? silhouette.r : ""}</mask></defs>
    <g fill="none" stroke-linecap="round" style="stroke:${couleur}" mask="url(#garde${k})"><path d="${l.fin}" stroke-width=".65"/><path d="${l.fort}" stroke-width="1.4"/></g></svg>`;
};

// Sur téléphone, redessiner ces courbes à chaque morceau d'écran laisse la page vide pendant le défilement, texte compris.
// Chaque bande devient donc une image fixe, préparée une seule fois avant d'arriver à l'écran et libérée quand elle s'en éloigne.
let arreteImages = () => {};
const peintEnImages = (cible, bandes, o) => {
  arreteImages();
  const dpr = devicePixelRatio, attente = new Set(), proches = new Set(), infos = new Map();
  cible.innerHTML = "";
  for (const k of bandes) {
    const Y = k * BANDE, h = Math.min(BANDE, o.H - Y), toile = document.createElement("canvas");
    toile.width = toile.height = 0;
    toile.style.cssText = `position:absolute;left:0;top:${Y}px;width:${o.W}px;height:${h}px`;
    infos.set(toile, { k, h });
    cible.append(toile);
  }
  const peint = async (toile) => {
    const { k, h } = infos.get(toile), couleur = getComputedStyle(cible).getPropertyValue("--r").trim() || "#d9452b";
    const svg = dessinBande(o.lots[k], k, o, couleur), url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" })), im = new Image();
    im.src = url;
    try {
      await im.decode();
      if (!toile.isConnected || !proches.has(toile)) return;
      toile.width = o.W * dpr;
      toile.height = h * dpr;
      toile.getContext("2d").drawImage(im, 0, 0, toile.width, toile.height);
    } catch {
      // Si l'image ne se prépare pas, la bande reste un dessin ordinaire : plus lent, mais les courbes sont là
      toile.insertAdjacentHTML("afterend", dessinBande(o.lots[k], k, o, "var(--r)", true));
      toile.remove();
    } finally {
      URL.revokeObjectURL(url);
    }
  };
  let occupe = false;
  const suite = async () => {
    if (occupe) return;
    occupe = true;
    while (attente.size) {
      const toile = plusProche(attente);
      attente.delete(toile);
      await peint(toile);
    }
    occupe = false;
  };
  const vues = new IntersectionObserver((entrees) => {
    for (const { isIntersecting, target } of entrees) {
      if (isIntersecting) {
        proches.add(target);
        if (!target.width) attente.add(target);
      } else {
        proches.delete(target);
        attente.delete(target);
        target.width = target.height = 0;
      }
    }
    suite();
  }, { rootMargin: "200% 0px" });
  infos.forEach((_, toile) => vues.observe(toile));
  // Les courbes changent de couleur avec le thème : on redessine ce qui est proche
  const theme = new MutationObserver(() => {
    proches.forEach((toile) => attente.add(toile));
    suite();
  });
  theme.observe(document.body, { attributes: true, attributeFilter: ["data-theme"] });
  arreteImages = () => {
    vues.disconnect();
    theme.disconnect();
    attente.clear();
  };
};

const apresDessin = new Set();
export const peintBandes = (cible, lots, o) => {
  const bandes = [];
  lots.forEach((l, k) => { if (k * BANDE < o.H && (l.fin || l.fort)) bandes.push(k); });
  if (surTelephone()) peintEnImages(cible, bandes, { ...o, lots });
  else cible.innerHTML = bandes.map((k) => dessinBande(lots[k], k, o, "var(--r)", true)).join("");
  apresDessin.forEach((f) => f());
};

// Sur téléphone, les lignes s'épaississent autour de ce qui passe au milieu de l'écran.
// Elles sont dessinées une fois dans une image posée au-dessus des courbes : l'apparition n'est qu'un fondu,
// fait par la carte graphique, donc sans redessiner la page pendant le défilement.
const toileGras = (lignes, W, { NIV, EPAIS }, couleur) => {
  let haut = Infinity, bas = -Infinity;
  for (const q of lignes) {
    haut = Math.min(haut, q[1], q[3]);
    bas = Math.max(bas, q[1], q[3]);
  }
  haut = Math.floor(haut - 5);
  const h = Math.ceil(bas + 5) - haut, dpr = Math.min(2, devicePixelRatio), toile = document.createElement("canvas");
  toile.width = W * dpr;
  toile.height = h * dpr;
  toile.style.cssText = `position:absolute;left:0;top:${haut}px;width:${W}px;height:${h}px;opacity:0;transition:opacity 280ms;will-change:opacity`;
  const c = toile.getContext("2d");
  c.scale(dpr, dpr);
  c.translate(0, -haut);
  c.strokeStyle = couleur;
  c.lineCap = "round";
  const seaux = new Map();
  for (const q of lignes) {
    const n = Math.max(1, Math.round(q[5] * NIV)), cle = q[4] * NIV + n;
    (seaux.get(cle) || seaux.set(cle, []).get(cle)).push(q);
  }
  for (const [cle, traits] of seaux) {
    const fort = cle > NIV;
    c.lineWidth = (fort ? 1.4 : .65) * (1 + (EPAIS - 1) * (cle - (fort ? NIV : 0)) / NIV);
    c.beginPath();
    for (const q of traits) {
      c.moveTo(q[0], q[1]);
      c.lineTo(q[2], q[3]);
    }
    c.stroke();
  }
  return toile;
};

export const grasAuDefilement = (cible, elements, lignesDe, reglage) => {
  const toiles = new Map(), actifs = new Set();
  const prepare = (el) => {
    if (toiles.has(el)) return toiles.get(el);
    const lignes = lignesDe(el);
    const toile = lignes.length ? toileGras(lignes, cible.parentElement.offsetWidth, reglage, getComputedStyle(cible).getPropertyValue("--r").trim()) : null;
    if (toile) cible.append(toile);
    toiles.set(el, toile);
    return toile;
  };
  const libere = (el) => {
    toiles.get(el)?.remove();
    toiles.delete(el);
  };
  const montre = (el) => {
    const toile = prepare(el);
    if (!toile) return;
    toile.getBoundingClientRect();
    toile.style.opacity = "1";
  };
  // Après un nouveau dessin, ou un changement de thème, tout est à refaire
  const refais = () => {
    [...toiles.keys()].forEach(libere);
    actifs.forEach(montre);
  };
  const centre = new IntersectionObserver((entrees) => {
    for (const { isIntersecting, target } of entrees) {
      if (isIntersecting) {
        actifs.add(target);
        montre(target);
      } else {
        actifs.delete(target);
        const toile = toiles.get(target);
        if (toile) toile.style.opacity = "0";
      }
    }
  }, { rootMargin: "-45% 0px -45% 0px" });
  // Préparée un écran à l'avance, libérée quand elle s'éloigne
  const pres = new IntersectionObserver((entrees) => {
    for (const { isIntersecting, target } of entrees) {
      if (isIntersecting) setTimeout(() => { if (target.isConnected) prepare(target); });
      else if (!actifs.has(target)) libere(target);
    }
  }, { rootMargin: "100% 0px" });
  elements.forEach((el) => {
    centre.observe(el);
    pres.observe(el);
  });
  apresDessin.add(refais);
  new MutationObserver(refais).observe(document.body, { attributes: true, attributeFilter: ["data-theme"] });
};
