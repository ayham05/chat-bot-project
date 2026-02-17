from pydantic import BaseModel, Field


class Example(BaseModel):
    """A single input/output example for a coding problem."""
    input: str
    output: str
    explanation: str = ""


class GenerateProblemRequest(BaseModel):
    """Request schema for generating a new problem via Gemini."""
    topic: str = Field(
        ...,
        description="The coding topic, e.g. 'Arrays', 'Strings', 'Dynamic Programming'",
        examples=["Arrays", "Linked Lists", "Recursion"]
    )
    difficulty: str = Field(
        ...,
        description="Difficulty level: Easy, Medium, or Hard",
        examples=["Easy", "Medium", "Hard"]
    )


class GeneratedProblemResponse(BaseModel):
    """Response schema matching the frontend Problem interface."""
    title_en: str
    title_ar: str = ""
    topic: str
    difficulty: str
    desc_en: str
    desc_ar: str = ""
    constraints: str = ""
    input_format: str = ""
    output_format: str = ""
    sample_io: list[Example]
    starter_code: str = ""
