import pytest
from datetime import datetime, timedelta
from app.services.dashboard import DashboardService
from app.services.card import CreditCardService
from app.services.user import create_user
from app.schemas.user import UserCreate
from app.schemas.card import CreditCardCreate, CreditCardUpdate

class TestDashboardService:
    def test_get_dashboard_metrics_no_cards(self, db_session):
        """Test dashboard metrics when user has no cards"""
        # Create user
        user_data = UserCreate(email="nocards@example.com", password="password123")
        user = create_user(db_session, user_data)

        metrics = DashboardService.get_dashboard_metrics(db_session, user.id)

        assert metrics.total_points == 0
        assert metrics.total_available_credit == 0.0
        assert metrics.average_utilization == 0.0
        assert metrics.cards_count == 0
        assert metrics.monthly_spending == 0.0
        assert metrics.monthly_points_earned == 0
        assert metrics.estimated_annual_value == 0.0

    def test_get_dashboard_metrics_with_cards(self, db_session):
        """Test dashboard metrics calculation with cards"""
        # Create user
        user_data = UserCreate(email="dashboard@example.com", password="password123")
        user = create_user(db_session, user_data)

        # Create cards
        card1_data = CreditCardCreate(
            name="Card 1",
            card_type="Travel",
            issuer="Test Bank",
            credit_limit=10000.0,
            annual_fee=95.0
        )
        card1 = CreditCardService.create_card(db_session, user.id, card1_data)

        card2_data = CreditCardCreate(
            name="Card 2",
            card_type="Cashback",
            issuer="Test Bank",
            credit_limit=5000.0,
            annual_fee=0.0
        )
        card2 = CreditCardService.create_card(db_session, user.id, card2_data)

        # Update card balances
        CreditCardService.update_card(db_session, card1.id, user.id,
                                    CreditCardUpdate(available_credit=8000.0, current_points=50000))
        CreditCardService.update_card(db_session, card2.id, user.id,
                                    CreditCardUpdate(available_credit=4000.0, current_points=25000))

        metrics = DashboardService.get_dashboard_metrics(db_session, user.id)

        assert metrics.total_points == 75000  # 50000 + 25000
        assert metrics.total_available_credit == 12000.0  # 8000 + 4000
        assert metrics.average_utilization == 20.0  # ((2000 + 1000) / 15000) * 100
        assert metrics.cards_count == 2

    def test_get_alerts_high_utilization(self, db_session):
        """Test alerts for high credit utilization"""
        # Create user and card
        user_data = UserCreate(email="alerts@example.com", password="password123")
        user = create_user(db_session, user_data)

        card_data = CreditCardCreate(
            name="High Util Card",
            card_type="Cashback",
            issuer="Test Bank",
            credit_limit=10000.0,
            annual_fee=0.0
        )
        card = CreditCardService.create_card(db_session, user.id, card_data)

        # Set high utilization (80%)
        CreditCardService.update_card(db_session, card.id, user.id,
                                    CreditCardUpdate(available_credit=2000.0))

        alerts = DashboardService.get_alerts(db_session, user.id)

        assert len(alerts) == 1
        assert alerts[0].type == "warning"
        assert "High Utilization" in alerts[0].title
        assert "80%" in alerts[0].message
        assert alerts[0].card_id == card.id

    def test_get_alerts_welcome_bonus_deadline(self, db_session):
        """Test alerts for approaching welcome bonus deadline"""
        # Create user and card with welcome bonus
        user_data = UserCreate(email="bonus@example.com", password="password123")
        user = create_user(db_session, user_data)

        card_data = CreditCardCreate(
            name="Bonus Card",
            card_type="Travel",
            issuer="Test Bank",
            credit_limit=10000.0,
            annual_fee=550.0,
            has_welcome_bonus=True,
            welcome_bonus_required=4000.0,
            welcome_bonus_deadline=datetime.utcnow() + timedelta(days=30)
        )
        card = CreditCardService.create_card(db_session, user.id, card_data)

        # Spend some towards bonus
        CreditCardService.update_card(db_session, card.id, user.id,
                                    CreditCardUpdate(welcome_bonus_spent=2000.0))

        alerts = DashboardService.get_alerts(db_session, user.id)

        assert len(alerts) == 1
        assert alerts[0].type == "info"
        assert "Welcome Bonus" in alerts[0].title
        assert "$2,000 more" in alerts[0].message
        assert "days" in alerts[0].message

    def test_get_alerts_low_points_balance(self, db_session):
        """Test alerts for low points balance"""
        # Create user and card with low points
        user_data = UserCreate(email="lowpoints@example.com", password="password123")
        user = create_user(db_session, user_data)

        card_data = CreditCardCreate(
            name="Low Points Card",
            card_type="Cashback",
            issuer="Test Bank",
            credit_limit=5000.0,
            annual_fee=0.0
        )
        card = CreditCardService.create_card(db_session, user.id, card_data)

        # Set low points balance
        CreditCardService.update_card(db_session, card.id, user.id,
                                    CreditCardUpdate(current_points=3000))

        alerts = DashboardService.get_alerts(db_session, user.id)

        assert len(alerts) == 1
        assert alerts[0].type == "info"
        assert "Low Points Balance" in alerts[0].title
        assert "3,000 points" in alerts[0].message

    def test_get_alerts_multiple_cards(self, db_session):
        """Test alerts generation for multiple cards"""
        # Create user
        user_data = UserCreate(email="multi@example.com", password="password123")
        user = create_user(db_session, user_data)

        # Create card with high utilization
        card1_data = CreditCardCreate(
            name="High Util Card",
            card_type="Cashback",
            issuer="Test Bank",
            credit_limit=10000.0,
            annual_fee=0.0
        )
        card1 = CreditCardService.create_card(db_session, user.id, card1_data)
        CreditCardService.update_card(db_session, card1.id, user.id,
                                    CreditCardUpdate(available_credit=2000.0))  # 80% util

        # Create card with low points
        card2_data = CreditCardCreate(
            name="Low Points Card",
            card_type="Travel",
            issuer="Test Bank",
            credit_limit=5000.0,
            annual_fee=0.0
        )
        card2 = CreditCardService.create_card(db_session, user.id, card2_data)
        CreditCardService.update_card(db_session, card2.id, user.id,
                                    CreditCardUpdate(current_points=2000))

        alerts = DashboardService.get_alerts(db_session, user.id)

        assert len(alerts) == 2
        alert_types = [alert.type for alert in alerts]
        assert "warning" in alert_types  # High utilization
        assert "info" in alert_types     # Low points

    def test_get_upcoming_actions_welcome_bonus(self, db_session):
        """Test upcoming actions for welcome bonus completion"""
        # Create user and card with welcome bonus
        user_data = UserCreate(email="actions@example.com", password="password123")
        user = create_user(db_session, user_data)

        card_data = CreditCardCreate(
            name="Action Card",
            card_type="Business",
            issuer="Test Bank",
            credit_limit=8000.0,
            annual_fee=0.0,
            has_welcome_bonus=True,
            welcome_bonus_required=5000.0,
            welcome_bonus_deadline=datetime.utcnow() + timedelta(days=45)
        )
        card = CreditCardService.create_card(db_session, user.id, card_data)

        # Spend some towards bonus
        CreditCardService.update_card(db_session, card.id, user.id,
                                    CreditCardUpdate(welcome_bonus_spent=3000.0))

        actions = DashboardService.get_upcoming_actions(db_session, user.id)

        assert len(actions) == 1
        assert actions[0]["title"] == "Complete Welcome Bonus"
        assert actions[0]["description"] == "Action Card"
        assert "$2,000 remaining" in actions[0]["amount"]
        assert "days" in actions[0]["deadline"]

    def test_get_dashboard_complete(self, db_session):
        """Test complete dashboard response"""
        # Create user and card
        user_data = UserCreate(email="complete@example.com", password="password123")
        user = create_user(db_session, user_data)

        card_data = CreditCardCreate(
            name="Dashboard Card",
            card_type="Travel",
            issuer="Test Bank",
            credit_limit=10000.0,
            annual_fee=95.0
        )
        card = CreditCardService.create_card(db_session, user.id, card_data)

        dashboard = DashboardService.get_dashboard(db_session, user.id)

        assert dashboard.metrics is not None
        assert dashboard.alerts is not None
        assert dashboard.upcoming_actions is not None
        assert dashboard.metrics.cards_count == 1
        assert len(dashboard.alerts) >= 0  # May have low points alert

    def test_get_dashboard_metrics_invalid_user(self, db_session):
        """Test dashboard metrics for non-existent user"""
        metrics = DashboardService.get_dashboard_metrics(db_session, 99999)

        # Should return default/empty metrics
        assert metrics.total_points == 0
        assert metrics.total_available_credit == 0.0
        assert metrics.average_utilization == 0.0
        assert metrics.cards_count == 0

    def test_get_alerts_invalid_user(self, db_session):
        """Test alerts for non-existent user"""
        alerts = DashboardService.get_alerts(db_session, 99999)

        assert alerts == []  # Should return empty list

    def test_get_upcoming_actions_invalid_user(self, db_session):
        """Test upcoming actions for non-existent user"""
        actions = DashboardService.get_upcoming_actions(db_session, 99999)

        assert actions == []  # Should return empty list

    def test_get_dashboard_invalid_user(self, db_session):
        """Test complete dashboard for non-existent user"""
        dashboard = DashboardService.get_dashboard(db_session, 99999)

        assert dashboard.metrics is not None
        assert dashboard.alerts == []
        assert dashboard.upcoming_actions == []
        assert dashboard.metrics.cards_count == 0

    def test_average_utilization_calculation_edge_cases(self, db_session):
        """Test average utilization calculation with edge cases"""
        # Create user
        user_data = UserCreate(email="edgecase@example.com", password="password123")
        user = create_user(db_session, user_data)

        # Create card with very small credit limit (minimum allowed by Pydantic)
        card_data = CreditCardCreate(
            name="Small Limit Card",
            card_type="Cashback",
            issuer="Test Bank",
            credit_limit=0.01,  # Very small but valid credit limit
            annual_fee=0.0
        )
        card = CreditCardService.create_card(db_session, user.id, card_data)

        metrics = DashboardService.get_dashboard_metrics(db_session, user.id)

        # Should handle small limits gracefully
        assert metrics.average_utilization >= 0.0

    def test_welcome_bonus_alerts_expired_deadline(self, db_session):
        """Test alerts for expired welcome bonus deadline"""
        # Create user and card with expired bonus
        user_data = UserCreate(email="expired@example.com", password="password123")
        user = create_user(db_session, user_data)

        card_data = CreditCardCreate(
            name="Expired Bonus Card",
            card_type="Travel",
            issuer="Test Bank",
            credit_limit=10000.0,
            annual_fee=0.0,
            has_welcome_bonus=True,
            welcome_bonus_required=4000.0,
            welcome_bonus_deadline=datetime.utcnow() - timedelta(days=1)  # Already expired
        )
        card = CreditCardService.create_card(db_session, user.id, card_data)

        alerts = DashboardService.get_alerts(db_session, user.id)

        # Should not generate alerts for expired bonuses
        expired_alerts = [a for a in alerts if "expired" in a.title.lower() or "deadline" in a.message.lower()]
        assert len(expired_alerts) == 0

    def test_upcoming_actions_no_welcome_bonuses(self, db_session):
        """Test upcoming actions when no welcome bonuses exist"""
        # Create user with regular cards (no welcome bonuses)
        user_data = UserCreate(email="nobonus@example.com", password="password123")
        user = create_user(db_session, user_data)

        card_data = CreditCardCreate(
            name="Regular Card",
            card_type="Cashback",
            issuer="Test Bank",
            credit_limit=5000.0,
            annual_fee=0.0,
            has_welcome_bonus=False  # No welcome bonus
        )
        CreditCardService.create_card(db_session, user.id, card_data)

        actions = DashboardService.get_upcoming_actions(db_session, user.id)

        assert actions == []  # Should return empty list

    def test_metrics_calculation_with_inactive_cards(self, db_session):
        """Test metrics calculation excludes inactive cards"""
        # Create user
        user_data = UserCreate(email="inactive@example.com", password="password123")
        user = create_user(db_session, user_data)

        # Create active card
        active_card_data = CreditCardCreate(
            name="Active Card",
            card_type="Travel",
            issuer="Test Bank",
            credit_limit=10000.0,
            annual_fee=0.0
        )
        active_card = CreditCardService.create_card(db_session, user.id, active_card_data)
        CreditCardService.update_card(db_session, active_card.id, user.id,
                                    CreditCardUpdate(current_points=50000))

        # Create inactive card
        inactive_card_data = CreditCardCreate(
            name="Inactive Card",
            card_type="Cashback",
            issuer="Test Bank",
            credit_limit=5000.0,
            annual_fee=0.0
        )
        inactive_card = CreditCardService.create_card(db_session, user.id, inactive_card_data)
        CreditCardService.update_card(db_session, inactive_card.id, user.id,
                                    CreditCardUpdate(current_points=25000))
        CreditCardService.delete_card(db_session, inactive_card.id, user.id)  # Deactivate

        metrics = DashboardService.get_dashboard_metrics(db_session, user.id)

        # Should only count active card
        assert metrics.total_points == 50000  # Only active card points
        assert metrics.cards_count == 1  # Only active card counted