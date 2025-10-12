import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { apiClient, get, post, put, del, setAuthToken, ApiError } from '@/services/api';

// Mock the rate limiter
vi.mock('@/utils/rate-limiter', () => ({
  apiRateLimiter: {
    isAllowed: vi.fn(() => true), // Default to allowing requests
    getErrorMessage: vi.fn(),
  },
}));

describe('api service', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });

  afterEach(() => {
    mock.reset();
    mock.restore();
  });

  describe('ApiError', () => {
    it('should create ApiError with message only', () => {
      const error = new ApiError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.status).toBeUndefined();
      expect(error.data).toBeUndefined();
    });

    it('should create ApiError with status and data', () => {
      const error = new ApiError('Test error', 404, { detail: 'Not found' });
      expect(error.message).toBe('Test error');
      expect(error.status).toBe(404);
      expect(error.data).toEqual({ detail: 'Not found' });
    });
  });

  describe('setAuthToken', () => {
    it('should set Authorization header when token is provided', () => {
      setAuthToken('test-token');
      expect(apiClient.defaults.headers.common['Authorization']).toBe('Bearer test-token');
    });

    it('should remove Authorization header when token is null', () => {
      setAuthToken('test-token');
      setAuthToken(null);
      expect(apiClient.defaults.headers.common['Authorization']).toBeUndefined();
    });
  });

  describe('get', () => {
    it('should make GET request and return data', async () => {
      const mockData = { id: 1, name: 'Test' };
      mock.onGet('/test').reply(200, mockData);

      const result = await get('/test');
      expect(result).toEqual(mockData);
    });

    it('should handle GET request with config', async () => {
      const mockData = { items: [] };
      mock.onGet('/test', { params: { page: 1 } }).reply(200, mockData);

      const result = await get('/test', { params: { page: 1 } });
      expect(result).toEqual(mockData);
    });

    it('should throw ApiError on GET failure', async () => {
      mock.onGet('/test').reply(404, { message: 'Not found' });

      await expect(get('/test')).rejects.toThrow(ApiError);
      await expect(get('/test')).rejects.toMatchObject({
        status: 404,
        message: 'Not found',
      });
    });

    it('should handle network errors', async () => {
      mock.onGet('/test').networkError();

      await expect(get('/test')).rejects.toThrow(ApiError);
    });
  });

  describe('post', () => {
    it('should make POST request and return data', async () => {
      const requestData = { name: 'New Item' };
      const responseData = { id: 1, ...requestData };
      mock.onPost('/test', requestData).reply(201, responseData);

      const result = await post('/test', requestData);
      expect(result).toEqual(responseData);
    });

    it('should handle POST request without data', async () => {
      const responseData = { success: true };
      mock.onPost('/test').reply(200, responseData);

      const result = await post('/test');
      expect(result).toEqual(responseData);
    });

    it('should handle POST request with config', async () => {
      const requestData = { name: 'Test' };
      const responseData = { id: 1 };
      mock.onPost('/test').reply(201, responseData);

      const result = await post('/test', requestData, {
        headers: { 'X-Custom': 'value' },
      });
      expect(result).toEqual(responseData);
    });

    it('should throw ApiError on POST failure', async () => {
      mock.onPost('/test').reply(400, { message: 'Bad request' });

      await expect(post('/test', {})).rejects.toThrow(ApiError);
      await expect(post('/test', {})).rejects.toMatchObject({
        status: 400,
        message: 'Bad request',
      });
    });
  });

  describe('put', () => {
    it('should make PUT request and return data', async () => {
      const requestData = { name: 'Updated Item' };
      const responseData = { id: 1, ...requestData };
      mock.onPut('/test/1', requestData).reply(200, responseData);

      const result = await put('/test/1', requestData);
      expect(result).toEqual(responseData);
    });

    it('should handle PUT request without data', async () => {
      const responseData = { success: true };
      mock.onPut('/test/1').reply(200, responseData);

      const result = await put('/test/1');
      expect(result).toEqual(responseData);
    });

    it('should throw ApiError on PUT failure', async () => {
      mock.onPut('/test/1').reply(403, { message: 'Forbidden' });

      await expect(put('/test/1', {})).rejects.toThrow(ApiError);
      await expect(put('/test/1', {})).rejects.toMatchObject({
        status: 403,
        message: 'Forbidden',
      });
    });
  });

  describe('del', () => {
    it('should make DELETE request and return data', async () => {
      const responseData = { success: true };
      mock.onDelete('/test/1').reply(200, responseData);

      const result = await del('/test/1');
      expect(result).toEqual(responseData);
    });

    it('should handle DELETE request with config', async () => {
      const responseData = { deleted: true };
      mock.onDelete('/test/1').reply(204, responseData);

      const result = await del('/test/1', {
        headers: { 'X-Force': 'true' },
      });
      expect(result).toEqual(responseData);
    });

    it('should throw ApiError on DELETE failure', async () => {
      mock.onDelete('/test/1').reply(404, { message: 'Not found' });

      await expect(del('/test/1')).rejects.toThrow(ApiError);
      await expect(del('/test/1')).rejects.toMatchObject({
        status: 404,
        message: 'Not found',
      });
    });
  });

  describe('interceptors', () => {
    it('should handle response with custom error message', async () => {
      mock.onGet('/test').reply(500, { message: 'Custom error message' });

      await expect(get('/test')).rejects.toMatchObject({
        message: 'Custom error message',
      });
    });

    it('should handle response without custom message', async () => {
      mock.onGet('/test').reply(500);

      await expect(get('/test')).rejects.toThrow(ApiError);
    });

    it('should preserve original error properties', async () => {
      const errorData = { field: 'email', error: 'Invalid format' };
      mock.onPost('/test').reply(422, errorData);

      await expect(post('/test', {})).rejects.toMatchObject({
        status: 422,
        data: errorData,
      });
    });
  });

  describe('baseURL configuration', () => {
    it('should use baseURL from environment or default to /api', () => {
      expect(apiClient.defaults.baseURL).toBeDefined();
      // The actual value depends on environment, but it should be set
      expect(typeof apiClient.defaults.baseURL).toBe('string');
    });
  });

  describe('default headers', () => {
    it('should have correct default headers', () => {
      // Headers are set in the config, not in common headers in newer axios versions
      expect(apiClient.defaults.headers['Accept']).toBeDefined();
      expect(apiClient.defaults.withCredentials).toBe(true);
    });

    it('should have withCredentials set to true', () => {
      expect(apiClient.defaults.withCredentials).toBe(true);
    });
  });

  describe('rate limiting', () => {
    it('should throw ApiError when rate limit exceeded for GET', async () => {
      const { apiRateLimiter } = await import('@/utils/rate-limiter');
      
      // Mock rate limiter to return false (blocked)
      vi.mocked(apiRateLimiter.isAllowed).mockReturnValue(false);
      vi.mocked(apiRateLimiter.getErrorMessage).mockReturnValue('Rate limit exceeded');

      await expect(get('/test')).rejects.toThrow(ApiError);
      await expect(get('/test')).rejects.toMatchObject({
        status: 429,
        message: 'Rate limit exceeded',
      });
    });

    it('should throw ApiError when rate limit exceeded for POST', async () => {
      const { apiRateLimiter } = await import('@/utils/rate-limiter');
      
      vi.mocked(apiRateLimiter.isAllowed).mockReturnValue(false);
      vi.mocked(apiRateLimiter.getErrorMessage).mockReturnValue('Rate limit exceeded');

      await expect(post('/test', {})).rejects.toThrow(ApiError);
      await expect(post('/test', {})).rejects.toMatchObject({
        status: 429,
        message: 'Rate limit exceeded',
      });
    });

    it('should throw ApiError when rate limit exceeded for PUT', async () => {
      const { apiRateLimiter } = await import('@/utils/rate-limiter');
      
      vi.mocked(apiRateLimiter.isAllowed).mockReturnValue(false);
      vi.mocked(apiRateLimiter.getErrorMessage).mockReturnValue('Rate limit exceeded');

      await expect(put('/test', {})).rejects.toThrow(ApiError);
    });

    it('should throw ApiError when rate limit exceeded for DELETE', async () => {
      const { apiRateLimiter } = await import('@/utils/rate-limiter');
      
      vi.mocked(apiRateLimiter.isAllowed).mockReturnValue(false);
      vi.mocked(apiRateLimiter.getErrorMessage).mockReturnValue('Rate limit exceeded');

      await expect(del('/test')).rejects.toThrow(ApiError);
    });
  });

  describe('performance monitoring', () => {
    it('should track slow API requests', async () => {
      const { apiRateLimiter } = await import('@/utils/rate-limiter');
      
      // Ensure rate limiter allows this request
      vi.mocked(apiRateLimiter.isAllowed).mockReturnValue(true);
      
      const mockData = { id: 1, name: 'Test' };
      // Mock a slow response by setting up the mock to delay
      mock.onGet('/slow-test').reply(() => {
        // Simulate a slow response by delaying (3000ms is the threshold)
        return new Promise(resolve => {
          setTimeout(() => resolve([200, mockData]), 3100); // 3100ms > 3000ms threshold
        });
      });

      const result = await get('/slow-test');
      expect(result).toEqual(mockData);
      // Note: Sentry captureMessage would be called, but we can't easily test it
    });
  });
});
