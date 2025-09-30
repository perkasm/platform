# Performance Optimization Guide

**PerkAsm Platform Frontend**  
*Performance Best Practices & Implementation Guide*

---

## Overview

This document outlines the performance optimizations implemented in the PerkAsm frontend application and provides guidelines for maintaining optimal performance.

## Table of Contents

1. [Bundle Optimization](#bundle-optimization)
2. [Code Splitting](#code-splitting)
3. [React Performance](#react-performance)
4. [Image Optimization](#image-optimization)
5. [Caching Strategy](#caching-strategy)
6. [Performance Monitoring](#performance-monitoring)
7. [Best Practices](#best-practices)

---

## Bundle Optimization

### Implemented Optimizations

#### 1. **Code Splitting & Manual Chunks**

The build is configured to split vendor libraries into separate chunks for better caching:

```typescript
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        'ui-vendor': ['@radix-ui/react-*'],
        'query-vendor': ['@tanstack/react-query'],
        'chart-vendor': ['recharts'],
      },
    },
  },
}
```

**Benefits:**
- Vendor code changes less frequently, improving cache hit rates
- Parallel loading of chunks for faster initial load
- Better tree-shaking and dead code elimination

#### 2. **Bundle Analysis**

Analyze bundle size and composition:

```bash
npm run build:analyze
```

This generates a visual representation of the bundle at `dist/stats.html`.

**What to look for:**
- Large dependencies that could be replaced
- Duplicate code across chunks
- Unused code that can be removed
- Opportunities for lazy loading

### Bundle Size Targets

- **Total Bundle Size:** < 500 KB (gzipped)
- **Initial Load:** < 200 KB (gzipped)
- **Largest Chunk:** < 150 KB (gzipped)

---

## Code Splitting

### React.lazy() for Route-Based Splitting

Lazy load route components for faster initial page load:

```typescript
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Cards = lazy(() => import('./pages/Cards'));
const Chat = lazy(() => import('./pages/Chat'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cards" element={<Cards />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </Suspense>
  );
}
```

### Dynamic Imports for Heavy Components

Load heavy components only when needed:

```typescript
// Load chart library only when chart is visible
const loadChartComponent = async () => {
  const { ResponsiveContainer, LineChart } = await import('recharts');
  return { ResponsiveContainer, LineChart };
};
```

---

## React Performance

### 1. **React.memo()**

Prevent unnecessary re-renders of pure components:

```typescript
import { memo } from 'react';

const CardItem = memo(({ card }: { card: Card }) => {
  return (
    <div className="card">
      <h3>{card.name}</h3>
      <p>{card.description}</p>
    </div>
  );
});
```

**Use when:**
- Component receives the same props frequently
- Component is expensive to render
- Component is used in lists

### 2. **useCallback()**

Memoize callback functions to prevent child re-renders:

```typescript
import { useCallback } from 'react';

function ParentComponent() {
  const handleClick = useCallback((id: string) => {
    console.log('Clicked:', id);
  }, []); // Empty deps - function never changes

  return <ChildComponent onClick={handleClick} />;
}
```

**Use when:**
- Passing callbacks to memoized child components
- Callback is used as a dependency in other hooks
- Creating event handlers in loops

### 3. **useMemo()**

Memoize expensive calculations:

```typescript
import { useMemo } from 'react';

function DataTable({ data }: { data: Item[] }) {
  const sortedData = useMemo(() => {
    return data.sort((a, b) => a.value - b.value);
  }, [data]);

  return <Table data={sortedData} />;
}
```

**Use when:**
- Expensive computations (sorting, filtering large arrays)
- Complex object transformations
- Derived state calculations

### 4. **Virtual Lists**

Use virtual scrolling for long lists:

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef} className="h-96 overflow-auto">
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div key={virtualItem.key} style={{
            transform: `translateY(${virtualItem.start}px)`,
          }}>
            {items[virtualItem.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 5. **Render Tracking (Development)**

Track component renders in development:

```typescript
import { useRenderTracking } from '@/utils/performance';

function MyComponent(props) {
  useRenderTracking('MyComponent', props);
  // Component logic
}
```

---

## Image Optimization

### 1. **Lazy Loading Images**

Use the `OptimizedImage` component for automatic lazy loading:

```typescript
import { OptimizedImage } from '@/utils/image-optimization';

function ProductCard({ product }) {
  return (
    <OptimizedImage
      src={product.imageUrl}
      alt={product.name}
      placeholder={product.thumbnailUrl}
      className="w-full h-64 object-cover"
    />
  );
}
```

**Features:**
- Intersection Observer for lazy loading
- Blur-up effect with placeholder
- Automatic loading state management

### 2. **Responsive Images**

Generate responsive image srcsets:

```typescript
import { generateSrcSet } from '@/utils/image-optimization';

<img
  src={imageUrl}
  srcSet={generateSrcSet(imageUrl)}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  alt="Product"
/>
```

### 3. **Image Preloading**

Preload critical images:

```typescript
import { preloadImages } from '@/utils/image-optimization';

useEffect(() => {
  preloadImages([
    '/hero-image.jpg',
    '/logo.png',
    '/banner.jpg',
  ]);
}, []);
```

### Image Guidelines

- **Format:** Use WebP with JPEG/PNG fallback
- **Compression:** 80-85% quality for photos
- **Sizing:** Serve images at display size (2x for retina)
- **Lazy Loading:** Load images 50px before viewport
- **Critical Images:** Preload above-the-fold images

---

## Caching Strategy

### Service Worker Implementation

The app uses a service worker for intelligent caching:

**Cache Strategy:**
1. **Precache:** Static assets on service worker install
2. **Runtime Cache:** Cache responses on first request
3. **Stale-While-Revalidate:** Serve cached, update in background
4. **Network First:** API requests always fetch fresh

**Files:**
- `/public/sw.js` - Service worker implementation
- `/src/utils/service-worker.ts` - Registration logic

### Cache Headers (nginx)

```nginx
# Long-term caching for static assets (1 year)
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}

# No caching for HTML
location / {
  add_header Cache-Control "no-cache, no-store, must-revalidate";
}
```

### React Query Caching

Optimize data fetching with React Query:

```typescript
import { useQuery } from '@tanstack/react-query';

function useCards() {
  return useQuery({
    queryKey: ['cards'],
    queryFn: fetchCards,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}
```

---

## Performance Monitoring

### Web Vitals Tracking

Core Web Vitals are automatically tracked:

- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1
- **FCP (First Contentful Paint):** < 1.8s
- **TTFB (Time to First Byte):** < 600ms

### Performance Utilities

#### Track Async Operations

```typescript
import { measureAsync } from '@/utils/performance';

async function loadData() {
  return measureAsync('loadData', async () => {
    const response = await fetch('/api/data');
    return response.json();
  });
}
```

#### Track Sync Operations

```typescript
import { measure } from '@/utils/performance';

function expensiveCalculation(data: number[]) {
  return measure('expensiveCalculation', () => {
    return data.reduce((sum, n) => sum + n, 0);
  });
}
```

#### Performance Tracker

```typescript
import { PerformanceTracker } from '@/utils/performance';

function MyComponent() {
  useEffect(() => {
    const tracker = new PerformanceTracker('MyComponent mount');
    
    // Do work
    
    const metrics = tracker.end();
    console.log(`Component mounted in ${metrics.duration}ms`);
  }, []);
}
```

### Development Tools

#### View Performance in Browser

```bash
# Run development server
npm run dev

# Open DevTools > Performance tab
# Record page load
# Analyze flame graph and metrics
```

#### Lighthouse Audit

```bash
# Build production version
npm run build

# Preview production build
npm run preview

# Run Lighthouse audit in Chrome DevTools
# Target scores:
# - Performance: > 90
# - Accessibility: > 90
# - Best Practices: > 90
# - SEO: > 90
```

---

## Best Practices

### Do's ✅

1. **Use React.memo() for pure components**
   ```typescript
   const ListItem = memo(({ item }) => <div>{item.name}</div>);
   ```

2. **Memoize callbacks passed to children**
   ```typescript
   const handleClick = useCallback(() => {...}, [deps]);
   ```

3. **Lazy load routes and heavy components**
   ```typescript
   const HeavyComponent = lazy(() => import('./Heavy'));
   ```

4. **Use virtual scrolling for long lists**
   ```typescript
   <VirtualList items={manyItems} />
   ```

5. **Optimize images with lazy loading**
   ```typescript
   <OptimizedImage src={url} alt="..." />
   ```

6. **Code split vendor libraries**
   - Keep vendor chunks separate
   - Update independently of app code

7. **Monitor bundle size regularly**
   ```bash
   npm run build:analyze
   ```

### Don'ts ❌

1. **Don't use inline objects/arrays as props**
   ```typescript
   // ❌ Bad
   <Component data={{ key: 'value' }} />
   
   // ✅ Good
   const data = useMemo(() => ({ key: 'value' }), []);
   <Component data={data} />
   ```

2. **Don't create functions inside render**
   ```typescript
   // ❌ Bad
   <button onClick={() => handleClick(id)}>
   
   // ✅ Good
   const onClick = useCallback(() => handleClick(id), [id]);
   <button onClick={onClick}>
   ```

3. **Don't use index as key in dynamic lists**
   ```typescript
   // ❌ Bad
   {items.map((item, i) => <div key={i}>{item}</div>)}
   
   // ✅ Good
   {items.map(item => <div key={item.id}>{item}</div>)}
   ```

4. **Don't fetch data in render**
   ```typescript
   // ❌ Bad
   function Component() {
     const data = fetchData(); // Synchronous in render
   }
   
   // ✅ Good
   function Component() {
     const { data } = useQuery(['key'], fetchData);
   }
   ```

5. **Don't overuse useMemo/useCallback**
   - Only for expensive computations
   - Only when passed to memoized components
   - Profile before optimizing

### Performance Checklist

Before deploying:

- [ ] Run bundle analysis (`npm run build:analyze`)
- [ ] Check bundle size is under targets
- [ ] Run Lighthouse audit (score > 90)
- [ ] Test on slow 3G network
- [ ] Verify images lazy load correctly
- [ ] Check for unnecessary re-renders
- [ ] Validate service worker works offline
- [ ] Test on low-end devices
- [ ] Monitor Core Web Vitals
- [ ] Review React DevTools Profiler

---

## Performance Targets

### Load Time

- **Time to Interactive (TTI):** < 3.5s
- **Speed Index:** < 3.0s
- **Total Blocking Time (TBT):** < 200ms

### Bundle Size

- **Initial JS:** < 200 KB (gzipped)
- **Total JS:** < 500 KB (gzipped)
- **CSS:** < 50 KB (gzipped)

### Runtime

- **Re-renders per interaction:** < 5
- **Frame rate:** 60 FPS
- **Memory usage:** < 50 MB

---

## Troubleshooting

### Large Bundle Size

1. Run bundle analyzer: `npm run build:analyze`
2. Identify large dependencies
3. Consider alternatives or lazy loading
4. Remove unused code
5. Use tree-shaking friendly imports

### Slow Rendering

1. Use React DevTools Profiler
2. Identify components with many renders
3. Add React.memo() to pure components
4. Memoize callbacks and values
5. Use virtual scrolling for lists

### Memory Leaks

1. Check for event listeners not cleaned up
2. Cancel subscriptions in useEffect cleanup
3. Clear timers in cleanup functions
4. Avoid circular references
5. Use Chrome DevTools Memory profiler

---

## Resources

- [Web Vitals](https://web.dev/vitals/)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Vite Performance](https://vitejs.dev/guide/performance.html)
- [Bundle Analysis](https://github.com/btd/rollup-plugin-visualizer)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

---

*Last Updated: September 30, 2025*
