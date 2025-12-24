from datetime import datetime, date
from pydantic import BaseModel, ConfigDict

class AbonnementBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    plan_name: str = "6e_mois"
    start_date: date
    end_date: date | None = None
    is_active: bool = True

class AbonnementCreate(AbonnementBase):
    merkez_id: int

class AbonnementUpdate(BaseModel):
    plan_name: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    is_active: bool | None = None

class AbonnementOut(AbonnementBase):
    id: int
    merkez_id: int
    created_at: datetime
    updated_at: datetime
