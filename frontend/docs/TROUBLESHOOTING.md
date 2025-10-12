# Troubleshooting Guide

**PerkAsm Frontend Common Issues and Solutions**

This guide helps developers quickly resolve common issues encountered during development.

---

## Table of Contents

- [Development Environment](#development-environment)
- [Build and Compilation](#build-and-compilation)
- [Dependencies](#dependencies)
- [Testing Issues](#testing-issues)
- [TypeScript Errors](#typescript-errors)
- [API and Network](#api-and-network)
- [Authentication Issues](#authentication-issues)
- [Project-Specific Issues](#project-specific-issues)
- [Deployment Issues](#deployment-issues)
- [State Management](#state-management)
- [Performance Issues](#performance-issues)
- [Accessibility Testing Issues](#accessibility-testing-issues)
- [Performance Monitoring Issues](#performance-monitoring-issues)
- [Browser-Specific Issues](#browser-specific-issues)

---

## Development Environment

### Dev Server Won't Start

**Problem**: `npm run dev` fails or hangs

**Solutions**:

1. **Check port availability**
   ```bash
   # Kill process on port 8080 (Vite configured port)
   lsof -ti:8080 | xargs kill -9
   
   # Or use a different port
   VITE_PORT=3000 npm run dev
   ```

2. **Clear cache and restart**
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

3. **Check Node version**
   ```bash
   node --version  # Should be >= 18.0.0
   npm --version   # Should be >= 9.0.0
   ```

---

### Hot Reload Not Working

**Problem**: Changes don't reflect in browser

**Solutions**:

1. **Hard refresh browser**
   - macOS: `Cmd + Shift + R`
   - Windows/Linux: `Ctrl + Shift + R`

2. **Check file watcher limits** (Linux)
   ```bash
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

3. **Restart dev server**
   ```bash
   # Stop with Ctrl+C, then restart
   npm run dev
   ```

4. **Check .env file location**
   - Must be in `/frontend/.env.development`
   - Not in project root

---

### Environment Variables Not Loading

**Problem**: `import.meta.env.VITE_*` is undefined

**Solutions**:

1. **Ensure VITE_ prefix**
   ```env
   # ✅ Correct
   VITE_API_URL=http://localhost:8001/api/v1
   
   # ❌ Wrong (missing VITE_ prefix)
   API_URL=http://localhost:8001/api/v1
   ```

2. **Restart dev server after .env changes**
   ```bash
   # Environment variables are loaded at startup
   npm run dev
   ```

3. **Check file name**
   - `.env.development` for dev mode
   - `.env.production` for production
   - `.env.local` for local overrides (gitignored)

---

## Build and Compilation

### Build Fails with TypeScript Errors

**Problem**: `npm run build` fails with type errors

**Solutions**:

1. **Run type check separately**
   ```bash
   npm run type-check
   ```

2. **Clear TypeScript cache**
   ```bash
   rm -rf node_modules/.cache
   rm tsconfig.tsbuildinfo
   ```

3. **Restart TypeScript server (VS Code)**
   - `Cmd/Ctrl + Shift + P`
   - Type: "TypeScript: Restart TS Server"

4. **Check for circular dependencies**
   ```bash
   npx madge --circular src/
   ```

---

### Build Size Too Large

**Problem**: Bundle size exceeds limits

**Solutions**:

1. **Analyze bundle**
   ```bash
   npm run build
   npx vite-bundle-visualizer
   ```

2. **Lazy load routes**
   ```typescript
   // Before
   import Dashboard from './pages/Dashboard';
   
   // After
   const Dashboard = lazy(() => import('./pages/Dashboard'));
   ```

3. **Check for duplicate dependencies**
   ```bash
   npm dedupe
   ```

4. **Remove unused imports**
   ```bash
   npx ts-prune
   ```

---

## Dependencies

### npm install Fails

**Problem**: Dependency installation errors

**Solutions**:

1. **Clear npm cache**
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Use specific npm version**
   ```bash
   npm install -g npm@latest
   ```

3. **Check for platform-specific issues**
   ```bash
   # macOS ARM (M1/M2)
   arch -x86_64 npm install
   ```

---

### Peer Dependency Conflicts

**Problem**: `ERESOLVE unable to resolve dependency tree`

**Solutions**:

1. **Use legacy peer deps (temporary)**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Update conflicting packages**
   ```bash
   npm update package-name
   ```

3. **Check package.json for version conflicts**
   ```json
   // Ensure compatible versions
   "react": "^18.3.0",
   "react-dom": "^18.3.0"
   ```

---

## Testing Issues

### Tests Failing Unexpectedly

**Problem**: Previously passing tests now fail

**Solutions**:

1. **Clear test cache**
   ```bash
   npm run test -- --clearCache
   ```

2. **Run tests in sequence**
   ```bash
   npm run test -- --run  # Run once instead of watch mode
   ```

3. **Check for test pollution**
   ```typescript
   // Add cleanup in test setup (src/test/setup.ts)
   afterEach(() => {
     vi.clearAllMocks();
     cleanup();
   });
   ```

4. **Fix Vitest-specific issues**
   ```typescript
   // Ensure proper imports in tests
   import { describe, it, expect, vi } from 'vitest';
   
   // Mock modules properly
   vi.mock('@/services/api', () => ({
     apiClient: vi.fn(),
   }));
   ```

---

### Mock Service Worker Issues

**Problem**: MSW not intercepting requests in tests

**Solutions**:

1. **Ensure MSW server is started**
   ```typescript
   // In src/test/setup.ts or test file
   import { server } from '@/test/mocks/server';
   
   beforeAll(() => server.listen());
   afterEach(() => server.resetHandlers());
   afterAll(() => server.close());
   ```

2. **Check handler patterns**
   ```typescript
   // Must match exact URL pattern
   rest.get('http://localhost:8001/api/v1/cards', ...)
   
   // Or use wildcard for flexibility
   rest.get('*/api/v1/cards', ...)
   ```

3. **Verify request interception**
   ```typescript
   // Add logging to debug
   server.use(
     rest.get('/api/v1/cards', (req, res, ctx) => {
       console.log('MSW intercepted:', req.url);
       return res(ctx.json({ cards: [] }));
     })
   );
   ```

---

### Coverage Not Reaching 100%

**Problem**: Can't achieve full test coverage

**Solutions**:

1. **Check coverage report**
   ```bash
   npm run test:coverage
   open coverage/index.html
   ```

2. **Find untested code**
   ```bash
   # View uncovered lines in terminal
   npm run test:coverage -- --reporter=text
   ```

3. **Test all branches and edge cases**
   ```typescript
   // Test both success and error paths
   it('should handle success', async () => {
     mockApi.mockResolvedValue({ data: 'success' });
     // ... test success case
   });
   
   it('should handle errors', async () => {
     mockApi.mockRejectedValue(new Error('API Error'));
     // ... test error case
   });
   ```

4. **Test React component interactions**
   ```typescript
   // Test user interactions
   it('should submit form on button click', async () => {
     const user = userEvent.setup();
     render(<Form />);
     
     await user.type(screen.getByLabelText('Name'), 'John');
     await user.click(screen.getByRole('button', { name: /submit/i }));
     
     expect(mockSubmit).toHaveBeenCalledWith({ name: 'John' });
   });
   ```

---

### Vitest Configuration Issues

**Problem**: Tests not running or configuration problems

**Solutions**:

1. **Check Vitest config**
   ```typescript
   // vitest.config.ts
   export default defineConfig({
     test: {
       globals: true,  // Enables describe/it/expect globally
       environment: 'jsdom',  // For DOM testing
       setupFiles: ['./src/test/setup.ts'],
     },
   });
   ```

2. **Fix import path issues**
   ```json
   // tsconfig.json - ensure paths are configured
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```

3. **Resolve module mocking issues**
   ```typescript
   // Mock CSS imports
   vi.mock('*.css', () => ({}));
   
   // Mock image imports
   vi.mock('*.png', () => ({ default: 'mock-image-path' }));
   ```

---

## TypeScript Errors

### "Cannot find module" Errors

**Problem**: TypeScript can't resolve imports

**Solutions**:

1. **Check path alias configuration**
   ```json
   // tsconfig.json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```

   ```typescript
   // vite.config.ts
   resolve: {
     alias: {
       '@': path.resolve(__dirname, './src'),
     },
   }
   ```

2. **Restart TypeScript server**
   - VS Code: `Cmd/Ctrl + Shift + P` → "TypeScript: Restart TS Server"

3. **Check file extension**
   ```typescript
   // ✅ Correct
   import { Button } from '@/components/ui/button';
   
   // ❌ Wrong (don't include .tsx extension)
   import { Button } from '@/components/ui/button.tsx';
   ```

---

### "Type 'X' is not assignable to type 'Y'"

**Problem**: Type mismatch errors

**Solutions**:

1. **Check type definitions**
   ```typescript
   // Ensure types match
   interface Props {
     value: string; // Not string | undefined
   }
   
   // Provide default value
   function Component({ value = '' }: Props) { }
   ```

2. **Use type guards**
   ```typescript
   if (typeof value === 'string') {
     // TypeScript knows value is string here
   }
   ```

3. **Use type assertions (carefully)**
   ```typescript
   const element = document.getElementById('root') as HTMLElement;
   ```

---

### "Object is possibly 'null' or 'undefined'"

**Problem**: Null/undefined errors with strict mode

**Solutions**:

1. **Use optional chaining**
   ```typescript
   const name = user?.profile?.name;
   ```

2. **Use nullish coalescing**
   ```typescript
   const displayName = user?.name ?? 'Guest';
   ```

3. **Type guard**
   ```typescript
   if (user) {
     console.log(user.name); // TypeScript knows user is defined
   }
   ```

4. **Non-null assertion (use sparingly)**
   ```typescript
   const element = document.getElementById('root')!;
   ```

---

## API and Network

### CORS Errors

**Problem**: `Access-Control-Allow-Origin` errors

**Solutions**:

1. **Configure Vite proxy** (development)
   ```typescript
   // Add to vite.config.ts server configuration
   server: {
     host: "::",
     port: 8080,
     proxy: {
       '/api': {
         target: 'http://localhost:8001',
         changeOrigin: true,
         secure: false,
       },
     },
   }
   ```

2. **Check backend CORS configuration**
   ```python
   # Backend should allow frontend origin
   # In backend/.env
   BACKEND_CORS_ORIGINS=["http://localhost:8080"]
   
   # Or for multiple origins
   BACKEND_CORS_ORIGINS=["http://localhost:8080","http://localhost:3000","https://yourdomain.com"]
   ```

3. **Use withCredentials**
   ```typescript
   axios.create({
     withCredentials: true,
   });
   ```

---

### API Calls Failing Silently

**Problem**: Network requests fail without errors

**Solutions**:

1. **Check network tab**
   - Open DevTools → Network
   - Look for failed requests (red)
   - Check request/response details

2. **Add error logging**
   ```typescript
   try {
     const data = await fetchData();
   } catch (error) {
     console.error('API call failed:', error);
     throw error;
   }
   ```

3. **Check React Query error handling**
   ```typescript
   const { data, error } = useQuery({
     queryKey: ['data'],
     queryFn: fetchData,
     onError: (error) => {
       console.error('Query failed:', error);
     },
   });
   ```

---

### Stale Data Issues

**Problem**: React Query showing old data

**Solutions**:

1. **Invalidate queries**
   ```typescript
   const queryClient = useQueryClient();
   
   await createItem();
   queryClient.invalidateQueries(['items']);
   ```

2. **Adjust stale time**
   ```typescript
   useQuery({
     queryKey: ['items'],
     queryFn: fetchItems,
     staleTime: 0, // Always fresh
   });
   ```

3. **Force refetch**
   ```typescript
   const { refetch } = useQuery(['items'], fetchItems);
   refetch();
   ```

---

## Authentication Issues

### Google OAuth Login Fails

**Problem**: Google login button doesn't work or redirects fail

**Solutions**:

1. **Check Google OAuth configuration**
   ```env
   # Ensure all required environment variables are set
   VITE_GOOGLE_CLIENT_ID=your-actual-google-client-id
   GOOGLE_CLIENT_ID=your-actual-google-client-id
   GOOGLE_CLIENT_SECRET=your-actual-google-client-secret
   GOOGLE_REDIRECT_URI=http://localhost:8001/api/v1/auth/google/callback
   ```

2. **Verify Google Cloud Console setup**
   - Client ID matches exactly
   - Authorized redirect URIs include backend callback URL
   - OAuth consent screen is configured

3. **Check backend OAuth service**
   ```bash
   # Test OAuth endpoint directly
   curl -X GET "http://localhost:8001/api/v1/auth/google"
   ```

---

### JWT Token Issues

**Problem**: Authentication lost after page refresh or API calls fail with 401

**Solutions**:

1. **Check token storage**
   ```typescript
   // Ensure tokens are stored securely
   localStorage.setItem('access_token', token);
   localStorage.setItem('refresh_token', refreshToken);
   ```

2. **Verify token expiration**
   ```typescript
   // Check if token is expired before using
   const isExpired = Date.now() >= tokenExpiry * 1000;
   ```

3. **Implement token refresh**
   ```typescript
   // Automatic token refresh on 401 responses
   axios.interceptors.response.use(
     response => response,
     async error => {
       if (error.response?.status === 401) {
         // Attempt token refresh
         await refreshToken();
         // Retry original request
         return axios(error.config);
       }
       return Promise.reject(error);
     }
   );
   ```

---

### Session Persistence Issues

**Problem**: User logged out after browser refresh

**Solutions**:

1. **Check token persistence**
   ```typescript
   // Load tokens on app initialization
   useEffect(() => {
     const token = localStorage.getItem('access_token');
     if (token) {
       // Validate and set user context
       setAuthToken(token);
     }
   }, []);
   ```

2. **Verify token validation**
   ```typescript
   // Validate token with backend on app load
   const validateToken = async () => {
     try {
       const response = await axios.get('/api/v1/auth/me');
       setUser(response.data);
     } catch (error) {
       // Token invalid, redirect to login
       logout();
     }
   };
   ```

---

## Project-Specific Issues

### Credit Card Management Problems

**Problem**: Cards not loading or CRUD operations failing

**Solutions**:

1. **Check API endpoints**
   ```bash
   # Test card endpoints
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        http://localhost:8001/api/v1/cards
   ```

2. **Verify card data validation**
   ```typescript
   // Ensure required fields are present
   const cardData = {
     name: 'Card Name',
     issuer: 'Bank Name',
     network: 'Visa', // Visa, Mastercard, Amex
     lastFour: '1234',
     expiryMonth: 12,
     expiryYear: 2025,
     // ... other required fields
   };
   ```

3. **Check database connectivity**
   ```bash
   # From backend directory
   python -c "from app.core.database import engine; print('DB connected' if engine else 'DB failed')"
   ```

---

### AI Chat Not Responding

**Problem**: Chat interface not working or responses delayed

**Solutions**:

1. **Check chat service configuration**
   ```typescript
   // Verify chat API configuration
   const chatConfig = {
     apiUrl: import.meta.env.VITE_API_URL,
     timeout: 30000, // 30 seconds
   };
   ```

2. **Test chat endpoints**
   ```bash
   curl -X POST http://localhost:8001/api/v1/chat \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer YOUR_TOKEN" \
        -d '{"message": "Hello"}'
   ```

3. **Check WebSocket connection** (if applicable)
   ```typescript
   // Verify WebSocket URL
   const wsUrl = `ws://localhost:8001/api/v1/chat/ws`;
   const socket = new WebSocket(wsUrl);
   ```

---

### Recommendations Not Loading

**Problem**: Card recommendations not appearing

**Solutions**:

1. **Verify user transaction data**
   ```bash
   # Check if user has transactions
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        http://localhost:8001/api/v1/transactions
   ```

2. **Test recommendations endpoint**
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        http://localhost:8001/api/v1/recommendations
   ```

3. **Check recommendation algorithm**
   ```typescript
   // Ensure proper data is sent
   const recommendationRequest = {
     spendingCategories: ['groceries', 'dining'],
     monthlySpend: 2000,
     currentCards: userCards,
   };
   ```

---

## Deployment Issues

### Docker Build Fails

**Problem**: `docker build` fails in frontend

**Solutions**:

1. **Check Node version in Dockerfile**
   ```dockerfile
   # Ensure Node version matches local
   FROM node:18-alpine AS base
   ```

2. **Clear Docker cache**
   ```bash
   docker system prune -a
   docker build --no-cache -t perkasm-frontend .
   ```

3. **Check build arguments**
   ```bash
   # Build with environment variables
   docker build \
     --build-arg VITE_API_URL=https://api.yourdomain.com \
     --build-arg VITE_SENTRY_DSN=your-sentry-dsn \
     -t perkasm-frontend .
   ```

---

### Kubernetes Deployment Issues

**Problem**: Frontend pod crashes or doesn't start

**Solutions**:

1. **Check resource limits**
   ```yaml
   # k8s/deployment.yaml
   resources:
     requests:
       memory: "128Mi"
       cpu: "100m"
     limits:
       memory: "512Mi"
       cpu: "500m"
   ```

2. **Verify environment variables**
   ```yaml
   # k8s/configmap.yaml
   apiVersion: v1
   kind: ConfigMap
   metadata:
     name: frontend-config
   data:
     VITE_API_URL: "https://api.yourdomain.com"
     VITE_SENTRY_DSN: "your-sentry-dsn"
   ```

3. **Check ingress configuration**
   ```yaml
   # k8s/ingress.yaml
   apiVersion: networking.k8s.io/v1
   kind: Ingress
   metadata:
     name: frontend-ingress
   spec:
     rules:
     - host: yourdomain.com
       http:
         paths:
         - path: /
           pathType: Prefix
           backend:
             service:
               name: frontend-service
               port:
                 number: 80
   ```

---

### SSL/HTTPS Issues

**Problem**: HTTPS not working or certificate errors

**Solutions**:

1. **Generate SSL certificates**
   ```bash
   # Use the provided script
   ./generate-ssl-cert.sh
   ```

2. **Configure Nginx for SSL**
   ```nginx
   # nginx.conf
   server {
     listen 443 ssl;
     server_name yourdomain.com;
     
     ssl_certificate /etc/ssl/certs/cert.pem;
     ssl_certificate_key /etc/ssl/private/key.pem;
     
     location / {
       proxy_pass http://frontend:8080;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
     }
   }
   ```

3. **Check certificate validity**
   ```bash
   openssl x509 -in cert.pem -text -noout
   ```

---

### Storybook Build Issues

**Problem**: Storybook fails to build or run

**Solutions**:

1. **Clear Storybook cache**
   ```bash
   rm -rf node_modules/.cache/storybook
   npm run storybook
   ```

2. **Check Storybook configuration**
   ```typescript
   // .storybook/main.ts
   export default {
     stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
     addons: [
       '@storybook/addon-essentials',
       '@storybook/addon-a11y',
     ],
     framework: {
       name: '@storybook/react-vite',
       options: {},
     },
   };
   ```

3. **Fix import issues in stories**
   ```typescript
   // Ensure proper imports in stories
   import { Button } from '@/components/ui/button';
   ```

---

### Sentry Configuration Issues

**Problem**: Error tracking not working

**Solutions**:

1. **Verify Sentry DSN**
   ```env
   VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id
   SENTRY_ORG=your-org
   SENTRY_PROJECT=your-project
   SENTRY_AUTH_TOKEN=your-auth-token
   ```

2. **Check Sentry initialization**
   ```typescript
   // src/main.tsx
   import * as Sentry from '@sentry/react';
   
   Sentry.init({
     dsn: import.meta.env.VITE_SENTRY_DSN,
     environment: import.meta.env.VITE_SENTRY_ENVIRONMENT,
     integrations: [
       Sentry.browserTracingIntegration(),
       Sentry.replayIntegration(),
     ],
     tracesSampleRate: 1.0,
   });
   ```

3. **Test error reporting**
   ```typescript
   // Trigger a test error
   throw new Error('Test Sentry error');
   ```

---

## Accessibility Testing Issues

### Axe Tests Failing

**Problem**: Accessibility tests fail with violations

**Solutions**:

1. **Run accessibility tests**
   ```bash
   npm run test:accessibility
   ```

2. **Fix common violations**
   ```typescript
   // Add proper ARIA labels
   <button aria-label="Close dialog">×</button>
   
   // Ensure color contrast
   <div className="text-gray-900 bg-white">High contrast text</div>
   
   // Add focus management
   <input ref={inputRef} autoFocus />
   ```

3. **Check semantic HTML**
   ```html
   <!-- Use semantic elements -->
   <header>
   <nav>
   <main>
   <section>
   ```

---

### Screen Reader Issues

**Problem**: Screen readers can't navigate properly

**Solutions**:

1. **Test with screen readers**
   - macOS: VoiceOver (Cmd + F5)
   - Windows: NVDA or JAWS

2. **Add proper headings**
   ```html
   <h1>Main Title</h1>
   <h2>Section Title</h2>
   <h3>Subsection</h3>
   ```

3. **Implement skip links**
   ```html
   <a href="#main-content" className="sr-only focus:not-sr-only">
     Skip to main content
   </a>
   ```

---

## Performance Monitoring Issues

### Core Web Vitals Poor Scores

**Problem**: Lighthouse performance scores are low

**Solutions**:

1. **Analyze bundle size**
   ```bash
   npm run build:analyze
   open dist/stats.html
   ```

2. **Optimize images**
   ```typescript
   // Use next-gen formats
   import webpImage from './image.webp';
   import { LazyImage } from '@/components/ui/lazy-image';
   ```

3. **Implement code splitting**
   ```typescript
   const Dashboard = lazy(() => import('./pages/Dashboard'));
   
   <Suspense fallback={<LoadingSpinner />}>
     <Dashboard />
   </Suspense>
   ```

4. **Add performance monitoring**
   ```typescript
   // Monitor Core Web Vitals
   import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
   
   getCLS(console.log);
   getFID(console.log);
   getFCP(console.log);
   getLCP(console.log);
   getTTFB(console.log);
   ```

---

## Getting Help

### Before Asking for Help

1. **Check this guide** - Common issues are documented here
2. **Check project documentation** - Review `docs/` folder for specific guides
3. **Search GitHub issues** - Someone might have had the same problem
4. **Check browser console** - Error messages are helpful
5. **Read error messages carefully** - They often contain the solution

### How to Ask for Help

When reporting an issue, include:

1. **Environment details**
   - OS and version: `uname -a` (macOS/Linux) or `systeminfo` (Windows)
   - Node version: `node --version`
   - npm version: `npm --version`
   - Browser and version
   - Git commit: `git rev-parse HEAD`

2. **Project-specific information**
   - Backend running: `curl http://localhost:8001/health`
   - Database status: Check if PostgreSQL is running
   - Environment variables: Confirm `.env` files are configured

3. **Steps to reproduce**
   ```
   1. Run ./run-postgres.sh (if using local DB)
   2. Start backend: cd backend && uv run uvicorn app.main:app --reload
   3. Start frontend: npm run dev
   4. Navigate to /dashboard
   5. Click "Add Card"
   6. Error appears
   ```

4. **Error messages**
   - Full error stack trace
   - Console errors (F12 → Console)
   - Network errors (F12 → Network)
   - Terminal output from both frontend and backend

5. **What you've tried**
   - List solutions you've attempted
   - Results of each attempt
   - Any workarounds that partially work

### Project-Specific Debugging

**Database Issues:**
```bash
# Check PostgreSQL connection
psql -h localhost -U perkasm -d perkasm

# View backend logs
cd backend && uv run uvicorn app.main:app --reload --log-level debug
```

**API Debugging:**
```bash
# Test API endpoints
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8001/api/v1/cards

# Check API documentation
open http://localhost:8001/docs
```

**Environment Setup:**
```bash
# Verify all services are running
lsof -i :8080  # Frontend
lsof -i :8001  # Backend
lsof -i :5432  # PostgreSQL
```

---

## Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TanStack Query](https://tanstack.com/query)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vitest Testing](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/)
- [MSW Mocking](https://mswjs.io/)
- [Storybook](https://storybook.js.org/)
- [Sentry Error Tracking](https://docs.sentry.io/)
- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/reactjs)

---

*Last Updated: October 11, 2025*
