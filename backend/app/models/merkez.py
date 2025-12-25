from sqlalchemy import Column, Integer, String, Float, Boolean, Text, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class Merkez(Base):
    __tablename__ = "merkez"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(255), nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False)
    telephone = Column(String(50))

    # Informations professionnelles
    bio = Column(Text)
    presentation_video_url = Column(String(500))
    image_url = Column(String(500))

    # Matières enseignées (JSON array: ["coran", "arabe", "tajwid"])
    matieres = Column(JSON, default=list)

    # Format de cours (JSON array: ["en-ligne", "presentiel"])
    formats = Column(JSON, default=list)

    # Niveaux (JSON array: ["debutant", "intermediaire", "avance"])
    niveaux = Column(JSON, default=list)

    # Langues (JSON array: ["francais", "arabe", "anglais"])
    langues = Column(JSON, default=list)

    # Public cible (JSON array: ["enfants", "ados", "hommes", "femmes"])
    public_cible = Column(JSON, default=list)

    # Tarification
    prix_min = Column(Float)  # Prix minimum par heure
    prix_max = Column(Float)  # Prix maximum par heure
    premier_cours_gratuit = Column(Boolean, default=False)

    # Localisation
    ville = Column(String(100))
    pays = Column(String(100), default="France")
    adresse = Column(String(500))

    # Notes et avis
    note_moyenne = Column(Float, default=0.0)
    nombre_avis = Column(Integer, default=0)

    # Statut
    verifie = Column(Boolean, default=False)
    actif = Column(Boolean, default=True)
    nouveau = Column(Boolean, default=True)

    # Abonnement
    abonnement_actif = Column(Boolean, default=False)  # Maraakiz Plus

    # Compteurs
    nombre_eleves = Column(Integer, default=0)
    nombre_cours_donnes = Column(Integer, default=0)

    def __repr__(self):
        return f"<Merkez {self.nom}>"
