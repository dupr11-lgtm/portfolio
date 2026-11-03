# Transforme les textes et images du site en données bilingues : src/data/projets.json, lu par Astro au build.
# Depuis la racine du dépôt : python3 scripts/projets.py (nécessite Pillow)
import glob, json, os, re
from PIL import Image
RS = "src/content/posts/"; RE = "src/content/postsEn/"; RP = "public/projects/"
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
SRC = "../public/projects/"  # préfixe conservé dans les données
# (n° du projet, fichier, dossier d'images, nom court fr, nom court en, phrase fr, phrase en)
L = [
 (0, "Entre deux corps.mdx", "entre-deux-corps", "Entre deux corps", "Between two bodies", "La vallée est traversée, jamais habitée.", "The valley is crossed, never inhabited."),
 (1, "Nakagin Capsule.mdx", "nakagin-capsule", "Nakagin Capsule", "Nakagin Capsule", "Travailler la lumière comme matière.", "Working with light as a material."),
 (2, "Podcast.mdx", "Podcast", "Podcast", "Podcast", "Pas de plan, pas de maquette, juste la voix.", "No plans, no models, just the voice."),
 (5, "Centre de recherches.mdx", "centre-de-recherches", "Centre de recherches", "Research centre", "Construire avec l'instabilité.", "Building with instability."),
 (3, "Structure bois.mdx", "structure-bois", "Structure bois", "Timber structure", "Pas un exercice de forme, mais de lecture.", "Not an exercise in form, but in reading."),
 (4, "chatel.mdx", "chatel", "Châtellerault", "Châtellerault", "Un espace qu'on traverse, mais qu'on n'habite pas.", "A space you cross, but don't inhabit."),
 (6, "Structure beton.mdx", "structure-beton", "Structure béton", "Concrete structure", "", ""),
 (7, "Festival*.mdx", "festival-structure-temporaire", "Festival", "Festival", "Transformer ce vide en chemin.", "Turning this void into a path."),
 (8, "Avenue Daumesnil.mdx", "avenue-daumesnil", "Avenue Daumesnil", "Avenue Daumesnil", "Comme un fleuve urbain.", "Like an urban river."),
 (9, "ecole SAD.mdx", "ecole-sad", "L'école, un carré", "The school, a square", "Dans une école, un carré.", "In a school, a square."),
 (10, "32 logements.mdx", "32-logements", "32 logements", "32 flats", "De la rue au jardin, le monde change.", "From the street to the garden, the world changes."),
 (11, "escargot SAD.mdx", "escargot-sad", "Ce que révèle le pli", "What the fold reveals", "Une toute petite maison.", "A very small house."),
 (12, "stage chantier.mdx", "stage-chantier", "Stage ouvrier", "Worker placement", "Le chantier impose son rythme.", "The construction site sets the pace."),
 (13, "ivresse.mdx", "ivresse", "Ivresse des profondeurs", "Dizziness of the depths", "Pas comme excès. Comme déformation.", "Not as excess. As distortion."),
]

def lire(base, f):
    t = open(glob.glob(base + f)[0], encoding="utf8").read()
    _, front, corps = t.split("---\n", 2)
    titre = re.search(r'^title: "(.*)"', front, re.M).group(1)
    desc = re.search(r'^description: "(.*)"', front, re.M).group(1).rstrip(".")
    an, _, meta = desc.partition(" - ")
    secs = []
    for bloc in re.split(r"^## ", corps, flags=re.M)[1:]:
        h, _, reste = bloc.partition("\n")
        secs.append({"h": h.strip(), "l": [re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", x).strip() for x in reste.splitlines() if x.strip()]})
    return titre, an, meta, secs

def info(d, x):
    im = Image.open(RP + d + ".mdx/" + x); w, h = im.size
    libre = im.mode == "RGBA" and im.getpixel((2, 2))[3] == 0
    fond = im.convert("RGBA"); blanc = Image.new("RGBA", fond.size, "white"); blanc.alpha_composite(fond)
    clair = sum(blanc.convert("L").resize((64, 64)).get_flattened_data()) / (64 * 64 * 255)
    return {"s": SRC + d + ".mdx/" + x, "w": w, "h": h, "trait": clair > .8 and not libre, "sombre": clair < .3, "libre": libre}

out = []
for n, (i, f, d, cfr, cen, nfr, nen) in enumerate(L):
    tf, an, mf, sf = lire(RS, f)
    te, _, me, se = lire(RE, f)
    fichiers = sorted(x for x in os.listdir(RP + d + ".mdx") if x.lower().endswith((".png", ".jpg", ".jpeg")))
    cover = "cover2.jpeg" if d == "nakagin-capsule" else next((x for x in fichiers if x.startswith("cover.")), None)
    exclus = {cover, "cover.jpg" if d == "nakagin-capsule" else "", "profil.png"}
    images = [info(d, x) for x in sorted(fichiers, key=lambda v: (len(v), v)) if x not in exclus]
    couv = info(d, cover) if cover else None
    if d == "nakagin-capsule":
        # La tour est détourée : elle flotte, sans cadre. Le hublot est recadré à part.
        couv = info(d, "2.png"); couv["flotte"] = True
        images = [{"s": "media/hublot.jpg", "w": 1400, "h": 1400, "trait": False, "sombre": False, "libre": False, "rond": True}]
    out.append({"i": i, "no": f"{n+3:02d}", "an": an, "dossier": d,
                "court": {"fr": cfr, "en": cen}, "titre": {"fr": tf, "en": te}, "meta": {"fr": mf, "en": me},
                "note": {"fr": nfr, "en": nen}, "cover": couv, "images": images, "sections": {"fr": sf, "en": se}})

ATT_FR = "Projet en cours : le texte arrive bientôt."; ATT_EN = "Work in progress: the text is coming soon."
enc = lambda i, no, cfr, cen, mfr, men, d: {"i": i, "no": no, "an": "2026", "dossier": d, "encours": True,
    "court": {"fr": cfr, "en": cen}, "titre": {"fr": cfr, "en": cen}, "meta": {"fr": mfr, "en": men}, "note": {"fr": "", "en": ""},
    "cover": None, "images": [], "sections": {"fr": [{"h": "L'idée", "l": [ATT_FR]}], "en": [{"h": "The idea", "l": [ATT_EN]}]}}
# ACT est en cours : à chaque mise à jour, changer la date ici. Le lien de la boîte n'est écrit qu'à cet endroit.
ACT_LIEN = "https://boite-act.cloudflare-pentagon035.workers.dev/"
ACT_ETAT = {"fr": "En cours - dernière mise à jour le 3 novembre 2026 - fin prévue en janvier 2027",
            "en": "In progress - last updated on 3 November 2026 - due to finish in January 2027"}
act = enc(15, "02", "ACT", "ACT", "Projet interactif - Master - ULB", "Interactive project - Master's - ULB", "act")
act.update({"lien": ACT_LIEN, "etat": ACT_ETAT, "etiquette": "Comment la ville fragmente-t-elle le maillage brun de la Woluwe\u00a0?", "sections": {
    "fr": [{"h": "Contexte", "l": ["Le texte arrive bientôt."]}, {"h": "Carnet de recherche", "l": ["Le texte arrive bientôt."]}],
    "en": [{"h": "Context", "l": ["The text is coming soon."]}, {"h": "Research notebook", "l": ["The text is coming soon."]}]}})
out = [enc(14, "01", "Cinéma", "Cinema", "Master - ULB", "Master's - ULB", "cinema"), act] + out

with open("src/data/projets.json", "w", encoding="utf8") as sortie:
    json.dump(out, sortie, ensure_ascii=False, indent=1)
    sortie.write("\n")
print(len(out), [len(p["sections"]["en"]) - len(p["sections"]["fr"]) for p in out])
