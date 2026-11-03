// Image d'aperçu des liens partagés (WhatsApp, iMessage…) : la maison de public/favicon.svg, sans déformation, centrée sur le fond corail.
// La maison tient dans le carré central, pour survivre aux recadrages carrés des petites vignettes.
// Depuis la racine du dépôt : node scripts/apercu.mjs
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";

const RACINE = resolve(import.meta.dirname, "..");
const SORTIE = "public/social-preview-v4.png";
const [L, H, HAUTEUR] = [1200, 630, 400];

const icone = readFileSync(resolve(RACINE, "public/favicon.svg"), "utf8");
const fond = icone.match(/<rect[^>]*fill="([^"]+)"/)[1];
const maison = icone.match(/<path[^>]*>/)[0];

// Boîte englobante de la maison, d'après les points du tracé (uniquement des M et des L absolus)
const points = [...maison.match(/ d="([^"]+)"/)[1].matchAll(/(-?[\d.]+),(-?[\d.]+)/g)].map((m) => [+m[1], +m[2]]);
const xs = points.map((p) => p[0]), ys = points.map((p) => p[1]);
const [x0, y0] = [Math.min(...xs), Math.min(...ys)];
const [w, h] = [Math.max(...xs) - x0, Math.max(...ys) - y0];
const largeur = (HAUTEUR * w) / h;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${L}" height="${H}">
<rect width="${L}" height="${H}" fill="${fond}"/>
<svg x="${(L - largeur) / 2}" y="${(H - HAUTEUR) / 2}" width="${largeur}" height="${HAUTEUR}" viewBox="${x0} ${y0} ${w} ${h}" preserveAspectRatio="xMidYMid meet">${maison}</svg>
</svg>`;

await sharp(Buffer.from(svg), { density: 144 }).resize(L, H).png({ compressionLevel: 9 }).toFile(resolve(RACINE, SORTIE));
console.log(`${SORTIE} : ${L}×${H}, maison ${Math.round(largeur)}×${HAUTEUR}`);
