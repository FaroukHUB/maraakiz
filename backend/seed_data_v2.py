import sys
sys.path.append(".")

from app.database import SessionLocal, engine, Base
from app.models.merkez import Merkez

# Créer les tables
Base.metadata.create_all(bind=engine)

def seed_professeurs():
    db = SessionLocal()

    # Vider la table d'abord
    db.query(Merkez).delete()
    db.commit()

    professeurs = [
        {
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
            "premier_cours_gratuit": True,
            "ville": "Paris",
            "pays": "France",
            "note_moyenne": 4.9,
            "nombre_avis": 127,
            "verifie": True,
            "actif": True,
            "nouveau": False,
            "nombre_eleves": 45,
            "nombre_cours_donnes": 320
        },
        {
            "nom": "Oum Khadija",
            "email": "oum.khadija@maraakiz.com",
            "telephone": "+33 6 23 45 67 89",
            "cursus": """• Licence en langue arabe - Université de Damas (2008-2012)
• Formation pédagogique Montessori appliquée à l'arabe (2013)
• Certificat d'enseignement de l'arabe aux non-arabophones
• 10 ans d'expérience avec les femmes et enfants francophones""",
            "programme": """📖 Programme d'apprentissage de l'arabe :
• Niveau 1 : Alphabet, lecture et écriture
• Niveau 2 : Vocabulaire de base (300 mots)
• Niveau 3 : Grammaire essentielle (Nahw)
• Niveau 4 : Conversation et compréhension

🎯 Spécialisation femmes et enfants :
• Méthode adaptée aux francophones
• Cours de sciences religieuses en arabe
• Ateliers de conversation
• Préparation aux examens""",
            "livres": """📚 Manuels utilisés :
• Méthode Médine (tomes 1-3)
• L'arabe entre tes mains
• Supports visuels pour enfants
• Cahiers d'exercices personnalisés
• Fiches de vocabulaire thématique
• Ressources audio et vidéo""",
            "methodologie": """🎓 Pédagogie adaptée :
• Cours 100% en arabe (immersion progressive)
• Méthode communicative et interactive
• Jeux pédagogiques pour les enfants
• Devoirs adaptés après chaque cours
• Suivi personnalisé des progrès
• Ambiance douce et encourageante
• Groupes de niveaux homogènes""",
            "image_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&h=500&fit=crop",
            "matieres": ["arabe", "sciences"],
            "formats": ["en-ligne", "presentiel"],
            "niveaux": ["debutant", "intermediaire"],
            "langues": ["francais", "arabe"],
            "public_cible": ["femmes", "enfants"],
            "prix_min": 18.0,
            "prix_max": 25.0,
            "premier_cours_gratuit": False,
            "ville": "Lyon",
            "pays": "France",
            "note_moyenne": 5.0,
            "nombre_avis": 89,
            "verifie": True,
            "actif": True,
            "nouveau": False,
            "nombre_eleves": 38,
            "nombre_cours_donnes": 215
        },
        {
            "nom": "Ustadh Bilal Ibrahim",
            "email": "bilal.ibrahim@maraakiz.com",
            "telephone": "+33 6 34 56 78 90",
            "cursus": """• Hafidh du Coran (mémorisation complète à 16 ans)
• Licence en sciences du Coran - Université Islamique de Médine (2010-2014)
• Master en Tafsir - Université Oum Al-Qura, La Mecque (2014-2016)
• Diplôme d'enseignement de l'arabe (DELF équivalent)
• 12 ans d'expérience internationale (Arabie, France, UK)""",
            "programme": """📖 Programme complet Coran + Arabe :
• Mémorisation du Coran avec Tajwid
• Apprentissage de l'arabe coranique
• Compréhension du Tafsir
• Cours de grammaire arabe (Nahw/Sarf)

🎯 Parcours personnalisés :
• Débutant : Bases du Coran et alphabet arabe
• Intermédiaire : Mémorisation + grammaire
• Avancé : Révision complète + Tafsir
• Cours trilingues (FR/AR/EN)""",
            "livres": """📚 Références pédagogiques :
• Al-Qaida Al-Baghdadia
• Juz 'Amma commenté (Tafsir As-Sa'di)
• Matn Al-Ajrumiya (grammaire)
• Livre de Sarf (morphologie)
• Recueils de Hadiths thématiques
• Applications : Ayat, Quran Companion
• Supports vidéo personnalisés""",
            "methodologie": """🎓 Approche moderne et efficace :
• Cours interactifs avec tableau virtuel
• Correction phonétique précise
• Tests réguliers de progression
• Révisions espacées (méthode scientifique)
• Groupes WhatsApp pour entraide
• Ressources complémentaires illimitées
• Disponibilité 7j/7 pour questions
• Cours enregistrés pour révision""",
            "image_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&h=500&fit=crop",
            "matieres": ["coran", "arabe", "tajwid"],
            "formats": ["en-ligne"],
            "niveaux": ["debutant", "intermediaire", "avance"],
            "langues": ["francais", "arabe", "anglais"],
            "public_cible": ["hommes", "ados", "enfants"],
            "prix_min": 25.0,
            "prix_max": 35.0,
            "premier_cours_gratuit": True,
            "ville": "Marseille",
            "pays": "France",
            "note_moyenne": 4.8,
            "nombre_avis": 203,
            "verifie": True,
            "actif": True,
            "nouveau": True,
            "nombre_eleves": 67,
            "nombre_cours_donnes": 450
        }
    ]

    # Insérer les professeurs
    for prof_data in professeurs:
        prof = Merkez(**prof_data)
        db.add(prof)

    db.commit()
    print(f"✅ {len(professeurs)} professeurs insérés avec cursus complet !")
    db.close()

if __name__ == "__main__":
    seed_professeurs()
