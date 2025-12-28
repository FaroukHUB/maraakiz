from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))

    # Type: "prof" ou "eleve"
    user_type = Column(String(50), default="eleve")

    # Lien vers merkez_id si c'est un prof
    merkez_id = Column(Integer, nullable=True)

    # Avatar pour les professeurs
    genre = Column(String(20), nullable=True)  # "homme", "femme"
    avatar_url = Column(String(255), nullable=True)  # Chemin vers l'avatar (default ou custom)
    avatar_type = Column(String(20), default="default")  # "default" ou "custom"

    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)

    # Google Calendar Integration
    google_access_token = Column(String(500), nullable=True)  # Token d'accès Google
    google_refresh_token = Column(String(500), nullable=True)  # Token de rafraîchissement
    google_token_expiry = Column(DateTime(timezone=True), nullable=True)  # Expiration du token
    google_calendar_connected = Column(Boolean, default=False)  # Statut de connexion

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<User {self.email}>"
