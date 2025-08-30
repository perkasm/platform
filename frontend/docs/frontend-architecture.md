# PerkAsm Frontend Documentation

This document provides an overview of the PerkAsm frontend architecture, components, and development guidelines to help new UI engineers understand and contribute to the project.

## Project Overview

PerkAsm is a React-based web application that provides AI-powered credit card rewards optimization. The frontend is built with modern technologies and follows a component-based architecture.

## Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **State Management**: React Query (TanStack Query)
-- **UI Components**: a local shadcn-style component library built on Radix UI primitives and styled with Tailwind CSS (components live under `src/components/ui`). Note: the project uses Radix packages but the shadcn components are implemented locally rather than pulled from an external `shadcn/ui` package.
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React
- **Form Handling**: React Hook Form with Zod validation

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
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions and helpers
│   ├── pages/               # Page components (routes)
│   ├── providers/           # React context providers
│   ├── types/               # TypeScript type definitions
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
1. Sets up React with StrictMode
2. Wraps the application with the theme provider (implemented with `next-themes`) for dark/light support
3. Renders the main App component

### Main Application Component

`src/App.tsx` serves as the root component and:
1. Sets up React Query for server state management
2. Configures React Router for client-side routing
3. Provides global UI context providers (TooltipProvider) and global toasters (there is a custom `Toaster` plus `sonner` integration in `src/components/ui/`)

### Routing

The application uses a single-page architecture with client-side routing:
- Main route (`/`) renders `src/pages/Index.tsx`
- Catch-all route (`*`) renders `src/pages/NotFound.tsx`

### Main Page Structure

`src/pages/Index.tsx` implements a tab-based interface with:
1. Header with navigation tabs
2. Dynamic content area that changes based on selected tab
3. Footer with site information

The four main sections are:
- **Dashboard**: Overview of rewards metrics and alerts
- **My Cards**: Credit card management interface
- **AI Chat**: Conversation interface with AI assistant
- **Recommendations**: Personalized card recommendations

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

## State Management

### Client State

Managed using React's built-in hooks:
- `useState` for local component state
- `useContext` for global UI state (theme, etc.)
- Custom hooks for complex state logic

### Server State

Managed using React Query (TanStack Query):
- Data fetching and caching
- Background updates and synchronization
- Error handling and retries

## Styling

### Tailwind CSS

The application uses Tailwind CSS for styling with:
- Custom color definitions in `tailwind.config.ts`
- Custom utility classes for gradients and shadows
- Responsive design utilities
- Dark mode variants

### CSS Architecture

- Global styles defined in `src/index.css`
- Component-scoped styles using Tailwind utility classes
- CSS variables for theme colors and design tokens
- Custom animations and transitions

## Development Workflow

### Getting Started

1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Build for production: `npm run build`
4. Lint code: `npm run lint`

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
### Routing

The application uses a single-page architecture with client-side routing in `src/App.tsx`:
- Main route (`/`) renders `src/pages/Index.tsx`
- Catch-all route (`*`) renders `src/pages/NotFound.tsx`

Note: the main site sections (Dashboard, My Cards, AI Chat, Recommendations) are implemented in `Index.tsx` as a client-side tabbed interface that switches content via component state. These tabs currently do not update the URL; if deep-linking or browser-history navigation is required, consider turning tabs into route-driven pages or syncing tab state with the URL.
- Desktop computers

Media queries and responsive utility classes are used throughout.

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

### Styling

Use Tailwind utility classes for styling:
- `className="flex items-center justify-between"`
- `className="text-primary font-medium"`
- Use `cn()` utility for conditional classes

This documentation provides a foundation for understanding the PerkAsm frontend. As you work with the codebase, you'll discover more specific implementation details and patterns.