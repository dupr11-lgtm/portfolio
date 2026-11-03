# Maquettes de la nouvelle direction graphique

Brouillon, pas branché sur le site : rien ici n'est dans `src/` ni dans `public/`, donc rien n'est construit ni déployé par Astro.

## Voir les maquettes

Ouvrir `maquettes/l-nuit.html` dans un navigateur (double-clic, ou `open maquettes/l-nuit.html`). Une connexion est nécessaire pour les polices.
Les pages se répondent : accueil (`l-nuit.html`), projet (`projet.html?p=N`), livre (`livre.html`).
Les images et textes viennent du site lui-même (`public/projects`, `src/content`).

## Ce que contiennent les maquettes

- accueil avec courbes de niveau qui descendent sans fin, projets par année, profil, contact
- page projet : ouverture, étapes sur la droite, texte et images alternés, projet suivant en ligne
- lecteur du podcast, livre "14 minutes et 16 heures" en page de lecture (le bleu monte comme de l'eau)
- thème clair et sombre, FR et EN (langue du système par défaut)

## Régénérer les données

Depuis `maquettes/` : `python3 outils/projets.py` (génère `projets.js` à partir des .mdx FR et EN) et `node build-shared.mjs` (génère `commun.js`).

## À savoir

- Le basculement FR/EN n'a été vérifié que par un test automatique simple, pas encore à la main sur toutes les pages.
- Cinéma est en "coming soon" avec un texte provisoire. ACT est "en cours" : sa date de mise à jour et le lien de sa boîte se changent dans `outils/projets.py`, son texte reste à écrire. La pochette du livre manque.
- La suite prévue est de porter ces maquettes dans le site Astro.
