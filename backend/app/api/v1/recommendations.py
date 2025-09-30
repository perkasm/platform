"""
Recommendations API Routes

FastAPI routes for credit card recommendations.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.services.recommendations import RecommendationsService
from app.schemas.card import RecommendationsResponse

router = APIRouter()


@router.get("/", response_model=RecommendationsResponse)
async def get_recommendations(
    limit: int = Query(3, ge=1, le=10, description="Number of recommendations to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get personalized card recommendations for the authenticated user"""
    return RecommendationsService.get_recommendations(db, current_user.id, limit)
