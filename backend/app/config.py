from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "CodeBot Academy"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@db:5432/codebot"
    
    # JWT
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    # AI Configuration
    AI_PROVIDER: str = "gemini"  # "openai" or "gemini"
    OPENAI_API_KEY: Optional[str] = None
    GOOGLE_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    
    @property
    def final_gemini_key(self) -> Optional[str]:
        """Get the effective Gemini API key."""
        return self.GEMINI_API_KEY or self.GOOGLE_API_KEY
    AI_MODEL: str = "gemini-flash-latest"
    
    # CORS
    CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()
