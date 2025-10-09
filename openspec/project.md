# Project Context

# Project Context — PerkAsm Platform

## Purpose
PerkAsm is an AI-driven platform that helps users maximize credit card rewards and cashback by combining a conversational AI interface with deterministic analytics and portfolio-level spending optimization. The platform provides personalized recommendations, multi-card portfolio management, and real-time spending insights so users can make better decisions about which card to use for each purchase.

Primary goals:
- Provide an intuitive chat-based interface for rewards optimization and guidance.
- Offer programmatic APIs for frontend and integrations (FastAPI backend).
- Maintain strong security and privacy guarantees (OAuth2 with Google, JWT auth).
- Be developer-friendly with reproducible local dev via Docker Compose and automated tests.

## Tech Stack
- Frontend: React 18.x + TypeScript, Vite, Tailwind CSS, shadcn/ui components
- State & Data fetching: TanStack Query (React Query)
- Testing (frontend): Vitest + Testing Library
- Backend: FastAPI (Python 3.11), Pydantic, SQLAlchemy ORM
- Package manager (backend): uv (uv project tooling used in pyproject.toml)
- Database: PostgreSQL (pgvector enabled for embeddings), SQL migrations in schema.sql / init.sql
- Containerization: Docker & docker-compose
- Observability: Structured logs, health endpoints, Sentry (optional integration)

## Project Conventions

These conventions are intended to keep the codebase consistent and make it easy for automated agents and new contributors to work effectively.

### Code Style
- Frontend:
	- TypeScript strict mode enabled. Prefer explicit types for public interfaces and React component props.
	- Formatting: Prettier with project defaults; ESLint with recommended TypeScript rules and Vite plugin integrations.
	- Naming: components PascalCase, hooks useCamelCase starting with "use", files co-located with component in same folder where appropriate.
- Backend:
	- Python 3.11 typing used throughout. Follow PEP8 formatting and Black for formatting.
	- Use descriptive names for Pydantic schemas (suffix Schema) and SQLAlchemy models (singular PascalCase).
	- Services contain business logic and are kept separate from API route definitions.

### Architecture Patterns
- Layered modular architecture:
	- frontend/: presentation and client-side logic
	- backend/app/api/v1/: HTTP route definitions and dependency wiring
	- backend/app/services/: business logic and domain operations
	- backend/app/models/: SQLAlchemy models and DB schema
	- backend/app/schemas/: Pydantic request/response models
- Prefer dependency injection via FastAPI dependencies for DB sessions, auth, and config.
- Keep controllers (route handlers) thin; move logic into services for testability.

### Testing Strategy
- Aim for high coverage: unit tests for services and components, lightweight integration tests for critical flows.
- Frontend:
	- Use Vitest for unit testing React components and utility functions.
	- Use msw (Mock Service Worker) for API mocking in component tests.
- Backend:
	- Use pytest with fixtures for DB sessions and test clients.
	- Use an ephemeral PostgreSQL (docker-compose test compose or pytest-postgresql) for integration tests that exercise SQLAlchemy mappings and queries.
	- Keep tests fast and deterministic; avoid heavy external calls in unit tests.

### Git Workflow
- Branching:
	- main: stable release branch (protected)
	- feature/*: short-lived feature branches
	- fix/*: hotfix branches
	- chore/*: infra or non-feature work
- Commits:
	- Follow Conventional Commits (type(scope): short description). Example: feat(auth): add Google OAuth handler
	- Keep commits small and focused; include test updates with feature commits.
- Pull Requests:
	- Include a clear description, testing steps, and any migration notes.
	- Require at least one code review and passing CI (lint/tests) before merge.

## Domain Context
- Core domain: credit card rewards optimization and recommendation.
- Key entities:
	- User: profile, linked cards, preferences
	- Card: issuer, reward categories, point valuations, currency
	- Transaction: merchant category, amount, timestamp, suggested card used
	- Portfolio: collection of cards and aggregated reward metrics
- Business rules / heuristics:
	- Each card has reward multipliers per category; optimization picks the card that maximizes expected reward after factoring redemption value and any bonuses.
	- Some merchants or categories may have time-limited offers or caps that affect optimization.
	- Privacy: do not store unnecessary PII; store only what's needed for optimization and analytics with user's consent.

## Important Constraints
- Security & privacy: OAuth2 + JWT for authentication; store secrets in environment variables or a secrets manager, not in repo.
- Data residency / compliance: be mindful of user data storage requirements; scrub or anonymize test datasets.
- Performance: reward calculation should be O(n_cards) per transaction; expensive ML/LLM operations should be cached and rate-limited.
- Cost: vector/embedding operations and LLM calls may be billable—use caching, rate limits, and local embeddings where feasible.

## External Dependencies
- Google OAuth2: primary identity provider; follow Google's OAuth best practices and keep client secrets secure.
- PostgreSQL: primary persistent store (hosted or local docker); ensure pgvector extension is available when using embeddings.
- Optional: Vector store or embedding provider (OpenAI, local embeddings, or self-hosted) for chat memory and similarity search.
- Optional: Sentry (error monitoring), Redis (caching/session store), and a mail provider for notifications.

## Developer Experience & Local Setup Notes
- Local dev:
	- Top-level scripts: `run-postgres.sh` to bring up Postgres for local development.
	- Frontend: `cd frontend && npm install && npm run dev` (default port 8080)
	- Backend: `cd backend && uv sync && uv run uvicorn app.main:app --reload` (default port 8001)
- Environment variables:
	- Use `.env.example` in `backend/` as a template. Required values: DATABASE_URL, SECRET_KEY, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SENTRY_DSN (optional).

## Open Questions / TODOs
- Add a short matrix documenting which services are required for full end-to-end tests and which are optional/mocked.
- Document expected shape of key environment variables and example values in `openspec/env.md`.
