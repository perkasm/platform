# PerkAsm Platform

AI-powered credit card rewards optimization platform that helps users maximize their credit card rewards through intelligent recommendations and personalized insights.

## 🎯 Project Overview

PerkAsm is a comprehensive web application designed to help users optimize their credit card rewards by providing:

- **AI-powered rewards optimization** with natural language chat interface
- **Real-time spending analytics** and personalized insights
- **Multi-card portfolio management** with performance tracking
- **Smart recommendations** based on spending patterns and reward categories
- **Secure authentication** via Google OAuth2 with JWT token management

## 🏗 Architecture

The platform follows a modern, scalable client-server architecture:

```
┌─────────────────┐    HTTP/REST API    ┌─────────────────┐    PostgreSQL     ┌─────────────┐
│                 │ ──────────────────▶ │                 │ ───────────────▶  │             │
│  React Frontend │                     │ FastAPI Backend │                   │  Database   │
│   (Port 8080)   │ ◀─────────────────  │  (Port 8001)    │ ◀──────────────   │ (Port 5432) │
└─────────────────┘    JSON/JWT         └─────────────────┘   SQLAlchemy ORM  └─────────────┘
```

**Design Principles:**
- **Separation of Concerns**: Clear separation between presentation, business logic, and data layers
- **Security First**: JWT authentication, input validation, and secure API design
- **Cloud-Ready**: Containerized services with health checks and monitoring
- **Test-Driven**: 100% test coverage with comprehensive unit and integration tests

## 🛠 Technologies Used

### Frontend
- **Framework**: React 18.3 with TypeScript 5.8
- **Build Tool**: Vite 5.4 (lightning-fast development)
- **Styling**: Tailwind CSS 3.4 with shadcn/ui components
- **State Management**: TanStack Query 5.83 (React Query) + React Context
- **Routing**: React Router 6.30
- **Testing**: Vitest 3.2 + Testing Library (100% coverage)
- **Code Quality**: ESLint 9.32 with TypeScript strict mode

### Backend
- **Framework**: FastAPI (Python 3.11) - high-performance async API
- **Package Manager**: uv (ultra-fast Python package management)
- **Authentication**: JWT tokens with OAuth2 (Google primary provider)
- **Database**: PostgreSQL with SQLAlchemy ORM
- **API Documentation**: OpenAPI/Swagger UI auto-generated docs
- **Architecture**: Modular design with services, models, and API layers

### Infrastructure & DevOps
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Docker Compose for local development
- **Database**: PostgreSQL 17 with pgvector extension
- **Monitoring**: Health checks, error tracking, and performance monitoring
- **Security**: Input validation, rate limiting, CORS configuration

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
- **Testing**: Comprehensive test suites with 100% code coverage requirement
- **Type Safety**: Strict TypeScript mode and Python type hints

## 🧪 Testing

### Frontend Testing
```bash
cd frontend

# Run tests in watch mode
npm run test

# Run tests with coverage report
npm run test:coverage

# Run tests with UI interface
npm run test:ui

# Type checking
npm run type-check
```

### Backend Testing
```bash
cd backend

# Run all tests
uv run pytest

# Run tests with coverage
uv run pytest --cov=app

# Run specific test file
uv run pytest tests/test_auth.py -v
```

## 📁 Enhanced Project Structure

```
platform/
├── frontend/                   # React frontend application
│   ├── src/
│   │   ├── components/         # React components (co-located with tests)
│   │   ├── pages/             # Page components (routes)
│   │   ├── hooks/             # Custom React hooks
│   │   ├── services/          # API service layer
│   │   ├── contexts/          # React Context providers
│   │   ├── lib/               # Utility libraries
│   │   ├── types/             # TypeScript type definitions
│   │   └── test/              # Test utilities and setup
│   ├── public/                # Static assets
│   ├── docs/                  # Component and development documentation
│   ├── package.json           # Frontend dependencies and scripts
│   ├── vite.config.ts         # Vite build configuration
│   ├── vitest.config.ts       # Vitest test configuration
│   └── Dockerfile             # Frontend containerization
│
├── backend/                    # FastAPI backend application
│   ├── app/
│   │   ├── api/               # API route definitions
│   │   │   └── v1/            # API version 1 routes
│   │   ├── auth/              # Authentication services
│   │   ├── core/              # Core application components
│   │   ├── models/            # Database models (SQLAlchemy)
│   │   ├── schemas/           # Pydantic schemas for validation
│   │   ├── services/          # Business logic services
│   │   └── main.py            # Application entry point
│   ├── tests/                 # Backend test suite
│   ├── pyproject.toml         # Backend dependencies (uv)
│   ├── .env.example           # Environment variables template
│   └── Dockerfile             # Backend containerization
│
├── docker-compose.yml          # Multi-service orchestration
├── run-postgres.sh            # Database setup script
├── init.sql                   # Database initialization
├── schema.sql                 # Database schema
└── README.md                  # This file
```

## Deployment

### Docker Deployment (Recommended)

For full stack deployment with all services:

```bash
# Start all services (frontend + backend + database)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild and restart specific service
docker-compose up -d --build backend
```

### Individual Service Deployment

#### Frontend Deployment
The frontend can be deployed using the Lovable platform:
1. Open [Lovable](https://lovable.dev/projects/e62f796d-8605-4086-8f68-a5a7d933b8af)
2. Click on Share -> Publish

Alternatively, build and deploy to static hosting:
```bash
cd frontend
npm run build
# Deploy the dist/ directory to your preferred platform
```

#### Backend Deployment
The backend can be deployed to any cloud platform that supports Python applications:
1. Choose a hosting provider (e.g., Heroku, AWS, Google Cloud)
2. Configure environment variables
3. Deploy the `backend/` directory
4. Set up PostgreSQL database if needed

## 🤝 Contributing

Please follow these guidelines:

### Development Standards
- All code must pass TypeScript strict mode (frontend) and Python type hints (backend)
- All functionality must have 100% test coverage
- Follow existing code patterns and conventions
- Write meaningful commit messages using [Conventional Commits](https://www.conventionalcommits.org/)

### Contribution Process
1. **Fork the repository** and create your branch from `main`
2. **Write tests** for new functionality (maintain 100% coverage)
3. **Follow security best practices** as outlined in AGENTS.md
4. **Run quality checks**:
   ```bash
   # Frontend
   cd frontend && npm run lint && npm run type-check && npm run test:coverage
   
   # Backend  
   cd backend && uv run pytest --cov=app && uv run mypy app
   ```
5. **Update documentation** as needed
6. **Submit a pull request** with a clear description

### Code Review Checklist
- [ ] Tests pass with 100% coverage
- [ ] Code follows project conventions
- [ ] Security best practices followed
- [ ] Documentation updated if needed
- [ ] No breaking changes without discussion

## 🔒 Security

This project follows enterprise-level security practices:

- **Input Validation**: All user inputs validated with Zod (frontend) and Pydantic (backend)
- **Authentication**: JWT tokens with OAuth2, secure session management
- **Authorization**: Role-based access control with proper permission checks
- **Data Protection**: Encryption in transit (HTTPS) and at rest
- **Secrets Management**: Environment variables, no hardcoded credentials
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS**: Properly configured Cross-Origin Resource Sharing

For detailed security guidelines, see [AGENTS.md](./AGENTS.md).

## 📊 Monitoring and Observability

The platform includes comprehensive monitoring:

- **Health Checks**: Built-in health endpoints for all services
- **Error Tracking**: Sentry integration for error monitoring
- **Performance Monitoring**: Web vitals and API performance tracking
- **Logging**: Structured logging with correlation IDs
- **Metrics**: Application metrics and business KPIs

## 🌍 Environment Configuration

### Development
- **Frontend**: `http://localhost:8080`
- **Backend**: `http://localhost:8001`
- **Database**: `localhost:5432`
- **Hot Reload**: Enabled for both frontend and backend

### Production
- **HTTPS**: Required for all communications
- **Database**: PostgreSQL with connection pooling
- **Caching**: Redis for session storage and API caching
- **CDN**: Static assets served via CDN
- **Load Balancing**: Multiple backend instances

## 📚 Documentation

- **[AGENTS.md](./AGENTS.md)**: AI coding agent guidelines and best practices
- **[Frontend README](./frontend/README.md)**: Detailed frontend documentation
- **[Frontend Development Guide](./frontend/DEVELOPMENT.md)**: Development workflow
- **[Backend README](./backend/README.md)**: Backend API documentation
- **[Sprint Documentation](./frontend/docs/)**: Project sprint summaries and architecture

## 💬 Support

For support and questions:

- **Documentation**: Check the comprehensive docs in each service directory
- **Issues**: Report bugs and feature requests via [GitHub Issues](https://github.com/perkasm/platform/issues)
- **Security**: Report security vulnerabilities privately via email
- **Development Questions**: Review [AGENTS.md](./AGENTS.md) for coding guidelines

## 📝 License

This project is proprietary software. All rights reserved.

---

**Built with ❤️ using modern web technologies and best practices**

*PerkAsm Platform - Optimize your credit card rewards with AI-powered insights*