from fastapi import APIRouter, HTTPException, status

from app.schemas.generate import GenerateProblemRequest, GeneratedProblemResponse
from app.services.ai_service import ai_service

router = APIRouter(tags=["Problems"])


@router.post("/problem", response_model=GeneratedProblemResponse)
async def generate_problem(request: GenerateProblemRequest):
    """Generate a coding problem dynamically using Google Gemini.

    Accepts any topic (e.g. "Arrays", "Strings", "Dynamic Programming")
    and a difficulty level ("Easy", "Medium", "Hard").
    """
    try:
        result = await ai_service.generate_problem(
            topic=request.topic,
            difficulty=request.difficulty,
        )
        # Map raw AI output to the frontend Problem interface
        examples = result.get("examples", [])
        sample_io = [
            {"input": ex.get("input", ""), "output": ex.get("output", "")}
            for ex in examples
        ]
        return GeneratedProblemResponse(
            title_en=result.get("title", "Untitled Problem"),
            title_ar=result.get("title_ar", ""),
            topic=request.topic,
            difficulty=request.difficulty,
            desc_en=result.get("description", ""),
            desc_ar=result.get("description_ar", ""),
            constraints=result.get("constraints", ""),
            sample_io=sample_io,
            starter_code=result.get("starter_code", ""),
        )
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
