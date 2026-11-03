// Compresse les images en WebP (800, 1600 et 2400 px de large) sans toucher aux originaux.
// Depuis la racine du dépôt : node maquettes/outils/images.mjs
import { mkdirSync, readdirSync, statSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import sharp from "sharp";

const MAQUETTES = resolve(import.meta.dirname, "..");
const PROJETS = resolve(MAQUETTES, "../public/projects");
const SORTIE = join(MAQUETTES, "media/opt");
const TAILLES = [[800, 75], [1600, 78], [2400, 82]];
const IMAGE = /\.(png|jpe?g)$/i;

const originaux = [[join(MAQUETTES, "media/hublot.jpg"), ""]];
for (const dossier of readdirSync(PROJETS)) {
  if (!statSync(join(PROJETS, dossier)).isDirectory()) continue;
  for (const f of readdirSync(join(PROJETS, dossier))) if (IMAGE.test(f)) originaux.push([join(PROJETS, dossier, f), dossier]);
}

let avant = 0, apres = 0;
for (const [source, dossier] of originaux) {
  avant += statSync(source).size;
  const nom = basename(source).replace(IMAGE, "");
  for (const [largeur, quality] of TAILLES) {
    const cible = join(SORTIE, dossier, `${nom}-${largeur}.webp`);
    mkdirSync(dirname(cible), { recursive: true });
    let aJour = false;
    try { aJour = statSync(cible).mtimeMs >= statSync(source).mtimeMs; } catch {}
    if (!aJour) await sharp(source).rotate().resize({ width: largeur, withoutEnlargement: true }).webp({ quality }).toFile(cible);
    if (largeur === 1600) apres += statSync(cible).size;
  }
}
console.log(`${originaux.length} images : ${(avant / 1e6).toFixed(1)} Mo d'originaux, ${(apres / 1e6).toFixed(1)} Mo en 1600 px`);
