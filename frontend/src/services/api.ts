import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { env } from "@/config/env";
import * as Sentry from "@sentry/react";
import { apiRateLimiter } from "@/utils/rate-limiter";

class ApiError extends Error {
  status?: number;
  data?: unknown;
  constructor(message: string, status?: number, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

const baseURL = env.apiUrl;

function createClient(): AxiosInstance {
  const client = axios.create({
    baseURL,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    withCredentials: true, // toggle if you need cookies
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

      // Track slow API calls (>3 seconds)
      if (duration > 3000) {
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
      if (status && (status >= 500 || status === 401 || status === 403)) {
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

export function setAuthToken(token: string | null) {
  if (token) client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete client.defaults.headers.common["Authorization"];
}

export async function get<T = any>(url: string, config?: AxiosRequestConfig) {
  // Rate limiting check
  if (!apiRateLimiter.isAllowed(`GET:${url}`)) {
    throw new ApiError(apiRateLimiter.getErrorMessage(), 429);
  }
  const res = await client.get<T>(url, config);
  return res.data;
}
export async function post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
  // Rate limiting check
  if (!apiRateLimiter.isAllowed(`POST:${url}`)) {
    throw new ApiError(apiRateLimiter.getErrorMessage(), 429);
  }
  const res = await client.post<T>(url, data, config);
  return res.data;
}
export async function put<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
  // Rate limiting check
  if (!apiRateLimiter.isAllowed(`PUT:${url}`)) {
    throw new ApiError(apiRateLimiter.getErrorMessage(), 429);
  }
  const res = await client.put<T>(url, data, config);
  return res.data;
}
export async function del<T = any>(url: string, config?: AxiosRequestConfig) {
  // Rate limiting check
  if (!apiRateLimiter.isAllowed(`DELETE:${url}`)) {
    throw new ApiError(apiRateLimiter.getErrorMessage(), 429);
  }
  const res = await client.delete<T>(url, config);
  return res.data;
}

export { client as apiClient, ApiError };