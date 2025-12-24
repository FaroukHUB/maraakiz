from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class PlanningBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    start_at: datetime
    end_at: datetime
    duration_minutes: int = 60
    is_available_slot: bool = False

class PlanningCreate(PlanningBase):
    merkez_id: int
    eleve_id: int | None = None

class PlanningUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    start_at: datetime | None = None
    end_at: datetime | None = None
    duration_minutes: int | None = None
    is_available_slot: bool | None = None
    eleve_id: int | None = None

class PlanningOut(PlanningBase):
    id: int
    merkez_id: int
    eleve_id: int | None = None
    created_at: datetime
    updated_at: datetime
