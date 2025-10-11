## Why
The current Google authentication implementation in the frontend has a mismatch with the backend API route structure. The frontend redirects to `/api/auth/google/login` but the backend API serves these endpoints at `/api/v1/auth/google/login`. This causes Google OAuth login to fail, preventing users from authenticating with their Google accounts.

## What Changes
- Fix the Google OAuth login URL in the frontend to properly target the backend API at `/api/v1/auth/google/login`
- Update the authentication flow to properly handle the redirect after successful authentication
- Update documentation to reflect the correct authentication flow
- Implement validation to ensure proper token handling after OAuth callback

## Impact
- Affected specs: auth capability
- Affected code: 
  - `/frontend/src/contexts/AuthContext.tsx`
  - Frontend authentication flow
  - API documentation