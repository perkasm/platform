# Perkasm Platform Backend

A FastAPI-based REST API with JWT authentication, modular structure, and PostgreSQL integration.

## Features

- FastAPI framework for high-performance REST APIs
- JWT-based authentication with Google OAuth2 integration
- Modular architecture for easy extension
- PostgreSQL database with SQLAlchemy ORM
- CORS support
- MVC pattern with models, services, and controllers

## Project Structure

```
app/
├── api/                    # API route definitions
│   └── v1/                # API version 1
│       ├── auth.py        # Authentication routes
│       └── users.py       # User management routes
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
│   └── user.py            # User model
├── schemas/               # Pydantic schemas
│   ├── token.py           # Token schemas
│   └── user.py            # User schemas
├── services/              # Business logic services
│   └── user.py            # User service
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
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=your_password
   POSTGRES_DB=perkasm
   SECRET_KEY=your_secret_key
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

3. Initialize the database:
   ```bash
   uv run python app/init_db.py
   ```

4. Run the development server:
   ```bash
   uv run uvicorn app.main:app --reload
   ```

## API Documentation

- Interactive API documentation: http://localhost:8001/docs
- Alternative API documentation: http://localhost:8001/redoc

## Authentication Flow

1. Initiate Google OAuth2 login: `GET /api/v1/auth/google/login`
2. Handle Google callback: `GET /api/v1/auth/google/callback`
3. Use the returned JWT token in the `Authorization` header for subsequent requests