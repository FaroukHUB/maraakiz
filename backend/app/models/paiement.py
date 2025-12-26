from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Date, Text
from sqlalchemy.sql import func
from app.database import Base

class Paiement(Base):
    __tablename__ = "paiements"

    id = Column(Integer, primary_key=True, index=True)

    # Lien vers élève et prof
    eleve_id = Column(Integer, nullable=False, index=True)
    merkez_id = Column(Integer, nullable=False, index=True)

    # Période du paiement
    mois = Column(Integer, nullable=False)  # 1-12
    annee = Column(Integer, nullable=False)  # 2025, 2026, etc.

    # Montants
    montant_du = Column(Float, nullable=False)  # Montant total dû
    montant_paye = Column(Float, default=0.0)  # Montant déjà payé

    # Statut
    statut = Column(String(50), default="impaye")  # "impaye", "partiel", "paye", "en_retard"

    # Date de paiement
    date_echeance = Column(Date, nullable=False)  # Date limite de paiement
    date_paiement = Column(Date, nullable=True)  # Date réelle du paiement

    # Méthode de paiement
    methode_paiement = Column(String(100), nullable=True)  # "especes", "virement", "cheque", "carte"

    # Notes
    notes = Column(Text, nullable=True)

    # Rappels
    rappel_envoye = Column(Boolean, default=False)
    date_rappel = Column(DateTime(timezone=True), nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Paiement {self.mois}/{self.annee} - Élève {self.eleve_id}>"
