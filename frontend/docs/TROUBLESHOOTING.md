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
- [State Management](#state-management)
- [Performance Issues](#performance-issues)
- [Browser-Specific Issues](#browser-specific-issues)

---

## Development Environment

### Dev Server Won't Start

**Problem**: `npm run dev` fails or hangs

**Solutions**:

1. **Check port availability**
   ```bash
   # Kill process on port 5173 (Vite default)
   lsof -ti:5173 | xargs kill -9
   
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
   npm run test -- --no-threads
   ```

3. **Check for test pollution**
   ```typescript
   // Add cleanup in beforeEach/afterEach
   afterEach(() => {
     vi.clearAllMocks();
     cleanup();
   });
   ```

---

### Mock Service Worker Issues

**Problem**: MSW not intercepting requests

**Solutions**:

1. **Ensure server is started**
   ```typescript
   // In test/setup.ts
   beforeAll(() => server.listen());
   afterEach(() => server.resetHandlers());
   afterAll(() => server.close());
   ```

2. **Check handler patterns**
   ```typescript
   // Must match exact URL
   rest.get('http://localhost/api/v1/cards', ...)
   
   // Or use relative path
   rest.get('/api/v1/cards', ...)
   ```

3. **Verify request is being made**
   ```typescript
   server.use(
     rest.get('/api/v1/cards', (req, res, ctx) => {
       console.log('Request intercepted');
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
   # View uncovered lines
   cat coverage/lcov-report/index.html
   ```

3. **Test all branches**
   ```typescript
   // Test both true and false conditions
   it('should render when isActive is true', ...);
   it('should not render when isActive is false', ...);
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
   // vite.config.ts
   server: {
     proxy: {
       '/api': {
         target: 'http://localhost:8001',
         changeOrigin: true,
       },
     },
   }
   ```

2. **Check backend CORS configuration**
   ```python
   # Backend should allow frontend origin
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:5173"],
       allow_credentials=True,
   )
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

## State Management

### Infinite Re-renders

**Problem**: Component keeps re-rendering

**Solutions**:

1. **Memoize callbacks**
   ```typescript
   // Before - creates new function every render
   <Child onClick={() => doSomething()} />
   
   // After - memoized
   const handleClick = useCallback(() => doSomething(), []);
   <Child onClick={handleClick} />
   ```

2. **Memoize values**
   ```typescript
   const expensiveValue = useMemo(() => 
     calculateExpensive(data),
     [data]
   );
   ```

3. **Check useEffect dependencies**
   ```typescript
   // Avoid object/array literals in dependencies
   useEffect(() => {
     // This runs every render!
   }, [{ value }]); // ❌ New object each time
   
   useEffect(() => {
     // This is better
   }, [value]); // ✅ Primitive value
   ```

---

### Context Not Updating

**Problem**: Context value changes don't trigger re-renders

**Solutions**:

1. **Ensure provider wraps components**
   ```tsx
   <AuthProvider>
     <App />  {/* Will receive updates */}
   </AuthProvider>
   ```

2. **Split context by update frequency**
   ```typescript
   // Instead of one large context
   <UserContext.Provider value={{ user, settings, preferences }}>
   
   // Split into multiple contexts
   <UserContext.Provider value={user}>
     <SettingsContext.Provider value={settings}>
       <PreferencesContext.Provider value={preferences}>
   ```

3. **Memoize context value**
   ```typescript
   const value = useMemo(() => ({ user, updateUser }), [user]);
   
   <Context.Provider value={value}>
   ```

---

## Performance Issues

### Slow Initial Load

**Problem**: Application takes long to load

**Solutions**:

1. **Analyze bundle**
   ```bash
   npm run build
   npx vite-bundle-visualizer
   ```

2. **Code split routes**
   ```typescript
   const Dashboard = lazy(() => import('./pages/Dashboard'));
   const Cards = lazy(() => import('./pages/Cards'));
   ```

3. **Optimize images**
   - Use WebP format
   - Implement lazy loading
   - Add proper sizing

4. **Remove unused dependencies**
   ```bash
   npx depcheck
   ```

---

### Slow Re-renders

**Problem**: Component updates are sluggish

**Solutions**:

1. **Use React DevTools Profiler**
   - Record interaction
   - Identify slow components
   - Check why they're rendering

2. **Memoize expensive components**
   ```typescript
   const ExpensiveComponent = memo(({ data }: Props) => {
     // Expensive rendering
   });
   ```

3. **Virtualize long lists**
   ```typescript
   import { useVirtual } from '@tanstack/react-virtual';
   
   const rowVirtualizer = useVirtual({
     size: items.length,
     parentRef,
   });
   ```

---

## Browser-Specific Issues

### Safari Compatibility

**Problem**: Works in Chrome but not Safari

**Solutions**:

1. **Check CSS Grid/Flexbox**
   - Safari has different implementations
   - Test in Safari early

2. **Polyfills for modern features**
   ```bash
   npm install core-js
   ```

3. **Check date handling**
   ```typescript
   // Safari doesn't support all date formats
   new Date('2024-01-01') // ✅ Works
   new Date('01-01-2024') // ❌ Might not work
   ```

---

### iOS Specific Issues

**Problem**: Different behavior on iOS devices

**Solutions**:

1. **Viewport meta tag**
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
   ```

2. **iOS input zoom**
   ```css
   input {
     font-size: 16px; /* Prevents zoom on focus */
   }
   ```

3. **Safe area insets**
   ```css
   .container {
     padding-bottom: env(safe-area-inset-bottom);
   }
   ```

---

## Getting Help

### Before Asking for Help

1. **Check this guide** - Common issues are documented here
2. **Search GitHub issues** - Someone might have had the same problem
3. **Check browser console** - Error messages are helpful
4. **Read error messages carefully** - They often contain the solution

### How to Ask for Help

When reporting an issue, include:

1. **Environment details**
   - OS and version
   - Node version: `node --version`
   - npm version: `npm --version`
   - Browser and version

2. **Steps to reproduce**
   ```
   1. Run npm install
   2. Run npm run dev
   3. Navigate to /cards
   4. Click "Add Card"
   5. Error appears
   ```

3. **Error messages**
   - Full error stack trace
   - Console errors
   - Network errors

4. **What you've tried**
   - List solutions you've attempted
   - Results of each attempt

---

## Additional Resources

- [Vite Troubleshooting](https://vitejs.dev/guide/troubleshooting.html)
- [React Documentation](https://react.dev)
- [TypeScript FAQ](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/reactjs)

---

*Last Updated: September 30, 2025*
