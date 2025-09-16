# ThinkRoom 🎓💻

A **1:1 tutoring platform** built for ** Computer Science private lessons **.  
ThinkRoom enables students and tutors to collaborate in real time with chat, code editor, sketch canvas, materials library, and integrated video/audio calls.

---

## ✨ Features

- 🔒 **Secure Sessions** — JWT auth, invite-code joins, and protected routes
- 💬 **Real-Time Chat** — WebSocket channels with persisted messages (PostgreSQL + SQLAlchemy)
- 📝 **Collaborative Code Editor** — live typing, language/theme settings, persistence in DB
- 🎨 **Sketch Canvas** — synchronized drawing with eraser, colors, grid options
- 📂 **Materials Library** — upload/download files for each session
- 🎥 **Video & Audio Chat** — peer-to-peer calls with mute/camera toggle
- 📊 **Session Persistence** — PostgreSQL storage, Redis caching, migrations via Alembic
- 🐳 **Dockerized** — easy setup with Docker Compose (frontend + backend + DB + Redis)

---

## 🛠️ Tech Stack

**Frontend**
- ![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=white&style=for-the-badge)
- ![JavaScript](https://img.shields.io/badge/-JavaScript-F7DF1E?logo=javascript&logoColor=black&style=for-the-badge)
- ![Vite](https://img.shields.io/badge/-Vite-646CFF?logo=vite&logoColor=white&style=for-the-badge)
- ![Axios](https://img.shields.io/badge/-Axios-5A29E4?logo=axios&logoColor=white&style=for-the-badge)
- ![CSS3](https://img.shields.io/badge/-CSS3-1572B6?logo=css3&logoColor=white&style=for-the-badge)

**Backend**
- ![Python](https://img.shields.io/badge/-Python-3776AB?logo=python&logoColor=white&style=for-the-badge)
- ![FastAPI](https://img.shields.io/badge/-FastAPI-009688?logo=fastapi&logoColor=white&style=for-the-badge)
- ![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-4169E1?logo=postgresql&logoColor=white&style=for-the-badge)
- ![Redis](https://img.shields.io/badge/-Redis-DC382D?logo=redis&logoColor=white&style=for-the-badge)
- ![SQLAlchemy](https://img.shields.io/badge/-SQLAlchemy-333?logo=python&logoColor=white&style=for-the-badge)
- ![Alembic](https://img.shields.io/badge/-Alembic-444?logo=python&logoColor=white&style=for-the-badge)

**DevOps / Infra**
- ![Docker](https://img.shields.io/badge/-Docker-2496ED?logo=docker&logoColor=white&style=for-the-badge)
- ![Git](https://img.shields.io/badge/-Git-F05032?logo=git&logoColor=white&style=for-the-badge)

---

## 🚀 Getting Started

### Prerequisites
- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
- Node.js v18+
- Python 3.12+

### Run with Docker
```bash
docker compose up -d

*not finished yet
