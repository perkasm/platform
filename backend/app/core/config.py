from typing import List, Optional, Union
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Perkasm Platform API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Back-end CORS origins
    BACKEND_CORS_ORIGINS: List[str] = []
    
    # Database settings — set DATABASE_URL directly for hosted DBs (e.g. Supabase)
    DATABASE_URL: Optional[str] = None
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "perkasm"
    POSTGRES_PASSWORD: str = "password"
    POSTGRES_DB: str = "perkasm"

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}/{self.POSTGRES_DB}"
    
    # JWT settings
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Google OAuth2 settings
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://localhost:8001/api/v1/auth/google/callback"
    FRONTEND_URL: str = "http://localhost:8080"

    # Teller.io settings
    TELLER_APPLICATION_ID: str = ""
    TELLER_CERT_PATH: str = "teller_cert.pem"
    TELLER_KEY_PATH: str = "teller_private_key.pem"
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()