"""
Chat Service Layer

Business logic for AI chat functionality.
"""

from typing import Optional
from datetime import datetime
import uuid

from app.schemas.chat import ChatRequest, ChatResponse


class ChatService:
    """Service for AI chat operations"""
    
    @staticmethod
    async def generate_response(user_id: int, request: ChatRequest) -> ChatResponse:
        """
        Generate AI response to user message
        
        In production, this would integrate with an LLM API (OpenAI, Anthropic, etc.)
        For now, we'll use rule-based responses for testing
        """
        message = request.message.lower()
        conversation_id = request.conversation_id or str(uuid.uuid4())
        
        # Generate response based on keywords
        response_content = ChatService._generate_mock_response(message)
        
        return ChatResponse(
            id=str(uuid.uuid4()),
            role="assistant",
            content=response_content,
            timestamp=datetime.utcnow(),
            conversation_id=conversation_id,
            tokens_used=len(response_content.split())
        )
    
    @staticmethod
    def _generate_mock_response(message: str) -> str:
        """Generate mock AI response based on keywords"""
        
        # Flight/travel queries
        if any(word in message for word in ["flight", "japan", "travel", "trip"]):
            return (
                "For a round-trip flight to Japan, you'll typically need 60,000-80,000 points "
                "for economy or 120,000-160,000 for business class with Chase Ultimate Rewards "
                "or American Express Membership Rewards.\n\n"
                "Best booking strategies:\n"
                "• Transfer to ANA (60k economy) or United (70k economy)\n"
                "• Book 2-3 months in advance for best availability\n"
                "• Tuesday-Thursday departures offer better value\n"
                "• Consider positioning flights to maximize points\n\n"
                "Based on your current points balance, I can help you create an optimal earning "
                "strategy to reach your goal."
            )
        
        # Dining queries
        if any(word in message for word in ["dining", "restaurant", "food", "eat"]):
            return (
                "For dining purchases, I recommend using cards with the highest dining multipliers:\n\n"
                "1. American Express Gold: 4x points on dining (up to $25,000/year)\n"
                "2. Chase Sapphire Reserve: 3x points on dining (no cap)\n"
                "3. Capital One Savor: 4% cash back on dining\n\n"
                "Pro tip: Some coffee shops and fast food may not code as 'dining', "
                "so verify with a small test purchase first. Stack with dining portals "
                "and offers for maximum rewards!"
            )
        
        # Points redemption
        if any(word in message for word in ["redeem", "use points", "cash out", "transfer"]):
            return (
                "Points redemption strategies depend on your goals:\n\n"
                "**For Travel (Best Value):**\n"
                "• Transfer to airline partners (often 1.5-2+ cents per point)\n"
                "• Book through card travel portals during bonuses\n"
                "• Look for sweet spots in award charts\n\n"
                "**For Cash:**\n"
                "• Direct cash back (typically 1 cent per point)\n"
                "• Statement credits for purchases\n"
                "• Gift cards (sometimes 10-20% discount)\n\n"
                "Current best value: Transferring Chase UR or Amex MR to airline partners "
                "for premium cabin flights can give you 2-5 cents per point value!"
            )
        
        # Card selection
        if any(word in message for word in ["which card", "what card", "best card"]):
            return (
                "The best card depends on your purchase category:\n\n"
                "• **Travel:** Chase Sapphire Reserve (3x) or Amex Platinum\n"
                "• **Dining:** Amex Gold (4x) or Chase Sapphire Reserve (3x)\n"
                "• **Gas:** Chase Ink Cash (5x, up to $25k) or Costco Visa (4%)\n"
                "• **Groceries:** Amex Gold (4x at supermarkets) or Blue Cash Preferred (6%)\n"
                "• **Everything Else:** Citi Double Cash (2%) or Chase Freedom Unlimited (1.5x)\n\n"
                "I can analyze your specific purchase and recommend the optimal card!"
            )
        
        # Welcome bonus
        if any(word in message for word in ["welcome bonus", "sign up", "new card", "bonus"]):
            return (
                "Welcome bonuses are one of the fastest ways to earn points! Here's how to maximize:\n\n"
                "1. **Plan your spend:** Know the minimum spend and deadline\n"
                "2. **Time large purchases:** Wait for a new card to meet requirements\n"
                "3. **Use shopping portals:** Stack welcome bonus with other earnings\n"
                "4. **Set reminders:** Don't miss the deadline\n"
                "5. **Prepay bills:** Utilities, insurance, etc. count toward spend\n\n"
                "Current top bonuses:\n"
                "• Chase Sapphire Preferred: 60,000 points ($4,000 spend)\n"
                "• Amex Gold: 90,000 points ($4,000 spend)\n"
                "• Capital One Venture X: 75,000 miles ($4,000 spend)"
            )
        
        # Point devaluation
        if any(word in message for word in ["devaluation", "worth less", "value"]):
            return (
                "Point devaluations happen when programs increase the points needed for redemptions. "
                "Recent notable changes:\n\n"
                "• **Delta SkyMiles (2024):** Increased award prices on popular routes by 15-30%\n"
                "• **Marriott Bonvoy (2024):** Category changes affected many properties\n"
                "• **Chase Ultimate Rewards:** Maintained strong value through transfer partners\n\n"
                "Protection strategies:\n"
                "• Diversify your points across multiple programs\n"
                "• Don't hoard points indefinitely - use them!\n"
                "• Book travel far in advance when possible\n"
                "• Monitor program announcements for changes"
            )
        
        # Default response
        return (
            "I'm your AI credit card rewards optimization assistant. I can help you with:\n\n"
            "• Choosing the right card for specific purchases\n"
            "• Maximizing points and cash back earnings\n"
            "• Optimal redemption strategies\n"
            "• Meeting welcome bonus requirements\n"
            "• Transfer partner recommendations\n"
            "• Award availability and booking strategies\n\n"
            "What would you like to know about optimizing your credit card rewards?"
        )
