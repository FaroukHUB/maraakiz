from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.eleve import EleveCreate, EleveOut, EleveUpdate
from app.services.eleve_service import create_eleve, get_eleve, list_eleves, update_eleve, delete_eleve

router = APIRouter(prefix="/eleves", tags=["Eleves"])

@router.post("", response_model=EleveOut)
def create(payload: EleveCreate, db: Session = Depends(get_db)):
    return create_eleve(db, data=payload.model_dump())

@router.get("", response_model=list[EleveOut])
def list_all(merkez_id: int | None = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return list_eleves(db, merkez_id=merkez_id, skip=skip, limit=limit)

@router.get("/{eleve_id}", response_model=EleveOut)
def get_one(eleve_id: int, db: Session = Depends(get_db)):
    e = get_eleve(db, eleve_id)
    if not e:
        raise HTTPException(status_code=404, detail="Eleve not found")
    return e

@router.patch("/{eleve_id}", response_model=EleveOut)
def patch(eleve_id: int, payload: EleveUpdate, db: Session = Depends(get_db)):
    e = get_eleve(db, eleve_id)
    if not e:
        raise HTTPException(status_code=404, detail="Eleve not found")
    data = {k: v for k, v in payload.model_dump().items() if v is not None}
    return update_eleve(db, e, data=data)

@router.delete("/{eleve_id}")
def remove(eleve_id: int, db: Session = Depends(get_db)):
    e = get_eleve(db, eleve_id)
    if not e:
        raise HTTPException(status_code=404, detail="Eleve not found")
    delete_eleve(db, e)
    return {"ok": True}
