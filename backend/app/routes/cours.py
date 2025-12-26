from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.database import get_db
from app.models.cours import Cours
from app.models.eleve import Eleve
from app.models.user import User
from app.routes.auth import oauth2_scheme
from jose import JWTError, jwt
import os

router = APIRouter()

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"


# Pydantic schemas
class CoursCreate(BaseModel):
    eleve_id: int
    titre: str
    matiere: Optional[str] = None
    description: Optional[str] = None
    date_debut: datetime
    date_fin: datetime
    duree: Optional[int] = None
    type_cours: Optional[str] = None
    lien_visio: Optional[str] = None
    tarif: Optional[int] = None
    devoirs: Optional[str] = None


class CoursUpdate(BaseModel):
    eleve_id: Optional[int] = None
    titre: Optional[str] = None
    matiere: Optional[str] = None
    description: Optional[str] = None
    date_debut: Optional[datetime] = None
    date_fin: Optional[datetime] = None
    duree: Optional[int] = None
    type_cours: Optional[str] = None
    lien_visio: Optional[str] = None
    statut: Optional[str] = None
    presente: Optional[bool] = None
    tarif: Optional[int] = None
    paye: Optional[bool] = None
    notes_prof: Optional[str] = None
    devoirs: Optional[str] = None


class CoursResponse(BaseModel):
    id: int
    merkez_id: int
    eleve_id: int
    titre: str
    matiere: Optional[str]
    description: Optional[str]
    date_debut: datetime
    date_fin: datetime
    duree: Optional[int]
    type_cours: Optional[str]
    lien_visio: Optional[str]
    statut: str
    presente: bool
    tarif: Optional[int]
    paye: bool
    notes_prof: Optional[str]
    devoirs: Optional[str]
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
@router.get("/", response_model=List[CoursResponse])
async def get_cours(
    mois: Optional[int] = Query(None, description="Mois (1-12)"),
    annee: Optional[int] = Query(None, description="Année"),
    eleve_id: Optional[int] = Query(None, description="Filtrer par élève"),
    statut: Optional[str] = Query(None, description="Filtrer par statut"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all cours for the current professor/institute with optional filters
    """
    if not current_user.merkez_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous devez être professeur ou institut"
        )

    query = db.query(Cours).filter(Cours.merkez_id == current_user.merkez_id)

    # Apply filters
    if eleve_id:
        query = query.filter(Cours.eleve_id == eleve_id)

    if statut:
        query = query.filter(Cours.statut == statut)

    if mois and annee:
        # Filter by month and year
        from sqlalchemy import extract
        query = query.filter(
            extract('month', Cours.date_debut) == mois,
            extract('year', Cours.date_debut) == annee
        )
    elif annee:
        # Filter by year only
        from sqlalchemy import extract
        query = query.filter(extract('year', Cours.date_debut) == annee)

    cours = query.order_by(Cours.date_debut).all()
    return cours


@router.post("/", response_model=CoursResponse, status_code=status.HTTP_201_CREATED)
async def create_cours(
    cours_data: CoursCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new cours
    """
    if not current_user.merkez_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous devez être professeur ou institut"
        )

    # Verify that the eleve belongs to this professor
    eleve = db.query(Eleve).filter(
        Eleve.id == cours_data.eleve_id,
        Eleve.merkez_id == current_user.merkez_id
    ).first()

    if not eleve:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Élève non trouvé ou ne vous appartient pas"
        )

    new_cours = Cours(
        merkez_id=current_user.merkez_id,
        **cours_data.model_dump()
    )

    db.add(new_cours)
    db.commit()
    db.refresh(new_cours)

    return new_cours


@router.get("/{cours_id}", response_model=CoursResponse)
async def get_cours_detail(
    cours_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific cours by ID
    """
    if not current_user.merkez_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous devez être professeur ou institut"
        )

    cours = db.query(Cours).filter(
        Cours.id == cours_id,
        Cours.merkez_id == current_user.merkez_id
    ).first()

    if not cours:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cours non trouvé"
        )

    return cours


@router.put("/{cours_id}", response_model=CoursResponse)
async def update_cours(
    cours_id: int,
    cours_data: CoursUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a cours
    """
    if not current_user.merkez_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous devez être professeur ou institut"
        )

    cours = db.query(Cours).filter(
        Cours.id == cours_id,
        Cours.merkez_id == current_user.merkez_id
    ).first()

    if not cours:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cours non trouvé"
        )

    # Update only provided fields
    update_data = cours_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(cours, field, value)

    db.commit()
    db.refresh(cours)

    return cours


@router.delete("/{cours_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_cours(
    cours_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a cours
    """
    if not current_user.merkez_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous devez être professeur ou institut"
        )

    cours = db.query(Cours).filter(
        Cours.id == cours_id,
        Cours.merkez_id == current_user.merkez_id
    ).first()

    if not cours:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cours non trouvé"
        )

    db.delete(cours)
    db.commit()

    return None
