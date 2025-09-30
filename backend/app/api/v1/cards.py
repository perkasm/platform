"""
Credit Card API Routes

FastAPI routes for credit card operations.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.services.card import CreditCardService
from app.schemas.card import (
    CreditCardCreate,
    CreditCardUpdate,
    CreditCardResponse,
    CreditCardList
)

router = APIRouter()


@router.post("/", response_model=CreditCardResponse, status_code=status.HTTP_201_CREATED)
async def create_card(
    card_data: CreditCardCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new credit card for the authenticated user"""
    try:
        card = CreditCardService.create_card(db, current_user.id, card_data)
        return CreditCardService.to_response(card)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create card: {str(e)}"
        )


@router.get("/", response_model=CreditCardList)
async def get_cards(
    active_only: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all credit cards for the authenticated user"""
    cards = CreditCardService.get_user_cards(db, current_user.id, active_only)
    card_responses = [CreditCardService.to_response(card) for card in cards]
    
    return CreditCardList(
        cards=card_responses,
        total=len(card_responses)
    )


@router.get("/{card_id}", response_model=CreditCardResponse)
async def get_card(
    card_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific credit card by ID"""
    card = CreditCardService.get_card(db, card_id, current_user.id)
    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Card not found"
        )
    
    return CreditCardService.to_response(card)


@router.put("/{card_id}", response_model=CreditCardResponse)
async def update_card(
    card_id: int,
    card_data: CreditCardUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a credit card"""
    card = CreditCardService.update_card(db, card_id, current_user.id, card_data)
    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Card not found"
        )
    
    return CreditCardService.to_response(card)


@router.delete("/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_card(
    card_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete (deactivate) a credit card"""
    success = CreditCardService.delete_card(db, card_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Card not found"
        )
    
    return None
