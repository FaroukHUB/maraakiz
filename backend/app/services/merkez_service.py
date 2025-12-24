from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.merkez import Merkez

def create_merkez(db: Session, data: dict) -> Merkez:
    merkez = Merkez(**data)
    # approval rule: can only be approved if checkbox is true
    if merkez.is_approved and not merkez.adherer_credo_case:
        merkez.is_approved = False
    db.add(merkez)
    db.commit()
    db.refresh(merkez)
    return merkez

def get_merkez(db: Session, merkez_id: int) -> Merkez | None:
    return db.get(Merkez, merkez_id)

def list_merkez(db: Session, skip: int = 0, limit: int = 50) -> list[Merkez]:
    stmt = select(Merkez).offset(skip).limit(limit).order_by(Merkez.id.desc())
    return list(db.execute(stmt).scalars().all())

def update_merkez(db: Session, merkez: Merkez, data: dict) -> Merkez:
    for k, v in data.items():
        setattr(merkez, k, v)
    merkez.updated_at = datetime.utcnow()
    # approval rule
    if getattr(merkez, "is_approved", False) and not getattr(merkez, "adherer_credo_case", False):
        merkez.is_approved = False
    db.add(merkez)
    db.commit()
    db.refresh(merkez)
    return merkez

def delete_merkez(db: Session, merkez: Merkez) -> None:
    db.delete(merkez)
    db.commit()

def list_public_merkez_filtered(
    db: Session,
    type_enseignement: str | None = None,
    format_cours: str | None = None,
    mode_enseignement: str | None = None,
    niveau: str | None = None,
    langue: str | None = None,
    public_cible: str | None = None,
    prix_min: int | None = None,
    prix_max: int | None = None,
    disponibilite_immediate: bool | None = None,
    skip: int = 0,
    limit: int = 50,
) -> list[Merkez]:
    stmt = select(Merkez).where(Merkez.is_approved == True)  # noqa: E712
    if type_enseignement:
        stmt = stmt.where(Merkez.type_enseignement == type_enseignement)
    if format_cours:
        stmt = stmt.where(Merkez.format_cours == format_cours)
    if mode_enseignement:
        stmt = stmt.where(Merkez.mode_enseignement == mode_enseignement)
    if niveau:
        stmt = stmt.where(Merkez.niveau == niveau)
    if langue:
        stmt = stmt.where(Merkez.langue == langue)
    if public_cible:
        stmt = stmt.where(Merkez.public_cible == public_cible)
    if prix_min is not None:
        stmt = stmt.where(Merkez.prix_min >= prix_min)
    if prix_max is not None:
        stmt = stmt.where(Merkez.prix_max <= prix_max)
    if disponibilite_immediate is not None:
        stmt = stmt.where(Merkez.disponibilite_immediate == disponibilite_immediate)

    stmt = stmt.order_by(Merkez.id.desc()).offset(skip).limit(limit)
    return list(db.execute(stmt).scalars().all())
