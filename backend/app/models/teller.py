"""
Teller Enrollment Model

Stores Teller.io access tokens (enrollments) for users after they connect
their bank accounts via Teller Connect.
"""

from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime


class TellerEnrollment(Base):
    """Stores a Teller access token for a user's bank connection"""

    __tablename__ = "teller_enrollments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # From Teller Connect callback
    enrollment_id = Column(String, nullable=False, index=True)
    access_token = Column(String, nullable=False)
    institution_name = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="teller_enrollments")

    def __repr__(self):
        return f"<TellerEnrollment(user_id={self.user_id}, institution='{self.institution_name}')>"
