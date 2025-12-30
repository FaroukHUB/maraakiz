from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime
from jose import JWTError, jwt
import os

from app.database import get_db
from app.models.user import User
from app.models.merkez import Merkez
from app.routes.auth import oauth2_scheme, get_password_hash
from app.utils.password import generate_simple_temp_password
from app.utils.email import send_student_credentials_email

router = APIRouter()

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"

# Pydantic schemas
class ProfesseurCreate(BaseModel):
    nom: str
    email: EmailStr
    telephone: Optional[str] = None
    genre: Optional[str] = None  # "homme" ou "femme"

class ProfesseurUpdate(BaseModel):
    nom: Optional[str] = None
    email: Optional[EmailStr] = None
    telephone: Optional[str] = None
    genre: Optional[str] = None
    is_active: Optional[bool] = None

class ProfesseurResponse(BaseModel):
    id: int
    email: str
    nom: str
    telephone: Optional[str]
    genre: Optional[str]
    avatar_url: Optional[str]
    is_active: bool
    institut_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ProfesseurCreateResponse(BaseModel):
    """Response when creating a new salaried professor"""
    professeur: ProfesseurResponse
    temp_password: str
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


# Helper function to assign avatar based on genre
def assign_avatar_by_genre(genre: Optional[str]) -> Optional[str]:
    """Assign avatar URL based on professor's genre"""
    if not genre:
        return None

    genre_lower = genre.lower()
    avatar_map = {
        "homme": "/avatars/homme.webp",
        "femme": "/avatars/femme.webp"
    }

    return avatar_map.get(genre_lower)


# Routes
@router.get("/", response_model=List[ProfesseurResponse])
async def get_professeurs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all salaried professors for the current institut
    Only instituts can access this endpoint
    """
    # Verify that the current user is an institut
    if current_user.user_type != "prof" or not current_user.merkez_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seuls les instituts peuvent gérer des professeurs"
        )

    # Verify institut type
    merkez = db.query(Merkez).filter(Merkez.id == current_user.merkez_id).first()
    if not merkez or merkez.type != "institut":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seuls les instituts peuvent gérer des professeurs"
        )

    # Get all salaried professors (where institut_id = current_user.id)
    professeurs = db.query(User).filter(
        User.institut_id == current_user.id,
        User.user_type == "prof"
    ).all()

    # Convert to response format
    result = []
    for prof in professeurs:
        result.append(ProfesseurResponse(
            id=prof.id,
            email=prof.email,
            nom=prof.full_name,
            telephone=None,  # We'll need to get this from merkez if stored there
            genre=prof.genre,
            avatar_url=prof.avatar_url,
            is_active=prof.is_active,
            institut_id=prof.institut_id,
            created_at=prof.created_at
        ))

    return result


@router.post("/", response_model=ProfesseurCreateResponse, status_code=status.HTTP_201_CREATED)
async def create_professeur(
    professeur_data: ProfesseurCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new salaried professor account
    Only instituts can create salaried professors
    """
    # Verify that the current user is an institut
    if current_user.user_type != "prof" or not current_user.merkez_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seuls les instituts peuvent créer des professeurs salariés"
        )

    # Verify institut type
    merkez = db.query(Merkez).filter(Merkez.id == current_user.merkez_id).first()
    if not merkez or merkez.type != "institut":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seuls les instituts peuvent créer des professeurs salariés"
        )

    # Check if email already exists
    existing_user = db.query(User).filter(User.email == professeur_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Un compte avec cet email existe déjà"
        )

    existing_merkez = db.query(Merkez).filter(Merkez.email == professeur_data.email).first()
    if existing_merkez:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Un compte avec cet email existe déjà"
        )

    # Generate temporary password
    temp_password = generate_simple_temp_password()
    hashed_password = get_password_hash(temp_password)

    # Assign avatar based on genre
    avatar_url = assign_avatar_by_genre(professeur_data.genre)

    # Create user account for the professor
    new_user = User(
        email=professeur_data.email,
        hashed_password=hashed_password,
        full_name=professeur_data.nom,
        user_type="prof",
        institut_id=current_user.id,  # Link to the institut's user ID
        genre=professeur_data.genre,
        avatar_url=avatar_url,
        is_active=True
    )

    db.add(new_user)
    db.flush()

    # Create merkez entry for the professor
    new_merkez = Merkez(
        type="professeur",
        nom=professeur_data.nom,
        email=professeur_data.email,
        telephone=professeur_data.telephone,
        actif=True,
        verifie=True,  # Auto-verify salaried professors
        nouveau=False,
        abonnement_actif=True  # Managed by institut
    )

    db.add(new_merkez)
    db.flush()

    # Link user to merkez
    new_user.merkez_id = new_merkez.id

    db.commit()
    db.refresh(new_user)

    # TODO: Send email with credentials
    # For now, we return the temp password in the response
    # In production, this should be sent via email

    response_data = ProfesseurResponse(
        id=new_user.id,
        email=new_user.email,
        nom=new_user.full_name,
        telephone=professeur_data.telephone,
        genre=new_user.genre,
        avatar_url=new_user.avatar_url,
        is_active=new_user.is_active,
        institut_id=new_user.institut_id,
        created_at=new_user.created_at
    )

    return ProfesseurCreateResponse(
        professeur=response_data,
        temp_password=temp_password,
        message=f"Professeur {professeur_data.nom} créé avec succès. Mot de passe temporaire: {temp_password}"
    )


@router.put("/{professeur_id}", response_model=ProfesseurResponse)
async def update_professeur(
    professeur_id: int,
    professeur_data: ProfesseurUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a salaried professor
    Only the institut that created the professor can update them
    """
    # Verify that the current user is an institut
    if current_user.user_type != "prof" or not current_user.merkez_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seuls les instituts peuvent modifier des professeurs"
        )

    # Get the professor
    professeur = db.query(User).filter(User.id == professeur_id).first()
    if not professeur:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professeur non trouvé"
        )

    # Verify that this professor belongs to the current institut
    if professeur.institut_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous ne pouvez modifier que vos propres professeurs"
        )

    # Update fields
    if professeur_data.nom is not None:
        professeur.full_name = professeur_data.nom

    if professeur_data.email is not None:
        # Check if email is already used
        existing = db.query(User).filter(
            User.email == professeur_data.email,
            User.id != professeur_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cet email est déjà utilisé"
            )
        professeur.email = professeur_data.email

    if professeur_data.genre is not None:
        professeur.genre = professeur_data.genre
        # Update avatar if genre changed
        professeur.avatar_url = assign_avatar_by_genre(professeur_data.genre)

    if professeur_data.is_active is not None:
        professeur.is_active = professeur_data.is_active

    # Update merkez if exists
    if professeur.merkez_id:
        merkez = db.query(Merkez).filter(Merkez.id == professeur.merkez_id).first()
        if merkez:
            if professeur_data.nom is not None:
                merkez.nom = professeur_data.nom
            if professeur_data.email is not None:
                merkez.email = professeur_data.email
            if professeur_data.telephone is not None:
                merkez.telephone = professeur_data.telephone

    db.commit()
    db.refresh(professeur)

    # Get telephone from merkez
    telephone = None
    if professeur.merkez_id:
        merkez = db.query(Merkez).filter(Merkez.id == professeur.merkez_id).first()
        if merkez:
            telephone = merkez.telephone

    return ProfesseurResponse(
        id=professeur.id,
        email=professeur.email,
        nom=professeur.full_name,
        telephone=telephone,
        genre=professeur.genre,
        avatar_url=professeur.avatar_url,
        is_active=professeur.is_active,
        institut_id=professeur.institut_id,
        created_at=professeur.created_at
    )


@router.delete("/{professeur_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_professeur(
    professeur_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a salaried professor
    Only the institut that created the professor can delete them
    """
    # Verify that the current user is an institut
    if current_user.user_type != "prof" or not current_user.merkez_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seuls les instituts peuvent supprimer des professeurs"
        )

    # Get the professor
    professeur = db.query(User).filter(User.id == professeur_id).first()
    if not professeur:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professeur non trouvé"
        )

    # Verify that this professor belongs to the current institut
    if professeur.institut_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous ne pouvez supprimer que vos propres professeurs"
        )

    # Delete associated merkez if exists
    if professeur.merkez_id:
        merkez = db.query(Merkez).filter(Merkez.id == professeur.merkez_id).first()
        if merkez:
            db.delete(merkez)

    # Delete the user
    db.delete(professeur)
    db.commit()

    return None
