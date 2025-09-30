"""
Credit Card Pydantic Schemas

These schemas are used for request/response validation and serialization.
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime


class WelcomeBonusProgress(BaseModel):
    """Welcome bonus progress information"""
    spent: float = Field(..., description="Amount spent towards welcome bonus")
    required: float = Field(..., description="Required spend for welcome bonus")
    deadline: Optional[datetime] = Field(None, description="Deadline to meet welcome bonus requirement")
    progress_percentage: float = Field(..., ge=0, le=100, description="Progress percentage (0-100)")


class CreditCardBase(BaseModel):
    """Base credit card schema with common attributes"""
    name: str = Field(..., min_length=1, max_length=100, description="Card name")
    card_type: str = Field(..., description="Card type (Travel, Business, Cashback, etc.)")
    issuer: str = Field(..., description="Card issuer (Chase, Amex, etc.)")
    network: Optional[str] = Field(None, description="Card network (Visa, Mastercard, etc.)")
    credit_limit: float = Field(..., gt=0, description="Credit limit")
    annual_fee: float = Field(0.0, ge=0, description="Annual fee")


class CreditCardCreate(CreditCardBase):
    """Schema for creating a new credit card"""
    last_four: Optional[str] = Field(None, min_length=4, max_length=4, description="Last 4 digits")
    expiration_date: Optional[str] = Field(None, pattern=r"^\d{2}/\d{2}$", description="Expiration date (MM/YY)")
    has_welcome_bonus: bool = Field(False, description="Whether card has welcome bonus")
    welcome_bonus_required: float = Field(0.0, ge=0, description="Required spend for welcome bonus")
    welcome_bonus_deadline: Optional[datetime] = Field(None, description="Welcome bonus deadline")


class CreditCardUpdate(BaseModel):
    """Schema for updating a credit card"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    card_type: Optional[str] = None
    issuer: Optional[str] = None
    network: Optional[str] = None
    credit_limit: Optional[float] = Field(None, gt=0)
    available_credit: Optional[float] = Field(None, ge=0)
    current_balance: Optional[float] = Field(None, ge=0)
    current_points: Optional[int] = Field(None, ge=0)
    annual_fee: Optional[float] = Field(None, ge=0)
    is_active: Optional[bool] = None
    welcome_bonus_spent: Optional[float] = Field(None, ge=0)


class CreditCardResponse(CreditCardBase):
    """Schema for credit card response"""
    id: int
    user_id: int
    available_credit: float
    current_balance: float
    current_points: int
    points_currency: Optional[str]
    utilization_rate: float
    utilization_score: int
    last_four: Optional[str]
    expiration_date: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime
    welcome_bonus_progress: Optional[WelcomeBonusProgress] = None
    
    model_config = ConfigDict(from_attributes=True)


class CreditCardList(BaseModel):
    """Schema for list of credit cards"""
    cards: list[CreditCardResponse]
    total: int


class DashboardMetrics(BaseModel):
    """Dashboard metrics response"""
    total_points: int = Field(..., description="Total points across all cards")
    total_available_credit: float = Field(..., description="Total available credit")
    average_utilization: float = Field(..., ge=0, le=100, description="Average utilization percentage")
    cards_count: int = Field(..., ge=0, description="Number of active cards")
    monthly_spending: float = Field(..., ge=0, description="Total spending this month")
    monthly_points_earned: int = Field(..., ge=0, description="Points earned this month")
    estimated_annual_value: float = Field(..., ge=0, description="Estimated annual value from rewards")


class Alert(BaseModel):
    """Alert message for dashboard"""
    id: str
    type: str = Field(..., pattern="^(info|warning|error|success)$")
    title: str
    message: str
    card_id: Optional[int] = None
    created_at: datetime


class DashboardResponse(BaseModel):
    """Complete dashboard response"""
    metrics: DashboardMetrics
    alerts: list[Alert]
    upcoming_actions: list[dict]


class CardRecommendation(BaseModel):
    """Card recommendation response"""
    id: str
    name: str
    issuer: str
    category: str
    welcome_bonus: str
    annual_fee: float
    estimated_value: float
    key_benefits: list[str]
    match_reason: str
    match_score: float = Field(..., ge=0, le=100)
    affiliate_disclosure: bool


class RecommendationsResponse(BaseModel):
    """Recommendations list response"""
    recommendations: list[CardRecommendation]
    total: int
    generated_at: datetime
