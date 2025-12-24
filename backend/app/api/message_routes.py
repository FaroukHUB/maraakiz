from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.message import MessageCreate, MessageOut, MessageUpdate
from app.services.messages_service import (
    create_message,
    get_message,
    list_messages_for_merkez,
    list_conversation,
    update_message,
    delete_message,
    mark_as_read,
)

router = APIRouter(prefix="/messages", tags=["Messagerie"])

@router.post("", response_model=MessageOut)
def create(payload: MessageCreate, db: Session = Depends(get_db)):
    return create_message(db, data=payload.model_dump())

@router.get("", response_model=list[MessageOut])
def list_for_merkez(merkez_id: int, skip: int = 0, limit: int = 200, db: Session = Depends(get_db)):
    return list_messages_for_merkez(db, merkez_id=merkez_id, skip=skip, limit=limit)

@router.get("/conversation", response_model=list[MessageOut])
def conversation(merkez_a: int, merkez_b: int, skip: int = 0, limit: int = 200, db: Session = Depends(get_db)):
    return list_conversation(db, merkez_a=merkez_a, merkez_b=merkez_b, skip=skip, limit=limit)

@router.get("/{message_id}", response_model=MessageOut)
def get_one(message_id: int, db: Session = Depends(get_db)):
    m = get_message(db, message_id)
    if not m:
        raise HTTPException(status_code=404, detail="Message not found")
    return m

@router.patch("/{message_id}", response_model=MessageOut)
def patch(message_id: int, payload: MessageUpdate, db: Session = Depends(get_db)):
    m = get_message(db, message_id)
    if not m:
        raise HTTPException(status_code=404, detail="Message not found")
    data = {k: v for k, v in payload.model_dump().items() if v is not None}
    return update_message(db, m, data=data)

@router.patch("/{message_id}/read", response_model=MessageOut)
def set_read(message_id: int, db: Session = Depends(get_db)):
    m = get_message(db, message_id)
    if not m:
        raise HTTPException(status_code=404, detail="Message not found")
    return mark_as_read(db, m)

@router.delete("/{message_id}")
def remove(message_id: int, db: Session = Depends(get_db)):
    m = get_message(db, message_id)
    if not m:
        raise HTTPException(status_code=404, detail="Message not found")
    delete_message(db, m)
    return {"ok": True}
