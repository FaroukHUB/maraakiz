from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from pathlib import Path
import shutil
import os
from datetime import datetime

from app.database import get_db
from app.models.user import User
from app.models.merkez import Merkez
from app.routes.auth import oauth2_scheme
from jose import JWTError, jwt

router = APIRouter()

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"

# Upload directory
UPLOAD_DIR = Path("uploads/avatars")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Pydantic schemas
class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    genre: Optional[str] = None  # "homme" ou "femme"
    use_default_avatar: Optional[bool] = None

class CompleteProfileUpdate(BaseModel):
    # User fields
    full_name: Optional[str] = None
    genre: Optional[str] = None

    # Merkez fields - Contact
    telephone: Optional[str] = None
    site_web: Optional[str] = None
    facebook: Optional[str] = None
    instagram: Optional[str] = None
    linkedin: Optional[str] = None
    twitter: Optional[str] = None
    youtube: Optional[str] = None

    # Merkez fields - Professionnel
    cursus: Optional[str] = None
    programme: Optional[str] = None
    livres: Optional[str] = None
    methodologie: Optional[str] = None
    presentation_institut: Optional[str] = None

    # Merkez fields - Arrays
    matieres: Optional[list] = None
    formats: Optional[list] = None
    type_classe: Optional[list] = None
    niveaux: Optional[list] = None
    langues: Optional[list] = None
    public_cible: Optional[list] = None

    # Merkez fields - Tarifs
    prix_min: Optional[float] = None
    prix_max: Optional[float] = None
    premier_cours_gratuit: Optional[bool] = None

    # Merkez fields - Localisation
    ville: Optional[str] = None
    pays: Optional[str] = None
    adresse: Optional[str] = None

class ProfileResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str]
    user_type: str
    merkez_id: Optional[int]
    genre: Optional[str]
    avatar_url: Optional[str]
    avatar_type: str

    class Config:
        from_attributes = True

class CompleteProfileResponse(BaseModel):
    # User info
    id: int
    email: str
    full_name: Optional[str]
    user_type: str
    genre: Optional[str]
    avatar_url: Optional[str]
    avatar_type: str

    # Merkez info
    merkez_id: Optional[int]
    merkez_type: Optional[str]  # professeur or institut
    nom: Optional[str]
    telephone: Optional[str]
    site_web: Optional[str]
    facebook: Optional[str]
    instagram: Optional[str]
    linkedin: Optional[str]
    twitter: Optional[str]
    youtube: Optional[str]
    cursus: Optional[str]
    programme: Optional[str]
    livres: Optional[str]
    methodologie: Optional[str]
    presentation_institut: Optional[str]
    matieres: Optional[list]
    formats: Optional[list]
    type_classe: Optional[list]
    niveaux: Optional[list]
    langues: Optional[list]
    public_cible: Optional[list]
    prix_min: Optional[float]
    prix_max: Optional[float]
    premier_cours_gratuit: Optional[bool]
    ville: Optional[str]
    pays: Optional[str]
    adresse: Optional[str]

    class Config:
        from_attributes = True


# Helper to get current user
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
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


def assign_prof_avatar_by_genre(genre: Optional[str]) -> Optional[str]:
    """Assign professor avatar URL based on genre"""
    if not genre:
        return None

    genre_lower = genre.lower()
    avatar_map = {
        "homme": "/avatars/prof-homme.webp",
        "femme": "/avatars/prof-femme.webp"
    }

    return avatar_map.get(genre_lower)


@router.get("/", response_model=ProfileResponse)
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user profile"""
    return current_user


@router.put("/", response_model=ProfileResponse)
async def update_profile(
    profile_data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile"""

    # Update basic fields
    if profile_data.full_name is not None:
        current_user.full_name = profile_data.full_name

    if profile_data.genre is not None:
        current_user.genre = profile_data.genre

        # If use_default_avatar is True or avatar_type is default, assign default avatar
        if profile_data.use_default_avatar or current_user.avatar_type == "default":
            current_user.avatar_url = assign_prof_avatar_by_genre(profile_data.genre)
            current_user.avatar_type = "default"

    db.commit()
    db.refresh(current_user)

    return current_user


@router.post("/avatar/upload")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload custom avatar for professor"""

    # Check if user is a professor
    if current_user.user_type != "prof":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seuls les professeurs peuvent uploader un avatar personnalisé"
        )

    # Check file type
    allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Type de fichier non autorisé. Utilisez JPG, PNG ou WEBP"
        )

    # Generate unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_extension = Path(file.filename).suffix
    new_filename = f"prof_{current_user.id}_{timestamp}{file_extension}"
    file_path = UPLOAD_DIR / new_filename

    # Save file
    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de l'upload: {str(e)}"
        )

    # Update user avatar
    avatar_url = f"/uploads/avatars/{new_filename}"
    current_user.avatar_url = avatar_url
    current_user.avatar_type = "custom"

    db.commit()
    db.refresh(current_user)

    return {
        "message": "Avatar uploadé avec succès",
        "avatar_url": avatar_url,
        "avatar_type": "custom",
        "warning": "⚠️ Images de représentation d'âme interdite"
    }


@router.delete("/avatar")
async def delete_avatar(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete custom avatar and revert to default"""

    # If custom avatar, delete file
    if current_user.avatar_type == "custom" and current_user.avatar_url:
        file_path = Path(current_user.avatar_url.lstrip("/"))
        if file_path.exists():
            try:
                file_path.unlink()
            except Exception as e:
                print(f"Error deleting file: {e}")

    # Revert to default avatar based on genre
    if current_user.genre:
        current_user.avatar_url = assign_prof_avatar_by_genre(current_user.genre)
    else:
        current_user.avatar_url = None

    current_user.avatar_type = "default"

    db.commit()
    db.refresh(current_user)

    return {
        "message": "Avatar supprimé, avatar par défaut restauré",
        "avatar_url": current_user.avatar_url,
        "avatar_type": "default"
    }


@router.get("/complete", response_model=CompleteProfileResponse)
async def get_complete_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get complete profile with user and merkez data"""
    
    # Get user data
    user_data = {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "user_type": current_user.user_type,
        "genre": current_user.genre,
        "avatar_url": current_user.avatar_url,
        "avatar_type": current_user.avatar_type or "default"
    }
    
    # Get merkez data if user is a prof
    if current_user.merkez_id:
        merkez = db.query(Merkez).filter(Merkez.id == current_user.merkez_id).first()
        if merkez:
            user_data.update({
                "merkez_id": merkez.id,
                "merkez_type": merkez.type,  # professeur or institut
                "nom": merkez.nom,
                "telephone": merkez.telephone,
                "site_web": merkez.site_web,
                "facebook": merkez.facebook,
                "instagram": merkez.instagram,
                "linkedin": merkez.linkedin,
                "twitter": merkez.twitter,
                "youtube": merkez.youtube,
                "cursus": merkez.cursus,
                "programme": merkez.programme,
                "livres": merkez.livres,
                "methodologie": merkez.methodologie,
                "presentation_institut": merkez.presentation_institut,
                "matieres": merkez.matieres or [],
                "formats": merkez.formats or [],
                "type_classe": merkez.type_classe or [],
                "niveaux": merkez.niveaux or [],
                "langues": merkez.langues or [],
                "public_cible": merkez.public_cible or [],
                "prix_min": merkez.prix_min,
                "prix_max": merkez.prix_max,
                "premier_cours_gratuit": merkez.premier_cours_gratuit,
                "ville": merkez.ville,
                "pays": merkez.pays,
                "adresse": merkez.adresse
            })
        else:
            # Merkez not found, fill with None
            user_data.update({
                "merkez_id": None,
                "merkez_type": None,
                "nom": None,
                "telephone": None,
                "site_web": None,
                "facebook": None,
                "instagram": None,
                "linkedin": None,
                "twitter": None,
                "youtube": None,
                "cursus": None,
                "programme": None,
                "livres": None,
                "methodologie": None,
                "presentation_institut": None,
                "matieres": [],
                "formats": [],
                "type_classe": [],
                "niveaux": [],
                "langues": [],
                "public_cible": [],
                "prix_min": None,
                "prix_max": None,
                "premier_cours_gratuit": None,
                "ville": None,
                "pays": None,
                "adresse": None
            })
    else:
        # No merkez_id, fill with None
        user_data.update({
            "merkez_id": None,
            "merkez_type": None,
            "nom": None,
            "telephone": None,
            "site_web": None,
            "facebook": None,
            "instagram": None,
            "linkedin": None,
            "twitter": None,
            "youtube": None,
            "cursus": None,
            "programme": None,
            "livres": None,
            "methodologie": None,
            "presentation_institut": None,
            "matieres": [],
            "formats": [],
            "type_classe": [],
            "niveaux": [],
            "langues": [],
            "public_cible": [],
            "prix_min": None,
            "prix_max": None,
            "premier_cours_gratuit": None,
            "ville": None,
            "pays": None,
            "adresse": None
        })
    
    return user_data


@router.put("/complete", response_model=CompleteProfileResponse)
async def update_complete_profile(
    profile_data: CompleteProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update complete profile (user + merkez data)"""
    
    # Update user fields
    if profile_data.full_name is not None:
        current_user.full_name = profile_data.full_name
    
    if profile_data.genre is not None:
        current_user.genre = profile_data.genre
        # Update default avatar if needed
        if current_user.avatar_type == "default":
            current_user.avatar_url = assign_prof_avatar_by_genre(profile_data.genre)
    
    db.commit()
    
    # Update merkez fields if user has merkez
    if current_user.merkez_id:
        merkez = db.query(Merkez).filter(Merkez.id == current_user.merkez_id).first()
        if merkez:
            # Contact fields
            if profile_data.telephone is not None:
                merkez.telephone = profile_data.telephone
            if profile_data.site_web is not None:
                merkez.site_web = profile_data.site_web
            if profile_data.facebook is not None:
                merkez.facebook = profile_data.facebook
            if profile_data.instagram is not None:
                merkez.instagram = profile_data.instagram
            if profile_data.linkedin is not None:
                merkez.linkedin = profile_data.linkedin
            if profile_data.twitter is not None:
                merkez.twitter = profile_data.twitter
            if profile_data.youtube is not None:
                merkez.youtube = profile_data.youtube
            
            # Professional fields
            if profile_data.cursus is not None:
                merkez.cursus = profile_data.cursus
            if profile_data.programme is not None:
                merkez.programme = profile_data.programme
            if profile_data.livres is not None:
                merkez.livres = profile_data.livres
            if profile_data.methodologie is not None:
                merkez.methodologie = profile_data.methodologie
            if profile_data.presentation_institut is not None:
                merkez.presentation_institut = profile_data.presentation_institut
            
            # Array fields
            if profile_data.matieres is not None:
                merkez.matieres = profile_data.matieres
            if profile_data.formats is not None:
                merkez.formats = profile_data.formats
            if profile_data.type_classe is not None:
                merkez.type_classe = profile_data.type_classe
            if profile_data.niveaux is not None:
                merkez.niveaux = profile_data.niveaux
            if profile_data.langues is not None:
                merkez.langues = profile_data.langues
            if profile_data.public_cible is not None:
                merkez.public_cible = profile_data.public_cible
            
            # Pricing fields
            if profile_data.prix_min is not None:
                merkez.prix_min = profile_data.prix_min
            if profile_data.prix_max is not None:
                merkez.prix_max = profile_data.prix_max
            if profile_data.premier_cours_gratuit is not None:
                merkez.premier_cours_gratuit = profile_data.premier_cours_gratuit
            
            # Location fields
            if profile_data.ville is not None:
                merkez.ville = profile_data.ville
            if profile_data.pays is not None:
                merkez.pays = profile_data.pays
            if profile_data.adresse is not None:
                merkez.adresse = profile_data.adresse
            
            db.commit()
    
    # Return complete profile
    return await get_complete_profile(current_user, db)
