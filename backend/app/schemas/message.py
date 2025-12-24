from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class MessageBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    content: str = Field(min_length=1)

class MessageCreate(MessageBase):
    sender_merkez_id: int
    receiver_merkez_id: int

class MessageUpdate(BaseModel):
    content: str | None = None
    is_read: bool | None = None

class MessageOut(MessageBase):
    id: int
    sender_merkez_id: int
    receiver_merkez_id: int
    is_read: bool
    created_at: datetime
    updated_at: datetime
