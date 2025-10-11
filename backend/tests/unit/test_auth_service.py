"""
Unit tests for authentication service functions
"""

import pytest
from datetime import timedelta
from unittest.mock import patch
from jose import JWTError

from app.auth.service import (
    verify_password,
    get_password_hash,
    create_access_token,
    decode_access_token
)
from app.core.config import settings


class TestAuthService:
    """Test authentication service functions"""

    def test_verify_password_valid(self):
        """Test password verification with valid password"""
        plain_password = "testpassword123"
        hashed_password = get_password_hash(plain_password)

        assert verify_password(plain_password, hashed_password) is True

    def test_verify_password_invalid(self):
        """Test password verification with invalid password"""
        plain_password = "testpassword123"
        wrong_password = "wrongpassword"
        hashed_password = get_password_hash(plain_password)

        assert verify_password(wrong_password, hashed_password) is False

    def test_get_password_hash(self):
        """Test password hashing"""
        password = "testpassword123"
        hashed = get_password_hash(password)

        # Hash should be different from plain password
        assert hashed != password
        # Hash should be a string
        assert isinstance(hashed, str)
        # Hash should be reasonably long
        assert len(hashed) > 20

    def test_create_access_token_with_expires_delta(self):
        """Test access token creation with custom expiration"""
        data = {"sub": "test@example.com"}
        expires_delta = timedelta(minutes=30)

        token = create_access_token(data, expires_delta)

        assert isinstance(token, str)
        assert len(token) > 0

    def test_create_access_token_default_expiration(self):
        """Test access token creation with default expiration"""
        data = {"sub": "test@example.com"}

        token = create_access_token(data)

        assert isinstance(token, str)
        assert len(token) > 0

    def test_decode_access_token_valid(self):
        """Test decoding valid access token"""
        data = {"sub": "test@example.com"}
        token = create_access_token(data)

        decoded = decode_access_token(token)

        assert decoded is not None
        assert decoded.email == "test@example.com"

    def test_decode_access_token_invalid_payload(self):
        """Test decoding token with invalid payload (no sub claim)"""
        # Create token without sub claim
        data = {"some_other_field": "value"}
        token = create_access_token(data)

        decoded = decode_access_token(token)

        assert decoded is None

    @patch('app.auth.service.jwt.decode')
    def test_decode_access_token_jwt_error(self, mock_decode):
        """Test decoding token that raises JWTError"""
        mock_decode.side_effect = JWTError("Invalid token")

        decoded = decode_access_token("invalid_token")

        assert decoded is None

    def test_decode_access_token_malformed(self):
        """Test decoding malformed token"""
        decoded = decode_access_token("malformed.token.here")

        assert decoded is None