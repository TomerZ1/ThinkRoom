from typing import List
from sqlalchemy import String, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from db.database import Base

class Session(Base):
    __tablename__ = "sessions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    invite_code: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False) # points to User model

    # Relationships
    creator: Mapped["User"] = relationship("User", back_populates="sessions")
    messages: Mapped[List["Message"]] = relationship("Message", back_populates="session", cascade="all, delete-orphan")
    members: Mapped[List["SessionMember"]] = relationship("SessionMember", back_populates="session", cascade="all, delete-orphan")
    materials: Mapped[List["Material"]] = relationship("Material", back_populates="session", cascade="all, delete-orphan")
    editor: Mapped["SessionEditor"] = relationship("SessionEditor", back_populates="session", uselist=False, cascade="all, delete-orphan")
    sketch: Mapped["SessionSketch"] = relationship("SessionSketch", back_populates="session", uselist=False, cascade="all, delete-orphan")
    