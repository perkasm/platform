import pytest
from datetime import datetime, timedelta
from app.models.card import CreditCard
from app.models.user import User
from app.models.transaction import Transaction
from app.services.user import create_user
from app.services.card import CreditCardService
from app.schemas.user import UserCreate
from app.schemas.card import CreditCardCreate, CreditCardUpdate


class TestCreditCardModelIntegration:
    def test_card_crud_operations(self, db_session):
        """Test CreditCard model CRUD operations"""
        # Create user first
        user_data = UserCreate(email="cardcrud@example.com", password="password123")
        user = create_user(db_session, user_data)

        # Create card
        card_data = CreditCardCreate(
            name="CRUD Test Card",
            card_type="Cashback",
            issuer="Test Bank",
            credit_limit=5000.0,
            annual_fee=95.0
        )
        card = CreditCardService.create_card(db_session, user.id, card_data)

        # Verify creation
        assert card.id is not None
        assert card.user_id == user.id
        assert card.name == "CRUD Test Card"
        assert card.is_active == True

        # Read card
        retrieved_card = db_session.query(CreditCard).filter(CreditCard.id == card.id).first()
        assert retrieved_card is not None
        assert retrieved_card.name == "CRUD Test Card"

        # Update card
        card.name = "Updated Card Name"
        card.current_balance = 1000.0
        db_session.commit()

        updated_card = db_session.query(CreditCard).filter(CreditCard.id == card.id).first()
        assert updated_card.name == "Updated Card Name"
        assert updated_card.current_balance == 1000.0

        # Delete card (soft delete)
        card.is_active = False
        db_session.commit()

        # Verify soft delete
        deleted_card = db_session.query(CreditCard).filter(CreditCard.id == card.id).first()
        assert deleted_card.is_active == False

    def test_card_relationships(self, db_session):
        """Test CreditCard model relationships"""
        # Create user
        user_data = UserCreate(email="cardrel@example.com", password="password123")
        user = create_user(db_session, user_data)

        # Create card
        card_data = CreditCardCreate(
            name="Relationship Test Card",
            card_type="Travel",
            issuer="Test Bank",
            credit_limit=10000.0,
            annual_fee=550.0
        )
        card = CreditCardService.create_card(db_session, user.id, card_data)

        # Test user relationship
        assert card.user is not None
        assert card.user.id == user.id
        assert card.user.email == "cardrel@example.com"

        # Test reverse relationship from user
        user_cards = db_session.query(CreditCard).filter(CreditCard.user_id == user.id).all()
        assert len(user_cards) == 1
        assert user_cards[0].id == card.id

    def test_card_query_methods(self, db_session):
        """Test CreditCard model query methods and filters"""
        # Create user
        user_data = UserCreate(email="cardquery@example.com", password="password123")
        user = create_user(db_session, user_data)

        # Create multiple cards
        cards_data = [
            CreditCardCreate(name="Card 1", card_type="Cashback", issuer="Bank A", credit_limit=5000.0, annual_fee=0.0),
            CreditCardCreate(name="Card 2", card_type="Travel", issuer="Bank B", credit_limit=10000.0, annual_fee=95.0),
            CreditCardCreate(name="Card 3", card_type="Business", issuer="Bank A", credit_limit=8000.0, annual_fee=0.0)
        ]

        created_cards = []
        for card_data in cards_data:
            card = CreditCardService.create_card(db_session, user.id, card_data)
            created_cards.append(card)

        # Test filtering by user
        user_cards = db_session.query(CreditCard).filter(CreditCard.user_id == user.id).all()
        assert len(user_cards) == 3

        # Test filtering by active status
        active_cards = db_session.query(CreditCard).filter(
            CreditCard.user_id == user.id,
            CreditCard.is_active == True
        ).all()
        assert len(active_cards) == 3

        # Deactivate one card
        created_cards[0].is_active = False
        db_session.commit()

        # Test filtering by active status after deactivation
        active_cards_after = db_session.query(CreditCard).filter(
            CreditCard.user_id == user.id,
            CreditCard.is_active == True
        ).all()
        assert len(active_cards_after) == 2

    def test_card_constraints(self, db_session):
        """Test CreditCard model database constraints"""
        # Create user
        user_data = UserCreate(email="cardconst@example.com", password="password123")
        user = create_user(db_session, user_data)

        # Test NOT NULL constraints
        with pytest.raises(Exception):  # Should fail due to NOT NULL constraint
            invalid_card = CreditCard(
                user_id=user.id,
                name=None,  # NOT NULL violation
                card_type="Cashback",
                issuer="Test Bank",
                credit_limit=5000.0
            )
            db_session.add(invalid_card)
            db_session.commit()

        db_session.rollback()  # Clean up failed transaction

        # Test foreign key constraint
        with pytest.raises(Exception):  # Should fail due to foreign key constraint
            invalid_card = CreditCard(
                user_id=99999,  # Non-existent user
                name="Invalid Card",
                card_type="Cashback",
                issuer="Test Bank",
                credit_limit=5000.0
            )
            db_session.add(invalid_card)
            db_session.commit()

        db_session.rollback()

    def test_card_with_transactions_relationship(self, db_session):
        """Test CreditCard model relationship with Transaction model"""
        # Create user and card
        user_data = UserCreate(email="cardtrans@example.com", password="password123")
        user = create_user(db_session, user_data)

        card_data = CreditCardCreate(
            name="Transaction Test Card",
            card_type="Cashback",
            issuer="Test Bank",
            credit_limit=5000.0,
            annual_fee=0.0
        )
        card = CreditCardService.create_card(db_session, user.id, card_data)

        # Create transactions for the card
        transactions = [
            Transaction(
                user_id=user.id,
                card_id=card.id,
                merchant_name="Store A",
                amount=100.0,
                category="dining",
                description="Dinner",
                transaction_date=datetime.utcnow() - timedelta(days=5),
                points_earned=10
            ),
            Transaction(
                user_id=user.id,
                card_id=card.id,
                merchant_name="Store B",
                amount=50.0,
                category="gas",
                description="Gas station",
                transaction_date=datetime.utcnow() - timedelta(days=2),
                points_earned=5
            )
        ]

        for trans in transactions:
            db_session.add(trans)
        db_session.commit()

        # Test card.transactions relationship
        card_with_transactions = db_session.query(CreditCard).filter(CreditCard.id == card.id).first()
        assert len(card_with_transactions.transactions) == 2

        # Test transaction.card relationship
        for trans in transactions:
            retrieved_trans = db_session.query(Transaction).filter(Transaction.id == trans.id).first()
            assert retrieved_trans.card.id == card.id
            assert retrieved_trans.card.name == "Transaction Test Card"

    def test_card_utilization_properties(self, db_session):
        """Test CreditCard utilization calculation properties"""
        # Create user and card
        user_data = UserCreate(email="cardutil@example.com", password="password123")
        user = create_user(db_session, user_data)

        card_data = CreditCardCreate(
            name="Utilization Test Card",
            card_type="Cashback",
            issuer="Test Bank",
            credit_limit=10000.0,
            annual_fee=0.0
        )
        card = CreditCardService.create_card(db_session, user.id, card_data)

        # Test initial utilization
        assert card.utilization_rate == 0.0
        assert card.utilization_score == 100

        # Update balance and test utilization
        card.current_balance = 2000.0  # Simulate $2000 used
        card.available_credit = 8000.0  # $8000 available
        db_session.commit()

        # Refresh and test
        updated_card = db_session.query(CreditCard).filter(CreditCard.id == card.id).first()
        assert updated_card.utilization_rate == 20.0  # 20% utilization
        assert updated_card.utilization_score == 90  # Score for 20% utilization

        # Test high utilization
        updated_card.current_balance = 8000.0  # $8000 used
        updated_card.available_credit = 2000.0  # $2000 available
        db_session.commit()

        high_util_card = db_session.query(CreditCard).filter(CreditCard.id == card.id).first()
        assert high_util_card.utilization_rate == 80.0
        assert high_util_card.utilization_score < 100  # Score should be lower

    def test_card_welcome_bonus_tracking(self, db_session):
        """Test CreditCard welcome bonus tracking"""
        # Create user and card with welcome bonus
        user_data = UserCreate(email="cardbonus@example.com", password="password123")
        user = create_user(db_session, user_data)

        card_data = CreditCardCreate(
            name="Bonus Test Card",
            card_type="Travel",
            issuer="Test Bank",
            credit_limit=10000.0,
            annual_fee=550.0,
            has_welcome_bonus=True,
            welcome_bonus_required=4000.0,
            welcome_bonus_deadline=datetime.utcnow() + timedelta(days=90)
        )
        card = CreditCardService.create_card(db_session, user.id, card_data)

        # Test initial bonus state
        assert card.has_welcome_bonus == True
        assert card.welcome_bonus_required == 4000.0
        assert card.welcome_bonus_spent == 0.0
        assert card.welcome_bonus_progress == 0.0

        # Update bonus progress
        card.welcome_bonus_spent = 2000.0
        db_session.commit()

        updated_card = db_session.query(CreditCard).filter(CreditCard.id == card.id).first()
        assert updated_card.welcome_bonus_spent == 2000.0
        assert updated_card.welcome_bonus_progress == 50.0  # 50% progress

        # Complete bonus
        updated_card.welcome_bonus_spent = 4000.0
        db_session.commit()

        completed_card = db_session.query(CreditCard).filter(CreditCard.id == card.id).first()
        assert completed_card.welcome_bonus_progress == 100.0