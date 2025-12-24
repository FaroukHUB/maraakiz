from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict

class UserBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    email: EmailStr
    full_name: str | None = None
    is_active: bool = True
    is_admin: bool = False

class UserCreate(BaseModel):
    email: EmailStr
    full_name: str | None = None
    password: str = Field(min_length=6)

class UserOut(UserBase):
    id: int
    created_at: datetime

class UserLogin(BaseModel):
    email: EmailStr
    password: str
