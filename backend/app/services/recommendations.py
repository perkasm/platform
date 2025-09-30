"""
Recommendations Service Layer

Business logic for credit card recommendations.
"""

from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.models.card import CreditCard
from app.models.transaction import Transaction
from app.schemas.card import CardRecommendation, RecommendationsResponse


class RecommendationsService:
    """Service for credit card recommendations"""
    
    # Mock recommendation data (in production, this would use ML models)
    AVAILABLE_CARDS = [
        {
            "id": "chase_ink_cash",
            "name": "Chase Ink Business Cash",
            "issuer": "Chase",
            "category": "Business",
            "welcome_bonus": "75,000 points after $7,500 spend in 3 months",
            "annual_fee": 0,
            "estimated_value": 1850,
            "key_benefits": [
                "5% on office supplies and internet",
                "5% on gas stations",
                "No annual fee",
                "Employee cards at no cost"
            ],
            "categories": ["office_supplies", "internet", "gas"]
        },
        {
            "id": "capital_one_venture_x",
            "name": "Capital One Venture X",
            "issuer": "Capital One",
            "category": "Travel",
            "welcome_bonus": "75,000 miles after $4,000 spend in 3 months",
            "annual_fee": 395,
            "estimated_value": 2100,
            "key_benefits": [
                "2x miles on everything",
                "$300 annual travel credit",
                "Priority Pass lounge access",
                "Global Entry credit"
            ],
            "categories": ["travel", "everything"]
        },
        {
            "id": "citi_double_cash",
            "name": "Citi Double Cash",
            "issuer": "Citi",
            "category": "Cashback",
            "welcome_bonus": "$200 after $1,500 spend in 6 months",
            "annual_fee": 0,
            "estimated_value": 890,
            "key_benefits": [
                "2% cash back on everything",
                "No annual fee",
                "No foreign transaction fees",
                "Simple earning structure"
            ],
            "categories": ["everything"]
        },
        {
            "id": "amex_blue_business_plus",
            "name": "American Express Blue Business Plus",
            "issuer": "American Express",
            "category": "Business",
            "welcome_bonus": "15,000 points after $3,000 spend in 3 months",
            "annual_fee": 0,
            "estimated_value": 650,
            "key_benefits": [
                "2x points on all purchases up to $50k/year",
                "No annual fee",
                "Flexible Membership Rewards",
                "Employee cards at no cost"
            ],
            "categories": ["everything", "business"]
        },
        {
            "id": "chase_freedom_unlimited",
            "name": "Chase Freedom Unlimited",
            "issuer": "Chase",
            "category": "Cashback",
            "welcome_bonus": "$200 after $500 spend in 3 months",
            "annual_fee": 0,
            "estimated_value": 750,
            "key_benefits": [
                "1.5% cash back on all purchases",
                "5% on travel through Chase portal",
                "3% on dining and drugstores",
                "No annual fee"
            ],
            "categories": ["everything", "dining", "travel"]
        }
    ]
    
    @staticmethod
    def get_recommendations(db: Session, user_id: int, limit: int = 3) -> RecommendationsResponse:
        """Get personalized card recommendations for a user"""
        user_cards = db.query(CreditCard).filter(
            CreditCard.user_id == user_id,
            CreditCard.is_active == True
        ).all()
        
        # Get spending patterns from last 3 months
        spending_by_category = RecommendationsService._analyze_spending(db, user_id)
        
        # Score each available card
        scored_recommendations = []
        for card_data in RecommendationsService.AVAILABLE_CARDS:
            # Skip if user already has this card
            if any(uc.name == card_data["name"] for uc in user_cards):
                continue
            
            # Calculate match score based on spending patterns
            match_score = RecommendationsService._calculate_match_score(
                card_data, spending_by_category, user_cards
            )
            
            # Generate personalized reason
            match_reason = RecommendationsService._generate_match_reason(
                card_data, spending_by_category
            )
            
            recommendation = CardRecommendation(
                id=card_data["id"],
                name=card_data["name"],
                issuer=card_data["issuer"],
                category=card_data["category"],
                welcome_bonus=card_data["welcome_bonus"],
                annual_fee=card_data["annual_fee"],
                estimated_value=card_data["estimated_value"],
                key_benefits=card_data["key_benefits"],
                match_reason=match_reason,
                match_score=match_score,
                affiliate_disclosure=True
            )
            scored_recommendations.append(recommendation)
        
        # Sort by match score and take top N
        scored_recommendations.sort(key=lambda x: x.match_score, reverse=True)
        top_recommendations = scored_recommendations[:limit]
        
        return RecommendationsResponse(
            recommendations=top_recommendations,
            total=len(top_recommendations),
            generated_at=datetime.utcnow()
        )
    
    @staticmethod
    def _analyze_spending(db: Session, user_id: int) -> dict:
        """Analyze user's spending patterns"""
        # Get transactions from last 3 months
        three_months_ago = datetime.utcnow().replace(day=1)
        for _ in range(3):
            if three_months_ago.month == 1:
                three_months_ago = three_months_ago.replace(year=three_months_ago.year - 1, month=12)
            else:
                three_months_ago = three_months_ago.replace(month=three_months_ago.month - 1)
        
        transactions = db.query(Transaction).filter(
            Transaction.user_id == user_id,
            Transaction.transaction_date >= three_months_ago
        ).all()
        
        # Aggregate by category
        spending_by_category = {}
        for trans in transactions:
            category = trans.category.lower()
            spending_by_category[category] = spending_by_category.get(category, 0) + trans.amount
        
        return spending_by_category
    
    @staticmethod
    def _calculate_match_score(card_data: dict, spending_by_category: dict, user_cards: List[CreditCard]) -> float:
        """Calculate how well a card matches user's spending"""
        base_score = 50.0
        
        # Boost score based on spending categories
        for category in card_data.get("categories", []):
            if category in spending_by_category:
                # Higher spending in relevant category = higher score
                spending_amount = spending_by_category[category]
                base_score += min(30, spending_amount / 100)
        
        # Boost for no annual fee
        if card_data["annual_fee"] == 0:
            base_score += 10
        
        # Boost for high estimated value
        if card_data["estimated_value"] > 1500:
            base_score += 15
        elif card_data["estimated_value"] > 1000:
            base_score += 10
        
        # Penalty if user has too many cards already
        if len(user_cards) >= 5:
            base_score -= 20
        
        return min(100.0, max(0.0, base_score))
    
    @staticmethod
    def _generate_match_reason(card_data: dict, spending_by_category: dict) -> str:
        """Generate personalized reason for recommendation"""
        reasons = []
        
        # Check for high spending in relevant categories
        for category in card_data.get("categories", []):
            if category in spending_by_category and spending_by_category[category] > 500:
                reasons.append(f"You spend heavily on {category}")
        
        # Default reasons
        if not reasons:
            if card_data["annual_fee"] == 0:
                reasons.append("No annual fee makes this a great addition")
            if "everything" in card_data.get("categories", []):
                reasons.append("Excellent catch-all card for all your purchases")
        
        return reasons[0] if reasons else "Good addition to your portfolio"
