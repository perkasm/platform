# PerkAsm Frontend Documentation

This document provides an overview of the PerkAsm frontend architecture, components, and development guidelines to help new UI engineers understand and contribute to the project.

## Project Overview

PerkAsm is a React-based web application that provides AI-powered credit card rewards optimization. The frontend is built with modern technologies and follows a component-based architecture.

## Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **State Management**: React Query (TanStack Query)
- **UI Components**: A local shadcn-style component library built on Radix UI primitives and styled with Tailwind CSS (components live under `src/components/ui`)
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React
- **Form Handling**: React Hook Form with Zod validation
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Date Handling**: date-fns
- **Error Monitoring**: Sentry
- **Performance Monitoring**: Web Vitals
- **Testing**: Vitest with React Testing Library
- **Component Development**: Storybook
- **Service Worker**: Custom service worker for caching
- **Theme Management**: next-themes

## Project Structure

```
frontend/
├── src/
│   ├── assets/              # Static assets (images, etc.)
│   ├── components/          # Reusable UI components
│   │   ├── cards/           # Credit card related components
│   │   ├── chat/            # AI chat interface components
│   │   ├── dashboard/       # Dashboard specific components
│   │   ├── recommendations/ # Recommendation components
│   │   └── ui/              # Shared UI components (shadcn/ui)
│   ├── config/              # Environment and configuration files
│   ├── constants/           # Application constants
│   ├── contexts/            # React context providers (AuthContext)
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions and helpers
│   ├── pages/               # Page components (routes)
│   ├── providers/           # React context providers (ThemeProvider)
│   ├── services/            # API service layer
│   ├── stories/             # Storybook stories for component development
│   ├── test/                # Test utilities and setup
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   ├── App.tsx              # Main application component
│   └── main.tsx             # Application entry point
├── public/                  # Static files
├── docs/                    # Documentation (this file)
├── tailwind.config.ts       # Tailwind CSS configuration
└── vite.config.ts           # Vite build configuration
```

## Architecture

### Entry Point

The application starts at `src/main.tsx`, which:
1. Initializes Sentry for error monitoring
2. Sets up Web Vitals tracking for performance monitoring
3. Registers a service worker for caching and offline functionality
4. Wraps the application with the theme provider (implemented with `next-themes`) for dark/light support
5. Renders the main App component in StrictMode

### Main Application Component

`src/App.tsx` serves as the root component and:
1. Sets up React Query for server state management with a QueryClient
2. Configures React Router for client-side routing with BrowserRouter
3. Provides global UI context providers (TooltipProvider)
4. Includes error boundaries with Sentry integration
5. Sets up global toasters (custom Toaster plus Sonner integration)

### Routing

The application uses a single-page architecture with client-side routing:
- Main route (`/`) renders `src/pages/Index.tsx`
- Catch-all route (`*`) renders `src/pages/NotFound.tsx`

### Main Page Structure

`src/pages/Index.tsx` implements a tab-based interface with:
1. Header with navigation tabs and theme toggle
2. Dynamic content area that changes based on selected tab
3. Footer with site information

The four main sections are:
- **Dashboard**: Overview of rewards metrics and alerts
- **My Cards**: Credit card management interface
- **AI Chat**: Conversation interface with AI assistant (lazy-loaded for performance)
- **Recommendations**: Personalized card recommendations

### Configuration and Environment

Environment variables are managed through `src/config/env.ts`, which provides type-safe access to:
- `VITE_API_URL`: Backend API endpoint
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth client ID
- `VITE_ENABLE_ANALYTICS`: Analytics toggle
- `VITE_ENABLE_ERROR_TRACKING`: Error tracking toggle
- `VITE_ENV`: Environment indicator

### Authentication

User authentication is managed through `src/contexts/AuthContext.tsx`, which provides:
- Authentication state management
- Login/logout functionality
- User profile data
- Google OAuth integration

### API Services

API interactions are abstracted through service classes in `src/services/`:
- `api.ts`: Base API configuration and utilities
- `cards.service.ts`: Credit card management endpoints
- `chat.service.ts`: AI chat functionality
- `dashboard.service.ts`: Dashboard data and metrics
- `recommendations.service.ts`: Recommendation algorithms

All services use Axios for HTTP requests and integrate with React Query for caching and state management.

## UI Components

### Design System

The application uses a custom design system built with Tailwind CSS:
- Custom color palette defined in `src/index.css`
- Responsive design with mobile-first approach
- Dark mode support via `ThemeProvider`
- Consistent spacing and typography

### Component Library

The UI is built using shadcn/ui components, which are customized versions of Radix UI primitives styled with Tailwind CSS. Key components include:
- Cards for content containers
- Tabs for navigation
- Alerts for notifications
- Buttons for actions
- Forms for data input

### Custom Components

Custom components are organized by feature:
- `components/dashboard/`: Dashboard widgets and metrics
- `components/cards/`: Credit card management UI
- `components/chat/`: AI chat interface
- `components/recommendations/`: Recommendation displays

### Navigation Components                                                                                                      │
- `components/ui/sidebar.tsx`: A responsive sidebar component that provides navigation on smaller screens. It uses the `sheet` component from `shadcn/ui` to create a drawer-style menu.                                                            │
- `components/ui/navigation-tabs.tsx`: This component implements the main tab-based navigation for the application, allowing users to switch between the major sections of the app.
- `components/ui/theme-toggle.tsx`: Theme switcher for dark/light mode

## State Management

### Client State

Managed using React's built-in hooks:
- `useState` for local component state
- `useContext` for global UI state (theme, auth, etc.)
- Custom hooks for complex state logic

### Server State

Managed using React Query (TanStack Query):
- Data fetching and caching
- Background updates and synchronization
- Error handling and retries
- Optimistic updates for better UX

## Styling

### Tailwind CSS

The application uses Tailwind CSS for styling with:
- Custom color definitions in `tailwind.config.ts`
- Custom utility classes for gradients and shadows
- Responsive design utilities
- Dark mode variants
- Custom design tokens (primary, success, premium colors with glow variants)

### CSS Architecture

- Global styles defined in `src/index.css`
- Component-scoped styles using Tailwind utility classes
- CSS variables for theme colors and design tokens
- Custom animations and transitions

## Development Workflow

### Getting Started

1. Install dependencies: `npm install`
2. Start development server: `npm run dev` (runs on port 8080)
3. Build for production: `npm run build`
4. Build for development: `npm run build:dev`
5. Preview production build: `npm run preview`
6. Lint code: `npm run lint`
7. Type check: `npm run type-check`

### Testing

The project uses Vitest for testing with:
- Unit tests for utilities and hooks
- Component tests with React Testing Library
- Integration tests for user flows
- Coverage reporting: `npm run test:coverage`
- UI testing: `npm run test:ui`

Test files are located alongside source files with `.test.tsx` extension.

### Component Development

Storybook is used for isolated component development:
- Run Storybook: `npm run storybook`
- Build Storybook: `npm run build-storybook`
- Stories are located in `src/stories/`

### Performance Monitoring

- **Web Vitals**: Automatic tracking of Core Web Vitals
- **Sentry**: Error monitoring and performance tracking
- **Bundle Analysis**: `npm run build:analyze` generates bundle size report

### Build Optimization

Vite configuration includes:
- Code splitting with manual vendor chunks
- Source maps for debugging
- Bundle visualization
- Service worker for caching

### Adding New Features

1. Create new components in the appropriate directory under `src/components/`
2. Add new routes in `src/App.tsx` if needed
3. Use existing UI components from `src/components/ui/` when possible
4. Follow the established TypeScript and Tailwind CSS patterns

### Code Conventions

- Use TypeScript for type safety
- Follow functional component patterns
- Use Tailwind utility classes for styling
- Maintain consistent component structure
- Write self-documenting code with clear naming

## Key Features

### Theme Support

The application supports both light and dark themes through:
- `ThemeProvider` component wrapper
- CSS variables for theme colors
- Automatic system preference detection

### Responsive Design

The UI is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices

Media queries and responsive utility classes are used throughout.

### Performance

- Code splitting via Vite with manual vendor chunks
- Lazy loading for heavy components (AI Chat)
- Service worker for caching and offline functionality
- Bundle size optimization and tree shaking
- Web Vitals monitoring for performance tracking

### Error Handling

- Sentry error boundaries for crash reporting
- Graceful error states in components
- User-friendly error messages
- Error recovery mechanisms

### Accessibility

- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- Color contrast compliance

## Deployment

### Build Process

The application is built as a static site using Vite:
- Output directory: `dist/`
- All assets are bundled and optimized
- Source maps included for debugging
- Service worker generated for caching

### Environment Variables

Required environment variables for deployment:
- `VITE_API_URL`: Backend API base URL
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth client ID
- `VITE_SENTRY_ORG`: Sentry organization slug
- `VITE_SENTRY_PROJECT`: Sentry project slug
- `VITE_SENTRY_AUTH_TOKEN`: Sentry auth token (build time only)

### Docker

The frontend includes a `Dockerfile` and `nginx.conf` for containerized deployment:
- Multi-stage build for optimized image size
- Nginx for serving static files
- SSL certificate generation script available

### Kubernetes

Kubernetes manifests are provided in `k8s/` for production deployment:
- Deployment, Service, and Ingress configurations
- ConfigMap for environment variables
- Namespace isolation

### Performance

- Code splitting via Vite
- Lazy loading for components
The four main sections are:
- **Dashboard**: Overview of rewards metrics and alerts
- **My Cards**: Credit card management interface
- **AI Chat**: Conversation interface with AI assistant (this component can be heavy; consider lazy-loading it to improve initial load)
- **Recommendations**: Personalized card recommendations

Currently, the project doesn't have a comprehensive testing setup. When adding tests, consider:
- Unit tests for utility functions
Note: `tailwind.config.ts` previously defined the `keyframes` object twice (duplicate keys). These have been consolidated to avoid unintended overwrites — keep a single `keyframes` definition when adding animations.
- Component tests for UI components
- Integration tests for critical user flows
### CSS Architecture

- Global styles defined in `src/index.css`
- Component-scoped styles using Tailwind utility classes
- CSS variables for theme colors and design tokens
- Custom animations and transitions

Note: `src/index.css` previously applied a global `@apply border-border` to all elements. That can create unwanted borders across the UI. The global rule has been removed; prefer applying border utilities to specific components instead.
The application is built as a static site using Vite:
- Output directory: `dist/`
- All assets are bundled and optimized
Currently, the project doesn't have a comprehensive testing setup. When adding tests, consider:
- Unit tests for utility functions
- Component tests for UI components (Vitest + React Testing Library recommended)
- Integration tests for critical user flows
- End-to-end tests for key features (Cypress or Playwright)

Suggested starter: add `vitest`, `@testing-library/react`, and a sample component test to `package.json` and a `test` script.
When contributing to the frontend:

1. Follow the existing code style and patterns
The application is built as a static site using Vite:
- Output directory: `dist/`
- All assets are bundled and optimized
- Environment variables can be used for configuration (document required env vars for API hosts and keys)

TODO: Add an "Env & API" section documenting expected environment variables and backend endpoints/proxy assumptions.
5. Ensure accessibility standards are met
6. Optimize for performance

## Common Patterns

### Component Structure

```tsx
import { cn } from "@/lib/utils"

interface ComponentProps {
  // Props here
}

export function Component({ prop }: ComponentProps) {
  return (
    <div className="container">
      {/* Component content */}
    </div>
  )
}
```

### Data Fetching

```tsx
import { useQuery } from "@tanstack/react-query"

export function DataComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['data'],
    queryFn: fetchData
  })
  
  // Render based on state
}
```

### API Service Pattern

```tsx
import { api } from "@/services/api"

export const cardsService = {
  async getCards() {
    const response = await api.get('/cards')
    return response.data
  },
  
  async createCard(cardData: CardInput) {
    const response = await api.post('/cards', cardData)
    return response.data
  }
}
```

### Styling

Use Tailwind utility classes for styling:
- `className="flex items-center justify-between"`
- `className="text-primary font-medium"`
- Use `cn()` utility for conditional classes

### Error Boundaries

```tsx
import { ErrorBoundary } from 'react-error-boundary'

export function Component() {
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <ComponentContent />
    </ErrorBoundary>
  )
}
```

## Contributing Guidelines

When contributing to the frontend:

1. Follow the existing code style and patterns
2. Use TypeScript for type safety
3. Follow functional component patterns with hooks
4. Use Tailwind utility classes for styling
5. Maintain consistent component structure
6. Write self-documenting code with clear naming
7. Add tests for new functionality
8. Use Storybook for component development
9. Ensure accessibility standards are met
10. Optimize for performance

This documentation provides a comprehensive foundation for understanding the PerkAsm frontend. As you work with the codebase, you'll discover more specific implementation details and patterns.