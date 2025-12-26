from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from pathlib import Path
import uuid

from app.database import get_db
from app.models.notes_cours import NotesCours
from app.models.cours import Cours
from app.models.eleve import Eleve
from app.models.user import User
from app.routes.auth import oauth2_scheme
from jose import JWTError, jwt
import os
import json

router = APIRouter()

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"

# File upload configuration
UPLOAD_DIR = Path("uploads/notes")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


# Pydantic schemas
class NotesCoursCreate(BaseModel):
    cours_id: int
    resume: Optional[str] = None
    vu_en_cours: Optional[str] = None
    devoirs: Optional[str] = None
    a_revoir: Optional[str] = None
    a_voir_prochaine_fois: Optional[str] = None
    commentaire_prof: Optional[str] = None
    progression_pourcentage: Optional[int] = None
    note: Optional[str] = None


class NotesCoursUpdate(BaseModel):
    resume: Optional[str] = None
    vu_en_cours: Optional[str] = None
    devoirs: Optional[str] = None
    a_revoir: Optional[str] = None
    a_voir_prochaine_fois: Optional[str] = None
    commentaire_prof: Optional[str] = None
    progression_pourcentage: Optional[int] = None
    note: Optional[str] = None


class NotesCoursResponse(BaseModel):
    id: int
    cours_id: int
    eleve_id: int
    merkez_id: int
    resume: Optional[str]
    vu_en_cours: Optional[str]
    devoirs: Optional[str]
    a_revoir: Optional[str]
    a_voir_prochaine_fois: Optional[str]
    commentaire_prof: Optional[str]
    fichiers: Optional[dict]
    progression_pourcentage: Optional[int]
    note: Optional[str]
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
@router.get("/cours/{cours_id}", response_model=NotesCoursResponse)
async def get_notes_by_cours(
    cours_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get notes for a specific course
    """
    # Verify access to course
    cours = db.query(Cours).filter(Cours.id == cours_id).first()
    if not cours:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cours non trouvé"
        )

    # Check if user has access (either professor or the student)
    if current_user.user_type == "prof" and cours.merkez_id != current_user.merkez_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé"
        )

    notes = db.query(NotesCours).filter(NotesCours.cours_id == cours_id).first()

    if not notes:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aucune note pour ce cours"
        )

    return notes


@router.get("/eleve/{eleve_id}", response_model=List[NotesCoursResponse])
async def get_notes_by_eleve(
    eleve_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all notes for a specific student
    """
    if current_user.user_type == "prof" and not current_user.merkez_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous devez être professeur ou institut"
        )

    # Verify student belongs to current professor or is the student himself
    eleve = db.query(Eleve).filter(Eleve.id == eleve_id).first()
    if not eleve:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Élève non trouvé"
        )

    if current_user.user_type == "prof" and eleve.merkez_id != current_user.merkez_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé"
        )

    notes = db.query(NotesCours).filter(
        NotesCours.eleve_id == eleve_id
    ).order_by(NotesCours.created_at.desc()).all()

    return notes


@router.post("/", response_model=NotesCoursResponse, status_code=status.HTTP_201_CREATED)
async def create_notes(
    notes_data: NotesCoursCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create notes for a course (professor only)
    """
    if not current_user.merkez_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous devez être professeur ou institut"
        )

    # Verify course exists and belongs to professor
    cours = db.query(Cours).filter(
        Cours.id == notes_data.cours_id,
        Cours.merkez_id == current_user.merkez_id
    ).first()

    if not cours:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cours non trouvé"
        )

    # Check if notes already exist for this course
    existing = db.query(NotesCours).filter(
        NotesCours.cours_id == notes_data.cours_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Des notes existent déjà pour ce cours. Utilisez PUT pour les modifier."
        )

    new_notes = NotesCours(
        cours_id=notes_data.cours_id,
        eleve_id=cours.eleve_id,
        merkez_id=current_user.merkez_id,
        resume=notes_data.resume,
        vu_en_cours=notes_data.vu_en_cours,
        devoirs=notes_data.devoirs,
        a_revoir=notes_data.a_revoir,
        a_voir_prochaine_fois=notes_data.a_voir_prochaine_fois,
        commentaire_prof=notes_data.commentaire_prof,
        progression_pourcentage=notes_data.progression_pourcentage,
        note=notes_data.note,
        fichiers={}
    )

    db.add(new_notes)
    db.commit()
    db.refresh(new_notes)

    return new_notes


@router.put("/{notes_id}", response_model=NotesCoursResponse)
async def update_notes(
    notes_id: int,
    notes_data: NotesCoursUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update course notes
    """
    if not current_user.merkez_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous devez être professeur ou institut"
        )

    notes = db.query(NotesCours).filter(
        NotesCours.id == notes_id,
        NotesCours.merkez_id == current_user.merkez_id
    ).first()

    if not notes:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notes non trouvées"
        )

    # Update fields
    update_data = notes_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(notes, field, value)

    db.commit()
    db.refresh(notes)

    return notes


@router.delete("/{notes_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notes(
    notes_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete course notes
    """
    if not current_user.merkez_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous devez être professeur ou institut"
        )

    notes = db.query(NotesCours).filter(
        NotesCours.id == notes_id,
        NotesCours.merkez_id == current_user.merkez_id
    ).first()

    if not notes:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notes non trouvées"
        )

    db.delete(notes)
    db.commit()

    return None
