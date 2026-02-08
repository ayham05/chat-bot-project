import uuid
from datetime import datetime
from sqlalchemy import String, Text, DateTime, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class Submission(Base):
    __tablename__ = "submissions"
    
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE")
    )
    problem_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("problems.id", ondelete="CASCADE")
    )
    code: Mapped[str] = mapped_column(Text)  # The submitted C++ code
    status: Mapped[str] = mapped_column(String(50))  # ACCEPTED, WRONG_ANSWER, ERROR
    ai_feedback: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )
    
    # Relationships
    user = relationship("User", back_populates="submissions")
    problem = relationship("Problem", back_populates="submissions")
