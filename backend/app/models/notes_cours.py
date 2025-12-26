from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from sqlalchemy.sql import func
from app.database import Base

class NotesCours(Base):
    __tablename__ = "notes_cours"

    id = Column(Integer, primary_key=True, index=True)

    # Liens
    cours_id = Column(Integer, nullable=False, index=True)  # Lien vers le cours
    eleve_id = Column(Integer, nullable=False, index=True)
    merkez_id = Column(Integer, nullable=False, index=True)

    # Résumé du cours
    resume = Column(Text, nullable=True)  # Résumé général du cours

    # Ce qui a été vu
    vu_en_cours = Column(Text, nullable=True)  # Ce qu'on a étudié

    # Devoirs
    devoirs = Column(Text, nullable=True)  # Devoirs à faire

    # À revoir
    a_revoir = Column(Text, nullable=True)  # Points à réviser

    # Pour le prochain cours
    a_voir_prochaine_fois = Column(Text, nullable=True)  # Programme suivant

    # Commentaire du prof
    commentaire_prof = Column(Text, nullable=True)

    # Fichiers attachés (stockés en JSON: [{nom, url, type}])
    fichiers = Column(JSON, nullable=True)

    # Progression (optionnel)
    progression_pourcentage = Column(Integer, nullable=True)  # 0-100

    # Note/Évaluation (optionnel)
    note = Column(String(50), nullable=True)  # "Excellent", "Bien", "À améliorer"

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<NotesCours Cours #{self.cours_id}>"
