from pydantic import BaseModel, Field


class SubmitSolutionRequest(BaseModel):
    """Request schema for submitting a solution for review."""
    problem_context: str = Field(
        ...,
        description="The original problem description that the user is solving"
    )
    user_code: str = Field(
        ...,
        description="The user's submitted code to be reviewed"
    )


class SolutionFeedbackResponse(BaseModel):
    """Feedback from the Gemini code reviewer."""
    feedback: str = Field(
        ...,
        description="Markdown formatted feedback on the solution."
    )
