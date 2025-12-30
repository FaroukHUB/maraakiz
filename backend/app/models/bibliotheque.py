from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, JSON
from sqlalchemy.sql import func
from app.database import Base

class RessourceBibliotheque(Base):
    __tablename__ = "ressources_bibliotheque"

    id = Column(Integer, primary_key=True, index=True)

    # Liens
    merkez_id = Column(Integer, nullable=False, index=True)  # Professeur/Institut propriétaire

    # Informations du fichier
    titre = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    fichier_nom = Column(String(500), nullable=False)  # Nom original du fichier
    fichier_url = Column(String(500), nullable=False)  # Chemin du fichier
    fichier_type = Column(String(100), nullable=False)  # MIME type
    fichier_taille = Column(Integer, nullable=True)  # Taille en octets

    # Type de ressource
    categorie = Column(String(50), nullable=False)  # "video", "audio", "document", "image"

    # Contrôle d'accès
    acces_type = Column(String(50), default="prive")  # "public", "eleves", "specifique"
    eleves_autorises = Column(JSON, nullable=True)  # Liste d'IDs d'élèves si acces_type = "specifique"

    # Organisation
    tags = Column(JSON, nullable=True)  # Tags pour organisation
    dossier = Column(String(200), nullable=True)  # Nom du dossier virtuel

    # Statistiques
    vues = Column(Integer, default=0)  # Nombre de vues
    telecharges = Column(Integer, default=0)  # Nombre de téléchargements

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<RessourceBibliotheque {self.titre}>"
