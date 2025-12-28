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
