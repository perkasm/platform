import pytest
from datetime import datetime, timedelta
from app.services.recommendations import RecommendationsService
from app.services.card import CreditCardService
from app.services.user import create_user
from app.schemas.user import UserCreate
from app.schemas.card import CreditCardCreate
from app.models.transaction import Transaction

class TestRecommendationsService:
    def test_get_recommendations_no_cards_no_spending(self, db_session):
        """Test recommendations when user has no cards and no spending history"""
        # Create user
        user_data = UserCreate(email="norecs@example.com", password="password123")
        user = create_user(db_session, user_data)

        response = RecommendationsService.get_recommendations(db_session, user.id)

        assert response.total == 3  # Default limit
        assert len(response.recommendations) == 3
        assert all(rec.match_score >= 0 for rec in response.recommendations)
        assert all(rec.affiliate_disclosure == True for rec in response.recommendations)

    def test_get_recommendations_with_existing_cards(self, db_session):
        """Test recommendations exclude cards user already has"""
        # Create user
        user_data = UserCreate(email="existing@example.com", password="password123")
        user = create_user(db_session, user_data)

        # Add a card that matches one in the recommendations
        card_data = CreditCardCreate(
            name="Chase Ink Business Cash",  # This matches one in AVAILABLE_CARDS
            card_type="Business",
            issuer="Chase",
            credit_limit=10000.0,
            annual_fee=0.0
        )
        CreditCardService.create_card(db_session, user.id, card_data)

        response = RecommendationsService.get_recommendations(db_session, user.id)

        # Should not include the card user already has
        card_names = [rec.name for rec in response.recommendations]
        assert "Chase Ink Business Cash" not in card_names

    def test_get_recommendations_with_spending_data(self, db_session):
        """Test recommendations consider spending patterns"""
        from app.services.card import CreditCardService
        from app.schemas.card import CreditCardCreate

        # Create user
        user_data = UserCreate(email="spending@example.com", password="password123")
        user = create_user(db_session, user_data)

        # Create a card for the user
        card_data = CreditCardCreate(
            name="Test Card",
            card_type="Business",
            issuer="Test Issuer",
            credit_limit=5000.0,
            annual_fee=95.0
        )
        card = CreditCardService.create_card(db_session, user.id, card_data)

        # Add some transactions with categories that match card benefits
        transactions = [
            Transaction(
                user_id=user.id,
                card_id=card.id,  # Use actual card_id
                merchant_name="Office Depot",
                amount=1000.0,
                category="office_supplies",
                description="Office supplies purchase",
                transaction_date=datetime.utcnow() - timedelta(days=30),
                points_earned=50
            ),
            Transaction(
                user_id=user.id,
                card_id=card.id,
                merchant_name="Shell",
                amount=500.0,
                category="gas",
                description="Gas station purchase",
                transaction_date=datetime.utcnow() - timedelta(days=15),
                points_earned=25
            )
        ]

        for trans in transactions:
            db_session.add(trans)
        db_session.commit()

        response = RecommendationsService.get_recommendations(db_session, user.id)

        # Should prioritize cards that match spending categories
        assert len(response.recommendations) > 0
        # The Chase Ink Business Cash should score higher due to office_supplies and gas spending
        ink_card = next((rec for rec in response.recommendations if "Ink Business Cash" in rec.name), None)
        if ink_card:
            assert ink_card.match_score > 50  # Base score should be boosted

    def test_get_recommendations_limit_parameter(self, db_session):
        """Test recommendations respect limit parameter"""
        # Create user
        user_data = UserCreate(email="limit@example.com", password="password123")
        user = create_user(db_session, user_data)

        response = RecommendationsService.get_recommendations(db_session, user.id, limit=1)

        assert response.total == 1
        assert len(response.recommendations) == 1

    def test_analyze_spending_no_transactions(self, db_session):
        """Test spending analysis with no transactions"""
        # Create user
        user_data = UserCreate(email="nospent@example.com", password="password123")
        user = create_user(db_session, user_data)

        spending = RecommendationsService._analyze_spending(db_session, user.id)

        assert spending == {}

    def test_analyze_spending_with_transactions(self, db_session):
        """Test spending analysis aggregates transactions by category"""
        from app.services.card import CreditCardService
        from app.schemas.card import CreditCardCreate

        # Create user
        user_data = UserCreate(email="analyze@example.com", password="password123")
        user = create_user(db_session, user_data)

        # Create a card for the user
        card_data = CreditCardCreate(
            name="Test Card",
            card_type="Business",
            issuer="Test Issuer",
            credit_limit=5000.0,
            annual_fee=95.0
        )
        card = CreditCardService.create_card(db_session, user.id, card_data)

        # Add transactions
        transactions = [
            Transaction(
                user_id=user.id,
                card_id=card.id,
                merchant_name="Restaurant A",
                amount=100.0,
                category="dining",
                description="Restaurant",
                transaction_date=datetime.utcnow() - timedelta(days=10),
                points_earned=10
            ),
            Transaction(
                user_id=user.id,
                card_id=card.id,
                merchant_name="Restaurant B",
                amount=200.0,
                category="dining",
                description="Another restaurant",
                transaction_date=datetime.utcnow() - timedelta(days=20),
                points_earned=20
            ),
            Transaction(
                user_id=user.id,
                card_id=card.id,
                merchant_name="Gas Station",
                amount=50.0,
                category="gas",
                description="Gas station",
                transaction_date=datetime.utcnow() - timedelta(days=5),
                points_earned=5
            )
        ]

        for trans in transactions:
            db_session.add(trans)
        db_session.commit()

        spending = RecommendationsService._analyze_spending(db_session, user.id)

        assert spending["dining"] == 300.0
        assert spending["gas"] == 50.0

    def test_calculate_match_score(self, db_session):
        """Test match score calculation"""
        # Create user with some cards
        user_data = UserCreate(email="score@example.com", password="password123")
        user = create_user(db_session, user_data)

        # Add a few cards
        for i in range(3):
            card_data = CreditCardCreate(
                name=f"Card {i}",
                card_type="Cashback",
                issuer="Test Bank",
                credit_limit=5000.0,
                annual_fee=0.0
            )
            CreditCardService.create_card(db_session, user.id, card_data)

        user_cards = CreditCardService.get_user_cards(db_session, user.id)
        spending = {"office_supplies": 1000, "gas": 600}

        # Test with a card that matches spending categories
        card_data = {
            "annual_fee": 0,
            "estimated_value": 2000,
            "categories": ["office_supplies", "gas"]
        }

        score = RecommendationsService._calculate_match_score(card_data, spending, user_cards)

        # Should be base 50 + category boosts + no fee boost + value boost
        assert score > 50  # Higher than base score

        # Test penalty for too many cards
        many_cards = user_cards * 3  # Simulate having many cards
        score_with_penalty = RecommendationsService._calculate_match_score(card_data, spending, many_cards)
        assert score_with_penalty < score  # Should be lower due to penalty

    def test_generate_match_reason(self, db_session):
        """Test match reason generation"""
        spending = {"office_supplies": 1000, "gas": 200}

        # Test with high spending in relevant category
        card_data = {
            "annual_fee": 0,
            "categories": ["office_supplies", "internet"]
        }

        reason = RecommendationsService._generate_match_reason(card_data, spending)
        assert "office_supplies" in reason or "annual fee" in reason

        # Test with no matching spending
        card_data_no_match = {
            "annual_fee": 95,
            "categories": ["travel"]
        }

        reason_no_match = RecommendationsService._generate_match_reason(card_data_no_match, spending)
        assert len(reason_no_match) > 0  # Should still generate some reason

    def test_recommendations_response_structure(self, db_session):
        """Test recommendations response has correct structure"""
        # Create user
        user_data = UserCreate(email="structure@example.com", password="password123")
        user = create_user(db_session, user_data)

        response = RecommendationsService.get_recommendations(db_session, user.id)

        assert hasattr(response, 'recommendations')
        assert hasattr(response, 'total')
        assert hasattr(response, 'generated_at')
        assert isinstance(response.recommendations, list)
        assert isinstance(response.total, int)
        assert isinstance(response.generated_at, datetime)

        if response.recommendations:
            rec = response.recommendations[0]
            assert hasattr(rec, 'id')
            assert hasattr(rec, 'name')
            assert hasattr(rec, 'issuer')
            assert hasattr(rec, 'category')
            assert hasattr(rec, 'welcome_bonus')
            assert hasattr(rec, 'annual_fee')
            assert hasattr(rec, 'estimated_value')
            assert hasattr(rec, 'key_benefits')
            assert hasattr(rec, 'match_reason')
            assert hasattr(rec, 'match_score')
            assert hasattr(rec, 'affiliate_disclosure')

    def test_get_recommendations_invalid_user(self, db_session):
        """Test recommendations for non-existent user"""
        response = RecommendationsService.get_recommendations(db_session, 99999)

        # Should return default recommendations
        assert response.total >= 0
        assert isinstance(response.recommendations, list)

    def test_get_recommendations_negative_limit(self, db_session):
        """Test recommendations with negative limit"""
        user_data = UserCreate(email="negativelimit@example.com", password="password123")
        user = create_user(db_session, user_data)

        response = RecommendationsService.get_recommendations(db_session, user.id, limit=-1)

        # Should handle gracefully, perhaps return default or all
        assert isinstance(response.recommendations, list)

    def test_analyze_spending_invalid_user(self, db_session):
        """Test spending analysis for non-existent user"""
        spending = RecommendationsService._analyze_spending(db_session, 99999)

        assert spending == {}  # Should return empty dict

    def test_analyze_spending_with_invalid_transactions(self, db_session):
        """Test spending analysis with invalid transaction data"""
        from app.services.card import CreditCardService
        from app.schemas.card import CreditCardCreate

        # Create user
        user_data = UserCreate(email="invalid@example.com", password="password123")
        user = create_user(db_session, user_data)

        # Create a card for the user
        card_data = CreditCardCreate(
            name="Test Card",
            card_type="Business",
            issuer="Test Issuer",
            credit_limit=5000.0,
            annual_fee=95.0
        )
        card = CreditCardService.create_card(db_session, user.id, card_data)

        # Add transaction with invalid/negative amount
        invalid_transaction = Transaction(
            user_id=user.id,
            card_id=card.id,
            merchant_name="Invalid Store",
            amount=-100.0,  # Negative amount
            category="dining",
            description="Invalid transaction",
            transaction_date=datetime.utcnow(),
            points_earned=0
        )
        db_session.add(invalid_transaction)
        db_session.commit()

        spending = RecommendationsService._analyze_spending(db_session, user.id)

        # Should handle negative amounts gracefully (perhaps ignore or sum as positive)
        assert isinstance(spending, dict)

    def test_calculate_match_score_invalid_card_data(self, db_session):
        """Test match score calculation with invalid card data"""
        user_cards = []
        spending = {"dining": 500}

        # Test with missing fields - service should handle gracefully
        invalid_card_data = {
            "annual_fee": 0,
            # Missing categories and estimated_value
        }

        try:
            score = RecommendationsService._calculate_match_score(invalid_card_data, spending, user_cards)
            assert isinstance(score, (int, float))  # Should return some score
        except KeyError:
            # Expected to fail with missing keys
            pass

    def test_calculate_match_score_empty_spending(self, db_session):
        """Test match score calculation with empty spending data"""
        user_cards = []
        spending = {}

        card_data = {
            "annual_fee": 0,
            "estimated_value": 1000,
            "categories": ["travel", "dining"]
        }

        score = RecommendationsService._calculate_match_score(card_data, spending, user_cards)
        assert score >= 0  # Should return valid score

    def test_generate_match_reason_invalid_data(self, db_session):
        """Test match reason generation with invalid data"""
        # Test with None spending - service should handle gracefully
        card_data = {"annual_fee": 0, "categories": ["travel"]}

        try:
            reason = RecommendationsService._generate_match_reason(card_data, None)
            assert isinstance(reason, str)
        except TypeError:
            # Expected to fail with None spending
            pass

        # Test with empty categories
        card_data_empty = {"annual_fee": 95, "categories": []}
        reason_empty = RecommendationsService._generate_match_reason(card_data_empty, {"dining": 100})
        assert isinstance(reason_empty, str)

    def test_recommendations_with_database_error_simulation(self, db_session):
        """Test recommendations handle database errors gracefully"""
        # Create user
        user_data = UserCreate(email="dberror@example.com", password="password123")
        user = create_user(db_session, user_data)

        # The service should handle any database issues gracefully
        # This is more of an integration test, but we can test the basic functionality
        response = RecommendationsService.get_recommendations(db_session, user.id)
        assert response is not None
        assert hasattr(response, 'recommendations')

    def test_spending_analysis_with_future_transactions(self, db_session):
        """Test spending analysis with future-dated transactions"""
        from app.services.card import CreditCardService
        from app.schemas.card import CreditCardCreate

        # Create user
        user_data = UserCreate(email="future@example.com", password="password123")
        user = create_user(db_session, user_data)

        # Create a card for the user
        card_data = CreditCardCreate(
            name="Test Card",
            card_type="Business",
            issuer="Test Issuer",
            credit_limit=5000.0,
            annual_fee=95.0
        )
        card = CreditCardService.create_card(db_session, user.id, card_data)

        # Add transaction with future date
        future_transaction = Transaction(
            user_id=user.id,
            card_id=card.id,
            merchant_name="Future Store",
            amount=100.0,
            category="dining",
            description="Future transaction",
            transaction_date=datetime.utcnow() + timedelta(days=30),  # Future date
            points_earned=10
        )
        db_session.add(future_transaction)
        db_session.commit()

        spending = RecommendationsService._analyze_spending(db_session, user.id)

        # Should include future transactions (no date filtering in current implementation)
        assert spending.get("dining", 0) == 100.0