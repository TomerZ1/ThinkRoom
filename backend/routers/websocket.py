from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session as OrmSession
from typing import Annotated, Dict, List, Any
from jose import jwt, JWTError
import json
from datetime import datetime

from db.database import get_db
from core.connection_manager import ConnectionManager
from core.config import settings

from models.session_member import SessionMember
from models.message import Message
from models.session_sketch import SessionSketch  
from models.session_editor import SessionEditor

router = APIRouter(prefix="/ws", tags=["websocket"])
manager = ConnectionManager()

db_dependency = Annotated[OrmSession, Depends(get_db)]

# In-memory event log per session
sketch_state: Dict[int, List[dict]] = {}
editor_text: Dict[int, str] = {}  # session_id -> current text  
# Video call related in-memory states
session_connected_users: Dict[int, set[int]] = {}  # session_id -> {user_id, ...}
session_user_sockets: Dict[int, Dict[int, set[WebSocket]]] = {}  # session_id -> {user_id : {sockets, ...}}
media_status: Dict[int, Dict[int, Dict[str, bool]]] = {}  # media_status[session_id][user_id] = {"mic": bool, "cam": bool}

# === Helper functions for code editor DB persistence ===
def _load_editor_from_db(db: OrmSession, session_id: int) -> str:
    rec = db.query(SessionEditor).filter_by(session_id=session_id).first()
    if not rec or rec.content in (None, "", "null"):
        return ""
    return rec.content

def _save_editor_to_db(db: OrmSession, session_id: int, text: str) -> None:
    rec = db.query(SessionEditor).filter_by(session_id=session_id).first()
    if rec:
        rec.content = text
        rec.updated_at = datetime.utcnow()
    else:
        rec = SessionEditor(session_id=session_id, content=text, updated_at=datetime.utcnow())
        db.add(rec)
    db.commit()

def _apply_delta(base: str, offset: int, length: int, insert_text: str) -> str:
    if offset <0:
        offset = 0
    if offset > len(base):
        offset = len(base)
    end = min(len(base), offset + max(0, length))
    return base[:offset] + (insert_text or "") + base[end:]

# === Helper functions for sketch DB persistence ===
def _load_sketch_list_from_db(db: OrmSession, session_id: int) -> List[dict]:
    rec = db.query(SessionSketch).filter_by(session_id=session_id).first()
    if not rec or rec.content in (None, "", "null"):
        return []
    content = rec.content
    if isinstance(content, str):
        try:
            parsed = json.loads(content)
        except json.JSONDecodeError:
            return []
    else:
        parsed = content
    if isinstance(parsed, list):
        return parsed
    if isinstance(parsed, dict):
        return [parsed]
    return []

def _save_sketch_list_to_db(db: OrmSession, session_id: int, actions: List[dict]) -> None:
    payload = json.dumps(actions, separators=(",", ":"))
    rec = db.query(SessionSketch).filter_by(session_id=session_id).first()
    if rec:
        rec.content = payload
        rec.updated_at = datetime.utcnow()
    else:
        rec = SessionSketch(session_id=session_id, content=payload, updated_at=datetime.utcnow())
        db.add(rec)
    db.commit()

def _has_connections(session_id: int) -> bool:
    conns = manager.active_connections.get(session_id)
    return bool(conns)

# === Video Call functions === #

async def _send_to_user(session_id: int, user_id: int, message: dict):
    serialized = json.dumps(message)
    buckets = session_user_sockets.get(session_id, {}).get(user_id, set())
    to_drop = []
    for ws in list(buckets):
        try:
            await ws.send_text(serialized)
        except Exception:
            to_drop.append(ws)
    for ws in to_drop:
        buckets.discard(ws)

def _coerce_int(val):
    try:
        return int(val)
    except Exception:
        return None

def _flat(data: dict) -> dict:
    """Return a dict that reads fields from top-level or content.* indistinctly."""
    c = data.get("content") if isinstance(data.get("content"), dict) else {}
    # top-level wins, falls back to content
    merged = {**c, **{k: v for k, v in data.items() if k != "content"}}
    return merged

@router.websocket("/sessions/{session_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    session_id: int,
    db: db_dependency,
):
    await websocket.accept()

    # ---- Auth ----
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=1008)
        return
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        current_user = {
            "id": int(payload.get("sub")),
            "username": payload.get("username", ""),
        }
        if current_user["id"] is None:
            await websocket.close(code=1008)
            return
    except JWTError:
        await websocket.close(code=1008)
        return

    # ---- Membership ----
    member = db.query(SessionMember).filter_by(
        session_id=session_id,
        user_id=current_user["id"],
    ).first()
    if not member:
        print(f"⛔ User {current_user['id']} not a member of session {session_id}")
        await websocket.close(code=1008)
        return

    print(f"👤 User {current_user['username']} joined session {session_id}")

    # Register connection
    await manager.connect(session_id, websocket)

    # register user socket for video call
    session_user_sockets.setdefault(session_id, {}).setdefault(current_user["id"], set()).add(websocket)
    session_connected_users.setdefault(session_id, set()).add(current_user["id"])
    media_status.setdefault(session_id, {}).setdefault(current_user["id"], {"mic": False, "cam": False})

    # Notify current presence (video)
    await websocket.send_json({
        "type": "presence",
        "users": sorted(list(session_connected_users.get(session_id, set()))),
    })
    await websocket.send_json({
        "type": "media_state_snapshot",
        "status": media_status.get(session_id, {}),
    })
    # Notify others of new user (video)
    await manager.broadcast(session_id, json.dumps({
        "type": "presence_join",
        "user_id": current_user["id"],
    }))

    # Warm memory + initial sync (sketch)
    if session_id not in sketch_state:
        sketch_state[session_id] = _load_sketch_list_from_db(db, session_id)
    await websocket.send_json({
        "type": "sketch_sync",
        "content": sketch_state[session_id],
    })

    # Warm memory + initial sync (code editor)
    if session_id not in editor_text:
        editor_text[session_id] = _load_editor_from_db(db, session_id)
    await websocket.send_json({
        "type": "editor_sync",
        "content": editor_text[session_id],
    })

    # Main loop
    try:
        while True:
            raw = await websocket.receive_text()
            # Parse JSON
            try:
                data: Dict[str, Any] = json.loads(raw)
            except json.JSONDecodeError:
                print("Invalid JSON received")
                continue

            mtype = data.get("type")

            if mtype == "chat_message":
                content = data.get("content", "")
                new_message = Message(
                    content=content,
                    session_id=session_id,
                    user_id=current_user["id"],
                )
                db.add(new_message)
                db.commit()
                db.refresh(new_message)
                await manager.broadcast(session_id, json.dumps({
                    "type": "chat_message",
                    "user": current_user["username"],
                    "content": content,
                    "id": new_message.id,
                    "created_at": new_message.created_at.isoformat(),
                }))

            elif mtype == "sketch_update":
                action = data.get("content")
                if isinstance(action, dict):
                    sketch_state.setdefault(session_id, []).append(action)
                    await manager.broadcast(session_id, json.dumps({
                        "type": "sketch_update",
                        "user": {"id": current_user["id"], "username": current_user["username"]},
                        "content": action,
                    }))

            elif mtype == "sketch_get":
                await websocket.send_json({
                    "type": "sketch_sync",
                    "content": sketch_state.get(session_id, []),
                })

            elif mtype == "sketch_clear":
                sketch_state[session_id] = []
                _save_sketch_list_to_db(db, session_id, [])  # persist immediately on clear
                await manager.broadcast(session_id, json.dumps({
                    "type": "sketch_cleared",
                    "user": {"id": current_user["id"], "username": current_user["username"]},
                }))
                print(f"🧼 Sketch cleared for session {session_id} by {current_user['username']}")

            elif mtype == "editor_get":
                await websocket.send_json({
                    "type": "editor_sync",
                    "content": editor_text.get(session_id, ""),
                })
            
            elif mtype == "editor_update":
                delta = data.get("content") or {}
                try:
                    offset = int(delta.get("offset", 0))
                    length = int(delta.get("length", 0))
                    insert_text = str(delta.get("text", ""))
                except (TypeError, ValueError):
                    print("⚠️ editor_update with invalid delta:", delta)
                    continue

                before = editor_text.get(session_id, "")
                after = _apply_delta(before, offset, length, insert_text)
                editor_text[session_id] = after

                await manager.broadcast(session_id, json.dumps({
                    "type": "editor_update",
                    "user": {"id": current_user["id"], "username": current_user["username"]},
                    "content": {
                        "offset": offset,
                        "length": length,
                        "text": insert_text,
                    },
                }))

            elif mtype == "editor_set":
                text = data.get("content")
                if isinstance(text, str):
                    editor_text[session_id] = text
                    await manager.broadcast(session_id, json.dumps({
                        "type": "editor_set",
                        "user": {"id": current_user["id"], "username": current_user["username"]},
                        "content": text,
                    }))
            
            elif mtype == "editor_clear":
                editor_text[session_id] = ""
                _save_editor_to_db(db, session_id, "")
                await manager.broadcast(session_id, json.dumps({
                    "type": "editor_cleared",
                    "user": {"id": current_user["id"], "username": current_user["username"]},
                }))
                print(f"🧼 Editor cleared for session {session_id} by {current_user['username']}")
            
            elif mtype == "presence_get":
                await websocket.send_json({
                    "type": "presence",
                    "users": sorted(list(session_connected_users.get(session_id, set()))),
                })
            
            elif mtype == "media_toggle":
                st = media_status.setdefault(session_id, {}).setdefault(current_user["id"], {"mic": False, "cam": False})
                if "micEnabled" in data:
                    st["mic"] = bool(data["micEnabled"])
                if "camEnabled" in data:
                    st["cam"] = bool(data["camEnabled"])
                await manager.broadcast(session_id, json.dumps({
                    "type": "media_state",
                    "user_id": current_user["id"],
                    "mic": st["mic"],
                    "cam": st["cam"],
                }))
            
            elif mtype == "webrtc_offer":
                f = _flat(data)
                to_user_id = _coerce_int(f.get("to_user_id"))
                sdp = f.get("sdp")
                if to_user_id is None or not isinstance(sdp, str):
                    await websocket.send_json({"type": "webrtc_error", "error": "invalid_offer"})
                    continue
                if to_user_id not in session_connected_users.get(session_id, set()):
                    await websocket.send_json({"type": "webrtc_error", "error": "target_offline"})
                    continue
                print(f"📡 Relay webrtc_offer s={session_id} from={current_user['id']} -> to={to_user_id}")
                await _send_to_user(session_id, to_user_id, {
                    "type": "webrtc_offer",
                    "from_user_id": current_user["id"],
                    "sdp": sdp,
                })

            elif mtype == "webrtc_answer":
                f = _flat(data)
                to_user_id = _coerce_int(f.get("to_user_id"))
                sdp = f.get("sdp")
                if to_user_id is None or not isinstance(sdp, str):
                    await websocket.send_json({"type": "webrtc_error", "error": "invalid_answer"})
                    continue
                if to_user_id not in session_connected_users.get(session_id, set()):
                    await websocket.send_json({"type": "webrtc_error", "error": "target_offline"})
                    continue
                print(f"📡 Relay webrtc_answer s={session_id} from={current_user['id']} -> to={to_user_id}")
                await _send_to_user(session_id, to_user_id, {
                    "type": "webrtc_answer",
                    "from_user_id": current_user["id"],
                    "sdp": sdp,
                })

            elif mtype == "webrtc_ice":
                f = _flat(data)
                to_user_id = _coerce_int(f.get("to_user_id"))
                candidate = f.get("candidate")
                if to_user_id is None or candidate is None:
                    await websocket.send_json({"type": "webrtc_error", "error": "invalid_ice"})
                    continue
                if to_user_id not in session_connected_users.get(session_id, set()):
                    await websocket.send_json({"type": "webrtc_error", "error": "target_offline"})
                    continue
                # candidate may be dict or string depending on browser; relay as-is
                print(f"📡 Relay webrtc_ice s={session_id} from={current_user['id']} -> to={to_user_id}")
                await _send_to_user(session_id, to_user_id, {
                    "type": "webrtc_ice",
                    "from_user_id": current_user["id"],
                    "candidate": candidate,
                })
            
            else:
                print("Unknown message type:", mtype)

    # Handle disconnect
    except WebSocketDisconnect:
        # Remove this WebSocket from the session fanout
        manager.disconnect(session_id, websocket)

        # Video call presence/media cleanup
        try:
            # Remove this socket from the routing map for this user
            user_map = session_user_sockets.get(session_id, {})
            user_bucket = user_map.get(current_user["id"], set())
            if websocket in user_bucket:
                user_bucket.discard(websocket)

            # If the user has NO more sockets open in this session, mark them offline
            no_more_user_sockets = not user_bucket
            if no_more_user_sockets:
                # Presence: mark offline & broadcast leave
                present = session_connected_users.get(session_id, set())
                if current_user["id"] in present:
                    present.discard(current_user["id"])
                    await manager.broadcast(session_id, json.dumps({
                        "type": "presence_leave",
                        "user_id": current_user["id"],
                    }))

                # Media: if they had mic/cam on, force to off so UIs update
                st = media_status.get(session_id, {}).get(current_user["id"])
                if st and (st.get("mic") or st.get("cam")):
                    st["mic"] = False
                    st["cam"] = False
                    await manager.broadcast(session_id, json.dumps({
                        "type": "media_state",
                        "user_id": current_user["id"],
                        "mic": False,
                        "cam": False,
                    }))

        except Exception as e:
            print("presence/media cleanup error:", e)

        # Persist sketch/editor state to DB on disconnect
        try:
            actions = sketch_state.get(session_id, [])
            _save_sketch_list_to_db(db, session_id, actions)
            print(f"💾 Saved sketch on disconnect for session {session_id} (actions={len(actions)})")
        except Exception as e:
            print("sketch save on disconnect error:", e)

        try:
            text = editor_text.get(session_id, "")
            _save_editor_to_db(db, session_id, text)
            print(f"💾 Saved editor on disconnect for session {session_id} (len={len(text)})")
        except Exception as e:
            print("editor save on disconnect error:", e)

        # if no more connections to this session, purge in-memory states
        try:
            # manager.active_connections.get(session_id) returns a list/set of sockets for this session
            if not manager.active_connections.get(session_id):
                session_user_sockets.pop(session_id, None)
                session_connected_users.pop(session_id, None)
                media_status.pop(session_id, None)
                print(f"🧹 Purged presence/media maps for empty session {session_id}")
        except Exception as e:
            print("session purge error:", e)