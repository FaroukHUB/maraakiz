from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.stats import StatOut
from app.services.stats_service import count_eleves, count_messages, count_plannings

router = APIRouter(prefix="/stats", tags=["Statistiques"])

@router.get("/eleves", response_model=StatOut)
def stat_eleves(merkez_id: int | None = None, db: Session = Depends(get_db)):
    return StatOut(label="eleves", value=count_eleves(db, merkez_id=merkez_id))

@router.get("/messages", response_model=StatOut)
def stat_messages(merkez_id: int | None = None, db: Session = Depends(get_db)):
    return StatOut(label="messages", value=count_messages(db, merkez_id=merkez_id))

@router.get("/plannings", response_model=StatOut)
def stat_plannings(merkez_id: int | None = None, db: Session = Depends(get_db)):
    return StatOut(label="plannings", value=count_plannings(db, merkez_id=merkez_id))
