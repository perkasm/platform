import pytest
from datetime import datetime, timedelta
from app.models.transaction import Transaction
from app.models.user import User
from app.models.card import CreditCard
from app.services.user import create_user
from app.services.card import CreditCardService
from app.schemas.user import UserCreate
from app.schemas.card import CreditCardCreate


class TestTransactionModelIntegration:
    def test_transaction_crud_operations(self, db_session):
        """Test Transaction model CRUD operations"""
        # Create user and card first
        user_data = UserCreate(email="transcrud@example.com", password="password123")
        user = create_user(db_session, user_data)

        card_data = CreditCardCreate(
            name="Transaction Test Card",
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
            amount=100.50,
            category="dining",
            description="Test transaction",
            transaction_date=datetime.utcnow(),
            points_earned=10
        )
        db_session.add(transaction)
        db_session.commit()
        db_session.refresh(transaction)

        # Verify creation
        assert transaction.id is not None
        assert transaction.user_id == user.id
        assert transaction.card_id == card.id
        assert transaction.merchant_name == "Test Merchant"
        assert transaction.amount == 100.50
        assert transaction.category == "dining"
        assert transaction.points_earned == 10

        # Read transaction
        retrieved_transaction = db_session.query(Transaction).filter(Transaction.id == transaction.id).first()
        assert retrieved_transaction is not None
        assert retrieved_transaction.merchant_name == "Test Merchant"

        # Update transaction
        transaction.amount = 150.75
        transaction.description = "Updated transaction"
        db_session.commit()

        updated_transaction = db_session.query(Transaction).filter(Transaction.id == transaction.id).first()
        assert updated_transaction.amount == 150.75
        assert updated_transaction.description == "Updated transaction"

        # Delete transaction
        db_session.delete(transaction)
        db_session.commit()

        # Verify deletion
        deleted_transaction = db_session.query(Transaction).filter(Transaction.id == transaction.id).first()
        assert deleted_transaction is None

    def test_transaction_relationships(self, db_session):
        """Test Transaction model relationships"""
        # Create user and card
        user_data = UserCreate(email="transrel@example.com", password="password123")
        user = create_user(db_session, user_data)

        card_data = CreditCardCreate(
            name="Relationship Test Card",
            card_type="Travel",
            issuer="Test Bank",
            credit_limit=10000.0,
            annual_fee=550.0
        )
        card = CreditCardService.create_card(db_session, user.id, card_data)

        # Create transaction
        transaction = Transaction(
            user_id=user.id,
            card_id=card.id,
            merchant_name="Test Store",
            amount=200.0,
            category="shopping",
            description="Test purchase",
            transaction_date=datetime.utcnow(),
            points_earned=20
        )
        db_session.add(transaction)
        db_session.commit()

        # Test user relationship
        assert transaction.user is not None
        assert transaction.user.id == user.id
        assert transaction.user.email == "transrel@example.com"

        # Test card relationship
        assert transaction.card is not None
        assert transaction.card.id == card.id
        assert transaction.card.name == "Relationship Test Card"

        # Test reverse relationships
        user_transactions = db_session.query(Transaction).filter(Transaction.user_id == user.id).all()
        assert len(user_transactions) == 1
        assert user_transactions[0].id == transaction.id

        card_transactions = db_session.query(Transaction).filter(Transaction.card_id == card.id).all()
        assert len(card_transactions) == 1
        assert card_transactions[0].id == transaction.id

    def test_transaction_query_methods(self, db_session):
        """Test Transaction model query methods and filters"""
        # Create user and cards
        user_data = UserCreate(email="transquery@example.com", password="password123")
        user = create_user(db_session, user_data)

        # Create two cards
        card1_data = CreditCardCreate(
            name="Card 1", card_type="Cashback", issuer="Bank A", credit_limit=5000.0, annual_fee=0.0
        )
        card1 = CreditCardService.create_card(db_session, user.id, card1_data)

        card2_data = CreditCardCreate(
            name="Card 2", card_type="Travel", issuer="Bank B", credit_limit=10000.0, annual_fee=95.0
        )
        card2 = CreditCardService.create_card(db_session, user.id, card2_data)

        # Create transactions with different dates and categories
        base_date = datetime.utcnow()
        transactions_data = [
            (card1.id, "Restaurant A", 50.0, "dining", base_date - timedelta(days=5), 5),
            (card1.id, "Gas Station", 40.0, "gas", base_date - timedelta(days=3), 4),
            (card2.id, "Hotel Booking", 300.0, "travel", base_date - timedelta(days=1), 30),
            (card2.id, "Coffee Shop", 15.0, "dining", base_date, 2),
        ]

        transactions = []
        for card_id, merchant, amount, category, date, points in transactions_data:
            trans = Transaction(
                user_id=user.id,
                card_id=card_id,
                merchant_name=merchant,
                amount=amount,
                category=category,
                description=f"Transaction at {merchant}",
                transaction_date=date,
                points_earned=points
            )
            db_session.add(trans)
            transactions.append(trans)
        db_session.commit()

        # Test filtering by user
        user_transactions = db_session.query(Transaction).filter(Transaction.user_id == user.id).all()
        assert len(user_transactions) == 4

        # Test filtering by card
        card1_transactions = db_session.query(Transaction).filter(Transaction.card_id == card1.id).all()
        assert len(card1_transactions) == 2

        # Test filtering by category
        dining_transactions = db_session.query(Transaction).filter(Transaction.category == "dining").all()
        assert len(dining_transactions) == 2

        # Test filtering by date range
        recent_transactions = db_session.query(Transaction).filter(
            Transaction.transaction_date >= base_date - timedelta(days=2)
        ).all()
        assert len(recent_transactions) == 2  # Hotel booking and coffee shop

        # Test ordering by date
        ordered_transactions = db_session.query(Transaction).filter(
            Transaction.user_id == user.id
        ).order_by(Transaction.transaction_date.desc()).all()
        assert len(ordered_transactions) == 4
        assert ordered_transactions[0].merchant_name == "Coffee Shop"  # Most recent
        assert ordered_transactions[-1].merchant_name == "Restaurant A"  # Oldest

    def test_transaction_constraints(self, db_session):
        """Test Transaction model database constraints"""
        # Create user and card
        user_data = UserCreate(email="transconst@example.com", password="password123")
        user = create_user(db_session, user_data)

        card_data = CreditCardCreate(
            name="Constraint Test Card",
            card_type="Cashback",
            issuer="Test Bank",
            credit_limit=5000.0,
            annual_fee=0.0
        )
        card = CreditCardService.create_card(db_session, user.id, card_data)

        # Test NOT NULL constraints
        with pytest.raises(Exception):  # Should fail due to NOT NULL constraint
            invalid_transaction = Transaction(
                user_id=user.id,
                card_id=card.id,
                merchant_name=None,  # NOT NULL violation
                amount=100.0,
                category="dining",
                description="Invalid transaction"
            )
            db_session.add(invalid_transaction)
            db_session.commit()

        db_session.rollback()

        # Test foreign key constraints
        with pytest.raises(Exception):  # Should fail due to foreign key constraint
            invalid_transaction = Transaction(
                user_id=99999,  # Non-existent user
                card_id=card.id,
                merchant_name="Invalid Store",
                amount=100.0,
                category="dining",
                description="Invalid transaction"
            )
            db_session.add(invalid_transaction)
            db_session.commit()

        db_session.rollback()

        with pytest.raises(Exception):  # Should fail due to foreign key constraint
            invalid_transaction = Transaction(
                user_id=user.id,
                card_id=99999,  # Non-existent card
                merchant_name="Invalid Store",
                amount=100.0,
                category="dining",
                description="Invalid transaction"
            )
            db_session.add(invalid_transaction)
            db_session.commit()

        db_session.rollback()

    def test_transaction_aggregations(self, db_session):
        """Test transaction aggregation queries"""
        # Create user and card
        user_data = UserCreate(email="transagg@example.com", password="password123")
        user = create_user(db_session, user_data)

        card_data = CreditCardCreate(
            name="Aggregation Test Card",
            card_type="Cashback",
            issuer="Test Bank",
            credit_limit=5000.0,
            annual_fee=0.0
        )
        card = CreditCardService.create_card(db_session, user.id, card_data)

        # Create transactions
        transactions_data = [
            ("Restaurant A", 50.0, "dining", 5),
            ("Restaurant B", 75.0, "dining", 8),
            ("Gas Station", 40.0, "gas", 4),
            ("Grocery Store", 120.0, "groceries", 12),
            ("Coffee Shop", 15.0, "dining", 2),
        ]

        for merchant, amount, category, points in transactions_data:
            trans = Transaction(
                user_id=user.id,
                card_id=card.id,
                merchant_name=merchant,
                amount=amount,
                category=category,
                description=f"Purchase at {merchant}",
                transaction_date=datetime.utcnow(),
                points_earned=points
            )
            db_session.add(trans)
        db_session.commit()

        # Test sum aggregations
        from sqlalchemy import func

        # Total spending
        total_spending = db_session.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == user.id
        ).scalar()
        assert total_spending == 300.0

        # Total points earned
        total_points = db_session.query(func.sum(Transaction.points_earned)).filter(
            Transaction.user_id == user.id
        ).scalar()
        assert total_points == 31

        # Spending by category
        dining_spending = db_session.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == user.id,
            Transaction.category == "dining"
        ).scalar()
        assert dining_spending == 140.0

        # Count by category
        dining_count = db_session.query(func.count(Transaction.id)).filter(
            Transaction.user_id == user.id,
            Transaction.category == "dining"
        ).scalar()
        assert dining_count == 3

        # Average transaction amount
        avg_amount = db_session.query(func.avg(Transaction.amount)).filter(
            Transaction.user_id == user.id
        ).scalar()
        assert avg_amount == 60.0

    def test_transaction_date_operations(self, db_session):
        """Test transaction date-based operations"""
        # Create user and card
        user_data = UserCreate(email="transdate@example.com", password="password123")
        user = create_user(db_session, user_data)

        card_data = CreditCardCreate(
            name="Date Test Card",
            card_type="Cashback",
            issuer="Test Bank",
            credit_limit=5000.0,
            annual_fee=0.0
        )
        card = CreditCardService.create_card(db_session, user.id, card_data)

        # Create transactions across different months
        base_date = datetime.utcnow().replace(day=15)
        transactions_data = [
            (base_date - timedelta(days=60), 100.0, "January transaction"),
            (base_date - timedelta(days=30), 200.0, "February transaction"),
            (base_date, 300.0, "Current month transaction"),
        ]

        for trans_date, amount, description in transactions_data:
            trans = Transaction(
                user_id=user.id,
                card_id=card.id,
                merchant_name="Test Merchant",
                amount=amount,
                category="shopping",
                description=description,
                transaction_date=trans_date,
                points_earned=int(amount / 10)
            )
            db_session.add(trans)
        db_session.commit()

        # Test monthly aggregations
        from sqlalchemy import func, extract

        # Current month spending
        current_month = datetime.utcnow().month
        current_year = datetime.utcnow().year

        monthly_spending = db_session.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == user.id,
            extract('month', Transaction.transaction_date) == current_month,
            extract('year', Transaction.transaction_date) == current_year
        ).scalar()
        assert monthly_spending == 300.0

        # Previous month spending
        prev_month = (datetime.utcnow().replace(day=1) - timedelta(days=1)).month
        prev_year = (datetime.utcnow().replace(day=1) - timedelta(days=1)).year

        prev_monthly_spending = db_session.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == user.id,
            extract('month', Transaction.transaction_date) == prev_month,
            extract('year', Transaction.transaction_date) == prev_year
        ).scalar()
        assert prev_monthly_spending == 200.0

    def test_transaction_bulk_operations(self, db_session):
        """Test bulk transaction operations"""
        # Create user and card
        user_data = UserCreate(email="transbulk@example.com", password="password123")
        user = create_user(db_session, user_data)

        card_data = CreditCardCreate(
            name="Bulk Test Card",
            card_type="Cashback",
            issuer="Test Bank",
            credit_limit=5000.0,
            annual_fee=0.0
        )
        card = CreditCardService.create_card(db_session, user.id, card_data)

        # Bulk create transactions
        bulk_transactions = []
        for i in range(10):
            trans = Transaction(
                user_id=user.id,
                card_id=card.id,
                merchant_name=f"Merchant {i}",
                amount=float(10 * (i + 1)),
                category="shopping",
                description=f"Bulk transaction {i}",
                transaction_date=datetime.utcnow(),
                points_earned=i + 1
            )
            bulk_transactions.append(trans)

        db_session.add_all(bulk_transactions)
        db_session.commit()

        # Verify bulk creation
        user_transactions = db_session.query(Transaction).filter(Transaction.user_id == user.id).all()
        assert len(user_transactions) == 10

        # Bulk update (soft delete all transactions)
        db_session.query(Transaction).filter(Transaction.user_id == user.id).delete()
        db_session.commit()

        # Verify bulk deletion
        remaining_transactions = db_session.query(Transaction).filter(Transaction.user_id == user.id).all()
        assert len(remaining_transactions) == 0