from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class Cours(Base):
    __tablename__ = "cours"

    id = Column(Integer, primary_key=True, index=True)

    # Liens
    merkez_id = Column(Integer, nullable=False, index=True)  # Professeur/Institut
    eleve_id = Column(Integer, nullable=False, index=True)  # Élève

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
    presente = Column(Boolean, default=False)  # L'élève était présent

    # Paiement
    tarif = Column(Integer, nullable=True)  # Tarif pour ce cours en euros
    paye = Column(Boolean, default=False)  # Payé ou non

    # Notes
    notes_prof = Column(Text, nullable=True)  # Notes du professeur après le cours
    devoirs = Column(Text, nullable=True)  # Devoirs donnés

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Cours {self.titre} - {self.date_debut}>"
