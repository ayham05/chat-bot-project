from typing import Optional
from pydantic import BaseModel, Field


class GenerateProblemRequest(BaseModel):
    """Request schema for generating a new problem."""
    topic: str = Field(
        default="IO",
        description="Topic: IO, IF, LOOP, or ARRAY"
    )
    difficulty: str = Field(
        default="Easy",
        description="Difficulty: Easy, Medium, or Hard"
    )
    custom_request: Optional[str] = Field(
        default=None,
        description="Optional custom request to guide problem generation"
    )


class GeneratedProblemResponse(BaseModel):
    """Response schema for a generated problem."""
    topic: str
    difficulty: str
    title_en: str
    title_ar: str
    desc_en: str
    desc_ar: str
    input_format: Optional[str] = None
    output_format: Optional[str] = None
    constraints: Optional[str] = None
    sample_io: list[dict]
