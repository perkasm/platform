# Perkasm Platform Backend

A FastAPI-based REST API with JWT authentication, modular structure, and PostgreSQL integration.

## Features

- FastAPI framework for high-performance REST APIs
- JWT-based authentication with Google OAuth2 integration
- Modular architecture for easy extension
- PostgreSQL database with SQLAlchemy ORM and pgvector support for AI features
- CORS support
- Comprehensive API endpoints for users, credit cards, chat, dashboard, and recommendations
- MVC pattern with models, services, and API routes

## Project Structure

```
app/
├── api/                    # API route definitions
│   └── v1/                # API version 1
│       ├── auth.py        # Authentication routes
│       ├── users.py       # User management routes
│       ├── cards.py       # Credit card management routes
│       ├── chat.py        # AI chat routes
│       ├── dashboard.py   # Dashboard data routes
│       └── recommendations.py # Recommendation routes
├── auth/                  # Authentication services
│   ├── service.py         # JWT token service
│   ├── dependencies.py    # Authentication dependencies
│   ├── oauth2.py          # OAuth2 base class
│   └── google.py          # Google OAuth2 implementation
├── core/                  # Core application components
│   ├── config.py          # Configuration settings
│   └── database.py        # Database connection
├── models/                # Database models
│   ├── base.py            # Base model class
│   ├── user.py            # User model
│   ├── card.py            # Credit card model
│   └── transaction.py     # Transaction model
├── schemas/               # Pydantic schemas
│   ├── token.py           # Token schemas
│   ├── user.py            # User schemas
│   ├── card.py            # Card schemas
│   ├── chat.py            # Chat schemas
│   └── transaction.py     # Transaction schemas
├── services/              # Business logic services
│   ├── user.py            # User service
│   ├── card.py            # Card service
│   ├── chat.py            # Chat service
│   ├── dashboard.py       # Dashboard service
│   └── recommendations.py # Recommendations service
└── main.py                # Application entry point
```

## Setup

1. Install dependencies with `uv`:
   ```bash
   uv sync
   ```

2. Set up environment variables in a `.env` file:
   ```bash
   POSTGRES_SERVER=localhost
   POSTGRES_USER=perkasm
   POSTGRES_PASSWORD=password
   POSTGRES_DB=perkasm
   SECRET_KEY=your_secret_key
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

### Google OAuth2 Setup (One-time)

To enable Google login authentication, you need to create OAuth2 credentials in Google Cloud Console:

1. **Go to Google Cloud Console**: Visit [https://console.cloud.google.com/](https://console.cloud.google.com/)

2. **Create or Select a Project**:
   - If you don't have a project, click "Create Project"
   - Give it a name (e.g., "Perkasm Platform")
   - Select your organization if applicable

3. **Enable Google+ API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
   - Also enable "Google People API" (needed for user profile data)

4. **Create OAuth2 Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application" as application type
   - Add authorized redirect URIs:
     - For development: `http://localhost:8001/api/v1/auth/google/callback`
     - For production: Add your production domain URL

5. **Get Your Credentials**:
   - After creation, you'll get a Client ID and Client Secret
   - Copy these values to your `.env` file

6. **Configure OAuth Consent Screen** (if prompted):
   - Go to "OAuth consent screen"
   - Choose "External" user type
   - Fill in app name, user support email, developer contact info
   - Add scopes: `email`, `profile`, `openid`

**Note**: The redirect URI must exactly match what's configured in your application (`http://localhost:8001/api/v1/auth/google/callback` for development).

3. Set up the PostgreSQL database with schema:
   
   **Option A: Using Docker Compose (Recommended)**
   ```bash
   # Start PostgreSQL with pgvector support and auto-initialize schema
   ./run-postgres.sh
   ```
   This script starts a PostgreSQL container with pgvector extension and automatically runs the initialization scripts (`init.sql` and `schema.sql`) to create the database schema including vector tables for AI features.
   
   **Option B: Manual PostgreSQL Setup**
   - Install PostgreSQL and create a database named `perkasm`
   - Enable the pgvector extension: `CREATE EXTENSION IF NOT EXISTS vector;`
   - Run the schema files manually

4. Initialize the database tables:
   ```bash
   uv run python app/init_db.py
   ```

5. Run the development server:
   ```bash
   # Option 1: Using uvicorn directly (specify port 8001)
   uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
   
   # Option 2: Using the development server script
   uv run python dev_server.py
   ```

## API Documentation

- Interactive API documentation: http://localhost:8001/docs
- Alternative API documentation: http://localhost:8001/redoc

## Testing

### Setup for Testing

Before running tests, install the test dependencies:

```bash
uv sync --extra test
```

This installs the main dependencies plus the testing tools (pytest, pytest-asyncio, pytest-cov, httpx, factory-boy).

### Running Tests
```bash
# Run all tests
uv run python -m pytest

# Run with coverage
uv run python -m pytest --cov=app --cov-report=html

# Run specific test categories
uv run python -m pytest tests/unit/
uv run python -m pytest tests/api/
uv run python -m pytest tests/integration/
```

### Performance Testing
```bash
# Run performance benchmarks
uv run python -m pytest tests/api/test_performance.py -v

# Run with benchmarking
uv run python -m pytest tests/api/test_performance.py --benchmark-only
```

### Coverage Analysis
```bash
# Generate coverage report
uv run python -m pytest --cov=app --cov-report=term-missing

# Generate HTML coverage report
uv run python -m pytest --cov=app --cov-report=html
```

## Authentication Flow

1. Initiate Google OAuth2 login: `GET /api/v1/auth/google/login`
2. Handle Google callback: `GET /api/v1/auth/google/callback`
3. Use the returned JWT token in the `Authorization` header for subsequent requests