from datetime import datetime, date
from sqlalchemy import DateTime, ForeignKey, String, Boolean, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

class Abonnement(Base):
    __tablename__ = "abonnements"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    merkez_id: Mapped[int] = mapped_column(ForeignKey("merkez.id"), index=True, nullable=False)
    plan_name: Mapped[str] = mapped_column(String(120), default="6e_mois")

    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    merkez = relationship("Merkez", back_populates="abonnements")
