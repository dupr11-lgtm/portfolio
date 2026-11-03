import { buildSync } from "esbuild";
import { resolve } from "node:path";

// Le script d'une page, regroupé en un seul bloc et posé tel quel dans le HTML.
// Un script de module ne s'exécute qu'après le premier affichage : on verrait la page sans ses formes
// ni ses courbes, puis tout se redessiner. Posé en ligne à la fin du body, il s'exécute avant.
const deja = new Map<string, string>();

export const scriptEnLigne = (nom: string) => {
  if (!import.meta.env.DEV && deja.has(nom)) return deja.get(nom)!;
  const { outputFiles } = buildSync({
    entryPoints: [resolve("src/scripts", nom)],
    bundle: true,
    format: "iife",
    minify: true,
    target: "es2020",
    legalComments: "none",
    write: false,
  });
  const code = outputFiles[0].text.replace(/<\/script/gi, "<\\/script");
  deja.set(nom, code);
  return code;
};
