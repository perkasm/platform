# Development Guide

**PerkAsm Frontend Development Documentation**

This guide provides comprehensive information for developers working on the PerkAsm frontend codebase.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Project Architecture](#project-architecture)
- [Code Organization](#code-organization)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [API Integration](#api-integration)
- [State Management](#state-management)
- [Error Handling](#error-handling)
- [Performance Optimization](#performance-optimization)
- [Security Best Practices](#security-best-practices)
- [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**: Latest stable version
- **VS Code**: Recommended IDE with extensions:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/perkasm/platform.git
cd platform/frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.development
# Edit .env.development with your settings

# Start development server
npm run dev
```

### Environment Variables

Create a `.env.development` file with:

```env
# API Configuration
VITE_API_URL=http://localhost:8001/api/v1

# Authentication
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_ERROR_TRACKING=true

# Environment
VITE_ENVIRONMENT=development
```

---

## Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes

### Development Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Develop with TDD**
   - Write tests first (Red)
   - Implement feature (Green)
   - Refactor code (Refactor)

3. **Run Quality Checks**
   ```bash
   npm run lint          # Check linting
   npm run type-check    # Verify TypeScript
   npm run test          # Run all tests
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

---

## Project Architecture

### High-Level Architecture

```
Frontend (React + TypeScript)
    ├── UI Layer (Components)
    ├── State Management (React Query + Context)
    ├── Business Logic (Services + Hooks)
    ├── API Layer (Axios Client)
    └── Utilities (Helpers + Constants)
```

### Design Patterns

1. **Container/Presentation Pattern**
   - Containers: Smart components with logic
   - Presentational: Dumb components for UI

2. **Custom Hooks Pattern**
   - Extract reusable logic into hooks
   - Keep components clean and focused

3. **Service Layer Pattern**
   - All API calls go through service modules
   - Centralized error handling

4. **Factory Pattern**
   - Used for creating API clients
   - Configuration object creation

---

## Code Organization

### Directory Structure

```
src/
├── components/          # React components
│   ├── ui/             # Base UI components (shadcn/ui)
│   ├── cards/          # Card-related components
│   ├── chat/           # Chat interface components
│   ├── dashboard/      # Dashboard components
│   └── recommendations/# Recommendation components
├── pages/              # Page components (routes)
├── hooks/              # Custom React hooks
├── services/           # API service layer
├── contexts/           # React Context providers
├── lib/                # Utility libraries
├── utils/              # Helper functions
├── types/              # TypeScript type definitions
├── constants/          # Application constants
├── config/             # Configuration files
└── test/               # Test utilities and setup
```

### File Naming Conventions

- **Components**: PascalCase (`MyComponent.tsx`)
- **Hooks**: camelCase with 'use' prefix (`useMyHook.ts`)
- **Services**: camelCase with '.service' suffix (`cards.service.ts`)
- **Utils**: camelCase (`formatCurrency.ts`)
- **Constants**: camelCase (`index.ts`)
- **Types**: camelCase (`api.ts`)

---

## Coding Standards

### TypeScript Guidelines

1. **Always Use Strict Mode**
   ```typescript
   // tsconfig.json has strict: true
   // Never use 'any' type
   ```

2. **Explicit Return Types**
   ```typescript
   // ✅ Good
   function calculateRewards(points: number): number {
     return points * 0.01;
   }

   // ❌ Bad
   function calculateRewards(points: number) {
     return points * 0.01;
   }
   ```

3. **Use Type Inference When Obvious**
   ```typescript
   // ✅ Good
   const isActive = true;
   const count = 10;

   // ❌ Bad (unnecessary)
   const isActive: boolean = true;
   ```

4. **Prefer Interfaces for Objects**
   ```typescript
   // ✅ Good
   interface User {
     id: number;
     email: string;
   }

   // Use type for unions/intersections
   type Status = 'active' | 'inactive';
   ```

### React Best Practices

1. **Function Components Only**
   ```typescript
   // ✅ Good
   export function MyComponent({ prop }: Props) {
     return <div>{prop}</div>;
   }

   // ❌ Bad
   class MyComponent extends React.Component { }
   ```

2. **Use Custom Hooks for Logic**
   ```typescript
   // ✅ Good - Extract logic to hook
   function useCardData() {
     const { data, isLoading } = useQuery('cards', fetchCards);
     return { cards: data, isLoading };
   }
   ```

3. **Memoization When Needed**
   ```typescript
   // Use React.memo for expensive renders
   export const ExpensiveComponent = React.memo(({ data }: Props) => {
     // Expensive rendering logic
   });

   // Use useMemo for expensive calculations
   const expensiveValue = useMemo(() => 
     calculateSomething(data), 
     [data]
   );
   ```

### CSS/Tailwind Guidelines

1. **Use Tailwind Utilities First**
   ```tsx
   // ✅ Good
   <div className="flex items-center gap-4 p-4 bg-white rounded-lg">
   
   // ❌ Avoid custom CSS unless necessary
   ```

2. **Extract Repeated Patterns to Components**
   ```tsx
   // ✅ Good
   function Card({ children, className }: CardProps) {
     return (
       <div className={cn("rounded-lg border bg-card", className)}>
         {children}
       </div>
     );
   }
   ```

3. **Use the cn() Utility**
   ```tsx
   import { cn } from '@/lib/utils';

   <div className={cn(
     "base-classes",
     isActive && "active-classes",
     className
   )} />
   ```

---

## Testing Guidelines

### Test Structure

```typescript
describe('ComponentName', () => {
  describe('Feature/Behavior', () => {
    it('should do something specific', () => {
      // Arrange
      const props = { /* ... */ };
      
      // Act
      render(<Component {...props} />);
      
      // Assert
      expect(screen.getByText('...')).toBeInTheDocument();
    });
  });
});
```

### Testing Checklist

- [ ] Test happy paths
- [ ] Test error scenarios
- [ ] Test edge cases
- [ ] Test loading states
- [ ] Test user interactions
- [ ] Test accessibility
- [ ] Achieve 100% coverage

### Common Testing Patterns

1. **Testing Hooks**
   ```typescript
   import { renderHook } from '@testing-library/react';
   
   it('should return data', () => {
     const { result } = renderHook(() => useMyHook());
     expect(result.current.data).toBeDefined();
   });
   ```

2. **Testing Async Operations**
   ```typescript
   it('should load data', async () => {
     render(<Component />);
     
     await waitFor(() => {
       expect(screen.getByText('Data loaded')).toBeInTheDocument();
     });
   });
   ```

3. **Testing User Events**
   ```typescript
   import { userEvent } from '@testing-library/user-event';
   
   it('should handle click', async () => {
     const user = userEvent.setup();
     render(<Button onClick={handleClick} />);
     
     await user.click(screen.getByRole('button'));
     expect(handleClick).toHaveBeenCalled();
   });
   ```

---

## API Integration

### Service Layer Pattern

All API calls should go through service modules:

```typescript
// services/cards.service.ts
import { get, post, put, del } from './api';

export const cardsService = {
  async getCards(): Promise<CreditCard[]> {
    return get<CreditCard[]>('/cards');
  },
  
  async createCard(data: CreateCardDto): Promise<CreditCard> {
    return post<CreditCard>('/cards', data);
  },
};
```

### Using Services in Components

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { cardsService } from '@/services/cards.service';

function MyCards() {
  const { data: cards, isLoading } = useQuery({
    queryKey: ['cards'],
    queryFn: cardsService.getCards,
  });

  const createMutation = useMutation({
    mutationFn: cardsService.createCard,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(['cards']);
    },
  });

  // ...
}
```

### Error Handling

```typescript
const { data, error, isError } = useQuery({
  queryKey: ['cards'],
  queryFn: cardsService.getCards,
  retry: 3,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
});

if (isError) {
  return <ErrorAlert message={error.message} />;
}
```

---

## State Management

### Global State (Context)

Use Context for truly global state like authentication:

```typescript
// contexts/AuthContext.tsx
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

### Server State (React Query)

Use React Query for server data:

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['resource', id],
  queryFn: () => fetchResource(id),
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});
```

### Local Component State

Use useState/useReducer for component-specific state:

```typescript
function Component() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Or for complex state
  const [state, dispatch] = useReducer(reducer, initialState);
}
```

---

## Error Handling

### Error Boundary

Wrap app sections with ErrorBoundary:

```tsx
<ErrorBoundary fallback={<ErrorFallback />}>
  <MyComponent />
</ErrorBoundary>
```

### Try-Catch for Async

```typescript
async function handleSubmit() {
  try {
    await submitData();
    toast.success('Success!');
  } catch (error) {
    console.error('Submission failed:', error);
    toast.error('Failed to submit');
  }
}
```

### API Error Handling

Handled automatically by API interceptors and React Query.

---

## Performance Optimization

### Code Splitting

```typescript
// Lazy load routes
const Dashboard = lazy(() => import('@/pages/Dashboard'));

<Suspense fallback={<LoadingSpinner />}>
  <Dashboard />
</Suspense>
```

### Memoization

```typescript
// Memoize expensive calculations
const total = useMemo(() => 
  items.reduce((sum, item) => sum + item.price, 0),
  [items]
);

// Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(value);
}, [value]);
```

### Virtual Scrolling

For long lists, use react-virtual or similar:

```typescript
import { useVirtual } from '@tanstack/react-virtual';

const parentRef = useRef<HTMLDivElement>(null);
const rowVirtualizer = useVirtual({
  size: items.length,
  parentRef,
  estimateSize: useCallback(() => 50, []),
});
```

---

## Security Best Practices

### Input Validation

Always validate user input:

```typescript
import { chatMessageSchema } from '@/lib/validations';

const result = chatMessageSchema.safeParse(input);
if (!result.success) {
  throw new Error(result.error.message);
}
```

### XSS Protection

```typescript
import { validateAndSanitize } from '@/utils/xss-protection';

const { sanitized, isValid } = validateAndSanitize(userInput, {
  maxLength: 2000,
  allowHtml: false,
});
```

### Rate Limiting

```typescript
import { apiRateLimiter } from '@/utils/rate-limiter';

if (!apiRateLimiter.isAllowed(userId)) {
  throw new Error('Rate limit exceeded');
}
```

### Secure Storage

```typescript
// Never store sensitive data in localStorage
// Use httpOnly cookies for tokens when possible
const token = localStorage.getItem('token'); // ⚠️ Be cautious
```

---

## Troubleshooting

### Common Issues

#### TypeScript Errors

```bash
# Clear TypeScript cache
rm -rf node_modules/.cache

# Restart TypeScript server in VS Code
Cmd+Shift+P → "TypeScript: Restart TS Server"
```

#### Build Failures

```bash
# Clear build cache
rm -rf dist .vite

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### Test Failures

```bash
# Run specific test file
npm run test -- path/to/test.ts

# Run tests in watch mode
npm run test

# Update snapshots
npm run test -- -u
```

#### Hot Reload Not Working

```bash
# Check .env file is in the correct location
# Restart dev server
# Clear browser cache
```

---

## Additional Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [Testing Library Docs](https://testing-library.com/docs/)
- [Project README](./README.md)
- [Sprint Documentation](./docs/)

---

## Getting Help

- **Slack**: #perkasm-frontend
- **GitHub Issues**: Report bugs and feature requests
- **Code Reviews**: All PRs require at least one approval
- **Team Meetings**: Daily standups at 10 AM

---

*Last Updated: September 30, 2025*
