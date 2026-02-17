import uuid
from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.problem import Problem


class Submission(SQLModel, table=True):
    __tablename__ = "submissions"

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
    problem_id: int = Field(
        sa_column=Column(
            Integer,
            ForeignKey("problems.id", ondelete="CASCADE"),
            nullable=False
        )
    )
    code: str = Field(
        sa_column=Column(Text, nullable=False)
    )
    status: str = Field(
        sa_column=Column(String(50), nullable=False)
    )
    ai_feedback: Optional[str] = Field(
        default=None,
        sa_column=Column(Text, nullable=True)
    )
    created_at: Optional[datetime] = Field(
        default_factory=datetime.utcnow,
        sa_column=Column(DateTime, default=datetime.utcnow)
    )

    # Relationships
    user: Optional["User"] = Relationship(back_populates="submissions")
    problem: Optional["Problem"] = Relationship(back_populates="submissions")
