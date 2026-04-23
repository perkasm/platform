from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from typing import Generator

# Only create engine if we have a valid database URI
try:
    SQLALCHEMY_DATABASE_URL = settings.SQLALCHEMY_DATABASE_URI
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base = declarative_base()
    database_available = True
except Exception as e:
    print(f"Database connection failed: {e}")
    engine = None
    SessionLocal = None
    Base = declarative_base()
    database_available = False

def create_tables():
    """Create all tables if they don't exist."""
    if database_available and engine is not None:
        from app.models.user import User  # noqa: F401
        from app.models.card import CreditCard  # noqa: F401
        from app.models.transaction import Transaction  # noqa: F401
        from app.models.teller import TellerEnrollment  # noqa: F401
        Base.metadata.create_all(bind=engine)

def get_db() -> Generator:
    if database_available and SessionLocal:
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()
    else:
        # Return a mock database session when database is not available
        yield None