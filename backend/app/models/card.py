"""
Credit Card Database Model

This model represents a user's credit card with all relevant information
for rewards optimization and tracking.
"""

from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime


class CreditCard(Base):
    """Credit Card model for storing user credit card information"""
    
    __tablename__ = "credit_cards"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Card Information
    name = Column(String, nullable=False)  # e.g., "Chase Sapphire Reserve"
    card_type = Column(String, nullable=False)  # e.g., "Travel", "Business", "Cashback"
    issuer = Column(String, nullable=False)  # e.g., "Chase", "American Express"
    network = Column(String)  # e.g., "Visa", "Mastercard", "Amex"
    
    # Financial Information
    credit_limit = Column(Float, nullable=False)
    available_credit = Column(Float, nullable=False)
    current_balance = Column(Float, default=0.0)
    
    # Rewards Information
    current_points = Column(Integer, default=0)
    points_currency = Column(String)  # e.g., "Chase UR", "Amex MR", "Cash Back"
    
    # Welcome Bonus Tracking
    has_welcome_bonus = Column(Boolean, default=False)
    welcome_bonus_spent = Column(Float, default=0.0)
    welcome_bonus_required = Column(Float, default=0.0)
    welcome_bonus_deadline = Column(DateTime, nullable=True)
    
    # Card Details
    last_four = Column(String, nullable=True)  # Last 4 digits
    expiration_date = Column(String, nullable=True)  # MM/YY format
    annual_fee = Column(Float, default=0.0)
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="credit_cards")
    transactions = relationship("Transaction", back_populates="card", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<CreditCard(name='{self.name}', user_id={self.user_id})>"
    
    @property
    def utilization_rate(self) -> float:
        """Calculate credit utilization rate"""
        if self.credit_limit == 0:
            return 0.0
        return ((self.credit_limit - self.available_credit) / self.credit_limit) * 100
    
    @property
    def utilization_score(self) -> int:
        """Calculate utilization score (0-100)"""
        # Lower utilization is better, so invert the score
        util_rate = self.utilization_rate
        if util_rate <= 10:
            return 100
        elif util_rate <= 30:
            return 90
        elif util_rate <= 50:
            return 75
        elif util_rate <= 70:
            return 50
        else:
            return max(0, 100 - int(util_rate))
    
    @property
    def welcome_bonus_progress(self) -> float:
        """Calculate welcome bonus progress percentage"""
        if not self.has_welcome_bonus or self.welcome_bonus_required == 0:
            return 0.0
        return min(100.0, (self.welcome_bonus_spent / self.welcome_bonus_required) * 100)
