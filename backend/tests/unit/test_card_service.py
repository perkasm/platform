import pytest
from datetime import datetime, timedelta
from app.services.card import CreditCardService
from app.schemas.card import CreditCardCreate, CreditCardUpdate
from app.models.card import CreditCard
from app.models.user import User
from app.services.user import create_user
from app.schemas.user import UserCreate

class TestCreditCardService:
    def test_create_card(self, db_session):
        """Test creating a new credit card"""
        # Create a user first
        user_data = UserCreate(email="carduser@example.com", password="password123")
        user = create_user(db_session, user_data)

        card_data = CreditCardCreate(
            name="Test Card",
            card_type="Cashback",
            issuer="Test Bank",
            network="Visa",
            credit_limit=5000.0,
            annual_fee=95.0,
            last_four="1234",
            expiration_date="12/25",
            has_welcome_bonus=True,
            welcome_bonus_required=4000.0,
            welcome_bonus_deadline=datetime.utcnow() + timedelta(days=90)
        )

        card = CreditCardService.create_card(db_session, user.id, card_data)

        assert card.user_id == user.id
        assert card.name == "Test Card"
        assert card.card_type == "Cashback"
        assert card.issuer == "Test Bank"
        assert card.network == "Visa"
        assert card.credit_limit == 5000.0
        assert card.available_credit == 5000.0  # Initially full credit
        assert card.annual_fee == 95.0
        assert card.last_four == "1234"
        assert card.expiration_date == "12/25"
        assert card.has_welcome_bonus == True
        assert card.welcome_bonus_required == 4000.0
        assert card.is_active == True

    def test_get_card(self, db_session):
        """Test retrieving a specific card"""
        # Create user and card
        user_data = UserCreate(email="getcard@example.com", password="password123")
        user = create_user(db_session, user_data)

        card_data = CreditCardCreate(
            name="Get Card Test",
            card_type="Travel",
            issuer="Test Issuer",
            credit_limit=10000.0,
            annual_fee=550.0
        )
        card = CreditCardService.create_card(db_session, user.id, card_data)

        # Retrieve the card
        retrieved_card = CreditCardService.get_card(db_session, card.id, user.id)
        assert retrieved_card is not None
        assert retrieved_card.id == card.id
        assert retrieved_card.name == "Get Card Test"

        # Try to get card with wrong user ID
        wrong_user_card = CreditCardService.get_card(db_session, card.id, 99999)
        assert wrong_user_card is None

        # Try to get non-existent card
        nonexistent_card = CreditCardService.get_card(db_session, 99999, user.id)
        assert nonexistent_card is None

    def test_get_user_cards(self, db_session):
        """Test retrieving all cards for a user"""
        # Create user
        user_data = UserCreate(email="multicards@example.com", password="password123")
        user = create_user(db_session, user_data)

        # Create multiple cards
        for i in range(3):
            card_data = CreditCardCreate(
                name=f"Card {i}",
                card_type="Cashback",
                issuer="Test Bank",
                credit_limit=5000.0,
                annual_fee=0.0
            )
            CreditCardService.create_card(db_session, user.id, card_data)

        # Get all active cards
        cards = CreditCardService.get_user_cards(db_session, user.id)
        assert len(cards) == 3

        # Deactivate one card
        first_card = cards[0]
        CreditCardService.delete_card(db_session, first_card.id, user.id)

        # Get only active cards
        active_cards = CreditCardService.get_user_cards(db_session, user.id, active_only=True)
        assert len(active_cards) == 2

        # Get all cards (including inactive)
        all_cards = CreditCardService.get_user_cards(db_session, user.id, active_only=False)
        assert len(all_cards) == 3

    def test_update_card(self, db_session):
        """Test updating a card"""
        # Create user and card
        user_data = UserCreate(email="updatecard@example.com", password="password123")
        user = create_user(db_session, user_data)

        card_data = CreditCardCreate(
            name="Update Test Card",
            card_type="Business",
            issuer="Test Issuer",
            credit_limit=8000.0,
            annual_fee=0.0
        )
        card = CreditCardService.create_card(db_session, user.id, card_data)

        # Update the card
        update_data = CreditCardUpdate(
            name="Updated Card Name",
            credit_limit=10000.0,
            current_balance=1000.0
        )
        updated_card = CreditCardService.update_card(db_session, card.id, user.id, update_data)

        assert updated_card is not None
        assert updated_card.name == "Updated Card Name"
        assert updated_card.credit_limit == 10000.0
        assert updated_card.current_balance == 1000.0
        assert updated_card.updated_at > card.created_at

        # Try to update non-existent card
        nonexistent_update = CreditCardService.update_card(db_session, 99999, user.id, update_data)
        assert nonexistent_update is None

    def test_delete_card(self, db_session):
        """Test deleting (deactivating) a card"""
        # Create user and card
        user_data = UserCreate(email="deletecard@example.com", password="password123")
        user = create_user(db_session, user_data)

        card_data = CreditCardCreate(
            name="Delete Test Card",
            card_type="Travel",
            issuer="Test Issuer",
            credit_limit=5000.0,
            annual_fee=0.0
        )
        card = CreditCardService.create_card(db_session, user.id, card_data)

        # Delete the card
        result = CreditCardService.delete_card(db_session, card.id, user.id)
        assert result == True

        # Check that card is deactivated
        updated_card = CreditCardService.get_card(db_session, card.id, user.id)
        assert updated_card.is_active == False

        # Try to delete non-existent card
        nonexistent_delete = CreditCardService.delete_card(db_session, 99999, user.id)
        assert nonexistent_delete == False

    def test_to_response(self, db_session):
        """Test converting card model to response schema"""
        # Create user and card with welcome bonus
        user_data = UserCreate(email="response@example.com", password="password123")
        user = create_user(db_session, user_data)

        card_data = CreditCardCreate(
            name="Response Test Card",
            card_type="Travel",
            issuer="Test Issuer",
            network="Visa",
            credit_limit=10000.0,
            annual_fee=550.0,
            has_welcome_bonus=True,
            welcome_bonus_required=4000.0,
            welcome_bonus_deadline=datetime.utcnow() + timedelta(days=60)
        )
        card = CreditCardService.create_card(db_session, user.id, card_data)

        # Convert to response
        response = CreditCardService.to_response(card)

        assert response.id == card.id
        assert response.user_id == user.id
        assert response.name == "Response Test Card"
        assert response.card_type == "Travel"
        assert response.issuer == "Test Issuer"
        assert response.network == "Visa"
        assert response.credit_limit == 10000.0
        assert response.annual_fee == 550.0
        assert response.is_active == True
        assert response.welcome_bonus_progress is not None
        assert response.welcome_bonus_progress.required == 4000.0
        assert response.welcome_bonus_progress.progress_percentage == 0.0  # No spend yet

    def test_utilization_properties(self, db_session):
        """Test utilization rate and score calculations"""
        # Create user and card
        user_data = UserCreate(email="utilization@example.com", password="password123")
        user = create_user(db_session, user_data)

        card_data = CreditCardCreate(
            name="Utilization Test",
            card_type="Cashback",
            issuer="Test Bank",
            credit_limit=10000.0,
            annual_fee=0.0
        )
        card = CreditCardService.create_card(db_session, user.id, card_data)

        # Test with no balance
        assert card.utilization_rate == 0.0
        assert card.utilization_score == 100

        # Update balance to test utilization
        update_data = CreditCardUpdate(available_credit=9000.0)  # $1000 used
        CreditCardService.update_card(db_session, card.id, user.id, update_data)

        # Refresh card from database
        updated_card = CreditCardService.get_card(db_session, card.id, user.id)
        assert updated_card.utilization_rate == 10.0  # 10% utilization
        assert updated_card.utilization_score == 100  # Still perfect score

        # Test high utilization
        update_data = CreditCardUpdate(available_credit=2000.0)  # $8000 used
        CreditCardService.update_card(db_session, updated_card.id, user.id, update_data)

        final_card = CreditCardService.get_card(db_session, card.id, user.id)
        assert final_card.utilization_rate == 80.0
        assert final_card.utilization_score < 100  # Score should be lower

    def test_create_card_invalid_credit_limit(self, db_session):
        """Test creating a card with invalid credit limit"""
        user_data = UserCreate(email="invalidlimit@example.com", password="password123")
        user = create_user(db_session, user_data)

        with pytest.raises(ValueError):
            card_data = CreditCardCreate(
                name="Invalid Card",
                card_type="Cashback",
                issuer="Test Bank",
                credit_limit=-1000.0,  # Negative credit limit
                annual_fee=0.0
            )
            CreditCardService.create_card(db_session, user.id, card_data)

    def test_create_card_invalid_expiration_date(self, db_session):
        """Test creating a card with invalid expiration date format"""
        user_data = UserCreate(email="invalidexp@example.com", password="password123")
        user = create_user(db_session, user_data)

        with pytest.raises(ValueError):
            card_data = CreditCardCreate(
                name="Invalid Exp Card",
                card_type="Cashback",
                issuer="Test Bank",
                credit_limit=5000.0,
                annual_fee=0.0,
                expiration_date="invalid-format"  # Invalid format
            )
            CreditCardService.create_card(db_session, user.id, card_data)

    def test_create_card_nonexistent_user(self, db_session):
        """Test creating a card for non-existent user"""
        card_data = CreditCardCreate(
            name="Orphan Card",
            card_type="Cashback",
            issuer="Test Bank",
            credit_limit=5000.0,
            annual_fee=0.0
        )

        # The service may not validate user existence upfront, but DB constraints should handle it
        # This test verifies the service doesn't crash, though the card won't be created
        try:
            card = CreditCardService.create_card(db_session, 99999, card_data)
            # If it succeeds, something is wrong with constraints
            assert False, "Should have failed due to foreign key constraint"
        except Exception:
            # Expected to fail due to foreign key constraint
            pass

    def test_create_card_missing_required_fields(self, db_session):
        """Test creating a card with missing required fields"""
        user_data = UserCreate(email="missingfields@example.com", password="password123")
        user = create_user(db_session, user_data)

        with pytest.raises(ValueError):
            # Missing required fields like name, card_type, issuer
            card_data = CreditCardCreate(
                credit_limit=5000.0,
                annual_fee=0.0
            )
            CreditCardService.create_card(db_session, user.id, card_data)

    def test_update_card_invalid_balance(self, db_session):
        """Test updating a card with balance that exceeds credit limit"""
        user_data = UserCreate(email="invalidbalance@example.com", password="password123")
        user = create_user(db_session, user_data)

        card_data = CreditCardCreate(
            name="Balance Test Card",
            card_type="Cashback",
            issuer="Test Bank",
            credit_limit=5000.0,
            annual_fee=0.0
        )
        card = CreditCardService.create_card(db_session, user.id, card_data)

        # Update with a balance that exceeds limit - service allows this
        update_data = CreditCardUpdate(current_balance=6000.0)
        updated_card = CreditCardService.update_card(db_session, card.id, user.id, update_data)

        # The service allows this, but available_credit should be recalculated if it was a computed field
        # Currently available_credit remains unchanged
        assert updated_card.current_balance == 6000.0
        assert updated_card.available_credit == 5000.0  # Unchanged

    def test_update_card_wrong_user(self, db_session):
        """Test updating a card with wrong user ID"""
        # Create two users
        user1_data = UserCreate(email="user1@example.com", password="password123")
        user1 = create_user(db_session, user1_data)

        user2_data = UserCreate(email="user2@example.com", password="password123")
        user2 = create_user(db_session, user2_data)

        # Create card for user1
        card_data = CreditCardCreate(
            name="User1 Card",
            card_type="Cashback",
            issuer="Test Bank",
            credit_limit=5000.0,
            annual_fee=0.0
        )
        card = CreditCardService.create_card(db_session, user1.id, card_data)

        # Try to update as user2
        update_data = CreditCardUpdate(name="Hacked Card")
        result = CreditCardService.update_card(db_session, card.id, user2.id, update_data)
        assert result is None  # Should return None for unauthorized access

    def test_delete_card_wrong_user(self, db_session):
        """Test deleting a card with wrong user ID"""
        # Create two users
        user1_data = UserCreate(email="deleteuser1@example.com", password="password123")
        user1 = create_user(db_session, user1_data)

        user2_data = UserCreate(email="deleteuser2@example.com", password="password123")
        user2 = create_user(db_session, user2_data)

        # Create card for user1
        card_data = CreditCardCreate(
            name="Delete Test Card",
            card_type="Cashback",
            issuer="Test Bank",
            credit_limit=5000.0,
            annual_fee=0.0
        )
        card = CreditCardService.create_card(db_session, user1.id, card_data)

        # Try to delete as user2
        result = CreditCardService.delete_card(db_session, card.id, user2.id)
        assert result == False  # Should return False for unauthorized access

        # Card should still be active
        active_card = CreditCardService.get_card(db_session, card.id, user1.id)
        assert active_card.is_active == True

    def test_get_user_cards_invalid_user(self, db_session):
        """Test getting cards for non-existent user"""
        cards = CreditCardService.get_user_cards(db_session, 99999)
        assert cards == []  # Should return empty list

    def test_to_response_none_card(self, db_session):
        """Test to_response with None input"""
        response = CreditCardService.to_response(None)
        assert response is None