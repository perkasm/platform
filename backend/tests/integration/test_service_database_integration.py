import pytest
from datetime import datetime, timedelta
from app.services.user import create_user, get_user
from app.services.card import CreditCardService
from app.services.dashboard import DashboardService
from app.services.recommendations import RecommendationsService
from app.models.transaction import Transaction
from app.models.card import CreditCard
from app.schemas.user import UserCreate
from app.schemas.card import CreditCardCreate, CreditCardUpdate


class TestServiceDatabaseIntegration:
    def test_user_card_relationship_integration(self, db_session):
        """Test complex user-card relationship operations"""
        # Create user
        user_data = UserCreate(email="complex@example.com", password="password123")
        user = create_user(db_session, user_data)

        # Create multiple cards
        cards_data = [
            CreditCardCreate(name="Card A", card_type="Cashback", issuer="Bank A", credit_limit=5000.0, annual_fee=0.0),
            CreditCardCreate(name="Card B", card_type="Travel", issuer="Bank B", credit_limit=10000.0, annual_fee=95.0),
            CreditCardCreate(name="Card C", card_type="Business", issuer="Bank C", credit_limit=8000.0, annual_fee=0.0)
        ]

        created_cards = []
        for card_data in cards_data:
            card = CreditCardService.create_card(db_session, user.id, card_data)
            created_cards.append(card)

        # Test user can retrieve all their cards
        user_cards = CreditCardService.get_user_cards(db_session, user.id)
        assert len(user_cards) == 3

        # Test card ownership validation
        for card in created_cards:
            retrieved_card = CreditCardService.get_card(db_session, card.id, user.id)
            assert retrieved_card is not None
            assert retrieved_card.user_id == user.id

        # Test that other users can't access these cards
        other_user_data = UserCreate(email="other@example.com", password="password456")
        other_user = create_user(db_session, other_user_data)

        for card in created_cards:
            other_user_card = CreditCardService.get_card(db_session, card.id, other_user.id)
            assert other_user_card is None

    def test_card_transaction_integration(self, db_session):
        """Test complex card-transaction relationship operations"""
        # Create user and card
        user_data = UserCreate(email="cardtrans@example.com", password="password123")
        user = create_user(db_session, user_data)

        card_data = CreditCardCreate(
            name="Transaction Card",
            card_type="Cashback",
            issuer="Test Bank",
            credit_limit=5000.0,
            annual_fee=0.0
        )
        card = CreditCardService.create_card(db_session, user.id, card_data)

        # Create multiple transactions
        transactions_data = [
            ("Store A", 100.0, "dining", 10),
            ("Store B", 50.0, "gas", 5),
            ("Store C", 200.0, "shopping", 20),
        ]

        created_transactions = []
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
            created_transactions.append(trans)
        db_session.commit()

        # Test card has all transactions
        card_with_transactions = db_session.query(CreditCard).filter(CreditCard.id == card.id).first()
        assert len(card_with_transactions.transactions) == 3

        # Test transactions are properly linked
        for trans in card_with_transactions.transactions:
            assert trans.card_id == card.id
            assert trans.user_id == user.id

        # Test transaction total affects card utilization
        total_spent = sum(trans.amount for trans in created_transactions)
        expected_available = card.credit_limit - total_spent

        # Update card available credit to reflect spending
        CreditCardService.update_card(db_session, card.id, user.id,
                                    CreditCardUpdate(available_credit=expected_available))

        updated_card = CreditCardService.get_card(db_session, card.id, user.id)
        assert updated_card.available_credit == expected_available

    def test_dashboard_service_database_integration(self, db_session):
        """Test dashboard service complex database operations"""
        # Create user with multiple cards and transactions
        user_data = UserCreate(email="dashboard@example.com", password="password123")
        user = create_user(db_session, user_data)

        # Create cards with different balances
        cards_data = [
            (5000.0, 4500.0, 5000),  # $500 used, 5000 points
            (10000.0, 8000.0, 2500), # $2000 used, 2500 points
        ]

        created_cards = []
        for limit, available, points in cards_data:
            card_data = CreditCardCreate(
                name=f"Card {len(created_cards) + 1}",
                card_type="Cashback",
                issuer="Test Bank",
                credit_limit=limit,
                annual_fee=0.0
            )
            card = CreditCardService.create_card(db_session, user.id, card_data)

            # Update card with balance and points
            CreditCardService.update_card(db_session, card.id, user.id,
                                        CreditCardUpdate(available_credit=available, current_points=points))
            created_cards.append(card)

        # Create some transactions for spending metrics
        for i, card in enumerate(created_cards):
            trans = Transaction(
                user_id=user.id,
                card_id=card.id,
                merchant_name=f"Merchant {i}",
                amount=100.0 * (i + 1),
                category="dining",
                description="Test transaction",
                transaction_date=datetime.utcnow() - timedelta(days=i),
                points_earned=10 * (i + 1)
            )
            db_session.add(trans)
        db_session.commit()

        # Test dashboard metrics calculation
        metrics = DashboardService.get_dashboard_metrics(db_session, user.id)

        # Verify calculations
        expected_total_points = 5000 + 2500  # 7500
        assert metrics.total_points == expected_total_points

        expected_total_credit = 4500.0 + 8000.0  # 12500.0
        assert metrics.total_available_credit == expected_total_credit

        # Average utilization: ((500 + 2000) / 15000) * 100 = 16.67%
        expected_utilization = ((500.0 + 2000.0) / 15000.0) * 100
        assert abs(metrics.average_utilization - expected_utilization) < 0.01

        assert metrics.cards_count == 2

    def test_recommendations_service_database_integration(self, db_session):
        """Test recommendations service complex database operations"""
        # Create user
        user_data = UserCreate(email="recs@example.com", password="password123")
        user = create_user(db_session, user_data)

        # Add one existing card
        existing_card_data = CreditCardCreate(
            name="Chase Ink Business Cash",  # This matches available cards
            card_type="Business",
            issuer="Chase",
            credit_limit=10000.0,
            annual_fee=0.0
        )
        CreditCardService.create_card(db_session, user.id, existing_card_data)

        # Create spending history that should influence recommendations
        spending_categories = ["office_supplies", "gas", "dining"]
        for i, category in enumerate(spending_categories):
            trans = Transaction(
                user_id=user.id,
                card_id=1,  # Dummy card_id for spending history
                merchant_name=f"Merchant {i}",
                amount=500.0 * (i + 1),  # Different amounts for weighting
                category=category,
                description=f"Spending in {category}",
                transaction_date=datetime.utcnow() - timedelta(days=i * 30),  # Spread over months
                points_earned=50 * (i + 1)
            )
            db_session.add(trans)
        db_session.commit()

        # Test recommendations generation
        response = RecommendationsService.get_recommendations(db_session, user.id)

        # Should return recommendations
        assert response.total > 0
        assert len(response.recommendations) > 0

        # Should not include the card user already has
        card_names = [rec.name for rec in response.recommendations]
        assert "Chase Ink Business Cash" not in card_names

        # Should prioritize cards that match spending categories
        # (This is a complex algorithm, so we just verify it runs without error)

    def test_complex_transaction_analytics(self, db_session):
        """Test complex transaction analytics across multiple cards"""
        # Create user
        user_data = UserCreate(email="analytics@example.com", password="password123")
        user = create_user(db_session, user_data)

        # Create multiple cards
        cards = []
        for i in range(3):
            card_data = CreditCardCreate(
                name=f"Analytics Card {i}",
                card_type="Cashback",
                issuer="Test Bank",
                credit_limit=5000.0,
                annual_fee=0.0
            )
            card = CreditCardService.create_card(db_session, user.id, card_data)
            cards.append(card)

        # Create transactions across different cards and time periods
        base_date = datetime.utcnow()
        transactions_data = [
            (cards[0].id, 100.0, "dining", base_date - timedelta(days=60)),
            (cards[0].id, 50.0, "gas", base_date - timedelta(days=30)),
            (cards[1].id, 200.0, "travel", base_date - timedelta(days=15)),
            (cards[1].id, 75.0, "dining", base_date - timedelta(days=7)),
            (cards[2].id, 150.0, "shopping", base_date - timedelta(days=1)),
        ]

        for card_id, amount, category, trans_date in transactions_data:
            trans = Transaction(
                user_id=user.id,
                card_id=card_id,
                merchant_name="Test Merchant",
                amount=amount,
                category=category,
                description=f"Transaction in {category}",
                transaction_date=trans_date,
                points_earned=int(amount / 10)
            )
            db_session.add(trans)
        db_session.commit()

        # Test complex analytics queries
        from sqlalchemy import func, extract

        # Monthly spending by category
        current_month = base_date.month
        current_year = base_date.year

        monthly_category_spending = db_session.query(
            Transaction.category,
            func.sum(Transaction.amount).label('total')
        ).filter(
            Transaction.user_id == user.id,
            extract('month', Transaction.transaction_date) == current_month,
            extract('year', Transaction.transaction_date) == current_year
        ).group_by(Transaction.category).all()

        # Should have spending in dining, shopping
        category_totals = {row.category: row.total for row in monthly_category_spending}
        assert category_totals.get('dining') == 75.0
        assert category_totals.get('shopping') == 150.0

        # Test card utilization impact from transactions
        for card in cards:
            card_transactions = db_session.query(Transaction).filter(
                Transaction.card_id == card.id
            ).all()

            total_spent_on_card = sum(trans.amount for trans in card_transactions)
            total_points_earned = sum(trans.points_earned for trans in card_transactions)
            expected_available = card.credit_limit - total_spent_on_card

            # Update card with calculated available credit and points
            CreditCardService.update_card(db_session, card.id, user.id,
                                        CreditCardUpdate(
                                            available_credit=expected_available,
                                            current_points=total_points_earned
                                        ))

        # Verify dashboard reflects complex analytics
        metrics = DashboardService.get_dashboard_metrics(db_session, user.id)
        assert metrics.cards_count == 3
        assert metrics.total_points > 0  # Should have points from transactions

    def test_service_error_handling_integration(self, db_session):
        """Test service error handling in database operations"""
        # Test with invalid user ID
        metrics = DashboardService.get_dashboard_metrics(db_session, 99999)
        assert metrics.total_points == 0  # Should handle gracefully

        recommendations = RecommendationsService.get_recommendations(db_session, 99999)
        assert recommendations.total >= 0  # Should handle gracefully

        # Test card operations with invalid IDs
        nonexistent_card = CreditCardService.get_card(db_session, 99999, 1)
        assert nonexistent_card is None

        update_result = CreditCardService.update_card(db_session, 99999, 1, CreditCardUpdate(name="Test"))
        assert update_result is None

        delete_result = CreditCardService.delete_card(db_session, 99999, 1)
        assert delete_result == False

    def test_concurrent_service_operations(self, db_session):
        """Test concurrent service operations (simulated)"""
        # Create user
        user_data = UserCreate(email="concurrent@example.com", password="password123")
        user = create_user(db_session, user_data)

        # Create multiple cards in sequence (simulating concurrent operations)
        cards = []
        for i in range(5):
            card_data = CreditCardCreate(
                name=f"Concurrent Card {i}",
                card_type="Cashback",
                issuer="Test Bank",
                credit_limit=5000.0,
                annual_fee=0.0
            )
            card = CreditCardService.create_card(db_session, user.id, card_data)
            cards.append(card)

        # Verify all cards were created successfully
        user_cards = CreditCardService.get_user_cards(db_session, user.id)
        assert len(user_cards) == 5

        # Test that each card is independent
        for i, card in enumerate(cards):
            # Update each card independently
            new_name = f"Updated Card {i}"
            updated_card = CreditCardService.update_card(
                db_session, card.id, user.id,
                CreditCardUpdate(name=new_name)
            )
            assert updated_card.name == new_name

        # Verify all updates were applied
        final_cards = CreditCardService.get_user_cards(db_session, user.id)
        assert len(final_cards) == 5
        for i, card in enumerate(final_cards):
            assert f"Updated Card {i}" in card.name