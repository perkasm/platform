# PerkAsm Platform

AI-powered credit card rewards optimization platform.

## Project Overview

PerkAsm is a web application designed to help users maximize their credit card rewards by providing personalized recommendations and insights. The platform consists of a modern React frontend and a robust FastAPI backend.

## Architecture

The platform follows a client-server architecture:

- **Frontend**: React application with TypeScript, Tailwind CSS, and shadcn/ui components
- **Backend**: FastAPI REST API with JWT authentication and PostgreSQL database
- **Communication**: RESTful API calls between frontend and backend

## Technologies Used

### Frontend
- **Framework**: React
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Routing**: React Router
- **Data Fetching**: React Query

### Backend
- **Framework**: FastAPI (Python 3.11)
- **Package Manager**: uv
- **Authentication**: JWT with OAuth2 (Google as primary provider)
- **Database**: PostgreSQL with SQLAlchemy ORM
- **API Documentation**: Swagger UI / OpenAPI

## Getting Started

### Prerequisites
- Node.js & npm (for frontend)
- Python 3.11 (for backend)
- uv (Python package manager)
- PostgreSQL (optional, for database features)

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:8080`.

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
uv sync

# Set up environment variables (copy example file and modify)
cp .env.example .env

# Start development server
uv run uvicorn app.main:app --reload
```

The backend API will be available at `http://localhost:8001`.

API documentation is available at:
- Swagger UI: `http://localhost:8001/docs`
- ReDoc: `http://localhost:8001/redoc`

### Database Setup

For local development with PostgreSQL:

```bash
# Start PostgreSQL database (from project root)
./run-postgres.sh
```

This script will start only the PostgreSQL service and wait until it's ready to accept connections.

Database connection details:
* Host: localhost
* Port: 5432
* Database: perkasm
* Username: perkasm
* Password: password

## Project Structure

```
platform/
├── frontend/              # React frontend application
│   ├── src/               # Source code
│   ├── public/            # Static assets
│   ├── package.json       # Frontend dependencies
│   └── ...                # Other frontend configuration files
└── backend/               # FastAPI backend application
    ├── app/               # Backend source code
    ├── pyproject.toml     # Backend dependencies
    └── ...                # Other backend configuration files
```

## Development Workflow

### Frontend Development
1. Work in the `frontend/` directory
2. Use `npm run dev` to start the development server with hot reloading
3. Access the application at `http://localhost:8080`

### Backend Development
1. Work in the `backend/` directory
2. Use `uv run uvicorn app.main:app --reload` to start the development server
3. Access the API at `http://localhost:8001`
4. View API documentation at `http://localhost:8001/docs`

### Code Quality
- **Frontend**: ESLint is configured for code linting (`npm run lint`)
- **Backend**: Follow Python best practices and FastAPI conventions

## Deployment

### Frontend Deployment
The frontend can be deployed using the Lovable platform:
1. Open [Lovable](https://lovable.dev/projects/e62f796d-8605-4086-8f68-a5a7d933b8af)
2. Click on Share -> Publish

### Backend Deployment
The backend can be deployed to any cloud platform that supports Python applications:
1. Choose a hosting provider (e.g., Heroku, AWS, Google Cloud)
2. Configure environment variables
3. Deploy the `backend/` directory
4. Set up PostgreSQL database if needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For support, please open an issue on the GitHub repository or contact the development team.