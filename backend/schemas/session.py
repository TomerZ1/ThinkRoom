from pydantic import BaseModel
from datetime import datetime

from schemas.user import UserResponse

class SessionBase(BaseModel):
    title: str

class SessionCreateRequest(SessionBase):
    ...

class SessionCreateResponse(SessionBase):
    id: int
    invite_code: str
    created_at: datetime
    created_by: int

    class Config:
        from_attributes = True

class SessionResponse(SessionBase):
    id: int
    invite_code: str
    created_at: datetime
    created_by: int
    members: list[UserResponse] = []

    class Config:
        from_attributes = True

class SessionJoinRequest(BaseModel):
    invite_code: str