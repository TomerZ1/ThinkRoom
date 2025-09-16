from datetime import datetime
from pydantic import BaseModel

class MessageBase(BaseModel):
    content: str

class MessageCreateRequest(MessageBase):
    session_id: int 

class MessageResponse(MessageBase):
    id: int
    session_id: int
    user_id: int
    username: str
    created_at: datetime

    class Config:
        from_attributes = True