/**
 * XSS Protection Utilities
 * Provides functions to sanitize and validate user input to prevent XSS attacks
 */

/**
 * HTML entity map for escaping
 */
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

/**
 * Escapes HTML entities in a string to prevent XSS attacks
 * @param str - String to escape
 * @returns Escaped string safe for HTML rendering
 */
export function escapeHtml(str: string): string {
  return str.replace(/[&<>"'/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Strips all HTML tags from a string
 * @param str - String to strip HTML from
 * @returns String with all HTML tags removed
 */
export function stripHtmlTags(str: string): string {
  return str.replace(/<[^>]*>/g, '');
}

/**
 * Validates that a URL is safe (http/https only)
 * @param url - URL to validate
 * @returns true if URL is safe, false otherwise
 */
export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Sanitizes a URL to prevent javascript: and data: URIs
 * @param url - URL to sanitize
 * @returns Sanitized URL or empty string if unsafe
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';
  
  const trimmed = url.trim();
  
  // Block javascript:, data:, vbscript:, and file: protocols
  const dangerousProtocols = /^(javascript|data|vbscript|file):/i;
  if (dangerousProtocols.test(trimmed)) {
    return '';
  }

  return trimmed;
}

/**
 * Validates and sanitizes user input for display
 * @param input - User input to sanitize
 * @param maxLength - Maximum allowed length (default: 1000)
 * @returns Sanitized input
 */
export function sanitizeUserInput(input: string, maxLength = 1000): string {
  if (!input) return '';
  
  // Trim and limit length
  let sanitized = input.trim().slice(0, maxLength);
  
  // Escape HTML entities
  sanitized = escapeHtml(sanitized);
  
  return sanitized;
}

/**
 * Validates that a string contains only alphanumeric characters and common punctuation
 * @param str - String to validate
 * @returns true if string is safe, false otherwise
 */
export function isAlphanumericWithPunctuation(str: string): boolean {
  const safePattern = /^[a-zA-Z0-9\s.,!?;:'"()\-_]+$/;
  return safePattern.test(str);
}

/**
 * Sanitizes JSON data to prevent injection attacks
 * @param data - JSON object to sanitize
 * @returns Sanitized JSON object
 */
export function sanitizeJsonData<T extends Record<string, unknown>>(data: T): T {
  const sanitized = {} as T;
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key as keyof T] = escapeHtml(value) as T[keyof T];
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key as keyof T] = sanitizeJsonData(value as Record<string, unknown>) as T[keyof T];
    } else {
      sanitized[key as keyof T] = value as T[keyof T];
    }
  }
  
  return sanitized;
}

/**
 * Validates that a string doesn't contain common XSS attack patterns
 * @param str - String to validate
 * @returns true if no XSS patterns detected, false otherwise
 */
export function detectXssPatterns(str: string): boolean {
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // Event handlers like onclick=, onload=
    /<iframe/i,
    /<embed/i,
    /<object/i,
    /eval\(/i,
    /expression\(/i,
    /vbscript:/i,
    /data:text\/html/i,
  ];

  return xssPatterns.some((pattern) => pattern.test(str));
}

/**
 * Comprehensive input validation and sanitization
 * @param input - User input to validate
 * @param options - Validation options
 * @returns Object with validation result and sanitized input
 */
export function validateAndSanitize(
  input: string,
  options: {
    maxLength?: number;
    allowHtml?: boolean;
    checkXssPatterns?: boolean;
  } = {}
): { isValid: boolean; sanitized: string; errors: string[] } {
  const { maxLength = 1000, allowHtml = false, checkXssPatterns = true } = options;
  const errors: string[] = [];

  if (!input) {
    return { isValid: true, sanitized: '', errors };
  }

  // Check length
  if (input.length > maxLength) {
    errors.push(`Input exceeds maximum length of ${maxLength} characters`);
  }

  // Check for XSS patterns
  if (checkXssPatterns && detectXssPatterns(input)) {
    errors.push('Input contains potentially dangerous content');
    return { isValid: false, sanitized: '', errors };
  }

  // Sanitize based on options
  let sanitized = input.trim().slice(0, maxLength);
  if (!allowHtml) {
    sanitized = escapeHtml(sanitized);
  }

  return {
    isValid: errors.length === 0,
    sanitized,
    errors,
  };
}
