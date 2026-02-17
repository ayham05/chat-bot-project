import uuid
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID

if TYPE_CHECKING:
    from app.models.submission import Submission
    from app.models.chat_history import ChatHistory


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[uuid.UUID] = Field(
        default_factory=uuid.uuid4,
        sa_column=Column(UUID(as_uuid=True), primary_key=True)
    )
    username: str = Field(
        sa_column=Column(String(100), unique=True, index=True, nullable=False)
    )
    email: str = Field(
        sa_column=Column(String(255), unique=True, index=True, nullable=False)
    )
    password_hash: str = Field(
        sa_column=Column(String(255), nullable=False)
    )
    created_at: Optional[datetime] = Field(
        default_factory=datetime.utcnow,
        sa_column=Column(DateTime, default=datetime.utcnow)
    )

    # Relationships
    submissions: List["Submission"] = Relationship(back_populates="user")
    chat_histories: List["ChatHistory"] = Relationship(back_populates="user")
