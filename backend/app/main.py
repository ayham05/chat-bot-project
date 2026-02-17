from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import init_db
from app.routers import auth, chat, generate, problems, solution, submissions

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    yield
    # Shutdown


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Educational chatbot platform for teaching programming and robotics",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(generate.router, prefix="/api/generate")
app.include_router(problems.router, prefix="/api")
app.include_router(solution.router, prefix="/api")
app.include_router(submissions.router, prefix="/api")


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "version": settings.APP_VERSION}


@app.get("/api")
async def root():
    return {
        "message": "Welcome to CodeBot Academy API",
        "docs": "/api/docs",
        "version": settings.APP_VERSION
    }
