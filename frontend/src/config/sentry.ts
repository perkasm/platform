import * as Sentry from "@sentry/react";

interface SentryConfig {
  dsn: string;
  environment: string;
  tracesSampleRate: number;
  replaysSessionSampleRate: number;
  replaysOnErrorSampleRate: number;
}

/**
 * Get Sentry configuration from environment variables
 */
function getSentryConfig(): SentryConfig | null {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  
  // Don't initialize Sentry if DSN is not set or error tracking is disabled
  if (!dsn || import.meta.env.VITE_ENABLE_ERROR_TRACKING === "false") {
    return null;
  }

  return {
    dsn,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || "development",
    tracesSampleRate: parseFloat(
      import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE || "1.0"
    ),
    replaysSessionSampleRate: parseFloat(
      import.meta.env.VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE || "0.1"
    ),
    replaysOnErrorSampleRate: parseFloat(
      import.meta.env.VITE_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE || "1.0"
    ),
  };
}

/**
 * Initialize Sentry for error tracking and performance monitoring
 */
export function initSentry(): void {
  const config = getSentryConfig();

  if (!config) {
    console.log("Sentry is disabled or not configured");
    return;
  }

  Sentry.init({
    dsn: config.dsn,
    environment: config.environment,
    
    // Performance Monitoring
    integrations: [
      // Browser Tracing for performance monitoring
      Sentry.browserTracingIntegration(),
      
      // Session Replay to reproduce errors
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
      
      // Capture Console integration
      Sentry.captureConsoleIntegration({
        levels: ["error", "warn"],
      }),
      
      // HTTP Client integration
      Sentry.httpClientIntegration(),
    ],

    // Performance monitoring sample rate (0.0 to 1.0)
    tracesSampleRate: config.tracesSampleRate,

    // Session Replay sample rates
    replaysSessionSampleRate: config.replaysSessionSampleRate,
    replaysOnErrorSampleRate: config.replaysOnErrorSampleRate,

    // Trace propagation targets for performance monitoring
    tracePropagationTargets: [
      "localhost",
      /^https:\/\/api\.perkasm\.com/,
      /^https:\/\/.*\.perkasm\.com/,
    ],

    // Filter out sensitive data
    beforeSend(event, hint) {
      // Don't send events in development unless explicitly enabled
      if (
        import.meta.env.DEV &&
        import.meta.env.VITE_ENABLE_ERROR_TRACKING !== "true"
      ) {
        return null;
      }

      // Filter out errors from browser extensions
      const error = hint.originalException;
      if (
        error &&
        typeof error === "object" &&
        "message" in error &&
        typeof error.message === "string"
      ) {
        if (
          error.message.includes("Extension context invalidated") ||
          error.message.includes("chrome-extension://")
        ) {
          return null;
        }
      }

      // Remove sensitive headers and data
      if (event.request) {
        if (event.request.headers) {
          delete event.request.headers["Authorization"];
          delete event.request.headers["Cookie"];
        }
      }

      return event;
    },

    // Don't report errors from these URLs
    ignoreErrors: [
      // Browser extensions
      "top.GLOBALS",
      "chrome-extension://",
      "moz-extension://",
      
      // Network errors
      "NetworkError",
      "Network request failed",
      "Failed to fetch",
      
      // Script loading errors (often from ad blockers)
      "Loading chunk",
      "ChunkLoadError",
      
      // Random plugins/extensions
      "instantSearchSDKJSBridgeClearHighlight",
    ],

    // Set the release version (ideally from CI/CD)
    release: import.meta.env.VITE_APP_VERSION || "development",

    // Additional options
    debug: import.meta.env.DEV,
    sendClientReports: true,
  });

  // Set user context if available (call this after authentication)
  // Sentry.setUser({ id: "user-id", email: "user@example.com" });

  console.log(
    `Sentry initialized for environment: ${config.environment}`
  );
}

/**
 * Set user context in Sentry
 */
export function setSentryUser(user: {
  id: string;
  email?: string;
  username?: string;
}): void {
  Sentry.setUser(user);
}

/**
 * Clear user context in Sentry (on logout)
 */
export function clearSentryUser(): void {
  Sentry.setUser(null);
}

/**
 * Manually capture an exception
 */
export function captureException(error: Error, context?: Record<string, unknown>): void {
  if (context) {
    Sentry.withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
}

/**
 * Manually capture a message
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = "info"): void {
  Sentry.captureMessage(message, level);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, unknown>
): void {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: "info",
  });
}

/**
 * Create a profiling span for performance monitoring
 */
export function startTransaction(
  name: string,
  op: string
): Sentry.Span | undefined {
  return Sentry.startSpan({ name, op }, (span) => span);
}

// Export Sentry for advanced usage
export { Sentry };
