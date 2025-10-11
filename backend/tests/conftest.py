import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient
from app.core.database import Base
from app.core.config import Settings
from app.main import app
from app.core.database import get_db

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session")
def test_db():
    """Create test database tables"""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db_session(test_db):
    """Provide a database session for each test"""
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="function")
def test_client(db_session):
    """Provide a test client with database session"""
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()

@pytest.fixture(scope="function")
def authenticated_user(test_client, db_session):
    """Provide an authenticated user for testing protected routes"""
    from app.services.user import create_user_from_google
    from app.auth.service import create_access_token
    from datetime import timedelta
    from app.core.config import settings
    
    # Create a test user
    google_user_info = {
        "id": "123456789",
        "email": "test@example.com",
        "name": "Test User"
    }
    db_user = create_user_from_google(db_session, google_user_info)
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.email}, expires_delta=access_token_expires
    )
    
    return {
        "user": db_user,
        "token": access_token,
        "headers": {"Authorization": f"Bearer {access_token}"}
    }

@pytest.fixture
def mock_google_oauth():
    """Mock Google OAuth for testing"""
    from unittest.mock import patch
    from tests.test_utils import MockGoogleOAuth
    
    with patch('app.auth.google.GoogleOAuth2.get_authorization_url') as mock_auth_url, \
         patch('app.auth.google.GoogleOAuth2.exchange_code_for_token') as mock_exchange, \
         patch('app.auth.google.GoogleOAuth2.get_user_info') as mock_user_info:

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
    from unittest.mock import AsyncMock, patch
    from app.schemas.chat import ChatResponse
    from datetime import datetime
    
    mock_response = AsyncMock()
    mock_response.return_value = ChatResponse(
        id="test-id",
        role="assistant",
        content="This is a mock AI response about credit cards.",
        timestamp=datetime.utcnow(),
        conversation_id="test-conversation",
        tokens_used=10
    )
    
    with patch('app.services.chat.ChatService.generate_response', mock_response):
        yield mock_response