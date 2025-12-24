"""
Script pour insérer des données de test dans la base de données Maraakiz
Usage: python seed_data.py
"""
from app.database import SessionLocal
from app.models.user import User
from app.models.merkez import Merkez
from app.core.security import get_password_hash

def seed_data():
    db = SessionLocal()
    
    try:
        # Vérifier si des données existent déjà
        existing = db.query(Merkez).first()
        if existing:
            print("Des données existent déjà. Abandon.")
            return
        
        # Créer des utilisateurs et merkez de test
        users_data = [
            {"email": "prof1@maraakiz.com", "password": "password123"},
            {"email": "prof2@maraakiz.com", "password": "password123"},
            {"email": "prof3@maraakiz.com", "password": "password123"},
        ]
        
        merkez_data = [
            {
                "nom": "Institut Al-Furqan",
                "bio": "Enseignement du Coran et de la langue arabe depuis 2010",
                "email_public": "contact@alfurqan.fr",
                "type_enseignement": "coran",
                "format_cours": "groupe",
                "mode_enseignement": "en_ligne",
                "niveau": "debutant",
                "langue": "francophone",
                "public_cible": "enfants",
                "prix_min": 30,
                "prix_max": 50,
                "disponibilite_immediate": True,
                "cursus": "Méthode Nourania, Tajwid, Mémorisation",
                "adherer_credo_case": True,
                "is_approved": True,
            },
            {
                "nom": "Professeur Ahmed - Tajwid",
                "bio": "Spécialiste en tajwid avec 15 ans d'expérience",
                "email_public": "ahmed.tajwid@maraakiz.com",
                "type_enseignement": "tajwid",
                "format_cours": "individuel",
                "mode_enseignement": "en_ligne",
                "niveau": "intermediaire",
                "langue": "arabophone",
                "public_cible": "hommes",
                "prix_min": 40,
                "prix_max": 60,
                "disponibilite_immediate": True,
                "cursus": "Diplômé d'Al-Azhar",
                "adherer_credo_case": True,
                "is_approved": True,
            },
            {
                "nom": "Académie Arabiya",
                "bio": "Cours d'arabe littéraire pour tous niveaux",
                "email_public": "info@arabiya.fr",
                "type_enseignement": "arabe",
                "format_cours": "binome",
                "mode_enseignement": "en_presentiel",
                "niveau": "avance",
                "langue": "francophone",
                "public_cible": "ados",
                "prix_min": 25,
                "prix_max": 45,
                "disponibilite_immediate": False,
                "cursus": "Programme complet sur 3 ans",
                "adherer_credo_case": True,
                "is_approved": True,
            },
        ]
        
        for i, user_data in enumerate(users_data):
            # Créer l'utilisateur
            user = User(
                email=user_data["email"],
                hashed_password=get_password_hash(user_data["password"]),
                is_active=True,
            )
            db.add(user)
            db.flush()
            
            # Créer le merkez associé
            merkez = Merkez(
                owner_user_id=user.id,
                **merkez_data[i]
            )
            db.add(merkez)
        
        db.commit()
        print("✅ Données de test insérées avec succès !")
        print("\n📧 Comptes créés :")
        for user_data in users_data:
            print(f"   - {user_data['email']} / {user_data['password']}")
        
    except Exception as e:
        print(f"❌ Erreur : {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()

