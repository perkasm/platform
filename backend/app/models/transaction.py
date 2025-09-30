"""
Transaction Database Model

This model represents spending transactions made with credit cards.
"""

from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime


class Transaction(Base):
    """Transaction model for tracking credit card spending"""
    
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    card_id = Column(Integer, ForeignKey("credit_cards.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Transaction Details
    merchant_name = Column(String, nullable=False)
    category = Column(String, nullable=False)  # e.g., "Dining", "Travel", "Gas"
    amount = Column(Float, nullable=False)
    currency = Column(String, default="USD")
    
    # Points/Rewards
    points_earned = Column(Integer, default=0)
    multiplier = Column(Float, default=1.0)  # e.g., 3x points = 3.0
    
    # Transaction Metadata
    transaction_date = Column(DateTime, nullable=False)
    description = Column(String, nullable=True)
    
    # Status
    is_pending = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    card = relationship("CreditCard", back_populates="transactions")
    user = relationship("User", back_populates="transactions")
    
    def __repr__(self):
        return f"<Transaction(merchant='{self.merchant_name}', amount=${self.amount})>"
