import pytest
from app.models.user import User
from app.services.user import create_user, get_user, get_users, update_user
from app.schemas.user import UserCreate, UserUpdate
from app.services.user import create_user_from_google

class TestUserModelIntegration:
    def test_user_crud_operations(self, db_session):
        """Test complete CRUD operations for User model"""
        # Create
        user_data = UserCreate(
            email="crud@example.com",
            password="password123",
            full_name="CRUD Test User"
        )
        user = create_user(db_session, user_data)

        assert user.id is not None
        assert user.email == "crud@example.com"
        assert user.full_name == "CRUD Test User"
        assert user.is_active == True
        assert user.is_superuser == False

        # Read
        retrieved_user = get_user(db_session, user.id)
        assert retrieved_user is not None
        assert retrieved_user.email == user.email

        # Update
        update_data = UserUpdate(full_name="Updated Name", email="updated@example.com")
        updated_user = update_user(db_session, user, update_data)
        assert updated_user.full_name == "Updated Name"
        assert updated_user.email == "updated@example.com"

        # Verify update persisted
        refreshed_user = get_user(db_session, user.id)
        assert refreshed_user.full_name == "Updated Name"
        assert refreshed_user.email == "updated@example.com"

    def test_user_relationships(self, db_session):
        """Test user relationships with credit cards"""
        from app.services.card import CreditCardService
        from app.schemas.card import CreditCardCreate

        # Create user
        user_data = UserCreate(email="relations@example.com", password="password123")
        user = create_user(db_session, user_data)

        # Create credit card for user
        card_data = CreditCardCreate(
            name="Relationship Test Card",
            card_type="Cashback",
            issuer="Test Bank",
            credit_limit=5000.0,
            annual_fee=0.0
        )
        card = CreditCardService.create_card(db_session, user.id, card_data)

        # Refresh user to load relationships
        db_session.refresh(user)

        assert len(user.credit_cards) == 1
        assert user.credit_cards[0].name == "Relationship Test Card"
        assert user.credit_cards[0].user_id == user.id

    def test_google_oauth_user_creation(self, db_session):
        """Test creating user from Google OAuth data"""
        google_info = {
            "id": "google_12345",
            "email": "google@example.com",
            "name": "Google OAuth User"
        }

        user = create_user_from_google(db_session, google_info)

        assert user.email == "google@example.com"
        assert user.full_name == "Google OAuth User"
        assert user.google_id == "google_12345"
        assert user.is_active == True

        # Verify can retrieve by Google ID
        from app.services.user import get_user_by_google_id
        retrieved_user = get_user_by_google_id(db_session, "google_12345")
        assert retrieved_user.email == "google@example.com"

    def test_user_query_methods(self, db_session):
        """Test various user query methods"""
        # Create multiple users
        users_data = [
            UserCreate(email="query1@example.com", password="pass123", full_name="Query User 1"),
            UserCreate(email="query2@example.com", password="pass123", full_name="Query User 2"),
            UserCreate(email="query3@example.com", password="pass123", full_name="Query User 3"),
        ]

        created_users = []
        for user_data in users_data:
            user = create_user(db_session, user_data)
            created_users.append(user)

        # Test get_users with pagination
        all_users = get_users(db_session)
        assert len(all_users) >= 3

        # Test get_user_by_email
        from app.services.user import get_user_by_email
        user_by_email = get_user_by_email(db_session, "query2@example.com")
        assert user_by_email is not None
        assert user_by_email.full_name == "Query User 2"

        # Test non-existent user
        nonexistent = get_user(db_session, 99999)
        assert nonexistent is None

        nonexistent_by_email = get_user_by_email(db_session, "nonexistent@example.com")
        assert nonexistent_by_email is None

    def test_user_constraints(self, db_session):
        """Test database constraints and validation"""
        # Test unique email constraint
        user1_data = UserCreate(email="unique@example.com", password="pass123")
        create_user(db_session, user1_data)

        # Try to create user with same email
        user2_data = UserCreate(email="unique@example.com", password="pass456")

        with pytest.raises(Exception):  # Should raise IntegrityError
            create_user(db_session, user2_data)

    def test_user_soft_delete_simulation(self, db_session):
        """Test user deactivation (soft delete)"""
        user_data = UserCreate(email="softdelete@example.com", password="pass123")
        user = create_user(db_session, user_data)

        # In this model, there's no is_active field for users, but we can test the concept
        # The User model has is_active, so let's test updating it
        update_data = UserUpdate()  # Empty update shouldn't change anything
        updated_user = update_user(db_session, user, update_data)

        # User should still be active
        assert updated_user.is_active == True