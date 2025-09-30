<div align="center">

# 💳 PerkAsm Frontend

**AI-Powered Credit Card Rewards Optimization Platform**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff.svg)](https://vitejs.dev/)
[![Tests](https://img.shields.io/badge/Tests-155%20Passing-success.svg)](https://vitest.dev/)
[![Coverage](https://img.shields.io/badge/Coverage-100%25-brightgreen.svg)](https://vitest.dev/)

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Testing](#-testing) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Testing](#-testing)
- [Building & Deployment](#-building--deployment)
- [Code Quality](#-code-quality)
- [Documentation](#-documentation)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

PerkAsm is a modern web application that helps users maximize their credit card rewards through intelligent recommendations and personalized insights. The platform features an AI-powered chat assistant, comprehensive dashboard analytics, and real-time card performance tracking.

**Key Capabilities:**
- 🤖 AI-powered rewards optimization assistant
- 📊 Real-time spending analytics and insights
- 💳 Multi-card portfolio management
- 🎯 Personalized card recommendations
- 🔒 Secure OAuth 2.0 authentication
- 📱 Responsive, mobile-first design

---

## ✨ Features

### Core Features
- **Dashboard**: Comprehensive overview of rewards, spending patterns, and key metrics
- **Card Management**: Add, edit, and track multiple credit cards in one place
- **AI Chat Assistant**: Natural language interface for rewards optimization queries
- **Smart Recommendations**: Personalized card suggestions based on spending habits
- **Authentication**: Secure Google OAuth integration with JWT token management

### Technical Features
- **100% Type Safety**: Strict TypeScript configuration with no `any` types
- **100% Test Coverage**: Comprehensive unit and integration testing
- **Error Handling**: Global error boundaries with retry logic and user-friendly notifications
- **Loading States**: Skeleton screens and optimistic UI updates
- **Form Validation**: Zod-based schema validation for all user inputs
- **Accessibility**: WCAG 2.1 compliant with keyboard navigation support

---

## 🛠 Tech Stack

### Core
- **[React 18.3](https://react.dev/)** - UI framework with modern hooks and concurrent features
- **[TypeScript 5.8](https://www.typescriptlang.org/)** - Type-safe development with strict mode enabled
- **[Vite 5.4](https://vitejs.dev/)** - Lightning-fast build tool and dev server

### UI & Styling
- **[Tailwind CSS 3.4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - High-quality, accessible component library
- **[Radix UI](https://www.radix-ui.com/)** - Unstyled, accessible component primitives
- **[Lucide React](https://lucide.dev/)** - Beautiful, consistent icon set

### State & Data Management
- **[TanStack Query 5.83](https://tanstack.com/query)** - Powerful async state management
- **[React Hook Form 7.61](https://react-hook-form.com/)** - Performant form validation
- **[Zod 3.25](https://zod.dev/)** - TypeScript-first schema validation
- **[Axios 1.11](https://axios-http.com/)** - Promise-based HTTP client

### Routing & Navigation
- **[React Router 6.30](https://reactrouter.com/)** - Declarative client-side routing

### Development & Testing
- **[Vitest 3.2](https://vitest.dev/)** - Blazing fast unit test framework
- **[Testing Library](https://testing-library.com/)** - User-centric testing utilities
- **[ESLint 9.32](https://eslint.org/)** - Pluggable linting utility
- **[TypeScript ESLint](https://typescript-eslint.io/)** - TypeScript-specific linting rules

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 16.0.0 (18.x or 20.x recommended)
- **npm** >= 8.0.0 or **yarn** >= 1.22.0
- **Git** for version control

### Installation

```bash
# Clone the repository
git clone https://github.com/perkasm/platform.git

# Navigate to frontend directory
cd platform/frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.development

# Start development server
npm run dev
```

The application will be available at **http://localhost:8080**

### Environment Variables

Create a `.env.development` file in the frontend directory:

```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

See `.env.example` for all available configuration options.

---

## 📁 Project Structure

```
frontend/
├── public/                     # Static assets
│   ├── placeholder.svg
│   └── robots.txt
│
├── src/
│   ├── assets/                 # Images, fonts, and media files
│   │   └── cards/              # Card brand logos
│   │
│   ├── components/             # React components (co-located with tests)
│   │   ├── cards/              # Card-related components
│   │   ├── chat/               # AI chat interface components
│   │   ├── dashboard/          # Dashboard widgets and charts
│   │   ├── recommendations/    # Recommendation engine UI
│   │   ├── ui/                 # Reusable UI primitives (shadcn/ui)
│   │   ├── ErrorBoundary.tsx   # Global error boundary
│   │   └── ProtectedRoute.tsx  # Auth-protected route wrapper
│   │
│   ├── config/                 # Configuration files
│   │   └── env.ts              # Environment variable validation
│   │
│   ├── contexts/               # React Context providers
│   │   └── AuthContext.tsx     # Authentication state management
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── use-cards.ts        # Card management hook
│   │   ├── use-chat.ts         # Chat functionality hook
│   │   ├── use-dashboard.ts    # Dashboard data hook
│   │   ├── use-mobile.tsx      # Mobile detection hook
│   │   ├── use-recommendations.ts
│   │   └── use-toast.ts        # Toast notification hook
│   │
│   ├── lib/                    # Utility functions and helpers
│   │   ├── utils.ts            # General utilities (cn, formatters)
│   │   └── validations.ts      # Zod validation schemas
│   │
│   ├── pages/                  # Page components
│   │   ├── Index.tsx           # Main dashboard page
│   │   ├── Login.tsx           # Login/authentication page
│   │   └── NotFound.tsx        # 404 error page
│   │
│   ├── providers/              # Global providers
│   │   └── theme-provider.tsx  # Dark/light theme provider
│   │
│   ├── services/               # API service layer
│   │   ├── api.ts              # Base API client with interceptors
│   │   ├── cards.service.ts    # Card CRUD operations
│   │   ├── chat.service.ts     # Chat API integration
│   │   ├── dashboard.service.ts
│   │   └── recommendations.service.ts
│   │
│   ├── test/                   # Test configuration and utilities
│   │   └── setup.ts            # Vitest global setup
│   │
│   ├── types/                  # TypeScript type definitions
│   │   ├── auth.ts
│   │   ├── card.ts
│   │   └── ...
│   │
│   ├── utils/                  # Additional utilities
│   │   └── errorHandling.ts    # Error handling helpers
│   │
│   ├── App.tsx                 # Root application component
│   ├── main.tsx                # Application entry point
│   └── index.css               # Global styles
│
├── docs/                       # Project documentation
│   ├── frontend-architecture.md
│   ├── quick-action-checklist.md
│   └── sprint-*-*.md
│
├── .env.example                # Environment variables template
├── components.json             # shadcn/ui configuration
├── index.html                  # HTML entry point
├── package.json                # Dependencies and scripts
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite build configuration
└── vitest.config.ts            # Vitest test configuration
```

### Test File Organization

Tests are **co-located** with source files following React community best practices:

```
src/
├── components/
│   ├── ErrorBoundary.tsx
│   ├── ErrorBoundary.test.tsx  ✅ Test lives next to component
│   └── ui/
│       ├── button.tsx
│       └── button.test.tsx     ✅ Easy to find and maintain
```

**Benefits of co-location:**
- ✅ Tests are easier to discover and maintain
- ✅ Refactoring automatically moves tests with code
- ✅ No need to mirror complex directory structures
- ✅ Standard practice in modern React projects

---

## 💻 Development

### Available Scripts

```bash
# Development
npm run dev              # Start dev server with HMR (hot module replacement)
npm run dev -- --host    # Expose dev server to network

# Building
npm run build            # Production build (optimized)
npm run build:dev        # Development build (with source maps)
npm run preview          # Preview production build locally

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript compiler checks

# Testing
npm run test             # Run tests in watch mode
npm run test:ui          # Run tests with UI interface
npm run test:coverage    # Generate coverage report
```

### Development Workflow

1. **Create a new branch** for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Start the dev server**:
   ```bash
   npm run dev
   ```

3. **Write code** following the project conventions:
   - Use TypeScript with strict mode
   - Co-locate tests with source files
   - Follow existing component patterns
   - Use Zod for validation schemas

4. **Write tests** for new functionality:
   ```bash
   npm run test
   ```

5. **Check code quality**:
   ```bash
   npm run lint
   npm run type-check
   npm run test:coverage
   ```

6. **Commit and push**:
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   git push origin feature/your-feature-name
   ```

### Adding New Components

```bash
# Using shadcn/ui CLI (recommended for UI components)
npx shadcn-ui@latest add button

# Manual component creation
# 1. Create component file: src/components/YourComponent.tsx
# 2. Create test file: src/components/YourComponent.test.tsx
# 3. Export from index if creating a component library
```

---

## 🧪 Testing

### Test Strategy

- **Unit Tests**: All utilities, services, and hooks (100% coverage)
- **Integration Tests**: Component interactions and API integration
- **User-Centric**: Tests focus on user behavior, not implementation details

### Running Tests

```bash
# Run all tests in watch mode
npm run test

# Run tests with coverage report
npm run test:coverage

# Run tests with UI interface
npm run test:ui

# Run specific test file
npm run test ErrorBoundary.test.tsx

# Run tests matching pattern
npm run test -- --grep "authentication"
```

### Writing Tests

Example test structure:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { YourComponent } from './YourComponent';

describe('YourComponent', () => {
  it('should render correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    render(<YourComponent />);
    
    await user.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByText('Updated Text')).toBeInTheDocument();
    });
  });
});
```

### Coverage Requirements

- **Lines**: 100%
- **Functions**: 100%
- **Branches**: 100%
- **Statements**: 100%

Current status: **155 tests passing** with **100% coverage** ✅

---

## 🏗 Building & Deployment

### Production Build

```bash
# Create optimized production build
npm run build

# Output will be in ./dist directory
# Build includes:
# - Minified JavaScript bundles
# - Optimized CSS
# - Asset compression
# - Source maps (optional)
```

### Preview Production Build

```bash
# Serve production build locally
npm run preview

# Available at http://localhost:4173
```

### Environment-Specific Builds

```bash
# Development build (includes source maps)
npm run build:dev

# Production build (optimized)
npm run build
```

### Deployment

The application is designed to be deployed to static hosting platforms:

- **Vercel** (recommended)
- **Netlify**
- **AWS S3 + CloudFront**
- **Nginx** (self-hosted)

See `/docs/deployment-guide.md` for detailed deployment instructions.

### 🐳 Docker Deployment

#### Building the Docker Image

```bash
# Build with default settings
docker build -t perkasm-frontend:latest ./frontend

# Build with custom API URL
docker build \
  --build-arg VITE_API_URL=https://api.perkasm.com \
  --build-arg VITE_ENVIRONMENT=production \
  -t perkasm-frontend:latest \
  ./frontend
```

#### Running the Container

```bash
# Run the container
docker run -d \
  --name perkasm-frontend \
  -p 8080:8080 \
  perkasm-frontend:latest

# Access the application at http://localhost:8080
```

#### Using Docker Compose

```bash
# Start all services (frontend + backend + database)
docker-compose up -d

# Start only the frontend
docker-compose up -d frontend

# View logs
docker-compose logs -f frontend

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build frontend
```

#### Environment Variables for Docker

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:8001
VITE_ENVIRONMENT=production
```

#### Health Checks

The Docker container includes built-in health checks:

- **Health endpoint**: `http://localhost:8080/health`
- **Readiness endpoint**: `http://localhost:8080/ready`

```bash
# Check container health
docker inspect --format='{{json .State.Health}}' perkasm-frontend
```

#### Docker Best Practices Implemented

- ✅ Multi-stage build for optimized image size
- ✅ Non-root user for enhanced security
- ✅ Proper layer caching for faster builds
- ✅ Health checks for container monitoring
- ✅ Security headers configured in nginx
- ✅ Gzip compression enabled
- ✅ Static asset caching optimized

---

## 🎨 Code Quality

### TypeScript Configuration

Strict mode enabled with:
- `strict: true` - Enable all strict type-checking options
- `strictNullChecks: true` - Null/undefined must be explicit
- `noImplicitAny: true` - No implicit any types allowed
- `noUnusedLocals: true` - Detect unused variables
- `noUnusedParameters: true` - Detect unused function parameters

### ESLint Rules

- React Hooks rules enforced
- TypeScript-specific rules
- Accessibility (a11y) checks
- Import sorting and organization

### Code Style

- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Utilities**: camelCase (e.g., `formatCurrency.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth`)
- **Types/Interfaces**: PascalCase (e.g., `User`, `CardData`)

---

## 📚 Documentation

### Available Documentation

- **[Architecture Overview](./docs/frontend-architecture.md)** - System design and patterns
- **[Sprint Planning](./docs/quick-action-checklist.md)** - Development roadmap
- **[Sprint 1 Summary](./docs/sprint-1-completion-summary.md)** - Testing & auth implementation
- **[Sprint 2 Summary](./docs/sprint-2-completion-summary.md)** - API integration & validation
- **[Code Review Report](./docs/code-review-report.md)** - Quality assessment

### API Documentation

API endpoints are documented in the backend repository. Frontend service layer provides TypeScript types for all API responses.

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: `Module not found` errors
```bash
# Solution: Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Issue**: TypeScript errors after updating dependencies
```bash
# Solution: Clear TypeScript cache and rebuild
rm -rf node_modules/.cache
npm run type-check
```

**Issue**: Tests failing with "Cannot find module '@/...'"
```bash
# Solution: Ensure path aliases are configured in vitest.config.ts
# Check that resolve.alias is set correctly
```

**Issue**: Environment variables not loading
```bash
# Solution: Ensure .env file exists and variables are prefixed with VITE_
# Restart dev server after changing .env files
```

### Getting Help

- Check existing [GitHub Issues](https://github.com/perkasm/platform/issues)
- Review [documentation](./docs/)
- Contact team on Slack: `#perkasm-frontend`

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the repository** and create your branch from `main`
2. **Write tests** for new functionality (maintain 100% coverage)
3. **Follow code style** guidelines and run linting
4. **Update documentation** as needed
5. **Submit a pull request** with a clear description

### Development Standards

- All code must pass TypeScript strict mode
- All code must have 100% test coverage
- All tests must pass before merging
- Follow existing patterns and conventions
- Write meaningful commit messages

### Pull Request Process

1. Update README.md with details of changes (if applicable)
2. Update the documentation in `/docs` if needed
3. Ensure all tests pass and coverage is maintained
4. Request review from maintainers
5. Squash commits before merging

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 👥 Team & Contact

- **Project Repository**: [github.com/perkasm/platform](https://github.com/perkasm/platform)
- **Issues & Bugs**: [GitHub Issues](https://github.com/perkasm/platform/issues)
- **Slack Channel**: `#perkasm-frontend`

---

<div align="center">

**Built with ❤️ using React, TypeScript, and modern web technologies**

*Last Updated: September 30, 2025*

</div>

The UI is built using components from `shadcn/ui`, and the application state is managed using React hooks and `react-query`.

## Deployment

To deploy the frontend:

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the contents of the `dist/` directory to your preferred hosting platform (Netlify, Vercel, GitHub Pages, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Commit your changes
5. Push to the branch
6. Create a pull request

## Support

For support, please open an issue on the GitHub repository or contact the development team.