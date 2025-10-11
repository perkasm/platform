import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from tests.test_utils import MockGoogleOAuth


class TestAuthAPI:
    """Test cases for authentication API endpoints"""

    def test_google_login_redirect(self, test_client):
        """Test Google OAuth login redirect"""
        response = test_client.get("/api/v1/auth/google/login", follow_redirects=False)
        assert response.status_code in [302, 307]  # Redirect status codes
        assert "accounts.google.com" in response.headers["location"]

    def test_google_callback_success(self, test_client, db_session, mock_google_oauth):
        """Test successful Google OAuth callback"""
        response = test_client.get("/api/v1/auth/google/callback?code=mock_code")

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_google_callback_invalid_code(self, test_client, mock_google_oauth):
        """Test Google OAuth callback with invalid code"""
        # Mock exchange_code_for_token to return error
        mock_google_oauth['exchange'].return_value = {"error": "invalid_grant"}

        response = test_client.get("/api/v1/auth/google/callback?code=invalid_code")

        assert response.status_code == 400
        assert "Failed to authenticate with Google" in response.json()["detail"]

    def test_get_current_user(self, test_client, authenticated_user):
        """Test getting current user information"""
        headers = authenticated_user["headers"]
        response = test_client.get("/api/v1/auth/me", headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "test@example.com"
        assert data["full_name"] == "Test User"

    def test_get_current_user_unauthorized(self, test_client):
        """Test getting current user without authentication"""
        response = test_client.get("/api/v1/auth/me")

        assert response.status_code == 401

    def test_jwt_token_validation(self, test_client, db_session):
        """Test JWT token creation and validation"""
        from app.auth.service import create_access_token
        from app.models.user import User
        from datetime import timedelta

        # Create a test user
        user = User(email="jwt_test@example.com", full_name="JWT Test User")
        db_session.add(user)
        db_session.commit()

        # Create a valid token
        token = create_access_token(data={"sub": user.email}, expires_delta=timedelta(hours=1))

        # Test accessing protected route with valid token
        headers = {"Authorization": f"Bearer {token}"}
        response = test_client.get("/api/v1/auth/me", headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert data["email"] == user.email

    def test_expired_jwt_token(self, test_client, db_session):
        """Test expired JWT token rejection"""
        from app.auth.service import create_access_token
        from app.models.user import User
        from datetime import timedelta

        # Create a test user
        user = User(email="expired_test@example.com", full_name="Expired Test User")
        db_session.add(user)
        db_session.commit()

        # Create an expired token
        token = create_access_token(data={"sub": user.email}, expires_delta=timedelta(seconds=-1))

        # Test accessing protected route with expired token
        headers = {"Authorization": f"Bearer {token}"}
        response = test_client.get("/api/v1/auth/me", headers=headers)

        # JWT library may not distinguish between expired and invalid tokens
        assert response.status_code == 401

    def test_invalid_jwt_token(self, test_client):
        """Test invalid JWT token rejection"""
        headers = {"Authorization": "Bearer invalid.token.here"}
        response = test_client.get("/api/v1/auth/me", headers=headers)

        assert response.status_code == 401

    def test_malformed_authorization_header(self, test_client):
        """Test malformed authorization header"""
        # Missing Bearer prefix
        headers = {"Authorization": "invalid_token"}
        response = test_client.get("/api/v1/auth/me", headers=headers)
        assert response.status_code == 401

        # Wrong format
        headers = {"Authorization": "Basic dXNlcjpwYXNz"}
        response = test_client.get("/api/v1/auth/me", headers=headers)
        assert response.status_code == 401

    def test_protected_route_access_control(self, test_client, authenticated_user):
        """Test that protected routes properly enforce authentication"""
        # Test various protected endpoints without auth
        protected_endpoints = [
            ("/api/v1/cards/", "get"),
            ("/api/v1/dashboard/", "get"),
            ("/api/v1/recommendations/", "get"),
            ("/api/v1/auth/me", "get"),
            ("/api/v1/cards/", "post"),  # Test POST as well
        ]

        for endpoint, method in protected_endpoints:
            if method == "get":
                response = test_client.get(endpoint)
            elif method == "post":
                response = test_client.post(endpoint, json={})
            assert response.status_code == 401, f"Endpoint {endpoint} ({method}) should require authentication"

    def test_user_isolation(self, test_client, db_session):
        """Test that users can only access their own data"""
        from app.auth.service import create_access_token
        from app.models.user import User
        from app.models.card import CreditCard
        from datetime import timedelta

        # Create two test users
        user1 = User(email="user1@example.com", full_name="User One")
        user2 = User(email="user2@example.com", full_name="User Two")
        db_session.add(user1)
        db_session.add(user2)
        db_session.commit()

        # Create cards for each user
        card1 = CreditCard(
            user_id=user1.id,
            name="User1 Card",
            card_type="Cashback",
            issuer="Test",
            credit_limit=1000.0,
            available_credit=1000.0,
            current_balance=0.0,
            current_points=0
        )
        card2 = CreditCard(
            user_id=user2.id,
            name="User2 Card",
            card_type="Travel",
            issuer="Test",
            credit_limit=2000.0,
            available_credit=2000.0,
            current_balance=0.0,
            current_points=0
        )
        db_session.add(card1)
        db_session.add(card2)
        db_session.commit()

        # Test user1 can access their own card but not user2's
        token1 = create_access_token(data={"sub": user1.email}, expires_delta=timedelta(hours=1))
        headers1 = {"Authorization": f"Bearer {token1}"}

        response = test_client.get(f"/api/v1/cards/{card1.id}", headers=headers1)
        assert response.status_code == 200

        response = test_client.get(f"/api/v1/cards/{card2.id}", headers=headers1)
        assert response.status_code == 404  # Should not find other user's card

    def test_role_based_access_control_superuser(self, test_client, db_session):
        """Test that superusers can access and modify other users' data"""
        from app.auth.service import create_access_token
        from app.models.user import User
        from datetime import timedelta

        # Create a regular user and a superuser
        regular_user = User(email="regular@example.com", full_name="Regular User", is_superuser=False)
        super_user = User(email="super@example.com", full_name="Super User", is_superuser=True)
        db_session.add(regular_user)
        db_session.add(super_user)
        db_session.commit()

        # Test superuser can update regular user's profile
        super_token = create_access_token(data={"sub": super_user.email}, expires_delta=timedelta(hours=1))
        headers_super = {"Authorization": f"Bearer {super_token}"}

        update_data = {"full_name": "Updated by Superuser"}
        response = test_client.put(f"/api/v1/users/{regular_user.id}", json=update_data, headers=headers_super)
        assert response.status_code == 200

        # Verify the update was successful
        db_session.refresh(regular_user)
        assert regular_user.full_name == "Updated by Superuser"

    def test_role_based_access_control_regular_user(self, test_client, db_session):
        """Test that regular users cannot modify other users' data"""
        from app.auth.service import create_access_token
        from app.models.user import User
        from datetime import timedelta

        # Create two regular users
        user1 = User(email="user1@example.com", full_name="User One", is_superuser=False)
        user2 = User(email="user2@example.com", full_name="User Two", is_superuser=False)
        db_session.add(user1)
        db_session.add(user2)
        db_session.commit()

        # Test user1 cannot update user2's profile
        token1 = create_access_token(data={"sub": user1.email}, expires_delta=timedelta(hours=1))
        headers1 = {"Authorization": f"Bearer {token1}"}

        update_data = {"full_name": "Hacked by User1"}
        response = test_client.put(f"/api/v1/users/{user2.id}", json=update_data, headers=headers1)
        assert response.status_code == 403

        # Verify user2's data was not changed
        db_session.refresh(user2)
        assert user2.full_name == "User Two"

    def test_token_refresh_not_implemented(self, test_client, authenticated_user):
        """Test that token refresh functionality is not implemented (returns 404)"""
        # This test documents that refresh tokens are not currently supported
        # When implemented, this should be updated to test actual refresh logic
        headers = authenticated_user["headers"]
        response = test_client.post("/api/v1/auth/refresh", headers=headers)
        # Currently not implemented, should return 404
        assert response.status_code == 404

    def test_token_expiration_handling(self, test_client, db_session):
        """Test comprehensive token expiration handling"""
        from app.auth.service import create_access_token
        from app.models.user import User
        from datetime import timedelta
        import time

        # Create a test user
        user = User(email="expire_test@example.com", full_name="Expire Test User")
        db_session.add(user)
        db_session.commit()

        # Create a token that expires in 1 second
        token = create_access_token(data={"sub": user.email}, expires_delta=timedelta(seconds=1))
        headers = {"Authorization": f"Bearer {token}"}

        # Token should work initially
        response = test_client.get("/api/v1/auth/me", headers=headers)
        assert response.status_code == 200

        # Wait for token to expire
        time.sleep(2)

        # Token should now be expired
        response = test_client.get("/api/v1/auth/me", headers=headers)
        assert response.status_code == 401