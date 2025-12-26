from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Date, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class Eleve(Base):
    __tablename__ = "eleves"

    id = Column(Integer, primary_key=True, index=True)

    # Lien vers le professeur/institut
    merkez_id = Column(Integer, nullable=False, index=True)

    # Informations personnelles
    nom = Column(String(255), nullable=False)
    prenom = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    telephone = Column(String(50), nullable=True)
    date_naissance = Column(Date, nullable=True)
    genre = Column(String(20), nullable=True)  # "homme", "femme", "garcon", "fille"

    # Contact parent/tuteur (si mineur)
    nom_parent = Column(String(255), nullable=True)
    telephone_parent = Column(String(50), nullable=True)
    email_parent = Column(String(255), nullable=True)

    # Informations académiques
    niveau = Column(String(100), nullable=True)  # "débutant", "intermédiaire", "avancé"
    matieres = Column(Text, nullable=True)  # Liste séparée par virgules: "coran,arabe,tajwid"
    objectifs = Column(Text, nullable=True)  # Objectifs d'apprentissage

    # Informations de cours
    type_cours = Column(String(50), nullable=True)  # "en-ligne", "presentiel", "en-differe"
    frequence_cours = Column(String(100), nullable=True)  # "1x/semaine", "2x/semaine", etc.
    duree_cours = Column(Integer, nullable=True)  # Durée en minutes
    tarif_heure = Column(Integer, nullable=True)  # Tarif horaire en euros

    # Statut et progression
    statut = Column(String(50), default="actif")  # "actif", "inactif", "suspendu"
    nombre_cours_suivis = Column(Integer, default=0)
    nombre_absences = Column(Integer, default=0)

    # Notes et commentaires
    notes = Column(Text, nullable=True)  # Notes du professeur
    commentaire_general = Column(Text, nullable=True)

    # Informations administratives
    date_inscription = Column(DateTime(timezone=True), server_default=func.now())
    date_dernier_cours = Column(DateTime(timezone=True), nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Eleve {self.prenom} {self.nom}>"
