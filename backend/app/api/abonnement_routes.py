from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.abonnement import AbonnementCreate, AbonnementOut, AbonnementUpdate
from app.services.abonnement_service import create_abonnement, get_abonnement, list_abonnements, update_abonnement, delete_abonnement

router = APIRouter(prefix="/abonnements", tags=["Abonnement"])

@router.post("", response_model=AbonnementOut)
def create(payload: AbonnementCreate, db: Session = Depends(get_db)):
    return create_abonnement(db, data=payload.model_dump())

@router.get("", response_model=list[AbonnementOut])
def list_all(merkez_id: int | None = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return list_abonnements(db, merkez_id=merkez_id, skip=skip, limit=limit)

@router.get("/{abonnement_id}", response_model=AbonnementOut)
def get_one(abonnement_id: int, db: Session = Depends(get_db)):
    a = get_abonnement(db, abonnement_id)
    if not a:
        raise HTTPException(status_code=404, detail="Abonnement not found")
    return a

@router.patch("/{abonnement_id}", response_model=AbonnementOut)
def patch(abonnement_id: int, payload: AbonnementUpdate, db: Session = Depends(get_db)):
    a = get_abonnement(db, abonnement_id)
    if not a:
        raise HTTPException(status_code=404, detail="Abonnement not found")
    data = {k: v for k, v in payload.model_dump().items() if v is not None}
    return update_abonnement(db, a, data=data)

@router.delete("/{abonnement_id}")
def remove(abonnement_id: int, db: Session = Depends(get_db)):
    a = get_abonnement(db, abonnement_id)
    if not a:
        raise HTTPException(status_code=404, detail="Abonnement not found")
    delete_abonnement(db, a)
    return {"ok": True}
