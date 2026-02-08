from pydantic import BaseModel
from typing import Optional


class SampleIO(BaseModel):
    input: str
    output: str


class ProblemCreate(BaseModel):
    topic: str  # IO, IF, LOOP, ARRAY
    difficulty: str  # Easy, Medium, Hard
    title_en: str
    title_ar: Optional[str] = None
    desc_en: str
    desc_ar: Optional[str] = None
    constraints: Optional[str] = None
    input_format: Optional[str] = None
    output_format: Optional[str] = None
    sample_io: list[SampleIO]


class ProblemResponse(BaseModel):
    id: int
    topic: str
    difficulty: str
    title_en: str
    title_ar: Optional[str]
    desc_en: str
    desc_ar: Optional[str]
    constraints: Optional[str]
    input_format: Optional[str]
    output_format: Optional[str]
    sample_io: list[dict]
    
    class Config:
        from_attributes = True


class ProblemListResponse(BaseModel):
    problems: list[ProblemResponse]
    total: int
