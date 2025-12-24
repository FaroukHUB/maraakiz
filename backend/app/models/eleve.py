from datetime import datetime
from sqlalchemy import String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

class Eleve(Base):
    __tablename__ = "eleves"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    merkez_id: Mapped[int] = mapped_column(ForeignKey("merkez.id"), index=True, nullable=False)
    merkez = relationship("Merkez", back_populates="eleves")

    prenom: Mapped[str] = mapped_column(String(120), nullable=False)
    nom: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)

    niveau: Mapped[str] = mapped_column(String(120), nullable=False)  # debutant/intermediaire/avance (or free)
    statut: Mapped[str] = mapped_column(String(120), nullable=False)  # groupe/individuel
    remarques: Mapped[str | None] = mapped_column(Text, nullable=True)
    lien_visio: Mapped[str | None] = mapped_column(String(500), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    plannings = relationship("Planning", back_populates="eleve", cascade="all, delete-orphan")
