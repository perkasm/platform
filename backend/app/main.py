from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import create_tables
from app.api.v1 import api_router

create_tables()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="A modular FastAPI application with JWT authentication",
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {"message": "Welcome to the FastAPI application"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}