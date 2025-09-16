from fastapi import WebSocket
from typing import Dict, List

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, session_id: int, websocket: WebSocket):
        if session_id not in self.active_connections:
            self.active_connections[session_id] = []
        self.active_connections[session_id].append(websocket)
        print(f"✅ Now {len(self.active_connections[session_id])} connections in session {session_id}")

    def disconnect(self, session_id: int, websocket: WebSocket):
        if session_id in self.active_connections:
            if websocket in self.active_connections[session_id]:
                self.active_connections[session_id].remove(websocket)
            if not self.active_connections[session_id]:  # empty list
                del self.active_connections[session_id]

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, session_id: int, message: str):
        if session_id in self.active_connections:
            print(f"📡 Broadcasting to {len(self.active_connections.get(session_id, []))} connections in session {session_id}")
            for connection in self.active_connections[session_id]:
                await connection.send_text(message)

    