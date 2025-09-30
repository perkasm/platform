"""
Transaction Pydantic Schemas

These schemas are used for request/response validation and serialization.
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime


class TransactionBase(BaseModel):
    """Base transaction schema"""
    merchant_name: str = Field(..., min_length=1, max_length=200)
    category: str = Field(..., description="Transaction category (Dining, Travel, Gas, etc.)")
    amount: float = Field(..., gt=0, description="Transaction amount")
    currency: str = Field("USD", min_length=3, max_length=3)


class TransactionCreate(TransactionBase):
    """Schema for creating a transaction"""
    card_id: int = Field(..., gt=0)
    transaction_date: datetime
    description: Optional[str] = Field(None, max_length=500)
    multiplier: float = Field(1.0, ge=0, description="Points multiplier")


class TransactionResponse(TransactionBase):
    """Schema for transaction response"""
    id: int
    card_id: int
    user_id: int
    points_earned: int
    multiplier: float
    transaction_date: datetime
    description: Optional[str]
    is_pending: bool
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class TransactionList(BaseModel):
    """Schema for list of transactions"""
    transactions: list[TransactionResponse]
    total: int
    total_spent: float
    total_points_earned: int


class SpendingByCategory(BaseModel):
    """Spending breakdown by category"""
    category: str
    amount: float
    percentage: float
    transactions_count: int
    points_earned: int


class SpendingAnalytics(BaseModel):
    """Spending analytics response"""
    total_spending: float
    total_points: int
    by_category: list[SpendingByCategory]
    by_month: dict[str, float]
    top_merchants: list[dict[str, any]]
