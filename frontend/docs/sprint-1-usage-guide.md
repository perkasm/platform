# Sprint 1 Implementation Guide

**Quick reference for using the Sprint 1 implementations**

---

## 🧪 Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (default)
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- ErrorBoundary

# Run TypeScript type checking
npm run type-check
```

---

## 🔐 Authentication Usage

### Setup AuthProvider

```tsx
// In your main App.tsx or index.tsx
import { AuthProvider } from '@/contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      {/* Your app components */}
    </AuthProvider>
  );
}
```

### Using the useAuth Hook

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, isLoading, login, logout, loginWithGoogle } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <button onClick={loginWithGoogle}>Login with Google</button>;
  }

  return (
    <div>
      <p>Welcome, {user?.name}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Protecting Routes

```tsx
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Routes, Route } from 'react-router-dom';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
```

---

## 🛡️ Error Boundary Usage

### Basic Usage

```tsx
import ErrorBoundary from '@/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <YourComponent />
    </ErrorBoundary>
  );
}
```

### With Custom Fallback

```tsx
<ErrorBoundary
  fallback={<div>Oops! Something went wrong.</div>}
  onError={(error, errorInfo) => {
    console.error('Error caught:', error, errorInfo);
    // Send to error tracking service
  }}
  onReset={() => {
    // Clean up before retry
    console.log('Resetting error boundary');
  }}
>
  <YourComponent />
</ErrorBoundary>
```

---

## 🔄 Error Handling & Retry Logic

### Retry API Calls

```tsx
import { retryWithBackoff } from '@/utils/errorHandling';
import { get } from '@/services/api';

// Automatically retry failed requests
async function fetchData() {
  const data = await retryWithBackoff(
    () => get('/api/data'),
    {
      maxRetries: 3,
      initialDelay: 1000,
      onRetry: (attempt, error) => {
        console.log(`Retry attempt ${attempt}:`, error.message);
      }
    }
  );
  return data;
}
```

### Create Retryable Functions

```tsx
import { createRetryableRequest } from '@/utils/errorHandling';
import { post } from '@/services/api';

// Create a retryable version of a function
const retryablePost = createRetryableRequest(post, {
  maxRetries: 3,
  initialDelay: 1000,
});

// Use it like normal
const result = await retryablePost('/api/items', { name: 'Item' });
```

### Format Errors for Users

```tsx
import { formatApiError } from '@/utils/errorHandling';
import { useToast } from '@/hooks/use-toast';

function MyComponent() {
  const { toast } = useToast();

  async function handleAction() {
    try {
      await someApiCall();
    } catch (error) {
      const formatted = formatApiError(error as Error);
      toast({
        title: formatted.title,
        description: formatted.description,
        variant: 'destructive',
      });
    }
  }

  return <button onClick={handleAction}>Do Something</button>;
}
```

### Handle Async Errors

```tsx
import { handleAsyncError } from '@/utils/errorHandling';
import { useToast } from '@/hooks/use-toast';

function MyComponent() {
  const { toast } = useToast();

  async function handleAction() {
    const result = await handleAsyncError(
      () => someApiCall(),
      {
        onError: (error) => {
          const formatted = formatApiError(error);
          toast({
            title: formatted.title,
            description: formatted.description,
            variant: 'destructive',
          });
        },
        rethrow: false, // Don't throw, just handle
      }
    );

    if (result) {
      // Success
      console.log('Data:', result);
    }
  }

  return <button onClick={handleAction}>Do Something</button>;
}
```

---

## 📦 API Service Usage

### Basic API Calls

```tsx
import { get, post, put, del } from '@/services/api';

// GET request
const users = await get('/users');

// POST request
const newUser = await post('/users', { name: 'John', email: 'john@example.com' });

// PUT request
const updated = await put('/users/1', { name: 'Jane' });

// DELETE request
await del('/users/1');
```

### With Authentication

```tsx
import { setAuthToken } from '@/services/api';

// Set token after login
setAuthToken('your-jwt-token');

// Now all requests include the token
const data = await get('/protected-endpoint');

// Clear token on logout
setAuthToken(null);
```

### Error Handling

```tsx
import { get, ApiError } from '@/services/api';

try {
  const data = await get('/api/data');
} catch (error) {
  if (error instanceof ApiError) {
    console.log('Status:', error.status);
    console.log('Message:', error.message);
    console.log('Data:', error.data);
  }
}
```

---

## 🧰 Utility Functions

### Class Name Utility (cn)

```tsx
import { cn } from '@/lib/utils';

// Merge Tailwind classes
<div className={cn('px-2 py-1', 'bg-blue-500', { 'text-white': isActive })} />

// Conditional classes
<button className={cn('btn', { 'btn-primary': isPrimary, 'btn-disabled': isDisabled })} />

// Override Tailwind classes
<div className={cn('text-red-500', 'text-blue-500')} /> // Results in: text-blue-500
```

---

## 🧪 Writing Tests

### Testing Components

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render successfully', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should handle click events', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    
    render(<MyComponent onClick={onClick} />);
    
    await user.click(screen.getByRole('button'));
    
    expect(onClick).toHaveBeenCalled();
  });
});
```

### Testing Hooks

```tsx
import { renderHook, act } from '@testing-library/react';
import { useMyHook } from './useMyHook';

describe('useMyHook', () => {
  it('should update value', () => {
    const { result } = renderHook(() => useMyHook());

    act(() => {
      result.current.setValue('new value');
    });

    expect(result.current.value).toBe('new value');
  });
});
```

### Mocking API Calls

```tsx
import MockAdapter from 'axios-mock-adapter';
import { apiClient } from '@/services/api';

describe('MyComponent', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });

  afterEach(() => {
    mock.restore();
  });

  it('should fetch data', async () => {
    mock.onGet('/api/data').reply(200, { items: [] });

    // Your test here
  });
});
```

---

## 🎨 Best Practices

### 1. Always Use Error Boundaries

Wrap major sections of your app with ErrorBoundary:

```tsx
<ErrorBoundary>
  <Section />
</ErrorBoundary>
```

### 2. Use Retry Logic for Critical Operations

```tsx
const data = await retryWithBackoff(() => criticalApiCall());
```

### 3. Format Errors for Users

Never show raw error messages to users:

```tsx
const formatted = formatApiError(error);
toast({ title: formatted.title, description: formatted.description });
```

### 4. Protect Sensitive Routes

Always wrap authenticated routes:

```tsx
<ProtectedRoute>
  <SensitiveComponent />
</ProtectedRoute>
```

### 5. Test Everything

Maintain 100% coverage for critical code:

```bash
npm run test:coverage
```

---

## 🐛 Debugging Tips

### Enable Test UI

```bash
npm run test:ui
```

### Check TypeScript Errors

```bash
npm run type-check
```

### View Test Coverage

```bash
npm run test:coverage
# Open coverage/index.html in browser
```

### Debug Tests

```tsx
import { screen } from '@testing-library/react';

// Use screen.debug() to see current DOM
screen.debug();

// Or debug specific element
screen.debug(screen.getByRole('button'));
```

---

## 📚 Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Exponential Backoff](https://en.wikipedia.org/wiki/Exponential_backoff)

---

**Last Updated:** September 30, 2025  
**Sprint:** 1 - Critical Foundation
