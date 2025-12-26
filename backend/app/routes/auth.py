from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from typing import Optional
import os

from app.database import get_db
from app.models.user import User
from app.models.merkez import Merkez

router = APIRouter()

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)

# OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# Pydantic schemas
class UserRegister(BaseModel):
    nom: str
    email: EmailStr
    password: str
    telephone: Optional[str] = None
    type: str  # "professeur", "institut", "eleve"

class UserResponse(BaseModel):
    id: int
    email: str
    nom: str
    type: str
    merkez_id: Optional[int] = None

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


# Helper functions
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# Routes
@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """
    Register a new user (professeur, institut, or eleve)
    """
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Un compte avec cet email existe déjà"
        )

    # Check if email exists in merkez table
    existing_merkez = db.query(Merkez).filter(Merkez.email == user_data.email).first()
    if existing_merkez:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Un compte avec cet email existe déjà"
        )

    # Map frontend type to database user_type
    user_type_map = {
        "professeur": "prof",
        "institut": "prof",  # Instituts are also stored as "prof" in user table
        "eleve": "eleve"
    }
    user_type = user_type_map.get(user_data.type, "eleve")

    # Create user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.nom,
        user_type=user_type
    )

    db.add(new_user)
    db.flush()  # Get the user ID without committing

    # If professeur or institut, create merkez entry
    merkez_id = None
    if user_data.type in ["professeur", "institut"]:
        new_merkez = Merkez(
            type=user_data.type,
            nom=user_data.nom,
            email=user_data.email,
            telephone=user_data.telephone,
            actif=True,
            verifie=False,
            nouveau=True,
            abonnement_actif=False  # Requires subscription
        )
        db.add(new_merkez)
        db.flush()

        # Link user to merkez
        new_user.merkez_id = new_merkez.id
        merkez_id = new_merkez.id

    db.commit()
    db.refresh(new_user)

    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": new_user.email, "user_id": new_user.id},
        expires_delta=access_token_expires
    )

    # Return token and user info
    user_response = UserResponse(
        id=new_user.id,
        email=new_user.email,
        nom=new_user.full_name,
        type=user_data.type,  # Return original type from frontend
        merkez_id=merkez_id
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        user=user_response
    )


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Login with email and password (OAuth2 format)
    """
    # Find user by email
    user = db.query(User).filter(User.email == form_data.username).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Compte désactivé"
        )

    # Determine frontend type
    frontend_type = "eleve"
    if user.user_type == "prof" and user.merkez_id:
        # Get merkez to determine if professeur or institut
        merkez = db.query(Merkez).filter(Merkez.id == user.merkez_id).first()
        if merkez:
            frontend_type = merkez.type  # "professeur" or "institut"

    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id},
        expires_delta=access_token_expires
    )

    # Return token and user info
    user_response = UserResponse(
        id=user.id,
        email=user.email,
        nom=user.full_name or "",
        type=frontend_type,
        merkez_id=user.merkez_id
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        user=user_response
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """
    Get current user from JWT token
    """
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

    # Determine frontend type
    frontend_type = "eleve"
    if user.user_type == "prof" and user.merkez_id:
        merkez = db.query(Merkez).filter(Merkez.id == user.merkez_id).first()
        if merkez:
            frontend_type = merkez.type

    return UserResponse(
        id=user.id,
        email=user.email,
        nom=user.full_name or "",
        type=frontend_type,
        merkez_id=user.merkez_id
    )
