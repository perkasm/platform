import { ApiError } from '@/services/api';

export interface RetryConfig {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryableStatuses?: number[];
  onRetry?: (attempt: number, error: Error) => void;
}

const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffFactor: 2,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
  onRetry: () => {},
};

/**
 * Sleep for a specified number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate delay with exponential backoff
 */
function calculateDelay(
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  backoffFactor: number
): number {
  const delay = Math.min(initialDelay * Math.pow(backoffFactor, attempt), maxDelay);
  // Add jitter (random variation) to prevent thundering herd
  const jitter = delay * 0.1 * Math.random();
  return delay + jitter;
}

/**
 * Check if an error is retryable
 */
function isRetryableError(error: Error, retryableStatuses: number[]): boolean {
  if (error instanceof ApiError && error.status) {
    return retryableStatuses.includes(error.status);
  }

  // Network errors are retryable
  if (error.message.includes('Network Error') || error.message.includes('timeout')) {
    return true;
  }

  return false;
}

/**
 * Retry a function with exponential backoff
 * 
 * @param fn - The async function to retry
 * @param config - Retry configuration
 * @returns The result of the function
 * @throws The last error if all retries fail
 * 
 * @example
 * ```ts
 * const data = await retryWithBackoff(
 *   () => get('/api/data'),
 *   { maxRetries: 3, initialDelay: 1000 }
 * );
 * ```
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const {
    maxRetries,
    initialDelay,
    maxDelay,
    backoffFactor,
    retryableStatuses,
    onRetry,
  } = { ...DEFAULT_RETRY_CONFIG, ...config };

  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry if it's the last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Don't retry if error is not retryable
      if (!isRetryableError(lastError, retryableStatuses)) {
        throw lastError;
      }

      // Calculate delay and notify
      const delay = calculateDelay(attempt, initialDelay, maxDelay, backoffFactor);
      onRetry(attempt + 1, lastError);

      // Wait before retrying
      await sleep(delay);
    }
  }

  throw lastError!;
}

/**
 * Create a retry wrapper for API calls
 */
export function createRetryableRequest<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  config?: RetryConfig
): T {
  return ((...args: Parameters<T>) => {
    return retryWithBackoff(() => fn(...args), config);
  }) as T;
}

/**
 * Error notification helper
 */
export interface ErrorNotificationConfig {
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Handle and format API errors for user display
 */
export function formatApiError(error: Error): ErrorNotificationConfig {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
        return {
          title: 'Invalid Request',
          description: error.message || 'Please check your input and try again.',
        };
      case 401:
        return {
          title: 'Authentication Required',
          description: 'Please sign in to continue.',
        };
      case 403:
        return {
          title: 'Access Denied',
          description: "You don't have permission to perform this action.",
        };
      case 404:
        return {
          title: 'Not Found',
          description: 'The requested resource could not be found.',
        };
      case 429:
        return {
          title: 'Too Many Requests',
          description: 'Please wait a moment before trying again.',
        };
      case 500:
      case 502:
      case 503:
      case 504:
        return {
          title: 'Server Error',
          description: 'Something went wrong on our end. Please try again later.',
        };
      default:
        return {
          title: 'Error',
          description: error.message || 'An unexpected error occurred.',
        };
    }
  }

  // Network errors
  if (error.message.includes('Network Error')) {
    return {
      title: 'Connection Error',
      description: 'Please check your internet connection and try again.',
    };
  }

  // Timeout errors
  if (error.message.includes('timeout')) {
    return {
      title: 'Request Timeout',
      description: 'The request took too long. Please try again.',
    };
  }

  // Generic error
  return {
    title: 'Error',
    description: error.message || 'An unexpected error occurred.',
  };
}

/**
 * Wrap async function with try-catch and error handling
 */
export async function handleAsyncError<T>(
  fn: () => Promise<T>,
  options: {
    onError?: (error: Error) => void;
    rethrow?: boolean;
  } = {}
): Promise<T | null> {
  const { onError, rethrow = true } = options;

  try {
    return await fn();
  } catch (error) {
    const err = error as Error;
    
    if (onError) {
      onError(err);
    }

    if (rethrow) {
      throw err;
    }

    return null;
  }
}
