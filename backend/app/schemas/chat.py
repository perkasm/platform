"""
Chat Pydantic Schemas

These schemas are used for chat API request/response validation.
"""

from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


class ChatMessage(BaseModel):
    """Individual chat message"""
    role: Literal["user", "assistant", "system"] = Field(..., description="Message role")
    content: str = Field(..., min_length=1, description="Message content")
    timestamp: Optional[datetime] = None


class ChatRequest(BaseModel):
    """Chat request schema"""
    message: str = Field(..., min_length=1, max_length=2000, description="User message")
    conversation_id: Optional[str] = Field(None, description="Conversation ID for context")
    include_context: bool = Field(True, description="Include user's card and spending context")


class ChatResponse(BaseModel):
    """Chat response schema"""
    id: str = Field(..., description="Message ID")
    role: Literal["assistant"] = Field("assistant", description="Response role")
    content: str = Field(..., description="AI response content")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    conversation_id: str = Field(..., description="Conversation ID")
    tokens_used: Optional[int] = Field(None, description="Tokens used for generation")


class ConversationHistory(BaseModel):
    """Conversation history response"""
    conversation_id: str
    messages: list[ChatMessage]
    created_at: datetime
    updated_at: datetime
