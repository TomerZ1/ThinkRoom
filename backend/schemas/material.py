from datetime import datetime
from pydantic import BaseModel

class MaterialBase(BaseModel):
    filename: str
    filepath: str

class MaterialCreate(MaterialBase):
    session_id: int

class MaterialResponse(MaterialBase):
    id: int
    user_id: int
    session_id: int
    uploaded_at: datetime

    class Config:
        from_attributes = True