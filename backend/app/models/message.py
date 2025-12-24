from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, Integer, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

class Message(Base):
    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    # For now: Merkez <-> Merkez messaging (extend later for Eleve users if needed)
    sender_merkez_id: Mapped[int] = mapped_column(ForeignKey("merkez.id"), index=True, nullable=False)
    receiver_merkez_id: Mapped[int] = mapped_column(ForeignKey("merkez.id"), index=True, nullable=False)

    content: Mapped[str] = mapped_column(Text, nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    sender_merkez = relationship("Merkez", foreign_keys=[sender_merkez_id], back_populates="messages_sent")
    receiver_merkez = relationship("Merkez", foreign_keys=[receiver_merkez_id], back_populates="messages_received")
