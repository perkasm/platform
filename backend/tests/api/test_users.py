import pytest
from fastapi.testclient import TestClient


class TestUsersAPI:
    """Test cases for users API endpoints"""

    def test_read_users(self, test_client, authenticated_user):
        """Test getting list of users"""
        headers = authenticated_user["headers"]
        response = test_client.get("/api/v1/users/", headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1  # At least the authenticated user

    def test_read_users_unauthorized(self, test_client):
        """Test getting users without authentication (no auth required)"""
        response = test_client.get("/api/v1/users/")

        assert response.status_code == 200

    def test_create_user(self, test_client):
        """Test creating a new user"""
        user_data = {
            "email": "newuser@example.com",
            "password": "testpassword123",
            "full_name": "New User"
        }
        response = test_client.post("/api/v1/users/", json=user_data)

        assert response.status_code == 200
        data = response.json()
        assert data["email"] == user_data["email"]
        assert data["full_name"] == user_data["full_name"]
        assert "id" in data

    def test_create_user_duplicate_email(self, test_client):
        """Test creating user with duplicate email"""
        # First create a user
        user_data = {
            "email": "duplicate@example.com",
            "password": "testpassword123",
            "full_name": "Original User"
        }
        test_client.post("/api/v1/users/", json=user_data)

        # Now try to create another user with the same email
        duplicate_data = {
            "email": "duplicate@example.com",
            "password": "testpassword456",
            "full_name": "Duplicate User"
        }
        response = test_client.post("/api/v1/users/", json=duplicate_data)

        assert response.status_code == 400
        assert "Email already registered" in response.json()["detail"]

    def test_read_user(self, test_client, authenticated_user):
        """Test getting a specific user"""
        headers = authenticated_user["headers"]
        user_id = authenticated_user["user"].id

        response = test_client.get(f"/api/v1/users/{user_id}", headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == user_id
        assert data["email"] == "test@example.com"

    def test_read_user_not_found(self, test_client, authenticated_user):
        """Test getting a non-existent user"""
        headers = authenticated_user["headers"]

        response = test_client.get("/api/v1/users/99999", headers=headers)

        assert response.status_code == 404
        assert "User not found" in response.json()["detail"]

    def test_read_user_unauthorized(self, test_client):
        """Test getting user without authentication (no auth required)"""
        # First create a user
        user_data = {
            "email": "testuser@example.com",
            "password": "testpassword123",
            "full_name": "Test User"
        }
        create_response = test_client.post("/api/v1/users/", json=user_data)
        user_id = create_response.json()["id"]

        response = test_client.get(f"/api/v1/users/{user_id}")

        assert response.status_code == 200

    def test_update_user(self, test_client, authenticated_user):
        """Test updating user information"""
        headers = authenticated_user["headers"]
        user_id = authenticated_user["user"].id

        update_data = {
            "full_name": "Updated Name"
        }

        response = test_client.put(f"/api/v1/users/{user_id}", json=update_data, headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert data["full_name"] == "Updated Name"

    def test_update_user_not_found(self, test_client, authenticated_user):
        """Test updating a non-existent user"""
        headers = authenticated_user["headers"]

        update_data = {
            "full_name": "Updated Name"
        }

        response = test_client.put("/api/v1/users/99999", json=update_data, headers=headers)

        assert response.status_code == 404
        assert "User not found" in response.json()["detail"]

    def test_update_user_unauthorized(self, test_client, authenticated_user):
        """Test updating user without proper authorization"""
        # Create another user first
        user_data = {
            "email": "other@example.com",
            "password": "testpassword123",
            "full_name": "Other User"
        }
        create_response = test_client.post("/api/v1/users/", json=user_data)
        other_user_id = create_response.json()["id"]

        # Try to update with authenticated_user's token
        headers = authenticated_user["headers"]
        update_data = {"full_name": "Hacked Name"}

        response = test_client.put(f"/api/v1/users/{other_user_id}", json=update_data, headers=headers)

        assert response.status_code == 403
        assert "Not authorized" in response.json()["detail"]