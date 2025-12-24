from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.token import TokenOut
from app.schemas.user import UserCreate, UserOut
from app.services.user_service import create_user, get_user_by_email, authenticate_user
from app.core.security import create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=UserOut)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    existing = get_user_by_email(db, email=str(payload.email))
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = create_user(db, email=str(payload.email), password=payload.password, full_name=payload.full_name)
    return user

@router.post("/login", response_model=TokenOut)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, email=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    token = create_access_token(subject=user.email, extra={"uid": user.id, "admin": user.is_admin})
    return TokenOut(access_token=token)
