from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.problem import Problem
from app.schemas.problem import ProblemCreate, ProblemResponse, ProblemListResponse

router = APIRouter(prefix="/problems", tags=["Problems"])


@router.get("", response_model=ProblemListResponse)
async def list_problems(
    db: Annotated[AsyncSession, Depends(get_db)],
    topic: Optional[str] = Query(None, description="Filter by topic: IO, IF, LOOP, ARRAY"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty: Easy, Medium, Hard"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100)
):
    query = select(Problem)
    count_query = select(func.count()).select_from(Problem)
    
    if topic:
        query = query.where(Problem.topic == topic)
        count_query = count_query.where(Problem.topic == topic)
    
    if difficulty:
        query = query.where(Problem.difficulty == difficulty)
        count_query = count_query.where(Problem.difficulty == difficulty)
    
    query = query.offset(skip).limit(limit)
    
    result = await db.execute(query)
    problems = result.scalars().all()
    
    count_result = await db.execute(count_query)
    total = count_result.scalar()
    
    return ProblemListResponse(problems=problems, total=total)


@router.get("/{problem_id}", response_model=ProblemResponse)
async def get_problem(
    problem_id: int,
    db: Annotated[AsyncSession, Depends(get_db)]
):
    result = await db.execute(select(Problem).where(Problem.id == problem_id))
    problem = result.scalar_one_or_none()
    
    if not problem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Problem not found"
        )
    
    return problem


@router.post("", response_model=ProblemResponse, status_code=status.HTTP_201_CREATED)
async def create_problem(
    problem_data: ProblemCreate,
    db: Annotated[AsyncSession, Depends(get_db)]
):
    problem = Problem(
        topic=problem_data.topic,
        difficulty=problem_data.difficulty,
        title_en=problem_data.title_en,
        title_ar=problem_data.title_ar,
        desc_en=problem_data.desc_en,
        desc_ar=problem_data.desc_ar,
        constraints=problem_data.constraints,
        input_format=problem_data.input_format,
        output_format=problem_data.output_format,
        sample_io=[io.model_dump() for io in problem_data.sample_io]
    )
    db.add(problem)
    await db.flush()
    await db.refresh(problem)
    return problem
