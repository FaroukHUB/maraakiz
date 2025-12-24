from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.abonnement import Abonnement

def create_abonnement(db: Session, data: dict) -> Abonnement:
    abo = Abonnement(**data)
    db.add(abo)
    db.commit()
    db.refresh(abo)
    return abo

def get_abonnement(db: Session, abonnement_id: int) -> Abonnement | None:
    return db.get(Abonnement, abonnement_id)

def list_abonnements(db: Session, merkez_id: int | None = None, skip: int = 0, limit: int = 100) -> list[Abonnement]:
    stmt = select(Abonnement)
    if merkez_id is not None:
        stmt = stmt.where(Abonnement.merkez_id == merkez_id)
    stmt = stmt.order_by(Abonnement.id.desc()).offset(skip).limit(limit)
    return list(db.execute(stmt).scalars().all())

def update_abonnement(db: Session, abo: Abonnement, data: dict) -> Abonnement:
    for k, v in data.items():
        setattr(abo, k, v)
    abo.updated_at = datetime.utcnow()
    db.add(abo)
    db.commit()
    db.refresh(abo)
    return abo

def delete_abonnement(db: Session, abo: Abonnement) -> None:
    db.delete(abo)
    db.commit()
