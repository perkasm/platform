"""
Dashboard API Routes

FastAPI routes for dashboard operations.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.services.dashboard import DashboardService
from app.schemas.card import DashboardResponse, DashboardMetrics
from typing import List
from app.schemas.card import Alert

router = APIRouter()


@router.get("/", response_model=DashboardResponse)
async def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get complete dashboard data for the authenticated user"""
    return DashboardService.get_dashboard(db, current_user.id)


@router.get("/metrics", response_model=DashboardMetrics)
async def get_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get dashboard metrics only"""
    return DashboardService.get_dashboard_metrics(db, current_user.id)


@router.get("/alerts", response_model=List[Alert])
async def get_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get proactive alerts for the user"""
    return DashboardService.get_alerts(db, current_user.id)
