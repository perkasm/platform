"""
Chat API Routes

FastAPI routes for AI chat functionality.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.services.chat import ChatService
from app.schemas.chat import ChatRequest, ChatResponse

router = APIRouter()


@router.post("/", response_model=ChatResponse, status_code=status.HTTP_200_OK)
async def send_message(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Send a message to the AI assistant and get a response
    
    The AI assistant can help with:
    - Credit card optimization strategies
    - Points redemption advice
    - Card selection for specific purchases
    - Welcome bonus tracking
    - Travel booking strategies
    """
    return await ChatService.generate_response(current_user.id, request)
