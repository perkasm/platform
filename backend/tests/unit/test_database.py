"""
Unit tests for database configuration and connection
"""

import pytest
from unittest.mock import patch, MagicMock
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import get_db, database_available, SessionLocal, engine, Base


class TestDatabase:
    """Test database configuration and connection handling"""

    def test_database_available_true(self):
        """Test that database is marked as available when connection succeeds"""
        # This test assumes database connection works in test environment
        assert database_available is True
        assert engine is not None
        assert SessionLocal is not None
        assert Base is not None

    def test_get_db_with_available_database(self):
        """Test get_db yields a database session when database is available"""
        db_generator = get_db()
        db = next(db_generator)

        assert db is not None
        # The session should be a SQLAlchemy session
        assert hasattr(db, 'close')

        # Clean up
        try:
            db_generator.close()
        except:
            pass

    @patch('app.core.database.database_available', False)
    @patch('app.core.database.SessionLocal', None)
    def test_get_db_with_unavailable_database(self):
        """Test get_db yields None when database is not available"""
        db_generator = get_db()
        db = next(db_generator)

        assert db is None

        # Clean up
        try:
            db_generator.close()
        except:
            pass