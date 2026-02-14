from fastapi import APIRouter, HTTPException, status

from app.schemas.generate import GenerateProblemRequest, GeneratedProblemResponse
from app.services.ai_service import get_ai_service

router = APIRouter(tags=["Problems"])


@router.post("/problem", response_model=GeneratedProblemResponse)
async def generate_problem(request: GenerateProblemRequest):
    """Generate a coding problem dynamically using Google Gemini.

    Accepts any topic (e.g. "Arrays", "Strings", "Dynamic Programming")
    and a difficulty level ("Easy", "Medium", "Hard").
    """
    try:
        ai_service = get_ai_service()
        result = await ai_service.generate_problem(
            topic=request.topic,
            difficulty=request.difficulty,
        )
        return GeneratedProblemResponse(**result)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI service error: {str(e)}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate problem: {str(e)}",
        )
