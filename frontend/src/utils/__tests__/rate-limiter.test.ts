import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RateLimiter, apiRateLimiter, chatRateLimiter, formRateLimiter, authRateLimiter } from '../rate-limiter';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    rateLimiter = new RateLimiter({
      maxRequests: 3,
      windowMs: 1000,
    });
  });

  describe('isAllowed', () => {
    it('should allow requests within the limit', () => {
      expect(rateLimiter.isAllowed('test-key')).toBe(true);
      expect(rateLimiter.isAllowed('test-key')).toBe(true);
      expect(rateLimiter.isAllowed('test-key')).toBe(true);
    });

    it('should block requests exceeding the limit', () => {
      rateLimiter.isAllowed('test-key');
      rateLimiter.isAllowed('test-key');
      rateLimiter.isAllowed('test-key');
      expect(rateLimiter.isAllowed('test-key')).toBe(false);
    });

    it('should reset after time window expires', async () => {
      vi.useFakeTimers();
      
      rateLimiter.isAllowed('test-key');
      rateLimiter.isAllowed('test-key');
      rateLimiter.isAllowed('test-key');
      expect(rateLimiter.isAllowed('test-key')).toBe(false);

      // Advance time past the window
      vi.advanceTimersByTime(1100);
      expect(rateLimiter.isAllowed('test-key')).toBe(true);

      vi.useRealTimers();
    });

    it('should handle different keys independently', () => {
      rateLimiter.isAllowed('key1');
      rateLimiter.isAllowed('key1');
      rateLimiter.isAllowed('key1');
      
      expect(rateLimiter.isAllowed('key1')).toBe(false);
      expect(rateLimiter.isAllowed('key2')).toBe(true);
    });
  });

  describe('getRemaining', () => {
    it('should return correct remaining count', () => {
      expect(rateLimiter.getRemaining('test-key')).toBe(3);
      
      rateLimiter.isAllowed('test-key');
      expect(rateLimiter.getRemaining('test-key')).toBe(2);
      
      rateLimiter.isAllowed('test-key');
      expect(rateLimiter.getRemaining('test-key')).toBe(1);
      
      rateLimiter.isAllowed('test-key');
      expect(rateLimiter.getRemaining('test-key')).toBe(0);
    });

    it('should return max requests for unknown key', () => {
      expect(rateLimiter.getRemaining('unknown-key')).toBe(3);
    });

    it('should reset remaining count after window expires', () => {
      vi.useFakeTimers();
      
      rateLimiter.isAllowed('test-key');
      expect(rateLimiter.getRemaining('test-key')).toBe(2);

      vi.advanceTimersByTime(1100);
      expect(rateLimiter.getRemaining('test-key')).toBe(3);

      vi.useRealTimers();
    });
  });

  describe('getResetTime', () => {
    it('should return 0 for unknown key', () => {
      expect(rateLimiter.getResetTime('unknown-key')).toBe(0);
    });

    it('should return time until reset', () => {
      vi.useFakeTimers();
      
      rateLimiter.isAllowed('test-key');
      const resetTime = rateLimiter.getResetTime('test-key');
      
      expect(resetTime).toBeGreaterThan(0);
      expect(resetTime).toBeLessThanOrEqual(1000);

      vi.useRealTimers();
    });

    it('should return 0 after window expires', () => {
      vi.useFakeTimers();
      
      rateLimiter.isAllowed('test-key');
      expect(rateLimiter.getResetTime('test-key')).toBeGreaterThan(0);

      vi.advanceTimersByTime(1100);
      expect(rateLimiter.getResetTime('test-key')).toBe(0);

      vi.useRealTimers();
    });
  });

  describe('reset', () => {
    it('should reset rate limit for specific key', () => {
      rateLimiter.isAllowed('test-key');
      rateLimiter.isAllowed('test-key');
      rateLimiter.isAllowed('test-key');
      expect(rateLimiter.isAllowed('test-key')).toBe(false);

      rateLimiter.reset('test-key');
      expect(rateLimiter.isAllowed('test-key')).toBe(true);
    });

    it('should not affect other keys', () => {
      rateLimiter.isAllowed('key1');
      rateLimiter.isAllowed('key2');

      rateLimiter.reset('key1');
      
      expect(rateLimiter.getRemaining('key1')).toBe(3);
      expect(rateLimiter.getRemaining('key2')).toBe(2);
    });
  });

  describe('resetAll', () => {
    it('should reset all rate limits', () => {
      rateLimiter.isAllowed('key1');
      rateLimiter.isAllowed('key2');
      rateLimiter.isAllowed('key3');

      rateLimiter.resetAll();

      expect(rateLimiter.getRemaining('key1')).toBe(3);
      expect(rateLimiter.getRemaining('key2')).toBe(3);
      expect(rateLimiter.getRemaining('key3')).toBe(3);
    });
  });

  describe('getErrorMessage', () => {
    it('should return default error message', () => {
      const limiter = new RateLimiter({
        maxRequests: 1,
        windowMs: 1000,
      });
      expect(limiter.getErrorMessage()).toBe('Too many requests. Please try again later.');
    });

    it('should return custom error message', () => {
      const limiter = new RateLimiter({
        maxRequests: 1,
        windowMs: 1000,
        errorMessage: 'Custom error message',
      });
      expect(limiter.getErrorMessage()).toBe('Custom error message');
    });
  });

  describe('Pre-configured rate limiters', () => {
    it('should have apiRateLimiter configured correctly', () => {
      expect(apiRateLimiter).toBeInstanceOf(RateLimiter);
      expect(apiRateLimiter.getRemaining('test')).toBe(10);
    });

    it('should have chatRateLimiter configured correctly', () => {
      expect(chatRateLimiter).toBeInstanceOf(RateLimiter);
      expect(chatRateLimiter.getRemaining('test')).toBe(5);
    });

    it('should have formRateLimiter configured correctly', () => {
      expect(formRateLimiter).toBeInstanceOf(RateLimiter);
      expect(formRateLimiter.getRemaining('test')).toBe(3);
    });

    it('should have authRateLimiter configured correctly', () => {
      expect(authRateLimiter).toBeInstanceOf(RateLimiter);
      expect(authRateLimiter.getRemaining('test')).toBe(5);
    });
  });
});
