# Transforme les textes et images du site en données bilingues : src/data/projets.json, lu par Astro au build.
# Depuis la racine du dépôt : python3 scripts/projets.py (nécessite Pillow)
import glob, json, os, re
from PIL import Image
RS = "src/content/posts/"; RE = "src/content/postsEn/"; RP = "public/projects/"
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
SRC = "../public/projects/"  # préfixe conservé dans les données
# (n° du projet, fichier, dossier d'images, nom court fr, nom court en, phrase fr, phrase en)
L = [
 (0, "Entre deux corps.mdx", "entre-deux-corps", "Entre deux corps", "Between two bodies", "La vallée est traversée, jamais habitée.", "The valley is passed through, never lived in."),
 (1, "Nakagin Capsule.mdx", "nakagin-capsule", "Nakagin Capsule", "Nakagin Capsule", "Travailler la lumière comme matière.", "Working with light as a material."),
 (2, "Podcast.mdx", "Podcast", "Podcast", "Podcast", "Pas de plan, pas de maquette, juste la voix.", "No plans, no models, just voice."),
 (5, "Centre de recherches.mdx", "centre-de-recherches", "Centre de recherches", "Research centre", "Construire avec l'instabilité.", "Building with instability."),
 (3, "Structure bois.mdx", "structure-bois", "Structure bois", "Timber structure", "Pas un exercice de forme, mais de lecture.", "Not an exercise in form, but in reading."),
 (4, "chatel.mdx", "chatel", "Châtellerault", "Châtellerault", "Un espace qu'on traverse, mais qu'on n'habite pas.", "A space you pass through but never stay in."),
 (6, "Structure beton.mdx", "structure-beton", "Structure béton", "Concrete structure", "", ""),
 (7, "Festival*.mdx", "festival-structure-temporaire", "Festival", "Festival", "Transformer ce vide en chemin.", "Turning this void into a path."),
 (8, "Avenue Daumesnil.mdx", "avenue-daumesnil", "Avenue Daumesnil", "Avenue Daumesnil", "Comme un fleuve urbain.", "Like an urban river."),
 (9, "ecole SAD.mdx", "ecole-sad", "L'école, un carré", "The school, a square", "Dans une école, un carré.", "In a school, a square."),
 (10, "32 logements.mdx", "32-logements", "32 logements", "32 homes", "De la rue au jardin, le monde change.", "From the street to the garden, the world changes."),
 (11, "escargot SAD.mdx", "escargot-sad", "Ce que révèle le pli", "What the fold reveals", "Une toute petite maison.", "A very small house."),
 (12, "stage chantier.mdx", "stage-chantier", "Stage ouvrier", "Site placement", "Le chantier impose son rythme.", "The site sets the pace."),
 (13, "ivresse.mdx", "ivresse", "Ivresse des profondeurs", "Rapture of the deep", "Pas comme excès. Comme déformation.", "Not as excess. As distortion."),
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

ATT_FR = "Projet en cours : le texte arrive bientôt."; ATT_EN = "Work in progress: text coming soon."
enc = lambda i, no, cfr, cen, mfr, men, d: {"i": i, "no": no, "an": "2026", "dossier": d, "encours": True,
    "court": {"fr": cfr, "en": cen}, "titre": {"fr": cfr, "en": cen}, "meta": {"fr": mfr, "en": men}, "note": {"fr": "", "en": ""},
    "cover": None, "images": [], "sections": {"fr": [{"h": "L'idée", "l": [ATT_FR]}], "en": [{"h": "The idea", "l": [ATT_EN]}]}}
# ACT est en cours : à chaque mise à jour, changer la date ici. Le lien de la boîte n'est écrit qu'à cet endroit.
ACT_LIEN = "https://boite-act.duparc.studio/"
ACT_ETAT = {"fr": "En cours - dernière mise à jour le 3 novembre 2026 - fin prévue en janvier 2027",
            "en": "In progress - last updated 3 November 2026 - due for completion in January 2027"}
act = enc(15, "02", "ACT", "ACT", "Projet interactif - Master - ULB", "Interactive project - Master’s - ULB", "act")
act.update({"lien": ACT_LIEN, "etat": ACT_ETAT, "etiquette": {"fr": "Comment la ville fragmente-t-elle le maillage brun de la Woluwe\u00a0?", "en": "How does the city fragment the Woluwe’s brown network?"}, "sections": {
    "fr": [
        {"h": "Contexte", "l": [
            "ACT est un atelier de master à La Cambre Horta (ULB), encadré par Ines Camacho, Maud De Rijck et Emilie Morales. Cette année, son thème est « Matières terrestres » : les cartographies paysagères et l’architecture, autour de la question des sols.",
            "L’énoncé nous donne un territoire : la vallée de la Woluwe, de Roodebeek à Zaventem. Il nous demande de comprendre ce qui se joue sur et sous ce sol, puis d’aboutir à une proposition d’écologie urbaine. Le travail se fait en groupe, au premier quadrimestre, en quatre actes. Il est réuni dans un manifeste graphique. Un projet d’architecture suit au deuxième quadrimestre."]},
        {"h": "Notre question", "l": [
            "À l’intérieur de ce cadre, notre groupe s’est posé sa propre question : comment la ville fragmente-t-elle le maillage brun de la Woluwe ?",
            "Le maillage brun, c’est la continuité des sols vivants. L’énoncé le cite parmi les choses à repérer. Nous en avons fait notre fil rouge, en regardant ce qui coupe le sol, y compris sous la surface : routes, métro, parkings, égouts, rivières voûtées."]},
        {"h": "Carnet de recherche", "l": [
            "Acte 1 - État des lieux. L’énoncé demande : de quels sols héritons-nous ? Nous avons arpenté le terrain, dessiné des coupes topographiques et commencé à cartographier.",
            "Acte 2 - Recherches. L’énoncé demande comment concilier le sol et le foncier dans un territoire endommagé. Nous avons travaillé par lectures, lexique et cartes : espaces verts, taux d’imperméabilisation, valeur biologique, fragmentation du sous-sol.",
            "Acte 3 - Cartographies. L’énoncé demande d’explorer la représentation des sols et des sous-sols. Nous avons repris nos cartes dans un cadre et une légende communs, jusqu’à une carte du maillage brun.",
            "Acte 4 - Stratégie territoriale. À venir.",
            "Une chose ressort déjà : le sous-sol de la vallée est plein, mais presque invisible dans les données publiques. Le réseau d’égouts n’est pas publié, et nous avons dû le deviner à partir des chambres de visite alignées sous les rues.",
            "La boîte reprend nos cartes en sept couches."]}],
    "en": [
        {"h": "Context", "l": [
            "ACT is a master’s studio at La Cambre Horta (ULB), led by Ines Camacho, Maud De Rijck and Emilie Morales. This year its theme is “Matières terrestres” (Earthly Matters): landscape mapping and architecture, centred on the question of soil.",
            "The brief gives us a territory: the Woluwe valley, from Roodebeek to Zaventem. It asks us to understand what is happening on and under this ground, and to arrive at an urban ecology proposal. The work is done in groups, in the first term, across four acts. It is gathered in a graphic manifesto. An architecture project follows in the second term."]},
        {"h": "Our question", "l": [
            "Within this framework, our group set itself its own question: how does the city fragment the Woluwe’s brown network?",
            "The brown network is the continuity of living soils. The brief lists it among the things to survey. We made it our common thread, looking at what cuts the soil, including below the surface: roads, the metro, car parks, sewers, culverted rivers."]},
        {"h": "Research notebook", "l": [
            "Act 1 - Survey. The brief asks: what soils have we inherited? We walked the site, drew topographic sections and began mapping.",
            "Act 2 - Research. The brief asks how to reconcile soil and land ownership in a damaged territory. We worked through readings, a glossary and maps: green spaces, soil sealing, biological value, underground fragmentation.",
            "Act 3 - Mapping. The brief asks us to explore ways of representing soils and subsoils. We brought our maps into a shared frame and legend, leading to a map of the brown network.",
            "Act 4 - Territorial strategy. Still to come.",
            "One thing already stands out: the valley’s underground is full, yet almost invisible in public data. The sewer network is not published, so we had to infer it from the manholes lined up under the streets.",
            "The box brings our maps together in seven layers."]}]}})
cinema = enc(14, "01", "Cinéma", "Cinema", "Master - ULB", "Master’s - ULB", "cinema")
cinema["sections"] = {
    "fr": [
        {"h": "L’exercice", "l": [
            "Ce film est réalisé avec Mia Behrens et Cliffany Del Rosario dans l’option Architecture et Cinéma de l’ULB, avec Roxane Enescu et Thomas Vilquin.",
            "Le thème général du cours est « Habiter le déplacement ». Il nous demande d’écrire puis de réaliser un film sur ce thème. Le sujet doit partir d’une expérience personnelle et rester unique. Il faut distinguer le thème, qui est une question, du message, qui est notre réponse. Nous construisons ensuite le sujet, l’intrigue et le récit dans une note d’intention."]},
        {"h": "Où on en est", "l": [
            "Le projet est en cours, et nous sommes en phase d’étude et de recherche. Le film sera publié avant janvier 2027.",
            "Notre idée de départ était de filmer Includo, le service de la STIB qui va à la rencontre des personnes sans abri dans les stations. La STIB a refusé notre demande. Nous avons envoyé d’autres demandes et nous ne savons pas encore avec qui nous tournerons."]},
        {"h": "Notre question", "l": [
            "Le film reste une réponse à la députée bruxelloise Sofia Bennani. Elle demande la suppression d’Includo, parce que selon elle ce n’est pas le rôle d’une société de transport.",
            "Nous élargissons donc la question : à qui revient le devoir de s’occuper des personnes sans abri ?",
            "Notre réponse : à plusieurs acteurs à la fois. Les associations, les pouvoirs publics, celles et ceux qui les croisent chaque jour. Aucun ne peut porter ce devoir seul."]}],
    "en": [
        {"h": "The exercise", "l": [
            "This film is made with Mia Behrens and Cliffany Del Rosario in the Architecture and Cinema option at ULB, with Roxane Enescu and Thomas Vilquin.",
            "The course’s overall theme is “Habiter le déplacement” (Inhabiting Displacement). It asks us to write and then make a film on this theme. The subject must come from personal experience and remain a single one. We have to separate the theme, which is a question, from the message, which is our answer. We then build the subject, plot and narrative in a statement of intent."]},
        {"h": "Where it stands", "l": [
            "The project is in progress, and we are in the study and research phase. The film will be published before January 2027.",
            "Our first idea was to film Includo, the STIB service that reaches out to homeless people in the stations. The STIB turned down our request. We have sent other requests and do not yet know who we will be filming with."]},
        {"h": "Our question", "l": [
            "The film remains a reply to Brussels MP Sofia Bennani. She is calling for Includo to be scrapped, because in her view this is not the job of a transport company.",
            "So we are widening the question: who has the duty to care for homeless people?",
            "Our answer: several actors at once. Organisations, public authorities, and those who pass them every day. None of them can carry this duty alone."]}]}
out = [cinema, act] + out

with open("src/data/projets.json", "w", encoding="utf8") as sortie:
    json.dump(out, sortie, ensure_ascii=False, indent=1)
    sortie.write("\n")
print(len(out), [len(p["sections"]["en"]) - len(p["sections"]["fr"]) for p in out])
