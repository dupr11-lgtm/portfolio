import { initLangue } from "./reglages.js";

const $ = (id) => document.getElementById(id);
const eau = $("eau"), vague = $("vague"), onde = $("onde"), entete = $("entete"), corps = $("corps"), prof = $("prof"), jauge = $("jauge");
const maxDepth = +document.body.dataset.max;

// La surface : une onde dont la période divise la largeur, pour qu'elle glisse sans couture
const ONDE = [];
for (let x = 0; x <= 2880; x += 20) ONDE.push([x, +(30 + 13 * Math.sin(x / 720 * 6.2832) + 5 * Math.sin(x / 360 * 6.2832 + 1.3)).toFixed(1)]);
onde.setAttribute("d", `M0 70${ONDE.map(([x, y]) => `L${x} ${y}`).join("")}L2880 70Z`);

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
const suit = () => {
  const H = innerHeight, niveau = Math.max(0, Math.min(H + 60, scrollY * 1.3)), surface = H - niveau;
  eau.style.transform = `translateY(${surface}px)`;
  vague.style.transform = `translateX(${-((scrollY * .45) % innerWidth)}px)`;
  const r = corps.getBoundingClientRect(), pct = Math.min(1, Math.max(0, (H * .5 - r.top) / r.height)), prof_ = Math.round(pct * maxDepth);
  eau.style.setProperty("--eau", teinte(pct));
  // Le titre clair est découpé selon les points mêmes de la vague, pour changer de couleur pile sur la ligne d'eau
  const b = entete.getBoundingClientRect(), v = vague.getBoundingClientRect(), gauche = v.left - b.left, haut = v.top - b.top, sx = v.width / 2880, sy = v.height / 70, bas = Math.max(b.height, haut + v.height);
  clair.style.clipPath = `polygon(${ONDE.map(([x, y]) => `${(gauche + x * sx).toFixed(1)}px ${(haut + y * sy).toFixed(1)}px`).join(",")},${(gauche + v.width).toFixed(1)}px ${bas.toFixed(1)}px,${gauche.toFixed(1)}px ${bas.toFixed(1)}px)`;
  prof.textContent = prof_ ? `-${prof_} m` : "0 m";
  jauge.classList.toggle("vu", pct > 0);
  document.body.classList.toggle("fond", surface < 80);
};
addEventListener("scroll", suit, { passive: true });
addEventListener("resize", suit);
suit();
document.fonts?.ready.then(suit);
initLangue();

// Venu du projet : on y retourne par l'historique, sinon le lien suffit
const venu = new URLSearchParams(location.search).get("from") == "projet";
const retourne = (ev) => { if (venu && history.length > 1) { ev.preventDefault(); history.back(); } };
$("maison").addEventListener("click", retourne);
$("retour").addEventListener("click", retourne);
