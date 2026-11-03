import type { Lang } from "@/data/site";

export const UI = {
  fr: {
    accueil: "Retour à l'accueil", themeG: "Thème", clair: "Thème clair", sombre: "Thème sombre", langue: "Langue",
    portfolio: "Portfolio", profil: "Profil", contact: "Contact",
    hero: "Je suis étudiante en master d'architecture à l'ULB, à Bruxelles.",
    description: "Portfolio d'Aliénor du Parc, étudiante en master d'architecture à l'ULB, à Bruxelles.",
    enbref: "En bref", formation: "Formation",
    suivant: "Projet suivant", etapes: "Étapes de la page",
    agrandir: "Agrandir l'image", fermer: "Fermer", tourner: "Tourner l'image", prec: "Image précédente", suiv: "Image suivante", loupe: "Image agrandie",
    lecture: "Écouter ou mettre en pause", pos: "Avancer ou reculer", pochette: "Pochette du podcast, Aliénor Knoll et Aliénor du Parc",
    lire: "Lire le récit →", lireA: "Lire 14 minutes et 16 heures",
    enCours: "En cours", ouvrir: "Ouvrir la boîte →", ouvrirA: "Ouvrir la boîte du projet ACT",
    retourProjet: "Retour au projet", recit: "Récit - Aliénor du Parc - 2021", descendre: "Descendre ↓", note: "Note d'intention", profondeur: "Profondeur",
    introuvable: "Page introuvable",
  },
  en: {
    accueil: "Back to home", themeG: "Theme", clair: "Light theme", sombre: "Dark theme", langue: "Language",
    portfolio: "Portfolio", profil: "Profile", contact: "Contact",
    hero: "I am a master's student in architecture at ULB in Brussels.",
    description: "Portfolio of Aliénor du Parc, a master's student in architecture at ULB in Brussels.",
    enbref: "In short", formation: "Education",
    suivant: "Next project", etapes: "Page steps",
    agrandir: "Enlarge image", fermer: "Close", tourner: "Rotate image", prec: "Previous image", suiv: "Next image", loupe: "Enlarged image",
    lecture: "Play or pause", pos: "Seek", pochette: "Podcast artwork, Aliénor Knoll and Aliénor du Parc",
    lire: "Read the story (in French) →", lireA: "Read 14 minutes et 16 heures",
    enCours: "In progress", ouvrir: "Open the box →", ouvrirA: "Open the ACT project box",
    retourProjet: "Back to project", recit: "Short story - Aliénor du Parc - 2021 - written in French", descendre: "Scroll down ↓", note: "Author's note", profondeur: "Depth",
    introuvable: "Page not found",
  },
} as const;

export const traduction = (lang: Lang) => (k: keyof (typeof UI)["fr"]) => UI[lang][k];

export const BREF = {
  fr: "Je suis étudiante en master d'architecture à l'ULB, à Bruxelles.<br><br>Si je ne suis pas sur Midjourney ou en train de discuter avec Claude, je suis sûrement en train d'écrire un nouvel épisode de podcast ou de préparer mon prochain marathon.",
  en: "I am a master's student in architecture at ULB in Brussels.<br><br>When I'm not on Midjourney or chatting with Claude, I'm probably writing a new podcast episode or training for my next marathon.",
};

export const FORMATION: Record<Lang, [string, string[]][]> = {
  fr: [
    ["2026 - aujourd’hui", ["Master - Faculté d’Architecture La Cambre Horta, ULB, Bruxelles"]],
    ["2022 - 2025", ["Licence - École Spéciale d'Architecture, Paris"]],
    ["Octobre 2024 - Février 2025", ["Erasmus - State Academy of Fine Arts, Stuttgart"]],
    ["2021 - 2022", ["Bachelor Design d'Espace - Immaconcept, Bordeaux"]],
    ["2020 - 2021", ["Baccalauréat - Lycée Saint-Jacques-de-Compostelle, Dax", "Spécialités Histoire-Géographie-Géopolitique-Sciences politiques, Mathématiques"]],
    ["2018 - 2020", ["Lycée Isaac de l'Étoile, Poitiers", "Seconde - Option Création Culture Design et Histoire des Arts"]],
  ],
  en: [
    ["2026 - present", ["Master's - Faculty of Architecture La Cambre Horta, ULB, Brussels"]],
    ["2022 - 2025", ["Bachelor - École Spéciale d'Architecture, Paris"]],
    ["October 2024 - February 2025", ["Erasmus - State Academy of Fine Arts, Stuttgart"]],
    ["2021 - 2022", ["Bachelor of Spatial Design - Immaconcept, Bordeaux"]],
    ["2020 - 2021", ["High school diploma - Lycée Saint-Jacques-de-Compostelle, Dax", "Specialties: History, Geography, Geopolitics, Political Science, Mathematics"]],
    ["2018 - 2020", ["Lycée Isaac de l'Étoile, Poitiers", "Sophomore year - Option: Creation, Culture, Design and Art History"]],
  ],
};
