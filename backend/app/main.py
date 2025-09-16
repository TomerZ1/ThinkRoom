import sys
sys.stdout.reconfigure(line_buffering=True)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db.database import SessionLocal

from routers import auth, session, message, websocket, material, editor

from models.user import User
from models.session import Session
from models.message import Message
from models.session_member import SessionMember

app = FastAPI(title="ThinkRoom API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(session.router)
app.include_router(message.router)
app.include_router(websocket.router)
app.include_router(material.router)
app.include_router(editor.router)

@app.get("/debug/db")
def debug_db():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        sessions = db.query(Session).all()
        messages = db.query(Message).all()
        members = db.query(SessionMember).all()
        return {
            "users": [{"id": u.id, "username": u.username, "email": u.email} for u in users],
            "sessions": [{"id": s.id, "title": s.title, "creator": s.created_by} for s in sessions],
            "messages": [m.content for m in messages],
            "session_members": [
                {
                    "user_id": m.user_id,
                    "username": m.user.username if m.user else None,
                    "session_id": m.session_id,
                    "session_title": m.session.title if m.session else None,
                }
                for m in members
            ],
        }
    finally:
        db.close()