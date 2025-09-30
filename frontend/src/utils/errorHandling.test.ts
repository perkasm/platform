import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ApiError } from '@/services/api';
import {
  retryWithBackoff,
  createRetryableRequest,
  formatApiError,
  handleAsyncError,
} from '@/utils/errorHandling';

describe('errorHandling', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('retryWithBackoff', () => {
    it('should succeed on first attempt', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      const result = await retryWithBackoff(fn);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on retryable error', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new ApiError('Server Error', 500))
        .mockResolvedValueOnce('success');

      const promise = retryWithBackoff(fn, { maxRetries: 2, initialDelay: 100 });

      // Fast-forward time for retry
      await vi.runAllTimersAsync();

      const result = await promise;

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should throw after max retries', async () => {
      const error = new ApiError('Server Error', 500);
      const fn = vi.fn().mockRejectedValue(error);

      const promise = retryWithBackoff(fn, { maxRetries: 2, initialDelay: 100 });

      // Fast-forward all timers and catch the error
      const timerPromise = vi.runAllTimersAsync();
      
      try {
        await promise;
        throw new Error('Should have thrown');
      } catch (e) {
        expect((e as Error).message).toBe('Server Error');
      }

      await timerPromise;

      expect(fn).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it('should not retry on non-retryable error', async () => {
      const error = new ApiError('Not Found', 404);
      const fn = vi.fn().mockRejectedValue(error);

      await expect(retryWithBackoff(fn, { maxRetries: 2 })).rejects.toThrow('Not Found');
      expect(fn).toHaveBeenCalledTimes(1); // No retries
    });

    it('should retry on network errors', async () => {
      const networkError = new Error('Network Error');
      const fn = vi.fn().mockRejectedValueOnce(networkError).mockResolvedValueOnce('success');

      const promise = retryWithBackoff(fn, { maxRetries: 2, initialDelay: 100 });

      await vi.runAllTimersAsync();

      const result = await promise;

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should use exponential backoff', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new ApiError('Error', 500))
        .mockRejectedValueOnce(new ApiError('Error', 500))
        .mockResolvedValueOnce('success');

      const onRetry = vi.fn();
      const promise = retryWithBackoff(fn, {
        maxRetries: 3,
        initialDelay: 1000,
        backoffFactor: 2,
        onRetry,
      });

      await vi.runAllTimersAsync();

      await promise;

      expect(onRetry).toHaveBeenCalledTimes(2);
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should call onRetry callback', async () => {
      const error = new ApiError('Error', 500);
      const fn = vi.fn().mockRejectedValue(error);
      const onRetry = vi.fn();

      const promiseUnderTest = retryWithBackoff(fn, { maxRetries: 2, initialDelay: 100, onRetry });

      // Create a promise that will resolve when the test completes
      const testPromise = (async () => {
        await expect(promiseUnderTest).rejects.toThrow();
        return true;
      })();

      // Run all timers
      await vi.runAllTimersAsync();

      // Wait for the test to complete
      await testPromise;

      expect(onRetry).toHaveBeenCalledTimes(2);
      expect(onRetry).toHaveBeenNthCalledWith(1, 1, error);
      expect(onRetry).toHaveBeenNthCalledWith(2, 2, error);
    });

    it('should respect custom retryableStatuses', async () => {
      const error = new ApiError('Custom Error', 418); // Teapot status
      const fn = vi.fn().mockRejectedValue(error);

      const promiseUnderTest = retryWithBackoff(fn, {
        retryableStatuses: [418],
        maxRetries: 1,
        initialDelay: 100,
      });

      // Create a promise that will resolve when the test completes
      const testPromise = (async () => {
        await expect(promiseUnderTest).rejects.toThrow();
        return true;
      })();

      // Advance timers
      await vi.runAllTimersAsync();

      // Wait for the test to complete
      await testPromise;

      // Should have retried once (initial + 1 retry = 2 calls)
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should respect maxDelay', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new ApiError('Error', 500))
        .mockResolvedValueOnce('success');

      const promise = retryWithBackoff(fn, {
        maxRetries: 2,
        initialDelay: 10000,
        maxDelay: 100,
      });

      await vi.runAllTimersAsync();

      await promise;

      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('createRetryableRequest', () => {
    it('should create a retryable version of a function', async () => {
      const originalFn = vi.fn().mockResolvedValue('success');
      const retryableFn = createRetryableRequest(originalFn);

      const result = await retryableFn('arg1', 'arg2');

      expect(result).toBe('success');
      expect(originalFn).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('should retry on failure', async () => {
      const originalFn = vi
        .fn()
        .mockRejectedValueOnce(new ApiError('Error', 500))
        .mockResolvedValueOnce('success');

      const retryableFn = createRetryableRequest(originalFn, {
        maxRetries: 2,
        initialDelay: 100,
      });

      const promise = retryableFn('test');

      await vi.runAllTimersAsync();

      const result = await promise;

      expect(result).toBe('success');
      expect(originalFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('formatApiError', () => {
    it('should format 400 Bad Request error', () => {
      const error = new ApiError('Invalid input', 400);
      const formatted = formatApiError(error);

      expect(formatted.title).toBe('Invalid Request');
      expect(formatted.description).toContain('Invalid input');
    });

    it('should format 401 Unauthorized error', () => {
      const error = new ApiError('Unauthorized', 401);
      const formatted = formatApiError(error);

      expect(formatted.title).toBe('Authentication Required');
      expect(formatted.description).toContain('sign in');
    });

    it('should format 403 Forbidden error', () => {
      const error = new ApiError('Forbidden', 403);
      const formatted = formatApiError(error);

      expect(formatted.title).toBe('Access Denied');
      expect(formatted.description).toContain('permission');
    });

    it('should format 404 Not Found error', () => {
      const error = new ApiError('Not found', 404);
      const formatted = formatApiError(error);

      expect(formatted.title).toBe('Not Found');
      expect(formatted.description).toContain('could not be found');
    });

    it('should format 429 Rate Limit error', () => {
      const error = new ApiError('Too many requests', 429);
      const formatted = formatApiError(error);

      expect(formatted.title).toBe('Too Many Requests');
      expect(formatted.description).toContain('wait');
    });

    it('should format 500 Server Error', () => {
      const error = new ApiError('Internal server error', 500);
      const formatted = formatApiError(error);

      expect(formatted.title).toBe('Server Error');
      expect(formatted.description).toContain('went wrong');
    });

    it('should format network error', () => {
      const error = new Error('Network Error');
      const formatted = formatApiError(error);

      expect(formatted.title).toBe('Connection Error');
      expect(formatted.description).toContain('internet connection');
    });

    it('should format timeout error', () => {
      const error = new Error('Request timeout');
      const formatted = formatApiError(error);

      expect(formatted.title).toBe('Request Timeout');
      expect(formatted.description).toContain('took too long');
    });

    it('should format generic error', () => {
      const error = new Error('Something went wrong');
      const formatted = formatApiError(error);

      expect(formatted.title).toBe('Error');
      expect(formatted.description).toBe('Something went wrong');
    });

    it('should handle error without message', () => {
      const error = new ApiError('', 400);
      const formatted = formatApiError(error);

      expect(formatted.title).toBe('Invalid Request');
      expect(formatted.description).toBeDefined();
    });
  });

  describe('handleAsyncError', () => {
    it('should return result on success', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      const result = await handleAsyncError(fn);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should call onError and rethrow by default', async () => {
      const error = new Error('Test error');
      const fn = vi.fn().mockRejectedValue(error);
      const onError = vi.fn();

      await expect(handleAsyncError(fn, { onError })).rejects.toThrow('Test error');
      expect(onError).toHaveBeenCalledWith(error);
    });

    it('should not rethrow when rethrow is false', async () => {
      const error = new Error('Test error');
      const fn = vi.fn().mockRejectedValue(error);
      const onError = vi.fn();

      const result = await handleAsyncError(fn, { onError, rethrow: false });

      expect(result).toBeNull();
      expect(onError).toHaveBeenCalledWith(error);
    });

    it('should work without onError callback', async () => {
      const error = new Error('Test error');
      const fn = vi.fn().mockRejectedValue(error);

      await expect(handleAsyncError(fn)).rejects.toThrow('Test error');
    });

    it('should handle ApiError', async () => {
      const error = new ApiError('API Error', 500);
      const fn = vi.fn().mockRejectedValue(error);
      const onError = vi.fn();

      await expect(handleAsyncError(fn, { onError })).rejects.toThrow('API Error');
      expect(onError).toHaveBeenCalledWith(error);
    });
  });

  describe('integration tests', () => {
    it('should retry and format error if all retries fail', async () => {
      const error = new ApiError('Server Error', 500);
      const fn = vi.fn().mockRejectedValue(error);
      const onError = vi.fn();

      const retryableFn = createRetryableRequest(fn, { maxRetries: 2, initialDelay: 100 });

      const promise = handleAsyncError(() => retryableFn(), { onError, rethrow: false });

      await vi.runAllTimersAsync();

      const result = await promise;

      expect(result).toBeNull();
      expect(fn).toHaveBeenCalledTimes(3); // Initial + 2 retries
      expect(onError).toHaveBeenCalled();

      const formattedError = formatApiError(error);
      expect(formattedError.title).toBe('Server Error');
    });
  });
});
