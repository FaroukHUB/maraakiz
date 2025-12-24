from datetime import datetime
from sqlalchemy import DateTime, Integer, ForeignKey, String, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

class Planning(Base):
    __tablename__ = "plannings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    merkez_id: Mapped[int] = mapped_column(ForeignKey("merkez.id"), index=True, nullable=False)
    eleve_id: Mapped[int | None] = mapped_column(ForeignKey("eleves.id"), index=True, nullable=True)

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    start_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    end_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    duration_minutes: Mapped[int] = mapped_column(Integer, default=60)
    is_available_slot: Mapped[bool] = mapped_column(Boolean, default=False)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    merkez = relationship("Merkez", back_populates="plannings")
    eleve = relationship("Eleve", back_populates="plannings")
