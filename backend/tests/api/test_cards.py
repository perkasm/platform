import pytest
from fastapi.testclient import TestClient


class TestCardsAPI:
    """Test cases for cards API endpoints"""

    def test_get_cards(self, test_client, authenticated_user):
        """Test getting user's cards"""
        headers = authenticated_user["headers"]
        response = test_client.get("/api/v1/cards/", headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert "cards" in data
        assert "total" in data
        assert isinstance(data["cards"], list)

    def test_get_cards_unauthorized(self, test_client):
        """Test getting cards without authentication"""
        response = test_client.get("/api/v1/cards/")

        assert response.status_code == 401

    def test_create_card(self, test_client, authenticated_user):
        """Test creating a new credit card"""
        headers = authenticated_user["headers"]
        card_data = {
            "name": "Test Card",
            "card_type": "credit",
            "issuer": "Test Bank",
            "credit_limit": 5000.0,
            "annual_fee": 95.0,
            "last_four": "1234",
            "has_welcome_bonus": False,
            "welcome_bonus_required": 0.0
        }

        response = test_client.post("/api/v1/cards/", json=card_data, headers=headers)

        assert response.status_code == 201
        data = response.json()
        assert data["name"] == card_data["name"]
        assert data["last_four"] == card_data["last_four"]
        assert "id" in data

    def test_create_card_invalid_data(self, test_client, authenticated_user):
        """Test creating card with invalid data"""
        headers = authenticated_user["headers"]
        card_data = {
            "name": "",  # Invalid: empty name
            "card_type": "invalid_type",
            "issuer": "Test Bank",
            "credit_limit": -100.0,  # Invalid: negative
            "annual_fee": -50.0,  # Invalid: negative
            "last_four": "12345",  # Invalid: too many digits
            "has_welcome_bonus": False,
            "welcome_bonus_required": 0.0
        }

        response = test_client.post("/api/v1/cards/", json=card_data, headers=headers)

        assert response.status_code == 422  # Pydantic validation error

    def test_create_card_validation_edge_cases(self, test_client, authenticated_user):
        """Test various Pydantic validation edge cases"""
        headers = authenticated_user["headers"]

        # Test name too long
        card_data = {
            "name": "A" * 101,  # 101 characters, exceeds max_length=100
            "card_type": "credit",
            "issuer": "Test Bank",
            "credit_limit": 5000.0,
            "annual_fee": 95.0,
            "has_welcome_bonus": False,
            "welcome_bonus_required": 0.0
        }
        response = test_client.post("/api/v1/cards/", json=card_data, headers=headers)
        assert response.status_code == 422

        # Test invalid expiration date format
        card_data = {
            "name": "Test Card",
            "card_type": "credit",
            "issuer": "Test Bank",
            "credit_limit": 5000.0,
            "annual_fee": 95.0,
            "expiration_date": "123/456",  # Invalid format - too many digits
            "has_welcome_bonus": False,
            "welcome_bonus_required": 0.0
        }
        response = test_client.post("/api/v1/cards/", json=card_data, headers=headers)
        assert response.status_code == 422

        # Test negative welcome bonus required
        card_data = {
            "name": "Test Card",
            "card_type": "credit",
            "issuer": "Test Bank",
            "credit_limit": 5000.0,
            "annual_fee": 95.0,
            "has_welcome_bonus": True,
            "welcome_bonus_required": -100.0,  # Invalid negative
        }
        response = test_client.post("/api/v1/cards/", json=card_data, headers=headers)
        assert response.status_code == 422

    def test_get_card(self, test_client, authenticated_user):
        """Test getting a specific card"""
        headers = authenticated_user["headers"]

        # First create a card
        card_data = {
            "name": "Test Card",
            "card_type": "credit",
            "issuer": "Test Bank",
            "credit_limit": 5000.0,
            "annual_fee": 95.0,
            "last_four": "1234",
            "has_welcome_bonus": False,
            "welcome_bonus_required": 0.0
        }
        create_response = test_client.post("/api/v1/cards/", json=card_data, headers=headers)
        card_id = create_response.json()["id"]

        # Now get the card
        response = test_client.get(f"/api/v1/cards/{card_id}", headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == card_id
        assert data["name"] == card_data["name"]

    def test_get_card_not_found(self, test_client, authenticated_user):
        """Test getting a non-existent card"""
        headers = authenticated_user["headers"]

        response = test_client.get("/api/v1/cards/99999", headers=headers)

        assert response.status_code == 404
        assert "Card not found" in response.json()["detail"]

    def test_get_card_unauthorized(self, test_client):
        """Test getting card without authentication"""
        response = test_client.get("/api/v1/cards/1")

        assert response.status_code == 401

    def test_update_card(self, test_client, authenticated_user):
        """Test updating a card"""
        headers = authenticated_user["headers"]

        # First create a card
        card_data = {
            "name": "Original Card",
            "card_type": "credit",
            "issuer": "Test Bank",
            "credit_limit": 5000.0,
            "annual_fee": 95.0,
            "last_four": "1234",
            "has_welcome_bonus": False,
            "welcome_bonus_required": 0.0
        }
        create_response = test_client.post("/api/v1/cards/", json=card_data, headers=headers)
        card_id = create_response.json()["id"]

        # Update the card
        update_data = {
            "name": "Updated Card",
            "current_balance": 100.0
        }
        response = test_client.put(f"/api/v1/cards/{card_id}", json=update_data, headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Card"
        assert data["current_balance"] == 100.0

    def test_update_card_not_found(self, test_client, authenticated_user):
        """Test updating a non-existent card"""
        headers = authenticated_user["headers"]

        update_data = {"name": "Updated Name"}
        response = test_client.put("/api/v1/cards/99999", json=update_data, headers=headers)

        assert response.status_code == 404
        assert "Card not found" in response.json()["detail"]

    def test_update_card_validation(self, test_client, authenticated_user):
        """Test validation on card updates"""
        headers = authenticated_user["headers"]

        # First create a valid card
        card_data = {
            "name": "Valid Card",
            "card_type": "credit",
            "issuer": "Test Bank",
            "credit_limit": 5000.0,
            "annual_fee": 95.0,
            "has_welcome_bonus": False,
            "welcome_bonus_required": 0.0
        }
        create_response = test_client.post("/api/v1/cards/", json=card_data, headers=headers)
        assert create_response.status_code == 201
        card_id = create_response.json()["id"]

        # Try to update with invalid data
        update_data = {
            "credit_limit": -500.0,  # Invalid negative
            "annual_fee": -100.0     # Invalid negative
        }
        response = test_client.put(f"/api/v1/cards/{card_id}", json=update_data, headers=headers)
        assert response.status_code == 422

    def test_delete_card(self, test_client, authenticated_user):
        """Test deleting (deactivating) a card"""
        headers = authenticated_user["headers"]

        # First create a card
        card_data = {
            "name": "Card to Delete",
            "card_type": "credit",
            "issuer": "Test Bank",
            "credit_limit": 5000.0,
            "annual_fee": 95.0,
            "last_four": "1234",
            "has_welcome_bonus": False,
            "welcome_bonus_required": 0.0
        }
        create_response = test_client.post("/api/v1/cards/", json=card_data, headers=headers)
        card_id = create_response.json()["id"]

        # Delete the card
        response = test_client.delete(f"/api/v1/cards/{card_id}", headers=headers)

        assert response.status_code == 204

        # Verify the card is deactivated
        get_response = test_client.get(f"/api/v1/cards/{card_id}", headers=headers)
        assert get_response.status_code == 200
        data = get_response.json()
        assert data["is_active"] == False

    def test_delete_card_not_found(self, test_client, authenticated_user):
        """Test deleting a non-existent card"""
        headers = authenticated_user["headers"]

        response = test_client.delete("/api/v1/cards/99999", headers=headers)

        assert response.status_code == 404
        assert "Card not found" in response.json()["detail"]

    def test_get_cards_active_only(self, test_client, authenticated_user):
        """Test getting only active cards"""
        headers = authenticated_user["headers"]

        # Create an active card
        active_card = {
            "name": "Active Card",
            "card_type": "credit",
            "issuer": "Test Bank",
            "credit_limit": 5000.0,
            "annual_fee": 95.0,
            "last_four": "1234",
            "has_welcome_bonus": False,
            "welcome_bonus_required": 0.0
        }
        test_client.post("/api/v1/cards/", json=active_card, headers=headers)

        # Create an inactive card
        inactive_card = {
            "name": "Inactive Card",
            "card_type": "credit",
            "issuer": "Test Bank",
            "credit_limit": 3000.0,
            "annual_fee": 0.0,
            "last_four": "5678",
            "has_welcome_bonus": False,
            "welcome_bonus_required": 0.0
        }
        create_inactive = test_client.post("/api/v1/cards/", json=inactive_card, headers=headers)
        inactive_id = create_inactive.json()["id"]
        
        # Deactivate the card
        test_client.delete(f"/api/v1/cards/{inactive_id}", headers=headers)

        # Get all cards (active_only=True by default)
        response = test_client.get("/api/v1/cards/", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data["cards"]) == 1
        assert data["cards"][0]["name"] == "Active Card"

        # Get all cards including inactive
        response = test_client.get("/api/v1/cards/?active_only=false", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data["cards"]) == 2