from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.merkez import PublicMerkez
from app.services.merkez_service import list_public_merkez_filtered, get_merkez

router = APIRouter(prefix="/public/merkez", tags=["Public Merkez"])

@router.get("", response_model=list[PublicMerkez])
def list_public(
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
    db: Session = Depends(get_db),
):
    return list_public_merkez_filtered(
        db,
        type_enseignement=type_enseignement,
        format_cours=format_cours,
        mode_enseignement=mode_enseignement,
        niveau=niveau,
        langue=langue,
        public_cible=public_cible,
        prix_min=prix_min,
        prix_max=prix_max,
        disponibilite_immediate=disponibilite_immediate,
        skip=skip,
        limit=limit,
    )

@router.get("/{merkez_id}", response_model=PublicMerkez)
def get_public_one(merkez_id: int, db: Session = Depends(get_db)):
    m = get_merkez(db, merkez_id)
    if not m or not m.is_approved:
        raise HTTPException(status_code=404, detail="Merkez not found")
    return m
