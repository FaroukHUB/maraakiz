from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.merkez import MerkezCreate, MerkezOut, MerkezUpdate
from app.services.merkez_service import create_merkez, get_merkez, list_merkez, update_merkez, delete_merkez

router = APIRouter(prefix="/merkez", tags=["Merkez"])

@router.post("", response_model=MerkezOut)
def create(payload: MerkezCreate, db: Session = Depends(get_db)):
    return create_merkez(db, data=payload.model_dump())

@router.get("", response_model=list[MerkezOut])
def list_all(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return list_merkez(db, skip=skip, limit=limit)

@router.get("/{merkez_id}", response_model=MerkezOut)
def get_one(merkez_id: int, db: Session = Depends(get_db)):
    m = get_merkez(db, merkez_id)
    if not m:
        raise HTTPException(status_code=404, detail="Merkez not found")
    return m

@router.patch("/{merkez_id}", response_model=MerkezOut)
def patch(merkez_id: int, payload: MerkezUpdate, db: Session = Depends(get_db)):
    m = get_merkez(db, merkez_id)
    if not m:
        raise HTTPException(status_code=404, detail="Merkez not found")
    data = {k: v for k, v in payload.model_dump().items() if v is not None}
    return update_merkez(db, m, data=data)

@router.delete("/{merkez_id}")
def remove(merkez_id: int, db: Session = Depends(get_db)):
    m = get_merkez(db, merkez_id)
    if not m:
        raise HTTPException(status_code=404, detail="Merkez not found")
    delete_merkez(db, m)
    return {"ok": True}
