from pydantic import BaseModel
from typing import Literal, Optional
from uuid import UUID


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    track: Literal["problem_solving", "robotics"]
    message: str
    problem_id: Optional[int] = None  # For context in problem solving
    code_context: Optional[str] = None  # Current code being worked on


class ChatResponse(BaseModel):
    message: str
    message_ar: str  # Arabic translation
    code_snippet: Optional[str] = None  # Optional code example
    suggestions: list[str] = []  # Follow-up suggestions
