import { describe, it, expect } from 'vitest';
import {
  escapeHtml,
  stripHtmlTags,
  isSafeUrl,
  sanitizeUrl,
  sanitizeUserInput,
  isAlphanumericWithPunctuation,
  sanitizeJsonData,
  detectXssPatterns,
  validateAndSanitize,
} from '../xss-protection';

describe('XSS Protection Utilities', () => {
  describe('escapeHtml', () => {
    it('should escape HTML entities', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
      );
    });

    it('should escape ampersands', () => {
      expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
    });

    it('should escape quotes', () => {
      expect(escapeHtml('It\'s a "test"')).toBe('It&#x27;s a &quot;test&quot;');
    });

    it('should handle empty string', () => {
      expect(escapeHtml('')).toBe('');
    });

    it('should handle strings without special characters', () => {
      expect(escapeHtml('Hello World')).toBe('Hello World');
    });
  });

  describe('stripHtmlTags', () => {
    it('should remove all HTML tags', () => {
      expect(stripHtmlTags('<p>Hello <strong>World</strong></p>')).toBe('Hello World');
    });

    it('should remove script tags', () => {
      expect(stripHtmlTags('<script>alert("xss")</script>Text')).toBe('alert("xss")Text');
    });

    it('should handle self-closing tags', () => {
      expect(stripHtmlTags('Text <br/> More text')).toBe('Text  More text');
    });

    it('should handle empty string', () => {
      expect(stripHtmlTags('')).toBe('');
    });

    it('should handle strings without HTML', () => {
      expect(stripHtmlTags('Plain text')).toBe('Plain text');
    });
  });

  describe('isSafeUrl', () => {
    it('should accept http URLs', () => {
      expect(isSafeUrl('http://example.com')).toBe(true);
    });

    it('should accept https URLs', () => {
      expect(isSafeUrl('https://example.com')).toBe(true);
    });

    it('should reject javascript URLs', () => {
      expect(isSafeUrl('javascript:alert("xss")')).toBe(false);
    });

    it('should reject data URLs', () => {
      expect(isSafeUrl('data:text/html,<script>alert("xss")</script>')).toBe(false);
    });

    it('should reject file URLs', () => {
      expect(isSafeUrl('file:///etc/passwd')).toBe(false);
    });

    it('should reject invalid URLs', () => {
      expect(isSafeUrl('not a url')).toBe(false);
    });
  });

  describe('sanitizeUrl', () => {
    it('should allow safe URLs', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
    });

    it('should block javascript: protocol', () => {
      expect(sanitizeUrl('javascript:alert("xss")')).toBe('');
    });

    it('should block data: protocol', () => {
      expect(sanitizeUrl('data:text/html,<script>alert("xss")</script>')).toBe('');
    });

    it('should block vbscript: protocol', () => {
      expect(sanitizeUrl('vbscript:msgbox("xss")')).toBe('');
    });

    it('should block file: protocol', () => {
      expect(sanitizeUrl('file:///etc/passwd')).toBe('');
    });

    it('should trim whitespace', () => {
      expect(sanitizeUrl('  https://example.com  ')).toBe('https://example.com');
    });

    it('should handle empty string', () => {
      expect(sanitizeUrl('')).toBe('');
    });
  });

  describe('sanitizeUserInput', () => {
    it('should escape HTML in user input', () => {
      expect(sanitizeUserInput('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
      );
    });

    it('should trim whitespace', () => {
      expect(sanitizeUserInput('  Hello World  ')).toBe('Hello World');
    });

    it('should enforce max length', () => {
      const longString = 'a'.repeat(2000);
      expect(sanitizeUserInput(longString, 100)).toBe('a'.repeat(100));
    });

    it('should use default max length', () => {
      const longString = 'a'.repeat(2000);
      expect(sanitizeUserInput(longString)).toBe('a'.repeat(1000));
    });

    it('should handle empty string', () => {
      expect(sanitizeUserInput('')).toBe('');
    });
  });

  describe('isAlphanumericWithPunctuation', () => {
    it('should accept alphanumeric text', () => {
      expect(isAlphanumericWithPunctuation('Hello World 123')).toBe(true);
    });

    it('should accept common punctuation', () => {
      expect(isAlphanumericWithPunctuation('Hello, World! How are you?')).toBe(true);
    });

    it('should reject HTML tags', () => {
      expect(isAlphanumericWithPunctuation('<script>alert("xss")</script>')).toBe(false);
    });

    it('should reject special characters', () => {
      expect(isAlphanumericWithPunctuation('Test $ & % @')).toBe(false);
    });

    it('should accept hyphens and underscores', () => {
      expect(isAlphanumericWithPunctuation('test-name_123')).toBe(true);
    });
  });

  describe('sanitizeJsonData', () => {
    it('should sanitize string values', () => {
      const input = { name: '<script>alert("xss")</script>', age: 25 };
      const result = sanitizeJsonData(input);
      expect(result.name).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
      expect(result.age).toBe(25);
    });

    it('should handle nested objects', () => {
      const input = {
        user: {
          name: '<b>John</b>',
          email: 'john@example.com',
        },
      };
      const result = sanitizeJsonData(input);
      expect(result.user.name).toBe('&lt;b&gt;John&lt;&#x2F;b&gt;');
      expect(result.user.email).toBe('john@example.com');
    });

    it('should preserve non-string values', () => {
      const input = {
        name: 'John',
        age: 30,
        active: true,
        score: null,
      };
      const result = sanitizeJsonData(input);
      expect(result.age).toBe(30);
      expect(result.active).toBe(true);
      expect(result.score).toBe(null);
    });
  });

  describe('detectXssPatterns', () => {
    it('should detect script tags', () => {
      expect(detectXssPatterns('<script>alert("xss")</script>')).toBe(true);
    });

    it('should detect javascript: protocol', () => {
      expect(detectXssPatterns('javascript:alert("xss")')).toBe(true);
    });

    it('should detect event handlers', () => {
      expect(detectXssPatterns('<img onclick="alert(\'xss\')">')).toBe(true);
      expect(detectXssPatterns('<div onload="malicious()">')).toBe(true);
    });

    it('should detect iframe tags', () => {
      expect(detectXssPatterns('<iframe src="evil.com"></iframe>')).toBe(true);
    });

    it('should detect embed tags', () => {
      expect(detectXssPatterns('<embed src="evil.swf">')).toBe(true);
    });

    it('should detect object tags', () => {
      expect(detectXssPatterns('<object data="evil.swf"></object>')).toBe(true);
    });

    it('should detect eval calls', () => {
      expect(detectXssPatterns('eval("malicious code")')).toBe(true);
    });

    it('should detect vbscript', () => {
      expect(detectXssPatterns('vbscript:msgbox("xss")')).toBe(true);
    });

    it('should detect data URLs', () => {
      expect(detectXssPatterns('data:text/html,<script>alert("xss")</script>')).toBe(true);
    });

    it('should not flag safe text', () => {
      expect(detectXssPatterns('This is a safe string with no XSS')).toBe(false);
    });
  });

  describe('validateAndSanitize', () => {
    it('should validate and sanitize safe input', () => {
      const result = validateAndSanitize('Hello World');
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe('Hello World');
      expect(result.errors).toHaveLength(0);
    });

    it('should detect XSS patterns', () => {
      const result = validateAndSanitize('<script>alert("xss")</script>');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Input contains potentially dangerous content');
    });

    it('should enforce max length', () => {
      const longString = 'a'.repeat(2000);
      const result = validateAndSanitize(longString, { maxLength: 100 });
      expect(result.errors).toContain('Input exceeds maximum length of 100 characters');
      expect(result.sanitized).toBe('a'.repeat(100));
    });

    it('should allow HTML when specified', () => {
      const result = validateAndSanitize('<b>Bold</b>', {
        allowHtml: true,
        checkXssPatterns: false,
      });
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe('<b>Bold</b>');
    });

    it('should escape HTML by default', () => {
      const result = validateAndSanitize('<b>Bold</b>', {
        checkXssPatterns: false,
      });
      expect(result.sanitized).toBe('&lt;b&gt;Bold&lt;&#x2F;b&gt;');
    });

    it('should handle empty string', () => {
      const result = validateAndSanitize('');
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe('');
      expect(result.errors).toHaveLength(0);
    });

    it('should skip XSS check when disabled', () => {
      const result = validateAndSanitize('<script>alert("xss")</script>', {
        checkXssPatterns: false,
        allowHtml: false,
      });
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
    });
  });
});
