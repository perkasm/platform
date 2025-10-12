# Proposal: Add Google OAuth Login

This change introduces a Google OAuth 2.0 login flow to the PerkAsm platform. Currently, the frontend is a static dashboard. This change will add a login screen to the frontend, integrate with the backend's existing Google OAuth endpoints, and handle user authentication state.

## Scope
- **Frontend**: Create a new login page, add a "Login with Google" button, and manage the user's authentication state.
- **Backend**: No changes are expected as the backend already supports Google OAuth. This proposal is focused on the frontend implementation.
- **Routing**: Protect the main dashboard page, so it's only accessible after a user has successfully logged in.
