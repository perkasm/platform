/**
 * Client-side rate limiting utility
 * Prevents excessive API calls and protects against abuse
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  errorMessage?: string;
}

interface RequestRecord {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private requests: Map<string, RequestRecord> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      errorMessage: 'Too many requests. Please try again later.',
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
 * Rate limiter for API requests (10 requests per minute)
 */
export const apiRateLimiter = new RateLimiter({
  maxRequests: 10,
  windowMs: 60 * 1000, // 1 minute
  errorMessage: 'Too many API requests. Please wait a moment before trying again.',
});

/**
 * Rate limiter for chat messages (5 messages per 10 seconds)
 */
export const chatRateLimiter = new RateLimiter({
  maxRequests: 5,
  windowMs: 10 * 1000, // 10 seconds
  errorMessage: 'You are sending messages too quickly. Please slow down.',
});

/**
 * Rate limiter for form submissions (3 submissions per minute)
 */
export const formRateLimiter = new RateLimiter({
  maxRequests: 3,
  windowMs: 60 * 1000, // 1 minute
  errorMessage: 'Too many form submissions. Please wait before submitting again.',
});

/**
 * Rate limiter for authentication attempts (5 attempts per 5 minutes)
 */
export const authRateLimiter = new RateLimiter({
  maxRequests: 5,
  windowMs: 5 * 60 * 1000, // 5 minutes
  errorMessage: 'Too many login attempts. Please wait 5 minutes before trying again.',
});

export { RateLimiter };
export type { RateLimitConfig, RequestRecord };
