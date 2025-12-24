from pydantic import BaseModel

class StatOut(BaseModel):
    label: str
    value: int
