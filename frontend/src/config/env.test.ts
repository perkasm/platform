import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('env configuration', () => {
  beforeEach(() => {
    // Clear the module cache to reload env config with new values
    vi.resetModules();
  });

  it('should load default configuration when no env variables are set', async () => {
    vi.stubEnv('VITE_API_URL', '');
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', '');
    vi.stubEnv('VITE_ENABLE_ANALYTICS', '');
    vi.stubEnv('VITE_ENABLE_ERROR_TRACKING', '');
    vi.stubEnv('VITE_ENV', '');

    const { env } = await import('@/config/env');

    expect(env.apiUrl).toBe('http://localhost:8001/api/v1');
    expect(env.googleClientId).toBe('');
    expect(env.enableAnalytics).toBe(false);
    expect(env.enableErrorTracking).toBe(false);
    expect(env.environment).toBe('development');
  });

  it('should load custom API URL when provided', async () => {
    vi.stubEnv('VITE_API_URL', 'https://api.example.com/v1');

    const { env } = await import('@/config/env');

    expect(env.apiUrl).toBe('https://api.example.com/v1');
  });

  it('should throw error for invalid API URL', async () => {
    vi.stubEnv('VITE_API_URL', 'not-a-valid-url');

    await expect(async () => {
      await import('@/config/env');
    }).rejects.toThrow('Invalid API URL format');
  });

  it('should parse boolean environment variables correctly', async () => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:8001/api/v1');
    vi.stubEnv('VITE_ENABLE_ANALYTICS', 'true');
    vi.stubEnv('VITE_ENABLE_ERROR_TRACKING', '1');

    const { env } = await import('@/config/env');

    expect(env.enableAnalytics).toBe(true);
    expect(env.enableErrorTracking).toBe(true);
  });

  it('should handle false boolean values', async () => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:8001/api/v1');
    vi.stubEnv('VITE_ENABLE_ANALYTICS', 'false');
    vi.stubEnv('VITE_ENABLE_ERROR_TRACKING', '0');

    const { env } = await import('@/config/env');

    expect(env.enableAnalytics).toBe(false);
    expect(env.enableErrorTracking).toBe(false);
  });

  it('should validate environment value', async () => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:8001/api/v1');
    vi.stubEnv('VITE_ENV', 'production');

    const { env } = await import('@/config/env');

    expect(env.environment).toBe('production');
  });

  it('should default to development for invalid environment value', async () => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:8001/api/v1');
    vi.stubEnv('VITE_ENV', 'invalid-env');

    const { env } = await import('@/config/env');

    expect(env.environment).toBe('development');
  });

  it('should export environment check utilities', async () => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:8001/api/v1');
    vi.stubEnv('VITE_ENV', 'production');

    const { isProduction, isDevelopment, isTest } = await import('@/config/env');

    expect(isProduction).toBe(true);
    expect(isDevelopment).toBe(false);
    expect(isTest).toBe(false);
  });

  it('should identify test environment', async () => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:8001/api/v1');
    vi.stubEnv('VITE_ENV', 'test');

    const { isProduction, isDevelopment, isTest } = await import('@/config/env');

    expect(isProduction).toBe(false);
    expect(isDevelopment).toBe(false);
    expect(isTest).toBe(true);
  });

  it('should load Google Client ID when provided', async () => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:8001/api/v1');
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'test-google-client-id-123');

    const { env } = await import('@/config/env');

    expect(env.googleClientId).toBe('test-google-client-id-123');
  });
});
