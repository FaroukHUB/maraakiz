from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

from app.database import get_db
from app.models.merkez import Merkez
from app.models.user import User
from app.routes.auth import oauth2_scheme
from jose import JWTError, jwt
import os

router = APIRouter()

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"


# Pydantic schemas
class MerkezUpdate(BaseModel):
    nom: Optional[str] = None
    telephone: Optional[str] = None
    cursus: Optional[str] = None
    presentation_institut: Optional[str] = None
    nombre_professeurs: Optional[int] = None
    nombre_secretaires: Optional[int] = None
    nombre_superviseurs: Optional[int] = None
    nombre_responsables_pedagogiques: Optional[int] = None
    nombre_gestionnaires: Optional[int] = None
    programme: Optional[str] = None
    livres: Optional[str] = None
    methodologie: Optional[str] = None
    presentation_video_url: Optional[str] = None
    image_url: Optional[str] = None
    matieres: Optional[List[str]] = None
    formats: Optional[List[str]] = None
    type_classe: Optional[List[str]] = None
    niveaux: Optional[List[str]] = None
    langues: Optional[List[str]] = None
    public_cible: Optional[List[str]] = None
    prix_min: Optional[float] = None
    prix_max: Optional[float] = None
    premier_cours_gratuit: Optional[bool] = None
    ville: Optional[str] = None
    pays: Optional[str] = None
    adresse: Optional[str] = None


class MerkezResponse(BaseModel):
    id: int
    type: str
    nom: str
    email: str
    telephone: Optional[str]
    cursus: Optional[str]
    presentation_institut: Optional[str]
    nombre_professeurs: int
    nombre_secretaires: int
    nombre_superviseurs: int
    nombre_responsables_pedagogiques: int
    nombre_gestionnaires: int
    programme: Optional[str]
    livres: Optional[str]
    methodologie: Optional[str]
    presentation_video_url: Optional[str]
    image_url: Optional[str]
    matieres: List
    formats: List
    type_classe: List
    niveaux: List
    langues: List
    public_cible: List
    prix_min: Optional[float]
    prix_max: Optional[float]
    premier_cours_gratuit: bool
    ville: Optional[str]
    pays: str
    adresse: Optional[str]
    note_moyenne: float
    nombre_avis: int
    verifie: bool
    actif: bool
    nouveau: bool
    abonnement_actif: bool
    nombre_eleves: int
    nombre_cours_donnes: int

    class Config:
        from_attributes = True


# Dependency to get current user
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Impossible de valider les informations d'identification",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception

    return user


# Routes
@router.get("/me", response_model=MerkezResponse)
async def get_my_merkez(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's merkez profile
    """
    if not current_user.merkez_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vous n'avez pas de profil merkez associé"
        )

    merkez = db.query(Merkez).filter(Merkez.id == current_user.merkez_id).first()

    if not merkez:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profil merkez non trouvé"
        )

    return merkez


@router.put("/me", response_model=MerkezResponse)
async def update_my_merkez(
    merkez_data: MerkezUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update current user's merkez profile
    """
    if not current_user.merkez_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous devez être professeur ou institut"
        )

    merkez = db.query(Merkez).filter(Merkez.id == current_user.merkez_id).first()

    if not merkez:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profil merkez non trouvé"
        )

    # Update only provided fields
    update_data = merkez_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(merkez, field, value)

    db.commit()
    db.refresh(merkez)

    return merkez
