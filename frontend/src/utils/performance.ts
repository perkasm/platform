/**
 * Performance Monitoring Utilities
 * Tracks and reports performance metrics for optimization
 */

import * as Sentry from '@sentry/react';

/**
 * Performance metrics interface
 */
export interface PerformanceMetrics {
  name: string;
  duration: number;
  startTime: number;
  endTime: number;
  metadata?: Record<string, unknown>;
}

/**
 * Performance tracker for measuring operation duration
 */
export class PerformanceTracker {
  private startTime: number;
  private name: string;
  private metadata: Record<string, unknown>;

  constructor(name: string, metadata: Record<string, unknown> = {}) {
    this.name = name;
    this.metadata = metadata;
    this.startTime = performance.now();
  }

  /**
   * End tracking and return metrics
   */
  end(): PerformanceMetrics {
    const endTime = performance.now();
    const duration = endTime - this.startTime;

    const metrics: PerformanceMetrics = {
      name: this.name,
      duration,
      startTime: this.startTime,
      endTime,
      metadata: this.metadata,
    };

    // Log slow operations (>1 second)
    if (duration > 1000) {
      console.warn(`Slow operation detected: ${this.name} took ${duration.toFixed(2)}ms`, this.metadata);
      
      // Report to Sentry
      Sentry.captureMessage(
        `Slow operation: ${this.name} took ${duration.toFixed(2)}ms`,
        'warning'
      );
    }

    return metrics;
  }
}

/**
 * Measure async function performance
 */
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> {
  const tracker = new PerformanceTracker(name, metadata);
  try {
    const result = await fn();
    tracker.end();
    return result;
  } catch (error) {
    tracker.end();
    throw error;
  }
}

/**
 * Measure sync function performance
 */
export function measure<T>(
  name: string,
  fn: () => T,
  metadata?: Record<string, unknown>
): T {
  const tracker = new PerformanceTracker(name, metadata);
  try {
    const result = fn();
    tracker.end();
    return result;
  } catch (error) {
    tracker.end();
    throw error;
  }
}

/**
 * React component render tracking hook
 */
export function useRenderTracking(componentName: string, props?: Record<string, unknown>) {
  const renderCount = React.useRef(0);
  
  React.useEffect(() => {
    renderCount.current += 1;
    
    // Warn on excessive re-renders
    if (renderCount.current > 10) {
      console.warn(
        `Component ${componentName} has re-rendered ${renderCount.current} times`,
        props
      );
    }
  });
}

/**
 * Log component mount/unmount for debugging
 */
export function useComponentLifecycle(componentName: string) {
  React.useEffect(() => {
    console.debug(`[${componentName}] Mounted`);
    
    return () => {
      console.debug(`[${componentName}] Unmounted`);
    };
  }, [componentName]);
}

/**
 * Track lazy loaded component performance
 */
export function trackLazyLoad(componentName: string) {
  const tracker = new PerformanceTracker(`Lazy load: ${componentName}`);
  
  return () => {
    tracker.end();
  };
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Get current performance metrics from the browser
 */
export function getPerformanceMetrics() {
  if (typeof window === 'undefined' || !window.performance) {
    return null;
  }

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const paint = performance.getEntriesByType('paint');

  return {
    // Navigation timing
    dns: navigation ? navigation.domainLookupEnd - navigation.domainLookupStart : 0,
    tcp: navigation ? navigation.connectEnd - navigation.connectStart : 0,
    ttfb: navigation ? navigation.responseStart - navigation.requestStart : 0,
    download: navigation ? navigation.responseEnd - navigation.responseStart : 0,
    domInteractive: navigation ? navigation.domInteractive - navigation.fetchStart : 0,
    domComplete: navigation ? navigation.domComplete - navigation.fetchStart : 0,
    loadComplete: navigation ? navigation.loadEventEnd - navigation.fetchStart : 0,

    // Paint timing
    firstPaint: paint.find((p) => p.name === 'first-paint')?.startTime || 0,
    firstContentfulPaint: paint.find((p) => p.name === 'first-contentful-paint')?.startTime || 0,
  };
}

/**
 * Report performance metrics to console (development only)
 */
export function reportPerformanceMetrics() {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const metrics = getPerformanceMetrics();
  if (!metrics) {
    return;
  }

  console.group('Performance Metrics');
  console.log('DNS Lookup:', `${metrics.dns.toFixed(2)}ms`);
  console.log('TCP Connection:', `${metrics.tcp.toFixed(2)}ms`);
  console.log('Time to First Byte:', `${metrics.ttfb.toFixed(2)}ms`);
  console.log('Download Time:', `${metrics.download.toFixed(2)}ms`);
  console.log('DOM Interactive:', `${metrics.domInteractive.toFixed(2)}ms`);
  console.log('DOM Complete:', `${metrics.domComplete.toFixed(2)}ms`);
  console.log('Load Complete:', `${metrics.loadComplete.toFixed(2)}ms`);
  console.log('First Paint:', `${metrics.firstPaint.toFixed(2)}ms`);
  console.log('First Contentful Paint:', `${metrics.firstContentfulPaint.toFixed(2)}ms`);
  console.groupEnd();
}

// Import React for hooks
import * as React from 'react';
