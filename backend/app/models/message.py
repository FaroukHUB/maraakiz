from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)

    # Expéditeur et destinataire
    expediteur_id = Column(Integer, nullable=False, index=True)  # User ID
    destinataire_id = Column(Integer, nullable=False, index=True)  # User ID

    # Type d'expéditeur/destinataire pour faciliter l'affichage
    expediteur_type = Column(String(50), nullable=False)  # "prof", "eleve"
    destinataire_type = Column(String(50), nullable=False)  # "prof", "eleve"

    # Contenu
    sujet = Column(String(255), nullable=True)  # Sujet du message (optionnel)
    contenu = Column(Text, nullable=False)  # Contenu du message

    # Statut
    lu = Column(Boolean, default=False)  # Message lu ou non
    archived = Column(Boolean, default=False)  # Archivé

    # Fil de conversation (pour grouper les messages)
    conversation_id = Column(String(100), nullable=False, index=True)  # Format: "user1_user2"

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Message {self.id} - {self.expediteur_id} → {self.destinataire_id}>"
