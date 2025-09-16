from datetime import datetime
from typing import List
from sqlalchemy import String, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.database import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True) # Primary key column, auto-increment = DB will generate unique IDs
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False) 
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationship to Session model 
    sessions: Mapped[List["Session"]] = relationship("Session", back_populates="creator")
    messages: Mapped[List["Message"]] = relationship("Message", back_populates="user", cascade="all, delete-orphan")
    sessions_joined: Mapped[List["SessionMember"]] = relationship("SessionMember", back_populates="user")
    materials: Mapped[List["Material"]] = relationship("Material", back_populates="user", cascade="all, delete-orphan")