from typing import Annotated
import uuid
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.database import get_db
from app.models.problem import Problem
from app.models.submission import Submission
from app.models.user import User
from app.routers.auth import get_current_user, get_current_user_optional
from app.schemas.submission import SubmissionCreate, SubmissionResponse, GradeResponse
from app.services.ai_service import ai_service

router = APIRouter(prefix="/submissions", tags=["Submissions"])


@router.post("", response_model=GradeResponse, status_code=status.HTTP_201_CREATED)
async def submit_code(
    submission_data: SubmissionCreate,
    current_user: Annotated[User | None, Depends(get_current_user_optional)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Submit code for grading."""
    problem = None
    problem_desc = submission_data.problem_description
    constraints = submission_data.problem_constraints
    sample_io = submission_data.problem_sample_io or []
    
    # If problem_id is provided, fetch from DB
    if submission_data.problem_id:
        result = await db.execute(
            select(Problem).where(Problem.id == submission_data.problem_id)
        )
        problem = result.scalar_one_or_none()
        
        if problem:
            problem_desc = problem.desc_en
            constraints = problem.constraints
            sample_io = problem.sample_io
    
    # If we still don't have a description (invalid problem_id AND no dynamic description)
    if not problem_desc:
        if submission_data.problem_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Problem not found"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Either problem_id or problem_description must be provided"
            )
    
    # Grade the code using AI
    grade_result = await ai_service.grade_code(
        code=submission_data.code,
        problem_desc=problem_desc,
        constraints=constraints,
        sample_io=sample_io
    )
    
    submission_id = uuid.uuid4()
    
    # Save submission ONLY if we have a valid DB problem AND a logged-in user
    if problem and current_user:
        submission = Submission(
            user_id=current_user.id,
            problem_id=problem.id,
            code=submission_data.code,
            status=grade_result["status"],
            ai_feedback=grade_result["feedback_ar"]
        )
        db.add(submission)
        await db.commit()
        await db.refresh(submission)
        submission_id = submission.id
    
    return GradeResponse(
        submission_id=submission_id,
        status=grade_result["status"],
        is_correct=grade_result["is_correct"],
        feedback_en=grade_result["feedback_en"],
        feedback_ar=grade_result["feedback_ar"],
        hint=grade_result.get("hint")
    )


@router.get("", response_model=list[SubmissionResponse])
async def list_my_submissions(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    problem_id: int = None
):
    """List user's submissions."""
    query = select(Submission).where(Submission.user_id == current_user.id)
    
    if problem_id:
        query = query.where(Submission.problem_id == problem_id)
    
    query = query.order_by(Submission.created_at.desc()).limit(50)
    
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{submission_id}", response_model=SubmissionResponse)
async def get_submission(
    submission_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Get a specific submission."""
    result = await db.execute(
        select(Submission).where(
            Submission.id == submission_id,
            Submission.user_id == current_user.id
        )
    )
    submission = result.scalar_one_or_none()
    
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    
    return submission
