from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.database import get_db
from app.models.chat_history import ChatHistory
from app.models.problem import Problem
from app.models.user import User
from app.routers.auth import get_current_user, get_current_user_optional
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.ai_service import ai_service

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("", response_model=ChatResponse)
async def send_message(
    request: ChatRequest,
    current_user: Annotated[User | None, Depends(get_current_user_optional)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Send a message to the AI tutor."""
    # Handle guest user (no history)
    if not current_user:
        # Get problem context if provided
        problem_context = None
        if request.problem_id:
            result = await db.execute(
                select(Problem).where(Problem.id == request.problem_id)
            )
            problem = result.scalar_one_or_none()
            if problem:
                problem_context = f"Title: {problem.title_en}\n{problem.desc_en}"
        
        # Get AI response without history
        response = await ai_service.chat(
            track=request.track,
            message=request.message,
            history=[],
            problem_context=problem_context,
            code_context=request.code_context
        )
        
        return ChatResponse(
            message=response["message"],
            message_ar=response["message_ar"],
            code_snippet=response.get("code_snippet"),
            suggestions=response.get("suggestions", [])
        )

    # Authenticated user logic
    # Get or create chat history
    result = await db.execute(
        select(ChatHistory).where(
            ChatHistory.user_id == current_user.id,
            ChatHistory.track == request.track
        ).order_by(ChatHistory.updated_at.desc()).limit(1)
    )
    chat_history = result.scalar_one_or_none()
    
    if not chat_history:
        chat_history = ChatHistory(
            user_id=current_user.id,
            track=request.track,
            messages=[]
        )
        db.add(chat_history)
    
    # Get problem context if provided
    problem_context = None
    if request.problem_id:
        result = await db.execute(
            select(Problem).where(Problem.id == request.problem_id)
        )
        problem = result.scalar_one_or_none()
        if problem:
            problem_context = f"Title: {problem.title_en}\n{problem.desc_en}"
    
    # Get AI response
    response = await ai_service.chat(
        track=request.track,
        message=request.message,
        history=chat_history.messages,
        problem_context=problem_context,
        code_context=request.code_context
    )
    
    # Update chat history
    messages = list(chat_history.messages)
    messages.append({"role": "user", "content": request.message})
    messages.append({"role": "assistant", "content": response["message"]})
    chat_history.messages = messages[-50:]  # Keep last 50 messages
    
    await db.commit()
    
    return ChatResponse(
        message=response["message"],
        message_ar=response["message_ar"],
        code_snippet=response.get("code_snippet"),
        suggestions=response.get("suggestions", [])
    )


@router.delete("/history")
async def clear_chat_history(
    track: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Clear chat history for a track."""
    result = await db.execute(
        select(ChatHistory).where(
            ChatHistory.user_id == current_user.id,
            ChatHistory.track == track
        )
    )
    history = result.scalar_one_or_none()
    
    if history:
        history.messages = []
        await db.commit()
    
    return {"status": "cleared"}
