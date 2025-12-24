from pydantic import BaseModel

class EleveBase(BaseModel):
    nom: str
    email: str

class EleveCreate(EleveBase):
    pass

class EleveOut(EleveBase):
    id: int
    class Config:
        orm_mode = True
