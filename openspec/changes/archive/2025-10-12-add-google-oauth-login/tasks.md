# Tasks: Add Google OAuth Login

### Phase 1: Frontend Foundation

- [x] **Task**: Create a new, unstyled Login page at `/login`.
    -   **Validation**: Manually verify that the route `/login` renders a basic placeholder component.
- [x] **Task**: Add a "Login with Google" button to the Login page.
    -   **Validation**: The button should be visible on the `/login` page. Clicking it should redirect to the Google OAuth consent screen.
    -   **Dependencies**: Requires Google OAuth client ID to be configured in the frontend.
- [x] **Task**: Implement the OAuth callback route (`/auth/google/callback`).
    -   **Details**: This route will be responsible for receiving the authorization code from Google, sending it to the backend's `/api/v1/auth/google/callback` endpoint, and receiving a JWT in response.
    -   **Validation**: Unit test the callback handling logic. Mock the backend endpoint to verify the correct data is sent and the JWT is handled correctly.

### Phase 2: Authentication State Management

- [x] **Task**: Create an `AuthContext` to manage authentication state.
    -   **Details**: The context should store the JWT and user information, and provide `login` and `logout` functions.
    -   **Validation**: Unit test the `AuthContext` provider and consumer.
- [x] **Task**: Implement protected routes.
    -   **Details**: Create a higher-order component or a custom hook that checks for a valid JWT in the `AuthContext`. If the user is not authenticated, they should be redirected to `/login`.
    -   **Validation**: Unit test the protected route logic. Add an E2E test to verify that an unauthenticated user is redirected to the login page when trying to access a protected route.
    -   **Dependencies**: `AuthContext`.

### Phase 3: Integration and Finalization

- [x] **Task**: Integrate the `AuthContext` with the API client.
    -   **Details**: The API client should be updated to read the JWT from the `AuthContext` and include it in the `Authorization` header for all authenticated requests.
    -   **Validation**: Unit test the API client to ensure the `Authorization` header is correctly set.
- [x] **Task**: Implement the logout functionality.
    -   **Details**: The logout function in the `AuthContext` should clear the JWT and user information, and redirect the user to the `/login` page.
    -   **Validation**: Add an E2E test for the logout flow.
    -   **Dependencies**: `AuthContext`.
- [x] **Task**: End-to-End Testing.
    -   **Details**: Write a comprehensive E2E test that covers the entire login flow, from clicking the "Login with Google" button to being redirected to the dashboard, and then logging out.
    -   **Validation**: The E2E test should pass consistently.
    -   **Dependencies**: All previous tasks.
