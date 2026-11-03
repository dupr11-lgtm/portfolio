// Teinte les couvertures de Cinéma, ACT et Ivresse dans les couleurs du site.
// Les sources sont dans src/assets/couvertures. Depuis la racine du dépôt : node scripts/couvertures.mjs, puis node scripts/images.mjs
import { resolve } from "node:path";
import sharp from "sharp";

const RACINE = resolve(import.meta.dirname, "..");
const lum = (r, g, b) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
const hex = (h) => [1, 3, 5].map((k) => parseInt(h.slice(k, k + 2), 16));
const palier = (a, b, x) => Math.min(1, Math.max(0, (x - a) / (b - a)));
const entre = (a, b, x) => a.map((v, k) => v + (b[k] - v) * x);
// Dégradé à travers plusieurs couleurs réparties de 0 à 1
const degrade = (couleurs, x) => {
  const p = Math.min(0.9999, Math.max(0, x)) * (couleurs.length - 1), k = Math.floor(p);
  return entre(couleurs[k], couleurs[k + 1], p - k);
};

// Lunettes : le rouge de la photo (V médian 216) devient l'orange du site ; le reste redevient un vrai noir et blanc
const ORANGE = hex("#ff6a4d");
const lunettes = (r, g, b) => {
  const grand = Math.max(r, g, b), ecart = grand - Math.min(r, g, b);
  const part = r > g && r > b ? palier(30, 110, ecart) : 0;
  const gris = lum(r, g, b) * 255, teinte = ORANGE.map((v) => Math.min(255, (v * grand) / 216));
  return entre([gris, gris, gris], teinte, part);
};

// La terre : la couleur du favicon de la boîte ACT occupe le milieu de l'image
const TERRE = [hex("#2e0f07"), hex("#8f371f"), hex("#e9c4a6")];
const terre = (r, g, b) => degrade(TERRE, palier(0.2, 0.9, lum(r, g, b)) ** 1.2);

// Le bleu : le dégradé du filtre #bleu du site, de #252b80 au papier, avec des tons moyens assombris
const EAU = [hex("#252b80"), hex("#efe9dd")];
const eau = (r, g, b) => degrade(EAU, palier(0.1, 0.95, lum(r, g, b)) ** 3);

for (const [nom, teinte] of [["cinema", lunettes], ["act", terre], ["ivresse", eau]]) {
  let image = sharp(resolve(RACINE, `src/assets/couvertures/${nom}.jpg`)).rotate().removeAlpha();
  // La source d'ACT a un fin liseré sombre sur ses bords
  if (nom == "act") image = image.extract({ left: 12, top: 12, width: 1000, height: 1000 });
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 3) {
    const [r, g, b] = teinte(data[i], data[i + 1], data[i + 2]);
    data[i] = r; data[i + 1] = g; data[i + 2] = b;
  }
  await sharp(data, { raw: info }).jpeg({ quality: 92, chromaSubsampling: "4:4:4" }).toFile(resolve(RACINE, `public/projects/${nom}.mdx/cover.jpg`));
}
