from fastapi import Depends, HTTPException, status, APIRouter
from sqlalchemy.orm import Session as OrmSession
import random, string
from typing import Annotated, List

from db.database import get_db
from core.auth import get_current_user

from schemas.session import SessionCreateRequest, SessionCreateResponse, SessionResponse, SessionJoinRequest
from schemas.message import MessageResponse

from models.session import Session
from models.message import Message
from models.session_member import SessionMember
from models.user import User


router = APIRouter(
    prefix="/sessions",
    tags=["sessions"]
)

db_dependency = Annotated[OrmSession, Depends(get_db)]
user_dependency = Annotated[dict, Depends(get_current_user)]

@router.post("/create", response_model=SessionCreateResponse, status_code=status.HTTP_201_CREATED)
def create_session(
    session_request: SessionCreateRequest,
    db: db_dependency,
    current_user: user_dependency
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Generate a unique invite code (loop is for avoiding collisions)
    while True:
        invite_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        existing = db.query(Session).filter(Session.invite_code == invite_code).first()
        if not existing:
            break

    new_session = Session(
        title=session_request.title,
        invite_code=invite_code,
        created_by=current_user.id
    )

    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    # Add the creator as a member
    creator_member = SessionMember(
        session_id=new_session.id,
        user_id=current_user.id
    )
    db.add(creator_member)
    db.commit()
    db.refresh(creator_member)

    return new_session

@router.post("/join", response_model=SessionResponse)
def join_session(
    join_request: SessionJoinRequest,
    db: db_dependency,
    current_user: user_dependency
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    session = db.query(Session).filter(Session.invite_code == join_request.invite_code).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Check if user is already a member
    existing = (
        db.query(SessionMember)
        .filter(SessionMember.session_id == session.id, SessionMember.user_id == current_user.id)
        .first()
    )

    if not existing:
        new_member = SessionMember(
            session_id=session.id,
            user_id=current_user.id
        )
        db.add(new_member)
        db.commit()
        db.refresh(new_member)

    members = [m.user for m in session.members]
    session_data = {
        "id": session.id,
        "title": session.title,
        "invite_code": session.invite_code,
        "created_at": session.created_at,
        "created_by": session.created_by,
        "members": members
    }   
    return session_data

@router.get("/mine", response_model=List[SessionResponse])
def get_my_sessions(
    db: db_dependency,
    current_user: user_dependency
):  
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    memberships = (
        db.query(SessionMember)
        .filter(SessionMember.user_id == current_user.id)
        .all()
    )

    session_ids = [m.session_id for m in memberships]
   
    sessions = (
        db.query(Session)
        .filter(Session.id.in_(session_ids))
        .all()
    )
    
    result = []
    for s in sessions:
        members = [m.user for m in s.members]
        result.append({
            "id": s.id,
            "title": s.title,
            "invite_code": s.invite_code,
            "created_at": s.created_at,
            "created_by": s.created_by,
            "members": members
        })

    return result

@router.get("/{session_id}", response_model=SessionResponse)
def get_session(
    session_id: int,
    db: db_dependency,
    current_user: user_dependency
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    session = db.query(Session).filter(Session.id == session_id).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    members = [m.user for m in session.members]
    session_data = {
        "id": session.id,
        "title": session.title,
        "invite_code": session.invite_code,
        "created_at": session.created_at,
        "created_by": session.created_by,
        "members": members
    }

    return session_data

@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_session(
    session_id: int,
    db: db_dependency,
    current_user: user_dependency
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    session = db.query(Session).filter(Session.id == session_id).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this session")

    db.delete(session)
    db.commit()
    return

@router.get("/{session_id}/messages", response_model=List[MessageResponse])
def get_session_messages(
    session_id: int,
    db: db_dependency,
    current_user: user_dependency
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # check membership
    membership = (
        db.query(SessionMember)
        .filter(SessionMember.session_id == session_id, SessionMember.user_id == current_user.id)
        .first()
    )
    if not membership:
        raise HTTPException(status_code=403, detail="Not a member of this session")

    messages = (
        db.query(Message)
        .filter(Message.session_id == session_id)
        .order_by(Message.created_at.asc())
        .all()
    )

    result = []
    for msg in messages:
        result.append({
            "id": msg.id,
            "content": msg.content,
            "session_id": msg.session_id,
            "user_id": msg.user_id,
            "username": msg.user.username, 
            "created_at": msg.created_at
        })
    return result
        