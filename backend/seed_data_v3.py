from app.database import SessionLocal, engine, Base
from app.models.merkez import Merkez

# Créer les tables
Base.metadata.create_all(bind=engine)

# Créer une session
db = SessionLocal()

# Supprimer les données existantes
db.query(Merkez).delete()

# =====================================================
# PROFESSEURS INDIVIDUELS (3)
# =====================================================

professeurs = [
    {
        "type": "professeur",
        "nom": "Cheikh Ahmed Al-Mansouri",
        "email": "ahmed.mansouri@maraakiz.com",
        "telephone": "+33 6 12 34 56 78",
        "cursus": """• Licence en sciences islamiques - Université Al-Azhar du Caire (2005-2009)
• Master en Qiraat et Tajwid - Institut des Qiraat, Le Caire (2009-2011)
• Ijazah dans la récitation de Hafs 'an 'Assim
• 15 ans d'expérience dans l'enseignement du Coran et du Tajwid""",
        "programme": """📖 Programme de mémorisation du Coran :
• Méthode progressive adaptée à chaque niveau
• Révisions régulières selon la méthode des 7 jours
• Apprentissage des règles de Tajwid appliquées
• Compréhension du sens des versets étudiés

🎯 Objectifs pédagogiques :
• Mémorisation durable et qualitative
• Maîtrise des règles de Tajwid
• Amélioration de la prononciation
• Développement de la fluidité de lecture""",
        "livres": """📚 Supports pédagogiques :
• Al-Qaida An-Nouraniya (pour débutants)
• Tuhfat Al-Atfal (règles de Tajwid)
• Supports audio de récitateurs reconnus
• Fiches de révision personnalisées
• Application de suivi de mémorisation""",
        "methodologie": """🎓 Ma méthode d'enseignement :
• Approche individualisée selon le niveau de chaque élève
• Sessions interactives avec correction en temps réel
• Enregistrements des séances pour révision
• Suivi régulier des progrès avec rapports
• Encouragement et motivation constante
• Ambiance bienveillante et studieuse""",
        "image_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop",
        "matieres": ["coran", "tajwid"],
        "formats": ["en-ligne"],
        "niveaux": ["debutant", "intermediaire", "avance"],
        "langues": ["francais", "arabe"],
        "public_cible": ["enfants", "ados", "hommes", "femmes"],
        "prix_min": 20.0,
        "prix_max": 30.0,
        "ville": "Paris",
        "pays": "France",
        "note_moyenne": 4.9,
        "nombre_avis": 127,
        "verifie": True,
        "premier_cours_gratuit": True,
        "nombre_eleves": 45,
        "nombre_cours_donnes": 320,
        "nouveau": False
    },
    {
        "type": "professeur",
        "nom": "Oum Khadija",
        "email": "oum.khadija@maraakiz.com",
        "telephone": "+33 6 23 45 67 89",
        "cursus": """• Licence en langue arabe - Université de Médine (2008-2012)
• Diplôme en pédagogie de l'enseignement de l'arabe (2013)
• 12 ans d'expérience avec les femmes et enfants
• Formation en psychologie de l'enfant""",
        "programme": """📚 Programme d'arabe progressif :
• Alphabet et phonétique (Niveau 1)
• Grammaire de base - Nahw (Niveau 2)
• Conjugaison - Sarf (Niveau 3)
• Lecture et compréhension de textes islamiques

👩‍🏫 Spécialisation femmes et enfants :
• Méthode ludique et interactive
• Supports visuels adaptés
• Ambiance bienveillante et sécurisante""",
        "livres": """📖 Supports utilisés :
• Tome de Médine (série complète)
• L'arabe entre tes mains
• Cahiers d'écriture personnalisés
• Supports visuels et flashcards
• Applications éducatives recommandées""",
        "methodologie": """✨ Ma pédagogie :
• Approche douce et encourageante
• Sessions adaptées au rythme de chacune
• Exercices pratiques à chaque cours
• Groupes de discussion en arabe
• Suivi personnalisé et bienveillant
• Ambiance sororale et motivante""",
        "image_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=500&fit=crop",
        "matieres": ["arabe", "coran"],
        "formats": ["en-ligne"],
        "niveaux": ["debutant", "intermediaire"],
        "langues": ["francais", "arabe"],
        "public_cible": ["femmes", "enfants"],
        "prix_min": 18.0,
        "prix_max": 25.0,
        "ville": "Lyon",
        "pays": "France",
        "note_moyenne": 4.8,
        "nombre_avis": 89,
        "verifie": True,
        "premier_cours_gratuit": True,
        "nombre_eleves": 38,
        "nombre_cours_donnes": 245,
        "nouveau": False
    },
    {
        "type": "professeur",
        "nom": "Ustadh Bilal Ibrahim",
        "email": "bilal.ibrahim@maraakiz.com",
        "telephone": "+33 6 34 56 78 90",
        "cursus": """• Master en sciences islamiques - Université Islamique de Médine (2010-2015)
• Spécialisation en Tafsir et sciences coraniques
• Ijazah en lecture de Warsh
• Certification en enseignement trilingue (FR/AR/EN)
• 10 ans d'expérience internationale""",
        "programme": """🌟 Programme complet Coran + Arabe :
• Mémorisation du Coran avec Tajwid
• Apprentissage de la langue arabe littéraire
• Introduction au Tafsir (explication du Coran)
• Cours de civilisation islamique

🎯 Parcours d'excellence :
• Formation intensive pour étudiants motivés
• Préparation aux études en pays arabes
• Perfectionnement linguistique""",
        "livres": """📚 Bibliothèque pédagogique :
• Al-Ajurrumiyyah (grammaire arabe)
• Tafsir Al-Sa'di
• Oussoul at-Tafsir
• L'arabe pour francophones (série complète)
• Supports multimédias en 3 langues""",
        "methodologie": """🎯 Méthode d'excellence académique :
• Immersion linguistique progressive
• Cours structurés avec objectifs clairs
• Examens réguliers et certifications
• Mentorat personnalisé
• Groupes de niveau homogènes
• Suivi des progrès avec rapports détaillés
• Préparation aux études supérieures""",
        "image_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&h=500&fit=crop",
        "matieres": ["coran", "arabe", "tajwid", "sciences"],
        "formats": ["en-ligne"],
        "niveaux": ["intermediaire", "avance"],
        "langues": ["francais", "arabe", "anglais"],
        "public_cible": ["ados", "hommes"],
        "prix_min": 25.0,
        "prix_max": 35.0,
        "ville": "Marseille",
        "pays": "France",
        "note_moyenne": 4.95,
        "nombre_avis": 156,
        "verifie": True,
        "premier_cours_gratuit": False,
        "nombre_eleves": 62,
        "nombre_cours_donnes": 487,
        "nouveau": False
    }
]

# =====================================================
# INSTITUTS (3)
# =====================================================

instituts = [
    {
        "type": "institut",
        "nom": "Institut Al-Furqan",
        "email": "contact@alfurqan.fr",
        "telephone": "+33 1 23 45 67 89",
        "presentation_institut": """🏫 Institut Al-Furqan - 17 ans d'excellence dans l'enseignement islamique

Fondé en 2007, l'Institut Al-Furqan est devenu une référence dans l'enseignement du Coran et de la langue arabe en ligne. Notre mission : rendre l'apprentissage de l'islam accessible à tous, sans compromis sur la qualité.

✨ Pourquoi nous choisir ?
• 17 ans d'expérience et d'expertise pédagogique
• Un programme exclusif développé par nos spécialistes
• Des professeurs expérimentés et diplômés des universités islamiques
• Un suivi personnalisé et rigoureux de chaque élève
• Plus besoin de voyager pour apprendre l'arabe et le Coran efficacement

🎓 Notre vision : Former une génération de musulmans enracinés dans leur religion tout en excellant dans leurs études séculaires.""",
        "nombre_professeurs": 87,
        "nombre_secretaires": 11,
        "nombre_superviseurs": 13,
        "nombre_responsables_pedagogiques": 2,
        "nombre_gestionnaires": 2,
        "programme": """📖 NOS PROGRAMMES D'ENSEIGNEMENT

🌟 Programme Coran :
• Niveau 1 : Apprentissage de l'alphabet et des règles de base
• Niveau 2 : Tajwid appliqué et début de mémorisation
• Niveau 3 : Mémorisation intensive avec révisions programmées
• Niveau 4 : Perfectionnement et Ijazah

📚 Programme Arabe :
• Niveau débutant : Al-Qaida + Tome de Médine 1-2
• Niveau intermédiaire : Tome de Médine 3-4 + Nahw Wadih
• Niveau avancé : Al-Ajurrumiyyah + Littérature arabe
• Niveau expert : Préparation études supérieures

🎯 Programme Sciences Islamiques :
• Aqida (croyance)
• Fiqh (jurisprudence)
• Sira (biographie du Prophète ﷺ)
• Hadith et méthodologie""",
        "livres": """📚 SUPPORTS PÉDAGOGIQUES DE L'INSTITUT

📖 Livres de référence :
• Série Tome de Médine (complète)
• Al-Qaida An-Nouraniya
• Tuhfat Al-Atfal
• Al-Ajurrumiyyah
• Qawa'id al-Lughah al-'Arabiyah

💻 Ressources numériques :
• Plateforme e-learning exclusive
• Vidéothèque de cours enregistrés
• Bibliothèque numérique de 1000+ ouvrages
• Application mobile de suivi
• Exercices interactifs personnalisés

📝 Supports propriétaires :
• Cahiers de cours Al-Furqan
• Fiches de révision illustrées
• Tests et examens réguliers""",
        "methodologie": """🎓 NOTRE MÉTHODOLOGIE PÉDAGOGIQUE

👥 Approche personnalisée :
• Test de niveau initial obligatoire
• Classes de 8 élèves maximum pour une attention optimale
• Suivi individuel par un responsable pédagogique
• Rapports mensuels détaillés aux parents

📊 Système d'évaluation rigoureux :
• Examens trimestriels avec certifications
• Contrôles continus hebdomadaires
• Évaluations orales régulières
• Diplômes reconnus en fin de cursus

🔄 Méthode progressive :
• Apprentissage par paliers avec objectifs clairs
• Révisions programmées selon la courbe de l'oubli
• Pratique intensive à chaque session
• Immersion linguistique progressive

💪 Accompagnement complet :
• Séances de motivation et coaching
• Groupes d'entraide entre élèves
• Permanence pédagogique 6j/7
• Support technique disponible""",
        "image_url": "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&h=500&fit=crop",
        "matieres": ["coran", "arabe", "tajwid", "sciences"],
        "formats": ["en-ligne"],
        "niveaux": ["debutant", "intermediaire", "avance"],
        "langues": ["francais", "arabe"],
        "public_cible": ["enfants", "ados", "hommes", "femmes"],
        "prix_min": 15.0,
        "prix_max": 25.0,
        "ville": "Paris",
        "pays": "France",
        "note_moyenne": 4.85,
        "nombre_avis": 342,
        "verifie": True,
        "premier_cours_gratuit": True,
        "nombre_eleves": 1247,
        "nombre_cours_donnes": 8965,
        "nouveau": False,
        "abonnement_actif": True
    },
    {
        "type": "institut",
        "nom": "Académie Nour al-Ilm",
        "email": "info@nouralilm.com",
        "telephone": "+33 4 56 78 90 12",
        "presentation_institut": """🌟 Académie Nour al-Ilm - L'excellence accessible à tous

Depuis 12 ans, l'Académie Nour al-Ilm accompagne des milliers d'élèves dans leur apprentissage du Coran et de la langue arabe. Notre approche unique combine tradition et innovation pédagogique.

💎 Ce qui nous distingue :
• 12 ans d'expérience avec un taux de satisfaction de 98%
• Une équipe pédagogique formée et certifiée
• Des cours interactifs et dynamiques
• Une plateforme technologique de pointe
• Des tarifs accessibles pour tous les budgets

🚀 Notre mission : Démocratiser l'accès à l'enseignement islamique de qualité, partout en France et dans le monde francophone.""",
        "nombre_professeurs": 52,
        "nombre_secretaires": 7,
        "nombre_superviseurs": 8,
        "nombre_responsables_pedagogiques": 2,
        "nombre_gestionnaires": 1,
        "programme": """🎯 CURSUS ACADÉMIQUE NOUR AL-ILM

🌙 Parcours Coran (Mémorisation & Tajwid) :
• Module 1 : Juzz 'Amma + règles de base (6 mois)
• Module 2 : 5 Hizb avec Tajwid appliqué (1 an)
• Module 3 : 10 Hizb - Demi-Coran (2 ans)
• Module 4 : Coran complet + révisions (3 ans)

📝 Parcours Langue Arabe :
• Cycle 1 : Initiation (3 mois)
• Cycle 2 : Fondamentaux (6 mois)
• Cycle 3 : Perfectionnement (9 mois)
• Cycle 4 : Maîtrise (12 mois)

🕌 Parcours Sciences Islamiques :
• Fondements de la foi
• Fiqh des actes d'adoration
• Histoire islamique
• Morale et spiritualité

👨‍👩‍👧‍👦 Programme Famille :
• Cours parent-enfant
• Ateliers en groupe
• Sessions weekend intensives""",
        "livres": """📚 BIBLIOTHÈQUE PÉDAGOGIQUE

📕 Manuels principaux :
• L'arabe entre tes mains (3 tomes)
• Al-Kitab al-Asasi
• Méthode Nourania
• Mon premier livre de Tajwid
• Fiqh simplifié pour débutants

🎥 Contenus multimédias :
• Cours vidéo HD en replay illimité
• Podcasts de révision
• Application mobile Nour al-Ilm
• Jeux éducatifs islamiques
• Quiz interactifs

📋 Documents pédagogiques :
• Workbooks téléchargeables
• Fiches mémo illustrées
• Planning de révision personnalisé
• Lexique arabe-français illustré""",
        "methodologie": """✨ PÉDAGOGIE INNOVANTE ET BIENVEILLANTE

🎨 Méthode interactive :
• Cours en visioconférence en petits groupes
• Tableaux blancs interactifs
• Sessions de conversation arabe
• Ateliers pratiques hebdomadaires

📈 Suivi sur mesure :
• Entretien individuel tous les 2 mois
• Espace élève avec statistiques de progression
• Objectifs personnalisés et planification
• Feedback régulier des professeurs

👨‍👩‍👧 Accompagnement familial :
• Réunions parents-professeurs trimestrielles
• Conseils personnalisés pour la révision à la maison
• Groupes de soutien entre parents
• Ressources pour prolonger l'apprentissage

🏆 Valorisation des progrès :
• Système de badges et récompenses
• Cérémonies de remise de certificats
• Tableau d'honneur mensuel
• Concours de récitation et d'expression""",
        "image_url": "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&h=500&fit=crop",
        "matieres": ["coran", "arabe", "tajwid", "sciences"],
        "formats": ["en-ligne"],
        "niveaux": ["debutant", "intermediaire", "avance"],
        "langues": ["francais", "arabe"],
        "public_cible": ["enfants", "ados", "hommes", "femmes"],
        "prix_min": 12.0,
        "prix_max": 22.0,
        "ville": "Lyon",
        "pays": "France",
        "note_moyenne": 4.75,
        "nombre_avis": 267,
        "verifie": True,
        "premier_cours_gratuit": True,
        "nombre_eleves": 856,
        "nombre_cours_donnes": 6234,
        "nouveau": False,
        "abonnement_actif": True
    },
    {
        "type": "institut",
        "nom": "Centre Badr al-Islam",
        "email": "accueil@badralislam.fr",
        "telephone": "+33 5 67 89 01 23",
        "presentation_institut": """📿 Centre Badr al-Islam - Tradition et modernité au service de l'enseignement

Fort de 20 ans d'existence, le Centre Badr al-Islam est pionnier dans l'enseignement islamique en ligne francophone. Notre équipe d'experts combine savoir traditionnel et pédagogie moderne.

⭐ Nos atouts majeurs :
• 20 ans d'expérience et de savoir-faire
• Des programmes reconnus et certifiés
• Une équipe d'enseignants tous diplômés d'universités islamiques
• Un encadrement professionnel et humain
• Des outils technologiques à la pointe
• Plus besoin de contraintes géographiques pour étudier l'islam authentique

🎯 Notre engagement : Transmettre un savoir authentique dans le respect de la tradition prophétique.""",
        "nombre_professeurs": 63,
        "nombre_secretaires": 9,
        "nombre_superviseurs": 10,
        "nombre_responsables_pedagogiques": 2,
        "nombre_gestionnaires": 2,
        "programme": """📖 PROGRAMMES CERTIFIÉS BADR AL-ISLAM

🕋 Diplôme en Études Coraniques (3 ans) :
• Année 1 : Alphabet, Tajwid, Juzz 'Amma
• Année 2 : Qiraat, mémorisation de 10 Hizb
• Année 3 : Perfectionnement, Ijazah optionnelle
→ Diplôme reconnu avec cérémonie officielle

📚 Diplôme en Langue Arabe (2 ans) :
• Semestre 1-2 : Nahw et Sarf niveau 1
• Semestre 3-4 : Littérature et expression écrite
• Semestre 5-6 : Traduction et compréhension avancée
• Semestre 7-8 : Maîtrise et spécialisation
→ Équivalent niveau B2 européen

🎓 Cursus Sciences Islamiques (2 ans) :
• Aqida (Dogme)
• Fiqh (Jurisprudence)
• Hadith et sciences du Hadith
• Sira et histoire islamique
• Tafsir (Exégèse coranique)

🌟 Programmes spécialisés :
• Formation de professeur d'arabe
• Préparation Ijazah
• Perfectionnement pour imams""",
        "livres": """📚 BIBLIOTHÈQUE DE RÉFÉRENCE

📕 Corpus classique :
• Al-Qaida Al-Baghdadiya
• Matn Al-Jazariya
• Al-Ajurrumiyyah
• Qatar an-Nada
• Alfiyat Ibn Malik

📘 Manuels modernes :
• Arabic in Your Hands (en français)
• Grammaire arabe expliquée
• 1000 mots essentiels du Coran
• Tafsir al-Muyassar
• Recueil de Hadith thématiques

💾 Ressources digitales :
• Plateforme LMS complète
• Bibliothèque virtuelle de 2000+ ouvrages
• Logiciel de mémorisation du Coran
• Base de données de Hadith
• Dictionnaire arabe interactif

📖 Publications Badr al-Islam :
• Collection "J'apprends l'arabe" (10 livres)
• Série "Comprendre le Coran" (5 volumes)
• Guides pratiques du musulman""",
        "methodologie": """🎯 EXCELLENCE PÉDAGOGIQUE ET ENCADREMENT RIGOUREUX

📋 Processus d'admission sélectif :
• Entretien de motivation
• Test de positionnement complet
• Définition d'objectifs clairs
• Signature d'un contrat pédagogique

👨‍🏫 Enseignement de qualité :
• Professeurs titulaires de licences/masters islamiques
• Formations pédagogiques continues
• Cours en direct avec interaction maximale
• Replays disponibles 24/7
• Classes de 6 élèves maximum

📊 Évaluation et certification :
• Examens semestriels officiels
• Contrôle continu rigoureux
• Certifications internationalement reconnues
• Possibilité de passage d'Ijazah
• Relevés de notes détaillés

🤝 Encadrement professionnel :
• Coordinateur pédagogique dédié
• Permanence administrative quotidienne
• Service d'orientation et conseil
• Médiathèque et ressources illimitées
• Communauté d'élèves active

💼 Préparation professionnelle :
• Stage pratique pour futurs enseignants
• Réseau d'anciens élèves
• Aide à l'insertion professionnelle
• Partenariats avec mosquées et écoles""",
        "image_url": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&h=500&fit=crop",
        "matieres": ["coran", "arabe", "tajwid", "sciences"],
        "formats": ["en-ligne"],
        "niveaux": ["debutant", "intermediaire", "avance"],
        "langues": ["francais", "arabe"],
        "public_cible": ["ados", "hommes", "femmes"],
        "prix_min": 18.0,
        "prix_max": 28.0,
        "ville": "Toulouse",
        "pays": "France",
        "note_moyenne": 4.9,
        "nombre_avis": 412,
        "verifie": True,
        "premier_cours_gratuit": True,
        "nombre_eleves": 1534,
        "nombre_cours_donnes": 11245,
        "nouveau": False,
        "abonnement_actif": True
    }
]

# Insérer les professeurs
for prof_data in professeurs:
    merkez = Merkez(**prof_data)
    db.add(merkez)

# Insérer les instituts
for inst_data in instituts:
    merkez = Merkez(**inst_data)
    db.add(merkez)

# Commit
db.commit()
db.close()

print(f"✅ {len(professeurs)} professeurs et {len(instituts)} instituts insérés avec succès !")
