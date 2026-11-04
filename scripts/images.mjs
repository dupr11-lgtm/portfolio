// Compresse les images en WebP (800, 1200, 1600 et 2400 px de large) sans toucher aux originaux.
// Une image toujours affichée à travers le filtre bleu n'a pas besoin de ses couleurs : les enlever l'allège.
// Pour tout refaire : node scripts/images.mjs --tout
// Les couvertures ont aussi un JPEG de 1200 px pour les aperçus de liens. Depuis la racine du dépôt : node scripts/images.mjs
import { mkdirSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import sharp from "sharp";

const RACINE = resolve(import.meta.dirname, "..");
const PROJETS = join(RACINE, "public/projects");
const SORTIE = join(RACINE, "public/opt");
const TAILLES = [[800, 75], [1200, 75], [1600, 78], [2400, 82]];
const TOUT = process.argv.includes("--tout");
// Mêmes coefficients que le feColorMatrix du filtre bleu
const GRIS = [[.2126, .7152, .0722], [.2126, .7152, .0722], [.2126, .7152, .0722]];
const relatif = (s) => s.replace(/^.*\/projects\//, "");
// Sans filtre (brut), ou avec un réglage appliqué couleur par couleur avant le bleu (trait, sombre) : l'image garde ses couleurs
const sansCouleur = new Set(JSON.parse(readFileSync(join(RACINE, "src/data/projets.json"), "utf8")).flatMap((p) => [p.cover, ...(p.images || [])]).filter((im) => im && !im.brut && !im.trait && !im.sombre).map((im) => relatif(im.s)));
const IMAGE = /\.(png|jpe?g)$/i;

const originaux = [[join(RACINE, "src/assets/hublot.jpg"), ""]];
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
    try { aJour = !TOUT && statSync(cible).mtimeMs >= statSync(source).mtimeMs; } catch {}
    if (!aJour) {
      let image = sharp(source).rotate().resize({ width: largeur, withoutEnlargement: true });
      if (sansCouleur.has(`${dossier}/${basename(source)}`)) image = image.recomb(GRIS);
      await image.webp({ quality, effort: 6 }).toFile(cible);
    }
    if (largeur === 1600) apres += statSync(cible).size;
  }
  if (nom.startsWith("cover")) {
    const partage = join(SORTIE, dossier, `${nom}-1200.jpg`);
    let aJour = false;
    try { aJour = statSync(partage).mtimeMs >= statSync(source).mtimeMs; } catch {}
    if (!aJour) await sharp(source).rotate().flatten({ background: "#efe9dd" }).resize({ width: 1200, withoutEnlargement: true }).jpeg({ quality: 80 }).toFile(partage);
  }
}
console.log(`${originaux.length} images : ${(avant / 1e6).toFixed(1)} Mo d'originaux, ${(apres / 1e6).toFixed(1)} Mo en 1600 px`);
