"""
Dashboard Service Layer

Business logic for dashboard metrics and analytics.
"""

from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List
from datetime import datetime, timedelta

from app.models.card import CreditCard
from app.models.transaction import Transaction
from app.schemas.card import DashboardMetrics, Alert, DashboardResponse


class DashboardService:
    """Service for dashboard operations"""
    
    @staticmethod
    def get_dashboard_metrics(db: Session, user_id: int) -> DashboardMetrics:
        """Calculate dashboard metrics for a user"""
        cards = db.query(CreditCard).filter(
            CreditCard.user_id == user_id,
            CreditCard.is_active == True
        ).all()
        
        if not cards:
            return DashboardMetrics(
                total_points=0,
                total_available_credit=0.0,
                average_utilization=0.0,
                cards_count=0,
                monthly_spending=0.0,
                monthly_points_earned=0,
                estimated_annual_value=0.0
            )
        
        # Calculate totals
        total_points = sum(card.current_points for card in cards)
        total_available_credit = sum(card.available_credit for card in cards)
        total_credit_limit = sum(card.credit_limit for card in cards)
        
        # Calculate average utilization
        if total_credit_limit > 0:
            total_used_credit = sum(card.credit_limit - card.available_credit for card in cards)
            average_utilization = (total_used_credit / total_credit_limit) * 100
        else:
            average_utilization = 0.0
        
        # Get monthly spending and points
        month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        monthly_transactions = db.query(Transaction).filter(
            Transaction.user_id == user_id,
            Transaction.transaction_date >= month_start
        ).all()
        
        monthly_spending = sum(t.amount for t in monthly_transactions)
        monthly_points_earned = sum(t.points_earned for t in monthly_transactions)
        
        # Estimate annual value (simplified calculation)
        # Assume average point value of $0.015 and current rate of earning
        estimated_annual_value = (monthly_points_earned * 12 * 0.015)
        
        return DashboardMetrics(
            total_points=total_points,
            total_available_credit=total_available_credit,
            average_utilization=round(average_utilization, 2),
            cards_count=len(cards),
            monthly_spending=monthly_spending,
            monthly_points_earned=monthly_points_earned,
            estimated_annual_value=round(estimated_annual_value, 2)
        )
    
    @staticmethod
    def get_alerts(db: Session, user_id: int) -> List[Alert]:
        """Generate proactive alerts for the user"""
        alerts = []
        cards = db.query(CreditCard).filter(
            CreditCard.user_id == user_id,
            CreditCard.is_active == True
        ).all()
        
        for card in cards:
            # High utilization alert
            if card.utilization_rate > 70:
                alerts.append(Alert(
                    id=f"util_{card.id}",
                    type="warning",
                    title=f"{card.name} High Utilization",
                    message=f"You're at {card.utilization_rate:.0f}% utilization. Consider paying down balance or using another card.",
                    card_id=card.id,
                    created_at=datetime.utcnow()
                ))
            
            # Welcome bonus deadline approaching
            if card.has_welcome_bonus and card.welcome_bonus_deadline:
                days_left = (card.welcome_bonus_deadline - datetime.utcnow()).days
                if 0 < days_left < 60:
                    remaining = card.welcome_bonus_required - card.welcome_bonus_spent
                    if remaining > 0:
                        alerts.append(Alert(
                            id=f"bonus_{card.id}",
                            type="info",
                            title=f"{card.name} Welcome Bonus",
                            message=f"Spend ${remaining:,.0f} more in {days_left} days to earn your welcome bonus.",
                            card_id=card.id,
                            created_at=datetime.utcnow()
                        ))
            
            # Low points balance
            if card.current_points > 0 and card.current_points < 5000:
                alerts.append(Alert(
                    id=f"points_{card.id}",
                    type="info",
                    title=f"{card.name} Low Points Balance",
                    message=f"You have {card.current_points:,} points. Consider consolidating or using them.",
                    card_id=card.id,
                    created_at=datetime.utcnow()
                ))
        
        return alerts
    
    @staticmethod
    def get_upcoming_actions(db: Session, user_id: int) -> List[dict]:
        """Get upcoming actions the user should take"""
        actions = []
        cards = db.query(CreditCard).filter(
            CreditCard.user_id == user_id,
            CreditCard.is_active == True
        ).all()
        
        for card in cards:
            # Welcome bonus actions
            if card.has_welcome_bonus and card.welcome_bonus_deadline:
                days_left = (card.welcome_bonus_deadline - datetime.utcnow()).days
                if 0 < days_left < 90:
                    remaining = card.welcome_bonus_required - card.welcome_bonus_spent
                    if remaining > 0:
                        actions.append({
                            "title": "Complete Welcome Bonus",
                            "description": f"{card.name}",
                            "amount": f"${remaining:,.0f} remaining",
                            "deadline": f"Due in {days_left} days",
                            "card_id": card.id
                        })
        
        return actions
    
    @staticmethod
    def get_dashboard(db: Session, user_id: int) -> DashboardResponse:
        """Get complete dashboard data"""
        metrics = DashboardService.get_dashboard_metrics(db, user_id)
        alerts = DashboardService.get_alerts(db, user_id)
        upcoming_actions = DashboardService.get_upcoming_actions(db, user_id)
        
        return DashboardResponse(
            metrics=metrics,
            alerts=alerts,
            upcoming_actions=upcoming_actions
        )
