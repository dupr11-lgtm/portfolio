export const languages = {
  fr: "Français",
  en: "English",
} as const;

export type Lang = keyof typeof languages;

export const defaultLang: Lang = "fr";

export const ui = {
  fr: {
    "meta.title": "Aliénor du Parc",
    "meta.description": "Portfolio d'architecture",
    "nav.profil": "Profil",
    "nav.portfolio": "Portfolio",
    "nav.contact": "Contact",
    "section.profil": "Profil",
    "section.formation": "Formation",
    "section.enBref": "En bref",
    "section.portfolio": "Portfolio",
    "section.contact": "Contact",
    "profil.photoAlt": "Photo de profil d’Aliénor",
    "contact.emailLabel": "email :",
    "hero.tagline": "Étudiante en architecture · Paris",
    "post.with": "avec",
    "post.and": "et",
    "post.coverAlt": "couverture",
    "post.podcast.playPause": "Lecture / pause",
    "post.podcast.seek": "Avancer ou reculer l'audio",
    "post.podcast.status": "Clique sur Play pour activer l'audio.",
    "post.podcast.blocked":
      "Lecture bloquée par le navigateur. Reclique sur Play.",
    "post.podcast.error":
      "Audio indisponible pour le moment. Recharge la page.",
    "post.podcast.artwork": "Miniature officielle",
    "post.lightbox.prev": "Image précédente",
    "post.lightbox.close": "Fermer",
    "post.lightbox.rotate": "Rotation 90 degrés",
    "post.lightbox.next": "Image suivante",
    "post.lightbox.image": "Image agrandie",
    "post.imageAlt": "Image",
    "livre.back": "Retour au projet",
    "livre.description": "Lecture du livre 14 minutes et 16 heures.",
  },
  en: {
    "meta.title": "Aliénor du Parc",
    "meta.description": "Architecture portfolio",
    "nav.profil": "Profile",
    "nav.portfolio": "Portfolio",
    "nav.contact": "Contact",
    "section.profil": "Profile",
    "section.formation": "Education",
    "section.enBref": "In short",
    "section.portfolio": "Portfolio",
    "section.contact": "Contact",
    "profil.photoAlt": "Profile photo of Aliénor",
    "contact.emailLabel": "email:",
    "hero.tagline": "Architecture student · Paris",
    "post.with": "with",
    "post.and": "and",
    "post.coverAlt": "cover",
    "post.podcast.playPause": "Play / pause",
    "post.podcast.seek": "Seek audio",
    "post.podcast.status": "Click Play to enable audio.",
    "post.podcast.blocked": "Playback blocked by the browser. Click Play again.",
    "post.podcast.error": "Audio is unavailable right now. Reload the page.",
    "post.podcast.artwork": "Podcast artwork",
    "post.lightbox.prev": "Previous image",
    "post.lightbox.close": "Close",
    "post.lightbox.rotate": "Rotate 90 degrees",
    "post.lightbox.next": "Next image",
    "post.lightbox.image": "Enlarged image",
    "post.imageAlt": "Image",
    "livre.back": "Back to project",
    "livre.description": "Reading of the book 14 minutes and 16 hours.",
  },
} as const;

export type UiKey = keyof (typeof ui)["fr"];

const formationFr = [
  {
    dates: "2022 - 2025",
    lines: ["Licence - École Spéciale d'Architecture, Paris"],
  },
  {
    dates: "Octobre 2024 - Février 2025",
    lines: ["Erasmus - State Academy of Fine Arts, Stuttgart"],
  },
  {
    dates: "2021 - 2022",
    lines: ["Bachelor Design d'Espace - Immaconcept, Bordeaux"],
  },
  {
    dates: "2020 - 2021",
    lines: [
      "Baccalauréat - Lycée Saint-Jacques-de-Compostelle, Dax",
      "Spécialités Histoire-Géographie-Géopolitique-Sciences politiques, Mathématiques",
    ],
  },
  {
    dates: "2018 - 2020",
    lines: [
      "Lycée Isaac de l'Étoile, Poitiers",
      "Seconde - Option Création Culture Design et Histoire des Arts",
    ],
  },
];

const formationEn = [
  {
    dates: "2022 - 2025",
    lines: ["Bachelor - École Spéciale d'Architecture, Paris"],
  },
  {
    dates: "October 2024 - February 2025",
    lines: ["Erasmus - State Academy of Fine Arts, Stuttgart"],
  },
  {
    dates: "2021 - 2022",
    lines: ["Bachelor of Spatial Design - Immaconcept, Bordeaux"],
  },
  {
    dates: "2020 - 2021",
    lines: [
      "High school diploma - Lycée Saint-Jacques-de-Compostelle, Dax",
      "Specialties: History, Geography, Geopolitics, Political Science, Mathematics",
    ],
  },
  {
    dates: "2018 - 2020",
    lines: [
      "Lycée Isaac de l'Étoile, Poitiers",
      "Sophomore year - Option: Creation, Culture, Design and Art History",
    ],
  },
];

export const formation: Record<Lang, { dates: string; lines: string[] }[]> = {
  fr: formationFr,
  en: formationEn,
};

const enBrefFr =
  "Je suis actuellement étudiante en architecture, passionnée par les nouvelles technologies et l'intelligence artificielle.<br /><br />Si je ne suis pas sur Midjourney ou en train de discuter avec ChatGPT, je suis sûrement en train d'écrire un nouvel épisode de podcast ou de préparer mon prochain marathon.";

const enBrefEn =
  "I am currently an architecture student, passionate about new technologies and artificial intelligence.<br /><br />When I'm not on Midjourney or chatting with ChatGPT, I'm probably writing a new podcast episode or training for my next marathon.";

export const enBref: Record<Lang, string> = {
  fr: enBrefFr,
  en: enBrefEn,
};

export function useTranslations(lang: Lang) {
  return (key: UiKey): string =>
    (ui[lang] as Record<string, string>)[key] ?? ui.fr[key];
}
