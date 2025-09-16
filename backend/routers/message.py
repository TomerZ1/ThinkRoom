from fastapi import Depends, HTTPException, status, APIRouter
from sqlalchemy.orm import Session as OrmSession
from typing import Annotated

from db.database import get_db
from core.auth import get_current_user

from models.message import Message
from models.session_member import SessionMember

from schemas.message import MessageCreateRequest, MessageResponse

router = APIRouter(prefix="/messages", tags=["messages"])

db_dependency = Annotated[OrmSession, Depends(get_db)]
user_dependency = Annotated[dict, Depends(get_current_user)]


@router.post("/create", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def create_message(
    message: MessageCreateRequest,
    db: db_dependency,
    current_user: user_dependency
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Verify session membership
    membership = (
        db.query(SessionMember) 
        .filter(
            SessionMember.session_id == message.session_id,
            SessionMember.user_id == current_user.id
        )
        .first()
    )
    if not membership:
        raise HTTPException(status_code=403, detail="Not authorized to post in this session")

    db_message = Message(
        content=message.content,
        session_id=message.session_id,
        user_id=current_user.id
    )


    db.add(db_message)
    db.commit()
    db.refresh(db_message)

    return {
        "id": db_message.id,
        "content": db_message.content,
        "session_id": db_message.session_id,
        "user_id": db_message.user_id,
        "username": current_user.username,
        "created_at": db_message.created_at,
    }