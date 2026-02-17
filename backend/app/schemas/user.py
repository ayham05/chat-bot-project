from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: UUID
    username: str
    email: str
    created_at: datetime
    
    """allows Pydantic to bridge the gap between Database Objects and JSON Data"""
    class Config:  
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: UUID | None = None
