from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

# Table d'association pour les cours avec plusieurs élèves (groupes/binômes)
cours_eleves = Table(
    'cours_eleves',
    Base.metadata,
    Column('cours_id', Integer, ForeignKey('cours.id', ondelete='CASCADE'), primary_key=True),
    Column('eleve_id', Integer, primary_key=True),
    Column('presente', Boolean, default=False)  # Présence individuelle par élève
)

class Cours(Base):
    __tablename__ = "cours"

    id = Column(Integer, primary_key=True, index=True)

    # Liens
    merkez_id = Column(Integer, nullable=False, index=True)  # Professeur/Institut
    # NOTE: eleve_id retiré - maintenant relation many-to-many via cours_eleves

    # Informations du cours
    titre = Column(String(255), nullable=False)  # Titre du cours
    matiere = Column(String(100), nullable=True)  # coran, arabe, tajwid, etc.
    description = Column(Text, nullable=True)  # Description/notes

    # Date et heure
    date_debut = Column(DateTime(timezone=True), nullable=False, index=True)
    date_fin = Column(DateTime(timezone=True), nullable=False)
    duree = Column(Integer, nullable=True)  # Durée en minutes

    # Type et format
    type_cours = Column(String(50), nullable=True)  # "en-ligne", "presentiel", "en-differe"
    lien_visio = Column(String(500), nullable=True)  # Lien Zoom, Meet, etc.

    # Statut
    statut = Column(String(50), default="planifie")  # "planifie", "termine", "annule", "reporte"

    # Google Calendar Integration
    google_event_id = Column(String(255), nullable=True, index=True)  # ID de l'événement Google Calendar
    sync_to_google = Column(Boolean, default=True)  # Synchroniser avec Google Calendar

    # Lien vers trame de cours (template)
    trame_cours_id = Column(Integer, ForeignKey('trames_cours.id', ondelete='SET NULL'), nullable=True)

    # Notes et devoirs
    notes_prof = Column(Text, nullable=True)  # Notes du professeur après le cours
    devoirs = Column(Text, nullable=True)  # Devoirs donnés
    fichiers_urls = Column(Text, nullable=True)  # URLs des fichiers uploadés (JSON array)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Cours {self.titre} - {self.date_debut}>"


class TrameCours(Base):
    """Template de cours réutilisable pour gagner du temps"""
    __tablename__ = "trames_cours"

    id = Column(Integer, primary_key=True, index=True)
    merkez_id = Column(Integer, nullable=False, index=True)  # Professeur/Institut

    # Informations du template
    nom = Column(String(255), nullable=False)  # Nom du template
    matiere = Column(String(100), nullable=True)  # coran, arabe, tajwid, etc.
    description = Column(Text, nullable=True)  # Description générale

    # Structure du cours (ce qui sera abordé et dans quel ordre)
    plan_cours = Column(Text, nullable=True)  # Plan structuré du cours (JSON ou texte)
    objectifs = Column(Text, nullable=True)  # Objectifs pédagogiques
    duree_standard = Column(Integer, nullable=True)  # Durée standard en minutes

    # Ressources
    ressources = Column(Text, nullable=True)  # Liens vers ressources (JSON array)
    devoirs_type = Column(Text, nullable=True)  # Devoirs types à donner

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<TrameCours {self.nom}>"
