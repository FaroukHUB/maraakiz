from datetime import datetime
from sqlalchemy import String, Integer, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

class Merkez(Base):
    __tablename__ = "merkez"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    # Owner account
    owner_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False)
    owner = relationship("User", back_populates="merkez")

    # Public profile
    nom: Mapped[str] = mapped_column(String(255), nullable=False)
    photo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    email_public: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Teaching attributes (filters)
    type_enseignement: Mapped[str] = mapped_column(String(255), nullable=False)  # ex: coran,tajwid,arabe,...
    format_cours: Mapped[str] = mapped_column(String(255), nullable=False)       # ex: groupe,individuel,binôme
    mode_enseignement: Mapped[str] = mapped_column(String(255), nullable=False)  # ex: en_ligne,en_presentiel,en_differe
    niveau: Mapped[str] = mapped_column(String(255), nullable=False)             # debutant,intermediaire,avance
    langue: Mapped[str] = mapped_column(String(255), nullable=False)             # francophone,arabophone,anglophone
    public_cible: Mapped[str] = mapped_column(String(255), nullable=False)       # enfants,ados,hommes,femmes

    prix_min: Mapped[int] = mapped_column(Integer, default=0)
    prix_max: Mapped[int] = mapped_column(Integer, default=0)
    disponibilite_immediate: Mapped[bool] = mapped_column(Boolean, default=False)

    # Extra sections
    cursus: Mapped[str | None] = mapped_column(Text, nullable=True)
    livres_programmes: Mapped[str | None] = mapped_column(Text, nullable=True)
    adherer_credo_case: Mapped[bool] = mapped_column(Boolean, default=False)  # must be True to be approved
    is_approved: Mapped[bool] = mapped_column(Boolean, default=False)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relations
    eleves = relationship("Eleve", back_populates="merkez", cascade="all, delete-orphan")
    plannings = relationship("Planning", back_populates="merkez", cascade="all, delete-orphan")
    abonnements = relationship("Abonnement", back_populates="merkez", cascade="all, delete-orphan")
    messages_sent = relationship("Message", foreign_keys="[Message.sender_merkez_id]", back_populates="sender_merkez")
    messages_received = relationship("Message", foreign_keys="[Message.receiver_merkez_id]", back_populates="receiver_merkez")
