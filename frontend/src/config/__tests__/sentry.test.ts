/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as Sentry from "@sentry/react";
import {
  initSentry,
  setSentryUser,
  clearSentryUser,
  captureException,
  captureMessage,
  addBreadcrumb,
  startTransaction,
} from "../sentry";

// Mock Sentry
vi.mock("@sentry/react", () => ({
  init: vi.fn(),
  setUser: vi.fn(),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  addBreadcrumb: vi.fn(),
  startSpan: vi.fn(),
  withScope: vi.fn(),
  browserTracingIntegration: vi.fn(() => ({ name: "browserTracing" })),
  replayIntegration: vi.fn(() => ({ name: "replay" })),
  captureConsoleIntegration: vi.fn(() => ({ name: "captureConsole" })),
  httpClientIntegration: vi.fn(() => ({ name: "httpClient" })),
}));

// Mock console methods
let consoleLogSpy: any;

describe("Sentry Configuration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("initSentry", () => {
    it("should not initialize Sentry when DSN is not set", () => {
      vi.stubEnv("VITE_SENTRY_DSN", undefined);

      initSentry();

      expect(Sentry.init).not.toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith("Sentry is disabled or not configured");
    });

    it("should not initialize Sentry when error tracking is disabled", () => {
      vi.stubEnv("VITE_SENTRY_DSN", "https://test@test.ingest.sentry.io/test");
      vi.stubEnv("VITE_ENABLE_ERROR_TRACKING", "false");

      initSentry();

      expect(Sentry.init).not.toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith("Sentry is disabled or not configured");
    });

    it("should initialize Sentry with correct configuration in production", () => {
      vi.stubEnv("VITE_SENTRY_DSN", "https://test@test.ingest.sentry.io/test");
      vi.stubEnv("VITE_ENABLE_ERROR_TRACKING", "true");
      vi.stubEnv("VITE_SENTRY_ENVIRONMENT", "production");
      vi.stubEnv("DEV", false);

      initSentry();

      expect(Sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          dsn: "https://test@test.ingest.sentry.io/test",
          environment: "production",
          tracesSampleRate: 1.0,
          replaysSessionSampleRate: 0.1,
          replaysOnErrorSampleRate: 1.0,
          debug: false,
          sendClientReports: true,
          release: "development",
        })
      );

      expect(consoleLogSpy).toHaveBeenCalledWith("Sentry initialized for environment: production");
    });

    it("should initialize Sentry with debug enabled in development", () => {
      vi.stubEnv("VITE_SENTRY_DSN", "https://test@test.ingest.sentry.io/test");
      vi.stubEnv("VITE_ENABLE_ERROR_TRACKING", "true");
      vi.stubEnv("DEV", true);

      initSentry();

      expect(Sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          debug: true,
        })
      );
    });

    it("should initialize Sentry with custom release version", () => {
      vi.stubEnv("VITE_SENTRY_DSN", "https://test@test.ingest.sentry.io/test");
      vi.stubEnv("VITE_ENABLE_ERROR_TRACKING", "true");
      vi.stubEnv("VITE_APP_VERSION", "1.2.3");

      initSentry();

      expect(Sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          release: "1.2.3",
        })
      );
    });

    it("should initialize Sentry with custom sample rates", () => {
      vi.stubEnv("VITE_SENTRY_DSN", "https://test@test.ingest.sentry.io/test");
      vi.stubEnv("VITE_ENABLE_ERROR_TRACKING", "true");
      vi.stubEnv("VITE_SENTRY_TRACES_SAMPLE_RATE", "0.5");
      vi.stubEnv("VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE", "0.05");
      vi.stubEnv("VITE_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE", "0.8");

      initSentry();

      expect(Sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          tracesSampleRate: 0.5,
          replaysSessionSampleRate: 0.05,
          replaysOnErrorSampleRate: 0.8,
        })
      );
    });

    it("should initialize all required integrations", () => {
      vi.stubEnv("VITE_SENTRY_DSN", "https://test@test.ingest.sentry.io/test");
      vi.stubEnv("VITE_ENABLE_ERROR_TRACKING", "true");

      initSentry();

      const initCall = vi.mocked(Sentry.init).mock.calls[0][0];
      expect(initCall.integrations).toHaveLength(4);
      expect(Sentry.browserTracingIntegration).toHaveBeenCalled();
      expect(Sentry.replayIntegration).toHaveBeenCalledWith({
        maskAllText: true,
        blockAllMedia: true,
      });
      expect(Sentry.captureConsoleIntegration).toHaveBeenCalledWith({
        levels: ["error", "warn"],
      });
      expect(Sentry.httpClientIntegration).toHaveBeenCalled();
    });

    it("should set correct trace propagation targets", () => {
      vi.stubEnv("VITE_SENTRY_DSN", "https://test@test.ingest.sentry.io/test");
      vi.stubEnv("VITE_ENABLE_ERROR_TRACKING", "true");

      initSentry();

      const initCall = vi.mocked(Sentry.init).mock.calls[0][0];
      expect(initCall.tracePropagationTargets).toEqual([
        "localhost",
        /^https:\/\/api\.perkasm\.com/,
        /^https:\/\/.*\.perkasm\.com/,
      ]);
    });

    it("should filter out events in development unless explicitly enabled", () => {
      vi.stubEnv("VITE_SENTRY_DSN", "https://test@test.ingest.sentry.io/test");
      vi.stubEnv("VITE_ENABLE_ERROR_TRACKING", "false");
      vi.stubEnv("DEV", true);

      initSentry();

      // When error tracking is disabled, Sentry.init should not be called
      expect(Sentry.init).not.toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith("Sentry is disabled or not configured");
    });

    it("should not filter events in development when explicitly enabled", () => {
      vi.stubEnv("VITE_SENTRY_DSN", "https://test@test.ingest.sentry.io/test");
      vi.stubEnv("VITE_ENABLE_ERROR_TRACKING", "true");
      vi.stubEnv("DEV", true);

      initSentry();

      const initCall = vi.mocked(Sentry.init).mock.calls[0][0] as any;
      const beforeSend = initCall.beforeSend;

      const mockEvent = { type: "error", request: {} } as any;
      const result = beforeSend(mockEvent, {});
      expect(result).toBe(mockEvent);
    });

    it("should filter out browser extension errors", () => {
      vi.stubEnv("VITE_SENTRY_DSN", "https://test@test.ingest.sentry.io/test");
      vi.stubEnv("VITE_ENABLE_ERROR_TRACKING", "true");

      initSentry();

      const initCall = vi.mocked(Sentry.init).mock.calls[0][0] as any;
      const beforeSend = initCall.beforeSend;

      const mockEvent = { type: "error" } as any;
      const result = beforeSend(mockEvent, {
        originalException: { message: "Extension context invalidated" }
      });
      expect(result).toBeNull();
    });

    it("should remove sensitive headers from requests", () => {
      vi.stubEnv("VITE_SENTRY_DSN", "https://test@test.ingest.sentry.io/test");
      vi.stubEnv("VITE_ENABLE_ERROR_TRACKING", "true");

      initSentry();

      const initCall = vi.mocked(Sentry.init).mock.calls[0][0] as any;
      const beforeSend = initCall.beforeSend;

      const mockEvent = {
        type: "error",
        request: {
          headers: {
            "Authorization": "Bearer token",
            "Cookie": "session=123",
            "Content-Type": "application/json"
          }
        }
      } as any;

      const result = beforeSend(mockEvent, {});
      expect(result?.request?.headers).not.toHaveProperty("Authorization");
      expect(result?.request?.headers).not.toHaveProperty("Cookie");
      expect(result?.request?.headers).toHaveProperty("Content-Type");
    });

    it("should not filter events in development when explicitly enabled", () => {
      vi.stubEnv("VITE_SENTRY_DSN", "https://test@test.ingest.sentry.io/test");
      vi.stubEnv("VITE_ENABLE_ERROR_TRACKING", "true");
      vi.stubEnv("DEV", true);

      initSentry();

      const initCall = vi.mocked(Sentry.init).mock.calls[0][0];
      const beforeSend = initCall.beforeSend as (event: any, hint: any) => any;

      const mockEvent = { type: "error", request: {} } as any;
      const result = beforeSend(mockEvent, {});
      expect(result).toBe(mockEvent);
    });

    it("should filter out browser extension errors", () => {
      vi.stubEnv("VITE_SENTRY_DSN", "https://test@test.ingest.sentry.io/test");
      vi.stubEnv("VITE_ENABLE_ERROR_TRACKING", "true");

      initSentry();

      const initCall = vi.mocked(Sentry.init).mock.calls[0][0];
      const beforeSend = initCall.beforeSend as (event: any, hint: any) => any;

      const mockEvent = { type: "error" } as any;
      const result = beforeSend(mockEvent, {
        originalException: { message: "Extension context invalidated" }
      });
      expect(result).toBeNull();
    });

    it("should remove sensitive headers from requests", () => {
      vi.stubEnv("VITE_SENTRY_DSN", "https://test@test.ingest.sentry.io/test");
      vi.stubEnv("VITE_ENABLE_ERROR_TRACKING", "true");

      initSentry();

      const initCall = vi.mocked(Sentry.init).mock.calls[0][0];
      const beforeSend = initCall.beforeSend as (event: any, hint: any) => any;

      const mockEvent = {
        type: "error",
        request: {
          headers: {
            "Authorization": "Bearer token",
            "Cookie": "session=123",
            "Content-Type": "application/json"
          }
        }
      } as any;

      const result = beforeSend(mockEvent, {});
      expect(result?.request?.headers).not.toHaveProperty("Authorization");
      expect(result?.request?.headers).not.toHaveProperty("Cookie");
      expect(result?.request?.headers).toHaveProperty("Content-Type");
    });

    it("should not filter events in development when explicitly enabled", () => {
      vi.stubEnv("VITE_SENTRY_DSN", "https://test@test.ingest.sentry.io/test");
      vi.stubEnv("VITE_ENABLE_ERROR_TRACKING", "true");
      vi.stubEnv("DEV", true);

      initSentry();

      const initCall = vi.mocked(Sentry.init).mock.calls[0][0];
      const beforeSend = initCall.beforeSend;

      const mockEvent = { type: "error", request: {} } as any;
      const result = beforeSend(mockEvent, {});
      expect(result).toBe(mockEvent);
    });

    it("should filter out browser extension errors", () => {
      vi.stubEnv("VITE_SENTRY_DSN", "https://test@test.ingest.sentry.io/test");
      vi.stubEnv("VITE_ENABLE_ERROR_TRACKING", "true");

      initSentry();

      const initCall = vi.mocked(Sentry.init).mock.calls[0][0];
      const beforeSend = initCall.beforeSend;

      const mockEvent = { type: "error" } as any;
      const result = beforeSend(mockEvent, {
        originalException: { message: "Extension context invalidated" }
      });
      expect(result).toBeNull();
    });

    it("should remove sensitive headers from requests", () => {
      vi.stubEnv("VITE_SENTRY_DSN", "https://test@test.ingest.sentry.io/test");
      vi.stubEnv("VITE_ENABLE_ERROR_TRACKING", "true");

      initSentry();

      const initCall = vi.mocked(Sentry.init).mock.calls[0][0];
      const beforeSend = initCall.beforeSend;

      const mockEvent = {
        type: "error",
        request: {
          headers: {
            "Authorization": "Bearer token",
            "Cookie": "session=123",
            "Content-Type": "application/json"
          }
        }
      } as any;

      const result = beforeSend(mockEvent, {});
      expect(result?.request?.headers).not.toHaveProperty("Authorization");
      expect(result?.request?.headers).not.toHaveProperty("Cookie");
      expect(result?.request?.headers).toHaveProperty("Content-Type");
    });

    it("should have correct ignoreErrors list", () => {
      vi.stubEnv("VITE_SENTRY_DSN", "https://test@test.ingest.sentry.io/test");
      vi.stubEnv("VITE_ENABLE_ERROR_TRACKING", "true");

      initSentry();

      const initCall = vi.mocked(Sentry.init).mock.calls[0][0];
      expect(initCall.ignoreErrors).toEqual([
        "top.GLOBALS",
        "chrome-extension://",
        "moz-extension://",
        "NetworkError",
        "Network request failed",
        "Failed to fetch",
        "Loading chunk",
        "ChunkLoadError",
        "instantSearchSDKJSBridgeClearHighlight",
      ]);
    });
  });

  describe("setSentryUser", () => {
    it("should call Sentry.setUser with user data", () => {
      const user = { id: "123", email: "test@example.com", username: "testuser" };

      setSentryUser(user);

      expect(Sentry.setUser).toHaveBeenCalledWith(user);
    });

    it("should call Sentry.setUser with minimal user data", () => {
      const user = { id: "123" };

      setSentryUser(user);

      expect(Sentry.setUser).toHaveBeenCalledWith(user);
    });
  });

  describe("clearSentryUser", () => {
    it("should call Sentry.setUser with null", () => {
      clearSentryUser();

      expect(Sentry.setUser).toHaveBeenCalledWith(null);
    });
  });

  describe("captureException", () => {
    it("should call Sentry.captureException without context", () => {
      const error = new Error("Test error");

      captureException(error);

      expect(Sentry.captureException).toHaveBeenCalledWith(error);
      expect(Sentry.withScope).not.toHaveBeenCalled();
    });

    it("should call Sentry.captureException with context", () => {
      const error = new Error("Test error");
      const context = { userId: "123", action: "login" };

      const mockScope = {
        setExtra: vi.fn(),
      };

      vi.mocked(Sentry.withScope).mockImplementation((callback) => {
        callback(mockScope as any);
      });

      captureException(error, context);

      expect(Sentry.withScope).toHaveBeenCalled();
      expect(mockScope.setExtra).toHaveBeenCalledWith("userId", "123");
      expect(mockScope.setExtra).toHaveBeenCalledWith("action", "login");
      expect(Sentry.captureException).toHaveBeenCalledWith(error);
    });
  });

  describe("captureMessage", () => {
    it("should call Sentry.captureMessage with default info level", () => {
      const message = "Test message";

      captureMessage(message);

      expect(Sentry.captureMessage).toHaveBeenCalledWith(message, "info");
    });

    it("should call Sentry.captureMessage with custom level", () => {
      const message = "Test error message";

      captureMessage(message, "error");

      expect(Sentry.captureMessage).toHaveBeenCalledWith(message, "error");
    });
  });

  describe("addBreadcrumb", () => {
    it("should call Sentry.addBreadcrumb with message and category", () => {
      const message = "User clicked button";
      const category = "ui.click";

      addBreadcrumb(message, category);

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        message,
        category,
        data: undefined,
        level: "info",
      });
    });

    it("should call Sentry.addBreadcrumb with data", () => {
      const message = "API request";
      const category = "api";
      const data = { url: "/api/users", method: "GET" };

      addBreadcrumb(message, category, data);

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        message,
        category,
        data,
        level: "info",
      });
    });
  });

  describe("startTransaction", () => {
    it("should call Sentry.startSpan and return the span", () => {
      const mockSpan = { setTag: vi.fn() };
      vi.mocked(Sentry.startSpan).mockImplementation((_options, callback) => {
        return callback(mockSpan as any);
      });

      const result = startTransaction("test transaction", "test.op");

      expect(Sentry.startSpan).toHaveBeenCalledWith(
        { name: "test transaction", op: "test.op" },
        expect.any(Function)
      );
      expect(result).toBe(mockSpan);
    });

    it("should return undefined if startSpan returns undefined", () => {
      vi.mocked(Sentry.startSpan).mockReturnValue(undefined);

      const result = startTransaction("test transaction", "test.op");

      expect(result).toBeUndefined();
    });
  });
});