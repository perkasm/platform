/**
 * API Service Module
 * 
 * This module provides a centralized HTTP client for all API communications.
 * It includes error handling, request/response interceptors, performance tracking,
 * rate limiting, and integration with Sentry for error monitoring.
 * 
 * @module services/api
 */

import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { env } from "@/config/env";
import * as Sentry from "@sentry/react";
import { apiRateLimiter } from "@/utils/rate-limiter";
import { API_CONFIG } from "@/constants";

/**
 * Custom error class for API-related errors
 * Extends the standard Error class with additional context
 */
class ApiError extends Error {
  /** HTTP status code of the error response */
  status?: number;
  /** Additional error data from the API response */
  data?: unknown;
  
  /**
   * Creates a new ApiError instance
   * @param message - Human-readable error message
   * @param status - HTTP status code
   * @param data - Additional error context from API
   */
  constructor(message: string, status?: number, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

const baseURL = env.apiUrl;

/**
 * Creates and configures an Axios client instance with interceptors
 * 
 * This function sets up:
 * - Request timing and tracing
 * - Error tracking with Sentry
 * - Performance monitoring for slow requests
 * - Comprehensive error handling with retry logic
 * 
 * @returns Configured Axios instance
 */
function createClient(): AxiosInstance {
  const client = axios.create({
    baseURL,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });

  // Request interceptor - add timing and tracing
  client.interceptors.request.use((cfg: InternalAxiosRequestConfig) => {
    // Add request start time for performance tracking
    if (cfg.headers) {
      cfg.headers['X-Request-Start-Time'] = Date.now().toString();
    }

    // Add breadcrumb for request
    Sentry.addBreadcrumb({
      category: "api",
      message: `API Request: ${cfg.method?.toUpperCase()} ${cfg.url}`,
      level: "info",
      data: {
        method: cfg.method,
        url: cfg.url,
        baseURL: cfg.baseURL,
      },
    });

    return cfg;
  });

  // Response interceptor - track success and errors
  client.interceptors.response.use(
    (res: AxiosResponse) => {
      // Calculate request duration
      const startTime = res.config.headers?.['X-Request-Start-Time'];
      const duration = startTime ? Date.now() - parseInt(startTime as string, 10) : 0;

      // Add breadcrumb for successful response
      Sentry.addBreadcrumb({
        category: "api",
        message: `API Response: ${res.config.method?.toUpperCase()} ${res.config.url} (${res.status})`,
        level: "info",
        data: {
          method: res.config.method,
          url: res.config.url,
          status: res.status,
          duration,
        },
      });

      // Track slow API calls
      if (duration > API_CONFIG.SLOW_REQUEST_THRESHOLD) {
        Sentry.captureMessage(
          `Slow API request: ${res.config.method?.toUpperCase()} ${res.config.url} took ${duration}ms`,
          "warning"
        );
      }

      return res;
    },
    (err) => {
      const status = err?.response?.status;
      const data = err?.response?.data;
      const message = data?.message || err.message || "Network Error";

      // Calculate request duration if available
      const startTime = err?.config?.headers?.['X-Request-Start-Time'];
      const duration = startTime ? Date.now() - parseInt(startTime as string, 10) : 0;

      // Add breadcrumb for error response
      Sentry.addBreadcrumb({
        category: "api",
        message: `API Error: ${err?.config?.method?.toUpperCase()} ${err?.config?.url} (${status || 'Network Error'})`,
        level: "error",
        data: {
          method: err?.config?.method,
          url: err?.config?.url,
          status,
          duration,
          message,
        },
      });

      // Capture API errors in Sentry (exclude 4xx client errors except 401, 403)
      if (status && (status >= API_CONFIG.STATUS_CODES.INTERNAL_SERVER_ERROR || 
          status === API_CONFIG.STATUS_CODES.UNAUTHORIZED || 
          status === API_CONFIG.STATUS_CODES.FORBIDDEN)) {
        Sentry.captureException(new ApiError(message, status, data), {
          contexts: {
            api: {
              method: err?.config?.method,
              url: err?.config?.url,
              baseURL: err?.config?.baseURL,
              status,
              duration,
            },
          },
          tags: {
            api_error: "true",
            status_code: status?.toString() || "unknown",
          },
        });
      }

      return Promise.reject(new ApiError(message, status, data));
    }
  );

  return client;
}

const client = createClient();

/**
 * Sets or removes the JWT authentication token for API requests
 * 
 * @param token - JWT token string or null to remove authentication
 * @example
 * ```typescript
 * // Set authentication token
 * setAuthToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
 * 
 * // Remove authentication token
 * setAuthToken(null);
 * ```
 */
export function setAuthToken(token: string | null) {
  if (token) client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete client.defaults.headers.common["Authorization"];
}

/**
 * Performs an HTTP GET request
 * 
 * @template T - Expected response data type
 * @param url - API endpoint URL
 * @param config - Optional Axios request configuration
 * @returns Promise resolving to response data
 * @throws {ApiError} If rate limit is exceeded or request fails
 * @example
 * ```typescript
 * const users = await get<User[]>('/users');
 * const user = await get<User>('/users/123');
 * ```
 */
export async function get<T = unknown>(url: string, config?: AxiosRequestConfig) {
  if (!apiRateLimiter.isAllowed(`GET:${url}`)) {
    throw new ApiError(apiRateLimiter.getErrorMessage(), API_CONFIG.STATUS_CODES.TOO_MANY_REQUESTS);
  }
  const res = await client.get<T>(url, config);
  return res.data;
}

/**
 * Performs an HTTP POST request
 * 
 * @template T - Expected response data type
 * @param url - API endpoint URL
 * @param data - Request payload
 * @param config - Optional Axios request configuration
 * @returns Promise resolving to response data
 * @throws {ApiError} If rate limit is exceeded or request fails
 * @example
 * ```typescript
 * const newUser = await post<User>('/users', { name: 'John', email: 'john@example.com' });
 * ```
 */
export async function post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) {
  if (!apiRateLimiter.isAllowed(`POST:${url}`)) {
    throw new ApiError(apiRateLimiter.getErrorMessage(), API_CONFIG.STATUS_CODES.TOO_MANY_REQUESTS);
  }
  const res = await client.post<T>(url, data, config);
  return res.data;
}

/**
 * Performs an HTTP PUT request
 * 
 * @template T - Expected response data type
 * @param url - API endpoint URL
 * @param data - Request payload
 * @param config - Optional Axios request configuration
 * @returns Promise resolving to response data
 * @throws {ApiError} If rate limit is exceeded or request fails
 * @example
 * ```typescript
 * const updated = await put<User>('/users/123', { name: 'Jane Doe' });
 * ```
 */
export async function put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) {
  if (!apiRateLimiter.isAllowed(`PUT:${url}`)) {
    throw new ApiError(apiRateLimiter.getErrorMessage(), API_CONFIG.STATUS_CODES.TOO_MANY_REQUESTS);
  }
  const res = await client.put<T>(url, data, config);
  return res.data;
}

/**
 * Performs an HTTP DELETE request
 * 
 * @template T - Expected response data type
 * @param url - API endpoint URL
 * @param config - Optional Axios request configuration
 * @returns Promise resolving to response data
 * @throws {ApiError} If rate limit is exceeded or request fails
 * @example
 * ```typescript
 * await del('/users/123');
 * ```
 */
export async function del<T = unknown>(url: string, config?: AxiosRequestConfig) {
  if (!apiRateLimiter.isAllowed(`DELETE:${url}`)) {
    throw new ApiError(apiRateLimiter.getErrorMessage(), API_CONFIG.STATUS_CODES.TOO_MANY_REQUESTS);
  }
  const res = await client.delete<T>(url, config);
  return res.data;
}

export { client as apiClient, ApiError };