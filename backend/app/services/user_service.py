from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.user import User
from app.core.security import hash_password, verify_password

def get_user_by_email(db: Session, email: str) -> User | None:
    stmt = select(User).where(User.email == email)
    return db.execute(stmt).scalars().first()

def create_user(db: Session, email: str, password: str, full_name: str | None = None, is_admin: bool = False) -> User:
    user = User(email=email, full_name=full_name, hashed_password=hash_password(password), is_admin=is_admin)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = get_user_by_email(db, email=email)
    if not user:
        return None
    if not user.is_active:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user
