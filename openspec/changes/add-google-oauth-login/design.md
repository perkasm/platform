# Design: Google OAuth Frontend Flow

## 1. Authentication Flow

The frontend authentication process will follow the standard OAuth 2.0 Authorization Code Flow.

1.  **User clicks "Login with Google"**: The user is redirected to the Google OAuth 2.0 authorization endpoint.
2.  **Google authenticates and asks for consent**: The user logs into their Google account (if not already) and grants permission for the application to access their profile information.
3.  **Google redirects back to the application**: Google redirects the user to the callback URL provided in the Google API console. The redirect will include an authorization `code` in the URL.
4.  **Frontend sends the code to the backend**: The frontend captures the `code` from the URL and sends it to the backend's `/api/v1/auth/google/callback` endpoint.
5.  **Backend exchanges the code for a token**: The backend exchanges the `code` with Google for an access token and an ID token.
6.  **Backend creates or retrieves a user**: The backend uses the information in the ID token to find or create a user in the database.
7.  **Backend issues a JWT**: The backend creates a JSON Web Token (JWT) for the user and returns it to the frontend.
8.  **Frontend stores the JWT**: The frontend stores the JWT securely (e.g., in an HttpOnly cookie or local storage) and uses it to authenticate subsequent requests to the backend.

## 2. Frontend Architecture

-   **Login Page**: A new page will be created at `/login` that will contain the "Login with Google" button.
-   **Protected Routes**: The main application routes (e.g., `/`, `/dashboard`) will be protected. If a user is not authenticated, they will be redirected to the `/login` page.
-   **Authentication Context**: A React Context will be used to manage the user's authentication state (e.g., `isAuthenticated`, `user`, `token`). This context will be accessible to all components in the application.
-   **API Client**: The API client will be updated to include the JWT in the `Authorization` header for all requests to protected backend endpoints.
