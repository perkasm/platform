/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { registerServiceWorker, unregisterServiceWorker } from '../service-worker';

// Mock navigator.serviceWorker
const mockServiceWorker = {
  register: vi.fn(),
  ready: Promise.resolve({} as any),
  addEventListener: vi.fn(),
  controller: null as any,
};

const mockRegistration = {
  scope: '/test-scope',
  update: vi.fn(),
  addEventListener: vi.fn(),
  unregister: vi.fn(),
  installing: null as any,
};

// Setup global mocks
Object.defineProperty(window, 'navigator', {
  value: {
    serviceWorker: mockServiceWorker,
  },
  writable: true,
});

describe('Service Worker Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mocks
    mockServiceWorker.register.mockReset();
    mockServiceWorker.addEventListener.mockReset();
    mockServiceWorker.controller = null;

    mockRegistration.update.mockReset();
    mockRegistration.addEventListener.mockReset();
    mockRegistration.unregister.mockReset();
    mockRegistration.installing = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('registerServiceWorker', () => {
    it('should not register service worker in development environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      registerServiceWorker();

      expect(mockServiceWorker.register).not.toHaveBeenCalled();

      // Restore original env
      process.env.NODE_ENV = originalEnv;
    });

    it('should register service worker in production environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      mockServiceWorker.register.mockResolvedValue(mockRegistration);

      registerServiceWorker();

      // Trigger load event to initiate registration
      window.dispatchEvent(new Event('load'));

      expect(mockServiceWorker.register).toHaveBeenCalledWith('/sw.js');

      // Restore original env
      process.env.NODE_ENV = originalEnv;
    });

    it('should add event listeners for service worker lifecycle', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      mockServiceWorker.register.mockResolvedValue(mockRegistration);

      registerServiceWorker();

      // Trigger load event
      window.dispatchEvent(new Event('load'));

      expect(mockServiceWorker.addEventListener).toHaveBeenCalledWith('controllerchange', expect.any(Function));

      // Restore original env
      process.env.NODE_ENV = originalEnv;
    });

    it('should handle service worker registration promise resolution', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      mockServiceWorker.register.mockResolvedValue(mockRegistration);

      registerServiceWorker();

      // Trigger load event
      window.dispatchEvent(new Event('load'));

      // Wait for the promise chain to complete
      await new Promise(resolve => setTimeout(resolve, 10));

      // Verify that registration event listeners are set up
      expect(mockRegistration.addEventListener).toHaveBeenCalledWith('updatefound', expect.any(Function));

      // Restore original env
      process.env.NODE_ENV = originalEnv;
    });

    it('should handle service worker registration failure', async () => {
      const originalEnv = process.env.NODE_ENV;
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      process.env.NODE_ENV = 'production';

      const testError = new Error('Registration failed');
      mockServiceWorker.register.mockRejectedValue(testError);

      registerServiceWorker();

      // Trigger load event
      window.dispatchEvent(new Event('load'));

      // Wait for the promise chain to complete
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(consoleSpy).toHaveBeenCalledWith('Service Worker registration failed:', testError);

      // Restore original env and console
      process.env.NODE_ENV = originalEnv;
      consoleSpy.mockRestore();
    });

    it('should handle controller change event', () => {
      const originalEnv = process.env.NODE_ENV;
      const originalLocation = window.location;
      
      // Mock window.location completely
      const mockLocation = {
        ...originalLocation,
        reload: vi.fn(),
        href: 'http://localhost:3000',
        pathname: '/',
        search: '',
        hash: '',
      };
      
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        configurable: true,
      });
      
      process.env.NODE_ENV = 'production';

      mockServiceWorker.register.mockResolvedValue(mockRegistration);

      registerServiceWorker();

      // Trigger load event
      window.dispatchEvent(new Event('load'));

      // Get the controllerchange event listener
      const controllerChangeCall = mockServiceWorker.addEventListener.mock.calls.find(
        call => call[0] === 'controllerchange'
      );

      expect(controllerChangeCall).toBeDefined();

      if (controllerChangeCall) {
        // Trigger the controllerchange event
        controllerChangeCall[1]();
      }

      expect(mockLocation.reload).toHaveBeenCalled();

      // Restore original location
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        configurable: true,
      });
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('unregisterServiceWorker', () => {
    it('should unregister service worker successfully', async () => {
      // Mock the ready property as a resolved Promise
      Object.defineProperty(mockServiceWorker, 'ready', {
        value: Promise.resolve(mockRegistration),
        writable: true,
      });

      unregisterServiceWorker();

      // Wait for the ready promise to resolve
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockRegistration.unregister).toHaveBeenCalled();
    });

    it('should work when service worker is not supported', () => {
      // Temporarily remove serviceWorker from navigator
      const originalNavigator = window.navigator;
      Object.defineProperty(window, 'navigator', {
        value: {},
        writable: true,
      });

      expect(() => unregisterServiceWorker()).not.toThrow();

      // Restore navigator
      Object.defineProperty(window, 'navigator', {
        value: originalNavigator,
        writable: true,
      });
    });

    it('should handle unregistration failure', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const testError = new Error('Unregistration failed');

      // Mock the ready property as a rejected Promise
      Object.defineProperty(mockServiceWorker, 'ready', {
        value: Promise.reject(testError),
        writable: true,
      });

      unregisterServiceWorker();

      // Wait for the ready promise to reject
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(consoleSpy).toHaveBeenCalledWith('Service Worker unregistration failed:', testError);

      consoleSpy.mockRestore();
    });
  });
});