from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime, date

from app.database import get_db
from app.models.eleve import Eleve
from app.models.user import User
from app.models.merkez import Merkez
from app.routes.auth import oauth2_scheme, get_password_hash
from app.utils.password import generate_simple_temp_password
from app.utils.email import send_student_credentials_email
from jose import JWTError, jwt
import os

router = APIRouter()

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"

# Helper function to assign avatar based on genre
def assign_avatar_by_genre(genre: Optional[str]) -> Optional[str]:
    """Assign avatar URL based on student's genre"""
    if not genre:
        return None

    genre_lower = genre.lower()
    avatar_map = {
        "homme": "/avatars/homme.webp",
        "femme": "/avatars/femme.webp",
        "garcon": "/avatars/garcon.webp",
        "fille": "/avatars/fille.webp"
    }

    return avatar_map.get(genre_lower)

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
    avatar_url: Optional[str]
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


class EleveCreateResponse(BaseModel):
    """Response when creating a new student - includes credentials"""
    eleve: EleveResponse
    user_created: bool
    email: Optional[str] = None
    temp_password: Optional[str] = None
    message: str


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


@router.post("/", response_model=EleveCreateResponse, status_code=status.HTTP_201_CREATED)
async def create_eleve(
    eleve_data: EleveCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new eleve and optionally create a User account for them
    """
    if not current_user.merkez_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous devez être professeur ou institut pour ajouter des élèves"
        )

    # Create the eleve record
    eleve_dict = eleve_data.model_dump()

    # Auto-assign avatar based on genre
    if eleve_data.genre:
        eleve_dict['avatar_url'] = assign_avatar_by_genre(eleve_data.genre)

    new_eleve = Eleve(
        merkez_id=current_user.merkez_id,
        **eleve_dict
    )

    db.add(new_eleve)
    db.commit()
    db.refresh(new_eleve)

    # If email is provided, create a User account for the student
    user_created = False
    temp_password = None

    if eleve_data.email:
        # Check if user already exists with this email
        existing_user = db.query(User).filter(User.email == eleve_data.email).first()

        if not existing_user:
            # Generate temporary password
            temp_password = generate_simple_temp_password()

            # Create user account
            new_user = User(
                email=eleve_data.email,
                hashed_password=get_password_hash(temp_password),
                full_name=f"{eleve_data.prenom} {eleve_data.nom}",
                user_type="eleve"
            )

            db.add(new_user)
            db.commit()
            user_created = True

    return EleveCreateResponse(
        eleve=new_eleve,
        user_created=user_created,
        email=eleve_data.email if user_created else None,
        temp_password=temp_password,
        message="Élève créé avec succès" + (" et compte utilisateur créé" if user_created else "")
    )


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

    # If genre is being updated, auto-assign new avatar
    if 'genre' in update_data and update_data['genre']:
        update_data['avatar_url'] = assign_avatar_by_genre(update_data['genre'])

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


class SendCredentialsRequest(BaseModel):
    email: str
    temp_password: str
    student_firstname: str
    student_lastname: str


@router.post("/send-credentials-email", status_code=status.HTTP_200_OK)
async def send_credentials_email(
    data: SendCredentialsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Send student credentials via email
    """
    if not current_user.merkez_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous devez être professeur ou institut"
        )

    # Get professor/institute name
    merkez = db.query(Merkez).filter(Merkez.id == current_user.merkez_id).first()
    professor_name = merkez.nom if merkez else current_user.full_name

    # Send email
    success = send_student_credentials_email(
        student_email=data.email,
        student_firstname=data.student_firstname,
        student_lastname=data.student_lastname,
        professor_name=professor_name,
        temp_password=data.temp_password,
        login_url="http://localhost:5174/login"  # TODO: Use environment variable
    )

    if not success:
        # Email sending failed (Gmail not configured), but don't raise error
        return {
            "success": False,
            "message": "Configuration email non disponible. Transmettez les identifiants manuellement à l'élève."
        }

    return {
        "success": True,
        "message": f"Email envoyé avec succès à {data.email}"
    }
