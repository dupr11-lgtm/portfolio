import { initLangue } from "./reglages.js";

const $ = (id) => document.getElementById(id);
const eau = $("eau"), vague = $("vague"), onde = $("onde"), entete = $("entete"), corps = $("corps"), prof = $("prof"), jauge = $("jauge");
const maxDepth = +document.body.dataset.max;

// La surface : une houle longue et des vagues plus courtes par-dessus, comme sur la mer.
// Le dessin fait deux fois le même motif de 1440 unités (chaque onde en fait un nombre entier) : il glisse sans couture
const ONDE = [], TOUR = 6.2832;
const ONDES = [[1440, 8, .4], [480, 4.6, 1.3], [288, 2.6, 2.1], [160, 1.2, .7]];
for (let x = 0; x <= 2880; x += 12) ONDE.push([x, +(36 + ONDES.reduce((y, [p, a, d]) => y + a * Math.sin(x / p * TOUR + d), 0)).toFixed(1)]);
onde.setAttribute("d", `M0 70${ONDE.map(([x, y]) => `L${x} ${y}`).join("")}L2880 70Z`);
// La longueur d'un motif à l'écran : sur téléphone aussi, les vagues gardent une taille de vraies vagues
const motif = () => Math.max(innerWidth, 900);
// L'eau avance doucement toute seule, sauf si l'ordinateur demande moins d'animations
const DERIVE = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 16;

// La page claire, copiée pour n'apparaître que sous l'eau
const clair = entete.querySelector(".titre").cloneNode(true);
clair.classList.add("clair");
clair.setAttribute("aria-hidden", "true");
clair.querySelectorAll("[id]").forEach((x) => x.removeAttribute("id"));
clair.querySelectorAll("a").forEach((a) => a.setAttribute("tabindex", "-1"));
entete.append(clair);

const PALIERS = [[0, [37, 43, 128]], [.35, [20, 26, 82]], [.7, [8, 10, 36]], [1, [3, 4, 11]]];
const teinte = (p) => {
  for (let i = 1; i < PALIERS.length; i++) {
    if (p <= PALIERS[i][0]) {
      const a = PALIERS[i - 1], b = PALIERS[i], k = (p - a[0]) / (b[0] - a[0]);
      return `rgb(${a[1].map((v, j) => Math.round(v + (b[1][j] - v) * k)).join(",")})`;
    }
  }
  return `rgb(${PALIERS[3][1].join(",")})`;
};
let vagueVue = false;
// Le haut de l'écran du téléphone (la barre de Safari) prend la couleur du fond de la page :
// une fois la vague passée au-dessus, le fond suit l'eau pour ne pas laisser de bandeau blanc
const barre = document.head.appendChild(Object.assign(document.createElement("meta"), { name: "theme-color", content: "#fff" }));
let fondPage = "#fff";
const peintFond = (c) => {
  if (c === fondPage) return;
  fondPage = c;
  document.documentElement.style.background = document.body.style.background = barre.content = c;
};
const suit = () => {
  const H = innerHeight, niveau = Math.max(0, Math.min(H + 60, scrollY * 1.3)), surface = H - niveau, M = motif();
  eau.style.transform = `translateY(${surface}px)`;
  vague.style.width = `${2 * M}px`;
  vague.style.transform = `translateX(${-((scrollY * .45 + DERIVE * performance.now() / 1000) % M)}px)`;
  vagueVue = surface > -50 && surface < H;
  const r = corps.getBoundingClientRect(), pct = Math.min(1, Math.max(0, (H * .5 - r.top) / r.height)), prof_ = Math.round(pct * maxDepth);
  const couleur = teinte(pct);
  eau.style.setProperty("--eau", couleur);
  jauge.style.setProperty("--eau", couleur);
  // Seulement quand la crête est sortie par le haut : avant, le blanc au-dessus de la vague fait partie du dessin
  peintFond(surface < -30 ? couleur : "#fff");
  // Le titre clair est découpé selon les points mêmes de la vague, pour changer de couleur pile sur la ligne d'eau
  const b = entete.getBoundingClientRect(), v = vague.getBoundingClientRect(), gauche = v.left - b.left, haut = v.top - b.top, sx = v.width / 2880, sy = v.height / 70, bas = Math.max(b.height, haut + v.height);
  clair.style.clipPath = `polygon(${ONDE.map(([x, y]) => `${(gauche + x * sx).toFixed(1)}px ${(haut + y * sy).toFixed(1)}px`).join(",")},${(gauche + v.width).toFixed(1)}px ${bas.toFixed(1)}px,${gauche.toFixed(1)}px ${bas.toFixed(1)}px)`;
  prof.textContent = prof_ ? `-${prof_} m` : "0 m";
  jauge.classList.toggle("vu", pct > 0);
  document.body.classList.toggle("fond", surface < 80);
};
// Une image par rafraîchissement de l'écran, et seulement tant que la vague est visible
let image = 0;
const boucle = () => {
  image = 0;
  suit();
  if (DERIVE && vagueVue) image = requestAnimationFrame(boucle);
};
const relance = () => { if (!image) image = requestAnimationFrame(boucle); };

// La maison s'efface quand on descend et revient dès qu'on remonte un peu
let avant = scrollY;
const maison = $("maison");
const montreMaison = () => {
  const y = scrollY;
  if (y < 80 || y < avant - 6) maison.classList.remove("cache");
  else if (y > avant + 6) maison.classList.add("cache");
  if (Math.abs(y - avant) > 6) avant = y;
};
addEventListener("scroll", () => { relance(); montreMaison(); }, { passive: true });
addEventListener("resize", relance);
boucle();
document.fonts?.ready.then(relance);
initLangue();

// Venu du projet : on y retourne par l'historique, sinon le lien suffit
const venu = new URLSearchParams(location.search).get("from") == "projet";
const retourne = (ev) => { if (venu && history.length > 1) { ev.preventDefault(); history.back(); } };
$("maison").addEventListener("click", retourne);
$("retour").addEventListener("click", retourne);
