// Les formes du site : utilisées au build (disques) et dans le navigateur (contour de l'accueil)
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
