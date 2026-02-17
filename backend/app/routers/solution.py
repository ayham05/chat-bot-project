from fastapi import APIRouter, HTTPException, status

from app.schemas.solution import SubmitSolutionRequest, SolutionFeedbackResponse
from app.services.ai_service import ai_service

router = APIRouter(tags=["Solutions"])


@router.post("/submit-solution", response_model=SolutionFeedbackResponse)
async def submit_solution(request: SubmitSolutionRequest):
    """Submit user code for AI-powered review using Google Gemini.

    Evaluates correctness, time/space complexity, bugs, edge cases,
    and provides an optimized solution when applicable.
    """
    try:
        result = await ai_service.review_solution(
            problem_context=request.problem_context,
            user_code=request.user_code,
        )
        return SolutionFeedbackResponse(feedback=result)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI service error: {str(e)}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to review solution: {str(e)}",
        )
