import uuid
from datetime import datetime
from typing import Optional, List, Any, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID

if TYPE_CHECKING:
    from app.models.user import User


class ChatHistory(SQLModel, table=True):
    __tablename__ = "chat_histories"

    id: Optional[uuid.UUID] = Field(
        default_factory=uuid.uuid4,
        sa_column=Column(UUID(as_uuid=True), primary_key=True)
    )
    user_id: uuid.UUID = Field(
        sa_column=Column(
            UUID(as_uuid=True),
            ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False
        )
    )
    track: str = Field(
        sa_column=Column(String(50), nullable=False)
    )
    messages: List[Any] = Field(
        default_factory=list,
        sa_column=Column(JSON, default=list)
    )
    created_at: Optional[datetime] = Field(
        default_factory=datetime.utcnow,
        sa_column=Column(DateTime, default=datetime.utcnow)
    )
    updated_at: Optional[datetime] = Field(
        default_factory=datetime.utcnow,
        sa_column=Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    )

    # Relationships
    user: Optional["User"] = Relationship(back_populates="chat_histories")
