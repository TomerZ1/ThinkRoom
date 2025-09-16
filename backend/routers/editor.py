from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session as OrmSession
from typing import Annotated
from jose import jwt, JWTError
import json
import asyncio

from db.database import get_db
from core.config import settings
from core.connection_manager import ConnectionManager
from models.session_member import SessionMember
from models.session_editor import SessionEditor

router = APIRouter(
    prefix="/editor",
    tags=["editor"]
)

manager = ConnectionManager()
editor_state: dict[int, str] = {}  # session_id -> current editor content
save_tasks: dict[int, asyncio.Task] = {}

db_dependency = Annotated[OrmSession, Depends(get_db)]

@router.websocket("/sessions/{session_id}")
async def editor_websocket(
    websocket: WebSocket,
    session_id: int,
    db: db_dependency,
):
    # Accept connection
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
        await websocket.close(code = 1008)  # Policy Violation
        return

    # Send current editor state from DB (preferred) or memory
    editor_entry = db.query(SessionEditor).filter_by(session_id=session_id).first()
    if editor_entry:
        # Load DB snapshot into memory for this session
        editor_state[session_id] = editor_entry.content
        await websocket.send_text(json.dumps({
            "type": "editor_sync",
            "content": editor_entry.content
        }))
    elif session_id in editor_state:
        await websocket.send_text(json.dumps({
            "type": "editor_sync",
            "content": editor_state[session_id]
        }))

    # register connection
    await manager.connect(session_id, websocket)

    async def periodic_save(session_id: int, db: OrmSession):
        while True:
            await asyncio.sleep(10)
            if session_id in editor_state:
                content = editor_state[session_id]
                editor_entry = db.query(SessionEditor).filter_by(session_id=session_id).first()
                if editor_entry:
                    editor_entry.content = content
                else:
                    editor_entry = SessionEditor(session_id=session_id, content=content)
                    db.add(editor_entry)
                db.commit()
    
    if session_id not in save_tasks:
        save_tasks[session_id] = asyncio.create_task(periodic_save(session_id, db))

    try: 
        while True:
            data = await websocket.receive_text()
            # TODO: connect to Monaco editor, for now just broadcast received text
            editor_state[session_id] = data # update state
            await manager.broadcast(session_id, json.dumps({ 
                "type": "editor_update",
                "user": current_user["username"],
                "content": data
            }))
    except WebSocketDisconnect:
        manager.disconnect(session_id, websocket)

        # final save on disconnect
        if session_id in editor_state:
            content = editor_state[session_id]
            editor_entry = db.query(SessionEditor).filter_by(session_id=session_id).first()
            if editor_entry:
                editor_entry.content = content
            else:
                editor_entry = SessionEditor(session_id=session_id, content=content)
                db.add(editor_entry)
            db.commit()
        
        # If no more connections for this session, cancel periodic save task
        if session_id in manager.active_connections and not manager.active_connections[session_id]:
            task = save_tasks.pop(session_id, None)
            if task:
                task.cancel()
        