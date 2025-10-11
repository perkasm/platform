import pytest
from unittest.mock import Mock, patch
from httpx import AsyncClient

class MockGoogleOAuth:
    """Mock Google OAuth responses for testing"""

    @staticmethod
    def get_mock_token_response():
        return {
            "access_token": "mock_access_token",
            "token_type": "Bearer",
            "expires_in": 3600,
            "refresh_token": "mock_refresh_token"
        }

    @staticmethod
    def get_mock_user_info():
        return {
            "id": "123456789",
            "email": "test@example.com",
            "verified_email": True,
            "name": "Test User",
            "given_name": "Test",
            "family_name": "User",
            "picture": "https://example.com/photo.jpg"
        }

@pytest.fixture
def mock_google_oauth():
    """Mock Google OAuth for testing"""
    with patch('app.auth.google.GoogleOAuth.get_authorization_url') as mock_auth_url, \
         patch('app.auth.google.GoogleOAuth.exchange_code_for_token') as mock_exchange, \
         patch('app.auth.google.GoogleOAuth.get_user_info') as mock_user_info:

        mock_auth_url.return_value = "https://accounts.google.com/oauth/authorize?mock=params"
        mock_exchange.return_value = MockGoogleOAuth.get_mock_token_response()
        mock_user_info.return_value = MockGoogleOAuth.get_mock_user_info()

        yield {
            'auth_url': mock_auth_url,
            'exchange': mock_exchange,
            'user_info': mock_user_info
        }

@pytest.fixture
def mock_ai_chat():
    """Mock AI chat service for testing"""
    with patch('app.services.chat.ChatService.generate_response') as mock_response:
        mock_response.return_value = {
            "response": "This is a mock AI response",
            "confidence": 0.95
        }
        yield mock_response