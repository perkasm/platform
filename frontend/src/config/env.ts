/**
 * Environment Configuration
 * 
 * Validates and exports environment variables with type safety.
 * All environment variables must be prefixed with VITE_ to be exposed to the client.
 */

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly VITE_ENABLE_ANALYTICS?: string;
  readonly VITE_ENABLE_ERROR_TRACKING?: string;
  readonly VITE_ENV?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface EnvConfig {
  apiUrl: string;
  googleClientId: string;
  enableAnalytics: boolean;
  enableErrorTracking: boolean;
  environment: 'development' | 'production' | 'test';
}

/**
 * Gets an optional environment variable with a default value
 */
function getOptionalEnv(key: keyof ImportMetaEnv, defaultValue: string): string {
  return import.meta.env[key] || defaultValue;
}

/**
 * Gets a boolean environment variable
 */
function getBooleanEnv(key: keyof ImportMetaEnv, defaultValue: boolean): boolean {
  const value = import.meta.env[key];
  if (value === undefined || value === '') {
    return defaultValue;
  }
  return value === 'true' || value === '1';
}

/**
 * Validates the API URL format
 */
function validateApiUrl(url: string): string {
  try {
    new URL(url);
    return url;
  } catch (error) {
    throw new Error(`Invalid API URL format: ${url}`);
  }
}

/**
 * Load and validate environment configuration
 */
function loadEnvConfig(): EnvConfig {
  const apiUrl = validateApiUrl(getOptionalEnv('VITE_API_URL', 'http://localhost:8001/api/v1'));
  const googleClientId = getOptionalEnv('VITE_GOOGLE_CLIENT_ID', '');
  const enableAnalytics = getBooleanEnv('VITE_ENABLE_ANALYTICS', false);
  const enableErrorTracking = getBooleanEnv('VITE_ENABLE_ERROR_TRACKING', false);
  const envValue = getOptionalEnv('VITE_ENV', 'development');
  
  // Validate environment value
  const validEnvironments = ['development', 'production', 'test'];
  const environment = validEnvironments.includes(envValue) 
    ? envValue as EnvConfig['environment']
    : 'development';

  return {
    apiUrl,
    googleClientId,
    enableAnalytics,
    enableErrorTracking,
    environment,
  };
}

// Export the validated configuration
export const env = loadEnvConfig();

// Export utility to check if we're in production
export const isProduction = env.environment === 'production';
export const isDevelopment = env.environment === 'development';
export const isTest = env.environment === 'test';

// Log configuration in development (excluding sensitive data)
if (isDevelopment) {
  console.log('Environment Configuration:', {
    apiUrl: env.apiUrl,
    environment: env.environment,
    enableAnalytics: env.enableAnalytics,
    enableErrorTracking: env.enableErrorTracking,
    hasGoogleClientId: !!env.googleClientId,
  });
}
