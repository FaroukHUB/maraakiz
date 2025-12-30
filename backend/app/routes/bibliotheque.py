from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from pathlib import Path
import os

from app.database import get_db
from app.models.bibliotheque import RessourceBibliotheque
from app.models.eleve import Eleve
from app.models.user import User
from app.routes.auth import oauth2_scheme
from jose import JWTError, jwt

router = APIRouter()

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"

# Upload directory
UPLOAD_DIR = Path("uploads/bibliotheque")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


# Pydantic schemas
class RessourceCreate(BaseModel):
    titre: str
    description: Optional[str] = None
    categorie: str  # "video", "audio", "document", "image"
    acces_type: str = "prive"  # "public", "eleves", "specifique"
    eleves_autorises: Optional[List[int]] = None
    tags: Optional[List[str]] = None
    dossier: Optional[str] = None


class RessourceUpdate(BaseModel):
    titre: Optional[str] = None
    description: Optional[str] = None
    acces_type: Optional[str] = None
    eleves_autorises: Optional[List[int]] = None
    tags: Optional[List[str]] = None
    dossier: Optional[str] = None


class RessourceResponse(BaseModel):
    id: int
    merkez_id: int
    titre: str
    description: Optional[str]
    fichier_nom: str
    fichier_url: str
    fichier_type: str
    fichier_taille: Optional[int]
    categorie: str
    acces_type: str
    eleves_autorises: Optional[List[int]]
    tags: Optional[List[str]]
    dossier: Optional[str]
    vues: int
    telecharges: int
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


def get_category_from_mime(mime_type: str) -> str:
    """Determine category from MIME type"""
    if mime_type.startswith("video/"):
        return "video"
    elif mime_type.startswith("audio/"):
        return "audio"
    elif mime_type.startswith("image/"):
        return "image"
    else:
        return "document"


# Routes
@router.get("/", response_model=List[RessourceResponse])
async def get_ressources(
    categorie: Optional[str] = None,
    dossier: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all library resources for current professor
    """
    if not current_user.merkez_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous devez être professeur ou institut"
        )

    query = db.query(RessourceBibliotheque).filter(
        RessourceBibliotheque.merkez_id == current_user.merkez_id
    )

    if categorie:
        query = query.filter(RessourceBibliotheque.categorie == categorie)

    if dossier:
        query = query.filter(RessourceBibliotheque.dossier == dossier)

    ressources = query.order_by(RessourceBibliotheque.created_at.desc()).all()

    return ressources


@router.get("/folders")
async def get_folders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get list of all folders (unique dossier values)
    """
    if not current_user.merkez_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous devez être professeur ou institut"
        )

    folders = db.query(RessourceBibliotheque.dossier).filter(
        RessourceBibliotheque.merkez_id == current_user.merkez_id,
        RessourceBibliotheque.dossier.isnot(None)
    ).distinct().all()

    return [{"nom": f[0]} for f in folders if f[0]]


@router.post("/upload", response_model=RessourceResponse)
async def upload_ressource(
    file: UploadFile = File(...),
    titre: str = Form(...),
    description: Optional[str] = Form(None),
    acces_type: str = Form("prive"),
    eleves_autorises: Optional[str] = Form(None),  # JSON string
    tags: Optional[str] = Form(None),  # JSON string
    dossier: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload a file to the library
    """
    if not current_user.merkez_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous devez être professeur ou institut"
        )

    # Check file type
    allowed_types = [
        "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif",
        "audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg",
        "video/mp4", "video/webm", "video/ogg", "video/quicktime"
    ]

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Type de fichier non autorisé"
        )

    # Generate unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_extension = Path(file.filename).suffix
    original_name = Path(file.filename).stem
    new_filename = f"{original_name}_{timestamp}{file_extension}"
    file_path = UPLOAD_DIR / new_filename

    # Get file size
    file_size = 0
    try:
        content = await file.read()
        file_size = len(content)

        # Save file
        with file_path.open("wb") as buffer:
            buffer.write(content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de l'upload: {str(e)}"
        )

    # Parse JSON fields
    import json
    eleves_list = json.loads(eleves_autorises) if eleves_autorises else None
    tags_list = json.loads(tags) if tags else None

    # Determine category
    categorie = get_category_from_mime(file.content_type)

    # Create resource
    new_ressource = RessourceBibliotheque(
        merkez_id=current_user.merkez_id,
        titre=titre,
        description=description,
        fichier_nom=file.filename,
        fichier_url=f"/uploads/bibliotheque/{new_filename}",
        fichier_type=file.content_type,
        fichier_taille=file_size,
        categorie=categorie,
        acces_type=acces_type,
        eleves_autorises=eleves_list,
        tags=tags_list,
        dossier=dossier
    )

    db.add(new_ressource)
    db.commit()
    db.refresh(new_ressource)

    return new_ressource


@router.get("/{ressource_id}", response_model=RessourceResponse)
async def get_ressource(
    ressource_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific resource
    """
    if not current_user.merkez_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous devez être professeur ou institut"
        )

    ressource = db.query(RessourceBibliotheque).filter(
        RessourceBibliotheque.id == ressource_id,
        RessourceBibliotheque.merkez_id == current_user.merkez_id
    ).first()

    if not ressource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ressource non trouvée"
        )

    # Increment view count
    ressource.vues += 1
    db.commit()

    return ressource


@router.put("/{ressource_id}", response_model=RessourceResponse)
async def update_ressource(
    ressource_id: int,
    update_data: RessourceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update resource metadata
    """
    if not current_user.merkez_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous devez être professeur ou institut"
        )

    ressource = db.query(RessourceBibliotheque).filter(
        RessourceBibliotheque.id == ressource_id,
        RessourceBibliotheque.merkez_id == current_user.merkez_id
    ).first()

    if not ressource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ressource non trouvée"
        )

    # Update fields
    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(ressource, field, value)

    db.commit()
    db.refresh(ressource)

    return ressource


@router.delete("/{ressource_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ressource(
    ressource_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a resource
    """
    if not current_user.merkez_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous devez être professeur ou institut"
        )

    ressource = db.query(RessourceBibliotheque).filter(
        RessourceBibliotheque.id == ressource_id,
        RessourceBibliotheque.merkez_id == current_user.merkez_id
    ).first()

    if not ressource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ressource non trouvée"
        )

    # Delete physical file
    file_path = Path(ressource.fichier_url.lstrip("/"))
    if file_path.exists():
        try:
            file_path.unlink()
        except Exception as e:
            print(f"Error deleting file: {e}")

    db.delete(ressource)
    db.commit()

    return None


@router.get("/public/merkez/{merkez_id}", response_model=List[RessourceResponse])
async def get_public_ressources(
    merkez_id: int,
    db: Session = Depends(get_db)
):
    """
    Get public resources for a merkez (no auth required)
    """
    ressources = db.query(RessourceBibliotheque).filter(
        RessourceBibliotheque.merkez_id == merkez_id,
        RessourceBibliotheque.acces_type == "public"
    ).order_by(RessourceBibliotheque.created_at.desc()).all()

    return ressources


@router.get("/student/{eleve_id}", response_model=List[RessourceResponse])
async def get_student_ressources(
    eleve_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get resources accessible to a specific student
    """
    # Verify student exists and belongs to current user's merkez
    eleve = db.query(Eleve).filter(Eleve.id == eleve_id).first()
    if not eleve:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Élève non trouvé"
        )

    # Get all resources from the student's merkez
    ressources = db.query(RessourceBibliotheque).filter(
        RessourceBibliotheque.merkez_id == eleve.merkez_id
    ).all()

    # Filter based on access control
    accessible = []
    for r in ressources:
        if r.acces_type == "public":
            accessible.append(r)
        elif r.acces_type == "eleves":
            accessible.append(r)
        elif r.acces_type == "specifique" and r.eleves_autorises:
            if eleve_id in r.eleves_autorises:
                accessible.append(r)

    return accessible
