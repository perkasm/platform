<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# IMPORTANT: AI Coding Agent Guidelines

As an AI coding agent working on the PerkAsm platform, you are expected to follow industry best practices as a Senior Software Engineer / Architect with over 10 years of experience. These guidelines ensure high-quality, secure, and maintainable code that meets professional standards.

## Security Best Practices

1. **Input Validation**: Always validate and sanitize user inputs to prevent injection attacks.
2. **Authentication & Authorization**: Implement proper JWT token validation and role-based access control.
3. **Secrets Management**: Never hardcode API keys, passwords, or other secrets in the codebase. Use environment variables or secure vault solutions.
4. **Secure Communication**: Use HTTPS for all external communications and implement proper CORS policies.
5. **Dependency Security**: Regularly update dependencies and check for known vulnerabilities.
6. **Data Protection**: Encrypt sensitive data at rest and in transit, following GDPR and other relevant privacy regulations.

## Testing Standards (100% Code Coverage)

1. **Comprehensive Test Coverage**: Write tests to achieve 100% code coverage for all new features and modifications.
2. **Positive and Negative Test Cases**: Include both success and failure scenarios in your tests.
3. **Unit Tests**: Write focused unit tests for individual functions and components.
4. **Integration Tests**: Create tests that verify interactions between different modules/services.
5. **End-to-End Tests**: Implement E2E tests for critical user flows.
6. **Test Automation**: Ensure all tests can run automatically in CI/CD pipelines.
7. **Test Documentation**: Include clear descriptions of what each test is verifying.

## Modularized Coding Practices

1. **Single Responsibility Principle**: Each module, class, or function should have one clear purpose.
2. **Separation of Concerns**: Keep business logic, data access, and presentation layers distinct.
3. **Reusability**: Design components and functions to be reusable across the application.
4. **Clear Interfaces**: Define clear APIs between modules with well-documented contracts.
5. **Dependency Injection**: Use dependency injection to manage dependencies and improve testability.
6. **Code Organization**: Follow the existing project structure and naming conventions.

## Performance and Scalability Considerations

1. **Efficient Algorithms**: Choose algorithms and data structures appropriate for the scale of data.
2. **Database Optimization**: Use proper indexing, query optimization, and connection pooling.
3. **Caching Strategies**: Implement appropriate caching mechanisms to reduce database load.
4. **Asynchronous Processing**: Use async/await patterns and background jobs for non-blocking operations.
5. **Resource Management**: Properly manage memory, file handles, and network connections.
6. **Load Testing**: Consider performance implications and implement load testing for critical components.
7. **Horizontal Scaling**: Design services to be stateless where possible to enable horizontal scaling.

## Cloud Deployment and Kubernetes Readiness

1. **Containerization**: Ensure all services can run in Docker containers with proper Dockerfiles.
2. **Environment Configuration**: Use environment variables for configuration that varies between environments.
3. **Health Checks**: Implement readiness and liveness probes for containerized applications.
4. **Logging**: Use structured logging that can be easily parsed by log aggregation tools.
5. **Monitoring**: Include metrics and monitoring endpoints for application performance tracking.
6. **Resource Limits**: Define appropriate CPU and memory limits for containerized deployments.
7. **Kubernetes Manifests**: Create Kubernetes deployment, service, and config files for all services.
8. **Replica Management**: Design applications to run multiple replicas without conflicts.
9. **Persistent Storage**: Properly handle persistent data with volume claims in Kubernetes.

## General Engineering Excellence

1. **Code Reviews**: Write clean, readable code that would pass a senior engineer's code review.
2. **Documentation**: Maintain clear documentation for APIs, complex logic, and architectural decisions.
3. **Error Handling**: Implement comprehensive error handling with appropriate logging and user feedback.
   - Use try/catch blocks appropriately for operations that may fail
   - Handle exceptions gracefully with meaningful error messages
   - Implement proper error boundaries in frontend components
   - Log errors with sufficient context for debugging
4. **Retryable Methods**: When interacting with remote services:
   - Implement retry logic with exponential backoff for transient failures
   - Set appropriate timeout values for remote calls
   - Handle rate limiting responses from external services
   - Implement circuit breaker patterns for failing services
5. **Code Comments**: Add meaningful comments for complex logic, but prefer self-documenting code.
6. **Version Control**: Follow conventional commit messages and make focused, logical commits.
7. **Continuous Integration**: Ensure all code changes pass linting, testing, and building in CI pipelines.

---

# Project Overview

The PerkAsm platform is a web application designed for AI-powered credit card rewards optimization. It consists of a frontend and a backend, with this directory containing the frontend component. The frontend provides a dashboard interface where users can manage their credit cards, get recommendations, and chat with an AI assistant.

## Frontend
### Key Technologies

*   **Framework:** React
*   **Build Tool:** Vite
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **UI Components:** shadcn/ui
*   **Routing:** React Router
*   **Data Fetching:** React Query

### Architecture

The application is a single-page application (SPA) with a client-side routing system. The main entry point is `src/main.tsx`, which renders the `App` component. The `App` component sets up the routing and global providers.

The main page, `src/pages/Index.tsx`, contains the primary UI, which is a tabbed interface with the following sections:

*   **Dashboard:** Displays an overview of the user's rewards and metrics.
*   **My Cards:** Allows users to manage their credit cards.
*   **AI Chat:** Provides an interface to chat with an AI assistant.
*   **Recommendations:** Offers recommendations for optimizing credit card rewards.

The UI is built using components from `shadcn/ui`, and the application state is managed using React hooks and `react-query`.

### Building and Running

To build and run the project, use the following commands:

*   **Install dependencies:**
    ```bash
    npm install
    ```
*   **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:8080`.
*   **Build for production:**
    ```bash
    npm run build
    ```
*   **Lint the code:**
    ```bash
    npm run lint
    ```

### Database Setup for Development

For local development, you can run a PostgreSQL database using Docker Compose:

*   **Start the database:**
    ```bash
    ./run-postgres.sh
    ```
    This script will start only the PostgreSQL service and wait until it's ready to accept connections.
    
    Database connection details:
    * Host: localhost
    * Port: 5432
    * Database: perkasm
    * Username: perkasm
    * Password: password

### Development Conventions

*   **Styling:** The project uses Tailwind CSS for styling. Utility classes should be used whenever possible.
*   **Components:** Reusable UI components are located in the `src/components` directory.
*   **State Management:** For server-side state, use `react-query`. For client-side state, use React hooks.
*   **Routing:** Use `react-router-dom` for routing. New routes should be added to `src/App.tsx`.
*   **Linting:** The project uses ESLint for code linting. Run `npm run lint` to check for linting errors.

## Backend

### Key Technologies

*   **Framework:** FastAPI (Python 3.11)
*   **Package Manager:** uv
*   **Authentication:** JWT with OAuth2 (Google as primary provider)
*   **Database:** PostgreSQL with SQLAlchemy ORM
*   **API Documentation:** Swagger UI / OpenAPI

### Architecture

The backend is a RESTful API built with FastAPI, featuring a modular structure that separates concerns across different directories:

*   **API Layer** (`app/api/`): Contains API route definitions, currently at version 1
*   **Authentication** (`app/auth/`): Implements JWT token management and OAuth2 providers
*   **Core** (`app/core/`): Houses configuration settings and database connection logic
*   **Models** (`app/models/`): Defines database models using SQLAlchemy
*   **Schemas** (`app/schemas/`): Contains Pydantic models for request/response validation
*   **Services** (`app/services/`): Implements business logic and data manipulation

### Features

*   **Modular OAuth2 System**: Easily extensible to support additional OAuth2 providers beyond Google
*   **JWT-based Authentication**: Secure token management with configurable expiration
*   **Database Abstraction**: SQLAlchemy ORM with graceful fallback to in-memory storage when PostgreSQL is unavailable
*   **CORS Support**: Configurable Cross-Origin Resource Sharing for web client integration
*   **MVC Pattern**: Clear separation between models, services, and API controllers

### API Endpoints

*   **Authentication**: 
    * Google OAuth2 login and callback endpoints
    * User profile retrieval
*   **User Management**: 
    * User creation, retrieval, and update operations
    * Role-based access control

### Building and Running

To build and run the backend project, use the following commands:

*   **Install dependencies:**
    ```bash
    cd backend
    uv sync
    ```
*   **Set up environment variables:**
    Copy the `.env.example` file to `.env` and configure your settings:
    ```bash
    cp .env.example .env
    ```
*   **Run the development server:**
    ```bash
    uv run uvicorn app.main:app --reload
    ```
    The API will be available at `http://localhost:8001`.
    
    API documentation is available at:
    * Swagger UI: `http://localhost:8001/docs`
    * ReDoc: `http://localhost:8001/redoc`

*   **Initialize database tables:**
    ```bash
    uv run python app/init_db.py
    ```

### Extending OAuth2 Providers

To add new OAuth2 providers:

1. Create a new file in the `app/auth/` directory
2. Extend the `OAuth2Provider` base class
3. Implement the required methods:
   * `get_authorization_url()`
   * `exchange_code_for_token()`
   * `get_user_info()`

This modular approach allows for easy integration of additional providers like Facebook, GitHub, etc.