from typing import List, Union
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl

class Settings(BaseSettings):
    PROJECT_NAME: str = "Perkasm Platform API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Back-end CORS origins
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []
    
    # Database settings
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = ""
    POSTGRES_DB: str = "perkasm"
    SQLALCHEMY_DATABASE_URI: str = (
        f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_SERVER}/{POSTGRES_DB}"
    )
    
    # JWT settings
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Google OAuth2 settings
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://localhost:8001/api/v1/auth/google/callback"
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()