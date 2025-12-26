from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime, date

from app.database import get_db
from app.models.eleve import Eleve
from app.models.user import User
from app.routes.auth import oauth2_scheme
from jose import JWTError, jwt
import os

router = APIRouter()

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"

# Pydantic schemas
class EleveCreate(BaseModel):
    nom: str
    prenom: str
    email: Optional[str] = None
    telephone: Optional[str] = None
    date_naissance: Optional[date] = None
    genre: Optional[str] = None
    nom_parent: Optional[str] = None
    telephone_parent: Optional[str] = None
    email_parent: Optional[str] = None
    niveau: Optional[str] = None
    matieres: Optional[str] = None
    objectifs: Optional[str] = None
    type_cours: Optional[str] = None
    frequence_cours: Optional[str] = None
    duree_cours: Optional[int] = None
    tarif_heure: Optional[int] = None
    notes: Optional[str] = None
    commentaire_general: Optional[str] = None

class EleveUpdate(BaseModel):
    nom: Optional[str] = None
    prenom: Optional[str] = None
    email: Optional[str] = None
    telephone: Optional[str] = None
    date_naissance: Optional[date] = None
    genre: Optional[str] = None
    nom_parent: Optional[str] = None
    telephone_parent: Optional[str] = None
    email_parent: Optional[str] = None
    niveau: Optional[str] = None
    matieres: Optional[str] = None
    objectifs: Optional[str] = None
    type_cours: Optional[str] = None
    frequence_cours: Optional[str] = None
    duree_cours: Optional[int] = None
    tarif_heure: Optional[int] = None
    statut: Optional[str] = None
    nombre_cours_suivis: Optional[int] = None
    nombre_absences: Optional[int] = None
    notes: Optional[str] = None
    commentaire_general: Optional[str] = None

class EleveResponse(BaseModel):
    id: int
    merkez_id: int
    nom: str
    prenom: str
    email: Optional[str]
    telephone: Optional[str]
    date_naissance: Optional[date]
    genre: Optional[str]
    nom_parent: Optional[str]
    telephone_parent: Optional[str]
    email_parent: Optional[str]
    niveau: Optional[str]
    matieres: Optional[str]
    objectifs: Optional[str]
    type_cours: Optional[str]
    frequence_cours: Optional[str]
    duree_cours: Optional[int]
    tarif_heure: Optional[int]
    statut: str
    nombre_cours_suivis: int
    nombre_absences: int
    notes: Optional[str]
    commentaire_general: Optional[str]
    date_inscription: datetime
    date_dernier_cours: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]

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
@router.get("/", response_model=List[EleveResponse])
async def get_eleves(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all eleves for the current professor/institute
    """
    if not current_user.merkez_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous devez être professeur ou institut pour accéder aux élèves"
        )

    eleves = db.query(Eleve).filter(Eleve.merkez_id == current_user.merkez_id).all()
    return eleves


@router.post("/", response_model=EleveResponse, status_code=status.HTTP_201_CREATED)
async def create_eleve(
    eleve_data: EleveCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new eleve
    """
    if not current_user.merkez_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous devez être professeur ou institut pour ajouter des élèves"
        )

    new_eleve = Eleve(
        merkez_id=current_user.merkez_id,
        **eleve_data.model_dump()
    )

    db.add(new_eleve)
    db.commit()
    db.refresh(new_eleve)

    return new_eleve


@router.get("/{eleve_id}", response_model=EleveResponse)
async def get_eleve(
    eleve_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific eleve by ID
    """
    if not current_user.merkez_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous devez être professeur ou institut"
        )

    eleve = db.query(Eleve).filter(
        Eleve.id == eleve_id,
        Eleve.merkez_id == current_user.merkez_id
    ).first()

    if not eleve:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Élève non trouvé"
        )

    return eleve


@router.put("/{eleve_id}", response_model=EleveResponse)
async def update_eleve(
    eleve_id: int,
    eleve_data: EleveUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update an eleve
    """
    if not current_user.merkez_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous devez être professeur ou institut"
        )

    eleve = db.query(Eleve).filter(
        Eleve.id == eleve_id,
        Eleve.merkez_id == current_user.merkez_id
    ).first()

    if not eleve:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Élève non trouvé"
        )

    # Update only provided fields
    update_data = eleve_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(eleve, field, value)

    db.commit()
    db.refresh(eleve)

    return eleve


@router.delete("/{eleve_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_eleve(
    eleve_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete an eleve
    """
    if not current_user.merkez_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous devez être professeur ou institut"
        )

    eleve = db.query(Eleve).filter(
        Eleve.id == eleve_id,
        Eleve.merkez_id == current_user.merkez_id
    ).first()

    if not eleve:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Élève non trouvé"
        )

    db.delete(eleve)
    db.commit()

    return None
