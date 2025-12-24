from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.planning import PlanningCreate, PlanningOut, PlanningUpdate
from app.services.planning_service import create_planning, get_planning, list_plannings, update_planning, delete_planning

router = APIRouter(prefix="/plannings", tags=["Plannings"])

@router.post("", response_model=PlanningOut)
def create(payload: PlanningCreate, db: Session = Depends(get_db)):
    return create_planning(db, data=payload.model_dump())

@router.get("", response_model=list[PlanningOut])
def list_all(merkez_id: int | None = None, eleve_id: int | None = None, skip: int = 0, limit: int = 200, db: Session = Depends(get_db)):
    return list_plannings(db, merkez_id=merkez_id, eleve_id=eleve_id, skip=skip, limit=limit)

@router.get("/{planning_id}", response_model=PlanningOut)
def get_one(planning_id: int, db: Session = Depends(get_db)):
    p = get_planning(db, planning_id)
    if not p:
        raise HTTPException(status_code=404, detail="Planning not found")
    return p

@router.patch("/{planning_id}", response_model=PlanningOut)
def patch(planning_id: int, payload: PlanningUpdate, db: Session = Depends(get_db)):
    p = get_planning(db, planning_id)
    if not p:
        raise HTTPException(status_code=404, detail="Planning not found")
    data = {k: v for k, v in payload.model_dump().items() if v is not None}
    return update_planning(db, p, data=data)

@router.delete("/{planning_id}")
def remove(planning_id: int, db: Session = Depends(get_db)):
    p = get_planning(db, planning_id)
    if not p:
        raise HTTPException(status_code=404, detail="Planning not found")
    delete_planning(db, p)
    return {"ok": True}
