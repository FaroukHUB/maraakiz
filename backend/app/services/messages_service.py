from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import select, or_

from app.models.message import Message

def create_message(db: Session, data: dict) -> Message:
    msg = Message(**data)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg

def get_message(db: Session, message_id: int) -> Message | None:
    return db.get(Message, message_id)

def list_messages_for_merkez(db: Session, merkez_id: int, skip: int = 0, limit: int = 200) -> list[Message]:
    stmt = (
        select(Message)
        .where(or_(Message.sender_merkez_id == merkez_id, Message.receiver_merkez_id == merkez_id))
        .order_by(Message.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return list(db.execute(stmt).scalars().all())

def list_conversation(db: Session, merkez_a: int, merkez_b: int, skip: int = 0, limit: int = 200) -> list[Message]:
    stmt = (
        select(Message)
        .where(
            or_(
                (Message.sender_merkez_id == merkez_a) & (Message.receiver_merkez_id == merkez_b),
                (Message.sender_merkez_id == merkez_b) & (Message.receiver_merkez_id == merkez_a),
            )
        )
        .order_by(Message.created_at.asc())
        .offset(skip)
        .limit(limit)
    )
    return list(db.execute(stmt).scalars().all())

def update_message(db: Session, msg: Message, data: dict) -> Message:
    for k, v in data.items():
        setattr(msg, k, v)
    msg.updated_at = datetime.utcnow()
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg

def delete_message(db: Session, msg: Message) -> None:
    db.delete(msg)
    db.commit()

def mark_as_read(db: Session, msg: Message) -> Message:
    msg.is_read = True
    msg.updated_at = datetime.utcnow()
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg
