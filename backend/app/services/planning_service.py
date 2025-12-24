from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.planning import Planning

def create_planning(db: Session, data: dict) -> Planning:
    planning = Planning(**data)
    db.add(planning)
    db.commit()
    db.refresh(planning)
    return planning

def get_planning(db: Session, planning_id: int) -> Planning | None:
    return db.get(Planning, planning_id)

def list_plannings(db: Session, merkez_id: int | None = None, eleve_id: int | None = None, skip: int = 0, limit: int = 200) -> list[Planning]:
    stmt = select(Planning)
    if merkez_id is not None:
        stmt = stmt.where(Planning.merkez_id == merkez_id)
    if eleve_id is not None:
        stmt = stmt.where(Planning.eleve_id == eleve_id)
    stmt = stmt.order_by(Planning.start_at.desc()).offset(skip).limit(limit)
    return list(db.execute(stmt).scalars().all())

def update_planning(db: Session, planning: Planning, data: dict) -> Planning:
    for k, v in data.items():
        setattr(planning, k, v)
    planning.updated_at = datetime.utcnow()
    db.add(planning)
    db.commit()
    db.refresh(planning)
    return planning

def delete_planning(db: Session, planning: Planning) -> None:
    db.delete(planning)
    db.commit()
