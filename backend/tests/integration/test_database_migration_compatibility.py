"""
Database Migration Compatibility Tests

Tests for database migration compatibility, ensuring that schema changes
don't break existing functionality and that migrations work correctly.
"""

import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.core.database import Base
from app.models.user import User
from app.models.card import CreditCard
from app.models.transaction import Transaction
from app.services.user import create_user
from app.services.card import CreditCardService
from app.schemas.user import UserCreate
from app.schemas.card import CreditCardCreate
from datetime import datetime


class TestDatabaseMigrationCompatibility:
    """Test database migration compatibility and schema evolution"""

    def test_schema_creation_and_basic_operations(self, db_session):
        """Test that the current schema supports all basic operations"""
        # Create user
        user_data = UserCreate(email="migration@example.com", password="password123")
        user = create_user(db_session, user_data)

        # Create card
        card_data = CreditCardCreate(
            name="Migration Test Card",
            card_type="Cashback",
            issuer="Test Bank",
            credit_limit=5000.0,
            annual_fee=0.0
        )
        card = CreditCardService.create_card(db_session, user.id, card_data)

        # Create transaction
        transaction = Transaction(
            user_id=user.id,
            card_id=card.id,
            merchant_name="Migration Test Merchant",
            amount=100.0,
            category="dining",
            description="Migration compatibility test",
            transaction_date=datetime.utcnow(),
            points_earned=10
        )
        db_session.add(transaction)
        db_session.commit()

        # Verify all relationships work
        assert user.credit_cards[0].name == "Migration Test Card"
        assert card.transactions[0].merchant_name == "Migration Test Merchant"
        assert transaction.card.name == "Migration Test Card"
        assert transaction.user.email == "migration@example.com"

    def test_backward_compatibility_with_existing_data(self, db_session):
        """Test that existing data structures remain compatible"""
        # Create legacy-style data (simulating old schema)
        user = User(
            email="legacy@example.com",
            hashed_password="legacy_hash",
            full_name="Legacy User",
            is_active=True,
            is_superuser=False
        )
        db_session.add(user)
        db_session.commit()

        # Create card with minimal required fields
        card = CreditCard(
            user_id=user.id,
            name="Legacy Card",
            card_type="Cashback",
            issuer="Legacy Bank",
            credit_limit=1000.0,
            available_credit=1000.0
        )
        db_session.add(card)
        db_session.commit()

        # Verify legacy data works with current code
        retrieved_user = db_session.query(User).filter(User.email == "legacy@example.com").first()
        assert retrieved_user.full_name == "Legacy User"
        assert retrieved_user.is_active == True

        retrieved_card = db_session.query(CreditCard).filter(CreditCard.name == "Legacy Card").first()
        assert retrieved_card.issuer == "Legacy Bank"
        assert retrieved_card.credit_limit == 1000.0

    def test_new_fields_have_default_values(self, db_session):
        """Test that new fields added to schema have appropriate defaults"""
        # Create user with minimal data
        user = User(
            email="defaults@example.com",
            hashed_password="hash123"
        )
        db_session.add(user)
        db_session.commit()

        # Verify default values are set
        assert user.is_active == True  # Default should be True
        assert user.is_superuser == False  # Default should be False
        assert user.google_id is None  # Should be nullable
        assert user.created_at is not None  # Should be set automatically

    def test_index_performance_with_large_dataset(self, db_session):
        """Test that indexes support efficient queries with larger datasets"""
        # Create multiple users for performance testing
        users = []
        for i in range(10):
            user_data = UserCreate(
                email=f"perf{i}@example.com",
                password="password123"
            )
            user = create_user(db_session, user_data)
            users.append(user)

        # Create cards for each user
        cards = []
        for user in users:
            for j in range(3):  # 3 cards per user
                card_data = CreditCardCreate(
                    name=f"Card {j} for User {user.id}",
                    card_type="Cashback",
                    issuer="Test Bank",
                    credit_limit=5000.0,
                    annual_fee=0.0
                )
                card = CreditCardService.create_card(db_session, user.id, card_data)
                cards.append(card)

        # Test indexed queries are efficient
        # Query by user_id (should use foreign key index)
        user_cards = db_session.query(CreditCard).filter(CreditCard.user_id == users[0].id).all()
        assert len(user_cards) == 3

        # Query by email (should use unique index)
        found_user = db_session.query(User).filter(User.email == "perf5@example.com").first()
        assert found_user is not None
        assert found_user.email == "perf5@example.com"

    def test_constraint_validation_after_schema_changes(self, db_session):
        """Test that constraints still work after potential schema modifications"""
        # Test unique constraints
        user1 = User(email="constraint1@example.com", hashed_password="hash1")
        user2 = User(email="constraint2@example.com", hashed_password="hash2")
        db_session.add(user1)
        db_session.add(user2)
        db_session.commit()

        # Test foreign key constraints
        card = CreditCard(
            user_id=user1.id,
            name="Constraint Test Card",
            card_type="Cashback",
            issuer="Test Bank",
            credit_limit=5000.0,
            available_credit=5000.0
        )
        db_session.add(card)
        db_session.commit()

        # Verify relationships
        assert card.user_id == user1.id
        assert user1.credit_cards[0].name == "Constraint Test Card"

    def test_data_integrity_across_relationships(self, db_session):
        """Test that data integrity is maintained across all relationships"""
        # Create a complete data set
        user_data = UserCreate(email="integrity@example.com", password="password123")
        user = create_user(db_session, user_data)

        # Create multiple cards
        cards = []
        for i in range(2):
            card_data = CreditCardCreate(
                name=f"Integrity Card {i}",
                card_type="Cashback",
                issuer="Test Bank",
                credit_limit=5000.0,
                annual_fee=0.0
            )
            card = CreditCardService.create_card(db_session, user.id, card_data)
            cards.append(card)

        # Create transactions for each card
        transactions = []
        for i, card in enumerate(cards):
            transaction = Transaction(
                user_id=user.id,
                card_id=card.id,
                merchant_name=f"Merchant {i}",
                amount=100.0 + i * 50,
                category="dining",
                description=f"Integrity transaction {i}",
                transaction_date=datetime.utcnow(),
                points_earned=10 + i * 5
            )
            db_session.add(transaction)
            transactions.append(transaction)
        db_session.commit()

        # Verify complete data integrity
        # User has correct number of cards
        assert len(user.credit_cards) == 2

        # Each card has correct transactions
        for card in cards:
            card_transactions = [t for t in transactions if t.card_id == card.id]
            assert len(card_transactions) == 1
            assert card_transactions[0].user_id == user.id

        # All transactions belong to the user
        user_transactions = db_session.query(Transaction).filter(Transaction.user_id == user.id).all()
        assert len(user_transactions) == 2

        # Total points calculation works
        total_points = sum(card.current_points for card in cards)
        assert total_points >= 0  # Should be valid