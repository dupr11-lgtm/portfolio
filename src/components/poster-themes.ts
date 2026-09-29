// Couleurs des cartes-affiches : fond, texte, étoile, et bichromie de la photo (ombres → lumières)
export const posterThemes = [
    { name: "acid", bg: "#EDE12A", fg: "#2336FF", burst: "#FF3D1F", dark: "#2336FF", light: "#EDE12A" },
    { name: "violet", bg: "#8B5CFF", fg: "#111111", burst: "#EDE12A", dark: "#1A22D9", light: "#D5C6FF" },
    { name: "red", bg: "#E8321E", fg: "#111111", burst: "#FF8AD8", dark: "#111111", light: "#FF8AD8" },
    { name: "blue", bg: "#2336FF", fg: "#FF8AD8", burst: "#B8D430", dark: "#0B0A3A", light: "#9C7BFF" },
    { name: "lime", bg: "#B8D430", fg: "#5B1FE0", burst: "#8B5CFF", dark: "#5B1FE0", light: "#C9E05A" },
    { name: "pink", bg: "#FF8AD8", fg: "#2336FF", burst: "#2336FF", dark: "#E8321E", light: "#FFC2EA" },
] as const;

export type PosterTheme = (typeof posterThemes)[number];

export const extraDuotones = [
    { name: "photo", dark: "#2336FF", light: "#FF8AD8" },
] as const;

export const duoFilter = (name: string) => `url(#duo-${name})`;
