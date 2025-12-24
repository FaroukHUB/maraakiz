from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict, EmailStr

class EleveBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    prenom: str = Field(min_length=1, max_length=120)
    nom: str = Field(min_length=1, max_length=120)
    email: EmailStr | None = None
    niveau: str
    statut: str
    remarques: str | None = None
    lien_visio: str | None = None

class EleveCreate(EleveBase):
    merkez_id: int

class EleveUpdate(BaseModel):
    prenom: str | None = None
    nom: str | None = None
    email: EmailStr | None = None
    niveau: str | None = None
    statut: str | None = None
    remarques: str | None = None
    lien_visio: str | None = None

class EleveOut(EleveBase):
    id: int
    merkez_id: int
    created_at: datetime
    updated_at: datetime
