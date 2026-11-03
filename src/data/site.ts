import couvertures from "./couvertures.json";
import projets from "./projets.json";

export type Lang = "fr" | "en";

// Les anciennes adresses restent valables : /post/podcast, /post/festival--structure-temporaire...
const SLUGS: Record<string, string> = {
  Podcast: "podcast",
  "festival-structure-temporaire": "festival--structure-temporaire",
};

// L'anglais du site est britannique : la césure et les lecteurs d'écran suivent ce code
export const codeLangue = (lang: Lang) => (lang === "en" ? "en-GB" : "fr");

export const prefixe = (lang: Lang) => (lang === "en" ? "/en" : "");
export const accueil = (lang: Lang) => prefixe(lang) || "/";

// Les images compressées par scripts/images.mjs : une version par largeur, jamais l'original
export const opt = (s: string, l: number) =>
  s.replace(/^.*\/projects\/|^media\//, "/opt/").replace(/\.\w+$/, `-${l}.webp`);
export const jeu = (s: string) => `${opt(s, 800)} 800w,${opt(s, 1600)} 1600w,${opt(s, 2400)} 2400w`;
export const VEDETTE = "(max-width:900px) 100vw,41vw";

export const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

export type Image = { s: string; w: number; h: number; trait: boolean; sombre: boolean; libre: boolean; rond?: boolean; flotte?: boolean };

export const pagesEn = (lang: Lang) =>
  (projets as any[]).map((p) => ({
    ...p,
    slug: SLUGS[p.dossier] || p.dossier,
    url: `${prefixe(lang)}/post/${SLUGS[p.dossier] || p.dossier}`,
    court: p.court[lang] as string,
    titre: p.titre[lang] as string,
    meta: p.meta[lang] as string,
    note: p.note[lang] as string,
    etat: p.etat?.[lang] as string | undefined,
    etiquette: p.etiquette?.[lang] as string | undefined,
    sections: p.sections[lang] as { h: string; l: string[] }[],
    couverture: (couvertures as (string | null)[])[p.i] || null,
  }));

export const slugs = () => pagesEn("fr").map((p) => p.slug as string);

// Le JPEG des aperçus de liens (WhatsApp, réseaux) ; sans couverture, l'image générale du site
export const partage = (couverture: string | null) =>
  couverture ? couverture.replace(/^\/projects\//, "/opt/").replace(/\.\w+$/, "-1200.jpg") : undefined;
