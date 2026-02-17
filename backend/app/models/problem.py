from typing import Optional, List, Dict, Any, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, String, Text, Integer, JSON

if TYPE_CHECKING:
    from app.models.submission import Submission


class Problem(SQLModel, table=True):
    __tablename__ = "problems"

    id: Optional[int] = Field(
        default=None,
        sa_column=Column(Integer, primary_key=True, autoincrement=True)
    )
    topic: str = Field(
        sa_column=Column(String(50), index=True, nullable=False)
    )
    difficulty: str = Field(
        sa_column=Column(String(20), nullable=False)
    )
    title_en: str = Field(
        sa_column=Column(String(255), nullable=False)
    )
    title_ar: Optional[str] = Field(
        default=None,
        sa_column=Column(String(255), nullable=True)
    )
    desc_en: str = Field(
        sa_column=Column(Text, nullable=False)
    )
    desc_ar: Optional[str] = Field(
        default=None,
        sa_column=Column(Text, nullable=True)
    )
    constraints: Optional[str] = Field(
        default=None,
        sa_column=Column(Text, nullable=True)
    )
    input_format: Optional[str] = Field(
        default=None,
        sa_column=Column(Text, nullable=True)
    )
    output_format: Optional[str] = Field(
        default=None,
        sa_column=Column(Text, nullable=True)
    )
    sample_io: Dict[str, Any] = Field(
        sa_column=Column(JSON, nullable=False)
    )

    # Relationships
    submissions: List["Submission"] = Relationship(back_populates="problem")
