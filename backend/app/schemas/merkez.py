from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class MerkezBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    nom: str = Field(min_length=2, max_length=255)
    photo_url: str | None = None
    bio: str | None = None
    email_public: str | None = None

    type_enseignement: str
    format_cours: str
    mode_enseignement: str
    niveau: str
    langue: str
    public_cible: str

    prix_min: int = 0
    prix_max: int = 0
    disponibilite_immediate: bool = False

    cursus: str | None = None
    livres_programmes: str | None = None
    adherer_credo_case: bool = False

class MerkezCreate(MerkezBase):
    owner_user_id: int

class MerkezUpdate(BaseModel):
    nom: str | None = None
    photo_url: str | None = None
    bio: str | None = None
    email_public: str | None = None

    type_enseignement: str | None = None
    format_cours: str | None = None
    mode_enseignement: str | None = None
    niveau: str | None = None
    langue: str | None = None
    public_cible: str | None = None

    prix_min: int | None = None
    prix_max: int | None = None
    disponibilite_immediate: bool | None = None

    cursus: str | None = None
    livres_programmes: str | None = None
    adherer_credo_case: bool | None = None

    is_approved: bool | None = None

class MerkezOut(MerkezBase):
    id: int
    owner_user_id: int
    is_approved: bool
    created_at: datetime
    updated_at: datetime

class PublicMerkez(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    nom: str
    photo_url: str | None = None
    bio: str | None = None
    email_public: str | None = None

    type_enseignement: str
    format_cours: str
    mode_enseignement: str
    niveau: str
    langue: str
    public_cible: str

    prix_min: int
    prix_max: int
    disponibilite_immediate: bool

    cursus: str | None = None
    livres_programmes: str | None = None
