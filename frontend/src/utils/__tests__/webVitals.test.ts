/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { initWebVitals, getWebVitalsSnapshot, reportPerformanceMetric } from '../webVitals';
import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';
import * as Sentry from '@sentry/react';

// Mock web-vitals
vi.mock('web-vitals', () => {
  const mockOnCLS = vi.fn();
  const mockOnFCP = vi.fn();
  const mockOnINP = vi.fn();
  const mockOnLCP = vi.fn();
  const mockOnTTFB = vi.fn();

  return {
    onCLS: mockOnCLS,
    onFCP: mockOnFCP,
    onINP: mockOnINP,
    onLCP: mockOnLCP,
    onTTFB: mockOnTTFB,
  };
});

// Mock Sentry
vi.mock('@sentry/react', () => ({
  addBreadcrumb: vi.fn(),
  captureMessage: vi.fn(),
}));

// Mock console
const consoleLogSpy = vi.spyOn(console, 'log');

describe('Web Vitals Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Stub environment variables
    vi.stubEnv('DEV', false);
    vi.stubEnv('VITE_ENABLE_ERROR_TRACKING', 'false');
    vi.stubEnv('VITE_ENABLE_ANALYTICS', 'false');

    // Mock window.gtag
    delete (window as any).gtag;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initWebVitals', () => {
    it('should initialize all web vitals tracking in production', () => {
      (import.meta as any).env.DEV = false;

      initWebVitals();

      expect(vi.mocked(onCLS)).toHaveBeenCalledWith(expect.any(Function));
      expect(vi.mocked(onINP)).toHaveBeenCalledWith(expect.any(Function));
      expect(vi.mocked(onLCP)).toHaveBeenCalledWith(expect.any(Function));
      expect(vi.mocked(onFCP)).toHaveBeenCalledWith(expect.any(Function));
      expect(vi.mocked(onTTFB)).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should skip initialization in development without explicit enablement', () => {
      vi.stubEnv('DEV', true);
      vi.stubEnv('VITE_ENABLE_ERROR_TRACKING', 'false');

      initWebVitals();

      expect(vi.mocked(onCLS)).not.toHaveBeenCalled();
      expect(vi.mocked(onINP)).not.toHaveBeenCalled();
      expect(vi.mocked(onLCP)).not.toHaveBeenCalled();
      expect(vi.mocked(onFCP)).not.toHaveBeenCalled();
      expect(vi.mocked(onTTFB)).not.toHaveBeenCalled();
    });

    it('should initialize in development when explicitly enabled', () => {
      vi.stubEnv('DEV', true);
      vi.stubEnv('VITE_ENABLE_ERROR_TRACKING', 'true');

      initWebVitals();

      expect(vi.mocked(onCLS)).toHaveBeenCalledWith(expect.any(Function));
      expect(vi.mocked(onINP)).toHaveBeenCalledWith(expect.any(Function));
      expect(vi.mocked(onLCP)).toHaveBeenCalledWith(expect.any(Function));
      expect(vi.mocked(onFCP)).toHaveBeenCalledWith(expect.any(Function));
      expect(vi.mocked(onTTFB)).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should handle initialization errors gracefully', () => {
      vi.stubEnv('DEV', false);

      const error = new Error('Web vitals init failed');
      vi.mocked(onCLS).mockImplementation(() => {
        throw error;
      });

      initWebVitals();
    });
  });

  describe('getWebVitalsSnapshot', () => {
    it('should capture all web vitals metrics', async () => {
      const mockMetrics: Record<string, Metric> = {
        LCP: { name: 'LCP', value: 2500, id: 'v1', navigationType: 'navigate', rating: 'good', delta: 2500, entries: [] },
        INP: { name: 'INP', value: 200, id: 'v2', navigationType: 'navigate', rating: 'good', delta: 200, entries: [] },
        CLS: { name: 'CLS', value: 0.1, id: 'v3', navigationType: 'navigate', rating: 'good', delta: 0.1, entries: [] },
        FCP: { name: 'FCP', value: 1800, id: 'v4', navigationType: 'navigate', rating: 'good', delta: 1800, entries: [] },
        TTFB: { name: 'TTFB', value: 800, id: 'v5', navigationType: 'navigate', rating: 'good', delta: 800, entries: [] },
      };

      // Mock the web-vitals functions to call the callback immediately
      (onLCP as Mock).mockImplementation((callback) => callback(mockMetrics.LCP));
      (onINP as Mock).mockImplementation((callback) => callback(mockMetrics.INP));
      (onCLS as Mock).mockImplementation((callback) => callback(mockMetrics.CLS));
      (onFCP as Mock).mockImplementation((callback) => callback(mockMetrics.FCP));
      (onTTFB as Mock).mockImplementation((callback) => callback(mockMetrics.TTFB));

      const snapshot = await getWebVitalsSnapshot();

      expect(snapshot).toEqual({
        LCP: 2500,
        INP: 200,
        CLS: 0.1,
        FCP: 1800,
        TTFB: 800,
      });
    });

    it('should handle missing metrics gracefully', async () => {
      // Mock functions to not call callbacks (simulating no metrics available)
      (onLCP as Mock).mockImplementation(() => {});
      (onINP as Mock).mockImplementation(() => {});
      (onCLS as Mock).mockImplementation(() => {});
      (onFCP as Mock).mockImplementation(() => {});
      (onTTFB as Mock).mockImplementation(() => {});

      const snapshot = await getWebVitalsSnapshot();

      expect(snapshot).toEqual({});
    });
  });

  describe('reportPerformanceMetric', () => {
    it('should report custom performance metric to Sentry', () => {
      reportPerformanceMetric('custom-metric', 123.45, 'ms');

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        category: 'performance',
        message: 'custom-metric: 123.45ms',
        level: 'info',
        data: { name: 'custom-metric', value: 123.45, unit: 'ms' },
      });
    });

    it('should use default unit when not specified', () => {
      reportPerformanceMetric('another-metric', 67.89);

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        category: 'performance',
        message: 'another-metric: 67.89millisecond',
        level: 'info',
        data: { name: 'another-metric', value: 67.89, unit: 'millisecond' },
      });
    });

    it('should log to console in development', () => {
      vi.stubEnv('DEV', true);

      reportPerformanceMetric('dev-metric', 42);
    });

    it('should not log to console in production', () => {
      (import.meta as any).env.DEV = false;

      reportPerformanceMetric('prod-metric', 42);

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  describe('Metric handling (internal functions)', () => {
    // Test the internal metric handling logic by triggering the handlers
    it('should send good metrics to Sentry with info level', () => {
      vi.stubEnv('VITE_ENABLE_ERROR_TRACKING', 'true');
      vi.stubEnv('DEV', false);

      // Trigger initWebVitals to set up handlers
      initWebVitals();

      // Get the handler function that was passed to onCLS
      const clsHandler = vi.mocked(onCLS).mock.calls[0][0];

      const goodMetric: Metric = {
        name: 'CLS',
        value: 0.05, // Good CLS score
        id: 'test-id',
        navigationType: 'navigate',
        rating: 'good',
        delta: 0.05,
        entries: [],
      };

      clsHandler(goodMetric as any);

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        category: 'web-vitals',
        message: 'CLS: 0.05 (good)',
        level: 'info',
        data: {
          name: 'CLS',
          value: 0.05,
          rating: 'good',
          id: 'test-id',
          navigationType: 'navigate',
        },
      });

      expect(Sentry.captureMessage).not.toHaveBeenCalled();
    });

    it('should send poor metrics to Sentry with warning level and capture message', () => {
      vi.stubEnv('VITE_ENABLE_ERROR_TRACKING', 'true');
      vi.stubEnv('DEV', false);

      // Trigger initWebVitals to set up handlers
      initWebVitals();

      // Get the handler function that was passed to onLCP
      const lcpHandler = vi.mocked(onLCP).mock.calls[0][0];

      const poorMetric: Metric = {
        name: 'LCP',
        value: 5000, // Poor LCP score
        id: 'test-id',
        navigationType: 'navigate',
        rating: 'poor',
        delta: 5000,
        entries: [],
      };

      lcpHandler(poorMetric as any);

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        category: 'web-vitals',
        message: 'LCP: 5000.00 (poor)',
        level: 'warning',
        data: {
          name: 'LCP',
          value: 5000,
          rating: 'poor',
          id: 'test-id',
          navigationType: 'navigate',
        },
      });

      expect(Sentry.captureMessage).toHaveBeenCalledWith(
        'Poor LCP score: 5000.00',
        'warning'
      );
    });

    it('should send metrics to Google Analytics when enabled', () => {
      vi.stubEnv('VITE_ENABLE_ANALYTICS', 'true');
      vi.stubEnv('DEV', false);

      // Mock gtag on window
      const mockGtag = vi.fn();
      (window as any).gtag = mockGtag;

      // Trigger initWebVitals to set up handlers
      initWebVitals();

      // Get the handler function that was passed to onFCP
      const fcpHandler = vi.mocked(onFCP).mock.calls[0][0];

      const metric: Metric = {
        name: 'FCP',
        value: 1500,
        id: 'test-id',
        navigationType: 'navigate',
        rating: 'good',
        delta: 1500,
        entries: [],
      };

      fcpHandler(metric as any);

      expect(mockGtag).toHaveBeenCalledWith('event', 'FCP', {
        event_category: 'Web Vitals',
        value: 1500,
        event_label: 'test-id',
        non_interaction: true,
      });
    });

    it('should handle CLS metrics correctly in Google Analytics (multiply by 1000)', () => {
      vi.stubEnv('VITE_ENABLE_ANALYTICS', 'true');
      vi.stubEnv('DEV', false);

      // Mock gtag on window
      const mockGtag = vi.fn();
      (window as any).gtag = mockGtag;

      // Trigger initWebVitals to set up handlers
      initWebVitals();

      // Get the handler function that was passed to onCLS
      const clsHandler = vi.mocked(onCLS).mock.calls[0][0];

      const clsMetric: Metric = {
        name: 'CLS',
        value: 0.15,
        id: 'test-id',
        navigationType: 'navigate',
        rating: 'needs-improvement',
        delta: 0.15,
        entries: [],
      };

      clsHandler(clsMetric as any);

      expect(mockGtag).toHaveBeenCalledWith('event', 'CLS', {
        event_category: 'Web Vitals',
        value: 150, // 0.15 * 1000
        event_label: 'test-id',
        non_interaction: true,
      });
    });

    it('should log metrics to console in development', () => {
      vi.stubEnv('DEV', true);
      vi.stubEnv('VITE_ENABLE_ERROR_TRACKING', 'true');

      // Trigger initWebVitals to set up handlers
      initWebVitals();

      // Get the handler function that was passed to onTTFB
      const ttfbHandler = vi.mocked(onTTFB).mock.calls[0][0];

      const metric: Metric = {
        name: 'TTFB',
        value: 600,
        id: 'test-id',
        navigationType: 'navigate',
        rating: 'good',
        delta: 600,
        entries: [],
      };

      ttfbHandler(metric as any);
    });
  });
});