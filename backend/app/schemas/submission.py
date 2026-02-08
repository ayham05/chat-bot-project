from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional


class SubmissionCreate(BaseModel):
    problem_id: Optional[int] = None
    code: str
    problem_description: Optional[str] = None
    problem_constraints: Optional[str] = None
    problem_sample_io: Optional[list[dict]] = None
    
    # Custom validator to ensure either problem_id or problem_description is provided
    # (Skipping complex validator for now to keep it simple, logic will be in router)


class SubmissionResponse(BaseModel):
    id: UUID
    user_id: UUID
    problem_id: int
    code: str
    status: str
    ai_feedback: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class GradeResponse(BaseModel):
    submission_id: UUID
    status: str  # ACCEPTED, WRONG_ANSWER, SYNTAX_ERROR, LOGIC_ERROR
    is_correct: bool
    feedback_en: str
    feedback_ar: str
    hint: Optional[str] = None
