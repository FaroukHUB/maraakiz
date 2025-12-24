from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.eleve import Eleve

def create_eleve(db: Session, data: dict) -> Eleve:
    eleve = Eleve(**data)
    db.add(eleve)
    db.commit()
    db.refresh(eleve)
    return eleve

def get_eleve(db: Session, eleve_id: int) -> Eleve | None:
    return db.get(Eleve, eleve_id)

def list_eleves(db: Session, merkez_id: int | None = None, skip: int = 0, limit: int = 100) -> list[Eleve]:
    stmt = select(Eleve)
    if merkez_id is not None:
        stmt = stmt.where(Eleve.merkez_id == merkez_id)
    stmt = stmt.order_by(Eleve.id.desc()).offset(skip).limit(limit)
    return list(db.execute(stmt).scalars().all())

def update_eleve(db: Session, eleve: Eleve, data: dict) -> Eleve:
    for k, v in data.items():
        setattr(eleve, k, v)
    eleve.updated_at = datetime.utcnow()
    db.add(eleve)
    db.commit()
    db.refresh(eleve)
    return eleve

def delete_eleve(db: Session, eleve: Eleve) -> None:
    db.delete(eleve)
    db.commit()
