# Test Organization Guide

## Current Structure: Co-located Tests ✅

### What is Co-location?

Test files are placed **next to** the source code they test, not in a separate directory structure.

```
src/
├── components/
│   ├── ErrorBoundary.tsx
│   ├── ErrorBoundary.test.tsx     ← Test lives next to component
│   └── ui/
│       ├── button.tsx
│       └── button.test.tsx        ← Test lives next to component
```

### Why Co-location is Best Practice

#### ✅ **Advantages**

1. **Easier to Find Tests**
   - No need to navigate to separate test folders
   - Tests are immediately visible when viewing source code
   - Clear one-to-one relationship between code and tests

2. **Better Maintainability**
   - When refactoring, tests move with the code
   - No need to maintain parallel directory structures
   - Easier to ensure tests stay in sync with implementation

3. **Improved Developer Experience**
   - Faster to write tests (just create `.test.tsx` next to file)
   - Easier to review PRs (tests and code changes are adjacent)
   - Reduces cognitive overhead of project navigation

4. **Industry Standard**
   - Used by React, Next.js, Remix, and most modern projects
   - Recommended by Testing Library and Vitest
   - Aligns with component-driven development

5. **Import Simplicity**
   - No complex relative imports (`../../../components/Button`)
   - Tests import from same directory or use path aliases
   - Less prone to import errors when restructuring

#### ❌ **Alternative: Separated Tests**

Some projects use a separate `__tests__` folder structure:

```
src/
├── components/
│   ├── ErrorBoundary.tsx
│   └── ui/
│       └── button.tsx
└── __tests__/
    ├── components/
    │   ├── ErrorBoundary.test.tsx
    │   └── ui/
    │       └── button.test.tsx
```

**Disadvantages:**
- Must maintain parallel directory structures
- Harder to find which files have tests
- Refactoring requires moving tests separately
- More complex imports
- Outdated pattern from older testing frameworks

### Our Configuration

#### Vitest Configuration (`vitest.config.ts`)

```typescript
export default defineConfig({
  test: {
    // Automatically finds all .test.tsx and .spec.tsx files
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    
    // Excludes unnecessary directories
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
    
    // Setup file for global test configuration
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

#### Test File Naming

- **Component Tests**: `ComponentName.test.tsx`
- **Hook Tests**: `use-hook-name.test.ts`
- **Service Tests**: `service-name.service.test.ts`
- **Utility Tests**: `utils.test.ts`

### Project Test Statistics

- **Total Test Files**: 18
- **Total Tests**: 244 passing
- **Coverage**: 100% for tested modules
- **Test Framework**: Vitest 3.2.4
- **Testing Library**: React Testing Library 16.3.0

### Test Organization Examples

#### ✅ Good: Co-located Tests

```
src/
├── components/
│   ├── ErrorBoundary.tsx
│   ├── ErrorBoundary.test.tsx
│   ├── ProtectedRoute.tsx
│   ├── ProtectedRoute.test.tsx
│   └── ui/
│       ├── button.tsx
│       ├── button.test.tsx
│       ├── card.tsx
│       └── card.test.tsx
├── hooks/
│   ├── use-toast.ts
│   ├── use-toast.test.ts
│   ├── use-mobile.tsx
│   └── use-mobile.test.tsx
└── services/
    ├── api.ts
    ├── api.test.ts
    ├── cards.service.ts
    └── cards.service.test.ts
```

#### ❌ Avoid: Separated Tests (Old Pattern)

```
src/
├── components/
│   ├── ErrorBoundary.tsx
│   └── ui/
│       └── button.tsx
└── __tests__/
    └── components/
        ├── ErrorBoundary.test.tsx
        └── ui/
            └── button.test.tsx
```

### When to Use Different Patterns

| Pattern | Use Case | Our Choice |
|---------|----------|------------|
| **Co-located** | Modern React apps, component libraries | ✅ **YES** |
| **Separated `__tests__`** | Legacy projects, specific team preferences | ❌ No |
| **Separate `test/` for setup only** | Global test configuration, mocks | ✅ **YES** |

### Our Test Directory Structure

```
src/
├── test/                          ← Setup files only
│   ├── setup.ts                   ← Global test setup
│   └── setup.test.ts              ← Setup validation
│
└── [all other directories]/
    ├── *.tsx                      ← Source files
    └── *.test.tsx                 ← Co-located tests
```

### Migration Guidelines

**If you were considering moving to separated tests:**

❌ **Don't do it!** Here's why:

1. You'd need to move 18 test files
2. Recreate directory structure in `__tests__/`
3. Update all import paths in tests
4. Update vitest configuration
5. Lose the benefits of co-location
6. Go against React community standards

**Instead, keep the current structure and:**

✅ Continue writing tests next to source files
✅ Follow the established naming convention
✅ Maintain 100% coverage for critical paths
✅ Use the `src/test/` folder only for global setup

### Best Practices

#### 1. Test File Naming

```typescript
// Component tests
ErrorBoundary.tsx → ErrorBoundary.test.tsx

// Hook tests
use-toast.ts → use-toast.test.ts

// Service tests
api.ts → api.test.ts
cards.service.ts → cards.service.test.ts
```

#### 2. Test Structure

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { YourComponent } from './YourComponent';

describe('YourComponent', () => {
  it('should render correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

#### 3. Import Paths

```typescript
// ✅ Good: Import from same directory
import { Button } from './button';

// ✅ Good: Use path alias
import { cn } from '@/lib/utils';

// ❌ Avoid: Complex relative imports
import { Button } from '../../../components/ui/button';
```

### Running Tests

```bash
# Run all tests in watch mode
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui

# Run specific test file
npm run test ErrorBoundary.test.tsx

# Run tests matching pattern
npm run test -- --grep "authentication"
```

### Coverage Exclusions

Configured in `vitest.config.ts`:

```typescript
coverage: {
  exclude: [
    'node_modules/',
    'src/test/',           // ← Test setup files excluded
    '**/*.d.ts',           // ← Type definitions excluded
    '**/*.config.*',       // ← Config files excluded
    '**/mockData',         // ← Mock data excluded
    'dist/',
  ],
}
```

### Conclusion

**Our co-located test structure is:**
- ✅ Following React community best practices
- ✅ Used by major projects (React, Next.js, Remix)
- ✅ Easier to maintain and scale
- ✅ Better for developer experience
- ✅ Already working well with 244 passing tests

**Recommendation:** **Keep the current structure!** It's modern, maintainable, and follows industry standards.

---

*Last Updated: September 30, 2025*
