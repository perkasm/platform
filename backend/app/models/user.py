from sqlalchemy import Column, String, Boolean, Integer
from app.core.database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    google_id = Column(String, unique=True, index=True)
    created_at = Column(String, default=str(datetime.utcnow()))
    updated_at = Column(String, default=str(datetime.utcnow()))
    
    def __repr__(self):
        return f"<User(email='{self.email}', full_name='{self.full_name}')>"