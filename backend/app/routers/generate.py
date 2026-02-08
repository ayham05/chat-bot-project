from fastapi import APIRouter, HTTPException, status

from app.schemas.generate import GenerateProblemRequest, GeneratedProblemResponse
from app.services.ai_service import get_ai_service

router = APIRouter(prefix="/generate", tags=["Generate"])


@router.post("/problem", response_model=GeneratedProblemResponse)
async def generate_problem(request: GenerateProblemRequest):
    """Generate a new C++ problem using AI.
    
    This endpoint creates a new programming problem based on the specified
    topic, difficulty, and optional custom request. The problem is generated
    dynamically using AI and is not stored in the database.
    """
    try:
        ai_service = get_ai_service()
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service not configured. Please set GEMINI_API_KEY or OPENAI_API_KEY."
        )
    
    # Validate topic
    valid_topics = ["IO", "IF", "LOOP", "ARRAY"]
    if request.topic.upper() not in valid_topics:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid topic. Must be one of: {', '.join(valid_topics)}"
        )
    
    # Validate difficulty
    valid_difficulties = ["Easy", "Medium", "Hard"]
    if request.difficulty.capitalize() not in valid_difficulties:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid difficulty. Must be one of: {', '.join(valid_difficulties)}"
        )
    
    # Generate problem
    problem = await ai_service.generate_problem(
        topic=request.topic.upper(),
        difficulty=request.difficulty.capitalize(),
        custom_request=request.custom_request or ""
    )
    
    return GeneratedProblemResponse(**problem)
