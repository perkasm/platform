/**
 * Client-side Rate Limiting Utility Module
 * 
 * Provides rate limiting functionality to prevent excessive API calls
 * and protect against abuse. Implements a sliding window algorithm
 * for accurate rate limit enforcement.
 * 
 * @module utils/rate-limiter
 */

import { RATE_LIMITS, ERROR_MESSAGES } from '@/constants';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  errorMessage?: string;
}

interface RequestRecord {
  count: number;
  resetTime: number;
}

/**
 * RateLimiter class implementing sliding window rate limiting
 * 
 * @example
 * ```typescript
 * const limiter = new RateLimiter({
 *   maxRequests: 10,
 *   windowMs: 60000, // 1 minute
 *   errorMessage: 'Too many requests'
 * });
 * 
 * if (limiter.isAllowed('user-123')) {
 *   // Proceed with request
 * } else {
 *   // Show error
 *   console.error(limiter.getErrorMessage());
 * }
 * ```
 */
class RateLimiter {
  private requests: Map<string, RequestRecord> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      errorMessage: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
      ...config,
    };
  }

  /**
   * Check if a request is allowed based on rate limiting rules
   * @param key - Unique identifier for the rate limit (e.g., endpoint, user action)
   * @returns true if request is allowed, false otherwise
   */
  public isAllowed(key: string): boolean {
    const now = Date.now();
    const record = this.requests.get(key);

    // No previous requests or window has expired
    if (!record || now > record.resetTime) {
      this.requests.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs,
      });
      return true;
    }

    // Within the window, check if limit exceeded
    if (record.count >= this.config.maxRequests) {
      return false;
    }

    // Increment count
    record.count += 1;
    this.requests.set(key, record);
    return true;
  }

  /**
   * Get remaining requests for a key
   * @param key - Unique identifier for the rate limit
   * @returns number of remaining requests
   */
  public getRemaining(key: string): number {
    const now = Date.now();
    const record = this.requests.get(key);

    if (!record || now > record.resetTime) {
      return this.config.maxRequests;
    }

    return Math.max(0, this.config.maxRequests - record.count);
  }

  /**
   * Get time until rate limit resets (in milliseconds)
   * @param key - Unique identifier for the rate limit
   * @returns milliseconds until reset, or 0 if not rate limited
   */
  public getResetTime(key: string): number {
    const now = Date.now();
    const record = this.requests.get(key);

    if (!record || now > record.resetTime) {
      return 0;
    }

    return record.resetTime - now;
  }

  /**
   * Reset rate limit for a specific key
   * @param key - Unique identifier for the rate limit
   */
  public reset(key: string): void {
    this.requests.delete(key);
  }

  /**
   * Clear all rate limit records
   */
  public resetAll(): void {
    this.requests.clear();
  }

  /**
   * Get error message for rate limit exceeded
   */
  public getErrorMessage(): string {
    return this.config.errorMessage || 'Too many requests. Please try again later.';
  }
}

// Pre-configured rate limiters for different scenarios

/**
 * Rate limiter for general API requests
 * Limits: 100 requests per minute
 */
export const apiRateLimiter = new RateLimiter({
  maxRequests: RATE_LIMITS.API.MAX_REQUESTS,
  windowMs: RATE_LIMITS.API.WINDOW_MS,
  errorMessage: 'Too many API requests. Please wait a moment before trying again.',
});

/**
 * Rate limiter for chat messages
 * Limits: 10 messages per minute
 */
export const chatRateLimiter = new RateLimiter({
  maxRequests: RATE_LIMITS.CHAT.MAX_REQUESTS,
  windowMs: RATE_LIMITS.CHAT.WINDOW_MS,
  errorMessage: 'You are sending messages too quickly. Please slow down.',
});

/**
 * Rate limiter for form submissions
 * Limits: 5 submissions per minute
 */
export const formRateLimiter = new RateLimiter({
  maxRequests: RATE_LIMITS.FORM.MAX_REQUESTS,
  windowMs: RATE_LIMITS.FORM.WINDOW_MS,
  errorMessage: 'Too many form submissions. Please wait before submitting again.',
});

/**
 * Rate limiter for authentication attempts
 * Limits: 3 attempts per 5 minutes
 */
export const authRateLimiter = new RateLimiter({
  maxRequests: RATE_LIMITS.AUTH.MAX_REQUESTS,
  windowMs: RATE_LIMITS.AUTH.WINDOW_MS,
  errorMessage: 'Too many login attempts. Please wait 5 minutes before trying again.',
});

export { RateLimiter };
export type { RateLimitConfig, RequestRecord };
