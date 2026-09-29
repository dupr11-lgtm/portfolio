// Couleurs des cartes-affiches : fond, texte, étoile, décalage riso (toujours différent du texte),
// et bichromie de la photo (ombres → lumières)
export const posterThemes = [
    { name: "acid", riso: "#FF3D1F", bg: "#EDE12A", fg: "#2336FF", burst: "#FF3D1F", dark: "#2336FF", light: "#EDE12A" },
    { name: "violet", riso: "#EDE12A", bg: "#8B5CFF", fg: "#111111", burst: "#EDE12A", dark: "#1A22D9", light: "#D5C6FF" },
    { name: "red", riso: "#FF8AD8", bg: "#E8321E", fg: "#111111", burst: "#FF8AD8", dark: "#111111", light: "#FF8AD8" },
    { name: "blue", riso: "#EDE12A", bg: "#2336FF", fg: "#FF8AD8", burst: "#B8D430", dark: "#0B0A3A", light: "#9C7BFF" },
    { name: "lime", riso: "#FF8AD8", bg: "#B8D430", fg: "#5B1FE0", burst: "#8B5CFF", dark: "#5B1FE0", light: "#C9E05A" },
    { name: "pink", riso: "#E8321E", bg: "#FF8AD8", fg: "#2336FF", burst: "#2336FF", dark: "#E8321E", light: "#FFC2EA" },
    { name: "black", riso: "#8B5CFF", bg: "#111111", fg: "#EDE12A", burst: "#8B5CFF", dark: "#000000", light: "#E8321E" },
] as const;

export type PosterTheme = (typeof posterThemes)[number];

// Projets dont la carte garde toujours la même couleur
const themeBySlug: Record<string, PosterTheme["name"]> = {
    "nakagin-capsule": "black",
};

export const themeForProject = (slug: string, index: number): PosterTheme =>
    posterThemes.find((theme) => theme.name === themeBySlug[slug]) ??
    posterThemes[index % posterThemes.length];

// gamma < 1 éclaircit les ombres (utile pour les photos très sombres)
export const extraDuotones = [
    { name: "photo", dark: "#2336FF", light: "#FF8AD8", gamma: 1 },
    { name: "black-post", dark: "#111111", light: "#EDE12A", gamma: 0.4 },
] as const;

// Sur les pages projet, la carte noire garde des images lisibles : noir et jaune, ombres éclaircies
export const postDuoFor = (theme: PosterTheme) => (theme.name === "black" ? "black-post" : theme.name);

export const duoFilter = (name: string) => `url(#duo-${name})`;
