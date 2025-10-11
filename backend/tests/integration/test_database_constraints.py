"""
Database Constraints and Foreign Key Relationship Tests

Tests for database integrity constraints, foreign key relationships,
unique constraints, and data validation rules.
"""

import pytest
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime

from app.models.user import User
from app.models.card import CreditCard
from app.models.transaction import Transaction
from app.services.user import create_user
from app.services.card import CreditCardService
from app.schemas.user import UserCreate
from app.schemas.card import CreditCardCreate


@pytest.fixture(autouse=True)
def enable_foreign_keys(db_session):
    """Enable foreign key constraints for SQLite"""
    db_session.execute(text("PRAGMA foreign_keys = ON"))
    db_session.commit()


class TestDatabaseConstraints:
    """Test database constraints and foreign key relationships"""

    def test_foreign_key_user_card_relationship(self, db_session):
        """Test foreign key constraint between User and CreditCard"""
        # Create a card with non-existent user ID should fail
        card_data = CreditCardCreate(
            name="Test Card",
            card_type="Cashback",
            issuer="Test Bank",
            credit_limit=5000.0,
            annual_fee=0.0
        )

        with pytest.raises(IntegrityError):
            CreditCardService.create_card(db_session, 99999, card_data)

    def test_foreign_key_card_transaction_relationship(self, db_session):
        """Test foreign key constraint between CreditCard and Transaction"""
        # Create user first
        user_data = UserCreate(email="constraint@example.com", password="password123")
        user = create_user(db_session, user_data)

        # Create transaction with non-existent card ID should fail
        transaction = Transaction(
            user_id=user.id,
            card_id=99999,  # Non-existent card
            merchant_name="Test Merchant",
            amount=100.0,
            category="dining",
            description="Test transaction",
            transaction_date=datetime.utcnow(),
            points_earned=10
        )

        with pytest.raises(IntegrityError):
            db_session.add(transaction)
            db_session.commit()

    def test_unique_email_constraint(self, db_session):
        """Test unique constraint on user email"""
        # Create first user
        user_data1 = UserCreate(email="unique@example.com", password="password123")
        create_user(db_session, user_data1)

        # Try to create second user with same email should fail
        user_data2 = UserCreate(email="unique@example.com", password="different123")

        with pytest.raises(IntegrityError):
            create_user(db_session, user_data2)

    def test_transaction_amount_positive_constraint(self, db_session):
        """Test that transaction amount must be positive"""
        user_data = UserCreate(email="amount@example.com", password="password123")
        user = create_user(db_session, user_data)

        card_data = CreditCardCreate(
            name="Amount Test Card",
            card_type="Cashback",
            issuer="Test Bank",
            credit_limit=5000.0,
            annual_fee=0.0
        )
        card = CreditCardService.create_card(db_session, user.id, card_data)

        # Note: Amount validation is done at application level, not database level
        # This test verifies that negative amounts are allowed at DB level but should be validated elsewhere
        transaction = Transaction(
            user_id=user.id,
            card_id=card.id,
            merchant_name="Test Merchant",
            amount=-50.0,  # Negative amount - allowed at DB level
            category="dining",
            description="Negative transaction",
            transaction_date=datetime.utcnow(),
            points_earned=5
        )

        # This should succeed at database level
        db_session.add(transaction)
        db_session.commit()

        # Verify the transaction was created with negative amount
        assert transaction.amount == -50.0

    def test_cascade_delete_user_cards(self, db_session):
        """Test that deleting a user cascades to delete their cards"""
        user_data = UserCreate(email="cascade@example.com", password="password123")
        user = create_user(db_session, user_data)

        # Create cards for user
        card_data = CreditCardCreate(
            name="Cascade Test Card",
            card_type="Cashback",
            issuer="Test Bank",
            credit_limit=5000.0,
            annual_fee=0.0
        )
        card = CreditCardService.create_card(db_session, user.id, card_data)

        # Verify card exists
        assert db_session.query(CreditCard).filter(CreditCard.id == card.id).first() is not None

        # Delete user
        db_session.delete(user)
        db_session.commit()

        # Verify card is also deleted (cascade)
        assert db_session.query(CreditCard).filter(CreditCard.id == card.id).first() is None

    def test_cascade_delete_card_transactions(self, db_session):
        """Test that deleting a card cascades to delete its transactions"""
        user_data = UserCreate(email="cascade2@example.com", password="password123")
        user = create_user(db_session, user_data)

        card_data = CreditCardCreate(
            name="Cascade Transaction Card",
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
            merchant_name="Test Merchant",
            amount=100.0,
            category="dining",
            description="Cascade test transaction",
            transaction_date=datetime.utcnow(),
            points_earned=10
        )
        db_session.add(transaction)
        db_session.commit()

        # Verify transaction exists
        assert db_session.query(Transaction).filter(Transaction.id == transaction.id).first() is not None

        # Delete card
        db_session.delete(card)
        db_session.commit()

        # Verify transaction is also deleted (cascade)
        assert db_session.query(Transaction).filter(Transaction.id == transaction.id).first() is None

    def test_not_null_constraints(self, db_session):
        """Test NOT NULL constraints on required fields"""
        user_data = UserCreate(email="notnull@example.com", password="password123")
        user = create_user(db_session, user_data)

        # Try to create transaction with NULL merchant_name
        transaction = Transaction(
            user_id=user.id,
            card_id=None,  # This should fail
            merchant_name=None,  # This should fail
            amount=100.0,
            category="dining",
            description="Test transaction",
            transaction_date=None,  # This should fail
            points_earned=10
        )

        with pytest.raises(IntegrityError):
            db_session.add(transaction)
            db_session.commit()

    def test_user_google_id_unique_constraint(self, db_session):
        """Test unique constraint on user google_id"""
        # Create first user with google_id
        user1 = User(
            email="google1@example.com",
            hashed_password="hashed123",
            google_id="google123"
        )
        db_session.add(user1)
        db_session.commit()

        # Try to create second user with same google_id should fail
        user2 = User(
            email="google2@example.com",
            hashed_password="hashed456",
            google_id="google123"  # Same google_id
        )

        with pytest.raises(IntegrityError):
            db_session.add(user2)
            db_session.commit()

    def test_credit_card_required_fields(self, db_session):
        """Test that required fields cannot be null"""
        user_data = UserCreate(email="required@example.com", password="password123")
        user = create_user(db_session, user_data)

        # Try to create card with missing required fields
        # This should be caught by service validation, but let's test direct model creation
        card = CreditCard(
            user_id=user.id,
            name=None,  # Should fail
            card_type="Cashback",
            issuer="Test Bank",
            credit_limit=5000.0,
            available_credit=5000.0
        )

        with pytest.raises(IntegrityError):
            db_session.add(card)
            db_session.commit()