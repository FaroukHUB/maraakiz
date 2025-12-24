from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.models.eleve import Eleve
from app.models.message import Message
from app.models.planning import Planning

def count_eleves(db: Session, merkez_id: int | None = None) -> int:
    stmt = select(func.count(Eleve.id))
    if merkez_id is not None:
        stmt = stmt.where(Eleve.merkez_id == merkez_id)
    return int(db.execute(stmt).scalar_one())

def count_messages(db: Session, merkez_id: int | None = None) -> int:
    stmt = select(func.count(Message.id))
    if merkez_id is not None:
        stmt = stmt.where((Message.sender_merkez_id == merkez_id) | (Message.receiver_merkez_id == merkez_id))
    return int(db.execute(stmt).scalar_one())

def count_plannings(db: Session, merkez_id: int | None = None) -> int:
    stmt = select(func.count(Planning.id))
    if merkez_id is not None:
        stmt = stmt.where(Planning.merkez_id == merkez_id)
    return int(db.execute(stmt).scalar_one())
