from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session as OrmSession
from typing import Annotated
from jose import jwt, JWTError
import json

from db.database import get_db
from core.config import settings
from core.connection_manager import ConnectionManager
from models.session_member import SessionMember

router = APIRouter(
    prefix="/webrtc",
    tags=["webrtc"]
)

manager = ConnectionManager()
db_dependency = Annotated[OrmSession, Depends(get_db)]

@router.websocket("/sessions/{session_id}")
async def webrtc_websocket(
    websocket: WebSocket,
    session_id: int,
    db: db_dependency,
):
    # Accept the connection
    await websocket.accept()

    # Get token from query params
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=1008) # Policy Violation
        return

    # Validate token
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        current_user = {
            "id": int(payload.get("sub")),
            "username": payload.get("username", "")
        }
        if current_user["id"] is None:
            await websocket.close(code=1008)
            return
    except JWTError:
        await websocket.close(code=1008)
        return

    # Verify user is a member of the session
    member = db.query(SessionMember).filter_by(
        session_id=session_id,
        user_id=current_user['id']
    ).first()

    if not member:
        await websocket.close(code=1008)  # Policy Violation
        return

    # Register connection
    await manager.connect(session_id, websocket)

    try:
        while True:
            # Receive signaling message (offer, answer, ice-candidate, etc.)
            data = await websocket.receive_text()

            # Broadcast it to other participants in the same session
            await manager.broadcast(session_id, json.dumps({
                "type": "webrtc_signal",
                "user": current_user["username"],
                "content": data
            }))
    except WebSocketDisconnect:
        manager.disconnect(session_id, websocket)