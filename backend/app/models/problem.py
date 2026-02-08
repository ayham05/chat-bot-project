from sqlalchemy import String, Text, Integer, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Problem(Base):
    __tablename__ = "problems"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    topic: Mapped[str] = mapped_column(String(50), index=True)  # IO, IF, LOOP, ARRAY
    difficulty: Mapped[str] = mapped_column(String(20))  # Easy, Medium, Hard
    title_en: Mapped[str] = mapped_column(String(255))
    title_ar: Mapped[str] = mapped_column(String(255), nullable=True)
    desc_en: Mapped[str] = mapped_column(Text)  # Markdown supported
    desc_ar: Mapped[str] = mapped_column(Text, nullable=True)  # Arabic translation
    constraints: Mapped[str] = mapped_column(Text, nullable=True)
    input_format: Mapped[str] = mapped_column(Text, nullable=True)
    output_format: Mapped[str] = mapped_column(Text, nullable=True)
    sample_io: Mapped[dict] = mapped_column(JSON)  # [{input: "5", output: "10"}]
    
    # Relationships
    submissions = relationship("Submission", back_populates="problem")
