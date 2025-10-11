import pytest
from unittest.mock import patch, AsyncMock
from fastapi.testclient import TestClient


class TestChatAPI:
    """Test cases for chat API endpoints"""

    def test_send_message(self, test_client, authenticated_user, mock_ai_chat):
        """Test sending a message to the AI assistant"""
        headers = authenticated_user["headers"]
        message_data = {
            "message": "What are the best credit cards for travel?"
        }

        response = test_client.post("/api/v1/chat/", json=message_data, headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "role" in data
        assert "content" in data
        assert "timestamp" in data
        assert "conversation_id" in data
        assert data["role"] == "assistant"
        assert isinstance(data["content"], str)
        assert len(data["content"]) > 0

    def test_send_message_unauthorized(self, test_client):
        """Test sending message without authentication"""
        message_data = {
            "message": "Hello AI"
        }

        response = test_client.post("/api/v1/chat/", json=message_data)

        assert response.status_code == 401

    def test_send_message_empty_message(self, test_client, authenticated_user):
        """Test sending an empty message"""
        headers = authenticated_user["headers"]
        message_data = {
            "message": ""
        }

        response = test_client.post("/api/v1/chat/", json=message_data, headers=headers)

        # Should fail validation
        assert response.status_code == 422

    def test_send_message_long_message(self, test_client, authenticated_user, mock_ai_chat):
        """Test sending a long message"""
        headers = authenticated_user["headers"]
        long_message = "What are the best credit cards for travel? " * 50  # Very long message (>2000 chars)
        message_data = {
            "message": long_message
        }

        response = test_client.post("/api/v1/chat/", json=message_data, headers=headers)

        # Should fail validation due to max_length=2000
        assert response.status_code == 422

    def test_send_message_special_characters(self, test_client, authenticated_user, mock_ai_chat):
        """Test sending message with special characters"""
        headers = authenticated_user["headers"]
        message_data = {
            "message": "What cards for $1000+ spending? @#$%^&*()"
        }

        response = test_client.post("/api/v1/chat/", json=message_data, headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "role" in data
        assert "content" in data
        assert data["role"] == "assistant"

    def test_chat_service_error_handling(self, test_client, authenticated_user):
        """Test error handling when AI service fails"""
        headers = authenticated_user["headers"]
        message_data = {
            "message": "Test message"
        }

        # Mock the service to raise an exception
        with patch('app.services.chat.ChatService.generate_response', new_callable=AsyncMock) as mock_service:
            mock_service.side_effect = Exception("AI service unavailable")

            # In FastAPI, unhandled exceptions should return 500, but TestClient may raise them
            try:
                response = test_client.post("/api/v1/chat/", json=message_data, headers=headers)
                assert response.status_code == 500
            except Exception as e:
                # If TestClient raises the exception, that's also acceptable behavior in tests
                assert "AI service unavailable" in str(e)