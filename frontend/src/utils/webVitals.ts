import { onCLS, onFCP, onINP, onLCP, onTTFB, Metric } from "web-vitals";
import * as Sentry from "@sentry/react";

/**
 * Web Vitals metrics thresholds
 * Based on Google's Core Web Vitals recommendations
 */
const THRESHOLDS = {
  // Largest Contentful Paint (LCP) - measures loading performance
  LCP: { good: 2500, needsImprovement: 4000 },
  
  // Interaction to Next Paint (INP) - measures interactivity (replaces FID)
  INP: { good: 200, needsImprovement: 500 },
  
  // Cumulative Layout Shift (CLS) - measures visual stability
  CLS: { good: 0.1, needsImprovement: 0.25 },
  
  // First Contentful Paint (FCP) - measures perceived load speed
  FCP: { good: 1800, needsImprovement: 3000 },
  
  // Time to First Byte (TTFB) - measures connection and server responsiveness
  TTFB: { good: 800, needsImprovement: 1800 },
};

/**
 * Get rating for a metric based on its value
 */
function getRating(
  metricName: keyof typeof THRESHOLDS,
  value: number
): "good" | "needs-improvement" | "poor" {
  const threshold = THRESHOLDS[metricName];
  if (value <= threshold.good) return "good";
  if (value <= threshold.needsImprovement) return "needs-improvement";
  return "poor";
}

/**
 * Send metric to Sentry for monitoring
 */
function sendToSentry(metric: Metric): void {
  // Get rating for the metric
  const rating = getRating(
    metric.name as keyof typeof THRESHOLDS,
    metric.value
  );

  // Add metric as breadcrumb for context
  Sentry.addBreadcrumb({
    category: "web-vitals",
    message: `${metric.name}: ${metric.value.toFixed(2)} (${rating})`,
    level: rating === "poor" ? "warning" : "info",
    data: {
      name: metric.name,
      value: metric.value,
      rating,
      id: metric.id,
      navigationType: metric.navigationType,
    },
  });

  // Capture as event for poor metrics
  if (rating === "poor") {
    Sentry.captureMessage(
      `Poor ${metric.name} score: ${metric.value.toFixed(2)}`,
      "warning"
    );
  }

  // Log to console in development
  if (import.meta.env.DEV) {
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: metric.value.toFixed(2),
      rating,
      id: metric.id,
    });
  }
}

/**
 * Send metric to Google Analytics (if enabled)
 */
function sendToAnalytics(metric: Metric): void {
  // Check if Google Analytics is available
  if (typeof window !== "undefined" && "gtag" in window) {
    const gtag = (window as unknown as { gtag: (...args: unknown[]) => void }).gtag;
    
    gtag("event", metric.name, {
      event_category: "Web Vitals",
      value: Math.round(
        metric.name === "CLS" ? metric.value * 1000 : metric.value
      ),
      event_label: metric.id,
      non_interaction: true,
    });
  }
}

/**
 * Handle metric reporting
 */
function handleMetric(metric: Metric): void {
  // Always send to Sentry if error tracking is enabled
  if (import.meta.env.VITE_ENABLE_ERROR_TRACKING === "true") {
    sendToSentry(metric);
  }

  // Send to analytics if enabled
  if (import.meta.env.VITE_ENABLE_ANALYTICS === "true") {
    sendToAnalytics(metric);
  }
}

/**
 * Initialize Web Vitals tracking
 * Call this function in your main application entry point
 */
export function initWebVitals(): void {
  // Don't track in development unless explicitly enabled
  if (
    import.meta.env.DEV &&
    import.meta.env.VITE_ENABLE_ERROR_TRACKING !== "true"
  ) {
    console.log("Web Vitals tracking disabled in development");
    return;
  }

  try {
    // Core Web Vitals
    onCLS(handleMetric); // Cumulative Layout Shift
    onINP(handleMetric); // Interaction to Next Paint
    onLCP(handleMetric); // Largest Contentful Paint

    // Additional metrics
    onFCP(handleMetric); // First Contentful Paint
    onTTFB(handleMetric); // Time to First Byte

    console.log("Web Vitals tracking initialized");
  } catch (error) {
    console.error("Failed to initialize Web Vitals:", error);
  }
}

/**
 * Get current Web Vitals snapshot (useful for debugging)
 */
export async function getWebVitalsSnapshot(): Promise<{
  LCP?: number;
  INP?: number;
  CLS?: number;
  FCP?: number;
  TTFB?: number;
}> {
  const metrics: Record<string, number> = {};

  const captureMetric = (metric: Metric) => {
    metrics[metric.name] = metric.value;
  };

  await Promise.all([
    new Promise<void>((resolve) => {
      onLCP(captureMetric);
      resolve();
    }),
    new Promise<void>((resolve) => {
      onINP(captureMetric);
      resolve();
    }),
    new Promise<void>((resolve) => {
      onCLS(captureMetric);
      resolve();
    }),
    new Promise<void>((resolve) => {
      onFCP(captureMetric);
      resolve();
    }),
    new Promise<void>((resolve) => {
      onTTFB(captureMetric);
      resolve();
    }),
  ]);

  return metrics;
}

/**
 * Report custom performance metrics
 */
export function reportPerformanceMetric(
  name: string,
  value: number,
  unit: string = "millisecond"
): void {
  // Send to Sentry
  Sentry.addBreadcrumb({
    category: "performance",
    message: `${name}: ${value.toFixed(2)}${unit}`,
    level: "info",
    data: { name, value, unit },
  });

  // Log in development
  if (import.meta.env.DEV) {
    console.log(`[Performance] ${name}:`, { value, unit });
  }
}
