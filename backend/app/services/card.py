"""
Credit Card Service Layer

Business logic for credit card operations.
"""

from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.models.card import CreditCard
from app.models.transaction import Transaction
from app.schemas.card import (
    CreditCardCreate,
    CreditCardUpdate,
    CreditCardResponse,
    WelcomeBonusProgress
)


class CreditCardService:
    """Service for credit card operations"""
    
    @staticmethod
    def create_card(db: Session, user_id: int, card_data: CreditCardCreate) -> CreditCard:
        """Create a new credit card for a user"""
        card = CreditCard(
            user_id=user_id,
            name=card_data.name,
            card_type=card_data.card_type,
            issuer=card_data.issuer,
            network=card_data.network,
            credit_limit=card_data.credit_limit,
            available_credit=card_data.credit_limit,  # Initially full credit available
            annual_fee=card_data.annual_fee,
            last_four=card_data.last_four,
            expiration_date=card_data.expiration_date,
            has_welcome_bonus=card_data.has_welcome_bonus,
            welcome_bonus_required=card_data.welcome_bonus_required,
            welcome_bonus_deadline=card_data.welcome_bonus_deadline,
        )
        
        db.add(card)
        db.commit()
        db.refresh(card)
        return card
    
    @staticmethod
    def get_card(db: Session, card_id: int, user_id: int) -> Optional[CreditCard]:
        """Get a specific credit card by ID"""
        return db.query(CreditCard).filter(
            CreditCard.id == card_id,
            CreditCard.user_id == user_id
        ).first()
    
    @staticmethod
    def get_user_cards(db: Session, user_id: int, active_only: bool = True) -> List[CreditCard]:
        """Get all credit cards for a user"""
        query = db.query(CreditCard).filter(CreditCard.user_id == user_id)
        if active_only:
            query = query.filter(CreditCard.is_active == True)
        return query.all()
    
    @staticmethod
    def update_card(db: Session, card_id: int, user_id: int, card_data: CreditCardUpdate) -> Optional[CreditCard]:
        """Update a credit card"""
        card = CreditCardService.get_card(db, card_id, user_id)
        if not card:
            return None
        
        update_data = card_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(card, field, value)
        
        card.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(card)
        return card
    
    @staticmethod
    def delete_card(db: Session, card_id: int, user_id: int) -> bool:
        """Delete (deactivate) a credit card"""
        card = CreditCardService.get_card(db, card_id, user_id)
        if not card:
            return False
        
        card.is_active = False
        card.updated_at = datetime.utcnow()
        db.commit()
        return True
    
    @staticmethod
    def to_response(card: CreditCard) -> CreditCardResponse:
        """Convert card model to response schema"""
        welcome_bonus = None
        if card.has_welcome_bonus and card.welcome_bonus_required > 0:
            welcome_bonus = WelcomeBonusProgress(
                spent=card.welcome_bonus_spent,
                required=card.welcome_bonus_required,
                deadline=card.welcome_bonus_deadline,
                progress_percentage=card.welcome_bonus_progress
            )
        
        return CreditCardResponse(
            id=card.id,
            user_id=card.user_id,
            name=card.name,
            card_type=card.card_type,
            issuer=card.issuer,
            network=card.network,
            credit_limit=card.credit_limit,
            available_credit=card.available_credit,
            current_balance=card.current_balance,
            current_points=card.current_points,
            points_currency=card.points_currency,
            utilization_rate=card.utilization_rate,
            utilization_score=card.utilization_score,
            last_four=card.last_four,
            expiration_date=card.expiration_date,
            annual_fee=card.annual_fee,
            is_active=card.is_active,
            created_at=card.created_at,
            updated_at=card.updated_at,
            welcome_bonus_progress=welcome_bonus
        )
