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
    The API will be available at `http://localhost:8000`.
    
    API documentation is available at:
    * Swagger UI: `http://localhost:8000/docs`
    * ReDoc: `http://localhost:8000/redoc`

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