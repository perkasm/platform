/**
 * Application Constants
 * 
 * This file contains all magic numbers and configuration constants
 * used throughout the application. Centralizing these values makes
 * the codebase more maintainable and easier to configure.
 */

/**
 * API and Network Configuration
 */
export const API_CONFIG = {
  /** Maximum duration (ms) before a request is considered slow */
  SLOW_REQUEST_THRESHOLD: 3000,
  
  /** HTTP status codes */
  STATUS_CODES: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
  },
} as const;

/**
 * Rate Limiting Configuration
 */
export const RATE_LIMITS = {
  /** API requests: 100 requests per minute */
  API: {
    MAX_REQUESTS: 100,
    WINDOW_MS: 60000, // 1 minute
  },
  
  /** Chat messages: 10 messages per minute */
  CHAT: {
    MAX_REQUESTS: 10,
    WINDOW_MS: 60000, // 1 minute
  },
  
  /** Form submissions: 5 submissions per minute */
  FORM: {
    MAX_REQUESTS: 5,
    WINDOW_MS: 60000, // 1 minute
  },
  
  /** Authentication attempts: 3 attempts per 5 minutes */
  AUTH: {
    MAX_REQUESTS: 3,
    WINDOW_MS: 300000, // 5 minutes
  },
} as const;

/**
 * Input Validation Limits
 */
export const VALIDATION_LIMITS = {
  /** Maximum length for chat messages */
  CHAT_MESSAGE_MAX_LENGTH: 2000,
  
  /** Maximum length for card names */
  CARD_NAME_MAX_LENGTH: 100,
  
  /** Maximum length for passwords */
  PASSWORD_MAX_LENGTH: 100,
  
  /** Maximum length for full names */
  FULL_NAME_MAX_LENGTH: 100,
  
  /** Maximum length for search queries */
  SEARCH_QUERY_MAX_LENGTH: 200,
  
  /** Maximum length for descriptions */
  DESCRIPTION_MAX_LENGTH: 500,
  
  /** Minimum length for passwords */
  PASSWORD_MIN_LENGTH: 8,
} as const;

/**
 * Performance Thresholds
 */
export const PERFORMANCE = {
  /** Operations taking longer than this (ms) trigger warnings */
  SLOW_OPERATION_THRESHOLD: 100,
  
  /** Chunk size for lazy loading */
  LAZY_LOAD_CHUNK_SIZE: 20,
  
  /** Debounce delay for search inputs (ms) */
  SEARCH_DEBOUNCE_DELAY: 300,
  
  /** Throttle delay for scroll events (ms) */
  SCROLL_THROTTLE_DELAY: 100,
} as const;

/**
 * UI Configuration
 */
export const UI_CONFIG = {
  /** Default toast duration (ms) */
  TOAST_DURATION: 3000,
  
  /** Animation duration for transitions (ms) */
  ANIMATION_DURATION: 200,
  
  /** Number of items per page in paginated lists */
  ITEMS_PER_PAGE: 10,
  
  /** Mobile breakpoint (px) */
  MOBILE_BREAKPOINT: 768,
} as const;

/**
 * Cache Configuration
 */
export const CACHE_CONFIG = {
  /** React Query stale time (ms) - 5 minutes */
  STALE_TIME: 300000,
  
  /** React Query cache time (ms) - 10 minutes */
  CACHE_TIME: 600000,
  
  /** Number of retry attempts for failed requests */
  RETRY_ATTEMPTS: 3,
  
  /** Delay between retry attempts (ms) */
  RETRY_DELAY: 1000,
} as const;

/**
 * Security Configuration
 */
export const SECURITY = {
  /** JWT token expiration time (ms) - 1 hour */
  TOKEN_EXPIRATION: 3600000,
  
  /** Session timeout (ms) - 30 minutes of inactivity */
  SESSION_TIMEOUT: 1800000,
  
  /** XSS protection max input length */
  XSS_MAX_INPUT_LENGTH: 10000,
} as const;

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later.',
  GENERIC_ERROR: 'An unexpected error occurred. Please try again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
} as const;

/**
 * Success Messages
 */
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in!',
  LOGOUT_SUCCESS: 'Successfully logged out!',
  CARD_ADDED: 'Credit card added successfully!',
  CARD_UPDATED: 'Credit card updated successfully!',
  CARD_DELETED: 'Credit card deleted successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
} as const;

/**
 * Application Routes
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  CARDS: '/cards',
  CHAT: '/chat',
  RECOMMENDATIONS: '/recommendations',
  PROFILE: '/profile',
  NOT_FOUND: '/404',
} as const;

/**
 * Local Storage Keys
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'perkasm_auth_token',
  REFRESH_TOKEN: 'perkasm_refresh_token',
  USER_PREFERENCES: 'perkasm_user_preferences',
  THEME: 'perkasm_theme',
} as const;

/**
 * Analytics Events
 */
export const ANALYTICS_EVENTS = {
  PAGE_VIEW: 'page_view',
  LOGIN: 'login',
  LOGOUT: 'logout',
  CARD_ADDED: 'card_added',
  CARD_UPDATED: 'card_updated',
  CARD_DELETED: 'card_deleted',
  CHAT_MESSAGE: 'chat_message',
  RECOMMENDATION_VIEWED: 'recommendation_viewed',
} as const;

/**
 * Feature Flags
 */
export const FEATURE_FLAGS = {
  ENABLE_ANALYTICS: true,
  ENABLE_ERROR_TRACKING: true,
  ENABLE_SERVICE_WORKER: true,
  ENABLE_PERFORMANCE_MONITORING: true,
} as const;
